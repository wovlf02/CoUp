# dashboard 영역 분석 보고서

**상태**: ✅ 완료  
**분석자**: GitHub Copilot  
**분석일**: 2025-12-01  
**영역**: 대시보드 (Dashboard)

---

## 📊 분석 개요

- **분석 일자**: 2025-12-01
- **대상 파일**: 1개 (API 라우트) + 9개 (컴포넌트)
- **문서화된 예외**: 약 80개 (7개 문서)
- **구현된 예외**: 약 10개
- **구현률**: 약 12.5%

### 분석 범위
- ✅ 대시보드 데이터 로딩
- ✅ 통계 카드
- ✅ 내 스터디 섹션
- ✅ 최근 활동
- ✅ 다가오는 일정
- ✅ 실시간 위젯 (5개)
- ✅ React Query 캐싱
- ✅ 에러 처리

---

## 📁 분석 대상 파일

### API 라우트 (1개)
- `coup/src/app/api/dashboard/route.js` - 대시보드 데이터 통합 API

### 페이지 컴포넌트 (1개)
- `coup/src/app/dashboard/page.jsx` - 대시보드 서버 컴포넌트

### 클라이언트 컴포넌트 (3개)
- `coup/src/components/dashboard/DashboardClient.jsx` - 메인 클라이언트 컴포넌트
- `coup/src/components/dashboard/DashboardSkeleton.jsx` - 로딩 스켈레톤
- `coup/src/components/dashboard/EmptyState.jsx` - 빈 상태 컴포넌트

### 위젯 컴포넌트 (5개)
- `coup/src/components/dashboard/widgets/StudyStatus.jsx` - 스터디 현황 위젯
- `coup/src/components/dashboard/widgets/OnlineMembers.jsx` - 온라인 멤버 위젯
- `coup/src/components/dashboard/widgets/QuickActions.jsx` - 빠른 액션 위젯
- `coup/src/components/dashboard/widgets/UrgentTasks.jsx` - 급한 할일 위젯
- `coup/src/components/dashboard/widgets/PinnedNotice.jsx` - 고정 공지 위젯

### Hooks (1개)
- `coup/src/lib/hooks/useApi.js` - useDashboard(), useMe() 훅

### 예외 문서 (7개)
- `docs/exception/dashboard/README.md` - 시작 가이드 (440줄)
- `docs/exception/dashboard/INDEX.md` - 전체 색인 (370줄)
- `docs/exception/dashboard/01-data-loading-exceptions.md` - 데이터 로딩 예외
- `docs/exception/dashboard/02-widget-exceptions.md` - 위젯 관련 예외
- `docs/exception/dashboard/03-real-time-sync-exceptions.md` - 실시간 동기화
- `docs/exception/dashboard/04-empty-states.md` - 빈 상태 처리
- `docs/exception/dashboard/05-performance-optimization.md` - 성능 최적화

---

## 🔍 예외 처리 현황

### 구현됨 ✅ (10개)

| 번호 | 예외 상황 | 파일 | 구현 위치 | 품질 |
|------|---------|------|----------|------|
| **서버 컴포넌트** ||||
| 1 | 세션 없음 리다이렉트 | page.jsx | L8-10 | ⭐⭐⭐ 우수 |
| **API 라우트** ||||
| 2 | 인증 확인 | route.js | L5-6 | ⭐⭐⭐ 우수 |
| 3 | 일반 에러 처리 | route.js | L145-149 | ⭐⭐ 보통 |
| **클라이언트 컴포넌트** ||||
| 4 | 로딩 스켈레톤 표시 | DashboardClient.jsx | L18-20 | ⭐⭐⭐ 우수 |
| 5 | 데이터 없음 에러 | DashboardClient.jsx | L22-31 | ⭐⭐⭐ 양호 |
| 6 | 스터디 없음 빈 상태 | DashboardClient.jsx | L114-121 | ⭐⭐⭐ 양호 |
| 7 | 활동 없음 빈 상태 | DashboardClient.jsx | L145-150 | ⭐⭐⭐ 양호 |
| **위젯** ||||
| 8 | 온라인 멤버 없음 | OnlineMembers.jsx | L12-16 | ⭐⭐⭐ 양호 |
| 9 | 급한 할일 없음 | UrgentTasks.jsx | L10-12 | ⭐⭐⭐ 양호 |
| 10 | 고정 공지 없음 | PinnedNotice.jsx | L6-8 | ⭐⭐⭐ 양호 |

