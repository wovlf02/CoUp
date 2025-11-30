# dashboard 영역 예외 처리 구현 가이드

**프로젝트**: CoUp (Next.js 16 기반 스터디 관리 플랫폼)  
**영역**: 대시보드 (Dashboard)  
**상태**: 🚧 진행 중  
**시작일**: 2025-12-01

---

## 📋 목차

1. [개요](#개요)
2. [구현 현황](#구현-현황)
3. [구현 단계](#구현-단계)
4. [참조 문서](#참조-문서)
5. [작업 가이드라인](#작업-가이드라인)

---

## 개요

CoUp 프로젝트의 **dashboard 영역** 예외 처리 구현을 체계적으로 진행하기 위한 가이드 문서입니다.

### 목표

- ✅ 안정적인 대시보드 데이터 로딩
- ✅ 사용자 친화적인 에러 처리
- ✅ 성능 최적화
- ✅ 실시간 데이터 동기화
- ✅ 접근성 개선

### 범위

- **API 라우트**: 1개 (`/api/dashboard`)
- **컴포넌트**: 9개 (페이지, 클라이언트, 위젯)
- **예외 문서**: 7개
- **총 예외**: 약 80개 (구현 10개, 미구현 70개)

---

## 구현 현황

### 전체 진행률

```
Step 3-1: 분석 ✅ 완료
Step 3-2: Critical 🚧 진행 중 (Phase 1 완료)
Step 3-3: Important ⏳ 대기 중
Step 3-4: Nice-to-Have ⏳ 대기 중

전체: ■■■□□□□□□□□□□□□□□□□□ 15% (12/80)
```

### Phase 1 완료 (2025-12-01)

**유틸리티 파일 생성**: ✅ 완료

| 파일 | 상태 | 함수/클래스 | 설명 |
|------|------|------------|------|
| dashboard-errors.js | ✅ | 9개 함수, 47개 에러 | 에러 처리 |
| dashboard-validation.js | ✅ | 18개 함수 | 데이터 검증 |
| dashboard-helpers.js | ✅ | 26개 함수 | 유틸리티 |
| ErrorBoundary.jsx | ✅ | 2개 클래스, 2개 HOC | Error Boundary |
| api-retry.js | ✅ | 10개 함수, 1개 클래스 | API 재시도 |

**총 구현**: 106개 함수/클래스, ~3,150 라인
```

### 단계별 현황

| 단계 | 상태 | 예외 수 | 소요 시간 | 완료일 |
|------|------|---------|----------|--------|
| Step 3-1: 분석 | ✅ 완료 | - | 1h | 2025-12-01 |
| Step 3-2: Critical | 🚧 진행 중 | 20개 | 45h (10h 진행) | 2025-12-01~ |
| Step 3-3: Important | ⏳ 대기 | 25개 | 56h | - |
| Step 3-4: Nice-to-Have | ⏳ 대기 | 25개 | 96h | - |

**총 예상 소요**: 197시간 (약 25일)

---

## 구현 단계

### Step 3-1: 분석 ✅ (완료)

**목표**: dashboard 영역 분석 및 현재 코드 상태 파악

**완료 내역**:
- ✅ 파일 구조 조사 (1개 API, 9개 컴포넌트)
- ✅ 예외 문서 검토 (7개 문서)
- ✅ 현재 구현 현황 분석 (10개 구현, 70개 미구현)
- ✅ 우선순위 분류 (Critical, Important, Nice-to-Have, Edge Cases)
- ✅ 분석 보고서 작성

**산출물**:
- `STEP-3-1-ANALYSIS.md` - 분석 보고서

---

### Step 3-2: Critical 구현 🚧 (진행 중)

**목표**: 프로덕션 배포를 위한 최소 안정성 확보

**예상 기간**: 2주 (45시간)  
**진행 상황**: 35.6% (16h / 45h)

**주요 작업**:
1. **유틸리티 생성** (16h) - ✅ 완료!
   - ✅ `dashboard-errors.js` - 에러 처리 (3h 완료)
   - ✅ `dashboard-validation.js` - 데이터 검증 (3h 완료)
   - ✅ `dashboard-helpers.js` - 유틸리티 함수 (4h 완료)
   - ✅ `ErrorBoundary.jsx` - 에러 바운더리 (3h 완료)
   - ✅ `api-retry.js` - 재시도 로직 (3h 완료)

2. **API 안정성** (11h) - ⏳ 다음 작업
   - Prisma 연결 실패 처리 (2h)
   - 부분 쿼리 실패 처리 (3h)
   - 타임아웃 처리 (2h)
   - 에러 응답 표준화 (2h)
   - 재시도 로직 적용 (2h)

3. **위젯 에러 처리** (10h)
   - StudyStatus 데이터 누락 (2h)
   - 출석률 계산 오류 (2h)
   - 할일 완료율 계산 오류 (2h)
   - OnlineMembers 데이터 누락 (2h)
   - UrgentTasks 날짜 파싱 오류 (2h)

4. **테스트 및 문서화** (8h)
   - 단위 테스트 (4h)
   - 통합 테스트 (2h)
   - 사용 가이드 (2h)

**우선순위**:
- P0 (긴급): API 안정성, 위젯 에러 처리
- P1 (중요): 테스트 작성, 문서화

---

### Step 3-3: Important 구현 ⏳ (대기 중)

**목표**: 사용자 경험 및 기능 강화

**예상 기간**: 2주 (56시간)

**주요 작업**:
- 캐싱 & 동기화 (15h)
- 빈 상태 개선 (8h)
- UX 개선 (9h)
- 위젯 기능 강화 (10h)
- 로깅 & 모니터링 (13h)

---

### Step 3-4: Nice-to-Have 구현 ⏳ (대기 중)

**목표**: 성능 최적화 및 사용성 개선

**예상 기간**: 3주 (96시간)

**주요 작업**:
- 성능 최적화 (13h)
- 실시간 기능 (16h)
- 접근성 (10h)
- 고급 기능 (14h)
- Edge Cases (40h)

---

## 참조 문서

### 예외 문서
- `docs/exception/dashboard/README.md` - 대시보드 예외 처리 개요
- `docs/exception/dashboard/INDEX.md` - 증상별/카테고리별 색인
- `docs/exception/dashboard/01-data-loading-exceptions.md` - 데이터 로딩 예외
- `docs/exception/dashboard/02-widget-exceptions.md` - 위젯 관련 예외
- `docs/exception/dashboard/03-real-time-sync-exceptions.md` - 실시간 동기화
- `docs/exception/dashboard/04-empty-states.md` - 빈 상태 처리
- `docs/exception/dashboard/05-performance-optimization.md` - 성능 최적화

### 구현 문서
- `STEP-3-1-ANALYSIS.md` - 분석 보고서 ✅
- `STEP-3-2-PROGRESS.md` - 진행 상황 보고서 ✅
- `PHASE-1-COMPLETE.md` - Phase 1 완료 보고서 ✅
- `USAGE-GUIDE.md` - 유틸리티 사용 가이드 ✅
- `STEP-3-2-CRITICAL-IMPLEMENTATION.md` - Critical 구현 (작성 예정)
- `STEP-3-3-IMPORTANT-IMPLEMENTATION.md` - Important 구현 (작성 예정)
- `STEP-3-4-COMPLETE-REPORT.md` - 완료 보고서 (작성 예정)

### 참고 자료
- `docs/exception/implement/study/STEP-2-8-COMPLETE-REPORT.md` - study 영역 완료 보고서
- `docs/exception/implement/study/ANALYSIS.md` - study 영역 분석 보고서

---

## 작업 가이드라인

### 코딩 규칙

1. **언어**: JavaScript (ES6+), TypeScript 미사용
2. **프레임워크**: Next.js 16 App Router
3. **데이터 페칭**: React Query (TanStack Query)
4. **스타일**: CSS Modules

### 에러 처리 원칙

1. **사용자 친화적 메시지**
   ```javascript
   // ❌ 나쁜 예
   return { error: error.message }
   
   // ✅ 좋은 예
   return { error: "데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요." }
   ```

2. **점진적 로딩** (Progressive Loading)
   - 전체 페이지를 차단하지 않음
   - 각 섹션별 독립적 로딩
   - 일부 실패해도 나머지 표시

3. **낙관적 UI** (Optimistic UI)
   - 즉각적인 피드백 제공
   - 실패 시 롤백
   - 사용자 경험 개선

4. **스켈레톤 UI**
   - 빈 화면 대신 로딩 스켈레톤 사용
   - 구조를 유지하며 로딩 표시
   - 갑작스러운 레이아웃 변화 방지

### 파일 구조

```
coup/src/
├── app/
│   ├── dashboard/
│   │   └── page.jsx (서버 컴포넌트)
│   └── api/
│       └── dashboard/
│           └── route.js (API 라우트)
├── components/
│   └── dashboard/
│       ├── DashboardClient.jsx
│       ├── DashboardSkeleton.jsx
│       ├── EmptyState.jsx
│       └── widgets/
│           ├── StudyStatus.jsx
│           ├── OnlineMembers.jsx
│           ├── QuickActions.jsx
│           ├── UrgentTasks.jsx
│           └── PinnedNotice.jsx
└── lib/
    ├── exceptions/
    │   └── dashboard-errors.js (생성 예정)
    ├── validators/
    │   └── dashboard-validation.js (생성 예정)
    ├── dashboard-helpers.js (생성 예정)
    ├── api-retry.js (생성 예정)
    └── hooks/
        └── useApi.js (수정 예정)
```

### 테스트

각 구현 단계마다 다음 테스트를 수행합니다:

1. **단위 테스트**: 유틸리티 함수
2. **통합 테스트**: API 라우트
3. **E2E 테스트**: 사용자 시나리오
4. **성능 테스트**: 로딩 속도, 렌더링 성능

### 문서화

각 구현 단계마다 다음 문서를 작성합니다:

1. **구현 계획**: 작업 내용, 우선순위, 예상 시간
2. **구현 보고서**: 완료 내역, 코드 변경, 테스트 결과
3. **코드 주석**: 복잡한 로직, 에러 처리 설명

---

## 진행 상황 업데이트

### 2025-12-01

**Step 3-1 완료** ✅
- dashboard 영역 파일 조사 완료
- 예외 문서 검토 완료
- 분석 보고서 작성 완료
- 다음 단계: Step 3-2 Critical 구현 시작

---

## 문의 및 지원

- **Slack**: #coup-exception-handling
- **Wiki**: [예외 처리 구현 가이드](../../../README.md)
- **담당자**: GitHub Copilot

---

**작성일**: 2025-12-01  
**버전**: 1.0.0  
**마지막 업데이트**: 2025-12-01

