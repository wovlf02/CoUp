# 공통 엣지 케이스

인증 시스템 전반에서 발생할 수 있는 공통 엣지 케이스와 특수 상황을 다룹니다.

---

## 📋 목차

1. [네트워크 관련](#네트워크-관련)
2. [브라우저 관련](#브라우저-관련)
3. [시간 관련](#시간-관련)
4. [동시성 문제](#동시성-문제)
5. [보안 관련](#보안-관련)
6. [접근성 관련](#접근성-관련)

---

## 네트워크 관련

### 1. 네트워크 연결 끊김

#### 시나리오
```
1. 사용자가 로그인 폼 작성
2. 로그인 버튼 클릭
3. 요청 전송 중 네트워크 연결 끊김
4. 사용자는 무한 로딩 상태
```

#### 감지 및 처리

```javascript
// src/lib/api.js
class ApiClient {
  async request(url, options = {}) {
    // 온라인 상태 확인
    if (!navigator.onLine) {
      throw new Error('인터넷 연결이 끊어졌습니다. 연결 상태를 확인해주세요.')
    }
    
    // Timeout 설정
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options.timeout || 30000)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      
      clearTimeout(timeout)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      return await response.json()
      
    } catch (error) {
      clearTimeout(timeout)
      
      // Timeout
      if (error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.')
      }
      
      // Network error
      if (error.message === 'Failed to fetch') {
        throw new Error('서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.')
      }
      
      throw error
    }
  }
}

export const api = new ApiClient()
```

#### UI 반응

```jsx
// src/app/(auth)/sign-in/page.jsx
'use client'

import { useState, useEffect } from 'react'

export default function SignInPage() {
  const [isOnline, setIsOnline] = useState(true)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return (
    <div>
      {!isOnline && (
        <Alert type="warning">
          ⚠️ 인터넷 연결이 끊어졌습니다. 연결을 확인해주세요.
        </Alert>
      )}
      
      <form onSubmit={handleLogin}>
        <button type="submit" disabled={!isOnline}>
          {isOnline ? '로그인' : '연결 대기 중...'}
        </button>
      </form>
    </div>
  )
}
```

---

### 2. 느린 네트워크

#### 증상
요청이 완료되는 데 오래 걸림

#### 처리 방법

**프로그레스 인디케이터**:
```jsx
const [loadingProgress, setLoadingProgress] = useState(0)

const handleLogin = async () => {
  setLoadingProgress(0)
  
  // 가짜 프로그레스 (실제 진행률은 알 수 없음)
  const progressInterval = setInterval(() => {
    setLoadingProgress(prev => {
      if (prev >= 90) return prev
      return prev + 10
    })
  }, 500)
  
  try {
    await signIn('credentials', { email, password })
    setLoadingProgress(100)
  } finally {
    clearInterval(progressInterval)
  }
}

// UI
<div className="progress-bar">
  <div 
    className="progress-fill" 
    style={{ width: `${loadingProgress}%` }}
  />
</div>
```

**재시도 로직**:
```javascript
async function retryRequest(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      
      console.log(`재시도 ${i + 1}/${maxRetries}...`)
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
}

// 사용
const result = await retryRequest(
  () => signIn('credentials', { email, password }),
  3
)
```

---

### 3. CORS 오류

#### 증상
```
Access to fetch at 'https://api.coup.com' from origin 'https://coup.com' 
has been blocked by CORS policy
```

#### 원인
- API 서버가 다른 도메인
- CORS 헤더 설정 오류
- Preflight 요청 실패

#### 해결 방법

**Next.js API Route 사용** (권장):
```javascript
// 모든 인증 API가 /api/auth/* 경로
// Same-origin이므로 CORS 문제 없음
await fetch('/api/auth/login')  // ✅
```

**외부 API 사용 시**:
```javascript
// next.config.mjs
export default {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.coup.com/:path*',
      },
    ]
  },
}
```

---

## 브라우저 관련

### 1. JavaScript 비활성화

#### 감지

```html
<!-- public/index.html 또는 layout -->
<noscript>
  <div style="
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
  ">
    <div>
      <h1>JavaScript가 필요합니다</h1>
      <p>이 사이트를 이용하려면 JavaScript를 활성화해주세요.</p>
      <h3>활성화 방법</h3>
      <ul style="text-align: left; display: inline-block;">
        <li><strong>Chrome:</strong> 설정 → 개인정보 및 보안 → 사이트 설정 → JavaScript</li>
        <li><strong>Firefox:</strong> about:config → javascript.enabled → true</li>
        <li><strong>Safari:</strong> 환경설정 → 보안 → JavaScript 활성화</li>
      </ul>
    </div>
  </div>
</noscript>
```

---

### 2. 쿠키 차단

#### 감지 및 안내

```jsx
'use client'

import { useState, useEffect } from 'react'

function CookieWarning() {
  const [cookiesBlocked, setCookiesBlocked] = useState(false)
  
  useEffect(() => {
    // 쿠키 지원 여부 확인
    const test = 'test-cookie'
    document.cookie = `${test}=1`
    const hasCookie = document.cookie.includes(test)
    document.cookie = `${test}=;expires=Thu, 01 Jan 1970 00:00:00 UTC`
    
    if (!hasCookie) {
      setCookiesBlocked(true)
    }
  }, [])
  
  if (!cookiesBlocked) return null
  
  return (
    <Alert type="error">
      <h3>쿠키가 차단되어 있습니다</h3>
      <p>로그인하려면 쿠키를 활성화해야 합니다.</p>
      <details>
        <summary>해결 방법</summary>
        <ul>
          <li><strong>Chrome:</strong> 설정 → 개인정보 및 보안 → 쿠키 및 사이트 데이터 → "모든 쿠키 허용"</li>
          <li><strong>Firefox:</strong> 설정 → 개인 정보 및 보안 → 쿠키 및 사이트 데이터 → "사용자 지정" → "모든 쿠키 허용"</li>
          <li><strong>Safari:</strong> 환경설정 → 개인 정보 → "모든 쿠키 차단" 해제</li>
        </ul>
      </details>
    </Alert>
  )
}
```

---

### 3. 로컬 스토리지 용량 초과

#### 증상
```
QuotaExceededError: The quota has been exceeded
```

#### 원인
- 로컬 스토리지 한도 (보통 5-10MB)
- 다른 앱이 공간 사용

#### 처리

```javascript
// src/lib/storage.js
export const storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('로컬 스토리지가 가득 찼습니다')
        
        // 오래된 데이터 정리
        this.cleanup()
        
        // 재시도
        try {
          localStorage.setItem(key, JSON.stringify(value))
          return true
        } catch (retryError) {
          console.error('로컬 스토리지 저장 실패:', retryError)
          return false
        }
      }
      return false
    }
  },
  
  cleanup() {
    // 특정 패턴의 키 삭제
    const keysToRemove = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('temp_') || key?.startsWith('cache_')) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log(`정리됨: ${keysToRemove.length}개 항목`)
  }
}
```

---

### 4. 브라우저 호환성

#### 오래된 브라우저 감지

```jsx
'use client'

import { useState, useEffect } from 'react'

function BrowserCompatibility() {
  const [isSupported, setIsSupported] = useState(true)
  
  useEffect(() => {
    // 필수 기능 확인
    const requiredFeatures = [
      'Promise',
      'fetch',
      'localStorage',
      'sessionStorage',
      'URLSearchParams',
    ]
    
    const unsupported = requiredFeatures.filter(feature => 
      !(feature in window)
    )
    
    if (unsupported.length > 0) {
      console.error('지원하지 않는 기능:', unsupported)
      setIsSupported(false)
    }
  }, [])
  
  if (isSupported) return null
  
  return (
    <Alert type="warning">
      <h3>브라우저가 오래되었습니다</h3>
      <p>최신 버전의 브라우저를 사용해주세요.</p>
      <ul>
        <li><a href="https://www.google.com/chrome/">Chrome</a> (권장)</li>
        <li><a href="https://www.mozilla.org/firefox/">Firefox</a></li>
        <li><a href="https://www.microsoft.com/edge">Edge</a></li>
        <li><a href="https://www.apple.com/safari/">Safari</a></li>
      </ul>
    </Alert>
  )
}
```

---

## 시간 관련

### 1. 시스템 시간 불일치

#### 시나리오
사용자의 시스템 시간이 실제 시간과 다름

#### 문제
- JWT 토큰 만료 시간 계산 오류
- "세션이 아직 유효하지 않습니다" 오류

#### 해결 방법

**서버 시간 기준 사용**:
```javascript
// JWT 검증 시 clock tolerance 설정
import jwt from 'jsonwebtoken'

jwt.verify(token, secret, {
  clockTolerance: 60,  // ±60초 허용
})
```

**클라이언트 시간 동기화 확인**:
```javascript
// src/lib/time-sync.js
export async function checkTimeSync() {
  try {
    const response = await fetch('/api/time')
    const { serverTime } = await response.json()
    
    const clientTime = Date.now()
    const diff = Math.abs(clientTime - serverTime)
    
    // 5분 이상 차이
    if (diff > 5 * 60 * 1000) {
      console.warn(`시스템 시간이 ${Math.round(diff / 1000)}초 차이납니다`)
      return {
        synced: false,
        diff: diff / 1000,
        message: '시스템 시간이 정확하지 않습니다. 시간 설정을 확인해주세요.'
      }
    }
    
    return { synced: true }
    
  } catch (error) {
    console.error('시간 동기화 확인 실패:', error)
    return { synced: true }  // 확인 실패 시 무시
  }
}

// src/app/api/time/route.js
export async function GET() {
  return NextResponse.json({
    serverTime: Date.now()
  })
}
```

---

### 2. 타임존 차이

#### 시나리오
사용자가 다른 타임존에서 접속

#### 처리

```javascript
// 항상 UTC로 저장
await prisma.user.create({
  data: {
    createdAt: new Date(),  // UTC로 자동 저장
  }
})

// 클라이언트에서 로컬 시간으로 표시
function formatLocalTime(utcDate) {
  return new Date(utcDate).toLocaleString('ko-KR', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
}
```

---

## 동시성 문제

### 1. Race Condition

#### 시나리오: 중복 회원가입
```
1. 사용자가 회원가입 버튼을 두 번 빠르게 클릭
2. 두 요청이 동시에 서버에 도달
3. 둘 다 이메일 중복 확인 통과
4. 같은 이메일로 두 계정 생성 시도
```

#### 해결 방법

**클라이언트: 버튼 비활성화**
```jsx
const [isSubmitting, setIsSubmitting] = useState(false)

const handleSignup = async (e) => {
  e.preventDefault()
  
  if (isSubmitting) return  // 중복 방지
  
  setIsSubmitting(true)
  
  try {
    await api.post('/api/auth/signup', { email, password, name })
  } finally {
    setIsSubmitting(false)
  }
}

<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? '처리 중...' : '회원가입'}
</button>
```

**서버: 트랜잭션 + Unique Constraint**
```javascript
// Prisma Schema
model User {
  email String @unique  // 데이터베이스 레벨 제약
}

// API
try {
  const user = await prisma.user.create({
    data: { email, password, name }
  })
} catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation
    return { error: '이미 사용 중인 이메일입니다' }
  }
  throw error
}
```

---

### 2. 동시 로그인 시도

#### 시나리오
사용자가 여러 탭에서 동시에 로그인 시도

#### 현상
- 세션 토큰 충돌
- 예기치 않은 로그아웃

#### 해결 방법

**BroadcastChannel로 동기화**:
```javascript
// src/contexts/AuthSyncContext.jsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AuthSyncProvider({ children }) {
  const router = useRouter()
  
  useEffect(() => {
    const channel = new BroadcastChannel('auth-channel')
    
    channel.onmessage = (event) => {
      if (event.data.type === 'LOGIN_SUCCESS') {
        // 다른 탭에서 로그인 성공
        router.refresh()
      }
      
      if (event.data.type === 'LOGOUT') {
        // 다른 탭에서 로그아웃
        window.location.href = '/sign-in'
      }
    }
    
    return () => channel.close()
  }, [router])
  
  return children
}

// 로그인 성공 시
const handleLogin = async () => {
  await signIn('credentials', { email, password })
  
  // 다른 탭에 알림
  const channel = new BroadcastChannel('auth-channel')
  channel.postMessage({ type: 'LOGIN_SUCCESS' })
  channel.close()
}
```

---

## 보안 관련

### 1. SQL Injection 방지

#### Prisma 사용 시 자동 방어

```javascript
// ✅ 안전 (Prisma가 자동으로 이스케이프)
const user = await prisma.user.findUnique({
  where: { email: userInput }
})

// ❌ 위험 (Raw query)
const users = await prisma.$queryRaw`
  SELECT * FROM User WHERE email = ${userInput}
`
// → Prisma.sql 사용
const users = await prisma.$queryRaw(
  Prisma.sql`SELECT * FROM User WHERE email = ${userInput}`
)
```

---

### 2. XSS 방지

#### React/Next.js의 자동 이스케이프

```jsx
// ✅ 안전 (자동 이스케이프)
<p>{userInput}</p>

// ❌ 위험
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ HTML sanitize 후 사용
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userInput) 
}} />
```

---

### 3. CSRF 방지

#### NextAuth의 자동 CSRF 보호

```javascript
// NextAuth가 자동으로 처리
// - CSRF 토큰 생성
// - 요청마다 토큰 검증
// - 토큰 불일치 시 요청 거부
```

**추가 보호 (API Routes)**:
```javascript
// src/middleware.js
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
  // POST 요청에 CSRF 토큰 검증
  if (request.method === 'POST') {
    const token = await getToken({ req: request })
    const csrfToken = request.headers.get('x-csrf-token')
    
    if (!token || !csrfToken) {
      return new Response('Forbidden', { status: 403 })
    }
  }
  
  return NextResponse.next()
}
```

---

### 4. 비밀번호 해싱

#### bcrypt 사용

```javascript
import bcrypt from 'bcryptjs'

// ✅ 안전한 해싱
const hashedPassword = await bcrypt.hash(password, 10)

// ❌ 위험 (Salt rounds 너무 낮음)
const hashedPassword = await bcrypt.hash(password, 1)

// ❌ 위험 (평문 저장)
const user = await prisma.user.create({
  data: { password }  // 평문 저장 금지!
})
```

---

## 접근성 관련

### 1. 스크린 리더 지원

```jsx
<form onSubmit={handleLogin} aria-label="로그인 폼">
  <div>
    <label htmlFor="email">이메일</label>
    <input
      id="email"
      type="email"
      aria-required="true"
      aria-invalid={!!formErrors.email}
      aria-describedby={formErrors.email ? "email-error" : undefined}
    />
    {formErrors.email && (
      <span id="email-error" role="alert" className="error">
        {formErrors.email}
      </span>
    )}
  </div>
  
  <button 
    type="submit" 
    disabled={loading}
    aria-busy={loading}
  >
    {loading ? '로그인 중...' : '로그인'}
  </button>
</form>
```

---

### 2. 키보드 네비게이션

```jsx
// Enter 키로 폼 제출
<input
  type="email"
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleLogin()
    }
  }}
/>

// Tab 순서 제어
<input tabIndex={1} />
<input tabIndex={2} />
<button tabIndex={3}>로그인</button>
```

---

### 3. 포커스 관리

```jsx
import { useRef, useEffect } from 'react'

function SignInPage() {
  const emailInputRef = useRef(null)
  
  useEffect(() => {
    // 페이지 로드 시 이메일 입력창에 포커스
    emailInputRef.current?.focus()
  }, [])
  
  return (
    <input
      ref={emailInputRef}
      type="email"
      autoFocus
    />
  )
}
```

---

## 요약

### 공통 예외 처리 체크리스트

#### 네트워크
- ✅ 오프라인 감지 및 안내
- ✅ 타임아웃 처리
- ✅ 재시도 로직
- ✅ 에러 메시지 표시

#### 브라우저
- ✅ JavaScript 활성화 확인
- ✅ 쿠키 활성화 확인
- ✅ 로컬 스토리지 용량 관리
- ✅ 브라우저 호환성 체크

#### 시간
- ✅ 서버 시간 기준 사용
- ✅ Clock tolerance 설정
- ✅ UTC로 저장, 로컬로 표시

#### 동시성
- ✅ 중복 제출 방지
- ✅ Race condition 처리
- ✅ 탭 간 동기화

#### 보안
- ✅ SQL Injection 방지
- ✅ XSS 방지
- ✅ CSRF 방지
- ✅ 비밀번호 해싱

#### 접근성
- ✅ 스크린 리더 지원
- ✅ 키보드 네비게이션
- ✅ ARIA 속성

---

**다음 문서**: [99-exception-handling-best-practices.md](./99-exception-handling-best-practices.md)

