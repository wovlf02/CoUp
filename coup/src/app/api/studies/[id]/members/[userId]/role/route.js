// src/app/api/studies/[id]/members/[userId]/role/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import {
  createStudyErrorResponse,
  logStudyError,
  handlePrismaError,
  VALID_ROLES
} from '@/lib/exceptions/study-errors'
import { validateRoleChange } from '@/lib/validators/study-validation'
import { canChangeRole } from '@/lib/study-helpers'
import { createTemplatedNotification } from '@/lib/notification-helpers'
import {
  createStudyErrorResponse,
  try {
    // 1. 파라미터 파싱
    const { id: studyId, userId } = await params
  handlePrismaError
    // 2. OWNER 권한 확인
    const result = await requireStudyMember(studyId, 'OWNER')
    if (result instanceof NextResponse) return result
import { createTemplatedNotification } from '@/lib/notification-helpers'
    // session 사용 (알림 등에 필요할 수 있음)
    // const { session } = result

    // 3. 요청 본문 파싱
export async function PATCH(request, { params }) {
  try {
    // 1. 파라미터 파싱
    // 4. 역할 검증
    const validation = validateRoleChange({ role })
    if (!validation.success) {

        {
          success: false,
          error: validation.error,
          errors: validation.errors
        },
    const result = await requireStudyMember(studyId, 'OWNER')
    if (result instanceof NextResponse) return result

    const { session } = result
    // 5. 대상 멤버 확인
    // 3. 요청 본문 파싱
    const body = await request.json()
    const { role } = body

    // 4. 역할 검증
    const validation = validateRoleChange({ role })
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        study: {
          select: {
            name: true
          }
        }
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
      const errorResponse = createStudyErrorResponse('MEMBER_NOT_FOUND')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
      )
    }
    // 6. OWNER 역할 변경 불가

      const errorResponse = createStudyErrorResponse('CANNOT_CHANGE_OWNER_ROLE')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 7. 이미 같은 역할인 경우
    if (member.role === role) {
      return NextResponse.json({
        success: true,
        message: "이미 해당 역할입니다",
        data: member
      })
          studyId,
          userId
    // 8. 역할 변경
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        study: {
          select: {
            name: true
    // 9. 알림 생성 (에러 발생 시에도 변경은 성공)
    try {
      await createTemplatedNotification(prisma, {
        userId,
        type: 'STUDY_ROLE_CHANGED',
        studyId,
        studyName: member.study.name,
        metadata: { newRole: role }
      })
    } catch (notifError) {
      logStudyError('역할 변경 알림 생성', notifError, { studyId, userId, role })
    }

          }
        }
      }
    })

    if (!member) {
      const errorResponse = createStudyErrorResponse('MEMBER_NOT_FOUND')
    // Prisma 에러 처리
    if (error.code?.startsWith('P')) {
      const studyError = handlePrismaError(error)
      return NextResponse.json(studyError, { status: studyError.statusCode })
    }

    // 일반 에러
    logStudyError('역할 변경', error)
    const errorResponse = createStudyErrorResponse('ROLE_CHANGE_FAILED')
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
      const errorResponse = createStudyErrorResponse('CANNOT_CHANGE_OWNER_ROLE')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 7. 이미 같은 역할인 경우
    if (member.role === role) {
      return NextResponse.json({
        success: true,
        message: "이미 해당 역할입니다",
        data: member
      })
    }

    // 8. 역할 변경
    const updated = await prisma.studyMember.update({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      },
      data: { role }
    })

    // 9. 알림 생성 (에러 발생 시에도 변경은 성공)
    try {
      await createTemplatedNotification(prisma, {
        userId,
        type: 'STUDY_ROLE_CHANGED',
        studyId,
        studyName: member.study.name,
        metadata: { newRole: role }
      })
    } catch (notifError) {
      logStudyError('역할 변경 알림 생성', notifError, { studyId, userId, role })
    }

    return NextResponse.json({
      success: true,
      message: "역할이 변경되었습니다",
      data: updated
    })

  } catch (error) {
    // Prisma 에러 처리
    if (error.code?.startsWith('P')) {
      const studyError = handlePrismaError(error)
      return NextResponse.json(studyError, { status: studyError.statusCode })
    }

    // 일반 에러
    logStudyError('역할 변경', error)
    const errorResponse = createStudyErrorResponse('ROLE_CHANGE_FAILED')
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

