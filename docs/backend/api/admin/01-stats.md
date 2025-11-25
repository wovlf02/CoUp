# 관리자 API - 통계 (Stats)

> **작성일**: 2025-11-25  
> **권한**: SYSTEM_ADMIN

---

## 📊 개요

대시보드에 표시되는 실시간 통계 데이터를 제공하는 API입니다.

**총 5개 엔드포인트**

---

## 1. GET `/api/admin/stats`

### 설명
대시보드 핵심 지표 (전체 사용자, 활성 스터디, 신규 가입, 미처리 신고) 조회

### 권한
- SYSTEM_ADMIN

### 요청
```http
GET /api/admin/stats
Authorization: Bearer <JWT_TOKEN>
```

### 응답 (200 OK)
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1234,
      "change": 12,
      "active": 1180,
      "suspended": 3,
      "deleted": 51,
      "newToday": 45,
      "newThisWeek": 120
    },
    "studies": {
      "total": 156,
      "change": 8,
      "active": 140,
      "hidden": 5,
      "newToday": 3,
      "byCategory": [
        { "category": "프로그래밍", "count": 80 },
        { "category": "취업/자격증", "count": 30 },
        { "category": "어학", "count": 25 },
        { "category": "운동/취미", "count": 15 },
        { "category": "디자인", "count": 6 }
      ]
    },
    "reports": {
      "pending": 12,
      "urgent": 3,
      "resolved": 80,
      "rejected": 28
    }
  }
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "관리자 권한이 필요합니다",
  "statusCode": 403
}
```

---

## 2. GET `/api/admin/stats/realtime`

### 설명
실시간 현황 (활성 사용자, 오늘 신규 가입, 진행 중 스터디, 미처리 신고) 조회

### 권한
- SYSTEM_ADMIN

### 요청
```http
GET /api/admin/stats/realtime
Authorization: Bearer <JWT_TOKEN>
```

### 응답 (200 OK)
```json
{
  "success": true,
  "data": {
    "activeUsers": 850,
    "newToday": 45,
    "activeStudies": 120,
    "pendingReports": 12
  }
}
```

### WebSocket 실시간 업데이트
```javascript
socket.on('admin:stats:update', (data) => {
  // { activeUsers: 850, ... }
})
```

---

## 3. GET `/api/admin/stats/user-growth`

### 설명
사용자 증가 추이 (주간/월간/연간)

### 권한
- SYSTEM_ADMIN

### 요청
```http
GET /api/admin/stats/user-growth?period=week
Authorization: Bearer <JWT_TOKEN>
```

### 쿼리 파라미터
| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|---------|------|------|------|--------|
| period | string | 선택 | week / month / year | week |

### 응답 (200 OK)
```json
{
  "success": true,
  "data": {
    "period": "week",
    "dates": [
      "2025-11-19",
      "2025-11-20",
      "2025-11-21",
      "2025-11-22",
      "2025-11-23",
      "2025-11-24",
      "2025-11-25"
    ],
    "counts": [
      1100,
      1115,
      1130,
      1150,
      1180,
      1210,
      1234
    ]
  }
}
```

---

## 4. GET `/api/admin/stats/study-by-category`

### 설명
카테고리별 스터디 통계

### 권한
- SYSTEM_ADMIN

### 요청
```http
GET /api/admin/stats/study-by-category
Authorization: Bearer <JWT_TOKEN>
```

### 응답 (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "category": "프로그래밍",
      "count": 80,
      "percentage": 51.3
    },
    {
      "category": "취업/자격증",
      "count": 30,
      "percentage": 19.2
    },
    {
      "category": "어학",
      "count": 25,
      "percentage": 16.0
    },
    {
      "category": "운동/취미",
      "count": 15,
      "percentage": 9.6
    },
    {
      "category": "디자인",
      "count": 6,
      "percentage": 3.8
    }
  ]
}
```

---

## 5. GET `/api/admin/system/status`

### 설명
시스템 상태 (CPU, 메모리, 디스크 사용률) 조회

### 권한
- SYSTEM_ADMIN

### 요청
```http
GET /api/admin/system/status
Authorization: Bearer <JWT_TOKEN>
```

### 응답 (200 OK)
```json
{
  "success": true,
  "data": {
    "cpu": 45,
    "memory": 62,
    "disk": 35,
    "status": "HEALTHY",
    "uptime": 86400,
    "timestamp": "2025-11-25T14:30:00Z"
  }
}
```

### 상태 값
- `HEALTHY`: 모든 지표 80% 미만
- `WARNING`: 하나 이상 80-90%
- `CRITICAL`: 하나 이상 90% 초과

### WebSocket 실시간 업데이트
```javascript
socket.on('admin:system:status', (data) => {
  // { cpu: 45, memory: 62, disk: 35, status: 'HEALTHY' }
})
```

---

**다음 문서**: [02-users.md](./02-users.md) - 사용자 관리 API

