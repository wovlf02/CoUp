# 08. 스터디 채팅 (Study Chat)

> **화면 ID**: `STUDY-02`  
> **라우트**: `/studies/[studyId]/chat`  
> **레이아웃**: 좌측 네비게이션(15%) + 우측 콘텐츠(85%)  
> **렌더링**: CSR (WebSocket 실시간)

---

## 📋 탭 콘텐츠 개요

**이 문서는 [채팅] 탭의 콘텐츠 영역만 정의합니다.**

- **공통 레이아웃** (뒤로가기 버튼, 스터디 헤더, 탭 바): `07_study-detail.md` 참조
- **이 탭의 콘텐츠**: 실시간 채팅 인터페이스

---

## 📐 [채팅] 탭 콘텐츠 영역

```
┌──────────────────────────────────────────────────────────┐
│  [채팅 메시지 영역 - 고정 높이, 내부 스크롤]              │
│  ↑ 스크롤 최상단 도달 시 이전 메시지 50개 로드            │
│                                                          │
│  👤 김철수                                   10:30 AM   │
│     오늘 문제 풀었어요?                                   │
│                                                          │
│                            네, 3문제 완료했습니다        │
│                                             10:31 AM    │
│                                                          │
│  👤 이영희                                   10:32 AM   │
│     저도 2문제 풀었어요!                                  │
│                                                          │
│  ↓ 자동 스크롤 (새 메시지 수신 시)                       │
├──────────────────────────────────────────────────────────┤
│  [📎] 메시지를 입력하세요...                       [전송] │
│  ↑ 메시지 입력 영역 - 고정 (스크롤 없음)                 │
└──────────────────────────────────────────────────────────┘
```

**레이아웃 원칙**:
- ✅ **전체 UI 스크롤 없음**: 페이지 전체가 스크롤되지 않음
- ✅ **메시지 영역만 스크롤**: 채팅 메시지 영역만 독립적으로 스크롤
- ✅ **입력창 고정**: 메시지 입력 영역은 항상 하단 고정
- ✅ **자동 높이 조절**: 탭 바 아래 전체 공간을 활용

---

## 🎨 섹션별 상세 설계

### 1. 채팅 메시지 영역
```
┌──────────────────────────────────────────────────────────┐
│  ↑ [스크롤 최상단] - 이전 메시지 50개 로드                │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 로딩 중... 이전 메시지를 불러오는 중입니다          │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ───────────── 2025년 11월 4일 ─────────────            │
│                                                          │
│  👤 김철수                                   09:15 AM   │
│     어제 공부한 내용 공유해요                             │
│                                                          │
│  ───────────── 2025년 11월 5일 ─────────────            │
│                                                          │
│  👤 김철수                                   10:30 AM   │
│     오늘 문제 풀었어요?                                   │
│                                                          │
│                            네, 3문제 완료했습니다        │
│                                             10:31 AM    │
│                                                          │
│  👤 이영희                                   10:32 AM   │
│     저도 2문제 풀었어요!                                  │
│                                                          │
│  ↓ [스크롤 최하단] - 자동 스크롤 (새 메시지 시)          │
└──────────────────────────────────────────────────────────┘
```

**고정 높이 설정**:
- 높이: `calc(100vh - 헤더 - 탭바 - 입력창 - 여백)`
- 예시: `calc(100vh - 64px - 48px - 80px - 32px)` = 약 776px (1080p 기준)
- `overflow-y: auto`: 메시지가 많을 때만 스크롤 표시

**스크롤 동작**:
1. **최하단 자동 스크롤**
   - 새 메시지 수신 시 자동으로 최하단으로 스크롤
   - 단, 사용자가 위로 스크롤 중이면 자동 스크롤 안 함
   
2. **무한 스크롤 (상단)**
   - 스크롤을 최상단으로 올리면 자동으로 이전 메시지 50개 로드
   - 로딩 중에는 "이전 메시지를 불러오는 중..." 표시
   - 로드 완료 후 스크롤 위치 유지 (깜빡임 방지)

3. **스크롤 위치 복원**
   - 페이지 새로고침 시 마지막 읽은 메시지 위치로 이동
   - 브라우저 뒤로가기 후 다시 진입 시 스크롤 위치 복원

