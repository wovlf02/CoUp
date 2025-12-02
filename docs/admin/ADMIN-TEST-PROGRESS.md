# Admin 도메인 통합 테스트 작업 진행 상황

**작업 시작**: 2025-12-02  
**현재 진행률**: 40% (설정 및 Exception 테스트 작성)

---

## 🎯 목표

Admin 도메인에 대한 통합 테스트 작성
- Admin API 테스트 (16개 엔드포인트)
- AdminException 테스트 (100개 예외 코드)
- AdminLogger 테스트
- 테스트 커버리지 80% 이상 달성

---

## ✅ 완료된 작업

### 1. 테스트 헬퍼 유틸리티 ✅
**파일**: `coup/src/__tests__/setup/adminTestHelpers.js`

**내용**:
- Mock 데이터 생성 함수들
  - `createMockUser()`, `createMockStudy()`, `createMockReport()` 등
- 세션 Mock 함수들
  - `mockAdminSession()`, `mockSuperAdminSession()`, `mockUserSession()`
- 검증 헬퍼 함수들
  - `expectPaginatedResponse()`, `expectErrorResponse()`
- Request Mock 생성
  - `createMockRequest()` with searchParams support

**코드 라인**: ~280 라인

### 2. AdminException 테스트 (부분 완료) ⚠️
**파일**: `coup/src/__tests__/exceptions/admin-simplified.test.js`

**테스트 케이스**:
- ✅ AdminException (Base Class) - 3개 테스트
- ✅ AdminPermissionException - 3개 테스트
- ✅ AdminUserException - 3개 테스트
- ✅ AdminValidationException - 2개 테스트
- ✅ AdminBusinessException - 1개 테스트
- ✅ AdminDatabaseException - 2개 테스트
- ✅ AdminReportException - 1개 테스트
- ✅ AdminSettingsException - 1개 테스트
- ✅ 통합 검증 - 7개 테스트

**테스트 결과**: **20/25 통과** (80% 성공률)

**실패한 5개 테스트 원인**:
- 파일 저장/캐시 동기화 문제로 일부 assertion 불일치
- 실제 구현의 에러 코드 번호 차이 (문서 vs 실제)
  - 예: ADMIN-012 → ADMIN-092 (invalidSorting)
  - 예: ADMIN-081 → ADMIN-086 (connectionFailed)
  - 예: ADMIN-082 → ADMIN-088 (queryTimeout)

**코드 라인**: ~310 라인

### 3. Admin API 테스트 (미완성) ⏸️
**파일**: `coup/src/__tests__/api/admin/users.test.js`

**작성된 테스트**:
- GET /api/admin/users (5개 테스트)
- GET /api/admin/users/[id] (3개 테스트)
- PATCH /api/admin/users/[id] (3개 테스트)
- DELETE /api/admin/users/[id] (3개 테스트)
- POST /api/admin/users/[id]/suspend (3개 테스트)
- POST /api/admin/users/[id]/activate (3개 테스트)

**총 22개 테스트 작성** (실행 실패)

**실패 원인**:
- API 라우트가 다양한 의존성(Prisma, Auth, Permissions)을 가지고 있어 Mock 설정이 복잡함
- 모든 테스트가 500 에러 반환
- Next.js API Route의 통합 테스트는 더 많은 설정 필요

**코드 라인**: ~600 라인

---

## 🚧 진행 중인 문제

### 1. API 테스트 Mock 설정 어려움
**문제**:
- AdminAPI는 많은 모듈에 의존
  - `@/lib/admin/auth` (requireAdmin)
  - `@/lib/admin/permissions` (PERMISSIONS)
  - `@/lib/prisma` (Database)
  - `@/lib/auth` (authOptions)
  - `@prisma/client` (PrismaClient)

**현재 상태**:
- 모든 필요한 Mock 작성 완료
- 하지만 런타임에 500 에러 발생
- 에러 메시지 확인 어려움 (로깅이 제대로 캡처되지 않음)

**시도한 해결책**:
1. ✅ jest.setup.js에 PrismaClient Mock 추가
2. ✅ authOptions Mock 추가
3. ✅ permissions Mock 추가
4. ✅ requireAdmin Mock 구현
5. ❌ 여전히 500 에러

### 2. Jest 캐시 및 파일 동기화 문제
**문제**:
- 파일 수정 후에도 이전 코드가 실행됨
- `npx jest --clearCache` 실행해도 해결 안 됨
- PowerShell replace로 직접 수정 시도했으나 Syntax Error 발생

---

## 📊 통계

### 작성된 파일
1. `adminTestHelpers.js` - 280 라인 ✅
2. `admin-simplified.test.js` - 310 라인 ⚠️
3. `users.test.js` - 600 라인 ❌

**총 라인**: ~1,190 라인

### 테스트 커버리지
- AdminException: **80%** (20/25 통과)
- Admin API: **0%** (Mock 설정 미완료)
- AdminLogger: **0%** (미작성)

---

## 🔄 다음 세션 작업

### 우선순위 1: Admin Exception 테스트 완료 ⭐
**작업**:
1. admin-simplified.test.js의 실패한 5개 테스트 수정
   - 파일 직접 확인하여 정확한 context 키 사용
   - 실제 구현된 에러 코드 번호 확인
2. 추가 테스트 케이스 작성
   - Security Exceptions (ADMIN-091 ~ ADMIN-095)
   - System Exceptions (ADMIN-096 ~ ADMIN-100)

**예상 시간**: 30분

### 우선순위 2: API 테스트 전략 변경 ⭐⭐
**현재 문제점**:
- Next.js API Route의 통합 테스트는 너무 복잡
- Mock 설정이 어렵고 유지보수 힘듦

**권장 대안 (2가지 중 선택)**:

