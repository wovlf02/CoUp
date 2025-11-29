# 대시보드 예외 처리 색인

빠르게 원하는 해결 방법을 찾을 수 있도록 증상별, 카테고리별로 정리했습니다.

---

## 📋 목차

1. [증상별 찾기](#증상별-찾기)
2. [카테고리별 찾기](#카테고리별-찾기)
3. [컴포넌트별 찾기](#컴포넌트별-찾기)
4. [빠른 해결 가이드](#빠른-해결-가이드)

---

## 증상별 찾기

### 🔴 데이터 로딩 문제

| 증상 | 가능한 원인 | 문서 링크 |
|------|------------|----------|
| "데이터를 불러올 수 없습니다" 표시 | API 요청 실패 | [01 > API 요청 실패](./01-data-loading-exceptions.md#api-요청-실패) |
| 페이지가 계속 로딩 중 (무한 스피너) | 무한 로딩 루프 | [01 > 무한 로딩](./01-data-loading-exceptions.md#무한-로딩) |
| 통계 카드가 모두 0으로 표시됨 | 데이터베이스 쿼리 오류 | [01 > 부분 데이터 로딩](./01-data-loading-exceptions.md#부분-데이터-로딩) |
| 일부 섹션만 로딩되지 않음 | 특정 API 실패 | [01 > 부분 실패 처리](./01-data-loading-exceptions.md#부분-실패-처리) |
| 데이터 로딩이 너무 느림 (5초 이상) | 타임아웃 | [01 > 타임아웃 처리](./01-data-loading-exceptions.md#타임아웃-처리) |
| 새로고침해도 데이터가 안 바뀜 | 캐시 문제 | [03 > 캐시 무효화](./03-real-time-sync-exceptions.md#캐시-무효화) |
| 다른 탭에서 수정했는데 반영 안 됨 | Stale 데이터 | [03 > Stale 데이터](./03-real-time-sync-exceptions.md#stale-데이터) |

### 🟡 위젯 문제

| 증상 | 가능한 원인 | 문서 링크 |
|------|------------|----------|
| StudyStatus 위젯이 빈 화면 | 데이터 없음 | [02 > StudyStatus](./02-widget-exceptions.md#studystatus-위젯) |
| 출석률이 계산되지 않음 | 0으로 나누기 오류 | [02 > 출석률 계산](./02-widget-exceptions.md#출석률-계산-오류) |
| OnlineMembers가 업데이트 안 됨 | WebSocket 연결 끊김 | [02 > OnlineMembers](./02-widget-exceptions.md#onlinemembers-위젯) |
| QuickActions 버튼 클릭 안 됨 | 권한 오류 | [02 > QuickActions](./02-widget-exceptions.md#quickactions-위젯) |
| UrgentTasks가 표시 안 됨 | 할일 쿼리 실패 | [02 > UrgentTasks](./02-widget-exceptions.md#urgenttasks-위젯) |
| PinnedNotice가 로딩 중 | 공지 API 느림 | [02 > PinnedNotice](./02-widget-exceptions.md#pinnednotice-위젯) |
| 위젯 데이터가 오래됨 | 자동 갱신 실패 | [03 > refetchInterval](./03-real-time-sync-exceptions.md#자동-갱신-실패) |

### 🟢 빈 상태 (Empty State)

| 증상 | 가능한 원인 | 문서 링크 |
|------|------------|----------|
| "참여 중인 스터디가 없습니다" | 신규 사용자 | [04 > 스터디 없음](./04-empty-states.md#스터디-없음) |
| "활동 내역이 없습니다" | 최근 활동 없음 | [04 > 활동 없음](./04-empty-states.md#활동-없음) |
| "다가오는 일정이 없습니다" | 일정 없음 | [04 > 일정 없음](./04-empty-states.md#일정-없음) |
| 빈 상태 CTA 버튼이 안 보임 | CSS 문제 | [04 > CTA 버튼](./04-empty-states.md#cta-버튼-디자인) |

### 🔵 성능 문제

| 증상 | 가능한 원인 | 문서 링크 |
|------|------------|----------|
| 페이지가 느리게 렌더링됨 | 불필요한 리렌더링 | [05 > 렌더링 최적화](./05-performance-optimization.md#렌더링-최적화) |
| 메모리 사용량이 계속 증가 | 메모리 누수 | [05 > 메모리 관리](./05-performance-optimization.md#메모리-관리) |
| 스크롤이 버벅임 | 렌더링 블로킹 | [05 > 스크롤 성능](./05-performance-optimization.md#스크롤-최적화) |
| 첫 로딩이 느림 (3초 이상) | 직렬 요청 | [05 > 병렬 로딩](./05-performance-optimization.md#병렬-로딩) |

### 🟣 실시간 동기화 문제

| 증상 | 가능한 원인 | 문서 링크 |
|------|------------|----------|
| 알림 수가 실시간 업데이트 안 됨 | React Query 설정 | [03 > 자동 갱신](./03-real-time-sync-exceptions.md#자동-갱신) |
| WebSocket 연결 끊김 | 네트워크 불안정 | [03 > WebSocket 재연결](./03-real-time-sync-exceptions.md#websocket-재연결) |
| 낙관적 업데이트 실패 | 롤백 로직 오류 | [03 > 낙관적 업데이트](./03-real-time-sync-exceptions.md#낙관적-업데이트) |

---

## 카테고리별 찾기

### 📡 API 및 데이터 페칭

**문서**: [01-data-loading-exceptions.md](./01-data-loading-exceptions.md)

- API 요청 실패
- 네트워크 오류
- 타임아웃
- 부분 데이터 로딩
- 캐싱 문제
- 재시도 로직
- 에러 바운더리

### 🎨 UI 컴포넌트

**문서**: [02-widget-exceptions.md](./02-widget-exceptions.md)

- StudyStatus 위젯
- OnlineMembers 위젯
- QuickActions 위젯
- UrgentTasks 위젯
- PinnedNotice 위젯
- 위젯 로딩 상태
- 위젯 에러 처리

### 🔄 실시간 기능

**문서**: [03-real-time-sync-exceptions.md](./03-real-time-sync-exceptions.md)

- React Query 캐싱
- 자동 갱신 (refetchInterval)
- WebSocket 연결
- 낙관적 업데이트
- 캐시 무효화
- Stale 데이터 처리

### 📭 빈 상태 & UX

**문서**: [04-empty-states.md](./04-empty-states.md)

- 스터디 없음
- 활동 없음
- 일정 없음
- 할일 없음
- 알림 없음
- CTA 버튼 디자인
- 일러스트레이션

### ⚡ 성능 최적화

**문서**: [05-performance-optimization.md](./05-performance-optimization.md)

- 렌더링 최적화
- React.memo
- useMemo, useCallback
- 코드 스플리팅
- 병렬 로딩
- 메모리 관리
- 이벤트 리스너 정리

---

## 컴포넌트별 찾기

### Server Component

| 컴포넌트 | 파일 | 관련 문서 |
|---------|------|----------|
| DashboardPage | `app/dashboard/page.jsx` | [01](./01-data-loading-exceptions.md) |

### Client Component

| 컴포넌트 | 파일 | 관련 문서 |
|---------|------|----------|
| DashboardClient | `components/dashboard/DashboardClient.jsx` | [01](./01-data-loading-exceptions.md), [05](./05-performance-optimization.md) |
| DashboardSkeleton | `components/dashboard/DashboardSkeleton.jsx` | [01](./01-data-loading-exceptions.md) |
| EmptyState | `components/dashboard/EmptyState.jsx` | [04](./04-empty-states.md) |

### Widgets

| 위젯 | 파일 | 관련 문서 |
|------|------|----------|
| StudyStatus | `components/dashboard/widgets/StudyStatus.jsx` | [02](./02-widget-exceptions.md) |
| OnlineMembers | `components/dashboard/widgets/OnlineMembers.jsx` | [02](./02-widget-exceptions.md), [03](./03-real-time-sync-exceptions.md) |
| QuickActions | `components/dashboard/widgets/QuickActions.jsx` | [02](./02-widget-exceptions.md) |
| UrgentTasks | `components/dashboard/widgets/UrgentTasks.jsx` | [02](./02-widget-exceptions.md) |
| PinnedNotice | `components/dashboard/widgets/PinnedNotice.jsx` | [02](./02-widget-exceptions.md) |

### API Routes

| 엔드포인트 | 파일 | 관련 문서 |
|-----------|------|----------|
| GET /api/dashboard | `app/api/dashboard/route.js` | [01](./01-data-loading-exceptions.md) |

### Hooks

| 훅 | 파일 | 관련 문서 |
|----|------|----------|
| useDashboard | `lib/hooks/useApi.js` | [01](./01-data-loading-exceptions.md), [03](./03-real-time-sync-exceptions.md) |
| useMe | `lib/hooks/useApi.js` | [01](./01-data-loading-exceptions.md) |

---

## 빠른 해결 가이드

### 🚨 긴급 상황 (프로덕션 이슈)

#### 1. 대시보드가 완전히 작동 안 함

```bash
# 1. API 상태 확인
curl -X GET http://localhost:3000/api/dashboard \
  -H "Cookie: next-auth.session-token=..."

# 2. 데이터베이스 연결 확인
node coup/test-db.js

# 3. 서버 로그 확인
tail -f logs/error.log
```

**해결 문서**: [01-data-loading-exceptions.md#api-요청-실패](./01-data-loading-exceptions.md#api-요청-실패)

#### 2. 데이터가 로드되지만 표시 안 됨

```javascript
// 브라우저 콘솔에서 확인
console.log('Dashboard Data:', window.__NEXT_DATA__)

// React Query DevTools 확인
// 1. 브라우저 하단의 React Query 아이콘 클릭
// 2. 'dashboard' 쿼리 찾기
// 3. 데이터 구조 확인
```

**해결 문서**: [01-data-loading-exceptions.md#부분-데이터-로딩](./01-data-loading-exceptions.md#부분-데이터-로딩)

#### 3. 성능 문제 (느림, 버벅임)

```javascript
// React DevTools Profiler 사용
// 1. React DevTools 설치
// 2. Profiler 탭 열기
// 3. Record 버튼 클릭
// 4. 페이지 사용
// 5. Stop 후 분석
```

**해결 문서**: [05-performance-optimization.md#성능-프로파일링](./05-performance-optimization.md#성능-프로파일링)

---

### 🔧 일반적인 문제 해결 순서

#### Step 1: 로그 확인

```javascript
// 클라이언트 로그
console.log('🔍 Dashboard Data:', dashboardData)
console.log('🔍 Is Loading:', isLoading)
console.log('🔍 Error:', error)

// 서버 로그
// coup/src/app/api/dashboard/route.js 에서 확인
console.log('🔐 [DASHBOARD] User ID:', userId)
console.log('🔐 [DASHBOARD] Query Results:', results)
```

#### Step 2: React Query DevTools 확인

```jsx
// coup/src/app/providers.js 에서 이미 설정됨
<QueryClientProvider client={queryClient}>
  <ReactQueryDevtools initialIsOpen={false} />
  {children}
</QueryClientProvider>
```

1. 브라우저 하단의 React Query 아이콘 클릭
2. `['dashboard']` 쿼리 찾기
3. 상태 확인: `success`, `error`, `loading`
4. 데이터 확인

#### Step 3: 네트워크 탭 확인

1. 브라우저 DevTools 열기 (F12)
2. Network 탭 선택
3. `/api/dashboard` 요청 찾기
4. Status Code 확인
5. Response 확인

#### Step 4: 문서에서 해결책 찾기

- API 오류 → [01-data-loading-exceptions.md](./01-data-loading-exceptions.md)
- 위젯 오류 → [02-widget-exceptions.md](./02-widget-exceptions.md)
- 캐시 오류 → [03-real-time-sync-exceptions.md](./03-real-time-sync-exceptions.md)
- 빈 상태 → [04-empty-states.md](./04-empty-states.md)
- 성능 → [05-performance-optimization.md](./05-performance-optimization.md)

---

### 📖 코드 예제별 찾기

| 원하는 기능 | 코드 예제 위치 |
|-----------|--------------|
| 에러 핸들링 | [01 > 에러 바운더리](./01-data-loading-exceptions.md#에러-바운더리) |
| 재시도 로직 | [01 > 재시도 메커니즘](./01-data-loading-exceptions.md#재시도-메커니즘) |
| 로딩 스켈레톤 | [01 > 스켈레톤 UI](./01-data-loading-exceptions.md#스켈레톤-ui) |
| 빈 상태 UI | [04 > EmptyState 컴포넌트](./04-empty-states.md#emptystate-컴포넌트) |
| 낙관적 업데이트 | [03 > Optimistic Updates](./03-real-time-sync-exceptions.md#낙관적-업데이트) |
| React.memo | [05 > 메모이제이션](./05-performance-optimization.md#메모이제이션) |
| 캐시 무효화 | [03 > Invalidate Queries](./03-real-time-sync-exceptions.md#캐시-무효화) |

---

### 🎯 시나리오별 가이드

#### 신규 개발자 온보딩

1. [README.md](./README.md) - 전체 개요 파악
2. [01-data-loading-exceptions.md](./01-data-loading-exceptions.md) - 기본 데이터 흐름
3. [99-best-practices.md](./99-best-practices.md) - 코딩 규칙

#### 버그 수정

1. **증상별 찾기** 에서 해당 증상 검색
2. 링크된 문서의 "해결 방법" 섹션 참조
3. 코드 예제 적용
4. 테스트

#### 새 기능 추가

1. [99-best-practices.md](./99-best-practices.md) - 모범 사례 확인
2. [05-performance-optimization.md](./05-performance-optimization.md) - 성능 고려사항
3. 기존 컴포넌트 패턴 참고

#### 성능 개선

1. [05-performance-optimization.md](./05-performance-optimization.md) - 전체 읽기
2. React DevTools Profiler 사용
3. 병목 지점 식별
4. 최적화 적용

---

## 자주 묻는 질문 (FAQ)

### Q1: 대시보드 데이터를 강제로 새로고침하려면?

```javascript
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// 방법 1: 특정 쿼리만 무효화
queryClient.invalidateQueries(['dashboard'])

// 방법 2: 강제 refetch
const { refetch } = useDashboard()
refetch()
```

**참고**: [03-real-time-sync-exceptions.md#수동-새로고침](./03-real-time-sync-exceptions.md#수동-새로고침)

### Q2: 위젯 데이터만 별도로 가져오려면?

```javascript
// 현재는 /api/dashboard 에서 모든 데이터를 한 번에 가져옴
// 위젯별 별도 API가 필요하면:

// 1. 새 API 엔드포인트 생성
// GET /api/dashboard/widgets/study-status

// 2. 새 Hook 생성
export function useStudyStatusWidget() {
  return useQuery({
    queryKey: ['dashboard', 'widgets', 'study-status'],
    queryFn: () => api.get('/api/dashboard/widgets/study-status'),
  })
}
```

**참고**: [02-widget-exceptions.md#위젯-최적화](./02-widget-exceptions.md#위젯-최적화)

### Q3: 빈 상태 메시지를 커스터마이즈하려면?

```jsx
<EmptyState
  icon="📚"
  title="맞춤 제목"
  description="맞춤 설명"
  actionText="맞춤 버튼"
  actionHref="/custom-link"
/>
```

**참고**: [04-empty-states.md#커스터마이즈](./04-empty-states.md#커스터마이즈)

### Q4: 실시간 업데이트 간격을 변경하려면?

```javascript
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard'),
    refetchInterval: 30000, // 30초마다 자동 갱신 (기본값: false)
  })
}
```

**참고**: [03-real-time-sync-exceptions.md#자동-갱신-설정](./03-real-time-sync-exceptions.md#자동-갱신-설정)

---

## 관련 리소스

### 외부 문서

- [React Query 공식 문서](https://tanstack.com/query/latest)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Prisma 공식 문서](https://www.prisma.io/docs)

### 내부 문서

- [인증 예외 처리](../auth/README.md)
- [API 엔드포인트 가이드](../../api/README.md)
- [데이터베이스 스키마](../../../coup/prisma/schema.prisma)

---

**마지막 업데이트**: 2025-11-29  
**버전**: 1.0.0

