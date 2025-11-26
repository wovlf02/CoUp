# 관리자 시스템 최적화 전략

> **프로젝트**: CoUp 플랫폼 관리자 시스템  
> **작성일**: 2025-11-26  
> **버전**: 2.0  
> **이전 문서**: [04-architecture.md](./04-architecture.md)

---

## 📋 개요

관리자 시스템의 성능 최적화 전략을 정의합니다. SSR, CSR, ISR, SEO, 캐싱, 번들 최적화를 포함합니다.

---

## 🎯 렌더링 전략

### 1. SSR (Server-Side Rendering)

#### 사용 케이스
- ✅ 대시보드 (초기 로딩 중요)
- ✅ 사용자 상세 페이지
- ✅ 스터디 상세 페이지
- ✅ 시스템 설정 페이지

#### 구현
```javascript
// app/admin/page.js
import { getAdminStats } from '@/lib/actions/admin/stats'

export default async function AdminDashboard() {
  // 서버에서 데이터 fetch
  const stats = await getAdminStats()
  
  return (
    <div>
      <h1>관리자 대시보드</h1>
      <StatsCards stats={stats} />
    </div>
  )
}
```

#### 장점
- 초기 로딩 속도 빠름
- SEO 최적화
- 서버에서 권한 검증

#### 단점
- 서버 부하 증가
- 인터랙션 제한적

---

### 2. CSR (Client-Side Rendering)

#### 사용 케이스
- ✅ 데이터 테이블 (필터, 정렬, 검색)
- ✅ 실시간 차트
- ✅ 모달
- ✅ 폼

#### 구현
```javascript
// components/admin/users/UserTable.jsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

export default function UserTable() {
  const [filters, setFilters] = useState({})
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 30 * 1000 // 30초 캐싱
  })
  
  return (
    <div>
      <UserFilters filters={filters} onChange={setFilters} />
      <DataTable data={data?.users} loading={isLoading} />
    </div>
  )
}
```

#### 장점
- 인터랙션 빠름
- 상태 관리 용이
- 캐싱 및 자동 갱신

#### 단점
- 초기 로딩 느림
- SEO 불리

---

### 3. ISR (Incremental Static Regeneration)

#### 사용 케이스
- ✅ 통계 분석 페이지
- ✅ 리포트 페이지

#### 구현
```javascript
// app/admin/stats/page.js
export const revalidate = 3600 // 1시간마다 재생성

export default async function StatsPage() {
  const stats = await getDetailedStats()
  
  return <StatsView stats={stats} />
}
```

#### 장점
- 서버 부하 감소
- 빠른 응답 속도
- 주기적 업데이트

#### 단점
- 실시간 데이터 아님
- 복잡한 캐시 관리

---

### 4. RSC (React Server Components)

#### 사용 케이스
- ✅ 레이아웃
- ✅ 통계 카드
- ✅ 정적 콘텐츠

#### 구현
```javascript
// components/admin/dashboard/StatsCards.jsx
// 서버 컴포넌트 (default)
export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        title="전체 사용자"
        value={stats.totalUsers}
        change={stats.userChange}
        icon="👥"
      />
      {/* ... */}
    </div>
  )
}
```

#### 장점
- 번들 크기 감소
- 서버 리소스 활용
- 자동 코드 스플리팅

---

## 📦 번들 최적화

### 1. 코드 스플리팅

#### 동적 import
```javascript
// 큰 라이브러리는 동적 import
import dynamic from 'next/dynamic'

const UserGrowthChart = dynamic(
  () => import('@/components/admin/dashboard/UserGrowthChart'),
  { 
    loading: () => <ChartSkeleton />,
    ssr: false // 차트는 클라이언트만
  }
)

const RichTextEditor = dynamic(
  () => import('@/components/admin/settings/RichTextEditor'),
  { loading: () => <EditorSkeleton /> }
)
```

#### Route-based 스플리팅
```javascript
// Next.js 자동 코드 스플리팅
// 각 페이지는 자동으로 별도 청크로 분리
app/admin/page.js         → admin.chunk.js
app/admin/users/page.js   → users.chunk.js
app/admin/studies/page.js → studies.chunk.js
```

---

### 2. Tree Shaking

#### Named import 사용
```javascript
// ❌ Bad: 전체 import
import _ from 'lodash'

// ✅ Good: 필요한 것만 import
import { debounce, throttle } from 'lodash-es'
```

