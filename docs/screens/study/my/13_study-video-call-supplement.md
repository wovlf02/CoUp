# 화상 통화 설계 보완 문서

> 이 문서는 `13_study-video-call.md`의 보완 내용입니다.

---

## 📊 우측 위젯 (화상통화 탭 특화)

### 1️⃣ 스터디 현황 (기본 위젯)

```
┌─────────────────────────────────────┐
│ 📊 스터디 현황                       │
│                                     │
│ 📹 다음 일정                         │
│    D-7  2025.11.13 (수) 14:00      │
│    주간 회의                         │
│                                     │
│ 👥 출석률  ██████████ 85%           │
│    10/12명 (이번 주)                │
│                                     │
│ ✅ 할일   ██████████ 60%            │
│    12/20개 완료                     │
└─────────────────────────────────────┘
```

---

### 2️⃣ 화상 통화 상태 (특화 위젯)

```
┌─────────────────────────────────────┐
│ 📹 화상 통화 상태                    │
│                                     │
│ 현재 참여: 5명 / 12명               │
│                                     │
│ ⏱️ 통화 시간: 00:15:32              │
│                                     │
│ 🌐 네트워크 품질: 양호 ✅            │
│ 📊 평균 지연: 45ms                  │
│ 📡 대역폭: 2.5 Mbps                 │
│                                     │
│ 💾 데이터 사용량: 125 MB            │
│                                     │
│ 🖥️ 화면 공유: 김철수                │
└─────────────────────────────────────┘
```

**실시간 업데이트**:
- WebSocket으로 1초마다 갱신
- 네트워크 품질 자동 감지
- 데이터 사용량 누적 계산

---

### 3️⃣ 통화 중 참여자 (확장 버전)

```
┌─────────────────────────────────────┐
│ 👥 통화 중 (5명)                     │
│                                     │
│ 👑 김철수 (호스트)                  │
│    🎤 ON  📹 ON  🖥️ 공유 중        │
│    [음소거] [강퇴]                   │
│                                     │
│ ⭐ 이영희 (관리자)                  │
│    🎤 ON  📹 ON                     │
│    [음소거]                          │
│                                     │
│ 👤 박민수                            │
│    🔇 MUTE  📹 ON                   │
│    [음소거 해제]                     │
│                                     │
│ 👤 최지은                            │
│    🎤 ON  📹 OFF                    │
│                                     │
│ 👤 정소현                            │
│    🎤 ON  📹 ON  🗣️ 말하는 중      │
│                                     │
│ 💤 오프라인: 7명                     │
│ [전체 멤버 보기 →]                   │
└─────────────────────────────────────┘
```

**호스트 전용 기능**:
- 개별 음소거 버튼 (OWNER/ADMIN)
- 강퇴 버튼 (OWNER/ADMIN)
- 실시간 음성 감지 표시

---

### 4️⃣ 빠른 액션 (화상 특화)

```
┌─────────────────────────────────────┐
│ ⚡ 빠른 액션                         │
│                                     │
│ [💬 채팅 열기]                       │
│ 새 메시지 3개                        │
│                                     │
│ [📁 파일 공유]                       │
│ 드래그해서 공유                      │
│                                     │
│ [📢 공지 작성]                       │
│ 중요 내용 공지                       │
│                                     │
│ [🔗 초대 링크 복사]                  │
│ 멤버 초대하기                        │
│                                     │
│ [⚙️ 설정] [📊 통계]                 │
└─────────────────────────────────────┘
```

---

### 5️⃣ 화상 통화 팁

```
┌─────────────────────────────────────┐
│ 💡 화상 통화 팁                      │
│                                     │
│ ⌨️ 단축키:                          │
│ • M: 음소거 토글                     │
│ • V: 비디오 토글                     │
│ • S: 화면 공유                       │
│ • C: 채팅 열기                       │
│ • ESC: 전체화면 나가기               │
│                                     │
│ 🎯 최적 환경:                        │
│ • 조용한 장소 선택                   │
│ • 안정적인 인터넷 (5Mbps+)          │
│ • 충분한 조명 확보                   │
│ • 이어폰 사용 권장                   │
│                                     │
│ [더 보기 →]                          │
└─────────────────────────────────────┘
```

---

### 6️⃣ 세션 기록 (선택 기능)

```
┌─────────────────────────────────────┐
│ 📹 최근 세션 기록                    │
│                                     │
│ 오늘 (11/7)                          │
│ 🔴 진행 중                           │
│ 15분 32초                            │
│                                     │
│ 11/5 주간 회의                       │
│ 45분 • 참여 8명                     │
│ [요약 보기]                          │
│                                     │
│ 11/2 코드 리뷰                       │
│ 1시간 20분 • 참여 6명               │
│ [요약 보기]                          │
│                                     │
│ [전체 기록 보기 →]                   │
└─────────────────────────────────────┘
```

