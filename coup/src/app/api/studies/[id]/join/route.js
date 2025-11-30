// src/app/api/studies/[id]/join/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import {
  createStudyErrorResponse,
  logStudyError,
  handlePrismaError
} from '@/lib/exceptions/study-errors'
import { checkStudyCapacity, canRejoinStudy } from '@/lib/study-helpers'
import { createTemplatedNotification } from '@/lib/notification-helpers'

export async function POST(request, { params }) {
  try {
    // 1. 인증 확인
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    // 2. 파라미터 파싱
    const { id: studyId } = await params
    const body = await request.json()
    const { introduction, motivation, level } = body
    const userId = session.user.id

    // 3. 스터디 확인
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
      const errorResponse = createStudyErrorResponse('STUDY_NOT_FOUND')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 4. 모집 중인지 확인
    if (!study.isRecruiting) {
      const errorResponse = createStudyErrorResponse('STUDY_NOT_RECRUITING')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 5. 정원 확인 (헬퍼 함수 사용)
    const capacity = await checkStudyCapacity(prisma, studyId)
    if (!capacity.hasCapacity) {
      const errorResponse = createStudyErrorResponse('STUDY_FULL')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 6. 중복 가입 및 멤버 상태 확인
    const existingMember = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      }
    })

    if (existingMember) {
      // 6.1 이미 활성 멤버
      if (existingMember.status === 'ACTIVE') {
        const errorResponse = createStudyErrorResponse('ALREADY_JOINED')
        return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
      }

      // 6.2 가입 대기 중
      if (existingMember.status === 'PENDING') {
        const errorResponse = createStudyErrorResponse('JOIN_REQUEST_PENDING')
        return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
      }

      // 6.3 강퇴된 멤버 - 재가입 불가
      if (existingMember.status === 'KICKED') {
        const errorResponse = createStudyErrorResponse('MEMBER_KICKED')
        return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
      }

      // 6.4 탈퇴한 멤버 - 재가입 가능 여부 확인
      if (existingMember.status === 'LEFT') {
        const canRejoin = await canRejoinStudy(prisma, studyId, userId)
        if (!canRejoin.allowed) {
          return NextResponse.json(
            {
              success: false,
              error: canRejoin.reason,
              code: 'REJOIN_NOT_ALLOWED'
            },
            { status: 400 }
          )
        }

        // 재가입 - 기존 멤버 업데이트
        const status = study.autoApprove ? 'ACTIVE' : 'PENDING'
        const approvedAt = study.autoApprove ? new Date() : null

        const updatedMember = await prisma.studyMember.update({
          where: {
            studyId_userId: {
              studyId,
              userId
            }
          },
          data: {
            status,
            role: 'MEMBER',
            introduction,
            motivation,
            level,
            approvedAt,
            joinedAt: new Date()
          }
        })

        // 자동 승인 알림
        if (study.autoApprove) {
          try {
            await createTemplatedNotification(prisma, {
              userId,
              type: 'STUDY_JOIN_APPROVED',
              studyId,
              studyName: study.name
            })
          } catch (notifError) {
            logStudyError('재가입 알림 생성', notifError, { studyId, userId })
          }
        }

        return NextResponse.json({
          success: true,
          message: study.autoApprove
            ? "스터디에 다시 가입되었습니다"
            : "재가입 신청이 완료되었습니다. 승인을 기다려주세요",
          data: updatedMember
        }, { status: 201 })
      }
    }

    // 7. 자동 승인 여부에 따라 상태 결정
    const status = study.autoApprove ? 'ACTIVE' : 'PENDING'
    const approvedAt = study.autoApprove ? new Date() : null

    // 8. 멤버 생성
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

    // 9. 알림 생성 (에러 발생 시에도 가입은 성공)
    try {
      if (study.autoApprove) {
        // 자동 승인 - 본인에게 알림
        await createTemplatedNotification(prisma, {
          userId,
          type: 'STUDY_JOIN_APPROVED',
          studyId,
          studyName: study.name
        })
      } else {
        // 수동 승인 - 관리자들에게 알림
        const admins = await prisma.studyMember.findMany({
          where: {
            studyId,
            status: 'ACTIVE',
            role: { in: ['OWNER', 'ADMIN'] }
          },
          select: { userId: true }
        })

        for (const admin of admins) {
          await createTemplatedNotification(prisma, {
            userId: admin.userId,
            type: 'STUDY_JOIN_REQUEST',
            studyId,
            studyName: study.name,
            actorName: session.user.name
          })
        }
      }
    } catch (notifError) {
      // 알림 생성 실패는 로그만 남기고 계속 진행
      logStudyError('가입 알림 생성', notifError, { studyId, userId })
    }

    return NextResponse.json({
      success: true,
      message: study.autoApprove
        ? "스터디에 가입되었습니다"
        : "가입 신청이 완료되었습니다. 승인을 기다려주세요",
      data: member
    }, { status: 201 })

  } catch (error) {
    // Prisma 에러 처리
    if (error.code?.startsWith('P')) {
      const studyError = handlePrismaError(error)
      return NextResponse.json(studyError, { status: studyError.statusCode })
    }

    // 일반 에러
    logStudyError('스터디 가입', error)
    const errorResponse = createStudyErrorResponse('JOIN_REQUEST_FAILED')
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

