# Credentials 로그인 예외 처리

이메일/비밀번호 기반 로그인에서 발생할 수 있는 모든 예외 상황을 다룹니다.

---

## 📋 목차

1. [인증 실패 예외](#인증-실패-예외)
2. [계정 상태 예외](#계정-상태-예외)
3. [유효성 검사 예외](#유효성-검사-예외)
4. [데이터베이스 예외](#데이터베이스-예외)
5. [네트워크 예외](#네트워크-예외)
6. [레이트 리미팅](#레이트-리미팅)

---

## 인증 실패 예외

### 1. 이메일 또는 비밀번호 불일치

#### 증상
```
❌ 로그인 실패: "이메일 또는 비밀번호가 일치하지 않습니다."
```

#### 발생 위치
```javascript
// src/lib/auth.js - authorize()
if (!user) {
  throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.")
}

const isValid = await bcrypt.compare(credentials.password, user.password)
if (!isValid) {
  throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.")
}
```

#### 원인

**Case 1: 사용자가 존재하지 않음**
```javascript
const user = await prisma.user.findUnique({
  where: { email: credentials.email }
})
// user === null
```

**Case 2: 비밀번호가 일치하지 않음**
```javascript
const isValid = await bcrypt.compare(credentials.password, user.password)
// isValid === false
```

**Case 3: 대소문자 오타**
- 이메일 대소문자 구분 (DB 컬럼 설정에 따라)
- 비밀번호 대소문자 정확히 입력 필요

**Case 4: 공백 문자**
```javascript
email: "user@example.com "  // 끝에 공백
password: " password123"    // 앞에 공백
```

#### 디버깅 방법

**1단계: 서버 로그 확인**
```bash
# 개발 서버 콘솔에서 확인
🔐 [AUTH] authorize 시작
🔐 [AUTH] credentials: { email: 'test@example.com', hasPassword: true }
🔍 [AUTH] 사용자 조회 중: test@example.com
❌ [AUTH] 사용자를 찾을 수 없음  # <- 이메일이 없음
```

또는

```bash
✅ [AUTH] 사용자 발견: { id: 'xxx', email: 'test@example.com', status: 'ACTIVE' }
🔑 [AUTH] 비밀번호 검증 중...
❌ [AUTH] 비밀번호 불일치  # <- 비밀번호가 틀림
```

**2단계: 데이터베이스 직접 확인**
```javascript
// scripts/check-user-status.js 실행
node coup/scripts/check-user-status.js test@example.com
```

**3단계: 테스트 사용자로 로그인 시도**
```javascript
// 테스트 사용자 생성
node coup/scripts/create-test-user.js

// 로그인 시도
Email: test@example.com
Password: password123
```

#### 해결 방법

**사용자용 안내**:
```
1. 이메일 주소를 정확히 입력했는지 확인하세요
2. 비밀번호 대소문자를 확인하세요
3. 복사-붙여넣기 시 공백이 포함되지 않았는지 확인하세요
4. "비밀번호 찾기"를 통해 재설정할 수 있습니다
```

**개발자용 수정**:

*Option 1: 이메일 정규화*
```javascript
// src/lib/auth.js
async authorize(credentials) {
  // 이메일 trim 및 소문자 변환
  const email = credentials.email?.trim().toLowerCase()
  const password = credentials.password?.trim()
  
  if (!email || !password) {
    throw new Error("이메일과 비밀번호를 입력해주세요.")
  }
  
  const user = await prisma.user.findUnique({
    where: { email }
  })
  // ...
}
```

*Option 2: 로그인 시도 로깅*
```javascript
// 실패한 로그인 시도 기록
await prisma.loginAttempt.create({
  data: {
    email: credentials.email,
    success: false,
    ipAddress: request.headers['x-forwarded-for'],
    userAgent: request.headers['user-agent'],
  }
})
```

#### 예방 방법

**클라이언트 측 검증**:
```javascript
// src/app/(auth)/sign-in/page.jsx
const validateForm = () => {
  const errors = {}
  
  if (!email) {
    errors.email = '이메일을 입력해주세요'
  } else if (!validateEmail(email)) {
    errors.email = '올바른 이메일 형식이 아닙니다'
  }
  
  if (!password) {
    errors.password = '비밀번호를 입력해주세요'
  } else if (password.length < 8) {
    errors.password = '비밀번호는 8자 이상이어야 합니다'
  }
  
  return errors
}
```

---

### 2. 빈 입력값

#### 증상
```
"이메일과 비밀번호를 입력해주세요."
```

#### 발생 위치
```javascript
// src/lib/auth.js
if (!credentials?.email || !credentials?.password) {
  throw new Error("이메일과 비밀번호를 입력해주세요.")
}
```

#### 원인
- 사용자가 폼을 채우지 않고 제출
- JavaScript가 비활성화되어 클라이언트 검증 실패
- API 직접 호출 시 파라미터 누락

#### 해결 방법

**클라이언트 검증 강화**:
```javascript
const handleCredentialsLogin = async (e) => {
  e.preventDefault()
  
  // 폼 검증 먼저 수행
  if (!validateForm()) return
  
  // 추가 빈 값 체크
  if (!email?.trim() || !password?.trim()) {
    setError('이메일과 비밀번호를 입력해주세요')
    return
  }
  
  // 로그인 시도
  // ...
}
```

**HTML required 속성**:
```jsx
<input
  type="email"
  name="email"
  required
  placeholder="이메일"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

---

### 3. 소셜 로그인 계정 혼동

#### 증상
```
"소셜 로그인 계정입니다. 해당 방법으로 로그인해주세요."
```

#### 발생 위치
```javascript
// src/lib/auth.js
if (!user.password) {
  throw new Error("소셜 로그인 계정입니다. 해당 방법으로 로그인해주세요.")
}
```

#### 원인

사용자가 Google/GitHub로 회원가입했는데, Credentials 로그인을 시도함:

```javascript
// 데이터베이스 상태
{
  email: "user@example.com",
  provider: "GOOGLE",
  password: null,  // <- 비밀번호 없음
}
```

#### 시나리오

1. 사용자가 "Google로 로그인" 버튼 클릭
2. Google OAuth 완료, 계정 생성
3. 다음번 방문 시 이메일/비밀번호로 로그인 시도
4. **오류 발생** ❌

#### 해결 방법

**Option 1: 로그인 방법 안내**
```javascript
// 사용자에게 안내
if (!user.password) {
  const providerName = user.provider === 'GOOGLE' ? 'Google' : 
                       user.provider === 'GITHUB' ? 'GitHub' : '소셜 로그인'
  
  throw new Error(
    `이 계정은 ${providerName}으로 가입되었습니다. ${providerName} 로그인 버튼을 사용해주세요.`
  )
}
```

**Option 2: 비밀번호 설정 링크**
```javascript
if (!user.password) {
  throw new Error(
    "소셜 로그인 계정입니다. 비밀번호를 설정하려면 '비밀번호 설정' 링크를 클릭하세요."
  )
}
```

**Option 3: 자동 감지 및 안내 UI**
```jsx
// src/app/(auth)/sign-in/page.jsx
const [suggestedProvider, setSuggestedProvider] = useState(null)

const handleEmailChange = async (e) => {
  const email = e.target.value
  setEmail(email)
  
  // 이메일 입력 완료 시 가입 방법 확인
  if (validateEmail(email)) {
    try {
      const { provider } = await api.post('/api/auth/check-provider', { email })
      if (provider !== 'CREDENTIALS') {
        setSuggestedProvider(provider)
      }
    } catch (err) {
      // 무시
    }
  }
}

// UI
{suggestedProvider && (
  <Alert type="info">
    이 이메일은 {suggestedProvider} 계정으로 가입되어 있습니다.
    {suggestedProvider} 로그인 버튼을 사용하세요.
  </Alert>
)}
```

#### 예방 방법

**계정 연동 기능**:
```javascript
// 소셜 로그인 계정에 비밀번호 추가
// src/app/api/auth/link-password/route.js

export async function POST(request) {
  const session = await getServerSession(authOptions)
  const { password } = await request.json()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })
  
  if (user.password) {
    return NextResponse.json({ error: '이미 비밀번호가 설정되어 있습니다' }, { status: 400 })
  }
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword }
  })
  
  return NextResponse.json({ success: true })
}
```

---

## 계정 상태 예외

### 1. 삭제된 계정

#### 증상
```
"삭제된 계정입니다."
```

#### 발생 위치
```javascript
// src/lib/auth.js
if (user.status === "DELETED") {
  throw new Error("삭제된 계정입니다.")
}
```

#### 원인
- 사용자가 계정 삭제 요청
- 관리자가 계정 삭제
- GDPR 준수를 위한 자동 삭제

#### 데이터베이스 상태
```javascript
{
  id: "user_123",
  email: "deleted@example.com",
  status: "DELETED",
  deletedAt: "2025-11-28T10:00:00Z"
}
```

#### 해결 방법

**사용자 안내**:
```
이 계정은 삭제되었습니다.
- 본인이 삭제하지 않았다면 고객 지원팀에 문의하세요
- 새 계정을 만들려면 "회원가입" 버튼을 클릭하세요
```

**계정 복구 옵션** (30일 이내):
```javascript
// src/app/api/auth/restore-account/route.js

export async function POST(request) {
  const { email, password } = await request.json()
  
  const user = await prisma.user.findUnique({
    where: { email }
  })
  
  if (!user || user.status !== 'DELETED') {
    return NextResponse.json({ error: '계정을 찾을 수 없습니다' }, { status: 404 })
  }
  
  // 30일 이내만 복구 가능
  const deletedAt = new Date(user.deletedAt)
  const now = new Date()
  const daysSinceDeleted = (now - deletedAt) / (1000 * 60 * 60 * 24)
  
  if (daysSinceDeleted > 30) {
    return NextResponse.json({ error: '복구 기간이 만료되었습니다' }, { status: 400 })
  }
  
  // 비밀번호 확인
  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return NextResponse.json({ error: '비밀번호가 일치하지 않습니다' }, { status: 401 })
  }
  
  // 계정 복구
  await prisma.user.update({
    where: { id: user.id },
    data: {
      status: 'ACTIVE',
      deletedAt: null,
    }
  })
  
  return NextResponse.json({ success: true })
}
```

---

### 2. 정지된 계정

#### 증상
```
"정지된 계정입니다."
또는
"정지된 계정입니다. 사유: 스팸 활동"
```

#### 발생 위치
```javascript
// src/lib/auth.js
if (user.status === "SUSPENDED") {
  const message = user.suspendReason
    ? `정지된 계정입니다. 사유: ${user.suspendReason}`
    : "정지된 계정입니다."
  throw new Error(message)
}
```

#### 원인
- 관리자가 계정 정지 (신고, 규칙 위반 등)
- 자동화된 정지 (스팸 탐지, 부정 행위)
- 임시 정지 (보안 사유)

#### 데이터베이스 상태
```javascript
{
  id: "user_123",
  email: "suspended@example.com",
  status: "SUSPENDED",
  suspendReason: "스팸 활동",
  suspendedAt: "2025-11-28T10:00:00Z",
  suspendedUntil: "2025-12-05T10:00:00Z"  // 7일 정지
}
```

#### 시나리오

**Case 1: 영구 정지**
```javascript
{
  status: "SUSPENDED",
  suspendReason: "규칙 위반",
  suspendedUntil: null  // 영구
}
```

**Case 2: 기간 정지**
```javascript
{
  status: "SUSPENDED",
  suspendReason: "부적절한 콘텐츠",
  suspendedUntil: "2025-12-05T10:00:00Z"  // 7일 후 자동 해제
}
```

#### 해결 방법

**정지 정보 표시**:
```javascript
// src/lib/auth.js
if (user.status === "SUSPENDED") {
  let message = "정지된 계정입니다."
  
  if (user.suspendReason) {
    message += `\n사유: ${user.suspendReason}`
  }
  
  if (user.suspendedUntil) {
    const until = new Date(user.suspendedUntil).toLocaleDateString('ko-KR')
    message += `\n정지 해제일: ${until}`
  } else {
    message += `\n문의: support@coup.com`
  }
  
  throw new Error(message)
}
```

**자동 정지 해제**:
```javascript
// src/lib/auth.js - authorize()
if (user.status === "SUSPENDED") {
  // 정지 기간이 지났는지 확인
  if (user.suspendedUntil && new Date(user.suspendedUntil) < new Date()) {
    // 자동 해제
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'ACTIVE',
        suspendReason: null,
        suspendedUntil: null,
      }
    })
    
    console.log(`✅ [AUTH] 정지 기간 만료, 계정 활성화: ${user.email}`)
    
    // 정상 로그인 진행
  } else {
    // 정지 중
    const message = user.suspendReason
      ? `정지된 계정입니다. 사유: ${user.suspendReason}`
      : "정지된 계정입니다."
    throw new Error(message)
  }
}
```

**이의 제기 기능**:
```jsx
// UI에 이의 제기 버튼 추가
{error?.includes('정지된 계정') && (
  <Button 
    variant="outline" 
    onClick={() => router.push('/appeal')}
  >
    이의 제기하기
  </Button>
)}
```

---

### 3. 미인증 계정 (이메일 인증 미완료)

#### 증상
```
"이메일 인증이 필요합니다."
```

#### 시나리오

**현재 구현**: 이메일 인증 없이 즉시 로그인 가능 ✅

**향후 구현** (선택사항):
```javascript
// Prisma Schema에 추가
model User {
  // ...existing fields...
  emailVerified  DateTime?
  verificationToken String?
}

