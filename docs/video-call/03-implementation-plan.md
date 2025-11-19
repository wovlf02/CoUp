# 화상회의 구현 계획

> **작성일**: 2025-11-19  
> **목표**: WebRTC 화상회의 완전 구현  
> **기간**: 2-4주 (단계별)

---

## 📋 목차

1. [구현 전략](#1-구현-전략)
2. [Phase 1: 핵심 기능 안정화](#2-phase-1-핵심-기능-안정화)
3. [Phase 2: 고급 기능](#3-phase-2-고급-기능)
4. [Phase 3: 최적화 및 테스트](#4-phase-3-최적화-및-테스트)
5. [우선순위 매트릭스](#5-우선순위-매트릭스)

---

## 1. 구현 전략

### 1.1 원칙

1. **점진적 구현**: 작동하는 최소 기능부터 시작
2. **테스트 우선**: 각 단계마다 검증
3. **문서화 동시 진행**: 코드와 문서 함께 업데이트
4. **에러 처리 필수**: 모든 기능에 에러 핸들링

### 1.2 개발 환경

```bash
# 로컬 테스트 환경
- 브라우저 2개 (Chrome + 시크릿 모드)
- 또는 다른 디바이스 (스마트폰)
- Network 탭으로 WebRTC 연결 확인
- Console 로그로 시그널링 추적
```

### 1.3 브랜치 전략

```
main (production)
  └── develop
       ├── feature/video-call-webrtc-core
       ├── feature/video-call-signaling
       ├── feature/video-call-ui-enhancement
       └── feature/video-call-api
```

---

## 2. Phase 1: 핵심 기능 안정화

**목표**: 분리형 아키텍처 구축 및 2명 정상 화상통화  
**기간**: 2주  
**우선순위**: P0 (Critical)

### 2.0 인프라 구축 (1-2일차)

#### 작업 내용

**A. 시그널링 서버 프로젝트 생성**

```bash
# 프로젝트 구조
CoUp/
├── coup/                    # Next.js 프로젝트
├── signaling-server/        # 🆕 독립 시그널링 서버
│   ├── package.json
│   ├── server.js
│   ├── handlers/
│   │   ├── video.js
│   │   ├── chat.js
│   │   └── presence.js
│   └── middleware/
│       └── auth.js
└── docker-compose.yml       # 🆕 로컬 개발 환경
```

**B. Docker Compose 설정**

파일: `/docker-compose.yml`

```yaml
version: '3.8'

services:
  # Next.js
  nextjs:
    build: ./coup
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/coup
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./coup:/app
      - /app/node_modules
      - /app/.next

  # 시그널링 서버
  signaling:
    build: ./signaling-server
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - PORT=4000
      - NEXTJS_URL=http://nextjs:3000
      - REDIS_URL=redis://redis:6379
      - ALLOWED_ORIGINS=http://localhost:3000
    depends_on:
      - redis
    volumes:
      - ./signaling-server:/app
      - /app/node_modules

  # PostgreSQL
  postgres:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=coup
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**C. 시그널링 서버 초기 설정**

파일: `/signaling-server/package.json`

```json
{
  "name": "coup-signaling-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch server.js",
    "start": "node server.js"
  },
  "dependencies": {
    "socket.io": "^4.6.0",
    "@socket.io/redis-adapter": "^8.3.0",
    "redis": "^4.6.0",
    "express": "^4.18.0",
    "dotenv": "^16.0.0"
  }
}
```

**D. Next.js 설정 변경**

파일: `/coup/next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // 🔥 Custom Server 제거
  
  env: {
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  }
};

export default nextConfig;
```

파일: `/coup/package.json` 수정

```json
{
  "scripts": {
    "dev": "next dev",           // 🔥 server.mjs 제거
    "build": "next build",
    "start": "next start",       // 🔥 standalone으로 실행
    "lint": "eslint"
  }
}
```

### 2.1 Socket 이벤트 통일 (3일차)

#### 작업 내용

**A. 이벤트 명세 확정**

```javascript
// 클라이언트 → 서버
'video:join-room'           // 방 입장
'video:leave-room'          // 방 퇴장
'video:offer'               // WebRTC Offer
'video:answer'              // WebRTC Answer
'video:ice-candidate'       // ICE Candidate
'video:toggle-audio'        // 오디오 상태 변경
'video:toggle-video'        // 비디오 상태 변경
'video:screen-share-start'  // 화면 공유 시작
'video:screen-share-stop'   // 화면 공유 종료

// 서버 → 클라이언트
'video:room-state'          // 현재 방 상태 (참여자 목록)
'video:user-joined'         // 새 참여자 입장
'video:user-left'           // 참여자 퇴장
'video:offer'               // Offer 전달
'video:answer'              // Answer 전달
'video:ice-candidate'       // ICE Candidate 전달
'video:peer-audio-changed'  // 상대방 오디오 상태
'video:peer-video-changed'  // 상대방 비디오 상태
'video:peer-screen-share'   // 상대방 화면 공유
```

**B. 서버 핸들러 구현**

파일: `/coup/src/lib/socket/server.js`

```javascript
function handleVideoCallEvents(socket) {
  // 방 입장
  socket.on('video:join-room', async ({ studyId, roomId }) => {
    // 1. 권한 검증
    const member = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: { studyId, userId: socket.userId }
      }
    });
    
    if (!member || member.status !== 'ACTIVE') {
      socket.emit('error', { message: '접근 권한이 없습니다.' });
      return;
    }
    
    // 2. 방 입장
    socket.join(`video:${roomId}`);
    
    // 3. 기존 참여자 목록 전송
    const participants = getVideoCallParticipants(roomId);
    socket.emit('video:room-state', { 
      participants: participants.filter(p => p.socketId !== socket.id)
    });
    
    // 4. 다른 참여자들에게 알림
    socket.to(`video:${roomId}`).emit('video:user-joined', {
      socketId: socket.id,
      userId: socket.userId,
      user: socket.user
    });
    
    log.info(`User ${socket.userId} joined video room ${roomId}`);
  });
  
  // Offer 전달
  socket.on('video:offer', ({ to, offer }) => {
    io.to(to).emit('video:offer', {
      from: socket.id,
      offer
    });
  });
  
  // Answer 전달
  socket.on('video:answer', ({ to, answer }) => {
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
  
  // 오디오 상태 변경
  socket.on('video:toggle-audio', ({ roomId, isMuted }) => {
    socket.to(`video:${roomId}`).emit('video:peer-audio-changed', {
      socketId: socket.id,
      userId: socket.userId,
      isMuted
    });
  });
  
  // 비디오 상태 변경
  socket.on('video:toggle-video', ({ roomId, isVideoOff }) => {
    socket.to(`video:${roomId}`).emit('video:peer-video-changed', {
      socketId: socket.id,
      userId: socket.userId,
      isVideoOff
    });
  });
  
  // 화면 공유 시작
  socket.on('video:screen-share-start', ({ roomId }) => {
    socket.to(`video:${roomId}`).emit('video:peer-screen-share', {
      socketId: socket.id,
      userId: socket.userId,
      isSharing: true
    });
  });
  
  // 화면 공유 종료
  socket.on('video:screen-share-stop', ({ roomId }) => {
    socket.to(`video:${roomId}`).emit('video:peer-screen-share', {
      socketId: socket.id,
      userId: socket.userId,
      isSharing: false
    });
  });
  
  // 방 퇴장
  socket.on('video:leave-room', ({ roomId }) => {
    socket.leave(`video:${roomId}`);
    socket.to(`video:${roomId}`).emit('video:user-left', {
      socketId: socket.id,
      userId: socket.userId
    });
  });
}
```

**C. 클라이언트 수정**

파일: `/coup/src/lib/hooks/useVideoCall.js`

- 이벤트 이름 확인 및 수정
- 서버 응답 처리 추가

#### 검증 방법

```javascript
// 브라우저 콘솔에서 확인
socket.on('video:room-state', (data) => {
  console.log('Room State:', data);
});

socket.on('video:user-joined', (data) => {
  console.log('User Joined:', data);
});
```

### 2.2 WebRTC 연결 검증 및 디버깅 (2일차)

#### 작업 내용

**A. 로깅 강화**

```javascript
// useVideoCall.js
const createPeerConnection = useCallback((socketId, isInitiator) => {
  console.log(`[WebRTC] Creating peer connection for ${socketId}, isInitiator: ${isInitiator}`);
  
  const peer = new RTCPeerConnection(iceServersRef.current);
  
  // 연결 상태 로깅
  peer.onconnectionstatechange = () => {
    console.log(`[WebRTC] Connection state (${socketId}):`, peer.connectionState);
    
    switch(peer.connectionState) {
      case 'connected':
        console.log(`[WebRTC] ✅ Successfully connected to ${socketId}`);
        break;
      case 'disconnected':
        console.warn(`[WebRTC] ⚠️ Disconnected from ${socketId}`);
        break;
      case 'failed':
        console.error(`[WebRTC] ❌ Connection failed with ${socketId}`);
        break;
    }
  };
  
  // ICE 연결 상태 로깅
  peer.oniceconnectionstatechange = () => {
    console.log(`[WebRTC] ICE connection state (${socketId}):`, peer.iceConnectionState);
  };
  
  // ICE Gathering 상태 로깅
  peer.onicegatheringstatechange = () => {
    console.log(`[WebRTC] ICE gathering state (${socketId}):`, peer.iceGatheringState);
  };
  
  // 시그널링 상태 로깅
  peer.onsignalingstatechange = () => {
    console.log(`[WebRTC] Signaling state (${socketId}):`, peer.signalingState);
  };
  
  // ICE Candidate 로깅
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
  
  // 트랙 수신 로깅
  peer.ontrack = (event) => {
    console.log(`[WebRTC] Received ${event.track.kind} track from ${socketId}`);
    const [remoteStream] = event.streams;
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.set(socketId, remoteStream);
      return newMap;
    });
  };
  
  return peer;
});
```

**B. Offer/Answer 흐름 검증**

```javascript
// Offer 생성
const createOffer = useCallback(async (socketId, peer) => {
  try {
    console.log(`[WebRTC] Creating offer for ${socketId}`);
    const offer = await peer.createOffer();
    console.log(`[WebRTC] Offer created:`, offer.type);
    
    await peer.setLocalDescription(offer);
    console.log(`[WebRTC] Local description set for ${socketId}`);
    
    socket.emit('video:offer', { to: socketId, offer });
    console.log(`[WebRTC] Offer sent to ${socketId}`);
  } catch (err) {
    console.error(`[WebRTC] Failed to create offer for ${socketId}:`, err);
  }
}, [socket]);

