# 관리자 시스템 아키텍처

> **프로젝트**: CoUp 플랫폼 관리자 시스템  
> **작성일**: 2025-11-26  
> **버전**: 2.0  
> **이전 문서**: [03-features-spec.md](./03-features-spec.md)

---

## 📋 개요

관리자 시스템의 전체 아키텍처를 정의합니다. 폴더 구조, 컴포넌트 계층, 데이터 흐름, RSC/CSR 전략을 포함합니다.

---

## 🗂️ 폴더 구조

```
coup/src/
├── app/
│   ├── admin/                          # 관리자 페이지 (App Router)
│   │   ├── layout.js                   # 관리자 전용 레이아웃
│   │   ├── page.js                     # 대시보드 (SSR)
│   │   ├── users/
│   │   │   ├── page.js                 # 사용자 목록 (RSC)
│   │   │   └── [id]/
│   │   │       └── page.js             # 사용자 상세 (RSC)
│   │   ├── studies/
│   │   │   ├── page.js                 # 스터디 목록 (RSC)
│   │   │   └── [id]/
│   │   │       └── page.js             # 스터디 상세 (RSC)
│   │   ├── reports/
│   │   │   └── page.js                 # 신고 관리 (CSR)
│   │   ├── content/
│   │   │   └── page.js                 # 콘텐츠 모니터링 (CSR)
│   │   ├── stats/
│   │   │   └── page.js                 # 통계 분석 (ISR)
│   │   └── settings/
│   │       └── page.js                 # 시스템 설정 (SSR)
│   └── api/
│       └── admin/                      # 관리자 API Routes
│           ├── stats/
│           │   └── route.js            # 통계 API
│           ├── users/
│           │   ├── route.js            # 사용자 목록/생성
│           │   └── [id]/
│           │       ├── route.js        # 사용자 조회/수정/삭제
│           │       ├── suspend/
│           │       │   └── route.js    # 정지
│           │       └── restore/
│           │           └── route.js    # 정지 해제
│           ├── studies/
│           │   ├── route.js
│           │   └── [id]/
│           │       ├── route.js
│           │       ├── hide/
│           │       │   └── route.js
│           │       └── members/
│           │           └── route.js
│           ├── reports/
│           │   ├── route.js
│           │   └── [id]/
│           │       ├── route.js
│           │       └── resolve/
│           │           └── route.js
│           ├── content/
│           │   ├── notices/
│           │   │   └── route.js
│           │   ├── files/
│           │   │   └── route.js
│           │   └── messages/
│           │       └── route.js
│           └── settings/
│               ├── categories/
│               │   └── route.js
│               └── system/
│                   └── route.js
│
├── components/
│   └── admin/                          # 관리자 컴포넌트
│       ├── layout/
│       │   ├── AdminLayout.jsx         # 전체 레이아웃
│       │   ├── AdminNav.jsx            # 좌측 네비게이션
│       │   └── AdminHeader.jsx         # 상단 헤더
│       ├── common/
│       │   ├── DataTable.jsx           # 데이터 테이블 (CSR)
│       │   ├── StatCard.jsx            # 통계 카드 (RSC)
│       │   ├── Modal.jsx               # 모달
│       │   ├── ConfirmDialog.jsx       # 확인 다이얼로그
│       │   ├── Toast.jsx               # 토스트 알림
│       │   └── EmptyState.jsx          # 빈 상태
│       ├── dashboard/
│       │   ├── StatsCards.jsx          # 통계 카드 모음 (RSC)
│       │   ├── UserGrowthChart.jsx     # 사용자 증가 차트 (CSR)
│       │   ├── StudyActivityChart.jsx  # 스터디 활동 차트 (CSR)
│       │   ├── RecentReports.jsx       # 최근 신고 (RSC)
│       │   └── SystemStatus.jsx        # 시스템 상태 (CSR)
│       ├── users/
│       │   ├── UserTable.jsx           # 사용자 테이블 (CSR)
│       │   ├── UserFilters.jsx         # 필터 (CSR)
│       │   ├── UserDetailModal.jsx     # 상세 모달
│       │   ├── SuspendModal.jsx        # 정지 모달
│       │   └── BulkActions.jsx         # 일괄 작업
│       ├── studies/
│       │   ├── StudyTable.jsx
│       │   ├── StudyFilters.jsx
│       │   └── StudyDetailModal.jsx
│       ├── reports/
│       │   ├── ReportTable.jsx
│       │   ├── ReportFilters.jsx
│       │   └── ResolveModal.jsx
│       ├── content/
│       │   ├── ContentSearch.jsx
│       │   └── ContentTable.jsx
│       ├── stats/
│       │   ├── PlatformStats.jsx
│       │   ├── UserAnalytics.jsx
│       │   ├── StudyAnalytics.jsx
│       │   └── ActivityAnalytics.jsx
│       └── settings/
│           ├── CategoryManager.jsx
│           ├── SystemSettings.jsx
│           └── LegalDocuments.jsx
│
├── lib/
│   ├── actions/
│   │   └── admin/                      # Server Actions
│   │       ├── users.js                # 사용자 관리 액션
│   │       ├── studies.js              # 스터디 관리 액션
│   │       ├── reports.js              # 신고 관리 액션
│   │       ├── content.js              # 콘텐츠 액션
│   │       └── settings.js             # 설정 액션
│   ├── hooks/
│   │   └── admin/                      # Custom Hooks
│   │       ├── useAdminAuth.js         # 관리자 인증
│   │       ├── useUserList.js          # 사용자 목록
│   │       ├── useStudyList.js         # 스터디 목록
│   │       └── useReportList.js        # 신고 목록
│   └── utils/
│       └── admin/                      # 유틸리티
│           ├── permissions.js          # 권한 검증
│           ├── validation.js           # 유효성 검증
│           └── formatting.js           # 데이터 포맷팅
│
└── styles/
    └── admin/                          # 관리자 스타일
        ├── layout.css
        ├── dashboard.css
        └── tables.css
```

