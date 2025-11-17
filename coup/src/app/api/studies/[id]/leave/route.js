// src/app/api/studies/[id]/leave/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function DELETE(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { id: studyId } = params
    const userId = session.user.id

    // 멤버 확인
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
        { error: "스터디 멤버가 아닙니다" },
        { status: 404 }
      )
    }

    // OWNER는 탈퇴 불가
    if (member.role === 'OWNER') {
      return NextResponse.json(
        { error: "스터디장은 탈퇴할 수 없습니다. 스터디를 삭제하거나 소유권을 이전하세요" },
        { status: 400 }
      )
    }

    // 상태를 LEFT로 변경
    await prisma.studyMember.update({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      },
      data: {
        status: 'LEFT'
      }
    })

    return NextResponse.json({
      success: true,
      message: "스터디를 탈퇴했습니다"
    })

  } catch (error) {
    console.error('Leave study error:', error)
    return NextResponse.json(
      { error: "스터디 탈퇴 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

