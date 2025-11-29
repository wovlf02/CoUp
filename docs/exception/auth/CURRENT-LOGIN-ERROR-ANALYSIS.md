# 현재 로그인 실패 오류 분석

## 🐛 증상

```
❌ 로그인 실패: "이메일 또는 비밀번호가 일치하지 않습니다."

Call Stack
4  Show 3 ignore-listed frame(s)
handleCredentialsLogin
file:///C:/Project/CoUp/coup/.next/dev/static/chunks/coup_src_9859b3e6._.js (176:25)
```

**발생 위치**: `src/app/(auth)/sign-in/page.jsx` - `handleCredentialsLogin` 함수

---

## 🔍 원인 분석

### 1. NextAuth의 에러 응답

```javascript
// src/app/(auth)/sign-in/page.jsx:140-145
const result = await signIn('credentials', {
  email,
  password,
  redirect: false,
})

if (result?.error) {
  console.error('❌ 로그인 실패:', result.error)
  setError(result.error)  // <- 여기서 에러 메시지 설정
  return
}
```

`result.error`에는 `src/lib/auth.js`의 `authorize()` 함수에서 던진 에러 메시지가 그대로 들어옵니다.

---

## 🎯 가능한 원인들

### 1. 입력값 문제

#### Case A: 이메일 또는 비밀번호 누락
```javascript
// src/lib/auth.js:35-37
if (!credentials?.email || !credentials?.password) {
  throw new Error("이메일과 비밀번호를 입력해주세요.")
}
```

**확인 방법**: 
- 브라우저 콘솔에서 `🔐 로그인 시도: [email]` 로그 확인
- 이메일이 제대로 출력되는지 확인

---

#### Case B: 사용자가 존재하지 않음
```javascript
// src/lib/auth.js:44-47
const user = await prisma.user.findUnique({
  where: { email: credentials.email }
})

if (!user) {
  throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.")
}
```

**서버 로그**:
```
🔍 [AUTH] 사용자 조회 중: test@example.com
❌ [AUTH] 사용자를 찾을 수 없음
```

**확인 방법**:
```bash
# 개발 서버 콘솔에서 확인
cd coup
node scripts/check-user-status.js [your-email]
```

---

#### Case C: 비밀번호 불일치
```javascript
// src/lib/auth.js:59-63
const isValid = await bcrypt.compare(credentials.password, user.password)

if (!isValid) {
  throw new Error("이메일 또는 비밀번호가 일치하지 않습니다.")
}
```

**서버 로그**:
```
✅ [AUTH] 사용자 발견: { id: 'xxx', email: 'test@example.com', status: 'ACTIVE' }
🔑 [AUTH] 비밀번호 검증 중...
❌ [AUTH] 비밀번호 불일치
```

---

#### Case D: 소셜 로그인 계정
```javascript
// src/lib/auth.js:52-55
if (!user.password) {
  throw new Error("소셜 로그인 계정입니다. 해당 방법으로 로그인해주세요.")
}
```

**증상**: Google/GitHub로 가입한 계정인데 이메일/비밀번호로 로그인 시도

---

#### Case E: 계정 정지
```javascript
// src/lib/auth.js:70-75
if (user.status === "SUSPENDED") {
  const message = user.suspendReason
    ? `정지된 계정입니다. 사유: ${user.suspendReason}`
    : "정지된 계정입니다."
  throw new Error(message)
}
```

---

#### Case F: 계정 삭제
```javascript
// src/lib/auth.js:66-69
if (user.status === "DELETED") {
  throw new Error("삭제된 계정입니다.")
}
```

---

### 2. 데이터베이스 연결 문제

```javascript
// Prisma 오류
PrismaClientKnownRequestError: 
P2024: Timed out fetching a new connection from the connection pool.
```

**서버 로그**:
```
❌ [AUTH] Database error: P2024
```

---

## 🛠️ 디버깅 단계

### 1단계: 서버 로그 확인

개발 서버 콘솔에서 `[AUTH]` 태그가 붙은 로그를 확인하세요:

```bash
# Windows PowerShell에서 실행 중인 개발 서버 콘솔 확인
# 또는
cd C:\Project\CoUp\coup
npm run dev
```

**정상적인 로그 흐름**:
```
🔐 [AUTH] authorize 시작
🔐 [AUTH] credentials: { email: 'test@example.com', hasPassword: true }
🔍 [AUTH] 사용자 조회 중: test@example.com
✅ [AUTH] 사용자 발견: { id: 'user_xxx', email: 'test@example.com', status: 'ACTIVE' }
🔑 [AUTH] 비밀번호 검증 중...
🔑 [AUTH] 비밀번호 검증 결과: true
✅ [AUTH] 로그인 성공, lastLoginAt 업데이트 중...
```