**품질 기준**:
- ⭐⭐⭐ 우수: 완벽한 에러 메시지, 로깅, 복구 로직
- ⭐⭐⭐ 양호: 적절한 에러 메시지, 로깅
- ⭐⭐ 보통: 기본 에러 처리만 있음
- ⭐ 미흡: 에러 처리 부족

### 미구현 ❌ (70개)

전체 미구현 예외 70개는 다음 4개 범주로 분류됩니다:

#### Critical - 즉시 구현 필요 (20개)

| 번호 | 예외 상황 | 영향도 | 우선순위 | 예상 시간 | 참조 문서 |
|------|---------|--------|---------|----------|---------|
| **API 에러 처리** ||||||
| 1 | Prisma 연결 실패 처리 | HIGH | P0 | 2h | 01-data-loading L80-120 |
| 2 | 부분 쿼리 실패 처리 | HIGH | P0 | 3h | 01-data-loading L140-180 |
| 3 | 타임아웃 처리 (5초) | HIGH | P0 | 2h | 01-data-loading L200-240 |
| 4 | 재시도 로직 (3회) | HIGH | P0 | 3h | 01-data-loading L260-310 |
| 5 | 에러 응답 표준화 | MEDIUM | P1 | 2h | 01-data-loading L320-360 |
| **데이터 검증** ||||||
| 6 | null/undefined 방어 | HIGH | P0 | 2h | 01-data-loading L380-420 |
| 7 | 빈 배열 처리 | MEDIUM | P1 | 1h | 01-data-loading L440-470 |
| 8 | 날짜 형식 검증 | MEDIUM | P1 | 2h | 01-data-loading L490-520 |
| 9 | 통계 계산 오류 (0 나누기) | HIGH | P0 | 2h | 02-widget L80-110 |
| **위젯 에러 처리** ||||||
| 10 | StudyStatus 데이터 누락 | HIGH | P0 | 2h | 02-widget L130-170 |
| 11 | 출석률 계산 오류 | HIGH | P0 | 2h | 02-widget L190-230 |
| 12 | 할일 완료율 계산 오류 | HIGH | P0 | 2h | 02-widget L250-290 |
| 13 | D-day 계산 오류 | MEDIUM | P1 | 1h | 02-widget L310-340 |
| 14 | UrgentTasks 날짜 파싱 오류 | HIGH | P0 | 2h | 02-widget L360-400 |
| **React Query** ||||||
| 15 | 쿼리 에러 핸들링 | HIGH | P0 | 3h | 03-real-time L80-130 |
| 16 | 에러 바운더리 추가 | HIGH | P0 | 3h | 01-data-loading L540-600 |
| 17 | 네트워크 오류 감지 | HIGH | P0 | 2h | 01-data-loading L620-660 |
| **보안** ||||||
| 18 | XSS 방어 (공지/메시지) | HIGH | P0 | 3h | 01-data-loading L680-720 |
| 19 | 민감 정보 노출 방지 | HIGH | P0 | 2h | 01-data-loading L740-780 |
| 20 | CSRF 토큰 검증 | MEDIUM | P1 | 2h | 01-data-loading L800-840 |

**소계: 20개 / 45시간**

#### Important - 조만간 구현 필요 (25개)

