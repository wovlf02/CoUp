# NextAuth 마이그레이션 Todo List

> 상세 설계: [nextauth.md](./nextauth.md)

## 진행 상태
- 🟢 완료
- 🟡 진행 중
- ⚪ 대기 중
- 🔴 문제 발생

---

## Phase 1: 준비 및 설정 (예상 2시간)

### 1.1 패키지 설치 ⚪
```bash
npm install next-auth@latest @auth/prisma-adapter
npm install -D @types/next-auth
```

**확인 사항:**
- [ ] package.json에 패키지 추가됨
- [ ] node_modules 정상 설치
- [ ] 타입 정의 인식됨

---

### 1.2 환경 변수 설정 ⚪

**파일: `.env.local` (또는 `.env`)**
```env
# NextAuth 기본
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here-min-32-characters"

# OAuth Providers (선택 사항)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

**작업:**
- [ ] NEXTAUTH_SECRET 생성 (최소 32자)
  ```bash
  # PowerShell에서 실행
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] `.env.local` 파일 생성/수정
- [ ] `.env.example` 파일 업데이트

---

### 1.3 타입 정의 파일 생성 ⚪

**파일: `src/types/next-auth.d.ts` (신규)**
```typescript
import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "USER" | "ADMIN" | "SYSTEM_ADMIN"
      status: "ACTIVE" | "SUSPENDED" | "DELETED"
      provider: string
    } & DefaultSession["user"]
  }
  
  interface User extends DefaultUser {
    role: "USER" | "ADMIN" | "SYSTEM_ADMIN"
    status: "ACTIVE" | "SUSPENDED" | "DELETED"
    provider?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    role: "USER" | "ADMIN" | "SYSTEM_ADMIN"
    status: "ACTIVE" | "SUSPENDED" | "DELETED"
    provider: string
  }
}
```

**작업:**
- [ ] 파일 생성
- [ ] TypeScript 컴파일 확인
- [ ] IDE에서 타입 인식 확인

---

### 1.4 Prisma 스키마 확인 ⚪

**현재 스키마는 이미 OAuth 준비가 되어 있음:**
- ✅ `googleId` 필드 존재
- ✅ `githubId` 필드 존재
- ✅ `provider` enum 존재

**작업:**
- [ ] Prisma 스키마 검토
- [ ] 필요시 마이그레이션
- [ ] DB 연결 테스트

---

## Phase 2: 핵심 NextAuth 구현 (예상 4시간)

### 2.1 NextAuth 설정 파일 생성 ⚪

**파일: `src/lib/auth.ts` (신규)**

