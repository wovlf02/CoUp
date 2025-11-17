// src/app/api/notifications/mark-all-read/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const userId = session.user.id

    // 모든 알림 읽음 처리
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({
      success: true,
      message: `${result.count}개의 알림을 읽음 처리했습니다`,
      count: result.count
    })

  } catch (error) {
    console.error('Mark all notifications as read error:', error)
    return NextResponse.json(
      { error: "알림 읽음 처리 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

