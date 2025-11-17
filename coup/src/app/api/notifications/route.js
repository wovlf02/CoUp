// src/app/api/notifications/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all' // all | unread | read
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const userId = session.user.id

    // 필터 조건
    let whereClause = { userId }
    
    if (filter === 'unread') {
      whereClause.isRead = false
    } else if (filter === 'read') {
      whereClause.isRead = true
    }

    // 총 개수
    const total = await prisma.notification.count({ where: whereClause })
    
    // 읽지 않은 알림 수
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    })

    // 알림 목록
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: notifications,
      stats: {
        total,
        unread: unreadCount
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json(
      { error: "알림을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

