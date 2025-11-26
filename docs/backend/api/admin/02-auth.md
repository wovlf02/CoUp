# 관리자 인증 API

> **작성일**: 2025-11-26  
> **이전 문서**: [01-overview.md](./01-overview.md)

---

## 📋 개요

관리자 인증 및 권한 검증 API입니다.

---

## 🔐 인증 확인

### `GET /api/admin/auth/verify`

관리자 권한 확인

#### Request
```http
GET /api/admin/auth/verify HTTP/1.1
Cookie: next-auth.session-token=...
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "adminId": "user-1",
    "name": "관리자",
    "email": "admin@coup.com",
    "role": "SYSTEM_ADMIN",
    "permissions": ["*"]
  }
}
```

#### Error (401 Unauthorized)
```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "관리자 권한이 없습니다."
  }
}
```

---

**다음 문서**: [03-users.md](./03-users.md)

