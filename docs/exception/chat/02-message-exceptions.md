# 채팅 메시지 예외 처리

**문서 ID**: CHAT-02  
**작성일**: 2025-11-29  
**카테고리**: 메시지 처리  
**우선순위**: 🔥 높음

---

## 📋 목차

1. [메시지 전송 실패](#1-메시지-전송-실패)
2. [중복 메시지](#2-중복-메시지)
3. [실패 메시지 처리](#3-실패-메시지-처리)
4. [빈 메시지 방지](#4-빈-메시지-방지)
5. [메시지 수신 실패](#5-메시지-수신-실패)
6. [메시지 삭제 예외](#6-메시지-삭제-예외)

---

## 1. 메시지 전송 실패

### 1.1 API 요청 실패

#### 증상
```
❌ Failed to send message
❌ Network request failed
❌ 500 Internal Server Error
```

#### 원인
- 네트워크 오류
- 서버 에러
- 잘못된 요청 데이터
- 권한 부족

#### 해결 방법

**✅ 에러 처리가 포함된 메시지 전송**:
```javascript
// src/app/my-studies/[studyId]/chat/page.jsx
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
    studyId,
    status: 'sending' // 전송 중
  };

  // 낙관적 UI 업데이트
  setRealtimeMessages(prev => [...prev, optimisticMessage]);
  setContent('');

  try {
    const response = await sendMessageMutation.mutateAsync({
      studyId,
      content: optimisticMessage.content,
      fileId: selectedFile?.id
    });

    // 성공: 임시 메시지를 실제 메시지로 교체
    setRealtimeMessages(prev => 
      prev.map(m => m.id === tempId 
        ? { ...response.data, status: 'sent' }
        : m
      )
    );

    // Socket.IO로 실시간 브로드캐스트
    socket.emit('study:message', {
      ...response.data,
      studyId
    });

    // 파일 첨부 초기화
    if (selectedFile) {
      setSelectedFile(null);
    }

  } catch (error) {
    console.error('[Chat] Message send failed:', error);

    // 실패: 메시지에 failed 표시
    setRealtimeMessages(prev => 
      prev.map(m => m.id === tempId 
        ? { ...m, status: 'failed', error: error.message }
        : m
      )
    );

    // 사용자에게 알림
    toast.error('메시지 전송에 실패했습니다. 다시 시도해주세요.');
  }
};
```

**✅ 실패 메시지 UI**:
```javascript
// src/components/chat/MessageBubble.jsx
export default function MessageBubble({ message, onRetry, onDelete }) {
  const { status, error } = message;

  return (
    <div className={`message ${message.isMine ? 'mine' : 'others'} ${status}`}>
      <div className="message-content">
        {message.content}
      </div>

      {/* 전송 상태 */}
      {status === 'sending' && (
        <div className="message-status">
          <span className="spinner">⏳</span>
          <span>전송 중...</span>
        </div>
      )}

      {status === 'failed' && (
        <div className="message-status error">
          <span className="icon">❌</span>
          <span>{error || '전송 실패'}</span>
          <button onClick={() => onRetry(message)}>
            재시도
          </button>
          <button onClick={() => onDelete(message.id)}>
            삭제
          </button>
        </div>
      )}

      {status === 'sent' && (
        <div className="message-timestamp">
          {formatTime(message.createdAt)}
        </div>
      )}
    </div>
  );
}
```

### 1.2 재시도 로직

#### 해결 방법

**✅ 자동 재시도**:
```javascript
// src/lib/hooks/useMessageSend.js
export function useMessageSend(studyId) {
  const sendMessage = async (content, options = {}) => {
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`/api/studies/${studyId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        return data;

      } catch (error) {
        console.error(`[Message Send] Attempt ${attempt}/${maxRetries} failed:`, error);

        // 마지막 시도에서도 실패하면 에러 throw
        if (attempt === maxRetries) {
          throw error;
        }

        // 재시도 전 대기
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  };

  return { sendMessage };
}

// 사용
const { sendMessage } = useMessageSend(studyId);

const handleSend = async () => {
  try {
    const result = await sendMessage(content, {
      maxRetries: 3,
      retryDelay: 1000
    });
    console.log('Message sent:', result);
  } catch (error) {
    console.error('All retry attempts failed:', error);
    toast.error('메시지 전송에 실패했습니다');
  }
};
```

### 1.3 스터디 멤버 권한 확인

#### 증상
```
❌ 403 Forbidden
❌ You are not a member of this study
```

#### 원인
- 사용자가 스터디 멤버가 아님
- 멤버십 상태가 PENDING 또는 REJECTED

#### 해결 방법

**✅ API에서 권한 검증**:
```javascript
// src/app/api/studies/[id]/chat/route.js
import { requireStudyMember } from '@/lib/auth-helpers';

export async function POST(request, { params }) {
  const { id: studyId } = await params;

  // 스터디 멤버 권한 확인
  const result = await requireStudyMember(studyId);
  if (result instanceof NextResponse) {
    // 권한 없음
    return result;
  }

  const { session, membership } = result;

  // 멤버십 상태 확인
  if (membership.status !== 'ACTIVE') {
    return NextResponse.json(
      { 
        error: '스터디 멤버만 채팅할 수 있습니다',
        status: membership.status 
      },
      { status: 403 }
    );
  }

  // 메시지 생성
  try {
    const body = await request.json();
    const { content, fileId } = body;

    if (!content && !fileId) {
      return NextResponse.json(
        { error: '메시지 내용 또는 파일을 입력해주세요' },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        studyId,
        userId: session.user.id,
        content: content || '',
        fileId,
        readers: [session.user.id]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        file: true
      }
    });

    return NextResponse.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json(
      { error: '메시지 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
```

**✅ 클라이언트에서 사전 검증**:
```javascript
// src/app/my-studies/[studyId]/chat/page.jsx
const { data: studyData } = useStudy(studyId);
const { data: membersData } = useStudyMembers(studyId);

const myMembership = membersData?.data?.find(
  m => m.userId === currentUser?.id
);

// 권한 없는 경우 UI 차단
if (myMembership?.status !== 'ACTIVE') {
  return (
    <div className="no-access">
      <h2>채팅 권한이 없습니다</h2>
      <p>
        {myMembership?.status === 'PENDING' && '가입 승인 대기 중입니다'}
        {myMembership?.status === 'REJECTED' && '가입이 거부되었습니다'}
        {!myMembership && '이 스터디의 멤버가 아닙니다'}
      </p>
      <Link href={`/studies/${studyId}`}>
        스터디 상세 페이지로 이동
      </Link>
    </div>
  );
}

// 정상 채팅 UI
return (
  <div className="chat-container">
    {/* 채팅 UI */}
  </div>
);
```

---

## 2. 중복 메시지

### 2.1 이벤트 중복 처리

#### 증상
- 같은 메시지가 2번 이상 표시됨
- 낙관적 업데이트 메시지 + Socket 수신 메시지 중복

#### 원인
- 낙관적 업데이트와 Socket 이벤트가 모두 처리됨
- 이벤트 리스너가 중복 등록됨

#### 해결 방법

**✅ 자신의 메시지 필터링**:
```javascript
// src/app/my-studies/[studyId]/chat/page.jsx
useEffect(() => {
  if (!socket || !currentUser) return;

  const handleNewMessage = (message) => {
    console.log('[Chat] New message received:', message);

    // ✅ 자신이 보낸 메시지는 무시 (이미 낙관적 업데이트로 표시됨)
    const messageSenderId = message.senderId || message.userId || message.sender?.id;
    if (messageSenderId === currentUser.id) {
      console.log('[Chat] Ignoring own message');
      return;
    }

    // 다른 사용자의 메시지만 추가
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

**✅ 메시지 ID 기반 중복 제거**:
```javascript
// src/app/my-studies/[studyId]/chat/page.jsx
const [realtimeMessages, setRealtimeMessages] = useState([]);

// API 메시지와 실시간 메시지 병합
const apiMessages = (messagesData?.data || []).map(msg => ({
  ...msg,
  sender: msg.user || msg.sender,
  senderId: msg.userId || msg.senderId
}));

// ✅ 중복 제거: ID 기반
const allMessages = useMemo(() => {
  const combined = [...apiMessages, ...realtimeMessages];
  
  // ID로 중복 제거
  const uniqueMessages = combined.reduce((acc, msg) => {
    // 임시 ID는 제외 (temp-로 시작)
    if (msg.id.startsWith('temp-')) {
      // 실제 메시지가 없으면 임시 메시지 포함
      const hasRealMessage = acc.some(m => 
        m.content === msg.content && 
        m.senderId === msg.senderId &&
        !m.id.startsWith('temp-')
      );
      if (!hasRealMessage) {
        acc.push(msg);
      }
    } else {
      // 실제 메시지는 ID로 중복 체크
      if (!acc.some(m => m.id === msg.id)) {
        acc.push(msg);
      }
    }
    return acc;
  }, []);

  // 시간순 정렬
  return uniqueMessages.sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );
}, [apiMessages, realtimeMessages]);
```

### 2.2 이벤트 리스너 중복 등록

#### 증상
- 메시지가 2배, 3배로 중복됨
- 리렌더링마다 중복이 증가함

#### 원인
- useEffect cleanup 함수가 없음
- 이전 리스너를 제거하지 않고 새로 등록

#### 해결 방법

**✅ 올바른 cleanup**:
```javascript
useEffect(() => {
  if (!socket || !currentUser) return;

  const handleNewMessage = (message) => {
    // 메시지 처리
  };

  const handleTyping = ({ userId, userName }) => {
    // 타이핑 처리
  };

  // 이벤트 리스너 등록
  socket.on('study:message', handleNewMessage);
  socket.on('study:typing', handleTyping);

  // ✅ cleanup: 이벤트 리스너 제거
  return () => {
    socket.off('study:message', handleNewMessage);
    socket.off('study:typing', handleTyping);
  };
}, [socket, currentUser]); // 의존성 배열 정확히
```

**❌ 잘못된 예**:
```javascript
// 나쁜 예 1: cleanup 없음
useEffect(() => {
  socket.on('study:message', handleNewMessage);
  // ❌ cleanup 없음
}, []);

// 나쁜 예 2: 함수 참조가 매번 바뀜
useEffect(() => {
  socket.on('study:message', (message) => {
    setMessages(prev => [...prev, message]);
  });
  
  return () => {
    // ❌ 다른 함수 참조라서 제거 안 됨
    socket.off('study:message', (message) => {
      setMessages(prev => [...prev, message]);
    });
  };
}, []);
```

---

## 3. 실패 메시지 처리

### 3.1 실패 메시지 재시도

#### 해결 방법

**✅ 재시도 버튼**:
```javascript
const handleRetry = async (failedMessage) => {
  // 실패 메시지의 상태를 전송 중으로 변경
  setRealtimeMessages(prev =>
    prev.map(m => m.id === failedMessage.id
      ? { ...m, status: 'sending', error: null }
      : m
    )
  );

  try {
    const response = await sendMessageMutation.mutateAsync({
      studyId,
      content: failedMessage.content,
      fileId: failedMessage.fileId
    });

    // 성공: 임시 메시지를 실제 메시지로 교체
    setRealtimeMessages(prev =>
      prev.map(m => m.id === failedMessage.id
        ? { ...response.data, status: 'sent' }
        : m
      )
    );

    // Socket.IO로 브로드캐스트
    socket.emit('study:message', {
      ...response.data,
      studyId
    });

    toast.success('메시지가 전송되었습니다');

  } catch (error) {
    console.error('[Chat] Retry failed:', error);

    // 다시 실패
    setRealtimeMessages(prev =>
      prev.map(m => m.id === failedMessage.id
        ? { ...m, status: 'failed', error: error.message }
        : m
      )
    );

    toast.error('메시지 재전송에 실패했습니다');
  }
};
```

### 3.2 실패 메시지 삭제

#### 해결 방법

**✅ 실패 메시지 제거**:
```javascript
const handleDeleteFailedMessage = (messageId) => {
  if (!confirm('실패한 메시지를 삭제하시겠습니까?')) return;

  setRealtimeMessages(prev => 
    prev.filter(m => m.id !== messageId)
  );

  toast.info('메시지가 삭제되었습니다');
};
```

### 3.3 오래된 실패 메시지 자동 정리

#### 해결 방법

**✅ 30분 경과한 실패 메시지 자동 삭제**:
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    const now = Date.now();
    const THIRTY_MINUTES = 30 * 60 * 1000;

    setRealtimeMessages(prev => 
      prev.filter(m => {
        if (m.status !== 'failed') return true;
        
        const messageTime = new Date(m.createdAt).getTime();
        const elapsed = now - messageTime;
        
        return elapsed < THIRTY_MINUTES;
      })
    );
  }, 60000); // 1분마다 체크

  return () => clearInterval(interval);
}, []);
```

---

## 4. 빈 메시지 방지

### 4.1 클라이언트 검증

#### 해결 방법

**✅ 전송 전 검증**:
```javascript
const handleSend = async (e) => {
  e.preventDefault();

  // ✅ 빈 메시지 방지
  if (!content.trim() && !selectedFile) {
    toast.error('메시지 내용을 입력하거나 파일을 첨부해주세요');
    return;
  }

  // ✅ 최대 길이 검증
  if (content.length > 5000) {
    toast.error('메시지는 5000자 이내로 입력해주세요');
    return;
  }

  // ✅ Socket 연결 확인
  if (!socket || !socket.connected) {
    toast.error('서버에 연결되지 않았습니다');
    return;
  }

  // ✅ 로그인 확인
  if (!currentUser) {
    toast.error('로그인이 필요합니다');
    return;
  }

  // 메시지 전송
  // ...
};
```

**✅ 입력 UI 제어**:
```javascript
// src/components/chat/MessageInput.jsx
export default function MessageInput({ onSend, isConnected, disabled }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmed = content.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setContent('');
  };

  const canSend = content.trim().length > 0 && isConnected && !disabled;

  return (
    <form onSubmit={handleSubmit} className="message-input">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          !isConnected
            ? '서버 연결 중...'
            : disabled
            ? '메시지를 보낼 수 없습니다'
            : '메시지를 입력하세요'
        }
        disabled={!isConnected || disabled}
        maxLength={5000}
        onKeyDown={(e) => {
          // Ctrl+Enter로 전송
          if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit(e);
          }
        }}
      />
      
      <div className="input-footer">
        <span className="char-count">
          {content.length} / 5000
        </span>
        
        <button 
          type="submit" 
          disabled={!canSend}
          className={canSend ? 'active' : 'disabled'}
        >
          전송
        </button>
      </div>
    </form>
  );
}
```

### 4.2 서버 검증

#### 해결 방법

**✅ API 유효성 검사**:
```javascript
// src/app/api/studies/[id]/chat/route.js
export async function POST(request, { params }) {
  const { id: studyId } = await params;

  const result = await requireStudyMember(studyId);
  if (result instanceof NextResponse) return result;

  const { session } = result;

  try {
    const body = await request.json();
    const { content, fileId } = body;

    // ✅ 빈 메시지 검증
    if (!content && !fileId) {
      return NextResponse.json(
        { error: '메시지 내용 또는 파일을 입력해주세요' },
        { status: 400 }
      );
    }

    // ✅ 내용이 있는 경우 검증
    if (content) {
      const trimmed = content.trim();
      
      if (trimmed.length === 0) {
        return NextResponse.json(
          { error: '빈 메시지는 전송할 수 없습니다' },
          { status: 400 }
        );
      }

      if (trimmed.length > 5000) {
        return NextResponse.json(
          { error: '메시지는 5000자 이내로 입력해주세요' },
          { status: 400 }
        );
      }
    }

    // 메시지 생성
    const message = await prisma.message.create({
      data: {
        studyId,
        userId: session.user.id,
        content: content?.trim() || '',
        fileId,
        readers: [session.user.id]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        file: true
      }
    });

    return NextResponse.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json(
      { error: '메시지 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
```

---

## 5. 메시지 수신 실패

### 5.1 이벤트 리스너 누락

#### 증상
- 다른 사용자의 메시지가 수신되지 않음
- Socket은 연결되어 있지만 메시지가 안 옴

#### 원인
- 이벤트 리스너가 등록되지 않음
- 스터디 룸에 입장하지 않음

#### 해결 방법

**✅ 스터디 룸 입장 및 이벤트 리스닝**:
```javascript
useEffect(() => {
  if (!socket || !studyId || !currentUser) return;

  console.log('[Chat] Joining study room:', studyId);

  // ✅ 스터디 룸 입장
  socket.emit('study:join', { studyId });

  // ✅ 메시지 수신 리스너 등록
  const handleNewMessage = (message) => {
    console.log('[Chat] New message received:', message);

    // 자신의 메시지 제외
    const messageSenderId = message.senderId || message.userId;
    if (messageSenderId === currentUser.id) return;

    setRealtimeMessages(prev => [...prev, message]);
  };

  socket.on('study:message', handleNewMessage);

  // ✅ cleanup
  return () => {
    console.log('[Chat] Leaving study room:', studyId);
    socket.emit('study:leave', { studyId });
    socket.off('study:message', handleNewMessage);
  };
}, [socket, studyId, currentUser]);
```

### 5.2 서버 측 브로드캐스트 확인

#### 해결 방법

**✅ Socket.IO 서버 이벤트 발행**:
```javascript
// signaling-server/handlers/studyHandlers.js
export function handleStudyMessage(socket, io) {
  return async (data) => {
    const { studyId, message } = data;

    console.log('[Study] Broadcasting message:', {
      studyId,
      messageId: message.id,
      from: socket.userId
    });

    // ✅ 같은 스터디의 모든 클라이언트에게 전송 (자신 제외)
    socket.to(`study:${studyId}`).emit('study:message', message);

    // 또는 자신 포함
    // io.to(`study:${studyId}`).emit('study:message', message);
  };
}
```

---

## 6. 메시지 삭제 예외

### 6.1 삭제 권한 확인

#### 증상
```
❌ 403 Forbidden
❌ You can only delete your own messages
```

#### 해결 방법

**✅ 삭제 권한 검증 (API)**:
```javascript
// src/app/api/studies/[id]/chat/[messageId]/route.js
export async function DELETE(request, { params }) {
  const { id: studyId, messageId } = await params;

  const result = await requireStudyMember(studyId);
  if (result instanceof NextResponse) return result;

  const { session } = result;

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        user: {
          select: { id: true }
        }
      }
    });

    if (!message || message.studyId !== studyId) {
      return NextResponse.json(
        { error: '메시지를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // ✅ 권한 검증: 본인 메시지만 삭제 가능
    if (message.userId !== session.user.id) {
      return NextResponse.json(
        { error: '자신의 메시지만 삭제할 수 있습니다' },
        { status: 403 }
      );
    }

    // 메시지 삭제
    await prisma.message.delete({
      where: { id: messageId }
    });

    return NextResponse.json({
      success: true,
      message: '메시지가 삭제되었습니다'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json(
      { error: '메시지 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
```

**✅ UI에서 권한 체크**:
```javascript
// src/components/chat/MessageBubble.jsx
export default function MessageBubble({ message, currentUser, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  // ✅ 본인 메시지만 삭제 메뉴 표시
  const canDelete = message.senderId === currentUser?.id;

  const handleDelete = async () => {
    if (!confirm('이 메시지를 삭제하시겠습니까?')) return;

    try {
      await onDelete(message.id);
      toast.success('메시지가 삭제되었습니다');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('메시지 삭제에 실패했습니다');
    }
  };

  return (
    <div className={`message ${message.isMine ? 'mine' : 'others'}`}>
      <div className="message-content">
        {message.content}
      </div>

      {canDelete && (
        <div className="message-menu">
          <button onClick={() => setShowMenu(!showMenu)}>⋮</button>
          
          {showMenu && (
            <div className="menu-dropdown">
              <button onClick={handleDelete}>
                🗑️ 삭제
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 6.2 삭제 실패 시 롤백

#### 해결 방법

**✅ 낙관적 업데이트와 롤백**:
```javascript
const handleDeleteMessage = async (messageId) => {
  // 낙관적 업데이트: UI에서 즉시 제거
  const previousMessages = [...allMessages];
  setRealtimeMessages(prev => prev.filter(m => m.id !== messageId));

  try {
    const response = await deleteMessageMutation.mutateAsync({
      studyId,
      messageId
    });

    if (!response.success) {
      throw new Error('삭제 실패');
    }

    // Socket.IO로 삭제 이벤트 전송
    socket.emit('study:message-deleted', {
      studyId,
      messageId
    });

  } catch (error) {
    console.error('[Chat] Delete failed:', error);

    // 롤백: 메시지 복원
    setRealtimeMessages(previousMessages.filter(m => 
      m.id.startsWith('temp-') || 
      m.senderId === currentUser.id
    ));

    toast.error('메시지 삭제에 실패했습니다');
  }
};
```

---

## 🔍 디버깅 가이드

### 메시지 전송 문제 진단

```javascript
// 1. 요청 데이터 확인
console.log('Sending message:', { studyId, content, fileId });

// 2. API 응답 확인
const response = await fetch(`/api/studies/${studyId}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content })
});
console.log('Response status:', response.status);
console.log('Response data:', await response.json());

// 3. Socket 이벤트 확인
socket.on('study:message', (message) => {
  console.log('Received message:', message);
});

// 4. 메시지 상태 확인
console.log('All messages:', allMessages);
console.log('Realtime messages:', realtimeMessages);
console.log('API messages:', messagesData?.data);
```

---

## 📚 관련 문서

- [연결 예외 처리](./01-connection-exceptions.md)
- [실시간 동기화 예외](./03-realtime-sync-exceptions.md)
- [UI 예외 처리](./05-ui-exceptions.md)

---

**마지막 업데이트**: 2025-11-29  
**다음 리뷰 예정일**: 2025-12-06

