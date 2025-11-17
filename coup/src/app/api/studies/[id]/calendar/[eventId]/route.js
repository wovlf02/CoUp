// src/app/api/studies/[id]/calendar/[eventId]/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function PATCH(request, { params }) {
  const { id: studyId, eventId } = params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    const body = await request.json()

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event || event.studyId !== studyId) {
      return NextResponse.json(
        { error: "일정을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.date && { date: new Date(body.date) }),
        ...(body.startTime && { startTime: body.startTime }),
        ...(body.endTime && { endTime: body.endTime }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.color && { color: body.color })
      }
    })

    return NextResponse.json({
      success: true,
      message: "일정이 수정되었습니다",
      data: updated
    })

  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json(
      { error: "일정 수정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  const { id: studyId, eventId } = params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event || event.studyId !== studyId) {
      return NextResponse.json(
        { error: "일정을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    await prisma.event.delete({
      where: { id: eventId }
    })

    return NextResponse.json({
      success: true,
      message: "일정이 삭제되었습니다"
    })

  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json(
      { error: "일정 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

