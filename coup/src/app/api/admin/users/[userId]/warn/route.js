/**
 * 관리자 - 사용자 경고 API
 * POST /api/admin/users/[userId]/warn
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_WARN)
  if (auth instanceof NextResponse) return auth

  const { adminRole } = auth
  const { userId } = params

  try {
    const body = await request.json()
    const { reason, severity = 'NORMAL', relatedContent = null, expiresAt = null } = body

    // 입력 검증
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '경고 사유를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 유효한 severity인지 확인
    const validSeverities = ['MINOR', 'NORMAL', 'SERIOUS', 'CRITICAL']
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 경고 수준입니다.' },
        { status: 400 }
      )
    }

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            receivedWarnings: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (user.status === 'DELETED') {
      return NextResponse.json(
        { success: false, error: '삭제된 사용자입니다.' },
        { status: 400 }
      )
    }

    // 경고 생성
    const warning = await prisma.warning.create({
      data: {
        userId,
        adminId: adminRole.userId,
        reason: reason.trim(),
        severity,
        relatedContent,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    // 경고 누적 횟수 확인
    const warningCount = user._count.receivedWarnings + 1

    // 자동 제재 규칙 (경고 3회 이상 시 자동 정지)
    let autoSanction = null
    if (warningCount >= 3 && severity !== 'MINOR') {
      const suspendDuration = getSuspendDuration(warningCount, severity)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + suspendDuration)

      // 제재 생성
      autoSanction = await prisma.sanction.create({
        data: {
          userId,
          adminId: adminRole.userId,
          type: 'SUSPENSION',
          reason: `자동 정지: ${warningCount}회 경고 누적`,
          duration: `${suspendDuration}d`,
          expiresAt,
        },
      })

      // 사용자 상태 업데이트
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: 'SUSPENDED',
          suspendedUntil: expiresAt,
          suspendReason: `${warningCount}회 경고 누적으로 인한 자동 정지`,
        },
      })
    }

    // 알림 전송 (TODO: 알림 시스템 구현 후)
    await prisma.notification.create({
      data: {
        userId,
        type: 'KICK', // 임시로 KICK 타입 사용
        message: `경고가 부여되었습니다: ${reason}`,
        data: {
          warningId: warning.id,
          severity,
          warningCount,
        },
      },
    })

    // 활동 로그
    await logAdminAction({
      adminId: adminRole.userId,
      action: 'USER_WARN',
      targetType: 'User',
      targetId: userId,
      after: {
        warningId: warning.id,
        severity,
        reason,
        warningCount,
        autoSanction: autoSanction ? autoSanction.id : null,
      },
      reason: `Warned user: ${severity} - ${reason}`,
      request,
    })

    return NextResponse.json({
      success: true,
      data: {
        warning,
        warningCount,
        autoSanction,
      },
      message: autoSanction
        ? `경고가 부여되었으며, ${warningCount}회 누적으로 자동 정지되었습니다.`
        : '경고가 부여되었습니다.',
    })
  } catch (error) {
    console.error('Warn user error:', error)
    return NextResponse.json(
      { success: false, error: '경고 처리 실패' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * 경고 횟수와 심각도에 따른 정지 기간 계산
 * @param {number} warningCount
 * @param {string} severity
 * @returns {number} 정지 일수
 */
function getSuspendDuration(warningCount, severity) {
  const baseMap = {
    MINOR: 1,
    NORMAL: 3,
    SERIOUS: 7,
    CRITICAL: 14,
  }

  const baseDays = baseMap[severity] || 3

  // 경고 횟수에 따라 기간 증가
  const multiplier = Math.floor(warningCount / 3)

  return Math.min(baseDays * (1 + multiplier), 30) // 최대 30일
}

