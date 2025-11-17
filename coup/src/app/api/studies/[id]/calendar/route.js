// src/app/api/studies/[id]/calendar/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // YYYY-MM 형식

    let whereClause = { studyId }

    if (month) {
      const [year, monthNum] = month.split('-')
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59)

      whereClause.date = {
        gte: startDate,
        lte: endDate
      }
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc'
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: events
    })

  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { error: "일정을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    const body = await request.json()
    const { title, date, startTime, endTime, location, color } = body

    if (!title || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "필수 필드를 모두 입력해주세요" },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        studyId,
        createdById: session.user.id,
        title,
        date: new Date(date),
        startTime,
        endTime,
        location,
        color: color || '#6366F1'
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    // 스터디 멤버들에게 알림
    const members = await prisma.studyMember.findMany({
      where: {
        studyId,
        status: 'ACTIVE',
        userId: { not: session.user.id }
      }
    })

    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { name: true, emoji: true }
    })

    await prisma.notification.createMany({
      data: members.map(member => ({
        userId: member.userId,
        type: 'EVENT',
        studyId,
        studyName: study.name,
        studyEmoji: study.emoji,
        message: `새 일정: ${title}`
      }))
    })

    return NextResponse.json({
      success: true,
      message: "일정이 생성되었습니다",
      data: event
    }, { status: 201 })

  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: "일정 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

