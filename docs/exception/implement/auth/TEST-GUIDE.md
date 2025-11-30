# auth 영역 예외 처리 테스트 가이드

**대상**: Step 2-2 구현 결과  
**작성일**: 2025-11-30  
**Phase**: 1 (Critical)

---

## 🧪 빠른 테스트 시나리오

### 전제 조건
```bash
# 1. 개발 서버 실행
cd coup
npm run dev

# 2. 브라우저 콘솔 열기 (F12)
```

---

## 1. 로그인 예외 테스트

### 1.1 이메일/비밀번호 누락 ✅

**테스트**:
1. `/sign-in` 페이지 접속
2. 빈 칸으로 로그인 시도

**기대 결과**:
```
❌ [AUTH] 이메일 또는 비밀번호 누락
Error: 이메일과 비밀번호를 입력해주세요
```

### 1.2 잘못된 이메일 형식 ✅

**브라우저 콘솔에서 테스트**:
```javascript
// signIn from next-auth/react
await signIn('credentials', {
  email: 'invalid-email',
  password: 'password123',
  redirect: false
})
```

**기대 결과**:
```
❌ [AUTH] 이메일 형식 오류
Error: 올바른 이메일 형식이 아닙니다
```

### 1.3 존재하지 않는 사용자 ✅

**테스트**:
```javascript
await signIn('credentials', {
  email: 'notexist@example.com',
  password: 'password123',
  redirect: false
})
```

**기대 결과**:
```
🔍 [AUTH] 사용자 조회 중: notexist@example.com
❌ [AUTH] 사용자를 찾을 수 없음
Error: 이메일 또는 비밀번호가 일치하지 않습니다
```

### 1.4 비밀번호 불일치 ✅

**테스트**:
```javascript
// 기존 사용자로 잘못된 비밀번호
await signIn('credentials', {
  email: 'test@example.com',
  password: 'wrongpassword',
  redirect: false
})
```

**기대 결과**:
```
✅ [AUTH] 사용자 발견: { id: 'xxx', email: 'test@example.com', status: 'ACTIVE' }
🔑 [AUTH] 비밀번호 검증 중...
🔑 [AUTH] 비밀번호 검증 결과: false
❌ [AUTH] 비밀번호 불일치
Error: 이메일 또는 비밀번호가 일치하지 않습니다
```

---

## 2. 회원가입 예외 테스트

### 2.1 잘못된 JSON ✅

**curl 테스트**:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "invalid json"
```

**기대 결과**:
```json
{
  "error": "AUTH_999",
  "message": "잘못된 요청 형식입니다"
}
```

### 2.2 이메일 형식 오류 ✅

**curl 테스트**:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123",
    "name": "테스트"
  }'
```

**기대 결과**:
```json
{
  "error": "AUTH_014",
  "message": "올바른 이메일 형식이 아닙니다"
}
```

### 2.3 비밀번호 짧음 ✅

**curl 테스트**:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "short",
    "name": "테스트"
  }'
```

**기대 결과**:
```json
{
  "error": "AUTH_015",
  "message": "비밀번호는 최소 8자 이상이어야 합니다"
}
```

### 2.4 이메일 중복 ✅

**curl 테스트**:
```bash
# 기존 사용자 이메일로 가입 시도
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "password": "password123",
    "name": "테스트"
  }'
```

**기대 결과**:
```json
{
  "error": "AUTH_013",
  "message": "이미 사용 중인 이메일입니다"
}
```

**서버 로그**:
```
❌ [SIGNUP] 이메일 중복: existing@example.com
```

### 2.5 성공 케이스 ✅

**curl 테스트**:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "새 사용자"
  }'
```

