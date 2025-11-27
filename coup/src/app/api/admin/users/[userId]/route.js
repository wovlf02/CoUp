// src/app/api/admin/users/[userId]/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-helpers"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/users/[userId]
 * 사용자 상세 조회 (관리자)
 */
export async function GET(request, { params }) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { userId } = params

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        provider: true,
        createdAt: true,
        lastLoginAt: true,
        suspendedUntil: true,
        suspendReason: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 활동 통계
    const [studyCount, noticeCount, fileCount, messageCount] = await Promise.all([
      prisma.studyMember.count({
        where: { userId, status: 'ACTIVE' }
      }),
      prisma.notice.count({
        where: { authorId: userId }
      }),
      prisma.file.count({
        where: { uploaderId: userId }
      }),
      prisma.message.count({
        where: { userId }
      })
    ])

    // 제재 이력
    const sanctions = await prisma.sanction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        reason: true,
        duration: true,
        createdAt: true,
        adminId: true
      }
    })

    const sanctionSummary = await prisma.sanction.groupBy({
      by: ['type'],
      where: { userId },
      _count: true
    })

    const sanctionCounts = {
      warningCount: 0,
      suspendCount: 0
    }

    sanctionSummary.forEach(item => {
      if (item.type === 'WARNING') sanctionCounts.warningCount = item._count
      if (item.type === 'SUSPEND') sanctionCounts.suspendCount = item._count
    })

    // 신고 이력
    const [reportedCount, reporterCount] = await Promise.all([
      prisma.report.count({
        where: {
          targetType: 'USER',
          targetId: userId
        }
      }),
      prisma.report.count({
        where: { reporterId: userId }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        user,
        stats: {
          studyCount,
          noticeCount,
          fileCount,
          messageCount
        },
        sanctions: {
          ...sanctionCounts,
          recentSanctions: sanctions
        },
        reports: {
          reportedCount,
          reporterCount
        }
      }
    })

  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json(
      { success: false, error: "사용자 상세 조회 실패" },
      { status: 500 }
    )
  }
}

