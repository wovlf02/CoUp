# CoUp 예외 처리 구현 Step 6 프롬프트

**작업**: my-studies Phase 2 - API 강화  
**날짜**: 2025-12-01  
**예상 소요**: 8시간  
**현재 진행률**: 73.3% (33h/45h)

---

## ✅ 이전 완료

- Step 1 (문서 구조 생성) ✅
- Step 2 (study 영역 완료) ✅ - 126개 예외 처리
- Step 3 (dashboard 분석 및 구현) ✅
  - Phase 1: 유틸리티 (106개)
  - Phase 2~5: 전체 구현
  - **총 성과**: 30개 파일, 4,736줄, 100% 완료
- **Step 4 (my-studies 분석) ✅**
  - 영역 구조 파악 (13개 페이지, 2개 API)
  - 예외 문서 검토 (12개 문서, ~120개 예외)
  - 구현 계획 수립 (32시간 예상)
- **Step 5 (my-studies Phase 1) ✅**
  - my-studies-errors.js (62개 에러 코드) ✅
  - my-studies-validation.js (11개 함수) ✅
  - my-studies-helpers.js (15개 함수) ✅
  - **총 88개 함수, ~1,800줄, 3시간 소요**

---

## 🎯 Step 6: my-studies Phase 2 - API 강화

### 목표

기존 my-studies API에 예외 처리를 강화하여 안정성과 사용자 경험을 개선합니다.

### 작업 범위

#### 2.1 목록 API 개선 (3시간)

**파일**: `coup/src/app/api/my-studies/route.js`

**현재 문제점**:
- 타임아웃 처리 없음 (응답 시간 제한 없음)
- 삭제된 스터디 필터링 누락
- 에러 메시지 영어
- 로깅 부족
- 입력값 검증 미흡

**구현 내용**:

```javascript
import { MY_STUDIES_ERRORS, createMyStudiesError, logMyStudiesError, handlePrismaError } from '@/lib/exceptions/my-studies-errors'
import { validateFilter, validatePagination } from '@/lib/validators/my-studies-validation'
import { getFilteredStudies } from '@/lib/my-studies-helpers'

export async function GET(request) {
  const startTime = Date.now()
  
  try {
    // 1. 타임아웃 설정 (10초)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    // 2. 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      const error = createMyStudiesError('UNAUTHORIZED')
      return NextResponse.json(error, { status: error.statusCode })
    }
    
    // 3. 쿼리 파라미터 검증
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '1000')
    
    // 필터 검증
    const filterValidation = validateFilter(filter)
    if (!filterValidation.valid) {
      const error = createMyStudiesError('INVALID_FILTER', filterValidation.error)
      return NextResponse.json(error, { status: error.statusCode })
    }
    
    // 페이지네이션 검증
    const paginationValidation = validatePagination({ page, limit })
    if (!paginationValidation.valid) {
      const error = createMyStudiesError('INVALID_REQUEST', paginationValidation.error)
      return NextResponse.json(error, { status: error.statusCode })
    }
    
    // 4. DB 쿼리 (삭제된 스터디 제외)
    const userId = parseInt(session.user.id)
    const studyMembers = await prisma.studyMember.findMany({
      where: {
        userId,
        study: {
          deletedAt: null  // 삭제된 스터디 제외
        }
      },
      include: {
        study: {
          include: {
            _count: {
              select: {
                members: true
              }
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })
    
    clearTimeout(timeoutId)
    
    // 5. 필터링 (안전)
    const filtered = getFilteredStudies(studyMembers, filter)
    
    // 6. 응답
    const duration = Date.now() - startTime
    
    // 로깅
    logMyStudiesInfo('스터디 목록 로드 성공', {
      userId,
      filter,
      count: filtered.length,
      duration: `${duration}ms`
    })
    
    return NextResponse.json({
      success: true,
      data: {
        studies: filtered,
        count: filtered.length,
        filter
      },
      meta: {
        duration,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    // Prisma 에러 변환
    if (error.code?.startsWith('P')) {
      const prismaError = handlePrismaError(error)
      logMyStudiesError('스터디 목록 로드 실패 (Prisma)', error, {
        userId: session?.user?.id,
        prismaCode: error.code
      })
      return NextResponse.json(prismaError, { status: prismaError.statusCode })
    }
    
    // 타임아웃
    if (error.name === 'AbortError') {
      const timeoutError = createMyStudiesError('TIMEOUT')
      logMyStudiesError('스터디 목록 로드 타임아웃', error, {
        userId: session?.user?.id
      })
      return NextResponse.json(timeoutError, { status: timeoutError.statusCode })
    }
    
    // 일반 에러
    logMyStudiesError('스터디 목록 로드 실패', error, {
      userId: session?.user?.id
    })
    
    const genericError = createMyStudiesError('STUDIES_LOAD_FAILED')
    return NextResponse.json(genericError, { status: genericError.statusCode })
  }
}
```

