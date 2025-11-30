// src/app/api/studies/[id]/notices/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { validateAndSanitize } from "@/lib/utils/input-sanitizer"
import { validateSecurityThreats, logSecurityEvent } from "@/lib/utils/xss-sanitizer"
import { getCachedNotices, setCachedNotices, invalidateNoticesCache } from "@/lib/cache-helpers"

export async function GET(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const pinned = searchParams.get('pinned') // 'true' | 'false'

    // 캐시 키 생성 (studyId + 쿼리 파라미터)
    const cacheKey = `${studyId}_p${page}_l${limit}_pin${pinned || 'all'}`

    // 1. 캐시 확인 (페이지네이션이 첫 페이지이고 필터가 없는 경우만)
    if (page === 1 && !pinned) {
      const cached = getCachedNotices(cacheKey)
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached.notices,
          pagination: cached.pagination,
          cached: true // 캐시에서 가져왔음을 표시
        })
      }
    }

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

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }

    // 2. 첫 페이지 결과 캐싱
    if (page === 1 && !pinned) {
      setCachedNotices(cacheKey, { notices, pagination })
    }

    return NextResponse.json({
      success: true,
      data: notices,
      pagination,
      cached: false
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
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    const body = await request.json()
    const { title, content, isPinned, isImportant } = body

    // 1. 보안 위협 검증
    const titleThreats = validateSecurityThreats(title || '');
    const contentThreats = validateSecurityThreats(content || '');

    if (!titleThreats.safe) {
      logSecurityEvent('XSS_ATTEMPT_DETECTED', {
        userId: session.user.id,
        studyId,
        field: 'notice_title',
        threats: titleThreats.threats,
      });
      return NextResponse.json(
        { error: "제목에 허용되지 않는 콘텐츠가 포함되어 있습니다" },
        { status: 400 }
      );
    }

    if (!contentThreats.safe) {
      logSecurityEvent('XSS_ATTEMPT_DETECTED', {
        userId: session.user.id,
        studyId,
        field: 'notice_content',
        threats: contentThreats.threats,
      });
      return NextResponse.json(
        { error: "내용에 허용되지 않는 콘텐츠가 포함되어 있습니다" },
        { status: 400 }
      );
    }

    // 2. 입력값 검증 및 정제
    const validation = validateAndSanitize(body, 'NOTICE');

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

    // 3. 추가 검증
    if (sanitizedData.title.length > 100) {
      return NextResponse.json(
        { error: "제목은 100자 이하여야 합니다" },
        { status: 400 }
      );
    }

    if (sanitizedData.content.length > 10000) {
      return NextResponse.json(
        { error: "내용은 10,000자 이하여야 합니다" },
        { status: 400 }
      );
    }

    // 4. 고정된 공지 개수 확인 (최대 3개)
    if (sanitizedData.isPinned) {
      const pinnedCount = await prisma.notice.count({
        where: {
          studyId,
          isPinned: true,
        },
      });

      if (pinnedCount >= 3) {
        return NextResponse.json(
          { error: "고정 공지사항은 최대 3개까지만 가능합니다" },
          { status: 400 }
        );
      }
    }

    const notice = await prisma.notice.create({
      data: {
        studyId,
        authorId: session.user.id,
        title: sanitizedData.title,
        content: sanitizedData.content,
        isPinned: sanitizedData.isPinned || false,
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
        message: `새 공지사항: ${sanitizedData.title}`
      }))
    })

    // 캐시 무효화 (새 공지가 생성되었으므로 목록 캐시 갱신 필요)
    invalidateNoticesCache(`${studyId}_p1_l10_pinall`)
    invalidateNoticesCache(`${studyId}_p1_l20_pinall`)
    // 다른 limit 크기도 무효화 (일반적으로 사용되는 크기들)

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

