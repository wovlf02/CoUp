# 회원가입 예외 처리

이메일/비밀번호 기반 회원가입에서 발생할 수 있는 모든 예외 상황을 다룹니다.

---

## 📋 목차

1. [유효성 검사 예외](#유효성-검사-예외)
2. [이메일 중복 예외](#이메일-중복-예외)
3. [데이터베이스 예외](#데이터베이스-예외)
4. [이메일 인증 예외](#이메일-인증-예외)
5. [레이트 리미팅](#레이트-리미팅)

---

## 유효성 검사 예외

### 1. 이메일 형식 오류

#### 증상
```
"올바른 이메일 형식이 아닙니다"
```

#### 발생 위치
```javascript
// src/app/api/auth/signup/route.js
const signupSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  // ...
})
```

#### 클라이언트 검증

```javascript
// src/app/(auth)/sign-up/page.jsx
const validateEmail = (email) => {
  // 기본 이메일 형식
  const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  // 더 엄격한 검증 (선택사항)
  const strictRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  return strictRegex.test(email)
}

const validateForm = () => {
  const errors = {}
  
  if (!email) {
    errors.email = '이메일을 입력해주세요'
  } else if (!validateEmail(email)) {
    errors.email = '올바른 이메일 형식이 아닙니다'
  }
  
  setFormErrors(errors)
  return Object.keys(errors).length === 0
}
```

#### 엣지 케이스

**Case 1: 유효한 특수 문자**
```javascript
// 모두 유효한 이메일
"user+tag@example.com"      // + 허용
"user.name@example.com"     // . 허용
"user_name@example.com"     // _ 허용
"user-name@example.com"     // - 허용
```

**Case 2: 무효한 이메일**
```javascript
// 모두 무효
"user@"                     // 도메인 없음
"@example.com"              // 로컬 파트 없음
"user @example.com"         // 공백 포함
"user@example"              // TLD 없음
"user..name@example.com"    // 연속된 점
".user@example.com"         // 시작이 점
"user.@example.com"         // 끝이 점
```

**Case 3: 국제 이메일 (IDN)**
```javascript
// Punycode 변환 필요
"사용자@한글.com" -> "사용자@xn--bj0bj06e.com"
```

---

### 2. 비밀번호 규칙 위반

#### 증상
```
"비밀번호는 최소 8자 이상이어야 합니다"
```

#### 현재 규칙

```javascript
// src/app/api/auth/signup/route.js
password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다")
```

#### 강화된 비밀번호 규칙 (선택사항)

```javascript
const passwordSchema = z.string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .max(100, '비밀번호는 최대 100자까지 가능합니다')
  .regex(/[a-z]/, '소문자를 최소 1개 포함해야 합니다')
  .regex(/[A-Z]/, '대문자를 최소 1개 포함해야 합니다')
  .regex(/[0-9]/, '숫자를 최소 1개 포함해야 합니다')
  .regex(/[^a-zA-Z0-9]/, '특수문자를 최소 1개 포함해야 합니다')
```

#### 비밀번호 강도 표시

```jsx
// src/app/(auth)/sign-up/_components/PasswordStrength.jsx
'use client'

export default function PasswordStrength({ password }) {
  const calculateStrength = (pwd) => {
    let strength = 0
    
    if (pwd.length >= 8) strength += 1
    if (pwd.length >= 12) strength += 1
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 1
    if (/[0-9]/.test(pwd)) strength += 1
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 1
    
    return strength
  }
  
  const strength = calculateStrength(password)
  
  const levels = ['매우 약함', '약함', '보통', '강함', '매우 강함']
  const colors = ['#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#27ae60']
  
  if (!password) return null
  
  return (
    <div className="password-strength">
      <div className="strength-bar">
        <div 
          className="strength-fill"
          style={{
            width: `${(strength / 5) * 100}%`,
            backgroundColor: colors[strength - 1]
          }}
        />
      </div>
      <p style={{ color: colors[strength - 1] }}>
        {levels[strength - 1]}
      </p>
      
      <ul className="requirements">
        <li className={password.length >= 8 ? 'met' : ''}>
          ✓ 8자 이상
        </li>
        <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'met' : ''}>
          ✓ 대소문자 포함
        </li>
        <li className={/[0-9]/.test(password) ? 'met' : ''}>
          ✓ 숫자 포함
        </li>
        <li className={/[^a-zA-Z0-9]/.test(password) ? 'met' : ''}>
          ✓ 특수문자 포함
        </li>
      </ul>
    </div>
  )
}
```

---

### 3. 이름 규칙 위반

#### 증상
```
"이름은 최소 2자 이상이어야 합니다"
```

#### 현재 규칙

```javascript
name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다")
```

#### 강화된 이름 검증

```javascript
const nameSchema = z.string()
  .min(2, '이름은 최소 2자 이상이어야 합니다')
  .max(50, '이름은 최대 50자까지 가능합니다')
  .regex(/^[가-힣a-zA-Z\s]+$/, '이름은 한글 또는 영문만 사용 가능합니다')
  .refine(
    (name) => name.trim().length > 0,
    '이름은 공백만으로 구성될 수 없습니다'
  )
```

#### 엣지 케이스

**Case 1: 특수문자 이름**
```javascript
"홍길-동"    // 하이픈 허용?
"O'Brien"   // 아포스트로피 허용?
"김 철수"    // 공백 허용?
```

**Case 2: 외국인 이름**
```javascript
"João Silva"        // 액센트 허용?
"Müller"           // 움라우트 허용?
"Владимир"         // 키릴 문자 허용?
```

**허용적인 검증 (권장)**:
```javascript
const nameSchema = z.string()
  .min(2, '이름은 최소 2자 이상이어야 합니다')
  .max(50, '이름은 최대 50자까지 가능합니다')
  .regex(/^[^\d<>{}[\]]+$/, '이름에 숫자나 특수기호를 사용할 수 없습니다')
```

---

## 이메일 중복 예외

### 1. 이메일 이미 존재

#### 증상
```
"이미 사용 중인 이메일입니다"
```

#### 발생 위치
```javascript
// src/app/api/auth/signup/route.js
const existingUser = await prisma.user.findUnique({
  where: { email: validatedData.email }
})

if (existingUser) {
  return NextResponse.json(
    { error: "이미 사용 중인 이메일입니다" },
    { status: 400 }
  )
}
```

#### 보안 고려사항

**❌ 나쁜 예** (정보 노출):
```javascript
if (existingUser) {
  if (existingUser.status === 'DELETED') {
    return { error: "삭제된 계정입니다" }
  }
  if (existingUser.provider === 'GOOGLE') {
    return { error: "이 이메일은 Google 계정으로 가입되어 있습니다" }
  }
}
```
→ 공격자가 이메일 존재 여부와 가입 방법을 알 수 있음

**✅ 좋은 예** (정보 숨김):
```javascript
if (existingUser) {
  return { error: "이미 사용 중인 이메일입니다" }
}
```
→ 추가 정보 노출 없음

#### 처리 방법

**Option 1: 단순 거부**
```javascript
if (existingUser) {
  return NextResponse.json(
    { error: "이미 사용 중인 이메일입니다" },
    { status: 400 }
  )
}
```

**Option 2: 로그인 유도**
```javascript
if (existingUser) {
  return NextResponse.json(
    { 
      error: "이미 가입된 이메일입니다",
      suggestion: "로그인 페이지로 이동하시겠습니까?",
      redirectTo: "/sign-in"
    },
    { status: 400 }
  )
}
```

**Option 3: 삭제된 계정 복구**
```javascript
if (existingUser) {
  if (existingUser.status === 'DELETED') {
    // 삭제된 지 30일 이내만 복구 가능
    const deletedAt = new Date(existingUser.deletedAt)
    const daysSinceDeleted = (Date.now() - deletedAt) / (1000 * 60 * 60 * 24)
    
    if (daysSinceDeleted <= 30) {
      return NextResponse.json(
        {
          error: "이전에 삭제된 계정입니다",
          suggestion: "계정을 복구하시겠습니까?",
          action: "restore"
        },
        { status: 400 }
      )
    }
  }
  
  return NextResponse.json(
    { error: "이미 사용 중인 이메일입니다" },
    { status: 400 }
  )
}
```

---

### 2. 이메일 사용 가능 여부 실시간 확인

#### API 구현

```javascript
// src/app/api/auth/check-email/route.js
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ available: false }, { status: 400 })
    }
    
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true }
    })
    
    return NextResponse.json({
      available: !existingUser,
      email
    })
    
  } catch (error) {
    console.error('Check email error:', error)
    return NextResponse.json({ available: false }, { status: 500 })
  }
}
```

#### 클라이언트 구현

```javascript
// src/app/(auth)/sign-up/page.jsx
const [emailAvailable, setEmailAvailable] = useState(null)
const [checkingEmail, setCheckingEmail] = useState(false)

// Debounce 함수
const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 이메일 확인 (Debounced)
const checkEmailAvailability = debounce(async (email) => {
  if (!validateEmail(email)) {
    setEmailAvailable(null)
    return
  }
  
  setCheckingEmail(true)
  
  try {
    const response = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    
    const data = await response.json()
    setEmailAvailable(data.available)
    
  } catch (error) {
    console.error('이메일 확인 오류:', error)
    setEmailAvailable(null)
  } finally {
    setCheckingEmail(false)
  }
}, 500)

const handleEmailChange = (e) => {
  const value = e.target.value
  setEmail(value)
  checkEmailAvailability(value)
}

// UI
<div className="form-field">
  <input
    type="email"
    value={email}
    onChange={handleEmailChange}
    placeholder="이메일"
  />
  
  {checkingEmail && <span>확인 중...</span>}
  
  {emailAvailable === true && (
    <span className="success">✓ 사용 가능한 이메일입니다</span>
  )}
  
  {emailAvailable === false && (
    <span className="error">✗ 이미 사용 중인 이메일입니다</span>
  )}
</div>
```

---

## 데이터베이스 예외

### 1. 트랜잭션 실패

#### 증상
회원가입 요청 후 500 에러

#### 원인

**Case 1: Unique Constraint Violation**
```javascript
// 동시에 같은 이메일로 가입 시도
// Race condition
Prisma Error: P2002
Unique constraint failed on the fields: (`email`)
```

**Case 2: 데이터베이스 연결 실패**
```javascript
Prisma Error: P2024
Timed out fetching a new connection from the connection pool.
```

#### 해결 방법

**에러 처리**:
```javascript
// src/app/api/auth/signup/route.js
export async function POST(request) {
  try {
    const body = await request.json()
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
        name: validatedData.name,
        avatar: validatedData.avatar,
        provider: 'CREDENTIALS',
        role: 'USER',
        status: 'ACTIVE',
      }
    })
    
    return NextResponse.json(
      {
        success: true,
        message: "회원가입이 완료되었습니다",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Signup error:', error)
    
    // Zod 유효성 검사 오류
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    // Prisma 오류
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다" },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2024') {
      return NextResponse.json(
        { error: "서버가 혼잡합니다. 잠시 후 다시 시도해주세요." },
        { status: 503 }
      )
    }
    
    // 일반 오류
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

### 2. bcrypt 해싱 실패

#### 증상
```
Error: data and hash arguments required
```

#### 원인
- 비밀번호가 빈 문자열
- bcrypt 라이브러리 오류

#### 해결 방법

```javascript
try {
  // 비밀번호 검증
  if (!validatedData.password || validatedData.password.length === 0) {
    throw new Error('Password is required')
  }
  
  // 해싱
  const hashedPassword = await bcrypt.hash(validatedData.password, 10)
  
  if (!hashedPassword) {
    throw new Error('Password hashing failed')
  }
  
  // 사용자 생성
  // ...
  
} catch (error) {
  if (error.message.includes('hash')) {
    return NextResponse.json(
      { error: '비밀번호 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
  throw error
}
```

---

## 이메일 인증 예외

> 현재 CoUp은 이메일 인증 없이 즉시 회원가입됩니다.  
> 이 섹션은 향후 이메일 인증 구현 시 참고하세요.

### 1. 인증 메일 발송 실패

#### 구현 방법

```javascript
// src/lib/email.js
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendVerificationEmail(email, token) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`
  
  try {
    await transporter.sendMail({
      from: `"CoUp" <noreply@coup.com>`,
      to: email,
      subject: '이메일 인증을 완료해주세요',
      html: `
        <h1>CoUp 회원가입을 환영합니다!</h1>
        <p>아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background:#007bff;color:white;text-decoration:none;border-radius:5px;">
          이메일 인증하기
        </a>
        <p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
        <p>${verifyUrl}</p>
        <p>이 링크는 24시간 동안 유효합니다.</p>
      `,
    })
    
    return { success: true }
    
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}
```

#### 회원가입 API 수정

```javascript
// src/app/api/auth/signup/route.js
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request) {
  try {
    // ... 기존 코드 ...
    
    // 인증 토큰 생성
    const verificationToken = crypto.randomUUID()
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간
    
    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        emailVerified: null,  // 미인증
        verificationToken,
        tokenExpiry,
        status: 'PENDING',  // 이메일 인증 대기
      }
    })
    
    // 인증 메일 발송
    const emailResult = await sendVerificationEmail(user.email, verificationToken)
    
    if (!emailResult.success) {
      // 메일 발송 실패 - 사용자는 생성됨
      console.error('Failed to send verification email:', emailResult.error)
      
      // 관리자에게 알림 (선택사항)
      // await notifyAdmin(`Email verification failed for ${user.email}`)
      
      return NextResponse.json(
        {
          success: true,
          warning: "회원가입은 완료되었으나 인증 메일 발송에 실패했습니다. 고객 지원팀에 문의해주세요.",
          user: { id: user.id, email: user.email }
        },
        { status: 201 }
      )
    }
    
    return NextResponse.json(
      {
        success: true,
        message: "회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.",
        user: { id: user.id, email: user.email }
      },
      { status: 201 }
    )
    
  } catch (error) {
    // ... 에러 처리 ...
  }
}
```

---

### 2. 인증 토큰 만료

#### 증상
사용자가 24시간 후에 인증 링크 클릭

#### 처리

```javascript
// src/app/api/auth/verify/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  
  if (!token) {
    return NextResponse.redirect('/sign-in?error=invalid-token')
  }
  
  const user = await prisma.user.findFirst({
    where: { verificationToken: token }
  })
  
  if (!user) {
    return NextResponse.redirect('/sign-in?error=invalid-token')
  }
  
  // 토큰 만료 확인
  if (user.tokenExpiry && new Date(user.tokenExpiry) < new Date()) {
    return NextResponse.redirect('/sign-in?error=token-expired')
  }
  
  // 이메일 인증 완료
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
      tokenExpiry: null,
      status: 'ACTIVE',
    }
  })
  
  return NextResponse.redirect('/sign-in?verified=true')
}
```

#### 재발송 기능

```javascript
// src/app/api/auth/resend-verification/route.js
export async function POST(request) {
  const { email } = await request.json()
  
  const user = await prisma.user.findUnique({
    where: { email }
  })
  
  if (!user || user.emailVerified) {
    return NextResponse.json(
      { error: '유효하지 않은 요청입니다' },
      { status: 400 }
    )
  }
  
  // 새 토큰 생성
  const verificationToken = crypto.randomUUID()
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
  
  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken, tokenExpiry }
  })
  
  // 메일 재발송
  await sendVerificationEmail(user.email, verificationToken)
  
  return NextResponse.json({
    success: true,
    message: '인증 메일이 재발송되었습니다'
  })
}
```

---

## 레이트 리미팅

### 회원가입 시도 제한

#### 목적
- 자동화된 가입 방지
- 스팸 계정 생성 방지
- 서버 리소스 보호

#### 구현 방법

**Option 1: IP 기반 제한**
```javascript
// src/lib/rate-limit.js
const signupAttempts = new Map()

export function checkSignupRateLimit(ipAddress) {
  const key = ipAddress
  const now = Date.now()
  const attempts = signupAttempts.get(key) || []
  
  // 1시간 이내 시도만 카운트
  const recentAttempts = attempts.filter(time => now - time < 60 * 60 * 1000)
  
  // 1시간에 3회 이상 시도 시 차단
  if (recentAttempts.length >= 3) {
    throw new Error('회원가입 시도 횟수가 초과되었습니다. 1시간 후 다시 시도해주세요.')
  }
  
  // 시도 기록
  recentAttempts.push(now)
  signupAttempts.set(key, recentAttempts)
}

// src/app/api/auth/signup/route.js
export async function POST(request) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
    checkSignupRateLimit(ipAddress)
    
    // ... 회원가입 로직 ...
    
  } catch (error) {
    if (error.message.includes('시도 횟수')) {
      return NextResponse.json({ error: error.message }, { status: 429 })
    }
    // ... 기타 에러 처리 ...
  }
}
```

**Option 2: reCAPTCHA v3**
```javascript
// 클라이언트
const handleSignup = async (e) => {
  e.preventDefault()
  
  // reCAPTCHA 토큰 생성
  const recaptchaToken = await grecaptcha.execute(
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    { action: 'signup' }
  )
  
  // 회원가입 요청
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      name,
      recaptchaToken
    })
  })
  
  // ...
}

// 서버
export async function POST(request) {
  const { recaptchaToken, ...userData } = await request.json()
  
  // reCAPTCHA 검증
  const recaptchaResponse = await fetch(
    `https://www.google.com/recaptcha/api/siteverify`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    }
  )
  
  const recaptchaData = await recaptchaResponse.json()
  
  if (!recaptchaData.success || recaptchaData.score < 0.5) {
    return NextResponse.json(
      { error: '자동화된 요청이 감지되었습니다' },
      { status: 400 }
    )
  }
  
  // ... 회원가입 로직 ...
}
```

---

## 요약

### 회원가입 체크리스트

1. ✅ 이메일 형식 검증 (클라이언트 + 서버)
2. ✅ 비밀번호 강도 검증
3. ✅ 이메일 중복 확인
4. ✅ 데이터베이스 에러 처리
5. ✅ 레이트 리미팅 적용
6. ✅ (선택) 이메일 인증 구현
7. ✅ (선택) reCAPTCHA 적용

### 사용자 경험 개선

- 실시간 유효성 검사
- 비밀번호 강도 표시
- 이메일 사용 가능 여부 실시간 확인
- 명확한 에러 메시지
- 회원가입 성공 시 자동 로그인

---

**다음 문서**: [06-common-edge-cases.md](./06-common-edge-cases.md)

