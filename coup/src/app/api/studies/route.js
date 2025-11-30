// src/app/api/studies/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  createStudyErrorResponse,
  logStudyError,
  handlePrismaError
} from '@/lib/exceptions/study-errors'
import { validateStudyCreate } from '@/lib/validators/study-validation'
import { isDuplicateStudyName } from '@/lib/study-helpers'
import { createStudyWithOwner } from '@/lib/transaction-helpers'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    // 1. 페이지네이션 파라미터 검증 (범위 확인 강화)
    const pageParam = searchParams.get('page') || '1'
    const limitParam = searchParams.get('limit') || '12'

    const page = parseInt(pageParam)
    const limit = parseInt(limitParam)

    // 페이지네이션 범위 검증
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        {
          success: false,
          error: '페이지 번호는 1 이상이어야 합니다',
          details: { page: pageParam }
        },
        { status: 400 }
      )
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: '페이지 크기는 1-100 사이여야 합니다',
          details: { limit: limitParam }
        },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    // 2. 필터 파라미터
    const category = searchParams.get('category')
    const searchRaw = searchParams.get('search')
    const isRecruiting = searchParams.get('isRecruiting')
    const sortBy = searchParams.get('sortBy') || 'latest'

    // 3. 검색어 sanitization 및 검증
    let sanitizedSearch = null
    if (searchRaw) {
      // 특수문자 제거 (SQL Injection 방어 - Prisma ORM이 방어하지만 추가 안전장치)
      sanitizedSearch = searchRaw.replace(/[^\w\sㄱ-ㅎ가-힣]/g, '').trim()

      // 검색어 길이 검증
      if (sanitizedSearch.length < 2) {
        return NextResponse.json(
          {
            success: false,
            error: '검색어는 최소 2자 이상이어야 합니다',
            details: { search: searchRaw, length: sanitizedSearch.length }
          },
          { status: 400 }
        )
      }

      if (sanitizedSearch.length > 100) {
        return NextResponse.json(
          {
            success: false,
            error: '검색어는 최대 100자까지 가능합니다',
            details: { search: searchRaw, length: sanitizedSearch.length }
          },
          { status: 400 }
        )
      }
    }

    // 4. 정렬 파라미터 검증
    const allowedSortBy = ['latest', 'popular', 'rating', 'name', 'memberCount']
    if (!allowedSortBy.includes(sortBy)) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 정렬 방식입니다',
          details: {
            sortBy,
            allowedValues: allowedSortBy
          }
        },
        { status: 400 }
      )
    }

    // where 조건 생성
    const whereClause = {}

    // 기본적으로 공개 스터디만 표시하지만, 파라미터로 변경 가능
    const isPublic = searchParams.get('isPublic')
    if (isPublic !== 'false') {
      whereClause.isPublic = true
    }

    if (category && category !== 'all') {
      whereClause.category = category
    }

    // sanitized 검색어 사용
    if (sanitizedSearch) {
      whereClause.OR = [
        { name: { contains: sanitizedSearch, mode: 'insensitive' } },
        { description: { contains: sanitizedSearch, mode: 'insensitive' } },
        { tags: { has: sanitizedSearch } }
      ]
    }

    if (isRecruiting === 'true') {
      whereClause.isRecruiting = true
    }

    // 정렬 조건
    let orderBy
    switch (sortBy) {
      case 'popular':
      case 'memberCount':
        orderBy = { members: { _count: 'desc' } }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'name':
        orderBy = { name: 'asc' }
        break
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // 총 개수
    const total = await prisma.study.count({ where: whereClause })

    // 5. 검색 결과 없음 처리
    if (total === 0 && (sanitizedSearch || category)) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        },
        message: sanitizedSearch
          ? `'${sanitizedSearch}'에 대한 검색 결과가 없습니다`
          : '해당 조건에 맞는 스터디가 없습니다',
        filters: {
          search: sanitizedSearch,
          category,
          isRecruiting,
          sortBy
        }
      })
    }

    // 스터디 목록 조회
    const studies = await prisma.study.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })

    // 응답 데이터 포맷팅
    const formattedStudies = studies.map(study => ({
      id: study.id,
      name: study.name,
      emoji: study.emoji,
      description: study.description,
      category: study.category,
      subCategory: study.subCategory,
      tags: study.tags,
      maxMembers: study.maxMembers,
      currentMembers: study._count.members,
      isRecruiting: study.isRecruiting,
      rating: study.rating,
      reviewCount: study.reviewCount,
      owner: study.owner,
      createdAt: study.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: formattedStudies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    // Prisma 에러 처리
    if (error.code?.startsWith('P')) {
      const studyError = handlePrismaError(error)
      return NextResponse.json(studyError, { status: studyError.statusCode })
    }

    // 일반 에러
    logStudyError('스터디 목록 조회', error)
    const errorResponse = createStudyErrorResponse('STUDY_LIST_FAILED')
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

export async function POST(request) {
  try {
    // 1. 인증 확인
    const { requireAuth } = await import("@/lib/auth-helpers")
    const session = await requireAuth()

    if (session instanceof NextResponse) return session

    // 2. 요청 데이터 파싱
    const data = await request.json()

    // 3. 필드 검증 강화
    const validation = validateStudyCreate(data)
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

    // 4. 이름 중복 확인
    const isDuplicate = await isDuplicateStudyName(prisma, validation.data.name)
    if (isDuplicate) {
      const errorResponse = createStudyErrorResponse('DUPLICATE_STUDY_NAME')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 5. 트랜잭션으로 스터디 생성 + OWNER 멤버 생성
    const result = await createStudyWithOwner(prisma, session.user.id, validation.data)

    if (!result.success) {
      logStudyError('스터디 생성 트랜잭션', new Error(result.error), {
        userId: session.user.id,
        studyData: validation.data
      })

      const errorResponse = createStudyErrorResponse('STUDY_CREATE_FAILED', result.error)
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    return NextResponse.json({
      success: true,
      message: "스터디가 생성되었습니다",
      data: result.study
    }, { status: 201 })

  } catch (error) {
    // Prisma 에러 처리
    if (error.code?.startsWith('P')) {
      const studyError = handlePrismaError(error)
      return NextResponse.json(studyError, { status: studyError.statusCode })
    }

    // 일반 에러
    logStudyError('스터디 생성', error)
    const errorResponse = createStudyErrorResponse('STUDY_CREATE_FAILED')
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}
