// src/app/api/admin/users/[id]/restore/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  try {
    const { id } = params

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    if (user.status !== 'SUSPENDED') {
      return NextResponse.json(
        { error: "정지된 계정이 아닙니다" },
        { status: 400 }
      )
    }

    // 정지 해제
    const updated = await prisma.user.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        suspendedUntil: null,
        suspendReason: null
      }
    })

    // 알림 생성
    await prisma.notification.create({
      data: {
        userId: id,
        type: 'MEMBER', // 복구 알림
        message: '계정 정지가 해제되었습니다'
      }
    })

    return NextResponse.json({
      success: true,
      message: "계정 정지가 해제되었습니다",
      data: updated
    })

  } catch (error) {
    console.error('Restore user error:', error)
    return NextResponse.json(
      { error: "계정 복구 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

