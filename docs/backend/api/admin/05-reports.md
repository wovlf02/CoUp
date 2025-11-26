# 신고 관리 API

> **작성일**: 2025-11-26

---

## 1. 신고 목록 조회

### `GET /api/admin/reports`

#### Query Parameters
- `status`: pending|resolved|dismissed|all
- `priority`: urgent|high|normal|low|all
- `type`: spam|abuse|harassment|fraud|copyright|other|all

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report-123",
        "type": "spam",
        "target": {"type": "user", "id": "user-1", "name": "홍길동"},
        "reporter": {"id": "user-2", "name": "김철수"},
        "reason": "스팸 행위",
        "priority": "high",
        "status": "pending",
        "createdAt": "2025-11-26T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

## 2. 신고 상세 조회

### `GET /api/admin/reports/:id`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "report-123",
    "type": "spam",
    "target": {...},
    "reporter": {...},
    "reason": "스팸 행위",
    "evidence": ["url1", "url2"],
    "priority": "high",
    "status": "pending",
    "createdAt": "2025-11-26T10:00:00Z"
  }
}
```

---

## 3. 신고 처리

### `POST /api/admin/reports/:id/resolve`

#### Request Body
```json
{
  "action": "suspend",
  "reason": "처리 사유",
  "suspensionDays": 7,
  "notifyReporter": true,
  "notifyTarget": true
}
```

#### Actions
- `warn`: 경고
- `suspend`: 정지
- `delete`: 삭제
- `dismiss`: 기각

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "resolution": {
      "action": "suspend",
      "reason": "부적절한 행동",
      "executedAt": "2025-11-26T15:00:00Z"
    }
  },
  "message": "신고가 처리되었습니다."
}
```

---

**다음 문서**: [06-content.md](./06-content.md)

