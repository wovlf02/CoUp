# 내 스터디 채팅 (My Study Chat)

> **화면 ID**: `MY-STUDY-03`  
> **라우트**: `/my-studies/[studyId]/chat`  
> **목적**: 실시간 그룹 채팅  
> **사용자 상태**: MEMBER+ (PENDING은 읽기만 가능)  
> **렌더링**: CSR (WebSocket 실시간)

---

## ? 화면 목적

**"실시간 소통의 중심"**
- 멤버들과 즉각적인 소통
- 파일 첨부 및 공유
- 메시지 검색 및 고정
- 읽음 상태 확인

---

## ? 레이아웃 구조 (FHD 최적화)

```
┌─────┬─────────────────────────────────────────────────────┬──────────────────┐
│     │ [개요] [채팅] [공지] [파일] [캘린더] [할일] [화상] │                  │
│ Nav ├─────────────────────────────────────────────────────┤  실시간 위젯     │
│ 12% │                                                     │  (280px)         │
│     │ ┌─────────────────────────────────────────────────┐ │                  │
│     │ │ ? 채팅                          [? 검색]      │ │  ? 스터디 현황  │
│     │ ├─────────────────────────────────────────────────┤ │  D-7 주간회의    │
│     │ │                                                 │ │                  │
│ ?  │ │ ↑ 이전 메시지 50개 로드                         │ │  ? 온라인 (3)   │
│ ?  │ │                                                 │ │  ? 김철수       │
│ ?← │ │ ───────── 2025년 11월 6일 ─────────            │ │  ? 이영희       │
│ ?  │ │                                                 │ │  ? 박민수       │
│ ?  │ │ ? 김철수                       10:30 AM       │ │  ? 최지은       │
│ ?  │ │    오늘 문제 풀었어요?                         │ │  ? 정소현       │
│     │ │                                                 │ │                  │
│     │ │                    네, 3문제 완료했습니다       │ │  ? 빠른 액션    │
│     │ │                                10:31 AM    [나] │ │  [화상] [파일]   │
│     │ │                                                 │ │  [공지] [일정]   │
│     │ │ ? 이영희                       10:32 AM       │ │                  │
│     │ │    저도 2문제 풀었어요!                        │ │  ? 고정 메시지  │
│     │ │    ? 풀이.pdf (1.2MB)                        │ │  ? 매일 9시      │
│     │ │                                                 │ │    문제 공유     │
│     │ │ ? 김철수                       10:35 AM       │ │                  │
│     │ │    좋아요! 파일 확인했습니다 ?                │ │  ? 급한 할일    │
│     │ │                                                 │ │  ? 백준 1234    │
│     │ │                                                 │ │     (D-1)        │
│     │ │                              이영희님이 입력 중... │ │                  │
│     │ │                                                 │ │  ? 다가오는 일정│
│     │ │ ↓ 자동 스크롤 (새 메시지)                      │ │  11/7 주간회의   │
│     │ ├─────────────────────────────────────────────────┤ │                  │
│     │ │ [?] 메시지를 입력하세요...         [전송]     │ │  ? 나의 활동    │
│     │ └─────────────────────────────────────────────────┘ │  이번 주         │
│     │                                                     │  메시지: 42개    │
│     │                                                     │                  │
└─────┴─────────────────────────────────────────────────────┴──────────────────┘
```

**레이아웃 비율**:
- 좌측 네비게이션: 12% (240px)
- 채팅 영역: 58% (1100px)
  - 메시지 영역: calc(100vh - 240px) 고정 높이
  - 입력 영역: 80px 고정
- 우측 위젯: 30% (280px)

---

## ? 섹션별 상세 설계

### 1. 채팅 헤더

```
┌──────────────────────────────────────────────────────────┐
│ ? 채팅                                  [? 검색]        │
└──────────────────────────────────────────────────────────┘
```

**좌측**: 제목 "? 채팅"
**우측**: [? 검색] 버튼 → 메시지 검색 모달

---

### 2. 메시지 영역 (스크롤 독립)

```
┌─────────────────────────────────────────────────────────┐
│ ↑ 이전 메시지 50개 로드 (스크롤 최상단)                  │
│                                                         │
│ ───────────── 2025년 11월 6일 ─────────────            │
│                                                         │
│ ? 김철수                                  10:30 AM    │
│    오늘 문제 풀었어요?                                  │
│                                                         │
│                           네, 3문제 완료했습니다        │
│                                            10:31 AM [나]│
│                                                         │
│ ? 이영희                                  10:32 AM    │
│    저도 2문제 풀었어요!                                 │
│    ? 풀이.pdf (1.2MB) [다운로드]                      │
│                                                         │
│ ↓ 자동 스크롤 (새 메시지 수신 시)                       │
└─────────────────────────────────────────────────────────┘
```

**특징**:
- 고정 높이: `calc(100vh - 64px - 48px - 80px)` (헤더-탭-입력창 제외)
- 독립 스크롤: `overflow-y: auto`
- 무한 스크롤: 최상단 도달 시 이전 50개 로드
- 자동 스크롤: 새 메시지 수신 시 최하단으로

