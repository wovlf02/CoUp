/**
 * 관리자 - 개별 사용자 조회 API
 * GET /api/admin/users/[id]
 * POST /api/admin/users/[id]/suspend
 * POST /api/admin/users/[id]/activate
 * DELETE /api/admin/users/[id]
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

/**
 * GET - 사용자 상세 조회
 */
export async function GET(request, { params }) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
  if (auth instanceof NextResponse) return auth

  try {
    const { id: userId } = await params

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
        // 통계 정보
        _count: {
          select: {
            studiesOwned: true,
            studyMembers: true,
            messages: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 경고 횟수 조회 (가상 필드, 실제 구현 필요)
    const warningsCount = 0 // TODO: warnings 테이블에서 조회

    // 응답 데이터 구성
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.image,
      role: user.role || 'USER',
      status: user.status || 'ACTIVE',
      provider: user.accounts[0]?.provider || 'email',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt || null,
      stats: {
        studiesOwned: user._count.studiesOwned,
        studiesJoined: user._count.studyMembers,
        messagesCount: user._count.messages,
        warningsCount: warningsCount,
      },
    }

    // 관리자 로그
    await logAdminAction({
      adminId: auth.adminRole.userId,
      action: 'VIEW_USER',
      targetType: 'USER',
      targetId: userId,
      details: { userId },
    })

    return NextResponse.json({
      success: true,
      data: userData,
    })
  } catch (error) {
    console.error('사용자 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: '사용자 정보 조회 실패' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * PATCH - 사용자 정보 수정
 */
export async function PATCH(request, { params }) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_EDIT)
  if (auth instanceof NextResponse) return auth

  try {
    const { id: userId } = await params
    const body = await request.json()

    const { name, email, role, status } = body

    // 사용자 수정
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(status && { status }),
      },
    })

    // 관리자 로그
    await logAdminAction({
      adminId: auth.adminRole.userId,
      action: 'UPDATE_USER',
      targetType: 'USER',
      targetId: userId,
      details: { changes: body },
    })

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('사용자 수정 실패:', error)
    return NextResponse.json(
      { success: false, error: '사용자 정보 수정 실패' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * DELETE - 사용자 삭제
 */
export async function DELETE(request, { params }) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_DELETE)
  if (auth instanceof NextResponse) return auth

  try {
    const { id: userId } = await params

    // 사용자 삭제 (soft delete)
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    })

    // 관리자 로그
    await logAdminAction({
      adminId: auth.adminRole.userId,
      action: 'DELETE_USER',
      targetType: 'USER',
      targetId: userId,
      details: { userId, email: user.email },
    })

    return NextResponse.json({
      success: true,
      message: '사용자가 삭제되었습니다',
    })
  } catch (error) {
    console.error('사용자 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: '사용자 삭제 실패' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

