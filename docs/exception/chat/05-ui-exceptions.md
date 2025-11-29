# 채팅 UI 예외 처리

**문서 ID**: CHAT-05  
**작성일**: 2025-11-29  
**카테고리**: UI/UX  
**우선순위**: 🔶 중간

---

## 📋 목차

1. [자동 스크롤 실패](#1-자동-스크롤-실패)
2. [무한 스크롤 문제](#2-무한-스크롤-문제)
3. [타이핑 인디케이터](#3-타이핑-인디케이터)
4. [입력 상태 문제](#4-입력-상태-문제)
5. [읽음 표시 문제](#5-읽음-표시-문제)

---

## 1. 자동 스크롤 실패

### 1.1 새 메시지 시 스크롤

#### 해결 방법

**✅ 자동 스크롤 구현**:
```javascript
const messagesEndRef = useRef(null);

const scrollToBottom = (behavior = 'smooth') => {
  messagesEndRef.current?.scrollIntoView({ behavior });
};

// 새 메시지 시 자동 스크롤
useEffect(() => {
  scrollToBottom();
}, [allMessages]);

// JSX
<div className="messages-list">
  {allMessages.map(message => (
    <MessageBubble key={message.id} message={message} />
  ))}
  <div ref={messagesEndRef} />
</div>
```

### 1.2 사용자가 스크롤 중일 때는 자동 스크롤 안 함

**✅ 스크롤 위치 감지**:
```javascript
const [isAtBottom, setIsAtBottom] = useState(true);
const messagesContainerRef = useRef(null);

const handleScroll = () => {
  const container = messagesContainerRef.current;
  if (!container) return;

  const { scrollTop, scrollHeight, clientHeight } = container;
  const atBottom = scrollHeight - scrollTop - clientHeight < 50;
  setIsAtBottom(atBottom);
};

useEffect(() => {
  // 아래에 있을 때만 자동 스크롤
  if (isAtBottom) {
    scrollToBottom();
  }
}, [allMessages, isAtBottom]);

// JSX
<div 
  ref={messagesContainerRef}
  onScroll={handleScroll}
  className="messages-list"
>
  {/* 메시지들 */}
</div>

{!isAtBottom && (
  <button 
    className="scroll-to-bottom"
    onClick={() => scrollToBottom()}
  >
    ↓ 최신 메시지로
  </button>
)}
```

---

## 2. 무한 스크롤 문제

### 2.1 이전 메시지 로드

**✅ Intersection Observer 사용**:
```javascript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['messages', studyId],
  queryFn: ({ pageParam }) => 
    api.get(`/api/studies/${studyId}/chat`, { 
      params: { cursor: pageParam, limit: 50 }
    }),
  getNextPageParam: (lastPage) => lastPage.nextCursor
});

const observerTarget = useRef(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    { threshold: 1.0 }
  );

  if (observerTarget.current) {
    observer.observe(observerTarget.current);
  }

  return () => observer.disconnect();
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

// JSX
<div className="messages-list">
  <div ref={observerTarget} className="load-more-trigger">
    {isFetchingNextPage && <div>로딩 중...</div>}
  </div>
  {/* 메시지들 */}
</div>
```

---

## 3. 타이핑 인디케이터

### 3.1 타이핑 상태 표시

**✅ 타이핑 이벤트 처리**:
```javascript
const [typingUsers, setTypingUsers] = useState([]);

useEffect(() => {
  if (!socket) return;

  const handleTyping = ({ userId, userName }) => {
    if (userId === currentUser?.id) return;

    setTypingUsers(prev => {
      if (!prev.includes(userName)) {
        return [...prev, userName];
      }
      return prev;
    });

    // 3초 후 자동 제거
    setTimeout(() => {
      setTypingUsers(prev => prev.filter(name => name !== userName));
    }, 3000);
  };

  socket.on('study:typing', handleTyping);

  return () => {
    socket.off('study:typing', handleTyping);
  };
}, [socket, currentUser]);

// 타이핑 이벤트 발행 (throttle 적용)
const handleInputChange = useCallback(
  throttle((value) => {
    if (socket && value.length > 0) {
      socket.emit('study:typing', {
        studyId,
        userId: currentUser.id,
        userName: currentUser.name
      });
    }
  }, 1000),
  [socket, studyId, currentUser]
);

// JSX
{typingUsers.length > 0 && (
  <div className="typing-indicator">
    {typingUsers.join(', ')}님이 입력 중입니다...
  </div>
)}
```

---

## 4. 입력 상태 문제

### 4.1 입력창 초기화

**✅ 전송 후 입력창 비우기**:
```javascript
const [content, setContent] = useState('');
const textareaRef = useRef(null);

const handleSend = async (e) => {
  e.preventDefault();
  if (!content.trim()) return;

  const messageContent = content.trim();
  
  // ✅ 즉시 입력창 비우기
  setContent('');
  textareaRef.current?.focus();

  try {
    await sendMessage(messageContent);
  } catch (error) {
    // 실패 시 내용 복원
    setContent(messageContent);
  }
};
```

---

## 5. 읽음 표시 문제

### 5.1 읽음 상태 업데이트

**✅ 읽음 표시 구현**:
```javascript
const [readReceipts, setReadReceipts] = useState({});

useEffect(() => {
  if (!socket) return;

  socket.on('study:message-read', ({ messageId, userId }) => {
    setReadReceipts(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), userId]
    }));
  });

  return () => {
    socket.off('study:message-read');
  };
}, [socket]);

// 메시지 보기 시 읽음 처리
const markAsRead = async (messageId) => {
  try {
    await api.post(`/api/studies/${studyId}/chat/${messageId}/read`);
    
    socket.emit('study:message-read', {
      studyId,
      messageId,
      userId: currentUser.id
    });
  } catch (error) {
    console.error('Mark as read failed:', error);
  }
};
```

---

**마지막 업데이트**: 2025-11-29

