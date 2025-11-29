# 성능 최적화

대시보드의 렌더링 성능, 데이터 로딩, 메모리 관리 최적화 방법을 다룹니다.

---

## 📋 목차

1. [렌더링 최적화](#렌더링-최적화)
2. [데이터 로딩 최적화](#데이터-로딩-최적화)
3. [메모리 관리](#메모리-관리)
4. [코드 스플리팅](#코드-스플리팅)
5. [이미지 최적화](#이미지-최적화)
6. [성능 측정](#성능-측정)

---

## 렌더링 최적화

### React.memo 사용

**문제**: 부모 컴포넌트가 리렌더링될 때 자식 컴포넌트도 불필요하게 리렌더링됨

**해결**:
```jsx
// coup/src/components/dashboard/widgets/StudyStatus.jsx
import { memo } from 'react'

const StudyStatus = memo(function StudyStatus({ stats, nextEvent }) {
  // ...
  return (
    <div className={styles.widget}>
      {/* ... */}
    </div>
  )
}, (prevProps, nextProps) => {
  // 사용자 정의 비교 함수 (선택사항)
  return (
    prevProps.stats === nextProps.stats &&
    prevProps.nextEvent === nextProps.nextEvent
  )
})

export default StudyStatus
```

### useMemo 사용

**문제**: 매 렌더링마다 복잡한 계산이 반복됨

**해결**:
```jsx
// coup/src/components/dashboard/DashboardClient.jsx
import { useMemo } from 'react'

export default function DashboardClient({ user }) {
  const { data: dashboardData } = useDashboard()

  // ❌ 나쁜 예: 매 렌더링마다 계산
  const urgentTasks = dashboardData?.data?.tasks?.filter(task => {
    const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    return !task.completed && daysUntilDue >= 0 && daysUntilDue <= 3
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  // ✅ 좋은 예: 의존성이 변경될 때만 계산
  const urgentTasks = useMemo(() => {
    if (!dashboardData?.data?.tasks) return []
    
    return dashboardData.data.tasks
      .filter(task => {
        const daysUntilDue = Math.ceil(
          (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
        )
        return !task.completed && daysUntilDue >= 0 && daysUntilDue <= 3
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  }, [dashboardData?.data?.tasks])

  return (
    <div>
      <UrgentTasks tasks={urgentTasks} />
    </div>
  )
}
```

### useCallback 사용

**문제**: 함수가 매 렌더링마다 재생성되어 자식 컴포넌트가 불필요하게 리렌더링됨

**해결**:
```jsx
import { useCallback } from 'react'

export default function DashboardClient() {
  const { mutate: markAsRead } = useMarkNotificationAsRead()

  // ❌ 나쁜 예: 매번 새 함수 생성
  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId)
  }

  // ✅ 좋은 예: 함수를 메모이제이션
  const handleNotificationClick = useCallback((notificationId) => {
    markAsRead(notificationId)
  }, [markAsRead])

  return (
    <ActivitiesList 
      activities={recentActivities}
      onNotificationClick={handleNotificationClick}
    />
  )
}
```

### 가상화 (Virtualization)

**문제**: 긴 목록을 렌더링할 때 성능 저하

**해결**: react-window 또는 react-virtual 사용

```bash
npm install react-window
```

```jsx
import { FixedSizeList } from 'react-window'

export default function ActivitiesList({ activities }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ActivityItem activity={activities[index]} />
    </div>
  )

  return (
    <FixedSizeList
      height={400}
      itemCount={activities.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

---

## 데이터 로딩 최적화

### 병렬 로딩

**문제**: API 요청이 직렬로 실행되어 느림

```jsx
// ❌ 나쁜 예: 직렬 요청 (3초)
const dashboard = await api.get('/api/dashboard') // 1초
const user = await api.get('/api/auth/me') // 1초
const stats = await api.get('/api/user/stats') // 1초
```

**해결**: Promise.all 사용

```jsx
// ✅ 좋은 예: 병렬 요청 (1초)
const [dashboard, user, stats] = await Promise.all([
  api.get('/api/dashboard'),
  api.get('/api/auth/me'),
  api.get('/api/user/stats')
])
```

**React Query에서**:
```jsx
export default function DashboardClient() {
  // 병렬로 실행됨
  const { data: dashboardData } = useDashboard()
  const { data: userData } = useMe()
  const { data: statsData } = useUserStats()

  // 모든 데이터가 로드될 때까지 기다림
  const isLoading = !dashboardData || !userData || !statsData

  if (isLoading) return <DashboardSkeleton />

  // ...
}
```

### Prefetching

**문제**: 사용자가 클릭할 때까지 데이터 로딩이 시작되지 않음

**해결**: 미리 데이터를 가져옴

```jsx
import { useQueryClient } from '@tanstack/react-query'

export default function StudyCard({ study }) {
  const queryClient = useQueryClient()

  // 마우스 오버 시 미리 데이터 가져오기
  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['studies', study.id],
      queryFn: () => api.get(`/api/studies/${study.id}`)
    })
  }

  return (
    <Link 
      href={`/my-studies/${study.id}`}
      onMouseEnter={handleMouseEnter}
    >
      {study.name}
    </Link>
  )
}
```

### 데이터 페이지네이션

**문제**: 모든 데이터를 한 번에 가져와서 느림

**해결**: 페이지네이션 또는 무한 스크롤

```jsx
import { useInfiniteQuery } from '@tanstack/react-query'

export function useInfiniteActivities() {
  return useInfiniteQuery({
    queryKey: ['activities'],
    queryFn: ({ pageParam = 1 }) => 
      api.get('/api/activities', { page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })
}

// 사용
export default function ActivitiesList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteActivities()

  return (
    <div>
      {data?.pages.map((page) =>
        page.activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))
      )}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? '로딩 중...' : '더 보기'}
        </button>
      )}
    </div>
  )
}
```

### API 응답 최적화

**문제**: 불필요한 데이터를 가져와서 느림

**해결**: 필요한 필드만 select

```javascript
// coup/src/app/api/dashboard/route.js

