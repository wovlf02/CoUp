# 인증/인가 도메인 (Authentication & Authorization)

## 개요

CoUp 프로젝트의 인증/인가 시스템은 **NextAuth.js v4**를 기반으로 구현되어 있습니다.
JWT 기반 세션 관리, 이메일/비밀번호 로그인, 그리고 소셜 로그인(Google, GitHub - 미구현)을 지원합니다.

### 주요 특징

- **JWT 기반 세션**: 서버리스 환경에 최적화된 세션 관리
- **Credentials Provider**: 이메일/비밀번호 기반 인증
- **관리자 권한 분리**: `AdminRole` 테이블을 통한 관리자 권한 관리
- **계정 상태 관리**: ACTIVE, SUSPENDED, DELETED 상태 지원
- **자동 정지 해제**: 정지 기간 만료 시 자동 활성화

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              클라이언트                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │  로그인     │    │  회원가입   │    │  보호된     │                  │
│  │  페이지     │    │  페이지     │    │  페이지     │                  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                  │
│         │                  │                  │                          │
│         └──────────────────┼──────────────────┘                          │
│                            │                                             │
│                   useSession() / signIn() / signOut()                    │
│                            │                                             │
└────────────────────────────┼─────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Next.js 서버                                   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      middleware.js                               │    │
│  │  • 경로 보호 (공개/보호/관리자)                                  │    │
│  │  • 세션 토큰 확인                                                │    │
│  │  • 계정 상태 확인 (DELETED, SUSPENDED)                           │    │
│  └───────────────────────────┬─────────────────────────────────────┘    │
│                              │                                           │
│  ┌───────────────────────────┼─────────────────────────────────────┐    │
│  │                    API Routes                                    │    │
│  │                              │                                   │    │
│  │  ┌──────────────┐  ┌────────┴───────┐  ┌──────────────────┐     │    │
│  │  │ /api/auth/   │  │ /api/auth/     │  │ /api/auth/       │     │    │
│  │  │ [...nextauth]│  │ signup         │  │ me               │     │    │
│  │  │              │  │                │  │                  │     │    │
│  │  │ • 로그인     │  │ • 회원가입     │  │ • 사용자 정보    │     │    │
│  │  │ • 로그아웃   │  │ • 비밀번호     │  │ • AdminRole      │     │    │
│  │  │ • 세션 관리  │  │   해싱         │  │   확인           │     │    │
│  │  └──────┬───────┘  └────────────────┘  └──────────────────┘     │    │
│  │         │                                                        │    │
│  └─────────┼────────────────────────────────────────────────────────┘    │
│            │                                                             │
│  ┌─────────┴─────────────────────────────────────────────────────┐      │
│  │                       lib/auth.js                              │      │
│  │  • CredentialsProvider                                         │      │
│  │  • JWT 콜백 (토큰 생성/갱신)                                   │      │
│  │  • Session 콜백 (세션 구성)                                    │      │
│  │  • Redirect 콜백 (관리자 분기)                                 │      │
│  └───────────────────────────┬───────────────────────────────────┘      │
│                              │                                           │
└──────────────────────────────┼───────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL (Prisma)                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │      User        │  │    AdminRole     │  │    Sanction      │       │
│  │                  │  │                  │  │                  │       │
│  │ • email          │  │ • userId (FK)    │  │ • userId (FK)    │       │
│  │ • password       │  │ • role           │  │ • type           │       │
│  │ • status         │◄─┤ • permissions    │  │ • isActive       │       │
│  │ • provider       │  │ • expiresAt      │  │ • expiresAt      │       │
│  │ • restrictedActions                    │  │                  │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 인증 플로우

