# 사용자 관리 - 목록 페이지

> **페이지 경로**: `/admin/users`  
> **컴포넌트**: Server Component (메인) + Client Components (검색, 테이블)

---

## 1. 페이지 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 사용자 관리                                                  │
├─────────────────────────────────────────────────────────────┤
│ [검색바]                           [필터 버튼] [내보내기 ▼] │
│ 🔍 이메일, 이름, ID 검색...                                 │
├─────────────────────────────────────────────────────────────┤
│ 총 1,250명 | ACTIVE: 1,180 | SUSPENDED: 50 | DELETED: 20   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [사용자 테이블]                                             │
│ ┌───┬────────┬──────────────┬────────┬──────────┬────────┐ │
│ │□  │ 이름   │ 이메일       │ 역할   │  상태    │  액션  │ │
│ ├───┼────────┼──────────────┼────────┼──────────┼────────┤ │
│ │□  │홍길동  │hong@coup.com │USER    │●ACTIVE   │[상세]  │ │
│ │□  │김철수  │kim@coup.com  │ADMIN   │●ACTIVE   │[상세]  │ │
│ │□  │이영희  │lee@coup.com  │USER    │🔴SUSPENDED│[해제]  │ │
│ └───┴────────┴──────────────┴────────┴──────────┴────────┘ │
│                                                             │
│ [일괄 선택: 0개] [일괄 메시지] [CSV 내보내기]               │
│                                                             │
│ ◀ 1 2 3 ... 63 ▶                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Server Component (메인 페이지)

```tsx
// app/admin/users/page.tsx
interface SearchParams {
  q?: string;
  role?: string;
  status?: string;
  page?: string;
}

export default async function UsersPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const query = searchParams.q || '';
  const role = searchParams.role;
  const status = searchParams.status;
  const page = parseInt(searchParams.page || '1');
  
  // 서버에서 데이터 페칭
  const { users, pagination } = await getUsers({
    query,
    role,
    status,
    page,
    limit: 20
  });
  
  return (
    <div className="users-page">
      <div className="page-header">
        <h1>사용자 관리</h1>
        <div className="actions">
          <Button variant="outline">필터</Button>
          <Button variant="outline">내보내기</Button>
        </div>
      </div>
      
      {/* Client Component - 검색 */}
      <SearchBar defaultValue={query} />
      
      {/* 통계 요약 */}
      <UserStats stats={pagination} />
      
      {/* Client Component - 테이블 */}
      <UsersTable 
        users={users}
        pagination={pagination}
      />
    </div>
  );
}
```

---

## 3. Client Components

### 3.1 SearchBar
```tsx
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function SearchBar({ defaultValue = '' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultValue);
  
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    params.delete('page'); // 검색 시 첫 페이지로
    
    router.push(`/admin/users?${params.toString()}`);
  }
  
  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="이메일, 이름, ID 검색..."
      />
      <button type="submit">검색</button>
    </form>
  );
}
```

### 3.2 UsersTable
```tsx
'use client';
import { useState } from 'react';

export function UsersTable({ users, pagination }) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedUsers.length === users.length}
                onChange={toggleSelectAll}
              />
            </th>
            <th>이름</th>
            <th>이메일</th>
            <th>역할</th>
            <th>상태</th>
            <th>가입일</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <UserRow 
              key={user.id}
              user={user}
              selected={selectedUsers.includes(user.id)}
              onSelect={() => toggleSelectUser(user.id)}
            />
          ))}
        </tbody>
      </table>
      
      {selectedUsers.length > 0 && (
        <BulkActionBar count={selectedUsers.length} />
      )}
      
      <Pagination {...pagination} />
    </>
  );
}
```

---

## 4. 필터 패널 (모달)

```tsx
'use client';
import { Dialog } from '@headlessui/react';

export function FilterPanel({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="filter-panel">
        <h3>필터</h3>
        
        {/* 역할 */}
        <fieldset>
          <legend>역할</legend>
          <Checkbox label="일반 사용자" value="USER" />
          <Checkbox label="관리자" value="ADMIN" />
          <Checkbox label="시스템 관리자" value="SYSTEM_ADMIN" />
        </fieldset>
        
        {/* 상태 */}
        <fieldset>
          <legend>상태</legend>
          <Checkbox label="활성" value="ACTIVE" />
          <Checkbox label="정지됨" value="SUSPENDED" />
          <Checkbox label="삭제됨" value="DELETED" />
        </fieldset>
        
        {/* 가입일 */}
        <fieldset>
          <legend>가입일</legend>
          <DateRangePicker />
        </fieldset>
        
        <div className="actions">
          <Button onClick={onClose} variant="ghost">취소</Button>
          <Button onClick={applyFilters}>적용</Button>
        </div>
      </div>
    </Dialog>
  );
}
```

---

## 5. URL 쿼리 파라미터

