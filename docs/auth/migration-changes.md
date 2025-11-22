# NextAuth 마이그레이션 변경 사항 요약

**작업 날짜**: 2025-01-18  
**작업자**: GitHub Copilot  
**작업 범위**: Phase 1-4 완료, Phase 6 부분 완료

---

## 📦 설치된 패키지

이미 설치되어 있었습니다:
- `next-auth@4.24.13`
- `@auth/prisma-adapter@2.11.1`

---

## 🆕 신규 생성된 파일

### 1. `src/lib/auth.js`
NextAuth 설정 파일
- Credentials Provider 구현
- JWT/Session callbacks
- JSDoc 타입 정의

### 2. `src/lib/session-provider.jsx`
SessionProvider 래퍼 컴포넌트
- Client Component
- next-auth/react의 SessionProvider 래핑

### 3. `middleware.js.backup`
기존 JWT 기반 미들웨어 백업

### 4. `src/lib/auth-helpers.js.backup`
기존 JWT 기반 auth helpers 백업

### 5. `docs/auth/nextauth-migration-progress.md`
마이그레이션 진행 상황 보고서

---

## ✏️ 수정된 파일

### 1. `.env`
**변경 사항:**
```diff
+ # NextAuth
+ NEXTAUTH_URL="http://localhost:3000"
+ NEXTAUTH_SECRET="HQ6ftpRrkCdn7UHQjmDEJu2qsqrpmsDM8HHz9zduH4tsWepzVElOlWiStGufcIwOcBDx0qzjLqVsI0YP8wBebA=="

+ # JWT Secret (Access Token용) - 레거시, 추후 제거 예정
- # JWT Secret (Access Token용)

+ # Refresh Token Secret - 레거시, 추후 제거 예정
- # Refresh Token Secret
```

### 2. `middleware.js`
**변경 사항:**
- JWT 기반 → NextAuth 기반 인증
- `auth()` 함수 사용
- 더 간결한 코드 (자동 갱신 로직 제거)

**Before:**
```javascript
import { verifyAccessToken } from "./src/lib/jwt"
// 수동 토큰 검증, Refresh Token 처리
```

**After:**
```javascript
import { auth } from "@/lib/auth"
export default auth(async function middleware(req) {
  const session = req.auth
  // NextAuth가 자동으로 처리
})
```

### 3. `src/lib/auth-helpers.js`
**변경 사항:**
- JWT 기반 → NextAuth 기반
- 더 간결한 코드

**Before:**
```javascript
import { verifyAccessToken } from "./jwt"
import { cookies } from "next/headers"

const token = cookieStore.get('access-token')?.value
const decoded = verifyAccessToken(token)
```

**After:**
```javascript
import { auth } from "./auth"

const session = await auth()
return { user: session.user }
```

### 4. `src/components/Providers.js`
**변경 사항:**
- AuthSessionProvider 추가

**Before:**
```jsx
export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        {children}
      </SocketProvider>
    </QueryClientProvider>
  )
}
```

**After:**
```jsx
import AuthSessionProvider from '@/lib/session-provider'

export function Providers({ children }) {
  return (
    <AuthSessionProvider>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          {children}
        </SocketProvider>
      </QueryClientProvider>
    </AuthSessionProvider>
  )
}
```

### 5. `src/app/api/auth/[...nextauth]/route.js`
**변경 사항:**
- NextAuth v5 스타일로 업데이트

**Before:**
```javascript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**After:**
```javascript
export { handlers as GET, handlers as POST } from "@/lib/auth"
```

### 6. `src/app/(auth)/sign-in/page.jsx`
**변경 사항:**
- JWT API → NextAuth signIn() 사용
- useSocket → useSession 사용

**Before:**
```javascript
import { useSocket } from '@/contexts/SocketContext'

const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
```

**After:**
```javascript
import { signIn, useSession } from 'next-auth/react'

