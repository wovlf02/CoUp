# ✅ 화상 회의 그리드 레이아웃 & 채팅 기능 구현 완료

> **날짜**: 2025-11-19  
> **작업**: 고정 크기 타일 + 개별 컨트롤 버튼 + 실시간 채팅 기능  
> **상태**: ✅ 완료

---

## 🎯 구현 내용

### 1. 고정 크기 비디오 타일 ✅

각 참여자가 고정된 크기의 타일로 표시되며, 화면을 꽉 채우지 않고 중앙에 정렬됩니다.

#### 타일 크기 규칙

| 참여자 수 | 타일 크기 | 레이아웃 |
|----------|-----------|---------|
| 1명 | 500px | 중앙 1개 |
| 2명 | 400px | 좌우 2개 |
| 3~4명 | 380px | 2x2 그리드 |
| 5~6명 | 350px | 3x2 그리드 |
| 7~9명 | 330px | 3x3 그리드 |
| 10명+ | 300px | 4열, 스크롤 |

#### 특징
- ✅ **고정 비율**: 4:3 비율로 고정
- ✅ **중앙 정렬**: 타일들이 화면 중앙에 배치
- ✅ **개별 프레임**: 각 타일이 독립적인 카드 형태
- ✅ **그림자 효과**: 입체감 있는 디자인
- ✅ **호버 효과**: 마우스 오버 시 살짝 떠오르는 애니메이션

---

### 2. 개별 컨트롤 버튼 ✅

각 참여자 타일에 마이크/카메라 컨트롤 버튼이 표시됩니다 (본인만).

#### 기능
- ✅ **마이크 버튼**: 🎤 (켜짐) / 🔇 (꺼짐)
- ✅ **카메라 버튼**: 📹 (켜짐) / 📹❌ (꺼짐)
- ✅ **호버 시 표시**: 마우스를 올리면 컨트롤 버튼 나타남
- ✅ **즉시 적용**: 클릭 즉시 상태 변경
- ✅ **상태 표시**: 우측 상단에 현재 상태 배지

#### UI 배치
```
┌─────────────────────────────┐
│ 홍길동 (나)          🔇 📹❌│ ← 상태 배지 (우측 상단)
│                             │
│      [비디오 영역]          │
│                             │
│         🎤    📹            │ ← 컨트롤 버튼 (하단 중앙, 호버 시)
└─────────────────────────────┘
```

---

### 3. 실시간 채팅 기능 ✅

화상 회의 중 텍스트 채팅이 가능합니다.

#### 기능
- ✅ **메시지 송수신**: Socket.IO를 통한 실시간 메시지 전송
- ✅ **말풍선 스타일**: 카카오톡처럼 자신/타인 메시지 구분
- ✅ **시간 표시**: 각 메시지에 전송 시간 표시 (HH:MM)
- ✅ **자동 스크롤**: 새 메시지 수신 시 자동으로 하단 스크롤
- ✅ **중복 방지**: 자신이 보낸 메시지는 즉시 표시, 서버 응답 중복 제거

#### UI 디자인

**자신의 메시지 (오른쪽)**:
```
                    ┌──────────────────┐
                    │ 안녕하세요!      │ 파란색 배경
                    └──────────────────┘
                              14:23 ──┘
```

**다른 사람 메시지 (왼쪽)**:
```
홍길동              14:25
┌──────────────────┐
│ 반갑습니다!      │ 회색 배경
└──────────────────┘
```

---

## 📁 수정된 파일

### 1. `/coup/src/components/video-call/VideoTile.jsx`

