// src/app/api/studies/[id]/notices/[noticeId]/pin/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  const { id: studyId, noticeId } = await params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    const notice = await prisma.notice.findUnique({
      where: { id: noticeId }
    })

    if (!notice || notice.studyId !== studyId) {
      return NextResponse.json(
        { error: "공지사항을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 고정/해제 토글
    const updated = await prisma.notice.update({
      where: { id: noticeId },
      data: {
        isPinned: !notice.isPinned
      }
    })

    return NextResponse.json({
      success: true,
      message: updated.isPinned ? "공지사항을 고정했습니다" : "공지사항 고정을 해제했습니다",
      data: updated
    })

  } catch (error) {
    console.error('Pin notice error:', error)
    return NextResponse.json(
      { error: "공지사항 고정 처리 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

