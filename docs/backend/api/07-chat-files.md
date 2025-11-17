# 채팅 & 파일 API 명세

## 📋 개요
- 채팅: 4개 API
- 파일: 4개 API

---

## 🎥 화상회의 API (WebSocket)

### WebRTC + Socket.IO 신호 처리

#### 서버 이벤트
```javascript
// 화상회의 시작 알림
socket.on('video:started', ({ roomId, startedBy }) => {
  // "김민준님이 화상회의를 시작했습니다"
})

// 참여자 목록
socket.on('video:participants', ({ participants }) => {
  // [{socketId, userId, name, avatar}, ...]
})

// 사용자 참여
socket.on('video:user-joined', ({ userId, user }) => {
  // WebRTC Peer Connection 생성
})

// 사용자 퇴장
socket.on('video:user-left', ({ userId }) => {
  // Peer Connection 종료
})

// WebRTC 신호
socket.on('video:signal', ({ from, signal }) => {
  // Offer/Answer/ICE Candidate 처리
})
```

#### 클라이언트 이벤트
```javascript
// 화상회의 시작
socket.emit('video:start', {
  studyId: 'study-1',
  roomId: 'room-123'
})

// 화상회의 참여
socket.emit('video:join', {
  roomId: 'room-123'
})

// WebRTC 신호 전송 (Offer/Answer/ICE)
socket.emit('video:signal', {
  to: 'socketId',
  signal: { type: 'offer', sdp: '...' }
})

// 화상회의 나가기
socket.emit('video:leave', {
  roomId: 'room-123'
})
```

### React Hook 사용
```javascript
import { useVideoCall } from '@/lib/hooks/useSocket'

function VideoCallRoom({ roomId, studyId }) {
  const { 
    participants, 
    inCall, 
    startCall, 
    joinCall, 
    leaveCall,
    sendSignal 
  } = useVideoCall(roomId)

  // WebRTC Peer Connection 설정
  const createPeerConnection = (userId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    })

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(userId, {
          type: 'ice-candidate',
          candidate: event.candidate
        })
      }
    }

    return pc
  }

  return (
    <div>
      <button onClick={() => startCall(studyId)}>화상회의 시작</button>
      <button onClick={joinCall}>참여</button>
      <button onClick={leaveCall}>나가기</button>
      
      <div>
        {참여자: participants.length}명
        {participants.map(p => (
          <VideoStream key={p.userId} userId={p.userId} />
        ))}
      </div>
    </div>
  )
}
```

### WebRTC 통합 예시
```javascript
import SimplePeer from 'simple-peer'

function useWebRTC(roomId) {
  const { socket } = useSocket()
  const peersRef = useRef({})
  const [streams, setStreams] = useState([])

  useEffect(() => {
    if (!socket) return

    // 내 비디오 스트림 가져오기
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setStreams(prev => [...prev, { userId: 'me', stream }])

        // 새 참여자 처리
        socket.on('video:user-joined', ({ userId }) => {
          const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream
          })

          peer.on('signal', signal => {
            socket.emit('video:signal', { to: userId, signal })
          })

          peer.on('stream', remoteStream => {
            setStreams(prev => [...prev, { userId, stream: remoteStream }])
          })

          peersRef.current[userId] = peer
        })

        // 신호 수신
        socket.on('video:signal', ({ from, signal }) => {
          if (peersRef.current[from]) {
            peersRef.current[from].signal(signal)
          } else {
            const peer = new SimplePeer({
              initiator: false,
              trickle: false,
              stream
            })

            peer.on('signal', signal => {
              socket.emit('video:signal', { to: from, signal })
            })

            peer.on('stream', remoteStream => {
              setStreams(prev => [...prev, { userId: from, stream: remoteStream }])
            })

            peer.signal(signal)
            peersRef.current[from] = peer
          }
        })
      })

    return () => {
      Object.values(peersRef.current).forEach(peer => peer.destroy())
    }
  }, [socket, roomId])

  return { streams }
}
```

