// src/app/api/studies/[id]/chat/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { validateAndSanitize } from "@/lib/utils/input-sanitizer"
import { validateSecurityThreats, logSecurityEvent } from "@/lib/utils/xss-sanitizer"

export async function GET(request, { params }) {
  const { id: studyId } = await params

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
  const { id: studyId } = await params

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

    // 1. 보안 위협 검증 (content가 있는 경우만)
    if (content) {
      const threats = validateSecurityThreats(content);

      if (!threats.safe) {
        logSecurityEvent('XSS_ATTEMPT_DETECTED', {
          userId: session.user.id,
          studyId,
          field: 'chat_message',
          threats: threats.threats,
        });

        return NextResponse.json(
          { error: "메시지에 허용되지 않는 콘텐츠가 포함되어 있습니다" },
          { status: 400 }
        );
      }
    }

    // 2. 입력값 검증 및 정제
    const validation = validateAndSanitize(
      { content, fileId },
      'CHAT_MESSAGE'
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "입력값이 유효하지 않습니다",
          details: validation.errors
        },
        { status: 400 }
      );
    }

    const sanitizedData = validation.sanitized;

    // 3. 메시지 길이 제한 (2000자)
    if (sanitizedData.content && sanitizedData.content.length > 2000) {
      return NextResponse.json(
        { error: "메시지는 2000자 이하여야 합니다" },
        { status: 400 }
      );
    }

    // 4. 스팸 감지 (최근 10초 내 5개 이상 메시지)
    const recentMessages = await prisma.message.count({
      where: {
        studyId,
        userId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - 10000), // 10초
        },
      },
    });

    if (recentMessages >= 5) {
      return NextResponse.json(
        { error: "메시지를 너무 빠르게 전송하고 있습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    // 5. 파일 ID 검증 (존재하는 경우)
    if (sanitizedData.fileId) {
      const file = await prisma.file.findUnique({
        where: { id: sanitizedData.fileId },
      });

      if (!file || file.studyId !== studyId) {
        return NextResponse.json(
          { error: "유효하지 않은 파일입니다" },
          { status: 400 }
        );
      }
    }

    // 6. 메시지 생성
    const message = await prisma.message.create({
      data: {
        studyId,
        userId: session.user.id,
        content: sanitizedData.content || '',
        fileId: sanitizedData.fileId,
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

    // 7. 다른 멤버들에게 알림 (나중에 WebSocket으로 실시간 전송 가능)
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

