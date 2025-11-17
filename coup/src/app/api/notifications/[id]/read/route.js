// src/app/api/notifications/[id]/read/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { id } = await params
    const userId = session.user.id

    // 알림 소유권 확인
    const notification = await prisma.notification.findUnique({
      where: { id }
    })

    if (!notification) {
      return NextResponse.json(
        { error: "알림을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    if (notification.userId !== userId) {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      )
    }

    // 읽음 처리
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })

    return NextResponse.json({
      success: true,
      message: "알림을 읽음 처리했습니다",
      data: updated
    })

  } catch (error) {
    console.error('Mark notification as read error:', error)
    return NextResponse.json(
      { error: "알림 읽음 처리 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

