# 다음 세션 작업: Study 도메인 다음 API 테스트 진행

**작업일**: 2025-12-02  
**최종 업데이트**: 2025-12-02 22:59  
**문서 참조**: `exception-implementation.md`  
**현재 진행**: ✅ Study Notices API 테스트 100% 완료 (11/11)

---

## 📊 Study 도메인 전체 진행 상황

### exception-implementation.md 기준

**Step 1-4: 완료** ✅
- Step 1: 도메인 분석 및 설계 (완료 2025-12-01)
- Step 2: Exception 클래스 구현 (완료 2025-12-01)
- Step 3: Validators & Logger 구현 (완료 2025-12-01)
- Step 4: API 라우트 강화 (완료 2025-12-01)

**Step 5: 추가 API 강화** ⏳ **진행 중**
- [x] `/api/studies/[id]/notices/*` - Notices API (완료 2025-12-02)
  * GET /api/studies/[id]/notices ✅
  * POST /api/studies/[id]/notices ✅
  * GET /api/studies/[id]/notices/[noticeId] ✅
  * PATCH /api/studies/[id]/notices/[noticeId] ✅
  * DELETE /api/studies/[id]/notices/[noticeId] ✅
- [ ] `/api/studies/[id]/files/*` - 파일 업로드/다운로드 (필수)
- [ ] `/api/studies/[id]/tasks/*` - 할일 관리 (선택)
- [ ] `/api/studies/[id]/invite/*` - 초대 관리 (선택)

**Step 6: 테스트 작성** ⏳ **진행 중 (1/6 완료)**
- [x] **Notices API 테스트** - 11/11 통과 (100%) ✅
- [ ] Members API 테스트 - 대기
- [ ] Applications API 테스트 - 대기
- [ ] Tasks API 테스트 - 대기
- [ ] Files API 테스트 - 대기
- [ ] Studies API 테스트 - 대기

---

## ✅ 최근 완료 작업 (2025-12-02)

### Study Notices API 테스트 100% 완료 (11/11)

**테스트 결과**:
```
Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
Time:        0.257 s
```

**테스트 케이스**:
- GET /api/studies/[id]/notices - 3개 ✅
- POST /api/studies/[id]/notices - 3개 ✅
- GET /api/studies/[id]/notices/[noticeId] - 2개 ✅
- PATCH /api/studies/[id]/notices/[noticeId] - 1개 ✅
- DELETE /api/studies/[id]/notices/[noticeId] - 2개 ✅

**주요 수정 사항**:
1. requireStudyMember mock의 403 응답 형식 통일
   - `{ success: false, error: { code, message } }` 형식 적용
2. instanceof NextResponse → duck typing으로 변경
   - `if (result && typeof result.json === 'function') return result;`

---

## 📋 완료된 수정 사항

### 1. requireStudyMember Mock 개선 (테스트 파일)

**위치**: `src/__tests__/api/study/study-notices.test.js` (Line 68-76)

```javascript
if (requiredRole && requiredRole === 'ADMIN' && member.role === 'MEMBER') {
  const { NextResponse } = require('next/server');
  return NextResponse.json(
    { 
      success: false,
      error: { 
        code: 'STUDY-003',
        message: 'Insufficient permissions'
      }
    },
    { status: 403 }
  );
}
```

**변경 내용**:
- ❌ 이전: `{ error: 'Insufficient permissions' }`
- ✅ 수정: `{ success: false, error: { code, message } }`

### 2. API 파일 수정 완료 (이전 세션)

**notices/route.js**:
- Line 26: GET 핸들러 - instanceof NextResponse 수정 ✅
- Line 110: POST 핸들러 - instanceof NextResponse 수정 ✅

**notices/[noticeId]/route.js**:
- Line 23: GET 핸들러 - instanceof NextResponse 수정 ✅
- Line 71: PATCH 핸들러 - instanceof NextResponse 수정 ✅
- Line 161: DELETE 핸들러 - instanceof NextResponse 수정 ✅
- Line 183: noticeAccessDenied로 변경 ✅

---

## 🎯 다음 작업: Study 도메인 Step 6 테스트 계속

### 우선순위 1: Study API 테스트 작성

**exception-implementation.md 목표**:
- API 라우트 테스트: 50개
- Validator 테스트: 20개
- Helper 테스트: 30개
- 통합 테스트: 10개
- **전체 목표**: 110개 테스트, 80% 커버리지

