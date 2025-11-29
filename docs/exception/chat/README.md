# 채팅 시스템 예외 처리 가이드

**작성일**: 2025-11-29  
**최종 업데이트**: 2025-11-29  
**작성자**: CoUp 개발팀  
**버전**: 1.0.0

---

## 📋 목차

1. [개요](#개요)
2. [채팅 시스템 아키텍처](#채팅-시스템-아키텍처)
3. [주요 기능](#주요-기능)
4. [예외 처리 영역](#예외-처리-영역)
5. [빠른 참조](#빠른-참조)
6. [관련 문서](#관련-문서)

---

## 개요

CoUp의 채팅 시스템은 스터디 그룹 내 실시간 커뮤니케이션을 제공합니다. Socket.IO 기반의 실시간 메시징, 파일 첨부, 읽음 표시, 타이핑 인디케이터 등의 기능을 포함합니다.

### 기술 스택
- **프론트엔드**: React, Next.js 14 (App Router)
- **실시간 통신**: Socket.IO Client
- **백엔드**: Next.js API Routes, Socket.IO Server
- **데이터베이스**: PostgreSQL (Prisma ORM)
- **상태 관리**: React Query, React Hooks

### 주요 특징
- ✅ 실시간 메시지 송수신
- ✅ Socket.IO 기반 양방향 통신
- ✅ 무한 스크롤 (Cursor-based Pagination)
- ✅ 파일 첨부 및 미리보기
- ✅ 읽음 표시 (Read Receipts)
- ✅ 타이핑 인디케이터
- ✅ 메시지 검색
- ✅ 메시지 삭제 및 편집
- ✅ 낙관적 UI 업데이트

---

## 채팅 시스템 아키텍처

### 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    클라이언트 (React)                        │
│  ┌──────────────────┐        ┌─────────────────────┐        │
│  │   Chat Page      │───────▶│   useSocket Hook    │        │
│  │ (page.jsx)       │        │  (실시간 연결)       │        │
│  └──────────────────┘        └─────────────────────┘        │
│           │                              │                   │
│           │ HTTP API                     │ WebSocket         │
│           ▼                              ▼                   │
└───────────┼──────────────────────────────┼───────────────────┘
            │                              │
            │                              │
┌───────────▼──────────────────────────────▼───────────────────┐
│                       서버 (Next.js)                          │
│  ┌──────────────────┐        ┌─────────────────────┐        │
│  │  API Routes      │        │  Socket.IO Server   │        │
│  │  /api/studies/   │        │  (signaling-server) │        │
│  │  [id]/chat       │        │                     │        │
│  └──────────────────┘        └─────────────────────┘        │
│           │                              │                   │
│           ▼                              │                   │
│  ┌──────────────────────────────────────┴───────────────┐   │
│  │               Prisma ORM                             │   │
│  └──────────────────────────────────────┬───────────────┘   │
└─────────────────────────────────────────┼───────────────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │   PostgreSQL    │
                                 └─────────────────┘
```

### 데이터 흐름

#### 메시지 전송 흐름
```
1. 사용자 입력 → 2. 낙관적 UI 업데이트
                 ↓
3. API POST /api/studies/[id]/chat
                 ↓
4. DB 저장 (Prisma)
                 ↓
5. Socket.IO 이벤트 발행 (study:message)
                 ↓
6. 같은 스터디의 모든 클라이언트 수신
                 ↓
7. UI 업데이트
```

#### 메시지 수신 흐름
```
1. Socket.IO 연결 (useSocket)
                 ↓
2. 스터디 룸 입장 (study:join)
                 ↓
3. study:message 이벤트 리스닝
                 ↓
4. 새 메시지 수신
                 ↓
5. 중복 체크 (자신의 메시지 무시)
                 ↓
6. 상태 업데이트
                 ↓
7. UI 렌더링
```

---

## 주요 기능

### 1. 실시간 메시징

**파일**: `src/app/my-studies/[studyId]/chat/page.jsx`

```javascript
// Socket.IO 실시간 메시지 수신
useEffect(() => {
  if (!socket || !currentUser) return;

  const handleNewMessage = (message) => {
    console.log('[Chat] New message received:', message);

    // 자신이 보낸 메시지는 무시 (이미 낙관적 업데이트로 표시됨)
    const messageSenderId = message.senderId || message.userId || message.sender?.id;
    if (messageSenderId === currentUser.id) return;

    // 실시간 메시지에 추가
    setRealtimeMessages(prev => [...prev, {
      ...message,
      sender: message.sender || message.user,
      senderId: message.senderId || message.userId,
      isMine: false,
      createdAt: message.createdAt || new Date().toISOString()
    }]);
  };

  socket.on('study:message', handleNewMessage);

  return () => {
    socket.off('study:message', handleNewMessage);
  };
}, [socket, currentUser]);
```

### 2. 낙관적 UI 업데이트

**파일**: `src/app/my-studies/[studyId]/chat/page.jsx`

```javascript
const handleSend = async (e) => {
  e.preventDefault();
  if (!content.trim() || !socket || !currentUser) return;

  const tempId = `temp-${Date.now()}`;
  const optimisticMessage = {
    id: tempId,
    content: content.trim(),
    senderId: currentUser.id,
    sender: {
      id: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar
    },
    isMine: true,
    createdAt: new Date().toISOString(),
    studyId
  };

  // 낙관적 UI 업데이트
  setRealtimeMessages(prev => [...prev, optimisticMessage]);
  setContent('');

  try {
    // 실제 서버 전송
    const response = await sendMessageMutation.mutateAsync({
      studyId,
      content: optimisticMessage.content,
      fileId: selectedFile?.id
    });

    // 임시 메시지 제거 (실제 메시지로 대체)
    setRealtimeMessages(prev => prev.filter(m => m.id !== tempId));
    
    // Socket.IO로 실시간 브로드캐스트
    socket.emit('study:message', {
      ...response.data,
      studyId
    });

  } catch (error) {
    console.error('메시지 전송 실패:', error);
    
    // 실패한 메시지 표시
    setRealtimeMessages(prev => prev.map(m =>
      m.id === tempId ? { ...m, failed: true } : m
    ));
  }
};
```

### 3. 무한 스크롤 (Cursor-based Pagination)

**파일**: `src/app/api/studies/[id]/chat/route.js`

```javascript
export async function GET(request, { params }) {
  const { id: studyId } = await params;
  const result = await requireStudyMember(studyId);
  if (result instanceof NextResponse) return result;

  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor'); // 마지막 메시지 ID
    const limit = parseInt(searchParams.get('limit') || '50');

    const messages = await prisma.message.findMany({
      where: { studyId },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1 // cursor 자체는 제외
      }),
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        file: {
          select: {
            id: true,
            name: true,
            url: true,
            type: true,
            size: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: messages.reverse(),
      hasMore: messages.length === limit,
      nextCursor: messages.length > 0 ? messages[0].id : null
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: "메시지를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
```

### 4. 타이핑 인디케이터

**파일**: `src/app/my-studies/[studyId]/chat/page.jsx`

```javascript
// 타이핑 이벤트 발행
const handleContentChange = (e) => {
  setContent(e.target.value);

  // 타이핑 알림 (throttle 적용)
  if (socket && currentUser) {
    socket.emit('study:typing', {
      studyId,
      userId: currentUser.id,
      userName: currentUser.name
    });
  }
};

// 타이핑 이벤트 수신
useEffect(() => {
  if (!socket || !currentUser) return;

  const handleTyping = ({ userId, userName }) => {
    if (userId === currentUser.id) return;
    
    setTypingUsers(prev => {
      if (!prev.includes(userName)) {
        return [...prev, userName];
      }
      return prev;
    });

    // 3초 후 타이핑 표시 제거
    setTimeout(() => {
      setTypingUsers(prev => prev.filter(name => name !== userName));
    }, 3000);
  };

  socket.on('study:typing', handleTyping);

  return () => {
    socket.off('study:typing', handleTyping);
  };
}, [socket, currentUser]);
```

### 5. 읽음 표시 (Read Receipts)

**파일**: `src/app/api/studies/[id]/chat/[messageId]/read/route.js`

```javascript
export async function POST(request, { params }) {
  const { id: studyId, messageId } = await params;
  
  const result = await requireStudyMember(studyId);
  if (result instanceof NextResponse) return result;
  
  const { session } = result;

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message || message.studyId !== studyId) {
      return NextResponse.json(
        { error: "메시지를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 이미 읽은 경우
    if (message.readers.includes(session.user.id)) {
      return NextResponse.json({
        success: true,
        message: "이미 읽음 처리된 메시지입니다"
      });
    }

    // 읽음 처리
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        readers: {
          push: session.user.id
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedMessage
    });

  } catch (error) {
    console.error('Mark message as read error:', error);
    return NextResponse.json(
      { error: "읽음 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
```

### 6. 파일 첨부

**메시지 전송 시 파일 첨부**:
```javascript
const handleSend = async (e) => {
  e.preventDefault();
  
  // 파일 첨부가 있는 경우
  if (selectedFile) {
    const response = await sendMessageMutation.mutateAsync({
      studyId,
      content: content.trim(),
      fileId: selectedFile.id
    });
  }
};
```

**파일 선택 및 업로드**:
```javascript
const handleFileSelect = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setIsUploading(true);
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studyId', studyId);

    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      setSelectedFile(data.data);
    }
  } catch (error) {
    console.error('파일 업로드 실패:', error);
  } finally {
    setIsUploading(false);
  }
};
```

---

## 예외 처리 영역

### 문서 구조

| 문서 | 설명 | 주요 내용 |
|------|------|-----------|
| [INDEX.md](./INDEX.md) | 전체 색인 | 증상별/카테고리별 빠른 찾기 |
| [01-connection-exceptions.md](./01-connection-exceptions.md) | 연결 예외 | Socket.IO 연결 실패, 재연결, 타임아웃 |
| [02-message-exceptions.md](./02-message-exceptions.md) | 메시지 예외 | 전송 실패, 수신 오류, 중복 처리 |
| [03-realtime-sync-exceptions.md](./03-realtime-sync-exceptions.md) | 실시간 동기화 | 이벤트 손실, 순서 보장, 낙관적 업데이트 |
| [04-file-exceptions.md](./04-file-exceptions.md) | 파일 예외 | 업로드 실패, 용량 초과, 미리보기 오류 |
| [05-ui-exceptions.md](./05-ui-exceptions.md) | UI 예외 | 스크롤 문제, 입력 오류, 렌더링 이슈 |
| [99-best-practices.md](./99-best-practices.md) | 모범 사례 | 채팅 시스템 구현 패턴, 성능 최적화 |

### 주요 예외 카테고리

#### 1. 연결 문제
- Socket.IO 연결 실패
- 서버 응답 없음
- 재연결 실패
- 타임아웃

#### 2. 메시지 전송/수신
- API 요청 실패
- 메시지 전송 실패
- 메시지 수신 오류
- 중복 메시지

#### 3. 실시간 동기화
- 이벤트 손실
- 메시지 순서 문제
- 낙관적 업데이트 실패
- 동시성 문제

#### 4. 파일 처리
- 업로드 실패
- 용량 초과
- 파일 타입 제한
- 미리보기 생성 오류

#### 5. UI/UX
- 스크롤 문제
- 무한 스크롤 버그
- 입력 상태 관리
- 타이핑 인디케이터 오작동

---

## 빠른 참조

### 자주 발생하는 문제

| 증상 | 원인 | 해결 문서 |
|------|------|-----------|
| 메시지가 전송되지 않음 | Socket 연결 끊김 | [01-connection-exceptions.md](./01-connection-exceptions.md) |
| 중복 메시지 표시 | 이벤트 중복 처리 | [02-message-exceptions.md](./02-message-exceptions.md) |
| 메시지 순서가 뒤바뀜 | 타임스탬프 처리 오류 | [03-realtime-sync-exceptions.md](./03-realtime-sync-exceptions.md) |
| 파일 업로드 실패 | 용량/타입 제한 | [04-file-exceptions.md](./04-file-exceptions.md) |
| 스크롤이 작동하지 않음 | ref 문제 | [05-ui-exceptions.md](./05-ui-exceptions.md) |

### API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/studies/[id]/chat` | GET | 메시지 목록 조회 |
| `/api/studies/[id]/chat` | POST | 메시지 전송 |
| `/api/studies/[id]/chat/[messageId]` | DELETE | 메시지 삭제 |
| `/api/studies/[id]/chat/[messageId]/read` | POST | 읽음 표시 |
| `/api/studies/[id]/chat/search` | GET | 메시지 검색 |

### Socket.IO 이벤트

| 이벤트 | 방향 | 설명 |
|--------|------|------|
| `study:join` | Client → Server | 스터디 채팅방 입장 |
| `study:leave` | Client → Server | 스터디 채팅방 퇴장 |
| `study:message` | Server → Client | 새 메시지 수신 |
| `study:typing` | Client ⇄ Server | 타이핑 상태 |
| `study:online-users` | Server → Client | 온라인 사용자 목록 |

---

## 관련 문서

### 내부 문서
- [내 스터디 예외 처리](../my-studies/README.md)
- [알림 예외 처리](../notifications/README.md)
- [파일 관리 예외 처리](../files/README.md)

### 외부 참조
- [Socket.IO 공식 문서](https://socket.io/docs/)
- [React Query 공식 문서](https://tanstack.com/query/latest)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## 기여 및 피드백

이 문서는 지속적으로 업데이트됩니다. 문제나 개선 사항이 있다면:

1. GitHub Issues에 등록
2. 개발팀에 직접 연락
3. Pull Request 제출

---

**마지막 업데이트**: 2025-11-29  
**문서 버전**: 1.0.0  
**다음 리뷰 예정일**: 2025-12-06

