// src/lib/admin-helpers.js
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * 관리자 권한 확인 (ADMIN 또는 SYSTEM_ADMIN)
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { success: false, error: "인증이 필요합니다" },
      { status: 401 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, status: true }
  })

  if (!user) {
    return NextResponse.json(
      { success: false, error: "사용자를 찾을 수 없습니다" },
      { status: 404 }
    )
  }

  if (user.status === 'SUSPENDED') {
    return NextResponse.json(
      { success: false, error: "정지된 계정입니다" },
      { status: 403 }
    )
  }

  if (user.role !== 'ADMIN' && user.role !== 'SYSTEM_ADMIN') {
    return NextResponse.json(
      { success: false, error: "관리자 권한이 필요합니다" },
      { status: 403 }
    )
  }

  return { user, session }
}

/**
 * 시스템 관리자 권한 확인 (SYSTEM_ADMIN만)
 */
export async function requireSystemAdmin() {
  const result = await requireAdmin()

  if (result instanceof NextResponse) {
    return result
  }

  if (result.user.role !== 'SYSTEM_ADMIN') {
    return NextResponse.json(
      { success: false, error: "SYSTEM_ADMIN 권한이 필요합니다" },
      { status: 403 }
    )
  }

  return result
}

/**
 * 관리자 로그 기록
 */
export async function logAdminAction({
  adminId,
  action,
  targetType = null,
  targetId = null,
  details = null,
  request
}) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        details,
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    console.error('Failed to log admin action:', error)
    // 로깅 실패해도 주요 작업은 계속 진행
  }
}

/**
 * 정지 기간 계산
 */
export function calculateSuspendedUntil(duration) {
  const now = new Date()

  switch (duration) {
    case '1일':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case '3일':
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    case '7일':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case '30일':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    case '영구':
      return null // null은 영구 정지
    default:
      throw new Error('유효하지 않은 정지 기간입니다')
  }
}

/**
 * 개인정보 마스킹
 */
export function maskPersonalInfo(data) {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  const masked = { ...data }

  // 이메일 마스킹
  if (masked.email) {
    const [local, domain] = masked.email.split('@')
    masked.email = `${local[0]}***@${domain}`
  }

  // 이름 마스킹 (가운데 글자)
  if (masked.name && masked.name.length > 1) {
    const chars = masked.name.split('')
    const middleIndex = Math.floor(chars.length / 2)
    chars[middleIndex] = '*'
    masked.name = chars.join('')
  }

  return masked
}

