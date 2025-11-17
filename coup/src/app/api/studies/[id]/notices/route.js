// src/app/api/studies/[id]/notices/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const { id: studyId } = params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const pinned = searchParams.get('pinned') // 'true' | 'false'

    let whereClause = { studyId }

    if (pinned === 'true') {
      whereClause.isPinned = true
    }

    const total = await prisma.notice.count({ where: whereClause })

    const notices = await prisma.notice.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: notices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get notices error:', error)
    return NextResponse.json(
      { error: "공지사항을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  const { id: studyId } = params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    const body = await request.json()
    const { title, content, isPinned, isImportant } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "제목과 내용을 입력해주세요" },
        { status: 400 }
      )
    }

    const notice = await prisma.notice.create({
      data: {
        studyId,
        authorId: session.user.id,
        title,
        content,
        isPinned: isPinned || false,
        isImportant: isImportant || false
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    // 스터디 멤버들에게 알림 생성
    const members = await prisma.studyMember.findMany({
      where: {
        studyId,
        status: 'ACTIVE',
        userId: { not: session.user.id } // 작성자 제외
      }
    })

    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { name: true, emoji: true }
    })

    // 알림 일괄 생성
    await prisma.notification.createMany({
      data: members.map(member => ({
        userId: member.userId,
        type: 'NOTICE',
        studyId,
        studyName: study.name,
        studyEmoji: study.emoji,
        message: `새 공지사항: ${title}`
      }))
    })

    return NextResponse.json({
      success: true,
      message: "공지사항이 작성되었습니다",
      data: notice
    }, { status: 201 })

  } catch (error) {
    console.error('Create notice error:', error)
    return NextResponse.json(
      { error: "공지사항 작성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