// ❌ 나쁜 예: 모든 필드 가져오기
const myStudies = await prisma.studyMember.findMany({
  where: { userId },
  include: {
    study: true // 모든 필드
  }
})

// ✅ 좋은 예: 필요한 필드만 가져오기
const myStudies = await prisma.studyMember.findMany({
  where: { userId },
  include: {
    study: {
      select: {
        id: true,
        name: true,
        emoji: true,
        category: true,
        // description, content 등은 제외
      }
    }
  }
})
```

---

## 메모리 관리

### 이벤트 리스너 정리

**문제**: 컴포넌트 언마운트 후에도 이벤트 리스너가 남아있음

**해결**: cleanup 함수 사용

```jsx
import { useEffect } from 'react'

export default function DashboardClient() {
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('Visibility changed:', document.hidden)
    }

    // 이벤트 리스너 등록
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // ✅ cleanup 함수
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return <div>...</div>
}
```

### 타이머 정리

**문제**: 타이머가 계속 실행되어 메모리 누수

**해결**:
```jsx
import { useEffect, useState } from 'react'

export default function RelativeTime({ date }) {
  const [relativeTime, setRelativeTime] = useState(getRelativeTime(date))

  useEffect(() => {
    // 1분마다 업데이트
    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime(date))
    }, 60000)

    // ✅ cleanup
    return () => clearInterval(interval)
  }, [date])

  return <span>{relativeTime}</span>
}
```

### React Query 캐시 정리

**문제**: 사용하지 않는 쿼리가 메모리에 계속 남아있음

**해결**: cacheTime 설정

```javascript
// coup/src/app/providers.js
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분 후 캐시 삭제
    },
  },
})
```

### 이미지 메모리 관리

**문제**: 많은 이미지가 메모리에 로드됨

**해결**: Lazy loading

```jsx
import Image from 'next/image'

export default function MemberAvatar({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={32}
      height={32}
      loading="lazy" // Lazy loading
      placeholder="blur" // 블러 플레이스홀더
      blurDataURL="data:image/png;base64,..." // 블러 이미지
    />
  )
}
```

---

## 코드 스플리팅

### 동적 import

**문제**: 모든 컴포넌트가 초기 번들에 포함되어 느림

**해결**: dynamic import 사용

```jsx
import dynamic from 'next/dynamic'

// 클라이언트 사이드에서만 로드
const DashboardClient = dynamic(
  () => import('@/components/dashboard/DashboardClient'),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false // 서버 사이드 렌더링 비활성화
  }
)

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/sign-in')
  }

  return <DashboardClient user={session.user} />
}
```

### 조건부 로딩

**문제**: 사용하지 않는 기능의 코드도 로드됨

**해결**:
```jsx
export default function DashboardClient({ user }) {
  const [showStats, setShowStats] = useState(false)

  // 버튼 클릭 시에만 로드
  const handleShowStats = async () => {
    const { default: StatsModal } = await import('./StatsModal')
    setShowStats(true)
  }

  return (
    <div>
      <button onClick={handleShowStats}>통계 보기</button>
      {showStats && <StatsModal />}
    </div>
  )
}
```

---

## 이미지 최적화

### Next.js Image 컴포넌트

```jsx
import Image from 'next/image'

