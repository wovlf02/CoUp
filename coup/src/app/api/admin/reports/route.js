/**
 * 관리자 - 신고 목록 API
 * GET /api/admin/reports
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function GET(request) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.REPORT_VIEW)
  if (auth instanceof NextResponse) return auth

  const { adminRole } = auth

  try {
    const { searchParams } = new URL(request.url)

    // 페이지네이션
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit

    // 필터
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const targetType = searchParams.get('targetType')
    const assignedTo = searchParams.get('assignedTo')

    // 날짜 필터
    const createdFrom = searchParams.get('createdFrom')
    const createdTo = searchParams.get('createdTo')

    // 정렬
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Where 조건 구성
    const where = {}

    // 검색 (신고 사유, 신고자 이름/이메일)
    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { targetName: { contains: search, mode: 'insensitive' } },
        {
          reporter: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ]
    }

    // 상태 필터
    if (status && status !== 'all') {
      where.status = status
    }

    // 신고 유형 필터
    if (type && type !== 'all') {
      where.type = type
    }

    // 우선순위 필터
    if (priority && priority !== 'all') {
      where.priority = priority
    }

    // 대상 유형 필터
    if (targetType && targetType !== 'all') {
      where.targetType = targetType
    }

    // 담당자 필터
    if (assignedTo === 'me') {
      where.processedBy = adminRole.userId
    } else if (assignedTo === 'unassigned') {
      where.processedBy = null
    } else if (assignedTo && assignedTo !== 'all') {
      where.processedBy = assignedTo
    }

    // 날짜 필터
    if (createdFrom || createdTo) {
      where.createdAt = {}
      if (createdFrom) where.createdAt.gte = new Date(createdFrom)
      if (createdTo) where.createdAt.lte = new Date(createdTo)
    }

    // 신고 조회
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy === 'priority'
          ? [
              { priority: 'asc' },
              { createdAt: 'desc' }
            ]
          : { [sortBy]: sortOrder },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              status: true,
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ])

    // 통계 계산
    const stats = await prisma.report.groupBy({
      by: ['status'],
      _count: true,
    })

    const statsMap = {
      total: total,
      pending: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
    }

    stats.forEach(stat => {
      const key = stat.status.toLowerCase()
      if (key === 'in_progress') {
        statsMap.in_progress = stat._count
      } else {
        statsMap[key] = stat._count
      }
    })

    // 관리자 로그 기록
    await logAdminAction(adminRole.userId, 'REPORT_VIEW', null, null, {
      filters: { status, type, priority, targetType, assignedTo },
    })

    return NextResponse.json({
      success: true,
      data: {
        reports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: statsMap,
      },
    })
  } catch (error) {
    console.error('신고 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, message: '신고 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

