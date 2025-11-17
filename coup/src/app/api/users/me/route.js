// src/app/api/users/me/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            studyMembers: {
              where: { status: 'ACTIVE' }
            },
            tasks: true,
            notifications: {
              where: { isRead: false }
            }
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
      user: {
        ...user,
        stats: {
          studyCount: user._count.studyMembers,
          taskCount: user._count.tasks,
          unreadNotifications: user._count.notifications,
        }
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: "사용자 정보를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function PATCH(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const { name, bio, avatar } = body

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: "프로필이 업데이트되었습니다",
      user
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: "프로필 업데이트 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

