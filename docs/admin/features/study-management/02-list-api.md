# 스터디 관리 - 02: 목록 API

> **파일**: 02-list-api.md  
> **분량**: ~900줄

---

## 1. API 개요

스터디 목록 API(`GET /api/admin/studies`)는 관리자가 플랫폼의 모든 스터디를 효율적으로 조회, 검색, 필터링할 수 있도록 지원하는 핵심 엔드포인트입니다. 관리자 대시보드의 '스터디 관리' 페이지에서 사용되며, 다양한 조건 조합을 통해 원하는 스터디 그룹을 신속하게 찾아낼 수 있어야 합니다.

이 API는 페이지네이션을 지원하며, URL 쿼리 파라미터를 통해 동적인 데이터 조회를 수행합니다.

---

## 2. API 명세

### 2.1 엔드포인트

```http
GET /api/admin/studies
```

### 2.2 쿼리 파라미터

| 파라미터   | 타입     | 필수 | 설명                                                                                             | 예시                         |
| ---------- | -------- | ---- | ------------------------------------------------------------------------------------------------ | ---------------------------- |
| `page`     | `Number` | 아니오 | 페이지 번호. (기본값: 1)                                                                         | `?page=2`                    |
| `limit`    | `Number` | 아니오 | 한 페이지에 보여줄 항목 수. (기본값: 20)                                                         | `?limit=50`                  |
| `q`        | `String` | 아니오 | 검색어. 스터디 이름 또는 설명에서 검색합니다.                                                    | `?q=React`                   |
| `category` | `String` | 아니오 | 특정 카테고리의 스터디만 필터링합니다.                                                           | `?category=frontend`         |
| `tab`      | `String` | 아니오 | 사전 정의된 필터 탭. (all, active, low-quality, featured, reported)                              | `?tab=low-quality`           |
| `sortBy`   | `String` | 아니오 | 정렬 기준. (createdAt, memberCount, qualityScore)                                                | `?sortBy=qualityScore`       |
| `order`    | `String` | 아니오 | 정렬 순서. (asc, desc) (기본값: desc)                                                            | `?order=asc`                 |

### 2.3 `tab` 파라미터 상세

`tab` 파라미터는 복합적인 필터 조건을 간편하게 적용하기 위해 사용됩니다.

- **`all` (기본값)**: 모든 스터디 (삭제된 스터디 제외)
- **`active`**: 최근 2주 내 활동(`lastActivityAt`)이 있고, 멤버가 2명 이상인 스터디.
- **`low-quality`**: 품질 점수(`qualityScore`)가 40점 미만인 스터디.
- **`featured`**: `isFeatured` 플래그가 `true`인 스터디.
- **`reported`**: 신고 횟수(`reportCount`)가 1 이상인 스터디.

### 2.4 Response

**성공 (200 OK)**

```json
{
  "data": [
    {
      "id": "clxj9zv0w0000a8c0e1g1h1j1",
      "name": "React 심화 스터디",
      "category": "frontend",
      "memberCount": 10,
      "maxMembers": 10,
      "rating": 4.8,
      "qualityScore": 95,
      "isFeatured": true,
      "createdAt": "2025-11-01T10:00:00Z"
    }
    // ...
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 152,
    "totalPages": 8
  }
}
```

---

## 3. 구현 예시

### 3.1 Server-side: API 라우트 핸들러

**`app/api/admin/studies/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);

  // 1. 파라미터 파싱
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const q = searchParams.get('q');
  const category = searchParams.get('category');
  const tab = searchParams.get('tab') || 'all';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';

  // 2. 동적 Where 조건 생성
  let where: Prisma.StudyWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (category) {
    where.category = category;
  }

  // 3. 탭별 조건 적용
  switch (tab) {
    case 'active':
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      where.lastActivityAt = { gte: twoWeeksAgo };
      where.memberCount = { gte: 2 };
      break;
    case 'low-quality':
      where.qualityScore = { lt: 40 };
      break;
    case 'featured':
      where.isFeatured = true;
      break;
    case 'reported':
      where.reportCount = { gt: 0 };
      break;
  }

  // 4. 데이터베이스 쿼리 (총 개수와 데이터 동시 조회)
  const [studies, totalItems] = await prisma.$transaction([
    prisma.study.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
      select: { // 필요한 필드만 선택하여 페이로드 최적화
        id: true,
        name: true,
        category: true,
        memberCount: true,
        maxMembers: true,
        rating: true,
        qualityScore: true,
        isFeatured: true,
        createdAt: true,
      },
    }),
    prisma.study.count({ where }),
  ]);

  // 5. 페이지네이션 정보 계산
  const totalPages = Math.ceil(totalItems / limit);

  return NextResponse.json({
    data: studies,
    pagination: { page, limit, totalItems, totalPages },
  });
}
```

---

## 4. 캐싱 전략

- 스터디 목록은 자주 변경될 수 있지만, 관리자 페이지에서는 실시간 반영이 크리티컬하지 않을 수 있습니다.
- API 응답을 1~3분 정도 Redis에 캐싱하여 DB 부하를 줄일 수 있습니다.
- 캐시 키는 쿼리 파라미터를 모두 포함해야 합니다. (예: `admin:studies:page=1&q=react&tab=active`)
- 스터디 정보가 업데이트되거나(삭제, 추천 변경 등) 새로운 신고가 접수될 때 관련 캐시를 무효화하는 로직이 필요합니다. (예: `revalidateTag` 또는 직접 `del` 호출)

## 5. 테스트 시나리오

- **기본 조회**: 파라미터 없이 요청 시, 첫 페이지의 스터디 20개가 `createdAt` 내림차순으로 반환되는지 확인.
- **검색**: `?q=TypeScript` 요청 시, 이름이나 설명에 'TypeScript'가 포함된 스터디만 반환되는지 확인.
- **필터**: `?category=backend` 요청 시, 'backend' 카테고리의 스터디만 반환되는지 확인.
- **탭 기능**:
  - `?tab=low-quality` 요청 시, `qualityScore`가 40 미만인 스터디만 반환되는지 확인.
  - `?tab=featured` 요청 시, `isFeatured`가 `true`인 스터디만 반환되는지 확인.
- **페이지네이션**: `?page=2&limit=10` 요청 시, 11~20번째 스터디 10개가 반환되고 `pagination` 객체의 값이 올바른지 확인.
- **정렬**: `?sortBy=memberCount&order=asc` 요청 시, 멤버 수가 적은 순으로 정렬되어 반환되는지 확인.
- **조합**: `?q=Java&tab=active&page=1`과 같이 여러 파라미터를 조합했을 때 모든 조건이 `AND`로 올바르게 동작하는지 확인.

---

**이전**: [01-overview.md](01-overview.md)  
**다음**: [03-detail-api.md](03-detail-api.md)

**작성일**: 2025-11-28
