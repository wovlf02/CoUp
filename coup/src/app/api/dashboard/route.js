// src/app/api/dashboard/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const userId = session.user.id

    // 통계 카드 데이터
    const [
      activeStudyCount,
      taskCount,
      unreadNotificationCount,
      completedTaskCount
    ] = await Promise.all([
      // 활성 스터디 수
      prisma.studyMember.count({
        where: {
          userId,
          status: 'ACTIVE'
        }
      }),

      // 총 할일 수
      prisma.task.count({
        where: {
          userId,
          completed: false
        }
      }),

      // 읽지 않은 알림 수
      prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      }),

      // 완료한 할일 수 (이번 달)
      prisma.task.count({
        where: {
          userId,
          completed: true,
          completedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ])

    // 내 스터디 (최대 6개)
    const myStudies = await prisma.studyMember.findMany({
      where: {
        userId,
        status: 'ACTIVE'
      },
      take: 6,
      orderBy: {
        joinedAt: 'desc'
      },
      include: {
        study: {
          select: {
            id: true,
            name: true,
            emoji: true,
            category: true,
            _count: {
              select: {
                members: {
                  where: { status: 'ACTIVE' }
                }
              }
            }
          }
        }
      }
    })

    // 최근 활동 (최대 5개)
    const recentActivities = await prisma.notification.findMany({
      where: {
        userId
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        type: true,
        message: true,
        studyName: true,
        studyEmoji: true,
        isRead: true,
        createdAt: true
      }
    })

    // 다가오는 일정 (3일 이내)
    const upcomingEvents = await prisma.event.findMany({
      where: {
        study: {
          members: {
            some: {
              userId,
              status: 'ACTIVE'
            }
          }
        },
        date: {
          gte: new Date(),
          lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }
      },
      take: 3,
      orderBy: {
        date: 'asc'
      },
      include: {
        study: {
          select: {
            name: true,
            emoji: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          activeStudies: activeStudyCount,
          pendingTasks: taskCount,
          unreadNotifications: unreadNotificationCount,
          completedThisMonth: completedTaskCount
        },
        myStudies: myStudies.map(sm => ({
          id: sm.study.id,
          name: sm.study.name,
          emoji: sm.study.emoji,
          category: sm.study.category,
          role: sm.role,
          memberCount: sm.study._count.members,
          joinedAt: sm.joinedAt
        })),
        recentActivities: recentActivities.map(activity => ({
          id: activity.id,
          type: activity.type,
          message: activity.message,
          studyName: activity.studyName,
          studyEmoji: activity.studyEmoji,
          isRead: activity.isRead,
          createdAt: activity.createdAt
        })),
        upcomingEvents: upcomingEvents.map(event => ({
          id: event.id,
          title: event.title,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          studyName: event.study.name,
          studyEmoji: event.study.emoji
        }))
      }
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: "대시보드 데이터를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

