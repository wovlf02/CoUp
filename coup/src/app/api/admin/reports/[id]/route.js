// src/app/api/admin/reports/[id]/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  try {
    const { id } = params

    const report = await prisma.report.findUnique({
      where: { id },
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

    if (!report) {
      return NextResponse.json(
        { error: "신고를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: report
    })

  } catch (error) {
    console.error('Get report detail error:', error)
    return NextResponse.json(
      { error: "신고 정보를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

