// src/app/api/studies/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { 
  withStudyErrorHandler, 
  extractStudyContext, 
  createSuccessResponse,
  createPaginatedResponse 
} from '@/lib/utils/study-utils'
import { validateStudyCreate, validatePagination, validateSearchQuery } from '@/lib/validators/study-validators'
import { StudyLogger } from '@/lib/logging/studyLogger'
import { requireAuth } from "@/lib/auth-helpers"
import { StudyValidationException } from '@/lib/exceptions/study'

/**
 * GET /api/studies
 * 스터디 목록 조회
 */
export const GET = withStudyErrorHandler(async (request, context) => {
  const { query } = await extractStudyContext(request, context);

  // 1. 입력 검증
  const { page, limit } = validatePagination(query);
  const { category, search, isRecruiting, sortBy } = validateSearchQuery(query);

  const skip = (page - 1) * limit;

  // 2. where 조건 생성
  const whereClause = {};

  // 기본적으로 공개 스터디만 표시
  const isPublic = query.isPublic;
  if (isPublic !== 'false') {
    whereClause.isPublic = true;
  }

  if (category && category !== 'all') {
    whereClause.category = category;
  }

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } }
    ];
  }

  if (isRecruiting === 'true') {
    whereClause.isRecruiting = true;
  }

  // 3. 정렬 조건
  let orderBy;
  switch (sortBy) {
    case 'popular':
    case 'memberCount':
      orderBy = { members: { _count: 'desc' } };
      break;
    case 'rating':
      orderBy = { rating: 'desc' };
      break;
    case 'name':
      orderBy = { name: 'asc' };
      break;
    case 'latest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  // 4. 비즈니스 로직 - 데이터 조회
  const [total, studies] = await Promise.all([
    prisma.study.count({ where: whereClause }),
    prisma.study.findMany({
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
  ]);

  // 5. 응답 데이터 포맷팅
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
  }));

  // 6. 로깅
  StudyLogger.logStudyList({
    total,
    page,
    limit,
    filters: { category, search, isRecruiting, sortBy }
  });

  // 7. 응답
  return createPaginatedResponse(formattedStudies, total, page, limit);
});

/**
 * POST /api/studies
 * 스터디 생성
 */
export const POST = withStudyErrorHandler(async (request, context) => {
  const { body, userId } = await extractStudyContext(request, context);

  // 1. 인증 확인
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  // 2. 입력 검증
  const validated = validateStudyCreate(body, userId || session.user.id);

  // 3. 이름 중복 확인
  const existingStudy = await prisma.study.findFirst({
    where: { 
      name: validated.name,
      ownerId: session.user.id 
    }
  });

  if (existingStudy) {
    throw StudyValidationException.duplicateStudyName(validated.name);
  }

  // 4. 비즈니스 로직 - 트랜잭션으로 스터디 + 멤버 생성
  const result = await prisma.$transaction(async (tx) => {
    // 스터디 생성
    const study = await tx.study.create({
      data: {
        ...validated,
        ownerId: session.user.id
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // OWNER 멤버 생성
    await tx.studyMember.create({
      data: {
        studyId: study.id,
        userId: session.user.id,
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: new Date()
      }
    });

    return study;
  });

  // 5. 로깅
  StudyLogger.logStudyCreate(result.id, session.user.id, validated);

  // 6. 응답
  return createSuccessResponse(result, '스터디가 생성되었습니다', 201);
});
