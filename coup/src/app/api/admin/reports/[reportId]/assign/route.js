/**
 * 관리자 - 신고 담당자 배정 API
 * POST /api/admin/reports/[reportId]/assign
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.REPORT_ASSIGN)
  if (auth instanceof NextResponse) return auth

  const { adminRole } = auth
  const { reportId } = params

  try {
    const body = await request.json()
    const { adminId, autoAssign } = body

    // 신고 존재 확인
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
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

    // 자동 배정인 경우
    let targetAdminId = adminId
    if (autoAssign) {
      // 가장 적게 처리 중인 관리자에게 배정
      const admins = await prisma.adminRole.findMany({
        where: {
          role: { in: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] },
        },
        select: {
          userId: true,
        },
      })

      if (admins.length === 0) {
        return NextResponse.json(
          { success: false, message: '배정 가능한 관리자가 없습니다.' },
          { status: 400 }
        )
      }

      // 각 관리자의 처리 중인 신고 수 조회
      const workloads = await Promise.all(
        admins.map(async (admin) => {
          const count = await prisma.report.count({
            where: {
              processedBy: admin.userId,
              status: { in: ['PENDING', 'IN_PROGRESS'] },
            },
          })
          return { adminId: admin.userId, count }
        })
      )

      // 가장 적게 처리 중인 관리자 선택
      workloads.sort((a, b) => a.count - b.count)
      targetAdminId = workloads[0].adminId
    }

    // 관리자 존재 확인
    if (targetAdminId) {
      const admin = await prisma.adminRole.findUnique({
        where: { userId: targetAdminId },
      })

      if (!admin) {
        return NextResponse.json(
          { success: false, message: '해당 관리자를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }
    }

    // 트랜잭션으로 처리
    const updatedReport = await prisma.$transaction(async (tx) => {
      // 신고 업데이트
      const updated = await tx.report.update({
        where: { id: reportId },
        data: {
          processedBy: targetAdminId,
          status: targetAdminId ? 'IN_PROGRESS' : 'PENDING',
        },
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

      // 관리자 로그 기록
      await logAdminAction({
        adminId: adminRole.userId,
        action: 'REPORT_ASSIGN',
        targetType: 'Report',
        targetId: reportId,
        before: { processedBy: report.processedBy },
        after: { processedBy: targetAdminId },
        request,
      })

      return updated
    })

    // TODO: 배정된 관리자에게 알림 전송 (추후 구현)

    return NextResponse.json({
      success: true,
      data: {
        report: updatedReport,
      },
      message: targetAdminId
        ? '담당자가 배정되었습니다.'
        : '담당자 배정이 해제되었습니다.',
    })
  } catch (error) {
    console.error('신고 담당자 배정 실패:', error)
    return NextResponse.json(
      { success: false, message: '담당자 배정에 실패했습니다.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

