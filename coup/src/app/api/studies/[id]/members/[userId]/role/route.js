// src/app/api/studies/[id]/members/[userId]/role/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function PATCH(request, { params }) {
  const { id: studyId, userId } = await params

  const result = await requireStudyMember(studyId, 'OWNER')
  if (result instanceof NextResponse) return result

  try {
    const body = await request.json()
    const { role } = body

    if (!['MEMBER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: "유효하지 않은 역할입니다" },
        { status: 400 }
      )
    }

    // OWNER는 변경 불가
    const member = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: "멤버를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    if (member.role === 'OWNER') {
      return NextResponse.json(
        { error: "스터디장의 역할은 변경할 수 없습니다" },
        { status: 400 }
      )
    }

    // 역할 변경
    const updated = await prisma.studyMember.update({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      },
      data: { role }
    })

    return NextResponse.json({
      success: true,
      message: "역할이 변경되었습니다",
      data: updated
    })

  } catch (error) {
    console.error('Change role error:', error)
    return NextResponse.json(
      { error: "역할 변경 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

