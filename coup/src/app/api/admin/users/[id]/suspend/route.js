// src/app/api/admin/users/[id]/suspend/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  try {
    const { id } = params
    const body = await request.json()
    const { reason, days } = body // days: 정지 기간 (일)

    if (!reason) {
      return NextResponse.json(
        { error: "정지 사유를 입력해주세요" },
        { status: 400 }
      )
    }

    // 자기 자신 정지 불가
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "자기 자신을 정지할 수 없습니다" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // SYSTEM_ADMIN 정지 불가
    if (user.role === 'SYSTEM_ADMIN' && session.user.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: "시스템 관리자를 정지할 수 없습니다" },
        { status: 403 }
      )
    }

    // 정지 기간 계산
    let suspendedUntil = null
    if (days && days > 0) {
      suspendedUntil = new Date()
      suspendedUntil.setDate(suspendedUntil.getDate() + days)
    }

    // 계정 정지
    const updated = await prisma.user.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        suspendedUntil,
        suspendReason: reason
      }
    })

    // 알림 생성
    await prisma.notification.create({
      data: {
        userId: id,
        type: 'KICK', // 정지 알림
        message: `계정이 정지되었습니다. 사유: ${reason}`,
        data: {
          suspendedUntil,
          reason
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "계정이 정지되었습니다",
      data: updated
    })

  } catch (error) {
    console.error('Suspend user error:', error)
    return NextResponse.json(
      { error: "계정 정지 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

