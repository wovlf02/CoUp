# 신고 관리 API

> **Base URL**: `/api/admin/reports`

## 엔드포인트

### 1. 신고 목록
```
GET /api/admin/reports
```

### 2. 신고 상세
```
GET /api/admin/reports/:reportId
```

### 3. 담당자 배정
```
POST /api/admin/reports/:reportId/assign
```

### 4. 신고 승인
```
POST /api/admin/reports/:reportId/approve
```

### 5. 신고 기각
```
POST /api/admin/reports/:reportId/reject
```

### 6. 댓글 추가
```
POST /api/admin/reports/:reportId/comments
```

### 7. 신고 통계
```
GET /api/admin/reports/stats
```
