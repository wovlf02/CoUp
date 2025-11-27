# 스터디 관리 - 07: 통계 및 분석

> **파일**: 07-analytics.md  
> **분량**: ~700줄

---

## 1. 개요

스터디 통계 및 분석 기능은 플랫폼 전체의 스터디 생태계 동향을 파악하고, 데이터 기반의 운영 전략을 수립하기 위한 기초 자료를 제공합니다. 관리자는 이 기능을 통해 어떤 카테고리의 스터디가 인기가 있는지, 전반적인 스터디 품질 분포는 어떠한지 등을 시각적으로 확인할 수 있습니다.

이 데이터는 주로 관리자 대시보드의 '분석 > 스터디 통계' 페이지에서 차트와 그래프 형태로 제공됩니다.

---

## 2. 주요 분석 지표

- **카테고리별 스터디 분포**: 각 카테고리(예: frontend, backend, AI)에 몇 개의 스터디가 있는지 보여주는 파이 차트 또는 바 차트.
- **스터디 품질 분포**: 전체 스터디를 품질 점수 구간(예: 우수(80점 이상), 보통(40-79점), 저품질(39점 이하))으로 나누어 분포를 보여주는 차트.
- **스터디 성장 추이**: 시간에 따른 신규 스터디 생성 수, 총 스터디 수 변화를 보여주는 라인 그래프.
- **멤버 수 대비 활동량**: 스터디의 멤버 수와 메시지 수, 활동 빈도 등을 비교하여 스터디의 '밀도'를 분석.

---

## 3. API 명세

스터디 통계 데이터는 한 번에 여러 집계 쿼리가 필요하므로, 별도의 통계용 API 엔드포인트를 통해 제공하는 것이 효율적입니다.

### 3.1 카테고리 분포 API

#### **엔드포인트**
```http
GET /api/admin/analytics/studies/category-distribution
```
#### **Response (200 OK)**
```json
{
  "data": [
    { "category": "frontend", "count": 152 },
    { "category": "backend", "count": 121 },
    { "category": "AI", "count": 88 },
    { "category": "design", "count": 75 },
    { "category": "etc", "count": 43 }
  ]
}
```

### 3.2 품질 분포 API

#### **엔드포인트**
```http
GET /api/admin/analytics/studies/quality-distribution
```
#### **Response (200 OK)**
```json
{
  "data": {
    "excellent": 85, // 80점 이상
    "good": 250,     // 40-79점
    "poor": 34       // 39점 이하
  }
}
```

---

## 4. 구현 예시

### 4.1 Server-side: 카테고리 분포 API

Prisma의 `groupBy`와 `count`를 사용하여 카테고리별 스터디 수를 효율적으로 집계할 수 있습니다.

**`app/api/admin/analytics/studies/category-distribution/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  await requireAdmin();

  // 캐싱 적용 (예: 1시간)
  const data = await getCachedData(
    'analytics:studies:category-distribution',
    async () => {
      const distribution = await prisma.study.groupBy({
        by: ['category'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });

      return distribution.map(item => ({
        category: item.category,
        count: item._count.id,
      }));
    },
    3600 // 1 hour TTL
  );

  return NextResponse.json({ data });
}
```

### 4.2 Server-side: 품질 분포 API

`count`와 `where` 조건을 사용하여 각 품질 구간에 해당하는 스터디 수를 병렬로 조회합니다.

**`app/api/admin/analytics/studies/quality-distribution/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  await requireAdmin();

  const data = await getCachedData(
    'analytics:studies:quality-distribution',
    async () => {
      const [excellent, good, poor] = await prisma.$transaction([
        prisma.study.count({ where: { qualityScore: { gte: 80 } } }),
        prisma.study.count({ where: { qualityScore: { gte: 40, lt: 80 } } }),
        prisma.study.count({ where: { qualityScore: { lt: 40 } } }),
      ]);
      return { excellent, good, poor };
    },
    3600 // 1 hour TTL
  );
  
  return NextResponse.json({ data });
}
```

### 4.3 Client-side: 차트 컴포넌트

`recharts`와 같은 라이브러리를 사용하여 API로부터 받은 데이터를 시각화합니다.

**`components/admin/analytics/CategoryChart.tsx`**
```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const fetchCategoryDistribution = async () => {
  const res = await fetch('/api/admin/analytics/studies/category-distribution');
  const data = await res.json();
  return data.data;
};

export function CategoryChart() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['studyCategoryDistribution'], 
    queryFn: fetchCategoryDistribution 
  });

  if (isLoading) return <div>Loading...</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={data}
        cx={200}
        cy={200}
        labelLine={false}
        outerRadius={80}
        fill="#8884d8"
        dataKey="count"
        nameKey="category"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}
```

---

## 5. 테스트 시나리오

- **API 단위 테스트**:
  - 테스트 DB에 특정 분포를 가진 스터디 데이터를 미리 삽입합니다. (예: frontend 5개, backend 3개)
  - `/category-distribution` API 호출 시, 응답 데이터가 `{ category: 'frontend', count: 5 }`, `{ category: 'backend', count: 3 }` 과 같이 정확하게 집계되는지 확인합니다.
  - 품질 점수 구간별로 스터디를 삽입하고, `/quality-distribution` API가 각 구간의 개수를 정확히 반환하는지 확인합니다.
- **캐싱 테스트**:
  - 통계 API를 처음 호출한 후, DB의 스터디 데이터를 변경합니다.
  - 캐시 TTL이 만료되기 전에 API를 다시 호출했을 때, 이전과 동일한 (캐시된) 데이터가 반환되는지 확인합니다.
  - TTL 만료 후 다시 호출했을 때, 변경된 DB 상태가 반영된 새로운 데이터가 반환되는지 확인합니다.

---

**이전**: [06-moderation.md](06-moderation.md)

**작성일**: 2025-11-28
