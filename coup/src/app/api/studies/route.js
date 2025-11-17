// src/app/api/studies/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // 필터 파라미터
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const isRecruiting = searchParams.get('isRecruiting')
    const sortBy = searchParams.get('sortBy') || 'latest' // latest | popular | rating

    // where 조건 생성
    let whereClause = {
      isPublic: true
    }

    if (category && category !== 'all') {
      whereClause.category = category
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }

    if (isRecruiting === 'true') {
      whereClause.isRecruiting = true
    }

    // 정렬 조건
    let orderBy = {}
    switch (sortBy) {
      case 'popular':
        orderBy = { members: { _count: 'desc' } }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // 총 개수
    const total = await prisma.study.count({ where: whereClause })

    // 스터디 목록 조회
    const studies = await prisma.study.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })

    // 응답 데이터 포맷팅
    const formattedStudies = studies.map(study => ({
      id: study.id,
      name: study.name,
      emoji: study.emoji,
      description: study.description,
      category: study.category,
      subCategory: study.subCategory,
      tags: study.tags,
      maxMembers: study.maxMembers,
      currentMembers: study._count.members,
      isRecruiting: study.isRecruiting,
      rating: study.rating,
      reviewCount: study.reviewCount,
      owner: study.owner,
      createdAt: study.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: formattedStudies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get studies error:', error)
    return NextResponse.json(
      { error: "스터디 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const { getServerSession } = await import("next-auth/next")
  const { authOptions } = await import("@/lib/auth")
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다" },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const {
      name,
      emoji,
      description,
      category,
      subCategory,
      maxMembers,
      isPublic,
      autoApprove,
      tags
    } = body

    // 필수 필드 검증
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: "필수 필드를 모두 입력해주세요" },
        { status: 400 }
      )
    }

    // 스터디 생성
    const study = await prisma.study.create({
      data: {
        ownerId: session.user.id,
        name,
        emoji: emoji || '📚',
        description,
        category,
        subCategory,
        maxMembers: maxMembers || 20,
        isPublic: isPublic !== false,
        autoApprove: autoApprove !== false,
        isRecruiting: true,
        tags: tags || []
      }
    })

    // 생성자를 OWNER로 자동 추가
    await prisma.studyMember.create({
      data: {
        studyId: study.id,
        userId: session.user.id,
        role: 'OWNER',
        status: 'ACTIVE',
        approvedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "스터디가 생성되었습니다",
      data: study
    }, { status: 201 })

  } catch (error) {
    console.error('Create study error:', error)
    return NextResponse.json(
      { error: "스터디 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

