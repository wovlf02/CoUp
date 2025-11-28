/**
 * 관리자 인증 및 권한 확인 미들웨어
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hasPermission, getDefaultPermissions } from './permissions'

const prisma = new PrismaClient()

/**
 * 관리자 권한 확인 (API 라우트용)
 * @param {Request} request
 * @param {string|string[]} requiredPermissions - 필요한 권한
 * @returns {Promise<{user, adminRole}|NextResponse>}
 */
export async function requireAdmin(request, requiredPermissions = null) {
  try {
    // 1. 세션 확인
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 2. 관리자 역할 확인
    const adminRole = await prisma.adminRole.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          }
        }
      }
    })

    if (!adminRole) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 3. 역할 만료 확인
    if (adminRole.expiresAt && new Date(adminRole.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 만료되었습니다.' },
        { status: 403 }
      )
    }

    // 4. 특정 권한 확인 (필요한 경우)
    if (requiredPermissions) {
      const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions]

      const hasRequiredPermissions = permissions.every(permission =>
        hasPermission(adminRole.role, permission)
      )

      if (!hasRequiredPermissions) {
        return NextResponse.json(
          { success: false, error: '해당 작업을 수행할 권한이 없습니다.' },
          { status: 403 }
        )
      }
    }

    return {
      user: session.user,
      adminRole,
    }
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { success: false, error: '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * 관리자 역할 확인 (서버 컴포넌트용)
 * @param {string} userId
 * @returns {Promise<AdminRole|null>}
 */
export async function getAdminRole(userId) {
  try {
    const adminRole = await prisma.adminRole.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          }
        }
      }
    })

    // 만료 확인
    if (adminRole?.expiresAt && new Date(adminRole.expiresAt) < new Date()) {
      return null
    }

    return adminRole
  } catch (error) {
    console.error('Get admin role error:', error)
    return null
  }
}

/**
 * 관리자 여부 확인 (간단 버전)
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function isAdmin(userId) {
  const adminRole = await getAdminRole(userId)
  return adminRole !== null
}

/**
 * SUPER_ADMIN 여부 확인
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function isSuperAdmin(userId) {
  const adminRole = await getAdminRole(userId)
  return adminRole?.role === 'SUPER_ADMIN'
}

/**
 * 관리자 활동 로그 기록
 * @param {Object} params
 */
export async function logAdminAction({
  adminId,
  action,
  targetType = null,
  targetId = null,
  before = null,
  after = null,
  reason = null,
  request = null,
}) {
  try {
    // IP 주소 및 User Agent 추출
    let ipAddress = null
    let userAgent = null

    if (request) {
      ipAddress = request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip') ||
                  'unknown'
      userAgent = request.headers.get('user-agent') || 'unknown'
    }

    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        before,
        after,
        reason,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to log admin action:', error)
    // 로그 실패는 주요 작업에 영향을 주지 않도록 에러를 던지지 않음
  }
}

/**
 * 관리자 권한 체크 헬퍼 (클라이언트 측 사용)
 * @param {Object} adminRole
 * @param {string|string[]} permissions
 * @returns {boolean}
 */
export function checkPermissions(adminRole, permissions) {
  if (!adminRole) return false

  const permissionList = Array.isArray(permissions) ? permissions : [permissions]

  return permissionList.every(permission =>
    hasPermission(adminRole.role, permission)
  )
}

/**
 * 관리자 권한 부여
 * @param {Object} params
 */
export async function grantAdminRole({
  userId,
  role,
  grantedBy,
  expiresAt = null,
  permissions = null,
}) {
  try {
    // 기본 권한 생성
    const defaultPermissions = permissions || getDefaultPermissions(role)

    const adminRole = await prisma.adminRole.upsert({
      where: { userId },
      create: {
        userId,
        role,
        permissions: defaultPermissions,
        grantedBy,
        expiresAt,
      },
      update: {
        role,
        permissions: defaultPermissions,
        grantedBy,
        grantedAt: new Date(),
        expiresAt,
      },
    })

    // 로그 기록
    await logAdminAction({
      adminId: grantedBy,
      action: 'ADMIN_GRANT_ROLE',
      targetType: 'User',
      targetId: userId,
      after: { role, expiresAt },
      reason: `Granted ${role} role`,
    })

    return adminRole
  } catch (error) {
    console.error('Failed to grant admin role:', error)
    throw error
  }
}

/**
 * 관리자 권한 제거
 * @param {string} userId
 * @param {string} revokedBy
 */
export async function revokeAdminRole(userId, revokedBy) {
  try {
    const adminRole = await prisma.adminRole.findUnique({
      where: { userId },
    })

    if (!adminRole) {
      throw new Error('Admin role not found')
    }

    await prisma.adminRole.delete({
      where: { userId },
    })

    // 로그 기록
    await logAdminAction({
      adminId: revokedBy,
      action: 'ADMIN_REVOKE_ROLE',
      targetType: 'User',
      targetId: userId,
      before: { role: adminRole.role },
      reason: 'Revoked admin role',
    })

    return true
  } catch (error) {
    console.error('Failed to revoke admin role:', error)
    throw error
  }
}

/**
 * 관리자 목록 조회
 * @param {Object} options
 */
export async function getAdmins({ role = null, includeExpired = false } = {}) {
  try {
    const where = {}

    if (role) {
      where.role = role
    }

    if (!includeExpired) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ]
    }

    const admins = await prisma.adminRole.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            status: true,
            createdAt: true,
          }
        }
      },
      orderBy: {
        grantedAt: 'desc',
      },
    })

    return admins
  } catch (error) {
    console.error('Failed to get admins:', error)
    return []
  }
}

