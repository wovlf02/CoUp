# 시스템 설정 API

> **Base URL**: `/api/admin/settings`  
> **권한**: SYSTEM_ADMIN 전용

## 엔드포인트

### 1. 플랫폼 설정
```
GET /api/admin/settings/platform
PATCH /api/admin/settings/platform
```

### 2. 이메일 템플릿
```
GET /api/admin/settings/email-templates
GET /api/admin/settings/email-templates/:type
PUT /api/admin/settings/email-templates/:type
POST /api/admin/settings/email-templates/test
```

### 3. 이용약관
```
GET /api/admin/settings/terms
POST /api/admin/settings/terms
GET /api/admin/settings/terms/versions
```

### 4. 관리자 권한 관리
```
GET /api/admin/settings/admins
POST /api/admin/settings/admins
DELETE /api/admin/settings/admins/:userId
PATCH /api/admin/settings/admins/:userId/promote
```