---

## 📡 온라인 상태 추적

### 서버 이벤트
```javascript
// 사용자 온라인
socket.on('user:online', ({ userId, user, timestamp }) => {
  // 초록색 배지 표시
})

// 사용자 오프라인
socket.on('user:offline', ({ userId, timestamp }) => {
  // 회색 배지 표시
})

// 스터디 온라인 사용자 목록
socket.on('study:online-users', ({ studyId, users }) => {
  // 온라인: 5명
})
```

### UI 표시
```jsx
function OnlineStatus({ userId, onlineUsers }) {
  const isOnline = onlineUsers.some(u => u.userId === userId)
  
  return (
    <span className={isOnline ? 'online' : 'offline'}>
      {isOnline ? '🟢' : '⚫'}
    </span>
  )
}

function OnlineUsersList({ studyId }) {
  const { onlineUsers } = useStudyRoom(studyId)
  
  return (
    <div>
      <h3>온라인: {onlineUsers.length}명</h3>
      {onlineUsers.map(user => (
        <div key={user.userId}>
          🟢 {user.name}
        </div>
      ))}
    </div>
  )
}
```

---

## ⚡ 성능 최적화

### Redis Adapter (멀티 서버)
```bash
# .env.local
REDIS_URL="redis://localhost:6379"
```

- 여러 서버 인스턴스 간 메시지 동기화
- Horizontal Pod Autoscaling (HPA) 지원
- 로드 밸런싱 환경에서 안정적 작동

### 연결 풀 관리
```javascript
// 동시 접속자 제한
const MAX_CONNECTIONS_PER_SERVER = 10000

// 연결 타임아웃
const CONNECTION_TIMEOUT = 60000 // 60초

// Heartbeat (연결 유지)
const PING_INTERVAL = 25000 // 25초
const PING_TIMEOUT = 5000 // 5초
```

### 메모리 관리
```javascript
// 메시지 버퍼 크기
const MESSAGE_BUFFER_SIZE = 50

// 오래된 메시지 자동 삭제
const MESSAGE_RETENTION = 24 * 60 * 60 * 1000 // 24시간

// 타이핑 이벤트 Debounce
const TYPING_DEBOUNCE = 1000 // 1초
```

---

## 💬 채팅 API (4개)

### 1. GET `/api/studies/[studyId]/chat` - 메시지 목록
**권한**: MEMBER+  
**Query**: `?cursor=msg-123&limit=50`

**무한 스크롤 (Cursor 기반)**:
```json
{
  "data": [
    {
      "id": "msg-1",
      "content": "안녕하세요!",
      "user": {
        "id": "user-1",
        "name": "김민준",
        "avatar": "https://..."
      },
      "file": null,
      "readers": ["user-1", "user-2"],
      "createdAt": "2025-11-18T10:00:00Z"
    }
  ],
  "hasMore": true,
  "nextCursor": "msg-100"
}
```

### 2. POST `/api/studies/[studyId]/chat` - 메시지 전송
**Body**:
```json
{
  "content": "안녕하세요!",
  "fileId": "file-1" // 선택
}
```

**알림**: 멤버들에게 CHAT 알림 (최대 10명)

### 3. POST `/api/studies/[studyId]/chat/[messageId]/read` - 읽음 처리
**자동**: `readers` 배열에 userId 추가

### 4. DELETE `/api/studies/[studyId]/chat/[messageId]` - 삭제
**권한**: 작성자 또는 ADMIN+

---

## 📁 파일 API (4개)

### 1. POST `/api/studies/[studyId]/files` - 업로드
**Content-Type**: `multipart/form-data`

**FormData**:
```javascript
const formData = new FormData()
formData.append('file', file)
formData.append('folderId', 'folder-1') // 선택
```

**제한**:
- 최대 크기: 50MB
- 저장 위치: `/public/uploads/{studyId}/`

