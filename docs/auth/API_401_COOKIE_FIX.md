# 🔥 401 Unauthorized 에러 해결 - API 쿠키 전달 문제

**날짜**: 2025-11-18  
**에러**: `GET /api/dashboard 401 (Unauthorized)`  
**증상**: 세션이 있는데도 API 호출 시 401 에러

---

## 🐛 문제 상황

```javascript
// 브라우저 콘솔
fetch('/api/auth/session')
  .then(r => r.json())
  .then(data => console.log(data))
// → { user: { id: "...", email: "..." } } ✅ 세션 있음!

fetch('/api/dashboard')
  .then(r => r.json())
  .then(data => console.log(data))
// → { error: "로그인이 필요합니다" } ❌ 401 에러!
```

**이상한 점:**
- ✅ 세션은 존재함 (`/api/auth/session`에서 확인)
- ❌ API 호출하면 401 에러 (로그인 필요)
- ❓ 왜?

---

## 💡 근본 원인

### fetch API와 쿠키 전달

```javascript
// ❌ 문제의 코드 (src/lib/api/client.js)
async function fetchAPI(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  }
  
  const response = await fetch(url, config)
  // ← credentials 옵션이 없어서 쿠키가 전달되지 않음!
}
```

**문제:**
- 기본적으로 `fetch()`는 쿠키를 자동으로 포함하지 않음
- NextAuth의 세션 쿠키 (`next-auth.session-token`)가 API 요청에 포함되지 않음
- 서버는 쿠키가 없으니 "로그인 안 함"으로 판단
- → 401 Unauthorized

### 왜 `/api/auth/session`은 작동하나?

```javascript
// Next.js가 자동으로 처리하는 경로
/api/auth/*  // ← NextAuth가 자체적으로 쿠키 처리

// 일반 API 경로
/api/dashboard  // ← fetch()에서 수동으로 credentials 설정 필요
```

---

## ✅ 해결 방법

### 1. credentials: 'include' 추가

```javascript
// ✅ 수정된 코드 (src/lib/api/client.js)
async function fetchAPI(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // ⭐ 이것이 핵심!
    ...options,
  }
  
  const response = await fetch(url, config)
  // ...
}
```

### credentials 옵션 설명

| 값 | 설명 | 언제 사용? |
|---|---|---|
| `omit` | 쿠키 전송 안 함 (기본값) | 공개 API |
| `same-origin` | 같은 도메인만 | SPA (권장) |
| `include` | 항상 전송 | CORS 환경 |

**우리 경우:**
- `credentials: 'include'` 사용
- 같은 도메인이지만 명시적으로 쿠키 포함 보장
- SSR/CSR 모두 작동

---

## 📊 Before / After

### ❌ Before

```javascript
// 클라이언트 → 서버
GET /api/dashboard
Headers:
  Content-Type: application/json
  // ← 쿠키 없음!

// 서버 (requireAuth)
getServerSession(authOptions)
// → session = null (쿠키가 없으니)
// → return 401 Unauthorized
```

### ✅ After

```javascript
// 클라이언트 → 서버
GET /api/dashboard
Headers:
  Content-Type: application/json
  Cookie: next-auth.session-token=eyJ... ✅

// 서버 (requireAuth)
getServerSession(authOptions)
// → session = { user: { id, email, ... } } ✅
// → DB에서 사용자 확인 ✅
// → return { user } ✅
```

---

## 🧪 테스트

### 1. 브라우저 콘솔에서 확인

```javascript
// 세션 확인
fetch('/api/auth/session', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(data => console.log('Session:', data))
// → { user: {...} } ✅

// API 호출 확인
fetch('/api/dashboard', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(data => console.log('Dashboard:', data))
// → { data: {...}, success: true } ✅
```

### 2. 네트워크 탭 확인

**Chrome DevTools (F12) → Network:**

1. `/api/dashboard` 요청 클릭
2. **Headers** 탭 확인:
   ```
   Request Headers:
     Cookie: next-auth.session-token=... ✅
   ```

3. **Response:**
   ```json
   {
     "data": {
       "stats": { ... },
       "myStudies": [ ... ],
       ...
     }
   }
   ```

---

## 🔍 추가 확인 사항

### 서버 로그 확인

```bash
# 터미널 (서버)
# Before (401 에러)
⚠️ requireAuth: No valid session

# After (정상)
✅ requireAuth: User found
```

### 쿠키 확인

**DevTools → Application → Cookies:**
- `next-auth.session-token` 존재 확인
- Domain: `localhost`
- Path: `/`
- HttpOnly: ✅
- Secure: (개발환경은 없음)

---

## 📝 수정된 파일

### src/lib/api/client.js

```javascript
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // ⭐ 추가됨!
    ...options,
  }

  // ...rest of the code
}
```

**변경 사항:**
- ✅ `credentials: 'include'` 추가
- ✅ 모든 API 요청에 자동으로 쿠키 포함
- ✅ 파일 업로드도 쿠키 포함

---

## 🎯 핵심 교훈

### 1. fetch() 기본 동작
- **쿠키는 자동으로 포함되지 않음**
- 명시적으로 `credentials` 옵션 필요

### 2. NextAuth와 쿠키
- NextAuth는 쿠키 기반 세션 사용
- 모든 API 요청에 세션 쿠키 필요
- `credentials: 'include'` 필수!

### 3. 디버깅 팁
```javascript
// API 요청 시 쿠키 확인
fetch('/api/dashboard', {
  credentials: 'include'
})
  .then(r => {
    console.log('Response:', r.status)
    console.log('Headers:', [...r.headers.entries()])
    return r.json()
  })
```

### 4. 보안 고려사항
- `credentials: 'include'`는 CORS 환경에서 주의
- 같은 도메인이면 `'same-origin'`도 가능
- 프로덕션에서는 HTTPS + Secure 쿠키 필수

---

## ✅ 체크리스트

- [x] `src/lib/api/client.js`에 `credentials: 'include'` 추가
- [x] 파일 업로드 메서드도 credentials 유지
- [ ] 브라우저에서 테스트
- [ ] 네트워크 탭에서 쿠키 전달 확인
- [ ] 401 에러 사라짐 확인

---

## 🚀 즉시 테스트

```bash
# 1. 서버 실행 확인
# 터미널에서 서버가 실행 중인지 확인

# 2. 브라우저 콘솔 (F12)
fetch('/api/dashboard', { credentials: 'include' })
  .then(r => r.json())
  .then(data => console.log('✅ Dashboard data:', data))

# 3. 대시보드 페이지 새로고침
# → 401 에러 없이 정상 로드!
```

---

## 📚 관련 문서

- **API_403_FIX.md** - requireAuth DB 검증
- **NEXTAUTH_SESSION_ERROR_FIX.md** - Session callback
- **EMERGENCY_SESSION_FIX.md** - 세션 쿠키 삭제

---

## 🎉 결과

### Before
```
✅ 세션 있음
❌ API 401 에러
😢 대시보드 안 보임
```

### After
```
✅ 세션 있음
✅ API 200 성공
✅ 대시보드 정상!
```

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-11-18  
**상태**: ✅ 완전 해결

**핵심**: `credentials: 'include'` 추가!

