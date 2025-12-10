# 인증 헬퍼 함수 가이드

## 개요

서버 사이드에서 인증/인가를 처리하기 위한 헬퍼 함수들입니다.

**파일 위치:** `src/lib/auth-helpers.js`

---

## 함수 관계 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      인증 헬퍼 함수 관계도                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Server Components                              │  │
│  │                                                                    │  │
│  │   page.jsx ───────────────┬─────────────────────────────────────── │  │
│  │                           │                                        │  │
│  │                           ▼                                        │  │
│  │              ┌─────────────────────────┐                           │  │
│  │              │      getSession()       │                           │  │
│  │              │                         │                           │  │
│  │              │  • 세션 조회            │                           │  │
│  │              │  • 인증 여부 확인       │                           │  │
│  │              │  • 간단한 사용자 정보   │                           │  │
│  │              └─────────────────────────┘                           │  │
│  │                           │                                        │  │
│  │                           ▼                                        │  │
│  │              ┌─────────────────────────┐                           │  │
│  │              │    getCurrentUser()     │                           │  │
│  │              │                         │                           │  │
│  │              │  • DB에서 상세 정보     │                           │  │
│  │              │  • bio, createdAt 등    │                           │  │
│  │              └─────────────────────────┘                           │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                       API Routes                                   │  │
│  │                                                                    │  │
│  │   route.js ────────────────┬────────────────────────────────────── │  │
│  │                            │                                       │  │
│  │                            ▼                                       │  │
│  │               ┌─────────────────────────┐                          │  │
│  │               │     requireAuth()       │ ◄─── 가장 기본적인       │  │
│  │               │                         │      인증 확인           │  │
│  │               │  • 세션 확인            │                          │  │
│  │               │  • DB 사용자 확인       │                          │  │
│  │               │  • 계정 상태 확인       │                          │  │
│  │               └───────────┬─────────────┘                          │  │
│  │                           │                                        │  │
│  │                           │ (내부 호출)                            │  │
│  │                           ▼                                        │  │
│  │               ┌─────────────────────────┐                          │  │
│  │               │  requireStudyMember()   │ ◄─── 스터디 API에서      │  │
│  │               │                         │      사용                │  │
│  │               │  • requireAuth() 호출   │                          │  │
│  │               │  • 스터디 멤버 확인     │                          │  │
│  │               │  • 역할 권한 확인       │                          │  │
│  │               └─────────────────────────┘                          │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 함수 호출 흐름

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   API Route     │     │   헬퍼 함수     │     │   Prisma DB     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │  requireAuth()        │                       │
         │──────────────────────>│                       │
         │                       │                       │
         │                       │  getServerSession()   │
         │                       │  (NextAuth 내부)      │
         │                       │                       │
         │                       │  prisma.user.findUnique()
         │                       │──────────────────────>│
         │                       │                       │
         │                       │  User 데이터          │
         │                       │<──────────────────────│
         │                       │                       │
         │  { user } 또는        │                       │
         │  NextResponse (에러)  │                       │
         │<──────────────────────│                       │
         │                       │                       │
```

---

## 함수 목록

| 함수 | 설명 | 사용 위치 |
|------|------|-----------|
| `getSession()` | 현재 세션 조회 | Server Component |
| `requireAuth()` | 인증 필수 확인 | API Route |
| `requireStudyMember()` | 스터디 멤버 권한 확인 | API Route |
| `getCurrentUser()` | 현재 사용자 상세 정보 | Server Component, API Route |

---

## getSession

현재 로그인한 사용자의 세션을 가져옵니다.

### 시그니처

```typescript
async function getSession(): Promise<Session | null>
```

### 반환값

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
  expires: string
}
```

### 사용 예시

```jsx
// Server Component
import { getSession } from '@/lib/auth-helpers'

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/sign-in')
  }
  
  return <div>Welcome, {session.user.name}</div>
}
```

### 구현

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

---

## requireAuth

API Route에서 인증 여부를 확인합니다.
인증되지 않은 경우 에러 응답을 반환합니다.

