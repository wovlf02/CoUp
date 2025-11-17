// src/app/api/tasks/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { searchParams } = new URL(request.url)
    const studyId = searchParams.get('studyId')
    const status = searchParams.get('status') // TODO | IN_PROGRESS | REVIEW | DONE
    const completed = searchParams.get('completed') // 'true' | 'false'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const userId = session.user.id

    let whereClause = { userId }

    if (studyId) {
      whereClause.studyId = studyId
    }

    if (status) {
      whereClause.status = status
    }

    if (completed !== null && completed !== undefined) {
      whereClause.completed = completed === 'true'
    }

    const total = await prisma.task.count({ where: whereClause })

    const tasks = await prisma.task.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        study: {
          select: {
            id: true,
            name: true,
            emoji: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: "할일 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const { studyId, title, description, status, priority, dueDate } = body

    if (!title) {
      return NextResponse.json(
        { error: "제목을 입력해주세요" },
        { status: 400 }
      )
    }

    // studyId가 있는 경우 스터디 멤버 확인
    if (studyId) {
      const member = await prisma.studyMember.findUnique({
        where: {
          studyId_userId: {
            studyId,
            userId: session.user.id
          }
        }
      })

      if (!member || member.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: "스터디 멤버가 아닙니다" },
          { status: 403 }
        )
      }
    }

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        studyId: studyId || null,
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        study: {
          select: {
            id: true,
            name: true,
            emoji: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "할일이 생성되었습니다",
      data: task
    }, { status: 201 })

  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: "할일 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

