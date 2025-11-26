# 사용자 관리 API

> **작성일**: 2025-11-26

---

## 📋 개요

사용자 조회, 정지, 삭제, 역할 변경 API

---

## 1. 사용자 목록 조회

### `GET /api/admin/users`

#### Query Parameters
- `page` (number): 페이지 (기본: 1)
- `limit` (number): 페이지당 항목 (기본: 20, 최대: 100)
- `search` (string): 검색어
- `status` (string): active|suspended|deleted|all
- `provider` (string): google|github|email|all
- `role` (string): USER|SYSTEM_ADMIN|all
- `sortBy` (string): createdAt|name|email
- `sortOrder` (string): asc|desc

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-123",
        "name": "홍길동",
        "email": "hong@example.com",
        "avatar": "https://...",
        "provider": "google",
        "role": "USER",
        "status": "active",
        "createdAt": "2025-01-15T10:00:00Z",
        "lastLoginAt": "2025-11-26T14:30:00Z",
        "studyCount": 5,
        "isOnline": true
      }
    ],
    "pagination": {
      "total": 1234,
      "page": 1,
      "limit": 20,
      "totalPages": 62,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 2. 사용자 상세 조회

### `GET /api/admin/users/:id`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "홍길동",
    "email": "hong@example.com",
    "avatar": "https://...",
    "provider": "google",
    "role": "USER",
    "status": "active",
    "bio": "안녕하세요",
    "createdAt": "2025-01-15T10:00:00Z",
    "lastLoginAt": "2025-11-26T14:30:00Z",
    "stats": {
      "studyCount": 5,
      "completedTasksCount": 45,
      "noticesCount": 12,
      "filesCount": 8,
      "chatMessagesCount": 234
    },
    "studies": [
      {
        "id": "study-1",
        "name": "알고리즘 스터디",
        "role": "OWNER",
        "joinedAt": "2025-01-20T10:00:00Z"
      }
    ],
    "reports": {
      "asReporter": 2,
      "asTarget": 0
    },
    "suspensions": []
  }
}
```

#### Error (404)
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "사용자를 찾을 수 없습니다."
  }
}
```

---

## 3. 사용자 정지

### `POST /api/admin/users/:id/suspend`

#### Request Body
```json
{
  "duration": 7,
  "reason": "부적절한 행동",
  "notifyUser": true
}
```

#### Validation
- `duration`: 1-365 또는 -1 (영구)
- `reason`: 10-500자

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "suspension": {
      "id": "susp-123",
      "userId": "user-123",
      "startDate": "2025-11-26T15:00:00Z",
      "endDate": "2025-12-03T15:00:00Z",
      "reason": "부적절한 행동",
      "adminId": "admin-1"
    }
  },
  "message": "사용자가 정지되었습니다."
}
```

#### Error (400)
```json
{
  "success": false,
  "error": {
    "code": "USER_ALREADY_SUSPENDED",
    "message": "이미 정지된 사용자입니다."
  }
}
```

---

## 4. 정지 해제

### `POST /api/admin/users/:id/restore`

#### Request Body
```json
{
  "reason": "정지 해제 사유"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "사용자 정지가 해제되었습니다."
}
```

---

## 5. 사용자 삭제

### `DELETE /api/admin/users/:id`

#### Request Body
```json
{
  "reason": "삭제 사유",
  "deleteContent": false
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "deletedContent": {
      "notices": 5,
      "files": 3,
      "chatMessages": 100
    }
  },
  "message": "사용자가 삭제되었습니다."
}
```

---

## 6. 역할 변경

### `PATCH /api/admin/users/:id/role`

#### Request Body
```json
{
  "newRole": "SYSTEM_ADMIN",
  "reason": "관리자 임명"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "name": "홍길동",
      "role": "SYSTEM_ADMIN"
    }
  },
  "message": "역할이 변경되었습니다."
}
```

---

**다음 문서**: [04-studies.md](./04-studies.md)

