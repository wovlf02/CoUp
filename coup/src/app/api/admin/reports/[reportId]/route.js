/**
 * 관리자 - 신고 상세 API
 * GET /api/admin/reports/[reportId]
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.REPORT_VIEW)
  if (auth instanceof NextResponse) return auth

  const { adminRole } = auth
  const { reportId } = params

  try {
    // 신고 상세 조회
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            status: true,
            createdAt: true,
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

    // 신고 대상 정보 가져오기
    let target = null
    if (report.targetType === 'USER') {
      target = await prisma.user.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          status: true,
          createdAt: true,
          suspendedUntil: true,
          suspendReason: true,
          _count: {
            select: {
              ownedStudies: true,
              studyMembers: true,
              messages: true,
              receivedWarnings: true,
            },
          },
        },
      })
    } else if (report.targetType === 'STUDY') {
      target = await prisma.study.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          name: true,
          emoji: true,
          description: true,
          category: true,
          isPublic: true,
          isRecruiting: true,
          createdAt: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              messages: true,
              notices: true,
            },
          },
        },
      })
    } else if (report.targetType === 'MESSAGE') {
      target = await prisma.message.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          study: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    }

    // 처리자 정보 (있는 경우)
    let processedAdmin = null
    if (report.processedBy) {
      processedAdmin = await prisma.user.findUnique({
        where: { id: report.processedBy },
        select: {
          id: true,
          name: true,
          email: true,
          adminRole: {
            select: {
              role: true,
            },
          },
        },
      })
    }

    // 동일 대상에 대한 관련 신고 조회
    const relatedReports = await prisma.report.findMany({
      where: {
        targetId: report.targetId,
        targetType: report.targetType,
        id: { not: reportId },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
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

    // 신고자의 신고 이력
    const reporterHistory = await prisma.report.aggregate({
      where: {
        reporterId: report.reporterId,
      },
      _count: true,
    })

    // 신고 대상의 신고 받은 이력 (USER인 경우)
    let targetReportCount = 0
    if (report.targetType === 'USER') {
      targetReportCount = await prisma.report.count({
        where: {
          targetType: 'USER',
          targetId: report.targetId,
        },
      })
    }

    // 관리자 로그 기록
    await logAdminAction(adminRole.userId, 'REPORT_VIEW', 'Report', reportId, {
      status: report.status,
      type: report.type,
    })

    return NextResponse.json({
      success: true,
      data: {
        report: {
          ...report,
          target,
          processedAdmin,
          reporterHistory: {
            totalReports: reporterHistory._count,
          },
          targetReportCount,
        },
        relatedReports,
      },
    })
  } catch (error) {
    console.error('신고 상세 조회 실패:', error)
    return NextResponse.json(
      { success: false, message: '신고 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