### 시그니처

```typescript
async function requireAuth(): Promise<
  { user: SessionUser } | NextResponse
>
```

### 반환값

**성공 시:**
```typescript
{
  user: {
    id: string
    email: string
    name: string
    image: string | null
    role: 'USER' | 'ADMIN'
    status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'
    provider: 'CREDENTIALS' | 'GOOGLE' | 'GITHUB'
  }
}
```

**실패 시:** `NextResponse` (에러 응답)

### 사용 예시

```javascript
// API Route
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request) {
  const authResult = await requireAuth()
  
  // NextResponse면 에러 응답 반환
  if (authResult instanceof NextResponse) {
    return authResult
  }
  
  const { user } = authResult
  
  // 인증된 사용자의 데이터 처리
  const data = await prisma.task.findMany({
    where: { userId: user.id }
  })
  
  return NextResponse.json({ data })
}
```

### 검증 항목

1. **세션 존재 여부**
   - 세션이 없으면 401 응답

2. **DB 사용자 확인**
   - 세션 사용자가 DB에 존재하는지 확인

3. **계정 상태 확인**
   - `DELETED`: 403 응답
   - `SUSPENDED`: 403 응답
   - `ACTIVE`가 아닌 경우: 403 응답

### 에러 응답

```javascript
// 세션 없음
{ error: 'AUTH_006', message: '로그인이 필요합니다' }  // 401

// 삭제된 계정
{ error: 'AUTH_004', message: '삭제된 계정입니다' }  // 403

// 정지된 계정
{ error: 'AUTH_005', message: '정지된 계정입니다' }  // 403

// DB 에러
{ error: 'AUTH_012', message: '데이터베이스 조회 중 오류가 발생했습니다' }  // 500
```

---

## requireStudyMember

스터디 멤버인지 확인하고, 필요한 역할 권한이 있는지 검증합니다.

### 시그니처

```typescript
async function requireStudyMember(
  studyId: string,
  minRole?: 'MEMBER' | 'ADMIN' | 'OWNER'
): Promise<
  { session: { user: SessionUser }, member: StudyMember } | NextResponse
>
```

### 매개변수

| 이름 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| studyId | string | - | 확인할 스터디 ID |
| minRole | string | 'MEMBER' | 최소 요구 역할 |

### 역할 계층

```
MEMBER (0) < ADMIN (1) < OWNER (2)
```

### 반환값

**성공 시:**
```typescript
{
  session: { user: SessionUser },
  member: {
    id: string
    studyId: string
    userId: string
    role: 'MEMBER' | 'ADMIN' | 'OWNER'
    status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'LEFT' | 'KICKED'
    joinedAt: Date
  }
}
```

**실패 시:** `NextResponse` (에러 응답)

### 사용 예시

```javascript
// 일반 멤버 권한 필요
export async function GET(request, { params }) {
  const { studyId } = params
  
  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result
  
  const { session, member } = result
  // ...
}

// 관리자 권한 필요
export async function POST(request, { params }) {
  const { studyId } = params
  
  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result
  
  const { session, member } = result
  // 관리자만 실행 가능한 로직
}

// 소유자 권한 필요
export async function DELETE(request, { params }) {
  const { studyId } = params
  
  const result = await requireStudyMember(studyId, 'OWNER')
  if (result instanceof NextResponse) return result
  
  const { session, member } = result
  // 소유자만 실행 가능한 로직
}
```

### 에러 응답

```javascript
// 인증 실패 (requireAuth 에러)
// 401 또는 403

// 멤버 아님
{ error: '스터디 멤버가 아닙니다' }  // 403

// 권한 부족
{ error: '권한이 부족합니다' }  // 403
```

---

## getCurrentUser

현재 로그인한 사용자의 상세 정보를 DB에서 조회합니다.

### 시그니처

```typescript
async function getCurrentUser(): Promise<User | null>
```

### 반환값

