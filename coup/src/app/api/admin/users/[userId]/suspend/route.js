/**
 * 관리자 - 사용자 정지 API
 * POST /api/admin/users/[userId]/suspend
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_SUSPEND)
  if (auth instanceof NextResponse) return auth

  const { adminRole } = auth
  const { userId } = params

  try {
    const body = await request.json()
    const {
      reason,
      duration = '7d',
      type = 'SUSPENSION',
      relatedReportId = null
    } = body

    // 입력 검증
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '정지 사유를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 유효한 제재 타입인지 확인
    const validTypes = ['SUSPENSION', 'CHAT_BAN', 'STUDY_CREATE_BAN', 'FILE_UPLOAD_BAN', 'PERMANENT_BAN']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 제재 타입입니다.' },
        { status: 400 }
      )
    }

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (user.status === 'SUSPENDED' && type === 'SUSPENSION') {
      return NextResponse.json(
        { success: false, error: '이미 정지된 사용자입니다.' },
        { status: 400 }
      )
    }

    // 관리자는 다른 관리자를 정지할 수 없음 (SUPER_ADMIN 제외)
    if (adminRole.role !== 'SUPER_ADMIN') {
      const targetAdminRole = await prisma.adminRole.findUnique({
        where: { userId },
      })

      if (targetAdminRole) {
        return NextResponse.json(
          { success: false, error: '관리자는 다른 관리자를 정지할 수 없습니다.' },
          { status: 403 }
        )
      }
    }

    // 만료일 계산
    const expiresAt = duration === 'permanent' ? null : calculateExpiration(duration)

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 제재 생성
      const sanction = await tx.sanction.create({
        data: {
          userId,
          adminId: adminRole.userId,
          type,
          reason: reason.trim(),
          duration: duration === 'permanent' ? 'permanent' : duration,
          expiresAt,
          relatedReportId,
        },
      })

      // 사용자 상태 업데이트 (SUSPENSION 또는 PERMANENT_BAN인 경우)
      if (type === 'SUSPENSION' || type === 'PERMANENT_BAN') {
        await tx.user.update({
          where: { id: userId },
          data: {
            status: 'SUSPENDED',
            suspendedUntil: expiresAt,
            suspendReason: reason.trim(),
          },
        })
      }

      // 알림 전송
      await tx.notification.create({
        data: {
          userId,
          type: 'KICK',
          message: type === 'PERMANENT_BAN'
            ? '계정이 영구 정지되었습니다.'
            : `계정이 정지되었습니다. 기간: ${duration}`,
          data: {
            sanctionId: sanction.id,
            type,
            reason,
            expiresAt,
          },
        },
      })

      return { sanction }
    })

    // 활동 로그
    await logAdminAction({
      adminId: adminRole.userId,
      action: 'USER_SUSPEND',
      targetType: 'User',
      targetId: userId,
      after: {
        sanctionId: result.sanction.id,
        type,
        duration,
        expiresAt,
        reason,
      },
      reason: `Suspended user: ${type} - ${duration}`,
      request,
    })

    return NextResponse.json({
      success: true,
      data: result.sanction,
      message: type === 'PERMANENT_BAN'
        ? '사용자가 영구 정지되었습니다.'
        : `사용자가 정지되었습니다. (기간: ${duration})`,
    })
  } catch (error) {
    console.error('Suspend user error:', error)
    return NextResponse.json(
      { success: false, error: '사용자 정지 실패' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * 정지 기간 문자열을 Date 객체로 변환
 * @param {string} duration - "1d", "3d", "7d", "30d" 등
 * @returns {Date}
 */
function calculateExpiration(duration) {
  const match = duration.match(/^(\d+)([dhm])$/)
  if (!match) {
    // 기본값: 7일
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date
  }

  const [, value, unit] = match
  const days = parseInt(value)
  const date = new Date()

  switch (unit) {
    case 'd': // days
      date.setDate(date.getDate() + days)
      break
    case 'h': // hours
      date.setHours(date.getHours() + days)
      break
    case 'm': // months
      date.setMonth(date.getMonth() + days)
      break
    default:
      date.setDate(date.getDate() + 7)
  }

  return date
}

