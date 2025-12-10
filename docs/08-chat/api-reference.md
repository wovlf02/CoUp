# 채팅 API 레퍼런스

## 개요

모든 채팅 관련 API는 `/api/studies/[id]/chat/*` 경로에 위치합니다.

---

## API 구조 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        채팅 API 구조                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                /api/studies/[id]/chat/*                          │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌───────────────────────────┐  │    │
│  │  │ GET /       │ │ POST /      │ │ GET /search               │  │    │
│  │  │             │ │             │ │                           │  │    │
│  │  │ 메시지 목록 │ │ 메시지 전송 │ │ 메시지 검색               │  │    │
│  │  │ (커서 기반) │ │ + 파일 첨부 │ │ (키워드, 날짜, 사용자)    │  │    │
│  │  └─────────────┘ └─────────────┘ └───────────────────────────┘  │    │
│  │                                                                  │    │
│  │  ┌───────────────────────────────────────────────────────────┐  │    │
│  │  │                /api/studies/[id]/chat/[messageId]          │  │    │
│  │  │                                                            │  │    │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │  │    │
│  │  │  │ PATCH /     │ │ DELETE /    │ │ POST /read          │  │  │    │
│  │  │  │             │ │             │ │                     │  │  │    │
│  │  │  │ 메시지 수정 │ │ 메시지 삭제 │ │ 읽음 처리           │  │  │    │
│  │  │  │ (작성자만)  │ │ (작성자/ADMIN)│ │                    │  │  │    │
│  │  │  └─────────────┘ └─────────────┘ └─────────────────────┘  │  │    │
│  │  │                                                            │  │    │
│  │  └───────────────────────────────────────────────────────────┘  │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## GET /api/studies/[id]/chat

스터디 채팅 메시지 목록을 조회합니다. 커서 기반 페이지네이션을 지원합니다.

### 요청

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|----------|------|------|------|--------|
| cursor | string | ❌ | 마지막 메시지 ID (무한 스크롤) | - |
| limit | number | ❌ | 조회할 메시지 수 (1-100) | 50 |

**예시:**
```
GET /api/studies/clxxx/chat?limit=50
GET /api/studies/clxxx/chat?cursor=clxxx&limit=50
```

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
      "content": "안녕하세요!",
      "fileId": null,
      "readers": ["clxxx", "clxxx"],
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "user": {
        "id": "clxxxxxxxxxx",
        "name": "홍길동",
        "avatar": "https://..."
      },
      "file": null
    },
    {
      "id": "clxxxxxxxxxx",
      "studyId": "clxxxxxxxxxx",
      "userId": "clxxxxxxxxxx",
      "content": "📎 자료.pdf",
      "fileId": "clxxxxxxxxxx",
      "readers": ["clxxx"],
      "createdAt": "2025-01-15T10:05:00.000Z",
      "updatedAt": "2025-01-15T10:05:00.000Z",
      "user": {
        "id": "clxxxxxxxxxx",
        "name": "김철수",
        "avatar": "https://..."
      },
      "file": {
        "id": "clxxxxxxxxxx",
        "name": "자료.pdf",
        "url": "/uploads/...",
        "type": "application/pdf",
        "size": 1024000
      }
    }
  ],
  "hasMore": true,
  "nextCursor": "clxxxxxxxxxx"
}
```

**실패 - 잘못된 limit (400):**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_LIMIT",
    "message": "limit은 1-100 사이의 값이어야 합니다"
  }
}
```

### 커서 기반 페이지네이션

```javascript
// 첫 번째 요청
const first = await api.get(`/api/studies/${studyId}/chat?limit=50`)

// 더 많은 메시지 로드 (무한 스크롤)
if (first.hasMore) {
  const more = await api.get(`/api/studies/${studyId}/chat?cursor=${first.nextCursor}&limit=50`)
}
```

---

## POST /api/studies/[id]/chat

