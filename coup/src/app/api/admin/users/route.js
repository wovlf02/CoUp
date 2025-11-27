// src/app/api/admin/users/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-helpers"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/users
 * 사용자 목록 조회 (관리자)
 */
export async function GET(request) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') // ACTIVE, SUSPENDED, DELETED
    const role = searchParams.get('role') // USER, ADMIN, SYSTEM_ADMIN
    const provider = searchParams.get('provider') // email, google, github
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // 검색 조건 생성
    const whereClause = {}

    // 상태 필터
    if (status) {
      whereClause.status = status
    }

    // 역할 필터
    if (role) {
      whereClause.role = role
    }

    // 가입 경로 필터
    if (provider) {
      if (provider === 'email') {
        whereClause.provider = 'CREDENTIALS'
      } else if (provider === 'google') {
        whereClause.provider = 'GOOGLE'
      } else if (provider === 'github') {
        whereClause.provider = 'GITHUB'
      }
    }

    // 가입일 필터
    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate)
      }
    }

    // 검색어 처리
    if (search) {
      whereClause.OR = [
        { id: search }, // ID 정확히 일치
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 총 개수 조회
    const total = await prisma.user.count({ where: whereClause })

    // 정렬 옵션
    const orderBy = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'lastActivityAt') {
      orderBy.lastLoginAt = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // 사용자 목록 조회
    const users = await prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        provider: true,
        createdAt: true,
        lastLoginAt: true,
        suspendedUntil: true,
        _count: {
          select: {
            studyMembers: true
          }
        }
      }
    })

    // 요약 통계
    const summary = await prisma.user.groupBy({
      by: ['status'],
      _count: true
    })

    const summaryMap = {
      total: total,
      active: 0,
      suspended: 0,
      deleted: 0
    }

    summary.forEach(item => {
      if (item.status === 'ACTIVE') summaryMap.active = item._count
      if (item.status === 'SUSPENDED') summaryMap.suspended = item._count
      if (item.status === 'DELETED') summaryMap.deleted = item._count
    })

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        summary: summaryMap
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: "사용자 목록 조회 실패" },
      { status: 500 }
    )
  }
}

