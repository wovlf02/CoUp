# 스터디 관리 API
**다음 문서**: [05-reports.md](./05-reports.md)

---

```
}
  "message": "스터디가 삭제되었습니다."
  },
    }
      "chatMessages": 1234
      "files": 18,
      "notices": 25,
    "deletedContent": {
  "data": {
  "success": true,
{
```json
#### Response (200 OK)

```
}
  "notifyMembers": true
  "reason": "삭제 사유",
{
```json
#### Request Body

### `DELETE /api/admin/studies/:id`

## 4. 스터디 삭제

---

```
}
  "message": "스터디가 숨김 처리되었습니다."
  "success": true,
{
```json
#### Response (200 OK)

```
}
  "notifyOwner": true
  "reason": "부적절한 내용",
{
```json
#### Request Body

### `POST /api/admin/studies/:id/hide`

## 3. 스터디 숨김

---

```
}
  }
    "reports": [...]
    "members": [...],
    },
      "chatMessagesCount": 1234
      "filesCount": 18,
      "noticesCount": 25,
    "stats": {
    "owner": {...},
    "category": {...},
    "description": "...",
    "name": "알고리즘 스터디",
    "id": "study-123",
  "data": {
  "success": true,
{
```json
#### Response (200 OK)

### `GET /api/admin/studies/:id`

## 2. 스터디 상세 조회

---

```
}
  }
    "pagination": {...}
    ],
      }
        "createdAt": "2025-01-15T10:00:00Z"
        "reportCount": 0,
        "status": "active",
        "isPublic": true,
        "maxMembers": 20,
        "memberCount": 12,
        "owner": {"id": "user-1", "name": "홍길동"},
        "category": {"id": "cat-1", "name": "프로그래밍"},
        "emoji": "💻",
        "name": "알고리즘 스터디",
        "id": "study-123",
      {
    "studies": [
  "data": {
  "success": true,
{
```json
#### Response (200 OK)

- `hasReports`: boolean
- `category`: 카테고리 ID
- `visibility`: public|private|all
- `search`: 스터디명 검색
- `page`, `limit`: 페이지네이션
#### Query Parameters

### `GET /api/admin/studies`

## 1. 스터디 목록 조회

---

> **작성일**: 2025-11-26


