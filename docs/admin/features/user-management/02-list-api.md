# 사용자 관리 - 목록 조회 API

> **파일**: 02-list-api.md  
> **분량**: ~900줄

---

## 1. API 엔드포인트

```http
GET /api/admin/users
```

---

## 2. Request

### 2.1 Query Parameters

| 파라미터 | 타입 | 필수 | 설명 | 예시 |
|---------|------|------|------|------|
| `q` | string | ❌ | 검색어 (이메일, 이름) | `hong@coup.com` |
| `role` | string | ❌ | 역할 필터 | `USER`, `ADMIN` |
| `status` | string | ❌ | 상태 필터 | `ACTIVE`, `SUSPENDED` |
| `createdFrom` | string | ❌ | 가입일 시작 (ISO 8601) | `2025-01-01` |
| `createdTo` | string | ❌ | 가입일 종료 | `2025-12-31` |
| `sortBy` | string | ❌ | 정렬 기준 | `createdAt`, `lastLoginAt` |
| `sortOrder` | string | ❌ | 정렬 순서 | `asc`, `desc` |
| `page` | number | ❌ | 페이지 번호 (기본: 1) | `2` |
| `limit` | number | ❌ | 페이지당 개수 (기본: 20) | `50` |

### 2.2 요청 예시

```http
GET /api/admin/users?q=hong&status=ACTIVE&page=1&limit=20
Authorization: Bearer <token>
```

---

## 3. Response

### 3.1 성공 응답 (200 OK)

```typescript
interface UsersListResponse {
  data: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    deletedUsers: number;
  };
}

interface UserListItem {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
  
  // 통계 (간략)
  studyCount: number;
  warningCount: number;
  suspensionCount: number;
}
```

### 3.2 응답 예시

```json
{
  "data": [
    {
      "id": "user_clx123456",
      "email": "hong@coup.com",
      "name": "홍길동",
      "avatar": "https://...",
      "role": "USER",
      "status": "ACTIVE",
      "createdAt": "2025-10-01T00:00:00Z",
      "lastLoginAt": "2025-11-27T10:00:00Z",
      "studyCount": 5,
      "warningCount": 0,
      "suspensionCount": 0
    },
    {
      "id": "user_clx789012",
      "email": "kim@coup.com",
      "name": "김철수",
      "avatar": null,
      "role": "USER",
      "status": "SUSPENDED",
      "createdAt": "2025-09-15T00:00:00Z",
      "lastLoginAt": "2025-11-20T15:30:00Z",
      "studyCount": 3,
      "warningCount": 2,
      "suspensionCount": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "totalPages": 63
  },
  "summary": {
    "totalUsers": 1250,
    "activeUsers": 1180,
    "suspendedUsers": 50,
    "deletedUsers": 20
  }
}
```

---

## 4. 구현 (Server-side)

### 4.1 API Route

```typescript
// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  // 1. 권한 체크
  await requireAdmin();
  
  // 2. 쿼리 파라미터 파싱
  const { searchParams } = new URL(request.url);
  const params = {
    q: searchParams.get('q') || undefined,
    role: searchParams.get('role') as UserRole | undefined,
    status: searchParams.get('status') as UserStatus | undefined,
    createdFrom: searchParams.get('createdFrom') || undefined,
    createdTo: searchParams.get('createdTo') || undefined,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20')
  };
  
  // 3. 데이터 조회
  const result = await getUsersList(params);
  
  return NextResponse.json(result);
}
```

### 4.2 비즈니스 로직

```typescript
// lib/admin/users.ts
export async function getUsersList(params: UserSearchParams) {
  const { q, role, status, createdFrom, createdTo, sortBy, sortOrder, page, limit } = params;
  
  // WHERE 조건 구성
  const where: any = {};
  
  // 검색어
  if (q) {
    where.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } }
    ];
  }
  
  // 필터
  if (role) where.role = role;
  if (status) where.status = status;
  
  // 날짜 범위
  if (createdFrom || createdTo) {
    where.createdAt = {};
    if (createdFrom) where.createdAt.gte = new Date(createdFrom);
    if (createdTo) where.createdAt.lte = new Date(createdTo);
  }
  
  // 페이지네이션
  const skip = (page - 1) * limit;
  
  // 병렬 실행
  const [users, total, summary] = await Promise.all([
    // 사용자 목록
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            studyMembers: true,
            sanctions: {
              where: { type: 'WARNING' }
            }
          }
        }
      }
    }),
    
    // 총 개수
    prisma.user.count({ where }),
    
    // 요약 통계
    prisma.user.groupBy({
      by: ['status'],
      _count: true
    })
  ]);
  
  // 데이터 변환
  const data = users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() || null,
    studyCount: user._count.studyMembers,
    warningCount: user._count.sanctions,
    suspensionCount: 0 // TODO: 정지 횟수 계산
  }));
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    summary: {
      totalUsers: total,
      activeUsers: summary.find(s => s.status === 'ACTIVE')?._count || 0,
      suspendedUsers: summary.find(s => s.status === 'SUSPENDED')?._count || 0,
      deletedUsers: summary.find(s => s.status === 'DELETED')?._count || 0
    }
  };
}
```

---

## 5. 캐싱 전략

### 5.1 Redis 캐싱

```typescript
import { redis } from '@/lib/redis';

export async function getUsersListCached(params: UserSearchParams) {
  // 캐시 키 생성
  const cacheKey = `admin:users:list:${JSON.stringify(params)}`;
  
  // 캐시 확인
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 데이터 조회
  const result = await getUsersList(params);
  
  // 캐시 저장 (5분)
  await redis.setex(cacheKey, 300, JSON.stringify(result));
  
  return result;
}
```

### 5.2 캐시 무효화

```typescript
// 사용자 정보 변경 시 캐시 무효화
export async function invalidateUsersListCache() {
  const keys = await redis.keys('admin:users:list:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// 사용자 정지 시 호출
await invalidateUsersListCache();
```

---

## 6. 에러 처리

### 6.1 에러 코드

```typescript
// 400 Bad Request
{
  "error": "INVALID_PARAMS",
  "message": "Invalid page number",
  "details": {
    "field": "page",
    "value": -1
  }
}

// 401 Unauthorized
{
  "error": "UNAUTHORIZED",
  "message": "Admin access required"
}

// 500 Internal Server Error
{
  "error": "INTERNAL_ERROR",
  "message": "Failed to fetch users"
}
```

---

## 7. 테스트

### 7.1 단위 테스트

```typescript
import { describe, it, expect } from 'vitest';
import { getUsersList } from '@/lib/admin/users';

describe('getUsersList', () => {
  it('should return paginated users', async () => {
    const result = await getUsersList({
      page: 1,
      limit: 20
    });
    
    expect(result.data).toHaveLength(20);
    expect(result.pagination.page).toBe(1);
  });
  
  it('should filter by status', async () => {
    const result = await getUsersList({
      status: 'SUSPENDED',
      page: 1,
      limit: 20
    });
    
    result.data.forEach(user => {
      expect(user.status).toBe('SUSPENDED');
    });
  });
  
  it('should search by email', async () => {
    const result = await getUsersList({
      q: 'hong@',
      page: 1,
      limit: 20
    });
    
    result.data.forEach(user => {
      expect(user.email).toContain('hong@');
    });
  });
});
```

---

**이전**: [01-overview.md](01-overview.md)  
**다음**: [03-detail-api.md](03-detail-api.md)

**작성일**: 2025-11-27