// src/lib/auth.js - authorize()
if (!user.emailVerified) {
  throw new Error("이메일 인증이 필요합니다. 인증 링크를 확인해주세요.")
}
```

#### 구현 방법

**1단계: 회원가입 시 인증 메일 발송**
```javascript
// src/app/api/auth/signup/route.js
const verificationToken = crypto.randomUUID()

const user = await prisma.user.create({
  data: {
    // ...
    emailVerified: null,
    verificationToken,
  }
})

// 인증 이메일 발송
await sendVerificationEmail(user.email, verificationToken)
```

**2단계: 인증 링크 처리**
```javascript
// src/app/api/auth/verify/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  
  const user = await prisma.user.findFirst({
    where: { verificationToken: token }
  })
  
  if (!user) {
    return NextResponse.redirect('/sign-in?error=invalid-token')
  }
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
    }
  })
  
  return NextResponse.redirect('/sign-in?verified=true')
}
```

---

## 유효성 검사 예외

### 1. 잘못된 이메일 형식

#### 증상
```
"올바른 이메일 형식이 아닙니다"
```

#### 클라이언트 검증
```javascript
// src/app/(auth)/sign-in/page.jsx
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}
```

#### 서버 검증
```javascript
// src/lib/auth.js
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

async authorize(credentials) {
  if (!isValidEmail(credentials.email)) {
    throw new Error("올바른 이메일 형식이 아닙니다")
  }
  // ...
}
```

#### 엣지 케이스

**Case 1: 특수 문자**
```javascript
// 유효한 이메일
"user+tag@example.com"
"user.name@example.co.kr"
"user_name@example-domain.com"

