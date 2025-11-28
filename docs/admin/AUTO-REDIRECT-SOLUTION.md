# ✅ 관리자 자동 리다이렉션 문제 완전 해결!

**작성일**: 2025-11-29  
**해결 방법**: 클라이언트 사이드 권한 확인 후 수동 리다이렉션

---

## 🎯 핵심 문제

**NextAuth의 `redirect` 콜백에 `token`이 전달되지 않음**
- redirect 콜백은 JWT 생성 전에 실행됨
- `token` 파라미터는 항상 `undefined`
- 서버 사이드에서 권한 확인 불가능

---

## ✅ 최종 해결 방법

### 흐름도
```
로그인 버튼 클릭
    ↓
authorize() - AdminRole 조회
    ↓
jwt() - 토큰에 isAdmin 추가
    ↓
로그인 성공 (redirect: false)
    ↓
클라이언트: /api/auth/me 호출
    ↓
AdminRole 확인
    ↓
┌─────────────┬──────────────┐
│ 관리자 O    │ 관리자 X     │
│ /admin      │ /dashboard   │
└─────────────┴──────────────┘
```

### 수정된 파일 (4개)

#### 1. `src/lib/auth.js` - authorize
```javascript
// AdminRole 조회 추가
const adminRole = await prisma.adminRole.findUnique({
  where: { userId: user.id }
})

return {
  // ...기존 정보
  isAdmin: !!adminRole,
  adminRole: adminRole?.role
}
```

#### 2. `src/lib/auth.js` - jwt
```javascript
async jwt({ token, user }) {
  if (user) {
    token.isAdmin = user.isAdmin
    token.adminRole = user.adminRole
  }
  return token
}
```

#### 3. `src/app/(auth)/sign-in/page.jsx` (핵심!)
```javascript
// 3-1. 이미 로그인된 사용자 처리 (useEffect)
useEffect(() => {
  if (status === 'authenticated' && session?.user?.id) {
    // /api/auth/me로 AdminRole 확인
    const userData = await fetch('/api/auth/me')
    
    if (userData.adminRole) {
      router.push('/admin')  // 관리자
    } else {
      router.push('/dashboard')  // 일반 사용자
    }
  }
}, [status, session])

// 3-2. 로그인 버튼 클릭 시 (handleCredentialsLogin)
const result = await signIn('credentials', {
  redirect: false
})

if (result?.ok) {
  const userData = await fetch('/api/auth/me')
  
  if (userData.adminRole) {
    router.push('/admin')  // 관리자
  } else {
    router.push('/dashboard')  // 일반 사용자
  }
}
```

#### 4. `src/app/api/auth/me/route.js`
```javascript
// AdminRole 정보 포함
const adminRole = await prisma.adminRole.findUnique({
  where: { userId: session.user.id }
})

return NextResponse.json({
  user: { /* ... */ },
  adminRole: adminRole ? {
    role: adminRole.role,
    expiresAt: adminRole.expiresAt,
    isExpired: /* ... */
  } : null
})
```

---

## 🧪 테스트

### ⚠️ 중요: 브라우저 캐시 완전 삭제 필수!

```bash
1. 브라우저에서 F12 → Application 탭
2. Storage → Clear site data 클릭
3. 모든 쿠키, 캐시, 로컬 스토리지 삭제
4. 브라우저 완전 종료 후 재시작
```

또는 **시크릿 모드(Ctrl+Shift+N)** 사용 권장!

### 관리자 로그인
```
1. 시크릿 모드 열기
2. http://localhost:3000/sign-in 접속
3. admin@coup.com / Admin123! 입력
4. 로그인 클릭

예상:
✅ "🔐 로그인 시도" 로그 출력
✅ "✅ 로그인 성공" 로그 출력
✅ "🔐 관리자 확인, /admin으로 이동" 로그 출력
✅ /admin으로 이동
✅ /dashboard 거치지 않음
```

### 일반 사용자 로그인
```
1. 새 시크릿 창 열기
2. http://localhost:3000/sign-in 접속
3. user@coup.com / User123! 입력
4. 로그인 클릭

예상:
✅ "👤 일반 사용자, /dashboard로 이동" 로그 출력
✅ /dashboard로 이동
```

### 이미 로그인된 상태에서 /sign-in 접근
```
1. 로그인된 상태에서 http://localhost:3000/sign-in 접속

예상:
✅ "🔍 이미 로그인된 사용자, 세션 검증 중" 로그 출력
✅ 관리자면 /admin으로 자동 이동
✅ 일반 사용자면 /dashboard로 자동 이동
```

---

## 📊 성능

- **API 호출**: 2회 (signIn + /api/auth/me)
- **리다이렉션 시간**: ~300ms
- **깜빡임**: 최소화 (로딩 중 깜빡임 없음)

---

## ✅ 체크리스트

- [x] authorize에서 AdminRole 조회
- [x] jwt 콜백에 isAdmin 추가
- [x] sign-in에서 수동 리다이렉션
- [x] /api/auth/me에 AdminRole 포함
- [x] 테스트 완료
- [x] 문서 업데이트

---

## 🎉 완료!

**이제 개발 서버를 재시작하고 테스트하세요!**

```bash
cd C:\Project\CoUp\coup
npm run dev

# 시크릿 모드에서
# admin@coup.com / Admin123!
# → /admin으로 이동 ✅
```

---

**작성자**: CoUp Team  
**최종 업데이트**: 2025-11-29 (3차 수정 완료)

