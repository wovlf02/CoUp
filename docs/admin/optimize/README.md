# 관리자 시스템 - Next.js 15/16 최적화 전략

> **작성일**: 2025-11-27  
> **목적**: 관리자 페이지의 모든 컴포넌트에 Next.js 15/16 최적화 전략 적용  
> **참조**: Next.js 15/16 공식 문서, React 19 Server Components

---

## 📋 목차

1. [최적화 전략 개요](#1-최적화-전략-개요)
2. [Server Components vs Client Components](#2-server-components-vs-client-components)
3. [데이터 Fetching 전략](#3-데이터-fetching-전략)
4. [캐싱 전략](#4-캐싱-전략)
5. [코드 스플리팅](#5-코드-스플리팅)
6. [영역별 최적화 전략](#6-영역별-최적화-전략)

---

## 1. 최적화 전략 개요

### 1.1 Next.js 15/16 주요 기능

```typescript
// Next.js 15/16 핵심 기능
- React Server Components (RSC)
- Server Actions
- Streaming & Suspense
- Parallel Routes & Intercepting Routes
- Optimized Image & Font Loading
- Enhanced App Router
- Turbopack (Dev Server)
- Partial Prerendering (PPR) - Experimental
```

### 1.2 최적화 목표

| 지표 | 목표 | 현재 | 개선 |
|------|------|------|------|
| **First Contentful Paint (FCP)** | < 1.0s | - | - |
| **Largest Contentful Paint (LCP)** | < 2.5s | - | - |
| **Time to Interactive (TTI)** | < 3.0s | - | - |
| **Cumulative Layout Shift (CLS)** | < 0.1 | - | - |
| **First Input Delay (FID)** | < 100ms | - | - |

---

## 2. Server Components vs Client Components

### 2.1 기본 원칙

```tsx
// ✅ 좋음: 기본적으로 Server Component 사용
// app/admin/users/page.tsx
export default async function UsersPage() {
  const users = await fetchUsers(); // 서버에서 데이터 페칭
  
  return (
    <div>
      <h1>사용자 관리</h1>
      <UsersTable users={users} /> {/* Client Component */}
    </div>
  );
}

// ❌ 나쁨: 불필요하게 Client Component 사용
'use client';
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetchUsers().then(setUsers); // 클라이언트에서 페칭
  }, []);
  
  return <div>...</div>;
}
```

### 2.2 Server Component 사용 기준

**Server Component로 만들어야 하는 경우**:
- ✅ 데이터 페칭이 필요한 경우
- ✅ 백엔드 리소스에 직접 접근
- ✅ 민감한 정보 보호 (API 키, 토큰)
- ✅ 대용량 종속성 (차트 라이브러리 등)
- ✅ SEO가 중요한 경우

**Client Component로 만들어야 하는 경우**:
- ✅ 인터랙티브한 이벤트 (onClick, onChange 등)
- ✅ React Hooks 사용 (useState, useEffect 등)
- ✅ 브라우저 API 사용 (localStorage, window 등)
- ✅ 실시간 업데이트 (WebSocket)
- ✅ Context API 사용

### 2.3 관리자 페이지 컴포넌트 분류

#### Server Components
```typescript
// ✅ Server Components (기본)
app/admin/
├── layout.tsx                      // 레이아웃
├── page.tsx                        // 대시보드 (리다이렉트)
├── dashboard/
│   └── page.tsx                    // 대시보드 메인
├── users/
│   ├── page.tsx                    // 사용자 목록
│   └── [userId]/
│       └── page.tsx                // 사용자 상세
└── studies/
    ├── page.tsx                    // 스터디 목록
    └── [studyId]/
        └── page.tsx                // 스터디 상세
```

#### Client Components
```typescript
// 'use client' 필요
components/admin/
├── SearchBar.tsx                   // 검색 (onChange)
├── FilterPanel.tsx                 // 필터 (상태 관리)
├── DataTable.tsx                   // 테이블 (정렬, 선택)
├── SuspendModal.tsx                // 모달 (열기/닫기)
├── ChartWidget.tsx                 // 차트 (인터랙티브)
└── RealtimeAlert.tsx               // 실시간 알림 (WebSocket)
```

---

## 3. 데이터 Fetching 전략

### 3.1 페이지별 데이터 Fetching 방식

#### 대시보드 (SSR + Revalidate)
```tsx
// app/admin/dashboard/page.tsx
export const revalidate = 60; // 60초마다 재생성 (ISR)

async function getDashboardStats() {
  const res = await fetch('http://localhost:3000/api/admin/dashboard', {
    cache: 'no-store', // 항상 최신 데이터
  });
  return res.json();
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent stats={stats} />
    </Suspense>
  );
}
```

#### 사용자 목록 (SSR + Cache)
```tsx
// app/admin/users/page.tsx
async function getUsers(searchParams) {
  const res = await fetch(
    `http://localhost:3000/api/admin/users?${new URLSearchParams(searchParams)}`,
    {
      cache: 'force-cache', // 캐싱 (검색 조건별)
      next: { revalidate: 300 }, // 5분 캐시
    }
  );
  return res.json();
}

export default async function UsersPage({ searchParams }) {
  const users = await getUsers(searchParams);
  
  return (
    <Suspense fallback={<UsersListSkeleton />}>
      <UsersList users={users} />
    </Suspense>
  );
}
```

#### 사용자 상세 (SSG + On-Demand Revalidation)
```tsx
// app/admin/users/[userId]/page.tsx
export const dynamicParams = true; // 동적 파라미터 허용

async function getUserDetail(userId) {
  const res = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
    next: { 
      revalidate: 3600, // 1시간 캐시
      tags: [`user-${userId}`], // 태그 기반 재검증
    },
  });
  return res.json();
}

export default async function UserDetailPage({ params }) {
  const user = await getUserDetail(params.userId);
  
  return (
    <div>
      <UserBasicInfo user={user} />
      <UserActivityStats user={user} />
      <SanctionHistory userId={user.id} />
    </div>
  );
}

// 사용자 정보 업데이트 시 재검증
// app/api/admin/users/[userId]/suspend/route.ts
import { revalidateTag } from 'next/cache';

export async function POST(request, { params }) {
  // ... 정지 처리
  
  revalidateTag(`user-${params.userId}`); // 캐시 무효화
  
  return NextResponse.json({ success: true });
}
```

### 3.2 병렬 데이터 Fetching

```tsx
// app/admin/dashboard/page.tsx
async function getDashboardData() {
  // 병렬로 여러 데이터 페칭
  const [stats, alerts, recentLogs] = await Promise.all([
    fetch('http://localhost:3000/api/admin/dashboard/stats').then(r => r.json()),
    fetch('http://localhost:3000/api/admin/dashboard/alerts').then(r => r.json()),
    fetch('http://localhost:3000/api/admin/logs/recent').then(r => r.json()),
  ]);
  
  return { stats, alerts, recentLogs };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  
  return (
    <>
      <StatCards stats={data.stats} />
      <AlertList alerts={data.alerts} />
      <RecentLogs logs={data.recentLogs} />
    </>
  );
}
```

### 3.3 Streaming & Suspense

```tsx
// app/admin/reports/page.tsx
export default function ReportsPage() {
  return (
    <div>
      <h1>신고 관리</h1>
      
      {/* 우선순위별로 순차 렌더링 */}
      <Suspense fallback={<UrgentReportsSkeleton />}>
        <UrgentReports /> {/* 먼저 로드 */}
      </Suspense>
      
      <Suspense fallback={<AllReportsSkeleton />}>
        <AllReports /> {/* 나중에 로드 */}
      </Suspense>
    </div>
  );
}

// 컴포넌트별로 독립적으로 데이터 페칭
async function UrgentReports() {
  const reports = await fetchReports({ priority: 'URGENT' });
  return <ReportsList reports={reports} />;
}

async function AllReports() {
  const reports = await fetchReports({});
  return <ReportsList reports={reports} />;
}
```

---

## 4. 캐싱 전략

### 4.1 캐싱 레이어

```
┌─────────────────────────────────────────┐
│ 1. Request Memoization (요청 메모이제이션) │
│    - 동일 요청 중복 제거                 │
│    - 단일 렌더링 사이클 내                │
├─────────────────────────────────────────┤
│ 2. Data Cache (데이터 캐시)              │
│    - fetch() 결과 캐싱                   │
│    - 서버 측 영구 저장                   │
├─────────────────────────────────────────┤
│ 3. Full Route Cache (전체 라우트 캐시)   │
│    - 전체 페이지 HTML + RSC Payload     │
│    - 빌드 타임에 생성                    │
├─────────────────────────────────────────┤
│ 4. Router Cache (라우터 캐시)            │
│    - 클라이언트 측 페이지 캐시           │
│    - 세션 동안 유지                      │
└─────────────────────────────────────────┘
```

### 4.2 캐싱 설정

#### 정적 데이터 (Static Data)
```tsx
// 변경이 거의 없는 데이터 (카테고리, 역할 목록 등)
async function getCategories() {
  const res = await fetch('http://localhost:3000/api/categories', {
    cache: 'force-cache', // 무기한 캐싱
  });
  return res.json();
}
```

#### 동적 데이터 (Dynamic Data)
```tsx
// 자주 변경되는 데이터 (신고 목록, 실시간 통계)
async function getPendingReports() {
  const res = await fetch('http://localhost:3000/api/admin/reports?status=PENDING', {
    cache: 'no-store', // 캐싱 안 함
  });
  return res.json();
}
```

#### 시간 기반 재검증 (Time-based Revalidation)
```tsx
// 주기적으로 업데이트되는 데이터 (일일 통계, 주간 리포트)
async function getDailyStats() {
  const res = await fetch('http://localhost:3000/api/admin/stats/daily', {
    next: { revalidate: 3600 }, // 1시간마다 재검증
  });
  return res.json();
}
```

#### On-Demand 재검증 (On-Demand Revalidation)
```tsx
// 특정 이벤트 시 캐시 무효화
import { revalidateTag, revalidatePath } from 'next/cache';

// 사용자 정지 시
export async function POST(request) {
  // ... 정지 처리
  
  revalidateTag('users-list'); // 태그 기반
  revalidatePath('/admin/users'); // 경로 기반
  
  return NextResponse.json({ success: true });
}
```

### 4.3 Redis 캐싱 (추가 레이어)

```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60
): Promise<T> {
  // 1. Redis 캐시 확인
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 2. 데이터 페칭
  const data = await fetcher();
  
  // 3. Redis에 저장
  await redis.setex(key, ttl, JSON.stringify(data));
  
  return data;
}

// 사용 예시
async function getDashboardStats() {
  return getCachedData(
    'admin:dashboard:stats',
    async () => {
      const res = await fetch('http://localhost:3000/api/admin/dashboard');
      return res.json();
    },
    60 // 1분 TTL
  );
}
```

---

## 5. 코드 스플리팅

### 5.1 Dynamic Import

```tsx
// ❌ 나쁨: 모든 컴포넌트를 정적 import
import HeavyChart from '@/components/admin/HeavyChart';
import ComplexTable from '@/components/admin/ComplexTable';
import LargeModal from '@/components/admin/LargeModal';

// ✅ 좋음: 필요할 때만 동적 import
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/admin/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // 클라이언트에서만 렌더링
});

