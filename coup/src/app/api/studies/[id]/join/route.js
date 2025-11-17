// src/app/api/studies/[id]/join/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { id: studyId } = await params
    const body = await request.json()
    const { introduction, motivation, level } = body

    const userId = session.user.id

    // 스터디 확인
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        _count: {
          select: {
            members: {
              where: { status: { in: ['ACTIVE', 'PENDING'] } }
            }
          }
        }
      }
    })

    if (!study) {
      return NextResponse.json(
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 모집 중인지 확인
    if (!study.isRecruiting) {
      return NextResponse.json(
        { error: "현재 모집 중이 아닙니다" },
        { status: 400 }
      )
    }

    // 정원 확인
    if (study._count.members >= study.maxMembers) {
      return NextResponse.json(
        { error: "정원이 마감되었습니다" },
        { status: 400 }
      )
    }

    // 중복 가입 확인
    const existingMember = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      }
    })

    if (existingMember) {
      if (existingMember.status === 'ACTIVE') {
        return NextResponse.json(
          { error: "이미 가입된 스터디입니다" },
          { status: 400 }
        )
      } else if (existingMember.status === 'PENDING') {
        return NextResponse.json(
          { error: "가입 승인 대기 중입니다" },
          { status: 400 }
        )
      }
    }

    // 자동 승인 여부에 따라 상태 결정
    const status = study.autoApprove ? 'ACTIVE' : 'PENDING'
    const approvedAt = study.autoApprove ? new Date() : null

    // 멤버 생성
    const member = await prisma.studyMember.create({
      data: {
        studyId,
        userId,
        role: 'MEMBER',
        status,
        introduction,
        motivation,
        level,
        approvedAt
      }
    })

    // 자동 승인인 경우 알림 생성
    if (study.autoApprove) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'JOIN_APPROVED',
          studyId,
          studyName: study.name,
          studyEmoji: study.emoji,
          message: `${study.name} 가입이 승인되었습니다`
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: study.autoApprove
        ? "스터디에 가입되었습니다"
        : "가입 신청이 완료되었습니다. 승인을 기다려주세요",
      data: member
    }, { status: 201 })

  } catch (error) {
    console.error('Join study error:', error)
    return NextResponse.json(
      { error: "스터디 가입 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