**개선 사항**:
1. 타임아웃 10초 설정
2. 삭제된 스터디 필터링
3. 입력값 검증 (filter, page, limit)
4. 에러 메시지 한글화
5. 구조화된 로깅
6. 성능 측정 (duration)

---

#### 2.2 스터디 상세 API 개선 (3시간)

**파일**: `coup/src/app/api/studies/[id]/route.js` (GET 메서드만)

**현재 문제점**:
- 권한 검증 미흡 (PENDING 상태 미처리)
- 삭제된 스터디 확인 없음
- 에러 메시지 불친절

**구현 내용**:

```javascript
// GET /api/studies/[id] - 스터디 상세 조회
export async function GET(request, { params }) {
  try {
    // 1. 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      const error = createMyStudiesError('UNAUTHORIZED')
      return NextResponse.json(error, { status: error.statusCode })
    }
    
    // 2. studyId 검증
    const studyIdValidation = validateStudyId(params.id)
    if (!studyIdValidation.valid) {
      const error = createMyStudiesError('INVALID_REQUEST', studyIdValidation.error)
      return NextResponse.json(error, { status: error.statusCode })
    }
    
    const studyId = studyIdValidation.studyId
    const userId = parseInt(session.user.id)
    
    // 3. 스터디 조회
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      }
    })
    
    // 4. 스터디 존재 확인
    if (!study) {
      const error = createMyStudiesError('STUDY_NOT_FOUND')
      logMyStudiesWarning('스터디 조회 실패', '존재하지 않는 스터디', {
        studyId,
        userId
      })
      return NextResponse.json(error, { status: error.statusCode })
    }
    
    // 5. 삭제된 스터디 확인
    if (study.deletedAt) {
      const error = createMyStudiesError('STUDY_DELETED')
      logMyStudiesWarning('삭제된 스터디 접근 시도', null, {
        studyId,
        userId,
        deletedAt: study.deletedAt
      })
      return NextResponse.json(error, { status: error.statusCode })
    }
    
    // 6. 멤버 권한 확인
    const myMembership = study.members.find(m => m.userId === userId)
    
    if (!myMembership) {
      const error = createMyStudiesError('STUDY_ACCESS_DENIED')
      logMyStudiesWarning('스터디 접근 권한 없음', null, {
        studyId,
        userId
      })
      return NextResponse.json(error, { status: error.statusCode })
    }
    
    // 7. PENDING 상태 확인
    if (myMembership.role === 'PENDING') {
      const error = createMyStudiesError('STUDY_PENDING_APPROVAL')
      logMyStudiesInfo('PENDING 상태 사용자 접근', {
        studyId,
        userId,
        membershipId: myMembership.id
      })
      return NextResponse.json(error, { status: error.statusCode })
    }
    
    // 8. 응답 데이터 구성
    const responseData = {
      ...study,
      myRole: myMembership.role,
      myMembershipId: myMembership.id,
      joinedAt: myMembership.joinedAt
    }
    
    return NextResponse.json({
      success: true,
      data: responseData
    })
    
  } catch (error) {
    if (error.code?.startsWith('P')) {
      const prismaError = handlePrismaError(error)
      logMyStudiesError('스터디 상세 조회 실패 (Prisma)', error, {
        studyId: params.id,
        userId: session?.user?.id,
        prismaCode: error.code
      })
      return NextResponse.json(prismaError, { status: prismaError.statusCode })
    }
    
    logMyStudiesError('스터디 상세 조회 실패', error, {
      studyId: params.id,
      userId: session?.user?.id
    })
    
    const genericError = createMyStudiesError('STUDY_LOAD_FAILED')
    return NextResponse.json(genericError, { status: genericError.statusCode })
  }
}
```

**개선 사항**:
1. studyId 검증
2. 삭제된 스터디 확인
3. PENDING 상태 처리
4. 멤버십 정보 추가 (myRole, joinedAt)
5. 에러 메시지 개선
6. 로깅 강화

---

#### 2.3 공통 미들웨어 (2시간)

**파일**: `coup/src/lib/middleware/my-studies-middleware.js` (신규)

**목적**: API 공통 로직 추출