**기대 결과**:
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다",
  "user": {
    "id": "...",
    "email": "newuser@example.com",
    "name": "새 사용자"
  }
}
```

**서버 로그**:
```
✅ [SIGNUP] 회원가입 성공: { userId: 'xxx', email: 'newuser@example.com' }
```

---

## 3. 세션 검증 예외 테스트

### 3.1 세션 없음 ✅

**curl 테스트**:
```bash
# 쿠키 없이 요청
curl http://localhost:3000/api/auth/validate-session
```

**기대 결과**:
```json
{
  "valid": false,
  "error": "AUTH_006",
  "message": "로그인이 필요합니다",
  "shouldLogout": false
}
```

### 3.2 유효한 세션 ✅

**브라우저 콘솔에서 테스트**:
```javascript
// 로그인 후
const response = await fetch('/api/auth/validate-session')
const data = await response.json()
console.log(data)
```

**기대 결과**:
```json
{
  "valid": true,
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "테스트",
    "status": "ACTIVE",
    "avatar": null
  }
}
```

**서버 로그**:
```
✅ [VALIDATE] 유효한 세션: { userId: 'xxx', email: 'test@example.com', status: 'ACTIVE' }
```

### 3.3 삭제된 계정 ✅

**테스트 준비**:
```javascript
// DB에서 사용자 상태 변경
await prisma.user.update({
  where: { email: 'test@example.com' },
  data: { status: 'DELETED' }
})
```

**브라우저 콘솔에서 테스트**:
```javascript
const response = await fetch('/api/auth/validate-session')
const data = await response.json()
console.log(data)
```

**기대 결과**:
```json
{
  "valid": false,
  "error": "AUTH_004",
  "message": "삭제된 계정입니다",
  "shouldLogout": true
}
```

---

## 4. requireAuth 예외 테스트

### 4.1 인증 필요한 API 테스트

**curl 테스트**:
```bash
# 로그인 없이 요청 (requireAuth 사용하는 API)
curl http://localhost:3000/api/studies
```

**기대 결과**:
```json
{
  "error": "AUTH_006",
  "message": "로그인이 필요합니다"
}
```

### 4.2 성공 케이스 ✅

**브라우저 콘솔에서 테스트**:
```javascript
// 로그인 후
const response = await fetch('/api/studies')
const data = await response.json()
console.log(data)
```

**서버 로그**:
```
✅ [AUTH] requireAuth: 인증 성공 { userId: 'xxx', email: 'test@example.com' }
```

---

## 5. 통합 시나리오 테스트

### 시나리오 1: 완전한 회원가입 → 로그인 흐름 ✅

```javascript
// 1. 회원가입
const signupRes = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test1@example.com',
    password: 'password123',
    name: '테스트1'
  })
})
const signupData = await signupRes.json()
console.log('회원가입:', signupData)

// 2. 로그인
const loginRes = await signIn('credentials', {
  email: 'test1@example.com',
  password: 'password123',
  redirect: false
})
console.log('로그인:', loginRes)

// 3. 세션 검증
const validateRes = await fetch('/api/auth/validate-session')
const validateData = await validateRes.json()
console.log('세션 검증:', validateData)
```

**기대 결과**:
```
회원가입: { success: true, message: "회원가입이 완료되었습니다", ... }
로그인: { ok: true, error: null, ... }
세션 검증: { valid: true, user: { ... } }
```

### 시나리오 2: 에러 복구 테스트 ✅

```javascript
// 1. 잘못된 비밀번호로 로그인 시도 (3회)
for (let i = 0; i < 3; i++) {
  const res = await signIn('credentials', {
    email: 'test@example.com',
    password: 'wrongpassword',
    redirect: false
  })
  console.log(`시도 ${i+1}:`, res)
}

