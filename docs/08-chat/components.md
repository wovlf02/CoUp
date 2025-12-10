# 채팅 컴포넌트 가이드

## 개요

채팅 도메인의 UI 컴포넌트에 대한 상세 문서입니다.

---

## 페이지 레이아웃

### 채팅 페이지 전체 레이아웃

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ← 내 스터디 목록                                                           │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  💻 알고리즘 스터디           👥 12명  |  🟢 연결됨  |  👑 OWNER     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ [개요] [채팅■] [공지] [파일] [일정] [할일] [화상] [멤버] [설정]      │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  💬 채팅                                     🟢 연결됨  👥 12명 참여  │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  ┌─────────────────────────────────────────────────────────────┐     │ │
│  │  │  🅰 홍길동  10:30 AM                                        │     │ │
│  │  │                                                              │     │ │
│  │  │  안녕하세요! 오늘 스터디 준비 다들 했나요?                   │     │ │
│  │  │                                                              │     │ │
│  │  └─────────────────────────────────────────────────────────────┘     │ │
│  │                                                                       │ │
│  │                    ┌─────────────────────────────────────────────┐   │ │
│  │                    │                          10:32 AM  나 🅱    │   │ │
│  │                    │                                              │   │ │
│  │                    │                네! 다 풀었습니다 👍          │   │ │
│  │                    │                                              │   │ │
│  │                    └─────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  │  ┌─────────────────────────────────────────────────────────────┐     │ │
│  │  │  🅰 홍길동  10:35 AM                                        │     │ │
│  │  │                                                              │     │ │
│  │  │  📎 알고리즘_자료.pdf (1.2 MB)                    [다운로드] │     │ │
│  │  │                                                              │     │ │
│  │  └─────────────────────────────────────────────────────────────┘     │ │
│  │                                                                       │ │
│  │  홍길동님이 입력 중...                                               │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  📎 자료.pdf (1.2MB)                                       [✕ 취소]  │ │
│  │  (파일 선택 시 표시)                                                  │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  [📎]  [메시지 입력...                                   ]  [전송]   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 메시지 카드 상세 구조

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  ┌──────┐  홍길동  10:30 AM                          (읽지않음: 3)   │ │
│  │  │ 🅰  │                                                             │ │
│  │  └──────┘  메시지 내용입니다. 여러 줄로 표시될 수 있습니다.          │ │
│  │  (아바타)                                                            │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  내 메시지 (오른쪽 정렬, 다른 배경색)                                 │ │
│  │                                                                       │ │
│  │                                                10:32 AM  나 🅱 ┌──────┐│ │
│  │                                                             │ 🅱  ││ │
│  │                                             네! 완료했습니다 └──────┘│ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  파일 첨부 메시지                                                     │ │
│  │                                                                       │ │
│  │  ┌──────┐  홍길동  10:35 AM                                          │ │
│  │  │ 🅰  │                                                             │ │
│  │  └──────┘  ┌─────────────────────────────────────────────────────┐   │ │
│  │            │  📄 알고리즘_자료.pdf                                │   │ │
│  │            │  1.2 MB                          [📥 다운로드]       │   │ │
│  │            └─────────────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 컨텍스트 메뉴 (우클릭)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  내 메시지에서 우클릭 시:                                                   │
│                                                                             │
│                              ┌───────────────┐                              │
│                              │ ✏️ 수정       │                              │
│                              │ 🗑️ 삭제       │                              │
│                              └───────────────┘                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 페이지 컴포넌트

### MyStudyChatPage

**경로:** `/my-studies/[studyId]/chat`

**파일 위치:** `src/app/my-studies/[studyId]/chat/page.jsx`

#### 상태 관리

```javascript
const messagesEndRef = useRef(null)
const fileInputRef = useRef(null)
const [content, setContent] = useState('')
const [typingUsers, setTypingUsers] = useState([])
const [selectedFile, setSelectedFile] = useState(null)
const [isUploading, setIsUploading] = useState(false)
const [contextMenu, setContextMenu] = useState(null)
const [editingMessage, setEditingMessage] = useState(null)
const [realtimeMessages, setRealtimeMessages] = useState([])
```

#### API Hooks

```javascript
const { data: session } = useSession()
const currentUser = session?.user

const { socket, isConnected } = useSocket()

const { data: studyData, isLoading: studyLoading } = useStudy(studyId)
const { data: membersData } = useStudyMembers(studyId)
const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useMessages(studyId)
const sendMessageMutation = useSendMessage()
const deleteMessageMutation = useDeleteMessage()
```

#### 메시지 병합 로직

API에서 받은 메시지와 실시간 메시지를 병합합니다:

