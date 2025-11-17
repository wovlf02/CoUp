// src/lib/auth-helpers.js
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import { NextResponse } from "next/server"
import { prisma } from "./prisma"

/**
 * 로그인 확인
 * API Route에서 사용
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다" },
      { status: 401 }
    )
  }

  return session
}

/**
 * 관리자 확인
 */
export async function requireAdmin() {
  const session = await requireAuth()

  if (session instanceof NextResponse) return session

  if (!['ADMIN', 'SYSTEM_ADMIN'].includes(session.user.role)) {
    return NextResponse.json(
      { error: "관리자 권한이 필요합니다" },
      { status: 403 }
    )
  }

  return session
}

/**
 * 스터디 멤버 확인
 * @param {string} studyId - 스터디 ID
 * @param {string} minRole - 최소 요구 역할 (MEMBER, ADMIN, OWNER)
 */
export async function requireStudyMember(studyId, minRole = 'MEMBER') {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  const member = await prisma.studyMember.findUnique({
    where: {
      studyId_userId: {
        studyId,
        userId: session.user.id
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

  return { session, member }
}

/**
 * 서버 컴포넌트에서 세션 가져오기
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

