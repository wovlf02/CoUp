// src/lib/auth-helpers.js
import { NextResponse } from "next/server"
import { prisma } from "./prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"

/**
 * 세션 가져오기 (Server Component용)
 * 로그인되지 않은 경우 null 반환
 */
export async function getSession() {
  try {
    const session = await getServerSession(authOptions)
    return session
  } catch (error) {
    console.error('getSession error:', error)
    return null
  }
}

/**
 * 로그인 확인 (NextAuth 기반)
 * API Route에서 사용
 */
export async function requireAuth() {
  try {
    const session = await getServerSession(authOptions)

    // 세션 없거나 user 정보 없음
    if (!session || !session.user || !session.user.id) {
      console.warn('⚠️ requireAuth: No valid session')
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      )
    }

    // 데이터베이스에서 사용자 확인 (실제 검증)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        provider: true
      }
    })

    // 사용자 없음
    if (!user) {
      console.warn(`⚠️ requireAuth: User ${session.user.id} not found in database`)
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 401 }
      )
    }

    // 비활성 계정
    if (user.status !== 'ACTIVE') {
      console.warn(`⚠️ requireAuth: User ${session.user.id} is ${user.status}`)
      return NextResponse.json(
        { error: user.status === 'SUSPENDED' ? "정지된 계정입니다" : "비활성화된 계정입니다" },
        { status: 403 }
      )
    }

    // 최신 사용자 정보 반환
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.avatar,
        role: user.role,
        status: user.status,
        provider: user.provider
      }
    }

  } catch (error) {
    console.error('❌ requireAuth error:', error)
    return NextResponse.json(
      { error: "인증 처리 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

/**
 * 관리자 확인
 */
export async function requireAdmin() {
  const result = await requireAuth()

  if (result instanceof NextResponse) return result

  if (!['ADMIN', 'SYSTEM_ADMIN'].includes(result.user.role)) {
    return NextResponse.json(
      { error: "관리자 권한이 필요합니다" },
      { status: 403 }
    )
  }

  return result
}

/**
 * 스터디 멤버 확인
 * @param {string} studyId - 스터디 ID
 * @param {string} minRole - 최소 요구 역할 (MEMBER, ADMIN, OWNER)
 */
export async function requireStudyMember(studyId, minRole = 'MEMBER') {
  const result = await requireAuth()
  if (result instanceof NextResponse) return result

  const member = await prisma.studyMember.findUnique({
    where: {
      studyId_userId: {
        studyId,
        userId: result.user.id
      }
    }
  })

  if (!member || member.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: "스터디 멤버가 아닙니다" },
      { status: 403 }
    )
  }

  // 역할 확인
  const roleHierarchy = { MEMBER: 0, ADMIN: 1, OWNER: 2 }
  if (roleHierarchy[member.role] < roleHierarchy[minRole]) {
    return NextResponse.json(
      { error: "권한이 부족합니다" },
      { status: 403 }
    )
  }

  return { session: result, member }
}

/**
 * 현재 사용자 정보 가져오기 (상세 정보 포함)
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

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
      provider: true,
      createdAt: true,
      lastLoginAt: true
    }
  })

  return user
}