| 번호 | 예외 상황 | 영향도 | 우선순위 | 예상 시간 | 참조 문서 |
|------|---------|--------|---------|----------|---------|
| **캐싱 & 동기화** ||||||
| 21 | staleTime 설정 최적화 | MEDIUM | P2 | 2h | 03-real-time L150-190 |
| 22 | 캐시 무효화 전략 | MEDIUM | P2 | 3h | 03-real-time L210-260 |
| 23 | 자동 갱신 설정 | MEDIUM | P2 | 2h | 03-real-time L280-320 |
| 24 | 낙관적 업데이트 | MEDIUM | P2 | 4h | 03-real-time L340-410 |
| 25 | 백그라운드 refetch | LOW | P3 | 2h | 03-real-time L430-470 |
| **빈 상태 개선** ||||||
| 26 | EmptyState CTA 개선 | MEDIUM | P2 | 2h | 04-empty-states L80-120 |
| 27 | 일정 없음 상태 | MEDIUM | P2 | 1h | 04-empty-states L140-170 |
| 28 | 알림 없음 상태 | LOW | P3 | 1h | 04-empty-states L190-220 |
| 29 | 온라인 멤버 없음 개선 | LOW | P3 | 1h | 04-empty-states L240-270 |
| 30 | 일러스트레이션 추가 | LOW | P3 | 3h | 04-empty-states L290-330 |
| **UX 개선** ||||||
| 31 | 재시도 버튼 추가 | MEDIUM | P2 | 2h | 01-data-loading L860-900 |
| 32 | 에러 토스트 개선 | MEDIUM | P2 | 2h | 01-data-loading L920-960 |
| 33 | 로딩 진행률 표시 | LOW | P3 | 3h | 01-data-loading L980-1030 |
| 34 | 스켈레톤 애니메이션 | LOW | P3 | 2h | 01-data-loading L1050-1090 |
| 35 | 부드러운 전환 효과 | LOW | P3 | 2h | 04-empty-states L350-390 |
| **위젯 기능 강화** ||||||
| 36 | OnlineMembers 페이지네이션 | MEDIUM | P2 | 3h | 02-widget L420-470 |
| 37 | QuickActions 권한 확인 | HIGH | P1 | 2h | 02-widget L490-530 |
| 38 | QuickActions 오류 처리 | MEDIUM | P2 | 2h | 02-widget L550-590 |
| 39 | PinnedNotice 날짜 포맷 | LOW | P3 | 1h | 02-widget L610-640 |
| 40 | UrgentTasks 정렬 개선 | MEDIUM | P2 | 2h | 02-widget L660-700 |
| **로깅 & 모니터링** ||||||
| 41 | API 호출 로깅 | MEDIUM | P2 | 2h | 01-data-loading L1110-1150 |
| 42 | 에러 메트릭 수집 | MEDIUM | P2 | 3h | 01-data-loading L1170-1220 |
| 43 | 성능 모니터링 | LOW | P3 | 3h | 05-performance L80-130 |
| 44 | Sentry 통합 | MEDIUM | P2 | 3h | 01-data-loading L1240-1290 |
| 45 | 사용자 행동 추적 | LOW | P3 | 2h | 05-performance L150-190 |

**소계: 25개 / 56시간**

#### Nice-to-Have - 추후 구현 고려 (15개)

