// src/app/api/admin/studies/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-helpers"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/studies
 * 스터디 목록 조회 (관리자)
 */
export async function GET(request) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const isPublic = searchParams.get('isPublic')
    const isRecruiting = searchParams.get('isRecruiting')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // 검색 조건 생성
    const whereClause = {}

    // 검색어 처리
    if (search) {
      whereClause.OR = [
        { id: search },
        { name: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
        { owner: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // 카테고리 필터
    if (category) {
      whereClause.category = category
    }

    // 공개 여부 필터
    if (isPublic !== null && isPublic !== undefined && isPublic !== '') {
      whereClause.isPublic = isPublic === 'true'
    }

    // 모집 상태 필터
    if (isRecruiting !== null && isRecruiting !== undefined && isRecruiting !== '') {
      whereClause.isRecruiting = isRecruiting === 'true'
    }

    // 총 개수 조회
    const total = await prisma.study.count({ where: whereClause })

    // 정렬 옵션
    const orderBy = {}
    if (sortBy === 'members') {
      orderBy.members = { _count: sortOrder }
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // 스터디 목록 조회
    const studies = await prisma.study.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        emoji: true,
        category: true,
        subCategory: true,
        maxMembers: true,
        isPublic: true,
        isRecruiting: true,
        tags: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      }
    })

    // 요약 통계
    const [totalCount, activeCount, recruitingCount] = await Promise.all([
      prisma.study.count(),
      prisma.study.count({ where: { isPublic: true } }),
      prisma.study.count({ where: { isRecruiting: true } })
    ])

    return NextResponse.json({
      success: true,
      data: {
        studies,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        summary: {
          total: totalCount,
          active: activeCount,
          recruiting: recruitingCount
        }
      }
    })

  } catch (error) {
    console.error('Error fetching studies:', error)
    return NextResponse.json(
      { success: false, error: "스터디 목록 조회 실패" },
      { status: 500 }
    )
  }
}

