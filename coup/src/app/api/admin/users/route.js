// src/app/api/admin/users/route.js
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
    const status = searchParams.get('status') // ACTIVE | SUSPENDED | DELETED
    const role = searchParams.get('role') // USER | ADMIN | SYSTEM_ADMIN

    let whereClause = {}

    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      whereClause.status = status
    }

    if (role) {
      whereClause.role = role
    }

    const total = await prisma.user.count({ where: whereClause })

    const users = await prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        provider: true,
        suspendedUntil: true,
        suspendReason: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            studyMembers: {
              where: { status: 'ACTIVE' }
            },
            tasks: true,
            reports: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: users.map(user => ({
        ...user,
        stats: {
          studies: user._count.studyMembers,
          tasks: user._count.tasks,
          reports: user._count.reports
        },
        _count: undefined
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: "사용자 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

