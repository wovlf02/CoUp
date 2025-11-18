# NextAuth.js 마이그레이션 설계 문서

## 📋 목차
1. [현재 상태 분석](#현재-상태-분석)
2. [NextAuth 도입 이유](#nextauth-도입-이유)
3. [아키텍처 설계](#아키텍처-설계)
4. [마이그레이션 전략](#마이그레이션-전략)
5. [구현 상세](#구현-상세)
6. [테스트 계획](#테스트-계획)
7. [Todo List](#todo-list)

---

## 현재 상태 분석

### 현재 인증 시스템 구조

#### 1. JWT 기반 인증
- **Access Token**: 15분 만료, HTTP-only 쿠키
- **Refresh Token**: 7일 만료, Redis 저장, HTTP-only 쿠키
- JWT Secret 기반 토큰 생성/검증

#### 2. 주요 파일 구조
```
coup/
├── middleware.js                           # 인증 미들웨어
├── src/
│   ├── lib/
│   │   ├── jwt.js                         # JWT 토큰 생성/검증
│   │   ├── redis.js                       # Refresh Token 저장
│   │   └── auth-helpers.js                # 인증 헬퍼 함수
│   └── app/
│       └── api/
│           └── auth/
│               ├── login/route.js         # 로그인
│               ├── signup/route.js        # 회원가입
│               ├── logout/route.js        # 로그아웃
│               ├── refresh/route.js       # 토큰 갱신
│               ├── me/route.js            # 현재 사용자
│               └── [...nextauth]/route.js # NextAuth 엔드포인트 (미사용)
```

#### 3. 현재 인증 플로우
```
1. 로그인 (/api/auth/login)
   → 이메일/비밀번호 검증
   → Access Token (JWT) + Refresh Token (Random) 생성
   → Redis에 Refresh Token 저장 (userId 매핑)
   → HTTP-only 쿠키로 토큰 전달

2. 인증 검증 (middleware.js)
   → Access Token 검증
   → 만료 시 Refresh Token으로 자동 갱신
   → 실패 시 로그인 페이지로 리다이렉트

3. API 인증 (auth-helpers.js)
   → requireAuth(): 토큰 검증 + 사용자 조회
   → requireAdmin(): 관리자 권한 확인
   → requireStudyMember(): 스터디 멤버십 확인
```

#### 4. 데이터베이스 스키마 (User 모델)
```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String? // null for OAuth users
  name     String?
  avatar   String?
  bio      String?
  provider Provider @default(CREDENTIALS)
  role     UserRole @default(USER)
  
  // 소셜 로그인 준비
  googleId String? @unique
  githubId String? @unique
  
  // 상태 관리
  status         UserStatus @default(ACTIVE)
  suspendedUntil DateTime?
  suspendReason  String?
  
  // 타임스탬프
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastLoginAt DateTime?
}

enum Provider {
  CREDENTIALS
  GOOGLE
  GITHUB
}

enum UserRole {
  USER
  ADMIN
  SYSTEM_ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

#### 5. 환경 변수
```env
JWT_SECRET="your-jwt-secret-key-here-min-32-characters"
NEXTAUTH_SECRET="your-jwt-secret-key-here-min-32-characters"
REFRESH_TOKEN_SECRET="your-refresh-token-secret-key-here-min-32-characters"
REDIS_URL="redis://localhost:6379"
DATABASE_URL="postgresql://..."
```

---

## NextAuth 도입 이유

### 장점
1. **표준화된 인증**: OAuth, Credentials 등 다양한 Provider 지원
2. **세션 관리**: 내장된 세션 관리 (JWT/Database 선택 가능)
3. **보안**: 검증된 보안 모범 사례 적용
4. **확장성**: Google, GitHub 등 소셜 로그인 쉽게 추가
5. **유지보수**: 커뮤니티 지원 및 지속적인 업데이트
6. **React Hooks**: useSession, signIn, signOut 등 편리한 클라이언트 API

### 고려사항
1. **기존 Redis 활용**: NextAuth는 기본적으로 JWT 또는 Database 세션 사용
   - 해결: Custom Adapter로 Redis 활용 유지
2. **Refresh Token**: NextAuth JWT는 자동 갱신하지만 Refresh Token 개념 없음
   - 해결: Custom JWT 콜백으로 Refresh Token 로직 유지
3. **역할 기반 접근 제어**: NextAuth 기본 기능에 없음
   - 해결: Custom Callback으로 role, status 추가

---

## 아키텍처 설계

### 1. NextAuth 구성

```typescript
// src/lib/auth.ts (신규)
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // Credentials Provider (이메일/비밀번호)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 기존 로그인 로직
      }
    }),
    
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  
  session: {
    strategy: "jwt", // JWT 세션 전략
    maxAge: 7 * 24 * 60 * 60, // 7일
  },
  
  callbacks: {
    // JWT 생성 시
    async jwt({ token, user, account }) {
      // 초기 로그인 시
      if (user) {
        token.userId = user.id
        token.role = user.role
        token.status = user.status
        token.provider = account?.provider || "credentials"
      }
      return token
    },
    
    // 세션 생성 시
    async session({ session, token }) {
      session.user.id = token.userId
      session.user.role = token.role
      session.user.status = token.status
      session.user.provider = token.provider
      return session
    },
    
    // 로그인 리다이렉트
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl + "/dashboard"
    },
  },
  
  pages: {
    signIn: "/sign-in",
    signOut: "/",
    error: "/sign-in",
  },
  
  events: {
    async signIn({ user }) {
      // lastLoginAt 업데이트
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })
    },
  },
})
```

### 2. 세션 전략

**JWT 전략 선택**
- Access Token은 NextAuth JWT로 관리 (자동 갱신)
- Refresh Token은 Redis에서 제거 (NextAuth JWT가 대체)
- 세션 만료: 7일 (자동 갱신)

**장점**:
- 서버리스 환경에서 효율적
- Redis 의존성 감소
- NextAuth의 자동 갱신 활용

**단점 및 해결**:
- 강제 로그아웃 어려움 → Database에 revoked token 테이블 추가
- 모든 디바이스 로그아웃 어려움 → 사용자별 token version 관리

### 3. 타입 정의

```typescript
// src/types/next-auth.d.ts (신규)
import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "USER" | "ADMIN" | "SYSTEM_ADMIN"
      status: "ACTIVE" | "SUSPENDED" | "DELETED"
      provider: string
    } & DefaultSession["user"]
  }
  
  interface User extends DefaultUser {
    role: "USER" | "ADMIN" | "SYSTEM_ADMIN"
    status: "ACTIVE" | "SUSPENDED" | "DELETED"
    provider?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    role: "USER" | "ADMIN" | "SYSTEM_ADMIN"
    status: "ACTIVE" | "SUSPENDED" | "DELETED"
    provider: string
  }
}
```

### 4. 미들웨어 개선

```typescript
// middleware.ts (수정)
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  
  // 공개 경로
  const publicPaths = ['/', '/sign-in', '/sign-up', '/privacy', '/terms']
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }
  
  // 인증 필요
  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
  
  // 계정 상태 확인
  if (session.user.status !== 'ACTIVE') {
    return NextResponse.redirect(new URL('/sign-in?error=suspended', req.url))
  }
  
  // 관리자 페이지
  if (pathname.startsWith('/admin')) {
    if (!['ADMIN', 'SYSTEM_ADMIN'].includes(session.user.role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 5. 클라이언트 세션 관리

```typescript
// src/lib/session-provider.tsx (신규)
"use client"
import { SessionProvider } from "next-auth/react"

export default function AuthSessionProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

```jsx
// src/app/layout.js (수정)
import AuthSessionProvider from "@/lib/session-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  )
}
```

---

## 마이그레이션 전략

### Phase 1: 준비 및 설정 (1일)
1. NextAuth 패키지 설치
2. NextAuth 설정 파일 생성
3. 환경 변수 추가
4. 타입 정의 추가
5. Prisma 스키마 확인/수정

### Phase 2: 핵심 기능 구현 (2일)
1. Credentials Provider 구현
2. JWT Callback 구현
3. 세션 관리 구현
4. 미들웨어 교체
5. Auth Helpers 교체

### Phase 3: API 마이그레이션 (1일)
1. 기존 auth API 제거
2. NextAuth API 적용
3. 클라이언트 로그인/로그아웃 수정

### Phase 4: OAuth 추가 (2일)
1. Google OAuth 설정
2. GitHub OAuth 설정
3. OAuth 콜백 처리
4. 계정 연동 로직

### Phase 5: 테스트 및 검증 (1일)
1. 단위 테스트
2. 통합 테스트
3. E2E 테스트
4. 성능 테스트

### Phase 6: 배포 및 모니터링 (1일)
1. 스테이징 배포
2. 프로덕션 배포
3. 모니터링 설정
4. 롤백 계획

---

## 구현 상세

### 1. NextAuth 설정 파일

```typescript
// src/lib/auth.ts
import NextAuth, { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// 로그인 스키마
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      
      async authorize(credentials) {
        try {
          // 유효성 검사
          const { email, password } = loginSchema.parse(credentials)
          
          // 사용자 조회
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              status: true,
              avatar: true,
              suspendedUntil: true,
              suspendReason: true,
              provider: true,
            }
          })
          
          if (!user) {
            throw new Error("가입되지 않은 이메일입니다")
          }
          
          // Credentials 로그인만 허용
          if (!user.password) {
            throw new Error("소셜 로그인 계정입니다")
          }
          
          // 비밀번호 확인
          const isValidPassword = await bcrypt.compare(password, user.password)
          if (!isValidPassword) {
            throw new Error("비밀번호가 일치하지 않습니다")
          }
          
          // 계정 상태 확인
          if (user.status === 'SUSPENDED') {
            const message = user.suspendedUntil
              ? `정지된 계정입니다 (${new Date(user.suspendedUntil).toLocaleDateString()}까지)`
              : '정지된 계정입니다'
            throw new Error(message)
          }
          
          if (user.status === 'DELETED') {
            throw new Error("삭제된 계정입니다")
          }
          
          // password 제외하고 반환
          const { password: _, ...userWithoutPassword } = user
          return userWithoutPassword
          
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      }
    }),
    
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // 이메일 기반 계정 연동
    }),
    
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7일
  },
  
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // 초기 로그인
      if (user) {
        token.userId = user.id
        token.role = user.role
        token.status = user.status
        token.provider = account?.provider || "credentials"
      }
      
      // 세션 업데이트 트리거
      if (trigger === "update") {
        // 사용자 정보 다시 조회
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.userId as string },
          select: { role: true, status: true }
        })
        
        if (updatedUser) {
          token.role = updatedUser.role
          token.status = updatedUser.status
        }
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string
        session.user.role = token.role as any
        session.user.status = token.status as any
        session.user.provider = token.provider as string
      }
      return session
    },
    
    async signIn({ user, account, profile }) {
      // OAuth 로그인 시
      if (account?.provider !== "credentials") {
        try {
          // 기존 사용자 확인
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          
          if (existingUser) {
            // 계정 상태 확인
            if (existingUser.status !== 'ACTIVE') {
              return false
            }
            
            // Provider ID 업데이트
            const providerField = account.provider === 'google' ? 'googleId' : 'githubId'
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                [providerField]: account.providerAccountId,
                lastLoginAt: new Date()
              }
            })
          } else {
            // 새 사용자 생성
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || user.email!.split('@')[0],
                avatar: user.image,
                provider: account.provider.toUpperCase() as any,
                [account.provider === 'google' ? 'googleId' : 'githubId']: account.providerAccountId,
                role: 'USER',
                status: 'ACTIVE',
              }
            })
          }
        } catch (error) {
          console.error("SignIn error:", error)
          return false
        }
      }
      
      // lastLoginAt 업데이트
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })
      }
      
      return true
    },
    
    async redirect({ url, baseUrl }) {
      // 상대 경로 또는 같은 도메인
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      
      // 기본 리다이렉트
      return `${baseUrl}/dashboard`
    },
  },
  
  pages: {
    signIn: "/sign-in",
    signOut: "/",
    error: "/sign-in",
  },
  
  events: {
    async signOut({ token }) {
      // 로그아웃 이벤트 처리 (필요시)
      console.log(`User ${token?.userId} signed out`)
    },
  },
  
  debug: process.env.NODE_ENV === "development",
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
```

### 2. API Route Handler

```typescript
// src/app/api/auth/[...nextauth]/route.ts
export { handlers as GET, handlers as POST } from "@/lib/auth"
```

### 3. 미들웨어

```typescript
// middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  
  // 공개 경로
  const publicPaths = [
    '/',
    '/sign-in',
    '/sign-up',
    '/privacy',
    '/terms',
  ]
  
  if (publicPaths.some(path => pathname === path)) {
    return NextResponse.next()
  }
  
  // API 경로는 개별 처리
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // 인증 필요
  if (!session) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  // 계정 상태 확인
  if (session.user.status !== 'ACTIVE') {
    const response = NextResponse.redirect(new URL('/sign-in?error=suspended', req.url))
    return response
  }
  
  // 관리자 페이지 권한 확인
  if (pathname.startsWith('/admin')) {
    if (!['ADMIN', 'SYSTEM_ADMIN'].includes(session.user.role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 4. Auth Helpers (교체)

```typescript
// src/lib/auth-helpers.ts
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * 서버 컴포넌트용 세션 가져오기
 */
export async function getSession() {
  return await auth()
}

/**
 * API Route에서 인증 확인
 */
export async function requireAuth() {
  const session = await auth()
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다" },
      { status: 401 }
    )
  }
  
  if (session.user.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: "비활성화된 계정입니다" },
      { status: 403 }
    )
  }
  
  return { user: session.user }
}

/**
 * 관리자 권한 확인
 */
export async function requireAdmin() {
  const result = await requireAuth()
  
  if (result instanceof NextResponse) return result
  
  if (!['ADMIN', 'SYSTEM_ADMIN'].includes(result.user.role)) {
    return NextResponse.json(
      { error: "관리자 권한이 필요합니다" },
      { status: 403 }
    )
  }
  
  return result
}

/**
 * 스터디 멤버 확인
 */
export async function requireStudyMember(studyId: string, minRole = 'MEMBER') {
  const result = await requireAuth()
  if (result instanceof NextResponse) return result
  
  const member = await prisma.studyMember.findUnique({
    where: {
      studyId_userId: {
        studyId,
        userId: result.user.id
      }
    }
  })
  
  if (!member || member.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: "스터디 멤버가 아닙니다" },
      { status: 403 }
    )
  }
  
  // 역할 확인
  const roleHierarchy = { MEMBER: 0, ADMIN: 1, OWNER: 2 }
  if (roleHierarchy[member.role] < roleHierarchy[minRole]) {
    return NextResponse.json(
      { error: "권한이 부족합니다" },
      { status: 403 }
    )
  }
  
  return { session: result, member }
}

/**
 * 현재 사용자 정보 가져오기 (상세)
 */
export async function getCurrentUser() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      status: true,
      bio: true,
      provider: true,
      createdAt: true,
      lastLoginAt: true,
    }
  })
  
  return user
}
```

### 5. 클라이언트 Hooks

```typescript
// src/hooks/useAuth.ts
"use client"
import { useSession } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: session?.user?.role === "ADMIN" || session?.user?.role === "SYSTEM_ADMIN",
  }
}
```

### 6. 로그인/회원가입 페이지 수정

```tsx
// src/app/(auth)/sign-in/page.tsx
"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setError("로그인 중 오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }
  
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl })
  }
  
  const handleGitHubSignIn = () => {
    signIn("github", { callbackUrl })
  }
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
      
      <div>
        <button onClick={handleGoogleSignIn}>
          Google로 로그인
        </button>
        <button onClick={handleGitHubSignIn}>
          GitHub로 로그인
        </button>
      </div>
    </div>
  )
}
```

```tsx
// src/app/(auth)/sign-up/page.tsx
"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    try {
      // 회원가입 API 호출
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "회원가입 실패")
      }
      
      // 회원가입 성공 후 자동 로그인
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })
      
      if (result?.ok) {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="이메일"
          required
        />
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="비밀번호 (8자 이상)"
          minLength={8}
          required
        />
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="이름 (선택)"
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>
    </div>
  )
}
```

### 7. 회원가입 API 수정

```typescript
// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다").optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 유효성 검사
    const validatedData = signupSchema.parse(body)
    
    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다" },
        { status: 400 }
      )
    }
    
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)
    
    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name || validatedData.email.split('@')[0],
        provider: 'CREDENTIALS',
        role: 'USER',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
      }
    })
    
    return NextResponse.json(
      {
        success: true,
        message: "회원가입이 완료되었습니다",
        user,
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Signup error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

### 8. 레이아웃에 SessionProvider 추가

```tsx
// src/app/layout.tsx
import AuthSessionProvider from "@/lib/session-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  )
}
```

```tsx
// src/lib/session-provider.tsx
"use client"
import { SessionProvider } from "next-auth/react"

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionProvider>{children}</SessionProvider>
}
```

### 9. 환경 변수 추가

```env
# .env.example
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here-min-32-characters"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/CoUp?schema=public"

# Redis (Optional - for rate limiting)
REDIS_URL="redis://localhost:6379"
```

---

## 테스트 계획

### 1. 단위 테스트
```typescript
// __tests__/auth/credentials.test.ts
describe("Credentials Authentication", () => {
  it("should login with valid credentials", async () => {
    // 테스트 코드
  })
  
  it("should reject invalid credentials", async () => {
    // 테스트 코드
  })
  
  it("should reject suspended account", async () => {
    // 테스트 코드
  })
})
```

### 2. 통합 테스트
- 로그인 → 대시보드 접근
- 로그아웃 → 리다이렉트
- 권한별 페이지 접근 테스트
- OAuth 로그인 플로우

### 3. E2E 테스트
```typescript
// e2e/auth.spec.ts (Playwright)
test("complete login flow", async ({ page }) => {
  await page.goto("/sign-in")
  await page.fill('input[type="email"]', "test@example.com")
  await page.fill('input[type="password"]', "password123")
  await page.click('button[type="submit"]')
  
  await page.waitForURL("/dashboard")
  expect(page.url()).toContain("/dashboard")
})
```

---

## Todo List

### Phase 1: 준비 및 설정 ✅
- [ ] NextAuth 및 관련 패키지 설치
  ```bash
  npm install next-auth@latest @auth/prisma-adapter
  npm install -D @types/next-auth
  ```
- [ ] 환경 변수 설정 (.env.local)
  - NEXTAUTH_URL
  - NEXTAUTH_SECRET
  - GOOGLE_CLIENT_ID/SECRET (optional)
  - GITHUB_CLIENT_ID/SECRET (optional)
- [ ] 타입 정의 파일 생성 (`src/types/next-auth.d.ts`)
- [ ] Prisma 스키마 확인 (이미 준비됨)

### Phase 2: 핵심 NextAuth 구현 🔄
- [ ] NextAuth 설정 파일 생성 (`src/lib/auth.ts`)
  - [ ] Credentials Provider 구현
  - [ ] JWT Callback 구현
  - [ ] Session Callback 구현
  - [ ] SignIn Callback 구현
  - [ ] Redirect Callback 구현
  - [ ] Events 설정
- [ ] API Route Handler 생성 (`src/app/api/auth/[...nextauth]/route.ts`)
- [ ] SessionProvider 컴포넌트 생성 (`src/lib/session-provider.tsx`)
- [ ] Layout에 SessionProvider 추가

### Phase 3: 미들웨어 교체 🔄
- [ ] 새로운 middleware.ts 작성
  - [ ] NextAuth의 auth() 사용
  - [ ] 공개 경로 설정
  - [ ] 인증 확인
  - [ ] 계정 상태 확인
  - [ ] 관리자 권한 확인
- [ ] 기존 middleware.js 백업
- [ ] 새로운 미들웨어 적용

### Phase 4: Auth Helpers 교체 🔄
- [ ] 새로운 auth-helpers.ts 작성
  - [ ] `getSession()` - NextAuth 기반
  - [ ] `requireAuth()` - NextAuth 기반
  - [ ] `requireAdmin()` - NextAuth 기반
  - [ ] `requireStudyMember()` - NextAuth 기반
  - [ ] `getCurrentUser()` - 상세 정보 조회
- [ ] 기존 auth-helpers.js 백업
- [ ] 모든 API에서 사용 중인 부분 확인

### Phase 5: 기존 Auth API 제거 🗑️
- [ ] `/api/auth/login` 제거 (NextAuth가 대체)
- [ ] `/api/auth/logout` 제거 (NextAuth가 대체)
- [ ] `/api/auth/refresh` 제거 (JWT 자동 갱신)
- [ ] `/api/auth/me` 제거 (useSession 사용)
- [ ] `/api/auth/signup` 수정 (회원가입만 유지)

### Phase 6: 클라이언트 코드 수정 🔄
- [ ] Custom Hook 생성 (`src/hooks/useAuth.ts`)
- [ ] 로그인 페이지 수정 (`src/app/(auth)/sign-in/page.tsx`)
  - [ ] signIn() 사용
  - [ ] OAuth 버튼 추가
- [ ] 회원가입 페이지 수정 (`src/app/(auth)/sign-up/page.tsx`)
  - [ ] 회원가입 후 자동 로그인
- [ ] 로그아웃 버튼 수정 (모든 컴포넌트)
  - [ ] signOut() 사용
- [ ] 사용자 정보 표시 수정
  - [ ] useSession() 사용

### Phase 7: OAuth 추가 (Optional) 🌐
- [ ] Google OAuth 설정
  - [ ] Google Cloud Console에서 OAuth 클라이언트 생성
  - [ ] 환경 변수 설정
  - [ ] Callback URL 설정
- [ ] GitHub OAuth 설정
  - [ ] GitHub Developer Settings에서 OAuth App 생성
  - [ ] 환경 변수 설정
  - [ ] Callback URL 설정
- [ ] OAuth 로그인 버튼 추가
- [ ] OAuth Callback 처리 테스트

### Phase 8: Redis 관련 정리 🧹
- [ ] Redis Refresh Token 관련 코드 제거
  - [ ] `saveRefreshToken()` 제거
  - [ ] `getRefreshToken()` 제거
  - [ ] `deleteRefreshToken()` 제거
  - [ ] `deleteAllRefreshTokens()` 제거
- [ ] Redis는 다른 용도로 계속 사용 가능 (Rate Limiting, Caching 등)
- [ ] `src/lib/redis.js` 파일 정리

### Phase 9: JWT 라이브러리 정리 🧹
- [ ] `src/lib/jwt.js` 파일 제거 (NextAuth가 대체)
- [ ] jsonwebtoken 패키지 의존성 확인
  - [ ] 다른 곳에서 사용하지 않으면 제거
  - [ ] `npm uninstall jsonwebtoken`

### Phase 10: 테스트 작성 및 실행 ✅
- [ ] 단위 테스트
  - [ ] Credentials 인증 테스트
  - [ ] Session 관리 테스트
  - [ ] 권한 확인 테스트
- [ ] 통합 테스트
  - [ ] 로그인 플로우 테스트
  - [ ] 로그아웃 플로우 테스트
  - [ ] API 인증 테스트
- [ ] E2E 테스트
  - [ ] 완전한 로그인/로그아웃 플로우
  - [ ] 권한별 페이지 접근 테스트

### Phase 11: 문서화 📝
- [ ] 새로운 인증 시스템 문서 작성
- [ ] API 문서 업데이트
- [ ] 개발자 가이드 업데이트
- [ ] 마이그레이션 가이드 작성

### Phase 12: 배포 준비 🚀
- [ ] 스테이징 환경 테스트
- [ ] 프로덕션 환경 변수 설정
- [ ] 롤백 계획 수립
- [ ] 모니터링 설정
- [ ] 프로덕션 배포

---

## 체크리스트

### 마이그레이션 전 확인사항
- [ ] 현재 인증 시스템 완전히 이해
- [ ] NextAuth 문서 숙지
- [ ] 백업 및 롤백 계획 수립
- [ ] 테스트 환경 준비
- [ ] 팀원과 일정 조율

### 마이그레이션 중 주의사항
- [ ] 점진적 마이그레이션 (한 번에 모든 것 바꾸지 않기)
- [ ] 각 단계마다 테스트
- [ ] 변경 사항 문서화
- [ ] Git 커밋 세분화
- [ ] 기존 코드 백업

### 마이그레이션 후 확인사항
- [ ] 모든 인증 플로우 동작 확인
- [ ] 성능 측정 및 비교
- [ ] 에러 로그 모니터링
- [ ] 사용자 피드백 수집
- [ ] 문서 최종 검토

---

## 예상 일정

| Phase | 작업 | 예상 시간 | 담당 |
|-------|------|----------|------|
| 1 | 준비 및 설정 | 2시간 | 개발자 |
| 2 | NextAuth 핵심 구현 | 4시간 | 개발자 |
| 3 | 미들웨어 교체 | 2시간 | 개발자 |
| 4 | Auth Helpers 교체 | 2시간 | 개발자 |
| 5 | 기존 API 제거 | 1시간 | 개발자 |
| 6 | 클라이언트 코드 수정 | 4시간 | 개발자 |
| 7 | OAuth 추가 (Optional) | 3시간 | 개발자 |
| 8-9 | 코드 정리 | 2시간 | 개발자 |
| 10 | 테스트 | 4시간 | 개발자 |
| 11 | 문서화 | 2시간 | 개발자 |
| 12 | 배포 | 2시간 | DevOps |
| **총계** | | **28시간 (3.5일)** | |

---

## 참고 자료

### NextAuth 공식 문서
- [Next-Auth v5 (Auth.js) Documentation](https://authjs.dev/)
- [Credentials Provider](https://authjs.dev/getting-started/providers/credentials)
- [JWT Strategy](https://authjs.dev/guides/jwt)
- [Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma)

### 예제 코드
- [NextAuth Examples](https://github.com/nextauthjs/next-auth-example)
- [T3 Stack](https://create.t3.gg/) (NextAuth + Prisma + tRPC)

### 마이그레이션 가이드
- [Migrating to v5](https://authjs.dev/guides/upgrade-to-v5)
- [JWT to Database Sessions](https://authjs.dev/guides/session-strategies)

---

## 롤백 계획

마이그레이션 중 문제 발생 시 롤백 절차:

1. **즉시 롤백 (Phase 1-3)**
   - Git에서 이전 커밋으로 되돌리기
   - `git revert` 또는 `git reset --hard`
   - 기존 시스템으로 복구

2. **부분 롤백 (Phase 4-6)**
   - NextAuth와 기존 시스템 병행 운영
   - 기존 JWT 엔드포인트 임시 복구
   - 점진적 마이그레이션 재시도

3. **긴급 패치 (Phase 7-12)**
   - 핫픽스 배포
   - 모니터링 강화
   - 사용자 공지

---

## 결론

NextAuth로 마이그레이션하면:
- ✅ 표준화된 인증 시스템
- ✅ OAuth 간편 추가
- ✅ 보안 강화
- ✅ 유지보수 용이성
- ✅ 커뮤니티 지원

현재 JWT 기반 시스템도 잘 작동하지만, NextAuth를 도입하면 장기적으로 더 나은 확장성과 유지보수성을 확보할 수 있습니다.

**추천 일정**: 약 1주일 (3.5일 개발 + 3.5일 테스트 및 여유)

