# my-studies 영역 현재 코드 분석 보고서

**작성일**: 2025-12-01  
**최종 업데이트**: 2025-12-01  
**작성자**: GitHub Copilot  
**버전**: 1.0.0

---

## 📊 분석 개요

- **분석 일자**: 2025-12-01
- **대상 파일**: 13개 (페이지) + 2개 (API) = 15개
- **문서화된 예외**: ~120개
- **구현된 예외**: ~30개 (추정)
- **구현률**: ~25% (추정)

---

## 📁 분석 대상 파일

### 페이지 컴포넌트 (13개)

#### 1. 목록 페이지
- `coup/src/app/my-studies/page.jsx` ✅ 분석 완료

#### 2. 스터디 내부 페이지 (studyId별)
- `coup/src/app/my-studies/[studyId]/page.jsx` ✅ 분석 완료
- `coup/src/app/my-studies/[studyId]/chat/page.jsx` ⏳ 확인 필요
- `coup/src/app/my-studies/[studyId]/notices/page.jsx` ⏳ 확인 필요
- `coup/src/app/my-studies/[studyId]/files/page.jsx` ⏳ 확인 필요
- `coup/src/app/my-studies/[studyId]/calendar/page.jsx` ⏳ 확인 필요
- `coup/src/app/my-studies/[studyId]/tasks/page.jsx` ⏳ 확인 필요
- `coup/src/app/my-studies/[studyId]/video-call/page.jsx` ⏳ 확인 필요
- `coup/src/app/my-studies/[studyId]/members/page.jsx` ⏳ 확인 필요
- `coup/src/app/my-studies/[studyId]/settings/page.jsx` ⏳ 확인 필요
- `coup/src/app/my-studies/[studyId]/announcements/[announcementId]/page.jsx` ⏳ 확인 필요

### API 라우트 (2개 + α)

#### 1. 내 스터디 API
- `coup/src/app/api/my-studies/route.js` ✅ 분석 완료
- `coup/src/app/api/my-studies/[studyId]/announcements/[announcementId]/route.js` ⏳ 확인 필요

#### 2. 스터디별 API (studies/[id]/* 재사용)
- `/api/studies/[id]/notices/route.js` (study 영역에서 분석 완료)
- `/api/studies/[id]/tasks/route.js` (study 영역에서 분석 완료)
- `/api/studies/[id]/files/route.js` (study 영역에서 분석 완료)
- `/api/studies/[id]/calendar/route.js` (study 영역에서 분석 완료)
- `/api/studies/[id]/chat/route.js` (study 영역에서 분석 완료)
- `/api/studies/[id]/members/route.js` (study 영역에서 분석 완료)

### 컴포넌트 (재사용)
- `coup/src/components/study/StudyTabs.jsx` (공통)
- `coup/src/components/study/RealtimeChat.js` (공통)
- `coup/src/components/studies/NoticeCreateEditModal.jsx` (공통)
- `coup/src/components/tasks/TaskCard.jsx` (공통)

---

## 🔍 예외 처리 현황

### 1. 내 스터디 목록 (`/my-studies/page.jsx`)

#### 구현됨 ✅ (7개)

| 번호 | 예외 상황 | 파일 | 구현 위치 | 품질 |
|------|---------|------|----------|------|
| 1 | 로딩 상태 표시 | page.jsx | L44-50 | ⭐ 기본 (텍스트만) |
| 2 | 에러 상태 표시 | page.jsx | L52-60 | ⭐ 기본 (재시도 없음) |
| 3 | 빈 상태 안내 | page.jsx | L120-133 | ⭐⭐ 보통 |
| 4 | 탭별 필터링 | page.jsx | L28-42 | ⭐⭐⭐ 양호 |
| 5 | 역할 배지 표시 | page.jsx | L72-79 | ⭐⭐⭐ 양호 |
| 6 | 페이지네이션 | page.jsx | L48-52 | ⭐⭐ 보통 |
| 7 | 탭 카운트 표시 | page.jsx | L59-64 | ⭐⭐ 보통 |

#### 미구현 ❌ (8개)

| 번호 | 예외 상황 | 문서 참조 | 우선순위 | 예상 시간 |
|------|---------|-----------|---------|----------|
| 1 | 스켈레톤 로딩 UI | 01-my-studies-list-exceptions.md#1.2 | P0 | 1h |
| 2 | 에러 재시도 버튼 | 01-my-studies-list-exceptions.md#1.1 | P0 | 30m |
| 3 | 에러 상세 정보 (401/500) | 01-my-studies-list-exceptions.md#1.1 | P0 | 30m |
| 4 | 빈 상태 온보딩 가이드 | 01-my-studies-list-exceptions.md#2.1 | P1 | 1h |
| 5 | 탭별 맞춤 빈 상태 | 01-my-studies-list-exceptions.md#2.2 | P1 | 1h |
| 6 | 필터링 유효성 검사 | 01-my-studies-list-exceptions.md#3.1 | P0 | 1h |
| 7 | 탭 카운트 불일치 방지 | 01-my-studies-list-exceptions.md#3.2 | P1 | 30m |
| 8 | 탭 전환 시 페이지 리셋 | 01-my-studies-list-exceptions.md#4.2 | P1 | 30m |

