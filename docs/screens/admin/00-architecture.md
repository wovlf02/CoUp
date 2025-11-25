# 관리자 페이지 아키텍처 & 최적화 전략

> **작성일**: 2025-11-25  
> **Next.js 버전**: 14 (App Router)  
> **언어**: JavaScript (JSDoc 타입 주석)  
> **목적**: RSC 기반 최적화된 모듈 설계

---

## 🏗️ Next.js 16 App Router 아키텍처

### 파일 구조

```
coup/src/app/admin/
├── layout.js                     # 🔴 Server Component - 관리자 전용 레이아웃
├── page.js                       # 🔴 Server Component - 대시보드 페이지
├── loading.js                    # 🔴 Server Component - 로딩 UI
├── error.js                      # 🔵 Client Component - 에러 바운더리
├── users/
│   ├── page.js                   # 🔴 Server Component
│   ├── loading.js
│   └── [userId]/
│       └── page.js               # 🔴 Server Component (Dynamic Route)
├── studies/
│   ├── page.js
│   └── [studyId]/
│       └── page.js
├── reports/
│   ├── page.js
│   └── [reportId]/
│       └── page.js
├── analytics/
│   └── page.js
└── settings/
    └── page.js

coup/src/components/admin/
├── layout/
│   ├── AdminLayout.js            # 🔴 Server Component - 루트 레이아웃
│   ├── AdminNav.js               # 🔴 Server Component - 네비게이션
│   ├── AdminHeader.js            # 🔵 Client Component - 실시간 알림
│   └── AdminSidebar.js           # 🔴 Server Component - 우측 위젯
├── dashboard/
│   ├── StatCards.js              # 🔴 Server Component - 통계 카드 그룹
│   ├── StatCard.js               # 🔴 Server Component - 개별 카드
│   ├── UserGrowthChart.js        # 🔵 Client Component - 차트 (인터랙티브)
│   ├── RecentReports.js          # 🔴 Server Component - 신고 목록
│   ├── RecentReportCard.js       # 🔵 Client Component - 모달 열기
│   ├── RealtimeStatus.js         # 🔵 Client Component - WebSocket
│   └── SystemStatus.js           # 🔵 Client Component - 실시간 폴링
├── users/
│   ├── UserTable.js              # 🔵 Client Component - 인터랙티브 테이블
│   ├── UserFilterBar.js          # 🔵 Client Component - 필터링
│   ├── UserDetailModal.js        # 🔵 Client Component - 모달
│   ├── SuspendUserModal.js       # 🔵 Client Component - 모달
│   └── BulkActionsBar.js         # 🔵 Client Component - 일괄 작업
├── studies/
│   ├── StudyTable.js             # 🔵 Client Component
│   ├── StudyFilterBar.js         # 🔵 Client Component
│   └── StudyDetailModal.js       # 🔵 Client Component
├── reports/
│   ├── ReportTable.js            # 🔵 Client Component
│   ├── ReportFilterBar.js        # 🔵 Client Component
│   └── ReportProcessModal.js     # 🔵 Client Component
├── analytics/
│   ├── AnalyticsCharts.js        # 🔵 Client Component - 차트 그룹
│   └── ChartControls.js          # 🔵 Client Component - 기간 선택
├── settings/
│   ├── PlatformSettings.js       # 🔵 Client Component - 폼
│   ├── CategoryManager.js        # 🔵 Client Component - 드래그앤드롭
│   └── SystemSettings.js         # 🔵 Client Component - 폼
└── shared/
    ├── DataTable.js              # 🔵 Client Component - 재사용 테이블
    ├── FilterBar.js              # 🔵 Client Component - 재사용 필터
    ├── Pagination.js             # 🔵 Client Component - 페이지네이션
    ├── Modal.js                  # 🔵 Client Component - 기본 모달
    ├── ConfirmDialog.js          # 🔵 Client Component - 확인 다이얼로그
    ├── Chart.js                  # 🔵 Client Component - 차트 래퍼
    ├── Badge.js                  # 🔴 Server Component - 배지
    ├── ProgressBar.js            # 🔴 Server Component - 프로그레스 바
    └── EmptyState.js             # 🔴 Server Component - 빈 상태

coup/src/lib/admin/
├── api.js                        # API 클라이언트 함수
├── hooks.js                      # React Query 훅
├── utils.js                      # 유틸리티 함수
└── constants.js                  # 상수

coup/src/actions/admin/
├── stats.js                      # Server Actions - 통계
├── users.js                      # Server Actions - 사용자
├── studies.js                    # Server Actions - 스터디
├── reports.js                    # Server Actions - 신고
├── analytics.js                  # Server Actions - 분석
└── settings.js                   # Server Actions - 설정
```