#### A. 개별 컨트롤 버튼 추가
```javascript
export default function VideoTile({
  stream,
  user,
  isLocal = false,
  isMuted = false,
  isVideoOff = false,
  isSpeaking = false,
  onToggleMute,      // 추가: 마이크 토글 함수
  onToggleVideo,     // 추가: 비디오 토글 함수
  onDoubleClick
}) {
  const [showControls, setShowControls] = useState(false);

  return (
    <div
      className={styles.videoTile}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* 비디오/아바타 */}
      {isVideoOff || !stream ? <AvatarView /> : <VideoView />}

      {/* 상단: 이름 */}
      <div className={styles.topOverlay}>
        <div className={styles.name}>
          {user?.name || 'Unknown'}
          {isLocal && ' (나)'}
        </div>
      </div>

      {/* 하단: 컨트롤 버튼 (본인만, 호버 시) */}
      {isLocal && (
        <div className={`${styles.controls} ${showControls ? styles.controlsVisible : ''}`}>
          <button
            className={styles.controlButton}
            onClick={onToggleMute}
            title={isMuted ? '마이크 켜기' : '마이크 끄기'}
          >
            {isMuted ? '🔇' : '🎤'}
          </button>
          
          <button
            className={styles.controlButton}
            onClick={onToggleVideo}
            title={isVideoOff ? '비디오 켜기' : '비디오 끄기'}
          >
            {isVideoOff ? '📹❌' : '📹'}
          </button>
        </div>
      )}

      {/* 우측 상단: 상태 배지 */}
      <div className={styles.statusBadges}>
        {isMuted && <span className={styles.statusBadge}>🔇</span>}
        {isVideoOff && <span className={styles.statusBadge}>📹❌</span>}
      </div>
    </div>
  );
}
```

---

### 2. `/coup/src/components/video-call/VideoTile.module.css`

#### A. 고정 크기 타일 스타일
```css
.videoTile {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3; /* 고정 비율 */
  max-width: 400px; /* 최대 너비 제한 */
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.videoTile:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}
```

#### B. 개별 컨트롤 버튼 스타일
```css
/* 하단 컨트롤 버튼 (호버 시 표시) */
.controls {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 3;
}

.videoTile:hover .controls {
  opacity: 1;
}

.controlButton {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #1a1a1a;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.controlButton:hover {
  background: white;
  transform: scale(1.1);
}

.controlButtonActive {
  background: #ef4444;
  color: white;
}
```

#### C. 상태 배지 스타일
```css
/* 우측 상단 상태 배지 */
.statusBadges {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
  z-index: 2;
}

.statusBadge {
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  font-size: 14px;
}
```

---

### 3. `/coup/src/app/my-studies/[studyId]/video-call/page.jsx`

#### A. VideoTile에 컨트롤 함수 전달
```jsx
{/* 로컬 비디오 */}
{localStream && (
  <VideoTile
    stream={localStream}
    isLocal={true}
    user={currentUser}
    isMuted={isMuted}
    isVideoOff={isVideoOff}
    onToggleMute={toggleMute}      // 추가
    onToggleVideo={toggleVideo}    // 추가
  />
)}
```

#### B. 그리드 레이아웃 계산 개선
```javascript
const getGridLayout = () => {
  const totalCount = participants.length + (localStream ? 1 : 0);
  if (totalCount === 1) return styles.grid1;
  if (totalCount === 2) return styles.grid2x2;
  if (totalCount <= 4) return styles.grid3x3; // 3~4명: 2x2
  if (totalCount <= 6) return styles.grid4x3; // 5~6명: 3x2
  if (totalCount <= 9) return styles.grid3x3Large; // 7~9명: 3x3
  return styles.gridLarge; // 10명 이상: 4xN (스크롤)
};
```

---

### 4. `/coup/src/app/my-studies/[studyId]/video-call/page.module.css`

#### A. 고정 크기 그리드 CSS
```css
/* 중앙: 비디오 그리드 - 고정 크기 타일 */
.videoArea {
  flex: 1;
  background: var(--gray-900);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  min-height: 0;
}

.videoGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  max-width: 1400px;
  padding: 20px;
}

/* 1명: 중앙에 크게 (최대 500px) */
.grid1 {
  max-width: 500px;
}

.grid1 > * {
  width: 100%;
  max-width: 500px;
}

/* 2명: 좌우 배치 (각 400px) */
.grid2x2 {
  max-width: 900px;
}

.grid2x2 > * {
  width: 400px;
}

/* 3~4명: 2x2 그리드 (각 380px) */
.grid3x3 {
  max-width: 900px;
}

.grid3x3 > * {
  width: 380px;
}

/* 5~6명: 3열 (각 350px) */
.grid4x3 {
  max-width: 1200px;
}

.grid4x3 > * {
  width: 350px;
}

/* 7~9명: 3x3 그리드 (각 330px) */
.grid3x3Large {
  max-width: 1100px;
}

.grid3x3Large > * {
  width: 330px;
}

/* 10명 이상: 4열 (각 300px) */
.gridLarge {
  max-width: 1400px;
}

.gridLarge > * {
  width: 300px;
}
```