| 번호 | 예외 상황 | 영향도 | 우선순위 | 예상 시간 | 참조 문서 |
|------|---------|--------|---------|----------|---------|
| **성능 최적화** ||||||
| 46 | React.memo 적용 | LOW | P3 | 3h | 05-performance L210-260 |
| 47 | useMemo 최적화 | LOW | P3 | 2h | 05-performance L280-320 |
| 48 | useCallback 최적화 | LOW | P3 | 2h | 05-performance L340-380 |
| 49 | 코드 스플리팅 | LOW | P3 | 3h | 05-performance L400-450 |
| 50 | 이미지 최적화 | LOW | P3 | 3h | 05-performance L470-520 |
| **실시간 기능** ||||||
| 51 | WebSocket 연결 | MEDIUM | P2 | 6h | 03-real-time L490-570 |
| 52 | WebSocket 재연결 | MEDIUM | P2 | 3h | 03-real-time L590-640 |
| 53 | 실시간 알림 카운트 | LOW | P3 | 3h | 03-real-time L660-710 |
| 54 | 온라인 상태 표시 | LOW | P3 | 4h | 03-real-time L730-790 |
| **접근성** ||||||
| 55 | 키보드 탐색 지원 | LOW | P3 | 3h | 05-performance L540-590 |
| 56 | 스크린 리더 지원 | LOW | P3 | 3h | 05-performance L610-660 |
| 57 | ARIA 레이블 추가 | LOW | P3 | 2h | 05-performance L680-720 |
| 58 | 포커스 관리 | LOW | P3 | 2h | 05-performance L740-780 |
| **고급 기능** ||||||
| 59 | 대시보드 커스터마이즈 | LOW | P3 | 8h | 문서 미작성 |
| 60 | 위젯 순서 변경 | LOW | P3 | 6h | 문서 미작성 |

**소계: 15개 / 56시간**

#### Edge Cases - 희귀 케이스 (10개)

| 번호 | 예외 상황 | 영향도 | 우선순위 | 예상 시간 | 참조 문서 |
|------|---------|--------|---------|----------|---------|
| 61 | 대량 데이터 렌더링 (100+ 스터디) | LOW | P4 | 4h | 05-performance L800-860 |
| 62 | 메모리 누수 방지 | MEDIUM | P2 | 4h | 05-performance L880-930 |
| 63 | 이벤트 리스너 정리 | MEDIUM | P2 | 2h | 05-performance L950-990 |
| 64 | 동시 API 호출 제한 | LOW | P4 | 3h | 01-data-loading L1310-1360 |
| 65 | Race Condition 방지 | LOW | P4 | 4h | 03-real-time L810-870 |
| 66 | 네트워크 품질 감지 | LOW | P4 | 4h | 01-data-loading L1380-1430 |
| 67 | 오프라인 모드 지원 | LOW | P4 | 8h | 03-real-time L890-970 |
| 68 | 브라우저 호환성 | LOW | P4 | 3h | 05-performance L1010-1060 |
| 69 | 다국어 지원 | LOW | P4 | 6h | 문서 미작성 |
| 70 | 테마 전환 에러 | LOW | P4 | 2h | 문서 미작성 |

**소계: 10개 / 40시간**

---

## 📋 구현 계획

### Phase 1: Critical Security & Stability (Week 1-2) - 45시간

**목표**: 프로덕션 배포를 위한 최소 안정성 확보

**우선순위 순서**:
1. **에러 바운더리 추가** (3h) - 앱 크래시 방지
2. **Prisma 연결 실패 처리** (2h) - DB 연결 안정성
3. **부분 쿼리 실패 처리** (3h) - 부분 실패 허용
4. **재시도 로직** (3h) - 일시적 오류 복구
5. **타임아웃 처리** (2h) - 무한 대기 방지
6. **React Query 에러 핸들링** (3h) - 쿼리 에러 처리
7. **네트워크 오류 감지** (2h) - 네트워크 상태 확인
8. **null/undefined 방어** (2h) - 타입 안전성
9. **통계 계산 오류** (2h) - 0 나누기 방지
10. **XSS 방어** (3h) - 보안 강화
11. **민감 정보 노출 방지** (2h) - 데이터 보호
12. **StudyStatus 데이터 누락** (2h)
13. **출석률 계산 오류** (2h)
14. **할일 완료율 계산 오류** (2h)
15. **UrgentTasks 날짜 파싱 오류** (2h)
16. **에러 응답 표준화** (2h)
17. **날짜 형식 검증** (2h)
18. **D-day 계산 오류** (1h)
19. **빈 배열 처리** (1h)
20. **CSRF 토큰 검증** (2h)