---

## 🎯 Server vs Client Component 전략

### Server Components (🔴) - 기본값
**사용 케이스**:
- 데이터 페칭 (직접 DB 조회)
- SEO가 중요한 콘텐츠
- 정적 콘텐츠 렌더링
- 민감한 데이터 처리

**장점**:
- Zero JavaScript to client
- 서버에서 직접 DB 접근
- 자동 코드 스플리팅
- 빠른 초기 로드

**예시**:
```jsx
// app/admin/page.js (Server Component)
import { getStats } from '@/actions/admin/stats'
import StatCards from '@/components/admin/dashboard/StatCards'

/**
 * @returns {Promise<JSX.Element>}
 */
export default async function AdminDashboard() {
  const stats = await getStats() // 서버에서 직접 데이터 페칭
  
  return (
    <div>
      <StatCards data={stats} />
    </div>
  )
}
```

---

### Client Components (🔵) - 필요시만
**사용 케이스**:
- 이벤트 핸들러 (onClick, onChange 등)
- State 관리 (useState, useReducer)
- Effect 사용 (useEffect)
- 브라우저 전용 API (localStorage, window)
- 인터랙티브 컴포넌트 (차트, 모달, 폼)
- React Query, Context 사용

**장점**:
- 즉각적인 인터랙션
- 실시간 업데이트
- 로컬 상태 관리

**예시**:
```jsx
// components/admin/dashboard/UserGrowthChart.js (Client Component)
'use client'

import { useState } from 'react'
import { LineChart } from 'recharts'

/**
 * @param {Object} props
 * @param {Object} props.data - 차트 데이터
 * @returns {JSX.Element}
 */
export default function UserGrowthChart({ data }) {
  const [period, setPeriod] = useState('week')
  
  return (
    <div>
      <button onClick={() => setPeriod('week')}>주간</button>
      <LineChart data={data[period]} />
    </div>
  )
}
```

---

## 🚀 최적화 전략

### 1. 데이터 페칭 최적화

#### 전략 A: Server Actions (권장)
```jsx
// actions/admin/stats.js
'use server'

import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
const today = new Date()
today.setHours(0, 0, 0, 0)

/**
 * 관리자 통계 조회
 * @returns {Promise<{totalUsers: number, activeStudies: number, newToday: number, pendingReports: number}>}
 */
export const getStats = unstable_cache(
  async () => {
    const [totalUsers, activeStudies, newToday, pendingReports] = 
      await Promise.all([
        prisma.user.count(),
        prisma.study.count({ where: { lastActivityAt: { gte: sevenDaysAgo } } }),
        prisma.user.count({ where: { createdAt: { gte: today } } }),
        prisma.report.count({ where: { status: 'PENDING' } })
      ])
    
    return { totalUsers, activeStudies, newToday, pendingReports }
  },
  ['admin-stats'],
  { revalidate: 60, tags: ['admin-stats'] }
)

// app/admin/page.js
export default async function AdminDashboard() {
  const stats = await getStats() // 서버에서 직접 호출, 60초 캐시
  
  return <StatCards data={stats} />
}
```

#### 전략 B: API Routes + React Query (실시간 필요시)
```jsx
// app/api/admin/stats/route.js
import { NextResponse } from 'next/server'
import { getStats } from '@/actions/admin/stats'

export async function GET() {
  const stats = await getStats()
  return NextResponse.json(stats)
}

// components/admin/dashboard/RealtimeStats.js
'use client'

import { useQuery } from '@tanstack/react-query'

/**
 * @returns {JSX.Element}
 */
export default function RealtimeStats() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => fetch('/api/admin/stats').then(r => r.json()),
    refetchInterval: 30000 // 30초마다 자동 갱신
  })
  
  return <StatCards data={data} />
}
```

---

### 2. 스트리밍 & Suspense

