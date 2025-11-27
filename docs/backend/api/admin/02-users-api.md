# 사용자 관리 API

> **Base URL**: `/api/admin/users`  
> **권한**: ADMIN (조회/제재), SYSTEM_ADMIN (삭제)

---

## API 엔드포인트

### 1. 사용자 목록
```
GET /api/admin/users
Query: page, limit, status, role, search, sortBy
```

### 2. 사용자 상세
```
GET /api/admin/users/:userId
```

### 3. 경고 발송
```
POST /api/admin/users/:userId/warn
Body: { reason, relatedReportId?, sendEmail }
```

### 4. 정지 실행
```
POST /api/admin/users/:userId/suspend
Body: { duration, reason, relatedReportIds?, sendEmail }
```

### 5. 정지 해제
```
POST /api/admin/users/:userId/unsuspend
Body: { reason, sendNotification }
```

### 6. 기능 제한
```
POST /api/admin/users/:userId/restrict
Body: { functions[], duration, reason }
```

### 7. 제재 이력
```
GET /api/admin/users/:userId/sanctions
```

### 8. 사용자 완전 삭제 (SYSTEM_ADMIN)
```
DELETE /api/admin/users/:userId
Body: { reason }
```

### 9. 데이터 익스포트
```
POST /api/admin/users/export
Body: { format, filters, fields[] }
```

---

**참고**: 각 엔드포인트의 상세 요청/응답은 구현 시 확장

