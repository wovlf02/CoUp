/**
 * 관리자 - 스터디 강제 종료 API
 * POST /api/admin/studies/[studyId]/close
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_DELETE)
  if (auth instanceof NextResponse) return auth

  const { adminRole } = auth

  try {
    const { studyId } = params
    const body = await request.json()

    // 유효성 검사
    if (!body.reason || body.reason.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: '종료 사유는 최소 10자 이상이어야 합니다',
        },
        { status: 400 }
      )
    }

    // 스터디 존재 확인
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        owner: true,
        members: {
          where: { status: 'ACTIVE' },
          include: { user: true },
        },
      },
    })

    if (!study) {
      return NextResponse.json(
        {
          success: false,
          error: '스터디를 찾을 수 없습니다',
        },
        { status: 404 }
      )
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 스터디 상태 업데이트 (읽기 전용 상태)
      const updatedStudy = await tx.study.update({
        where: { id: studyId },
        data: {
          isPublic: false,
          isRecruiting: false,
        },
      })

      // 관리자 로그 기록
      await tx.adminLog.create({
        data: {
          adminId: adminRole.userId,
          action: 'STUDY_CLOSE',
          targetType: 'Study',
          targetId: studyId,
          reason: body.reason,
          metadata: {
            studyName: study.name,
            ownerId: study.ownerId,
            memberCount: study.members.length,
            notifyOwner: body.notifyOwner !== false,
            notifyMembers: body.notifyMembers === true,
          },
        },
      })

      return updatedStudy
    })

    // 알림 발송
    let notificationsSent = 0

    // 스터디장에게 알림
    if (body.notifyOwner !== false) {
      // TODO: 알림 시스템 구현
      notificationsSent++
    }

    // 멤버들에게 알림
    if (body.notifyMembers === true) {
      notificationsSent += study.members.length
    }

    return NextResponse.json({
      success: true,
      message: '스터디가 종료되었습니다',
      data: {
        study: result,
        notificationsSent,
      },
    })
  } catch (error) {
    console.error('스터디 종료 실패:', error)
    return NextResponse.json(
      {
        success: false,
        error: '스터디 종료에 실패했습니다',
      },
      { status: 500 }
    )
  }
}

// 종료 해제 (재개)
export async function DELETE(request, { params }) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_DELETE)
  if (auth instanceof NextResponse) return auth

  const { adminRole } = auth

  try {
    const { studyId } = params

    // 스터디 존재 확인
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: { owner: true },
    })

    if (!study) {
      return NextResponse.json(
        {
          success: false,
          error: '스터디를 찾을 수 없습니다',
        },
        { status: 404 }
      )
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 스터디 상태 복구
      const updatedStudy = await tx.study.update({
        where: { id: studyId },
        data: {
          isPublic: true,
          isRecruiting: true,
        },
      })

      // 관리자 로그 기록
      await tx.adminLog.create({
        data: {
          adminId: adminRole.userId,
          action: 'STUDY_REOPEN',
          targetType: 'Study',
          targetId: studyId,
          metadata: {
            studyName: study.name,
            ownerId: study.ownerId,
          },
        },
      })

      return updatedStudy
    })

    return NextResponse.json({
      success: true,
      message: '스터디가 재개되었습니다',
      data: result,
    })
  } catch (error) {
    console.error('스터디 재개 실패:', error)
    return NextResponse.json(
      {
        success: false,
        error: '스터디 재개에 실패했습니다',
      },
      { status: 500 }
    )
  }
}