---

## 🎨 스타일 및 애니메이션

### CSS 스타일

```css
/* 비디오 그리드 */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  padding: 20px;
  background: #111827;
  height: calc(100vh - 160px);
}

/* 비디오 카드 */
.video-card {
  position: relative;
  aspect-ratio: 16/9;
  background: #1F2937;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.video-card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

/* 말하는 중 애니메이션 */
.video-card.speaking {
  border: 3px solid #10B981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { border-color: #10B981; }
  50% { border-color: #34D399; }
}

/* 비디오 스트림 */
.video-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 비디오 오프 시 프로필 */
.video-card.video-off {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
}

/* 참여자 정보 오버레이 */
.participant-info {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.participant-name {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.participant-status {
  display: flex;
  gap: 8px;
}

.status-icon {
  font-size: 16px;
}

.status-icon.muted {
  color: #EF4444;
}

.status-icon.active {
  color: #10B981;
}

/* 네트워크 경고 */
.network-warning {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 화면 공유 영역 */
.screen-share-container {
  grid-column: 1 / -1;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.screen-share-label {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.9);
  color: white;
  border-radius: 8px;
  font-weight: 600;
}

/* 컨트롤 바 */
.control-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(20px);
  padding: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
}

.control-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: #374151;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-button:hover {
  background: #4B5563;
  transform: scale(1.1);
}

.control-button.active {
  background: #6366F1;
}

.control-button.danger {
  background: #EF4444;
}

.control-button.danger:hover {
  background: #DC2626;
}

/* 사이드 패널 */
.side-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 360px;
  background: white;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
  z-index: 50;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.side-panel.open {
  transform: translateX(0);
}

/* 채팅 메시지 */
.chat-message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  max-width: 80%;
}

.chat-message.mine {
  background: #6366F1;
  color: white;
  margin-left: auto;
}

.chat-message.other {
  background: #F3F4F6;
  color: #111827;
}

/* 참여자 리스트 */
.participant-list-item {
  padding: 12px 16px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.participant-controls {
  display: flex;
  gap: 8px;
}

.participant-controls button {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid #D1D5DB;
  background: white;
  font-size: 12px;
  cursor: pointer;
}

.participant-controls button:hover {
  background: #F3F4F6;
}
```

---

## 🎭 상태별 UI 변화

### 1. 정상 연결 상태

```
┌──────────────────────┐
│                      │
│   [비디오 스트림]    │
│                      │
│  김철수 (나)         │
│  🎤 📹              │
└──────────────────────┘
```

### 2. 네트워크 불안정

```
┌──────────────────────┐
│ ⚠️ 연결 불안정       │
│   [비디오 스트림]    │
│   (화질 저하)        │
│  김철수 (나)         │
│  🎤 📹 ⚠️           │
└──────────────────────┘
```

### 3. 음소거 상태

```
┌──────────────────────┐
│                      │
│   [비디오 스트림]    │
│                      │
│  김철수 (나)         │
│  🔇 📹              │
└──────────────────────┘
```

### 4. 비디오 꺼짐

```
┌──────────────────────┐
│                      │
│   [프로필 이미지]    │
│       K              │
│                      │
│  김철수 (나)         │
│  🎤 📹❌            │
└──────────────────────┘
```

### 5. 말하는 중

```
┌──────────────────────┐ ← 초록 테두리 애니메이션
│                      │
│   [비디오 스트림]    │
│                      │
│  김철수 (나) 🗣️     │
│  🎤 📹              │
└──────────────────────┘
```

### 6. 화면 공유 중

```
┌──────────────────────┐
│ 🖥️ 화면 공유 중     │
│   [공유 화면]        │
│                      │
│  김철수 (나)         │
│  🎤 📹              │
└──────────────────────┘
```

---

## 🔄 사용자 플로우

### 플로우 1: 화상 통화 시작

