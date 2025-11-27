# 스터디 관리 - 03: 상세 API

> **파일**: 03-detail-api.md  
> **분량**: ~900줄

---

## 1. API 개요

스터디 상세 API(`GET /api/admin/studies/:id`)는 특정 스터디에 대한 모든 정보를 종합적으로 제공하는 엔드포인트입니다. 관리자 대시보드의 '스터디 상세 페이지'에서 사용되며, 관리자가 해당 스터디의 상태를 정확히 진단하고 다음 조치를 결정하는 데 필요한 모든 데이터를 포함해야 합니다.

이 API는 스터디의 기본 정보뿐만 아니라, 관련된 멤버 목록, 통계, 활동 이력 등 여러 테이블의 데이터를 조합하여 반환합니다.

---

## 2. API 명세

### 2.1 엔드포인트

```http
GET /api/admin/studies/{studyId}
```

### 2.2 Path 파라미터

| 파라미터   | 타입     | 필수 | 설명                  |
| ---------- | -------- | ---- | --------------------- |
| `studyId`  | `String` | 예   | 조회할 스터디의 CUID. |

### 2.3 Response

**성공 (200 OK)**
```json
{
  "data": {
    "id": "clxj9zv0w0000a8c0e1g1h1j1",
    "name": "React 심화 스터디",
    "description": "Next.js, Zustand, React Query를 활용한 모던 웹 개발을 공부합니다.",
    "category": "frontend",
    "isPublic": true,
    "isFeatured": true,
    "qualityScore": 95,
    "createdAt": "2025-11-01T10:00:00Z",
    "lastActivityAt": "2025-11-28T14:00:00Z",
    "owner": {
      "id": "cuid_owner_123",
      "name": "김리더",
      "email": "leader@example.com"
    },
    "stats": {
      "memberCount": 10,
      "maxMembers": 10,
      "rating": 4.8,
      "reviewCount": 25,
      "reportCount": 0,
      "messageCount": 1205,
      "fileCount": 88,
      "noticeCount": 12
    },
    "members": [
      {
        "userId": "cuid_user_456",
        "name": "박스터디",
        "role": "MEMBER",
        "joinedAt": "2025-11-02T11:00:00Z"
      }
      // ... (상위 10명 정도)
    ],
    "recentActivities": [
      {
        "type": "NEW_MEMBER",
        "detail": "최회원님이 가입했습니다.",
        "timestamp": "2025-11-27T18:00:00Z"
      },
      {
        "type": "NEW_NOTICE",
        "detail": "김리더님이 '주간 회의록' 공지를 올렸습니다.",
        "timestamp": "2025-11-26T20:00:00Z"
      }
      // ... (최근 10개)
    ]
  }
}
```

**실패**
- **401 Unauthorized**: 관리자 권한이 없는 경우.
- **404 Not Found**: 해당 `studyId`를 가진 스터디가 존재하지 않는 경우.

---

## 3. 구현 예시

### 3.1 Server-side: API 라우트 핸들러

**`app/api/admin/studies/[studyId]/route.ts`**

이 API는 여러 관계(relation)를 포함하는 복잡한 쿼리가 필요하므로, Prisma의 `include` 또는 중첩 `select`를 적극적으로 활용합니다.

