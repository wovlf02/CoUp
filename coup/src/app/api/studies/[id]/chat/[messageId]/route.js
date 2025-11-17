// src/app/api/studies/[id]/chat/[messageId]/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function DELETE(request, { params }) {
  const { id: studyId, messageId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session, member } = result

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

    // 작성자 또는 ADMIN+ 권한 확인
    if (message.userId !== session.user.id && !['OWNER', 'ADMIN'].includes(member.role)) {
      return NextResponse.json(
        { error: "메시지 삭제 권한이 없습니다" },
        { status: 403 }
      )
    }

    // 메시지 삭제
    await prisma.message.delete({
      where: { id: messageId }
    })

    return NextResponse.json({
      success: true,
      message: "메시지가 삭제되었습니다"
    })

  } catch (error) {
    console.error('Delete message error:', error)
    return NextResponse.json(
      { error: "메시지 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