const ComplexTable = dynamic(() => import('@/components/admin/ComplexTable'), {
  loading: () => <TableSkeleton />,
});

const LargeModal = dynamic(() => import('@/components/admin/LargeModal'), {
  ssr: false,
});
```

### 5.2 조건부 로딩

```tsx
// 권한에 따라 동적 로딩
export default function DashboardPage({ session }) {
  const SystemAdminPanel = dynamic(
    () => import('@/components/admin/SystemAdminPanel'),
    { ssr: false }
  );
  
  return (
    <div>
      <h1>대시보드</h1>
      
      {/* 일반 관리자 컴포넌트 */}
      <RegularAdminContent />
      
      {/* SYSTEM_ADMIN만 로드 */}
      {session.user.role === 'SYSTEM_ADMIN' && (
        <SystemAdminPanel />
      )}
    </div>
  );
}
```

### 5.3 라이브러리 최적화

```tsx
// ❌ 나쁨: 전체 라이브러리 import
import _ from 'lodash';
import moment from 'moment';

// ✅ 좋음: 필요한 함수만 import
import debounce from 'lodash/debounce';
import groupBy from 'lodash/groupBy';
import { formatDate } from 'date-fns';
```

---

## 6. 영역별 최적화 전략

### 6.1 대시보드 (Dashboard)

#### 컴포넌트 구조
```tsx
// app/admin/dashboard/page.tsx (Server Component)
export const revalidate = 60;

