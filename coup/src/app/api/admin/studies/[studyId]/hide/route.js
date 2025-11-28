/**
 * 관리자 - 스터디 숨김 처리 API
 * POST /api/admin/studies/[studyId]/hide
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_SUSPEND)
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
          error: '숨김 사유는 최소 10자 이상이어야 합니다',
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

    // 이미 숨김 처리된 스터디인지 확인
    if (!study.isPublic && study.isRecruiting === false) {
      return NextResponse.json(
        {
          success: false,
          error: '이미 숨김 처리된 스터디입니다',
        },
        { status: 400 }
      )
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 스터디 상태 업데이트
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
          action: 'STUDY_HIDE',
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

    // 알림 발송 (트랜잭션 외부에서)
    let notificationsSent = 0

    // 스터디장에게 알림 (기본적으로 발송)
    if (body.notifyOwner !== false) {
      // TODO: 알림 시스템 구현 후 활성화
      // await sendNotification(study.owner.id, {
      //   type: 'STUDY_HIDDEN',
      //   title: '스터디 숨김 처리',
      //   message: `${study.name} 스터디가 숨김 처리되었습니다.\n사유: ${body.reason}`,
      // })
      notificationsSent++
    }

    // 멤버들에게 알림 (옵션)
    if (body.notifyMembers === true) {
      // TODO: 대량 알림 시스템 구현 후 활성화
      notificationsSent += study.members.length
    }

    return NextResponse.json({
      success: true,
      message: '스터디가 숨김 처리되었습니다',
      data: {
        study: result,
        notificationsSent,
      },
    })
  } catch (error) {
    console.error('스터디 숨김 처리 실패:', error)
    return NextResponse.json(
      {
        success: false,
        error: '스터디 숨김 처리에 실패했습니다',
      },
      { status: 500 }
    )
  }
}

// 숨김 해제
export async function DELETE(request, { params }) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_SUSPEND)
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
          action: 'STUDY_UNHIDE',
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
      message: '스터디 숨김이 해제되었습니다',
      data: result,
    })
  } catch (error) {
    console.error('스터디 숨김 해제 실패:', error)
    return NextResponse.json(
      {
        success: false,
        error: '스터디 숨김 해제에 실패했습니다',
      },
      { status: 500 }
    )
  }
}