상세 코드는 [nextauth.md](./nextauth.md#1-nextauth-설정-파일) 참조

**주요 구현 사항:**
- [ ] Credentials Provider
  - [ ] 이메일/비밀번호 검증
  - [ ] 사용자 조회
  - [ ] 비밀번호 확인
  - [ ] 계정 상태 확인
- [ ] JWT Callback
  - [ ] 초기 로그인 시 토큰에 정보 추가
  - [ ] 세션 업데이트 처리
- [ ] Session Callback
  - [ ] 세션에 사용자 정보 추가
- [ ] SignIn Callback
  - [ ] OAuth 로그인 처리
  - [ ] 계정 생성/업데이트
  - [ ] lastLoginAt 업데이트
- [ ] Redirect Callback
  - [ ] 로그인 후 리다이렉트 처리
- [ ] Events
  - [ ] SignOut 이벤트 처리

**테스트:**
- [ ] Credentials 로그인 동작 확인
- [ ] JWT 토큰 생성 확인
- [ ] 세션 정보 확인

---

### 2.2 API Route Handler 생성 ⚪

**파일: `src/app/api/auth/[...nextauth]/route.ts` (수정)**

```typescript
export { handlers as GET, handlers as POST } from "@/lib/auth"
```

**작업:**
- [ ] 기존 파일 수정
- [ ] Export 확인
- [ ] API 엔드포인트 테스트 (/api/auth/signin, /api/auth/signout 등)

---

### 2.3 SessionProvider 컴포넌트 생성 ⚪

**파일: `src/lib/session-provider.tsx` (신규)**

```tsx
"use client"
import { SessionProvider } from "next-auth/react"

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionProvider>{children}</SessionProvider>
}
```

**작업:**
- [ ] 파일 생성
- [ ] "use client" 지시문 확인

---

### 2.4 Layout에 SessionProvider 추가 ⚪

**파일: `src/app/layout.tsx` (또는 `.js`) (수정)**

```tsx
import AuthSessionProvider from "@/lib/session-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  )
}
```

**작업:**
- [ ] SessionProvider 추가
- [ ] 앱 전체에서 useSession 사용 가능 확인

---

## Phase 3: 미들웨어 교체 (예상 2시간)

### 3.1 기존 미들웨어 백업 ⚪

```bash
# PowerShell
Copy-Item middleware.js middleware.js.backup
```

**작업:**
- [ ] 백업 파일 생성
- [ ] Git에 백업 커밋

---

### 3.2 새로운 미들웨어 작성 ⚪

**파일: `middleware.ts` (신규/교체)**

상세 코드는 [nextauth.md](./nextauth.md#3-미들웨어) 참조

**주요 구현 사항:**
- [ ] NextAuth의 `auth()` 함수 사용
- [ ] 공개 경로 설정
- [ ] 인증 확인
- [ ] 계정 상태 확인 (ACTIVE만 허용)
- [ ] 관리자 페이지 권한 확인
- [ ] Callback URL 처리

**테스트:**
- [ ] 로그인 없이 공개 페이지 접근 가능
- [ ] 로그인 없이 보호된 페이지 리다이렉트
- [ ] 로그인 후 보호된 페이지 접근 가능
- [ ] 관리자 페이지 권한 확인
- [ ] SUSPENDED 계정 리다이렉트

---

### 3.3 기존 JWT 미들웨어 제거 ⚪

**작업:**
- [ ] `middleware.js` 삭제 (백업 있음)
- [ ] `middleware.ts` 활성화
- [ ] 서버 재시작
- [ ] 모든 경로 테스트

---

## Phase 4: Auth Helpers 교체 (예상 2시간)

### 4.1 기존 Auth Helpers 백업 ⚪

```bash
# PowerShell
Copy-Item src/lib/auth-helpers.js src/lib/auth-helpers.js.backup
```

**작업:**
- [ ] 백업 파일 생성
- [ ] Git에 백업 커밋

---

### 4.2 새로운 Auth Helpers 작성 ⚪

**파일: `src/lib/auth-helpers.ts` (교체)**

상세 코드는 [nextauth.md](./nextauth.md#4-auth-helpers-교체) 참조

**주요 함수:**
- [ ] `getSession()` - 서버 컴포넌트용
- [ ] `requireAuth()` - API Route용 인증 확인
- [ ] `requireAdmin()` - 관리자 권한 확인
- [ ] `requireStudyMember()` - 스터디 멤버십 확인
- [ ] `getCurrentUser()` - 상세 사용자 정보 조회

**작업:**
- [ ] 모든 함수 구현
- [ ] NextAuth의 `auth()` 사용
- [ ] 반환 타입 일치 확인

---

### 4.3 API Routes에서 사용 확인 ⚪

**영향받는 파일 찾기:**
```bash
# PowerShell
Get-ChildItem -Path "src/app/api" -Recurse -Filter "*.js" | Select-String -Pattern "requireAuth|requireAdmin|requireStudyMember"
```

**작업:**
- [ ] 모든 API Route 확인
- [ ] Import 경로 확인
- [ ] 동작 테스트
- [ ] 에러 핸들링 확인

---

## Phase 5: 기존 Auth API 제거 (예상 1시간)

### 5.1 제거할 파일 목록 ⚪

다음 파일들은 NextAuth가 대체하므로 제거:

1. **`src/app/api/auth/login/route.js`** ❌
   - NextAuth signIn()이 대체

2. **`src/app/api/auth/logout/route.js`** ❌
   - NextAuth signOut()이 대체

3. **`src/app/api/auth/refresh/route.js`** ❌
   - NextAuth JWT 자동 갱신

4. **`src/app/api/auth/me/route.js`** ❌
   - useSession() 또는 getSession()이 대체

**작업:**
- [ ] 각 파일 백업 (Git 커밋)
- [ ] 파일 삭제
- [ ] 참조하는 코드 확인

---

### 5.2 회원가입 API 수정 ⚪

**파일: `src/app/api/auth/signup/route.ts` (수정)**

**변경 사항:**
- 회원가입만 처리 (자동 로그인 제거)
- 클라이언트에서 회원가입 후 signIn() 호출

상세 코드는 [nextauth.md](./nextauth.md#7-회원가입-api-수정) 참조

**작업:**
- [ ] 파일 수정
- [ ] 자동 로그인 로직 제거
- [ ] 토큰 생성/쿠키 설정 제거
- [ ] 단순히 사용자 생성만 반환

---

## Phase 6: 클라이언트 코드 수정 (예상 4시간)

### 6.1 Custom Hook 생성 ⚪

**파일: `src/hooks/useAuth.ts` (신규)**

```typescript
"use client"
import { useSession } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: session?.user?.role === "ADMIN" || session?.user?.role === "SYSTEM_ADMIN",
  }
}
```

**작업:**
- [ ] 파일 생성
- [ ] useSession 활용
- [ ] 편의 속성 추가

---

### 6.2 로그인 페이지 수정 ⚪

**파일: `src/app/(auth)/sign-in/page.tsx` (수정)**

상세 코드는 [nextauth.md](./nextauth.md#6-로그인회원가입-페이지-수정) 참조

**주요 변경:**
- [ ] `signIn("credentials", ...)` 사용
- [ ] OAuth 버튼 추가 (Google, GitHub)
- [ ] 에러 핸들링
- [ ] Callback URL 처리
- [ ] redirect: false 옵션

**테스트:**
- [ ] 로그인 성공 시 대시보드 이동
- [ ] 로그인 실패 시 에러 메시지
- [ ] OAuth 버튼 동작 (OAuth 설정 시)

---

### 6.3 회원가입 페이지 수정 ⚪

**파일: `src/app/(auth)/sign-up/page.tsx` (수정)**

**주요 변경:**
- [ ] 회원가입 API 호출
- [ ] 성공 후 자동으로 `signIn()` 호출
- [ ] 대시보드로 리다이렉트

상세 코드는 [nextauth.md](./nextauth.md#6-로그인회원가입-페이지-수정) 참조

**테스트:**
- [ ] 회원가입 성공 시 자동 로그인
- [ ] 회원가입 실패 시 에러 메시지
- [ ] 이메일 중복 체크

---

### 6.4 로그아웃 버튼 수정 ⚪

**영향받는 컴포넌트 찾기:**
```bash
# PowerShell
Get-ChildItem -Path "src" -Recurse -Filter "*.tsx","*.jsx" | Select-String -Pattern "/api/auth/logout"
```

**수정 예시:**
```tsx
// Before
const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
  router.push('/sign-in')
}

// After
import { signOut } from "next-auth/react"

const handleLogout = () => {
  signOut({ callbackUrl: '/' })
}
```

**작업:**
- [ ] 모든 로그아웃 버튼 찾기
- [ ] `signOut()` 사용으로 변경
- [ ] callbackUrl 설정
- [ ] 테스트

---

### 6.5 사용자 정보 표시 수정 ⚪

**영향받는 컴포넌트 찾기:**
```bash
# PowerShell
Get-ChildItem -Path "src" -Recurse -Filter "*.tsx","*.jsx" | Select-String -Pattern "/api/auth/me"
```

**수정 예시:**
```tsx
// Before
const [user, setUser] = useState(null)
useEffect(() => {
  fetch('/api/auth/me').then(res => res.json()).then(data => setUser(data.user))
}, [])

// After
import { useSession } from "next-auth/react"

const { data: session } = useSession()
const user = session?.user
```

**작업:**
- [ ] 모든 사용자 정보 fetch 찾기
- [ ] `useSession()` 사용으로 변경
- [ ] 서버 컴포넌트는 `getSession()` 사용
- [ ] 테스트

---

## Phase 7: OAuth 추가 (Optional, 예상 3시간)

### 7.1 Google OAuth 설정 ⚪

**Google Cloud Console:**
1. [ ] 프로젝트 생성/선택
2. [ ] OAuth 동의 화면 구성
3. [ ] OAuth 2.0 클라이언트 ID 생성
   - 애플리케이션 유형: 웹 애플리케이션
   - 승인된 리디렉션 URI: `http://localhost:3000/api/auth/callback/google`
4. [ ] 클라이언트 ID/Secret 복사
5. [ ] `.env.local`에 추가

**환경 변수:**
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**작업:**
- [ ] Google Cloud Console 설정
- [ ] 환경 변수 추가
- [ ] 서버 재시작
- [ ] 로그인 페이지에서 Google 버튼 테스트

---

### 7.2 GitHub OAuth 설정 ⚪

**GitHub Developer Settings:**
1. [ ] Settings > Developer settings > OAuth Apps
2. [ ] New OAuth App 클릭
3. [ ] Application name: CoUp
4. [ ] Homepage URL: `http://localhost:3000`
5. [ ] Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
6. [ ] Register application
7. [ ] Client ID 복사
8. [ ] Generate a new client secret 클릭 후 복사
9. [ ] `.env.local`에 추가

**환경 변수:**
```env
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

**작업:**
- [ ] GitHub Developer Settings 설정
- [ ] 환경 변수 추가
- [ ] 서버 재시작
- [ ] 로그인 페이지에서 GitHub 버튼 테스트

---

### 7.3 OAuth 플로우 테스트 ⚪

**테스트 시나리오:**
1. [ ] 새 계정으로 Google 로그인
   - 사용자 생성 확인
   - 대시보드 리다이렉트 확인
2. [ ] 기존 계정으로 Google 로그인
   - googleId 업데이트 확인
   - lastLoginAt 업데이트 확인
3. [ ] 새 계정으로 GitHub 로그인
4. [ ] 기존 계정으로 GitHub 로그인
5. [ ] SUSPENDED 계정으로 OAuth 로그인
   - 로그인 차단 확인

---

## Phase 8: Redis 관련 정리 (예상 1시간)

### 8.1 Refresh Token 관련 코드 제거 ⚪

**파일: `src/lib/redis.js` (수정)**

**제거할 함수:**
- [ ] `saveRefreshToken()`
- [ ] `getRefreshToken()`
- [ ] `deleteRefreshToken()`
- [ ] `deleteAllRefreshTokens()`

**유지할 함수:**
- ✅ `getRedisClient()`
- ✅ `closeRedisClient()`
- ✅ 기타 Redis 유틸리티 (Rate Limiting, Caching 등)

**작업:**
- [ ] 파일 수정
- [ ] 사용하지 않는 import 제거
- [ ] 코드 정리

---

### 8.2 Redis 사용 확인 ⚪

**Redis가 다른 곳에서 사용되는지 확인:**
```bash
# PowerShell
Get-ChildItem -Path "src" -Recurse -Filter "*.js","*.ts" | Select-String -Pattern "redis|Redis"
```

**작업:**
- [ ] Redis 사용처 확인
- [ ] Rate Limiting 등 다른 용도로 사용 중이면 유지
- [ ] 완전히 사용하지 않으면 의존성 제거 고려

---

## Phase 9: JWT 라이브러리 정리 (예상 1시간)

### 9.1 JWT 파일 제거 ⚪

**파일: `src/lib/jwt.js` (제거)**

NextAuth가 자체 JWT를 사용하므로 더 이상 필요 없음.

**작업:**
- [ ] 파일 백업 (Git 커밋)
- [ ] 파일 삭제
- [ ] 참조하는 코드 확인

---

### 9.2 jsonwebtoken 패키지 제거 ⚪

**다른 곳에서 사용하는지 확인:**
```bash
# PowerShell
Get-ChildItem -Path "src" -Recurse -Filter "*.js","*.ts" | Select-String -Pattern "jsonwebtoken|jwt.sign|jwt.verify"
```

**패키지 제거 (사용하지 않으면):**
```bash
npm uninstall jsonwebtoken
```

**작업:**
- [ ] 사용처 확인
- [ ] 다른 곳에서 사용하지 않으면 제거
- [ ] package.json 확인

---

## Phase 10: 테스트 작성 및 실행 (예상 4시간)

### 10.1 단위 테스트 ⚪

**테스트 파일: `__tests__/auth/credentials.test.ts` (신규)**

```typescript
describe("Credentials Authentication", () => {
  it("should login with valid credentials", async () => {
    // TODO: 테스트 코드
  })
  
  it("should reject invalid credentials", async () => {
    // TODO: 테스트 코드
  })
  
  it("should reject suspended account", async () => {
    // TODO: 테스트 코드
  })
  
  it("should reject deleted account", async () => {
    // TODO: 테스트 코드
  })
})
```

**작업:**
- [ ] 테스트 파일 생성
- [ ] Credentials 인증 테스트
- [ ] 계정 상태 테스트
- [ ] 에러 케이스 테스트

---

### 10.2 통합 테스트 ⚪

**테스트 시나리오:**
1. [ ] 로그인 → 대시보드 접근
2. [ ] 로그인 → 관리자 페이지 접근 (역할별)
3. [ ] 로그아웃 → 보호된 페이지 리다이렉트
4. [ ] 세션 만료 → 리다이렉트
5. [ ] API 인증 테스트

**작업:**
- [ ] 통합 테스트 작성
- [ ] 모든 시나리오 테스트
- [ ] 통과 확인

---

### 10.3 E2E 테스트 (Optional) ⚪

**Playwright 설치 (선택):**
```bash
npm install -D @playwright/test
npx playwright install
```

**테스트 파일: `e2e/auth.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'

test('complete login flow', async ({ page }) => {
  await page.goto('http://localhost:3000/sign-in')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await page.waitForURL('**/dashboard')
  expect(page.url()).toContain('/dashboard')
})
```

**작업:**
- [ ] Playwright 설치
- [ ] E2E 테스트 작성
- [ ] 로그인/로그아웃 플로우 테스트
- [ ] 통과 확인

---

## Phase 11: 문서화 (예상 2시간)

### 11.1 인증 시스템 문서 업데이트 ⚪

**파일: `docs/backend/auth-system.md` (수정)**

**업데이트 내용:**
- [ ] NextAuth 사용 명시
- [ ] 세션 전략 (JWT) 설명
- [ ] OAuth Provider 설명
- [ ] 사용 예시 추가

---

### 11.2 API 문서 업데이트 ⚪

**파일: `docs/api.md` (수정)**

**업데이트 내용:**
- [ ] 기존 auth API 제거
- [ ] NextAuth API 추가
- [ ] 인증 방법 설명

---

### 11.3 개발자 가이드 작성 ⚪

**파일: `docs/auth/developer-guide.md` (신규)**

**내용:**
- [ ] 로컬 개발 환경 설정
- [ ] 세션 사용 방법
- [ ] 클라이언트/서버 인증 차이
- [ ] 권한 확인 방법
- [ ] 트러블슈팅

---

## Phase 12: 배포 준비 (예상 2시간)

### 12.1 스테이징 환경 테스트 ⚪

**작업:**
- [ ] 스테이징 서버 배포
- [ ] 환경 변수 설정
- [ ] 모든 기능 테스트
- [ ] 성능 측정
- [ ] 에러 로그 확인

---

### 12.2 프로덕션 환경 준비 ⚪

**환경 변수 확인:**
```env
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="production-secret-key-32-characters-minimum"

# OAuth (프로덕션 도메인)
GOOGLE_CLIENT_ID="production-google-client-id"
GOOGLE_CLIENT_SECRET="production-google-client-secret"

GITHUB_CLIENT_ID="production-github-client-id"
GITHUB_CLIENT_SECRET="production-github-client-secret"
```

**작업:**
- [ ] 프로덕션 환경 변수 설정
- [ ] OAuth 콜백 URL 업데이트
- [ ] HTTPS 확인
- [ ] 보안 설정 확인

---

### 12.3 롤백 계획 수립 ⚪

**롤백 시나리오:**
1. [ ] Git 태그 생성 (배포 전)
2. [ ] 데이터베이스 백업
3. [ ] 환경 변수 백업
4. [ ] 롤백 스크립트 준비

**롤백 절차 문서:**
- [ ] 롤백 트리거 조건
- [ ] 롤백 명령어
- [ ] 데이터 복구 방법
- [ ] 사용자 공지 템플릿

---

### 12.4 모니터링 설정 ⚪

**모니터링 항목:**
- [ ] 로그인 성공/실패율
- [ ] 세션 생성/만료
- [ ] API 응답 시간
- [ ] 에러 로그
- [ ] OAuth 콜백 성공률

**알림 설정:**
- [ ] 로그인 실패율 급증
- [ ] API 응답 시간 초과
- [ ] 에러 급증

---

### 12.5 프로덕션 배포 ⚪

**배포 체크리스트:**
- [ ] 모든 테스트 통과
- [ ] 문서 업데이트 완료
- [ ] 환경 변수 확인
- [ ] 데이터베이스 마이그레이션
- [ ] 배포 실행
- [ ] 헬스 체크
- [ ] 기능 테스트
- [ ] 모니터링 확인

---

## 최종 확인 사항

### 기능 체크리스트
- [ ] 이메일/비밀번호 로그인 동작
- [ ] 로그아웃 동작
- [ ] 세션 유지
- [ ] 권한별 페이지 접근 제어
- [ ] 계정 상태별 처리 (ACTIVE, SUSPENDED, DELETED)
- [ ] OAuth 로그인 (Google)
- [ ] OAuth 로그인 (GitHub)
- [ ] 회원가입 동작
- [ ] API 인증
- [ ] 관리자 권한 확인
- [ ] 스터디 멤버십 확인

### 성능 체크리스트
- [ ] 로그인 응답 시간 < 1초
- [ ] 세션 조회 응답 시간 < 100ms
- [ ] 미들웨어 오버헤드 최소화
- [ ] 데이터베이스 쿼리 최적화

### 보안 체크리스트
- [ ] NEXTAUTH_SECRET 강력한 키 사용
- [ ] HTTPS 적용 (프로덕션)
- [ ] HTTP-only 쿠키
- [ ] CSRF 보호 (NextAuth 기본)
- [ ] Rate Limiting (Optional)
- [ ] SQL Injection 방지 (Prisma 기본)
- [ ] XSS 방지

---

## 문제 발생 시 대응

### 일반적인 문제
1. **로그인 실패**
   - [ ] NEXTAUTH_SECRET 확인
   - [ ] 데이터베이스 연결 확인
   - [ ] 사용자 상태 확인

2. **OAuth 콜백 에러**
   - [ ] 클라이언트 ID/Secret 확인
   - [ ] 콜백 URL 확인
   - [ ] OAuth 앱 설정 확인

3. **세션 만료 문제**
   - [ ] JWT maxAge 확인
   - [ ] 쿠키 설정 확인
   - [ ] HTTPS 설정 확인 (프로덕션)

4. **권한 문제**
   - [ ] JWT Callback에서 role 추가 확인
   - [ ] Session Callback에서 role 전달 확인
   - [ ] 미들웨어 권한 로직 확인

---

## 완료 후 점검

- [ ] 모든 Phase 완료
- [ ] 모든 테스트 통과
- [ ] 문서 업데이트 완료
- [ ] 코드 리뷰 완료
- [ ] 배포 완료
- [ ] 모니터링 확인
- [ ] 사용자 피드백 수집

---

## 참고

- 상세 설계: [nextauth.md](./nextauth.md)
- NextAuth 공식 문서: https://authjs.dev/
- Prisma Adapter: https://authjs.dev/getting-started/adapters/prisma

**예상 총 소요 시간: 28시간 (약 3.5일)**

