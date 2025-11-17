// src/app/api/studies/[id]/join-requests/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    // 가입 신청 목록 조회 (PENDING 상태)
    const requests = await prisma.studyMember.findMany({
      where: {
        studyId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: requests.map(req => ({
        id: req.id,
        user: req.user,
        introduction: req.introduction,
        motivation: req.motivation,
        level: req.level,
        joinedAt: req.joinedAt
      }))
    })

  } catch (error) {
    console.error('Get join requests error:', error)
    return NextResponse.json(
      { error: "가입 신청 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