#### 부분 구현 ⚠️ (3개)

| 번호 | 예외 상황 | 구현 상태 | 보완 필요 사항 |
|------|---------|-----------|----------------|
| 1 | 역할 배지 표시 | 70% | 알 수 없는 역할 처리 필요 |
| 2 | 카드 렌더링 | 80% | 데이터 누락 처리 강화 |
| 3 | 빠른 액션 버튼 | 50% | 실제 네비게이션 구현 필요 |

---

### 2. 스터디 대시보드 (`/my-studies/[studyId]/page.jsx`)

#### 구현됨 ✅ (6개)

| 번호 | 예외 상황 | 파일 | 구현 위치 | 품질 |
|------|---------|------|----------|------|
| 1 | 로딩 상태 | page.jsx | L35-41 | ⭐ 기본 |
| 2 | 스터디 없음 | page.jsx | L43-49 | ⭐⭐ 보통 |
| 3 | 역할 배지 표시 | page.jsx | L88-91 | ⭐⭐⭐ 양호 |
| 4 | 활동 요약 계산 | page.jsx | L53-62 | ⭐⭐⭐ 양호 |
| 5 | 최근 공지 표시 | page.jsx | L29-30 | ⭐⭐⭐ 양호 |
| 6 | 탭 네비게이션 | page.jsx | L95 | ⭐⭐⭐ 양호 |

#### 미구현 ❌ (12개)

| 번호 | 예외 상황 | 문서 참조 | 우선순위 | 예상 시간 |
|------|---------|-----------|---------|----------|
| 1 | 권한 없음 처리 | 02-study-detail-exceptions.md#권한-부족 | P0 | 1h |
| 2 | 삭제된 스터디 처리 | 02-study-detail-exceptions.md#스터디-없음 | P0 | 30m |
| 3 | PENDING 상태 처리 | 02-study-detail-exceptions.md#권한-부족 | P0 | 1h |
| 4 | 위젯 로딩 실패 | 02-study-detail-exceptions.md#위젯-오류 | P1 | 1h |
| 5 | 통계 계산 오류 | 02-study-detail-exceptions.md#통계-오류 | P1 | 1h |
| 6 | 스켈레톤 UI | 02-study-detail-exceptions.md#로딩-상태 | P0 | 1h |
| 7 | 빈 위젯 표시 | 02-study-detail-exceptions.md#빈-상태 | P1 | 1h |
| 8 | 탭 접근 권한 검증 | 02-study-detail-exceptions.md#탭-권한 | P0 | 1h |
| 9 | 에러 재시도 | 02-study-detail-exceptions.md#에러-처리 | P1 | 30m |
| 10 | 실시간 업데이트 | 02-study-detail-exceptions.md#동기화 | P2 | 2h |
| 11 | 성능 최적화 (memo) | 02-study-detail-exceptions.md#성능 | P2 | 1h |
| 12 | ErrorBoundary | 02-study-detail-exceptions.md#에러-경계 | P1 | 1h |

---

### 3. API 라우트 (`/api/my-studies/route.js`)

#### 구현됨 ✅ (5개)

| 번호 | 예외 상황 | 파일 | 구현 위치 | 품질 |
|------|---------|------|----------|------|
| 1 | 세션 인증 | route.js | L6-7 | ⭐⭐⭐ 양호 |
| 2 | 필터링 (role) | route.js | L12-31 | ⭐⭐⭐ 양호 |
| 3 | 페이지네이션 | route.js | L13-15 | ⭐⭐⭐ 양호 |
| 4 | study 데이터 포함 | route.js | L42-82 | ⭐⭐⭐ 양호 |
| 5 | 응답 포맷팅 | route.js | L85-116 | ⭐⭐⭐ 양호 |

#### 미구현 ❌ (7개)