```jsx
// app/admin/page.js
import { Suspense } from 'react'
import StatCards from '@/components/admin/dashboard/StatCards'
import UserGrowthChart from '@/components/admin/dashboard/UserGrowthChart'
import RecentReports from '@/components/admin/dashboard/RecentReports'
import { StatCardsSkeleton, ChartSkeleton, ReportsSkeleton } from './skeletons'

export default function AdminDashboard() {
  return (
    <div>
      {/* 빠른 데이터부터 먼저 렌더링 */}
      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCards />
      </Suspense>
      
      {/* 느린 데이터는 스트리밍 */}
      <div className="grid grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <UserGrowthChart />
        </Suspense>
        
        <Suspense fallback={<ReportsSkeleton />}>
          <RecentReports />
        </Suspense>
      </div>
    </div>
  )
}

// components/admin/dashboard/StatCards.js (Server Component)
import { getStats } from '@/actions/admin/stats'

export default async function StatCards() {
  const stats = await getStats() // 병렬 페칭
  return (/* ... */)
}

// components/admin/dashboard/UserGrowthChart.js (Server Component)
import { getUserGrowth } from '@/actions/admin/stats'
import UserGrowthChartClient from './UserGrowthChartClient'

export default async function UserGrowthChart() {
  const data = await getUserGrowth() // 독립적 페칭
  return <UserGrowthChartClient data={data} />
}
```

---

### 3. Parallel Data Fetching

```jsx
// app/admin/users/page.js
import { Suspense } from 'react'

/**
 * @param {Object} props
 * @param {Object} props.searchParams
 */
export default function UsersPage({ searchParams }) {
  return (
    <div>
      <Suspense fallback={<Skeleton />}>
        <UserTableWrapper searchParams={searchParams} />
      </Suspense>
      
      <Suspense fallback={<Skeleton />}>
        <UserStatsWidget />
      </Suspense>
    </div>
  )
}

// components/admin/users/UserTableWrapper.js
import { getUsers } from '@/actions/admin/users'
import UserTable from './UserTable'

/**
 * @param {Object} props
 * @param {Object} props.searchParams
 */
export default async function UserTableWrapper({ searchParams }) {
  const users = await getUsers(searchParams)
  return <UserTable initialData={users} />
}

// components/admin/users/UserStatsWidget.js
import { getUserStats } from '@/actions/admin/users'

export default async function UserStatsWidget() {
  const stats = await getUserStats()
  return (/* ... */)
}
```

---

### 4. Partial Prerendering (PPR)

```jsx
// app/admin/page.js
export const experimental_ppr = true // PPR 활성화

export default function AdminDashboard() {
  return (
    <div>
      {/* Static Shell - 즉시 렌더링 */}
      <header>관리자 대시보드</header>
      <nav>...</nav>
      
      {/* Dynamic Content - 스트리밍 */}
      <Suspense fallback={<Skeleton />}>
        <DynamicStats />
      </Suspense>
    </div>
  )
}
```

---

### 5. 모달 최적화 (Parallel Routes + Intercepting Routes)

```jsx
// app/admin/users/@modal/(.)user/[userId]/page.js
import { getUserDetail } from '@/actions/admin/users'
import UserDetailModal from '@/components/admin/users/UserDetailModal'

/**
 * @param {Object} props
 * @param {Object} props.params
 * @param {string} props.params.userId
 */
export default async function UserDetailModalPage({ params }) {
  const user = await getUserDetail(params.userId)
  
  return <UserDetailModal user={user} />
}

// app/admin/users/layout.js
/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} props.modal
 */
export default function UsersLayout({ children, modal }) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}

// 사용자 클릭 시: /admin/users/user/123 (모달로 열림)
// 직접 접속 시: /admin/users/user/123 (전체 페이지)
```

---

## 📦 상태 관리 전략

### 1. Server State (React Query)
```jsx
// lib/admin/hooks.js
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

/**
 * 관리자 통계 조회 훅
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => fetch('/api/admin/stats').then(r => r.json()),
    staleTime: 60000, // 1분
    refetchOnWindowFocus: true
  })
}

/**
 * 사용자 정지 훅
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useSuspendUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, duration, reason }) => {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, reason })
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('계정이 정지되었습니다')
    }
  })
}
```