메시지를 전송합니다.

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
| content | string | ⚠️ | 메시지 내용 (최대 2000자, fileId 없으면 필수) |
| fileId | string | ❌ | 첨부 파일 ID |

### 응답

**성공 (201 Created):**

```json
{
  "success": true,
  "message": "메시지가 전송되었습니다",
  "data": {
    "id": "clxxxxxxxxxx",
    "studyId": "clxxxxxxxxxx",
    "userId": "clxxxxxxxxxx",
    "content": "안녕하세요! 반갑습니다.",
    "fileId": null,
    "readers": ["clxxxxxxxxxx"],
    "createdAt": "2025-01-15T10:00:00.000Z",
    "user": {
      "id": "clxxxxxxxxxx",
      "name": "홍길동",
      "avatar": "https://..."
    },
    "file": null
  }
}
```

**실패 - 내용 없음 (400):**

```json
{
  "success": false,
  "error": {
    "code": "CHAT-001",
    "message": "메시지 내용을 입력해주세요."
  }
}
```

**실패 - 길이 초과 (400):**

```json
{
  "success": false,
  "error": {
    "code": "CHAT-002",
    "message": "메시지는 2000자를 초과할 수 없습니다."
  }
}
```

**실패 - XSS 감지 (400):**

```json
{
  "success": false,
  "error": {
    "code": "CHAT-003",
    "message": "보안 위협이 감지되었습니다."
  }
}
```

**실패 - 스팸 감지 (429):**

```json
{
  "success": false,
  "error": {
    "code": "CHAT-004",
    "message": "메시지 전송이 너무 빠릅니다. 잠시 후 다시 시도해주세요."
  }
}
```

### 보안 검증 순서

```javascript
// 1. 기본 검증 (content 또는 fileId 필수)
if (!content && !fileId) {
  throw ChatMessageException.emptyContent()
}

// 2. XSS 위협 검증
const threats = validateSecurityThreats(content)
if (!threats.safe) {
  throw ChatMessageException.xssDetected(threats.threats)
}

// 3. 입력값 정제
const validation = validateAndSanitize({ content, fileId }, 'CHAT_MESSAGE')

// 4. 메시지 길이 제한
if (content.length > 2000) {
  throw ChatMessageException.contentTooLong(content.length, 2000)
}

// 5. 스팸 감지
const recentCount = await countRecentMessages(userId, 10)
if (recentCount >= 5) {
  throw ChatMessageException.spamDetected()
}
```

---

## PATCH /api/studies/[id]/chat/[messageId]

메시지를 수정합니다. 작성자만 수정 가능합니다.

### 요청

**Body:**

```json
{
  "content": "수정된 메시지 내용입니다."
}
```

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "message": "메시지가 수정되었습니다",
  "data": {
    "id": "clxxxxxxxxxx",
    "content": "수정된 메시지 내용입니다.",
    "updatedAt": "2025-01-15T11:00:00.000Z",
    "user": { ... },
    "file": null
  }
}
```

**실패 - 권한 없음 (403):**

```json
{
  "success": false,
  "error": {
    "code": "CHAT-011",
    "message": "메시지 수정 권한이 없습니다."
  }
}
```

**실패 - 메시지 없음 (404):**

```json
{
  "success": false,
  "error": {
    "code": "CHAT-010",
    "message": "메시지를 찾을 수 없습니다."
  }
}
```

---

## DELETE /api/studies/[id]/chat/[messageId]

메시지를 삭제합니다. 작성자 또는 ADMIN 이상 권한 필요합니다.

### 요청

```
DELETE /api/studies/clxxx/chat/clxxx
```

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "message": "메시지가 삭제되었습니다"
}
```

**실패 - 권한 없음 (403):**

```json
{
  "success": false,
  "error": {
    "code": "CHAT-012",
    "message": "메시지 삭제 권한이 없습니다."
  }
}
```

---

## POST /api/studies/[id]/chat/[messageId]/read

메시지를 읽음 처리합니다.

### 요청