---

## 🏗️ 컴포넌트 계층 구조

### 레벨 1: 레이아웃 (Layout)
```
AdminLayout (RSC)
├── AdminNav (CSR)
└── AdminHeader (CSR)
    └── NotificationBell (CSR)
```

**특징**:
- `AdminLayout`: 서버 컴포넌트, 인증 검증
- `AdminNav`, `AdminHeader`: 클라이언트 컴포넌트, 상태 관리

---

### 레벨 2: 페이지 (Page)
```
DashboardPage (SSR)
├── StatsCards (RSC)
├── UserGrowthChart (CSR)
├── StudyActivityChart (CSR)
├── RecentReports (RSC)
└── SystemStatus (CSR)
```

**특징**:
- 페이지는 SSR 또는 ISR
- 서버/클라이언트 컴포넌트 혼합

---

### 레벨 3: 데이터 컴포넌트
```
UserTable (CSR)
├── UserFilters (CSR)
├── UserRow (CSR)
└── UserPagination (CSR)
```

**특징**:
- 데이터 테이블은 클라이언트 컴포넌트
- React Query로 데이터 관리

---

### 레벨 4: UI 컴포넌트
```
Modal (CSR)
├── ModalHeader
├── ModalBody
└── ModalFooter
```

**특징**:
- 재사용 가능한 UI 컴포넌트
- 상태 관리 포함

---

## 🔄 데이터 흐름

### 1. 읽기 (Read) 흐름

#### 패턴 A: Server Component (SSR/RSC)
```
Page (RSC)
  ↓
fetch data directly
  ↓
render with data
```

**예시**: 대시보드 통계 카드
```javascript
// app/admin/page.js (RSC)
import { getAdminStats } from '@/lib/actions/admin/stats'

export default async function AdminDashboard() {
  const stats = await getAdminStats()
  
  return <StatsCards stats={stats} />
}
```

**장점**:
- 초기 로딩 빠름 (SSR)
- SEO 최적화
- 서버에서 권한 검증

---

#### 패턴 B: Client Component (CSR)
```
Page (RSC)
  ↓
Client Component
  ↓
React Query
  ↓
API Route
  ↓
Database
```

**예시**: 사용자 테이블
```javascript
// components/admin/users/UserTable.jsx (CSR)
'use client'

import { useQuery } from '@tanstack/react-query'

export default function UserTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => fetch('/api/admin/users').then(r => r.json())
  })
  
  return <DataTable data={data} loading={isLoading} />
}
```

**장점**:
- 실시간 필터링
- 캐싱 및 자동 갱신
- Optimistic UI 가능

---

### 2. 쓰기 (Write) 흐름

#### 패턴: Server Action
```
Client Component
  ↓
Server Action
  ↓
Validation
  ↓
Database
  ↓
Revalidate Cache
  ↓
Response
```

**예시**: 사용자 정지
```javascript
// lib/actions/admin/users.js (Server Action)
'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

export async function suspendUser(userId, data) {
  // 1. 권한 검증
  const session = await getServerSession()
  if (session.user.role !== 'SYSTEM_ADMIN') {
    throw new Error('Unauthorized')
  }
  
  // 2. 유효성 검증
  const validated = suspendSchema.parse(data)
  
  // 3. DB 업데이트
  const suspension = await prisma.suspension.create({
    data: {
      userId,
      ...validated,
      adminId: session.user.id
    }
  })
  
  // 4. 캐시 무효화
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
  
  // 5. 알림 발송
  await sendSuspensionEmail(userId, suspension)
  
  return { success: true, suspension }
}
```

**장점**:
- 서버에서 권한 검증
- 자동 캐시 무효화
- 타입 안전

---

## 🎯 RSC vs CSR 전략

### Server Component (RSC) 사용 케이스

#### 1. 초기 데이터 로딩
- ✅ 대시보드 통계 카드
- ✅ 사용자 상세 정보
- ✅ 스터디 상세 정보

