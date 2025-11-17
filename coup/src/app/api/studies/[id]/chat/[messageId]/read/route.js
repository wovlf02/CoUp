// src/app/api/studies/[id]/chat/[messageId]/read/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  const { id: studyId, messageId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message || message.studyId !== studyId) {
      return NextResponse.json(
        { error: "메시지를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 이미 읽음 처리된 경우
    if (message.readers.includes(session.user.id)) {
      return NextResponse.json({
        success: true,
        message: "이미 읽음 처리되었습니다"
      })
    }

    // 읽은 사용자 추가
    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        readers: {
          push: session.user.id
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "메시지를 읽음 처리했습니다",
      data: updated
    })

  } catch (error) {
    console.error('Mark message as read error:', error)
    return NextResponse.json(
      { error: "메시지 읽음 처리 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

