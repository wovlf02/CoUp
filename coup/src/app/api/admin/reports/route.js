// src/app/api/admin/reports/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-helpers"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/reports
 * 신고 목록 조회 (관리자)
 */
export async function GET(request) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const targetType = searchParams.get('targetType')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // 검색 조건 생성
    const whereClause = {}

    // 검색어 처리
    if (search) {
      whereClause.OR = [
        { id: search },
        { reporter: { name: { contains: search, mode: 'insensitive' } } },
        { reporter: { email: { contains: search, mode: 'insensitive' } } },
        { targetName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 상태 필터 (multiple)
    if (status) {
      const statuses = status.split(',')
      whereClause.status = { in: statuses }
    }

    // 대상 유형 필터
    if (targetType) {
      const types = targetType.split(',')
      whereClause.targetType = { in: types }
    }

    // 우선순위 필터
    if (priority) {
      const priorities = priority.split(',')
      whereClause.priority = { in: priorities }
    }

    // 담당자 필터
    if (assignedTo === 'unassigned') {
      whereClause.assignedToId = null
    } else if (assignedTo === 'me') {
      whereClause.assignedToId = auth.user.id
    }

    // 총 개수 조회
    const total = await prisma.report.count({ where: whereClause })

    // 정렬 옵션
    const orderBy = {}
    if (sortBy === 'priority') {
      // 우선순위 정렬: URGENT > HIGH > NORMAL > LOW
      orderBy.priority = sortOrder
    } else if (sortBy === 'status') {
      // 상태 정렬: PENDING > IN_PROGRESS > HOLD > RESOLVED > REJECTED
      orderBy.status = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // 신고 목록 조회
    const reports = await prisma.report.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        targetType: true,
        targetId: true,
        targetName: true,
        type: true,
        status: true,
        priority: true,
        reason: true,
        evidence: true,
        createdAt: true,
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // 요약 통계
    const summary = await prisma.report.groupBy({
      by: ['status'],
      _count: true
    })

    const summaryMap = {
      pending: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
      hold: 0
    }

    summary.forEach(item => {
      if (item.status === 'PENDING') summaryMap.pending = item._count
      if (item.status === 'IN_PROGRESS') summaryMap.inProgress = item._count
      if (item.status === 'RESOLVED') summaryMap.resolved = item._count
      if (item.status === 'REJECTED') summaryMap.rejected = item._count
      if (item.status === 'HOLD') summaryMap.hold = item._count
    })

    return NextResponse.json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        summary: summaryMap
      }
    })

  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { success: false, error: "신고 목록 조회 실패" },
      { status: 500 }
    )
  }
}

