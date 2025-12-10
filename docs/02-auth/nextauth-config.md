# NextAuth 설정 가이드

## 개요

NextAuth.js v4 기반의 인증 설정에 대한 상세 문서입니다.

**파일 위치:** `src/lib/auth.js`

---

## NextAuth 콜백 플로우

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      NextAuth 인증 플로우                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                       로그인 요청                                 │   │
│  │                                                                   │   │
│  │   signIn('credentials', { email, password })                      │   │
│  │                                                                   │   │
│  └────────────────────────────┬──────────────────────────────────────┘   │
│                               │                                          │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    1. authorize() 콜백                            │   │
│  │                                                                   │   │
│  │   • 이메일/비밀번호 검증                                         │   │
│  │   • 사용자 조회 (DB)                                             │   │
│  │   • bcrypt 비밀번호 비교                                         │   │
│  │   • 계정 상태 확인 (ACTIVE/SUSPENDED/DELETED)                    │   │
│  │   • 정지 기간 만료 시 자동 해제                                  │   │
│  │   • AdminRole 조회                                               │   │
│  │                                                                   │   │
│  │   반환: { id, email, name, role, status, isAdmin, ... }          │   │
│  │                                                                   │   │
│  └────────────────────────────┬──────────────────────────────────────┘   │
│                               │                                          │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     2. signIn() 콜백                              │   │
│  │                                                                   │   │
│  │   • OAuth 로그인 시 추가 처리 (현재 미구현)                       │   │
│  │   • Credentials 로그인은 authorize에서 처리됨                     │   │
│  │                                                                   │   │
│  │   반환: true (로그인 허용) / false (로그인 거부)                  │   │
│  │                                                                   │   │
│  └────────────────────────────┬──────────────────────────────────────┘   │
│                               │                                          │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      3. jwt() 콜백                                │   │
│  │                                                                   │   │
│  │   초기 로그인 시 (user 객체 존재):                                │   │
│  │   • token.id = user.id                                            │   │
│  │   • token.email = user.email                                      │   │
│  │   • token.isAdmin = user.isAdmin                                  │   │
│  │   • token.adminRole = user.adminRole                              │   │
│  │   • ... 기타 필드                                                 │   │
│  │                                                                   │   │
│  │   세션 갱신 시 (trigger === "update"):                            │   │
│  │   • 업데이트된 필드만 갱신                                        │   │
│  │                                                                   │   │
│  │   반환: token (JWT 페이로드)                                      │   │
│  │                                                                   │   │
│  └────────────────────────────┬──────────────────────────────────────┘   │
│                               │                                          │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    4. session() 콜백                              │   │
│  │                                                                   │   │
│  │   • DB에서 최신 AdminRole 조회                                    │   │
│  │   • DB에서 최신 User 정보 조회                                    │   │
│  │   • session.user 객체 구성                                        │   │
│  │   • 계정 상태 재확인 (DELETED, SUSPENDED)                         │   │
│  │                                                                   │   │
│  │   반환: session 객체 (클라이언트에 전달)                          │   │
│  │                                                                   │   │
│  └────────────────────────────┬──────────────────────────────────────┘   │
│                               │                                          │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    5. redirect() 콜백                             │   │
│  │                                                                   │   │
│  │   로그인 성공 시:                                                 │   │
│  │   • AdminRole 확인                                                │   │
│  │   • 관리자 → /admin으로 리다이렉트                                │   │
│  │   • 일반 사용자 → /dashboard로 리다이렉트                         │   │
│  │                                                                   │   │
│  │   로그아웃 시:                                                    │   │
│  │   • 기본 baseUrl 또는 지정된 URL로 리다이렉트                     │   │
│  │                                                                   │   │
│  │   반환: 리다이렉트 URL 문자열                                     │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 세션/토큰 생성 흐름

