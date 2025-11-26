# 통계 API

> **작성일**: 2025-11-26

---

## 1. 전체 통계

### `GET /api/admin/stats/overview`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "totalUsers": 1234,
    "activeUsers": 980,
    "totalStudies": 156,
    "activeStudies": 140,
    "pendingReports": 12,
    "urgentReports": 3
  }
}
```

---

## 2. 사용자 통계

### `GET /api/admin/stats/users`

#### Query Parameters
- `period`: week|month|year

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "growth": [
      {"date": "2025-11-01", "total": 1200, "new": 15},
      {"date": "2025-11-02", "total": 1215, "new": 18}
    ],
    "byProvider": {
      "google": 800,
      "github": 300,
      "email": 134
    }
  }
}
```

---

## 3. 스터디 통계

### `GET /api/admin/stats/studies`

---

## 4. 활동 통계

### `GET /api/admin/stats/activities`

---

**다음 문서**: [08-settings.md](./08-settings.md)

