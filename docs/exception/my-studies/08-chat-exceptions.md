# 채팅 예외 처리

**작성일**: 2025-11-29  
**최종 업데이트**: 2025-11-29  
**대상 파일**:
- `src/app/my-studies/[studyId]/chat/page.jsx`
- `src/components/study/RealtimeChat.js`
- `src/app/api/studies/[id]/chat/route.js`

---

## 📚 목차

1. [개요](#개요)
2. [채팅 메시지 로딩 예외](#채팅-메시지-로딩-예외)
3. [메시지 전송 예외](#메시지-전송-예외)
4. [실시간 동기화 예외](#실시간-동기화-예외)
5. [스크롤 관리 예외](#스크롤-관리-예외)
6. [파일 첨부 예외](#파일-첨부-예외)
7. [성능 최적화](#성능-최적화)

---

## 개요

### 기능 설명

**채팅(Chat)**은 스터디 멤버 간 **실시간 소통**을 위한 기능입니다. WebSocket(Pusher)을 사용하여 실시간 메시지 전송을 지원합니다.

### 주요 기능

1. **실시간 채팅**: WebSocket 기반 실시간 메시지
2. **메시지 히스토리**: 과거 메시지 조회
3. **파일 첨부**: 이미지, 문서 첨부 (선택적)
4. **읽음 표시**: 메시지 읽음 상태 (선택적)
5. **멤버 표시**: 온라인 멤버 표시
6. **무한 스크롤**: 이전 메시지 로딩

---

## 채팅 메시지 로딩 예외

### 1.1 초기 메시지 로딩

```javascript
// ✅ 좋은 예: 페이지네이션 with 무한 스크롤
import { useInfiniteQuery } from '@tanstack/react-query'

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  error
} = useInfiniteQuery({
  queryKey: ['chatMessages', studyId],
  queryFn: ({ pageParam = 1 }) =>
    api.get(`/studies/${studyId}/chat`, {
      params: { page: pageParam, limit: 50 }
    }).then(res => res.data),
  getNextPageParam: (lastPage) =>
    lastPage.pagination?.page < lastPage.pagination?.totalPages
      ? lastPage.pagination.page + 1
      : undefined,
  refetchInterval: false, // 실시간 동기화 사용하므로 불필요
  staleTime: Infinity
})

// 모든 메시지 flat
const allMessages = data?.pages.flatMap(page => page.data) || []

if (isLoading) {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner}></div>
      <p>메시지를 불러오는 중...</p>
    </div>
  )
}

if (error) {
  return (
    <div className={styles.error}>
      <h3>메시지를 불러올 수 없습니다</h3>
      <p>{error.message}</p>
    </div>
  )
}
```

---

### 1.2 빈 채팅방

```javascript
// ✅ 좋은 예: 첫 메시지 유도
{allMessages.length === 0 ? (
  <div className={styles.emptyChatRoom}>
    <div className={styles.emptyIcon}>💬</div>
    <h3>채팅방이 비어있습니다</h3>
    <p>첫 번째 메시지를 보내보세요!</p>
    <div className={styles.chatTips}>
      <h4>채팅 팁</h4>
      <ul>
        <li>실시간으로 팀원들과 소통하세요</li>
        <li>파일을 첨부할 수 있습니다</li>
        <li>메시지는 자동으로 저장됩니다</li>
      </ul>
    </div>
  </div>
) : (
  // 메시지 목록
)}
```

---

## 메시지 전송 예외

### 2.1 메시지 전송 실패

```javascript
// ✅ 좋은 예: 재전송 with 낙관적 업데이트
const [message, setMessage] = useState('')
const [isSending, setIsSending] = useState(false)
const queryClient = useQueryClient()

const sendMessage = async () => {
  if (!message.trim()) {
    alert('메시지를 입력해주세요')
    return
  }

  if (message.length > 1000) {
    alert('메시지는 1,000자를 초과할 수 없습니다')
    return
  }

  setIsSending(true)

  // 임시 메시지 ID (낙관적 업데이트)
  const tempId = `temp-${Date.now()}`
  const tempMessage = {
    id: tempId,
    content: message,
    authorId: currentUser.id,
    author: currentUser,
    createdAt: new Date().toISOString(),
    isPending: true
  }

  // UI에 즉시 표시
  queryClient.setQueryData(['chatMessages', studyId], (old) => ({
    ...old,
    pages: old.pages.map((page, idx) =>
      idx === 0
        ? { ...page, data: [tempMessage, ...page.data] }
        : page
    )
  }))

  // 메시지 입력 초기화
  const sentMessage = message
  setMessage('')

  try {
    // API 전송
    const response = await api.post(`/studies/${studyId}/chat`, {
      content: sentMessage
    })

    // 임시 메시지를 실제 메시지로 교체
    queryClient.setQueryData(['chatMessages', studyId], (old) => ({
      ...old,
      pages: old.pages.map((page, idx) =>
        idx === 0
          ? {
              ...page,
              data: page.data.map(msg =>
                msg.id === tempId ? response.data.data : msg
              )
            }
          : page
      )
    }))

  } catch (error) {
    console.error('Send message failed:', error)

    // 임시 메시지에 에러 표시
    queryClient.setQueryData(['chatMessages', studyId], (old) => ({
      ...old,
      pages: old.pages.map((page, idx) =>
        idx === 0
          ? {
              ...page,
              data: page.data.map(msg =>
                msg.id === tempId
                  ? { ...msg, isFailed: true, error: error.message }
                  : msg
              )
            }
          : page
      )
    }))

    alert('메시지 전송에 실패했습니다')

  } finally {
    setIsSending(false)
  }
}

// 재전송
const handleRetry = async (tempMessage) => {
  // 실패한 메시지 제거
  queryClient.setQueryData(['chatMessages', studyId], (old) => ({
    ...old,
    pages: old.pages.map((page, idx) =>
      idx === 0
        ? { ...page, data: page.data.filter(msg => msg.id !== tempMessage.id) }
        : page
    )
  }))

  // 다시 전송
  setMessage(tempMessage.content)
  await sendMessage()
}
```

---

### 2.2 메시지 입력 UI

```javascript
// ✅ 좋은 예: 엔터키 전송 + Shift+엔터 줄바꿈
const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

<div className={styles.messageInput}>
  <textarea
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    onKeyDown={handleKeyDown}
    placeholder="메시지를 입력하세요... (Shift+Enter: 줄바꿈)"
    className={styles.textarea}
    rows={3}
    maxLength={1000}
    disabled={isSending}
  />
  <div className={styles.inputActions}>
    <span className={styles.charCount}>
      {message.length}/1000
    </span>
    <button
      onClick={sendMessage}
      disabled={isSending || !message.trim()}
      className={styles.sendButton}
    >
      {isSending ? '전송 중...' : '전송'}
    </button>
  </div>
</div>
```

---

## 실시간 동기화 예외

### 3.1 Pusher 연결

```javascript
// ✅ 좋은 예: Pusher 설정 with 에러 처리
import Pusher from 'pusher-js'

useEffect(() => {
  if (!studyId || !currentUser) return

  // Pusher 초기화
  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    encrypted: true,
    authEndpoint: '/api/pusher/auth',
    auth: {
      headers: {
        'Authorization': `Bearer ${session?.accessToken}`
      }
    }
  })

  // 연결 상태 모니터링
  pusher.connection.bind('connected', () => {
    console.log('[Pusher] Connected')
    setConnectionStatus('connected')
  })

  pusher.connection.bind('disconnected', () => {
    console.log('[Pusher] Disconnected')
    setConnectionStatus('disconnected')
  })

  pusher.connection.bind('error', (err) => {
    console.error('[Pusher] Error:', err)
    setConnectionStatus('error')
  })

  // 채널 구독
  const channel = pusher.subscribe(`study-${studyId}`)

  channel.bind('pusher:subscription_succeeded', () => {
    console.log('[Pusher] Subscribed to study channel')
  })

  channel.bind('pusher:subscription_error', (err) => {
    console.error('[Pusher] Subscription error:', err)
    alert('실시간 채팅 연결에 실패했습니다')
  })

  // 새 메시지 수신
  channel.bind('new-message', (data) => {
    console.log('[Pusher] New message:', data)

    // React Query 캐시에 추가
    queryClient.setQueryData(['chatMessages', studyId], (old) => {
      if (!old) return old

      // 이미 있는 메시지인지 확인 (중복 방지)
      const exists = old.pages.some(page =>
        page.data.some(msg => msg.id === data.id)
      )

      if (exists) return old

      return {
        ...old,
        pages: old.pages.map((page, idx) =>
          idx === 0
            ? { ...page, data: [data, ...page.data] }
            : page
        )
      }
    })

    // 알림음 (선택적)
    if (data.authorId !== currentUser.id) {
      playNotificationSound()
    }
  })

  return () => {
    channel.unbind_all()
    channel.unsubscribe()
    pusher.disconnect()
  }
}, [studyId, currentUser, session])
```

---

### 3.2 연결 상태 UI

```javascript
// ✅ 좋은 예: 연결 상태 표시
<div className={styles.chatHeader}>
  <h2>💬 채팅</h2>
  <div className={styles.connectionStatus}>
    {connectionStatus === 'connected' && (
      <span className={styles.connected}>
        <span className={styles.dot}></span>
        실시간 연결됨
      </span>
    )}
    {connectionStatus === 'disconnected' && (
      <span className={styles.disconnected}>
        <span className={styles.dot}></span>
        연결 끊김
      </span>
    )}
    {connectionStatus === 'error' && (
      <span className={styles.error}>
        <span className={styles.dot}></span>
        연결 오류
      </span>
    )}
  </div>
</div>
```

---

## 스크롤 관리 예외

### 4.1 자동 스크롤

```javascript
// ✅ 좋은 예: 새 메시지 시 자동 스크롤
const messagesEndRef = useRef(null)
const chatContainerRef = useRef(null)
const [isUserScrolling, setIsUserScrolling] = useState(false)

// 새 메시지 추가 시
useEffect(() => {
  // 사용자가 스크롤 중이 아니면 자동 스크롤
  if (!isUserScrolling) {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
}, [allMessages, isUserScrolling])

// 스크롤 감지
const handleScroll = () => {
  const container = chatContainerRef.current
  if (!container) return

  // 스크롤이 맨 아래에 가까운지 확인 (50px 여유)
  const isAtBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight < 50

  setIsUserScrolling(!isAtBottom)
}

// 맨 아래로 버튼
{isUserScrolling && (
  <button
    onClick={() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setIsUserScrolling(false)
    }}
    className={styles.scrollToBottomButton}
  >
    ↓ 최신 메시지
  </button>
)}

<div 
  ref={chatContainerRef}
  onScroll={handleScroll}
  className={styles.messagesContainer}
>
  {allMessages.map(msg => (
    <MessageItem key={msg.id} message={msg} />
  ))}
  <div ref={messagesEndRef} />
</div>
```

---

### 4.2 무한 스크롤 (이전 메시지)

```javascript
// ✅ 좋은 예: 상단 스크롤 시 이전 메시지 로딩
const handleScroll = () => {
  const container = chatContainerRef.current
  if (!container) return

  // 상단 근처에서 이전 메시지 로딩
  if (container.scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
    // 현재 스크롤 위치 저장
    const previousScrollHeight = container.scrollHeight

    fetchNextPage().then(() => {
      // 스크롤 위치 복원 (새 메시지가 위에 추가되므로)
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight - previousScrollHeight
      })
    })
  }

  // 맨 아래 확인 (자동 스크롤 여부)
  const isAtBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight < 50
  setIsUserScrolling(!isAtBottom)
}

// 로딩 인디케이터
{isFetchingNextPage && (
  <div className={styles.loadingMore}>
    <div className={styles.spinner}></div>
    <span>이전 메시지 불러오는 중...</span>
  </div>
)}
```

---

## 파일 첨부 예외

### 5.1 파일 첨부 (선택적 기능)

```javascript
// ✅ 향후 구현 시 사용
const [attachedFile, setAttachedFile] = useState(null)

const handleFileAttach = (e) => {
  const file = e.target.files[0]
  
  if (!file) return

  // 크기 제한 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('파일 크기는 10MB를 초과할 수 없습니다')
    return
  }

  // 형식 제한
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    alert('지원하지 않는 파일 형식입니다')
    return
  }

  setAttachedFile(file)
}

const sendMessageWithFile = async () => {
  if (!message.trim() && !attachedFile) {
    alert('메시지 또는 파일을 추가해주세요')
    return
  }

  const formData = new FormData()
  formData.append('content', message)
  if (attachedFile) {
    formData.append('file', attachedFile)
  }

  try {
    await api.post(`/studies/${studyId}/chat`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    setMessage('')
    setAttachedFile(null)
  } catch (error) {
    alert('메시지 전송에 실패했습니다')
  }
}
```

---

## 성능 최적화

### 6.1 가상 스크롤 (react-window)

```javascript
// ✅ 대량 메시지 처리
import { VariableSizeList as List } from 'react-window'

const MessageVirtualList = ({ messages }) => {
  const listRef = useRef()

  // 메시지 높이 계산
  const getItemSize = (index) => {
    const msg = messages[index]
    // 기본 높이 + 내용 길이 기반 추정
    return 80 + Math.floor(msg.content.length / 50) * 20
  }

  return (
    <List
      ref={listRef}
      height={600}
      itemCount={messages.length}
      itemSize={getItemSize}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <MessageItem message={messages[index]} />
        </div>
      )}
    </List>
  )
}
```

---

### 6.2 메시지 그룹화

```javascript
// ✅ 좋은 예: 같은 작성자의 연속 메시지 그룹화
const groupMessages = (messages) => {
  const groups = []
  let currentGroup = null

  messages.forEach(msg => {
    if (
      currentGroup &&
      currentGroup.authorId === msg.authorId &&
      // 5분 이내 메시지
      new Date(msg.createdAt) - new Date(currentGroup.lastMessageTime) < 5 * 60 * 1000
    ) {
      // 같은 그룹에 추가
      currentGroup.messages.push(msg)
      currentGroup.lastMessageTime = msg.createdAt
    } else {
      // 새 그룹 생성
      currentGroup = {
        authorId: msg.authorId,
        author: msg.author,
        messages: [msg],
        lastMessageTime: msg.createdAt
      }
      groups.push(currentGroup)
    }
  })

  return groups
}

// 렌더링
const messageGroups = groupMessages(allMessages)

{messageGroups.map(group => (
  <div key={group.messages[0].id} className={styles.messageGroup}>
    <div className={styles.groupHeader}>
      <img src={group.author.avatar} alt={group.author.name} />
      <span>{group.author.name}</span>
      <span className={styles.time}>
        {formatDateTimeKST(group.lastMessageTime)}
      </span>
    </div>
    <div className={styles.groupMessages}>
      {group.messages.map(msg => (
        <div key={msg.id} className={styles.message}>
          {msg.content}
        </div>
      ))}
    </div>
  </div>
))}
```

---

## 관련 문서

- [07-widgets-exceptions.md](./07-widgets-exceptions.md) - 위젯 시스템
- [02-study-detail-exceptions.md](./02-study-detail-exceptions.md) - 스터디 대시보드
- [README_VIDEO_CALL.md](../../../README_VIDEO_CALL.md) - 화상 통화

---

**다음 문서**: [99-best-practices.md](./99-best-practices.md)  
**이전 문서**: [07-widgets-exceptions.md](./07-widgets-exceptions.md)