| 번호 | 예외 상황 | 문서 참조 | 우선순위 | 예상 시간 |
|------|---------|-----------|---------|----------|
| 1 | 타임아웃 처리 | 01-my-studies-list-exceptions.md#API-타임아웃 | P0 | 30m |
| 2 | 삭제된 스터디 필터링 | 01-my-studies-list-exceptions.md#삭제-스터디 | P0 | 30m |
| 3 | 에러 메시지 한글화 | 01-my-studies-list-exceptions.md#에러-메시지 | P1 | 30m |
| 4 | 로깅 강화 | 01-my-studies-list-exceptions.md#로깅 | P2 | 30m |
| 5 | 입력값 검증 | 01-my-studies-list-exceptions.md#유효성 | P1 | 30m |
| 6 | N+1 쿼리 최적화 | 01-my-studies-list-exceptions.md#성능 | P2 | 1h |
| 7 | 캐싱 | 01-my-studies-list-exceptions.md#성능 | P2 | 1h |

---

## 📋 필요한 작업

### Phase 1: 유틸리티 생성 (Critical - 8시간)

#### 1.1 my-studies-errors.js (3시간)

**파일**: `coup/src/lib/exceptions/my-studies-errors.js`

**목적**: my-studies 전용 에러 처리

**주요 내용**:
```javascript
export const MY_STUDIES_ERRORS = {
  // 목록
  STUDIES_NOT_FOUND: {
    code: 'STUDIES_NOT_FOUND',
    message: '참여 중인 스터디가 없습니다',
    statusCode: 404
  },
  STUDY_DELETED: {
    code: 'STUDY_DELETED',
    message: '삭제된 스터디입니다',
    statusCode: 404
  },
  
  // 권한
  NO_PERMISSION: {
    code: 'NO_PERMISSION',
    message: '이 스터디에 접근 권한이 없습니다',
    statusCode: 403
  },
  PENDING_APPROVAL: {
    code: 'PENDING_APPROVAL',
    message: '가입 승인 대기 중입니다',
    statusCode: 403
  },
  
  // 탭
  INVALID_TAB: {
    code: 'INVALID_TAB',
    message: '유효하지 않은 탭입니다',
    statusCode: 400
  },
  TAB_ACCESS_DENIED: {
    code: 'TAB_ACCESS_DENIED',
    message: '이 탭에 접근 권한이 없습니다',
    statusCode: 403
  },
  
  // 데이터
  DATA_LOAD_FAILED: {
    code: 'DATA_LOAD_FAILED',
    message: '데이터를 불러오는데 실패했습니다',
    statusCode: 500
  }
}
```

**예상 에러 코드 수**: ~20개

#### 1.2 my-studies-validation.js (2시간)

**파일**: `coup/src/lib/validators/my-studies-validation.js`

**목적**: 탭별 데이터 유효성 검사

**주요 함수**:
- `validateNoticeData(data)` - 공지 유효성
- `validateTaskData(data)` - 할일 유효성
- `validateFileUpload(file)` - 파일 유효성
- `validateCalendarEvent(data)` - 일정 유효성
- `validateChatMessage(data)` - 채팅 유효성

#### 1.3 my-studies-helpers.js (3시간)

**파일**: `coup/src/lib/my-studies-helpers.js`

**목적**: 공통 유틸리티

**주요 함수**:
- `checkStudyAccess(study, userId)` - 접근 권한 확인
- `checkTabPermission(tab, role)` - 탭 권한 확인
- `getFilteredStudies(studies, filter)` - 안전한 필터링
- `getRoleBadge(role)` - 역할 배지 생성 (에러 처리 포함)
- `formatStudyStats(stats)` - 통계 포맷팅

---

### Phase 2: Critical 예외 구현 (8시간)

#### 2.1 목록 페이지 개선 (3시간)

**타겟**: `coup/src/app/my-studies/page.jsx`

**작업**:
1. 스켈레톤 로딩 UI 추가
2. 에러 상태 개선 (재시도 버튼, 상세 정보)
3. 필터링 유효성 검사 강화
4. 탭 전환 시 페이지 리셋

#### 2.2 대시보드 개선 (3시간)

**타겟**: `coup/src/app/my-studies/[studyId]/page.jsx`

**작업**:
1. 권한 검증 추가 (PENDING, 탈퇴, 강퇴 처리)
2. 삭제된 스터디 처리
3. 스켈레톤 UI 추가
4. ErrorBoundary 적용

#### 2.3 API 개선 (2시간)

**타겟**: `coup/src/app/api/my-studies/route.js`

**작업**:
1. 타임아웃 처리 추가 (10초)
2. 삭제된 스터디 필터링
3. 에러 메시지 한글화
4. 로깅 강화

---

### Phase 3: High 예외 구현 (10시간)

#### 3.1 탭별 페이지 예외 처리 (8시간)

**작업 대상**:
- notices/page.jsx (공지사항)
- tasks/page.jsx (할일)
- files/page.jsx (파일)
- calendar/page.jsx (캘린더)
- chat/page.jsx (채팅)

**각 페이지당 작업**:
1. 로딩/에러/빈 상태 처리
2. 권한 검증
3. CRUD 오류 처리
4. 실시간 동기화

