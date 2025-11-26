# 관리자 API 명세 개요

> **프로젝트**: CoUp 플랫폼 관리자 시스템  
> **작성일**: 2025-11-26  
> **버전**: 2.0

---

## 📋 개요

관리자 시스템의 모든 API 엔드포인트를 정의합니다. RESTful 원칙을 따르며, 모든 API는 인증 및 권한 검증을 거칩니다.

---

## 🔗 API 문서 목록

1. [01-overview.md](./01-overview.md) - API 개요 및 공통 사항 (현재 문서)
2. [02-auth.md](./02-auth.md) - 인증 및 권한 API
3. [03-users.md](./03-users.md) - 사용자 관리 API
4. [04-studies.md](./04-studies.md) - 스터디 관리 API
5. [05-reports.md](./05-reports.md) - 신고 관리 API
6. [06-content.md](./06-content.md) - 콘텐츠 모니터링 API
7. [07-stats.md](./07-stats.md) - 통계 및 분석 API
8. [08-settings.md](./08-settings.md) - 시스템 설정 API

---

## 🌐 Base URL

```
Production:  https://coup.com/api/admin
Development: http://localhost:3000/api/admin
```

---

## 🔐 인증

### 인증 방식
- **NextAuth.js v4** 세션 기반 인증
- **Cookie**: `next-auth.session-token`

### 권한 검증
모든 관리자 API는 다음을 검증합니다:
1. 유효한 세션 존재 여부
2. `role === 'SYSTEM_ADMIN'` 확인

### 미들웨어
```javascript
// lib/utils/admin/auth.js
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function verifyAdminAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'SYSTEM_ADMIN') {
    throw new Error('Unauthorized')
  }
  
  return session
}
```

---

## 📝 공통 요청 형식

### Headers
```http
Content-Type: application/json
Cookie: next-auth.session-token=...
```

### Query Parameters (페이지네이션)
```
?page=1&limit=20
```

---

