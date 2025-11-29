# 데이터 로딩 예외 처리

대시보드 데이터 로딩 시 발생할 수 있는 모든 예외 상황과 처리 방법을 다룹니다.

---

## 📋 목차

1. [API 요청 실패](#api-요청-실패)
2. [네트워크 오류](#네트워크-오류)
3. [타임아웃 처리](#타임아웃-처리)
4. [부분 데이터 로딩](#부분-데이터-로딩)
5. [무한 로딩](#무한-로딩)
6. [캐싱 문제](#캐싱-문제)
7. [재시도 메커니즘](#재시도-메커니즘)
8. [에러 바운더리](#에러-바운더리)
9. [스켈레톤 UI](#스켈레톤-ui)

---

## API 요청 실패

### 증상

- "데이터를 불러올 수 없습니다" 메시지 표시
- 통계 카드가 표시되지 않음
- 빈 화면

### 원인

1. **서버 오류 (500)**
   ```javascript
   // coup/src/app/api/dashboard/route.js
   return NextResponse.json(
     { error: "대시보드 데이터를 가져오는 중 오류가 발생했습니다" },
     { status: 500 }
   )
   ```

2. **인증 실패 (401)**
   ```javascript
   // 세션이 만료되었거나 없는 경우
   const session = await requireAuth()
   if (session instanceof NextResponse) return session // 401 반환
   ```

3. **데이터베이스 연결 실패**
   ```javascript
   try {
     const result = await prisma.studyMember.count(...)
   } catch (error) {
     console.error('Database error:', error)
     // 500 에러 반환
   }
   ```

### 해결 방법

#### 1. 클라이언트 측 에러 핸들링

**현재 코드** (`DashboardClient.jsx`):
```jsx
export default function DashboardClient({ user: initialUser }) {
  const { data: dashboardData, isLoading } = useDashboard()
  const { data: userData, isLoading: userLoading } = useMe()

  if (isLoading || userLoading) {
    return <DashboardSkeleton />
  }

  if (!dashboardData?.data) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <EmptyState
            icon="⚠️"
            title="데이터를 불러올 수 없습니다"
            description="잠시 후 다시 시도해주세요"
          />
        </div>
      </div>
    )
  }
  // ...
}
```

**개선된 코드**:
```jsx
export default function DashboardClient({ user: initialUser }) {
  const { 
    data: dashboardData, 
    isLoading, 
    error,
    refetch 
  } = useDashboard()
  
  const { 
    data: userData, 
    isLoading: userLoading,
    error: userError 
  } = useMe()

  // 로딩 상태
  if (isLoading || userLoading) {
    return <DashboardSkeleton />
  }

  // 에러 상태 - 구체적인 처리
  if (error || userError) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <ErrorState 
            icon="⚠️"
            title="데이터를 불러올 수 없습니다"
            description={getErrorMessage(error || userError)}
            onRetry={refetch}
            showRetryButton={true}
          />
        </div>
      </div>
    )
  }

  // 데이터 없음 (빈 응답)
  if (!dashboardData?.data) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <EmptyState
            icon="📭"
            title="표시할 데이터가 없습니다"
            description="스터디에 참여하고 활동을 시작해보세요!"
            actionText="스터디 탐색하기"
            actionHref="/studies"
          />
        </div>
      </div>
    )
  }

  const user = userData?.user || initialUser
  // 정상 렌더링...
}

// 에러 메시지 변환 함수
function getErrorMessage(error) {
  if (!error) return "알 수 없는 오류가 발생했습니다"
  
  // HTTP 상태 코드별 처리
  if (error.response) {
    switch (error.response.status) {
      case 401:
        return "로그인이 필요합니다. 다시 로그인해주세요."
      case 403:
        return "접근 권한이 없습니다."
      case 404:
        return "요청한 데이터를 찾을 수 없습니다."
      case 500:
        return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      case 503:
        return "서비스를 일시적으로 사용할 수 없습니다."
      default:
        return "데이터를 불러오는 중 오류가 발생했습니다."
    }
  }
  
  // 네트워크 오류
  if (error.message === 'Network Error') {
    return "인터넷 연결을 확인해주세요."
  }
  
  return error.message || "알 수 없는 오류가 발생했습니다"
}
```

#### 2. ErrorState 컴포넌트 생성

**새 파일**: `coup/src/components/dashboard/ErrorState.jsx`
```jsx
'use client'

import styles from './ErrorState.module.css'

export default function ErrorState({ 
  icon = "⚠️",
  title = "오류가 발생했습니다",
  description = "잠시 후 다시 시도해주세요",
  onRetry,
  showRetryButton = true 
}) {
  return (
    <div className={styles.errorState}>
      <div className={styles.icon}>{icon}</div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      
      {showRetryButton && onRetry && (
        <button 
          onClick={onRetry}
          className={styles.retryButton}
        >
          🔄 다시 시도
        </button>
      )}
      
      <details className={styles.details}>
        <summary>개발자 정보</summary>
        <pre className={styles.code}>
          {JSON.stringify({
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          }, null, 2)}
        </pre>
      </details>
    </div>
  )
}
```

**CSS 파일**: `coup/src/components/dashboard/ErrorState.module.css`
```css
.errorState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
}

.icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--error-color, #dc2626);
  margin-bottom: 0.5rem;
}

.description {
  font-size: 1rem;
  color: var(--text-secondary, #6b7280);
  margin-bottom: 1.5rem;
}

.retryButton {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color, #3b82f6);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retryButton:hover {
  background: var(--primary-hover, #2563eb);
  transform: translateY(-1px);
}

.retryButton:active {
  transform: translateY(0);
}

.details {
  margin-top: 2rem;
  padding: 1rem;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 0.5rem;
  max-width: 600px;
}

.details summary {
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
}

.code {
  margin-top: 0.5rem;
  padding: 1rem;
  background: var(--bg-tertiary, #1f2937);
  color: var(--text-light, #f3f4f6);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  text-align: left;
  overflow-x: auto;
}
```

#### 3. API 측 에러 처리 개선

**현재 코드** (`coup/src/app/api/dashboard/route.js`):
```javascript
export async function GET() {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const userId = session.user.id
    // ... Prisma 쿼리 ...
    
    return NextResponse.json({
      success: true,
      data: { /* ... */ }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: "대시보드 데이터를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

**개선된 코드**:
```javascript
export async function GET() {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const userId = session.user.id
    console.log('🔐 [DASHBOARD] Fetching data for user:', userId)

    // 각 쿼리별 에러 핸들링
    const [
      activeStudyCount,
      taskCount,
      unreadNotificationCount,
      completedTaskCount
    ] = await Promise.allSettled([
      prisma.studyMember.count({
        where: { userId, status: 'ACTIVE' }
      }),
      prisma.task.count({
        where: { userId, completed: false }
      }),
      prisma.notification.count({
        where: { userId, isRead: false }
      }),
      prisma.task.count({
        where: {
          userId,
          completed: true,
          completedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ])

    // 각 결과 검증
    const stats = {
      activeStudies: activeStudyCount.status === 'fulfilled' 
        ? activeStudyCount.value 
        : 0,
      pendingTasks: taskCount.status === 'fulfilled' 
        ? taskCount.value 
        : 0,
      unreadNotifications: unreadNotificationCount.status === 'fulfilled' 
        ? unreadNotificationCount.value 
        : 0,
      completedThisMonth: completedTaskCount.status === 'fulfilled' 
        ? completedTaskCount.value 
        : 0,
    }

    // 일부 실패 로깅
    const failures = [
      activeStudyCount,
      taskCount,
      unreadNotificationCount,
      completedTaskCount
    ].filter(result => result.status === 'rejected')

    if (failures.length > 0) {
      console.warn('⚠️ [DASHBOARD] Some queries failed:', 
        failures.map(f => f.reason))
    }

    // 나머지 쿼리들...
    const myStudies = await prisma.studyMember.findMany({
      /* ... */
    }).catch(error => {
      console.error('❌ [DASHBOARD] myStudies query failed:', error)
      return []
    })

    const recentActivities = await prisma.notification.findMany({
      /* ... */
    }).catch(error => {
      console.error('❌ [DASHBOARD] recentActivities query failed:', error)
      return []
    })

    const upcomingEvents = await prisma.event.findMany({
      /* ... */
    }).catch(error => {
      console.error('❌ [DASHBOARD] upcomingEvents query failed:', error)
      return []
    })

    console.log('✅ [DASHBOARD] Data fetched successfully')

    return NextResponse.json({
      success: true,
      data: {
        stats,
        myStudies: myStudies.map(/* ... */),
        recentActivities: recentActivities.map(/* ... */),
        upcomingEvents: upcomingEvents.map(/* ... */)
      }
    })

  } catch (error) {
    console.error('❌ [DASHBOARD] Unexpected error:', error)
    
    // 상세 에러 로깅 (프로덕션에서는 로깅 서비스로 전송)
    console.error('Stack:', error.stack)
    console.error('User:', session?.user?.id)
    console.error('Time:', new Date().toISOString())
    
    return NextResponse.json(
      { 
        error: "대시보드 데이터를 가져오는 중 오류가 발생했습니다",
        code: 'DASHBOARD_FETCH_ERROR'
      },
      { status: 500 }
    )
  }
}
```

---

## 네트워크 오류

### 증상

- "인터넷 연결을 확인해주세요" 메시지
- 무한 로딩 (타임아웃까지)
- API 요청이 pending 상태

### 원인

1. **인터넷 연결 끊김**
2. **VPN 문제**
3. **방화벽 차단**
4. **서버 다운**

### 해결 방법

#### 1. React Query 재시도 설정

**파일**: `coup/src/app/providers.js`

```javascript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'

export default function Providers({ children, session }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          // 재시도 설정
          retry: (failureCount, error) => {
            // 401, 403, 404는 재시도 안 함
            if (error?.response?.status && 
                [401, 403, 404].includes(error.response.status)) {
              return false
            }
            // 최대 3번 재시도
            return failureCount < 3
          },
          retryDelay: (attemptIndex) => {
            // 지수 백오프: 1초, 2초, 4초
            return Math.min(1000 * 2 ** attemptIndex, 30000)
          },
          // Stale 시간 설정
          staleTime: 5 * 60 * 1000, // 5분
          // 캐시 시간 설정
          cacheTime: 10 * 60 * 1000, // 10분
          // 네트워크 오류 재시도
          networkMode: 'online',
        },
      },
    })
  )

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  )
}
```

#### 2. 온라인/오프라인 감지

**새 훅**: `coup/src/lib/hooks/useOnlineStatus.js`

```javascript
'use client'

import { useState, useEffect } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    function handleOnline() {
      console.log('✅ [NETWORK] Connection restored')
      setIsOnline(true)
    }

    function handleOffline() {
      console.warn('⚠️ [NETWORK] Connection lost')
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
```

**사용 예**:

```jsx
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'

export default function DashboardClient({ user }) {
  const isOnline = useOnlineStatus()
  const { data, isLoading, error } = useDashboard()

  // 오프라인 알림
  if (!isOnline) {
    return (
      <div className={styles.container}>
        <div className={styles.offlineBanner}>
          ⚠️ 인터넷 연결이 끊어졌습니다. 연결을 확인해주세요.
        </div>
        {/* 캐시된 데이터가 있으면 표시 */}
        {data && <DashboardContent data={data} isOffline={true} />}
      </div>
    )
  }

  // 정상 렌더링...
}
```

---

## 타임아웃 처리

### 증상

- 5초 이상 로딩
- "요청 시간이 초과되었습니다" 메시지

### 원인

1. **느린 데이터베이스 쿼리**
2. **대용량 데이터 조회**
3. **서버 과부하**

### 해결 방법

#### 1. API 클라이언트 타임아웃 설정

**파일**: `coup/src/lib/api.js`

```javascript
const api = {
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const fullUrl = queryString ? `${url}?${queryString}` : url

    // 타임아웃 설정 (30초)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || error.message || 'API request failed')
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      // AbortError 처리
      if (error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.')
      }
      
      throw error
    }
  },
  // ...
}

export default api
```

#### 2. 데이터베이스 쿼리 최적화

**느린 쿼리 예**:
```javascript
// ❌ 나쁜 예: N+1 쿼리 문제
const myStudies = await prisma.studyMember.findMany({
  where: { userId }
})

// 각 스터디마다 별도 쿼리
for (const sm of myStudies) {
  const memberCount = await prisma.studyMember.count({
    where: { studyId: sm.studyId }
  })
}
```

**최적화된 쿼리**:
```javascript
// ✅ 좋은 예: 한 번의 쿼리로 모든 데이터 가져오기
const myStudies = await prisma.studyMember.findMany({
  where: { userId, status: 'ACTIVE' },
  take: 6,
  orderBy: { joinedAt: 'desc' },
  include: {
    study: {
      select: {
        id: true,
        name: true,
        emoji: true,
        category: true,
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    }
  }
})
```

---

## 부분 데이터 로딩

### 증상

- 일부 통계 카드만 0으로 표시
- 스터디 목록은 보이는데 활동 내역은 안 보임
- 일부 섹션만 로딩 실패

### 원인

특정 Prisma 쿼리만 실패하는 경우

### 해결 방법

#### 점진적 렌더링 (Graceful Degradation)

```jsx
export default function DashboardClient({ user }) {
  const { 
    data: dashboardData, 
    isLoading, 
    error 
  } = useDashboard()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  // 전체 실패 시
  if (error) {
    return <ErrorState error={error} />
  }

  // 부분 데이터 처리
  const stats = dashboardData?.data?.stats || {
    activeStudies: 0,
    pendingTasks: 0,
    unreadNotifications: 0,
    completedThisMonth: 0
  }

  const myStudies = dashboardData?.data?.myStudies || []
  const recentActivities = dashboardData?.data?.recentActivities || []
  const upcomingEvents = dashboardData?.data?.upcomingEvents || []

  return (
    <div className={styles.container}>
      {/* 통계 카드 - 항상 표시 */}
      <StatsCards stats={stats} />

      {/* 내 스터디 - 데이터 있을 때만 */}
      {myStudies.length > 0 ? (
        <StudiesList studies={myStudies} />
      ) : (
        <EmptyState type="studies" />
      )}

      {/* 최근 활동 - 데이터 있을 때만 */}
      {recentActivities.length > 0 ? (
        <ActivitiesList activities={recentActivities} />
      ) : (
        <EmptyState type="activities" />
      )}

      {/* 다가오는 일정 - 데이터 있을 때만 */}
      {upcomingEvents.length > 0 ? (
        <EventsList events={upcomingEvents} />
      ) : (
        <div className={styles.noEvents}>
          📅 다가오는 일정이 없습니다
        </div>
      )}
    </div>
  )
}
```

---

## 무한 로딩

### 증상

- 로딩 스피너가 계속 표시됨
- `isLoading`이 계속 `true`
- API 요청이 완료되지 않음

### 원인

1. **API 응답 없음**
2. **무한 리렌더링**
3. **React Query 설정 오류**

### 해결 방법

#### 1. 로딩 타임아웃 추가

```jsx
import { useState, useEffect } from 'react'

export default function DashboardClient({ user }) {
  const { data, isLoading, error } = useDashboard()
  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false)

  // 10초 후에도 로딩 중이면 타임아웃 처리
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoadingTimeout(true)
      }, 10000)

      return () => clearTimeout(timer)
    } else {
      setIsLoadingTimeout(false)
    }
  }, [isLoading])

  // 타임아웃 발생 시
  if (isLoadingTimeout) {
    return (
      <ErrorState
        icon="⏱️"
        title="로딩 시간이 초과되었습니다"
        description="페이지를 새로고침하거나 잠시 후 다시 시도해주세요"
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  // ...
}
```

#### 2. React Query DevTools로 디버깅

```jsx
// coup/src/app/providers.js
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* DevTools로 쿼리 상태 확인 */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  )
}
```

**디버깅 방법**:
1. 브라우저 하단의 React Query 아이콘 클릭
2. `['dashboard']` 쿼리 찾기
3. 상태 확인: `fetching`, `paused`, `error`
4. 데이터 확인

---

## 캐싱 문제

### 증상

- 새로고침해도 오래된 데이터 표시
- 다른 페이지 갔다 와도 업데이트 안 됨
- Stale 데이터 표시

### 원인

React Query 캐시 설정

### 해결 방법

자세한 내용은 [03-real-time-sync-exceptions.md](./03-real-time-sync-exceptions.md)를 참고하세요.

---

## 재시도 메커니즘

### 자동 재시도 설정

위의 [네트워크 오류](#네트워크-오류) 섹션 참고

### 수동 재시도 버튼

```jsx
const { data, isLoading, error, refetch, isRefetching } = useDashboard()

