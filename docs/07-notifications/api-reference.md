# 알림 API 레퍼런스

## 개요

모든 알림 관련 API는 `/api/notifications/*` 경로에 위치합니다.

---

## API 구조 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        알림 API 구조                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    /api/notifications/*                          │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │    │
│  │  │ GET /       │ │ POST /      │ │ GET /count  │                │    │
│  │  │             │ │             │ │             │                │    │
│  │  │ 목록 조회   │ │ 알림 생성   │ │ 읽지않은    │                │    │
│  │  │ + 필터/페이징│ │ (시스템용)  │ │ 개수 조회   │                │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐│    │
│  │  │ GET /[id]   │ │DELETE /[id] │ │ POST /[id]/read             ││    │
│  │  │             │ │             │ │                             ││    │
│  │  │ 상세 조회   │ │ 알림 삭제   │ │ 읽음 처리                   ││    │
│  │  └─────────────┘ └─────────────┘ └─────────────────────────────┘│    │
│  │                                                                  │    │
│  │  ┌─────────────────────────────┐ ┌─────────────────────────────┐│    │
│  │  │ POST /mark-all-read         │ │ DELETE /bulk                ││    │
│  │  │                             │ │                             ││    │
│  │  │ 전체 읽음 처리              │ │ 대량 삭제                   ││    │
│  │  └─────────────────────────────┘ └─────────────────────────────┘│    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## GET /api/notifications

사용자의 알림 목록을 조회합니다.

### 요청

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|----------|------|------|------|--------|
| page | number | ❌ | 페이지 번호 | 1 |
| limit | number | ❌ | 페이지당 개수 (최대 100) | 20 |
| isRead | string | ❌ | 읽음 필터 ('true'/'false') | - |
| type | string | ❌ | 알림 타입 필터 | - |

