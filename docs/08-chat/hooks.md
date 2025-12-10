# 채팅 Hooks

## 개요

채팅 도메인에서 사용하는 커스텀 Hooks입니다.
Socket.IO 기반 실시간 통신 훅과 React Query 기반 데이터 페칭 훅으로 구분됩니다.

---

## Hook 구조 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        채팅 Hooks                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │              Socket.IO Hook (useSocket)                          │    │
│  │              src/lib/hooks/useSocket.js                          │    │
│  │                                                                  │    │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │    │
│  │  │ 연결 관리       │ │ 이벤트          │ │ 반환값          │    │    │
│  │  │                 │ │                 │ │                 │    │    │
│  │  │ • io.connect   │ │ • connect       │ │ • socket        │    │    │
│  │  │ • reconnection │ │ • disconnect    │ │ • isConnected   │    │    │
│  │  │ • auth.userId  │ │ • connect_error │ │ • transport     │    │    │
│  │  │                 │ │                 │ │                 │    │    │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘    │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │              React Query Hooks (src/lib/hooks/useApi.js)         │    │
│  │                                                                  │    │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │    │
│  │  │ useMessages     │ │ useSendMessage  │ │ useDeleteMessage│    │    │
│  │  │   (Query)       │ │   (Mutation)    │ │   (Mutation)    │    │    │
│  │  │                 │ │                 │ │                 │    │    │
│  │  │ 메시지 목록     │ │ 메시지 전송     │ │ 메시지 삭제     │    │    │
│  │  │ 5초 자동갱신    │ │ 캐시 무효화     │ │ 캐시 무효화     │    │    │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘    │    │
│  │                                                                  │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │ useSearchChat (Query)                                    │    │    │
│  │  │                                                          │    │    │
│  │  │ 메시지 검색 (키워드 필수)                                │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## useSocket

**파일 위치:** `src/lib/hooks/useSocket.js`

Socket.IO 연결을 관리하는 싱글톤 훅입니다.

### 반환값

```javascript
{
  socket,        // Socket.IO 인스턴스
  isConnected,   // 연결 상태 (boolean)
  transport      // 전송 방식 ('websocket' | 'polling' | 'N/A')
}
```

### 구현

```javascript
'use client'

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

let socket = null  // 싱글톤 인스턴스

export function useSocket() {
  const [isConnected, setIsConnected] = useState(() => {
    return socket ? socket.connected : false
  })
  const [transport, setTransport] = useState('N/A')
  const [user, setUser] = useState(null)

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('[Socket] Error fetching user:', error)
        setUser(null)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (!user?.id) return

    // Socket.IO 초기화 (싱글톤)
    if (!socket) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'
      
      socket = io(socketUrl, {
        auth: { userId: user.id },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      })

      socket.on('connect', () => {
        setIsConnected(true)
        setTransport(socket.io.engine.transport.name)

        socket.io.engine.on('upgrade', (transport) => {
          setTransport(transport.name)
        })
      })

      socket.on('disconnect', (reason) => {
        setIsConnected(false)
      })

      socket.on('connect_error', (error) => {
        setIsConnected(false)
      })
    } else {
      // 기존 소켓 상태 동기화
      setIsConnected(socket.connected)
    }
  }, [user])

  return { socket, isConnected, transport }
}
```

### 사용법

```javascript
function ChatPage() {
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    if (!socket) return

    // 채팅방 입장
    socket.emit('study:join', { studyId })

    // 메시지 수신
    socket.on('study:message', (message) => {
      // 새 메시지 처리
    })

    return () => {
      socket.emit('study:leave', { studyId })
      socket.off('study:message')
    }
  }, [socket])

  return (
    <div>
      연결 상태: {isConnected ? '🟢 연결됨' : '🔴 연결 끊김'}
    </div>
  )
}
```

---

## useMessages (Query)

**파일 위치:** `src/lib/hooks/useApi.js`

스터디 채팅 메시지 목록을 조회합니다. 5초마다 자동 갱신됩니다.

