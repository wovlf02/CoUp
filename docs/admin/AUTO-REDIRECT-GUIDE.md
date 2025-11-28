# 🔄 자동 리다이렉션 기능 가이드

**작성일**: 2025-11-29  
**기능**: 로그인 후 사용자 권한에 따른 자동 페이지 이동

---

## 📝 개요

CoUp 플랫폼은 **단일 로그인 페이지**를 사용하며, 로그인 성공 후 사용자의 권한에 따라 자동으로 적절한 페이지로 리다이렉션됩니다.

---

## 🎯 동작 방식

### 로그인 플로우

```
사용자가 /sign-in 접속
         ↓
이메일/비밀번호 입력
         ↓
NextAuth 인증 처리
         ↓
    로그인 성공
         ↓
관리자 권한 확인 API 호출
(/api/admin/check-role)
         ↓
┌────────────────┬─────────────────┐
│ 관리자 권한 O  │ 관리자 권한 X   │
│                │                 │
│  AdminRole     │  AdminRole      │
│  존재함        │  없음           │
│                │                 │
│      ↓         │       ↓         │
│   /admin       │   /dashboard    │
│  (관리자)      │  (일반 사용자)  │
└────────────────┴─────────────────┘
```

---

## 🔧 구현 상세

### 1. 로그인 페이지 (sign-in/page.jsx)

```javascript
const handleCredentialsLogin = async (e) => {
  e.preventDefault()
  
  // NextAuth 로그인
  const result = await signIn('credentials', {
    email,
    password,
    redirect: false,
  })

  if (result?.ok) {
    // 관리자 권한 확인
    const adminCheckRes = await fetch('/api/admin/check-role', {
      credentials: 'include',
    })
    
    if (adminCheckRes.ok) {
      const adminData = await adminCheckRes.json()
      
      if (adminData.isAdmin) {
        // 관리자 → /admin
        router.push('/admin')
      } else {
        // 일반 사용자 → /dashboard
        router.push('/dashboard')
      }
    }
  }
}
```

**로그 출력**:
- 관리자: `🔐 관리자 계정 확인, /admin으로 이동`
- 일반 사용자: `👤 일반 사용자 계정, /dashboard로 이동`

### 2. 권한 확인 API (/api/admin/check-role/route.js)

```javascript
export async function GET(request) {
  // 세션에서 사용자 ID 가져오기
  const session = await getServerSession(authOptions)
  
  // AdminRole 테이블에서 관리자 권한 확인
  const adminRole = await prisma.adminRole.findUnique({
    where: { userId: session.user.id }
  })
  
  // 응답
  return NextResponse.json({
    isAdmin: !!adminRole && !isExpired(adminRole),
    role: adminRole?.role || null,
  })
}
```

**응답 예시**:
```json
// 관리자
{
  "isAdmin": true,
  "role": "SUPER_ADMIN"
}

// 일반 사용자
{
  "isAdmin": false,
  "role": null
}
```

---

## 🎭 사용자 타입별 동작

### 1. 관리자 계정

**계정 정보**:
```
이메일: admin@coup.com
비밀번호: Admin123!
AdminRole: SUPER_ADMIN
```

**로그인 후**:
1. `/sign-in`에서 로그인
2. 권한 확인: AdminRole 존재 ✅
3. 자동 이동: `/admin` (관리자 대시보드)

**접근 가능 페이지**:
- ✅ `/admin` - 대시보드
- ✅ `/admin/users` - 사용자 관리
- ✅ `/admin/studies` - 스터디 관리
- ✅ `/admin/reports` - 신고 처리
- ✅ `/admin/analytics` - 통계 분석
- ✅ `/admin/settings` - 시스템 설정
- ✅ `/admin/audit-logs` - 감사 로그
- ✅ `/dashboard` - 일반 대시보드 (접근 가능)

### 2. 일반 사용자 계정

**계정 정보**:
```
이메일: user@example.com
비밀번호: User123!
AdminRole: 없음
```

**로그인 후**:
1. `/sign-in`에서 로그인
2. 권한 확인: AdminRole 없음 ❌
3. 자동 이동: `/dashboard` (사용자 대시보드)

**접근 가능 페이지**:
- ✅ `/dashboard` - 대시보드
- ✅ `/study` - 스터디 목록
- ✅ `/study/[id]` - 스터디 상세
- ✅ `/profile` - 프로필
- ❌ `/admin/**` - 관리자 페이지 (403 Forbidden)

---

## 🔒 보안

### Middleware 보호

```javascript
// middleware.js
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token
    
    // 관리자 페이지 접근 시
    if (pathname.startsWith('/admin')) {
      if (!token) {
        // 로그인 안 됨 → 로그인 페이지
        return NextResponse.redirect(
          new URL('/sign-in?callbackUrl=' + pathname, req.url)
        )
      }
      // 로그인됨 → 각 페이지에서 AdminRole 확인
    }
  }
)
```

