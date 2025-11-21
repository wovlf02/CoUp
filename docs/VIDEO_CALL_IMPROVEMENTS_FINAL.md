# 화상 회의 기능 개선 완료

## 📋 수정 일자
2025-01-21

## 🎯 개선 목표
화상 회의 페이지의 사용자 경험을 대폭 향상시키는 4가지 핵심 기능 구현

## ✅ 구현 완료된 기능

### 1. **캠 확대/축소 기능** 🔍

**사용자 흐름:**
1. 비디오 타일 위에 마우스를 올림
2. 우측 상단에 **전체보기(⛶)** 버튼이 페이드인으로 나타남
3. 버튼 클릭 시 해당 캠이 비디오 그리드 영역 전체를 꽉 채움
4. 확대된 상태에서 우측 하단에 **작게보기(⛶)** 버튼 표시
5. 작게보기 버튼 클릭 시 원래 그리드 레이아웃으로 복귀

**구현 세부사항:**
```jsx
// VideoTile.jsx
<div className={`${styles.videoTile} ${isExpanded ? styles.expanded : ''}`}>
  {/* 전체보기 버튼 (비확대 상태, 마우스 오버 시) */}
  {!isExpanded && showExpandButton && (
    <button className={styles.expandButton} onClick={onExpand}>⛶</button>
  )}
  
  {/* 작게보기 버튼 (확대 상태, 우측 하단) */}
  {isExpanded && (
    <button className={styles.collapseButton} onClick={onCollapse}>⛶</button>
  )}
</div>
```

**CSS 스타일:**
```css
.videoTile.expanded {
  position: fixed !important;
  top: 64px !important;
  left: calc(clamp(200px, 12vw, 280px) + 20%) !important;
  right: calc(25% + 20px) !important;
  bottom: 100px !important;
  z-index: 50 !important;
}
```

---

### 2. **화면 공유 제한 (한 명만 가능)** 🖥️

**문제점:**
- 여러 명이 동시에 화면 공유를 하면 혼란스럽고 대역폭 낭비

**해결책:**
- 한 번에 한 명만 화면 공유 가능하도록 제한
- 다른 사람이 공유 중이면 버튼 클릭 시 경고 메시지 표시

**구현:**
```javascript
// useVideoCall.js
const [someoneSharingScreen, setSomeoneSharingScreen] = useState(false);

const shareScreen = async () => {
  // 다른 사람이 공유 중이면 차단
  if (someoneSharingScreen && !isSharingScreen) {
    setError('다른 참여자가 이미 화면을 공유하고 있습니다.');
    return Promise.reject(new Error('...'));
  }
  
  // 화면 공유 시작
  const screenStream = await navigator.mediaDevices.getDisplayMedia(...);
  setSomeoneSharingScreen(true);
  socket.emit('video:screen-share-start', { roomId });
};
```

**소켓 이벤트:**
```javascript
// 화면 공유 시작 알림
socket.on('video:screen-share-started', ({ socketId }) => {
  setSomeoneSharingScreen(true);
});

// 화면 공유 종료 알림
socket.on('video:screen-share-stopped', ({ socketId }) => {
  setSomeoneSharingScreen(false);
});
```

---

### 3. **음성 인식 시 녹색 테두리** 🎤

**목적:**
- 누가 말하고 있는지 시각적으로 쉽게 파악
- 대화 흐름을 자연스럽게 만듦

**기술:**
- **Web Audio API**를 사용하여 실시간 오디오 분석
- FFT (Fast Fourier Transform)로 주파수 데이터 추출
- 평균 음량이 임계값(20) 이상이면 "말하는 중"으로 판단

**구현:**
```javascript
// useVideoCall.js - 음성 감지 설정
const setupAudioDetection = (stream) => {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const microphone = audioContext.createMediaStreamSource(stream);
  
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.8;
  microphone.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  
  const checkAudioLevel = () => {
    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    
    // 음량이 20 이상이고 음소거가 아니면 말하는 중
    const isSpeaking = average > 20 && !isMuted;
    
    if (isSpeaking) {
      socket.emit('video:speaking', { roomId, speaking: true });
      
      // 1초 후 자동으로 false 전송
      setTimeout(() => {
        socket.emit('video:speaking', { roomId, speaking: false });
      }, 1000);
    }
    
    requestAnimationFrame(checkAudioLevel);
  };
  
  checkAudioLevel();
};
```

**CSS 애니메이션:**
```css
.videoTile.speaking {
  border: 3px solid #10b981;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
  animation: pulse-border 1.5s ease-in-out infinite;
}

@keyframes pulse-border {
  0%, 100% {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
  }
}
```