### 2. UI State (Zustand)
```jsx
// lib/admin/store.js
import { create } from 'zustand'

/**
 * @typedef {Object} AdminStore
 * @property {Object} userFilters - 사용자 필터 상태
 * @property {function(Object): void} setUserFilters - 필터 설정
 * @property {string[]} selectedUserIds - 선택된 사용자 ID 배열
 * @property {function(string): void} toggleUser - 사용자 선택 토글
 * @property {function(): void} selectAll - 전체 선택
 * @property {function(): void} clearSelection - 선택 초기화
 * @property {boolean} isModalOpen - 모달 열림 상태
 * @property {*} modalData - 모달 데이터
 * @property {function(*): void} openModal - 모달 열기
 * @property {function(): void} closeModal - 모달 닫기
 */

/**
 * @type {import('zustand').UseBoundStore<AdminStore>}
 */
export const useAdminStore = create((set) => ({
  userFilters: { status: 'all', search: '' },
  setUserFilters: (filters) => set({ userFilters: filters }),
  
  selectedUserIds: [],
  toggleUser: (id) => set((state) => ({
    selectedUserIds: state.selectedUserIds.includes(id)
      ? state.selectedUserIds.filter(uid => uid !== id)
      : [...state.selectedUserIds, id]
  })),
  selectAll: () => {/* ... */},
  clearSelection: () => set({ selectedUserIds: [] }),
  
  isModalOpen: false,
  modalData: null,
  openModal: (data) => set({ isModalOpen: true, modalData: data }),
  closeModal: () => set({ isModalOpen: false, modalData: null })
}))
```

---

## 🔄 실시간 업데이트 전략

### WebSocket Provider (Client Component)
```jsx
// components/admin/providers/AdminWebSocketProvider.js
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

/**
 * @type {React.Context<import('socket.io-client').Socket | null>}
 */
const WebSocketContext = createContext(null)

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function AdminWebSocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const socketInstance = io('/admin', {
      auth: { token: localStorage.getItem('token') }
    })
    
    socketInstance.on('admin:stats:update', (data) => {
      queryClient.setQueryData(['admin-stats'], data)
    })
    
    socketInstance.on('admin:report:new', (report) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
      toast.warning('새 신고가 접수되었습니다')
    })
    
    socketInstance.on('admin:system:status', (status) => {
      queryClient.setQueryData(['admin-system-status'], status)
      if (status.cpu > 90 || status.memory > 90) {
        toast.error('시스템 리소스 사용률이 높습니다!')
      }
    })
    
    setSocket(socketInstance)
    
    return () => {
      socketInstance.disconnect()
    }
  }, [queryClient])
  
  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  )
}

/**
 * @returns {import('socket.io-client').Socket | null}
 */
export const useAdminWebSocket = () => useContext(WebSocketContext)
```

---

## 🎨 레이아웃 계층 구조

```jsx
// app/admin/layout.js (Server Component)
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AdminLayoutClient from '@/components/admin/layout/AdminLayoutClient'

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export default async function AdminLayout({ children }) {
  const session = await auth()
  
  if (!session || session.user.role !== 'SYSTEM_ADMIN') {
    redirect('/sign-in')
  }
  
  return (
    <AdminLayoutClient session={session}>
      {children}
    </AdminLayoutClient>
  )
}

// components/admin/layout/AdminLayoutClient.js (Client Component)
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminWebSocketProvider } from '../providers/AdminWebSocketProvider'
import AdminNav from './AdminNav'
import AdminHeader from './AdminHeader'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      refetchOnWindowFocus: false
    }
  }
})

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Object} props.session
 */
export default function AdminLayoutClient({ children, session }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminWebSocketProvider>
        <div className="flex h-screen">
          <AdminNav />
          <div className="flex-1 flex flex-col">
            <AdminHeader user={session.user} />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </AdminWebSocketProvider>
    </QueryClientProvider>
  )
}
```

---

## 📊 성능 지표 목표

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 1.5s
  - Server Components로 초기 HTML 빠르게 전송
  - 이미지 최적화 (next/image)
  
- **FID (First Input Delay)**: < 100ms
  - 최소한의 Client JavaScript
  - Code Splitting
  
- **CLS (Cumulative Layout Shift)**: < 0.1
  - Skeleton UI로 레이아웃 고정
  - 명시적 width/height

### 번들 크기
- **초기 JS**: < 150KB (gzipped)
- **페이지별 JS**: < 50KB (gzipped)
- **공통 청크**: < 100KB (gzipped)

### 캐싱 전략
- **Static Data**: ISR (60초 revalidate)
- **Dynamic Data**: React Query (staleTime 60초)
- **User Data**: On-demand revalidation

---

**다음 문서**: 
- `02-users.md` - 사용자 관리 화면 상세 설계
- `07-components.md` - 공통 컴포넌트 상세 명세

