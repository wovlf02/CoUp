# Phase 1: 인증 시스템 구현

> **목표**: NextAuth.js v5 기반 완전한 인증/인가 시스템  
> **예상 시간**: 4-6시간  
> **선행 조건**: Phase 0 완료 (Prisma 설정)

---

## 📋 체크리스트

- [ ] NextAuth.js v5 설치
- [ ] NextAuth 설정 파일 작성
- [ ] API Route 생성
- [ ] 회원가입 API
- [ ] 로그인 (Credentials Provider)
- [ ] 세션 관리
- [ ] 미들웨어 (보호된 라우트)
- [ ] 프론트엔드 연동
- [ ] 테스트

---

## 1. NextAuth.js 설치

```bash
cd C:\Project\CoUp\coup

# NextAuth.js v5 (beta)
npm install next-auth@beta @auth/prisma-adapter

# bcryptjs (비밀번호 해싱)
npm install bcryptjs
npm install -D @types/bcryptjs
```

---

## 2. NextAuth 설정

### `src/lib/auth.js` 생성

```javascript
// src/lib/auth.js
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24시간
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요")
        }

        // 사용자 조회
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("가입되지 않은 이메일입니다")
        }

        // 계정 상태 확인
        if (user.status === 'SUSPENDED') {
          throw new Error("정지된 계정입니다")
        }

        if (user.status === 'DELETED') {
          throw new Error("삭제된 계정입니다")
        }

        // 비밀번호 확인
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) {
          throw new Error("비밀번호가 일치하지 않습니다")
        }

        // 마지막 로그인 시간 업데이트
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 로그인 시 user 정보를 token에 추가
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.name = user.name
        token.avatar = user.avatar
      }
      return token
    },
    async session({ session, token }) {
      // token 정보를 session에 추가
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.email = token.email
        session.user.name = token.name
        session.user.avatar = token.avatar
      }
      return session
    }
  }
})
```

---

## 3. API Route 생성

### `src/app/api/auth/[...nextauth]/route.js` 생성

```javascript
// src/app/api/auth/[...nextauth]/route.js
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

**설명**:
- NextAuth.js v5에서는 `handlers`를 내보내기만 하면 됨
- `GET /api/auth/*` - 로그인 페이지, 콜백 등
- `POST /api/auth/*` - 로그인, 로그아웃 처리

---

## 4. 회원가입 API

### `src/app/api/auth/signup/route.js` 생성

```javascript
// src/app/api/auth/signup/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// 유효성 검사 스키마
const signupSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다").optional(),
})

export async function POST(request) {
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
        createdAt: true,
      }
    })

    return NextResponse.json(
      { 
        success: true,
        message: "회원가입이 완료되었습니다",
        user 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)

    if (error.name === 'ZodError') {
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

### Zod 설치
```bash
npm install zod
```

---

## 5. 인증 헬퍼 함수

### `src/lib/auth-helpers.js` 생성

```javascript
// src/lib/auth-helpers.js
import { auth } from "./auth"
import { NextResponse } from "next/server"
import { prisma } from "./prisma"

/**
 * 로그인 확인
 * API Route에서 사용
 */
export async function requireAuth() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다" },
      { status: 401 }
    )
  }

  return session
}

/**
 * 관리자 확인
 */
export async function requireAdmin() {
  const session = await requireAuth()

  if (session instanceof NextResponse) return session

  if (!['ADMIN', 'SYSTEM_ADMIN'].includes(session.user.role)) {
    return NextResponse.json(
      { error: "관리자 권한이 필요합니다" },
      { status: 403 }
    )
  }

  return session
}

/**
 * 스터디 멤버 확인
 * @param {string} studyId - 스터디 ID
 * @param {string} minRole - 최소 요구 역할 (MEMBER, ADMIN, OWNER)
 */
