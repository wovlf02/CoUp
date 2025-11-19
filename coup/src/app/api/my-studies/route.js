// src/app/api/my-studies/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all' // all | owner | admin | pending
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const userId = session.user.id

    // 필터 조건 생성
    let whereClause = {
      userId
    }

    if (filter === 'owner') {
      whereClause.role = 'OWNER'
      whereClause.status = 'ACTIVE'
    } else if (filter === 'admin') {
      whereClause.role = { in: ['OWNER', 'ADMIN'] }
      whereClause.status = 'ACTIVE'
    } else if (filter === 'pending') {
      whereClause.status = 'PENDING'
    } else if (filter === 'active') {
      // ACTIVE 상태의 모든 스터디
      whereClause.status = 'ACTIVE'
    } else if (filter === 'all') {
      whereClause.status = { in: ['ACTIVE', 'PENDING'] }
    } else {
      // 기본값: ACTIVE 상태만
      whereClause.status = 'ACTIVE'
    }

    // 총 개수 조회
    const total = await prisma.studyMember.count({ where: whereClause })

    // 스터디 목록 조회
    const studyMembers = await prisma.studyMember.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [
        { status: 'desc' }, // PENDING이 먼저
        { joinedAt: 'desc' }
      ],
      include: {
        study: {
          select: {
            id: true,
            name: true,
            emoji: true,
            description: true,
            category: true,
            subCategory: true,
            maxMembers: true,
            isPublic: true,
            isRecruiting: true,
            tags: true,
            createdAt: true,
            _count: {
              select: {
                members: {
                  where: { status: 'ACTIVE' }
                },
                messages: {
                  where: {
                    createdAt: {
                      gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 최근 24시간
                    }
                  }
                },
                notices: {
                  where: {
                    createdAt: {
                      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 최근 7일
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    // 응답 데이터 포맷팅
    const studies = studyMembers.map(sm => ({
      membershipId: sm.id,
      role: sm.role,
      status: sm.status,
      joinedAt: sm.joinedAt,
      approvedAt: sm.approvedAt,
      study: {
        id: sm.study.id,
        name: sm.study.name,
        emoji: sm.study.emoji,
        description: sm.study.description,
        category: sm.study.category,
        subCategory: sm.study.subCategory,
        maxMembers: sm.study.maxMembers,
        currentMembers: sm.study._count.members,
        isPublic: sm.study.isPublic,
        isRecruiting: sm.study.isRecruiting,
        tags: sm.study.tags,
        createdAt: sm.study.createdAt,
        newMessages: sm.study._count.messages,
        newNotices: sm.study._count.notices
      }
    }))

    return NextResponse.json({
      success: true,
      data: studies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('My studies error:', error)
    return NextResponse.json(
      { error: "스터디 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

