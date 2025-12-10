# 인증 에러 처리 가이드

## 개요

인증 관련 에러를 체계적으로 처리하기 위한 에러 정의 및 유틸리티입니다.

**파일 위치:** `src/lib/exceptions/auth-errors.js`

---

## 에러 처리 플로우

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        인증 에러 처리 플로우                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                      에러 발생 지점                             │     │
│  │                                                                 │     │
│  │   ┌───────────┐   ┌───────────┐   ┌───────────┐                │     │
│  │   │ authorize │   │ API Route │   │ 클라이언트│                │     │
│  │   │ (로그인)  │   │ (서버)    │   │ (브라우저)│                │     │
│  │   └─────┬─────┘   └─────┬─────┘   └─────┬─────┘                │     │
│  │         │               │               │                       │     │
│  └─────────┼───────────────┼───────────────┼───────────────────────┘     │
│            │               │               │                             │
│            ▼               ▼               ▼                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    에러 분류 및 처리                             │    │
│  │                                                                  │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │    │
│  │  │ 인증 실패       │  │ 계정 상태       │  │ 권한 부족       │  │    │
│  │  │                 │  │                 │  │                 │  │    │
│  │  │ AUTH_001        │  │ AUTH_004        │  │ AUTH_009        │  │    │
│  │  │ AUTH_002        │  │ AUTH_005        │  │                 │  │    │
│  │  │ AUTH_003        │  │                 │  │                 │  │    │
│  │  │                 │  │                 │  │                 │  │    │
│  │  │ → 401 응답      │  │ → 403 응답      │  │ → 403 응답      │  │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │    │
│  │                                                                  │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │    │
│  │  │ 세션 에러       │  │ 유효성 검증     │  │ 서버 에러       │  │    │
│  │  │                 │  │                 │  │                 │  │    │
│  │  │ AUTH_006        │  │ AUTH_013        │  │ AUTH_011        │  │    │
│  │  │ AUTH_007        │  │ AUTH_014        │  │ AUTH_012        │  │    │
│  │  │ AUTH_008        │  │ AUTH_015        │  │ AUTH_999        │  │    │
│  │  │                 │  │ AUTH_016        │  │                 │  │    │
│  │  │ → 401 응답      │  │ → 400/409 응답  │  │ → 500/503 응답  │  │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │    │
│  │                                                                  │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        에러 응답 생성                             │   │
│  │                                                                   │   │
│  │   createAuthErrorResponse(errorCode)                              │   │
│  │                                                                   │   │
│  │   ┌──────────────────────────────────────────────────────────┐   │   │
│  │   │ {                                                         │   │   │
│  │   │   "error": "AUTH_001",                                    │   │   │
│  │   │   "message": "이메일 또는 비밀번호가 일치하지 않습니다",  │   │   │
│  │   │   "statusCode": 401                                       │   │   │
│  │   │ }                                                         │   │   │
│  │   └──────────────────────────────────────────────────────────┘   │   │
│  │                                                                   │   │
│  └───────────────────────────────────┬───────────────────────────────┘   │
│                                      │                                   │
│                                      ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        클라이언트 처리                            │   │
│  │                                                                   │   │
│  │   에러 코드 확인 → 적절한 UI 피드백                               │   │
│  │                                                                   │   │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐                 │   │
│  │   │AUTH_006    │  │AUTH_004    │  │AUTH_013    │                 │   │
│  │   │            │  │            │  │            │                 │   │
│  │   │로그인      │  │삭제된 계정 │  │이메일 중복 │                 │   │
│  │   │페이지 이동 │  │안내 표시   │  │메시지 표시 │                 │   │
│  │   └────────────┘  └────────────┘  └────────────┘                 │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 에러 코드 분류

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          AUTH 에러 코드 체계                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  AUTH_0XX: 인증 관련                                                    │
│  ├── AUTH_001: INVALID_CREDENTIALS (401)                               │
│  ├── AUTH_002: MISSING_CREDENTIALS (400)                               │
│  ├── AUTH_003: SOCIAL_ACCOUNT (400)                                    │
│  ├── AUTH_004: ACCOUNT_DELETED (403)                                   │
│  ├── AUTH_005: ACCOUNT_SUSPENDED (403)                                 │
│  ├── AUTH_006: NO_SESSION (401)                                        │
│  ├── AUTH_007: SESSION_EXPIRED (401)                                   │
│  ├── AUTH_008: INVALID_SESSION (401)                                   │
│  └── AUTH_009: INSUFFICIENT_PERMISSION (403)                           │
│                                                                         │
│  AUTH_01X: 보안/Rate Limiting                                          │
│  ├── AUTH_010: TOO_MANY_ATTEMPTS (429)                                 │
│  ├── AUTH_011: DB_CONNECTION_ERROR (503)                               │
│  └── AUTH_012: DB_QUERY_ERROR (500)                                    │
│                                                                         │
│  AUTH_01X: 회원가입/유효성                                              │
│  ├── AUTH_013: EMAIL_ALREADY_EXISTS (409)                              │
│  ├── AUTH_014: INVALID_EMAIL_FORMAT (400)                              │
│  ├── AUTH_015: PASSWORD_TOO_SHORT (400)                                │
│  └── AUTH_016: WEAK_PASSWORD (400)                                     │
│                                                                         │
│  AUTH_01X: JWT/토큰                                                    │
│  ├── AUTH_017: JWT_GENERATION_ERROR (500)                              │
│  ├── AUTH_018: JWT_VERIFICATION_ERROR (401)                            │
│  └── AUTH_019: TOKEN_EXPIRED (401)                                     │
│                                                                         │
│  AUTH_9XX: 일반/알 수 없음                                              │
│  └── AUTH_999: UNKNOWN_ERROR (500)                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## AuthError 클래스

