# 관리자 아키텍처 - RSC 전략

> **분량**: 약 150줄  
> **목적**: Server vs Client Component 선택 기준

---

## 🔴 Server Components (기본값)

### 사용 시점
- ✅ 데이터 페칭 (DB 직접 조회)
- ✅ SEO가 중요한 콘텐츠
- ✅ 정적 콘텐츠 렌더링
- ✅ 민감한 데이터 처리

### 장점
- Zero JavaScript to client
- 서버에서 직접 DB 접근
- 자동 코드 스플리팅
- 빠른 초기 로드

### 예시 코드
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

## 🔵 Client Components (필요시만)

### 사용 시점
- ✅ 이벤트 핸들러 (onClick, onChange)
- ✅ State 관리 (useState, useReducer)
- ✅ Effect 사용 (useEffect)
- ✅ 브라우저 API (localStorage, window)
- ✅ 인터랙티브 컴포넌트 (차트, 모달, 폼)
- ✅ React Query, Context 사용

### 장점
- 즉각적인 인터랙션
- 실시간 업데이트
- 로컬 상태 관리

### 예시 코드
```jsx
// components/admin/dashboard/UserGrowthChart.js
'use client'

import { useState } from 'react'
import { LineChart } from 'recharts'

/**
 * @param {Object} props
 * @param {Object} props.data
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

## 🎯 선택 기준 플로차트

```
데이터 페칭이 필요한가?
  ↓ Yes
  서버에서 조회하나?
    ↓ Yes
    🔴 Server Component

  ↓ No
  사용자 인터랙션이 있나?
    ↓ Yes
    🔵 Client Component

    ↓ No
    🔴 Server Component
```

---

## 🔄 Hybrid 패턴

**Server Component가 Client Component를 감싸기**

```jsx
// Server Component (데이터 페칭)
export default async function UserGrowthChart() {
  const data = await getUserGrowth() // 서버에서 페칭
  return <UserGrowthChartClient data={data} />
}

// Client Component (인터랙션)
'use client'
export default function UserGrowthChartClient({ data }) {
  const [period, setPeriod] = useState('week')
  // ...
}
```

---

## 📋 컴포넌트 분류표

| 컴포넌트 | 타입 | 이유 |
|---------|------|------|
| AdminNav | 🔴 Server | 정적 네비게이션 |
| AdminHeader | 🔵 Client | 알림, 드롭다운 |
| StatCards | 🔴 Server | DB 데이터 페칭 |
| UserGrowthChart | 🔵 Client | 차트 인터랙션 |
| DataTable | 🔵 Client | 정렬, 체크박스 |
| Modal | 🔵 Client | 열기/닫기 상태 |
| Badge | 🔴 Server | 정적 표시 |
| RealtimeStatus | 🔵 Client | WebSocket |

---

**다음 파일**: `02-architecture-data-fetching.md` - 데이터 페칭 전략

