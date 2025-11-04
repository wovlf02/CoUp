# 13. 스터디 화상 통화 (Study Video Call)

> **화면 ID**: `STUDY-07`  
> **라우트**: `/studies/[studyId]/video-call`  
> **레이아웃**: 전체 화면 (네비게이션 없음)  
> **렌더링**: CSR (WebRTC)

---

## 📐 화면 구조

```
┌──────────────────────────────────────────────────────────┐
│  📚 코딩테스트 마스터 스터디                        [나가기]│
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │            │  │            │  │            │        │
│  │  김철수(나)│  │  이영희    │  │  박민수    │        │
│  │            │  │            │  │            │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │            │  │            │  │            │        │
│  │  최지훈    │  │  강서연    │  │  + 초대    │        │
│  │            │  │            │  │            │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│        [🎤] [📹] [🖥️ 화면공유] [💬 채팅] [나가기]        │
└──────────────────────────────────────────────────────────┘
```

---

## 🎨 섹션별 상세 설계

### 1. 상단 헤더 (반투명, 상단 고정)
```
┌──────────────────────────────────────────────────────────┐
│  📚 코딩테스트 마스터 스터디              [나가기]        │
└──────────────────────────────────────────────────────────┘
```

**좌측**: 스터디명
**우측**: [나가기] 버튼 (Danger)

---

### 2. 비디오 그리드
```
┌────────────┐  ┌────────────┐  ┌────────────┐
│            │  │            │  │            │
│  Video 1   │  │  Video 2   │  │  Video 3   │
│  김철수(나) │  │  이영희    │  │  박민수    │
│  [🎤OFF]   │  │            │  │            │
└────────────┘  └────────────┘  └────────────┘

┌────────────┐  ┌────────────┐  ┌────────────┐
│            │  │            │  │  + 초대    │
│  Video 4   │  │  Video 5   │  │  멤버 초대 │
│  최지훈    │  │  강서연    │  │            │
└────────────┘  └────────────┘  └────────────┘
```

**그리드 레이아웃**:
- 1명: 1×1 (전체 화면)
- 2명: 1×2 (수평 분할)
- 3-4명: 2×2
- 5-6명: 2×3 (최대 지원)

**비디오 타일**:
- 배경: 검은색
- 비디오 element (object-fit: cover)
- 하단 오버레이:
  - 이름 (좌측 하단, 반투명 배경)
  - 마이크 상태 아이콘 (음소거 시 빨간색)
- 테두리: 말하는 사람 강조 (primary-500, 2px)

**내 화면 표시**:
- "(나)" 표시
- 좌우 반전 (거울 모드)
- 항상 첫 번째 위치

---

### 3. 하단 컨트롤 바 (반투명, 하단 고정)
```
┌──────────────────────────────────────────────────────────┐
│     [🎤] [📹] [🖥️ 화면공유] [💬 채팅] [⚙️] [나가기]      │
└──────────────────────────────────────────────────────────┘
```

**버튼 목록**:

1. **🎤 마이크** (토글)
   - On: 회색 배경
   - Off: 빨간색 배경 + 취소선
   
2. **📹 카메라** (토글)
   - On: 회색 배경
   - Off: 빨간색 배경 + 취소선

3. **🖥️ 화면 공유** (토글)
   - 클릭 → 화면 선택 → 공유 시작
   - 공유 중: 파란색 배경

4. **💬 채팅** (토글)
   - 클릭 → 우측 사이드 패널 열림
   - 새 메시지: 배지 표시

5. **⚙️ 설정** (드롭다운)
   - 카메라 선택
   - 마이크 선택
   - 스피커 선택

6. **나가기** (Danger)
   - 확인 다이얼로그 → 통화 종료

**버튼 스타일**:
- 크기: 56px × 56px (원형)
- 배경: rgba(255, 255, 255, 0.2)
- 아이콘: 24px
- Hover: 배경 밝게

---

### 4. 채팅 사이드 패널 (우측)
```
┌────────────────────────────┐
│ 채팅                  [X] │
├────────────────────────────┤
│                            │
│ [김철수] 10:30             │
│ 화면 보이시나요?           │
│                            │
│         네, 잘 보여요 [나] │
│                  10:31     │
│                            │
│ [이영희] 10:32             │
│ 소리가 작게 들려요          │
│                            │
├────────────────────────────┤
│ [메시지 입력...]   [전송] │
└────────────────────────────┘
```

**너비**: 320px
**배경**: 반투명 검은색
**채팅**: 일반 채팅과 동일 (실시간)

---