```javascript
// API 메시지의 user를 sender로 통일
const apiMessages = (messagesData?.data || []).map(msg => ({
  ...msg,
  sender: msg.user || msg.sender,
  senderId: msg.userId || msg.senderId
}))

// 중복 제거: apiMessages에 없는 realtimeMessages만 추가
const apiMessageIds = new Set(apiMessages.map(m => m.id))
const uniqueRealtimeMessages = realtimeMessages.filter(
  m => !apiMessageIds.has(m.id) && !m.id?.startsWith('temp-')
)
const allMessages = [...apiMessages, ...uniqueRealtimeMessages]
```

#### Socket.IO 채팅방 입장

```javascript
useEffect(() => {
  if (!socket || !studyId || !currentUser) return

  console.log('[Chat] Joining study room:', studyId)
  socket.emit('study:join', { studyId })

  return () => {
    console.log('[Chat] Leaving study room:', studyId)
    socket.emit('study:leave', { studyId })
  }
}, [socket, studyId, currentUser])
```

#### 실시간 메시지 수신

```javascript
useEffect(() => {
  if (!socket || !currentUser) return

  const handleNewMessage = (message) => {
    // 자신이 보낸 메시지는 무시 (낙관적 업데이트로 이미 표시)
    const messageSenderId = message.senderId || message.userId || message.sender?.id
    if (messageSenderId === currentUser.id) return

    // 실시간 메시지에 추가
    setRealtimeMessages(prev => [...prev, {
      ...message,
      sender: message.sender || message.user || { id: message.senderId, name: '알 수 없음' },
      senderId: message.senderId || message.userId,
      isMine: false,
      createdAt: message.createdAt || new Date().toISOString()
    }])
  }

  const handleTyping = ({ userId, userName }) => {
    if (userId === currentUser.id) return
    setTypingUsers(prev => {
      if (!prev.includes(userName)) return [...prev, userName]
      return prev
    })

    // 3초 후 타이핑 표시 제거
    setTimeout(() => {
      setTypingUsers(prev => prev.filter(name => name !== userName))
    }, 3000)
  }

  socket.on('study:message', handleNewMessage)
  socket.on('study:typing', handleTyping)

  return () => {
    socket.off('study:message', handleNewMessage)
    socket.off('study:typing', handleTyping)
  }
}, [socket, currentUser])
```

#### 메시지 전송 (낙관적 업데이트)

```javascript
const handleSend = async (e) => {
  e.preventDefault()
  if (!content.trim() || !socket || !currentUser) return

  // 임시 ID로 낙관적 업데이트
  const tempId = `temp-${Date.now()}`
  const optimisticMessage = {
    id: tempId,
    content: content.trim(),
    senderId: currentUser.id,
    sender: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar },
    isMine: true,
    createdAt: new Date().toISOString(),
    studyId
  }

  setRealtimeMessages(prev => [...prev, optimisticMessage])
  setContent('')

  try {
    // API로 저장
    const result = await sendMessageMutation.mutateAsync({
      studyId,
      data: { content: content.trim() }
    })

    // Socket.IO로 브로드캐스트
    socket.emit('study:message', {
      studyId,
      message: { ...result.data, sender: result.data.user || currentUser }
    })

    // 임시 메시지 제거
    setRealtimeMessages(prev => prev.filter(m => m.id !== tempId))
  } catch (error) {
    // 실패 시 임시 메시지 제거
    setRealtimeMessages(prev => prev.filter(m => m.id !== tempId))
    alert('메시지 전송 실패: ' + error.message)
  }
}
```

#### 타이핑 이벤트 전송

```javascript
const handleSendTyping = () => {
  if (socket && currentUser) {
    socket.emit('study:typing', {
      studyId,
      userId: currentUser.id,
      userName: currentUser.name
    })
  }
}
```

---

## 파일 첨부 기능

### 파일 선택

```javascript
const handleFileSelect = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  // 파일 크기 제한 (50MB)
  if (file.size > 50 * 1024 * 1024) {
    alert('파일 크기는 50MB를 초과할 수 없습니다.')
    return
  }

  setSelectedFile(file)
}
```

### 파일 전송

```javascript
const handleSendFile = async () => {
  if (!selectedFile || !socket) return

  setIsUploading(true)

  try {
    // 1. 파일 업로드
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('category', getFileCategory(selectedFile.type))

    const uploadResult = await api.post(`/api/studies/${studyId}/files`, formData, {
      headers: {}
    })

    // 2. 채팅 메시지 생성
    const messageResult = await api.post(`/api/studies/${studyId}/chat`, {
      content: `📎 ${selectedFile.name}`,
      fileId: uploadResult.data.id
    })

    // 3. Socket.IO로 전송
    socket.emit('study:message', {
      studyId,
      message: { ...messageResult.data, sender: currentUser }
    })

    // 4. 로컬 메시지 추가
    setRealtimeMessages(prev => [...prev, {
      ...messageResult.data,
      sender: currentUser,
      isMine: true
    }])

    // 초기화
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  } catch (error) {
    alert(`파일 전송에 실패했습니다: ${error.message}`)
  } finally {
    setIsUploading(false)
  }
}
```