### 로그인 플로우

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────┐
│  사용자  │     │   로그인 폼   │     │  NextAuth    │     │   DB     │
└────┬─────┘     └───────┬───────┘     └──────┬───────┘     └────┬─────┘
     │                   │                     │                  │
     │  이메일/비밀번호  │                     │                  │
     │──────────────────>│                     │                  │
     │                   │                     │                  │
     │                   │  signIn('credentials')                 │
     │                   │────────────────────>│                  │
     │                   │                     │                  │
     │                   │                     │  사용자 조회     │
     │                   │                     │─────────────────>│
     │                   │                     │                  │
     │                   │                     │  User 데이터     │
     │                   │                     │<─────────────────│
     │                   │                     │                  │
     │                   │                     │  bcrypt 비교     │
     │                   │                     │  (비밀번호 검증) │
     │                   │                     │                  │
     │                   │                     │  AdminRole 조회  │
     │                   │                     │─────────────────>│
     │                   │                     │                  │
     │                   │                     │  AdminRole 데이터│
     │                   │                     │<─────────────────│
     │                   │                     │                  │
     │                   │  JWT 토큰 (쿠키)    │                  │
     │                   │<────────────────────│                  │
     │                   │                     │                  │
     │                   │  관리자 확인        │                  │
     │                   │  (/api/auth/me)     │                  │
     │                   │────────────────────>│                  │
     │                   │                     │                  │
     │                   │  isAdmin 여부       │                  │
     │                   │<────────────────────│                  │
     │                   │                     │                  │
     │  리다이렉트       │                     │                  │
     │  (/admin 또는     │                     │                  │
     │   /dashboard)     │                     │                  │
     │<──────────────────│                     │                  │
     │                   │                     │                  │
```

### 회원가입 플로우

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────┐
│  사용자  │     │  회원가입 폼  │     │   API        │     │   DB     │
└────┬─────┘     └───────┬───────┘     └──────┬───────┘     └────┬─────┘
     │                   │                     │                  │
     │  폼 입력          │                     │                  │
     │  (이름, 이메일,   │                     │                  │
     │   비밀번호, 사진) │                     │                  │
     │──────────────────>│                     │                  │
     │                   │                     │                  │
     │                   │  [선택] 이미지 업로드                  │
     │                   │  POST /api/upload   │                  │
     │                   │────────────────────>│                  │
     │                   │                     │                  │
     │                   │  avatarUrl          │                  │
     │                   │<────────────────────│                  │
     │                   │                     │                  │
     │                   │  POST /api/auth/signup                 │
     │                   │────────────────────>│                  │
     │                   │                     │                  │
     │                   │                     │  이메일 중복 확인│
     │                   │                     │─────────────────>│
     │                   │                     │                  │
     │                   │                     │  결과            │
     │                   │                     │<─────────────────│
     │                   │                     │                  │
     │                   │                     │  bcrypt 해싱     │
     │                   │                     │  (비밀번호)      │
     │                   │                     │                  │
     │                   │                     │  User 생성       │
     │                   │                     │─────────────────>│
     │                   │                     │                  │
     │                   │                     │  Created User    │
     │                   │                     │<─────────────────│
     │                   │                     │                  │
     │                   │  success: true      │                  │
     │                   │<────────────────────│                  │
     │                   │                     │                  │
     │                   │  signIn('credentials') - 자동 로그인   │
     │                   │────────────────────>│                  │
     │                   │                     │                  │
     │  리다이렉트       │                     │                  │
     │  (/dashboard)     │                     │                  │
     │<──────────────────│                     │                  │
     │                   │                     │                  │
```

### 세션 검증 플로우

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────┐
│  사용자  │     │   클라이언트  │     │   API        │     │   DB     │
└────┬─────┘     └───────┬───────┘     └──────┬───────┘     └────┬─────┘
     │                   │                     │                  │
     │  페이지 방문      │                     │                  │
     │──────────────────>│                     │                  │
     │                   │                     │                  │
     │                   │  useSession()       │                  │
     │                   │  status 확인        │                  │
     │                   │                     │                  │
     │                   │  [authenticated]    │                  │
     │                   │  GET /api/auth/     │                  │
     │                   │  validate-session   │                  │
     │                   │────────────────────>│                  │
     │                   │                     │                  │
     │                   │                     │  User 조회       │
     │                   │                     │─────────────────>│
     │                   │                     │                  │
     │                   │                     │  User (status)   │
     │                   │                     │<─────────────────│
     │                   │                     │                  │
     │                   │                     │  status 확인     │
     │                   │                     │  ACTIVE/         │
     │                   │                     │  SUSPENDED/      │
     │                   │                     │  DELETED         │
     │                   │                     │                  │
     │                   │  { valid: true }    │                  │
     │                   │  또는               │                  │
     │                   │  { valid: false,    │                  │
     │                   │    shouldLogout }   │                  │
     │                   │<────────────────────│                  │
     │                   │                     │                  │
     │                   │  [shouldLogout]     │                  │
     │                   │  signOut()          │                  │
     │                   │  queryClient.clear()│                  │
     │                   │                     │                  │
     │  리다이렉트       │                     │                  │
     │  (/sign-in)       │                     │                  │
     │<──────────────────│                     │                  │
     │                   │                     │                  │
