# 대시보드 모범 사례

대시보드 개발 시 따라야 할 모범 사례, 코딩 규칙, 패턴을 정리합니다.

---

## 📋 목차

1. [에러 핸들링 패턴](#에러-핸들링-패턴)
2. [로딩 상태 관리](#로딩-상태-관리)
3. [데이터 관리](#데이터-관리)
4. [컴포넌트 구조](#컴포넌트-구조)
5. [테스트 전략](#테스트-전략)
6. [접근성 (A11y)](#접근성-a11y)
7. [보안](#보안)

---

## 에러 핸들링 패턴

### 1. 계층별 에러 처리

```
API Layer → React Query → Component → UI
```

#### API Layer
```javascript
// coup/src/lib/api.js
const api = {
  async get(url, params) {
    try {
      const response = await fetch(url, { /* ... */ })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      // 로깅
      console.error('[API Error]', url, error)
      
      // 에러 변환
      throw new ApiError(error.message, error.status)
    }
  }
}
```

#### React Query Layer
```javascript
// coup/src/lib/hooks/useApi.js
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard'),
    retry: (failureCount, error) => {
      // 401, 403은 재시도 안 함
      if ([401, 403].includes(error?.status)) return false
      return failureCount < 3
    },
    onError: (error) => {
      // 전역 에러 처리
      console.error('[Dashboard Query Error]', error)
    }
  })
}
```

#### Component Layer
```jsx
export default function DashboardClient() {
  const { data, isLoading, error, refetch } = useDashboard()

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={refetch}
      />
    )
  }

  // ...
}
```

### 2. 에러 바운더리 사용

```jsx
// coup/src/app/dashboard/page.jsx
import ErrorBoundary from '@/components/ErrorBoundary'

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/sign-in')
  }

  return (
    <ErrorBoundary>
      <DashboardClient user={session.user} />
    </ErrorBoundary>
  )
}
```

### 3. 사용자 친화적 에러 메시지

```javascript
const ERROR_MESSAGES = {
  NETWORK_ERROR: '인터넷 연결을 확인해주세요',
  AUTH_ERROR: '로그인이 필요합니다',
  SERVER_ERROR: '일시적인 오류가 발생했습니다',
  NOT_FOUND: '요청한 데이터를 찾을 수 없습니다',
  TIMEOUT: '요청 시간이 초과되었습니다',
}

function getErrorMessage(error) {
  if (error?.status === 401) return ERROR_MESSAGES.AUTH_ERROR
  if (error?.status === 404) return ERROR_MESSAGES.NOT_FOUND
  if (error?.status >= 500) return ERROR_MESSAGES.SERVER_ERROR
  if (error?.message === 'Network Error') return ERROR_MESSAGES.NETWORK_ERROR
  
  return ERROR_MESSAGES.SERVER_ERROR
}
```

---

## 로딩 상태 관리

### 1. 스켈레톤 UI 우선

```jsx
// ✅ 좋은 예
if (isLoading) {
  return <DashboardSkeleton />
}

// ❌ 나쁜 예
if (isLoading) {
  return <div>Loading...</div>
}
```

### 2. 점진적 로딩

```jsx
export default function DashboardClient() {
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard()
  const { data: userData, isLoading: userLoading } = useMe()

  return (
    <div>
      {/* 사용자 정보 - 독립적 로딩 */}
      {userLoading ? (
        <UserInfoSkeleton />
      ) : (
        <UserInfo user={userData?.user} />
      )}

      {/* 통계 카드 - 독립적 로딩 */}
      {dashboardLoading ? (
        <StatsCardsSkeleton />
      ) : (
        <StatsCards stats={dashboardData?.data?.stats} />
      )}
    </div>
  )
}
```

### 3. 낙관적 UI 업데이트

```jsx
const { mutate: markAsRead } = useMutation({
  mutationFn: (id) => api.post(`/api/notifications/${id}/read`),
  onMutate: async (id) => {
    // 즉시 UI 업데이트
    await queryClient.cancelQueries(['dashboard'])
    const previous = queryClient.getQueryData(['dashboard'])
    
    queryClient.setQueryData(['dashboard'], (old) => ({
      ...old,
      stats: {
        ...old.stats,
        unreadNotifications: old.stats.unreadNotifications - 1
      }
    }))
    
    return { previous }
  },
  onError: (err, id, context) => {
    // 실패 시 롤백
    queryClient.setQueryData(['dashboard'], context.previous)
  }
})
```

---

## 데이터 관리

### 1. React Query 설정

```javascript
// coup/src/app/providers.js
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale 시간
      staleTime: 5 * 60 * 1000, // 5분
      // 캐시 시간
      cacheTime: 10 * 60 * 1000, // 10분
      // 재시도
      retry: 1,
      // 포커스 시 갱신
      refetchOnWindowFocus: true,
      // 마운트 시 갱신
      refetchOnMount: true,
    },
    mutations: {
      // 에러 시 재시도 안 함
      retry: false,
    },
  },
})
```

### 2. 캐시 키 네이밍 규칙

```javascript
// ✅ 좋은 예: 계층적 구조
['dashboard'] // 전체 대시보드
['dashboard', 'stats'] // 대시보드 통계만
['dashboard', userId] // 특정 사용자 대시보드
['dashboard', userId, 'widgets'] // 특정 사용자의 위젯

// ❌ 나쁜 예: 일관성 없음
['getDashboard']
['dashboard_data']
['dash']
```

### 3. 캐시 무효화 전략

```javascript
// 할일 완료 시
export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId) => api.post(`/api/tasks/${taskId}/complete`),
    onSuccess: () => {
      // 관련된 모든 쿼리 무효화
      queryClient.invalidateQueries(['dashboard'])
      queryClient.invalidateQueries(['tasks'])
      queryClient.invalidateQueries(['user', 'stats'])
    }
  })
}
```

---

## 컴포넌트 구조

### 1. 컨테이너/프레젠테이셔널 패턴

```jsx
// 컨테이너 컴포넌트 (로직)
export default function DashboardClient({ user }) {
  const { data, isLoading, error } = useDashboard()

  if (isLoading) return <DashboardSkeleton />
  if (error) return <ErrorState error={error} />

  return (
    <DashboardView 
      stats={data.stats}
      studies={data.myStudies}
      activities={data.recentActivities}
      events={data.upcomingEvents}
    />
  )
}

// 프레젠테이셔널 컴포넌트 (UI)
function DashboardView({ stats, studies, activities, events }) {
  return (
    <div className={styles.container}>
      <StatsCards stats={stats} />
      <StudiesList studies={studies} />
      <ActivitiesList activities={activities} />
      <EventsList events={events} />
    </div>
  )
}
```

### 2. 합성(Composition) 패턴

```jsx
// ✅ 좋은 예: 합성
<Card>
  <Card.Header>
    <Card.Title>스터디 현황</Card.Title>
  </Card.Header>
  <Card.Body>
    <StudyStatus stats={stats} />
  </Card.Body>
  <Card.Footer>
    <Link href="/studies">전체 보기</Link>
  </Card.Footer>
</Card>

// ❌ 나쁜 예: props 지옥
<Card
  title="스터디 현황"
  body={<StudyStatus stats={stats} />}
  footer={<Link href="/studies">전체 보기</Link>}
  showHeader={true}
  showFooter={true}
/>
```

### 3. 커스텀 훅 패턴

```jsx
// coup/src/lib/hooks/useDashboardData.js
export function useDashboardData() {
  const { data: dashboardData, isLoading, error } = useDashboard()
  const { data: userData } = useMe()

  const stats = dashboardData?.data?.stats || DEFAULT_STATS
  const myStudies = dashboardData?.data?.myStudies || []
  const user = userData?.user || null

  // 계산된 값
  const urgentTasks = useMemo(() => {
    return dashboardData?.data?.tasks?.filter(/* ... */) || []
  }, [dashboardData?.data?.tasks])

  return {
    stats,
    myStudies,
    urgentTasks,
    user,
    isLoading,
    error,
  }
}

// 사용
export default function DashboardClient() {
  const { stats, myStudies, isLoading, error } = useDashboardData()

  if (isLoading) return <DashboardSkeleton />
  // ...
}
```

---

## 테스트 전략

### 1. 단위 테스트

```javascript
// __tests__/DashboardClient.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DashboardClient from '../DashboardClient'

describe('DashboardClient', () => {
  let queryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
  })

  it('로딩 중에 스켈레톤을 표시한다', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DashboardClient user={{ id: 1, name: 'Test' }} />
      </QueryClientProvider>
    )

    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument()
  })

  it('에러 발생 시 에러 상태를 표시한다', async () => {
    // Mock API error
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API Error'))
    )

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardClient user={{ id: 1, name: 'Test' }} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/데이터를 불러올 수 없습니다/)).toBeInTheDocument()
    })
  })
})
```

### 2. 통합 테스트

```javascript
// __tests__/dashboard-integration.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Dashboard Integration', () => {
  it('알림을 클릭하면 읽음 처리된다', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    // 알림 클릭
    const notification = screen.getByText('새로운 할일이 배정되었습니다')
    await user.click(notification)

    // 읽음 처리 확인
    await waitFor(() => {
      expect(screen.getByTestId('unread-count')).toHaveTextContent('11')
    })
  })
})
```

### 3. E2E 테스트 (Playwright)

```javascript
// e2e/dashboard.spec.js
import { test, expect } from '@playwright/test'

test('대시보드 전체 플로우', async ({ page }) => {
  // 로그인
  await page.goto('/sign-in')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  // 대시보드 로드
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('대시보드')

  // 통계 카드 확인
  await expect(page.locator('.stat-card')).toHaveCount(4)

  // 스터디 목록 확인
  await expect(page.locator('.study-card')).toBeVisible()
})
```

---

## 접근성 (A11y)

### 1. 시맨틱 HTML

```jsx
// ✅ 좋은 예
<header>
  <h1>대시보드</h1>
</header>
<main>
  <section aria-labelledby="stats-heading">
    <h2 id="stats-heading">통계</h2>
    <div className={styles.statsGrid}>
      {/* ... */}
    </div>
  </section>
</main>

// ❌ 나쁜 예
<div>
  <div className="header">대시보드</div>
  <div className="content">
    <div className="stats-title">통계</div>
    <div className={styles.statsGrid}>
      {/* ... */}
    </div>
  </div>
</div>
```

### 2. ARIA 속성

```jsx
// 로딩 상태
<div role="status" aria-live="polite">
  {isLoading && <span>데이터를 불러오는 중...</span>}
</div>

// 알림 카운트
<span 
  className={styles.badge}
  role="status"
  aria-label={`읽지 않은 알림 ${unreadCount}개`}
>
  {unreadCount}
</span>

// 프로그레스 바
<div
  role="progressbar"
  aria-valuenow={attendanceRate}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="출석률"
>
  <div style={{ width: `${attendanceRate}%` }} />
</div>
```

### 3. 키보드 네비게이션

```jsx
export default function StudyCard({ study }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      router.push(`/my-studies/${study.id}`)
    }
  }

  return (
    <div
      className={styles.studyCard}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => router.push(`/my-studies/${study.id}`)}
    >
      {/* 카드 내용 */}
    </div>
  )
}
```

### 4. 포커스 관리

```jsx
import { useRef, useEffect } from 'react'

export default function ErrorState({ error, onRetry }) {
  const retryButtonRef = useRef(null)

  // 에러 발생 시 포커스 이동
  useEffect(() => {
    if (error && retryButtonRef.current) {
      retryButtonRef.current.focus()
    }
  }, [error])

  return (
    <div>
      <p>{error.message}</p>
      <button ref={retryButtonRef} onClick={onRetry}>
        다시 시도
      </button>
    </div>
  )
}
```

---

## 보안

### 1. XSS 방지

```jsx
// ✅ 안전: React가 자동으로 이스케이프
<div>{user.name}</div>

// ⚠️ 위험: HTML 직접 삽입
<div dangerouslySetInnerHTML={{ __html: user.bio }} />

// ✅ 안전: DOMPurify 사용
import DOMPurify from 'dompurify'

<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(user.bio) 
}} />
```

### 2. CSRF 방지

```javascript
// coup/src/lib/api.js
const api = {
  async post(url, data) {
    // CSRF 토큰 포함
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(data),
    })
  }
}
```

### 3. 민감 정보 보호

```jsx
// ❌ 나쁜 예: 콘솔에 민감 정보 로깅
console.log('User:', user)

// ✅ 좋은 예: 민감 정보 제거
console.log('User:', {
  id: user.id,
  name: user.name,
  // email, password 등은 제외
})

// 프로덕션에서 로깅 비활성화
if (process.env.NODE_ENV === 'development') {
  console.log('User:', user)
}
```

### 4. 권한 확인

```jsx
// 클라이언트 측 권한 확인 (UI만)
{isAdmin && (
  <Link href="/admin">관리자 페이지</Link>
)}

// 서버 측 권한 확인 (필수)
// coup/src/app/api/admin/route.js
export async function GET() {
  const session = await getSession()
  
  // 권한 확인
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: '권한이 없습니다' },
      { status: 403 }
    )
  }
  
  // ...
}
```

---

## 코딩 규칙

### 1. 파일 네이밍

```
// 컴포넌트: PascalCase
DashboardClient.jsx
EmptyState.jsx

// 훅: camelCase
useDashboard.js
useOnlineStatus.js

// 유틸: camelCase
formatDate.js
calculateDday.js

// 스타일: 컴포넌트명.module.css
DashboardClient.module.css
EmptyState.module.css
```

### 2. 주석 작성

```jsx
/**
 * 대시보드 클라이언트 컴포넌트
 * 
 * @param {Object} user - 사용자 정보
 * @param {number} user.id - 사용자 ID
 * @param {string} user.name - 사용자 이름
 */
export default function DashboardClient({ user }) {
  // 대시보드 데이터 페칭
  const { data, isLoading, error } = useDashboard()

  // TODO: 위젯 데이터 API 구현 필요
  const widgetData = null

  // ...
}
```

### 3. 린팅 규칙

```javascript
// .eslintrc.js
module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // 사용하지 않는 변수 금지
    'no-unused-vars': 'error',
    // console.log 경고 (프로덕션)
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // React Hook 의존성 검사
    'react-hooks/exhaustive-deps': 'warn',
  },
}
```

---

## 체크리스트

새 기능 추가 시:

- [ ] 에러 핸들링 구현
- [ ] 로딩 상태 처리 (스켈레톤 UI)
- [ ] 빈 상태 처리
- [ ] React Query 캐시 키 설정
- [ ] 성능 최적화 (memo, useMemo, useCallback)
- [ ] 단위 테스트 작성
- [ ] 접근성 확인 (ARIA, 키보드)
- [ ] 보안 검토 (XSS, 권한)
- [ ] 코드 리뷰 요청

---

**다음 문서**: [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)