### 파일 카테고리 자동 분류

```javascript
const getFileCategory = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'IMAGE'
  if (mimeType.startsWith('video/')) return 'VIDEO'
  if (mimeType.startsWith('audio/')) return 'AUDIO'
  if (['application/zip', 'application/x-rar-compressed', ...].includes(mimeType)) return 'ARCHIVE'
  if (['text/javascript', 'text/css', ...].includes(mimeType)) return 'CODE'
  return 'DOCUMENT'
}
```

### 파일 크기 포맷팅

```javascript
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
```

---

## 컨텍스트 메뉴

### 컨텍스트 메뉴 상태

```javascript
const [contextMenu, setContextMenu] = useState(null)
// { x: number, y: number, message: Message } | null
```

### 컨텍스트 메뉴 열기

```javascript
const handleContextMenu = (e, message) => {
  e.preventDefault()

  // 내 메시지만 컨텍스트 메뉴 표시
  if (message.sender?.id !== currentUser?.id) return

  setContextMenu({
    x: e.clientX,
    y: e.clientY,
    message
  })
}
```

### 외부 클릭 시 닫기

```javascript
useEffect(() => {
  if (!contextMenu) return

  const handleClick = () => setContextMenu(null)
  document.addEventListener('click', handleClick)
  return () => document.removeEventListener('click', handleClick)
}, [contextMenu])
```

---

## 메시지 수정/삭제

### 메시지 수정

```javascript
const [editingMessage, setEditingMessage] = useState(null)

const handleEditMessage = () => {
  if (!contextMenu) return
  setEditingMessage(contextMenu.message)
  setContent(contextMenu.message.content)
  setContextMenu(null)
}

const handleCancelEdit = () => {
  setEditingMessage(null)
  setContent('')
}

const handleUpdateMessage = async (e) => {
  e.preventDefault()
  if (!content.trim() || !editingMessage) return

  try {
    await api.patch(`/api/studies/${studyId}/chat/${editingMessage.id}`, {
      content: content.trim()
    })
    
    // 메시지 목록 새로고침
    refetchMessages()
    handleCancelEdit()
  } catch (error) {
    alert('메시지 수정 실패: ' + error.message)
  }
}
```

### 메시지 삭제

```javascript
const handleDeleteMessage = async (messageId) => {
  if (!confirm('메시지를 삭제하시겠습니까?')) return

  try {
    await deleteMessageMutation.mutateAsync({ studyId, messageId })
  } catch (error) {
    alert('메시지 삭제 실패: ' + error.message)
  }
}
```

---

## 유틸리티 함수

### 시간 포맷팅

```javascript
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
}
```

### 읽지 않은 사람 수 계산

```javascript
const getUnreadCount = (message) => {
  if (!message.readers || !totalMemberCount) return 0
  const readCount = message.readers.length
  const unreadCount = totalMemberCount - readCount
  return unreadCount > 0 ? unreadCount : 0
}
```

### 자동 스크롤

```javascript
const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}

useEffect(() => {
  scrollToBottom()
}, [allMessages])
```

---

## 스타일 패턴

### 메시지 정렬

```css
/* 내 메시지 - 오른쪽 정렬 */
.message.mine {
  flex-direction: row-reverse;
  text-align: right;
}

/* 상대방 메시지 - 왼쪽 정렬 */
.message.other {
  flex-direction: row;
  text-align: left;
}
```

### 메시지 버블

```css
.messageBubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 18px;
  word-break: break-word;
}

.messageBubble.mine {
  background-color: #3b82f6;
  color: white;
  border-bottom-right-radius: 4px;
}

.messageBubble.other {
  background-color: #f3f4f6;
  color: #1f2937;
  border-bottom-left-radius: 4px;
}
```

### 타이핑 표시

```css
.typingIndicator {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
  padding: 8px 16px;
}
```

### 파일 첨부 미리보기

```css
.filePreview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #f3f4f6;
  border-radius: 8px;
  margin-bottom: 12px;
}

.filePreview .fileName {
  flex: 1;
  font-weight: 500;
}

.filePreview .fileSize {
  color: #6b7280;
  font-size: 0.875rem;
}

.filePreview .cancelButton {
  color: #ef4444;
  cursor: pointer;
}
```

### 연결 상태 배지

```css
.connectionBadge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
}

.connectionBadge.connected {
  background-color: #d1fae5;
  color: #065f46;
}

.connectionBadge.disconnected {
  background-color: #fee2e2;
  color: #991b1b;
}
```

### 컨텍스트 메뉴

```css
.contextMenu {
  position: fixed;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
  overflow: hidden;
}

.contextMenuItem {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.contextMenuItem:hover {
  background-color: #f3f4f6;
}

.contextMenuItem.delete {
  color: #ef4444;
}
```