#### 라이브러리 최적화
```javascript
// ❌ Bad: 전체 recharts
import { LineChart, BarChart } from 'recharts'

// ✅ Good: 필요한 컴포넌트만
import { LineChart } from 'recharts/lib/chart/LineChart'
import { Line } from 'recharts/lib/cartesian/Line'
```

---

### 3. 번들 분석

#### 분석 도구 설정
```javascript
// next.config.mjs
import BundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

export default withBundleAnalyzer({
  // ... 설정
})
```

#### 실행
```bash
ANALYZE=true npm run build
```

---

## 🚀 성능 최적화

### 1. 이미지 최적화

#### Next.js Image 컴포넌트
```javascript
import Image from 'next/image'

export default function UserAvatar({ user }) {
  return (
    <Image
      src={user.avatar}
      alt={user.name}
      width={48}
      height={48}
      className="rounded-full"
      priority={false} // lazy loading
    />
  )
}
```

---

### 2. 폰트 최적화

#### Google Fonts 최적화
```javascript
// app/admin/layout.js
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export default function AdminLayout({ children }) {
  return (
    <html className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

---

### 3. 데이터 Fetching 최적화

#### Parallel Fetching
```javascript
// app/admin/page.js
export default async function AdminDashboard() {
  // 병렬 fetch
  const [stats, reports, systemStatus] = await Promise.all([
    getAdminStats(),
    getRecentReports(),
    getSystemStatus()
  ])
  
  return (
    <>
      <StatsCards stats={stats} />
      <RecentReports reports={reports} />
      <SystemStatus status={systemStatus} />
    </>
  )
}
```

#### Waterfall 방지
```javascript
// ❌ Bad: Sequential fetching
const stats = await getAdminStats()
const reports = await getRecentReports()

// ✅ Good: Parallel fetching
const [stats, reports] = await Promise.all([
  getAdminStats(),
  getRecentReports()
])
```

---

### 4. 캐싱 전략

#### React Query 캐싱
```javascript
// lib/hooks/admin/useUserList.js
import { useQuery } from '@tanstack/react-query'

export function useUserList(filters) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 30 * 1000, // 30초 동안 fresh
    cacheTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
    refetchOnWindowFocus: true,
    refetchOnMount: 'always'
  })
}
```

#### HTTP 캐싱
```javascript
// app/api/admin/stats/route.js
export async function GET(req) {
  const stats = await getStats()
  
  return NextResponse.json(stats, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  })
}
```

---

### 5. 가상 스크롤

#### react-window 사용
```javascript
import { FixedSizeList } from 'react-window'

