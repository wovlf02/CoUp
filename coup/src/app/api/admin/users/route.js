/**
 * 관리자 - 사용자 목록 API
 * GET /api/admin/users
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function GET(request) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
  if (auth instanceof NextResponse) return auth

  const { adminRole } = auth

  try {
    const { searchParams } = new URL(request.url)

    // 페이지네이션
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit

    // 필터
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const provider = searchParams.get('provider')
    const hasWarnings = searchParams.get('hasWarnings') === 'true'
    const isSuspended = searchParams.get('isSuspended') === 'true'

    // 날짜 필터
    const createdFrom = searchParams.get('createdFrom')
    const createdTo = searchParams.get('createdTo')
    const lastLoginFrom = searchParams.get('lastLoginFrom')
    const lastLoginTo = searchParams.get('lastLoginTo')

    // 정렬
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Where 조건 구성
    const where = {}

    // 검색
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { id: { contains: search } },
      ]
    }

    // 상태 필터
    if (status && status !== 'all') {
      where.status = status
    }

    // 가입 방식 필터
    if (provider && provider !== 'all') {
      where.provider = provider
    }

    // 정지된 사용자만
    if (isSuspended) {
      where.status = 'SUSPENDED'
    }

    // 날짜 필터
    if (createdFrom || createdTo) {
      where.createdAt = {}
      if (createdFrom) where.createdAt.gte = new Date(createdFrom)
      if (createdTo) where.createdAt.lte = new Date(createdTo)
    }

    if (lastLoginFrom || lastLoginTo) {
      where.lastLoginAt = {}
      if (lastLoginFrom) where.lastLoginAt.gte = new Date(lastLoginFrom)
      if (lastLoginTo) where.lastLoginAt.lte = new Date(lastLoginTo)
    }

    // 경고 있는 사용자만
    if (hasWarnings) {
      where.receivedWarnings = {
        some: {},
      }
    }

    // 사용자 조회
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          _count: {
            select: {
              ownedStudies: true,
              studyMembers: true,
              messages: true,
              receivedWarnings: true,
              sanctions: {
                where: { isActive: true },
              },
            },
          },
          receivedWarnings: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              severity: true,
              createdAt: true,
            },
          },
          sanctions: {
            where: { isActive: true },
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              type: true,
              expiresAt: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    // 데이터 가공
    const userData = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      status: user.status,
      provider: user.provider,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      suspendedUntil: user.suspendedUntil,
      suspendReason: user.suspendReason,

      // 통계
      stats: {
        studiesOwned: user._count.ownedStudies,
        studiesJoined: user._count.studyMembers,
        messagesCount: user._count.messages,
        warningsCount: user._count.receivedWarnings,
        activeSanctions: user._count.sanctions,
      },

      // 최근 경고
      lastWarning: user.receivedWarnings[0] || null,

      // 활성 제재
      activeSanction: user.sanctions[0] || null,
    }))

    // 활동 로그
    await logAdminAction({
      adminId: adminRole.userId,
      action: 'USER_SEARCH',
      reason: `Searched users: ${search || 'all'}`,
      request,
    })

    return NextResponse.json({
      success: true,
      data: {
        users: userData,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        filters: {
          search,
          status,
          provider,
          hasWarnings,
          isSuspended,
        },
      },
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { success: false, error: '사용자 목록 조회 실패' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

