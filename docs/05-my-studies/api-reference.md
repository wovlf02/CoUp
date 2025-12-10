# 내 스터디 API 레퍼런스

## 개요

모든 내 스터디 관련 API는 `/api/my-studies` 및 `/api/studies/[id]/*` 경로에 위치합니다.

---

## API 구조 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    내 스터디 API 구조                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    /api/my-studies                               │    │
│  │                                                                  │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │ GET /                                                    │    │    │
│  │  │                                                          │    │    │
│  │  │ 내 스터디 목록 조회                                      │    │    │
│  │  │ • ACTIVE/PENDING 상태만                                  │    │    │
│  │  │ • Study 정보 + 활동 통계 포함                            │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    /api/studies/[id]/* 기능 API                  │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │    │
│  │  │ /chat       │ │ /notices    │ │ /files      │                │    │
│  │  │             │ │             │ │             │                │    │
│  │  │ 실시간 채팅 │ │ 공지사항    │ │ 파일 관리   │                │    │
│  │  │ GET/POST/DEL│ │ CRUD + 고정 │ │ 업로드/삭제 │                │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │    │
│  │  │ /calendar   │ │ /tasks      │ │ /members    │                │    │
│  │  │             │ │             │ │             │                │    │
│  │  │ 일정 관리   │ │ 할일 관리   │ │ 멤버 관리   │                │    │
│  │  │ CRUD        │ │ 칸반보드    │ │ 역할/강퇴   │                │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                │    │
│  │                                                                  │    │
│  │  ┌──────────────────────────────────────────────────────────┐   │    │
│  │  │ /join-requests                                            │   │    │
│  │  │                                                           │   │    │
│  │  │ 가입 신청 관리 (ADMIN+ 전용)                              │   │    │
│  │  │ GET / POST /.../approve / POST /.../reject                │   │    │
│  │  └──────────────────────────────────────────────────────────┘   │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## GET /api/my-studies

현재 로그인한 사용자가 가입한 스터디 목록을 조회합니다.

### 요청

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|----------|------|------|------|--------|
| filter | string | ❌ | 역할 필터 (all, member, admin, pending) | all |
| page | number | ❌ | 페이지 번호 | 1 |
| limit | number | ❌ | 페이지당 항목 수 | 전체 |

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "data": {
    "studies": [
      {
        "id": "clxxxxxxxxxx",
        "studyId": "clxxxxxxxxxx",
        "userId": "clxxxxxxxxxx",
        "role": "OWNER",
        "status": "ACTIVE",
        "joinedAt": "2025-01-01T00:00:00.000Z",
        "study": {
          "id": "clxxxxxxxxxx",
          "name": "알고리즘 스터디",
          "emoji": "💻",
          "description": "매주 알고리즘 문제를 풉니다",
          "category": "개발",
          "subCategory": "알고리즘/코테",
          "maxMembers": 20,
          "isPublic": true,
          "isRecruiting": true,
          "tags": ["알고리즘", "코딩테스트"],
          "createdAt": "2025-01-01T00:00:00.000Z",
          "currentMembers": 12,
          "_count": {
            "members": 12,
            "messages": 45,
            "notices": 3
          }
        }
      }
    ],
    "stats": {
      "total": 5,
      "asOwner": 1,
      "asAdmin": 1,
      "asMember": 2,
      "pending": 1
    }
  }
}
```

**실패 - 인증 필요 (401 Unauthorized):**

```json
{
  "success": false,
  "error": "로그인이 필요합니다",
  "code": "UNAUTHORIZED"
}
```

### 필터링 로직

```javascript
// DB 쿼리 조건
const studyMembers = await prisma.studyMember.findMany({
  where: {
    userId,
    status: {
      in: ['ACTIVE', 'PENDING']  // KICKED, LEFT 제외
    }
  },
  include: {
    study: {
      select: {
        id: true,
        name: true,
        emoji: true,
        description: true,
        category: true,
        maxMembers: true,
        _count: {
          select: {
            members: { where: { status: 'ACTIVE' } },
            messages: { where: { createdAt: { gte: last24Hours } } },
            notices: { where: { createdAt: { gte: last7Days } } }
          }
        }
      }
    }
  }
})
```

---

## GET /api/studies/[id]/chat

스터디 채팅 메시지 목록을 조회합니다.

### 요청

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|----------|------|------|------|--------|
| page | number | ❌ | 페이지 번호 | 1 |
| limit | number | ❌ | 메시지 수 | 50 |
| before | string | ❌ | 이 ID 이전 메시지 (커서) | - |

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxxxxxxxxxx",
      "content": "안녕하세요!",
      "studyId": "clxxxxxxxxxx",
      "userId": "clxxxxxxxxxx",
      "fileId": null,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "user": {
        "id": "clxxxxxxxxxx",
        "name": "홍길동",
        "avatar": "https://..."
      },
      "file": null
    }
  ],
  "pagination": {
    "hasMore": true,
    "nextCursor": "clxxxxxxxxxx"
  }
}
```

---

## POST /api/studies/[id]/chat

채팅 메시지를 전송합니다.

### 요청

**Body:**

```json
{
  "content": "안녕하세요! 반갑습니다.",
  "fileId": null
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| content | string | ✅ | 메시지 내용 |
| fileId | string | ❌ | 첨부 파일 ID |

### 응답

**성공 (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxx",
    "content": "안녕하세요! 반갑습니다.",
    "studyId": "clxxxxxxxxxx",
    "userId": "clxxxxxxxxxx",
    "createdAt": "2025-01-15T10:35:00.000Z",
    "user": {
      "id": "clxxxxxxxxxx",
      "name": "홍길동",
      "avatar": "https://..."
    }
  }
}
```

### 실시간 전송

메시지 저장 후 Socket.io를 통해 브로드캐스트됩니다:

```javascript
socket.emit('study:message', {
  studyId,
  message: {
    ...savedMessage,
    sender: currentUser
  }
})
```

---

## GET /api/studies/[id]/notices

스터디 공지사항 목록을 조회합니다.

### 요청

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|----------|------|------|------|--------|
| page | number | ❌ | 페이지 번호 | 1 |
| limit | number | ❌ | 페이지당 항목 수 | 10 |
| pinned | string | ❌ | 고정 공지만 ('true') | - |

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxxxxxxxxxx",
      "title": "1월 스터디 일정 안내",
      "content": "이번 달 스터디 일정입니다...",
      "isPinned": true,
      "isImportant": true,
      "views": 45,
      "studyId": "clxxxxxxxxxx",
      "authorId": "clxxxxxxxxxx",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "author": {
        "id": "clxxxxxxxxxx",
        "name": "홍길동",
        "avatar": "https://..."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## POST /api/studies/[id]/notices

공지사항을 작성합니다. **ADMIN+ 권한 필요**

### 요청

**Body:**

```json
{
  "title": "1월 스터디 일정 안내",
  "content": "이번 달 스터디 일정입니다...",
  "isPinned": false,
  "isImportant": true
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | string | ✅ | 제목 (2-100자) |
| content | string | ✅ | 내용 |
| isPinned | boolean | ❌ | 상단 고정 여부 |
| isImportant | boolean | ❌ | 중요 표시 여부 |

### 응답

**성공 (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxx",
    "title": "1월 스터디 일정 안내",
    "content": "이번 달 스터디 일정입니다...",
    "isPinned": false,
    "isImportant": true,
    "views": 0,
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

---

## POST /api/studies/[id]/files

파일을 업로드합니다.

### 요청

**Headers:**

```
Content-Type: multipart/form-data
```

**FormData:**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| file | File | ✅ | 업로드할 파일 (최대 50MB) |
| category | string | ❌ | 카테고리 (자동 감지) |
| folderId | string | ❌ | 폴더 ID |

### 응답

**성공 (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxx",
    "name": "document.pdf",
    "originalName": "document.pdf",
    "mimeType": "application/pdf",
    "size": 1024000,
    "url": "/uploads/studies/xxx/document.pdf",
    "category": "DOCUMENT",
    "studyId": "clxxxxxxxxxx",
    "uploaderId": "clxxxxxxxxxx",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "uploader": {
      "id": "clxxxxxxxxxx",
      "name": "홍길동"
    }
  }
}
```

### 파일 카테고리 자동 감지

```javascript
const getFileCategory = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'IMAGE'
  if (mimeType.startsWith('video/')) return 'VIDEO'
  if (mimeType.startsWith('audio/')) return 'AUDIO'
  if (['application/zip', 'application/x-rar-compressed', ...].includes(mimeType)) return 'ARCHIVE'
  if (['text/javascript', 'text/css', 'application/json', ...].includes(mimeType)) return 'CODE'
  return 'DOCUMENT'
}
```

---

## GET /api/studies/[id]/calendar

스터디 일정 목록을 조회합니다.

### 요청

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 | 예시 |
|----------|------|------|------|------|
| month | string | ❌ | 월 기준 조회 (YYYY-MM) | 2025-01 |
| startDate | string | ❌ | 시작일 | 2025-01-01 |
| endDate | string | ❌ | 종료일 | 2025-01-31 |

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxxxxxxxxxx",
      "title": "정기 모임",
      "date": "2025-01-20T00:00:00.000Z",
      "startTime": "19:00",
      "endTime": "21:00",
      "location": "온라인",
      "color": "#6366F1",
      "studyId": "clxxxxxxxxxx",
      "createdById": "clxxxxxxxxxx",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "createdBy": {
        "id": "clxxxxxxxxxx",
        "name": "홍길동",
        "avatar": "https://..."
      }
    }
  ]
}
```

---

## POST /api/studies/[id]/calendar

일정을 생성합니다. **ADMIN+ 권한 필요**

### 요청

**Body:**

```json
{
  "title": "정기 모임",
  "date": "2025-01-20",
  "startTime": "19:00",
  "endTime": "21:00",
  "location": "온라인",
  "color": "#6366F1"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | string | ✅ | 일정 제목 |
| date | string | ✅ | 날짜 (YYYY-MM-DD) |
| startTime | string | ❌ | 시작 시간 (HH:mm) |
| endTime | string | ❌ | 종료 시간 (HH:mm) |
| location | string | ❌ | 장소 |
| color | string | ❌ | 색상 코드 |

---

## GET /api/studies/[id]/tasks

스터디 할일 목록을 조회합니다.

### 요청

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|----------|------|------|------|--------|
| status | string | ❌ | 상태 필터 | - |
| priority | string | ❌ | 우선순위 필터 | - |

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxxxxxxxxxx",
      "title": "알고리즘 문제 풀기",
      "description": "백준 1000번 ~ 1010번",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2025-01-25T00:00:00.000Z",
      "studyId": "clxxxxxxxxxx",
      "createdById": "clxxxxxxxxxx",
      "createdAt": "2025-01-15T00:00:00.000Z",
      "createdBy": {
        "id": "clxxxxxxxxxx",
        "name": "홍길동"
      },
      "assignees": [
        {
          "id": "clxxxxxxxxxx",
          "user": {
            "id": "clxxxxxxxxxx",
            "name": "김철수"
          }
        }
      ]
    }
  ]
}
```

---

## POST /api/studies/[id]/tasks

할일을 생성합니다. **ADMIN+ 권한 필요**

### 요청

**Body:**

```json
{
  "title": "알고리즘 문제 풀기",
  "description": "백준 1000번 ~ 1010번",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-01-25",
  "assigneeIds": ["clxxxxxxxxxx", "clxxxxxxxxxx"]
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | string | ✅ | 제목 |
| description | string | ❌ | 설명 |
| status | string | ❌ | 상태 (TODO, IN_PROGRESS, REVIEW, DONE) |
| priority | string | ❌ | 우선순위 (LOW, MEDIUM, HIGH, URGENT) |
| dueDate | string | ❌ | 마감일 (YYYY-MM-DD) |
| assigneeIds | string[] | ❌ | 담당자 ID 목록 |

---

## PATCH /api/studies/[id]/members/[userId]/role

멤버 역할을 변경합니다. **OWNER 전용**

### 요청

**Body:**

```json
{
  "role": "ADMIN"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| role | string | 새 역할 (ADMIN, MEMBER) |

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "message": "역할이 변경되었습니다",
  "data": {
    "id": "clxxxxxxxxxx",
    "userId": "clxxxxxxxxxx",
    "role": "ADMIN"
  }
}
```

### 에러 케이스

**본인 역할 변경 시도 (400):**

```json
{
  "success": false,
  "error": "본인의 역할은 변경할 수 없습니다",
  "type": "CANNOT_MODIFY_SELF_ROLE"
}
```

**OWNER 권한 부족 (403):**

```json
{
  "success": false,
  "error": "이 작업은 스터디장만 수행할 수 있습니다",
  "type": "OWNER_PERMISSION_REQUIRED"
}
```

---

## DELETE /api/studies/[id]/members/[userId]

멤버를 강퇴합니다. **ADMIN+ 권한 필요**

### 요청

**Body:** (선택)

```json
{
  "reason": "규칙 위반"
}
```

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "message": "멤버가 강퇴되었습니다"
}
```

### 에러 케이스

**OWNER 강퇴 시도 (400):**

```json
{
  "success": false,
  "error": "스터디장은 제거할 수 없습니다",
  "type": "CANNOT_REMOVE_OWNER"
}
```

**ADMIN이 ADMIN 강퇴 시도 (403):**

```json
{
  "success": false,
  "error": "관리자는 오너만 강퇴할 수 있습니다",
  "type": "OWNER_PERMISSION_REQUIRED"
}
```

---

## GET /api/studies/[id]/join-requests

가입 신청 목록을 조회합니다. **ADMIN+ 권한 필요**

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxxxxxxxxxx",
      "studyId": "clxxxxxxxxxx",
      "userId": "clxxxxxxxxxx",
      "status": "PENDING",
      "introduction": "열심히 하겠습니다!",
      "motivation": "코딩테스트 준비",
      "level": "중급",
      "createdAt": "2025-01-15T00:00:00.000Z",
      "user": {
        "id": "clxxxxxxxxxx",
        "name": "김철수",
        "email": "kim@example.com",
        "avatar": "https://..."
      }
    }
  ]
}
```

---

## POST /api/studies/[id]/join-requests/[requestId]/approve

가입 신청을 승인합니다. **ADMIN+ 권한 필요**

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "message": "가입 신청이 승인되었습니다"
}
```

### 에러 케이스

**정원 초과 (400):**

```json
{
  "success": false,
  "error": "스터디 정원이 가득 찼습니다",
  "type": "STUDY_FULL"
}
```

**이미 처리됨 (400):**

```json
{
  "success": false,
  "error": "이미 처리된 가입 신청입니다",
  "type": "APPLICATION_ALREADY_PROCESSED"
}
```

---

## POST /api/studies/[id]/join-requests/[requestId]/reject

가입 신청을 거절합니다. **ADMIN+ 권한 필요**

### 요청

**Body:** (선택)

```json
{
  "reason": "현재 모집 인원이 충분합니다"
}
```

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "message": "가입 신청이 거절되었습니다"
}
```

---

## 공통 에러 코드

| HTTP 코드 | 에러 타입 | 설명 |
|-----------|-----------|------|
| 400 | VALIDATION_ERROR | 유효성 검증 실패 |
| 400 | STUDY_FULL | 정원 초과 |
| 400 | CANNOT_MODIFY_SELF_ROLE | 본인 역할 변경 불가 |
| 400 | CANNOT_REMOVE_OWNER | OWNER 강퇴 불가 |
| 401 | UNAUTHORIZED | 인증 필요 |
| 403 | PERMISSION_DENIED | 권한 부족 |
| 403 | ADMIN_PERMISSION_REQUIRED | ADMIN 권한 필요 |
| 403 | OWNER_PERMISSION_REQUIRED | OWNER 권한 필요 |
| 404 | NOT_FOUND | 리소스 없음 |
| 404 | MEMBER_NOT_FOUND | 멤버 없음 |
| 404 | APPLICATION_NOT_FOUND | 신청 없음 |
| 500 | INTERNAL_ERROR | 서버 오류 |