```
Step 1: 내 스터디 대시보드
        ↓
Step 2: [화상] 탭 클릭
        ↓ /my-studies/123/video-call
        
Step 3: 대기실 화면
        - 카메라/마이크 테스트
        - 디바이스 선택
        - 설정 (음소거 시작 등)
        - 현재 참여자 확인
        ↓
        
Step 4: [참여하기] 버튼
        - 권한 확인 (카메라/마이크)
        - WebRTC 연결 시작
        - Socket.io 방 입장
        ↓
        
Step 5: 화상 통화 메인 화면
        - 로컬 비디오 표시
        - 다른 참여자 연결
        - 컨트롤 바 활성화
        ↓
        
Step 6: 기능 사용
        - 음소거/비디오 토글
        - 화면 공유
        - 채팅
        - 참여자 관리
        ↓
        
Step 7: [나가기] 버튼
        - 확인 다이얼로그
        - 연결 종료
        - 스트림 정리
        ↓ /my-studies/123
        
Step 8: 대시보드로 복귀
```

---

### 플로우 2: 화면 공유

```
Step 1: 화상 통화 중
        ↓
Step 2: [🖥️ 화면공유] 클릭
        ↓
        
Step 3: 공유 옵션 선택
        - 전체 화면
        - 창 선택
        - Chrome 탭
        ↓
        
Step 4: 선택 확인
        - 브라우저 공유 다이얼로그
        - [공유] 버튼 클릭
        ↓
        
Step 5: 화면 공유 시작
        - 레이아웃 자동 변경 (발표자 모드)
        - 공유 화면 큰 영역에 표시
        - 참여자들 썸네일로 축소
        - Toast: "화면 공유를 시작했습니다"
        ↓
        
Step 6: 공유 중
        - "🔴 공유 중지" 버튼으로 변경
        - 브라우저 상단에 공유 표시
        ↓
        
Step 7: 공유 중지
        - [공유 중지] 버튼 클릭
        - 또는 브라우저 공유 중지
        ↓
        
Step 8: 원래 레이아웃 복귀
        - 그리드 뷰로 전환
        - 일반 비디오로 복구
        - Toast: "화면 공유가 종료되었습니다"
```

---

### 플로우 3: 참여자 관리 (호스트)

```
Step 1: OWNER/ADMIN으로 통화 중
        ↓
Step 2: [👥 참여자] 버튼 클릭
        ↓
        
Step 3: 참여자 목록 패널 열림
        - 5명 참여 중
        - 각 참여자 상태 확인
        ↓
        
Step 4: 특정 참여자 선택 (예: 박민수)
        - 🎤 ON  📹 ON 상태
        ↓
        
Step 5: [음소거] 버튼 클릭
        - 서버로 음소거 요청
        - 박민수의 오디오 트랙 비활성화
        - Toast (박민수): "호스트가 음소거했습니다"
        ↓
        
Step 6: 음소거 해제 필요 시
        - 박민수가 직접 해제
        - 또는 호스트가 [음소거 해제]
        ↓
        
Step 7: 강퇴 필요 시 (심각한 경우)
        - [강퇴] 버튼 클릭
        - 확인 다이얼로그
        - "정말 강퇴하시겠습니까?"
        ↓
        
Step 8: 강퇴 실행
        - 해당 참여자 연결 종료
        - 강퇴된 사용자에게 알림
        - 다른 참여자들에게 퇴장 알림
```

---

## 🚨 에러 처리 및 복구

### 1. 카메라/마이크 권한 거부

```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  })
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // 권한 거부
    showModal({
      title: '권한 필요',
      message: '화상 통화를 위해 카메라와 마이크 권한이 필요합니다.\n브라우저 설정에서 권한을 허용해주세요.',
      actions: [
        { label: '설정 열기', onClick: openBrowserSettings },
        { label: '오디오만 참여', onClick: joinAudioOnly }
      ]
    })
  } else if (error.name === 'NotFoundError') {
    // 디바이스 없음
    showModal({
      title: '디바이스 없음',
      message: '카메라 또는 마이크를 찾을 수 없습니다.\n연결을 확인해주세요.',
      actions: [
        { label: '오디오만 참여', onClick: joinAudioOnly },
        { label: '취소', onClick: () => router.back() }
      ]
    })
  }
}
```

---

### 2. 네트워크 연결 끊김

```typescript
peer.oniceconnectionstatechange = () => {
  if (peer.iceConnectionState === 'disconnected') {
    // 연결 끊김
    showToast('네트워크 연결이 끊겼습니다. 재연결 중...', 'warning')
    
    // 3초 후 재연결 시도
    setTimeout(() => {
      if (peer.iceConnectionState === 'disconnected') {
        reconnectPeer(userId)
      }
    }, 3000)
  } else if (peer.iceConnectionState === 'failed') {
    // 연결 실패
    showToast('연결에 실패했습니다. 다시 참여해주세요.', 'error')
    removePeer(userId)
  } else if (peer.iceConnectionState === 'connected') {
    // 재연결 성공
    showToast('연결이 복구되었습니다.', 'success')
  }
}
```

---

