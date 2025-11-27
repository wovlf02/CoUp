# 사용자 관리 - 상세 조회 API

> **파일**: 03-detail-api.md  
> **분량**: ~950줄

---

## 1. API 엔드포인트

```http
GET /api/admin/users/:userId
```

---

## 2. Request

### 2.1 URL Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `userId` | string | ✅ | 사용자 ID (cuid) |

### 2.2 요청 예시

```http
GET /api/admin/users/user_clx123456
Authorization: Bearer <token>
```

---

## 3. Response

### 3.1 성공 응답 (200 OK)

```typescript
interface UserDetailResponse {
  // 기본 정보
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  
  // 계정 정보
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  emailVerified: boolean;
  
  // 정지 정보 (status가 SUSPENDED인 경우)
  suspendedUntil?: string;
  suspendReason?: string;
  suspendedBy?: string;
  
  // 통계
  stats: UserStats;
  
  // 제재 이력
  sanctions: SanctionItem[];
  
  // 신고 이력
  reports: {
    reported: ReportSummary[];  // 신고당한 이력
    reporting: ReportSummary[]; // 신고한 이력
  };
  
  // 참여 스터디
  studies: StudyMemberItem[];
  
  // 최근 활동
  recentActivities: ActivityItem[];
}

interface UserStats {
  // 참여 현황
  studyCount: number;
  ownedStudyCount: number;
  
  // 활동 통계
  messageCount: number;
  fileUploadCount: number;
  taskCompleteCount: number;
  
  // 제재 이력
  warningCount: number;
  suspensionCount: number;
  
  // 신고 이력
  reportedCount: number;
  reportCount: number;
  
  // 품질 지표
  attendanceRate: number;  // 출석률 (%)
  averageRating: number;   // 평균 평점
}

interface SanctionItem {
  id: string;
  type: 'WARNING' | 'SUSPEND' | 'PERMANENT_BAN';
  reason: string;
  duration?: string;
  adminName: string;
  createdAt: string;
  
  // 정지 해제 정보 (해제된 경우)
  unsuspendedAt?: string;
  unsuspendReason?: string;
  unsuspendedBy?: string;
}

interface StudyMemberItem {
  studyId: string;
  studyName: string;
  studyEmoji: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  attendanceRate: number;
}

interface ActivityItem {
  type: 'MESSAGE' | 'FILE_UPLOAD' | 'TASK_COMPLETE' | 'STUDY_JOIN';
  studyName: string;
  description: string;
  timestamp: string;
}
```

### 3.2 응답 예시

```json
{
  "id": "user_clx123456",
  "email": "hong@coup.com",
  "name": "홍길동",
  "avatar": "https://...",
  "role": "USER",
  "status": "ACTIVE",
  "createdAt": "2025-10-01T00:00:00Z",
  "updatedAt": "2025-11-27T10:00:00Z",
  "lastLoginAt": "2025-11-27T10:00:00Z",
  "emailVerified": true,
  
  "stats": {
    "studyCount": 5,
    "ownedStudyCount": 2,
    "messageCount": 1234,
    "fileUploadCount": 45,
    "taskCompleteCount": 78,
    "warningCount": 0,
    "suspensionCount": 0,
    "reportedCount": 0,
    "reportCount": 2,
    "attendanceRate": 85.5,
    "averageRating": 4.5
  },
  
  "sanctions": [],
  
  "reports": {
    "reported": [],
    "reporting": [
      {
        "id": "report_123",
        "type": "SPAM",
        "status": "RESOLVED",
        "createdAt": "2025-11-20T00:00:00Z"
      }
    ]
  },
  
  "studies": [
    {
      "studyId": "study_abc",
      "studyName": "자바 스터디",
      "studyEmoji": "💻",
      "role": "OWNER",
      "joinedAt": "2025-10-15T00:00:00Z",
      "attendanceRate": 90.0
    }
  ],
  
  "recentActivities": [
    {
      "type": "MESSAGE",
      "studyName": "자바 스터디",
      "description": "메시지 작성: 안녕하세요!",
      "timestamp": "2025-11-27T10:00:00Z"
    }
  ]
}
```

---

## 4. 구현 (Server-side)

### 4.1 API Route

```typescript
// app/api/admin/users/[userId]/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getUserDetail } from '@/lib/admin/users';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  // 1. 권한 체크
  await requireAdmin();
  
  // 2. 사용자 상세 조회
  const user = await getUserDetail(params.userId);
  
  if (!user) {
    return NextResponse.json(
      { error: 'USER_NOT_FOUND', message: 'User not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(user);
}
```

### 4.2 비즈니스 로직

```typescript
// lib/admin/users.ts
export async function getUserDetail(userId: string) {
  // 병렬로 모든 데이터 조회
  const [user, stats, sanctions, reports, studies, activities] = await Promise.all([
    // 기본 정보
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        emailVerified: true,
        suspendedUntil: true,
        suspendReason: true
      }
    }),
    
    // 통계
    getUserStats(userId),
    
    // 제재 이력
    prisma.sanction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        reason: true,
        duration: true,
        adminName: true,
        createdAt: true,
        unsuspendedAt: true,
        unsuspendReason: true,
        unsuspendedBy: true
      }
    }),
    
    // 신고 이력
    getReportSummary(userId),
    
    // 참여 스터디
    getStudyMembers(userId),
    
    // 최근 활동
    getRecentActivities(userId)
  ]);
  
  if (!user) {
    return null;
  }
  
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() || null,
    suspendedUntil: user.suspendedUntil?.toISOString(),
    stats,
    sanctions,
    reports,
    studies,
    recentActivities: activities
  };
}
```