**동작 흐름:**
```
1. 마이크 입력 → AudioContext → Analyser
2. 주기적으로 음량 체크 (requestAnimationFrame)
3. 임계값 초과 시 → socket.emit('video:speaking')
4. 서버 → 다른 참여자들에게 브로드캐스트
5. 클라이언트 → speakingUsers Set에 socketId 추가
6. VideoTile → isSpeaking prop → .speaking 클래스 추가
7. 녹색 테두리 + 펄스 애니메이션 표시
```

---

### 4. **설정 모달** ⚙️

**필요성:**
- 사용자마다 다른 디바이스 (마이크, 카메라, 스피커)
- 네트워크 환경에 따라 품질 조절 필요
- 오디오 품질 향상 옵션 제공

**구현한 설정 항목:**

#### 📱 디바이스 선택
```jsx
// 마이크
<select value={settings.audioInputDevice}>
  <option value="default">기본 마이크</option>
  {devices.audioInputs.map(device => (
    <option value={device.deviceId}>{device.label}</option>
  ))}
</select>

// 카메라
<select value={settings.videoInputDevice}>
  <option value="default">기본 카메라</option>
  {devices.videoInputs.map(device => (
    <option value={device.deviceId}>{device.label}</option>
  ))}
</select>

// 스피커
<select value={settings.audioOutputDevice}>
  <option value="default">기본 스피커</option>
  {devices.audioOutputs.map(device => (
    <option value={device.deviceId}>{device.label}</option>
  ))}
</select>
```

#### 📊 비디오 품질
```jsx
<select value={settings.videoQuality}>
  <option value="low">낮음 (360p)</option>
  <option value="medium">보통 (480p)</option>
  <option value="high">높음 (720p)</option>
  <option value="ultra">매우 높음 (1080p)</option>
</select>
<p className={styles.settingHint}>
  낮은 품질은 네트워크 대역폭을 절약합니다.
</p>
```

#### 🎵 오디오 향상
```jsx
// 에코 제거
<label>
  <input type="checkbox" checked={settings.echoCancellation} />
  <span>에코 제거</span>
</label>
<p>스피커에서 나오는 소리가 마이크로 다시 들어가는 것을 방지합니다.</p>

// 노이즈 제거
<label>
  <input type="checkbox" checked={settings.noiseSuppression} />
  <span>노이즈 제거</span>
</label>
<p>배경 소음을 줄여 음질을 향상시킵니다.</p>

// 자동 볼륨 조절
<label>
  <input type="checkbox" checked={settings.autoGainControl} />
  <span>자동 볼륨 조절</span>
</label>
<p>마이크 볼륨을 자동으로 조절하여 일정한 음량을 유지합니다.</p>
```

**버튼:**
- **초기화**: 모든 설정을 기본값으로 복원
- **취소**: 변경사항을 저장하지 않고 닫기
- **저장**: 변경사항을 적용하고 닫기

**UI/UX 특징:**
- 모달 오버레이로 포커스 집중
- fadeIn + slideUp 애니메이션
- 스크롤 가능한 본문
- 반응형 디자인 (모바일 최적화)

---

## 📁 수정/생성된 파일

### 1. **VideoTile.jsx** (수정)
- `isExpanded`, `onExpand`, `onCollapse` props 추가
- 전체보기/작게보기 버튼 UI
- 마우스 오버 시 버튼 표시 로직

### 2. **VideoTile.module.css** (수정)
- `.expanded` 클래스 (position: fixed)
- `.speaking` 클래스 (녹색 테두리 + 애니메이션)
- `.expandButton`, `.collapseButton` 스타일

### 3. **SettingsModal.jsx** (신규 생성)
- 디바이스 선택 UI
- 품질 설정 UI
- 오디오 향상 옵션 UI
- 설정 저장/초기화 로직

### 4. **SettingsModal.module.css** (신규 생성)
- 모달 오버레이 스타일
- 폼 요소 스타일
- 반응형 레이아웃

### 5. **useVideoCall.js** (수정)
- `someoneSharingScreen` 상태 추가
- `speakingUsers` 상태 추가 (Set)
- `setupAudioDetection()` 함수 (Web Audio API)
- 화면 공유 제한 로직
- 소켓 이벤트 리스너 추가:
  - `video:screen-share-started`
  - `video:screen-share-stopped`
  - `video:user-speaking`