export async function requireStudyMember(studyId, minRole = 'MEMBER') {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  const member = await prisma.studyMember.findUnique({
    where: {
      studyId_userId: {
        studyId,
        userId: session.user.id
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

  return { session, member }
}
```

---

## 6. 미들웨어 (보호된 라우트)

### `middleware.js` 생성 (프로젝트 루트)

```javascript
// middleware.js
import { auth } from "./src/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // 공개 경로
  const publicPaths = [
    '/',
    '/sign-in',
    '/sign-up',
    '/privacy',
    '/terms',
  ]

  // 보호된 경로
  const protectedPaths = [
    '/dashboard',
    '/my-studies',
    '/tasks',
    '/notifications',
    '/me',
  ]

  // 관리자 경로
  const adminPaths = ['/admin']

  // 공개 경로는 통과
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // 보호된 경로 확인
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }

  // 관리자 경로 확인
  if (adminPaths.some(path => pathname.startsWith(path))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    if (!['ADMIN', 'SYSTEM_ADMIN'].includes(req.auth.user.role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
```

---

## 7. 환경 변수 업데이트

### `.env.local` 확인

```env
# Database
DATABASE_URL="postgresql://postgres:coup123@localhost:5432/coup?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-characters-long-change-this"

# 개발 환경
NODE_ENV="development"
```

### Secret 생성 (옵션)
```bash
openssl rand -base64 32
```

---

## 8. 프론트엔드 연동

### 회원가입 페이지 수정

```javascript
// src/app/(auth)/sign-up/page.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다')
      }

      // 회원가입 성공 → 로그인 페이지로
      alert('회원가입이 완료되었습니다!')
      router.push('/sign-in')

    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">회원가입</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              이메일
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="8자 이상"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              이름 (선택)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="홍길동"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? '처리 중...' : '회원가입'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          이미 계정이 있으신가요?{' '}
          <Link href="/sign-in" className="text-indigo-600">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
```

### 로그인 페이지 수정

```javascript
// src/app/(auth)/sign-in/page.jsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // 로그인 성공 → 대시보드로
      router.push('/dashboard')
      router.refresh()

    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">로그인</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              이메일
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          계정이 없으신가요?{' '}
          <Link href="/sign-up" className="text-indigo-600">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
```

### SessionProvider 설정

```javascript
// src/app/layout.js
import { SessionProvider } from "next-auth/react"
import { auth } from "@/lib/auth"

export default async function RootLayout({ children }) {
  const session = await auth()

  return (
    <html lang="ko">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

---

## 9. 테스트

### 1. 회원가입 테스트

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "테스트유저"
  }'
```

**예상 응답**:
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다",
  "user": {
    "id": "clx...",
    "email": "test@example.com",
    "name": "테스트유저",
    "createdAt": "2025-11-18T..."
  }
}
```

### 2. 로그인 테스트 (브라우저)

1. `http://localhost:3000/sign-in` 접속
2. Seed 계정으로 로그인:
   - Email: `kim@example.com`
   - Password: `password123`
3. `/dashboard`로 리다이렉트 확인

### 3. 세션 확인

```javascript
// src/app/dashboard/page.jsx
import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div>
      <h1>대시보드</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}
```

### 4. 보호된 라우트 테스트

1. 로그아웃 상태에서 `/dashboard` 접속
2. `/sign-in`으로 리다이렉트 확인
3. 로그인 후 다시 `/dashboard` 접근 가능

### 5. 관리자 라우트 테스트

1. 일반 유저로 로그인
2. `/admin` 접속
3. `/dashboard`로 리다이렉트 확인
4. 관리자 계정(`admin@example.com`)으로 로그인
5. `/admin` 접근 성공

---

## 10. API 테스트 예제

### `src/app/api/users/me/route.js` (예제)

```javascript
// src/app/api/users/me/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      bio: true,
      role: true,
      createdAt: true,
    }
  })

  return NextResponse.json({ user })
}
```

### 테스트
```bash
curl http://localhost:3000/api/users/me \
  -H "Cookie: next-auth.session-token=..."
```

---

## 🎯 완료 확인

### 체크리스트
- [x] NextAuth.js 설치 완료
- [x] `lib/auth.js` 작성
- [x] API Route 생성
- [x] 회원가입 API 동작
- [x] 로그인 동작
- [x] 세션 확인 가능
- [x] 미들웨어 동작
- [x] 보호된 라우트 확인
- [x] 관리자 권한 확인

---

## 🐛 문제 해결

### "Invalid session" 오류
```javascript
// next-auth가 session을 찾지 못함
```
**해결**:
- `.env.local`에 `NEXTAUTH_SECRET` 확인
- 브라우저 쿠키 삭제 후 재로그인

### "Credentials sign in failed"
```javascript
// authorize() 함수에서 에러 발생
```
**해결**:
- 콘솔 로그 확인
- 비밀번호 해시 비교 확인
- Prisma 쿼리 확인

---

## 📚 다음 단계

**Phase 2: 사용자 기능**
- 프로필 조회/수정
- 대시보드 데이터 API
- 알림 시스템

👉 **[phase-2-user-features.md](./phase-2-user-features.md)** 로 이동

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-11-18