// Offer 처리
socket.on('video:offer', async ({ from, offer }) => {
  console.log(`[WebRTC] Received offer from ${from}`);
  
  let peer = peersRef.current.get(from);
  if (!peer) {
    console.log(`[WebRTC] Creating peer for incoming offer from ${from}`);
    peer = createPeerConnection(from, false);
  }
  
  try {
    console.log(`[WebRTC] Setting remote description for ${from}`);
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    
    console.log(`[WebRTC] Creating answer for ${from}`);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    
    console.log(`[WebRTC] Sending answer to ${from}`);
    socket.emit('video:answer', { to: from, answer });
  } catch (err) {
    console.error(`[WebRTC] Failed to handle offer from ${from}:`, err);
  }
});

// Answer 처리
socket.on('video:answer', async ({ from, answer }) => {
  console.log(`[WebRTC] Received answer from ${from}`);
  
  const peer = peersRef.current.get(from);
  if (peer) {
    try {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
      console.log(`[WebRTC] ✅ Answer set for ${from}`);
    } catch (err) {
      console.error(`[WebRTC] Failed to set answer from ${from}:`, err);
    }
  } else {
    console.error(`[WebRTC] No peer found for answer from ${from}`);
  }
});
```

**C. 테스트 시나리오**

```
User A (Chrome)           User B (Chrome Incognito)
      │                            │
      ├─ 1. 로그인               ├─ 1. 로그인 (다른 계정)
      │                            │
      ├─ 2. 스터디 입장           ├─ 2. 같은 스터디 입장
      │                            │
      ├─ 3. 화상 탭 클릭          │
      │                            │
      ├─ 4. [참여하기] 클릭       │
      │    - Console 확인:         │
      │      "Joined video room"   │
      │                            │
      │                            ├─ 5. [참여하기] 클릭
      │                            │    - Console 확인:
      │                            │      "Received offer"
      │                            │      "Sending answer"
      │                            │
      ├─ 6. Console 확인:         │
      │    "Received answer"       │
      │    "Connection state: connected"
      │                            │
      ├─ 7. ✅ 비디오 표시 확인   ├─ 7. ✅ 비디오 표시 확인
