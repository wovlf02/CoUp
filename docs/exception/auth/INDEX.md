# 인증 예외 처리 문서 색인

모든 인증 관련 예외 상황과 처리 방법을 빠르게 찾을 수 있는 색인입니다.

---

## 📁 문서 구조

```
docs/exception/auth/
├── README.md                                      # 시작 가이드
├── CURRENT-LOGIN-ERROR-ANALYSIS.md                # 🔴 현재 오류 분석
├── 01-credentials-login-exceptions.md             # 이메일/비밀번호 로그인
├── 02-oauth-login-exceptions.md                   # 소셜 로그인 (Google/GitHub)
├── 03-session-management-exceptions.md            # 세션 관리
├── 04-signup-exceptions.md                        # 회원가입
├── 06-common-edge-cases.md                        # 공통 엣지 케이스
└── 99-exception-handling-best-practices.md        # 모범 사례
```

---

## 🔍 증상별 찾기

### "이메일 또는 비밀번호가 일치하지 않습니다"
→ [01-credentials-login-exceptions.md#1-이메일-또는-비밀번호-불일치](./01-credentials-login-exceptions.md)  
→ [CURRENT-LOGIN-ERROR-ANALYSIS.md](./CURRENT-LOGIN-ERROR-ANALYSIS.md) ⭐

### "소셜 로그인 계정입니다"
→ [01-credentials-login-exceptions.md#3-소셜-로그인-계정-혼동](./01-credentials-login-exceptions.md)

### "정지된 계정입니다"
→ [01-credentials-login-exceptions.md#2-정지된-계정](./01-credentials-login-exceptions.md)

### "삭제된 계정입니다"
→ [01-credentials-login-exceptions.md#1-삭제된-계정](./01-credentials-login-exceptions.md)

### "세션이 만료되었습니다"
→ [03-session-management-exceptions.md#1-jwt-토큰-만료](./03-session-management-exceptions.md)

### "이미 사용 중인 이메일입니다"
→ [04-signup-exceptions.md#1-이메일-이미-존재](./04-signup-exceptions.md)

### "네트워크 연결을 확인해주세요"
→ [06-common-edge-cases.md#1-네트워크-연결-끊김](./06-common-edge-cases.md)

### "쿠키가 차단되어 있습니다"
→ [06-common-edge-cases.md#1-쿠키-차단](./06-common-edge-cases.md)

---

## 📋 카테고리별 찾기

### Credentials 로그인 (이메일/비밀번호)
**문서**: [01-credentials-login-exceptions.md](./01-credentials-login-exceptions.md)

- 인증 실패
  - 이메일/비밀번호 불일치
  - 빈 입력값
  - 소셜 로그인 계정 혼동
- 계정 상태
  - 삭제된 계정
  - 정지된 계정
  - 미인증 계정 (이메일 인증)
- 유효성 검사
  - 잘못된 이메일 형식
  - 짧은 비밀번호
- 데이터베이스
  - 연결 실패
  - 트랜잭션 실패
- 네트워크
  - 연결 끊김
  - 타임아웃
- 레이트 리미팅
  - 로그인 시도 제한

---

### OAuth 로그인 (소셜)
**문서**: [02-oauth-login-exceptions.md](./02-oauth-login-exceptions.md)

⚠️ **현재 미구현 - 향후 참고용**

- OAuth 설정
  - 환경 변수 누락
  - 리디렉션 URI 불일치
- 인증 흐름
  - 팝업 차단
  - 콜백 실패
  - 인증 취소
- 계정 연동
  - 이메일 중복
  - 비밀번호 설정
- 프로바이더별
  - Google OAuth
  - GitHub OAuth
- 보안
  - CSRF 토큰
  - State 변조
  - Redirect URI 변조

---

### 세션 관리
**문서**: [03-session-management-exceptions.md](./03-session-management-exceptions.md)

- 세션 생성
  - JWT 생성 실패
  - 세션 콜백 오류
- 세션 검증
  - 사용자 없음
  - 계정 상태 변경
- 세션 만료
  - JWT 토큰 만료
  - Remember Me 기능
- 세션 무효화
  - 로그아웃 실패
  - 모든 기기 로그아웃
- 쿠키
  - 쿠키 차단
  - SameSite 정책
  - 쿠키 크기 제한
- 동시 로그인
  - 여러 탭
  - 동시 로그인 제한

---

### 회원가입
**문서**: [04-signup-exceptions.md](./04-signup-exceptions.md)

- 유효성 검사
  - 이메일 형식 오류
  - 비밀번호 규칙 위반
  - 이름 규칙 위반
- 이메일 중복
  - 이메일 이미 존재
  - 실시간 중복 확인
- 데이터베이스
  - 트랜잭션 실패
  - bcrypt 해싱 실패
- 이메일 인증 (선택)
  - 인증 메일 발송 실패
  - 인증 토큰 만료
  - 재발송
- 레이트 리미팅
  - 회원가입 시도 제한
  - reCAPTCHA

---

### 공통 엣지 케이스
**문서**: [06-common-edge-cases.md](./06-common-edge-cases.md)

- 네트워크
  - 연결 끊김
  - 느린 네트워크
  - CORS 오류
- 브라우저
  - JavaScript 비활성화
  - 쿠키 차단
  - 로컬 스토리지 초과
  - 브라우저 호환성
- 시간
  - 시스템 시간 불일치
  - 타임존 차이
- 동시성
  - Race Condition
  - 동시 로그인 시도
- 보안
  - SQL Injection
  - XSS
  - CSRF
  - 비밀번호 해싱
- 접근성
  - 스크린 리더
  - 키보드 네비게이션
  - 포커스 관리

---

### 모범 사례
**문서**: [99-exception-handling-best-practices.md](./99-exception-handling-best-practices.md)

- 에러 핸들링 패턴
  - 계층별 에러 처리
  - 커스텀 에러 클래스
  - 에러 핸들러 미들웨어
- 로깅 전략
  - 로그 레벨
  - 구조화된 로깅
  - 민감 정보 마스킹
- 사용자 피드백
  - 에러 메시지 작성
  - Toast 알림
- 모니터링
  - Sentry 통합
  - 메트릭 수집
- 테스팅
  - 단위 테스트
  - 통합 테스트
- 문서화
  - API 문서

---

## 🛠️ 도구별 찾기

### 스크립트

**사용자 상태 확인**:
```bash
node scripts/check-user-status.js [email]
```
→ [01-credentials-login-exceptions.md](./01-credentials-login-exceptions.md)

**비밀번호 재설정**:
```bash
node scripts/reset-password.js [email] [newPassword]
```
→ [CURRENT-LOGIN-ERROR-ANALYSIS.md](./CURRENT-LOGIN-ERROR-ANALYSIS.md)

**테스트 사용자 생성**:
```bash
node scripts/create-test-user.js
```
→ [01-credentials-login-exceptions.md](./01-credentials-login-exceptions.md)

**테스트 관리자 생성**:
```bash
node scripts/create-test-admin.js
```

**테스트 로그인**:
```bash
node scripts/test-login.js [email] [password]
```

---

### API 엔드포인트

**로그인**:
```
POST /api/auth/[...nextauth]
```
→ [01-credentials-login-exceptions.md](./01-credentials-login-exceptions.md)

**회원가입**:
```
POST /api/auth/signup
```
→ [04-signup-exceptions.md](./04-signup-exceptions.md)

**세션 검증**:
```
GET /api/auth/validate-session
```
→ [03-session-management-exceptions.md](./03-session-management-exceptions.md)

**사용자 정보**:
```
GET /api/auth/me
```

---

## 🎯 시나리오별 찾기

### 처음 로그인하는데 실패하는 경우
1. [회원가입을 했는지 확인](./04-signup-exceptions.md)
2. [이메일/비밀번호가 정확한지 확인](./01-credentials-login-exceptions.md#1-이메일-또는-비밀번호-불일치)
3. [계정 상태 확인](./01-credentials-login-exceptions.md#계정-상태-예외)

### 이전에는 로그인됐는데 지금 안 되는 경우
1. [세션 만료 확인](./03-session-management-exceptions.md#1-jwt-토큰-만료)
2. [계정 정지 여부 확인](./01-credentials-login-exceptions.md#2-정지된-계정)
3. [비밀번호 변경 여부 확인](./01-credentials-login-exceptions.md#1-이메일-또는-비밀번호-불일치)

### 로그인은 되는데 바로 로그아웃되는 경우
1. [쿠키 차단 확인](./06-common-edge-cases.md#1-쿠키-차단)
2. [세션 검증 실패](./03-session-management-exceptions.md#1-세션이-존재하지만-사용자가-없음)
3. [계정 상태 변경](./03-session-management-exceptions.md#2-계정-상태가-변경됨)

### Google로 가입했는데 이메일/비밀번호로 로그인하려는 경우
→ [소셜 로그인 계정 혼동](./01-credentials-login-exceptions.md#3-소셜-로그인-계정-혼동)

### 회원가입이 안 되는 경우
1. [이메일 중복](./04-signup-exceptions.md#1-이메일-이미-존재)
2. [유효성 검사 실패](./04-signup-exceptions.md#유효성-검사-예외)
3. [레이트 리미트](./04-signup-exceptions.md#레이트-리미팅)

---

## 🚀 빠른 해결 가이드

### 1. 일반 사용자 문제

#### 로그인 실패
```bash
# 1단계: 계정 확인
node scripts/check-user-status.js your@email.com

# 2단계: 비밀번호 재설정 (필요시)
node scripts/reset-password.js your@email.com newPassword123

# 3단계: 테스트 계정으로 시도
node scripts/create-test-user.js
```

#### 회원가입 실패
```bash
# 이메일 중복 확인
node scripts/check-user-status.js your@email.com

# 데이터베이스 연결 확인
node scripts/check-db-connection.js
```

---

### 2. 개발자 디버깅

#### 서버 로그 확인
```bash
cd C:\Project\CoUp\coup
npm run dev

# 로그에서 [AUTH] 태그 확인
```

#### 데이터베이스 직접 확인
```bash
npx prisma studio
# User 테이블 열어서 계정 확인
```

#### 에러 추적
```javascript
// src/lib/logger.js 사용
import { logger } from '@/lib/logger'

logger.error('Login failed', {
  email: credentials.email,
  error: error.message
})
```

---

### 3. 긴급 상황

#### 모든 사용자가 로그인 못 하는 경우
1. 데이터베이스 연결 확인
2. NextAuth 설정 확인 (`JWT_SECRET`)
3. 서버 재시작

#### 특정 사용자만 로그인 못 하는 경우
1. 계정 상태 확인 (ACTIVE?)
2. 비밀번호 재설정
3. 계정 정지/삭제 이력 확인

---

## 📞 추가 지원

### 문서에서 답을 찾지 못한 경우

1. **서버 로그 캡처**
   - `[AUTH]` 태그가 붙은 모든 로그
   - 에러 스택 트레이스

2. **재현 단계 기록**
   - 어떤 순서로 문제가 발생하는지
   - 브라우저, OS 정보

3. **환경 정보**
   - Node.js 버전
   - 데이터베이스 상태
   - 환경 변수 설정 (민감 정보 제외)

---

**최종 업데이트**: 2025-11-29  
**문서 개수**: 8개  
**총 라인 수**: 약 5,000줄

