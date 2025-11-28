/**
 * 관리자 - 스터디 삭제 API
 * DELETE /api/admin/studies/[studyId]/delete
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function DELETE(request, { params }) {
  // 권한 확인 (삭제는 최고 권한 필요)
  const auth = await requireAdmin(request, PERMISSIONS.USER_DELETE)
  if (auth instanceof NextResponse) return auth

  const { adminRole } = auth

  try {
    const { studyId } = params
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason')

    // 유효성 검사
    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: '삭제 사유는 최소 10자 이상이어야 합니다',
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
        },
        _count: {
          select: {
            messages: true,
            files: true,
            notices: true,
            events: true,
            tasks: true,
          },
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

    // 삭제 전 로그 저장
    const studySnapshot = {
      id: study.id,
      name: study.name,
      ownerId: study.ownerId,
      ownerEmail: study.owner.email,
      memberCount: study.members.length,
      stats: study._count,
      createdAt: study.createdAt,
    }

    // 트랜잭션으로 처리
    await prisma.$transaction(async (tx) => {
      // 관리자 로그 기록 (삭제 전에 기록)
      await tx.adminLog.create({
        data: {
          adminId: adminRole.userId,
          action: 'STUDY_DELETE',
          targetType: 'Study',
          targetId: studyId,
          reason,
          metadata: {
            ...studySnapshot,
            deletedBy: adminRole.userId,
            deletedAt: new Date(),
          },
        },
      })

      // 스터디 삭제 (CASCADE로 관련 데이터 자동 삭제)
      await tx.study.delete({
        where: { id: studyId },
      })
    })

    return NextResponse.json({
      success: true,
      message: '스터디가 삭제되었습니다',
      data: {
        deletedStudy: studySnapshot,
      },
    })
  } catch (error) {
    console.error('스터디 삭제 실패:', error)
    return NextResponse.json(
      {
        success: false,
        error: '스터디 삭제에 실패했습니다',
      },
      { status: 500 }
    )
  }
}