### API 레벨 보호

모든 관리자 API는 `requireAdmin` 미들웨어로 보호됩니다:

```javascript
export async function GET(request) {
  // AdminRole 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
  
  // 권한 없으면 403 반환
  if (auth instanceof NextResponse) return auth
  
  // 정상 처리
  // ...
}
```

---

## 🧪 테스트

### 1. 관리자 로그인 테스트

```bash
# 브라우저에서
1. http://localhost:3000/sign-in 접속
2. admin@coup.com / Admin123! 입력
3. 로그인 클릭
4. 자동으로 /admin으로 이동 확인

# 터미널 로그 확인
✅ [AUTH] 로그인 성공
✅ 관리자 권한 확인
🔐 관리자 계정 확인, /admin으로 이동
```

### 2. 일반 사용자 로그인 테스트

```bash
# 일반 사용자 계정 생성
node scripts/create-test-user.js

# 브라우저에서
1. http://localhost:3000/sign-in 접속
2. user@example.com / User123! 입력
3. 로그인 클릭
4. 자동으로 /dashboard로 이동 확인

# 터미널 로그 확인
✅ [AUTH] 로그인 성공
✅ 관리자 권한 확인
👤 일반 사용자 계정, /dashboard로 이동
```

### 3. 권한 없는 페이지 접근 테스트

```bash
# 일반 사용자로 로그인 후
1. 주소창에 http://localhost:3000/admin 입력
2. 403 Forbidden 페이지 표시 확인
   또는 로그인 페이지로 리다이렉트
```

---

## 🎯 특수 케이스 처리

### callbackUrl 파라미터

관리자 페이지에 직접 접근 시도 → 로그인 → 원래 페이지로 돌아가기

```
1. 미로그인 상태에서 /admin/users 접근 시도
2. /sign-in?callbackUrl=/admin/users로 리다이렉트
3. 로그인 성공
4. 권한 확인:
   - 관리자 O → /admin/users (원래 페이지)
   - 관리자 X → /dashboard (권한 없음)
```

**코드**:
```javascript
if (adminData.isAdmin) {
  router.push('/admin')
} else {
  // callbackUrl이 /admin이면 대시보드로
  router.push(callbackUrl === '/admin' ? '/dashboard' : callbackUrl)
}
```

### 이미 로그인된 상태

middleware에서 처리:

```javascript
// 이미 로그인한 사용자가 로그인 페이지 접근
if (token && (pathname === '/sign-in' || pathname === '/sign-up')) {
  return NextResponse.redirect(new URL('/dashboard', req.url))
}
```

---

## 📊 로그 모니터링

### 개발 환경

로그인 시 콘솔에 다음 로그가 출력됩니다:

```
🔐 [AUTH] authorize 시작
🔐 [AUTH] credentials: { email: 'admin@coup.com', hasPassword: true }
🔍 [AUTH] 사용자 조회 중: admin@coup.com
✅ [AUTH] 사용자 발견: { id: 'clx...', email: 'admin@coup.com', status: 'ACTIVE' }
🔑 [AUTH] 비밀번호 검증 중...
🔑 [AUTH] 비밀번호 검증 결과: true
✅ [AUTH] 로그인 성공, lastLoginAt 업데이트 중...
✅ [AUTH] authorize 완료
✅ 로그인 성공, 관리자 권한 확인 중...
🔐 관리자 계정 확인, /admin으로 이동
```

### 프로덕션 환경

- 감사 로그에 자동 기록
- AdminLog 테이블에 저장
- `/admin/audit-logs`에서 확인 가능

---

## 🔄 향후 개선사항

### 1. 역할별 기본 페이지

```javascript
// 역할에 따른 기본 페이지
const defaultPages = {
  'SUPER_ADMIN': '/admin',
  'ADMIN': '/admin',
  'MODERATOR': '/admin/reports',  // 신고 처리 페이지
  'VIEWER': '/admin/analytics',   // 통계 페이지만
}

const defaultPage = defaultPages[adminData.role] || '/dashboard'
router.push(defaultPage)
```

### 2. 마지막 방문 페이지 기억

```javascript
// 로그인 시 마지막 방문 페이지로 이동
const lastVisitedPage = localStorage.getItem('lastVisitedPage')
if (adminData.isAdmin && lastVisitedPage?.startsWith('/admin')) {
  router.push(lastVisitedPage)
} else {
  router.push('/admin')
}
```

### 3. 2단계 인증 (2FA)

관리자 로그인 시 추가 인증 단계:
1. 이메일/비밀번호 인증
2. OTP 코드 입력
3. 권한 확인
4. 리다이렉션

---

## 📞 문의

- **GitHub Issues**: https://github.com/your-repo/issues
- **이메일**: dev@coup.com

---

**마지막 업데이트**: 2025-11-29