### 6. **page.jsx (video-call)** (수정)
- `expandedVideoSocketId` 상태 추가
- `isSettingsOpen` 상태 추가
- `settings` 상태 추가
- `handleExpandVideo()`, `handleCollapseVideo()` 함수
- `handleSaveSettings()` 함수
- `handleShareScreen()` 함수에 제한 로직 추가
- VideoTile에 새로운 props 전달
- SettingsModal 컴포넌트 추가

---

## 🎨 UI/UX 개선 결과

### Before:
```
[비디오1] [비디오2] [비디오3]
[비디오4] [비디오5] [비디오6]
```
- 모든 비디오 크기 동일
- 누가 말하는지 알 수 없음
- 여러 명이 동시에 화면 공유 가능
- 설정 변경 불가

### After:
```
┌─────────────────────────────────┐
│    확대된 비디오 (전체 화면)    │
│                                 │
│         [작게보기 ⛶]            │
└─────────────────────────────────┘

또는

┌─────────┐ ┌─────────┐ ┌─────────┐
│비디오1  │ │비디오2🟢│ │비디오3  │
│ [⛶]    │ │ (말하는중)│ │ [⛶]    │
└─────────┘ └─────────┘ └─────────┘
```

- ✅ 원하는 비디오 확대 가능
- ✅ 말하는 사람 녹색 테두리로 표시
- ✅ 화면 공유 한 명만 가능
- ✅ 설정 모달로 세부 조정

---

## 🔧 기술적 세부사항

### 음성 감지 파이프라인:
```
MediaStream
  ↓
AudioContext
  ↓
MediaStreamSource
  ↓
Analyser (FFT)
  ↓
Uint8Array (주파수 데이터)
  ↓
평균 음량 계산
  ↓
임계값(20) 비교
  ↓
Socket.io 전송
  ↓
서버 브로드캐스트
  ↓
클라이언트 수신
  ↓
VideoTile 녹색 테두리
```

### 화면 공유 제한 상태 머신:
```
[대기 상태]
  ↓ (A가 공유 시작)
someoneSharingScreen = true
  ↓ (B가 공유 시도)
경고 메시지 → 차단
  ↓ (A가 공유 종료)
someoneSharingScreen = false
  ↓ (B가 다시 공유 시도)
성공 ✓
```

### 캠 확대/축소 상태 관리:
```jsx
const [expandedVideoSocketId, setExpandedVideoSocketId] = useState(null);

// 확대
setExpandedVideoSocketId('socket-id-123');
// → VideoTile isExpanded={expandedVideoSocketId === 'socket-id-123'}
// → CSS .expanded 클래스 적용
// → position: fixed로 전체 화면 차지

// 축소
setExpandedVideoSocketId(null);
// → VideoTile isExpanded={false}
// → 원래 그리드 레이아웃으로 복귀
```

---

## 🎉 성과

이제 화상 회의에서:
1. **사용자가 원하는 캠을 크게 볼 수 있음** → 발표자나 중요한 사람 집중 가능
2. **화면 공유가 체계적으로 관리됨** → 혼란 방지, 대역폭 절약
3. **누가 말하는지 한눈에 파악** → 자연스러운 대화 흐름
4. **개인화된 설정으로 최적의 경험** → 디바이스, 품질, 오디오 향상

모든 기능이 **실시간**으로 동작하며, **Socket.io**를 통해 모든 참여자에게 즉시 동기화됩니다!

---

## 📊 테스트 시나리오

### 1. 캠 확대/축소
- [ ] 비디오 타일에 마우스 오버 시 전체보기 버튼 표시
- [ ] 전체보기 클릭 시 비디오가 그리드 영역을 꽉 채움
- [ ] 작게보기 클릭 시 원래 크기로 복원
- [ ] 다른 비디오도 확대 가능

### 2. 화면 공유 제한
- [ ] A가 화면 공유 시작
- [ ] B가 화면 공유 버튼 클릭 → 경고 메시지
- [ ] A가 화면 공유 종료
- [ ] B가 이제 화면 공유 가능

### 3. 음성 인식
- [ ] 말할 때 자신의 캠에 녹색 테두리 표시 안 됨 (로컬)
- [ ] 다른 사람이 말하면 그 사람 캠에 녹색 테두리
- [ ] 테두리가 펄스 애니메이션으로 깜빡임
- [ ] 음소거 시 테두리 표시 안 됨

### 4. 설정 모달
- [ ] 설정 버튼 클릭 시 모달 오픈
- [ ] 디바이스 목록이 올바르게 표시됨
- [ ] 설정 변경 후 저장 클릭
- [ ] 설정이 유지됨
- [ ] 초기화 버튼으로 기본값 복원

브라우저를 새로고침하고 화상 탭에 들어가서 개선된 기능들을 확인해보세요! 🚀