// 무효한 이메일
"user@"
"@example.com"
"user@.com"
"user @example.com"  // 공백
```

**Case 2: 국제 도메인**
```javascript
// 한글 도메인 (Punycode)
"user@한글.com"  // -> "user@xn--bj0bj06e.com"
```

---

### 2. 짧은 비밀번호

#### 증상
```
"비밀번호는 8자 이상이어야 합니다"
```

#### 클라이언트 검증
```javascript
if (password.length < 8) {
  errors.password = '비밀번호는 8자 이상이어야 합니다'
}
```

#### 서버 검증
```javascript
// src/lib/auth.js
if (credentials.password.length < 8) {
  throw new Error("비밀번호는 8자 이상이어야 합니다")
}
```

---

## 데이터베이스 예외

### 1. 데이터베이스 연결 실패

#### 증상
```
"일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
```

#### 원인
- 데이터베이스 서버 다운
- 네트워크 문제
- 연결 풀 고갈
- Prisma 클라이언트 오류

#### 디버깅

**서버 로그**:
```bash
PrismaClientKnownRequestError: 
P2024: Timed out fetching a new connection from the connection pool.
```

**연결 상태 확인**:
```javascript
// scripts/check-db-connection.js
const { prisma } = require('../src/lib/prisma')

async function checkConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ 데이터베이스 연결 성공')
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkConnection()
```

#### 해결 방법

**에러 처리**:
```javascript
// src/lib/auth.js
async authorize(credentials) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    })
    // ...
  } catch (error) {
    console.error('❌ [AUTH] Database error:', error)
    
    if (error.code === 'P2024') {
      throw new Error("서버가 혼잡합니다. 잠시 후 다시 시도해주세요.")
    }
    
    throw new Error("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
  }
}
```

**재시도 로직**:
```javascript
async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

