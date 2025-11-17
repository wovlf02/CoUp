// src/app/api/studies/[id]/notices/[noticeId]/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const { id: studyId, noticeId } = params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  try {
    const notice = await prisma.notice.findUnique({
      where: { id: noticeId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    if (!notice || notice.studyId !== studyId) {
      return NextResponse.json(
        { error: "공지사항을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 조회수 증가
    await prisma.notice.update({
      where: { id: noticeId },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      data: notice
    })

  } catch (error) {
    console.error('Get notice detail error:', error)
    return NextResponse.json(
      { error: "공지사항을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  const { id: studyId, noticeId } = params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    const body = await request.json()

    // 공지사항 확인
    const notice = await prisma.notice.findUnique({
      where: { id: noticeId }
    })

    if (!notice || notice.studyId !== studyId) {
      return NextResponse.json(
        { error: "공지사항을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 작성자 또는 ADMIN+ 권한 확인
    if (notice.authorId !== session.user.id && result.member.role === 'MEMBER') {
      return NextResponse.json(
        { error: "수정 권한이 없습니다" },
        { status: 403 }
      )
    }

    // 공지사항 수정
    const updated = await prisma.notice.update({
      where: { id: noticeId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.content && { content: body.content }),
        ...(body.isPinned !== undefined && { isPinned: body.isPinned }),
        ...(body.isImportant !== undefined && { isImportant: body.isImportant })
      }
    })

    return NextResponse.json({
      success: true,
      message: "공지사항이 수정되었습니다",
      data: updated
    })

  } catch (error) {
    console.error('Update notice error:', error)
    return NextResponse.json(
      { error: "공지사항 수정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  const { id: studyId, noticeId } = params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    // 공지사항 확인
    const notice = await prisma.notice.findUnique({
      where: { id: noticeId }
    })

    if (!notice || notice.studyId !== studyId) {
      return NextResponse.json(
        { error: "공지사항을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 작성자 또는 ADMIN+ 권한 확인
    if (notice.authorId !== session.user.id && result.member.role === 'MEMBER') {
      return NextResponse.json(
        { error: "삭제 권한이 없습니다" },
        { status: 403 }
      )
    }

    // 공지사항 삭제
    await prisma.notice.delete({
      where: { id: noticeId }
    })

    return NextResponse.json({
      success: true,
      message: "공지사항이 삭제되었습니다"
    })

  } catch (error) {
    console.error('Delete notice error:', error)
    return NextResponse.json(
      { error: "공지사항 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

