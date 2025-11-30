// src/app/api/studies/[id]/members/[userId]/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import {
  createStudyErrorResponse,
  logStudyError,
  handlePrismaError
} from '@/lib/exceptions/study-errors'
import { canModifyMember } from '@/lib/study-helpers'
import { kickMember as kickMemberTransaction } from '@/lib/transaction-helpers'

// 강퇴
export async function DELETE(request, { params }) {
  try {
    // 1. 파라미터 파싱
    const { id: studyId, userId } = await params

    // 2. ADMIN 권한 확인
    const result = await requireStudyMember(studyId, 'ADMIN')
    if (result instanceof NextResponse) return result

    const { session, membership } = result

    // 3. 자기 자신 강퇴 불가
    if (userId === session.user.id) {
      const errorResponse = createStudyErrorResponse('CANNOT_KICK_SELF')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 4. 대상 멤버 확인
    const targetMember = await prisma.studyMember.findUnique({
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

    if (!targetMember) {
      const errorResponse = createStudyErrorResponse('MEMBER_NOT_FOUND')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 5. OWNER는 강퇴 불가
    if (targetMember.role === 'OWNER') {
      const errorResponse = createStudyErrorResponse('CANNOT_KICK_OWNER')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 6. 역할 계층 검증 - ADMIN이 ADMIN 강퇴 불가
    if (!canModifyMember(membership.role, targetMember.role)) {
      const errorResponse = createStudyErrorResponse('ROLE_HIERARCHY_VIOLATION')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 7. 트랜잭션으로 강퇴 처리 (멤버 수 업데이트 + 알림 포함)
    const kickResult = await kickMemberTransaction(
      prisma,
      studyId,
      userId,
      session.user.id,
      session.user.name
    )

    if (!kickResult.success) {
      logStudyError('멤버 강퇴 트랜잭션', new Error(kickResult.error), {
        studyId,
        targetUserId: userId,
        kickerId: session.user.id
      })

      const errorResponse = createStudyErrorResponse('MEMBER_KICK_FAILED', kickResult.error)
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    return NextResponse.json({
      success: true,
      message: "멤버를 강퇴했습니다"
    })

  } catch (error) {
    // Prisma 에러 처리
    if (error.code?.startsWith('P')) {
      const studyError = handlePrismaError(error)
      return NextResponse.json(studyError, { status: studyError.statusCode })
    }

    // 일반 에러
    logStudyError('멤버 강퇴', error)
    const errorResponse = createStudyErrorResponse('MEMBER_KICK_FAILED')
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