export default function UserTable({ users }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <UserRow user={users[index]} />
    </div>
  )
  
  return (
    <FixedSizeList
      height={600}
      itemCount={users.length}
      itemSize={60}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

---

### 6. Debounce & Throttle

#### 검색 입력 Debounce
```javascript
'use client'

import { useState, useCallback } from 'react'
import { debounce } from 'lodash-es'

export default function UserSearch() {
  const [search, setSearch] = useState('')
  
  const debouncedSearch = useCallback(
    debounce((value) => {
      // API 호출
      fetchUsers({ search: value })
    }, 300),
    []
  )
  
  const handleChange = (e) => {
    setSearch(e.target.value)
    debouncedSearch(e.target.value)
  }
  
  return (
    <input
      value={search}
      onChange={handleChange}
      placeholder="사용자 검색..."
    />
  )
}
```

---

### 7. Optimistic UI

#### 즉각적인 UI 업데이트
```javascript
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function SuspendButton({ userId }) {
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: (data) => suspendUser(userId, data),
    onMutate: async (data) => {
      // Optimistic update
      await queryClient.cancelQueries(['admin', 'users', userId])
      
      const previous = queryClient.getQueryData(['admin', 'users', userId])
      
      queryClient.setQueryData(['admin', 'users', userId], (old) => ({
        ...old,
        status: 'suspended'
      }))
      
      return { previous }
    },
    onError: (err, data, context) => {
      // 롤백
      queryClient.setQueryData(
        ['admin', 'users', userId],
        context.previous
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries(['admin', 'users'])
    }
  })
  
  return (
    <button onClick={() => mutation.mutate({ duration: 7 })}>
      정지
    </button>
  )
}
```

---

## 🔍 SEO 최적화

### 1. Metadata

#### 정적 Metadata
```javascript
// app/admin/page.js
export const metadata = {
  title: '관리자 대시보드 | CoUp',
  description: 'CoUp 플랫폼 관리자 페이지',
  robots: 'noindex, nofollow' // 관리자 페이지는 검색 제외
}
```

#### 동적 Metadata
```javascript
// app/admin/users/[id]/page.js
export async function generateMetadata({ params }) {
  const user = await getUser(params.id)
  
  return {
    title: `${user.name} - 사용자 관리 | CoUp`,
    robots: 'noindex, nofollow'
  }
}
```

---

### 2. Sitemap (관리자 페이지는 제외)

```javascript
// app/sitemap.js
export default function sitemap() {
  return [
    {
      url: 'https://coup.com',
      lastModified: new Date()
    },
    // 관리자 페이지는 포함하지 않음
  ]
}
```

---

### 3. Robots.txt

```javascript
// app/robots.js
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/admin/' // 관리자 페이지 크롤링 금지
      }
    ]
  }
}
```

---

## 📊 성능 모니터링

### 1. Web Vitals

#### 측정
```javascript
// app/admin/layout.js
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function AdminLayout({ children }) {
  useReportWebVitals((metric) => {
    console.log(metric)
    
    // Analytics 전송
    if (metric.name === 'FCP') {
      // First Contentful Paint
    }
    if (metric.name === 'LCP') {
      // Largest Contentful Paint
    }
    if (metric.name === 'CLS') {
      // Cumulative Layout Shift
    }
    if (metric.name === 'FID') {
      // First Input Delay
    }
    if (metric.name === 'TTFB') {
      // Time to First Byte
    }
  })
  
  return children
}
```

---

### 2. 성능 목표

| 지표 | 목표 | 설명 |
|------|------|------|
| FCP | < 1.8s | 첫 콘텐츠 표시 |
| LCP | < 2.5s | 최대 콘텐츠 표시 |
| CLS | < 0.1 | 레이아웃 이동 |
| FID | < 100ms | 첫 입력 지연 |
| TTFB | < 600ms | 첫 바이트 시간 |

---

### 3. Lighthouse CI

#### 설정
```yaml
# .lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/admin",
        "http://localhost:3000/admin/users",
        "http://localhost:3000/admin/studies"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:no-pwa",
      "assertions": {
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "interactive": ["error", {"maxNumericValue": 3500}],
        "speed-index": ["error", {"maxNumericValue": 4000}]
      }
    }
  }
}
```

---

## 🔧 개발 환경 최적화

### 1. Fast Refresh

```javascript
// next.config.mjs
export default {
  reactStrictMode: true,
  swcMinify: true, // SWC 컴파일러 사용
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['recharts', 'lodash-es']
  }
}
```

---

### 2. TypeScript 타입 체크 최적화

```json
// tsconfig.json (JavaScript 프로젝트이지만 참고)
{
  "compilerOptions": {
    "incremental": true,
    "skipLibCheck": true
  }
}
```

---

## 📝 체크리스트

### 렌더링 최적화
- [ ] 페이지별 렌더링 전략 결정 (SSR/CSR/ISR)
- [ ] 서버/클라이언트 컴포넌트 분리
- [ ] 데이터 Prefetching

### 번들 최적화
- [ ] 동적 import 적용
- [ ] Tree shaking 확인
- [ ] 번들 분석 및 최적화

### 성능 최적화
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 폰트 최적화
- [ ] 가상 스크롤 적용 (1000+ 항목)
- [ ] Debounce/Throttle 적용

### 캐싱 전략
- [ ] React Query 캐싱 설정
- [ ] HTTP 캐싱 헤더
- [ ] ISR 적용 (통계 페이지)

### SEO
- [ ] Metadata 설정
- [ ] robots.txt (관리자 제외)
- [ ] Sitemap (관리자 제외)

### 모니터링
- [ ] Web Vitals 측정
- [ ] Lighthouse CI 설정
- [ ] 성능 목표 달성

---

## 🔗 관련 문서

- [시스템 아키텍처](./04-architecture.md)
- [API 명세](../backend/api/admin/01-overview.md)
- [화면 설계](../screens/admin/01-layout.md)

---

**작성일**: 2025-11-26  
**다음 문서**: [API 명세 개요](../backend/api/admin/01-overview.md)

