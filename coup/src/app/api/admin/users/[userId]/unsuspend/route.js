/**
 * 관리자 - 사용자 정지 해제 API
 * POST /api/admin/users/[userId]/unsuspend
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_UNSUSPEND)
  if (auth instanceof NextResponse) return auth

  const { adminRole } = auth
  const { userId } = params

  try {
    const body = await request.json()
    const { reason = '관리자에 의한 정지 해제' } = body

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sanctions: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (user.status !== 'SUSPENDED') {
      return NextResponse.json(
        { success: false, error: '정지된 사용자가 아닙니다.' },
        { status: 400 }
      )
    }

    // 활성 제재가 없는 경우
    if (user.sanctions.length === 0) {
      return NextResponse.json(
        { success: false, error: '활성 제재가 없습니다.' },
        { status: 400 }
      )
    }

    // 트랜잭션으로 처리
    await prisma.$transaction(async (tx) => {
      // 모든 활성 제재 해제
      for (const sanction of user.sanctions) {
        await tx.sanction.update({
          where: { id: sanction.id },
          data: {
            isActive: false,
            unsuspendedBy: adminRole.userId,
            unsuspendReason: reason,
            unsuspendedAt: new Date(),
          },
        })
      }

      // 사용자 상태 복구
      await tx.user.update({
        where: { id: userId },
        data: {
          status: 'ACTIVE',
          suspendedUntil: null,
          suspendReason: null,
        },
      })

      // 알림 전송
      await tx.notification.create({
        data: {
          userId,
          type: 'KICK',
          message: '계정 정지가 해제되었습니다.',
          data: {
            reason,
            unsuspendedBy: adminRole.userId,
          },
        },
      })
    })

    // 활동 로그
    await logAdminAction({
      adminId: adminRole.userId,
      action: 'USER_UNSUSPEND',
      targetType: 'User',
      targetId: userId,
      before: {
        status: 'SUSPENDED',
        sanctions: user.sanctions.map(s => s.id),
      },
      after: {
        status: 'ACTIVE',
      },
      reason,
      request,
    })

    return NextResponse.json({
      success: true,
      message: '사용자 정지가 해제되었습니다.',
    })
  } catch (error) {
    console.error('Unsuspend user error:', error)
    return NextResponse.json(
      { success: false, error: '정지 해제 실패' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