---

### 3. 메시지 타입별 디자인

#### 3-1. 시스템 메시지
```
───────────── 2025년 11월 6일 ─────────────

         [김철수님이 입장했습니다]
```

#### 3-2. 상대방 메시지
```
? 김철수                                  10:30 AM
   오늘 문제 풀었어요?
```

#### 3-3. 내 메시지 (우측 정렬)
```
                           네, 3문제 완료했습니다
                          ?? 읽음 10:31 AM [나]
```

#### 3-4. 파일 첨부 메시지
```
? 이영희                                  10:32 AM
   ? 풀이.pdf (1.2MB) [다운로드]
```

#### 3-5. 이미지 첨부 메시지
```
? 박민수                                  10:35 AM
   [이미지 썸네일 150x150]
   클릭하면 전체 보기
```

#### 3-6. 답장 메시지
```
? 최지은                                  10:40 AM
   ┌─ 김철수: 오늘 문제 풀었어요?
   │
   저도 풀었어요!
```

#### 3-7. 입력 중 표시
```
                              이영희님이 입력 중...
```

---

### 4. 메시지 입력 영역 (하단 고정)

```
┌─────────────────────────────────────────────────────────┐
│ [?] 메시지를 입력하세요...                     [전송]  │
└─────────────────────────────────────────────────────────┘
```

**구성**:
- [?] 파일 첨부 버튼
- 입력창 (textarea, 자동 높이 조절, 최대 5줄)
- [전송] 버튼 (Primary)

**기능**:
- Shift+Enter: 줄바꿈
- Enter: 전송
- 파일 드래그 앤 드롭
- 이모지 선택 (선택적)

---

### 5. 메시지 컨텍스트 메뉴 (우클릭 또는 길게 누르기)

```
┌─────────────────┐
│ 답장하기        │
│ 복사하기        │
│ 삭제하기 (내 메시지만) │
│ 고정하기 (관리자만) │
└─────────────────┘
```

---

## ? 우측 위젯 (채팅 탭 특화)

### 1?? 스터디 현황 (동일)

### 2?? 온라인 멤버 (확장 버전)

```
┌─────────────────────────────────────┐
│ ? 온라인 멤버 (3명)                 │
│                                     │
│ ? 김철수 (OWNER)                   │
│    채팅 중 · 방금 전                │
│                                     │
│ ? 이영희 (ADMIN)                   │
│    입력 중... · 1분 전               │
│                                     │
│ ? 박민수                            │
│    채팅 중 · 5분 전                 │
│                                     │
│ ? 오프라인 (9명)                    │
│ ? 최지은 (30분 전)                  │
│ ? 정소현 (1시간 전)                 │
│ ... 7명 더보기                      │
│                                     │
│ ? 전체 멤버 (12/20) [보기 →]      │
└─────────────────────────────────────┘
```

**추가 정보**:
- 실시간 활동 상태 (채팅 중, 입력 중)
- 마지막 활동 시간
- 오프라인 멤버도 표시 (접은 상태)

---

### 3?? 빠른 액션 (채팅 특화)

```
┌─────────────────────────────────────┐
│ ? 빠른 액션                         │
│                                     │
│ [? 화상 스터디 시작]                │
│ [? 파일 공유하기]                   │
│ [? 공지 작성하기]                   │
│ [? 일정 추가하기]                   │
└─────────────────────────────────────┘
```

---

### 4?? 고정 메시지

```
┌─────────────────────────────────────┐
│ ? 고정 메시지                       │
│                                     │
│ 매일 오전 9시 문제 공유              │
│ 김철수 · 3일 전                     │
│ [보기]                              │
│                                     │
│ 스터디 규칙 안내                     │
│ 김철수 · 1주 전                     │
│ [보기]                              │
└─────────────────────────────────────┘
```

---

## ? WebSocket 실시간 기능

### 1. 메시지 송수신

```javascript
// 메시지 전송
const handleSendMessage = async (content, files = []) => {
  if (!content.trim() && files.length === 0) return
  
  // 파일 업로드 (있는 경우)
  let fileUrls = []
  if (files.length > 0) {
    fileUrls = await uploadFiles(files)
  }
  
  // WebSocket으로 전송
  socket.emit('send_message', {
    studyId,
    content: content.trim(),
    files: fileUrls,
    replyTo: replyingTo?.id // 답장인 경우
  })
  
  setContent('')
  setFiles([])
  setReplyingTo(null)
}

// 메시지 수신
useEffect(() => {
  if (!socket) return
  
  socket.on('new_message', (message) => {
    // React Query 캐시에 추가
    queryClient.setQueryData(
      ['messages', studyId],
      (old) => ({
        ...old,
        pages: old.pages.map((page, index) => 
          index === 0 
            ? { ...page, messages: [...page.messages, message] }
            : page
        )
      })
    )
    
    // 자동 스크롤 (사용자가 하단에 있을 때만)
    if (isAtBottom) {
      scrollToBottom()
    }
    
    // 알림 표시 (다른 탭에 있을 때)
    if (document.hidden) {
      showNotification(message)
    }
  })
  
  return () => socket.off('new_message')
}, [socket, studyId, isAtBottom])
```

