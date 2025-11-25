# 관리자 아키텍처 - 데이터 페칭

> **분량**: 약 200줄  
> **목적**: 6가지 데이터 페칭 최적화 전략

---

## 1️⃣ Server Actions (권장)

### 언제 사용?
- ✅ 빠른 데이터 (통계, 목록)
- ✅ 캐싱이 필요한 데이터
- ✅ 서버에서만 조회 가능한 데이터

### 특징
- `unstable_cache`로 캐싱
- 직접 DB 조회
- Server Component에서 호출

### 코드 예시
```js
// actions/admin/stats.js
'use server'

import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

/**
 * 관리자 통계 조회 (60초 캐시)
 */
export const getStats = unstable_cache(
  async () => {
    const [totalUsers, activeStudies] = await Promise.all([
      prisma.user.count(),
      prisma.study.count({ where: { ... } })
    ])
    
    return { totalUsers, activeStudies }
  },
  ['admin-stats'],
  { revalidate: 60, tags: ['admin-stats'] }
)

// app/admin/page.js (Server Component)
export default async function AdminDashboard() {
  const stats = await getStats() // 60초 캐시
  return <StatCards data={stats} />
}
```

---

## 2️⃣ API Routes + React Query

### 언제 사용?
- ✅ 실시간 필요 데이터
- ✅ 자동 재검증 필요
- ✅ WebSocket 연동

### 특징
- 30초 자동 갱신
- Client Component에서 호출
- React Query 캐싱

### 코드 예시
```js
// app/api/admin/stats/route.js
import { getStats } from '@/actions/admin/stats'

export async function GET() {
  const stats = await getStats()
  return Response.json(stats)
}

// components/admin/dashboard/RealtimeStats.js
'use client'
import { useQuery } from '@tanstack/react-query'

export default function RealtimeStats() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => fetch('/api/admin/stats').then(r => r.json()),
    refetchInterval: 30000 // 30초
  })
  
  return <StatCards data={data} />
}
```

---

## 3️⃣ Parallel Data Fetching

### 언제 사용?
- ✅ 여러 독립적인 데이터
- ✅ 각각 다른 속도로 로딩

### 특징
- Suspense로 병렬 로딩
- 빠른 것부터 표시
- 느린 것은 스트리밍

### 코드 예시
```jsx
// app/admin/page.js
import { Suspense } from 'react'

export default function AdminDashboard() {
  return (
    <div>
      <Suspense fallback={<StatsSkeleton />}>
        <StatCards />
      </Suspense>
      
      <Suspense fallback={<ChartSkeleton />}>
        <UserGrowthChart />
      </Suspense>
    </div>
  )
}
```

---

## 4️⃣ Streaming & Suspense

### 언제 사용?
- ✅ 느린 쿼리가 있을 때
- ✅ 부분적 렌더링 필요

### 특징
- 빠른 데이터 먼저 렌더링
- Skeleton UI 표시
- 점진적 로딩

### 코드 예시
```jsx
// components/admin/dashboard/StatCards.js
// Server Component
export default async function StatCards() {
  const stats = await getStats() // 빠른 쿼리
  return <div>{/* 카드 렌더링 */}</div>
}

// components/admin/dashboard/UserGrowthChart.js
// Server Component
export default async function UserGrowthChart() {
  const data = await getUserGrowth() // 느린 쿼리
  return <ChartClient data={data} />
}
```

---

## 5️⃣ PPR (Partial Prerendering)

### 언제 사용?
- ✅ 정적 + 동적 혼합 페이지

### 특징
- Static Shell 즉시 렌더링
- Dynamic Content 스트리밍
- 최적의 성능

### 코드 예시
```jsx
// app/admin/page.js
export const experimental_ppr = true

export default function AdminDashboard() {
  return (
    <div>
      {/* Static Shell */}
      <header>관리자 대시보드</header>
      
      {/* Dynamic Content */}
      <Suspense>
        <DynamicStats />
      </Suspense>
    </div>
  )
}
```

---

## 6️⃣ 모달 최적화

### Parallel Routes + Intercepting Routes

```jsx
// app/admin/users/@modal/(.)user/[userId]/page.js
export default async function UserModal({ params }) {
  const user = await getUserDetail(params.userId)
  return <UserDetailModal user={user} />
}

// app/admin/users/layout.js
export default function Layout({ children, modal }) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
```

---

## 📊 전략 선택 가이드

| 데이터 유형 | 전략 | 캐시 |
|-----------|------|------|
| 통계 (느림 OK) | Server Actions | 60초 |
| 실시간 현황 | API + React Query | 30초 |
| 사용자 목록 | Server Actions | 60초 |
| 신고 목록 | API + React Query | 30초 |
| 차트 데이터 | Server Actions | 300초 |

---

**다음 파일**: `03-architecture-state.md` - 상태 관리

