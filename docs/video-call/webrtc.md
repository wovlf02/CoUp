# WebRTC 구현 가이드

> **작성일**: 2025-11-19  
> **대상**: 개발자  
> **목적**: WebRTC P2P 화상회의 구현 상세 가이드

---

## 📋 목차

1. [WebRTC 기초](#1-webrtc-기초)
2. [시그널링 서버](#2-시그널링-서버)
3. [Peer Connection 관리](#3-peer-connection-관리)
4. [미디어 스트림 처리](#4-미디어-스트림-처리)
5. [화면 공유 구현](#5-화면-공유-구현)
6. [네트워크 최적화](#6-네트워크-최적화)
7. [에러 처리](#7-에러-처리)
8. [디버깅 가이드](#8-디버깅-가이드)

---

## 1. WebRTC 기초

### 1.1 WebRTC란?

**WebRTC (Web Real-Time Communication)**은 브라우저 간 P2P(Peer-to-Peer) 실시간 통신을 가능하게 하는 기술입니다.

#### 핵심 컴포넌트

```
┌─────────────────────────────────────────────────────────┐
│                     WebRTC 구조                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐      Signaling      ┌──────────┐        │
│  │ Client A │◄──────────────────►│ Client B │        │
│  └────┬─────┘       Server        └─────┬────┘        │
│       │                                  │             │
│       │         ┌────────────┐          │             │
│       │         │   STUN     │          │             │
│       ├────────►│  Server    │◄─────────┤             │
│       │         └────────────┘          │             │
│       │                                  │             │
│       │      P2P Media Stream           │             │
│       │◄═══════════════════════════════►│             │
│       │    (Audio/Video/Data)           │             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 주요 API

1. **RTCPeerConnection**: P2P 연결 관리
2. **MediaStream**: 오디오/비디오 스트림
3. **RTCDataChannel**: 데이터 통신 (선택)

### 1.2 연결 흐름 (Offer/Answer)

```
Peer A                           Peer B
  │                                │
  ├─ 1. createOffer()              │
  ├─ 2. setLocalDescription()      │
  ├─ 3. Offer ──────────────────►  │
  │                                ├─ 4. setRemoteDescription()
  │                                ├─ 5. createAnswer()
  │                                ├─ 6. setLocalDescription()
  │  ◄────────────────── Answer ───┤ 7. Answer
  ├─ 8. setRemoteDescription()     │
  │                                │
  ├─ 9. ICE Candidates ◄─────────► │ 10. ICE Candidates
  │                                │
  ├══════════════════════════════►│ 11. Media Stream
  │                                │
```

### 1.3 ICE (Interactive Connectivity Establishment)

**ICE**는 NAT/방화벽을 통과하여 P2P 연결을 설정하는 프로토콜입니다.

#### ICE Candidate 타입

1. **Host**: 로컬 네트워크 주소 (가장 빠름)
2. **Server Reflexive (srflx)**: STUN 서버를 통한 공인 IP (중간)
3. **Relay (relay)**: TURN 서버를 통한 릴레이 (가장 느림, 필요 시만)

```javascript
// ICE Servers 설정
const iceServers = {
  iceServers: [
    // Google STUN 서버 (무료)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    
    // 자체 STUN 서버 (옵션)
    { urls: 'stun:stun.myserver.com:3478' },
    
    // TURN 서버 (방화벽 우회, 필요 시)
    {
      urls: 'turn:turn.myserver.com:3478',
      username: 'username',
      credential: 'password'
    }
  ]
};
```

---

## 2. 시그널링 서버

### 2.1 시그널링이란?

WebRTC는 P2P 연결이지만, **초기 연결 설정을 위한 중개 서버**가 필요합니다. 이를 **시그널링 서버**라고 합니다.

#### 역할
- Offer/Answer SDP 교환
- ICE Candidate 교환
- 참여자 정보 공유

#### 기술 선택
- ✅ **Socket.io** (우리 프로젝트 사용)
- WebSocket
- Long Polling
- Server-Sent Events

### 2.2 Socket.io 시그널링 구현

#### 서버 측 (`/coup/src/lib/socket/server.js`)

```javascript
function handleVideoCallEvents(socket) {
  // 방 입장
  socket.on('video:join-room', async ({ studyId, roomId }) => {
    console.log(`[Video] User ${socket.userId} joining room ${roomId}`);
    
    // 1. 권한 검증
    const member = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId: socket.userId
        }
      }
    });
    
    if (!member || member.status !== 'ACTIVE') {
      socket.emit('error', { message: '접근 권한이 없습니다.' });
      return;
    }
    
    // 2. 방 입장
    socket.join(`video:${roomId}`);
    
    // 3. 현재 방에 있는 다른 참여자들 조회
    const room = io.sockets.adapter.rooms.get(`video:${roomId}`);
    const participants = [];
    
    if (room) {
      for (const socketId of room) {
        if (socketId !== socket.id) {
          const peer = io.sockets.sockets.get(socketId);
          if (peer) {
            participants.push({
              socketId,
              userId: peer.userId,
              user: peer.user
            });
          }
        }
      }
    }
    
    // 4. 현재 참여자 목록 전송 (나한테만)
    socket.emit('video:room-state', { participants });
    
    // 5. 다른 참여자들에게 내가 들어왔다고 알림
    socket.to(`video:${roomId}`).emit('video:user-joined', {
      socketId: socket.id,
      userId: socket.userId,
      user: socket.user
    });
    
    console.log(`[Video] User ${socket.userId} joined room ${roomId}. Current: ${room ? room.size : 1}`);
  });
  
  // Offer 전달 (A → Server → B)
  socket.on('video:offer', ({ to, offer }) => {
    console.log(`[Video] Relaying offer from ${socket.id} to ${to}`);
    io.to(to).emit('video:offer', {
      from: socket.id,
      offer
    });
  });
  
  // Answer 전달 (B → Server → A)
  socket.on('video:answer', ({ to, answer }) => {
    console.log(`[Video] Relaying answer from ${socket.id} to ${to}`);
    io.to(to).emit('video:answer', {
      from: socket.id,
      answer
    });
  });
  
  // ICE Candidate 전달
  socket.on('video:ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('video:ice-candidate', {
      from: socket.id,
      candidate
    });
  });
  
  // 오디오 상태 변경 브로드캐스트
  socket.on('video:toggle-audio', ({ roomId, isMuted }) => {
    socket.to(`video:${roomId}`).emit('video:peer-audio-changed', {
      socketId: socket.id,
      userId: socket.userId,
      isMuted
    });
  });
  
  // 비디오 상태 변경 브로드캐스트
  socket.on('video:toggle-video', ({ roomId, isVideoOff }) => {
    socket.to(`video:${roomId}`).emit('video:peer-video-changed', {
      socketId: socket.id,
      userId: socket.userId,
      isVideoOff
    });
  });
  
  // 화면 공유 시작 알림
  socket.on('video:screen-share-start', ({ roomId }) => {
    socket.to(`video:${roomId}`).emit('video:peer-screen-share', {
      socketId: socket.id,
      userId: socket.userId,
      isSharing: true
    });
  });
  
  // 화면 공유 종료 알림
  socket.on('video:screen-share-stop', ({ roomId }) => {
    socket.to(`video:${roomId}`).emit('video:peer-screen-share', {
      socketId: socket.id,
      userId: socket.userId,
      isSharing: false
    });
  });
  
  // 방 퇴장
  socket.on('video:leave-room', ({ roomId }) => {
    console.log(`[Video] User ${socket.userId} leaving room ${roomId}`);
    socket.leave(`video:${roomId}`);
    socket.to(`video:${roomId}`).emit('video:user-left', {
      socketId: socket.id,
      userId: socket.userId
    });
  });
  
  // 연결 끊김 (비정상 종료)
  socket.on('disconnect', () => {
    // 모든 비디오 룸에서 퇴장 알림
    const rooms = Array.from(socket.rooms).filter(room => room.startsWith('video:'));
    rooms.forEach(room => {
      socket.to(room).emit('video:user-left', {
        socketId: socket.id,
        userId: socket.userId
      });
    });
  });
}
```

#### 클라이언트 측 (`/coup/src/lib/hooks/useVideoCall.js`)

```javascript
// Socket 이벤트 리스너
useEffect(() => {
  if (!socket) return;

  // 방 상태 수신 (기존 참여자 목록)
  socket.on('video:room-state', ({ participants: existingParticipants }) => {
    console.log('[Video] Room state received:', existingParticipants);
    setParticipants(existingParticipants);

    // 기존 참여자들과 Peer Connection 생성 (내가 Offer 보냄)
    existingParticipants.forEach(participant => {
      createPeerConnection(participant.socketId, true);
    });
  });

  // 새 참여자 입장
  socket.on('video:user-joined', ({ socketId, userId, user }) => {
    console.log('[Video] User joined:', userId);
    setParticipants(prev => [...prev, { socketId, userId, user }]);
    
    // Peer Connection 생성 (상대방이 Offer 보낼 것이므로 대기)
    createPeerConnection(socketId, false);
  });

  // Offer 수신 (상대방이 먼저 연결 시도)
  socket.on('video:offer', async ({ from, offer }) => {
    console.log('[Video] Offer received from:', from);
    
    let peer = peersRef.current.get(from);
    if (!peer) {
      peer = createPeerConnection(from, false);
    }

    try {
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit('video:answer', { to: from, answer });
      console.log('[Video] Answer sent to:', from);
    } catch (err) {
      console.error('[Video] Failed to handle offer:', err);
    }
  });

  // Answer 수신
  socket.on('video:answer', async ({ from, answer }) => {
    console.log('[Video] Answer received from:', from);
    
    const peer = peersRef.current.get(from);
    if (peer) {
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('[Video] Answer set for:', from);
      } catch (err) {
        console.error('[Video] Failed to set answer:', err);
      }
    }
  });

  // ICE Candidate 수신
  socket.on('video:ice-candidate', async ({ from, candidate }) => {
    const peer = peersRef.current.get(from);
    if (peer) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('[Video] Failed to add ICE candidate:', err);
      }
    }
  });

  // 참여자 퇴장
  socket.on('video:user-left', ({ socketId }) => {
    console.log('[Video] User left:', socketId);
    cleanupPeer(socketId);
    setParticipants(prev => prev.filter(p => p.socketId !== socketId));
  });

  // Cleanup
  return () => {
    socket.off('video:room-state');
    socket.off('video:user-joined');
    socket.off('video:offer');
    socket.off('video:answer');
    socket.off('video:ice-candidate');
    socket.off('video:user-left');
  };
}, [socket, createPeerConnection, cleanupPeer]);
```

---

## 3. Peer Connection 관리

### 3.1 RTCPeerConnection 생성

```javascript
const createPeerConnection = useCallback((socketId, isInitiator = false) => {
  console.log(`[WebRTC] Creating peer connection for ${socketId}, isInitiator: ${isInitiator}`);

  // 1. Peer Connection 생성
  const peer = new RTCPeerConnection(iceServersRef.current);

  // 2. 로컬 스트림의 모든 트랙 추가
  if (localStreamRef.current) {
    localStreamRef.current.getTracks().forEach(track => {
      console.log(`[WebRTC] Adding ${track.kind} track to peer ${socketId}`);
      peer.addTrack(track, localStreamRef.current);
    });
  }

  // 3. 원격 스트림 수신 핸들러
  peer.ontrack = (event) => {
    console.log(`[WebRTC] Received ${event.track.kind} track from ${socketId}`);
    const [remoteStream] = event.streams;
    
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.set(socketId, remoteStream);
      return newMap;
    });
  };

  // 4. ICE Candidate 생성 핸들러
  peer.onicecandidate = (event) => {
    if (event.candidate) {
      console.log(`[WebRTC] ICE candidate for ${socketId}:`, event.candidate.type);
      socket.emit('video:ice-candidate', {
        to: socketId,
        candidate: event.candidate
      });
    } else {
      console.log(`[WebRTC] All ICE candidates sent for ${socketId}`);
    }
  };

  // 5. 연결 상태 모니터링
  peer.onconnectionstatechange = () => {
    console.log(`[WebRTC] Connection state (${socketId}):`, peer.connectionState);
    
    switch(peer.connectionState) {
      case 'connected':
        console.log(`[WebRTC] ✅ Successfully connected to ${socketId}`);
        break;
      case 'disconnected':
        console.warn(`[WebRTC] ⚠️ Disconnected from ${socketId}`);
        // 재연결 시도
        setTimeout(() => {
          if (peer.connectionState === 'disconnected') {
            retryConnection(socketId);
          }
        }, 3000);
        break;
      case 'failed':
        console.error(`[WebRTC] ❌ Connection failed with ${socketId}`);
        cleanupPeer(socketId);
        break;
      case 'closed':
        console.log(`[WebRTC] Connection closed with ${socketId}`);
        break;
    }
  };

  // 6. ICE 연결 상태
  peer.oniceconnectionstatechange = () => {
    console.log(`[WebRTC] ICE connection state (${socketId}):`, peer.iceConnectionState);
  };

  // 7. ICE Gathering 상태
  peer.onicegatheringstatechange = () => {
    console.log(`[WebRTC] ICE gathering state (${socketId}):`, peer.iceGatheringState);
  };

  // 8. 시그널링 상태
  peer.onsignalingstatechange = () => {
    console.log(`[WebRTC] Signaling state (${socketId}):`, peer.signalingState);
  };

  // Peer 저장
  peersRef.current.set(socketId, peer);

  // Initiator이면 Offer 생성
  if (isInitiator) {
    createOffer(socketId, peer);
  }

  return peer;
}, [socket, cleanupPeer, createOffer]);
```

### 3.2 Offer 생성

```javascript
const createOffer = useCallback(async (socketId, peer) => {
  try {
    console.log(`[WebRTC] Creating offer for ${socketId}`);
    
    // Offer 생성 옵션
    const offerOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    };
    
    const offer = await peer.createOffer(offerOptions);
    console.log(`[WebRTC] Offer created:`, offer.type);
    
    await peer.setLocalDescription(offer);
    console.log(`[WebRTC] Local description set for ${socketId}`);
    
    // Socket으로 Offer 전송
    socket.emit('video:offer', {
      to: socketId,
      offer: offer
    });
    
    console.log(`[WebRTC] Offer sent to ${socketId}`);
  } catch (err) {
    console.error(`[WebRTC] Failed to create offer for ${socketId}:`, err);
    setError(`연결 생성 실패: ${err.message}`);
  }
}, [socket]);
```

### 3.3 Peer Connection 정리

```javascript
const cleanupPeer = useCallback((socketId) => {
  console.log(`[WebRTC] Cleaning up peer ${socketId}`);
  
  const peer = peersRef.current.get(socketId);
  if (peer) {
    // 연결 종료
    peer.close();
    peersRef.current.delete(socketId);
  }

  // 원격 스트림 제거
  setRemoteStreams(prev => {
    const newMap = new Map(prev);
    newMap.delete(socketId);
    return newMap;
  });
}, []);
```

---

## 4. 미디어 스트림 처리

### 4.1 로컬 스트림 초기화

```javascript
const initLocalStream = useCallback(async (videoEnabled = true, audioEnabled = true) => {
  try {
    console.log('[Media] Requesting user media...');
    
    const constraints = {
      video: videoEnabled ? {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        facingMode: 'user'
      } : false,
      audio: audioEnabled ? {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000
      } : false
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    console.log('[Media] User media obtained');
    console.log('[Media] Video tracks:', stream.getVideoTracks().length);
    console.log('[Media] Audio tracks:', stream.getAudioTracks().length);

    localStreamRef.current = stream;
    setLocalStream(stream);
    setIsVideoOff(!videoEnabled);
    setIsMuted(!audioEnabled);

    return stream;
  } catch (err) {
    console.error('[Media] Failed to get user media:', err);
    
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      setError('카메라와 마이크 권한이 필요합니다.');
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      setError('카메라 또는 마이크를 찾을 수 없습니다.');
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      setError('카메라 또는 마이크가 이미 사용 중입니다.');
    } else {
      setError(`미디어 장치 오류: ${err.message}`);
    }
    
    throw err;
  }
}, []);
```

### 4.2 디바이스 목록 조회

```javascript
const getDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    const audioDevices = devices.filter(d => d.kind === 'audioinput');
    const audioOutputDevices = devices.filter(d => d.kind === 'audiooutput');
    
    return {
      videoDevices,
      audioDevices,
      audioOutputDevices
    };
  } catch (err) {
    console.error('Failed to enumerate devices:', err);
    return { videoDevices: [], audioDevices: [], audioOutputDevices: [] };
  }
};
```

### 4.3 디바이스 변경

```javascript
const changeDevice = async (deviceId, kind) => {
  if (!localStreamRef.current) return;
  
  const constraints = {
    deviceId: { exact: deviceId }
  };
  
  try {
    const newStream = await navigator.mediaDevices.getUserMedia({
      [kind]: constraints
    });
    
    const newTrack = newStream.getTracks()[0];
    const oldTrack = localStreamRef.current.getTracks().find(t => t.kind === kind);
    
    if (oldTrack) {
      // 모든 Peer Connection의 트랙 교체
      peersRef.current.forEach(peer => {
        const sender = peer.getSenders().find(s => s.track?.kind === kind);
        if (sender) {
          sender.replaceTrack(newTrack);
        }
      });
      
      // 로컬 스트림의 트랙 교체
      localStreamRef.current.removeTrack(oldTrack);
      localStreamRef.current.addTrack(newTrack);
      oldTrack.stop();
      
      setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
    }
  } catch (err) {
    console.error('Failed to change device:', err);
  }
};
```

---

## 5. 화면 공유 구현

### 5.1 화면 공유 시작

```javascript
const shareScreen = useCallback(async () => {
  try {
    console.log('[Screen] Requesting screen share...');
    
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always',
        displaySurface: 'monitor', // 'monitor' | 'window' | 'application' | 'browser'
      },
      audio: false // 시스템 오디오 공유 (브라우저 지원 제한적)
    });

    const screenTrack = screenStream.getVideoTracks()[0];
    console.log('[Screen] Screen track obtained');

    screenStreamRef.current = screenStream;
    setIsSharingScreen(true);

    // 모든 Peer Connection의 비디오 트랙을 화면 공유로 교체
    peersRef.current.forEach((peer, socketId) => {
      const sender = peer.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        sender.replaceTrack(screenTrack).then(() => {
          console.log(`[Screen] Replaced video track for ${socketId}`);
        });
      }
    });

    // Socket으로 화면 공유 시작 알림
    if (socket) {
      socket.emit('video:screen-share-start', { roomId });
    }

    // 화면 공유 종료 감지 (사용자가 브라우저에서 중지)
    screenTrack.onended = () => {
      console.log('[Screen] Screen share ended by user');
      stopScreenShare();
    };

    return screenStream;
  } catch (err) {
    console.error('[Screen] Failed to share screen:', err);
    
    if (err.name === 'NotAllowedError') {
      setError('화면 공유 권한이 거부되었습니다.');
    } else {
      setError(`화면 공유 실패: ${err.message}`);
    }
    
    throw err;
  }
}, [socket, roomId, stopScreenShare]);
```

### 5.2 화면 공유 중지

```javascript
const stopScreenShare = useCallback(() => {
  if (!screenStreamRef.current) return;

  console.log('[Screen] Stopping screen share...');

  // 화면 공유 스트림 종료
  screenStreamRef.current.getTracks().forEach(track => track.stop());
  screenStreamRef.current = null;
  setIsSharingScreen(false);

  // 원래 비디오 트랙으로 복구
  if (localStreamRef.current) {
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      peersRef.current.forEach((peer, socketId) => {
        const sender = peer.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack).then(() => {
            console.log(`[Screen] Restored video track for ${socketId}`);
          });
        }
      });
    }
  }

  // Socket으로 화면 공유 종료 알림
  if (socket) {
    socket.emit('video:screen-share-stop', { roomId });
  }

  console.log('[Screen] Screen share stopped');
}, [socket, roomId]);
```

---

## 6. 네트워크 최적화

### 6.1 WebRTC 통계 수집

```javascript
const getConnectionStats = async (peer) => {
  try {
    const stats = await peer.getStats();
    const report = {};

    stats.forEach(stat => {
      if (stat.type === 'inbound-rtp' && stat.kind === 'video') {
        // 수신 비디오 통계
        report.video = {
          bytesReceived: stat.bytesReceived,
          packetsReceived: stat.packetsReceived,
          packetsLost: stat.packetsLost,
          framesPerSecond: stat.framesPerSecond,
          frameWidth: stat.frameWidth,
          frameHeight: stat.frameHeight,
          jitter: stat.jitter
        };
      } else if (stat.type === 'inbound-rtp' && stat.kind === 'audio') {
        // 수신 오디오 통계
        report.audio = {
          bytesReceived: stat.bytesReceived,
          packetsReceived: stat.packetsReceived,
          packetsLost: stat.packetsLost,
          jitter: stat.jitter
        };
      } else if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
        // 연결 통계
        report.connection = {
          currentRoundTripTime: stat.currentRoundTripTime * 1000, // ms
          availableOutgoingBitrate: stat.availableOutgoingBitrate,
          availableIncomingBitrate: stat.availableIncomingBitrate
        };
      }
    });

    return report;
  } catch (err) {
    console.error('Failed to get stats:', err);
    return null;
  }
};
```

### 6.2 네트워크 품질 평가

```javascript
const evaluateNetworkQuality = (stats) => {
  if (!stats) return 'unknown';

  const rtt = stats.connection?.currentRoundTripTime || 0;
  const packetsLost = stats.video?.packetsLost || 0;
  const packetsReceived = stats.video?.packetsReceived || 1;
  const packetLossRate = (packetsLost / (packetsLost + packetsReceived)) * 100;

  if (rtt < 100 && packetLossRate < 1) {
    return 'excellent'; // 우수
  } else if (rtt < 200 && packetLossRate < 3) {
    return 'good'; // 양호
  } else if (rtt < 300 && packetLossRate < 5) {
    return 'fair'; // 보통
  } else {
    return 'poor'; // 나쁨
  }
};
```

### 6.3 적응형 비트레이트

```javascript
const adjustBitrate = async (peer, quality) => {
  const sender = peer.getSenders().find(s => s.track?.kind === 'video');
  if (!sender) return;

  const parameters = sender.getParameters();
  if (!parameters.encodings || parameters.encodings.length === 0) {
    parameters.encodings = [{}];
  }

  // 품질에 따라 비트레이트 조정
  switch(quality) {
    case 'high':
      parameters.encodings[0].maxBitrate = 2500000; // 2.5 Mbps
      break;
    case 'medium':
      parameters.encodings[0].maxBitrate = 1000000; // 1 Mbps
      break;
    case 'low':
      parameters.encodings[0].maxBitrate = 500000; // 500 Kbps
      break;
  }

  await sender.setParameters(parameters);
  console.log(`[WebRTC] Bitrate adjusted to ${quality}`);
};
```

---

## 7. 에러 처리

### 7.1 미디어 권한 에러

```javascript
const handleMediaError = (error) => {
  console.error('[Media] Error:', error);

  switch(error.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return {
        title: '권한 필요',
        message: '카메라와 마이크 권한을 허용해주세요.',
        action: '설정으로 이동',
        actionHandler: () => {
          // 브라우저 설정 안내
          alert('브라우저 설정 > 개인정보 및 보안 > 사이트 설정에서 카메라와 마이크를 허용해주세요.');
        }
      };
      
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return {
        title: '장치 없음',
        message: '카메라 또는 마이크를 찾을 수 없습니다.',
        action: '장치 연결 확인'
      };
      
    case 'NotReadableError':
    case 'TrackStartError':
      return {
        title: '장치 사용 중',
        message: '다른 프로그램에서 카메라 또는 마이크를 사용 중입니다.',
        action: '다른 프로그램 종료'
      };
      
    case 'OverconstrainedError':
      return {
        title: '지원되지 않는 설정',
        message: '요청한 화질 또는 음질을 지원하지 않습니다.',
        action: '설정 변경'
      };
      
    default:
      return {
        title: '미디어 오류',
        message: error.message || '알 수 없는 오류가 발생했습니다.',
        action: '다시 시도'
      };
  }
};
```

### 7.2 연결 실패 재시도

```javascript
const retryConnection = async (socketId, maxRetries = 3) => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log(`[WebRTC] Retrying connection to ${socketId} (${retries + 1}/${maxRetries})`);

      // 기존 Peer 정리
      cleanupPeer(socketId);

      // 대기 (지수 백오프)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));

      // 새 Peer Connection 생성
      const peer = createPeerConnection(socketId, true);

      // 연결 성공 대기 (10초 타임아웃)
      const success = await Promise.race([
        new Promise(resolve => {
          peer.onconnectionstatechange = () => {
            if (peer.connectionState === 'connected') {
              resolve(true);
            }
          };
        }),
        new Promise(resolve => setTimeout(() => resolve(false), 10000))
      ]);

      if (success) {
        console.log(`[WebRTC] ✅ Reconnection successful to ${socketId}`);
        return true;
      }

      retries++;
    } catch (err) {
      console.error(`[WebRTC] Retry ${retries + 1} failed:`, err);
      retries++;
    }
  }

  console.error(`[WebRTC] ❌ Failed to reconnect to ${socketId} after ${maxRetries} attempts`);
  setError(`${socketId} 연결에 실패했습니다.`);
  return false;
};
```

---

## 8. 디버깅 가이드

### 8.1 Chrome DevTools

#### WebRTC Internals 페이지

```
chrome://webrtc-internals
```

이 페이지에서 확인할 수 있는 정보:
- 모든 RTCPeerConnection 상태
- ICE Candidate 교환 과정
- 비디오/오디오 통계 (실시간)
- 네트워크 경로 (Local → STUN → TURN)

#### Console 로그 필터링

```javascript
// 특정 로그만 표시
localStorage.debug = 'video:*,webrtc:*';

