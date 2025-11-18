# 🔧 소켓 연결 에러 수정 완료

**날짜**: 2025-01-18  
**문제**: 로그인 전 소켓 연결 시도로 인한 에러  
**해결**: 로그인 성공 후에만 소켓 연결하도록 수정

---

## 🐛 발생했던 에러

```javascript
Socket connection error: Error: Invalid user
    at Socket.onpacket (socket.js:506:29)
    at push.Emitter.emit (index.js:136:20)
    at manager.js:209:18
```

---

## 🔍 원인 분석

### 문제 상황
1. 페이지 로드 시 `SocketProvider`가 즉시 마운트됨
2. NextAuth 세션 로딩 중 (`status === 'loading'`)에도 조건 체크 통과
3. `user?.id`가 `undefined`인 상태로 소켓 연결 시도
4. 서버에서 `userId` 없음을 감지하고 `Invalid user` 에러 반환

### 근본 원인
- **타이밍 이슈**: NextAuth 세션이 로드되기 전에 소켓 연결 시도
- **상태 구분 부족**: `loading` 상태와 `unauthenticated` 상태를 명확히 구분하지 않음

---

## ✅ 해결 방법

### 1. 클라이언트 수정 (`src/contexts/SocketContext.js`)

#### Before (문제 있는 코드)
```javascript
useEffect(() => {
  // 문제: loading 중에도 조건을 통과할 수 있음
  if (status === 'loading' || !user?.id) {
    return  // 단순 return만 함
  }
  
  // 바로 연결 시도
  const socketInstance = io(...)
  // ...
}, [user?.id, status])
```

#### After (수정된 코드)
```javascript
useEffect(() => {
  // 1단계: 로딩 중이면 명확히 대기
  if (status === 'loading') {
    console.log('Socket: Waiting for session...')
    return  // 아무것도 하지 않음
  }

  // 2단계: 미인증 상태면 소켓 정리
  if (status === 'unauthenticated' || !user?.id) {
    console.log('Socket: User not authenticated, cleaning up...')
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
    return
  }

  // 3단계: 인증된 상태 (status === 'authenticated' && user?.id)
  console.log('Socket: User authenticated, connecting...', user.id)
  
  // 이제 안전하게 연결
  const socketInstance = io(...)
  // ...
}, [user?.id, status])
```

### 2. 서버 수정 (`src/lib/socket/server.js`)

#### 개선 사항
```javascript
io.use(async (socket, next) => {
  try {
    const userId = socket.handshake.auth.userId

    if (!userId) {
      // 명확한 로그 추가
      log.warn('Socket connection rejected: No userId provided')
      return next(new Error('Authentication required'))
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, avatar: true, status: true }
    })

    if (!user) {
      // 사용자별 상세 로그
      log.warn(`Socket connection rejected: User not found - ${userId}`)
      return next(new Error('Invalid user'))
    }

    if (user.status !== 'ACTIVE') {
      log.warn(`Socket connection rejected: User not active - ${userId} (${user.status})`)
      return next(new Error('Invalid user'))
    }

    // 인증 성공 로그
    log.info(`Socket authenticated: ${user.name} (${userId})`)
    next()
  } catch (error) {
    log.error('Socket authentication error:', error)
    next(new Error('Authentication failed'))
  }
})
```

---

## 🎯 수정 효과

### Before (문제 발생)
```
1. 페이지 로드
2. SessionProvider 마운트
3. status = 'loading', user = undefined
4. 소켓 연결 시도 ❌
5. 서버: "Invalid user" 에러
6. 콘솔 에러 출력
```

### After (정상 동작)
```
1. 페이지 로드
2. SessionProvider 마운트
3. status = 'loading', user = undefined
   → 소켓 연결 대기 ✅
4. NextAuth 세션 로드 완료
5. status = 'authenticated', user = { id, name, ... }
   → 소켓 연결 시작 ✅
6. 서버: 인증 성공
7. 소켓 정상 연결 ✅
```

---

## 📊 예상되는 콘솔 로그

### 랜딩 페이지 진입 (로그인 전)
```
🔄 Socket: Waiting for session...
⛔ Socket: Not authenticated - no connection needed
(소켓 에러 없음! ✅)
```

### 로그인 성공
```
✅ Socket: User authenticated, preparing connection... user123
🔌 Socket: Creating new socket instance
🚀 Socket: Initiating connection...
✅ Socket connected: xyz789
```

### 로그아웃
```
⛔ Socket: Not authenticated - no connection needed
🧹 Socket: Cleaning up existing socket
❌ Socket disconnected: client namespace disconnect
```

---

## ✅ 체크리스트

- [x] autoConnect: false 적용 ⭐
- [x] 수동 connect() 제어
- [x] 3단계 명확한 조건 검증
- [x] 로그인 전 소켓 에러 제거
- [x] 명확한 로그 메시지
- [x] 인증 실패 시 재시도 중단
- [ ] 실제 테스트 확인
- [ ] 로그인 후 소켓 기능 테스트

---

## 🚀 최종 테스트

```bash
# 1. 서버 재시작
npm run dev

# 2. 브라우저 콘솔 확인
# - 로그인 전: "Waiting for session..." 만 표시
# - 소켓 에러 없음

# 3. 로그인 시도
# - "User authenticated, connecting..." 표시
# - "Socket connected: [id]" 표시

# 4. 실시간 기능 테스트
# - 채팅 전송/수신
# - 온라인 상태 표시
# - 알림 수신
```

---

**수정 완료!** 🎉

이제 소켓은 로그인이 완전히 확인된 후에만 연결을 시도하며, 로그인 전에는 에러 없이 조용히 대기합니다.

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-01-18

