// src/app/api/admin/stats/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 병렬로 통계 조회
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      newUsersToday,
      totalStudies,
      activeStudies,
      newStudiesToday,
      totalTasks,
      completedTasks,
      pendingReports,
      urgentReports,
      totalNotifications,
      unreadNotifications
    ] = await Promise.all([
      // 전체 사용자
      prisma.user.count(),

      // 활성 사용자
      prisma.user.count({
        where: { status: 'ACTIVE' }
      }),

      // 정지된 사용자
      prisma.user.count({
        where: { status: 'SUSPENDED' }
      }),

      // 오늘 신규 가입
      prisma.user.count({
        where: {
          createdAt: { gte: today }
        }
      }),

      // 전체 스터디
      prisma.study.count(),

      // 활성 스터디 (멤버가 있는)
      prisma.study.count({
        where: {
          members: {
            some: {
              status: 'ACTIVE'
            }
          }
        }
      }),

      // 오늘 생성된 스터디
      prisma.study.count({
        where: {
          createdAt: { gte: today }
        }
      }),

      // 전체 할일
      prisma.task.count(),

      // 완료된 할일
      prisma.task.count({
        where: { completed: true }
      }),

      // 미처리 신고
      prisma.report.count({
        where: { status: 'PENDING' }
      }),

      // 긴급 신고
      prisma.report.count({
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          priority: 'URGENT'
        }
      }),

      // 전체 알림
      prisma.notification.count(),

      // 읽지 않은 알림
      prisma.notification.count({
        where: { isRead: false }
      })
    ])

    // 최근 활동 통계 (7일)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [
      newUsersWeek,
      newStudiesWeek,
      newTasksWeek
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),

      prisma.study.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),

      prisma.task.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      })
    ])

    // 카테고리별 스터디 수
    const studiesByCategory = await prisma.study.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersWeek
        },
        studies: {
          total: totalStudies,
          active: activeStudies,
          newToday: newStudiesToday,
          newThisWeek: newStudiesWeek,
          byCategory: studiesByCategory.map(item => ({
            category: item.category,
            count: item._count.id
          }))
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: totalTasks - completedTasks,
          newThisWeek: newTasksWeek
        },
        reports: {
          pending: pendingReports,
          urgent: urgentReports
        },
        notifications: {
          total: totalNotifications,
          unread: unreadNotifications
        }
      }
    })

  } catch (error) {
    console.error('Get admin stats error:', error)
    return NextResponse.json(
      { error: "통계를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

