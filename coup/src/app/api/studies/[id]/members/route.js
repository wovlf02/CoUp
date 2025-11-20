// src/app/api/studies/[id]/members/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // OWNER | ADMIN | MEMBER
    const status = searchParams.get('status') || 'ACTIVE' // ACTIVE | PENDING

    let whereClause = {
      studyId,
      status
    }

    if (role) {
      whereClause.role = role
    }

    // 멤버 목록 조회
    const members = await prisma.studyMember.findMany({
      where: whereClause,
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
      orderBy: [
        { role: 'desc' }, // OWNER > ADMIN > MEMBER
        { joinedAt: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      members: members.map(m => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        status: m.status,
        user: m.user,
        joinedAt: m.joinedAt,
        approvedAt: m.approvedAt
      }))
    })

  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      { error: "멤버 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