## 🎬 인터랙션

### WebRTC 연결 흐름
```javascript
// 1. 로컬 미디어 스트림 획득
const localStream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
})

// 2. 방 입장 (Socket.IO)
socket.emit('join_video_call', { studyId })

// 3. 기존 참여자와 Peer 연결 생성
socket.on('existing_users', ({ users }) => {
  users.forEach(user => {
    const peer = createPeer(user.socketId, localStream)
    peers[user.socketId] = peer
  })
})

// 4. SDP Offer/Answer 교환
peer.on('signal', (signal) => {
  socket.emit('offer', { targetSocketId, offer: signal })
})

socket.on('answer', ({ fromSocketId, answer }) => {
  peers[fromSocketId].signal(answer)
})

// 5. 원격 스트림 수신
peer.on('stream', (remoteStream) => {
  setRemoteStreams(prev => [...prev, remoteStream])
})
```

### 마이크/카메라 토글
```javascript
const toggleAudio = () => {
  const audioTrack = localStream.getAudioTracks()[0]
  audioTrack.enabled = !audioTrack.enabled
  setIsAudioEnabled(audioTrack.enabled)
}

const toggleVideo = () => {
  const videoTrack = localStream.getVideoTracks()[0]
  videoTrack.enabled = !videoTrack.enabled
  setIsVideoEnabled(videoTrack.enabled)
}
```

### 화면 공유
```javascript
const shareScreen = async () => {
  const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: true
  })
  
  // 모든 Peer에게 화면 공유 스트림 전송
  Object.values(peers).forEach(peer => {
    const videoTrack = screenStream.getVideoTracks()[0]
    peer.replaceTrack(
      localStream.getVideoTracks()[0],
      videoTrack,
      localStream
    )
  })
  
  // 화면 공유 종료 시 다시 카메라로 전환
  screenStream.getVideoTracks()[0].onended = () => {
    const cameraTrack = localStream.getVideoTracks()[0]
    Object.values(peers).forEach(peer => {
      peer.replaceTrack(videoTrack, cameraTrack, localStream)
    })
  }
}
```

---

## 📱 반응형 설계

### Desktop (1280px+)
- 비디오 그리드: 2×3 또는 3×2
- 채팅: 우측 사이드 패널

### Tablet (768-1279px)
- 비디오 그리드: 2×2
- 채팅: 전체 화면 오버레이

### Mobile (<768px)
- 비디오 그리드: 1×2 (수직 배치)
- 컨트롤 바: 아이콘만 (텍스트 제거)
- 채팅: 전체 화면 모달

---

## 🎨 스타일 코드

```css
/* 전체 화면 컨테이너 */
.video-call-container {
  width: 100vw;
  height: 100vh;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
}

/* 비디오 그리드 */
.video-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 16px;
}

/* 비디오 타일 */
.video-tile {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.video-tile video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-tile.speaking {
  border: 2px solid var(--primary-500);
}

/* 이름 오버레이 */
.video-name {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
}

/* 컨트롤 바 */
.control-bar {
  background: rgba(0, 0, 0, 0.8);
  padding: 16px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.control-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.control-button.off {
  background: var(--danger-500);
}

.control-button.danger {
  background: var(--danger-500);
}
```

---

## 📐 ASCII 스케치

```
┌──────────────────────────────────────────────────────────┐
│ 📚 코딩테스트 스터디                            [나가기] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                │
│  │ Video 1 │  │ Video 2 │  │ Video 3 │                │
│  │ 김철수  │  │ 이영희  │  │ 박민수  │                │
│  └─────────┘  └─────────┘  └─────────┘                │
│                                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                │
│  │ Video 4 │  │ Video 5 │  │ + 초대  │                │
│  │ 최지훈  │  │ 강서연  │  │         │                │
│  └─────────┘  └─────────┘  └─────────┘                │
│                                                          │
├──────────────────────────────────────────────────────────┤
│   [🎤] [📹] [🖥️] [💬] [⚙️] [나가기]                     │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ 완료 체크리스트

- [ ] 로컬 미디어 스트림 획득
- [ ] WebRTC Peer 연결 (Mesh)
- [ ] SDP/ICE 교환 (시그널링)
- [ ] 비디오 그리드 레이아웃
- [ ] 마이크 토글
- [ ] 카메라 토글
- [ ] 화면 공유
- [ ] 채팅 사이드 패널
- [ ] 말하는 사람 강조
- [ ] 참여자 입장/퇴장 처리

---

**다음 화면**: `14_study-settings.md` ~ `16_notifications.md`
