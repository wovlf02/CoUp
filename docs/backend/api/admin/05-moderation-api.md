# 콘텐츠 검열 API

> **Base URL**: `/api/admin/moderation`

## 엔드포인트

### 1. 차단 로그
```
GET /api/admin/moderation/blocked
```

### 2. 검열 대기 목록
```
GET /api/admin/moderation/queue
```

### 3. 콘텐츠 검토
```
POST /api/admin/moderation/review/:contentId
```

### 4. 차단 복구
```
POST /api/admin/moderation/blocked/:id/restore
```

### 5. 금지어 목록 (SYSTEM_ADMIN)
```
GET /api/admin/moderation/keywords
POST /api/admin/moderation/keywords
DELETE /api/admin/moderation/keywords/:id
```

### 6. 필터링 설정 (SYSTEM_ADMIN)
```
PATCH /api/admin/moderation/settings
```
