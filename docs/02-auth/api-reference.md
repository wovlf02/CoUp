# 인증 API 레퍼런스

## 개요

모든 인증 관련 API는 `/api/auth/*` 경로에 위치합니다.

---

## API 구조 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        /api/auth/* API 구조                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    [...nextauth]/route.js                        │    │
│  │                                                                  │    │
│  │  NextAuth 핸들러 (자동 생성 엔드포인트)                         │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │    │
│  │  │GET /session │ │POST /signin │ │POST /signout│                │    │
│  │  │             │ │             │ │             │                │    │
│  │  │세션 정보    │ │로그인 처리  │ │로그아웃    │                │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │    │
│  │  │GET /csrf    │ │GET /providers│ │/callback/*  │                │    │
│  │  │             │ │             │ │             │                │    │
│  │  │CSRF 토큰   │ │제공자 목록  │ │OAuth 콜백  │                │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    커스텀 API 엔드포인트                         │    │
│  │                                                                  │    │
│  │  ┌──────────────────┐                                           │    │
│  │  │ POST /signup     │ ─────────────────────────────────────┐    │    │
│  │  │                  │                                       │    │    │
│  │  │ 회원가입         │  1. 입력값 검증 (Zod)                 │    │    │
│  │  │ 인증: ❌ 불필요  │  2. 이메일 중복 확인                  │    │    │
│  │  └──────────────────┘  3. bcrypt 비밀번호 해싱              │    │    │
│  │                         4. User 생성                         │    │    │
│  │                                                              │    │    │
│  │  ┌──────────────────┐                                       │    │    │
│  │  │ GET /me          │ ──────────────────────────────────────┘    │    │
│  │  │                  │                                            │    │
│  │  │ 사용자 정보      │  1. 세션 확인 (getServerSession)           │    │
│  │  │ 인증: ✅ 필요    │  2. DB에서 User 조회                       │    │
│  │  └──────────────────┘  3. AdminRole 조회                         │    │
│  │                         4. 사용자 + adminRole 반환               │    │
│  │                                                                  │    │
│  │  ┌──────────────────┐                                           │    │
│  │  │ GET /validate-   │ ─────────────────────────────────────┐    │    │
│  │  │     session      │                                       │    │    │
│  │  │                  │  1. 세션 조회                          │    │    │
│  │  │ 세션 검증        │  2. DB에서 User 존재 확인              │    │    │
│  │  │ 인증: ❌ 불필요  │  3. 계정 상태 확인                     │    │    │
│  │  └──────────────────┘  4. { valid, shouldLogout } 반환       │    │    │
│  │                                                              │    │    │
│  │  ┌──────────────────┐                                       │    │    │
│  │  │ POST /verify     │ ──────────────────────────────────────┘    │    │
│  │  │                  │                                            │    │
│  │  │ 시그널링 인증    │  1. userId로 User 조회                     │    │
│  │  │ 인증: ❌ 불필요  │  2. 계정 상태 확인 (ACTIVE)                 │    │
│  │  └──────────────────┘  3. 사용자 정보 반환                       │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 엔드포인트 목록

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| POST | `/api/auth/signup` | 회원가입 | ❌ |
| GET | `/api/auth/me` | 현재 사용자 정보 | ✅ |
| GET | `/api/auth/validate-session` | 세션 유효성 검증 | ❌ |
| POST | `/api/auth/verify` | 시그널링 서버 인증 | ❌ |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth 핸들러 | - |

---

## POST /api/auth/signup

새 사용자를 등록합니다.

### 요청

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "MyPassword123!",
  "name": "홍길동",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 응답

**성공 (201 Created):**
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다",
  "user": {
    "id": "clxxxxxxxxxxxxxxxxx",
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

**실패 - 이메일 중복 (409 Conflict):**
```json
{
  "error": "AUTH_013",
  "message": "이미 사용 중인 이메일입니다"
}
```

**실패 - 유효성 검증 (400 Bad Request):**
```json
{
  "error": "AUTH_015",
  "message": "비밀번호는 최소 8자 이상이어야 합니다"
}
```

### 유효성 검증 규칙

| 필드 | 규칙 |
|------|------|
| email | 필수, 이메일 형식, 최대 255자, 고유 |
| password | 필수, 8자 이상, 128자 이하 |
| name | 필수, 2자 이상, 50자 이하 |
| avatar | 선택, URL 형식 |

---

## GET /api/auth/me

현재 로그인한 사용자의 정보를 조회합니다.

### 요청

**Headers:**
```
Cookie: next-auth.session-token=...
```

### 응답

**성공 (200 OK):**
```json
{
  "user": {
    "id": "clxxxxxxxxxxxxxxxxx",
    "email": "user@example.com",
    "name": "홍길동",
    "avatar": "https://example.com/avatar.jpg",
    "role": "USER",
    "bio": "안녕하세요!",
    "status": "ACTIVE",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "adminRole": null
}
```

**성공 - 관리자 (200 OK):**
```json
{
  "user": {
    "id": "clxxxxxxxxxxxxxxxxx",
    "email": "admin@example.com",
    "name": "관리자",
    "avatar": null,
    "role": "USER",
    "bio": "",
    "status": "ACTIVE",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "adminRole": {
    "role": "SUPER_ADMIN",
    "expiresAt": null,
    "isExpired": false
  }
}
```

**실패 - 미인증 (401 Unauthorized):**
```json
{
  "error": "인증이 필요합니다."
}
```

---

## GET /api/auth/validate-session

현재 세션이 유효한지 확인합니다.

### 요청

**Headers:**
```
Cookie: next-auth.session-token=...
```

### 응답

**성공 - 유효한 세션 (200 OK):**
```json
{
  "valid": true
}
```

**세션 없음 (200 OK):**
```json
{
  "valid": false,
  "error": "AUTH_006",
  "message": "로그인이 필요합니다",
  "shouldLogout": false
}
```

**삭제된 계정 (200 OK):**
```json
{
  "valid": false,
  "error": "AUTH_004",
  "message": "삭제된 계정입니다",
  "shouldLogout": true
}
```

**정지된 계정 (200 OK):**
```json
{
  "valid": false,
  "error": "AUTH_005",
  "message": "정지된 계정입니다",
  "shouldLogout": true
}
```

### 사용 예시

```javascript
// 클라이언트에서 세션 검증
const validateSession = async () => {
  const response = await api.get('/api/auth/validate-session')
  
  if (!response.valid && response.shouldLogout) {
    // 로그아웃 처리
    await signOut({ redirect: false })
    router.push('/sign-in')
  }
}
```

---

## POST /api/auth/verify

시그널링 서버에서 사용자를 인증할 때 사용합니다.
화상 통화 기능에서 사용됩니다.

### 요청

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "clxxxxxxxxxxxxxxxxx"
}
```

### 응답

**성공 (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "clxxxxxxxxxxxxxxxxx",
    "name": "홍길동",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "status": "ACTIVE"
  }
}
```

**실패 - userId 누락 (400 Bad Request):**
```json
{
  "error": "userId is required"
}
```

**실패 - 사용자 없음 (404 Not Found):**
```json
{
  "error": "User not found"
}
```

**실패 - 비활성 계정 (403 Forbidden):**
```json
{
  "error": "User is not active"
}
```

---

## NextAuth 엔드포인트

NextAuth.js가 자동으로 생성하는 엔드포인트입니다.

### GET /api/auth/session

현재 세션 정보를 반환합니다.

**응답:**
```json
{
  "user": {
    "id": "clxxxxxxxxxxxxxxxxx",
    "email": "user@example.com",
    "name": "홍길동",
    "image": "https://example.com/avatar.jpg",
    "role": "USER",
    "status": "ACTIVE",
    "provider": "CREDENTIALS",
    "isAdmin": false,
    "adminRole": null,
    "restrictedActions": [],
    "restrictedUntil": null
  },
  "expires": "2025-12-12T00:00:00.000Z"
}
```

### POST /api/auth/callback/credentials

이메일/비밀번호 로그인 처리

**Body:**
```json
{
  "email": "user@example.com",
  "password": "MyPassword123!"
}
```

### GET /api/auth/providers

사용 가능한 인증 제공자 목록

**응답:**
```json
{
  "credentials": {
    "id": "credentials",
    "name": "Credentials",
    "type": "credentials",
    "signinUrl": "/api/auth/signin/credentials",
    "callbackUrl": "/api/auth/callback/credentials"
  }
}
```

### GET /api/auth/csrf

CSRF 토큰을 반환합니다.

**응답:**
```json
{
  "csrfToken": "xxxxxxxxxxxxxxxxxxxxxxxx"
}
```

### POST /api/auth/signout

로그아웃 처리

---

## 에러 코드 목록

| 코드 | 상수명 | 메시지 | HTTP 상태 |
|------|--------|--------|-----------|
| AUTH_001 | INVALID_CREDENTIALS | 이메일 또는 비밀번호가 일치하지 않습니다 | 401 |
| AUTH_002 | MISSING_CREDENTIALS | 이메일과 비밀번호를 입력해주세요 | 400 |
| AUTH_003 | SOCIAL_ACCOUNT | 소셜 로그인 계정입니다 | 400 |
| AUTH_004 | ACCOUNT_DELETED | 삭제된 계정입니다 | 403 |
| AUTH_005 | ACCOUNT_SUSPENDED | 정지된 계정입니다 | 403 |
| AUTH_006 | NO_SESSION | 로그인이 필요합니다 | 401 |
| AUTH_007 | SESSION_EXPIRED | 세션이 만료되었습니다 | 401 |
| AUTH_008 | INVALID_SESSION | 유효하지 않은 세션입니다 | 401 |
| AUTH_009 | INSUFFICIENT_PERMISSION | 권한이 없습니다 | 403 |
| AUTH_010 | TOO_MANY_ATTEMPTS | 로그인 시도 횟수가 초과되었습니다 | 429 |
| AUTH_011 | DB_CONNECTION_ERROR | 데이터베이스 연결에 실패했습니다 | 503 |
| AUTH_012 | DB_QUERY_ERROR | 데이터베이스 조회 중 오류가 발생했습니다 | 500 |
| AUTH_013 | EMAIL_ALREADY_EXISTS | 이미 사용 중인 이메일입니다 | 409 |
| AUTH_014 | INVALID_EMAIL_FORMAT | 올바른 이메일 형식이 아닙니다 | 400 |
| AUTH_015 | PASSWORD_TOO_SHORT | 비밀번호는 최소 8자 이상이어야 합니다 | 400 |
| AUTH_016 | WEAK_PASSWORD | 비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다 | 400 |
| AUTH_999 | UNKNOWN_ERROR | 알 수 없는 오류가 발생했습니다 | 500 |

---

## 공통 응답 형식

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
  "error": "에러 코드",
  "message": "에러 메시지",
  "details": { ... }  // 선택
}
```