```

---

## 디렉토리 구조

```
coup/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # 인증 라우트 그룹
│   │   │   ├── layout.jsx             # 인증 페이지 레이아웃
│   │   │   ├── sign-in/
│   │   │   │   └── page.jsx           # 로그인 페이지
│   │   │   └── sign-up/
│   │   │       └── page.jsx           # 회원가입 페이지
│   │   ├── api/auth/                  # 인증 API 라우트
│   │   │   ├── [...nextauth]/route.js # NextAuth 핸들러
│   │   │   ├── signup/route.js        # 회원가입 API
│   │   │   ├── me/route.js            # 현재 사용자 정보 API
│   │   │   ├── validate-session/route.js # 세션 검증 API
│   │   │   └── verify/route.js        # 시그널링 서버 인증 API
│   │   └── providers.js               # SessionProvider 설정
│   ├── lib/
│   │   ├── auth.js                    # NextAuth 설정
│   │   ├── auth-helpers.js            # 인증 헬퍼 함수
│   │   ├── jwt.js                     # JWT 유틸리티
│   │   ├── session-provider.jsx       # 클라이언트 SessionProvider
│   │   └── exceptions/
│   │       ├── auth-errors.js         # 인증 에러 정의
│   │       └── validation-helpers.js  # 유효성 검사 헬퍼
│   └── styles/auth/
│       ├── sign-in.module.css         # 로그인 스타일
│       └── sign-up.module.css         # 회원가입 스타일
├── middleware.js                      # 라우트 보호 미들웨어
└── prisma/schema.prisma               # User, AdminRole 모델
```

---

## 데이터베이스 모델

### User 모델

```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String?  // OAuth 사용자는 null
  name     String?
  avatar   String?
  bio      String?
  provider Provider @default(CREDENTIALS)
  role     UserRole @default(USER)

  // 소셜 로그인
  googleId String? @unique
  githubId String? @unique

  // 상태
  status         UserStatus @default(ACTIVE)
  suspendedUntil DateTime?
  suspendReason  String?

  // 활동 제한
  restrictedUntil   DateTime?
  restrictedActions String[]  @default([])

  // 타임스탬프
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastLoginAt DateTime?

  adminRole AdminRole?
  // ... 기타 관계
}

enum Provider {
  CREDENTIALS
  GOOGLE
  GITHUB
}