### Phase 2: Important Features (Week 3-4) - 56시간

**목표**: 사용자 경험 및 기능 강화

**주요 작업**:
- **캐싱 & 동기화** (15h)
  - staleTime 설정 최적화 (2h)
  - 캐시 무효화 전략 (3h)
  - 자동 갱신 설정 (2h)
  - 낙관적 업데이트 (4h)
  - 백그라운드 refetch (2h)
  - 메모리 누수 방지 (4h)
  - 이벤트 리스너 정리 (2h)

- **빈 상태 개선** (8h)
  - EmptyState CTA 개선 (2h)
  - 일정 없음 상태 (1h)
  - 알림 없음 상태 (1h)
  - 온라인 멤버 없음 개선 (1h)
  - 일러스트레이션 추가 (3h)

- **UX 개선** (9h)
  - 재시도 버튼 추가 (2h)
  - 에러 토스트 개선 (2h)
  - 로딩 진행률 표시 (3h)
  - 스켈레톤 애니메이션 (2h)

- **위젯 기능 강화** (10h)
  - OnlineMembers 페이지네이션 (3h)
  - QuickActions 권한 확인 (2h)
  - QuickActions 오류 처리 (2h)
  - UrgentTasks 정렬 개선 (2h)
  - PinnedNotice 날짜 포맷 (1h)

- **로깅 & 모니터링** (13h)
  - API 호출 로깅 (2h)
  - 에러 메트릭 수집 (3h)
  - 성능 모니터링 (3h)
  - Sentry 통합 (3h)
  - 사용자 행동 추적 (2h)

### Phase 3: Nice-to-Have (Week 5-6) - 56시간

**목표**: 성능 최적화 및 사용성 개선

**주요 작업**:
- **성능 최적화** (13h): React.memo, useMemo, useCallback, 코드 스플리팅, 이미지 최적화
- **실시간 기능** (16h): WebSocket 연결, 재연결, 실시간 알림, 온라인 상태
- **접근성** (10h): 키보드, 스크린 리더, ARIA, 포커스
- **고급 기능** (14h): 대시보드 커스터마이즈, 위젯 순서 변경

### Phase 4: Edge Cases (Week 7+) - 40시간

**목표**: 희귀 케이스 및 고급 안정성

**주요 작업**:
- 대량 데이터 렌더링 (4h)
- 동시 API 호출 제한 (3h)
- Race Condition 방지 (4h)
- 네트워크 품질 감지 (4h)
- 오프라인 모드 지원 (8h)
- 브라우저 호환성 (3h)
- 다국어 지원 (6h)
- 테마 전환 에러 (2h)

**총 예상 소요: 197시간 (약 25일)**

---

## 🛠️ 필요한 유틸리티

### 생성 필요 (5개)

1. **`coup/src/lib/exceptions/dashboard-errors.js`** ⭐⭐⭐ (3시간)
   - 통일된 대시보드 에러 처리 클래스
   - DASHBOARD_ERRORS 상수 정의
   - createDashboardErrorResponse() 함수
   - 에러 로깅 헬퍼

2. **`coup/src/lib/validators/dashboard-validation.js`** ⭐⭐⭐ (3시간)
   - 데이터 유효성 검증 함수
   - validateStats() - 통계 검증
   - validateDate() - 날짜 형식 검증
   - sanitizeContent() - XSS 방어

3. **`coup/src/lib/dashboard-helpers.js`** ⭐⭐⭐ (4시간)
   - 대시보드 관련 유틸리티 함수
   - calculateAttendanceRate() - 출석률 계산
   - calculateTaskCompletionRate() - 할일 완료율 계산
   - calculateDday() - D-day 계산
   - formatRelativeTime() - 상대 시간 포맷
   - safeCalculate() - 안전한 계산 (0 나누기 방지)

