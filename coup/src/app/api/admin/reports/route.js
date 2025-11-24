// src/app/api/admin/reports/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const status = searchParams.get('status') // PENDING | IN_PROGRESS | RESOLVED | REJECTED
    const priority = searchParams.get('priority') // LOW | MEDIUM | HIGH | URGENT

    let whereClause = {}

    if (status) {
      whereClause.status = status
    }

    if (priority) {
      whereClause.priority = priority
    }

    const total = await prisma.report.count({ where: whereClause })

    const reports = await prisma.report.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    // targetName이 없는 경우 실제 대상 정보 조회
    const enrichedReports = await Promise.all(reports.map(async (report) => {
      let targetName = report.targetName
      let reported = null

      if (!targetName) {
        try {
          if (report.targetType === 'USER') {
            const user = await prisma.user.findUnique({
              where: { id: report.targetId },
              select: { id: true, name: true, email: true }
            })
            if (user) {
              targetName = user.name || user.email
              reported = user
            }
          } else if (report.targetType === 'STUDY') {
            const study = await prisma.study.findUnique({
              where: { id: report.targetId },
              select: { id: true, name: true }
            })
            if (study) {
              targetName = study.name
              reported = study
            }
          } else if (report.targetType === 'MESSAGE') {
            const message = await prisma.message.findUnique({
              where: { id: report.targetId },
              select: { id: true, content: true, user: { select: { id: true, name: true, email: true } } }
            })
            if (message) {
              targetName = `${message.user.name || message.user.email}의 메시지`
              reported = message.user
            }
          }
        } catch (err) {
          console.error('Error fetching target info:', err)
        }
      }

      return {
        ...report,
        targetName: targetName || '알 수 없음',
        reported
      }
    }))

    return NextResponse.json({
      success: true,
      data: enrichedReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { error: "신고 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

