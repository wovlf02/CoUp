/**
 * 관리자 - 사용자 활성화 API
 * POST /api/admin/users/[id]/activate
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

    // 사용자 활성화
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        suspendedAt: null,
        suspendedUntil: null,
      },
    })

    // 관리자 로그
    await logAdminAction({
      adminId: auth.adminRole.userId,
      action: 'ACTIVATE_USER',
      targetType: 'USER',
      targetId: userId,
      details: { userId },
    })

    return NextResponse.json({
      success: true,
      message: '사용자가 활성화되었습니다',
      data: user,
    })
  } catch (error) {
    console.error('사용자 활성화 실패:', error)
    return NextResponse.json(
      { success: false, error: '사용자 활성화 실패' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

