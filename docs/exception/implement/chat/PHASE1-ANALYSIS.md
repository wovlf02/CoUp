# Chat 영역 예외 처리 구현 - Phase 1: 분석 및 계획

**작성일**: 2025-12-01  
**작업 시간**: 8시간 (예상)  
**난이도**: ⭐⭐⭐⭐⭐ (매우 높음)

---

## 📋 목차

1. [작업 개요](#1-작업-개요)
2. [폴더 구조 분석](#2-폴더-구조-분석)
3. [파일 분석 결과](#3-파일-분석-결과)
4. [예외 처리 요구사항](#4-예외-처리-요구사항)
5. [에러 코드 설계](#5-에러-코드-설계)
6. [구현 계획](#6-구현-계획)
7. [작업 우선순위](#7-작업-우선순위)

---

## 1. 작업 개요

### 1.1 현재 상황

**✅ 이전 완료 작업**:
- study 영역: 126개 예외 처리
- dashboard 영역: 30개 파일, 4,736줄
- my-studies 영역: 62개 에러 코드, 6개 파일

**🎯 현재 목표**: chat 영역 완전한 예외 처리 시스템 구축

### 1.2 Chat 영역 특징

**🔥 고난이도 요소**:
1. **실시간 통신**: WebSocket/Socket.IO 기반
2. **연결 관리**: 재연결, 타임아웃, 오류 복구
3. **메시지 동기화**: 낙관적 업데이트, 순서 보장
4. **파일 전송**: 업로드, 다운로드, 미리보기
5. **상태 관리**: 읽음/안읽음, 타이핑 인디케이터
6. **네트워크 복원력**: 오프라인 처리, 재시도 로직

### 1.3 기술 스택

- **프레임워크**: Next.js 16 App Router
- **언어**: JavaScript (ES6+)
- **실시간 통신**: Socket.IO
- **상태 관리**: React Hooks
- **API**: REST + WebSocket 하이브리드

---

## 2. 폴더 구조 분석

### 2.1 현재 폴더 구조

```
coup/src/
├── app/
│   └── api/
│       └── studies/
│           └── [id]/
│               └── chat/
│                   ├── route.js                          # GET (메시지 목록), POST (메시지 전송)
│                   ├── search/
│                   │   └── route.js                      # GET (메시지 검색)
│                   └── [messageId]/
│                       ├── route.js                      # PATCH (수정), DELETE (삭제)
│                       └── read/
│                           └── route.js                  # POST (읽음 처리)
│
├── components/
│   └── study/
│       └── RealtimeChat.js                               # 실시간 채팅 컴포넌트
│
├── contexts/
│   └── SocketContext.js                                  # Socket.IO 연결 관리
│
└── lib/
    └── hooks/
        └── useStudySocket.js                             # 스터디 소켓 훅 (채팅 포함)
```

### 2.2 파일 수 및 코드 라인 분석

| 카테고리 | 파일 수 | 예상 라인 수 | 설명 |
|---------|--------|-------------|------|
| **API Routes** | 4 | ~800 | 메시지 CRUD, 검색, 읽음 처리 |
| **Components** | 1 | ~200 | 실시간 채팅 UI |
| **Contexts** | 1 | ~200 | Socket 연결 관리 |
| **Hooks** | 1 | ~150 | 채팅 소켓 훅 |
| **합계** | **7** | **~1,350** | - |

**추가 생성 예정**:
- `lib/exceptions/chat/` - 예외 클래스 (6개 파일)
- `lib/utils/chat/` - 유틸리티 함수 (3개 파일)

---

## 3. 파일 분석 결과

### 3.1 API Routes

#### 📄 `api/studies/[id]/chat/route.js`

**현재 구현**:
- ✅ GET: 메시지 목록 조회 (cursor 기반 페이지네이션)
- ✅ POST: 메시지 전송 (XSS 방지, 스팸 감지)

**발견된 문제점**:
```javascript
// ❌ 문제 1: 일반적인 에러 메시지
catch (error) {
  console.error('Get messages error:', error)
  return NextResponse.json(
    { error: "메시지를 가져오는 중 오류가 발생했습니다" },
    { status: 500 }
  )
}

// ❌ 문제 2: 에러 코드 없음
return NextResponse.json(
  { error: "메시지 내용 또는 파일을 입력해주세요" },
  { status: 400 }
)

// ❌ 문제 3: 재시도 가능 여부 불명확
return NextResponse.json(
  { error: "메시지를 너무 빠르게 전송하고 있습니다. 잠시 후 다시 시도해주세요." },
  { status: 429 }
)
```

**필요한 개선사항**:
1. ✅ 에러 코드 체계 도입 (CHAT-GET-001, CHAT-POST-001 등)
2. ✅ 구체적인 에러 메시지 (네트워크, DB, 권한 등 구분)
3. ✅ 재시도 가능 여부 명시 (retryable: true/false)
4. ✅ 에러 로깅 강화 (사용자 ID, 스터디 ID 등)

#### 📄 `api/studies/[id]/chat/[messageId]/route.js`

**현재 구현**:
- ✅ PATCH: 메시지 수정
- ✅ DELETE: 메시지 삭제

**발견된 문제점**:
```javascript
// ❌ 문제 1: 권한 검증 불완전
if (message.userId !== session.user.id) {
  return NextResponse.json(
    { error: "메시지를 수정할 권한이 없습니다" },
    { status: 403 }
  )
}
// 💡 관리자도 삭제 가능해야 함

// ❌ 문제 2: 삭제 시 연관 데이터 처리 미흡
// - 파일 첨부가 있는 경우 파일도 삭제해야 함
// - 읽음 표시 데이터는 어떻게 할 것인가?
```

**필요한 개선사항**:
1. ✅ 권한 검증 강화 (작성자 + 관리자)
2. ✅ 연관 데이터 처리 (파일, 읽음 표시)
3. ✅ Soft delete vs Hard delete 결정
4. ✅ WebSocket으로 실시간 알림 (메시지 수정/삭제)

#### 📄 `api/studies/[id]/chat/[messageId]/read/route.js`

**현재 구현**:
- ✅ POST: 메시지 읽음 처리

**발견된 문제점**:
```javascript
// ❌ 문제 1: 동시성 문제 가능
// 여러 사용자가 동시에 읽음 처리할 때 readers 배열 충돌 가능

// ❌ 문제 2: WebSocket 실시간 알림 없음
// 메시지 작성자에게 읽음 알림이 실시간으로 전달되지 않음
```

**필요한 개선사항**:
1. ✅ 동시성 안전한 읽음 처리
2. ✅ WebSocket 실시간 읽음 알림
3. ✅ 읽음 취소 기능 (선택적)

#### 📄 `api/studies/[id]/chat/search/route.js`

**현재 구현**:
- ✅ GET: 메시지 검색 (키워드, 날짜, 사용자)

**발견된 문제점**:
```javascript
// ❌ 문제 1: SQL Injection 방지 부족
whereClause.content = {
  contains: query,
  mode: 'insensitive'
}
// Prisma는 기본적으로 안전하지만, 추가 검증 필요

// ❌ 문제 2: 성능 최적화 부족
// - 인덱스 사용 여부 확인 필요
// - 페이지네이션 최적화 (cursor 기반으로 변경?)

// ❌ 문제 3: 검색 결과 하이라이팅 없음
// - 검색어를 결과에서 강조 표시하는 기능 추가
```

**필요한 개선사항**:
1. ✅ 검색어 입력 검증 강화
2. ✅ 성능 최적화 (인덱스, 쿼리 최적화)
3. ✅ 검색 결과 메타데이터 (하이라이팅 정보)

---

### 3.2 Components

#### 📄 `components/study/RealtimeChat.js`

**현재 구현**:
- ✅ 실시간 메시지 수신/전송
- ✅ 타이핑 인디케이터
- ✅ 자동 스크롤
- ✅ 읽음 처리

**발견된 문제점**:
```javascript
// ❌ 문제 1: 에러 처리 없음
const handleSendMessage = (e) => {
  e.preventDefault()
  if (!inputValue.trim() || !isConnected) return
  
  sendMessage(inputValue.trim()) // ❌ 에러 처리 없음
  setInputValue('')
}

// ❌ 문제 2: 낙관적 업데이트 미구현
// - 메시지를 즉시 화면에 표시하지 않음
// - 전송 실패 시 UI 피드백 없음

// ❌ 문제 3: 재연결 시 메시지 복구 없음
useEffect(() => {
  if (newMessage) {
    setMessages(prev => [...prev, newMessage])
  }
}, [newMessage])
// 💡 연결이 끊겼다가 다시 연결되면 누락된 메시지를 가져와야 함

// ❌ 문제 4: 메시지 중복 방지 없음
// - 같은 메시지가 여러 번 추가될 수 있음

// ❌ 문제 5: 오프라인 상태 처리 미흡
<span className="text-sm text-gray-600">
  {isConnected ? '실시간 연결됨' : '연결 중...'}
</span>
// 💡 "연결 중" vs "오프라인" vs "재연결 시도 중" 구분 필요
```

**필요한 개선사항**:
1. ✅ 에러 바운더리 추가
2. ✅ 낙관적 업데이트 구현
3. ✅ 재연결 시 메시지 동기화
4. ✅ 메시지 중복 방지 (ID 기반)
5. ✅ 오프라인 상태 상세 표시
6. ✅ 로딩/에러 상태 UI
7. ✅ 재시도 버튼 (전송 실패 시)

---

### 3.3 Contexts

#### 📄 `contexts/SocketContext.js`

**현재 구현**:
- ✅ Socket.IO 연결 관리
- ✅ 세션 검증
- ✅ 자동 재연결

**발견된 문제점**:
```javascript
// ❌ 문제 1: 재연결 제한
reconnectionAttempts: 5,
// 💡 5번 실패 후에는 어떻게 할 것인가?

// ❌ 문제 2: 연결 상태 불충분
const [isConnected, setIsConnected] = useState(false)
// 💡 연결 중, 재연결 중, 오프라인 등 상세 상태 필요

// ❌ 문제 3: 에러 핸들링 불완전
socketInstance.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error.message)
  setIsConnected(false)
  
  // 에러에 따라 다른 처리가 필요하지만 사용자에게 전달되지 않음
})

// ❌ 문제 4: 타임아웃 처리 없음
// - 연결 시도가 너무 오래 걸리면?
// - 서버 응답이 없으면?
```

**필요한 개선사항**:
1. ✅ 연결 상태 상세화 (connecting, connected, reconnecting, offline)
2. ✅ 재연결 제한 후 수동 재연결 UI
3. ✅ 에러 상태를 React state로 관리
4. ✅ 타임아웃 처리 (30초)
5. ✅ 네트워크 상태 감지 (navigator.onLine)

---

### 3.4 Hooks

#### 📄 `lib/hooks/useStudySocket.js`

**현재 구현**:
- ✅ `useStudySocket`: 온라인 사용자 관리
- ✅ `useChatSocket`: 메시지 송수신, 타이핑 상태

**발견된 문제점**:
```javascript
// ❌ 문제 1: sendMessage 에러 처리 없음
const sendMessage = useCallback((content, fileId = null) => {
  if (!socket || !isConnected) return
  
  socket.emit('chat:message', { // ❌ 실패 시 어떻게?
    studyId,
    content,
    fileId
  })
}, [socket, isConnected, studyId])

// ❌ 문제 2: 메시지 중복 방지 없음
socket.on('chat:new-message', (message) => {
  setNewMessage(message) // ❌ 같은 메시지가 여러 번 올 수 있음
})

// ❌ 문제 3: 메모리 누수 가능성
const [typingUsers, setTypingUsers] = useState([])
// 타이핑 타이머가 제대로 정리되지 않으면 계속 쌓일 수 있음
```

**필요한 개선사항**:
1. ✅ sendMessage에 Promise 기반 에러 처리
2. ✅ 메시지 중복 방지 (Set 또는 ID 체크)
3. ✅ 타이핑 타이머 자동 정리
4. ✅ 이벤트 리스너 정리 보장

---

## 4. 예외 처리 요구사항

### 4.1 연결 예외 (Connection Exceptions)

**에러 코드 접두사**: `CHAT-CONN-`

| 에러 코드 | 상황 | 사용자 메시지 | 개발자 메시지 |
|----------|------|--------------|--------------|
| `CHAT-CONN-001` | Socket 서버 미실행 | "채팅 서버에 연결할 수 없습니다" | Connection refused to socket server |
| `CHAT-CONN-002` | 연결 타임아웃 | "서버 응답이 없습니다. 잠시 후 다시 시도해주세요" | Socket connection timeout |
| `CHAT-CONN-003` | 인증 실패 | "인증에 실패했습니다. 다시 로그인해주세요" | Socket authentication failed |
| `CHAT-CONN-004` | 재연결 실패 | "연결이 끊어졌습니다. 다시 연결 중입니다" | Reconnection failed after N attempts |
| `CHAT-CONN-005` | Transport 업그레이드 실패 | "실시간 채팅을 사용할 수 없습니다" | WebSocket upgrade failed |
| `CHAT-CONN-006` | 네트워크 오프라인 | "인터넷 연결을 확인해주세요" | Network offline detected |

### 4.2 메시지 예외 (Message Exceptions)

**에러 코드 접두사**: `CHAT-MSG-`

| 에러 코드 | 상황 | 사용자 메시지 | 개발자 메시지 |
|----------|------|--------------|--------------|
| `CHAT-MSG-001` | 메시지 전송 실패 (네트워크) | "메시지 전송에 실패했습니다. 다시 시도해주세요" | Message send failed: network error |
| `CHAT-MSG-002` | 메시지 전송 실패 (서버) | "메시지를 전송할 수 없습니다. 잠시 후 다시 시도해주세요" | Message send failed: server error |
| `CHAT-MSG-003` | 빈 메시지 | "메시지 내용을 입력해주세요" | Empty message content |
| `CHAT-MSG-004` | 메시지 길이 초과 | "메시지는 2000자 이하여야 합니다" | Message too long (>2000 chars) |
| `CHAT-MSG-005` | 스팸 감지 | "메시지를 너무 빠르게 전송하고 있습니다" | Spam detected: 5+ messages in 10s |
| `CHAT-MSG-006` | XSS 감지 | "메시지에 허용되지 않는 내용이 포함되어 있습니다" | XSS attempt detected |
| `CHAT-MSG-007` | 메시지 조회 실패 | "메시지를 불러올 수 없습니다" | Failed to fetch messages |
| `CHAT-MSG-008` | 메시지 수정 실패 (권한) | "메시지를 수정할 권한이 없습니다" | Unauthorized message edit |
| `CHAT-MSG-009` | 메시지 삭제 실패 (권한) | "메시지를 삭제할 권한이 없습니다" | Unauthorized message delete |
| `CHAT-MSG-010` | 메시지 없음 | "메시지를 찾을 수 없습니다" | Message not found |
| `CHAT-MSG-011` | 중복 메시지 | - | Duplicate message ignored |
| `CHAT-MSG-012` | 순서 오류 | - | Message order inconsistency |

### 4.3 동기화 예외 (Sync Exceptions)

**에러 코드 접두사**: `CHAT-SYNC-`

| 에러 코드 | 상황 | 사용자 메시지 | 개발자 메시지 |
|----------|------|--------------|--------------|
| `CHAT-SYNC-001` | 낙관적 업데이트 실패 | "메시지 전송에 실패했습니다" | Optimistic update rollback |
| `CHAT-SYNC-002` | 메시지 순서 불일치 | - | Message order mismatch detected |
| `CHAT-SYNC-003` | 읽음 처리 실패 | "읽음 처리에 실패했습니다" | Mark as read failed |
| `CHAT-SYNC-004` | 타이핑 상태 동기화 실패 | - | Typing state sync failed |
| `CHAT-SYNC-005` | 재연결 후 동기화 실패 | "메시지를 동기화하는 중 오류가 발생했습니다" | Reconnect sync failed |
| `CHAT-SYNC-006` | 이벤트 손실 | - | Socket event lost |

### 4.4 파일 예외 (File Exceptions)

**에러 코드 접두사**: `CHAT-FILE-`

| 에러 코드 | 상황 | 사용자 메시지 | 개발자 메시지 |
|----------|------|--------------|--------------|
| `CHAT-FILE-001` | 파일 업로드 실패 | "파일 업로드에 실패했습니다" | File upload failed |
| `CHAT-FILE-002` | 파일 크기 초과 | "파일 크기는 10MB 이하여야 합니다" | File size exceeds limit |
| `CHAT-FILE-003` | 파일 형식 불가 | "지원하지 않는 파일 형식입니다" | Unsupported file type |
| `CHAT-FILE-004` | 파일 다운로드 실패 | "파일을 다운로드할 수 없습니다" | File download failed |
| `CHAT-FILE-005` | 파일 미리보기 실패 | "파일 미리보기를 불러올 수 없습니다" | File preview failed |
| `CHAT-FILE-006` | 파일 없음 | "파일을 찾을 수 없습니다" | File not found |

### 4.5 UI 예외 (UI Exceptions)

**에러 코드 접두사**: `CHAT-UI-`

| 에러 코드 | 상황 | 사용자 메시지 | 개발자 메시지 |
|----------|------|--------------|--------------|
| `CHAT-UI-001` | 자동 스크롤 실패 | - | Auto-scroll failed |
| `CHAT-UI-002` | 무한 스크롤 실패 | "메시지를 더 불러올 수 없습니다" | Infinite scroll failed |
| `CHAT-UI-003` | 타이핑 인디케이터 오류 | - | Typing indicator error |
| `CHAT-UI-004` | 입력 상태 오류 | - | Input state error |
| `CHAT-UI-005` | 읽음 표시 오류 | - | Read receipt error |

---

## 5. 에러 코드 설계

### 5.1 에러 코드 네이밍 규칙

```
CHAT-{CATEGORY}-{NUMBER}

CATEGORY:
- CONN  : Connection (연결)
- MSG   : Message (메시지)
- SYNC  : Synchronization (동기화)
- FILE  : File (파일)
- UI    : User Interface (UI)

NUMBER: 001-999 (3자리)
```

### 5.2 에러 클래스 구조

```javascript
// lib/exceptions/chat/ChatException.js
export class ChatException extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ChatException';
    this.code = code;
    this.userMessage = details.userMessage || message;
    this.devMessage = details.devMessage || message;
    this.retryable = details.retryable ?? false;
    this.timestamp = new Date().toISOString();
    this.context = details.context || {};
  }
}

// 연결 예외
export class ChatConnectionException extends ChatException {
  constructor(code, message, details = {}) {
    super(code, message, { ...details, category: 'connection' });
    this.name = 'ChatConnectionException';
  }
}

// 메시지 예외
export class ChatMessageException extends ChatException {
  constructor(code, message, details = {}) {
    super(code, message, { ...details, category: 'message' });
    this.name = 'ChatMessageException';
  }
}

// 동기화 예외
export class ChatSyncException extends ChatException {
  constructor(code, message, details = {}) {
    super(code, message, { ...details, category: 'sync' });
    this.name = 'ChatSyncException';
  }
}

// 파일 예외
export class ChatFileException extends ChatException {
  constructor(code, message, details = {}) {
    super(code, message, { ...details, category: 'file' });
    this.name = 'ChatFileException';
  }
}

// UI 예외
export class ChatUIException extends ChatException {
  constructor(code, message, details = {}) {
    super(code, message, { ...details, category: 'ui' });
    this.name = 'ChatUIException';
  }
}
```

### 5.3 에러 핸들러 구조

```javascript
// lib/utils/chat/errorHandler.js
export function handleChatError(error, context = {}) {
  // 1. 에러 분류
  const errorInfo = classifyChatError(error);
  
  // 2. 로깅
  logChatError(errorInfo, context);
  
  // 3. 사용자에게 표시할 메시지 생성
  const userMessage = getUserMessage(errorInfo);
  
  // 4. 재시도 가능 여부 판단
  const retryable = isRetryable(errorInfo);
  
  return {
    code: errorInfo.code,
    message: userMessage,
    retryable,
    timestamp: new Date().toISOString(),
  };
}

function classifyChatError(error) {
  // ChatException인 경우
  if (error instanceof ChatException) {
    return {
      code: error.code,
      category: error.category,
      userMessage: error.userMessage,
      devMessage: error.devMessage,
      retryable: error.retryable,
    };
  }
  
  // Socket.IO 에러
  if (error.message?.includes('socket')) {
    return {
      code: 'CHAT-CONN-001',
      category: 'connection',
      userMessage: '채팅 서버에 연결할 수 없습니다',
      devMessage: error.message,
      retryable: true,
    };
  }
  
  // 네트워크 에러
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return {
      code: 'CHAT-MSG-001',
      category: 'message',
      userMessage: '메시지 전송에 실패했습니다. 다시 시도해주세요',
      devMessage: error.message,
      retryable: true,
    };
  }
  
  // 기본 에러
  return {
    code: 'CHAT-UNKNOWN-001',
    category: 'unknown',
    userMessage: '알 수 없는 오류가 발생했습니다',
    devMessage: error.message,
    retryable: false,
  };
}
```

---

## 6. 구현 계획

### 6.1 Phase 2: 예외 클래스 및 유틸리티 (4시간)

**생성할 파일**:
1. `lib/exceptions/chat/ChatException.js` - 기본 예외 클래스
2. `lib/exceptions/chat/ConnectionException.js` - 연결 예외
3. `lib/exceptions/chat/MessageException.js` - 메시지 예외
4. `lib/exceptions/chat/SyncException.js` - 동기화 예외
5. `lib/exceptions/chat/FileException.js` - 파일 예외
6. `lib/exceptions/chat/UIException.js` - UI 예외
7. `lib/exceptions/chat/index.js` - Export 통합

**유틸리티 파일**:
1. `lib/utils/chat/errorHandler.js` - 에러 핸들러
2. `lib/utils/chat/errorLogger.js` - 에러 로거
3. `lib/utils/chat/errorMessages.js` - 에러 메시지 정의
4. `lib/utils/chat/index.js` - Export 통합

### 6.2 Phase 3: Socket 연결 예외 처리 (6시간)

**수정할 파일**:
1. `contexts/SocketContext.js`
   - 연결 상태 상세화 (connecting, connected, reconnecting, offline)
   - 에러 상태 관리
   - 타임아웃 처리
   - 네트워크 상태 감지
   - 수동 재연결 기능

2. `lib/hooks/useStudySocket.js`
   - 에러 처리 강화
   - 메시지 중복 방지
   - 타이핑 타이머 자동 정리

### 6.3 Phase 4: API Routes 예외 처리 (8시간)

**수정할 파일**:
1. `api/studies/[id]/chat/route.js` (GET, POST)
   - 에러 코드 추가
   - 에러 로깅 강화
   - 재시도 가능 여부 명시
   - XSS/스팸 검증 강화

2. `api/studies/[id]/chat/[messageId]/route.js` (PATCH, DELETE)
   - 권한 검증 강화
   - 연관 데이터 처리
   - Soft delete 구현

3. `api/studies/[id]/chat/[messageId]/read/route.js` (POST)
   - 동시성 안전한 읽음 처리
   - WebSocket 실시간 알림

4. `api/studies/[id]/chat/search/route.js` (GET)
   - 검색어 검증 강화
   - 성능 최적화

### 6.4 Phase 5: 컴포넌트 예외 처리 (10시간)

**수정할 파일**:
1. `components/study/RealtimeChat.js`
   - 에러 바운더리 추가
   - 낙관적 업데이트 구현
   - 재연결 시 메시지 동기화
   - 메시지 중복 방지
   - 오프라인 상태 처리
   - 로딩/에러 상태 UI
   - 재시도 버튼

**생성할 파일**:
1. `components/chat/ChatErrorBoundary.js` - 채팅 에러 바운더리
2. `components/chat/ChatErrorMessage.js` - 에러 메시지 컴포넌트
3. `components/chat/ChatRetryButton.js` - 재시도 버튼
4. `components/chat/ChatConnectionStatus.js` - 연결 상태 표시

### 6.5 Phase 6: 테스트 및 검증 (6시간)

**테스트 항목**:
1. **연결 테스트**
   - [ ] 정상 연결
   - [ ] 연결 실패 (서버 중지)
   - [ ] 재연결 (서버 재시작)
   - [ ] 타임아웃
   - [ ] 인증 실패

2. **메시지 테스트**
   - [ ] 정상 전송/수신
   - [ ] 전송 실패 (네트워크)
   - [ ] 전송 실패 (서버)
   - [ ] 빈 메시지
   - [ ] 긴 메시지
   - [ ] 스팸

3. **동기화 테스트**
   - [ ] 낙관적 업데이트
   - [ ] 메시지 순서
   - [ ] 중복 방지
   - [ ] 재연결 후 동기화

4. **파일 테스트**
   - [ ] 정상 업로드
   - [ ] 크기 초과
   - [ ] 형식 불가
   - [ ] 다운로드

5. **UI 테스트**
   - [ ] 자동 스크롤
   - [ ] 무한 스크롤
   - [ ] 타이핑 인디케이터
   - [ ] 읽음 표시

### 6.6 Phase 7: 문서화 및 최종 정리 (2시간)

**생성할 문서**:
1. `docs/exception/implement/chat/CHAT-FINAL-REPORT.md` - 최종 보고서
2. `docs/exception/implement/chat/USAGE-GUIDE.md` - 사용 가이드
3. `docs/exception/implement/chat/ERROR-CODE-REFERENCE.md` - 에러 코드 레퍼런스

---

## 7. 작업 우선순위

### 7.1 우선순위 1 (긴급) - 8시간

**목표**: 기본 에러 처리 구조 구축

1. ✅ 예외 클래스 생성 (2시간)
2. ✅ 에러 핸들러 유틸리티 (2시간)
3. ✅ Socket 연결 에러 처리 (4시간)

### 7.2 우선순위 2 (높음) - 12시간

**목표**: API 및 메시지 에러 처리

1. ✅ API Routes 에러 처리 (8시간)
2. ✅ 메시지 전송/수신 에러 처리 (4시간)

### 7.3 우선순위 3 (보통) - 10시간

**목표**: UI 에러 처리 및 UX 개선

1. ✅ 낙관적 업데이트 (4시간)
2. ✅ 에러 UI 컴포넌트 (3시간)
3. ✅ 재시도 로직 (3시간)

### 7.4 우선순위 4 (낮음) - 6시간

**목표**: 테스트 및 문서화

1. ✅ 통합 테스트 (4시간)
2. ✅ 문서화 (2시간)

---

## 📊 예상 작업 시간

| Phase | 작업 | 시간 | 누적 |
|-------|------|------|------|
| 1 | 분석 및 계획 | 8h | 8h |
| 2 | 예외 클래스/유틸리티 | 4h | 12h |
| 3 | Socket 연결 예외 처리 | 6h | 18h |
| 4 | API Routes 예외 처리 | 8h | 26h |
| 5 | 컴포넌트 예외 처리 | 10h | 36h |
| 6 | 테스트 및 검증 | 6h | 42h |
| 7 | 문서화 및 최종 정리 | 2h | 44h |

**총 예상 시간**: 44시간 (약 5.5일)

---

## ✅ 다음 단계

Phase 1 완료 후:
1. ✅ 폴더 구조 확인 및 생성
2. ✅ 파일 분석 완료
3. ✅ 에러 코드 설계 완료
4. ✅ 구현 계획 수립 완료

**다음 작업**: Phase 2 - 예외 클래스 및 유틸리티 생성

---

**작성자**: GitHub Copilot  
**검토 필요**: Yes  
**승인 필요**: Yes