**현재 진행**:
- ✅ Notices API: 11/11 테스트 완료
- ⏳ 나머지 API 테스트 진행 필요

### 다음 테스트 대상 API (우선순위 순)

#### 1. Study Members API (추천) 
**파일**: `src/__tests__/api/study/study-members.test.js`  
**API**: `/api/studies/[id]/members`  
**예상 테스트**: 8-10개  
**기능**:
- GET: 멤버 목록 조회
- POST: 멤버 추가
- DELETE: 멤버 제거
- PATCH: 역할 변경

#### 2. Study Applications API
**파일**: `src/__tests__/api/study/study-applications.test.js`  
**API**: `/api/studies/[id]/applications`  
**예상 테스트**: 8-10개  
**기능**:
- GET: 지원자 목록
- POST: 지원 신청
- PATCH: 승인/거절

#### 3. Study Tasks API
**파일**: `src/__tests__/api/study/study-tasks.test.js`  
**API**: `/api/studies/[id]/tasks`  
**예상 테스트**: 10-12개  
**기능**:
- 과제 CRUD
- 과제 제출
- 과제 평가

#### 4. Study Files API
**파일**: `src/__tests__/api/study/study-files.test.js`  
**API**: `/api/studies/[id]/files`  
**예상 테스트**: 8-10개  
**기능**:
- 파일 업로드
- 파일 다운로드
- 파일 삭제

#### 5. Studies API
**파일**: `src/__tests__/api/study/studies.test.js`  
**API**: `/api/studies`  
**예상 테스트**: 10-12개  
**기능**:
- 스터디 목록 조회
- 스터디 생성
- 스터디 수정
- 스터디 삭제

---

## 🚀 다음 세션 시작 프롬프트

```
Study 도메인 Step 6 테스트 계속 진행!

✅ 완료:
- Step 1-4: 도메인 분석, Exception 구현, API 강화 완료
- Step 5: Notices API 강화 완료
- Step 6: Notices API 테스트 11/11 완료 (100%)

📋 다음 작업:
Study Members API 테스트 작성
- 파일: src/__tests__/api/study/study-members.test.js
- API: /api/studies/[id]/members
- 목표: 8-10개 테스트 작성 및 100% 통과

작업 절차:
1. 테스트 파일 확인 및 현재 상태 파악
2. 테스트 실행하여 실패 원인 분석
3. Notices API 패턴 참조하여 수정:
   - instanceof NextResponse → duck typing
   - requireStudyMember mock 응답 형식 확인
   - Prisma mock 완전성 검증
4. 모든 테스트 통과 확인

참고 문서:
- exception-implementation.md (Phase A > A2 > Step 6)
- STUDY-NOTICES-TEST-COMPLETE.md (성공 패턴)
- next-session-prompt.md (Mock 패턴)

목표: Study Members API 테스트 100% 통과!
시작해줘!
```

---

## 📚 참고: 성공적인 Mock 패턴 (Notices API)

```javascript
// 1. Prisma Mock
jest.mock('@/lib/prisma', () => ({
  prisma: {
    notice: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    studyMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    study: {
      findUnique: jest.fn(),
    },
    notification: {
      createMany: jest.fn(),
    },
  },
}));

// 2. Validation Mocks
jest.mock('@/lib/utils/input-sanitizer', () => ({
  validateAndSanitize: jest.fn((data) => ({
    valid: true,
    sanitized: data,
    errors: []
  }))
}));

jest.mock('@/lib/utils/xss-sanitizer', () => ({
  validateSecurityThreats: jest.fn(() => ({ safe: true, threats: [] })),
  logSecurityEvent: jest.fn()
}));

// 3. Auth Helper Mock
jest.mock('@/lib/auth-helpers', () => ({
  requireStudyMember: jest.fn(async (studyId, requiredRole) => {
    // Session 확인
    // Member 확인
    // 권한 확인 - 403 응답에 success: false 포함!
    return { member, session };
  })
}));
```

---

**작성일**: 2025-12-02 23:05  
**다음 작업**: Study Members API 테스트
**예상 소요**: 30분-1시간 (API당)
**참고 문서**: 
- `exception-implementation.md` (Phase A > A2 > Step 6)
- `STUDY-NOTICES-TEST-COMPLETE.md` (성공 패턴 참조)