export default async function DashboardPage() {
  // 병렬 데이터 페칭
  const [stats, alerts] = await Promise.all([
    getDashboardStats(),
    getUrgentAlerts(),
  ]);
  
  return (
    <div>
      {/* Server Component */}
      <StatCards stats={stats} />
      
      {/* Client Component (인터랙티브) */}
      <ActivityGraphClient />
      
      {/* Streaming */}
      <Suspense fallback={<AlertsSkeleton />}>
        <AlertsList alerts={alerts} />
      </Suspense>
    </div>
  );
}
```

#### 최적화 포인트
1. **StatCards**: Server Component로 유지 (데이터만 표시)
2. **ActivityGraph**: Client Component (차트 인터랙션)
   - Dynamic import로 차트 라이브러리 지연 로딩
   - 데이터만 props로 전달
3. **AlertsList**: Streaming으로 빠른 초기 렌더링

---

### 6.2 사용자 관리 (Users)

#### 컴포넌트 구조
```tsx
// app/admin/users/page.tsx (Server Component)
export default async function UsersPage({ searchParams }) {
  const users = await getUsers(searchParams);
  
  return (
    <div>
      {/* Client Component (검색, 필터) */}
      <SearchAndFilter />
      
      {/* Server Component → Client Component */}
      <UsersTable users={users} />
    </div>
  );
}