커스텀 에러 클래스입니다.

```javascript
export class AuthError extends Error {
  constructor(message, code, statusCode = 400) {
    super(message)
    this.name = 'AuthError'
    this.code = code
    this.statusCode = statusCode
  }
}
```

### 사용 예시

```javascript
throw new AuthError('이메일이 이미 존재합니다', 'AUTH_013', 409)
```

---

## AUTH_ERRORS 상수

사전 정의된 에러 목록입니다.

### 인증 실패 에러

| 상수명 | 코드 | 메시지 | HTTP 상태 |
|--------|------|--------|-----------|
| `INVALID_CREDENTIALS` | AUTH_001 | 이메일 또는 비밀번호가 일치하지 않습니다 | 401 |
| `MISSING_CREDENTIALS` | AUTH_002 | 이메일과 비밀번호를 입력해주세요 | 400 |
| `SOCIAL_ACCOUNT` | AUTH_003 | 소셜 로그인 계정입니다. 해당 방법으로 로그인해주세요 | 400 |

### 계정 상태 에러

| 상수명 | 코드 | 메시지 | HTTP 상태 |
|--------|------|--------|-----------|
| `ACCOUNT_DELETED` | AUTH_004 | 삭제된 계정입니다 | 403 |
| `ACCOUNT_SUSPENDED` | AUTH_005 | 정지된 계정입니다 | 403 |

### 세션 에러

| 상수명 | 코드 | 메시지 | HTTP 상태 |
|--------|------|--------|-----------|
| `NO_SESSION` | AUTH_006 | 로그인이 필요합니다 | 401 |
| `SESSION_EXPIRED` | AUTH_007 | 세션이 만료되었습니다 | 401 |
| `INVALID_SESSION` | AUTH_008 | 유효하지 않은 세션입니다 | 401 |

### 권한 에러

| 상수명 | 코드 | 메시지 | HTTP 상태 |
|--------|------|--------|-----------|
| `INSUFFICIENT_PERMISSION` | AUTH_009 | 권한이 없습니다 | 403 |

### Rate Limiting

| 상수명 | 코드 | 메시지 | HTTP 상태 |
|--------|------|--------|-----------|
| `TOO_MANY_ATTEMPTS` | AUTH_010 | 로그인 시도 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요 | 429 |

### 데이터베이스 에러

| 상수명 | 코드 | 메시지 | HTTP 상태 |
|--------|------|--------|-----------|
| `DB_CONNECTION_ERROR` | AUTH_011 | 데이터베이스 연결에 실패했습니다 | 503 |
| `DB_QUERY_ERROR` | AUTH_012 | 데이터베이스 조회 중 오류가 발생했습니다 | 500 |

### 회원가입 에러

