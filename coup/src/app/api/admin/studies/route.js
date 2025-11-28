/**
 * 관리자 - 스터디 목록 API
 * GET /api/admin/studies
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function GET(request) {
  console.log('🔍 [Admin Studies API] Starting request...')

  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
  if (auth instanceof NextResponse) {
    console.log('❌ [Admin Studies API] Auth failed')
    return auth
  }

  const { adminRole } = auth
  console.log('✅ [Admin Studies API] Auth successful:', adminRole.userId)

  try {
    const { searchParams } = new URL(request.url)
    console.log('📝 [Admin Studies API] Query params:', Object.fromEntries(searchParams))

    // 페이지네이션
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit

    // 필터
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const isPublic = searchParams.get('isPublic')
    const isRecruiting = searchParams.get('isRecruiting')
    const hasReports = searchParams.get('hasReports') === 'true'

    // 멤버 수 범위
    const minMembers = searchParams.get('minMembers')
    const maxMembers = searchParams.get('maxMembers')

    // 날짜 필터
    const createdFrom = searchParams.get('createdFrom')
    const createdTo = searchParams.get('createdTo')

    // 정렬
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Where 조건 구성
    const where = {}

    // 검색
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { id: { contains: search } },
      ]
    }

    // 카테고리 필터
    if (category && category !== 'all') {
      where.category = category
    }

    // 공개 여부
    if (isPublic !== null && isPublic !== 'all') {
      where.isPublic = isPublic === 'true'
    }

    // 모집 중 여부
    if (isRecruiting !== null && isRecruiting !== 'all') {
      where.isRecruiting = isRecruiting === 'true'
    }

    // 날짜 필터
    if (createdFrom || createdTo) {
      where.createdAt = {}
      if (createdFrom) where.createdAt.gte = new Date(createdFrom)
      if (createdTo) where.createdAt.lte = new Date(createdTo)
    }

    // 스터디 조회
    const [studies, total] = await Promise.all([
      prisma.study.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              status: true,
            },
          },
          _count: {
            select: {
              members: {
                where: { status: 'ACTIVE' },
              },
              messages: true,
              files: true,
              notices: true,
            },
          },
        },
      }),
      prisma.study.count({ where }),
    ])

    // 멤버 수 필터 (후처리)
    let filteredStudies = studies
    if (minMembers || maxMembers) {
      filteredStudies = studies.filter((study) => {
        const memberCount = study._count.members
        if (minMembers && memberCount < parseInt(minMembers)) return false
        if (maxMembers && memberCount > parseInt(maxMembers)) return false
        return true
      })
    }

    // 데이터 변환
    const transformedStudies = await Promise.all(
      filteredStudies.map(async (study) => {
        // 최근 활동 시간 계산
        const lastMessage = await prisma.message.findFirst({
          where: { studyId: study.id },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        })

        return {
          id: study.id,
          name: study.name,
          emoji: study.emoji,
          description: study.description,
          category: study.category,
          subCategory: study.subCategory,
          tags: study.tags,

          owner: study.owner,

          settings: {
            maxMembers: study.maxMembers,
            isPublic: study.isPublic,
            autoApprove: study.autoApprove,
            isRecruiting: study.isRecruiting,
          },

          stats: {
            memberCount: study._count.members,
            messageCount: study._count.messages,
            fileCount: study._count.files,
            noticeCount: study._count.notices,
            rating: study.rating || 0,
            reviewCount: study.reviewCount || 0,
          },

          lastActivityAt: lastMessage?.createdAt || study.updatedAt,
          createdAt: study.createdAt,
          updatedAt: study.updatedAt,
        }
      })
    )

    // 전체 통계
    const stats = await prisma.study.aggregate({
      where,
      _count: true,
    })

    // 추가 통계
    const publicCount = await prisma.study.count({
      where: { ...where, isPublic: true },
    })
    const recruitingCount = await prisma.study.count({
      where: { ...where, isRecruiting: true },
    })

    // 로그 기록
    try {
      await logAdminAction({
        adminId: adminRole.userId,
        action: 'STUDY_VIEW',
        targetType: 'Study',
        reason: `Viewed studies list with filters: ${JSON.stringify({ search, category, isPublic, isRecruiting })}`,
        after: {
          filters: {
            search,
            category,
            isPublic,
            isRecruiting,
          },
          resultCount: transformedStudies.length,
        },
      })
    } catch (logError) {
      console.warn('⚠️ [Admin Studies API] Failed to log action:', logError.message)
      // 로그 실패는 무시하고 계속 진행
    }

    console.log('✅ [Admin Studies API] Success, returning', transformedStudies.length, 'studies')

    return NextResponse.json({
      success: true,
      data: {
        studies: transformedStudies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        stats: {
          total: stats._count,
          public: publicCount,
          recruiting: recruitingCount,
        },
      },
    })
  } catch (error) {
    console.error('❌ [Admin Studies API] Error:', error)
    console.error('❌ [Admin Studies API] Error name:', error.name)
    console.error('❌ [Admin Studies API] Error message:', error.message)
    console.error('❌ [Admin Studies API] Error stack:', error.stack)

    return NextResponse.json(
      {
        success: false,
        error: '스터디 목록 조회에 실패했습니다',
        details: error.message,
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

