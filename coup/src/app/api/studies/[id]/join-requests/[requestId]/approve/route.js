// src/app/api/studies/[id]/join-requests/[requestId]/approve/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  const { id: studyId, requestId } = await params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  const { user } = result

  try {
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

    // 승인 처리
    const approvedMember = await prisma.studyMember.update({
      where: { id: requestId },
      data: {
        status: 'ACTIVE',
        role: 'MEMBER',
        approvedAt: new Date(),
        approvedBy: user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // 스터디 멤버 수 업데이트
    await prisma.study.update({
      where: { id: studyId },
      data: {
        currentMembers: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      member: approvedMember
    })

  } catch (error) {
    console.error('Approve join request error:', error)
    return NextResponse.json(
      { error: "가입 승인 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

