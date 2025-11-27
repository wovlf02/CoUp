// src/app/api/admin/dashboard/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-helpers"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/dashboard
 * 관리자 대시보드 데이터
 */
export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    // 핵심 지표 병렬 조회
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      newUsersToday,
      newUsersWeek,
      totalStudies,
      activeStudies,
      newStudiesToday,
      pendingReports,
      reportsToday
    ] = await Promise.all([
      // 사용자 통계
      prisma.user.count({ where: { status: { not: 'DELETED' } } }),
      prisma.user.count({
        where: {
          status: 'ACTIVE',
          lastLoginAt: { gte: sevenDaysAgo }
        }
      }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count({
        where: {
          createdAt: { gte: today }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: sevenDaysAgo }
        }
      }),

      // 스터디 통계
      prisma.study.count(),
      prisma.study.count({
        where: {
          updatedAt: { gte: sevenDaysAgo }
        }
      }),
      prisma.study.count({
        where: {
          createdAt: { gte: today }
        }
      }),

      // 신고 통계
      prisma.report.count({
        where: { status: 'PENDING' }
      }),
      prisma.report.count({
        where: {
          createdAt: { gte: today }
        }
      })
    ])

    // 최근 활동 (신고, 제재)
    const recentReports = await prisma.report.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      },
      select: {
        id: true,
        targetType: true,
        targetName: true,
        type: true,
        status: true,
        priority: true,
        createdAt: true
      }
    })

    const recentSanctions = await prisma.sanction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        type: true,
        reason: true,
        createdAt: true,
        adminId: true
      }
    })

    // 주간 추이 데이터 (최근 7일)
    const dailyStats = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)

      const [newUsers, newStudies, reports] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: { gte: date, lt: nextDate }
          }
        }),
        prisma.study.count({
          where: {
            createdAt: { gte: date, lt: nextDate }
          }
        }),
        prisma.report.count({
          where: {
            createdAt: { gte: date, lt: nextDate }
          }
        })
      ])

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        newUsers,
        newStudies,
        reports
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          users: {
            total: totalUsers,
            active: activeUsers,
            suspended: suspendedUsers,
            newToday: newUsersToday,
            newWeek: newUsersWeek
          },
          studies: {
            total: totalStudies,
            active: activeStudies,
            newToday: newStudiesToday
          },
          reports: {
            pending: pendingReports,
            today: reportsToday
          }
        },
        recentActivity: {
          reports: recentReports,
          sanctions: recentSanctions
        },
        trends: {
          daily: dailyStats
        }
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { success: false, error: "대시보드 데이터 조회 실패" },
      { status: 500 }
    )
  }
}

