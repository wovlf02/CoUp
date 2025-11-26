# 콘텐츠 모니터링 API

> **작성일**: 2025-11-26

---

## 1. 공지사항 목록

### `GET /api/admin/content/notices`

#### Query Parameters
- `search`: 검색어
- `studyId`: 특정 스터디

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "notices": [
      {
        "id": "notice-1",
        "title": "공지 제목",
        "studyId": "study-1",
        "studyName": "알고리즘 스터디",
        "author": {"id": "user-1", "name": "홍길동"},
        "createdAt": "2025-11-26T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

## 2. 공지사항 삭제

### `DELETE /api/admin/content/notices/:id`

#### Request Body
```json
{
  "reason": "부적절한 내용"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "공지사항이 삭제되었습니다."
}
```

---

## 3. 파일 목록

### `GET /api/admin/content/files`

---

## 4. 채팅 메시지 목록

### `GET /api/admin/content/messages`

---

**다음 문서**: [07-stats.md](./07-stats.md)

