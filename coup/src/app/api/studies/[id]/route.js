// src/app/api/studies/[id]/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import {
  createStudyErrorResponse,
  logStudyError,
  handlePrismaError
} from '@/lib/exceptions/study-errors'
import { validateStudyUpdate } from '@/lib/validators/study-validation'
import { isDuplicateStudyName } from '@/lib/study-helpers'
import { deleteStudyWithCleanup } from '@/lib/transaction-helpers'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    // 스터디 조회
    const study = await prisma.study.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        members: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            },
            notices: true,
            files: true
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

    // 세션 확인 (선택)
    const session = await requireAuth()
    const isAuthenticated = !(session instanceof NextResponse)

    let isMember = false
    let myMembership = null

    if (isAuthenticated) {
      const membership = await prisma.studyMember.findUnique({
        where: {
          studyId_userId: {
            studyId: id,
            userId: session.user.id
          }
        }
      })

      if (membership) {
        isMember = membership.status === 'ACTIVE'
        myMembership = membership
      }
    }

    // 응답 데이터 (멤버가 아니면 제한된 정보만)
    const responseData = {
      id: study.id,
      name: study.name,
      emoji: study.emoji,
      description: study.description,
      category: study.category,
      subCategory: study.subCategory,
      tags: study.tags,
      maxMembers: study.maxMembers,
      currentMembers: study._count.members,
      isPublic: study.isPublic,
      isRecruiting: study.isRecruiting,
      rating: study.rating,
      reviewCount: study.reviewCount,
      owner: study.owner,
      createdAt: study.createdAt,
      isMember,
      myRole: myMembership?.role || null,
      // 멤버만 볼 수 있는 정보
      ...(isMember && {
        inviteCode: study.inviteCode,
        autoApprove: study.autoApprove,
        members: study.members.map(m => ({
          id: m.id,
          role: m.role,
          user: m.user,
          joinedAt: m.joinedAt
        })),
        counts: {
          notices: study._count.notices,
          files: study._count.files
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    // Prisma 에러 처리
    if (error.code?.startsWith('P')) {
      const studyError = handlePrismaError(error)
      return NextResponse.json(studyError, { status: studyError.statusCode })
    }

    // 일반 에러
    logStudyError('스터디 상세 조회', error)
    const errorResponse = createStudyErrorResponse('STUDY_NOT_FOUND')
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

export async function PATCH(request, { params }) {
  try {
    // 1. 인증 확인
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    // 2. 파라미터 파싱
    const { id } = await params
    const body = await request.json()

    // 3. 스터디 존재 및 소유자 확인
    const study = await prisma.study.findUnique({
      where: { id }
    })

    if (!study) {
      const errorResponse = createStudyErrorResponse('STUDY_NOT_FOUND')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    if (study.ownerId !== session.user.id) {
      const errorResponse = createStudyErrorResponse('STUDY_OWNER_ONLY')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 4. 필드 검증 강화
    const validation = validateStudyUpdate(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          errors: validation.errors
        },
        { status: 400 }
      )
    }

    // 5. 이름 중복 확인 (이름이 변경되는 경우)
    if (validation.data.name && validation.data.name !== study.name) {
      const isDuplicate = await isDuplicateStudyName(prisma, validation.data.name, id)
      if (isDuplicate) {
        const errorResponse = createStudyErrorResponse('DUPLICATE_STUDY_NAME')
        return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
      }
    }

    // 6. 스터디 수정
    const updated = await prisma.study.update({
      where: { id },
      data: validation.data
    })

    return NextResponse.json({
      success: true,
      message: "스터디 정보가 수정되었습니다",
      data: updated
    })

  } catch (error) {
    // Prisma 에러 처리
    if (error.code?.startsWith('P')) {
      const studyError = handlePrismaError(error)
      return NextResponse.json(studyError, { status: studyError.statusCode })
    }

    // 일반 에러
    logStudyError('스터디 수정', error)
    const errorResponse = createStudyErrorResponse('STUDY_UPDATE_FAILED')
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

export async function DELETE(request, { params }) {
  try {
    // 1. 인증 확인
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    // 2. 파라미터 파싱
    const { id } = await params

    // 3. 스터디 존재 및 소유자 확인
    const study = await prisma.study.findUnique({
      where: { id }
    })

    if (!study) {
      const errorResponse = createStudyErrorResponse('STUDY_NOT_FOUND')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    if (study.ownerId !== session.user.id) {
      const errorResponse = createStudyErrorResponse('STUDY_OWNER_ONLY')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 4. 트랜잭션으로 스터디 및 관련 데이터 삭제
    const result = await deleteStudyWithCleanup(prisma, id)

    if (!result.success) {
      logStudyError('스터디 삭제 트랜잭션', new Error(result.error), {
        studyId: id,
        userId: session.user.id
      })

      const errorResponse = createStudyErrorResponse('STUDY_DELETE_FAILED', result.error)
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    return NextResponse.json({
      success: true,
      message: "스터디가 삭제되었습니다"
    })

  } catch (error) {
    // Prisma 에러 처리
    if (error.code?.startsWith('P')) {
      const studyError = handlePrismaError(error)
      return NextResponse.json(studyError, { status: studyError.statusCode })
    }

    // 일반 에러
    logStudyError('스터디 삭제', error)
    const errorResponse = createStudyErrorResponse('STUDY_DELETE_FAILED')
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

