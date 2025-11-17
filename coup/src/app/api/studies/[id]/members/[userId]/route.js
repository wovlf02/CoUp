// src/app/api/studies/[id]/members/[userId]/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// 강퇴
export async function DELETE(request, { params }) {
  const { id: studyId, userId } = params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    // 자기 자신 강퇴 불가
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "자기 자신을 강퇴할 수 없습니다" },
        { status: 400 }
      )
    }

    // 멤버 확인
    const member = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      },
      include: {
        study: {
          select: {
            name: true,
            emoji: true
          }
        }
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: "멤버를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // OWNER는 강퇴 불가
    if (member.role === 'OWNER') {
      return NextResponse.json(
        { error: "스터디장을 강퇴할 수 없습니다" },
        { status: 400 }
      )
    }

    // 상태를 KICKED로 변경
    await prisma.studyMember.update({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      },
      data: {
        status: 'KICKED'
      }
    })

    // 강퇴 알림 생성
    await prisma.notification.create({
      data: {
        userId,
        type: 'KICK',
        studyId,
        studyName: member.study.name,
        studyEmoji: member.study.emoji,
        message: `${member.study.name}에서 강퇴되었습니다`
      }
    })

    return NextResponse.json({
      success: true,
      message: "멤버를 강퇴했습니다"
    })

  } catch (error) {
    console.error('Kick member error:', error)
    return NextResponse.json(
      { error: "멤버 강퇴 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