// 또는 코드에서
console.log('[Video]', ...);
console.log('[WebRTC]', ...);
console.log('[Media]', ...);
console.log('[Screen]', ...);
```

### 8.2 일반적인 문제 해결

#### 문제 1: 비디오가 보이지 않음

```javascript
// 체크리스트
1. localStream이 null이 아닌지 확인
2. video element의 srcObject가 설정되었는지 확인
3. video element에 autoPlay, playsInline 속성이 있는지 확인
4. 브라우저 콘솔에 에러가 있는지 확인

// 디버깅 코드
useEffect(() => {
  if (videoRef.current && stream) {
    console.log('Setting video srcObject:', stream);
    console.log('Video tracks:', stream.getVideoTracks());
    videoRef.current.srcObject = stream;
  }
}, [stream]);
```

#### 문제 2: 연결이 안 됨

```javascript
// 체크리스트
1. Socket.io 연결 확인 (isConnected)
2. Offer/Answer 교환 확인 (콘솔 로그)
3. ICE Candidate 교환 확인
4. 방화벽 설정 확인 (STUN/TURN)

// 디버깅 코드
peer.oniceconnectionstatechange = () => {
  console.log('ICE connection state:', peer.iceConnectionState);
  
  if (peer.iceConnectionState === 'failed') {
    console.error('ICE connection failed. Checking candidates...');
    peer.getStats().then(stats => {
      stats.forEach(stat => {
        if (stat.type === 'local-candidate' || stat.type === 'remote-candidate') {
          console.log(stat);
        }
      });
    });
  }
};
```

#### 문제 3: 오디오가 들리지 않음

```javascript
// 체크리스트
1. 원격 비디오의 muted 속성이 false인지 확인 (로컬만 muted)
2. 브라우저 음소거 해제 확인
3. 오디오 트랙이 enabled 상태인지 확인