---

### 5. 채팅 기능 (이전 구현 유지)
  if (totalCount <= 9) return styles.grid3x3Large; // 7~9명: 3x3
  return styles.gridLarge; // 10명 이상: 4xN (스크롤)
};
```

#### B. 채팅 메시지 전송 개선
```javascript
const handleSendMessage = (e) => {
  e.preventDefault();
  if (!chatMessage.trim() || !socket || !currentUser) return;

  const newMessage = {
    id: `msg_${Date.now()}_${socket.id}`,
    roomId,
    userId: currentUser.id,
    user: currentUser,
    message: chatMessage.trim(),
    timestamp: new Date(),
    socketId: socket.id,
    isMe: true // 자신이 보낸 메시지 표시
  };

  // 즉시 화면에 표시
  setChatMessages((prev) => [...prev, newMessage]);

  // 서버로 전송
  socket.emit('chat:video-message', {
    roomId,
    message: chatMessage.trim()
  });

  setChatMessage('');
  
  // 자동 스크롤
  setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
};
```

#### C. 채팅 수신 로직 개선
```javascript
useEffect(() => {
  if (!socket || !isInCall || !currentUser) return;

  socket.on('chat:video-message-received', (message) => {
    console.log('[VideoCall] Received chat message:', message);
    
    // 자신이 보낸 메시지는 이미 화면에 표시했으므로 무시
    if (message.userId === currentUser.id && message.socketId === socket.id) {
      return;
    }

    // 다른 사람이 보낸 메시지만 추가
    setChatMessages((prev) => [...prev, { ...message, isMe: false }]);
    
    // 자동 스크롤
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  });

  return () => {
    socket.off('chat:video-message-received');
  };
}, [socket, isInCall, currentUser]);
```

#### D. 채팅 UI 개선
```jsx
<div className={styles.chatMessages}>
  {chatMessages.length === 0 ? (
    <div className={styles.chatEmpty}>채팅을 시작해보세요!</div>
  ) : (
    chatMessages.map((msg, index) => (
      <div 
        key={msg.id || index} 
        className={msg.isMe ? styles.chatMessageMe : styles.chatMessage}
      >
        {!msg.isMe && (
          <div className={styles.chatMessageHeader}>
            <strong>{msg.user?.name || 'Unknown'}</strong>
            <span className={styles.chatMessageTime}>
              {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}
        <div className={styles.chatMessageContent}>
          {msg.message}
        </div>
        {msg.isMe && (
          <div className={styles.chatMessageTime} style={{ textAlign: 'right', marginTop: '4px' }}>
            {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    ))
  )}
  <div ref={chatEndRef} />
</div>
```

---

### 2. `/coup/src/app/my-studies/[studyId]/video-call/page.module.css`

#### A. 그리드 레이아웃 CSS
```css
/* 중앙: 비디오 그리드 */
.videoArea {
  flex: 1;
  background: var(--gray-900);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
  min-height: 0;
}

.videoGrid {
  display: grid;
  gap: 16px;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  align-content: start;
  justify-content: center;
}

/* 1명: 중앙에 크게 */
.grid1 {
  grid-template-columns: minmax(400px, 800px);
  grid-template-rows: minmax(300px, 600px);
  place-items: center;
}

/* 2명: 좌우 또는 상하 */
.grid2x2 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr;
  max-height: 100%;
}

/* 3~4명: 2x2 그리드 */
.grid3x3 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  max-height: 100%;
}

/* 5~6명: 3x2 그리드 */
.grid4x3 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  max-height: 100%;
}

/* 7~9명: 3x3 그리드 */
.grid3x3Large {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  max-height: 100%;
}

/* 10명 이상: 4x3 그리드, 스크롤 가능 */
.gridLarge {
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(200px, 1fr);
  max-height: none;
  overflow-y: auto;
}
```

#### B. 채팅 메시지 스타일
```css
.chatMessages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chatMessage {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 80%;
}

.chatMessageMe {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 80%;
  align-self: flex-end;
}

.chatMessageContent {
  font-size: 0.875rem;
  color: var(--gray-700);
  line-height: 1.5;
  word-wrap: break-word;
  background: var(--gray-100);
  padding: 10px 12px;
  border-radius: 12px;
  width: fit-content;
}

.chatMessageMe .chatMessageContent {
  background: var(--primary-600);
  color: white;
  border-radius: 12px 12px 2px 12px;
}

.chatMessage .chatMessageContent {
  border-radius: 12px 12px 12px 2px;
}
```

#### C. 반응형 디자인
```css
@media (max-width: 1024px) {
  .mainContent {
    flex-direction: column;
  }

  .leftSidebar {
    width: 100%;
    max-height: 120px;
    border-right: none;
    border-bottom: 1px solid var(--gray-200);
  }

  .participantList {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 8px;
  }

  .participant {
    flex-shrink: 0;
    flex-direction: column;
    width: 80px;
    text-align: center;
    gap: 6px;
  }

  /* 모바일에서는 더 작은 그리드 */
  .grid3x3,
  .grid4x3,
  .grid3x3Large {
    grid-template-columns: repeat(2, 1fr);
  }

  .gridLarge {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  /* 모바일에서는 1열 */
  .grid2x2,
  .grid3x3,
  .grid4x3,
  .grid3x3Large,
  .gridLarge {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
```

---

## 🧪 테스트 방법

### 1. 서버 시작

```bash
# Next.js 서버
cd C:\Project\CoUp\coup
npm run dev

# 시그널링 서버
cd C:\Project\CoUp\signaling-server
npm start
```

### 2. 브라우저 테스트

#### A. 2명 테스트
1. 브라우저 1: 로그인 → 스터디 → 화상 탭 → 참여하기
2. 브라우저 2 (시크릿 모드): 로그인 → 같은 스터디 → 화상 탭 → 참여하기
3. **확인사항**:
   - ✅ 2명이 좌우로 나란히 표시되는가?
   - ✅ 각자의 이름이 정확히 표시되는가?

#### B. 채팅 테스트
1. 브라우저 1: 우측 채팅창에 "안녕하세요!" 입력 → 전송
2. 브라우저 2: 메시지 수신 확인
   - ✅ 좌측에 상대방 이름과 메시지 표시?
3. 브라우저 2: "반갑습니다!" 입력 → 전송
4. 브라우저 1: 메시지 수신 확인
   - ✅ 좌측에 메시지 표시?
5. **자신의 메시지**:
   - ✅ 오른쪽 정렬?
   - ✅ 파란색 배경?
   - ✅ 시간 표시?

#### C. 개별 컨트롤 버튼 테스트
1. 자신의 타일에 마우스 오버
   - ✅ 하단에 마이크/카메라 버튼 나타나는지
2. 마이크 버튼 클릭
   - ✅ 즉시 음소거/음소거 해제
   - ✅ 우측 상단 배지 변경
   - ✅ 하단 컨트롤바도 동기화
3. 카메라 버튼 클릭
   - ✅ 즉시 비디오 꺼짐/켜짐
   - ✅ 아바타/비디오 전환
   - ✅ 우측 상단 배지 변경

#### D. 그리드 레이아웃 테스트
1. 2명 참여: 좌우 배치, 각 400px 확인
2. 3명 참여: 2x2 그리드, 각 380px 확인
3. 5명 참여: 3x2 그리드, 각 350px 확인
4. 화면 크기 조정: 반응형 동작 확인

---

## 🎯 기대 결과

### 타일 구조 (개별 컨트롤 포함)

```
┌─────────────────────────────┐
│ 홍길동 (나)          🔇 📹❌│ ← 상태 배지
│                             │
│                             │
│      [비디오 영역]          │
│                             │
│                             │
│      (마우스 오버 시)       │
│         🎤    📹            │ ← 개별 컨트롤 버튼
└─────────────────────────────┘
```

### 화면 구성 (2명 접속 시)

```
┌────────────────────────────────────────────────────────────┐
│ 📊 개요  💬 채팅  📢 공지  📁 파일  📅 캘린더  ✅ 할일  📹 화상 ⚙️ │
├───────┬─────────────────────────────────┬──────────────────┤
│       │                                 │ 💬 채팅          │
│ 👥    │  ┌────────────┐  ┌────────────┐│                  │
│참여자 │  │홍길동(나)🔇│  │  김철수 📹 ││ 홍길동    14:23  │
│(2)    │  │            │  │            ││ ┌──────────────┐ │
│       │  │  [비디오]  │  │  [비디오]  ││ │안녕하세요!   │ │
│👑홍길동│  │            │  │            ││ └──────────────┘ │
│🎤 📹  │  │  🎤   📹   │  │            ││                  │
│       │  └────────────┘  └────────────┘│      14:25  김철수│
│김철수  │   (400px)        (400px)      │ ┌──────────────┐ │
│🎤 📹  │                                 │ │반갑습니다!   │ │
│       │                                 │ └──────────────┘ │
├───────┴─────────────────────────────────┴──────────────────┤
│    🎤 음소거    📹 비디오끄기    🖥️ 화면공유    ⚙️    📞 나가기  │
└────────────────────────────────────────────────────────────┘
```

---

## ✅ 완료된 기능

### 고정 크기 타일
- ✅ 4:3 비율 고정
- ✅ 참여자 수에 따른 크기 자동 조정 (500px → 300px)
- ✅ 중앙 정렬 배치
- ✅ 화면을 꽉 채우지 않음
- ✅ 카드 스타일 디자인 (그림자, 둥근 모서리)

### 개별 컨트롤 버튼
- ✅ 본인 타일에만 표시
- ✅ 마우스 오버 시 나타남
- ✅ 마이크/카메라 독립 제어
- ✅ 클릭 즉시 상태 변경
- ✅ 상태 배지 동기화
- ✅ 하단 컨트롤바와 동기화

### 채팅 기능
- ✅ 실시간 메시지 송수신
- ✅ 말풍선 스타일 UI
- ✅ 자신/타인 메시지 구분
- ✅ 시간 표시
- ✅ 자동 스크롤
- ✅ 중복 메시지 방지
- ✅ Enter 키로 전송

---

## 🚀 추가 개선 가능 사항

### 향후 계획
- [ ] 파일 전송 기능
- [ ] 이모지/스티커 지원
- [ ] 메시지 읽음 표시
- [ ] 채팅 알림 효과음
- [ ] 채팅 히스토리 저장
- [ ] 화면 공유 시 레이아웃 조정 (공유 화면 크게, 나머지 작게)
- [ ] 핀 기능 (특정 참여자 고정)
- [ ] 발표자 모드 (발표자 크게, 나머지 작게)

---

## 📋 관련 파일

- ✅ `/coup/src/app/my-studies/[studyId]/video-call/page.jsx` - 메인 페이지
- ✅ `/coup/src/app/my-studies/[studyId]/video-call/page.module.css` - 스타일
- ✅ `/coup/src/components/video-call/VideoTile.jsx` - 비디오 타일
- ✅ `/coup/src/components/video-call/VideoTile.module.css` - 타일 스타일
- ✅ `/signaling-server/handlers/chat.js` - 채팅 핸들러 (이미 구현됨)
- ✅ `/signaling-server/handlers/video.js` - 비디오 핸들러

---

**작성자**: AI Assistant (Claude)  
**최종 업데이트**: 2025-11-19  
**상태**: 완료 ✅