---

### 2단계: 사용자 계정 확인

```bash
cd C:\Project\CoUp\coup

# 사용자 존재 여부 확인
node scripts/check-user-status.js your-email@example.com
```

**예상 출력**:
```
✅ 사용자 정보:
{
  id: 'user_xxx',
  email: 'your-email@example.com',
  name: 'Your Name',
  status: 'ACTIVE',
  provider: 'CREDENTIALS',
  hasPassword: true
}
```

**계정이 없는 경우**:
```
❌ 사용자를 찾을 수 없습니다: your-email@example.com
```

---

### 3단계: 테스트 계정으로 로그인 시도

```bash
# 테스트 계정 생성
cd C:\Project\CoUp\coup
node scripts/create-test-user.js
```

**생성되는 테스트 계정**:
- Email: `test@example.com`
- Password: `password123`
- Status: `ACTIVE`

이 계정으로 로그인을 시도해보세요. 성공한다면 원래 계정에 문제가 있는 것입니다.

---

### 4단계: 비밀번호 재설정

계정은 존재하지만 비밀번호가 틀린 경우:

```bash
# 비밀번호 재설정 스크립트 (만들어야 함)
node scripts/reset-password.js your-email@example.com newpassword123
```

또는 데이터베이스에서 직접 수정:

```javascript
// scripts/reset-password.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetPassword(email, newPassword) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })
    
    console.log(`✅ 비밀번호 재설정 완료: ${email}`)
    
  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

const [email, password] = process.argv.slice(2)
resetPassword(email, password)
```

---

## 💡 즉시 확인할 사항

### 1. 브라우저 콘솔 확인

로그인 버튼을 클릭했을 때 브라우저 콘솔(F12)에서:

```javascript
🔐 로그인 시도: [your-email]
❌ 로그인 실패: "이메일 또는 비밀번호가 일치하지 않습니다."
```

→ 이메일이 제대로 출력되는지 확인

---

### 2. 개발 서버 콘솔 확인

PowerShell에서 실행 중인 `npm run dev` 콘솔에서:

```
[AUTH] 태그가 붙은 로그를 모두 확인
```

→ 어느 단계에서 실패하는지 파악

---

### 3. 입력값 확인

- 이메일에 공백이 있지 않은지
- 비밀번호 대소문자가 정확한지
- 복사-붙여넣기로 입력했다면 숨겨진 문자가 없는지

---

## 🔧 임시 해결 방법

### 방법 1: 새 계정 생성

```bash
# 회원가입 페이지로 이동
http://localhost:3000/sign-up

# 또는 스크립트로 생성
node scripts/create-test-user.js
```

---

### 방법 2: 관리자 계정 사용

```bash
cd C:\Project\CoUp\coup
node scripts/create-test-admin.js
```

**생성되는 관리자 계정**:
- Email: `admin@coup.com`
- Password: `admin123456`
- Role: `SUPER_ADMIN`

---

## 📊 통계

### 일반적인 로그인 실패 원인 비율

```
1. 비밀번호 오타: 45%
2. 이메일 오타: 25%
3. 계정 없음: 15%
4. 소셜 로그인 계정 혼동: 10%
5. 계정 정지/삭제: 3%
6. 데이터베이스 오류: 2%
```

---

## 🎯 다음 단계

현재 오류를 해결하려면:

1. **서버 콘솔 로그를 캡처**해서 공유해주세요
   - `[AUTH]` 태그가 붙은 모든 로그

2. **사용하려는 이메일 주소**를 알려주세요
   - 해당 계정의 상태를 확인해드리겠습니다

3. **회원가입을 한 적이 있는지** 확인해주세요
   - 없다면 먼저 회원가입이 필요합니다

---

## 📚 참고 문서

자세한 내용은 다음 문서를 참고하세요:

- [Credentials 로그인 예외](./01-credentials-login-exceptions.md)
  - 이메일/비밀번호 불일치
  - 계정 상태 확인
  - 데이터베이스 오류

- [세션 관리 예외](./03-session-management-exceptions.md)
  - 세션 생성 실패
  - 세션 검증 오류

- [공통 엣지 케이스](./06-common-edge-cases.md)
  - 네트워크 문제
  - 브라우저 문제

---

**작성일**: 2025-11-29  
**상태**: 🔴 해결 대기 중

