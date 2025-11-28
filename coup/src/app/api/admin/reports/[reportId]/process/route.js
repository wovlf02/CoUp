/**
 * 관리자 - 신고 처리 API
 * POST /api/admin/reports/[reportId]/process
 *
 * 액션 유형:
 * - approve: 승인 (연계 액션 실행)
 * - reject: 거부
 * - hold: 보류
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.REPORT_RESOLVE)
  if (auth instanceof NextResponse) return auth

  const { adminRole } = auth
  const { reportId } = params

  try {
    const body = await request.json()
    const {
      action, // 'approve', 'reject', 'hold'
      resolution, // 처리 사유
      linkedAction, // 연계 액션 ('suspend_user', 'delete_content', 'warn_user', 'none')
      linkedActionDetails, // 연계 액션 세부 사항
    } = body

    // 유효성 검사
    if (!action || !['approve', 'reject', 'hold'].includes(action)) {
      return NextResponse.json(
        { success: false, message: '올바른 처리 액션을 선택해주세요.' },
        { status: 400 }
      )
    }

    if (!resolution) {
      return NextResponse.json(
        { success: false, message: '처리 사유를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 신고 존재 확인
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json(
        { success: false, message: '신고를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 신고 상태 업데이트
      let newStatus = 'PENDING'
      if (action === 'approve') {
        newStatus = 'RESOLVED'
      } else if (action === 'reject') {
        newStatus = 'REJECTED'
      } else if (action === 'hold') {
        newStatus = 'PENDING' // 보류는 PENDING 유지
      }

      const updatedReport = await tx.report.update({
        where: { id: reportId },
        data: {
          status: newStatus,
          processedBy: adminRole.userId,
          processedAt: new Date(),
          resolution,
        },
      })

      let actionResult = null

      // 2. 승인인 경우 연계 액션 실행
      if (action === 'approve' && linkedAction && linkedAction !== 'none') {
        if (linkedAction === 'warn_user' && report.targetType === 'USER') {
          // 경고 부여
          actionResult = await tx.warning.create({
            data: {
              userId: report.targetId,
              adminId: adminRole.userId,
              reason: resolution,
              severity: linkedActionDetails?.severity || 'NORMAL',
              relatedContent: `report:${reportId}`,
              expiresAt: linkedActionDetails?.expiresAt
                ? new Date(linkedActionDetails.expiresAt)
                : null,
            },
          })
        } else if (linkedAction === 'suspend_user' && report.targetType === 'USER') {
          // 사용자 정지
          const duration = linkedActionDetails?.duration || '7d'
          let expiresAt = null

          if (duration !== 'permanent') {
            const durationMap = {
              '1d': 1,
              '3d': 3,
              '7d': 7,
              '30d': 30,
            }
            const days = durationMap[duration] || 7
            expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + days)
          }

          // 제재 기록 생성
          actionResult = await tx.sanction.create({
            data: {
              userId: report.targetId,
              adminId: adminRole.userId,
              type: 'SUSPENSION',
              reason: resolution,
              duration,
              expiresAt,
              relatedReportId: reportId,
              isActive: true,
            },
          })

          // 사용자 상태 업데이트
          await tx.user.update({
            where: { id: report.targetId },
            data: {
              status: 'SUSPENDED',
              suspendedUntil: expiresAt,
              suspendReason: resolution,
            },
          })
        } else if (linkedAction === 'delete_content') {
          // 콘텐츠 삭제
          if (report.targetType === 'STUDY') {
            await tx.study.delete({
              where: { id: report.targetId },
            })
            actionResult = { deleted: true, type: 'STUDY' }
          } else if (report.targetType === 'MESSAGE') {
            await tx.message.delete({
              where: { id: report.targetId },
            })
            actionResult = { deleted: true, type: 'MESSAGE' }
          }

          // 콘텐츠 삭제 로그
          await logAdminAction(
            adminRole.userId,
            'CONTENT_DELETE',
            report.targetType,
            report.targetId,
            {
              reason: resolution,
              reportId,
            },
            tx
          )
        }
      }

      // 3. 관리자 로그 기록
      await logAdminAction(
        adminRole.userId,
        action === 'approve' ? 'REPORT_RESOLVE' : 'REPORT_REJECT',
        'Report',
        reportId,
        {
          before: { status: report.status },
          after: { status: newStatus },
          action,
          resolution,
          linkedAction,
          linkedActionDetails,
        },
        tx
      )

      return { report: updatedReport, actionResult }
    })

    // TODO: 신고자에게 알림 전송 (추후 구현)

    return NextResponse.json({
      success: true,
      data: result,
      message: action === 'approve'
        ? '신고가 승인되었습니다.'
        : action === 'reject'
        ? '신고가 거부되었습니다.'
        : '신고가 보류되었습니다.',
    })
  } catch (error) {
    console.error('신고 처리 실패:', error)
    return NextResponse.json(
      { success: false, message: '신고 처리에 실패했습니다.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