### 3. 최대 참여자 초과

```typescript
socket.on('room-full', ({ maxParticipants }) => {
  showModal({
    title: '정원 초과',
    message: `현재 최대 참여 인원(${maxParticipants}명)에 도달했습니다.\n나중에 다시 시도해주세요.`,
    actions: [
      { label: '확인', onClick: () => router.back() }
    ]
  })
})
```

---

### 4. 브라우저 미지원

```typescript
const checkBrowserSupport = () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    showModal({
      title: '브라우저 미지원',
      message: '이 브라우저는 화상 통화를 지원하지 않습니다.\nChrome, Firefox, Safari 최신 버전을 사용해주세요.',
      actions: [
        { label: '확인', onClick: () => router.back() }
      ]
    })
    return false
  }
  return true
}
```

---

## 📊 성능 모니터링

### 실시간 통계 수집

```typescript
const collectStats = async (peer: RTCPeerConnection) => {
  const stats = await peer.getStats()
  const report = {
    timestamp: Date.now(),
    video: {
      bitrate: 0,
      packetsLost: 0,
      frameRate: 0,
      resolution: ''
    },
    audio: {
      bitrate: 0,
      packetsLost: 0,
      jitter: 0
    },
    connection: {
      rtt: 0,
      currentRtt: 0
    }
  }
  
  stats.forEach(stat => {
    if (stat.type === 'inbound-rtp' && stat.mediaType === 'video') {
      report.video.bitrate = stat.bytesReceived
      report.video.packetsLost = stat.packetsLost
      report.video.frameRate = stat.framesPerSecond
    } else if (stat.type === 'inbound-rtp' && stat.mediaType === 'audio') {
      report.audio.bitrate = stat.bytesReceived
      report.audio.packetsLost = stat.packetsLost
      report.audio.jitter = stat.jitter
    } else if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
      report.connection.rtt = stat.currentRoundTripTime * 1000
    }
  })
  
  return report
}

// 5초마다 통계 수집
setInterval(async () => {
  const stats = await collectStats(peer)
  updateQualityIndicator(stats)
  
  // 품질 저하 감지
  if (stats.connection.rtt > 200) {
    showWarning('네트워크 지연이 높습니다')
  }
  if (stats.video.packetsLost > 100) {
    showWarning('패킷 손실이 발생하고 있습니다')
  }
}, 5000)
```

---

## 🎯 최적화 전략

### 1. 대역폭 적응형 스트리밍

```typescript
const adaptBitrate = (availableBandwidth: number) => {
  let maxBitrate
  
  if (availableBandwidth > 2000000) {
    // 고화질 (2 Mbps 이상)
    maxBitrate = 1500000
  } else if (availableBandwidth > 500000) {
    // 중화질 (500 Kbps ~ 2 Mbps)
    maxBitrate = 500000
  } else {
    // 저화질 (500 Kbps 미만)
    maxBitrate = 250000
  }
  
  // 비트레이트 제한 적용
  const sender = peer.getSenders().find(s => s.track?.kind === 'video')
  if (sender) {
    const parameters = sender.getParameters()
    if (!parameters.encodings) {
      parameters.encodings = [{}]
    }
    parameters.encodings[0].maxBitrate = maxBitrate
    sender.setParameters(parameters)
  }
}
```

---

### 2. 참여자 수에 따른 품질 조정

```typescript
const adjustQualityByParticipants = (count: number) => {
  if (count <= 4) {
    // 고화질 유지
    return { width: 1280, height: 720, frameRate: 30 }
  } else if (count <= 9) {
    // 중화질
    return { width: 640, height: 480, frameRate: 24 }
  } else {
    // 저화질
    return { width: 320, height: 240, frameRate: 15 }
  }
}
```

---

## ✅ 최종 체크리스트

### 필수 기능
- [x] WebRTC P2P 연결
- [x] 음소거/비디오 토글
- [x] 화면 공유
- [x] 참여자 목록
- [x] 채팅 통합
- [x] 네트워크 품질 표시
- [x] 우측 위젯 (통화 상태)

### 선택 기능
- [ ] 녹화 기능
- [ ] 가상 배경
- [ ] 뷰티 필터
- [ ] 화이트보드
- [ ] 투표 기능
- [ ] 손들기 기능

### 최적화
- [x] 적응형 비트레이트
- [x] 네트워크 상태 모니터링
- [x] 자동 품질 조정
- [x] 에러 복구
- [x] 반응형 UI

---

**이전 문서**: `13_study-video-call.md` (메인 문서)
**통합 시기**: 메인 문서에 위젯 및 상세 구현 섹션 추가