**Response**:
```json
{
  "success": true,
  "file": {
    "id": "file-1",
    "name": "document.pdf",
    "size": 1024000,
    "type": "application/pdf",
    "url": "/uploads/study-1/1732000000-document.pdf",
    "uploader": { "name": "김민준" },
    "downloads": 0
  }
}
```

**알림**: 멤버들에게 FILE 알림

### 2. GET `/api/studies/[studyId]/files` - 목록
**Query**: `?folderId=folder-1&page=1&limit=20`

### 3. GET `/api/studies/[studyId]/files/[fileId]/download` - 다운로드
**자동**: `downloads` +1

**Response**: 파일 스트림
```
Content-Type: {fileType}
Content-Disposition: attachment; filename="{fileName}"
```

### 4. DELETE `/api/studies/[studyId]/files/[fileId]` - 삭제
**권한**: 업로더 또는 ADMIN+  
**자동**: 파일 시스템에서도 삭제

---

## 🔄 실시간 업데이트

### WebSocket (Socket.IO) ✅ 구현됨!

#### 서버 이벤트
```javascript
// 연결
socket.on('connect', () => console.log('Connected'))

// 새 메시지
socket.on('chat:new-message', (message) => {
  // 메시지 UI에 추가
})

// 메시지 읽음
socket.on('chat:message-read', ({ messageId, userId, readers }) => {
  // 읽음 상태 업데이트
})

// 타이핑 중
socket.on('chat:user-typing', ({ userId, user, isTyping }) => {
  // "김민준님이 입력 중..." 표시
})

// 온라인 사용자
socket.on('user:online', ({ userId, user }) => {
  // 온라인 배지 표시
})

socket.on('user:offline', ({ userId }) => {
  // 오프라인 배지 표시
})
```

#### 클라이언트 이벤트
```javascript
// 메시지 전송
socket.emit('chat:message', {
  studyId: 'study-1',
  content: '안녕하세요!',
  fileId: null
})

// 읽음 처리
socket.emit('chat:read', {
  messageId: 'msg-1'
})

// 타이핑 알림
socket.emit('chat:typing', {
  studyId: 'study-1',
  isTyping: true
})

// 스터디 참여
socket.emit('study:join', 'study-1')
```

### React Hook 사용
```javascript
import { useChat, useStudyRoom } from '@/lib/hooks/useSocket'

function ChatRoom({ studyId }) {
  const { messages, sendMessage, setTyping, typingUsers } = useChat(studyId)
  const { onlineUsers } = useStudyRoom(studyId)

  return (
    <div>
      {/* 온라인 사용자: {onlineUsers.length}명 */}
      {/* 타이핑 중: {typingUsers.map(u => u.name).join(', ')} */}
      {/* 메시지 목록 */}
    </div>
  )
}
```

### 폴링 (Fallback)
```javascript
// WebSocket 연결 실패 시 폴링 사용
useQuery({
  queryKey: ['chat', studyId],
  queryFn: () => fetchChat(studyId),
  refetchInterval: 5000,
  enabled: !isSocketConnected
})
```

---

## 📊 파일 타입 아이콘

```javascript
const fileIcons = {
  'application/pdf': '📄',
  'image/*': '🖼️',
  'video/*': '🎥',
  'application/zip': '📦',
  'text/*': '📝'
}
```

---

## 🎨 UI 예시

### 무한 스크롤 채팅
```jsx
function ChatRoom({ studyId }) {
  const [cursor, setCursor] = useState(null)
  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ['chat', studyId],
    queryFn: ({ pageParam }) => fetchMessages(studyId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor
  })

  return (
    <InfiniteScroll
      loadMore={fetchNextPage}
      hasMore={data?.pages[0]?.hasMore}
    >
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
    </InfiniteScroll>
  )
}
```

### 파일 업로드
```jsx
function FileUpload({ studyId }) {
  const upload = useUploadFile(studyId)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      await upload.mutateAsync(formData)
      toast.success('업로드 완료')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return <input type="file" onChange={handleUpload} />
}
```

---

**최종 업데이트**: 2025-11-18

