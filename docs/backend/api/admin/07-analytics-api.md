# 분석 API

> **Base URL**: `/api/admin/analytics`

## 엔드포인트

### 1. 사용자 분석
```
GET /api/admin/analytics/users
```

### 2. 스터디 분석
```
GET /api/admin/analytics/studies
```

### 3. 활동 분석
```
GET /api/admin/analytics/activities
```

### 4. 리포트 생성
```
POST /api/admin/analytics/reports
Body: { type, startDate, endDate, format, includeData[] }
```

### 5. 리포트 목록
```
GET /api/admin/analytics/reports
```

### 6. 리포트 다운로드
```
GET /api/admin/analytics/reports/:id/download
```