export default function StudyCard({ study }) {
  return (
    <div>
      {/* ❌ 나쁜 예 */}
      <img src={study.thumbnail} alt={study.name} />

      {/* ✅ 좋은 예 */}
      <Image
        src={study.thumbnail}
        alt={study.name}
        width={300}
        height={200}
        quality={75}
        loading="lazy"
        placeholder="blur"
        sizes="(max-width: 768px) 100vw, 300px"
      />
    </div>
  )
}
```

### 아바타 최적화

```jsx
export default function MemberAvatar({ member }) {
  // 작은 사이즈로 로드
  const avatarUrl = member.avatar 
    ? `${member.avatar}?w=64&h=64&fit=crop` // 이미지 CDN 쿼리
    : null

  return avatarUrl ? (
    <Image
      src={avatarUrl}
      alt={member.name}
      width={32}
      height={32}
      className={styles.avatar}
    />
  ) : (
    <div className={styles.avatarPlaceholder}>
      {member.name?.[0]?.toUpperCase()}
    </div>
  )
}
```

---

## 성능 측정

### React DevTools Profiler

```jsx
import { Profiler } from 'react'

export default function DashboardClient() {
  const onRender = (id, phase, actualDuration) => {
    console.log(`${id} (${phase}): ${actualDuration}ms`)
  }

  return (
    <Profiler id="Dashboard" onRender={onRender}>
      <div>
        {/* 대시보드 콘텐츠 */}
      </div>
    </Profiler>
  )
}
```

**사용 방법**:
1. React DevTools 설치
2. Profiler 탭 열기
3. Record 버튼 클릭
4. 페이지 사용
5. Stop 후 분석

### Performance API

```jsx
export default function DashboardClient() {
  const { data, isLoading } = useDashboard({
    onSuccess: () => {
      // 데이터 로딩 완료 시간 측정
      const navigationTiming = performance.getEntriesByType('navigation')[0]
      console.log('페이지 로드 시간:', navigationTiming.loadEventEnd - navigationTiming.fetchStart, 'ms')
    }
  })

  useEffect(() => {
    // 커스텀 마크
    performance.mark('dashboard-render-start')

    return () => {
      performance.mark('dashboard-render-end')
      performance.measure(
        'dashboard-render',
        'dashboard-render-start',
        'dashboard-render-end'
      )

      const measure = performance.getEntriesByName('dashboard-render')[0]
      console.log('대시보드 렌더링 시간:', measure.duration, 'ms')
    }
  }, [])

  // ...
}
```

### Lighthouse

```bash
# CLI로 실행
npx lighthouse http://localhost:3000/dashboard --view
```

**주요 지표**:
- **FCP (First Contentful Paint)**: 첫 콘텐츠 표시 시간
- **LCP (Largest Contentful Paint)**: 가장 큰 콘텐츠 표시 시간
- **TBT (Total Blocking Time)**: 총 차단 시간
- **CLS (Cumulative Layout Shift)**: 누적 레이아웃 이동

### 성능 모니터링 훅

```jsx
// coup/src/lib/hooks/usePerformanceMonitor.js
import { useEffect } from 'react'

export function usePerformanceMonitor(componentName) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime

      // 경고: 렌더링이 너무 오래 걸림
      if (duration > 100) {
        console.warn(
          `⚠️ ${componentName} took ${duration.toFixed(2)}ms to render`
        )
      }

      // 로깅 서비스로 전송 (프로덕션)
      if (process.env.NODE_ENV === 'production') {
        // analytics.track('component-render', {
        //   component: componentName,
        //   duration,
        // })
      }
    }
  }, [componentName])
}

// 사용
export default function DashboardClient() {
  usePerformanceMonitor('DashboardClient')
  
  // ...
}
```

---

## 성능 체크리스트

대시보드 성능 최적화 시 확인사항:

- [ ] React.memo로 불필요한 리렌더링 방지
- [ ] useMemo로 복잡한 계산 메모이제이션
- [ ] useCallback로 함수 메모이제이션
- [ ] 병렬 API 요청 (Promise.all)
- [ ] Prefetching으로 데이터 미리 로드
- [ ] 필요한 필드만 select
- [ ] 이벤트 리스너 cleanup
- [ ] 타이머 cleanup
- [ ] React Query 캐시 설정
- [ ] 이미지 lazy loading
- [ ] 코드 스플리팅
- [ ] 성능 측정 및 모니터링

---

## 성능 목표

| 지표 | 목표 | 현재 |
|------|------|------|
| FCP | < 1.8s | - |
| LCP | < 2.5s | - |
| TTI | < 3.8s | - |
| TBT | < 200ms | - |
| CLS | < 0.1 | - |

---

**다음 문서**: [99-best-practices.md](./99-best-practices.md)