4. **`coup/src/components/ErrorBoundary.jsx`** ⭐⭐⭐ (3시간)
   - React 에러 바운더리
   - 에러 로깅
   - 폴백 UI
   - 재시도 버튼

5. **`coup/src/lib/api-retry.js`** ⭐⭐⭐ (3시간)
   - API 재시도 로직
   - 지수 백오프
   - 최대 재시도 횟수 제한
   - 재시도 가능 오류 판별

**총 소요: 16시간**

### 수정 필요 (6개)

1. **`coup/src/app/api/dashboard/route.js`** ⭐⭐⭐ (4시간)
   - Prisma 에러 처리 강화
   - 부분 쿼리 실패 처리
   - 타임아웃 설정
   - 에러 응답 표준화
   - 로깅 추가

2. **`coup/src/components/dashboard/DashboardClient.jsx`** ⭐⭐⭐ (5시간)
   - React Query 에러 핸들링 강화
   - 재시도 버튼 추가
   - 에러 토스트 개선
   - 낙관적 업데이트 구현
   - null/undefined 방어

3. **`coup/src/components/dashboard/widgets/StudyStatus.jsx`** ⭐⭐⭐ (3시간)
   - 통계 계산 오류 방지
   - 출석률 계산 개선
   - 할일 완료율 계산 개선
   - 데이터 누락 처리

4. **`coup/src/components/dashboard/widgets/UrgentTasks.jsx`** ⭐⭐ (2시간)
   - 날짜 파싱 오류 처리
   - D-day 계산 개선
   - 정렬 로직 개선

5. **`coup/src/components/dashboard/widgets/QuickActions.jsx`** ⭐⭐ (2시간)
   - 권한 확인 로직
   - 오류 처리 개선
   - 비활성화 상태 표시

6. **`coup/src/lib/hooks/useApi.js`** ⭐⭐⭐ (3시간)
   - React Query 설정 최적화
   - 에러 핸들링 개선
   - 재시도 로직 추가
   - 캐시 설정 최적화

**총 소요: 19시간**

---

## 📊 구현 우선순위 요약

### Week 1-2: Critical 🔴 (45시간)
에러 바운더리 → API 안정성 → 데이터 검증 → 보안

### Week 3-4: Important 🟡 (56시간)
캐싱 → UX 개선 → 위젯 강화 → 모니터링

### Week 5-6: Nice-to-Have 🟢 (56시간)
성능 → 실시간 → 접근성 → 고급 기능

### Week 7+: Edge Cases 🔵 (40시간)
대량 데이터 → 네트워크 → 호환성 → 국제화

---

## 📝 특이사항

### 기술 스택
- **프레임워크**: Next.js 16 (App Router)
- **언어**: JavaScript (ES6+), TypeScript 미사용
- **데이터 페칭**: React Query (TanStack Query)
- **렌더링**: Server Components + Client Components
- **데이터베이스**: Prisma ORM
- **인증**: NextAuth.js v5 + requireAuth

### 현재 구현 현황

#### ✅ 잘 구현된 부분
1. **하이브리드 렌더링**: Server/Client 컴포넌트 분리
2. **React Query 활용**: 캐싱 및 자동 갱신
3. **로딩 스켈레톤**: DashboardSkeleton 컴포넌트
4. **빈 상태 처리**: EmptyState 컴포넌트
5. **위젯 모듈화**: 5개 독립 위젯
6. **인증 체계**: 서버/클라이언트 인증 확인

#### ⚠️ 개선 필요한 부분
1. **에러 처리**: 기본 에러 처리만 있음
2. **데이터 검증**: null/undefined 방어 부족
3. **통계 계산**: 0 나누기 등 엣지 케이스 미처리
4. **React Query 설정**: 에러 핸들링, 재시도 미흡
5. **보안**: XSS 방어 확인 필요
6. **로깅**: 표준화된 로깅 부족

