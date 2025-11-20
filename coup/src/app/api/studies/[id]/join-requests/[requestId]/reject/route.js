// src/app/api/studies/[id]/join-requests/[requestId]/reject/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  const { id: studyId, requestId } = await params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  const { user } = result

  try {
    const body = await request.json()
    const { reason } = body

    // 가입 신청 확인
    const joinRequest = await prisma.studyMember.findFirst({
      where: {
        id: requestId,
        studyId,
        status: 'PENDING'
      }
    })

    if (!joinRequest) {
      return NextResponse.json(
        { error: "가입 신청을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 거절 처리 - 레코드 삭제
    await prisma.studyMember.delete({
      where: { id: requestId }
    })

    // TODO: 거절 알림 전송 (reason 포함)

    return NextResponse.json({
      success: true,
      message: "가입 신청이 거절되었습니다"
    })

  } catch (error) {
    console.error('Reject join request error:', error)
    return NextResponse.json(
      { error: "가입 거절 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

