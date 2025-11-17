// src/app/api/studies/[id]/chat/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const { id: studyId } = params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  try {
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor') // 마지막 메시지 ID
    const limit = parseInt(searchParams.get('limit') || '50')

    let whereClause = { studyId }

    // cursor 기반 페이지네이션 (무한 스크롤)
    const messages = await prisma.message.findMany({
      where: whereClause,
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1 // cursor 자체는 제외
      }),
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        file: {
          select: {
            id: true,
            name: true,
            url: true,
            type: true,
            size: true
          }
        }
      }
    })

    // 역순으로 반환 (최신 메시지가 아래로)
    const reversedMessages = messages.reverse()

    return NextResponse.json({
      success: true,
      data: reversedMessages,
      hasMore: messages.length === limit,
      nextCursor: messages.length > 0 ? messages[0].id : null
    })

  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: "메시지를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  const { id: studyId } = params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    const body = await request.json()
    const { content, fileId } = body

    if (!content && !fileId) {
      return NextResponse.json(
        { error: "메시지 내용 또는 파일을 입력해주세요" },
        { status: 400 }
      )
    }

    // 메시지 생성
    const message = await prisma.message.create({
      data: {
        studyId,
        userId: session.user.id,
        content: content || '',
        fileId,
        readers: [session.user.id] // 작성자는 자동으로 읽음
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        file: {
          select: {
            id: true,
            name: true,
            url: true,
            type: true,
            size: true
          }
        }
      }
    })

    // 다른 멤버들에게 알림 (나중에 WebSocket으로 실시간 전송 가능)
    const members = await prisma.studyMember.findMany({
      where: {
        studyId,
        status: 'ACTIVE',
        userId: { not: session.user.id }
      },
      take: 10 // 알림은 최대 10명까지만
    })

    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { name: true, emoji: true }
    })

    // 채팅 알림 생성 (선택적)
    await prisma.notification.createMany({
      data: members.map(member => ({
        userId: member.userId,
        type: 'CHAT',
        studyId,
        studyName: study.name,
        studyEmoji: study.emoji,
        message: `${session.user.name}님이 메시지를 보냈습니다`
      }))
    })

    return NextResponse.json({
      success: true,
      message: "메시지가 전송되었습니다",
      data: message
    }, { status: 201 })

  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: "메시지 전송 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

