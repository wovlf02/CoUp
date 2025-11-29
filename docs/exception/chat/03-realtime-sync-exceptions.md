# 채팅 실시간 동기화 예외 처리
**마지막 업데이트**: 2025-11-29

---

- [모범 사례](./99-best-practices.md)
- [메시지 예외 처리](./02-message-exceptions.md)
- [연결 예외 처리](./01-connection-exceptions.md)

## 📚 관련 문서

---

```
}, [messageQueue, isSending]);
  sendNext();

  };
    }
      setIsSending(false);
    } finally {
      console.error('Send failed:', error);
    } catch (error) {
      setMessageQueue(prev => prev.slice(1));

      });
        content: message.content
        studyId,
      await sendMessageMutation.mutateAsync({
    try {

    const message = messageQueue[0];
    setIsSending(true);
  const sendNext = async () => {

  if (messageQueue.length === 0 || isSending) return;
useEffect(() => {

};
  }]);
    timestamp: Date.now()
    content,
    id: `temp-${Date.now()}`,
  setMessageQueue(prev => [...prev, {
const addToQueue = (content) => {

const [isSending, setIsSending] = useState(false);
const [messageQueue, setMessageQueue] = useState([]);
```javascript
**✅ 메시지 큐 사용**:

### 5.1 동시 전송 처리

## 5. 동시성 문제

---

```
}, [socket, allMessages, studyId]);
  });
    }
      }
        toast.info(`${response.data.length}개의 새 메시지를 불러왔습니다`);
        setRealtimeMessages(prev => [...prev, ...response.data]);
      if (response.data?.length > 0) {

      });
        params: { after: lastMessageTime }
      const response = await api.get(`/api/studies/${studyId}/chat`, {
    if (lastMessageTime) {

    const lastMessageTime = lastMessage?.createdAt;
    const lastMessage = allMessages[allMessages.length - 1];
    // 마지막 메시지 이후의 메시지만 가져오기

    console.log('[Chat] Reconnected, syncing messages');
  socket.on('reconnect', async () => {

  if (!socket) return;
useEffect(() => {
```javascript
**✅ 재연결 시 메시지 동기화**:

#### 해결 방법

### 4.1 오프라인 시 메시지 누락

## 4. 이벤트 손실

---

```
};
  }
    );
      prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m)
    setRealtimeMessages(prev =>
    // 실패 처리
  } catch (error) {

    setRealtimeMessages(prev => prev.filter(m => m.id !== tempId));
    // ✅ 임시 메시지 제거, 실제 메시지는 Socket으로 수신

    const response = await api.post(`/api/studies/${studyId}/chat`, { content });
  try {

  }]);
    createdAt: new Date().toISOString()
    sender: currentUser,
    senderId: currentUser.id,
    content,
    id: tempId,
  setRealtimeMessages(prev => [...prev, {
  // 임시 메시지 추가
  
  const tempId = `temp-${Date.now()}`;
const handleSend = async (content) => {
```javascript
**✅ 임시 메시지 교체**:

### 3.1 전송 완료 후 임시 메시지 제거

## 3. 임시 메시지 정리

---

```
};
  }
    toast.error('메시지 전송에 실패했습니다');

    );
      )
        : m
        ? { ...m, status: 'failed', error: error.message }
      prev.map(m => m.id === tempId 
    setRealtimeMessages(prev =>
    // ✅ 실패: 상태 변경 (삭제하지 않고 failed 표시)

    console.error('Send failed:', error);
  } catch (error) {

    socket.emit('study:message', { ...response.data, studyId });

    );
      prev.map(m => m.id === tempId ? response.data : m)
    setRealtimeMessages(prev => 
    // ✅ 성공: 임시 메시지를 실제 메시지로 교체

    });
      content: optimisticMessage.content
      studyId,
    const response = await sendMessageMutation.mutateAsync({
  try {

  setContent('');
  setRealtimeMessages(prev => [...prev, optimisticMessage]);
  // 낙관적 업데이트

  };
    status: 'sending'
    createdAt: new Date().toISOString(),
    isMine: true,
    sender: currentUser,
    senderId: currentUser.id,
    content: content.trim(),
    id: tempId,
  const optimisticMessage = {
  const tempId = `temp-${Date.now()}`;

  if (!content.trim()) return;
  e.preventDefault();
const handleSend = async (e) => {
```javascript
**✅ 전송 실패 시 롤백**:

#### 해결 방법

### 2.1 롤백 처리

## 2. 낙관적 업데이트 실패

---

```
});
  return new Date(a.createdAt) - new Date(b.createdAt);
  }
    return a.sequence - b.sequence;
  if (a.sequence && b.sequence) {
const sortedMessages = messages.sort((a, b) => {
// 정렬 시 sequence 우선 사용

}
  // ...
  createdAt DateTime @default(now())
  content   String
  sequence  Int      @default(autoincrement())
  id        String   @id @default(cuid())
model Message {
// Prisma Schema에 순서 필드 추가
```javascript
**✅ 시퀀스 번호 사용**:

### 1.2 순서 보장 메커니즘

```
}, [apiMessages, realtimeMessages]);
  });
    return timeA - timeB;
    const timeB = new Date(b.createdAt).getTime();
    const timeA = new Date(a.createdAt).getTime();
  return uniqueMessages.sort((a, b) => {
  // ✅ 서버 타임스탬프로 정렬

  }, []);
    return acc;
    }
      acc.push(msg);
    if (!acc.some(m => m.id === msg.id)) {
  const uniqueMessages = combined.reduce((acc, msg) => {
  // 중복 제거
  
  const combined = [...apiMessages, ...realtimeMessages];
const allMessages = useMemo(() => {
// src/app/my-studies/[studyId]/chat/page.jsx
```javascript
**✅ 서버 타임스탬프 사용**:

#### 해결 방법

- 정렬 로직 오류
- 클라이언트 시간과 서버 시간 불일치
#### 원인

- 나중에 보낸 메시지가 위에 표시됨
- 메시지 순서가 뒤바뀜
#### 증상

### 1.1 타임스탬프 기반 정렬

## 1. 메시지 순서 문제

---

5. [동시성 문제](#5-동시성-문제)
4. [이벤트 손실](#4-이벤트-손실)
3. [임시 메시지 정리](#3-임시-메시지-정리)
2. [낙관적 업데이트 실패](#2-낙관적-업데이트-실패)
1. [메시지 순서 문제](#1-메시지-순서-문제)

## 📋 목차

---

**우선순위**: 🔥 높음
**카테고리**: 실시간 동기화  
**작성일**: 2025-11-29  
**문서 ID**: CHAT-03  