---

### 2. 입력 중 표시

```javascript
// 입력 중 이벤트 전송
const handleTyping = useCallback(
  debounce(() => {
    socket.emit('typing', { studyId, userId })
  }, 500),
  [socket, studyId]
)

// 입력 중 수신
useEffect(() => {
  socket.on('user_typing', ({ userId, userName }) => {
    setTypingUsers(prev => ({
      ...prev,
      [userId]: { userName, timestamp: Date.now() }
    }))
    
    // 3초 후 자동 제거
    setTimeout(() => {
      setTypingUsers(prev => {
        const { [userId]: _, ...rest } = prev
        return rest
      })
    }, 3000)
  })
  
  return () => socket.off('user_typing')
}, [socket])
```

---

### 3. 읽음 상태

```javascript
// 읽음 처리
const markAsRead = async (messageId) => {
  await api.post(`/api/v1/messages/${messageId}/read`)
  socket.emit('message_read', { studyId, messageId })
}

// 읽음 상태 수신
useEffect(() => {
  socket.on('message_read_update', ({ messageId, readers }) => {
    queryClient.setQueryData(['messages', studyId], (old) => ({
      ...old,
      pages: old.pages.map(page => ({
        ...page,
        messages: page.messages.map(msg =>
          msg.id === messageId
            ? { ...msg, readers }
            : msg
        )
      }))
    }))
  })
  
  return () => socket.off('message_read_update')
}, [socket, studyId])
```

---

## ? 스타일 코드

```css
/* 채팅 컨테이너 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 48px - 32px);
  overflow: hidden;
}

/* 메시지 영역 */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #F9FAFB;
  scroll-behavior: smooth;
}

/* 날짜 구분선 */
.date-divider {
  text-align: center;
  color: #9CA3AF;
  font-size: 12px;
  margin: 24px 0;
  position: relative;
}

.date-divider::before,
.date-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #E5E7EB;
}

.date-divider::before { left: 0; }
.date-divider::after { right: 0; }

/* 메시지 */
.message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  max-width: 70%;
}

.message.mine {
  margin-left: auto;
  flex-direction: row-reverse;
}

/* 메시지 풍선 */
.message-bubble {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 10px 14px;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message.mine .message-bubble {
  background: #6366F1;
  color: white;
  border: none;
}

/* 시스템 메시지 */
.system-message {
  text-align: center;
  color: #6B7280;
  font-size: 13px;
  margin: 16px 0;
  padding: 8px;
  background: #F3F4F6;
  border-radius: 12px;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

/* 입력 중 표시 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6B7280;
  font-size: 13px;
  padding: 8px 0;
  height: 30px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dot {
  width: 6px;
  height: 6px;
  background: #9CA3AF;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

/* 입력 영역 */
.input-area {
  border-top: 1px solid #E5E7EB;
  padding: 16px 20px;
  background: white;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-textarea {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
}

.input-textarea:focus {
  outline: none;
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* 파일 첨부 */
.file-attachment {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #F3F4F6;
  border-radius: 8px;
  margin-top: 8px;
}

/* 읽음 표시 */
.read-receipt {
  font-size: 11px;
  color: #6B7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.message.mine .read-receipt {
  color: rgba(255, 255, 255, 0.8);
}
```

---

## ? 반응형 설계

### Mobile (<768px)
```css
.chat-container {
  height: calc(100vh - 120px);
}

.message {
  max-width: 85%;
}

.input-area {
  flex-wrap: wrap;
}
```

---

## ? 구현 체크리스트

### Phase 1: 기본 레이아웃
- [ ] 메시지 영역 (고정 높이, 독립 스크롤)
- [ ] 입력 영역 (하단 고정)
- [ ] 날짜 구분선

### Phase 2: WebSocket 연결
- [ ] Socket.IO 연결
- [ ] 메시지 송수신
- [ ] 방 입장/퇴장

### Phase 3: 메시지 표시
- [ ] 상대방 메시지 (좌측)
- [ ] 내 메시지 (우측)
- [ ] 시스템 메시지 (중앙)
- [ ] 파일 첨부 메시지
- [ ] 이미지 메시지

### Phase 4: 실시간 기능
- [ ] 입력 중 표시
- [ ] 읽음 상태
- [ ] 온라인 멤버 표시
- [ ] 자동 스크롤

### Phase 5: 추가 기능
- [ ] 무한 스크롤 (이전 메시지)
- [ ] 메시지 검색
- [ ] 파일 드래그 앤 드롭
- [ ] 답장 기능
- [ ] 메시지 고정 (관리자)
- [ ] 메시지 삭제 (본인)

### Phase 6: 최적화
- [ ] 가상화 (많은 메시지)
- [ ] 이미지 레이지 로딩
- [ ] 디바운스 (입력 중)
- [ ] 반응형 테스트

---

**다음 화면**: `07_my-study-notices.md` (공지사항)