**예시:**
```
GET /api/notifications?page=1&limit=20&isRead=false
GET /api/notifications?type=NOTICE
```

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxxxxxxxxxx",
      "userId": "clxxxxxxxxxx",
      "type": "JOIN_APPROVED",
      "message": "알고리즘 스터디에 가입이 승인되었습니다!",
      "link": "/my-studies/clxxxxxxxxxx",
      "isRead": false,
      "studyId": "clxxxxxxxxxx",
      "studyName": "알고리즘 스터디",
      "studyEmoji": "💻",
      "data": null,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "readAt": null
    },
    {
      "id": "clxxxxxxxxxx",
      "userId": "clxxxxxxxxxx",
      "type": "NOTICE",
      "message": "새로운 공지가 등록되었습니다: 1월 스터디 일정",
      "link": "/my-studies/clxx/notices/clxx",
      "isRead": true,
      "studyId": "clxxxxxxxxxx",
      "studyName": "독서 모임",
      "studyEmoji": "📚",
      "data": { "noticeId": "clxx" },
      "createdAt": "2025-01-14T15:00:00.000Z",
      "readAt": "2025-01-14T16:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

## POST /api/notifications

알림을 생성합니다. (내부 시스템용)

### 요청

**Body:**

```json
{
  "userId": "clxxxxxxxxxx",
  "type": "JOIN_APPROVED",
  "message": "알고리즘 스터디에 가입이 승인되었습니다!",
  "link": "/my-studies/clxxxxxxxxxx",
  "studyId": "clxxxxxxxxxx",
  "studyName": "알고리즘 스터디",
  "studyEmoji": "💻",
  "data": null
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| userId | string | ✅ | 수신자 ID |
| type | string | ✅ | 알림 타입 |
| message | string | ✅ | 알림 메시지 |
| link | string | ❌ | 클릭 시 이동할 링크 |
| studyId | string | ❌ | 관련 스터디 ID |
| studyName | string | ❌ | 스터디 이름 |
| studyEmoji | string | ❌ | 스터디 이모지 |
| data | object | ❌ | 추가 데이터 (JSON) |

### 응답

**성공 (201 Created):**

```json
{
  "success": true,
  "message": "알림이 생성되었습니다.",
  "data": {
    "id": "clxxxxxxxxxx",
    "userId": "clxxxxxxxxxx",
    "type": "JOIN_APPROVED",
    "message": "알고리즘 스터디에 가입이 승인되었습니다!",
    "isRead": false,
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

---

## GET /api/notifications/[id]

특정 알림의 상세 정보를 조회합니다.

### 요청

```
GET /api/notifications/clxxxxxxxxxx
```

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxx",
    "userId": "clxxxxxxxxxx",
    "type": "NOTICE",
    "message": "새로운 공지가 등록되었습니다",
    "link": "/my-studies/clxx/notices/clxx",
    "isRead": false,
    "studyId": "clxxxxxxxxxx",
    "studyName": "알고리즘 스터디",
    "studyEmoji": "💻",
    "data": { "noticeId": "clxx" },
    "createdAt": "2025-01-15T10:00:00.000Z",
    "readAt": null
  }
}
```

**실패 - 권한 없음 (403):**

```json
{
  "error": "해당 알림에 대한 권한이 없습니다",
  "code": "PERMISSION_DENIED"
}
```

**실패 - 알림 없음 (404):**

```json
{
  "error": "알림을 찾을 수 없습니다",
  "code": "NOT_FOUND"
}
```

---

## DELETE /api/notifications/[id]

알림을 삭제합니다. 본인의 알림만 삭제할 수 있습니다.

### 요청

```
DELETE /api/notifications/clxxxxxxxxxx
```

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "message": "알림이 삭제되었습니다.",
  "data": {
    "id": "clxxxxxxxxxx"
  }
}
```

---

## POST /api/notifications/[id]/read

알림을 읽음 처리합니다.

### 요청

```
POST /api/notifications/clxxxxxxxxxx/read
```

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "message": "알림을 읽음으로 표시했습니다.",
  "data": {
    "id": "clxxxxxxxxxx",
    "isRead": true,
    "readAt": "2025-01-15T11:00:00.000Z"
  }
}
```

### 동작

```javascript
// DB 업데이트
await prisma.notification.update({
  where: { id },
  data: {
    isRead: true,
    readAt: new Date()
  }
})
```

---

## POST /api/notifications/mark-all-read

모든 읽지 않은 알림을 읽음 처리합니다.

### 요청

```
POST /api/notifications/mark-all-read
```

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "message": "5개의 알림을 읽음으로 표시했습니다.",
  "count": 5
}
```

### 동작

```javascript
// 현재 사용자의 모든 읽지 않은 알림을 읽음 처리
const result = await prisma.notification.updateMany({
  where: {
    userId: user.id,
    isRead: false
  },
  data: {
    isRead: true,
    readAt: new Date()
  }
})

return { count: result.count }
```

---

## DELETE /api/notifications/bulk

여러 알림을 한 번에 삭제합니다.

### 요청

**Body:**

```json
{
  "ids": ["clxxxxxxxxxx", "clxxxxxxxxxx", "clxxxxxxxxxx"]
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| ids | string[] | ✅ | 삭제할 알림 ID 배열 |

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "message": "3개의 알림이 삭제되었습니다.",
  "count": 3
}
```

**실패 - 잘못된 요청 (400):**

```json
{
  "error": "삭제할 알림 ID 배열이 필요합니다.",
  "code": "INVALID_INPUT"
}
```

### 동작

```javascript
// 본인 소유의 알림만 삭제
const result = await prisma.notification.deleteMany({
  where: {
    id: { in: ids },
    userId: user.id
  }
})

return { count: result.count }
```

---

## GET /api/notifications/count

읽지 않은 알림 개수를 조회합니다. (헤더 배지용)

### 요청

```
GET /api/notifications/count
```

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "count": 7
}
```

### 사용 예시

```javascript
// 헤더 컴포넌트에서
const { data } = useQuery({
  queryKey: ['notifications', 'count'],
  queryFn: () => api.get('/api/notifications/count'),
  refetchInterval: 30000  // 30초마다 갱신
})

