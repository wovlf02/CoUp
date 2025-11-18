// src/app/api/auth/signup/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { signAccessToken, generateRefreshToken } from "@/lib/jwt"
import { saveRefreshToken } from "@/lib/redis"
import bcrypt from "bcryptjs"
import { z } from "zod"

// 유효성 검사 스키마
const signupSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다").optional(),
})

export async function POST(request) {
  try {
    const body = await request.json()

    // 유효성 검사
    const validatedData = signupSchema.parse(body)

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다" },
        { status: 400 }
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name || validatedData.email.split('@')[0],
        provider: 'CREDENTIALS',
        role: 'USER',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
      }
    })

    // Access Token 생성 (15분)
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Refresh Token 생성 및 Redis에 저장 (7일)
    const refreshToken = generateRefreshToken()
    await saveRefreshToken(user.id, refreshToken, 7 * 24 * 60 * 60) // 7일

    // 응답 생성
    const response = NextResponse.json(
      {
        success: true,
        message: "회원가입이 완료되었습니다",
        user,
        accessToken
      },
      { status: 201 }
    )

    // 쿠키에 토큰 설정 (자동 로그인)
    response.cookies.set('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15분
      path: '/'
    })

    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7일
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Signup error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

