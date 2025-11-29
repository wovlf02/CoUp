# 예외 처리 모범 사례

인증 시스템의 예외 처리 및 에러 핸들링을 위한 모범 사례를 정리합니다.

---

## 📋 목차

1. [에러 핸들링 패턴](#에러-핸들링-패턴)
2. [로깅 전략](#로깅-전략)
3. [사용자 피드백](#사용자-피드백)
4. [모니터링 및 알림](#모니터링-및-알림)
5. [테스팅 전략](#테스팅-전략)
6. [문서화](#문서화)

---

## 에러 핸들링 패턴

### 1. 계층별 에러 처리

#### 아키텍처

```
┌─────────────┐
│  Client UI  │ → 사용자 친화적 메시지
├─────────────┤
│  API Route  │ → HTTP 상태 코드 및 에러 응답
├─────────────┤
│   Service   │ → 비즈니스 로직 예외
├─────────────┤
│  Database   │ → 데이터 접근 예외
└─────────────┘
```

#### 구현 예시

**Database Layer**:
```javascript
// src/lib/db/user-repository.js
export class UserRepository {
  async findByEmail(email) {
    try {
      return await prisma.user.findUnique({
        where: { email }
      })
    } catch (error) {
      // Prisma 에러를 커스텀 에러로 변환
      if (error.code === 'P2024') {
        throw new DatabaseConnectionError('Database connection timeout')
      }
      throw new DatabaseError('Failed to query user', { cause: error })
    }
  }
}
```

**Service Layer**:
```javascript
// src/lib/services/auth-service.js
export class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository
  }
  
  async login(email, password) {
    // 1. 입력 검증
    if (!email || !password) {
      throw new ValidationError('Email and password are required')
    }
    
    // 2. 사용자 조회
    const user = await this.userRepository.findByEmail(email)
    
    if (!user) {
      // 보안: 사용자 존재 여부 노출 금지
      throw new AuthenticationError('Invalid credentials')
    }
    
    // 3. 비밀번호 검증
    const isValid = await bcrypt.compare(password, user.password)
    
    if (!isValid) {
      throw new AuthenticationError('Invalid credentials')
    }
    
    // 4. 계정 상태 확인
    if (user.status === 'SUSPENDED') {
      throw new AccountSuspendedError('Account is suspended', {
        reason: user.suspendReason,
        until: user.suspendedUntil
      })
    }
    
    if (user.status === 'DELETED') {
      throw new AccountDeletedError('Account is deleted')
    }
    
    return user
  }
}
```

**API Layer**:
```javascript
// src/app/api/auth/login/route.js
import { AuthService } from '@/lib/services/auth-service'
import { UserRepository } from '@/lib/db/user-repository'
import { 
  ValidationError, 
  AuthenticationError, 
  AccountSuspendedError,
  AccountDeletedError,
  DatabaseError 
} from '@/lib/errors'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    
    const authService = new AuthService(new UserRepository())
    const user = await authService.login(email, password)
    
    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email } 
    })
    
  } catch (error) {
    console.error('[API] Login error:', error)
    
    // 에러 타입별 응답
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 일치하지 않습니다' },
        { status: 401 }
      )
    }
    
    if (error instanceof AccountSuspendedError) {
      return NextResponse.json(
        { 
          error: '정지된 계정입니다',
          reason: error.reason,
          until: error.until 
        },
        { status: 403 }
      )
    }
    
    if (error instanceof AccountDeletedError) {
      return NextResponse.json(
        { error: '삭제된 계정입니다' },
        { status: 410 }
      )
    }
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: '일시적인 오류가 발생했습니다' },
        { status: 503 }
      )
    }
    
    // 예상치 못한 에러
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
```

**Client Layer**:
```jsx
// src/app/(auth)/sign-in/page.jsx
const handleLogin = async (e) => {
  e.preventDefault()
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      // HTTP 상태 코드별 처리
      switch (response.status) {
        case 400:
          setError(data.error || '입력값을 확인해주세요')
          break
        case 401:
          setError('이메일 또는 비밀번호가 일치하지 않습니다')
          break
        case 403:
          setError(`정지된 계정입니다. ${data.reason || ''}`)
          break
        case 410:
          setError('삭제된 계정입니다')
          break
        case 503:
          setError('서버가 일시적으로 사용 불가능합니다. 잠시 후 다시 시도해주세요.')
          break
        default:
          setError('로그인 중 오류가 발생했습니다')
      }
      return
    }
    
    // 성공
    router.push('/dashboard')
    
  } catch (error) {
    console.error('Login error:', error)
    
    // 네트워크 에러
    if (error.message === 'Failed to fetch') {
      setError('네트워크 연결을 확인해주세요')
    } else {
      setError('로그인 중 오류가 발생했습니다')
    }
  }
}
```

---

### 2. 커스텀 에러 클래스

```javascript
// src/lib/errors.js

/**
 * 기본 에러 클래스
 */
export class AppError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = options.statusCode || 500
    this.code = options.code
    this.details = options.details
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * 유효성 검사 에러 (400)
 */
export class ValidationError extends AppError {
  constructor(message, details) {
    super(message, { statusCode: 400, code: 'VALIDATION_ERROR', details })
  }
}

/**
 * 인증 실패 에러 (401)
 */
export class AuthenticationError extends AppError {
  constructor(message) {
    super(message, { statusCode: 401, code: 'AUTHENTICATION_ERROR' })
  }
}

/**
 * 권한 없음 에러 (403)
 */
export class AuthorizationError extends AppError {
  constructor(message) {
    super(message, { statusCode: 403, code: 'AUTHORIZATION_ERROR' })
  }
}

/**
 * 계정 정지 에러 (403)
 */
export class AccountSuspendedError extends AppError {
  constructor(message, { reason, until }) {
    super(message, { 
      statusCode: 403, 
      code: 'ACCOUNT_SUSPENDED',
      details: { reason, until }
    })
    this.reason = reason
    this.until = until
  }
}

/**
 * 계정 삭제 에러 (410)
 */
export class AccountDeletedError extends AppError {
  constructor(message) {
    super(message, { statusCode: 410, code: 'ACCOUNT_DELETED' })
  }
}

/**
 * 리소스를 찾을 수 없음 (404)
 */
export class NotFoundError extends AppError {
  constructor(message) {
    super(message, { statusCode: 404, code: 'NOT_FOUND' })
  }
}

/**
 * 중복 리소스 에러 (409)
 */
export class DuplicateError extends AppError {
  constructor(message, field) {
    super(message, { 
      statusCode: 409, 
      code: 'DUPLICATE_ERROR',
      details: { field }
    })
  }
}

/**
 * 데이터베이스 에러 (503)
 */
export class DatabaseError extends AppError {
  constructor(message, options = {}) {
    super(message, { 
      statusCode: 503, 
      code: 'DATABASE_ERROR',
      ...options
    })
  }
}

/**
 * 데이터베이스 연결 에러 (503)
 */
export class DatabaseConnectionError extends DatabaseError {
  constructor(message) {
    super(message, { code: 'DATABASE_CONNECTION_ERROR' })
  }
}

/**
 * 레이트 리밋 초과 (429)
 */
export class RateLimitError extends AppError {
  constructor(message, retryAfter) {
    super(message, { 
      statusCode: 429, 
      code: 'RATE_LIMIT_EXCEEDED',
      details: { retryAfter }
    })
    this.retryAfter = retryAfter
  }
}
```

---

### 3. 에러 핸들러 미들웨어

```javascript
// src/lib/api-handler.js
import { AppError } from './errors'

/**
 * API 라우트 핸들러 래퍼
 */
export function apiHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context)
      
    } catch (error) {
      console.error('[API] Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
      
      // AppError 인스턴스
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            details: error.details,
          },
          { 
            status: error.statusCode,
            headers: error instanceof RateLimitError 
              ? { 'Retry-After': error.retryAfter.toString() }
              : {}
          }
        )
      }
      
      // Prisma 에러
      if (error.code?.startsWith('P')) {
        return handlePrismaError(error)
      }
      
      // Zod 에러
      if (error.name === 'ZodError') {
        return NextResponse.json(
          {
            error: '입력값이 올바르지 않습니다',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
          { status: 400 }
        )
      }
      
      // 예상치 못한 에러
      return NextResponse.json(
        {
          error: '서버 오류가 발생했습니다',
          code: 'INTERNAL_SERVER_ERROR',
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Prisma 에러 처리
 */
function handlePrismaError(error) {
  switch (error.code) {
    case 'P2002':
      return NextResponse.json(
        { 
          error: '이미 존재하는 데이터입니다',
          code: 'DUPLICATE_ERROR',
        },
        { status: 409 }
      )
      
    case 'P2024':
      return NextResponse.json(
        {
          error: '데이터베이스 연결 시간 초과',
          code: 'DATABASE_TIMEOUT',
        },
        { status: 503 }
      )
      
    case 'P2025':
      return NextResponse.json(
        {
          error: '데이터를 찾을 수 없습니다',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      )
      
    default:
      return NextResponse.json(
        {
          error: '데이터베이스 오류가 발생했습니다',
          code: 'DATABASE_ERROR',
        },
        { status: 500 }
      )
  }
}

// 사용 예시
// src/app/api/auth/login/route.js
import { apiHandler } from '@/lib/api-handler'

export const POST = apiHandler(async (request) => {
  const { email, password } = await request.json()
  
  // 에러 발생 시 자동으로 처리됨
  const user = await authService.login(email, password)
  
  return NextResponse.json({ success: true, user })
})
```

---

## 로깅 전략

### 1. 로그 레벨

```javascript
// src/lib/logger.js

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
}

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO'
  }
  
  error(message, meta = {}) {
    if (this.shouldLog('ERROR')) {
      console.error('❌ [ERROR]', message, meta)
      
      // 프로덕션에서는 외부 서비스로 전송
      if (process.env.NODE_ENV === 'production') {
        this.sendToExternalService('error', message, meta)
      }
    }
  }
  
  warn(message, meta = {}) {
    if (this.shouldLog('WARN')) {
      console.warn('⚠️ [WARN]', message, meta)
    }
  }
  
  info(message, meta = {}) {
    if (this.shouldLog('INFO')) {
      console.log('ℹ️ [INFO]', message, meta)
    }
  }
  
  debug(message, meta = {}) {
    if (this.shouldLog('DEBUG')) {
      console.log('🔍 [DEBUG]', message, meta)
    }
  }
  
  shouldLog(level) {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.level]
  }
  
  sendToExternalService(level, message, meta) {
    // Sentry, LogRocket, Datadog 등
    // 예시: Sentry
    // Sentry.captureException(new Error(message), { extra: meta })
  }
}

export const logger = new Logger()
```

---

### 2. 구조화된 로깅

```javascript
// src/lib/auth.js
import { logger } from '@/lib/logger'

async authorize(credentials) {
  const requestId = crypto.randomUUID()
  
  logger.info('Login attempt started', {
    requestId,
    email: credentials.email,
    timestamp: new Date().toISOString(),
  })
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    })
    
    if (!user) {
      logger.warn('User not found', {
        requestId,
        email: credentials.email,
      })
      throw new Error('Invalid credentials')
    }
    
    const isValid = await bcrypt.compare(credentials.password, user.password)
    
    if (!isValid) {
      logger.warn('Invalid password', {
        requestId,
        userId: user.id,
      })
      throw new Error('Invalid credentials')
    }
    
    logger.info('Login successful', {
      requestId,
      userId: user.id,
      email: user.email,
    })
    
    return user
    
  } catch (error) {
    logger.error('Login failed', {
      requestId,
      email: credentials.email,
      error: error.message,
      stack: error.stack,
    })
    throw error
  }
}
```

---

### 3. 민감 정보 마스킹

```javascript
// src/lib/logger.js

function maskSensitiveData(data) {
  const sensitive = ['password', 'token', 'secret', 'apiKey']
  
  if (typeof data === 'object' && data !== null) {
    return Object.keys(data).reduce((acc, key) => {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        acc[key] = '***REDACTED***'
      } else if (typeof data[key] === 'object') {
        acc[key] = maskSensitiveData(data[key])
      } else {
        acc[key] = data[key]
      }
      return acc
    }, {})
  }
  
  return data
}

// 사용
logger.info('User data', maskSensitiveData({
  email: 'user@example.com',
  password: 'secret123',  // -> '***REDACTED***'
  apiToken: 'abc123',     // -> '***REDACTED***'
}))
```

---

## 사용자 피드백

### 1. 에러 메시지 작성 가이드

#### ❌ 나쁜 예
```
"Error: 500"
"Database connection failed"
"Invalid input"
```

#### ✅ 좋은 예
```
"일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
"이메일 또는 비밀번호가 일치하지 않습니다."
"이메일 형식이 올바르지 않습니다."
```

#### 가이드라인

1. **명확하고 구체적으로**
   - "오류가 발생했습니다" ❌
   - "네트워크 연결을 확인해주세요" ✅

2. **사용자 언어 사용**
   - "Authentication failed" ❌
   - "로그인에 실패했습니다" ✅

3. **해결 방법 제시**
   - "에러가 발생했습니다" ❌
   - "비밀번호를 8자 이상 입력해주세요" ✅

4. **긍정적인 톤**
   - "잘못된 입력입니다" ❌
   - "올바른 이메일 형식을 입력해주세요" ✅

---

### 2. Toast 알림

```jsx
// src/components/Toast.jsx
'use client'

import { useState, useEffect } from 'react'
import styles from './Toast.module.css'

export function Toast({ message, type = 'info', duration = 5000, onClose }) {
  const [visible, setVisible] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duration)
    
    return () => clearTimeout(timer)
  }, [duration, onClose])
  
  if (!visible) return null
  
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
  }
  
  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <span className={styles.icon}>{icons[type]}</span>
      <span className={styles.message}>{message}</span>
      <button 
        className={styles.close} 
        onClick={() => {
          setVisible(false)
          onClose?.()
        }}
        aria-label="닫기"
      >
        ×
      </button>
    </div>
  )
}

// Toast 컨텍스트
// src/contexts/ToastContext.jsx
'use client'

import { createContext, useContext, useState } from 'react'
import { Toast } from '@/components/Toast'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  
  const showToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])
  }
  
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }
  
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

// 사용
const { showToast } = useToast()

try {
  await signIn('credentials', { email, password })
  showToast('로그인 성공!', 'success')
} catch (error) {
  showToast(error.message, 'error')
}
```

---

## 모니터링 및 알림

### 1. Sentry 통합

```javascript
// src/lib/sentry.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  
  beforeSend(event, hint) {
    // 민감 정보 필터링
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.Authorization
    }
    
    return event
  },
})

// 인증 에러 추적
export function trackAuthError(error, context = {}) {
  Sentry.captureException(error, {
    tags: {
      type: 'auth',
      method: context.method || 'unknown',
    },
    extra: {
      email: context.email,
      provider: context.provider,
    },
  })
}

// 사용
// src/lib/auth.js
import { trackAuthError } from '@/lib/sentry'

async authorize(credentials) {
  try {
    // ...
  } catch (error) {
    trackAuthError(error, {
      method: 'credentials',
      email: credentials.email,
    })
    throw error
  }
}
```

---

### 2. 메트릭 수집

```javascript
// src/lib/metrics.js

class MetricsCollector {
  constructor() {
    this.metrics = new Map()
  }
  
  increment(name, labels = {}) {
    const key = this.getKey(name, labels)
    const current = this.metrics.get(key) || 0
    this.metrics.set(key, current + 1)
  }
  
  gauge(name, value, labels = {}) {
    const key = this.getKey(name, labels)
    this.metrics.set(key, value)
  }
  
  timing(name, duration, labels = {}) {
    const key = this.getKey(name, labels)
    this.metrics.set(key, duration)
  }
  
  getKey(name, labels) {
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',')
    return `${name}{${labelStr}}`
  }
  
  export() {
    return Array.from(this.metrics.entries()).map(([key, value]) => ({
      metric: key,
      value,
    }))
  }
}

export const metrics = new MetricsCollector()

// 사용
// src/lib/auth.js
import { metrics } from '@/lib/metrics'

async authorize(credentials) {
  const startTime = Date.now()
  
  try {
    const user = await this.login(credentials)
    
    metrics.increment('auth.login.success', {
      provider: 'credentials'
    })
    
    return user
    
  } catch (error) {
    metrics.increment('auth.login.failure', {
      provider: 'credentials',
      reason: error.name
    })
    
    throw error
    
  } finally {
    const duration = Date.now() - startTime
    metrics.timing('auth.login.duration', duration, {
      provider: 'credentials'
    })
  }
}

// API 엔드포인트
// src/app/api/metrics/route.js
export async function GET() {
  return NextResponse.json(metrics.export())
}
```

---

## 테스팅 전략

### 1. 단위 테스트

```javascript
// tests/lib/auth-service.test.js
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { AuthService } from '@/lib/services/auth-service'
import { AuthenticationError, AccountSuspendedError } from '@/lib/errors'

describe('AuthService', () => {
  let authService
  let mockUserRepository
  
  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
    }
    authService = new AuthService(mockUserRepository)
  })
  
  describe('login', () => {
    it('should throw ValidationError when email is missing', async () => {
      await expect(
        authService.login('', 'password123')
      ).rejects.toThrow(ValidationError)
    })
    
    it('should throw AuthenticationError when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null)
      
      await expect(
        authService.login('test@example.com', 'password123')
      ).rejects.toThrow(AuthenticationError)
    })
    
    it('should throw AuthenticationError when password is invalid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        email: 'test@example.com',
        password: await bcrypt.hash('correctpassword', 10),
        status: 'ACTIVE',
      })
      
      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow(AuthenticationError)
    })
    
    it('should throw AccountSuspendedError when account is suspended', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        status: 'SUSPENDED',
        suspendReason: 'Spam',
      })
      
      await expect(
        authService.login('test@example.com', 'password123')
      ).rejects.toThrow(AccountSuspendedError)
    })
    
    it('should return user when login is successful', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        status: 'ACTIVE',
      }
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser)
      
      const user = await authService.login('test@example.com', 'password123')
      
      expect(user).toEqual(mockUser)
    })
  })
})
```

---

### 2. 통합 테스트

```javascript
// tests/api/auth/login.test.js
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { POST } from '@/app/api/auth/login/route'

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    // 테스트 사용자 생성
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
        status: 'ACTIVE',
      }
    })
  })
  
  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' }
    })
  })
  
  it('should return 400 when email is missing', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'password123' })
    })
    
    const response = await POST(request)
    expect(response.status).toBe(400)
  })
  
  it('should return 401 when credentials are invalid', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
    })
    
    const response = await POST(request)
    expect(response.status).toBe(401)
  })
  
  it('should return 200 when login is successful', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.user.email).toBe('test@example.com')
  })
})
```

---

## 문서화

### 1. API 문서

```yaml
# docs/api/auth/login.yaml
openapi: 3.0.0
info:
  title: CoUp Authentication API
  version: 1.0.0

paths:
  /api/auth/login:
    post:
      summary: 사용자 로그인
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                  example: user@example.com
                password:
                  type: string
                  format: password
                  example: password123
      responses:
        '200':
          description: 로그인 성공
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  user:
                    type: object
                    properties:
                      id:
                        type: string
                      email:
                        type: string
        '400':
          description: 입력값 오류
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: "이메일을 입력해주세요"
        '401':
          description: 인증 실패
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: "이메일 또는 비밀번호가 일치하지 않습니다"
```

---

## 요약

### 예외 처리 체크리스트

#### 에러 핸들링
- ✅ 계층별로 에러 처리
- ✅ 커스텀 에러 클래스 사용
- ✅ 에러 핸들러 미들웨어 적용

#### 로깅
- ✅ 구조화된 로깅
- ✅ 민감 정보 마스킹
- ✅ 로그 레벨 구분

#### 사용자 피드백
- ✅ 명확한 에러 메시지
- ✅ Toast 알림 구현
- ✅ 로딩 상태 표시

#### 모니터링
- ✅ Sentry 통합
- ✅ 메트릭 수집
- ✅ 알림 설정

#### 테스팅
- ✅ 단위 테스트 작성
- ✅ 통합 테스트 작성
- ✅ E2E 테스트 작성

#### 문서화
- ✅ API 문서 작성
- ✅ 에러 코드 정의
- ✅ 예외 상황 문서화

---

**이 문서는 CoUp 인증 시스템의 예외 처리 가이드라인입니다.**

**업데이트**: 2025-11-29