```
POST /api/studies/clxxx/chat/clxxx/read
```

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "message": "읽음 처리되었습니다",
  "data": {
    "id": "clxxxxxxxxxx",
    "readers": ["clxxx", "clxxx", "clxxx"]
  }
}
```

### 동작

```javascript
// readers 배열에 현재 사용자 ID 추가
await prisma.message.update({
  where: { id: messageId },
  data: {
    readers: {
      push: session.user.id
    }
  }
})
```

---

## GET /api/studies/[id]/chat/search

메시지를 검색합니다.

### 요청

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|----------|------|------|------|--------|
| q | string | ❌ | 검색 키워드 | - |
| startDate | string | ❌ | 시작일 (YYYY-MM-DD) | - |
| endDate | string | ❌ | 종료일 (YYYY-MM-DD) | - |
| userId | string | ❌ | 특정 사용자 메시지만 | - |
| page | number | ❌ | 페이지 번호 | 1 |
| limit | number | ❌ | 페이지당 개수 | 20 |

**예시:**
```
GET /api/studies/clxxx/chat/search?q=알고리즘
GET /api/studies/clxxx/chat/search?userId=clxxx&startDate=2025-01-01
```

### 응답

**성공 (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxxxxxxxxxx",
      "content": "알고리즘 문제 풀이 방법입니다",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "user": {
        "id": "clxxxxxxxxxx",
        "name": "홍길동",
        "avatar": "https://..."
      },
      "file": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

### 검색 조건 생성

```javascript
let whereClause = { studyId }

// 키워드 검색 (대소문자 무시)
if (query) {
  whereClause.content = {
    contains: query,
    mode: 'insensitive'
  }
}

// 날짜 범위
if (startDate || endDate) {
  whereClause.createdAt = {}
  if (startDate) {
    whereClause.createdAt.gte = new Date(startDate)
  }
  if (endDate) {
    const endDateTime = new Date(endDate)
    endDateTime.setHours(23, 59, 59, 999)
    whereClause.createdAt.lte = endDateTime
  }
}

// 사용자 필터
if (userId) {
  whereClause.userId = userId
}
```

---

## 공통 에러 코드

| HTTP 코드 | 에러 코드 | 설명 |
|-----------|-----------|------|
| 400 | CHAT-001 | 메시지 내용 필수 |
| 400 | CHAT-002 | 메시지 길이 초과 (2000자) |
| 400 | CHAT-003 | XSS 위협 감지 |
| 400 | VALIDATION_FAILED | 유효성 검증 실패 |
| 400 | INVALID_LIMIT | 잘못된 limit 값 |
| 401 | UNAUTHORIZED | 인증 필요 |
| 403 | PERMISSION_DENIED | 권한 부족 |
| 403 | CHAT-011 | 수정 권한 없음 |
| 403 | CHAT-012 | 삭제 권한 없음 |
| 404 | CHAT-010 | 메시지 없음 |
| 429 | CHAT-004 | 스팸 감지 (너무 빠른 전송) |
| 500 | FETCH_MESSAGES_FAILED | 메시지 조회 실패 |
| 500 | SEND_MESSAGE_FAILED | 메시지 전송 실패 |

---

## 파일 첨부 메시지 전송

파일을 첨부한 메시지를 전송하려면 2단계로 진행합니다:

### 1단계: 파일 업로드

```javascript
const formData = new FormData()
formData.append('file', selectedFile)
formData.append('category', getFileCategory(selectedFile.type))

const uploadResult = await api.post(`/api/studies/${studyId}/files`, formData, {
  headers: {}  // Content-Type 자동 설정
})

const fileId = uploadResult.data.id
```

### 2단계: 메시지 전송

```javascript
const messageResult = await api.post(`/api/studies/${studyId}/chat`, {
  content: `📎 ${selectedFile.name}`,
  fileId: fileId
})
```

### 3단계: 실시간 전송 (Socket.IO)

```javascript
socket.emit('study:message', {
  studyId,
  message: {
    ...messageResult.data,
    sender: currentUser
  }
})
```