| 상수명 | 코드 | 메시지 | HTTP 상태 |
|--------|------|--------|-----------|
| `EMAIL_ALREADY_EXISTS` | AUTH_013 | 이미 사용 중인 이메일입니다 | 409 |
| `INVALID_EMAIL_FORMAT` | AUTH_014 | 올바른 이메일 형식이 아닙니다 | 400 |
| `PASSWORD_TOO_SHORT` | AUTH_015 | 비밀번호는 최소 8자 이상이어야 합니다 | 400 |
| `WEAK_PASSWORD` | AUTH_016 | 비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다 | 400 |

### JWT/세션 에러

| 상수명 | 코드 | 메시지 | HTTP 상태 |
|--------|------|--------|-----------|
| `JWT_GENERATION_ERROR` | AUTH_017 | JWT 토큰 생성에 실패했습니다 | 500 |
| `JWT_VERIFICATION_ERROR` | AUTH_018 | JWT 토큰 검증에 실패했습니다 | 401 |
| `TOKEN_EXPIRED` | AUTH_019 | 토큰이 만료되었습니다 | 401 |

### 일반 에러

| 상수명 | 코드 | 메시지 | HTTP 상태 |
|--------|------|--------|-----------|
| `UNKNOWN_ERROR` | AUTH_999 | 알 수 없는 오류가 발생했습니다 | 500 |

---

## 유틸리티 함수

### createAuthErrorResponse

에러 응답 객체를 생성합니다.

```javascript
export function createAuthErrorResponse(errorCode, details = null) {
  const error = AUTH_ERRORS[errorCode]
  if (!error) {
    return {
      error: AUTH_ERRORS.UNKNOWN_ERROR.code,
      message: AUTH_ERRORS.UNKNOWN_ERROR.message,
      details,
      statusCode: 500
    }
  }

  return {
    error: error.code,
    message: error.message,
    details,
    statusCode: error.statusCode
  }
}
```

#### 사용 예시

```javascript
import { createAuthErrorResponse } from '@/lib/exceptions/auth-errors'

// 기본 사용
const errorResponse = createAuthErrorResponse('NO_SESSION')
// {
//   error: 'AUTH_006',
//   message: '로그인이 필요합니다',
//   details: null,
//   statusCode: 401
// }

// 상세 정보 포함
const errorResponse = createAuthErrorResponse('INVALID_CREDENTIALS', {
  attemptCount: 3,
  remainingAttempts: 2
})

// API 응답으로 반환
return NextResponse.json(
  { error: errorResponse.error, message: errorResponse.message },
  { status: errorResponse.statusCode }
)
```

### logAuthError

에러를 로깅합니다.

```javascript
export function logAuthError(context, error, additionalData = {}) {
  console.error(`❌ [AUTH] ${context}:`, {
    message: error.message,
    code: error.code,
    stack: error.stack,
    ...additionalData
  })
}
```

#### 사용 예시

```javascript
import { logAuthError } from '@/lib/exceptions/auth-errors'

try {
  // ...
} catch (error) {
  logAuthError('authorize - DB 조회', error, {
    email: credentials?.email,
    userId: user?.id
  })
  throw error
}
```

---

## 사용 패턴

### API Route에서 사용

```javascript
import { NextResponse } from 'next/server'
import {
  AUTH_ERRORS,
  createAuthErrorResponse,
  logAuthError
} from '@/lib/exceptions/auth-errors'

export async function POST(request) {
  try {
    const body = await request.json()
    
    // 입력 검증
    if (!body.email) {
      const errorResponse = createAuthErrorResponse('INVALID_EMAIL_FORMAT')
      return NextResponse.json(
        { error: errorResponse.error, message: errorResponse.message },
        { status: errorResponse.statusCode }
      )
    }
    
    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })
    
    if (existingUser) {
      const errorResponse = createAuthErrorResponse('EMAIL_ALREADY_EXISTS')
      return NextResponse.json(
        { error: errorResponse.error, message: errorResponse.message },
        { status: errorResponse.statusCode }
      )
    }
    
    // 성공
    return NextResponse.json({ success: true })
    
  } catch (error) {
    logAuthError('signup', error)
    
    const errorResponse = createAuthErrorResponse('UNKNOWN_ERROR')
    return NextResponse.json(
      { error: errorResponse.error, message: errorResponse.message },
      { status: errorResponse.statusCode }
    )
  }
}
```

### NextAuth authorize에서 사용

