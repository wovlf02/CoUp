// src/app/api/admin/users/[userId]/unsuspend/route.js
import { NextResponse } from "next/server"
import { requireAdmin, logAdminAction } from "@/lib/admin-helpers"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/admin/users/[userId]/unsuspend
 * 사용자 정지 해제
 */
export async function POST(request, { params }) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { userId } = params
    const body = await request.json()
    const { reason, sendNotification } = body

    // 유효성 검사
    if (!reason || reason.length < 10 || reason.length > 200) {
      return NextResponse.json(
        { success: false, error: "해제 사유는 10-200자 사이여야 합니다" },
        { status: 400 }
      )
    }

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, status: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    if (user.status !== 'SUSPENDED') {
      return NextResponse.json(
        { success: false, error: "정지되지 않은 사용자입니다" },
        { status: 400 }
      )
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 사용자 상태 업데이트
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          status: 'ACTIVE',
          suspendedUntil: null,
          suspendReason: null
        },
        select: {
          id: true,
          status: true,
          suspendedUntil: true,
          suspendReason: true
        }
      })

      // 정지 해제 기록 생성
      const sanction = await tx.sanction.create({
        data: {
          userId,
          type: 'UNSUSPEND',
          reason,
          adminId: auth.user.id
        }
      })

      // 알림 생성
      if (sendNotification) {
        await tx.notification.create({
          data: {
            userId,
            type: 'MEMBER',
            message: `계정 정지가 해제되었습니다. 사유: ${reason}`,
            data: {
              sanctionId: sanction.id
            }
          }
        })
      }

      return { updatedUser, sanction }
    })

    // 관리자 로그 기록
    await logAdminAction({
      adminId: auth.user.id,
      action: 'USER_UNSUSPEND',
      targetType: 'User',
      targetId: userId,
      details: { reason },
      request
    })

    return NextResponse.json({
      success: true,
      message: "정지가 해제되었습니다",
      data: {
        user: result.updatedUser,
        sanction: {
          id: result.sanction.id,
          type: result.sanction.type,
          reason: result.sanction.reason,
          createdAt: result.sanction.createdAt
        }
      }
    })

  } catch (error) {
    console.error('Error unsuspending user:', error)
    return NextResponse.json(
      { success: false, error: "정지 해제 실패" },
      { status: 500 }
    )
  }
}

