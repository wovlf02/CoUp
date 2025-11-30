// src/app/api/studies/[id]/leave/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import {
  createStudyErrorResponse,
  logStudyError,
  handlePrismaError
} from '@/lib/exceptions/study-errors'
import { leaveStudy as leaveStudyTransaction } from '@/lib/transaction-helpers'

export async function DELETE(request, { params }) {
  try {
    // 1. 인증 확인
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    // 2. 파라미터 파싱
    const { id: studyId } = await params
    const userId = session.user.id

    // 3. 멤버 확인
    const member = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      }
    })

    if (!member) {
      const errorResponse = createStudyErrorResponse('MEMBER_NOT_FOUND')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 4. OWNER는 탈퇴 불가
    if (member.role === 'OWNER') {
      const errorResponse = createStudyErrorResponse('OWNER_CANNOT_LEAVE')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 5. 트랜잭션으로 탈퇴 처리 (멤버 수 업데이트 포함)
    const result = await leaveStudyTransaction(prisma, studyId, userId)

    if (!result.success) {
      logStudyError('스터디 탈퇴 트랜잭션', new Error(result.error), {
        studyId,
        userId
      })

      const errorResponse = createStudyErrorResponse('STUDY_LEAVE_FAILED', result.error)
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    return NextResponse.json({
      success: true,
      message: "스터디를 탈퇴했습니다"
    })

  } catch (error) {
    // Prisma 에러 처리
    if (error.code?.startsWith('P')) {
      const studyError = handlePrismaError(error)
      return NextResponse.json(studyError, { status: studyError.statusCode })
    }

    // 일반 에러
    logStudyError('스터디 탈퇴', error)
    const errorResponse = createStudyErrorResponse('STUDY_LEAVE_FAILED')
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