```
/admin/users?q=hong&role=USER&status=ACTIVE&page=2

쿼리 파라미터:
- q: 검색어
- role: USER | ADMIN | SYSTEM_ADMIN
- status: ACTIVE | SUSPENDED | DELETED
- page: 페이지 번호
```

---

**작성 완료**: 2025-11-27
# 대시보드 - 전체 개요

> **페이지 경로**: `/admin/dashboard`  
> **컴포넌트 타입**: Server Component (메인) + Client Components (위젯)

---

## 1. 레이아웃 구조

```
┌─────────────────────────────────────────────────────────────┐
│ 관리자 대시보드                                              │
├─────────────────────────────────────────────────────────────┤
│ [4개 통계 카드 - 가로 배치]                                  │
│ ┌──────────┬──────────┬──────────┬──────────┐               │
│ │총 사용자 │활성스터디│미처리신고│  오늘DAU │               │
│ │  1,250   │    85    │    12    │   456    │               │
│ └──────────┴──────────┴──────────┴──────────┘               │
├─────────────────────────────────────────────────────────────┤
│ [2단 레이아웃]                                               │
│ ┌────────────────────────┬────────────────────────┐         │
│ │ 실시간 활동 그래프     │ 긴급 알림 (최근 24시간) │         │
│ │ (시간대별 활성 사용자) │ - HIGH/URGENT 신고      │         │
│ │                        │ - 시스템 오류           │         │
│ │ [LineChart]            │ [AlertList]            │         │
│ └────────────────────────┴────────────────────────┘         │
├─────────────────────────────────────────────────────────────┤
│ [최근 관리자 활동 로그]                                      │
│ - 홍길동: 사용자 정지 (user123) - 10분 전                   │
│ - 김철수: 신고 처리 완료 (#12345) - 1시간 전                │
│ [더보기]                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 컴포넌트 분해

### 2.1 StatCards (Server Component)
```tsx
// app/admin/dashboard/page.tsx
export default async function DashboardPage() {
  const stats = await getDashboardStats();
  
  return (
    <div className="grid grid-cols-4 gap-6">
      <StatCard 
        title="총 사용자"
        value={stats.totalUsers}
        change={stats.userChange}
        trend="up"
        icon={<UsersIcon />}
      />
      {/* 나머지 카드들... */}
    </div>
  );
}
```

**데이터 구조**:
```typescript
interface DashboardStats {
  totalUsers: number;
  totalUsersChange: number;      // 전주 대비 %
  activeStudies: number;
  activeStudiesChange: number;
  pendingReports: number;
  pendingReportsChange: number;
  dau: number;
  dauChange: number;
}
```

### 2.2 ActivityGraph (Client Component)
```tsx
'use client';
import { LineChart } from 'recharts';

export default function ActivityGraph({ data }) {
  return (
    <LineChart 
      data={data}
      xAxis={{ dataKey: 'hour' }}
      yAxis={{ dataKey: 'count' }}
    />
  );
}
```

### 2.3 AlertList (Server Component → Client)
```tsx
// Server Component (데이터 페칭)
async function getUrgentAlerts() {
  return await prisma.report.findMany({
    where: {
      priority: { in: ['HIGH', 'URGENT'] },
      status: 'PENDING',
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    },
    take: 10
  });
}

// Client Component (인터랙션)
'use client';
export function AlertItem({ alert }) {
  return (
    <div onClick={() => router.push(`/admin/reports/${alert.id}`)}>
      {alert.priority === 'URGENT' && '🔴'}
      {alert.type} - {alert.targetName}
    </div>
  );
}
```

### 2.4 RecentLogs (Server Component)
```tsx
async function getRecentAdminLogs() {
  return await prisma.adminLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      admin: { select: { name: true } }
    }
  });
}
```

---

## 3. 데이터 Fetching 전략

### 병렬 페칭
```tsx
export default async function DashboardPage() {
  const [stats, activityData, alerts, logs] = await Promise.all([
    getDashboardStats(),
    getActivityData(),
    getUrgentAlerts(),
    getRecentAdminLogs()
  ]);
  
  return (
    <>
      <StatCards stats={stats} />
      <ActivityGraphClient data={activityData} />
      <AlertsList alerts={alerts} />
      <RecentLogs logs={logs} />
    </>
  );
}
```

### 캐싱
```tsx
export const revalidate = 60; // 1분마다 재생성
```

---

## 4. 반응형 디자인

```css
/* Desktop (>= 1024px) */
.stat-cards { grid-template-columns: repeat(4, 1fr); }
.two-column { grid-template-columns: 2fr 1fr; }

/* Tablet (768px - 1023px) */
@media (max-width: 1023px) {
  .stat-cards { grid-template-columns: repeat(2, 1fr); }
  .two-column { grid-template-columns: 1fr; }
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .stat-cards { grid-template-columns: 1fr; }
}
```

---

**작성 완료**: 2025-11-27