// 사용
const user = await retryOperation(() => 
  prisma.user.findUnique({ where: { email } })
)
```

---

### 2. 트랜잭션 실패

#### 증상
로그인은 성공했지만 `lastLoginAt` 업데이트 실패

#### 원인
```javascript
// src/lib/auth.js
await prisma.user.update({
  where: { id: user.id },
  data: { lastLoginAt: new Date() }
})
// 이 부분에서 오류 발생 가능
```

#### 해결 방법

**Try-catch로 감싸기**:
```javascript
try {
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  })
} catch (error) {
  // 로그만 남기고 로그인은 성공 처리
  console.error('❌ [AUTH] Failed to update lastLoginAt:', error)
}
```

---

## 네트워크 예외

### 1. 클라이언트 네트워크 오류

#### 증상
```javascript
// 브라우저 콘솔
TypeError: Failed to fetch
```

#### 원인
- 사용자 인터넷 연결 끊김
- API 서버 다운
- CORS 오류
- 방화벽 차단

#### 처리 방법

```javascript
// src/app/(auth)/sign-in/page.jsx
const handleCredentialsLogin = async (e) => {
  e.preventDefault()
  
  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    // ...
  } catch (err) {
    console.error('로그인 실패:', err)
    
    // 네트워크 오류 구분
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      setError('네트워크 연결을 확인해주세요.')
    } else {
      setError('로그인 중 오류가 발생했습니다.')
    }
    
    setLoading(null)
  }
}
```

---

### 2. 타임아웃

#### 증상
요청이 너무 오래 걸려서 실패

#### 구현

```javascript
// src/lib/api.js
const api = {
  async post(url, data, options = {}) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options.timeout || 10000)
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      })
      
      clearTimeout(timeout)
      return await response.json()
    } catch (error) {
      clearTimeout(timeout)
      
      if (error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.')
      }
      
      throw error
    }
  }
}
```

---

## 레이트 리미팅

### 로그인 시도 제한

#### 목적
무차별 대입 공격(Brute Force) 방지

#### 구현 방법

**Option 1: 메모리 기반 (간단)**
```javascript
// src/lib/rate-limit.js
const loginAttempts = new Map()

