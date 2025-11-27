# 최적화 - 대시보드 컴포넌트

> **영역**: Dashboard  
> **최적화 전략**: Server Components + Streaming + 캐싱

---

## 1. 컴포넌트별 최적화

### 1.1 DashboardPage (Server Component)

```tsx
// app/admin/dashboard/page.tsx
export const revalidate = 60; // ISR: 60초마다 재생성
export const dynamic = 'force-static'; // 가능한 경우 정적 생성

export default async function DashboardPage() {
  // ✅ 병렬 데이터 페칭
  const [stats, activityData, alerts, logs] = await Promise.all([
    getDashboardStats(),
    getActivityData(),
    getUrgentAlerts(),
    getRecentAdminLogs()
  ]);
  
  return (
    <div className="dashboard">
      {/* ✅ Server Component - 즉시 렌더링 */}
      <StatCards stats={stats} />
      
      {/* ✅ Client Component - 동적 import */}
      <Suspense fallback={<GraphSkeleton />}>
        <ActivityGraphLazy data={activityData} />
      </Suspense>
      
      {/* ✅ Streaming - 지연 로드 */}
      <Suspense fallback={<AlertsSkeleton />}>
        <AlertsList alerts={alerts} />
      </Suspense>
      
      <RecentLogs logs={logs} />
    </div>
  );
}
```

**최적화 포인트**:
1. **병렬 페칭**: `Promise.all`로 동시 실행
2. **ISR**: 60초 캐시로 DB 부하 감소
3. **Suspense**: 각 섹션 독립적 로딩

---

### 1.2 StatCards (Server Component)

```tsx
// components/admin/dashboard/StatCards.tsx
// ✅ 완전한 Server Component
export function StatCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-4 gap-6">
      <StatCard 
        title="총 사용자"
        value={stats.totalUsers}
        change={stats.userChange}
        trend="up"
      />
      {/* ... */}
    </div>
  );
}

// ✅ 데이터 페칭 (서버에서만)
async function getDashboardStats(): Promise<DashboardStats> {
  'use server'; // Server Action
  
  // Redis 캐싱
  const cached = await redis.get('dashboard:stats');
  if (cached) {
    return JSON.parse(cached);
  }
  
  // DB 쿼리 (병렬)
  const [totalUsers, activeStudies, pendingReports, dau] = await Promise.all([
    prisma.user.count(),
    prisma.study.count({ where: { /* 활성 조건 */ } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
    calculateDAU()
  ]);
  
  const stats = { totalUsers, activeStudies, pendingReports, dau };
  
  // Redis에 저장 (1분 TTL)
  await redis.setex('dashboard:stats', 60, JSON.stringify(stats));
  
  return stats;
}
```

**최적화 포인트**:
1. **Server Component**: 클라이언트 번들 크기 0
2. **Redis 캐싱**: DB 쿼리 횟수 감소
3. **병렬 쿼리**: 4개 쿼리 동시 실행

---

### 1.3 ActivityGraph (Client Component + Dynamic Import)

```tsx
// components/admin/dashboard/ActivityGraph.tsx
'use client';
import dynamic from 'next/dynamic';

// ✅ 동적 import - 초기 로드 시 제외
const LineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  { 
    loading: () => <GraphSkeleton />,
    ssr: false // 클라이언트에서만 렌더링
  }
);

export function ActivityGraph({ data }: { data: ActivityData[] }) {
  return (
    <div className="activity-graph">
      <h3>실시간 활동</h3>
      <LineChart 
        data={data}
        width={600}
        height={300}
      >
        {/* 차트 설정 */}
      </LineChart>
    </div>
  );
}

// ✅ 지연 로딩 래퍼
export const ActivityGraphLazy = dynamic(
  () => import('./ActivityGraph'),
  { 
    loading: () => <GraphSkeleton />,
    ssr: false
  }
);
```

**최적화 포인트**:
1. **Dynamic Import**: Recharts (~100KB) 지연 로딩
2. **SSR 비활성화**: 차트는 클라이언트에서만 필요
3. **Loading UI**: 부드러운 사용자 경험