```typescript
interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  bio: string | null
  role: 'USER' | 'ADMIN'
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'
  provider: 'CREDENTIALS' | 'GOOGLE' | 'GITHUB'
  createdAt: Date
  lastLoginAt: Date | null
}
```

### 사용 예시

```jsx
// Server Component
import { getCurrentUser } from '@/lib/auth-helpers'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
      <p>가입일: {user.createdAt.toLocaleDateString()}</p>
    </div>
  )
}
```

```javascript
// API Route
import { getCurrentUser } from '@/lib/auth-helpers'

export async function GET() {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    )
  }
  
  return NextResponse.json({ user })
}
```

---

## 사용 패턴

### API Route 패턴

```javascript
// src/app/api/example/route.js
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  // 1. 인증 확인
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) {
    return authResult
  }
  
  const { user } = authResult
  
  // 2. 비즈니스 로직
  try {
    const data = await prisma.someModel.findMany({
      where: { userId: user.id }
    })
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
```

### 스터디 API 패턴

```javascript
// src/app/api/studies/[studyId]/notices/route.js
import { NextResponse } from 'next/server'
import { requireStudyMember } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  const { studyId } = params
  
  // 멤버 확인 (읽기는 MEMBER 권한)
  const result = await requireStudyMember(studyId, 'MEMBER')
  if (result instanceof NextResponse) return result
  
  const notices = await prisma.notice.findMany({
    where: { studyId }
  })
  
  return NextResponse.json({ notices })
}

export async function POST(request, { params }) {
  const { studyId } = params
  
  // 공지 작성은 ADMIN 권한 필요
  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result
  
  const { session } = result
  const body = await request.json()
  
  const notice = await prisma.notice.create({
    data: {
      studyId,
      authorId: session.user.id,
      ...body
    }
  })
  
  return NextResponse.json({ notice }, { status: 201 })
}
```

### Server Component 패턴

```jsx
// src/app/dashboard/page.jsx
import { redirect } from 'next/navigation'
import { getSession, getCurrentUser } from '@/lib/auth-helpers'

export default async function DashboardPage() {
  // 세션만 필요한 경우
  const session = await getSession()
  if (!session) {
    redirect('/sign-in?callbackUrl=/dashboard')
  }
  
  // 상세 정보가 필요한 경우
  const user = await getCurrentUser()
  
  return (
    <div>
      <h1>안녕하세요, {user?.name || session.user.name}님</h1>
      {/* ... */}
    </div>
  )
}
```

---

## 에러 처리 가이드

### 인증 에러 로깅

```javascript
import { logAuthError } from '@/lib/exceptions/auth-errors'

// 에러 발생 시 로깅
try {
  // ...
} catch (error) {
  logAuthError('함수명', error, {
    userId: user?.id,
    additionalInfo: '...'
  })
  
  const errorResponse = createAuthErrorResponse('UNKNOWN_ERROR')
  return NextResponse.json(
    { error: errorResponse.code, message: errorResponse.message },
    { status: errorResponse.statusCode }
  )
}
```

### 에러 응답 생성

```javascript
import {
  AUTH_ERRORS,
  createAuthErrorResponse
} from '@/lib/exceptions/auth-errors'

// 사전 정의된 에러 사용
const errorResponse = createAuthErrorResponse('NO_SESSION')
// { error: 'AUTH_006', message: '로그인이 필요합니다', statusCode: 401 }

return NextResponse.json(
  { error: errorResponse.error, message: errorResponse.message },
  { status: errorResponse.statusCode }
)

// 직접 에러 정의 사용
const error = AUTH_ERRORS.ACCOUNT_SUSPENDED
return NextResponse.json(
  { error: error.code, message: error.message },
  { status: error.statusCode }
)
```

---

## 관련 파일

- `src/lib/auth.js` - NextAuth 설정 및 authOptions
- `src/lib/exceptions/auth-errors.js` - 에러 정의 및 유틸리티
- `src/lib/prisma.js` - Prisma 클라이언트
- `middleware.js` - 라우트 보호 미들웨어

