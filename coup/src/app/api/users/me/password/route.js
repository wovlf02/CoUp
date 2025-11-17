""// src/app/api/users/me/password/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
  newPassword: z.string().min(8, "새 비밀번호는 최소 8자 이상이어야 합니다"),
})

export async function PATCH(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const validatedData = passwordSchema.parse(body)

    const userId = session.user.id

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "비밀번호를 변경할 수 없습니다" },
        { status: 400 }
      )
    }

    // 현재 비밀번호 확인
    const isValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    )

    if (!isValid) {
      return NextResponse.json(
        { error: "현재 비밀번호가 일치하지 않습니다" },
        { status: 400 }
      )
    }

    // 새 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: "비밀번호가 변경되었습니다"
    })

  } catch (error) {
    console.error('Change password error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "비밀번호 변경 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