```typescript
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { studyId: string } }
) {
  await requireAdmin();
  const { studyId } = params;

  const study = await prisma.study.findUnique({
    where: { id: studyId },
    include: {
      owner: { // 스터디 소유자 정보
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: { // 스터디 멤버 일부 정보
        take: 10,
        orderBy: { joinedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      // 별도 로직으로 최근 활동을 가져올 수 있음
      // recentActivities: true (가상 필드, 아래에서 처리)
    },
  });

  if (!study) {
    return NextResponse.json({ error: 'Study not found' }, { status: 404 });
  }

  // 가상 필드(stats, recentActivities) 데이터 조합
  // 실제로는 이 부분도 별도 함수로 분리하는 것이 좋음
  const stats = {
      memberCount: study.memberCount,
      maxMembers: study.maxMembers,
      rating: study.rating,
      reviewCount: study.reviewCount,
      reportCount: study.reportCount,
      // messageCount, fileCount 등은 별도 쿼리 필요
      messageCount: await prisma.message.count({ where: { studyId } }),
      fileCount: await prisma.file.count({ where: { studyId } }),
      noticeCount: await prisma.notice.count({ where: { studyId } }),
  };

  const formattedMembers = study.members.map(m => ({
      userId: m.user.id,
      name: m.user.name,
      role: m.role,
      joinedAt: m.joinedAt
  }));

  // 최근 활동 데이터는 여러 테이블을 조합해야 하므로 복잡한 쿼리가 될 수 있음
  // 예시: 최근 가입 멤버와 최근 공지를 조합
  const recentNotices = await prisma.notice.findMany({ 
      where: { studyId },
      take: 5,
      orderBy: { createdAt: 'desc' }
  });
  // ... recentActivities 로직 ...
  
  const responseData = {
      ...study,
      stats,
      members: formattedMembers,
      recentActivities: [], // 이 부분은 실제 구현 필요
  };

  return NextResponse.json({ data: responseData });
}
```

### 3.2 성능 고려사항 (N+1 문제)

위 예시에서 `messageCount`, `fileCount` 등을 가져오기 위해 `Promise.all`을 사용하지 않고 `await`를 여러 번 호출하면 N+1 쿼리 문제와 유사한 성능 저하가 발생할 수 있습니다. `prisma.$transaction`이나 `Promise.all`을 사용하여 관련 데이터를 병렬로 조회하는 것이 중요합니다.

**개선된 데이터 조회**:
```typescript
const [study, messageCount, fileCount] = await prisma.$transaction([
  prisma.study.findUnique({ where: { id: studyId }, include: { /* ... */ } }),
  prisma.message.count({ where: { studyId } }),
  prisma.file.count({ where: { studyId } })
]);
```

## 4. 캐싱 전략

- 스터디 상세 정보는 멤버 가입, 메시지 작성 등 활동이 있을 때마다 변경되므로 캐시의 TTL(Time To Live)은 비교적 짧게(예: 30초 ~ 1분) 설정하는 것이 좋습니다.
- 또는, 데이터 변경이 발생할 때마다 해당 스터디의 상세 정보 캐시를 명시적으로 무효화하는 전략을 사용할 수 있습니다. Next.js의 On-demand Revalidation (`revalidateTag`) 기능이 이 시나리오에 매우 유용합니다.

**캐시 키**: `admin:study:detail:${studyId}`

**무효화 트리거**:
- 멤버 가입/탈퇴 시
- 스터디 정보(이름, 설명 등) 수정 시
- 관리자가 모더레이션(추천, 공개/비공개 등) 액션을 취했을 때
- 새로운 신고가 접수되었을 때

## 5. 테스트 시나리오

- **정상 조회**: 존재하는 `studyId`로 요청 시 200 OK와 함께 스터디의 모든 상세 정보(owner, stats, members 등)가 포함된 JSON이 반환되는지 확인.
- **존재하지 않는 스터디**: 존재하지 않는 `studyId`로 요청 시 404 Not Found 에러가 반환되는지 확인.
- **데이터 정확성**:
  - API 응답의 `stats.memberCount`가 실제 `StudyMember` 테이블의 레코드 수와 일치하는지 확인.
  - `owner` 정보가 `Study` 테이블의 `ownerId`와 일치하는 사용자의 정보인지 확인.
- **N+1 문제 검사**: Prisma 로깅 등을 활성화하여, 상세 API 요청 한 번에 과도한 수의 쿼리가 실행되지 않는지 확인. (주요 쿼리는 2~3개 내외여야 함)

---

**이전**: [02-list-api.md](02-list-api.md)  
**다음**: [04-quality-system.md](04-quality-system.md)

**작성일**: 2025-11-28
