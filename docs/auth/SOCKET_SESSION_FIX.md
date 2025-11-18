# 🔧 브라우저 세션 초기화 가이드

## 문제 상황
```
❌ Socket connection error: Invalid user
```

사용자 ID가 데이터베이스에 존재하지 않는 경우 발생합니다.
오래된 세션 쿠키가 브라우저에 남아있을 수 있습니다.

---

## ✅ 해결 방법

### 방법 1: 브라우저 개발자 도구에서 쿠키 삭제

1. **개발자 도구 열기**
   - Windows/Linux: `F12` 또는 `Ctrl + Shift + I`
   - Mac: `Cmd + Option + I`

2. **Application 탭으로 이동**
   - Chrome/Edge: Application
   - Firefox: Storage

3. **Cookies 삭제**
   - 좌측 메뉴에서 `Cookies` → `http://localhost:3000` 클릭
   - 모든 쿠키 선택 후 삭제
   - 특히 다음 쿠키들:
     - `next-auth.session-token`
     - `next-auth.csrf-token`
     - `next-auth.callback-url`

4. **새로고침**
   - `Ctrl + Shift + R` (강력 새로고침)

---

### 방법 2: 브라우저 콘솔에서 직접 삭제

1. **개발자 도구 콘솔 열기**

2. **다음 코드 실행**
```javascript
// 모든 쿠키 삭제
document.cookie.split(";").forEach(cookie => {
  const name = cookie.split("=")[0].trim()
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
})

// 로컬 스토리지 삭제
localStorage.clear()

// 세션 스토리지 삭제
sessionStorage.clear()

console.log('✅ All cookies and storage cleared!')
```

3. **페이지 새로고침**

---

### 방법 3: 시크릿/프라이빗 모드로 테스트

1. **새 시크릿 창 열기**
   - Chrome/Edge: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
   - Safari: `Cmd + Shift + N`

2. **http://localhost:3000 접속**

3. **새로 로그인**

---

### 방법 4: 서버에서 강제 세션 초기화

```bash
cd coup

# 개발 서버 중지 후 재시작
# Ctrl + C로 서버 중지

# 서버 재시작
npm run dev
```

---

## 🧪 테스트 순서

### 1. 로그아웃 후 다시 로그인

```bash
1. 브라우저에서 http://localhost:3000 접속
2. 로그아웃 (이미 로그인 상태라면)
3. 다시 로그인
4. 브라우저 콘솔 확인
```

**예상 콘솔 출력:**
```
✅ Socket: User authenticated, preparing connection...
   User ID: cmi45jvji0000vaxcmnirjdhq
   User Email: kim@example.com
   User Name: 김민준
🔌 Socket: Creating new socket instance
🚀 Socket: Initiating connection...
✅ Socket connected: xyz789
```

### 2. 서버 로그 확인

**예상 서버 출력:**
```
🔐 Socket auth attempt: userId=cmi45jvji0000vaxcmnirjdhq
🔍 User lookup: Found 김민준 (kim@example.com) - status: ACTIVE
✅ Socket authenticated: 김민준 (kim@example.com)
User connected: cmi45jvji0000vaxcmnirjdhq
```

---

## 🔍 문제가 계속되면?

### 1. 세션 정보 확인

브라우저 콘솔에서:
```javascript
// 세션 확인
fetch('/api/auth/session')
  .then(r => r.json())
  .then(data => console.log('Current session:', data))
```

### 2. 사용자 ID 확인

```javascript
// 현재 로그인한 사용자 확인
fetch('/api/auth/session')
  .then(r => r.json())
  .then(data => {
    console.log('User ID:', data?.user?.id)
    console.log('User Email:', data?.user?.email)
    console.log('User Name:', data?.user?.name)
    console.log('User Status:', data?.user?.status)
  })
```

### 3. 데이터베이스에서 확인

```bash
cd coup
npx prisma studio
```

User 테이블에서 위에서 확인한 User ID를 검색합니다.

---

## 📝 수정된 코드

### 1. src/lib/auth.js
- `session` callback에 사용자 존재 확인 로직 추가
- 사용자가 없거나 비활성이면 세션 무효화

### 2. src/lib/socket/server.js
- 더 명확한 에러 메시지
- 상세한 로깅

### 3. src/contexts/SocketContext.js
- 에러 유형별 처리
- 더 친절한 로그 메시지

---

## 💡 왜 이런 일이?

1. **이전 세션이 남아있음**
   - 개발 중 데이터베이스 리셋
   - 하지만 브라우저 쿠키는 남아있음

2. **사용자 ID 불일치**
   - 쿠키의 User ID: `cmi438jeb0000vatwahamtz25` (옛날 것)
   - 데이터베이스: 새로 시드된 50명의 사용자

3. **해결**
   - 브라우저 쿠키 삭제
   - 다시 로그인
   - 새로운 세션 생성

---

## ✅ 최종 확인

1. [ ] 브라우저 쿠키 삭제
2. [ ] 서버 재시작
3. [ ] 다시 로그인
4. [ ] 소켓 연결 성공 확인
5. [ ] 에러 메시지 없음 확인

---

**작성일**: 2025-01-18
**문제**: 오래된 세션 쿠키
**해결**: 쿠키 삭제 + 재로그인

