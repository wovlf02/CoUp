// src/app/api/admin/users/[userId]/sanctions/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-helpers"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/users/[userId]/sanctions
 * 사용자 제재 이력 조회
 */
export async function GET(request, { params }) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { userId } = params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // WARNING, SUSPEND, UNSUSPEND, RESTRICT

    const skip = (page - 1) * limit

    // 검색 조건
    const whereClause = { userId }
    if (type) {
      whereClause.type = type
    }

    // 총 개수
    const total = await prisma.sanction.count({ where: whereClause })

    // 제재 목록
    const sanctions = await prisma.sanction.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        reason: true,
        duration: true,
        relatedReportId: true,
        adminId: true,
        unsuspendReason: true,
        unsuspendAdminId: true,
        unsuspendAt: true,
        createdAt: true
      }
    })

    // 관리자 정보 추가
    const adminIds = [...new Set(sanctions.map(s => s.adminId).filter(Boolean))]
    const admins = await prisma.user.findMany({
      where: { id: { in: adminIds } },
      select: { id: true, name: true, email: true }
    })

    const adminMap = {}
    admins.forEach(admin => {
      adminMap[admin.id] = admin
    })

    const sanctionsWithAdmin = sanctions.map(sanction => ({
      ...sanction,
      admin: adminMap[sanction.adminId] || null
    }))

    // 요약 통계
    const summary = await prisma.sanction.groupBy({
      by: ['type'],
      where: { userId },
      _count: true
    })

    const summaryCounts = {
      warningCount: 0,
      suspendCount: 0,
      unsuspendCount: 0,
      restrictCount: 0
    }

    summary.forEach(item => {
      if (item.type === 'WARNING') summaryCounts.warningCount = item._count
      if (item.type === 'SUSPEND') summaryCounts.suspendCount = item._count
      if (item.type === 'UNSUSPEND') summaryCounts.unsuspendCount = item._count
      if (item.type === 'RESTRICT') summaryCounts.restrictCount = item._count
    })

    return NextResponse.json({
      success: true,
      data: {
        sanctions: sanctionsWithAdmin,
        pagination: {
          total,
          page,
          limit
        },
        summary: summaryCounts
      }
    })

  } catch (error) {
    console.error('Error fetching sanctions:', error)
    return NextResponse.json(
      { success: false, error: "제재 이력 조회 실패" },
      { status: 500 }
    )
  }
}

