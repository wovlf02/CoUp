# 현재 구현 상태

> **작성일**: 2025-11-19  
> **분석 대상**: 프론트엔드/백엔드 코드베이스  
> **목적**: 구현된 기능과 미구현 기능 파악

---

## 📋 목차

1. [전체 요약](#1-전체-요약)
2. [프론트엔드 구현 상태](#2-프론트엔드-구현-상태)
3. [백엔드 구현 상태](#3-백엔드-구현-상태)
4. [테스트 상태](#4-테스트-상태)
5. [이슈 및 버그](#5-이슈-및-버그)

---

## 1. 전체 요약

### 1.1 구현 완료 ✅

| 항목 | 상태 | 설명 |
|-----|------|------|
| UI 레이아웃 | ✅ | 대기실 + 전체화면 모드 완료 |
| 컴포넌트 구조 | ✅ | VideoTile, ControlBar 분리 |
| 소켓 연결 | ✅ | Socket.io 클라이언트/서버 설정 |
| 인증 미들웨어 | ✅ | Socket.io 연결 시 사용자 인증 |
| 로컬 스트림 | ✅ | 카메라/마이크 획득 |
| 음소거/비디오 토글 | ✅ | 클라이언트 측 제어 |
| 화면 공유 | ✅ | 기본 구조 구현 |

### 1.2 부분 구현 ⚠️

| 항목 | 상태 | 설명 |
|-----|------|------|
| WebRTC 연결 | ⚠️ | 구조는 있으나 실제 P2P 연결 미검증 |
| 시그널링 | ⚠️ | 이벤트 핸들러 구현되었으나 테스트 필요 |
| 참여자 관리 | ⚠️ | 목록 표시만 됨, 제어 기능 미구현 |
| 에러 처리 | ⚠️ | 기본적인 에러만 처리 |

### 1.3 미구현 ❌

| 항목 | 상태 | 설명 |
|-----|------|------|
| 데이터베이스 스키마 | ❌ | 세션 기록 저장 구조 없음 |
| REST API | ❌ | 화상회의 관련 API 없음 |
| 참여자 제어 (호스트) | ❌ | 음소거/강퇴 기능 없음 |
| 채팅 통합 | ❌ | 화상회의 중 채팅 미연동 |
| 통화 품질 모니터링 | ❌ | 네트워크 통계 수집 없음 |
| 우측 위젯 | ❌ | 특화 위젯 미구현 |
| 레이아웃 모드 전환 | ❌ | 그리드/발표자 모드 자동 전환 없음 |
| 말하는 중 표시 | ❌ | 음성 감지 없음 |
| 자동 재연결 | ❌ | 연결 끊김 시 복구 로직 없음 |

---

## 2. 프론트엔드 구현 상태

### 2.1 페이지 구조

#### 파일: `/coup/src/app/my-studies/[studyId]/video-call/page.jsx`

**✅ 구현된 기능**:
- 대기실 화면 (참여 전)
- 전체 화면 모드 (참여 후)
- 비디오 그리드 레이아웃
- 컨트롤 바
- 통화 시간 카운터

**❌ 미구현 기능**:
- 우측 사이드바 위젯 (통화 중)
- 채팅 패널
- 참여자 제어 패널
- 설정 모달
- 네트워크 품질 표시

**코드 분석**:

```javascript
// 대기실 상태 관리
const [isInCall, setIsInCall] = useState(false);

// ✅ 구현됨: 참여하기
const handleJoinCall = async () => {
  try {
    await joinRoom(true, true);
    setIsInCall(true);
  } catch (err) {
    alert(error || '화상회의 입장에 실패했습니다.');
  }
};

// ✅ 구현됨: 나가기
const handleLeaveCall = () => {
  if (confirm('정말 통화를 종료하시겠습니까?')) {
    leaveRoom();
    setIsInCall(false);
    router.push(`/my-studies/${studyId}`);
  }
};

// ✅ 구현됨: 화면 공유
const handleShareScreen = () => {
  if (isSharingScreen) {
    stopScreenShare();
  } else {
    shareScreen().catch(() => {
      alert('화면 공유에 실패했습니다.');
    });
  }
};
```

**개선 필요 사항**:
1. 에러 처리를 alert 대신 Toast 컴포넌트 사용
2. 로딩 상태 추가
3. 디바이스 선택 UI 추가
4. 참여자 정보 표시 강화

### 2.2 useVideoCall 훅

#### 파일: `/coup/src/lib/hooks/useVideoCall.js`

**✅ 구현된 기능**:

```javascript
// 로컬 스트림 초기화
const initLocalStream = useCallback(async (videoEnabled, audioEnabled) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: videoEnabled ? { width: 1280, height: 720 } : false,
    audio: audioEnabled ? { echoCancellation: true } : false
  });
  // ✅ 설정 적절함
});

// Peer Connection 생성
const createPeerConnection = useCallback((socketId, isInitiator) => {
  const peer = new RTCPeerConnection(iceServersRef.current);
  
  // ✅ 로컬 트랙 추가
  localStreamRef.current.getTracks().forEach(track => {
    peer.addTrack(track, localStreamRef.current);
  });
  
  // ✅ 원격 스트림 수신
  peer.ontrack = (event) => {
    const [remoteStream] = event.streams;
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.set(socketId, remoteStream);
      return newMap;
    });
  };
  
  // ✅ ICE Candidate 전송
  peer.onicecandidate = (event) => {
    if (event.candidate && socket) {
      socket.emit('video:ice-candidate', {
        to: socketId,
        candidate: event.candidate
      });
    }
  };
  
  // ⚠️ 연결 상태 모니터링 (로깅만 함)
  peer.onconnectionstatechange = () => {
    console.log(`Peer connection state (${socketId}):`, peer.connectionState);
    if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
      cleanupPeer(socketId);
    }
  };
});

// ✅ 방 입장
const joinRoom = useCallback(async (videoEnabled, audioEnabled) => {
  await initLocalStream(videoEnabled, audioEnabled);
  socket.emit('video:join-room', { studyId, roomId });
});

// ✅ 방 나가기
const leaveRoom = useCallback(() => {
  // 스트림 정리
  if (localStreamRef.current) {
    localStreamRef.current.getTracks().forEach(track => track.stop());
  }
  
  // Peer Connection 정리
  peersRef.current.forEach((peer, socketId) => {
    peer.close();
  });
  
  socket.emit('video:leave-room', { roomId });
});

// ✅ 음소거 토글
const toggleMute = useCallback(() => {
  const audioTrack = localStreamRef.current.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    const newMutedState = !audioTrack.enabled;
    setIsMuted(newMutedState);
    socket.emit('video:toggle-audio', { roomId, isMuted: newMutedState });
  }
});

// ✅ 비디오 토글
const toggleVideo = useCallback(() => {
  const videoTrack = localStreamRef.current.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    const newVideoOffState = !videoTrack.enabled;
    setIsVideoOff(newVideoOffState);
    socket.emit('video:toggle-video', { roomId, isVideoOff: newVideoOffState });
  }
});

// ✅ 화면 공유
const shareScreen = useCallback(async () => {
  const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: { cursor: 'always' }
  });
  
  const screenTrack = screenStream.getVideoTracks()[0];
  
  // 모든 Peer의 비디오 트랙 교체
  peersRef.current.forEach(peer => {
    const sender = peer.getSenders().find(s => s.track?.kind === 'video');
    if (sender) {
      sender.replaceTrack(screenTrack);
    }
  });
  
  socket.emit('video:screen-share-start', { roomId });
  
  // 종료 시 복구
  screenTrack.onended = () => {
    stopScreenShare();
  };
});
```

**⚠️ 개선 필요 사항**:

1. **에러 복구 로직 없음**
   ```javascript
   // 현재: 그냥 정리만 함
   if (peer.connectionState === 'failed') {
     cleanupPeer(socketId);
   }
   
   // 필요: 재연결 시도
   if (peer.connectionState === 'failed') {
     await retryConnection(socketId, 3); // 3회 재시도
   }
   ```

2. **네트워크 통계 수집 없음**
   ```javascript
   // 추가 필요
   const getConnectionStats = async (peer) => {
     const stats = await peer.getStats();
     // latency, bandwidth, packet loss 등 수집
   };
   ```

3. **음성 감지 없음**
   ```javascript
   // 추가 필요
   const detectSpeaking = (stream) => {
     const audioContext = new AudioContext();
     const analyser = audioContext.createAnalyser();
     // 음량 레벨 감지하여 speaking 상태 업데이트
   };
   ```

**❌ 미구현 기능**:
- 자동 재연결
- 네트워크 품질 모니터링
- 음성 감지 (말하는 중 표시)
- 대역폭 적응형 품질 조정
- 가상 배경

### 2.3 VideoTile 컴포넌트

#### 파일: `/coup/src/components/video-call/VideoTile.jsx`

**✅ 구현된 기능**:
- 비디오 스트림 렌더링
- 비디오 꺼짐 시 프로필 표시
- 음소거/비디오 오프 아이콘
- 로컬/원격 구분 표시

```javascript
// ✅ 비디오 렌더링
<video
  ref={videoRef}
  autoPlay
  playsInline
  muted={isLocal}  // 로컬은 음소거 (에코 방지)
  className={styles.video}
/>

// ✅ 비디오 오프 시 아바타
{isVideoOff || !stream ? (
  <div className={styles.avatarContainer}>
    <div className={styles.avatar}>
      {user?.name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  </div>
) : (
  // 비디오
)}

// ✅ 상태 표시
<div className={styles.overlay}>
  <div className={styles.name}>
    {user?.name || 'Unknown'}
    {isLocal && ' (나)'}
  </div>
  <div className={styles.indicators}>
    {isMuted && <span>🔇</span>}
    {isVideoOff && <span>📹❌</span>}
  </div>
</div>
```

**⚠️ 부분 구현**:
- `isSpeaking` prop은 받지만 사용되지 않음
  ```javascript
  // 있음
  const VideoTile = ({ isSpeaking, ... }) => { ... }
  
  // 사용되지 않음 (부모에서 전달 안 됨)
  className={`${styles.videoTile} ${isSpeaking ? styles.speaking : ''}`}
  ```

**❌ 미구현 기능**:
- 네트워크 경고 표시
- 통계 오버레이 (fps, 해상도 등)
- 더블클릭으로 전체화면
- 컨텍스트 메뉴 (우클릭)

### 2.4 ControlBar 컴포넌트

#### 파일: `/coup/src/components/video-call/ControlBar.jsx`

**✅ 구현된 기능**:
- 음소거/비디오 토글 버튼
- 화면 공유 버튼
- 설정 버튼 (기능 없음)
- 나가기 버튼
- 통화 시간 표시

```javascript
// ✅ 버튼 구조 적절
<button
  className={`${styles.controlButton} ${isMuted ? styles.active : ''}`}
  onClick={onToggleMute}
  title={isMuted ? '음소거 해제' : '음소거'}
>
  {isMuted ? '🔇' : '🎤'}
</button>
```

**❌ 미구현 기능**:
- 채팅 버튼
- 참여자 목록 버튼
- 레이아웃 전환 버튼
- 키보드 단축키 (M, V, S 등)
- 디바이스 선택 드롭다운

### 2.5 useSocket 훅

#### 파일: `/coup/src/lib/hooks/useSocket.js`

**✅ 구현된 기능**:
- Socket.io 클라이언트 초기화
- 사용자 인증 (userId 전달)
- 연결 상태 관리
- Transport 정보 (WebSocket/Polling)

```javascript
// ✅ 인증 포함 연결
socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
  auth: {
    userId: user.id
  },
  transports: ['websocket', 'polling']
});

// ✅ 연결 이벤트
socket.on('connect', () => {
  setIsConnected(true);
});

socket.on('disconnect', () => {
  setIsConnected(false);
});
```

**⚠️ 개선 필요**:
- 재연결 로직 강화
- 연결 실패 시 재시도 전략
- 오프라인 모드 처리

---

## 3. 백엔드 구현 상태

### 3.1 Socket.io 서버

#### 파일: `/coup/src/lib/socket/server.js`

**✅ 구현된 기능**:

```javascript
// ✅ 인증 미들웨어
io.use(async (socket, next) => {
  const userId = socket.handshake.auth.userId;
  
  if (!userId) {
    return next(new Error('Authentication required'));
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user || user.status !== 'ACTIVE') {
    return next(new Error('User not found or inactive'));
  }
  
  socket.userId = userId;
  socket.user = user;
  next();
});

// ✅ 온라인 상태 관리
async function handleUserOnline(socket) {
  await prisma.user.update({
    where: { id: socket.userId },
    data: { lastLoginAt: new Date() }
  });
  
  // 스터디 룸에 온라인 알림
  studyMembers.forEach(({ studyId }) => {
    socket.join(`study:${studyId}`);
    socket.to(`study:${studyId}`).emit('user:online', {
      userId: socket.userId,
      user: socket.user
    });
  });
}

// ⚠️ 화상회의 이벤트 (기본 구조만)
function handleVideoCallEvents(socket) {
  // ✅ 시작
  socket.on('video:start', async (data) => {
    socket.join(`video:${roomId}`);
    socket.to(`study:${studyId}`).emit('video:started', {
      roomId,
      startedBy: socket.user
    });
  });
  
  // ✅ 참여
  socket.on('video:join', (data) => {
    socket.join(`video:${roomId}`);
    socket.to(`video:${roomId}`).emit('video:user-joined', {
      userId: socket.userId,
      user: socket.user
    });
    
    const participants = getVideoCallParticipants(roomId);
    socket.emit('video:participants', { participants });
  });
  
  // ✅ WebRTC 시그널링
  socket.on('video:signal', (data) => {
    const { to, signal } = data;
    io.to(to).emit('video:signal', {
      from: socket.id,
      signal
    });
  });
  
  // ✅ 나가기
  socket.on('video:leave', (data) => {
    socket.leave(`video:${roomId}`);
    socket.to(`video:${roomId}`).emit('video:user-left', {
      userId: socket.userId
    });
  });
}
```

**❌ 미구현 기능**:

1. **세부 시그널링 이벤트 미처리**
   ```javascript
   // 필요하지만 없음
   socket.on('video:offer', ...)
   socket.on('video:answer', ...)
   socket.on('video:ice-candidate', ...)
   socket.on('video:toggle-audio', ...)
   socket.on('video:toggle-video', ...)
   socket.on('video:screen-share-start', ...)
   socket.on('video:screen-share-stop', ...)
   ```

2. **참여자 제어 이벤트 없음**
   ```javascript
   // 필요
   socket.on('video:mute-participant', ...)  // 호스트가 강제 음소거
   socket.on('video:kick-participant', ...)  // 호스트가 강퇴
   ```

3. **통화 품질 모니터링 없음**
   ```javascript
   // 필요
   socket.on('video:stats', ...)  // 네트워크 통계 수집
   ```

### 3.2 REST API

#### 상태: ❌ **전무**

**필요한 API**:

```
POST   /api/my-studies/[studyId]/video-call/start
       - 화상회의 시작
       - roomId 생성
       - 알림 전송

GET    /api/my-studies/[studyId]/video-call/status
       - 현재 진행 중인 회의 정보
       - 참여자 목록

POST   /api/my-studies/[studyId]/video-call/join
       - 참여 기록
       - 권한 검증

POST   /api/my-studies/[studyId]/video-call/leave
       - 퇴장 기록
       - 통계 저장

GET    /api/my-studies/[studyId]/video-call/history
       - 과거 세션 목록
       - 통계 조회

GET    /api/my-studies/[studyId]/video-call/sessions/[sessionId]
       - 특정 세션 상세 정보
```

### 3.3 데이터베이스 스키마

#### 상태: ❌ **없음**

**필요한 모델**:

```prisma
// 화상회의 세션
model VideoCallSession {
  id          String   @id @default(cuid())
  studyId     String
  roomId      String   @unique
  startedAt   DateTime @default(now())
  endedAt     DateTime?
  duration    Int?     // 초 단위
  
  study       Study    @relation(fields: [studyId], references: [id])
  participants VideoCallParticipant[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([studyId])
  @@index([roomId])
}

// 참여자 기록
model VideoCallParticipant {
  id          String   @id @default(cuid())
  sessionId   String
  userId      String
  joinedAt    DateTime @default(now())
  leftAt      DateTime?
  duration    Int?     // 초 단위
  
  // 통계
  audioMutedTime  Int? // 음소거 시간 (초)
  videoOffTime    Int? // 비디오 꺼진 시간 (초)
  screenSharedTime Int? // 화면 공유 시간 (초)
  
  session     VideoCallSession @relation(fields: [sessionId], references: [id])
  user        User    @relation(fields: [userId], references: [id])
  
  @@unique([sessionId, userId])
  @@index([userId])
}
```

---

## 4. 테스트 상태

### 4.1 단위 테스트

**상태**: ❌ **없음**

**필요한 테스트**:
- useVideoCall 훅 테스트
- VideoTile 컴포넌트 렌더링 테스트
- ControlBar 버튼 클릭 테스트
- Socket 이벤트 핸들러 테스트

### 4.2 통합 테스트

**상태**: ❌ **없음**

**필요한 시나리오**:
- 2명 참여 시나리오
- 화면 공유 시나리오
- 참여자 입퇴장 시나리오
- 네트워크 끊김 시나리오

### 4.3 E2E 테스트

**상태**: ❌ **없음**

**필요한 시나리오**:
- 대기실 → 참여 → 통화 → 나가기 전체 플로우
- 다중 브라우저 테스트
- 모바일 브라우저 호환성

---

## 5. 이슈 및 버그

### 5.1 확인된 이슈

#### 🐛 P0 (Critical)

1. **WebRTC 실제 연결 미검증**
   - 코드는 있으나 실제로 P2P 연결이 되는지 테스트 안 됨
   - Offer/Answer 교환이 제대로 작동하는지 불명확

2. **시그널링 이벤트 불일치**
   - 프론트: `video:join-room` 사용
   - 백엔드: `video:join` 핸들러 있음
   - 이벤트 이름 표준화 필요

3. **Socket 이벤트 누락**
   - 백엔드에 offer/answer/ice-candidate 핸들러 없음
   - 프론트에서 emit하지만 서버가 relay 안 함

#### ⚠️ P1 (High)

4. **에러 처리 부족**
   - 네트워크 끊김 시 재연결 로직 없음
   - 권한 거부 시 대체 방안 없음

5. **메모리 누수 위험**
   - 페이지 이동 시 스트림 정리 누락 가능성
   - Peer Connection 정리 확인 필요

6. **상태 동기화 이슈**
   - 음소거/비디오 상태가 다른 참여자에게 전달되지 않음
   - 서버에서 relay 필요

#### 📝 P2 (Medium)

7. **UI/UX 개선**
   - 로딩 상태 표시 부족
   - 에러 메시지가 alert로 표시 (Toast 필요)
   - 참여자 상태 업데이트가 실시간으로 반영 안 될 수 있음

8. **성능 최적화**
   - 비디오 품질 고정 (네트워크 적응형 아님)
   - 참여자 많을 때 레이아웃 최적화 필요

### 5.2 보안 취약점

1. **권한 검증 부족**
   - REST API가 없어 누구나 roomId만 알면 참여 가능
   - 스터디 멤버 여부 확인 필요

2. **Rate Limiting 없음**
   - 무한 연결 시도 가능

3. **데이터 검증 부족**
   - Socket 이벤트 데이터 검증 없음

---

## 6. 다음 단계

### 6.1 즉시 해결 필요 (P0)

1. ✅ Socket 이벤트 통일 및 핸들러 추가
2. ✅ WebRTC 연결 테스트 및 디버깅
3. ✅ 데이터베이스 스키마 추가

### 6.2 단기 (1-2주)

4. ✅ REST API 구현
5. ✅ 참여자 제어 기능 (호스트)
6. ✅ 에러 처리 강화
7. ✅ 통화 품질 모니터링

### 6.3 중기 (1개월)

8. ✅ 채팅 통합
9. ✅ 우측 위젯 구현
10. ✅ 테스트 코드 작성
11. ✅ 성능 최적화

---

**다음 문서**: [구현 계획](./03-implementation-plan.md)

