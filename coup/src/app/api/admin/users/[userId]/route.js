/**
 * 관리자 - 사용자 상세 조회 API
 * GET /api/admin/users/[userId]
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
  if (auth instanceof NextResponse) return auth

  const { adminRole } = auth
  const { userId } = params

  try {
    // 사용자 상세 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        // 통계
        _count: {
          select: {
            ownedStudies: true,
            studyMembers: true,
            messages: true,
            tasks: true,
            reports: true,
            uploadedFiles: true,
            receivedWarnings: true,
            sanctions: true,
          },
        },

        // 소유한 스터디
        ownedStudies: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            emoji: true,
            createdAt: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },

        // 참여한 스터디
        studyMembers: {
          take: 5,
          orderBy: { joinedAt: 'desc' },
          where: {
            status: 'ACTIVE',
          },
          include: {
            study: {
              select: {
                id: true,
                name: true,
                emoji: true,
              },
            },
          },
        },

        // 경고 이력
        receivedWarnings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            reason: true,
            severity: true,
            createdAt: true,
            adminId: true,
          },
        },

        // 제재 이력
        sanctions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            type: true,
            reason: true,
            duration: true,
            expiresAt: true,
            isActive: true,
            createdAt: true,
            unsuspendedAt: true,
            unsuspendReason: true,
          },
        },

        // 신고 내역 (사용자가 한 신고)
        reports: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            targetType: true,
            targetId: true,
            type: true,
            status: true,
            createdAt: true,
          },
        },

        // 관리자 역할 (있는 경우)
        adminRole: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 사용자에 대한 신고 내역 조회 (다른 사람이 이 사용자를 신고한 경우)
    const reportsAgainstUser = await prisma.report.findMany({
      where: {
        targetType: 'USER',
        targetId: userId,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        reason: true,
        status: true,
        priority: true,
        createdAt: true,
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // 활동 통계 (최근 30일)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActivity = {
      messages: await prisma.message.count({
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      filesUploaded: await prisma.file.count({
        where: {
          uploaderId: userId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      tasksCreated: await prisma.task.count({
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    }

    // 활동 로그
    await logAdminAction({
      adminId: adminRole.userId,
      action: 'USER_VIEW',
      targetType: 'User',
      targetId: userId,
      request,
    })

    // 응답 데이터 구성
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          bio: user.bio,
          provider: user.provider,
          status: user.status,
          suspendedUntil: user.suspendedUntil,
          suspendReason: user.suspendReason,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.lastLoginAt,
        },

        stats: {
          studiesOwned: user._count.ownedStudies,
          studiesJoined: user._count.studyMembers,
          messagesCount: user._count.messages,
          tasksCount: user._count.tasks,
          reportsCount: user._count.reports,
          filesCount: user._count.uploadedFiles,
          warningsCount: user._count.receivedWarnings,
          sanctionsCount: user._count.sanctions,
        },

        recentActivity,

        ownedStudies: user.ownedStudies,
        joinedStudies: user.studyMembers.map(sm => ({
          ...sm.study,
          joinedAt: sm.joinedAt,
          role: sm.role,
        })),

        warnings: user.receivedWarnings,
        sanctions: user.sanctions,
        reports: user.reports,
        reportsAgainst: reportsAgainstUser,

        adminRole: user.adminRole,
      },
    })
  } catch (error) {
    console.error('Get user detail error:', error)
    return NextResponse.json(
      { success: false, error: '사용자 정보 조회 실패' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