return (
  <div>
    {error && (
      <button onClick={() => refetch()} disabled={isRefetching}>
        {isRefetching ? '재시도 중...' : '🔄 다시 시도'}
      </button>
    )}
  </div>
)
```

---

## 에러 바운더리

### React Error Boundary 설정

**새 파일**: `coup/src/components/ErrorBoundary.jsx`

```jsx
'use client'

import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ [ERROR BOUNDARY]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>⚠️ 문제가 발생했습니다</h2>
          <p>페이지를 새로고침해주세요</p>
          <button onClick={() => window.location.reload()}>
            새로고침
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
```

**사용**:

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

---

## 스켈레톤 UI

현재 구현된 `DashboardSkeleton.jsx`는 잘 작동합니다.

### 개선 사항

#### 애니메이션 추가

**파일**: `coup/src/components/dashboard/DashboardSkeleton.module.css`

```css
/* 펄스 애니메이션 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.statCardSkeleton,
.studyCardSkeleton,
.activityItemSkeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 쉬머 효과 */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.iconSkeleton,
.labelSkeleton,
.valueSkeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 0px,
    #e0e0e0 50%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

---

## 테스트

### 단위 테스트

```javascript
// coup/src/components/dashboard/__tests__/DashboardClient.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DashboardClient from '../DashboardClient'

describe('DashboardClient', () => {
  it('로딩 상태에서 스켈레톤을 표시한다', () => {
    const queryClient = new QueryClient()
    
    render(
      <QueryClientProvider client={queryClient}>
        <DashboardClient user={{ id: 1, name: 'Test User' }} />
      </QueryClientProvider>
    )

    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument()
  })

  it('에러 발생 시 에러 메시지를 표시한다', async () => {
    // Mock API error
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API Error'))
    )

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardClient user={{ id: 1, name: 'Test User' }} />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/데이터를 불러올 수 없습니다/)).toBeInTheDocument()
    })
  })
})
```

---

## 디버깅 체크리스트

로딩 문제 발생 시 다음을 확인하세요:

- [ ] 브라우저 콘솔에 에러가 있는가?
- [ ] Network 탭에서 API 요청이 성공했는가?
- [ ] React Query DevTools에서 쿼리 상태는?
- [ ] 세션이 유효한가?
- [ ] 데이터베이스 연결이 정상인가?
- [ ] 서버 로그에 에러가 있는가?

---

**다음 문서**: [02-widget-exceptions.md](./02-widget-exceptions.md)

