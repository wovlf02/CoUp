# 채팅 연결 예외 처리

**문서 ID**: CHAT-01  
**작성일**: 2025-11-29  
**카테고리**: 연결 관리  
**우선순위**: 🔥 높음

---

## 📋 목차

1. [Socket.IO 연결 실패](#1-socketio-연결-실패)
2. [재연결 실패](#2-재연결-실패)
3. [연결 타임아웃](#3-연결-타임아웃)
4. [인증 오류](#4-인증-오류)
5. [Transport 문제](#5-transport-문제)
6. [연결 상태 관리](#6-연결-상태-관리)

---

## 1. Socket.IO 연결 실패

### 1.1 서버 미실행

#### 증상
```
❌ Socket connection failed
❌ ERR_CONNECTION_REFUSED
❌ net::ERR_CONNECTION_TIMED_OUT
```

#### 원인
- Socket.IO 서버가 실행되지 않음
- 잘못된 서버 URL
- 방화벽/포트 차단

#### 해결 방법

**✅ 서버 실행 확인**:
```bash
# signaling-server 확인
cd signaling-server
npm run dev

# 헬스 체크
curl http://localhost:4000/health
```

**✅ 환경 변수 확인**:
```bash
# .env.local
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# 프로덕션
NEXT_PUBLIC_SOCKET_URL=https://socket.coup.com
```

**✅ useSocket Hook 수정**:
```javascript
// ❌ 나쁜 예: 하드코딩된 URL
const socket = io('http://localhost:4000', {...});

// ✅ 좋은 예: 환경 변수 사용
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
const socket = io(socketUrl, {
  auth: {
    userId: user.id
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// 연결 오류 처리
socket.on('connect_error', (error) => {
  console.error('[Socket] Connection error:', error.message);
  
  if (error.message === 'xhr poll error') {
    console.error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
  }
});
```

### 1.2 CORS 오류

#### 증상
```
❌ Access to XMLHttpRequest blocked by CORS policy
❌ No 'Access-Control-Allow-Origin' header
```

#### 원인
- 서버의 CORS 설정이 잘못됨
- 프론트엔드 도메인이 허용 목록에 없음

#### 해결 방법

**✅ Socket.IO 서버 CORS 설정**:
```javascript
// signaling-server/server.js
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://coup.com',
      'https://www.coup.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// 동적 origin 검증
io.engine.on('connection_error', (err) => {
  console.error('Connection error:', err);
  console.error('Origin:', err.req.headers.origin);
});
```

**✅ 개발 환경에서 모든 origin 허용 (주의)**:
```javascript
// 개발 환경에서만!
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://coup.com']
      : '*',
    credentials: true
  }
});
```

### 1.3 포트 충돌

#### 증상
```
❌ Error: listen EADDRINUSE: address already in use :::4000
```

#### 원인
- 다른 프로세스가 동일한 포트 사용

#### 해결 방법

**✅ 포트 사용 중인 프로세스 찾기**:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :4000
kill -9 <PID>
```

**✅ 다른 포트 사용**:
```bash
# signaling-server/.env
PORT=4001

# 클라이언트 환경 변수도 변경
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001
```

---

## 2. 재연결 실패

### 2.1 무한 재연결 시도

#### 증상
```
⚠️ Reconnection attempt 1/5
⚠️ Reconnection attempt 2/5
⚠️ Reconnection attempt 3/5
...
❌ Max reconnection attempts reached
```

#### 원인
- 서버가 오랫동안 다운됨
- 재연결 설정이 적절하지 않음

#### 해결 방법

**✅ 재연결 설정 최적화**:
```javascript
// src/lib/hooks/useSocket.js
const socket = io(socketUrl, {
  auth: { userId: user.id },
  
  // 재연결 설정
  reconnection: true,
  reconnectionDelay: 1000,      // 1초 후 재연결
  reconnectionDelayMax: 5000,   // 최대 5초
  reconnectionAttempts: 5,      // 최대 5번 시도
  
  // 타임아웃
  timeout: 20000,               // 20초
  
  // Transport
  transports: ['websocket', 'polling']
});

// 재연결 이벤트 처리
socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`[Socket] Reconnection attempt ${attemptNumber}/5`);
});

socket.on('reconnect_failed', () => {
  console.error('[Socket] All reconnection attempts failed');
  
  // 사용자에게 알림
  toast.error('서버에 연결할 수 없습니다. 페이지를 새로고침해주세요.');
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`[Socket] Reconnected after ${attemptNumber} attempts`);
  
  // 사용자에게 알림
  toast.success('서버에 다시 연결되었습니다');
  
  // 스터디 룸 재입장
  if (currentStudyId) {
    socket.emit('study:join', { studyId: currentStudyId });
  }
});
```

### 2.2 재연결 후 이벤트 리스너 누락

#### 증상
- 재연결 후 메시지가 수신되지 않음
- 타이핑 인디케이터가 작동하지 않음

#### 원인
- 재연결 후 이벤트 리스너가 재등록되지 않음

#### 해결 방법

**✅ 재연결 시 이벤트 리스너 재등록**:
```javascript
// src/app/my-studies/[studyId]/chat/page.jsx
useEffect(() => {
  if (!socket || !currentUser) return;

  const setupListeners = () => {
    // 메시지 수신
    socket.on('study:message', handleNewMessage);
    
    // 타이핑 인디케이터
    socket.on('study:typing', handleTyping);
    
    // 읽음 표시 업데이트
    socket.on('study:message-read', handleMessageRead);
  };

  // 초기 설정
  setupListeners();

  // 재연결 시 리스너 재등록
  socket.on('reconnect', () => {
    console.log('[Chat] Reconnected, re-setting up listeners');
    
    // 스터디 룸 재입장
    socket.emit('study:join', { studyId });
    
    // 메시지 다시 불러오기
    refetchMessages();
  });

  return () => {
    socket.off('study:message', handleNewMessage);
    socket.off('study:typing', handleTyping);
    socket.off('study:message-read', handleMessageRead);
    socket.off('reconnect');
  };
}, [socket, currentUser, studyId]);
```

### 2.3 연결 상태 UI 업데이트

#### 증상
- 연결 상태가 UI에 반영되지 않음
- 사용자가 연결 문제를 인지하지 못함

#### 해결 방법

**✅ 연결 상태 표시 컴포넌트**:
```javascript
// src/components/chat/ConnectionStatus.jsx
export default function ConnectionStatus({ isConnected, transport }) {
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // 연결 끊김 시에만 표시
    if (!isConnected) {
      setShowStatus(true);
    } else {
      // 연결 복구 시 2초 후 숨김
      const timer = setTimeout(() => setShowStatus(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  if (!showStatus) return null;

  return (
    <div className={`status-banner ${isConnected ? 'connected' : 'disconnected'}`}>
      {isConnected ? (
        <>
          <span className="status-icon">✅</span>
          <span>서버에 연결되었습니다</span>
          <span className="transport">({transport})</span>
        </>
      ) : (
        <>
          <span className="status-icon">⚠️</span>
          <span>서버 연결이 끊겼습니다. 재연결 중...</span>
          <button onClick={() => window.location.reload()}>
            새로고침
          </button>
        </>
      )}
    </div>
  );
}

// 사용
const { socket, isConnected, transport } = useSocket();

return (
  <div className="chat-container">
    <ConnectionStatus isConnected={isConnected} transport={transport} />
    {/* 채팅 UI */}
  </div>
);
```

---

## 3. 연결 타임아웃

### 3.1 서버 응답 지연

#### 증상
```
❌ Connection timeout after 20000ms
```

#### 원인
- 서버 부하
- 네트워크 지연
- 타임아웃 설정이 너무 짧음

#### 해결 방법

**✅ 타임아웃 설정 조정**:
```javascript
const socket = io(socketUrl, {
  auth: { userId: user.id },
  
  // 타임아웃 설정
  timeout: 30000,  // 30초로 증가
  
  // Ping 설정 (연결 유지)
  pingInterval: 10000,  // 10초마다 ping
  pingTimeout: 5000,    // 5초 응답 대기
});

// 타임아웃 이벤트 처리
socket.on('connect_timeout', () => {
  console.error('[Socket] Connection timeout');
  toast.error('서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.');
});
```

### 3.2 네트워크 품질 체크

#### 해결 방법

**✅ 네트워크 품질 모니터링**:
```javascript
// src/lib/hooks/useNetworkQuality.js
export function useNetworkQuality() {
  const [quality, setQuality] = useState('good'); // good, fair, poor

  useEffect(() => {
    if (!navigator.connection) return;

    const connection = navigator.connection;

    const updateQuality = () => {
      const downlink = connection.downlink; // Mbps
      const effectiveType = connection.effectiveType;

      if (effectiveType === '4g' && downlink > 5) {
        setQuality('good');
      } else if (effectiveType === '3g' || (effectiveType === '4g' && downlink < 5)) {
        setQuality('fair');
      } else {
        setQuality('poor');
      }
    };

    updateQuality();
    connection.addEventListener('change', updateQuality);

    return () => {
      connection.removeEventListener('change', updateQuality);
    };
  }, []);

  return quality;
}

// 사용
const networkQuality = useNetworkQuality();

{networkQuality === 'poor' && (
  <div className="network-warning">
    ⚠️ 네트워크 연결이 불안정합니다. 메시지 전송이 지연될 수 있습니다.
  </div>
)}
```

---

## 4. 인증 오류

### 4.1 토큰 만료

#### 증상
```
❌ Authentication error: Token expired
❌ Unauthorized
```

#### 원인
- JWT 토큰 만료
- 세션 만료
- userId가 전달되지 않음

#### 해결 방법

**✅ 인증 토큰 자동 갱신**:
```javascript
// src/lib/hooks/useSocket.js
export function useSocket() {
  const [user, setUser] = useState(null);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          if (response.status === 401) {
            console.log('[Socket] User not authenticated');
            // 로그인 페이지로 리다이렉트
            router.push('/login');
          }
          setUser(null);
        }
      } catch (error) {
        console.error('[Socket] Error fetching user:', error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!user?.id) {
      console.log('[Socket] No user ID, skipping socket initialization');
      return;
    }

    // Socket 초기화
    const socket = io(socketUrl, {
      auth: {
        userId: user.id
        // 필요시 JWT 토큰 추가
        // token: user.token
      }
    });

    // 인증 에러 처리
    socket.on('connect_error', (error) => {
      if (error.message === 'Authentication error') {
        console.error('[Socket] Authentication failed');
        
        // 토큰 갱신 시도
        fetchUser();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  return { socket, isConnected, user };
}
```

**✅ 서버 측 인증 검증**:
```javascript
// signaling-server/middleware/auth.js
export function authenticateSocket(socket, next) {
  const userId = socket.handshake.auth.userId;

  if (!userId) {
    return next(new Error('Authentication error: userId required'));
  }

  // 추가 검증 (선택사항)
  // const token = socket.handshake.auth.token;
  // if (!verifyToken(token)) {
  //   return next(new Error('Authentication error: Invalid token'));
  // }

  socket.userId = userId;
  next();
}

// 사용
io.use(authenticateSocket);
```

---

## 5. Transport 문제

### 5.1 WebSocket 지원 안 됨

#### 증상
```
⚠️ Falling back to polling
⚠️ WebSocket connection failed, using long polling
```

#### 원인
- 프록시/방화벽이 WebSocket 차단
- 브라우저가 WebSocket 미지원 (매우 드물음)

#### 해결 방법

**✅ Transport 폴백 설정**:
```javascript
const socket = io(socketUrl, {
  auth: { userId: user.id },
  
  // Transport 우선순위
  transports: ['websocket', 'polling'],
  
  // WebSocket 전용 (선택사항, 권장하지 않음)
  // transports: ['websocket'],
  
  // Upgrade 허용
  upgrade: true,
  rememberUpgrade: true
});

// Transport 변경 감지
socket.io.engine.on('upgrade', (transport) => {
  console.log('[Socket] Transport upgraded to:', transport.name);
});

// Transport 타입 표시
const [transport, setTransport] = useState('N/A');

useEffect(() => {
  if (!socket) return;

  const updateTransport = () => {
    setTransport(socket.io.engine.transport.name);
  };

  socket.on('connect', updateTransport);
  socket.io.engine.on('upgrade', updateTransport);

  return () => {
    socket.off('connect', updateTransport);
  };
}, [socket]);
```

### 5.2 Nginx WebSocket 프록시 설정

#### 해결 방법

**✅ Nginx 설정**:
```nginx
# nginx.conf
upstream socket_server {
    server localhost:4000;
}

server {
    listen 80;
    server_name socket.coup.com;

    location / {
        proxy_pass http://socket_server;
        proxy_http_version 1.1;
        
        # WebSocket 지원
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 헤더 전달
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 타임아웃 설정
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

---

## 6. 연결 상태 관리

### 6.1 여러 컴포넌트에서 Socket 공유

#### 문제
- 각 컴포넌트마다 Socket을 생성하면 여러 연결이 생김
- 메모리 누수 및 성능 저하

#### 해결 방법

**✅ 싱글톤 패턴으로 Socket 공유**:
```javascript
// src/lib/hooks/useSocket.js
let socket = null; // 전역 싱글톤

export function useSocket() {
  const [isConnected, setIsConnected] = useState(() => {
    return socket ? socket.connected : false;
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 사용자 정보 가져오기
    const fetchUser = async () => {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    // Socket이 없으면 생성
    if (!socket) {
      console.log('[Socket] Creating new socket connection');
      socket = io(socketUrl, {
        auth: { userId: user.id },
        transports: ['websocket', 'polling'],
        reconnection: true
      });

      socket.on('connect', () => {
        console.log('[Socket] Connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('[Socket] Disconnected');
        setIsConnected(false);
      });
    } else {
      // Socket이 이미 있으면 상태만 동기화
      console.log('[Socket] Reusing existing socket');
      setIsConnected(socket.connected);
      
      if (!socket.connected) {
        socket.connect();
      }
    }

    // 컴포넌트 언마운트 시 disconnect하지 않음 (재사용)
    return () => {
      // cleanup
    };
  }, [user?.id]);

  return {
    socket,
    isConnected
  };
}
```

### 6.2 페이지 이동 시 연결 유지

#### 문제
- 페이지 이동 시 Socket이 끊어짐
- 다시 연결하는 데 시간이 걸림

#### 해결 방법

**✅ Context로 Socket 공유**:
```javascript
// src/contexts/SocketContext.js
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(null);

  // 사용자 정보 가져오기
  useEffect(() => {
    async function fetchUser() {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    }
    fetchUser();
  }, []);

  // Socket 초기화 (한 번만)
  useEffect(() => {
    if (!user?.id || socket) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    const newSocket = io(socketUrl, {
      auth: { userId: user.id },
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    // 앱 전체에서 Socket 유지
    return () => {
      // 컴포넌트 언마운트 시에도 유지
    };
  }, [user?.id, socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}
```

**✅ Layout에 Provider 추가**:
```javascript
// src/app/layout.js
import { SocketProvider } from '@/contexts/SocketContext';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <SessionProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## 🔍 디버깅 가이드

### 연결 문제 진단

```javascript
// 1. Socket 상태 확인
console.log('Socket exists:', !!socket);
console.log('Socket connected:', socket?.connected);
console.log('Socket ID:', socket?.id);

// 2. Transport 확인
console.log('Transport:', socket?.io.engine.transport.name);

// 3. 서버 URL 확인
console.log('Socket URL:', process.env.NEXT_PUBLIC_SOCKET_URL);

// 4. 사용자 인증 확인
console.log('User ID:', user?.id);

// 5. 이벤트 리스너 확인
console.log('Message listeners:', socket?.listeners('study:message').length);
```

### 로그 수집

```javascript
// src/lib/hooks/useSocket.js
const ENABLE_DEBUG = process.env.NODE_ENV === 'development';

function log(...args) {
  if (ENABLE_DEBUG) {
    console.log('[Socket]', ...args);
  }
}

// 사용
log('Connecting to:', socketUrl);
log('User ID:', user.id);
log('Connected:', socket.connected);
```

---

## 📚 관련 문서

- [메시지 예외 처리](./02-message-exceptions.md)
- [실시간 동기화 예외](./03-realtime-sync-exceptions.md)
- [모범 사례](./99-best-practices.md)

---

**마지막 업데이트**: 2025-11-29  
**다음 리뷰 예정일**: 2025-12-06

