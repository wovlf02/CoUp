// src/app/api/admin/studies/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    let whereClause = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category && category !== 'all') {
      whereClause.category = category
    }

    const total = await prisma.study.count({ where: whereClause })

    const studies = await prisma.study.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            },
            notices: true,
            files: true,
            messages: true
          }
        }
      }
    })

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
    console.error('Get studies error:', error)
    return NextResponse.json(
      { error: "스터디 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

