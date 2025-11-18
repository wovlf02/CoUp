# 🎯 소켓 에러 완전 해결 - 실행 가이드

## 📋 문제 요약

```
❌ Socket connection error: Invalid user
```

**원인**: 브라우저에 저장된 오래된 세션 쿠키가 데이터베이스에 존재하지 않는 사용자 ID를 참조

**사용자 ID**: `cmi438jeb0000vatwahamtz25` (DB에 없음)  
**실제 DB**: 50명의 새로운 사용자 (시드 데이터)

---

## ✅ 즉시 실행할 명령어

### 1단계: 브라우저 쿠키 삭제 (가장 중요!)

**Chrome/Edge 개발자 도구 콘솔에서 실행:**
```javascript
// 모든 쿠키 및 스토리지 삭제
document.cookie.split(";").forEach(cookie => {
  const name = cookie.split("=")[0].trim()
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
})
localStorage.clear()
sessionStorage.clear()
console.log('✅ All cookies cleared! Please refresh the page.')
```

### 2단계: 페이지 새로고침

**강력 새로고침:**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 3단계: 다시 로그인

**테스트 계정:**
```
이메일: kim@example.com
비밀번호: password123

또는

이메일: admin@example.com
비밀번호: password123
```

---

## 🔍 예상 결과

### ✅ 성공 시 브라우저 콘솔

```
✅ Socket: User authenticated, preparing connection...
   User ID: cmi45jvji0000vaxcmnirjdhq
   User Email: kim@example.com
   User Name: 김민준
🔌 Socket: Creating new socket instance
🚀 Socket: Initiating connection...
✅ Socket connected: abc123xyz
```

### ✅ 성공 시 서버 터미널

```
🔐 Socket auth attempt: userId=cmi45jvji0000vaxcmnirjdhq
🔍 User lookup: Found 김민준 (kim@example.com) - status: ACTIVE
✅ Socket authenticated: 김민준 (kim@example.com)
User connected: cmi45jvji0000vaxcmnirjdhq
```

---

## 🔧 수정된 코드

### 1. `src/lib/auth.js`
```javascript
async session({ session, token }) {
  if (token) {
    // 사용자가 DB에 존재하는지 확인
    const user = await prisma.user.findUnique({
      where: { id: token.id }
    })

    // 없거나 비활성이면 세션 무효화
    if (!user || user.status !== 'ACTIVE') {
      console.log(`⚠️ Session invalidated: User ${token.id}`)
      return null // ← 세션 무효화!
    }

    // 최신 정보로 업데이트
    session.user = { ...user }
  }
  return session
}
```

### 2. `src/lib/socket/server.js`
```javascript
// 더 명확한 에러 메시지
if (!user) {
  log.warn(`❌ User not found - ${userId}`)
  return next(new Error('User not found')) // 구체적!
}

if (user.status !== 'ACTIVE') {
  log.warn(`❌ User not active - ${user.status}`)
  return next(new Error(`User status is ${user.status}`)) // 상태까지!
}
```

### 3. `src/contexts/SocketContext.js`
```javascript
socketInstance.on('connect_error', (error) => {
  console.error('❌ Socket error:', error.message)
  
  // 에러 유형별 처리
  if (error.message.includes('User not found')) {
    console.error('🚫 User not found in database')
    socketInstance.disconnect()
  } else if (error.message.includes('User status is')) {
    console.error('🚫 User account is not active')
    socketInstance.disconnect()
  }
})
```

---

## 📊 진단 플로우

```
1. 페이지 로드
   ↓
2. NextAuth: 세션 확인
   ↓
3. auth.js session callback
   ↓
4a. User ID로 DB 조회
    ├─ 사용자 없음 → return null → 로그아웃 ✅
    ├─ status !== ACTIVE → return null → 로그아웃 ✅
    └─ 정상 → 세션 유지
   ↓
5. SocketContext: 세션 확인
   ↓
6a. status === 'unauthenticated' → 소켓 연결 안 함 ✅
6b. status === 'authenticated' → 소켓 연결 시도
   ↓
7. 서버: 사용자 인증
   ├─ User not found → 'User not found' 에러
   ├─ status !== ACTIVE → 'User status is X' 에러
   └─ 정상 → 연결 성공 ✅
```

---

## 🎯 핵심 개선 사항

### Before
```javascript
// 문제: 오래된 세션이 계속 유지됨
session callback: token만 확인, DB 조회 안 함
→ 사용자 삭제되어도 세션 유효
→ 소켓 연결 시도
→ 서버: "Invalid user" (모호한 에러)
```

### After
```javascript
// 해결: 매 요청마다 사용자 검증
session callback: DB에서 사용자 조회
→ 사용자 없으면 return null (세션 무효화)
→ 자동 로그아웃
→ 소켓 연결 시도 안 함
→ 에러 없음! ✅

// 만약 소켓 연결 시도하면:
서버: "User not found" (명확한 에러!)
```

---

## 🧪 테스트 체크리스트

- [ ] 브라우저 쿠키/스토리지 삭제
- [ ] 페이지 강력 새로고침 (`Ctrl + Shift + R`)
- [ ] 다시 로그인 (kim@example.com / password123)
- [ ] 브라우저 콘솔: "Socket connected" 확인
- [ ] 서버 터미널: "Socket authenticated" 확인
- [ ] 에러 메시지 없음 확인

---

## 💡 추가 팁

### 시크릿 모드로 테스트
```
1. Ctrl + Shift + N (시크릿 창)
2. http://localhost:3000
3. 로그인
4. 콘솔 확인
```

### 세션 정보 확인
```javascript
// 브라우저 콘솔에서
fetch('/api/auth/session')
  .then(r => r.json())
  .then(data => console.table(data.user))
```

### 모든 사용자 목록 확인
```bash
cd coup
node scripts/check-user-status.js
```

---

## 🚀 완료!

이제 다음이 보장됩니다:

✅ 오래된 세션 자동 무효화  
✅ 명확한 에러 메시지  
✅ 비활성 사용자 자동 차단  
✅ 온라인 상태 정상 동작  

---

**작성일**: 2025-01-18  
**해결 시간**: 30분  
**핵심**: 세션 검증 + 브라우저 쿠키 삭제