---

### 2. 메시지 입력 영역
```
┌──────────────────────────────────────────────────────────┐
│ [📎] 메시지를 입력하세요...                       [전송] │
└──────────────────────────────────────────────────────────┘
```

**고정 위치**:
- 하단에 고정 (`position: sticky` 또는 Flex 레이아웃)
- 스크롤과 무관하게 항상 표시
- 높이: 최소 64px, 최대 120px (내용에 따라 자동 조절)

---

## 🎬 인터랙션

### 컨테이너 레이아웃 구조
```javascript
// 채팅 컨테이너 구조
<div className="chat-container">
  {/* 메시지 영역 - 스크롤 가능 */}
  <div className="chat-messages" ref={messagesRef}>
    {hasMore && (
      <div className="loading-indicator">
        이전 메시지를 불러오는 중...
      </div>
    )}
    
    {messages.map(message => (
      <MessageItem key={message.id} message={message} />
    ))}
    
    <div ref={messagesEndRef} />
  </div>
  
  {/* 입력 영역 - 고정 */}
  <div className="chat-input-container">
    <input ... />
    <button>전송</button>
  </div>
</div>
```

### WebSocket 연결
```javascript
// useSocket Hook
const { socket, isConnected } = useSocket()

useEffect(() => {
  if (!socket) return
  
  // 스터디 방 입장
  socket.emit('join_study', { studyId })
  
  // 새 메시지 수신
  socket.on('new_message', (message) => {
    setMessages(prev => [...prev, message])
    scrollToBottom()
  })
  
  return () => {
    socket.emit('leave_study', { studyId })
    socket.off('new_message')
  }
}, [socket, studyId])
```

### 메시지 전송 후 자동 스크롤
```javascript
const handleSend = () => {
  if (!content.trim()) return
  
  socket.emit('send_message', {
    studyId,
    content: content.trim()
  })
  
  setContent('')
  
  // 메시지 전송 후 최하단으로 스크롤
  scrollToBottom()
}

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ 
    behavior: 'smooth',
    block: 'end'
  })
}
```

### 무한 스크롤 (이전 메시지 50개씩 로드)
```javascript
const messagesRef = useRef(null)
const [isUserScrolling, setIsUserScrolling] = useState(false)

// 무한 스크롤 설정
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['messages', studyId],
  queryFn: ({ pageParam = 0 }) => fetchMessages(studyId, pageParam, 50), // 50개씩
  getNextPageParam: (lastPage, allPages) => {
    if (lastPage.hasMore) {
      return allPages.length * 50 // 다음 페이지 offset
    }
    return undefined
  },
  staleTime: 0,
  refetchOnMount: false
})

// 스크롤 이벤트 감지
useEffect(() => {
  const messagesContainer = messagesRef.current
  if (!messagesContainer) return
  
  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer
    
    // 최상단 도달 시 이전 메시지 로드
    if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      const previousScrollHeight = scrollHeight
      
      fetchNextPage().then(() => {
        // 스크롤 위치 유지 (깜빡임 방지)
        const newScrollHeight = messagesContainer.scrollHeight
        messagesContainer.scrollTop = newScrollHeight - previousScrollHeight
      })
    }
    
    // 사용자가 위로 스크롤 중인지 확인
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
    setIsUserScrolling(!isAtBottom)
  }
  
  messagesContainer.addEventListener('scroll', handleScroll)
  return () => messagesContainer.removeEventListener('scroll', handleScroll)
}, [hasNextPage, isFetchingNextPage, fetchNextPage])

// 새 메시지 수신 시 자동 스크롤 (사용자가 하단에 있을 때만)
useEffect(() => {
  if (!isUserScrolling) {
    scrollToBottom()
  }
}, [messages, isUserScrolling])
```

### 로딩 인디케이터
```javascript
// 메시지 영역 상단에 표시
{isFetchingNextPage && (
  <div className="loading-messages">
    <Spinner size="sm" />
    <span>이전 메시지를 불러오는 중...</span>
  </div>
)}

{!hasNextPage && messages.length > 50 && (
  <div className="no-more-messages">
    더 이상 메시지가 없습니다
  </div>
)}
```

---

## 🎨 스타일 코드

