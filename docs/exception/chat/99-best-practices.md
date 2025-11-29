# 채팅 시스템 모범 사례

**문서 ID**: CHAT-99  
**작성일**: 2025-11-29  
**카테고리**: 모범 사례  
**우선순위**: ⭐ 필수

---

## 📋 목차

1. [에러 처리 패턴](#1-에러-처리-패턴)
2. [성능 최적화](#2-성능-최적화)
3. [보안 고려사항](#3-보안-고려사항)
4. [테스트 전략](#4-테스트-전략)
5. [모니터링](#5-모니터링)

---

## 1. 에러 처리 패턴

### 1.1 전역 에러 핸들러

**✅ Socket 에러 처리**:
```javascript
useEffect(() => {
  if (!socket) return;

  const handleError = (error) => {
    console.error('[Socket Error]', {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    });

    // 사용자에게 알림
    toast.error('연결 오류가 발생했습니다');
  };

  socket.on('error', handleError);
  socket.on('connect_error', handleError);

  return () => {
    socket.off('error', handleError);
    socket.off('connect_error', handleError);
  };
}, [socket]);
```

---

## 2. 성능 최적화

### 2.1 메시지 가상화

**✅ React Window 사용**:
```javascript
import { FixedSizeList } from 'react-window';

export default function MessageList({ messages }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <MessageBubble message={messages[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={messages.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 2.2 메모이제이션

**✅ useMemo, useCallback 활용**:
```javascript
const sortedMessages = useMemo(() => {
  return messages.sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );
}, [messages]);

const handleSend = useCallback(async (content) => {
  // 전송 로직
}, [studyId, socket]);
```

---

## 3. 보안 고려사항

### 3.1 XSS 방지

**✅ 메시지 sanitize**:
```javascript
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(message.content);
```

---

## 4. 테스트 전략

### 4.1 단위 테스트

**✅ 메시지 전송 테스트**:
```javascript
describe('Chat', () => {
  it('should send message', async () => {
    const { result } = renderHook(() => useSocket());
    
    await act(async () => {
      await result.current.sendMessage('test');
    });

    expect(result.current.messages).toContainEqual(
      expect.objectContaining({ content: 'test' })
    );
  });
});
```

---

## 5. 모니터링

### 5.1 로그 수집

**✅ 구조화된 로깅**:
```javascript
const log = {
  info: (message, data) => {
    console.log('[Chat]', message, {
      timestamp: new Date().toISOString(),
      ...data
    });
  },
  error: (message, error) => {
    console.error('[Chat Error]', message, {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    });
  }
};

// 사용
log.info('Message sent', { messageId: 'xxx', userId: 'yyy' });
log.error('Send failed', error);
```

---

**마지막 업데이트**: 2025-11-29

