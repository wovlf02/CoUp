# 08. 스터디 채팅 (Study Chat)

> **화면 ID**: `STUDY-02`  
> **라우트**: `/studies/[studyId]/chat`  
> **레이아웃**: 좌측 네비게이션(15%) + 우측 콘텐츠(85%)  
> **렌더링**: CSR (WebSocket 실시간)

---

## 📐 화면 구조

```
┌────────┬───────────────────────────────────────────────────────┐
│        │  Header                                               │
│        ├───────────────────────────────────────────────────────┤
│        │  📚 코딩테스트 마스터 스터디                           │
│  Nav   │  ┌──────────────────────────────────────────────────┐ │
│  Bar   │  │ [개요] [채팅] [공지] [파일] [캘린더] [할일]       │ │
│        │  └──────────────────────────────────────────────────┘ │
│ 🏠     │                                                       │
│ 🔍     │  ┌──────────────────────────────────────────────────┐ │
│ 👥     │  │                                                  │ │
│ 📋     │  │  [김철수] 오늘 문제 풀었어요?          10:30 AM  │ │
│ 🔔     │  │                                                  │ │
│ 👤     │  │                  네, 3문제 완료했습니다 [나]     │ │
│        │  │                               10:31 AM           │ │
│        │  │                                                  │ │
│        │  │  [이영희] 저도 2문제 풀었어요!          10:32 AM  │ │
│        │  │                                                  │ │
│        │  │                                                  │ │
│        │  │                                                  │ │
│        │  │                                                  │ │
│        │  │                                                  │ │
│        │  └──────────────────────────────────────────────────┘ │
│        │                                                       │
│        │  ┌──────────────────────────────────────────────────┐ │
│        │  │ 메시지 입력...                         [전송] │ │
│        │  └──────────────────────────────────────────────────┘ │
│        │                                                       │
└────────┴───────────────────────────────────────────────────────┘
```

---

## 🎨 섹션별 상세 설계

### 1. 채팅 메시지 영역
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  [김철수]                                    10:30 AM   │
│  오늘 문제 풀었어요?                                      │
│                                                          │
│                            네, 3문제 완료했습니다 [나]   │
│                                             10:31 AM    │
│                                                          │
│  [이영희]                                    10:32 AM   │
│  저도 2문제 풀었어요!                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**타인의 메시지** (좌측 정렬):
- 프로필 이미지 (32px, 좌측)
- 이름 (text-sm, Bold, gray-900)
- 메시지 박스:
  - 배경: gray-100
  - 패딩: 12px 16px
  - 둥근 모서리: 12px (우측 하단 4px)
  - 최대 너비: 60%
- 시간 (text-xs, gray-500, 메시지 옆)

**내 메시지** (우측 정렬):
- 메시지 박스:
  - 배경: primary-500
  - 텍스트: white
  - 패딩: 12px 16px
  - 둥근 모서리: 12px (좌측 하단 4px)
  - 최대 너비: 60%
- 시간 (text-xs, gray-500, 메시지 옆)

**날짜 구분선**:
```
───────────── 2025년 11월 5일 ─────────────
```

**시스템 메시지** (중앙 정렬):
```
김철수님이 입장하셨습니다
```
- 배경: gray-50
- 텍스트: gray-600, text-xs
- 패딩: 8px 16px
- 둥근 모서리: 16px

---

### 2. 메시지 입력 영역
```
┌──────────────────────────────────────────────────────────┐
│ [📎] 메시지를 입력하세요...                       [전송] │
└──────────────────────────────────────────────────────────┘
```

**좌측**:
- 파일 첨부 버튼 (아이콘 버튼, 24px)
- 이모지 버튼 (선택적)

**중앙**:
- 입력 필드 (Textarea, 자동 높이 조절)
- Placeholder: "메시지를 입력하세요..."
- 최대 높이: 120px (스크롤)

**우측**:
- 전송 버튼 (Primary)
- 입력 없을 때: 비활성화
- 단축키: Enter (Shift+Enter: 줄바꿈)

---

## 🎬 인터랙션

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

### 메시지 전송
```javascript
const handleSend = () => {
  if (!content.trim()) return
  
  socket.emit('send_message', {
    studyId,
    content: content.trim()
  })
  
  setContent('')
}
```

### 무한 스크롤 (이전 메시지)
```javascript
// 스크롤 최상단 도달 시
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['messages', studyId],
  queryFn: ({ pageParam }) => fetchMessages(studyId, pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor
})
```

### 입력 중 표시 (선택적)
```
김철수님이 입력 중입니다...
```

---

## 📱 반응형 설계

### Desktop (1280px+)
- 메시지 영역: 전체 높이 - 입력창(80px)
- 메시지 최대 너비: 60%

### Mobile (<768px)
- 메시지 최대 너비: 75%
- 입력창 높이: 64px (작게)
- 프로필 이미지 크기: 28px

---

## 🎨 스타일 코드

```css
/* 채팅 컨테이너 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 128px); /* Header + Tab 제외 */
}

/* 메시지 영역 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

/* 입력 영역 */
.chat-input-container {
  border-top: 1px solid var(--gray-200);
  padding: 16px 24px;
  background: white;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 12px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  resize: none;
  overflow-y: auto;
}

.chat-input:focus {
  outline: none;
  border-color: var(--primary-500);
}
```

---

## 📐 ASCII 스케치

```
┌──────┬──────────────────────────────────────────────────┐
│      │ 📚 코딩테스트 스터디                              │
│ 🏠   │ [개요] [채팅] [공지] [파일] [캘린더] [할일]       │
│ 🔍   │                                                  │
│ 👥   │ ┌──────────────────────────────────────────────┐│
│ 📋   │ │                                              ││
│ 🔔   │ │ 👤 김철수          10:30 AM                  ││
│ 👤   │ │ 오늘 문제 풀었어요?                           ││
│      │ │                                              ││
│      │ │              네, 3문제 완료 [나]  10:31 AM   ││
│      │ │                                              ││
│      │ │ 👤 이영희          10:32 AM                  ││
│      │ │ 저도 2문제 풀었어요!                          ││
│      │ │                                              ││
│      │ │                                              ││
│      │ └──────────────────────────────────────────────┘│
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐│
│      │ │ [📎] 메시지 입력...              [전송]      ││
│      │ └──────────────────────────────────────────────┘│
└──────┴──────────────────────────────────────────────────┘
```

---

## ✅ 완료 체크리스트

- [ ] WebSocket 연결 (Socket.IO)
- [ ] 실시간 메시지 송수신
- [ ] 메시지 목록 렌더링
- [ ] 무한 스크롤 (이전 메시지)
- [ ] 메시지 입력 및 전송
- [ ] 자동 스크롤 (새 메시지 시)
- [ ] 날짜 구분선
- [ ] 시스템 메시지 (입장/퇴장)
- [ ] 파일 첨부 (선택적)
- [ ] 입력 중 표시 (선택적)

---

**다음 화면**: `09_study-notice.md` (공지사항)