```javascript
export function useMessages(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'messages', params],
    queryFn: () => api.get(`/api/studies/${studyId}/chat`, params),
    enabled: !!studyId,
    refetchInterval: 5000,  // 5초마다 새 메시지 확인
  })
}
```

### 사용법

```javascript
const { data: messagesData, isLoading, refetch } = useMessages(studyId)

const messages = messagesData?.data || []
```

### 응답 데이터

```javascript
{
  success: true,
  data: [
    {
      id: "clxxx",
      content: "안녕하세요!",
      userId: "clxxx",
      user: { id, name, avatar },
      file: null,
      createdAt: "2025-01-15T10:00:00Z"
    }
  ],
  hasMore: true,
  nextCursor: "clxxx"
}
```

---

## useSendMessage (Mutation)

메시지를 전송합니다.

```javascript
export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => api.post(`/api/studies/${studyId}/chat`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'chat'])
      queryClient.invalidateQueries(['studies', variables.studyId, 'messages'])
    },
  })
}
```

### 사용법

```javascript
const sendMessage = useSendMessage()

// 텍스트 메시지 전송
await sendMessage.mutateAsync({
  studyId,
  data: { content: '안녕하세요!' }
})

// 파일 첨부 메시지 전송
await sendMessage.mutateAsync({
  studyId,
  data: { 
    content: '📎 자료.pdf',
    fileId: 'clxxx'
  }
})
```

---

## useDeleteMessage (Mutation)

메시지를 삭제합니다.

```javascript
export function useDeleteMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, messageId }) => 
      api.delete(`/api/studies/${studyId}/chat/${messageId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'chat'])
      queryClient.invalidateQueries(['studies', variables.studyId, 'messages'])
    },
  })
}
```

### 사용법

```javascript
const deleteMessage = useDeleteMessage()

const handleDelete = async (messageId) => {
  if (!confirm('메시지를 삭제하시겠습니까?')) return
  
  try {
    await deleteMessage.mutateAsync({ studyId, messageId })
  } catch (error) {
    alert('삭제 실패: ' + error.message)
  }
}
```

---

## useSearchChat (Query)

메시지를 검색합니다. 검색어가 있을 때만 활성화됩니다.

```javascript
export function useSearchChat(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'chat', 'search', params],
    queryFn: () => api.get(`/api/studies/${studyId}/chat/search`, params),
    enabled: !!studyId && !!params.q,  // 검색어 필수
  })
}
```

### 사용법

```javascript
const [searchQuery, setSearchQuery] = useState('')

const { data: searchResults, isLoading } = useSearchChat(studyId, {
  q: searchQuery,
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  userId: 'clxxx'  // 특정 사용자만
})

// 검색어가 없으면 쿼리가 실행되지 않음
```

---

## 쿼리 키 체계

```
studies
└── studies
    └── [studyId]
        ├── messages              # 메시지 목록
        │   └── [params]          # cursor, limit
        ├── chat                  # 메시지 목록 (별칭)
        │   └── [params]
        └── chat
            └── search            # 메시지 검색
                └── [params]      # q, startDate, endDate, userId
