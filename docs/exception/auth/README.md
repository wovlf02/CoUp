# 인증 예외 처리 문서

CoUp 프로젝트의 인증 시스템에서 발생할 수 있는 모든 예외 상황과 처리 방법을 문서화합니다.

---

## 📋 목차

1. [개요](#개요)
2. [문서 구조](#문서-구조)
3. [예외 처리 원칙](#예외-처리-원칙)
4. [문서 목록](#문서-목록)

---

## 개요

### 인증 시스템 구성

CoUp의 인증 시스템은 다음과 같이 구성되어 있습니다:

- **NextAuth v4** - 세션 관리 및 인증 프레임워크
- **JWT 기반 세션** - stateless 세션 관리
- **브라우저 세션 쿠키** - maxAge: undefined (브라우저 닫으면 자동 로그아웃)
- **Prisma ORM** - 사용자 데이터 관리

### 지원하는 인증 방식

1. **Credentials (이메일/비밀번호)** ✅ 구현 완료
2. **Google OAuth** 🚧 준비 중
3. **GitHub OAuth** 🚧 준비 중

---

## 문서 구조

```
docs/exception/auth/
├── README.md                           # 이 문서
├── 01-credentials-login-exceptions.md  # 이메일/비밀번호 로그인 예외
├── 02-oauth-login-exceptions.md        # 소셜 로그인 예외
├── 03-session-management-exceptions.md # 세션 관리 예외
├── 04-signup-exceptions.md             # 회원가입 예외
├── 05-logout-exceptions.md             # 로그아웃 예외
├── 06-common-edge-cases.md             # 공통 엣지 케이스
└── 99-exception-handling-best-practices.md # 예외 처리 모범 사례
```

---

## 예외 처리 원칙

### 1. 사용자 친화적 메시지

❌ **나쁜 예**:
```javascript
throw new Error("Database connection failed")
```

✅ **좋은 예**:
```javascript
throw new Error("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
```

### 2. 보안 고려사항

**정보 노출 방지**:
- 사용자 존재 여부 노출 금지
- 시스템 내부 정보 노출 금지
- 에러 스택 트레이스 노출 금지

❌ **나쁜 예**:
```javascript
if (!user) throw new Error("사용자를 찾을 수 없습니다")
if (!isValid) throw new Error("비밀번호가 일치하지 않습니다")
```

✅ **좋은 예**:
```javascript
if (!user || !isValid) {
  throw new Error("이메일 또는 비밀번호가 일치하지 않습니다")
}
```

### 3. 로깅 전략

- **클라이언트**: 최소한의 정보만 로깅
- **서버**: 상세한 디버깅 정보 로깅
- **프로덕션**: 민감 정보 마스킹

```javascript
// 서버 로그 (상세)
console.log('🔐 [AUTH] authorize 시작')
console.log('🔐 [AUTH] credentials:', { 
  email: credentials?.email, 
  hasPassword: !!credentials?.password  // 비밀번호는 노출 안 함
})

// 클라이언트 로그 (간단)
console.error('❌ 로그인 실패:', result.error)
```

### 4. 에러 코드 체계

```typescript
enum AuthErrorCode {
  // 인증 실패 (4xx)
  INVALID_CREDENTIALS = 'auth/invalid-credentials',
  ACCOUNT_DELETED = 'auth/account-deleted',
  ACCOUNT_SUSPENDED = 'auth/account-suspended',
  ACCOUNT_NOT_VERIFIED = 'auth/account-not-verified',
  
  // 유효성 검사 (4xx)
  INVALID_EMAIL = 'auth/invalid-email',
  WEAK_PASSWORD = 'auth/weak-password',
  EMAIL_ALREADY_EXISTS = 'auth/email-exists',
  
  // 세션 (4xx)
  SESSION_EXPIRED = 'auth/session-expired',
  SESSION_INVALID = 'auth/session-invalid',
  
  // OAuth (4xx)
  OAUTH_ERROR = 'auth/oauth-error',
  OAUTH_CANCELLED = 'auth/oauth-cancelled',
  
  // 서버 오류 (5xx)
  DATABASE_ERROR = 'auth/database-error',
  SERVER_ERROR = 'auth/server-error',
  
  // 제한 (4xx)
  RATE_LIMIT_EXCEEDED = 'auth/rate-limit',
  TOO_MANY_ATTEMPTS = 'auth/too-many-attempts',
}
```

---

## 문서 목록

### 1. Credentials 로그인 예외
**파일**: `01-credentials-login-exceptions.md`

다루는 내용:
- 이메일/비밀번호 검증 실패
- 계정 상태 확인 (삭제, 정지)
- 비밀번호 불일치
- 소셜 로그인 계정 혼동
- 데이터베이스 연결 오류

### 2. OAuth 로그인 예외
**파일**: `02-oauth-login-exceptions.md`

다루는 내용:
- Google OAuth 실패
- GitHub OAuth 실패
- OAuth 콜백 처리 오류
- 이메일 중복 처리
- OAuth 토큰 만료

### 3. 세션 관리 예외
**파일**: `03-session-management-exceptions.md`

다루는 내용:
- 세션 만료
- 세션 무효화
- 동시 로그인 처리
- 세션 갱신 실패
- JWT 파싱 오류

### 4. 회원가입 예외
**파일**: `04-signup-exceptions.md`

다루는 내용:
- 이메일 중복
- 유효성 검사 실패
- 비밀번호 규칙 위반
- 이메일 인증 실패
- 가입 제한 (rate limit)

### 5. 로그아웃 예외
**파일**: `05-logout-exceptions.md`

다루는 내용:
- 로그아웃 실패
- 세션 정리 오류
- 쿠키 삭제 실패
- 리다이렉트 오류

### 6. 공통 엣지 케이스
**파일**: `06-common-edge-cases.md`

다루는 내용:
- 네트워크 연결 끊김
- 브라우저 호환성 문제
- 쿠키 차단
- JavaScript 비활성화
- 타임아웃 처리

### 7. 예외 처리 모범 사례
**파일**: `99-exception-handling-best-practices.md`

다루는 내용:
- 에러 핸들링 패턴
- 재시도 로직
- 폴백 전략
- 사용자 경험 개선
- 모니터링 및 알림

---

## 빠른 참조

### 현재 발생 중인 오류

**증상**: "이메일 또는 비밀번호가 일치하지 않습니다."

**원인 파악 순서**:
1. [Credentials 로그인 예외](./01-credentials-login-exceptions.md#이메일-또는-비밀번호-불일치) 확인
2. 서버 로그에서 `[AUTH]` 태그로 검색
3. 데이터베이스 연결 상태 확인
4. 사용자 계정 상태 확인 (ACTIVE/SUSPENDED/DELETED)

**관련 문서**:
- [01-credentials-login-exceptions.md](./01-credentials-login-exceptions.md)
- [03-session-management-exceptions.md](./03-session-management-exceptions.md)

---

## 🚨 현재 이슈

**로그인 실패 오류**: "이메일 또는 비밀번호가 일치하지 않습니다."

→ [현재 오류 분석 보기](./CURRENT-LOGIN-ERROR-ANALYSIS.md)

**즉시 시도해볼 수 있는 해결 방법**:

1. **서버 콘솔에서 `[AUTH]` 로그 확인**
   ```bash
   # PowerShell에서 개발 서버 콘솔 확인
   cd C:\Project\CoUp\coup
   npm run dev
   # 로그인 시도 후 로그 확인
   ```

2. **계정 상태 확인**
   ```bash
   node scripts/check-user-status.js your-email@example.com
   ```

3. **비밀번호 재설정**
   ```bash
   node scripts/reset-password.js your-email@example.com newpassword123
   ```

4. **테스트 계정으로 로그인 시도**
   ```bash
   node scripts/create-test-user.js
   # Email: test@example.com
   # Password: password123
   ```

---

## 업데이트 로그

- **2025-11-29**: 초기 문서 생성
- **2025-11-29**: Credentials 로그인 예외 문서 작성 (01)
- **2025-11-29**: OAuth 로그인 예외 문서 작성 (02)
- **2025-11-29**: 세션 관리 예외 문서 작성 (03)
- **2025-11-29**: 회원가입 예외 문서 작성 (04)
- **2025-11-29**: 공통 엣지 케이스 문서 작성 (06)
- **2025-11-29**: 예외 처리 모범 사례 문서 작성 (99)
- **2025-11-29**: 현재 로그인 오류 분석 문서 작성
- **2025-11-29**: 비밀번호 재설정 스크립트 추가

---

## 기여 가이드

새로운 예외 케이스를 발견했을 때:

1. 해당 카테고리의 문서를 찾습니다
2. 문서에 예외 케이스를 추가합니다:
   - **증상**: 사용자가 보는 오류
   - **원인**: 기술적인 원인
   - **재현 방법**: 오류를 재현하는 단계
   - **해결 방법**: 코드 수정 또는 대응 방법
   - **예방 방법**: 향후 예방책

---

**유지보수**: 이 문서는 인증 시스템 변경 시 함께 업데이트되어야 합니다.

