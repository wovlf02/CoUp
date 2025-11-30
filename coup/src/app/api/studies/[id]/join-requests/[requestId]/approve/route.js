// src/app/api/studies/[id]/join-requests/[requestId]/approve/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import {
  createStudyErrorResponse,
  logStudyError,
  handlePrismaError
} from '@/lib/exceptions/study-errors'
import { checkStudyCapacity } from '@/lib/study-helpers'
import { approveJoinRequest as approveJoinRequestTransaction } from '@/lib/transaction-helpers'

export async function POST(request, { params }) {
  try {
    // 1. 파라미터 파싱
    const { id: studyId, requestId } = await params

    // 2. ADMIN 권한 확인
    const result = await requireStudyMember(studyId, 'ADMIN')
    if (result instanceof NextResponse) return result

    const { session } = result

    // 3. 가입 신청 확인
    const joinRequest = await prisma.studyMember.findFirst({
      where: {
        id: requestId,
        studyId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        study: {
          select: {
            name: true
          }
        }
      }
    })

    if (!joinRequest) {
      const errorResponse = createStudyErrorResponse('JOIN_REQUEST_NOT_FOUND')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 4. 정원 재확인 (승인 사이에 정원이 찰 수 있음)
    const capacity = await checkStudyCapacity(prisma, studyId)
    if (!capacity.hasCapacity) {
      const errorResponse = createStudyErrorResponse('STUDY_FULL')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 5. 트랜잭션으로 승인 처리 (상태 변경 + 멤버 수 업데이트 + 알림)
    const approveResult = await approveJoinRequestTransaction(
      prisma,
      requestId,
      studyId,
      joinRequest.userId,
      session.user.id,
      session.user.name
    )

    if (!approveResult.success) {
      logStudyError('가입 승인 트랜잭션', new Error(approveResult.error), {
        studyId,
        requestId,
        approverId: session.user.id
      })

      const errorResponse = createStudyErrorResponse('JOIN_APPROVE_FAILED', approveResult.error)
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    return NextResponse.json({
      success: true,
      message: "가입이 승인되었습니다",
      data: approveResult.member
    })

  } catch (error) {
    // Prisma 에러 처리
    if (error.code?.startsWith('P')) {
      const studyError = handlePrismaError(error)
      return NextResponse.json(studyError, { status: studyError.statusCode })
    }

    // 일반 에러
    logStudyError('가입 승인', error)
    const errorResponse = createStudyErrorResponse('JOIN_APPROVE_FAILED')
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