```
┌─────────┐   ┌───────────┐   ┌──────────┐   ┌─────────┐   ┌──────────┐
│ Client  │   │ authorize │   │   jwt    │   │ session │   │ redirect │
└────┬────┘   └─────┬─────┘   └────┬─────┘   └────┬────┘   └────┬─────┘
     │              │              │              │              │
     │   signIn()   │              │              │              │
     │─────────────>│              │              │              │
     │              │              │              │              │
     │              │  user 객체   │              │              │
     │              │─────────────>│              │              │
     │              │              │              │              │
     │              │              │  token       │              │
     │              │              │─────────────>│              │
     │              │              │              │              │
     │              │              │              │  session     │
     │              │              │              │─────────────>│
     │              │              │              │              │
     │              │              │              │              │  URL
     │<────────────────────────────────────────────────────────────│
     │              │              │              │              │
     │  쿠키 설정   │              │              │              │
     │  (JWT)       │              │              │              │
     │              │              │              │              │
```

---

## 기본 설정

### authOptions 객체

```javascript
export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [ ... ],
  session: { ... },
  cookies: { ... },
  pages: { ... },
  callbacks: { ... },
}
```

---

## Adapter

Prisma Adapter를 사용하여 데이터베이스와 연동합니다.

```javascript
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

adapter: PrismaAdapter(prisma)
```

---

## Providers

### Credentials Provider

이메일/비밀번호 기반 인증을 제공합니다.

```javascript
CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials) {
    // 인증 로직
  }
})
```

### authorize 함수 상세

```javascript
async authorize(credentials) {
  // 1. 입력값 검증
  if (!credentials?.email || !credentials?.password) {
    throw new Error('이메일과 비밀번호를 입력해주세요')
  }

  // 이메일 정제 및 검증
  const email = sanitizeEmail(credentials.email)
  const emailValidation = validateEmail(email)
  if (!emailValidation.valid) {
    throw new Error('올바른 이메일 형식이 아닙니다')
  }

  // 2. 사용자 조회
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error('이메일 또는 비밀번호가 일치하지 않습니다')
  }

  // 3. 소셜 로그인 계정 체크
  if (!user.password) {
    throw new Error('소셜 로그인 계정입니다')
  }

  // 4. 비밀번호 검증
  const isValid = await bcrypt.compare(credentials.password, user.password)
  if (!isValid) {
    throw new Error('이메일 또는 비밀번호가 일치하지 않습니다')
  }

  // 5. 계정 상태 확인
  if (user.status === "DELETED") {
    throw new Error('삭제된 계정입니다')
  }

  // 정지 상태 확인 및 기간 만료 체크
  if (user.status === "SUSPENDED") {
    if (user.suspendedUntil && new Date(user.suspendedUntil) < new Date()) {
      // 정지 기간 만료 - 자동 해제
      await prisma.user.update({
        where: { id: user.id },
        data: {
          status: 'ACTIVE',
          suspendedUntil: null,
          suspendReason: null,
        }
      })
      user.status = 'ACTIVE'
    } else {
      // 아직 정지 중
      throw new Error('계정이 정지되었습니다')
    }
  }

  // 6. 활동 제한 확인
  let restrictedActions = user.restrictedActions || []
  if (user.restrictedUntil && new Date(user.restrictedUntil) < new Date()) {
    // 제한 기간 만료 - 자동 해제
    await prisma.user.update({
      where: { id: user.id },
      data: {
        restrictedUntil: null,
        restrictedActions: [],
      }
    })
    restrictedActions = []
  }

  // 7. 관리자 권한 확인
  const adminRole = await prisma.adminRole.findUnique({
    where: { userId: user.id }
  })
  
  const isAdmin = adminRole && (
    !adminRole.expiresAt || new Date(adminRole.expiresAt) > new Date()
  )

  // 8. lastLoginAt 업데이트
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  })

  // 9. 사용자 정보 반환
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.avatar,  // base64 제외, URL만
    role: user.role,
    status: user.status,
    provider: user.provider,
    isAdmin,
    adminRole: adminRole?.role || null,
    restrictedActions,
    restrictedUntil: user.restrictedUntil,
  }
}
```