## 📤 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지"
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": { ... }
  }
}
```

---

## ⚠️ 에러 코드

### HTTP 상태 코드

| 코드 | 설명 | 사용 |
|------|------|------|
| 200 | OK | 성공 |
| 201 | Created | 리소스 생성 성공 |
| 204 | No Content | 삭제 성공 |
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 실패 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 충돌 (중복 등) |
| 422 | Unprocessable Entity | 유효성 검증 실패 |
| 500 | Internal Server Error | 서버 오류 |

---

### 커스텀 에러 코드

#### 인증 관련
- `AUTH_REQUIRED`: 인증 필요
- `AUTH_INVALID`: 잘못된 인증
- `AUTH_EXPIRED`: 인증 만료
- `PERMISSION_DENIED`: 권한 없음

#### 유효성 검증
- `VALIDATION_ERROR`: 유효성 검증 실패
- `INVALID_INPUT`: 잘못된 입력
- `MISSING_FIELD`: 필수 필드 누락

#### 리소스
- `RESOURCE_NOT_FOUND`: 리소스 없음
- `RESOURCE_ALREADY_EXISTS`: 리소스 이미 존재
- `RESOURCE_CONFLICT`: 리소스 충돌

#### 비즈니스 로직
- `USER_ALREADY_SUSPENDED`: 이미 정지된 사용자
- `USER_NOT_SUSPENDED`: 정지되지 않은 사용자
- `STUDY_HAS_MEMBERS`: 멤버가 있는 스터디
- `REPORT_ALREADY_RESOLVED`: 이미 처리된 신고

---

## 📊 페이지네이션

### 요청
```
GET /api/admin/users?page=1&limit=20
```

### 응답
```json
{
  "data": [...],
  "pagination": {
    "total": 1234,
    "page": 1,
    "limit": 20,
    "totalPages": 62,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🔍 필터링 및 검색

### Query Parameters
```
?search=검색어
&status=active
&dateFrom=2025-01-01
&dateTo=2025-12-31
&sortBy=createdAt
&sortOrder=desc
```

### 예시
```
GET /api/admin/users?search=홍길동&status=active&sortBy=createdAt&sortOrder=desc
```

---

## 📥 Request Body 예시

### JSON 형식
```json
{
  "userId": "user-123",
  "duration": 7,
  "reason": "부적절한 행동"
}
```

### 유효성 검증
- **Zod** 사용하여 서버에서 검증
- 클라이언트에서도 동일한 스키마 사용

```javascript
// lib/schemas/admin/users.js
import { z } from 'zod'

export const suspendUserSchema = z.object({
  userId: z.string().min(1),
  duration: z.number().int().min(1).max(365).or(z.literal(-1)),
  reason: z.string().min(10).max(500),
  notifyUser: z.boolean().optional().default(true)
})
```

---

## 🔄 버전 관리

현재 버전: **v1** (기본)

향후 버전 업그레이드 시:
```
/api/admin/v2/users
```

---

## 🚀 Rate Limiting

### 제한
- **일반 API**: 100 req/min
- **검색 API**: 30 req/min
- **통계 API**: 10 req/min

### 초과 시
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "요청 한도를 초과했습니다.",
    "retryAfter": 60
  }
}
```

---

## 📝 로깅

### 요청 로그
```javascript
{
  "timestamp": "2025-11-26T15:00:00Z",
  "method": "POST",
  "url": "/api/admin/users/user-123/suspend",
  "adminId": "admin-1",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "body": { ... },
  "response": { ... },
  "duration": 123
}
```

### 감사 로그 (Audit Log)
```javascript
{
  "timestamp": "2025-11-26T15:00:00Z",
  "action": "USER_SUSPENDED",
  "adminId": "admin-1",
  "targetType": "user",
  "targetId": "user-123",
  "before": { "status": "active" },
  "after": { "status": "suspended" },
  "reason": "부적절한 행동"
}
```

---

## 🔗 HATEOAS (선택적)

RESTful API의 완성도를 위해 HATEOAS 적용 고려:

```json
{
  "id": "user-123",
  "name": "홍길동",
  "status": "active",
  "_links": {
    "self": "/api/admin/users/user-123",
    "suspend": "/api/admin/users/user-123/suspend",
    "delete": "/api/admin/users/user-123"
  }
}
```

---

## 📊 API 엔드포인트 전체 목록

### 인증 (Auth)
- `GET /api/admin/auth/verify` - 관리자 권한 확인

### 사용자 (Users)
- `GET /api/admin/users` - 사용자 목록
- `GET /api/admin/users/:id` - 사용자 상세
- `POST /api/admin/users/:id/suspend` - 사용자 정지
- `POST /api/admin/users/:id/restore` - 정지 해제
- `DELETE /api/admin/users/:id` - 사용자 삭제
- `PATCH /api/admin/users/:id/role` - 역할 변경

### 스터디 (Studies)
- `GET /api/admin/studies` - 스터디 목록
- `GET /api/admin/studies/:id` - 스터디 상세
- `POST /api/admin/studies/:id/hide` - 스터디 숨김
- `POST /api/admin/studies/:id/show` - 숨김 해제
- `DELETE /api/admin/studies/:id` - 스터디 삭제
- `GET /api/admin/studies/:id/members` - 멤버 목록
- `DELETE /api/admin/studies/:id/members/:userId` - 멤버 강제 퇴출

### 신고 (Reports)
- `GET /api/admin/reports` - 신고 목록
- `GET /api/admin/reports/:id` - 신고 상세
- `POST /api/admin/reports/:id/resolve` - 신고 처리
- `GET /api/admin/reports/stats` - 신고 통계

### 콘텐츠 (Content)
- `GET /api/admin/content/notices` - 공지사항 목록
- `DELETE /api/admin/content/notices/:id` - 공지사항 삭제
- `GET /api/admin/content/files` - 파일 목록
- `DELETE /api/admin/content/files/:id` - 파일 삭제
- `GET /api/admin/content/messages` - 채팅 메시지 목록
- `DELETE /api/admin/content/messages/:id` - 메시지 삭제

### 통계 (Stats)
- `GET /api/admin/stats/overview` - 전체 통계
- `GET /api/admin/stats/users` - 사용자 통계
- `GET /api/admin/stats/studies` - 스터디 통계
- `GET /api/admin/stats/activities` - 활동 통계
- `GET /api/admin/stats/reports` - 신고 통계

### 설정 (Settings)
- `GET /api/admin/settings/categories` - 카테고리 목록
- `POST /api/admin/settings/categories` - 카테고리 생성
- `PATCH /api/admin/settings/categories/:id` - 카테고리 수정
- `DELETE /api/admin/settings/categories/:id` - 카테고리 삭제
- `PATCH /api/admin/settings/categories/order` - 순서 변경
- `GET /api/admin/settings/system` - 시스템 설정 조회
- `PATCH /api/admin/settings/system` - 시스템 설정 변경

---

## 🧪 테스트

### Postman Collection
- API 테스트를 위한 Postman Collection 제공
- 위치: `docs/backend/api/admin/test/`

### 환경 변수
```
BASE_URL: http://localhost:3000
ADMIN_TOKEN: ... (세션 토큰)
```

---

## 🔗 다음 문서

- [인증 API](./02-auth.md)
- [사용자 관리 API](./03-users.md)
- [스터디 관리 API](./04-studies.md)
- [신고 관리 API](./05-reports.md)
- [콘텐츠 모니터링 API](./06-content.md)
- [통계 API](./07-stats.md)
- [시스템 설정 API](./08-settings.md)

---

**작성일**: 2025-11-26  
**다음 문서**: [02-auth.md](./02-auth.md)