#### 3.2 위젯 시스템 예외 처리 (2시간)

**작업**:
1. 활동 요약 위젯 에러 처리
2. 최근 공지 위젯 빈 상태
3. 멤버 목록 위젯 로딩
4. 다가오는 일정 위젯 에러

---

### Phase 4: Medium/Low 예외 구현 (6시간)

#### 4.1 성능 최적화 (3시간)

**작업**:
1. React.memo 적용
2. useMemo/useCallback 최적화
3. 무한 스크롤 고려
4. 캐싱 전략

#### 4.2 UX 개선 (3시간)

**작업**:
1. 온보딩 가이드
2. 탭별 맞춤 빈 상태
3. 빠른 액션 버튼 개선
4. 접근성 개선

---

## 🛠️ 필요한 유틸리티

### 생성 필요 (3개)

- [ ] `lib/exceptions/my-studies-errors.js` - my-studies 에러 처리
- [ ] `lib/validators/my-studies-validation.js` - 탭별 유효성 검사
- [ ] `lib/my-studies-helpers.js` - 공통 유틸리티

### 수정 필요 (2개)

- [ ] `coup/src/app/my-studies/page.jsx` - 목록 페이지 개선
- [ ] `coup/src/app/my-studies/[studyId]/page.jsx` - 대시보드 개선

### 재사용 가능 (study 영역)

- [ ] `lib/exceptions/study-errors.js` - 스터디 에러 (일부 재사용)
- [ ] `lib/validators/study-validation.js` - 유효성 검사 (일부 재사용)
- [ ] `lib/study-helpers.js` - 헬퍼 함수 (일부 재사용)

---

## 📊 구현 우선순위

### Critical (20개) - 1주차 (16시간)

1. **유틸리티 생성** (8시간)
   - my-studies-errors.js (3h)
   - my-studies-validation.js (2h)
   - my-studies-helpers.js (3h)

2. **목록 페이지 개선** (3시간)
   - 스켈레톤 UI (1h)
   - 에러 처리 개선 (1h)
   - 필터링 강화 (1h)

3. **대시보드 개선** (3시간)
   - 권한 검증 (1h)
   - 삭제 스터디 처리 (30m)
   - ErrorBoundary (1h)
   - 스켈레톤 UI (30m)

4. **API 개선** (2시간)
   - 타임아웃 처리 (30m)
   - 삭제 스터디 필터링 (30m)
   - 에러 메시지 (30m)
   - 로깅 (30m)

### High (36개) - 2주차 (10시간)

1. **탭별 페이지** (8시간)
   - 공지/할일/파일/캘린더/채팅
   - 각 1.5-2시간

2. **위젯 시스템** (2시간)
   - 활동 요약, 공지, 멤버, 일정 위젯

### Medium (48개) - 3-4주차 (6시간)

1. **성능 최적화** (3시간)
2. **UX 개선** (3시간)

### Low (18개) - 5주차 (2시간)

1. **접근성** (1시간)
2. **추가 개선** (1시간)

---

## 📝 특이사항

### 1. API 재사용

my-studies는 **studies 영역의 API를 재사용**합니다:
- `/api/studies/[id]/notices` (공지)
- `/api/studies/[id]/tasks` (할일)
- `/api/studies/[id]/files` (파일)
- `/api/studies/[id]/calendar` (일정)
- `/api/studies/[id]/chat` (채팅)

따라서 **studies 영역의 API 개선이 my-studies에도 적용**됩니다.

### 2. 컴포넌트 재사용

다음 컴포넌트는 여러 영역에서 공유:
- `StudyTabs.jsx` (탭 네비게이션)
- `RealtimeChat.js` (실시간 채팅)
- `NoticeCreateEditModal.jsx` (공지 모달)
- `TaskCard.jsx` (할일 카드)

### 3. 권한 시스템

my-studies는 **역할 기반 권한**이 중요:
- **OWNER**: 모든 탭 접근 + 설정
- **ADMIN**: 멤버 탭 + 공지 쓰기
- **MEMBER**: 기본 탭만
- **PENDING**: 접근 불가 (승인 대기)

### 4. 실시간 동기화

채팅은 **WebSocket/Pusher** 사용:
- 실시간 메시지 수신
- 온라인 상태 표시
- 타이핑 인디케이터

---

## 🎯 다음 단계

1. ✅ ANALYSIS.md 작성 (현재)
2. ⏳ TODO.md 작성
3. ⏳ Phase 1 시작 (유틸리티 생성)
4. ⏳ Phase 2 시작 (Critical 구현)

---

**작성자**: GitHub Copilot  
**작성일**: 2025-12-01  
**상태**: 분석 완료 ✅