// 디버깅 코드
<video
  ref={videoRef}
  autoPlay
  playsInline
  muted={isLocal} // 로컬만 음소거
  onLoadedMetadata={() => console.log('Video loaded')}
  onPlay={() => console.log('Video playing')}
/>
```

### 8.3 성능 모니터링

```javascript
// 1초마다 통계 수집
useEffect(() => {
  const interval = setInterval(async () => {
    for (const [socketId, peer] of peersRef.current) {
      const stats = await getConnectionStats(peer);
      const quality = evaluateNetworkQuality(stats);
      
      console.log(`[Stats] ${socketId}:`, {
        rtt: stats.connection?.currentRoundTripTime,
        bandwidth: stats.connection?.availableIncomingBitrate,
        fps: stats.video?.framesPerSecond,
        quality
      });
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

---

## 📚 참고 자료

### 공식 문서
- [MDN WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [W3C WebRTC Spec](https://www.w3.org/TR/webrtc/)

### 학습 자료
- [WebRTC for the Curious](https://webrtcforthecurious.com/)
- [WebRTC Samples](https://webrtc.github.io/samples/)

### 디버깅 도구
- Chrome: `chrome://webrtc-internals`
- Firefox: `about:webrtc`

---

**다음 문서**: [테스트 계획](./06-test-plan.md)

