// src/app/api/admin/users/[id]/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studyMembers: {
          where: { status: 'ACTIVE' },
          include: {
            study: {
              select: {
                id: true,
                name: true,
                emoji: true
              }
            }
          }
        },
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            tasks: true,
            notifications: true,
            messages: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })

  } catch (error) {
    console.error('Get user detail error:', error)
    return NextResponse.json(
      { error: "사용자 정보를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