const unreadCount = data?.count || 0
```

---

## 알림 타입별 생성 예시

### 가입 승인 (JOIN_APPROVED)

```javascript
await prisma.notification.create({
  data: {
    userId: applicantId,
    type: 'JOIN_APPROVED',
    message: `${study.name} 스터디에 가입이 승인되었습니다!`,
    link: `/my-studies/${study.id}`,
    studyId: study.id,
    studyName: study.name,
    studyEmoji: study.emoji
  }
})
```

### 공지사항 (NOTICE)

```javascript
// 스터디 멤버 전원에게 알림
const members = await prisma.studyMember.findMany({
  where: { studyId, status: 'ACTIVE', userId: { not: authorId } },
  select: { userId: true }
})

await prisma.notification.createMany({
  data: members.map(member => ({
    userId: member.userId,
    type: 'NOTICE',
    message: `새로운 공지: ${notice.title}`,
    link: `/my-studies/${studyId}/notices/${notice.id}`,
    studyId,
    studyName: study.name,
    studyEmoji: study.emoji,
    data: { noticeId: notice.id }
  }))
})
```

### 파일 업로드 (FILE)

```javascript
await prisma.notification.createMany({
  data: members.map(member => ({
    userId: member.userId,
    type: 'FILE',
    message: `새 파일이 업로드되었습니다: ${file.name}`,
    link: `/my-studies/${studyId}/files`,
    studyId,
    studyName: study.name,
    studyEmoji: study.emoji,
    data: { fileId: file.id }
  }))
})
```

### 할일 배정 (TASK_ASSIGNED)

```javascript
await prisma.notification.create({
  data: {
    userId: assigneeId,
    type: 'TASK_ASSIGNED',
    message: `새로운 할일이 배정되었습니다: ${task.title}`,
    link: `/my-studies/${studyId}/tasks`,
    studyId,
    studyName: study.name,
    studyEmoji: study.emoji,
    data: { taskId: task.id }
  }
})
```

### 강퇴 (KICK)

```javascript
await prisma.notification.create({
  data: {
    userId: kickedUserId,
    type: 'KICK',
    message: `${study.name} 스터디에서 제외되었습니다.${reason ? ` 사유: ${reason}` : ''}`,
    studyId: study.id,
    studyName: study.name,
    studyEmoji: study.emoji,
    data: { reason }
  }
})
```

---

## 공통 에러 코드

| HTTP 코드 | 에러 코드 | 설명 |
|-----------|-----------|------|
| 400 | INVALID_INPUT | 잘못된 입력 (ID 형식, 누락된 필드 등) |
| 401 | UNAUTHORIZED | 인증 필요 |
| 403 | PERMISSION_DENIED | 권한 없음 (다른 사용자의 알림) |
| 404 | NOT_FOUND | 알림을 찾을 수 없음 |
| 500 | INTERNAL_ERROR | 서버 오류 |

---

## 헬퍼 함수

### notification-helpers.js

```javascript
// 알림 목록 조회
export async function getUserNotificationsWithException(userId, params, prisma)

// 알림 생성
export async function createNotificationWithException(data, prisma)

// 소유권 확인
export async function checkNotificationOwnership(id, userId, prisma)

// 읽음 처리
export async function markNotificationAsRead(id, userId, prisma)

// 전체 읽음 처리
export async function markAllNotificationsAsRead(userId, prisma)

// 알림 삭제
export async function deleteNotificationWithException(id, userId, prisma)

// 대량 삭제
export async function deleteBulkNotificationsWithException(ids, userId, prisma)

// 읽지 않은 개수 조회
export async function getUnreadNotificationCount(userId, prisma)

// 응답 포맷팅
export function formatNotificationResponse(notification)

// 성공 응답 생성
export function createSuccessResponse(data, message)

// 에러 응답 생성
export function createErrorResponse(error)
```

### notification-validators.js

```javascript
// 세션 검증
export function validateSession(session)

// 알림 ID 검증
export function validateNotificationId(id)

// 쿼리 파라미터 검증
export function validateNotificationQueryParams(params)

// 생성 데이터 검증
export function validateNotificationCreateData(data)
```

