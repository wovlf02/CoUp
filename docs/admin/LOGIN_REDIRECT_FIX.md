# 관리자 로그인 리다이렉트 수정 완료

> **수정일**: 2025-11-27  
> **이슈**: 관리자 로그인 시 `/admin`이 아닌 `/admin/dashboard`로 이동 필요

---

## ✅ 수정 사항

### 1. 미들웨어 (`middleware.js`)

#### 로그인 후 리다이렉트 로직 개선

**Before**:
```javascript
if (token && (pathname === '/sign-in' || pathname === '/sign-up')) {
  return NextResponse.redirect(new URL('/dashboard', req.url))
}
```

**After**:
```javascript
if (token && (pathname === '/sign-in' || pathname === '/sign-up')) {
  // 관리자는 관리자 대시보드로, 일반 사용자는 일반 대시보드로
  if (token.role === 'ADMIN' || token.role === 'SYSTEM_ADMIN') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }
  return NextResponse.redirect(new URL('/dashboard', req.url))
}
```

#### `/admin` 루트 경로 리다이렉트 추가

```javascript
// /admin 루트 경로는 /admin/dashboard로 리다이렉트
if (pathname === '/admin' || pathname === '/admin/') {
  return NextResponse.redirect(new URL('/admin/dashboard', req.url))
}
```

---

### 2. 로그인 페이지 (`sign-in/page.jsx`)

#### 로그인 성공 시 리다이렉트 로직 수정 (2곳)

**Before**:
```javascript
if (userData.user?.role === 'ADMIN' || userData.user?.role === 'SYSTEM_ADMIN') {
  router.push('/admin')
} else {
  router.push(callbackUrl)
}
```

**After**:
```javascript
if (userData.user?.role === 'ADMIN' || userData.user?.role === 'SYSTEM_ADMIN') {
  router.push('/admin/dashboard')
} else {
  router.push(callbackUrl)
}
```

**수정 위치**:
1. ✅ 세션 검증 부분 (`useEffect` 내부)
2. ✅ Credentials 로그인 성공 부분 (`handleCredentialsLogin` 내부)

---

## 🎯 리다이렉트 플로우

### 일반 사용자 (USER)
```
로그인 → /sign-in → /dashboard ✅
회원가입 후 로그인 → /dashboard ✅
```

### 관리자 (ADMIN, SYSTEM_ADMIN)
```
로그인 → /sign-in → /admin/dashboard ✅
이미 로그인 상태에서 /sign-in 접속 → /admin/dashboard ✅
/admin 직접 접속 → /admin/dashboard ✅
/admin/ (슬래시 포함) → /admin/dashboard ✅
```

---

## 🧪 테스트 체크리스트

### 일반 사용자
- [ ] 로그인 → `/dashboard`로 이동
- [ ] 회원가입 후 로그인 → `/dashboard`로 이동
- [ ] 이미 로그인된 상태에서 `/sign-in` 접속 → `/dashboard`로 리다이렉트

### 관리자
- [ ] 로그인 → `/admin/dashboard`로 이동 (⭐ 핵심)
- [ ] 이미 로그인된 상태에서 `/sign-in` 접속 → `/admin/dashboard`로 리다이렉트
- [ ] `/admin` 직접 입력 → `/admin/dashboard`로 리다이렉트
- [ ] `/admin/` (슬래시 포함) → `/admin/dashboard`로 리다이렉트

### 권한 없는 사용자
- [ ] 일반 사용자가 `/admin` 접속 → `/admin/unauthorized` 페이지

---

## 📁 수정된 파일

```
coup/
├── middleware.js                        # ✅ 로그인 시 역할별 리다이렉트
│                                        # ✅ /admin → /admin/dashboard 리다이렉트
├── src/
│   ├── lib/
│   │   └── auth.js                     # (변경 없음)
│   └── app/
│       └── (auth)/
│           └── sign-in/
│               └── page.jsx            # ✅ 로그인 성공 시 /admin/dashboard로
```

---

## ✨ 결과

이제 관리자는 로그인 시 **자동으로 관리자 대시보드**로 이동합니다! 🎉

### 3단계 리다이렉트 처리
1. **클라이언트 (로그인 페이지)**: 로그인 성공 시 역할 체크 → 리다이렉트
2. **미들웨어 (서버)**: `/sign-in` 접속 시 이미 로그인된 경우 역할별 리다이렉트
3. **미들웨어 (서버)**: `/admin` 접속 시 `/admin/dashboard`로 리다이렉트

### 장점
- ✅ 역할 기반 리다이렉트 (USER → `/dashboard`, ADMIN → `/admin/dashboard`)
- ✅ `/admin` 루트 경로 자동 리다이렉트
- ✅ 깔끔한 UX (한 번에 목적지 도달)
- ✅ 모든 경로에서 일관된 동작

---

**수정 완료**: 2025-11-27  
**테스트 상태**: ✅ 준비 완료  
**다음 단계**: 실제 로그인 테스트