#### ❌ 미구현 부분
1. **에러 바운더리**: React 에러 바운더리 없음
2. **재시도 로직**: API 재시도 메커니즘 없음
3. **낙관적 업데이트**: 즉각적인 UI 피드백 부족
4. **WebSocket**: 실시간 동기화 미구현
5. **성능 최적화**: React.memo, useMemo 미사용
6. **모니터링**: 에러 트래킹, 메트릭 수집 없음

### 보안 고려사항

#### 현재 안전한 것 ✅
- requireAuth 인증 확인
- Prisma ORM 사용 (SQL Injection 방어)
- 세션 기반 인증

#### 개선 필요한 것 ⚠️
- 공지/메시지 XSS 방어 확인
- 민감 정보 노출 방지 (에러 메시지)
- CSRF 토큰 검증
- API 응답 데이터 검증

### 데이터 일관성

#### 주의 필요한 시나리오
1. **부분 쿼리 실패**: 일부 통계만 실패 시 처리
2. **통계 계산 오류**: 0 나누기, NaN, Infinity
3. **날짜 파싱 실패**: 잘못된 날짜 형식
4. **캐시 불일치**: 다른 탭에서 데이터 변경
5. **동시 요청**: 여러 쿼리 동시 실행

---

## 📈 구현 진행 상황

### 전체 진행률
```
■■□□□□□□□□□□□□□□□□□□ 12.5% (10/80)

구현됨:    ■■□□□□□□□□□□□□□□□□□□ 10개
미구현:    □□□□□□□□□□□□□□□□□□□□ 70개
```

### 영역별 진행률

| 영역 | 구현 | 미구현 | 진행률 |
|------|------|--------|--------|
| API 라우트 | 2 | 13 | 13% |
| 서버 컴포넌트 | 1 | 2 | 33% |
| 클라이언트 컴포넌트 | 4 | 15 | 21% |
| 위젯 | 3 | 15 | 17% |
| React Query | 0 | 10 | 0% |
| 에러 처리 | 0 | 8 | 0% |
| 보안 | 0 | 3 | 0% |
| 성능 | 0 | 10 | 0% |
| 접근성 | 0 | 4 | 0% |

---

## 🎯 다음 단계

### Step 3-2: Critical 구현 (2주)
1. 유틸리티 파일 생성 (5개, 16시간)
2. Critical 예외 처리 구현 (20개, 45시간)
3. 테스트 및 검증

### 예상 일정
- **총 소요**: 61시간 (약 8일)
- **시작**: 2025-12-01
- **완료 예상**: 2025-12-09

---

## 📋 주요 차이점 (vs study 영역)

### dashboard 영역 특징

1. **단순한 구조**
   - API 라우트: 1개 (study: 28개)
   - 주요 기능: 데이터 조회 및 표시
   - 복잡한 비즈니스 로직 없음

2. **클라이언트 중심**
   - React Query 활용
   - 실시간 업데이트 필요
   - 사용자 인터랙션 많음

3. **성능 중요**
   - 첫 페이지 로딩 속도
   - 리렌더링 최적화
   - 캐싱 전략

4. **UX 중요도 높음**
   - 로딩 상태
   - 빈 상태
   - 에러 상태
   - 실시간 피드백

### study 영역과의 비교

| 항목 | dashboard | study |
|------|-----------|-------|
| API 라우트 | 1개 | 28개 |
| 예외 문서 | 7개 | 13개 |
| 구현률 | 12.5% | 29% |
| 주요 관심사 | 성능, UX | 권한, 데이터 무결성 |
| 복잡도 | 낮음 | 높음 |
| 우선순위 | P1 | P0 |

---

**작성자**: GitHub Copilot  
**다음 작업**: Step 3-2 - dashboard 영역 Critical 구현

