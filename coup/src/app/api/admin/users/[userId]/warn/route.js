// src/app/api/admin/users/[userId]/warn/route.js
import { NextResponse } from "next/server"
import { requireAdmin, logAdminAction } from "@/lib/admin-helpers"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/admin/users/[userId]/warn
 * 사용자 경고 발송
 */
export async function POST(request, { params }) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { userId } = params
    const body = await request.json()
    const { reason, relatedReportId, sendEmail } = body

    // 유효성 검사
    if (!reason || reason.length < 10 || reason.length > 200) {
      return NextResponse.json(
        { success: false, error: "경고 사유는 10-200자 사이여야 합니다" },
        { status: 400 }
      )
    }

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 제재 기록 생성
    const sanction = await prisma.sanction.create({
      data: {
        userId,
        type: 'WARNING',
        reason,
        relatedReportId: relatedReportId || null,
        adminId: auth.user.id
      }
    })

    // 누적 경고 횟수 조회
    const warningCount = await prisma.sanction.count({
      where: {
        userId,
        type: 'WARNING'
      }
    })

    // 알림 생성
    await prisma.notification.create({
      data: {
        userId,
        type: 'KICK', // 제재 관련 알림
        message: `경고를 받았습니다. 사유: ${reason}`,
        data: {
          sanctionId: sanction.id,
          warningCount
        }
      }
    })

    // 이메일 발송 (선택사항)
    if (sendEmail) {
      // TODO: 이메일 발송 로직
      console.log('Sending warning email to:', user.email)
    }

    // 관리자 로그 기록
    await logAdminAction({
      adminId: auth.user.id,
      action: 'USER_WARN',
      targetType: 'User',
      targetId: userId,
      details: { reason, warningCount },
      request
    })

    return NextResponse.json({
      success: true,
      message: "경고가 발송되었습니다",
      data: {
        sanction: {
          id: sanction.id,
          userId: sanction.userId,
          type: sanction.type,
          reason: sanction.reason,
          relatedReportId: sanction.relatedReportId,
          adminId: sanction.adminId,
          createdAt: sanction.createdAt
        },
        warningCount
      }
    })

  } catch (error) {
    console.error('Error creating warning:', error)
    return NextResponse.json(
      { success: false, error: "경고 발송 실패" },
      { status: 500 }
    )
  }
}

