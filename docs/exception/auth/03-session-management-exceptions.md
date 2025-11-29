# 세션 관리 예외 처리

NextAuth JWT 기반 세션 관리에서 발생할 수 있는 모든 예외 상황을 다룹니다.

---

## 📋 목차

1. [세션 생성 예외](#세션-생성-예외)
2. [세션 검증 예외](#세션-검증-예외)
3. [세션 만료 예외](#세션-만료-예외)
4. [세션 무효화 예외](#세션-무효화-예외)
5. [쿠키 관련 예외](#쿠키-관련-예외)
6. [동시 로그인 처리](#동시-로그인-처리)

---

## 세션 생성 예외

### 1. JWT 생성 실패

#### 증상
로그인은 성공했지만 세션이 생성되지 않음

#### 발생 위치
```javascript
// src/lib/auth.js - jwt callback
async jwt({ token, user, trigger, session }) {
  if (user) {
    token.id = user.id
    token.email = user.email
    // ... JWT 생성
  }
  return token
}
```

#### 원인

**Case 1: JWT_SECRET 미설정**
```bash
# .env.local
# JWT_SECRET이 없거나 빈 문자열
JWT_SECRET=
```

**디버깅**:
```bash
# 서버 로그
Error: Please define the JWT_SECRET environment variable
```

**해결**:
```bash
# .env.local
JWT_SECRET=your-super-secret-key-here-min-32-chars
```

**Case 2: 페이로드 크기 초과**
```javascript
// JWT 페이로드가 너무 큼 (>4KB)
token.data = hugeObject  // ❌
```

**해결**:
```javascript
// 필요한 데이터만 저장
token.id = user.id
token.email = user.email
token.name = user.name
// 큰 데이터는 DB 조회
```

---

### 2. 세션 콜백 오류

#### 증상
```
Error: Cannot read property 'id' of undefined
```

#### 발생 위치
```javascript
// src/lib/auth.js - session callback
async session({ session, token }) {
  session.user = {
    id: token.id,  // token이 undefined일 수 있음
    email: token.email,
    // ...
  }
  return session
}
```

#### 원인
- JWT 파싱 실패
- 토큰 만료
- 토큰 변조

#### 해결 방법

**방어적 프로그래밍**:
```javascript
async session({ session, token }) {
  if (!token || !token.id) {
    console.error('❌ [AUTH] Invalid token in session callback')
    return null  // 세션 무효화
  }

  try {
    session.user = {
      id: token.id || '',
      email: token.email || '',
      name: token.name || '',
      // ...
    }
    
    // 관리자 권한 조회
    const adminRole = await prisma.adminRole.findUnique({
      where: { userId: token.id }
    })
    
    session.user.isAdmin = !!adminRole
    session.user.adminRole = adminRole?.role || null
    
  } catch (error) {
    console.error('❌ [AUTH] Session callback error:', error)
    // 에러 발생 시에도 기본 세션 반환
    session.user = {
      id: token.id || '',
      email: token.email || '',
      name: token.name || '',
      isAdmin: false,
      adminRole: null,
    }
  }
  
  return session
}
```

---

## 세션 검증 예외

### 1. 세션이 존재하지만 사용자가 없음

#### 증상
```json
{
  "valid": false,
  "error": "User not found",
  "shouldLogout": true
}
```

#### 발생 시나리오

1. 사용자 로그인 성공 → JWT 토큰 발급
2. 관리자가 사용자 계정 삭제
3. 사용자가 페이지 새로고침
4. **JWT는 유효하지만 DB에 사용자 없음** ❌

#### 발생 위치
```javascript
// src/app/api/auth/validate-session/route.js
const session = await getServerSession(authOptions)
const user = await prisma.user.findUnique({
  where: { id: session.user.id }
})

if (!user) {
  return NextResponse.json({
    valid: false,
    error: 'User not found',
    shouldLogout: true
  })
}
```

#### 해결 방법

**클라이언트 처리**:
```javascript
// src/app/(auth)/sign-in/page.jsx
const data = await api.get('/api/auth/validate-session')

if (data.valid) {
  // 유효한 세션
  router.push('/dashboard')
} else if (data.shouldLogout) {
  // 세션 무효 - 로그아웃
  console.warn('⚠️ Invalid session detected:', data.error)
  await signOut({ redirect: false })
  localStorage.clear()
  sessionStorage.clear()
}
```

**미들웨어에서 자동 처리**:
```javascript
// middleware.js
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
  const token = await getToken({ req: request })
  
  if (token) {
    // 사용자 존재 여부 확인
    const user = await prisma.user.findUnique({
      where: { id: token.id }
    })
    
    if (!user || user.status !== 'ACTIVE') {
      // 세션 무효화 - 로그인 페이지로
      return NextResponse.redirect(new URL('/sign-in?error=session-invalid', request.url))
    }
  }
  
  return NextResponse.next()
}
```

---

### 2. 계정 상태가 변경됨

#### 시나리오

**Case 1: ACTIVE → SUSPENDED**
```
1. 사용자 로그인 (상태: ACTIVE)
2. 관리자가 계정 정지
3. 사용자가 보호된 페이지 접근 시도
4. 세션은 유효하지만 계정은 정지됨
```

**Case 2: ACTIVE → DELETED**
```
1. 사용자 로그인
2. 사용자가 "계정 삭제" 버튼 클릭
3. 다른 탭에서 계속 사용 시도
```

#### 해결 방법

**매 요청마다 상태 확인**:
```javascript
// src/lib/auth.js - session callback
async session({ session, token }) {
  try {
    // DB에서 최신 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: token.id },
      select: { status: true }
    })
    
    // 사용자 없거나 비활성
    if (!user || user.status !== 'ACTIVE') {
      console.warn(`⚠️ User ${token.id} is ${user?.status || 'not found'}`)
      return null  // 세션 무효화
    }
    
    session.user = {
      id: token.id,
      email: token.email,
      // ...
    }
    
    return session
  } catch (error) {
    console.error('❌ [AUTH] Session validation error:', error)
    return null  // 에러 시 세션 무효화
  }
}
```

**API 라우트에서 확인**:
```javascript
// src/lib/server-auth.js
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  
  // DB에서 최신 상태 확인
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })
  
  if (!user || user.status !== 'ACTIVE') {
    throw new Error('User account is not active')
  }
  
  return { session, user }
}

// 사용
export async function GET(request) {
  try {
    const { session, user } = await requireAuth()
    // ... API 로직
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'User account is not active') {
      return NextResponse.json({ error: 'Account suspended or deleted' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## 세션 만료 예외

### 1. JWT 토큰 만료

#### 증상
로그인 상태였는데 갑자기 로그아웃됨

#### 현재 설정
```javascript
// src/lib/auth.js
session: {
  strategy: "jwt",
  maxAge: 24 * 60 * 60,  // 1일
  updateAge: 0,  // 세션 갱신 비활성화
}
```

#### 만료 시간

**브라우저 세션 쿠키** (현재):
- `maxAge: undefined` 설정 시
- 브라우저 닫으면 자동 로그아웃 ✅
- 보안성 높음

**영구 세션** (선택사항):
```javascript
session: {
  maxAge: 30 * 24 * 60 * 60,  // 30일
}

cookies: {
  sessionToken: {
    options: {
      maxAge: 30 * 24 * 60 * 60,  // 30일
    }
  }
}
```

#### 만료 시 처리

**자동 리다이렉트**:
```javascript
// middleware.js
export async function middleware(request) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl
  
  // 보호된 페이지
  const protectedPaths = ['/dashboard', '/admin', '/profile']
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtected && !token) {
    // 세션 만료 - 로그인 페이지로
    return NextResponse.redirect(
      new URL(`/sign-in?callbackUrl=${pathname}&error=session-expired`, request.url)
    )
  }
  
  return NextResponse.next()
}
```

**에러 메시지 표시**:
```javascript
// src/app/(auth)/sign-in/page.jsx
const errorParam = searchParams.get('error')
const [error, setError] = useState(
  errorParam === 'session-expired' ? '세션이 만료되었습니다. 다시 로그인해주세요.' :
  errorParam === 'session-invalid' ? '유효하지 않은 세션입니다.' :
  null
)
```

---

### 2. "Remember Me" 기능

#### 요구사항
- 사용자가 선택 시 30일 세션
- 선택하지 않으면 브라우저 세션

#### 구현 방법

**Option 1: 동적 maxAge**
```javascript
// src/lib/auth.js
export function getAuthOptions(rememberMe = false) {
  return {
    // ...existing config...
    session: {
      strategy: "jwt",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
    },
    cookies: {
      sessionToken: {
        options: {
          maxAge: rememberMe ? 30 * 24 * 60 * 60 : undefined,
        }
      }
    }
  }
}
```

**Option 2: 쿠키 직접 제어**
```javascript
// 클라이언트
const handleLogin = async (rememberMe) => {
  await signIn('credentials', { email, password })
  
  if (rememberMe) {
    // 쿠키 만료 시간 연장
    document.cookie = `remember-me=true; max-age=${30 * 24 * 60 * 60}`
  }
}
```

---

## 세션 무효화 예외

### 1. 로그아웃 실패

#### 증상
로그아웃 버튼 클릭해도 여전히 로그인 상태

#### 원인

**Case 1: signOut() 호출 실패**
```javascript
// 잘못된 사용
const handleLogout = () => {
  signOut()  // await 없음
  router.push('/')  // 즉시 실행됨
}
```

**Case 2: 쿠키 삭제 실패**
- 도메인 불일치
- Path 설정 오류
- HttpOnly 쿠키

#### 해결 방법

**올바른 로그아웃**:
```javascript
const handleLogout = async () => {
  try {
    // 1. 로컬 스토리지 정리
    localStorage.clear()
    sessionStorage.clear()
    
    // 2. NextAuth signOut
    await signOut({
      redirect: false,
      callbackUrl: '/'
    })
    
    // 3. 서버에 로그아웃 알림 (선택사항)
    await api.post('/api/auth/logout', {
      userId: session?.user?.id
    })
    
    // 4. 홈으로 리다이렉트
    router.push('/')
    router.refresh()
    
  } catch (error) {
    console.error('로그아웃 실패:', error)
    // 강제 새로고침
    window.location.href = '/'
  }
}
```

---

### 2. 모든 기기에서 로그아웃

#### 시나리오
"보안상의 이유로 모든 기기에서 로그아웃"

#### 구현 방법

**Option 1: Token Version**
```prisma
// prisma/schema.prisma
model User {
  // ...existing fields...
  tokenVersion Int @default(0)
}
```

```javascript
// JWT에 tokenVersion 포함
async jwt({ token, user }) {
  if (user) {
    const userWithVersion = await prisma.user.findUnique({
      where: { id: user.id },
      select: { tokenVersion: true }
    })
    token.tokenVersion = userWithVersion.tokenVersion
  }
  return token
}

// 세션 검증 시 버전 확인
async session({ session, token }) {
  const user = await prisma.user.findUnique({
    where: { id: token.id },
    select: { tokenVersion: true }
  })
  
  // 버전이 다르면 세션 무효화
  if (user.tokenVersion !== token.tokenVersion) {
    console.warn('Token version mismatch, invalidating session')
    return null
  }
  
  return session
}

// 모든 기기 로그아웃
await prisma.user.update({
  where: { id: userId },
  data: { tokenVersion: { increment: 1 } }
})
```

**Option 2: Session Blacklist**
```prisma
model InvalidatedSession {
  id        String   @id @default(cuid())
  userId    String
  jti       String   @unique  // JWT ID
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([expiresAt])
}
```

```javascript
// JWT ID 추가
async jwt({ token, user }) {
  if (user) {
    token.jti = crypto.randomUUID()
  }
  return token
}

// 세션 검증 시 블랙리스트 확인
async session({ session, token }) {
  const invalidated = await prisma.invalidatedSession.findUnique({
    where: { jti: token.jti }
  })
  
  if (invalidated) {
    return null  // 무효화된 세션
  }
  
  return session
}

// 특정 세션 무효화
await prisma.invalidatedSession.create({
  data: {
    userId: userId,
    jti: sessionJti,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
})
```

---

## 쿠키 관련 예외

### 1. 쿠키 차단됨

#### 증상
로그인 버튼 클릭 후 페이지가 새로고침되지만 로그인 안 됨

#### 원인
- 브라우저 쿠키 설정에서 차단
- 시크릿 모드에서 third-party 쿠키 차단
- 프라이버시 확장 프로그램 (Privacy Badger 등)

#### 감지 방법

```javascript
// src/app/(auth)/sign-in/page.jsx
useEffect(() => {
  // 쿠키 지원 여부 확인
  const cookiesEnabled = navigator.cookieEnabled
  
  if (!cookiesEnabled) {
    setError('이 사이트는 쿠키를 사용합니다. 브라우저 설정에서 쿠키를 활성화해주세요.')
  }
  
  // 쿠키 쓰기 테스트
  try {
    document.cookie = 'test=1'
    const hasTestCookie = document.cookie.includes('test=1')
    document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 UTC'
    
    if (!hasTestCookie) {
      setError('쿠키가 차단되어 있습니다. 브라우저 설정을 확인해주세요.')
    }
  } catch (err) {
    setError('쿠키 설정을 확인해주세요.')
  }
}, [])
```

#### 사용자 안내

```jsx
{error?.includes('쿠키') && (
  <Alert type="warning">
    <h4>쿠키가 차단되어 있습니다</h4>
    <p>로그인하려면 쿠키를 활성화해야 합니다.</p>
    <details>
      <summary>해결 방법 보기</summary>
      <ul>
        <li><strong>Chrome</strong>: 설정 → 개인정보 및 보안 → 쿠키 및 사이트 데이터</li>
        <li><strong>Firefox</strong>: 설정 → 개인 정보 및 보안 → 쿠키 및 사이트 데이터</li>
        <li><strong>Safari</strong>: 환경설정 → 개인 정보 → 쿠키 및 웹사이트 데이터</li>
      </ul>
    </details>
  </Alert>
)}
```

---

### 2. SameSite 쿠키 정책

#### 증상
로컬에서는 작동하지만 프로덕션에서 작동 안 함

#### 원인
```javascript
// 잘못된 설정
cookies: {
  sessionToken: {
    options: {
      sameSite: 'none',  // HTTPS 필요
      secure: false,     // ❌ HTTP에서는 작동 안 함
    }
  }
}
```

#### 해결 방법

```javascript
// src/lib/auth.js
cookies: {
  sessionToken: {
    name: 'next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',  // 대부분의 경우 'lax'면 충분
      path: '/',
      secure: process.env.NODE_ENV === 'production',  // 프로덕션에서만 HTTPS
    }
  }
}
```

**개발/프로덕션 분기**:
```javascript
const isProduction = process.env.NODE_ENV === 'production'

cookies: {
  sessionToken: {
    options: {
      httpOnly: true,
      sameSite: isProduction ? 'strict' : 'lax',
      secure: isProduction,
      domain: isProduction ? '.coup.com' : undefined,
    }
  }
}
```

---

### 3. 쿠키 크기 제한

#### 문제
JWT 토큰이 너무 커서 쿠키에 저장 불가

#### 제한
- **쿠키 하나당**: 4KB
- **도메인당 총합**: 약 50개 쿠키

#### 해결 방법

**JWT 페이로드 최소화**:
```javascript
// ❌ 나쁜 예
async jwt({ token, user }) {
  if (user) {
    token.id = user.id
    token.email = user.email
    token.name = user.name
    token.avatar = user.avatar
    token.bio = user.bio  // 불필요
    token.preferences = user.preferences  // 큰 객체
    token.studyList = user.studies  // 배열 ❌
  }
  return token
}

// ✅ 좋은 예
async jwt({ token, user }) {
  if (user) {
    token.id = user.id
    token.email = user.email
    token.name = user.name
    token.isAdmin = user.isAdmin
    // 나머지는 필요할 때 DB 조회
  }
  return token
}
```

---

## 동시 로그인 처리

### 1. 여러 탭에서 동시 로그인

#### 시나리오
```
탭 A: 로그인 상태
탭 B: 로그아웃 클릭
탭 A: 여전히 로그인 상태? ❌
```

#### 해결 방법

**BroadcastChannel API**:
```javascript
// src/contexts/AuthSyncContext.jsx
'use client'

import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

export function AuthSyncProvider({ children }) {
  const { data: session } = useSession()
  
  useEffect(() => {
    const channel = new BroadcastChannel('auth-sync')
    
    // 다른 탭에서 로그아웃 시
    channel.onmessage = (event) => {
      if (event.data.type === 'LOGOUT') {
        console.log('다른 탭에서 로그아웃됨')
        signOut({ redirect: false })
      }
      
      if (event.data.type === 'LOGIN') {
        console.log('다른 탭에서 로그인됨')
        window.location.reload()
      }
    }
    
    return () => channel.close()
  }, [])
  
  // 로그아웃 시 다른 탭에 알림
  const handleLogout = async () => {
    const channel = new BroadcastChannel('auth-sync')
    channel.postMessage({ type: 'LOGOUT' })
    channel.close()
    
    await signOut()
  }
  
  return children
}
```

**LocalStorage 이벤트**:
```javascript
// 브라우저 간 호환성 높음
useEffect(() => {
  const handleStorageChange = (e) => {
    if (e.key === 'logout') {
      signOut({ redirect: false })
    }
  }
  
  window.addEventListener('storage', handleStorageChange)
  return () => window.removeEventListener('storage', handleStorageChange)
}, [])

// 로그아웃 시
const handleLogout = async () => {
  localStorage.setItem('logout', Date.now().toString())
  localStorage.removeItem('logout')
  await signOut()
}
```

---

### 2. 동시 로그인 제한

#### 요구사항
한 계정에서 최대 3개 기기만 동시 로그인

#### 구현 방법

```prisma
model UserSession {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  token     String   @unique
  device    String?
  ipAddress String?
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([expiresAt])
}
```

```javascript
// JWT 생성 시 세션 기록
async jwt({ token, user }) {
  if (user) {
    // 세션 개수 확인
    const sessionCount = await prisma.userSession.count({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() }
      }
    })
    
    // 3개 이상이면 가장 오래된 세션 삭제
    if (sessionCount >= 3) {
      const oldestSession = await prisma.userSession.findFirst({
        where: {
          userId: user.id,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'asc' }
      })
      
      await prisma.userSession.delete({
        where: { id: oldestSession.id }
      })
      
      // 해당 세션 무효화 처리
    }
    
    // 새 세션 생성
    const jti = crypto.randomUUID()
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: jti,
        device: request.headers['user-agent'],
        ipAddress: request.headers['x-forwarded-for'],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    })
    
    token.jti = jti
  }
  
  return token
}
```

---

## 요약

### 세션 관리 체크리스트

1. ✅ JWT_SECRET이 설정되어 있는가?
2. ✅ 세션 콜백에서 에러 처리하는가?
3. ✅ 사용자 상태를 실시간 확인하는가?
4. ✅ 세션 만료 시 적절히 처리하는가?
5. ✅ 쿠키가 올바르게 설정되어 있는가?
6. ✅ 동시 로그인을 고려했는가?

### 디버깅 팁

**세션 정보 확인**:
```javascript
// 클라이언트
import { useSession } from 'next-auth/react'
const { data: session, status } = useSession()
console.log('Session:', session)
console.log('Status:', status)

// 서버
const session = await getServerSession(authOptions)
console.log('Server session:', session)
```

**JWT 디코딩**:
```javascript
import { getToken } from 'next-auth/jwt'

const token = await getToken({ req: request })
console.log('JWT payload:', token)
```

---

**다음 문서**: [02-oauth-login-exceptions.md](./02-oauth-login-exceptions.md)