```

#### 검증 체크리스트

- [ ] User A 로컬 비디오 표시됨
- [ ] User B 로컬 비디오 표시됨
- [ ] User A가 User B 비디오 볼 수 있음
- [ ] User B가 User A 비디오 볼 수 있음
- [ ] 음소거 버튼 작동
- [ ] 비디오 끄기 작동
- [ ] Console에 에러 없음

### 2.3 데이터베이스 스키마 추가 (3일차)

#### 작업 내용

**A. Prisma 스키마 수정**

파일: `/coup/prisma/schema.prisma`

```prisma
// 화상회의 세션
model VideoCallSession {
  id          String   @id @default(cuid())
  studyId     String
  roomId      String   @unique
  startedBy   String   // userId
  startedAt   DateTime @default(now())
  endedAt     DateTime?
  duration    Int?     // 초 단위
  
  study       Study    @relation(fields: [studyId], references: [id], onDelete: Cascade)
  starter     User     @relation("VideoCallStarter", fields: [startedBy], references: [id])
  participants VideoCallParticipant[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([studyId])
  @@index([roomId])
  @@index([startedAt])
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
  audioMutedTime  Int @default(0) // 음소거 시간 (초)
  videoOffTime    Int @default(0) // 비디오 꺼진 시간 (초)
  screenSharedTime Int @default(0) // 화면 공유 시간 (초)
  
  session     VideoCallSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([sessionId, userId])
  @@index([userId])
  @@index([sessionId])
}

// User 모델에 relation 추가
model User {
  // ...existing fields...
  
  startedVideoSessions VideoCallSession[] @relation("VideoCallStarter")
  videoCallParticipations VideoCallParticipant[]
}

// Study 모델에 relation 추가
model Study {
  // ...existing fields...
  
  videoSessions VideoCallSession[]
}
```

**B. 마이그레이션 실행**

```bash
cd coup
npx prisma migrate dev --name add_video_call_tables
npx prisma generate
```

**C. Seed 데이터 (선택)**

```javascript
// prisma/seed.js에 추가
// 테스트용 세션 데이터
const testSession = await prisma.videoCallSession.create({
  data: {
    studyId: 'test-study-id',
    roomId: 'study-test-study-id-main',
    startedBy: 'test-user-id',
    startedAt: new Date(Date.now() - 3600000), // 1시간 전
    endedAt: new Date(),
    duration: 3600,
    participants: {
      create: [
        {
          userId: 'test-user-id',
          joinedAt: new Date(Date.now() - 3600000),
          leftAt: new Date(),
          duration: 3600,
          audioMutedTime: 300,
          videoOffTime: 0,
          screenSharedTime: 600
        }
      ]
    }
  }
});
```

### 2.4 기본 REST API 구현 (4-5일차)

#### 작업 내용

**A. 세션 시작 API**

파일: `/coup/src/app/api/my-studies/[studyId]/video-call/start/route.js`

```javascript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    
    const { studyId } = params;
    const userId = session.user.id;
    
    // 멤버 확인
    const member = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: { studyId, userId }
      }
    });
    
    if (!member || member.status !== 'ACTIVE') {
      return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
    }
    
    // 기존 활성 세션 확인
    const activeSession = await prisma.videoCallSession.findFirst({
      where: {
        studyId,
        endedAt: null
      }
    });
    
    if (activeSession) {
      return NextResponse.json({ 
        session: activeSession,
        message: '이미 진행 중인 화상회의가 있습니다.'
      });
    }
    
    // 새 세션 생성
    const roomId = `study-${studyId}-main`;
    const newSession = await prisma.videoCallSession.create({
      data: {
        studyId,
        roomId,
        startedBy: userId
      },
      include: {
        starter: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });
    
    // 스터디 멤버들에게 알림 (Socket.io 통해)
    const io = require('@/lib/socket/server').getIO();
    io.to(`study:${studyId}`).emit('video:started', {
      session: newSession
    });
    
    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error('Video call start error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
```

**B. 현재 상태 조회 API**

파일: `/coup/src/app/api/my-studies/[studyId]/video-call/status/route.js`

```javascript
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    
    const { studyId } = params;
    
    // 활성 세션 조회
    const activeSession = await prisma.videoCallSession.findFirst({
      where: {
        studyId,
        endedAt: null
      },
      include: {
        starter: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        participants: {
          where: {
            leftAt: null
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });
    
    if (!activeSession) {
      return NextResponse.json({ session: null });
    }
    
    // 실시간 참여자 (Socket.io에서)
    const io = require('@/lib/socket/server').getIO();
    const room = io.sockets.adapter.rooms.get(`video:${activeSession.roomId}`);
    const onlineCount = room ? room.size : 0;
    
    return NextResponse.json({
      session: {
        ...activeSession,
        onlineCount
      }
    });
  } catch (error) {
    console.error('Video call status error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
```

**C. 참여 기록 API**

파일: `/coup/src/app/api/my-studies/[studyId]/video-call/join/route.js`

```javascript
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    
    const { studyId } = params;
    const userId = session.user.id;
    const { sessionId } = await request.json();
    
    // 멤버 확인
    const member = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: { studyId, userId }
      }
    });
    
    if (!member || member.status !== 'ACTIVE') {
      return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
    }
    
    // 세션 확인
    const videoSession = await prisma.videoCallSession.findUnique({
      where: { id: sessionId }
    });
    
    if (!videoSession || videoSession.endedAt) {
      return NextResponse.json({ error: '유효하지 않은 세션입니다.' }, { status: 400 });
    }
    
    // 참여 기록 (이미 있으면 업데이트)
    const participant = await prisma.videoCallParticipant.upsert({
      where: {
        sessionId_userId: {
          sessionId,
          userId
        }
      },
      create: {
        sessionId,
        userId
      },
      update: {
        leftAt: null  // 재참여 시 leftAt 초기화
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });
    
    return NextResponse.json({ participant });
  } catch (error) {
    console.error('Video call join error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
```

**D. 퇴장 기록 API**

파일: `/coup/src/app/api/my-studies/[studyId]/video-call/leave/route.js`

```javascript
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { sessionId } = await request.json();
    
    // 참여 기록 업데이트
    const participant = await prisma.videoCallParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId
        }
      }
    });
    
    if (!participant) {
      return NextResponse.json({ error: '참여 기록을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    const leftAt = new Date();
    const duration = Math.floor((leftAt - participant.joinedAt) / 1000);
    
    await prisma.videoCallParticipant.update({
      where: {
        id: participant.id
      },
      data: {
        leftAt,
        duration
      }
    });
    
    // 모든 참여자가 나갔는지 확인
    const remainingParticipants = await prisma.videoCallParticipant.count({
      where: {
        sessionId,
        leftAt: null
      }
    });
    
    // 아무도 없으면 세션 종료
    if (remainingParticipants === 0) {
      const videoSession = await prisma.videoCallSession.findUnique({
        where: { id: sessionId }
      });
      
      if (videoSession && !videoSession.endedAt) {
        const endedAt = new Date();
        const sessionDuration = Math.floor((endedAt - videoSession.startedAt) / 1000);
        
        await prisma.videoCallSession.update({
          where: { id: sessionId },
          data: {
            endedAt,
            duration: sessionDuration
          }
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Video call leave error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
```

### 2.5 통합 테스트 (6-7일차)

#### 테스트 시나리오

**시나리오 1: 정상 플로우**
```
1. User A: 화상 탭 클릭
2. User A: [참여하기] 클릭
3. DB 확인: VideoCallSession 생성됨
4. DB 확인: VideoCallParticipant (User A) 생성됨
5. User B: 화상 탭 클릭
6. User B: "User A가 화상회의 중입니다" 표시 확인
7. User B: [참여하기] 클릭
8. DB 확인: VideoCallParticipant (User B) 생성됨
9. User A 화면: User B 비디오 표시됨
10. User B 화면: User A 비디오 표시됨
11. User A: 음소거 클릭
12. User B 화면: User A에 🔇 아이콘 표시
13. User A: 비디오 끄기 클릭
14. User B 화면: User A 프로필 이미지 표시
15. User A: [나가기] 클릭
16. DB 확인: User A participant.leftAt 업데이트됨
17. User B: [나가기] 클릭
18. DB 확인: User B participant.leftAt 업데이트됨
19. DB 확인: VideoCallSession.endedAt 업데이트됨
```

**시나리오 2: 동시 참여**
```
1. User A와 User B 동시에 [참여하기] 클릭
2. 두 사용자 모두 정상 연결
3. 비디오 서로 보임
```

**시나리오 3: 에러 처리**
```
1. 비멤버가 URL로 직접 접근
2. 403 에러 및 에러 메시지 표시
3. 카메라/마이크 권한 거부
4. 적절한 에러 메시지 표시
```

#### 체크리스트

- [ ] 2명 동시 연결 테스트 통과
- [ ] 음소거/비디오 토글 동작
- [ ] 화면 공유 기본 동작
- [ ] DB에 세션 기록 저장
- [ ] 에러 처리 확인
- [ ] 메모리 누수 없음 (DevTools 확인)

---

## 3. Phase 2: 고급 기능

**목표**: 실용적인 화상회의 시스템  
**기간**: 1-2주  
**우선순위**: P1 (High)

### 3.1 참여자 제어 (호스트 기능)

- [ ] 개별 음소거 (강제)
- [ ] 강퇴 기능
- [ ] 권한 관리 UI

### 3.2 에러 처리 및 재연결

- [ ] 네트워크 끊김 감지
- [ ] 자동 재연결 (최대 3회)
- [ ] 사용자에게 상태 알림

### 3.3 통화 품질 모니터링

- [ ] WebRTC getStats() 활용
- [ ] 네트워크 품질 표시 (양호/보통/나쁨)
- [ ] Latency, Bandwidth 표시
- [ ] 패킷 손실률 표시

### 3.4 말하는 중 표시

- [ ] Web Audio API로 음량 감지
- [ ] 임계값 이상이면 speaking 상태
- [ ] 비디오 타일에 테두리 애니메이션

### 3.5 채팅 통합

- [ ] 화상회의 중 채팅 패널
- [ ] 사이드바 토글
- [ ] 읽음 표시
- [ ] 파일 공유

---

## 4. Phase 3: 최적화 및 테스트

**목표**: 프로덕션 레디  
**기간**: 1주  
**우선순위**: P2 (Medium)

### 4.1 성능 최적화

- [ ] 비디오 품질 자동 조정
- [ ] Simulcast (해상도 다단계)
- [ ] 참여자 많을 때 레이아웃 최적화

### 4.2 UI/UX 개선

- [ ] 우측 위젯 구현
- [ ] 레이아웃 모드 전환 (그리드/발표자)
- [ ] 키보드 단축키
- [ ] Toast 알림

### 4.3 테스트

- [ ] 단위 테스트 작성
- [ ] 통합 테스트 자동화
- [ ] E2E 테스트 (Playwright)
- [ ] 다중 브라우저 테스트

### 4.4 문서화

- [ ] API 문서 완성
- [ ] 사용자 가이드
- [ ] 트러블슈팅 가이드

---

## 5. 우선순위 매트릭스

| 기능 | 중요도 | 긴급도 | Phase | 예상 시간 |
|-----|--------|--------|-------|----------|
| Socket 이벤트 통일 | ★★★ | ★★★ | 1 | 4시간 |
| WebRTC 연결 검증 | ★★★ | ★★★ | 1 | 8시간 |
| DB 스키마 추가 | ★★★ | ★★★ | 1 | 4시간 |
| REST API 구현 | ★★★ | ★★★ | 1 | 12시간 |
| 통합 테스트 | ★★★ | ★★★ | 1 | 8시간 |
| 참여자 제어 | ★★☆ | ★★☆ | 2 | 8시간 |
| 재연결 로직 | ★★☆ | ★★☆ | 2 | 8시간 |
| 품질 모니터링 | ★★☆ | ★☆☆ | 2 | 12시간 |
| 말하는 중 표시 | ★☆☆ | ★☆☆ | 2 | 6시간 |
| 채팅 통합 | ★★☆ | ★☆☆ | 2 | 8시간 |
| 성능 최적화 | ★★☆ | ★☆☆ | 3 | 12시간 |
| UI/UX 개선 | ★☆☆ | ★☆☆ | 3 | 16시간 |
| 테스트 코드 | ★★☆ | ★☆☆ | 3 | 16시간 |

**총 예상 시간**: 약 122시간 (15일, 주당 40시간 기준)

---

**다음 문서**: [API 명세](./04-api-specification.md)

