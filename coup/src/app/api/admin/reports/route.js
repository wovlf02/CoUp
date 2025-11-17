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

    return NextResponse.json({
      success: true,
      data: reports,
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