const result = await signIn('credentials', {
  email,
  password,
  redirect: false,
})
```

### 7. `src/app/(auth)/sign-up/page.jsx`
**변경 사항:**
- 회원가입 후 signIn() 호출
- useSocket → useSession 사용

**Before:**
```javascript
// 회원가입 API가 자동 로그인 처리
if (data.success && data.user) {
  setUser(data.user)
  router.push('/dashboard')
}
```

**After:**
```javascript
// 회원가입 후 명시적으로 로그인
if (data.success) {
  await signIn('credentials', { email, password, redirect: false })
  router.push(callbackUrl)
}
```

### 8. `docs/auth/README.md`
**변경 사항:**
- 현재 상태 섹션 업데이트
- 진행 상황 추가
- nextauth-migration-progress.md 링크 추가

### 9. `docs/auth/nextauth-migration-todo.md`
**변경 사항:**
- Phase 1-4 체크박스 완료 표시
- Phase 6 부분 완료 표시
- 진행 상태 섹션 업데이트

---

## 🔄 동작 방식 변경

### Before: JWT 기반 인증
```
1. 로그인 → /api/auth/login
2. Access Token (15분) + Refresh Token (7일) 발급
3. Access Token을 쿠키에 저장
4. 미들웨어에서 토큰 검증
5. 만료 시 /api/auth/refresh 호출
6. Redis에서 Refresh Token 확인
```

### After: NextAuth 기반 인증
```
1. 로그인 → signIn('credentials')
2. NextAuth가 JWT 세션 생성 (7일)
3. 세션 정보를 쿠키에 저장 (암호화)
4. 미들웨어에서 auth() 호출
5. NextAuth가 자동으로 토큰 갱신
6. Refresh Token 불필요
```

---

## 🎯 주요 개선 사항

### 1. 코드 간결화
- 수동 토큰 관리 코드 제거
- NextAuth가 대부분 자동 처리

### 2. 보안 강화
- 표준화된 JWT 처리
- CSRF 보호 내장
- 세션 암호화

### 3. 유지보수성 향상
- 표준 라이브러리 사용
- 명확한 API
- OAuth 확장 준비

### 4. 개발자 경험 개선
- useSession() 훅으로 간편한 세션 접근
- signIn/signOut 함수로 간편한 인증 처리
- TypeScript 지원 (JSDoc 사용)

---

## ⚠️ 주의사항

### 아직 작동하지 않는 기능

1. **기존 Auth API 엔드포인트**
   - `/api/auth/login` (아직 존재)
   - `/api/auth/logout` (아직 존재)
   - `/api/auth/refresh` (아직 존재)
   - `/api/auth/me` (아직 존재)
   
   → 제거 예정 (Phase 5)

2. **레거시 코드**
   - `src/lib/jwt.js` (아직 존재)
   - 일부 컴포넌트에서 사용 중일 수 있음
   
   → 정리 예정 (Phase 8)

3. **SocketContext**
   - 아직 useSession()과 통합되지 않음
   - 로그인 상태 동기화 필요
   
   → 업데이트 예정 (Phase 6)

---

## 🧪 테스트 방법

### 1. 서버 재시작
```bash
cd C:\Project\CoUp\coup
npm run dev
```

### 2. 로그인 테스트
1. http://localhost:3000/sign-in 접속
2. 이메일/비밀번호 입력
3. 로그인 버튼 클릭
4. /dashboard로 리다이렉트 확인

### 3. 세션 확인
브라우저 개발자 도구:
- Application > Cookies
- `next-auth.session-token` 쿠키 확인

### 4. API 테스트
```bash
# 세션 정보 조회
curl http://localhost:3000/api/auth/session

# CSRF 토큰
curl http://localhost:3000/api/auth/csrf
```

---

## 📚 관련 문서

- [NextAuth 설계 문서](./nextauth.md)
- [마이그레이션 Todo](./nextauth-migration-todo.md)
- [진행 상황 보고서](./nextauth-migration-progress.md)
- [NextAuth 공식 문서](https://authjs.dev/)

---

## 🔜 다음 단계

### 즉시 실행
1. 서버 재시작 및 테스트
2. 로그인/회원가입 동작 확인
3. 브라우저 콘솔 에러 확인

### Phase 5 (기존 API 정리)
1. 기존 Auth API 제거
2. 회원가입 API 단순화
3. 참조 코드 업데이트

### Phase 6 (클라이언트 업데이트)
1. useAuth 커스텀 훅 생성
2. 로그아웃 버튼 업데이트
3. 사용자 정보 표시 업데이트
4. SocketContext 업데이트

---

**작성일**: 2025-01-18  
**작성자**: GitHub Copilot

