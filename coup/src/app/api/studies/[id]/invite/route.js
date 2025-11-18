// src/app/api/studies/[id]/invite/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

/**
 * POST /api/studies/{id}/invite
 * 스터디 초대 코드 생성 (ADMIN+ 권한 필요)
 */
export async function POST(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    const body = await request.json()
    const { expiresIn } = body // 만료 시간 (시간 단위, 선택)

    // 스터디 조회
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: {
        id: true,
        name: true,
        inviteCode: true
      }
    })

    if (!study) {
      return NextResponse.json(
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 새로운 초대 코드 생성 (8자리)
    const newInviteCode = nanoid(8)

    // 초대 코드 업데이트
    const updatedStudy = await prisma.study.update({
      where: { id: studyId },
      data: {
        inviteCode: newInviteCode
      },
      select: {
        id: true,
        name: true,
        inviteCode: true
      }
    })

    // 초대 링크 생성
    const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/studies/${studyId}/join?code=${newInviteCode}`

    return NextResponse.json({
      success: true,
      message: "초대 코드가 생성되었습니다",
      data: {
        studyId: updatedStudy.id,
        studyName: updatedStudy.name,
        inviteCode: updatedStudy.inviteCode,
        inviteUrl: inviteUrl,
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 60 * 60 * 1000) : null
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create invite code error:', error)
    return NextResponse.json(
      { error: "초대 코드 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/studies/{id}/invite
 * 현재 초대 코드 조회 (ADMIN+ 권한 필요)
 */
export async function GET(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: {
        id: true,
        name: true,
        inviteCode: true
      }
    })

    if (!study) {
      return NextResponse.json(
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/studies/${studyId}/join?code=${study.inviteCode}`

    return NextResponse.json({
      success: true,
      data: {
        studyId: study.id,
        studyName: study.name,
        inviteCode: study.inviteCode,
        inviteUrl: inviteUrl
      }
    })

  } catch (error) {
    console.error('Get invite code error:', error)
    return NextResponse.json(
      { error: "초대 코드 조회 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