### 4.3 통계 계산

```typescript
async function getUserStats(userId: string): Promise<UserStats> {
  const [
    studyCount,
    ownedStudyCount,
    messageCount,
    fileCount,
    taskCount,
    warnings,
    suspensions,
    reportedCount,
    reportCount
  ] = await Promise.all([
    // 참여 스터디 수
    prisma.studyMember.count({
      where: { userId, study: { isDeleted: false } }
    }),
    
    // 소유 스터디 수
    prisma.studyMember.count({
      where: { userId, role: 'OWNER', study: { isDeleted: false } }
    }),
    
    // 메시지 수
    prisma.message.count({
      where: { userId, isDeleted: false }
    }),
    
    // 파일 수
    prisma.file.count({
      where: { uploaderId: userId, isDeleted: false }
    }),
    
    // 완료한 할일 수
    prisma.taskComplete.count({
      where: { userId }
    }),
    
    // 경고 수
    prisma.sanction.count({
      where: { userId, type: 'WARNING' }
    }),
    
    // 정지 수
    prisma.sanction.count({
      where: { userId, type: 'SUSPEND' }
    }),
    
    // 신고당한 수
    prisma.report.count({
      where: { targetId: userId, targetType: 'USER' }
    }),
    
    // 신고한 수
    prisma.report.count({
      where: { reporterId: userId }
    })
  ]);
  
  // 출석률 계산
  const attendanceRate = await calculateAttendanceRate(userId);
  
  // 평균 평점 계산
  const averageRating = await calculateAverageRating(userId);
  
  return {
    studyCount,
    ownedStudyCount,
    messageCount,
    fileUploadCount: fileCount,
    taskCompleteCount: taskCount,
    warningCount: warnings,
    suspensionCount: suspensions,
    reportedCount,
    reportCount,
    attendanceRate,
    averageRating
  };
}

async function calculateAttendanceRate(userId: string): Promise<number> {
  // 참여 중인 스터디들의 총 출석 이벤트 수 대비 출석한 횟수
  const result = await prisma.$queryRaw`
    SELECT 
      COUNT(CASE WHEN a.attended THEN 1 END)::float / 
      NULLIF(COUNT(*), 0) * 100 as rate
    FROM attendance a
    WHERE a.user_id = ${userId}
  `;
  
  return result[0]?.rate || 0;
}

async function calculateAverageRating(userId: string): Promise<number> {
  const result = await prisma.review.aggregate({
    where: { targetId: userId, targetType: 'USER' },
    _avg: { rating: true }
  });
  
  return result._avg.rating || 0;
}
```

---

## 5. 캐싱 전략

```typescript
import { redis } from '@/lib/redis';

export async function getUserDetailCached(userId: string) {
  const cacheKey = `admin:user:detail:${userId}`;
  
  // 캐시 확인
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 데이터 조회
  const user = await getUserDetail(userId);
  
  // 캐시 저장 (5분)
  await redis.setex(cacheKey, 300, JSON.stringify(user));
  
  return user;
}

// 사용자 정보 변경 시 캐시 무효화
export async function invalidateUserDetailCache(userId: string) {
  await redis.del(`admin:user:detail:${userId}`);
}
```

---

## 6. 에러 처리

```typescript
// 404 Not Found
{
  "error": "USER_NOT_FOUND",
  "message": "User not found",
  "userId": "user_invalid"
}

// 401 Unauthorized
{
  "error": "UNAUTHORIZED",
  "message": "Admin access required"
}

// 500 Internal Server Error
{
  "error": "INTERNAL_ERROR",
  "message": "Failed to fetch user details"
}
```

---

## 7. 프론트엔드 사용 예시

### 7.1 React Query

```typescript
// hooks/useUserDetail.ts
import { useQuery } from '@tanstack/react-query';

export function useUserDetail(userId: string) {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false
  });
}
```

### 7.2 컴포넌트

```typescript
// app/admin/users/[userId]/page.tsx
export default function UserDetailPage({ params }: { params: { userId: string } }) {
  const { data: user, isLoading } = useUserDetail(params.userId);
  
  if (isLoading) return <UserDetailSkeleton />;
  if (!user) return <UserNotFound />;
  
  return (
    <div className="user-detail-page">
      <UserInfoCard user={user} />
      <UserStatsCard stats={user.stats} />
      <SanctionHistory sanctions={user.sanctions} />
      <ReportHistory reports={user.reports} />
      <StudyList studies={user.studies} />
      <RecentActivities activities={user.recentActivities} />
    </div>
  );
}
```

---

## 8. 테스트

```typescript
import { describe, it, expect } from 'vitest';
import { getUserDetail } from '@/lib/admin/users';

describe('getUserDetail', () => {
  it('should return full user details', async () => {
    const user = await getUserDetail('user_test123');
    
    expect(user).toBeDefined();
    expect(user.id).toBe('user_test123');
    expect(user.stats).toBeDefined();
    expect(user.sanctions).toBeInstanceOf(Array);
  });
  
  it('should return null for non-existent user', async () => {
    const user = await getUserDetail('user_invalid');
    expect(user).toBeNull();
  });
  
  it('should calculate stats correctly', async () => {
    const user = await getUserDetail('user_test123');
    
    expect(user.stats.studyCount).toBeGreaterThanOrEqual(0);
    expect(user.stats.attendanceRate).toBeGreaterThanOrEqual(0);
    expect(user.stats.attendanceRate).toBeLessThanOrEqual(100);
  });
});
```

---

**이전**: [02-list-api.md](02-list-api.md)  
**다음**: [04-suspend-api.md](04-suspend-api.md)

**작성일**: 2025-11-27

