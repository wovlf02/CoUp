// src/app/api/admin/studies/[id]/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  try {
    const { id } = await params

    const study = await prisma.study.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        members: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        notices: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            files: true,
            messages: true,
            events: true,
            tasks: true
          }
        }
      }
    })

    if (!study) {
      return NextResponse.json(
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: study
    })

  } catch (error) {
    console.error('Get study detail error:', error)
    return NextResponse.json(
      { error: "스터디 정보를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  try {
    const { id } = await params

    const study = await prisma.study.findUnique({
      where: { id }
    })

    if (!study) {
      return NextResponse.json(
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 스터디 삭제 (CASCADE로 관련 데이터도 삭제)
    await prisma.study.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "스터디가 삭제되었습니다"
    })

  } catch (error) {
    console.error('Delete study error:', error)
    return NextResponse.json(
      { error: "스터디 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