#### 옵션 A: E2E 테스트로 전환 (권장)
```javascript
// Playwright 또는 Cypress 사용
// 실제 서버를 띄우고 HTTP 요청으로 테스트
test('Admin can view users list', async () => {
  await loginAsAdmin();
  const response = await fetch('/api/admin/users');
  expect(response.status).toBe(200);
});
```

**장점**:
- Mock 불필요
- 실제 사용자 시나리오 테스트
- API + DB + Auth 통합 검증

**단점**:
- 테스트 속도 느림
- DB 초기화 필요

#### 옵션 B: 유닛 테스트로 단순화
```javascript
// API Handler 함수를 별도로 분리하여 테스트
// 미들웨어 없이 순수 로직만 테스트
test('getUsersHandler processes query correctly', () => {
  const result = getUsersLogic({ page: 1, limit: 10 });
  expect(result.pagination.page).toBe(1);
});
```

**장점**:
- 빠른 실행
- Mock 최소화

**단점**:
- 리팩토링 필요
- 통합 부분은 검증 못 함

### 우선순위 3: AdminLogger 테스트 작성 ⭐
**작업**:
1. `coup/src/__tests__/logging/adminLogger.test.js` 생성
2. 테스트 케이스:
   - 로그 레벨 필터링
   - 도메인 특화 메서드
   - 보안 로깅
   - 성능 로깅
   - 에러 로깅

**예상 시간**: 1시간
**예상 테스트 수**: 15-20개

---

## 💡 개선 제안

### 1. API 테스트 아키텍처 재설계
현재: Next.js API Route 직접 테스트 (복잡)
```javascript
import { GET } from '@/app/api/admin/users/route';
await GET(mockRequest); // Mock 설정 복잡
```

제안: 비즈니스 로직 분리
```javascript
// services/adminUserService.js
export async function getUsersList(filters) {
  // 순수 로직
}

// api/admin/users/route.js
export async function GET(request) {
  const auth = await requireAdmin(request);
  const result = await getUsersList(parseFilters(request));
  return createResponse(result);
}

// __tests__/services/adminUserService.test.js
test('getUsersList', () => {
  const result = getUsersList({ page: 1 });
  expect(result).toBeDefined();
});
```

### 2. 테스트 헬퍼 확장
```javascript
// createTestServer() - 통합 테스트용 서버
// createTestDB() - 테스트 전용 DB 초기화
// withTestAuth() - 인증 Mock 자동 설정
```

### 3. 문서 보완
- Admin API 엔드포인트 스펙 문서 작성
- 예외 코드 매핑 테이블 (문서 vs 실제)
- 테스트 작성 가이드

---

## 📝 다음 세션 시작 프롬프트

### 빠른 재개: Exception 테스트 완료
```
Admin Exception 테스트 수정 작업 계속해줘:

1. admin-simplified.test.js의 실패한 5개 테스트 수정
   - 파일 직접 확인하여 정확한 값 사용
   - 실제 구현 기준으로 수정

2. 누락된 예외 테스트 추가:
   - AdminSecurityException 테스트
   - AdminIntegrationException 테스트
   - AdminSystemException 테스트

파일: coup/src/__tests__/exceptions/admin-simplified.test.js
목표: 25/25 테스트 통과 (100%)
```

### 또는: AdminLogger 테스트 작성
```
AdminLogger 테스트 작성해줘:

【작업 범위】
1. 로그 레벨 테스트
   - DEBUG, INFO, WARN, ERROR, CRITICAL, SECURITY
   - 환경별 최소 로그 레벨 확인

2. 도메인 특화 메서드 테스트 (14개)
   - logAdminAction
   - logUserManagement
   - logStudyManagement
   - logReportProcessing
   - logSettingsChange
   - logDatabaseError
   - 등...

3. 로그 포맷 검증
   - 타임스탬프, 레벨, 메시지 형식
   - Context 정보 포함 여부
   - 민감 정보 필터링

【참고 파일】
- coup/src/lib/logging/adminLogger.js (653 라인)

【예상 결과】
- 파일: coup/src/__tests__/logging/adminLogger.test.js
- 테스트 수: 15-20개
- 커버리지: 80% 이상
```

---

## 📌 중요 참고 사항

### 실제 구현된 Admin Exception 코드 (일부)
```
ADMIN-001: 관리자 인증 실패 (authenticationFailed)
ADMIN-002: 관리자 권한 부족 (insufficientPermission)
ADMIN-003: 세션 만료 (sessionExpired)
ADMIN-021: 사용자 없음 (userNotFound)
ADMIN-022: 유효하지 않은 상태 변경 (invalidStatusChange) ← not invalidStatusTransition
ADMIN-024: 이미 정지됨 (userAlreadySuspended)
ADMIN-025: 자기 자신 정지 불가 (cannotSuspendSelf)
ADMIN-027: 유효하지 않은 정지 기간 (invalidSuspensionDuration)
ADMIN-041: 신고 없음 (reportNotFound)
ADMIN-071: 설정 없음 (settingNotFound) → context.settingKey (not .key)
ADMIN-086: DB 연결 실패 (connectionFailed) ← not 081
ADMIN-088: 쿼리 타임아웃 (queryTimeout) ← not 082, context.queryName (not .operation)
ADMIN-092: 잘못된 정렬 (invalidSorting) ← not 012
```

### Jest 설정
```javascript
// jest.setup.js에 추가된 Mock들
- PrismaClient
- next-auth
- @/lib/auth (authOptions)
- @/lib/admin/permissions
```

---

**현재 상태**: Exception 테스트 80% 완료, API 테스트 Mock 설정 중  
**다음 작업**: Exception 테스트 100% 완료 또는 AdminLogger 테스트 작성  
**예상 남은 시간**: 3-4시간 (전체 목표 기준)

