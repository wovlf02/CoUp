// src/app/api/studies/[id]/members/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  try {
    const { searchParams } = new URL(request.url)

    // 1. 페이지네이션 파라미터 검증
    const pageParam = searchParams.get('page') || '1'
    const limitParam = searchParams.get('limit') || '50'

    const page = parseInt(pageParam)
    const limit = parseInt(limitParam)

    // 페이지네이션 범위 검증
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        {
          success: false,
          error: '페이지 번호는 1 이상이어야 합니다',
          details: { page: pageParam }
        },
        { status: 400 }
      )
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: '페이지 크기는 1-100 사이여야 합니다',
          details: { limit: limitParam }
        },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    // 2. 필터 파라미터
    const roleParam = searchParams.get('role') // OWNER | ADMIN | MEMBER | ALL
    const statusParam = searchParams.get('status') || 'ACTIVE' // ACTIVE | PENDING | LEFT | KICKED | ALL

    // 3. 역할 필터 검증
    const allowedRoles = ['OWNER', 'ADMIN', 'MEMBER', 'ALL']
    if (roleParam && !allowedRoles.includes(roleParam)) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 역할 필터입니다',
          details: {
            role: roleParam,
            allowedValues: allowedRoles
          }
        },
        { status: 400 }
      )
    }

    // 4. 상태 필터 검증
    const allowedStatuses = ['ACTIVE', 'PENDING', 'LEFT', 'KICKED', 'ALL']
    if (!allowedStatuses.includes(statusParam)) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 상태 필터입니다',
          details: {
            status: statusParam,
            allowedValues: allowedStatuses
          }
        },
        { status: 400 }
      )
    }

    // where 조건 생성
    let whereClause = {
      studyId
    }

    // 역할 필터 (ALL이 아닌 경우만 적용)
    if (roleParam && roleParam !== 'ALL') {
      whereClause.role = roleParam
    }

    // 상태 필터 (ALL이 아닌 경우만 적용)
    if (statusParam !== 'ALL') {
      whereClause.status = statusParam
    }

    // 총 개수
    const total = await prisma.studyMember.count({ where: whereClause })

    // 멤버 목록 조회 (페이지네이션 적용)
    const members = await prisma.studyMember.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true
          }
        }
      },
      orderBy: [
        { role: 'desc' }, // OWNER > ADMIN > MEMBER
        { joinedAt: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: members.map(m => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        status: m.status,
        user: m.user,
        joinedAt: m.joinedAt,
        approvedAt: m.approvedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        role: roleParam,
        status: statusParam
      }
    })

  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      { error: "멤버 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

