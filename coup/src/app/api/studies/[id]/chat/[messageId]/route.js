// src/app/api/studies/[id]/chat/[messageId]/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function PATCH(request, { params }) {
  const { id: studyId, messageId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "메시지 내용을 입력해주세요" },
        { status: 400 }
      )
    }

    // 메시지 조회
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      return NextResponse.json(
        { error: "메시지를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 권한 확인 - 작성자만 수정 가능
    if (message.userId !== session.user.id) {
      return NextResponse.json(
        { error: "메시지를 수정할 권한이 없습니다" },
        { status: 403 }
      )
    }

    // 메시지 수정
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        file: {
          select: {
            id: true,
            name: true,
            url: true,
            type: true,
            size: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "메시지가 수정되었습니다",
      data: updatedMessage
    })

  } catch (error) {
    console.error('Update message error:', error)
    return NextResponse.json(
      { error: "메시지 수정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  const { id: studyId, messageId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session, member } = result

  try {
    // 메시지 조회
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      return NextResponse.json(
        { error: "메시지를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 권한 확인 - 작성자 또는 ADMIN/OWNER만 삭제 가능
    const canDelete = message.userId === session.user.id ||
                      ['OWNER', 'ADMIN'].includes(member.role)

    if (!canDelete) {
      return NextResponse.json(
        { error: "메시지를 삭제할 권한이 없습니다" },
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

