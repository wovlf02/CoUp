// src/app/api/auth/validate-session/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * 세션 유효성 검증 API
 * 클라이언트에서 세션이 실제로 유효한지 확인할 때 사용
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // 세션 없음
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { valid: false, error: 'No session' },
        { status: 200 }
      )
    }

    // DB에서 사용자 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      }
    })

    // 사용자 없음 또는 비활성
    if (!user || user.status !== 'ACTIVE') {
      console.warn(`⚠️ Invalid session: User ${session.user.id} ${!user ? 'not found' : `status is ${user.status}`}`)
      return NextResponse.json(
        {
          valid: false,
          error: !user ? 'User not found' : `User status is ${user.status}`,
          shouldLogout: true
        },
        { status: 200 }
      )
    }

    // 유효한 세션
    return NextResponse.json(
      {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Session validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Validation failed' },
      { status: 500 }
    )
  }
}

