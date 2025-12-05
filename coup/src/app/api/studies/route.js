// Stub for testing
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from 'next-auth/react'

export async function POST(request, context) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.category || !body.emoji) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    if (body.name.length < 2 || body.name.length > 50) {
      return NextResponse.json({ error: 'Invalid name length' }, { status: 400 })
    }
    
    const study = await prisma.study.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        capacity: body.capacity || 10,
        emoji: body.emoji,
        tags: body.tags || [],
        ownerId: session.user.id,
        status: 'RECRUITING'
      }
    })
    
    await prisma.studyMember.create({
      data: {
        studyId: study.id,
        userId: session.user.id,
        role: 'OWNER',
        status: 'ACTIVE'
      }
    })
    
    return NextResponse.json({ success: true, data: study }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const recruitingFilter = searchParams.get('recruiting') // 'all', 'recruiting', 'closed'
    
    // 필터 조건 구성
    const where = {}
    
    if (category && category !== '전체') {
      where.category = category
    }
    
    // 모집 상태 필터
    if (recruitingFilter === 'recruiting') {
      where.isRecruiting = true
    } else if (recruitingFilter === 'closed') {
      where.isRecruiting = false
    }
    // 'all'이거나 없으면 전체 표시
    
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ]
    }
    
    const studies = await prisma.study.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    const total = await prisma.study.count({ where })
    
    // 응답 데이터 가공
    const formattedStudies = studies.map(study => ({
      ...study,
      currentMembers: study._count?.members || 0,
    }))
    
    return NextResponse.json({
      success: true,
      data: formattedStudies,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('[API /studies] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