```css
/* 채팅 컨테이너 - 전체 높이 고정, 스크롤 없음 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 48px - 32px); /* Header(64px) + Tab(48px) + Padding(32px) */
  max-height: calc(100vh - 64px - 48px - 32px);
  overflow: hidden; /* 전체 스크롤 방지 */
}

/* 메시지 영역 - 내부 스크롤만 */
.chat-messages {
  flex: 1;
  overflow-y: auto; /* 메시지 영역만 스크롤 */
  overflow-x: hidden;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--gray-50);
  
  /* 스크롤바 스타일링 */
  scrollbar-width: thin;
  scrollbar-color: var(--gray-300) transparent;
}

.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background-color: var(--gray-300);
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background-color: var(--gray-400);
}

/* 로딩 인디케이터 */
.loading-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: var(--gray-600);
  font-size: 14px;
}

.no-more-messages {
  text-align: center;
  padding: 16px;
  color: var(--gray-500);
  font-size: 12px;
}

/* 메시지 아이템 */
.message-item {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-item.mine {
  flex-direction: row-reverse;
  align-self: flex-end;
}

/* 메시지 박스 */
.message-bubble {
  max-width: 60%;
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
}

.message-bubble.other {
  background: var(--gray-100);
  color: var(--gray-900);
  border-bottom-left-radius: 4px;
}

.message-bubble.mine {
  background: var(--primary-500);
  color: white;
  border-bottom-right-radius: 4px;
}

/* 입력 영역 - 하단 고정, 스크롤 없음 */
.chat-input-container {
  flex-shrink: 0; /* 크기 고정 */
  border-top: 1px solid var(--gray-200);
  padding: 16px 24px;
  background: white;
  display: flex;
  gap: 12px;
  align-items: flex-end;
  min-height: 64px;
  max-height: 120px;
}

.chat-input {
  flex: 1;
  min-height: 40px;
  max-height: 80px; /* 입력창 최대 높이 제한 */
  padding: 10px 12px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  resize: none;
  overflow-y: auto; /* 긴 입력 시에만 입력창 내부 스크롤 */
}

.chat-input:focus {
  outline: none;
  border-color: var(--primary-500);
}
```

---

## 📱 반응형 설계

### Desktop (1280px+)
- 메시지 영역: `calc(100vh - 144px)` (고정 높이)
- 메시지 최대 너비: 60%
- 입력창 높이: 64px~120px (자동 조절)

### Tablet (768-1279px)
- 메시지 영역: `calc(100vh - 136px)`
- 메시지 최대 너비: 70%

### Mobile (<768px)
- 메시지 영역: `calc(100vh - 128px)`
- 메시지 최대 너비: 75%
- 입력창 높이: 64px~100px (작게)
- 프로필 이미지 크기: 28px

---

## ⚡ 성능 최적화

### 1. 가상화 (선택적)
- 메시지가 1000개 이상일 때 `react-window` 또는 `react-virtualized` 사용
- 화면에 보이는 메시지만 렌더링하여 성능 향상

### 2. 메시지 캐싱
- React Query의 캐싱 기능 활용
- 이전에 로드한 메시지는 서버 요청 없이 캐시에서 로드

### 3. 스크롤 디바운싱
```javascript
const handleScroll = debounce(() => {
  // 스크롤 처리 로직
}, 100)
```

---

## ✅ 완료 체크리스트

- [ ] 채팅 컨테이너 고정 높이 설정
- [ ] 메시지 영역 독립 스크롤 구현
- [ ] 입력 영역 하단 고정
- [ ] 무한 스크롤 (50개씩 로드)
- [ ] 로딩 인디케이터 표시
- [ ] 새 메시지 수신 시 자동 스크롤
- [ ] 스크롤 위치 감지 (자동 스크롤 제어)
- [ ] 스크롤 위치 복원 (페이지 재진입)
- [ ] WebSocket 연결 (Socket.IO)
- [ ] 실시간 메시지 송수신
- [ ] 날짜 구분선
- [ ] 시스템 메시지 (입장/퇴장)
- [ ] 파일 첨부 (선택적)
- [ ] 입력 중 표시 (선택적)

---

**이전 화면**: `07_study-detail.md` (개요)  
**다음 화면**: `09_study-notice.md` (공지사항)