// components/admin/users/UsersTable.tsx (Client Component)
'use client';
export default function UsersTable({ users }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', order: 'desc' });
  
  // 정렬, 선택 등 클라이언트 상태
  return <DataTable data={users} ... />;
}
```

#### 최적화 포인트
1. **검색/필터**: URL 쿼리 파라미터 사용 → 캐싱 가능
2. **테이블**: 가상화 (react-window) - 대량 데이터 처리
3. **모달**: Dynamic import - 열 때만 로드
4. **무한 스크롤**: React Query의 useInfiniteQuery

---

### 6.3 스터디 관리 (Studies)

#### Partial Prerendering (실험적 기능)
```tsx
// next.config.js
module.exports = {
  experimental: {
    ppr: true, // Partial Prerendering 활성화
  },
};

// app/admin/studies/[studyId]/page.tsx
export default async function StudyDetailPage({ params }) {
  return (
    <div>
      {/* 정적 부분 (SSG) */}
      <StudyBasicInfo studyId={params.studyId} />
      
      {/* 동적 부분 (SSR) */}
      <Suspense fallback={<StatsSkeleton />}>
        <StudyRealtimeStats studyId={params.studyId} />
      </Suspense>
    </div>
  );
}
```

---

### 6.4 신고 관리 (Reports)

#### 실시간 업데이트 (Optimistic UI)
```tsx
// components/admin/reports/ProcessReportButton.tsx
'use client';
import { useOptimistic } from 'react';

export default function ProcessReportButton({ report }) {
  const [optimisticReport, setOptimisticReport] = useOptimistic(
    report,
    (state, newStatus) => ({ ...state, status: newStatus })
  );
  
  async function handleProcess(action) {
    // 즉시 UI 업데이트 (낙관적)
    setOptimisticReport(action === 'approve' ? 'RESOLVED' : 'REJECTED');
    
    // 실제 API 호출
    await fetch(`/api/admin/reports/${report.id}/process`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }
  
  return (
    <div>
      <Badge>{optimisticReport.status}</Badge>
      <Button onClick={() => handleProcess('approve')}>승인</Button>
      <Button onClick={() => handleProcess('reject')}>거절</Button>
    </div>
  );
}
```

---

## 7. 성능 모니터링

### 7.1 Web Vitals 측정

```tsx
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

### 7.2 커스텀 성능 측정

```tsx
// lib/performance.ts
export function measurePerformance(metricName: string) {
  if (typeof window === 'undefined') return;
  
  performance.mark(`${metricName}-start`);
  
  return () => {
    performance.mark(`${metricName}-end`);
    performance.measure(
      metricName,
      `${metricName}-start`,
      `${metricName}-end`
    );
    
    const measure = performance.getEntriesByName(metricName)[0];
    console.log(`${metricName}: ${measure.duration}ms`);
  };
}

// 사용 예시
const endMeasure = measurePerformance('users-table-render');
// ... 렌더링
endMeasure();
```

---

## 8. 체크리스트

### 페이지별 최적화 체크리스트

- [ ] Server Component가 기본인가?
- [ ] Client Component는 최소한인가?
- [ ] 데이터 페칭이 병렬로 되는가?
- [ ] Suspense로 스트리밍하는가?
- [ ] 적절한 캐싱 전략이 있는가?
- [ ] Dynamic import를 사용하는가?
- [ ] 이미지가 최적화되었는가? (next/image)
- [ ] 폰트가 최적화되었는가? (next/font)
- [ ] 번들 크기를 확인했는가?
- [ ] Web Vitals를 측정하는가?

---

**문서 버전**: 1.0  
**작성 완료일**: 2025-11-27  
**참조**: Next.js 15/16 공식 문서