export function checkLoginAttempts(email) {
  const key = email.toLowerCase()
  const now = Date.now()
  const attempts = loginAttempts.get(key) || []
  
  // 5분 이내 시도만 카운트
  const recentAttempts = attempts.filter(time => now - time < 5 * 60 * 1000)
  
  // 5회 이상 시도 시 차단
  if (recentAttempts.length >= 5) {
    throw new Error('로그인 시도 횟수가 초과되었습니다. 5분 후 다시 시도해주세요.')
  }
  
  // 시도 기록
  recentAttempts.push(now)
  loginAttempts.set(key, recentAttempts)
}

// src/lib/auth.js
async authorize(credentials) {
  checkLoginAttempts(credentials.email)
  // ...
}
```

**Option 2: 데이터베이스 기반 (영구)**
```prisma
// prisma/schema.prisma
model LoginAttempt {
  id        String   @id @default(cuid())
  email     String
  success   Boolean
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  @@index([email])
  @@index([createdAt])
}
```

```javascript
// src/lib/rate-limit.js
export async function checkLoginAttempts(email) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  
  const attempts = await prisma.loginAttempt.count({
    where: {
      email: email.toLowerCase(),
      success: false,
      createdAt: { gte: fiveMinutesAgo }
    }
  })
  
  if (attempts >= 5) {
    throw new Error('로그인 시도 횟수가 초과되었습니다. 5분 후 다시 시도해주세요.')
  }
}
```

---

## 요약

### 주요 예외 체크리스트

로그인 실패 시 확인 순서:

1. ✅ 이메일 형식이 올바른가?
2. ✅ 비밀번호 길이가 8자 이상인가?
3. ✅ 사용자가 존재하는가?
4. ✅ 비밀번호가 일치하는가?
5. ✅ 계정 상태가 ACTIVE인가?
6. ✅ 소셜 로그인 계정이 아닌가?
7. ✅ 데이터베이스 연결은 정상인가?
8. ✅ 네트워크 연결은 정상인가?
9. ✅ 로그인 시도 제한에 걸리지 않았나?

### 디버깅 명령어

```bash
# 사용자 상태 확인
node coup/scripts/check-user-status.js [email]

# 테스트 사용자 생성
node coup/scripts/create-test-user.js

# 테스트 로그인
node coup/scripts/test-login.js [email] [password]

# 데이터베이스 연결 확인
node coup/scripts/check-db-connection.js
```

---

**다음 문서**: [02-oauth-login-exceptions.md](./02-oauth-login-exceptions.md)