// 2. 올바른 비밀번호로 로그인
const res = await signIn('credentials', {
  email: 'test@example.com',
  password: 'password123',
  redirect: false
})
console.log('정상 로그인:', res)
```

**기대 결과**:
```
시도 1: { ok: false, error: "이메일 또는 비밀번호가 일치하지 않습니다" }
시도 2: { ok: false, error: "이메일 또는 비밀번호가 일치하지 않습니다" }
시도 3: { ok: false, error: "이메일 또는 비밀번호가 일치하지 않습니다" }
정상 로그인: { ok: true, error: null }
```

---

## 6. 에러 로깅 확인

### 서버 콘솔 로그 확인

**정상 흐름**:
```
🔐 [AUTH] authorize 시작
🔐 [AUTH] credentials: { email: 'test@example.com', hasPassword: true }
🔍 [AUTH] 사용자 조회 중: test@example.com
✅ [AUTH] 사용자 발견: { id: 'xxx', email: 'test@example.com', status: 'ACTIVE' }
🔑 [AUTH] 비밀번호 검증 중...
🔑 [AUTH] 비밀번호 검증 결과: true
🔍 [AUTH] 관리자 권한 확인 중...
👤 [AUTH] 관리자 여부: ❌ 일반 사용자
✅ [AUTH] 로그인 성공, lastLoginAt 업데이트 중...
✅ [AUTH] authorize 완료
```

**에러 흐름**:
```
🔐 [AUTH] authorize 시작
🔐 [AUTH] credentials: { email: 'test@example.com', hasPassword: true }
🔍 [AUTH] 사용자 조회 중: test@example.com
✅ [AUTH] 사용자 발견: { id: 'xxx', email: 'test@example.com', status: 'ACTIVE' }
🔑 [AUTH] 비밀번호 검증 중...
🔑 [AUTH] 비밀번호 검증 결과: false
❌ [AUTH] 비밀번호 불일치
❌ [AUTH ERROR] authorize: {
  message: '이메일 또는 비밀번호가 일치하지 않습니다',
  code: 'UNKNOWN',
  email: 'test@example.com',
  hasPassword: true
}
```

---

## 7. 성능 테스트

### DB 에러 시뮬레이션

**방법 1: Prisma 에러 강제 발생**
```javascript
// auth.js에서 임시로 에러 발생
const user = await prisma.user.findUnique({
  where: { id: 'invalid-id' }  // 잘못된 ID로 조회
})
```

**방법 2: DB 연결 끊기**
```bash
# Docker로 실행 중이라면
docker stop <postgres-container>
```

**기대 결과**:
```
❌ [AUTH ERROR] authorize - DB 조회: {
  message: 'Database connection error',
  code: 'UNKNOWN',
  email: 'test@example.com'
}
Error: 데이터베이스 조회 중 오류가 발생했습니다
```

---

## 📊 테스트 체크리스트

### 로그인
- [ ] ✅ 이메일/비밀번호 누락
- [ ] ✅ 잘못된 이메일 형식
- [ ] ✅ 존재하지 않는 사용자
- [ ] ✅ 비밀번호 불일치
- [ ] ✅ 소셜 계정 로그인 시도
- [ ] ✅ 삭제된 계정
- [ ] ✅ 정지된 계정
- [ ] ⏸️ DB 연결 오류 (수동 테스트 필요)
- [ ] ⏸️ bcrypt 에러 (시뮬레이션 어려움)

### 회원가입
- [ ] ✅ 잘못된 JSON
- [ ] ✅ 이메일 형식 오류
- [ ] ✅ 비밀번호 짧음
- [ ] ✅ 이름 짧음
- [ ] ✅ 이메일 중복
- [ ] ✅ 정상 가입
- [ ] ⏸️ DB 연결 오류 (수동 테스트 필요)

### 세션 검증
- [ ] ✅ 세션 없음
- [ ] ✅ 유효한 세션
- [ ] ✅ 삭제된 계정
- [ ] ✅ 정지된 계정
- [ ] ⏸️ DB 연결 오류 (수동 테스트 필요)

### requireAuth
- [ ] ✅ 인증 없음
- [ ] ✅ 유효한 인증
- [ ] ✅ 삭제된 계정
- [ ] ✅ 정지된 계정

---

## 🎯 자동 테스트 스크립트 (선택)

### Jest 테스트 예제

**파일**: `coup/src/__tests__/auth/exceptions.test.js`

```javascript
import { validateEmail, validatePassword } from '@/lib/exceptions/validation-helpers'
import { AUTH_ERRORS } from '@/lib/exceptions/auth-errors'

describe('Validation Helpers', () => {
  describe('validateEmail', () => {
    it('should accept valid email', () => {
      const result = validateEmail('test@example.com')
      expect(result.valid).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = validateEmail('invalid-email')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('올바른 이메일 형식이 아닙니다')
    })

    it('should reject empty email', () => {
      const result = validateEmail('')
      expect(result.valid).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should accept valid password', () => {
      const result = validatePassword('password123')
      expect(result.valid).toBe(true)
    })

    it('should reject short password', () => {
      const result = validatePassword('short')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('최소 8자')
    })
  })
})

describe('AUTH_ERRORS', () => {
  it('should have correct error codes', () => {
    expect(AUTH_ERRORS.INVALID_CREDENTIALS.code).toBe('AUTH_001')
    expect(AUTH_ERRORS.MISSING_CREDENTIALS.code).toBe('AUTH_002')
    expect(AUTH_ERRORS.NO_SESSION.code).toBe('AUTH_006')
  })

  it('should have Korean messages', () => {
    expect(AUTH_ERRORS.INVALID_CREDENTIALS.message).toContain('일치하지')
    expect(AUTH_ERRORS.NO_SESSION.message).toContain('로그인')
  })
})
```

---

## 📝 테스트 완료 후

### 체크리스트
- [ ] 모든 필수 테스트 시나리오 통과
- [ ] 에러 로그 확인
- [ ] 사용자 친화적 메시지 확인
- [ ] HTTP 상태 코드 확인
- [ ] 보안 관련 정보 노출 여부 확인

### 문제 발견 시
1. 에러 로그 캡처
2. 재현 단계 기록
3. 이슈 생성 (`docs/exception/implement/auth/ISSUES.md`)

---

**작성자**: GitHub Copilot  
**테스트 일자**: 2025-11-30

