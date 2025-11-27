// src/app/api/admin/users/[userId]/suspend/route.js
import { NextResponse } from "next/server"
import { requireAdmin, logAdminAction, calculateSuspendedUntil } from "@/lib/admin-helpers"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/admin/users/[userId]/suspend
 * 사용자 정지
 */
export async function POST(request, { params }) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { userId } = params
    const body = await request.json()
    const { duration, reason, relatedReportIds, sendEmail } = body

    // 유효성 검사
    if (!reason || reason.length < 10 || reason.length > 200) {
      return NextResponse.json(
        { success: false, error: "정지 사유는 10-200자 사이여야 합니다" },
        { status: 400 }
      )
    }

    const validDurations = ['1일', '3일', '7일', '30일', '영구']
    if (!validDurations.includes(duration)) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 정지 기간입니다" },
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

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { success: false, error: "이미 정지된 사용자입니다" },
        { status: 409 }
      )
    }

    // 정지 기간 계산
    const suspendedUntil = calculateSuspendedUntil(duration)

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 사용자 상태 업데이트
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          status: 'SUSPENDED',
          suspendedUntil,
          suspendReason: reason
        },
        select: {
          id: true,
          status: true,
          suspendedUntil: true,
          suspendReason: true
        }
      })

      // 제재 기록 생성
      const sanction = await tx.sanction.create({
        data: {
          userId,
          type: 'SUSPEND',
          reason,
          duration,
          relatedReportId: relatedReportIds?.[0] || null,
          adminId: auth.user.id
        }
      })

      // 알림 생성
      await tx.notification.create({
        data: {
          userId,
          type: 'KICK',
          message: `계정이 정지되었습니다. 사유: ${reason}`,
          data: {
            sanctionId: sanction.id,
            duration,
            suspendedUntil: suspendedUntil?.toISOString() || null
          }
        }
      })

      return { updatedUser, sanction }
    })

    // 이메일 발송 (선택사항)
    if (sendEmail) {
      // TODO: 이메일 발송 로직
      console.log('Sending suspension email to:', user.email)
    }

    // 관리자 로그 기록
    await logAdminAction({
      adminId: auth.user.id,
      action: 'USER_SUSPEND',
      targetType: 'User',
      targetId: userId,
      details: { reason, duration, relatedReportIds },
      request
    })

    return NextResponse.json({
      success: true,
      message: "사용자가 정지되었습니다",
      data: {
        user: result.updatedUser,
        sanction: {
          id: result.sanction.id,
          type: result.sanction.type,
          duration: result.sanction.duration,
          reason: result.sanction.reason,
          createdAt: result.sanction.createdAt
        }
      }
    })

  } catch (error) {
    console.error('Error suspending user:', error)
    return NextResponse.json(
      { success: false, error: "사용자 정지 실패" },
      { status: 500 }
    )
  }
}