```javascript
/**
 * my-studies API 공통 미들웨어
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createMyStudiesError, logMyStudiesWarning } from '@/lib/exceptions/my-studies-errors'
import { validateStudyId } from '@/lib/validators/my-studies-validation'
import { checkStudyAccess } from '@/lib/my-studies-helpers'

/**
 * 인증 미들웨어
 */
export async function requireAuth(request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return {
      error: createMyStudiesError('UNAUTHORIZED'),
      statusCode: 401
    }
  }
  
  return {
    session,
    userId: parseInt(session.user.id)
  }
}

/**
 * 스터디 멤버 확인 미들웨어
 */
export async function requireStudyMember(studyId, userId, minRole = 'MEMBER') {
  // studyId 검증
  const validation = validateStudyId(studyId)
  if (!validation.valid) {
    return {
      error: createMyStudiesError('INVALID_REQUEST', validation.error),
      statusCode: 400
    }
  }
  
  const validStudyId = validation.studyId
  
  // 스터디 조회
  const study = await prisma.study.findUnique({
    where: { id: validStudyId },
    include: {
      members: {
        where: { userId }
      }
    }
  })
  
  // 스터디 존재 확인
  if (!study) {
    return {
      error: createMyStudiesError('STUDY_NOT_FOUND'),
      statusCode: 404
    }
  }
  
  // 삭제 확인
  if (study.deletedAt) {
    logMyStudiesWarning('삭제된 스터디 접근 시도', null, { studyId: validStudyId, userId })
    return {
      error: createMyStudiesError('STUDY_DELETED'),
      statusCode: 404
    }
  }
  
  // 멤버십 확인
  const membership = study.members[0]
  if (!membership) {
    logMyStudiesWarning('스터디 멤버 아님', null, { studyId: validStudyId, userId })
    return {
      error: createMyStudiesError('STUDY_ACCESS_DENIED'),
      statusCode: 403
    }
  }
  
  // PENDING 확인
  if (membership.role === 'PENDING') {
    return {
      error: createMyStudiesError('STUDY_PENDING_APPROVAL'),
      statusCode: 403
    }
  }
  
  // 역할 확인
  const roleHierarchy = { OWNER: 3, ADMIN: 2, MEMBER: 1 }
  const requiredLevel = roleHierarchy[minRole] || 0
  const userLevel = roleHierarchy[membership.role] || 0
  
  if (userLevel < requiredLevel) {
    return {
      error: createMyStudiesError('NO_PERMISSION', `${minRole} 권한이 필요합니다`),
      statusCode: 403
    }
  }
  
  return {
    study,
    membership,
    role: membership.role
  }
}

/**
 * 타임아웃 설정
 */
export function withTimeout(promise, ms = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms)
    )
  ])
}
```

---

### 예상 소요 시간

| 작업 | 시간 |
|------|------|
| 2.1 목록 API 개선 | 3h |
| 2.2 스터디 상세 API 개선 | 3h |
| 2.3 공통 미들웨어 | 2h |
| **총 예상** | **8h** |

---

### 완료 조건

- [ ] my-studies API 개선 (타임아웃, 검증, 로깅)
- [ ] studies/[id] API 개선 (권한, 삭제 스터디)
- [ ] 공통 미들웨어 생성
- [ ] 에러 메시지 한글화
- [ ] 로깅 강화
- [ ] STEP-6-COMPLETE-REPORT.md 작성
- [ ] PROGRESS-TRACKER.md 업데이트

---

### 참조 문서

- `docs/exception/implement/my-studies/ANALYSIS.md`
- `docs/exception/implement/my-studies/STEP-5-COMPLETE-REPORT.md`
- `docs/exception/my-studies/01-my-studies-list-exceptions.md`
- `docs/exception/my-studies/02-study-detail-exceptions.md`
- `coup/src/lib/exceptions/my-studies-errors.js` (Step 5에서 생성)
- `coup/src/lib/validators/my-studies-validation.js` (Step 5에서 생성)

---

### 실행 명령

```
안녕하세요! CoUp 예외 처리 구현 Step 6을 시작합니다.

**목표**: my-studies 영역 Phase 2 - API 강화

**프로젝트 정보**:
- Next.js 16 App Router
- JavaScript (ES6+)
- React Query (TanStack Query)

**이전 완료**:
- Step 1~4 완료 ✅
- Step 5 완료 ✅ (유틸리티 생성: 88개 함수)

**현재 작업**: Step 6 - API 강화 (8시간)

**참조 문서**:
- docs/exception/implement/my-studies/STEP-6-PROMPT.md

파일 수정을 시작해주세요.
```

---

**작성일**: 2025-12-01  
**버전**: 1.0.0  
**상태**: 준비 완료 ⏳