enum UserRole {
  USER
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

### AdminRole 모델

```prisma
model AdminRole {
  id          String        @id @default(cuid())
  userId      String        @unique
  role        AdminRoleType
  permissions Json          // 세부 권한 JSON
  grantedBy   String
  grantedAt   DateTime      @default(now())
  expiresAt   DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum AdminRoleType {
  VIEWER       // 조회만 가능
  MODERATOR    // 콘텐츠 모더레이션
  ADMIN        // 사용자/스터디 관리
  SUPER_ADMIN  // 모든 권한
}
```

---

## 페이지 컴포넌트

### 인증 레이아웃 - `(auth)/layout.jsx`

```jsx
export const metadata = {
  title: '로그인 - CoUp',
  description: 'CoUp에 로그인하고 스터디를 시작하세요',
}

export default function AuthLayout({ children }) {
  return children
}
```

- 인증 페이지 전용 레이아웃 (헤더/사이드바 없음)
- SEO 메타데이터 설정

### 로그인 페이지 - `sign-in/page.jsx`

**주요 기능:**
- 이메일/비밀번호 로그인 폼
- 폼 유효성 검증 (이메일 형식, 비밀번호 8자 이상)
- 비밀번호 표시/숨기기 토글
- 소셜 로그인 버튼 (Google, GitHub - 미구현)
- 세션 유효성 검증 (이미 로그인된 경우)
- 세션 초기화 기능 (문제 해결용)

**상태 관리:**
```jsx
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [showPassword, setShowPassword] = useState(false)
const [loading, setLoading] = useState(null)  // 'credentials' | 'google' | 'github' | null
const [error, setError] = useState(null)
const [formErrors, setFormErrors] = useState({})
```

**로그인 플로우:**
1. 폼 유효성 검증
2. NextAuth `signIn('credentials')` 호출
3. 세션 정보 확인
4. 관리자 권한 확인 (`/api/auth/me`)
5. 관리자면 `/admin`, 일반 사용자는 `/dashboard`로 리다이렉트

**에러 처리:**
```jsx
const errorParam = searchParams.get('error')
const [error, setError] = useState(
  errorParam === 'account-deleted' ? '삭제된 계정입니다.' :
  errorParam === 'account-suspended' ? '정지된 계정입니다.' :
  errorParam === 'CredentialsSignin' ? '이메일 또는 비밀번호가 일치하지 않습니다.' :
  null
)
```

### 회원가입 페이지 - `sign-up/page.jsx`

**주요 기능:**
- 이메일/비밀번호 회원가입 폼
- 프로필 사진 업로드 (선택)
- 비밀번호 강도 표시 (weak, medium, strong)
- 비밀번호 확인
- 이용약관 동의 안내

**상태 관리:**
```jsx
const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [confirmPassword, setConfirmPassword] = useState('')
const [avatar, setAvatar] = useState(null)
const [avatarPreview, setAvatarPreview] = useState(null)
const [passwordStrength, setPasswordStrength] = useState(null)
```

**비밀번호 강도 계산:**
```jsx
const calculatePasswordStrength = (pwd) => {
  if (pwd.length < 8) return 'weak'
  
  let strength = 0
  if (/[a-z]/.test(pwd)) strength++
  if (/[A-Z]/.test(pwd)) strength++
  if (/[0-9]/.test(pwd)) strength++
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++
  
  if (strength >= 3 && pwd.length >= 12) return 'strong'
  if (strength >= 2 && pwd.length >= 8) return 'medium'
  return 'weak'
}
```

**회원가입 플로우:**
1. 폼 유효성 검증
2. 프로필 사진 업로드 (`/api/upload`)
3. 회원가입 API 호출 (`/api/auth/signup`)
4. 자동 로그인 (`signIn('credentials')`)
5. 대시보드로 리다이렉트

**유효성 검증:**
- 이름: 2자 이상
- 이메일: 이메일 형식
- 비밀번호: 8자 이상, 영문/숫자/특수문자 중 2가지 이상
- 비밀번호 확인: 비밀번호와 일치
- 프로필 사진: 이미지 파일, 5MB 이하

---

## API 라우트

### NextAuth 핸들러 - `[...nextauth]/route.js`

```javascript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### 회원가입 - `signup/route.js`

**엔드포인트:** `POST /api/auth/signup`

**요청 바디:**
```json
{
  "email": "user@example.com",
  "password": "password123!",
  "name": "홍길동",
  "avatar": "https://..." // 선택
}
```

**응답:**
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다",
  "user": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

**처리 플로우:**
1. 요청 본문 파싱
2. 입력값 정제 (sanitize)
3. Zod 유효성 검사
4. 커스텀 유효성 검사
5. 이메일 중복 확인
6. 비밀번호 해싱 (bcrypt, salt 10)
7. 사용자 생성

### 현재 사용자 정보 - `me/route.js`

**엔드포인트:** `GET /api/auth/me`

**응답:**
```json
{
  "user": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "홍길동",
    "avatar": "https://...",
    "role": "USER",
    "bio": "",
    "status": "ACTIVE",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "adminRole": {
    "role": "ADMIN",
    "expiresAt": null,
    "isExpired": false
  }
}
```

### 세션 검증 - `validate-session/route.js`

**엔드포인트:** `GET /api/auth/validate-session`

**응답:**
```json
{
  "valid": true
}
```

또는

```json
{
  "valid": false,
  "error": "ACCOUNT_DELETED",
  "message": "삭제된 계정입니다",
  "shouldLogout": true
}
```

**검증 항목:**
1. 세션 존재 여부
2. DB에 사용자 존재 여부
3. 계정 상태 (ACTIVE, SUSPENDED, DELETED)

### 시그널링 서버 인증 - `verify/route.js`

**엔드포인트:** `POST /api/auth/verify`

**요청 바디:**
```json
{
  "userId": "cuid"
}
```

**응답:**
```json
{
  "success": true,
  "user": {
    "id": "cuid",
    "name": "홍길동",
    "email": "user@example.com",
    "avatar": "https://...",
    "status": "ACTIVE"
  }
}
```

---

## NextAuth 설정 - `lib/auth.js`

### 기본 설정

```javascript
export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) { ... }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1일
    updateAge: 0,         // 세션 갱신 비활성화
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: undefined, // 브라우저 세션 쿠키
      },
    },
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
    error: "/sign-in",
  },
  // ... callbacks
}
```

### authorize 함수 (Credentials Provider)

**처리 플로우:**
1. 입력값 검증 (이메일, 비밀번호)
2. 이메일 정제 및 형식 검증
3. 사용자 조회
4. 소셜 로그인 계정 체크
5. 비밀번호 검증 (bcrypt)
6. 계정 상태 확인
   - DELETED: 로그인 차단
   - SUSPENDED: 정지 기간 확인 → 만료 시 자동 해제
7. 활동 제한 확인 → 만료 시 자동 해제
8. 관리자 권한 조회
9. lastLoginAt 업데이트
10. 사용자 정보 반환

### JWT Callback

```javascript
async jwt({ token, user, trigger, session }) {
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
  return token
}
```

### Session Callback

```javascript
async session({ session, token }) {
  // 기본 정보 설정
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
    session.user.status = user.status
    session.user.role = user.role
    session.user.provider = user.provider
    session.user.image = user.avatar
    session.user.restrictedActions = user.restrictedActions || []
    session.user.restrictedUntil = user.restrictedUntil
  }

  return session
}
```

### Redirect Callback

```javascript
async redirect({ url, baseUrl, token }) {
  if (token?.id) {
    // 관리자 권한 확인
    const adminRole = await prisma.adminRole.findUnique({
      where: { userId: token.id }
    })
    
    const isAdmin = adminRole && (!adminRole.expiresAt || new Date(adminRole.expiresAt) > new Date())
    
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

## 헬퍼 함수 - `lib/auth-helpers.js`

### getSession

세션 가져오기 (Server Component용)

```javascript
export async function getSession() {
  try {
    const session = await getServerSession(authOptions)
    return session
  } catch (error) {
    console.error('getSession error:', error)
    return null
  }
}
```

### requireAuth

API Route에서 로그인 확인

```javascript
export async function requireAuth() {
  // 1. 세션 조회
  const session = await getServerSession(authOptions)
  
  // 2. 세션 검증
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { error: 'NO_SESSION', message: '로그인이 필요합니다' },
      { status: 401 }
    )
  }
  
  // 3. DB에서 사용자 확인
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })
  
  // 4. 계정 상태 확인
  if (user.status === 'DELETED') { ... }
  if (user.status === 'SUSPENDED') { ... }
  if (user.status !== 'ACTIVE') { ... }
  
  // 5. 사용자 정보 반환
  return { user: { ... } }
}
```

### requireStudyMember

스터디 멤버 권한 확인

```javascript
export async function requireStudyMember(studyId, minRole = 'MEMBER') {
  const result = await requireAuth()
  if (result instanceof NextResponse) return result
  
  const member = await prisma.studyMember.findUnique({
    where: { studyId_userId: { studyId, userId: result.user.id } }
  })
  
  // 역할 계층: MEMBER < ADMIN < OWNER
  const roleHierarchy = { MEMBER: 0, ADMIN: 1, OWNER: 2 }
  if (roleHierarchy[member.role] < roleHierarchy[minRole]) {
    return NextResponse.json({ error: "권한이 부족합니다" }, { status: 403 })
  }
  
  return { session: result, member }
}
```

### getCurrentUser

현재 사용자 상세 정보 조회

```javascript
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      bio: true,
      role: true,
      status: true,
      provider: true,
      createdAt: true,
      lastLoginAt: true
    }
  })
  
  return user
}
```

---

## JWT 유틸리티 - `lib/jwt.js`

```javascript
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'

// Access Token 생성 (15분)
export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
}

// Refresh Token 생성 (랜덤 문자열)
export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex')
}

// Access Token 검증
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// 호환성 함수
export function signJWT(payload) {
  return signAccessToken(payload)
}

export function verifyJWT(token) {
  return verifyAccessToken(token)
}
```

---

## 미들웨어 - `middleware.js`

### 설정

```javascript
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token
    
    // 공개 경로 정의
    const publicPaths = ['/', '/sign-in', '/sign-up', '/privacy', '/terms']
    
    // API 경로는 각 Route Handler에서 처리
    if (pathname.startsWith('/api/')) {
      return NextResponse.next()
    }
    
    // 관리자 페이지 접근 체크
    if (pathname.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/sign-in?callbackUrl=' + encodeURIComponent(pathname), req.url))
      }
    }
    
    // 계정 상태 확인
    if (token?.status === 'DELETED') {
      return NextResponse.redirect(new URL('/sign-in?error=account-deleted', req.url))
    }
    if (token?.status === 'SUSPENDED') {
      return NextResponse.redirect(new URL('/sign-in?error=account-suspended', req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl
        const publicPaths = ['/', '/sign-in', '/sign-up', '/privacy', '/terms']
        
        if (publicPaths.includes(pathname)) return true
        if (pathname.startsWith('/api/')) return true
        
        return !!token
      }
    },
    pages: {
      signIn: '/sign-in',
    }
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 경로 분류

**공개 경로 (Public):**
- `/` - 랜딩 페이지
- `/sign-in` - 로그인
- `/sign-up` - 회원가입
- `/privacy` - 개인정보처리방침
- `/terms` - 이용약관

**보호된 경로 (Protected):**
- `/dashboard` - 대시보드
- `/my-studies` - 내 스터디
- `/tasks` - 할 일
- `/notifications` - 알림
- `/me` - 마이페이지
- `/settings` - 설정
- `/admin` - 관리자 (AdminRole 필요)

---

## 에러 처리 - `lib/exceptions/auth-errors.js`

### AuthError 클래스

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

### 에러 코드 정의

| 코드 | 에러명 | 메시지 | HTTP 상태 |
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
| AUTH_017 | JWT_GENERATION_ERROR | JWT 토큰 생성에 실패했습니다 | 500 |
| AUTH_018 | JWT_VERIFICATION_ERROR | JWT 토큰 검증에 실패했습니다 | 401 |
| AUTH_019 | TOKEN_EXPIRED | 토큰이 만료되었습니다 | 401 |

---

## 유효성 검사 - `lib/exceptions/validation-helpers.js`

### validateEmail

```javascript
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  // 최대 255자
  return { valid: boolean, error?: string }
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
  // 최대 128자
  return { valid: boolean, error?: string }
}
```

### validateName

```javascript
export function validateName(name) {
  // 최소 2자, 최대 50자
  return { valid: boolean, error?: string }
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

## Provider 설정 - `app/providers.js`

```javascript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}
```

---

## 세션 관리

### 세션 구조

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
  expires: string  // ISO 8601 형식
}
```

### 세션 설정

- **strategy**: JWT
- **maxAge**: 24시간 (1일)
- **updateAge**: 0 (세션 갱신 비활성화)
- **쿠키**: 브라우저 세션 쿠키 (브라우저 닫으면 삭제)

---

## 활동 제한

### 제한 가능한 활동

```javascript
restrictedActions: [
  'join_study',      // 스터디 가입
  'create_study',    // 스터디 생성
  'send_message',    // 메시지 전송
  'upload_file',     // 파일 업로드
]
```

### 제한 확인 방법

```javascript
// 세션에서 확인
if (session.user.restrictedActions.includes('send_message')) {
  // 메시지 전송 제한됨
}

// 제한 기간 확인
if (session.user.restrictedUntil && new Date(session.user.restrictedUntil) > new Date()) {
  // 아직 제한 중
}
```

---

## 클라이언트 사용법

### useSession Hook

```jsx
import { useSession } from 'next-auth/react'

function Component() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <Loading />
  if (status === 'unauthenticated') return <LoginButton />
  
  return <div>Welcome, {session.user.name}</div>
}
```

### signIn / signOut

```jsx
import { signIn, signOut } from 'next-auth/react'

// 로그인
await signIn('credentials', {
  email,
  password,
  redirect: false,
})

// 로그아웃
await signOut({ redirect: false })
```

### API 호출 시 인증

```javascript
// credentials: 'include'로 자동 인증
const response = await fetch('/api/protected-route', {
  credentials: 'include',
})

// 또는 api.js 유틸리티 사용
import api from '@/lib/api'
const data = await api.get('/api/protected-route')
```

---

## 보안 고려사항

1. **비밀번호 해싱**: bcrypt (salt 10)
2. **JWT 보안**: httpOnly, sameSite: 'lax', secure (production)
3. **CSRF 보호**: NextAuth 내장
4. **에러 메시지**: 사용자 존재 여부 노출 방지
5. **Rate Limiting**: AUTH_010 에러 코드 정의 (구현 필요)
6. **입력 정제**: XSS 방지를 위한 sanitize
7. **세션 무효화**: 계정 상태 변경 시 자동 로그아웃

---

## 관련 문서

- [React Query Hooks](../12-api/react-query-hooks.md) - `useMe` 등 인증 관련 Hook
- [API 개요](../12-api/README.md) - API 인증 방식
- [관리자 기능](../10-admin/README.md) - 관리자 권한 상세