---

## Session 설정

```javascript
session: {
  strategy: "jwt",           // JWT 기반 세션
  maxAge: 24 * 60 * 60,      // 24시간 (1일)
  updateAge: 0,              // 세션 갱신 비활성화
}
```

### 설정 설명

| 옵션 | 값 | 설명 |
|------|-----|------|
| strategy | "jwt" | 서버리스 환경에 적합한 JWT 방식 |
| maxAge | 86400 (24시간) | 세션 유효 기간 |
| updateAge | 0 | 세션 갱신 없음 (고정 만료) |

---

## Cookies 설정

```javascript
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: undefined,  // 브라우저 세션 쿠키
    },
  },
}
```

### 설정 설명

| 옵션 | 값 | 설명 |
|------|-----|------|
| httpOnly | true | JavaScript에서 접근 불가 |
| sameSite | 'lax' | CSRF 보호 |
| secure | production만 true | HTTPS에서만 전송 |
| maxAge | undefined | 브라우저 닫으면 삭제 |

---

## Pages 설정

```javascript
pages: {
  signIn: "/sign-in",
  signOut: "/sign-out",
  error: "/sign-in",
}
```

커스텀 인증 페이지 경로 지정

---

## Callbacks

### jwt Callback

JWT 토큰 생성 및 업데이트 시 호출됩니다.

```javascript
async jwt({ token, user, trigger, session }) {
  // 초기 로그인 시 (user 객체 존재)
  if (user) {
    token.id = user.id
    token.email = user.email
    token.name = user.name
    token.role = user.role
    token.status = user.status
    token.provider = user.provider
    token.isAdmin = user.isAdmin
    token.adminRole = user.adminRole
    token.restrictedActions = user.restrictedActions || []
    token.restrictedUntil = user.restrictedUntil
  }

  // 세션 업데이트 시 (update() 호출)
  if (trigger === "update" && session) {
    token.name = session.name || token.name
  }

  return token
}
```

### session Callback

클라이언트에 전달할 세션 객체를 구성합니다.

```javascript
async session({ session, token }) {
  // 기본 정보 (토큰에서)
  session.user = {
    id: token.id,
    email: token.email,
    name: token.name,
    image: null,
    isAdmin: false,
    adminRole: null,
  }

  // DB에서 최신 정보 조회
  const [adminRole, user] = await Promise.all([
    prisma.adminRole.findUnique({ where: { userId: token.id } }),
    prisma.user.findUnique({ where: { id: token.id } })
  ])

  // 관리자 권한 설정
  if (adminRole && (!adminRole.expiresAt || new Date(adminRole.expiresAt) > new Date())) {
    session.user.isAdmin = true
    session.user.adminRole = adminRole.role
  }

  // 사용자 정보 설정
  if (user) {
    session.user.image = user.avatar  // base64 제외
    session.user.status = user.status
    session.user.role = user.role
    session.user.provider = user.provider
    session.user.restrictedActions = user.restrictedActions || []
    session.user.restrictedUntil = user.restrictedUntil

    // 계정 상태 확인
    if (user.status === 'DELETED' || user.status === 'SUSPENDED') {
      throw new Error('계정 접근 불가')
    }
  }

  return session
}
```

### signIn Callback

로그인 성공 시 호출됩니다.

```javascript
async signIn({ user, account, profile }) {
  // OAuth 로그인 시 처리
  if (account?.provider === "google" || account?.provider === "github") {
    // OAuth 사용자 처리 로직 (추후 구현)
    return true
  }

  // Credentials 로그인은 authorize에서 처리됨
  return true
}
```

### redirect Callback

리다이렉트 URL을 결정합니다.