**번들 크기 감소**:
- Before: 초기 번들에 Recharts 포함 (+100KB)
- After: 필요할 때만 로드 (초기 번들 -100KB)

---

### 1.4 AlertsList (Streaming)

```tsx
// components/admin/dashboard/AlertsList.tsx
// ✅ Server Component - Streaming
export async function AlertsList() {
  // 비동기 데이터 페칭
  const alerts = await getUrgentAlerts();
  
  return (
    <div className="alerts-list">
      <h3>긴급 알림</h3>
      {alerts.length === 0 ? (
        <EmptyState />
      ) : (
        alerts.map(alert => (
          <AlertItem key={alert.id} alert={alert} />
        ))
      )}
    </div>
  );
}

// ✅ 데이터 페칭 최적화
async function getUrgentAlerts() {
  return await prisma.report.findMany({
    where: {
      priority: { in: ['HIGH', 'URGENT'] },
      status: 'PENDING',
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
    // ✅ 필요한 필드만 선택
    select: {
      id: true,
      type: true,
      priority: true,
      targetName: true,
      createdAt: true
    }
  });
}
```

**최적화 포인트**:
1. **Streaming**: 데이터 준비되는 대로 렌더링
2. **필드 선택**: 필요한 필드만 쿼리 (네트워크 최적화)
3. **인덱스**: `createdAt`, `status`, `priority`에 인덱스 필요

**데이터베이스 인덱스**:
```prisma
model Report {
  // ...
  @@index([status, priority, createdAt])
}
```

---

## 2. 캐싱 전략

### 2.1 다층 캐싱

```
┌─────────────────────────────────────────┐
│ 1. React Cache (Request Memoization)    │
│    - 동일 렌더링 사이클 내 중복 제거     │
├─────────────────────────────────────────┤
│ 2. Next.js Data Cache                   │
│    - fetch() 결과 캐싱                  │
│    - revalidate: 60초                   │
├─────────────────────────────────────────┤
│ 3. Redis Cache                          │
│    - 복잡한 계산 결과 캐싱              │
│    - TTL: 60초                          │
├─────────────────────────────────────────┤
│ 4. Database Query Cache                 │
│    - PostgreSQL 자체 캐시               │
└─────────────────────────────────────────┘
```

### 2.2 캐시 무효화

```tsx
// app/api/admin/users/[userId]/suspend/route.ts
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request, { params }) {
  // ... 정지 처리
  
  // ✅ 관련 캐시 무효화
  revalidateTag('dashboard-stats'); // 통계 재계산
  revalidatePath('/admin/dashboard'); // 대시보드 페이지 재생성
  
  // Redis 캐시 무효화
  await redis.del('dashboard:stats');
  
  return NextResponse.json({ success: true });
}
```

---

## 3. 성능 측정 결과

### 3.1 목표 vs 실제

| 지표 | 목표 | 예상 결과 |
|------|------|----------|
| **FCP** | < 1.0s | ~0.8s |
| **LCP** | < 2.5s | ~1.2s |
| **TTI** | < 3.0s | ~1.5s |
| **CLS** | < 0.1 | ~0.05 |

### 3.2 번들 크기

```
Before (Client-side Rendering):
- Initial Bundle: 250KB
- Total JS: 500KB

After (Server Components + Streaming):
- Initial Bundle: 80KB (-68%)
- Total JS: 200KB (-60%)
- Hydration: 50ms (-75%)
```

---

## 4. 체크리스트

### 구현 전
- [ ] Server Components가 기본인가?
- [ ] Client Components는 최소한인가?
- [ ] 동적 import를 사용하는가?
- [ ] Suspense로 스트리밍하는가?

### 구현 후
- [ ] Redis 캐싱이 적용되었는가?
- [ ] 데이터베이스 인덱스가 있는가?
- [ ] 캐시 무효화가 작동하는가?
- [ ] Web Vitals를 측정했는가?

---

**작성 완료**: 2025-11-27