```javascript
async authorize(credentials) {
  try {
    if (!credentials?.email) {
      throw new Error(AUTH_ERRORS.MISSING_CREDENTIALS.message)
    }
    
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    })
    
    if (!user) {
      throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS.message)
    }
    
    if (user.status === 'DELETED') {
      throw new Error(AUTH_ERRORS.ACCOUNT_DELETED.message)
    }
    
    // ...
  } catch (error) {
    logAuthError('authorize', error, {
      email: credentials?.email
    })
    throw error
  }
}
```

### 클라이언트에서 에러 처리

```javascript
const handleLogin = async () => {
  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    
    if (result?.error) {
      // NextAuth는 authorize에서 throw한 에러 메시지를 전달
      setError(result.error)
    }
  } catch (error) {
    setError('로그인 중 오류가 발생했습니다.')
  }
}
```

---

## 에러 코드 체계

### 코드 형식

`AUTH_XXX` 형식으로 구성됩니다.

- `AUTH_001` ~ `AUTH_099`: 인증 관련
- `AUTH_100` ~ `AUTH_199`: 세션 관련
- `AUTH_200` ~ `AUTH_299`: 권한 관련
- `AUTH_300` ~ `AUTH_399`: 회원가입 관련
- `AUTH_999`: 알 수 없는 에러

### HTTP 상태 코드 매핑

| HTTP 상태 | 의미 | 예시 |
|-----------|------|------|
| 400 | Bad Request | 입력값 오류, 형식 오류 |
| 401 | Unauthorized | 인증 필요, 세션 만료 |
| 403 | Forbidden | 계정 정지, 권한 없음 |
| 409 | Conflict | 이메일 중복 |
| 429 | Too Many Requests | 시도 횟수 초과 |
| 500 | Internal Server Error | 서버 오류 |
| 503 | Service Unavailable | DB 연결 실패 |

---

## 유효성 검사 헬퍼

**파일 위치:** `src/lib/exceptions/validation-helpers.js`

### validateEmail

```javascript
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: '이메일을 입력해주세요' }
  }

  const trimmed = email.trim()
  if (trimmed.length === 0) {
    return { valid: false, error: '이메일을 입력해주세요' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: '올바른 이메일 형식이 아닙니다' }
  }

  if (trimmed.length > 255) {
    return { valid: false, error: '이메일이 너무 깁니다 (최대 255자)' }
  }

  return { valid: true }
}
```

### validatePassword

```javascript
export function validatePassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecialChars = false
  } = options

  if (!password || typeof password !== 'string') {
    return { valid: false, error: '비밀번호를 입력해주세요' }
  }

  if (password.length < minLength) {
    return { valid: false, error: `비밀번호는 최소 ${minLength}자 이상이어야 합니다` }
  }

  if (password.length > 128) {
    return { valid: false, error: '비밀번호가 너무 깁니다 (최대 128자)' }
  }

  // 옵션에 따른 추가 검증...
  
  return { valid: true }
}
```

### validateName

```javascript
export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: '이름을 입력해주세요' }
  }

  const trimmed = name.trim()
  if (trimmed.length < 2) {
    return { valid: false, error: '이름은 최소 2자 이상이어야 합니다' }
  }

  if (trimmed.length > 50) {
    return { valid: false, error: '이름이 너무 깁니다 (최대 50자)' }
  }

  return { valid: true }
}
```

### sanitizeEmail / sanitizeInput

```javascript
export function sanitizeEmail(email) {
  return email?.trim().toLowerCase() || ''
}

export function sanitizeInput(input) {
  return input?.trim() || ''
}
```

---

## 모범 사례

### 1. 일관된 에러 응답 형식

```json
{
  "error": "AUTH_XXX",
  "message": "사용자 친화적 메시지"
}
```

### 2. 보안 고려

- 사용자 존재 여부를 노출하지 않음
- "이메일 또는 비밀번호가 일치하지 않습니다" 사용

### 3. 상세 로깅

```javascript
logAuthError('context', error, {
  userId: '...',
  email: '...',
  action: '...'
})
```

### 4. 에러 코드 사용

클라이언트에서 에러 코드를 기반으로 적절한 처리가 가능합니다.

```javascript
if (error.code === 'AUTH_006') {
  // 로그인 페이지로 리다이렉트
  router.push('/sign-in')
} else if (error.code === 'AUTH_005') {
  // 정지된 계정 안내
  showSuspendedAccountModal()
}
```