```

---

## 캐시 무효화 패턴

| 작업 | 무효화 대상 |
|------|-------------|
| 메시지 전송 | `['studies', studyId, 'chat']`, `['studies', studyId, 'messages']` |
| 메시지 삭제 | `['studies', studyId, 'chat']`, `['studies', studyId, 'messages']` |
| 메시지 수정 | 수동 refetch 또는 캐시 업데이트 |

---

## 실시간 + 캐시 통합 패턴

채팅에서는 React Query 캐시와 Socket.IO 실시간 메시지를 함께 사용합니다:

```javascript
function useChatMessages(studyId) {
  const { socket } = useSocket()
  const { data: messagesData, refetch } = useMessages(studyId)
  const [realtimeMessages, setRealtimeMessages] = useState([])

  // API 메시지
  const apiMessages = messagesData?.data || []

  // 실시간 메시지 수신
  useEffect(() => {
    if (!socket) return

    socket.on('study:message', (message) => {
      // 중복 방지: API에 이미 있으면 추가하지 않음
      setRealtimeMessages(prev => {
        const exists = prev.some(m => m.id === message.id)
        if (exists) return prev
        return [...prev, message]
      })
    })

    return () => socket.off('study:message')
  }, [socket])

  // 메시지 병합 (중복 제거)
  const allMessages = useMemo(() => {
    const apiIds = new Set(apiMessages.map(m => m.id))
    const unique = realtimeMessages.filter(m => 
      !apiIds.has(m.id) && !m.id?.startsWith('temp-')
    )
    return [...apiMessages, ...unique]
  }, [apiMessages, realtimeMessages])

  // API 새로고침 시 실시간 메시지 정리
  useEffect(() => {
    setRealtimeMessages([])
  }, [apiMessages])

  return { messages: allMessages, refetch }
}
```

---

## 낙관적 업데이트 패턴

메시지 전송 시 즉시 UI에 반영하고, 실패 시 롤백합니다:

```javascript
const sendMessage = async (content) => {
  const tempId = `temp-${Date.now()}`
  
  // 1. 낙관적 업데이트
  const optimistic = {
    id: tempId,
    content,
    sender: currentUser,
    isMine: true,
    createdAt: new Date().toISOString()
  }
  setRealtimeMessages(prev => [...prev, optimistic])

  try {
    // 2. API 호출
    const result = await sendMessageMutation.mutateAsync({
      studyId,
      data: { content }
    })

    // 3. Socket.IO 브로드캐스트
    socket.emit('study:message', {
      studyId,
      message: result.data
    })

    // 4. 임시 메시지 제거 (API 응답으로 대체됨)
    setRealtimeMessages(prev => prev.filter(m => m.id !== tempId))
  } catch (error) {
    // 5. 실패 시 롤백
    setRealtimeMessages(prev => prev.filter(m => m.id !== tempId))
    throw error
  }
}
```

---

## Socket.IO 이벤트 처리 패턴

### 채팅방 생명주기

```javascript
useEffect(() => {
  if (!socket || !studyId) return

  // 입장
  socket.emit('study:join', { studyId })

  // 퇴장 (cleanup)
  return () => {
    socket.emit('study:leave', { studyId })
  }
}, [socket, studyId])
```

### 타이핑 표시

```javascript
const [typingUsers, setTypingUsers] = useState([])

useEffect(() => {
  if (!socket) return

  socket.on('study:typing', ({ userId, userName }) => {
    if (userId === currentUser.id) return

    setTypingUsers(prev => {
      if (!prev.includes(userName)) return [...prev, userName]
      return prev
    })

    // 3초 후 자동 제거
    setTimeout(() => {
      setTypingUsers(prev => prev.filter(name => name !== userName))
    }, 3000)
  })

  return () => socket.off('study:typing')
}, [socket])

// 타이핑 이벤트 전송 (디바운스 권장)
const sendTyping = useCallback(() => {
  socket?.emit('study:typing', {
    studyId,
    userId: currentUser.id,
    userName: currentUser.name
  })
}, [socket, studyId, currentUser])
```

---

## 에러 처리

### 연결 에러

```javascript
useEffect(() => {
  if (!socket) return

  socket.on('connect_error', (error) => {
    console.error('[Socket] 연결 실패:', error.message)
    // 재연결은 자동으로 시도됨 (reconnection: true)
  })

  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      // 서버에서 연결을 끊음 - 수동 재연결 필요
      socket.connect()
    }
    // 다른 이유는 자동 재연결
  })

  return () => {
    socket.off('connect_error')
    socket.off('disconnect')
  }
}, [socket])
```

### 메시지 전송 에러

```javascript
const handleSend = async () => {
  try {
    await sendMessage.mutateAsync({ studyId, data: { content } })
  } catch (error) {
    const message = error?.response?.data?.error?.message

    if (error?.response?.status === 429) {
      alert('메시지 전송이 너무 빠릅니다. 잠시 후 다시 시도해주세요.')
    } else if (message?.includes('보안')) {
      alert('보안 문제가 감지되었습니다.')
    } else {
      alert('메시지 전송에 실패했습니다.')
    }
  }
}
```