**이유**: 초기 로딩 속도, SEO

---

#### 2. 정적 콘텐츠
- ✅ 레이아웃
- ✅ 빈 상태
- ✅ 에러 페이지

**이유**: 번들 크기 감소

---

### Client Component (CSR) 사용 케이스

#### 1. 인터랙티브 UI
- ✅ 데이터 테이블 (필터, 정렬, 페이지네이션)
- ✅ 차트 (Recharts)
- ✅ 모달
- ✅ 폼

**이유**: 사용자 인터랙션, 상태 관리

---

#### 2. 실시간 데이터
- ✅ 시스템 상태 모니터링
- ✅ 온라인 사용자 수
- ✅ 신고 알림

**이유**: WebSocket, 주기적 갱신

---

#### 3. 복잡한 상태 관리
- ✅ 일괄 작업 (체크박스 선택)
- ✅ 드래그 앤 드롭 (카테고리 순서 변경)
- ✅ 멀티 스텝 폼

**이유**: 로컬 상태 필요

---

## 🔐 인증 및 권한 체계

### 미들웨어 (middleware.js)
```javascript
// middleware.js
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const token = await getToken({ req })
  
  // 관리자 페이지 접근
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!token || token.role !== 'SYSTEM_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
```

---

### API Route 권한 검증
```javascript
// lib/utils/admin/auth.js
export async function verifyAdminAuth(req) {
  const session = await getServerSession()
  
  if (!session || session.user.role !== 'SYSTEM_ADMIN') {
    throw new Error('Unauthorized')
  }
  
  return session
}

// app/api/admin/users/route.js
import { verifyAdminAuth } from '@/lib/utils/admin/auth'

export async function GET(req) {
  await verifyAdminAuth(req)
  
  // ... 로직
}
```

---

### Server Action 권한 검증
```javascript
// lib/actions/admin/users.js
'use server'

import { verifyAdminAuth } from '@/lib/utils/admin/auth'

export async function suspendUser(userId, data) {
  await verifyAdminAuth()
  
  // ... 로직
}
```

---

## 📦 상태 관리 전략

### 1. 서버 상태 (React Query)

**사용 케이스**:
- API 데이터 fetch
- 캐싱
- 자동 갱신

**설정**:
```javascript
// app/admin/layout.js
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1분
      cacheTime: 5 * 60 * 1000, // 5분
      refetchOnWindowFocus: true,
      retry: 1
    }
  }
})

export default function AdminLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

---

### 2. 클라이언트 상태 (Zustand)

**사용 케이스**:
- UI 상태 (모달, 사이드바)
- 필터 상태
- 일괄 작업 선택

**예시**:
```javascript
// lib/store/admin.js
import { create } from 'zustand'

export const useAdminStore = create((set) => ({
  selectedUsers: [],
  addSelectedUser: (userId) => set((state) => ({
    selectedUsers: [...state.selectedUsers, userId]
  })),
  clearSelection: () => set({ selectedUsers: [] })
}))
```

---

## 🚀 성능 최적화

### 1. 코드 스플리팅
```javascript
// 동적 import로 차트 라이브러리 지연 로딩
const UserGrowthChart = dynamic(
  () => import('@/components/admin/dashboard/UserGrowthChart'),
  { 
    loading: () => <ChartSkeleton />,
    ssr: false 
  }
)
```

---

### 2. 가상 스크롤
```javascript
// 대용량 테이블은 react-window 사용
import { FixedSizeList } from 'react-window'

export default function UserTable({ users }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={users.length}
      itemSize={60}
    >
      {({ index, style }) => (
        <UserRow user={users[index]} style={style} />
      )}
    </FixedSizeList>
  )
}
```

---

### 3. 페이지네이션
```javascript
// 서버 사이드 페이지네이션
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  
  const users = await prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit
  })
  
  return NextResponse.json({ users })
}
```

---

### 4. 캐싱 전략

#### React Query 캐싱
```javascript
// 통계는 1분 캐싱
useQuery({
  queryKey: ['admin', 'stats'],
  queryFn: fetchStats,
  staleTime: 60 * 1000
})

// 사용자 목록은 30초 캐싱
useQuery({
  queryKey: ['admin', 'users', filters],
  queryFn: () => fetchUsers(filters),
  staleTime: 30 * 1000
})
```

#### ISR 캐싱
```javascript
// 통계 페이지는 1시간마다 재생성
export const revalidate = 3600 // 1시간

export default async function StatsPage() {
  const stats = await getStats()
  return <StatsView stats={stats} />
}
```

---

## 🔗 관련 문서

- [기능 명세](./03-features-spec.md)
- [최적화 전략](./05-optimization.md)
- [API 명세](../backend/api/admin/01-overview.md)
- [화면 설계](../screens/admin/01-layout.md)

---

**작성일**: 2025-11-26  
**다음 문서**: [05-optimization.md](./05-optimization.md)

