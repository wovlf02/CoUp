/**
 * 관리자 - 사용자 정지 API
 * POST /api/admin/users/[id]/suspend
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_EDIT)
  if (auth instanceof NextResponse) return auth

  try {
    const { id: userId } = await params
    const body = await request.json()
    const { reason, duration } = body

    // 사용자 정지
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'SUSPENDED',
        suspendedAt: new Date(),
        ...(duration && { suspendedUntil: new Date(Date.now() + duration * 24 * 60 * 60 * 1000) }),
      },
    })

    // 관리자 로그
    await logAdminAction({
      adminId: auth.adminRole.userId,
      action: 'SUSPEND_USER',
      targetType: 'USER',
      targetId: userId,
      details: { userId, reason, duration },
    })

    return NextResponse.json({
      success: true,
      message: '사용자가 정지되었습니다',
      data: user,
    })
  } catch (error) {
    console.error('사용자 정지 실패:', error)
    return NextResponse.json(
      { success: false, error: '사용자 정지 실패' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