```javascript
async redirect({ url, baseUrl, token }) {
  // 로그인 성공 시 관리자 분기
  if (token?.id) {
    const adminRole = await prisma.adminRole.findUnique({
      where: { userId: token.id }
    })
    
    const isAdmin = adminRole && (
      !adminRole.expiresAt || new Date(adminRole.expiresAt) > new Date()
    )
    
    if (isAdmin) {
      return baseUrl + "/admin"
    } else {
      return baseUrl + "/dashboard"
    }
  }

  // 기본 리다이렉트 처리
  if (url.startsWith("/")) return `${baseUrl}${url}`
  else if (new URL(url).origin === baseUrl) return url
  return baseUrl
}
```

---

## 세션 타입 정의

### JWT Token

```typescript
interface JWT {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'
  provider: 'CREDENTIALS' | 'GOOGLE' | 'GITHUB'
  isAdmin: boolean
  adminRole: 'VIEWER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN' | null
  restrictedActions: string[]
  restrictedUntil: Date | null
  iat: number  // issued at
  exp: number  // expires
  jti: string  // JWT ID
}
```

### Session

```typescript
interface Session {
  user: {
    id: string
    email: string
    name: string
    image: string | null
    role: 'USER' | 'ADMIN'
    status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'
    provider: 'CREDENTIALS' | 'GOOGLE' | 'GITHUB'
    isAdmin: boolean
    adminRole: 'VIEWER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN' | null
    restrictedActions: string[]
    restrictedUntil: Date | null
  }
  expires: string  // ISO 8601
}
```

---

## 환경 변수

```env
# 필수
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# 선택 (소셜 로그인)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# 데이터베이스
DATABASE_URL=postgresql://...
```

---

## 보안 고려사항

### 1. 비밀번호 보안

- bcrypt로 해싱 (salt rounds: 10)
- 평문 비밀번호는 저장되지 않음

### 2. 세션 보안

- JWT는 서버 사이드에서만 검증
- httpOnly 쿠키로 XSS 방지
- sameSite: 'lax'로 CSRF 방지

### 3. 에러 메시지 보안

- 사용자 존재 여부를 숨기는 일관된 메시지 사용
- "이메일 또는 비밀번호가 일치하지 않습니다"

### 4. 계정 상태 관리

- 정지/삭제된 계정은 로그인 차단
- 세션 콜백에서 실시간 상태 확인

### 5. 자동 제재 해제

- 정지 기간 만료 시 자동 활성화
- 활동 제한 기간 만료 시 자동 해제

---

## 디버깅

### 로그 확인

authorize 함수에서 상세 로그를 출력합니다:

```
🔐 [AUTH] authorize 시작
🔐 [AUTH] credentials: { email: 'user@example.com', hasPassword: true }
🔍 [AUTH] 사용자 조회 중: user@example.com
✅ [AUTH] 사용자 발견: { id: '...', email: '...', status: 'ACTIVE' }
🔑 [AUTH] 비밀번호 검증 중...
🔑 [AUTH] 비밀번호 검증 결과: true
🔍 [AUTH] 관리자 권한 확인 중...
👤 [AUTH] 관리자 여부: ❌ 일반 사용자
✅ [AUTH] 로그인 성공, lastLoginAt 업데이트 중...
✅ [AUTH] authorize 완료
```

### 일반적인 문제

1. **세션이 유지되지 않음**
   - NEXTAUTH_SECRET 확인
   - 쿠키 설정 확인

2. **관리자 페이지 접근 불가**
   - AdminRole 테이블 확인
   - expiresAt 만료 확인

3. **로그인 후 리다이렉트 오류**
   - redirect 콜백 로그 확인
   - baseUrl 설정 확인

---

## 관련 파일

- `middleware.js` - 라우트 보호
- `src/lib/auth-helpers.js` - 인증 헬퍼 함수
- `src/lib/exceptions/auth-errors.js` - 에러 정의
- `src/app/providers.js` - SessionProvider 설정

