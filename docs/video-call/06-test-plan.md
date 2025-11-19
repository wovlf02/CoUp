# 화상회의 테스트 계획

> **작성일**: 2025-11-19  
> **목적**: 화상회의 시스템의 품질 보증  
> **범위**: 단위/통합/E2E 테스트

---

## 📋 목차

1. [테스트 전략](#1-테스트-전략)
2. [단위 테스트](#2-단위-테스트)
3. [통합 테스트](#3-통합-테스트)
4. [E2E 테스트](#4-e2e-테스트)
5. [성능 테스트](#5-성능-테스트)
6. [호환성 테스트](#6-호환성-테스트)
7. [보안 테스트](#7-보안-테스트)
8. [테스트 자동화](#8-테스트-자동화)

---

## 1. 테스트 전략

### 1.1 테스트 피라미드

```
       ┌─────────────┐
       │   E2E (5%)  │  ← 전체 시나리오 (느림)
       ├─────────────┤
       │ Integration │  ← API & Socket (중간)
       │    (25%)    │
       ├─────────────┤
       │   Unit      │  ← 함수/컴포넌트 (빠름)
       │   (70%)     │
       └─────────────┘
```

### 1.2 테스트 환경

| 환경 | 용도 | URL |
|-----|------|-----|
| Local | 개발 및 단위 테스트 | `localhost:3000` |
| Staging | 통합 테스트 | `staging.coup.com` |
| Production | 모니터링 | `coup.com` |

### 1.3 성공 기준

| 메트릭 | 목표 |
|-------|------|
| 테스트 커버리지 | 80% 이상 |
| 단위 테스트 통과율 | 100% |
| 통합 테스트 통과율 | 95% 이상 |
| E2E 테스트 통과율 | 90% 이상 |
| 평균 응답 시간 | 200ms 이하 |
| WebRTC 연결 성공률 | 95% 이상 |

---

## 2. 단위 테스트

### 2.1 useVideoCall 훅 테스트

#### 파일: `/coup/src/lib/hooks/__tests__/useVideoCall.test.js`

```javascript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useVideoCall } from '../useVideoCall';
import { useSocket } from '../useSocket';

// Mock Socket.io
jest.mock('../useSocket');

describe('useVideoCall', () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    };

    useSocket.mockReturnValue({
      socket: mockSocket,
      isConnected: true
    });

    // Mock getUserMedia
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn().mockResolvedValue({
        getTracks: () => [
          { kind: 'video', stop: jest.fn() },
          { kind: 'audio', stop: jest.fn() }
        ],
        getVideoTracks: () => [{ kind: 'video' }],
        getAudioTracks: () => [{ kind: 'audio' }]
      }),
      getDisplayMedia: jest.fn()
    };

    // Mock RTCPeerConnection
    global.RTCPeerConnection = jest.fn(() => ({
      addTrack: jest.fn(),
      createOffer: jest.fn().mockResolvedValue({}),
      createAnswer: jest.fn().mockResolvedValue({}),
      setLocalDescription: jest.fn(),
      setRemoteDescription: jest.fn(),
      addIceCandidate: jest.fn(),
      close: jest.fn(),
      getSenders: jest.fn(() => []),
      ontrack: null,
      onicecandidate: null,
      onconnectionstatechange: null
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('joinRoom', () => {
    it('로컬 스트림을 초기화하고 방에 입장해야 함', async () => {
      const { result } = renderHook(() => useVideoCall('study-123', 'room-main'));

      await act(async () => {
        await result.current.joinRoom(true, true);
      });

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: expect.any(Object),
        audio: expect.any(Object)
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('video:join-room', {
        studyId: 'study-123',
        roomId: 'room-main'
      });

      expect(result.current.localStream).toBeTruthy();
    });

    it('비디오 없이 입장 가능해야 함', async () => {
      const { result } = renderHook(() => useVideoCall('study-123', 'room-main'));

      await act(async () => {
        await result.current.joinRoom(false, true);
      });

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: false,
        audio: expect.any(Object)
      });
    });

    it('권한 거부 시 에러를 설정해야 함', async () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useVideoCall('study-123', 'room-main'));

      await act(async () => {
        try {
          await result.current.joinRoom(true, true);
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toBe('카메라와 마이크 권한이 필요합니다.');
    });
  });

  describe('leaveRoom', () => {
    it('모든 스트림과 Peer Connection을 정리해야 함', async () => {
      const { result } = renderHook(() => useVideoCall('study-123', 'room-main'));

      // 먼저 입장
      await act(async () => {
        await result.current.joinRoom(true, true);
      });

      // 나가기
      act(() => {
        result.current.leaveRoom();
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('video:leave-room', {
        roomId: 'room-main'
      });

      expect(result.current.localStream).toBeNull();
    });
  });

  describe('toggleMute', () => {
    it('오디오 트랙을 토글해야 함', async () => {
      const audioTrack = { enabled: true };
      const mockStream = {
        getTracks: () => [audioTrack],
        getVideoTracks: () => [],
        getAudioTracks: () => [audioTrack]
      };

      navigator.mediaDevices.getUserMedia.mockResolvedValueOnce(mockStream);

      const { result } = renderHook(() => useVideoCall('study-123', 'room-main'));

      await act(async () => {
        await result.current.joinRoom(true, true);
      });

      act(() => {
        const newState = result.current.toggleMute();
        expect(newState).toBe(false); // 음소거됨
        expect(audioTrack.enabled).toBe(false);
      });
    });
  });

  describe('toggleVideo', () => {
    it('비디오 트랙을 토글해야 함', async () => {
      const videoTrack = { enabled: true };
      const mockStream = {
        getTracks: () => [videoTrack],
        getVideoTracks: () => [videoTrack],
        getAudioTracks: () => []
      };

      navigator.mediaDevices.getUserMedia.mockResolvedValueOnce(mockStream);

      const { result } = renderHook(() => useVideoCall('study-123', 'room-main'));

      await act(async () => {
        await result.current.joinRoom(true, true);
      });

      act(() => {
        const newState = result.current.toggleVideo();
        expect(newState).toBe(false); // 비디오 꺼짐
        expect(videoTrack.enabled).toBe(false);
      });
    });
  });

  describe('shareScreen', () => {
    it('화면 공유를 시작해야 함', async () => {
      const screenTrack = { kind: 'video', onended: null };
      const mockScreenStream = {
        getVideoTracks: () => [screenTrack]
      };

      navigator.mediaDevices.getDisplayMedia.mockResolvedValueOnce(mockScreenStream);

      const { result } = renderHook(() => useVideoCall('study-123', 'room-main'));

      await act(async () => {
        await result.current.joinRoom(true, true);
      });

      await act(async () => {
        await result.current.shareScreen();
      });

      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalled();
      expect(result.current.isSharingScreen).toBe(true);
      expect(mockSocket.emit).toHaveBeenCalledWith('video:screen-share-start', {
        roomId: 'room-main'
      });
    });
  });
});
```

### 2.2 VideoTile 컴포넌트 테스트

#### 파일: `/coup/src/components/video-call/__tests__/VideoTile.test.jsx`

```javascript
import { render, screen } from '@testing-library/react';
import VideoTile from '../VideoTile';

describe('VideoTile', () => {
  const mockUser = {
    id: 'user-1',
    name: '김철수',
    avatar: 'https://example.com/avatar.jpg'
  };

  it('비디오 스트림을 렌더링해야 함', () => {
    const mockStream = new MediaStream();
    
    render(
      <VideoTile
        stream={mockStream}
        user={mockUser}
        isLocal={false}
      />
    );

    const video = screen.getByRole('img', { hidden: true }); // video element
    expect(video).toBeInTheDocument();
    expect(screen.getByText('김철수')).toBeInTheDocument();
  });

  it('비디오 꺼짐 시 아바타를 표시해야 함', () => {
    render(
      <VideoTile
        stream={null}
        user={mockUser}
        isLocal={false}
        isVideoOff={true}
      />
    );

    expect(screen.getByText('김')).toBeInTheDocument(); // 이니셜
    expect(screen.getByText(/📹❌/)).toBeInTheDocument();
  });

  it('음소거 시 아이콘을 표시해야 함', () => {
    const mockStream = new MediaStream();
    
    render(
      <VideoTile
        stream={mockStream}
        user={mockUser}
        isLocal={false}
        isMuted={true}
      />
    );

    expect(screen.getByText(/🔇/)).toBeInTheDocument();
  });

  it('말하는 중일 때 speaking 클래스를 추가해야 함', () => {
    const mockStream = new MediaStream();
    
    const { container } = render(
      <VideoTile
        stream={mockStream}
        user={mockUser}
        isLocal={false}
        isSpeaking={true}
      />
    );

    const tile = container.firstChild;
    expect(tile).toHaveClass('speaking');
  });

  it('로컬 비디오는 "(나)" 표시해야 함', () => {
    const mockStream = new MediaStream();
    
    render(
      <VideoTile
        stream={mockStream}
        user={mockUser}
        isLocal={true}
      />
    );

    expect(screen.getByText('김철수 (나)')).toBeInTheDocument();
  });
});
```

### 2.3 ControlBar 컴포넌트 테스트

#### 파일: `/coup/src/components/video-call/__tests__/ControlBar.test.jsx`

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import ControlBar from '../ControlBar';

describe('ControlBar', () => {
  const defaultProps = {
    isMuted: false,
    isVideoOff: false,
    isSharingScreen: false,
    onToggleMute: jest.fn(),
    onToggleVideo: jest.fn(),
    onShareScreen: jest.fn(),
    onLeave: jest.fn(),
    onSettings: jest.fn(),
    callDuration: '00:15:32'
  };

  it('모든 컨트롤 버튼을 렌더링해야 함', () => {
    render(<ControlBar {...defaultProps} />);

    expect(screen.getByTitle('음소거')).toBeInTheDocument();
    expect(screen.getByTitle('비디오 끄기')).toBeInTheDocument();
    expect(screen.getByTitle('화면 공유')).toBeInTheDocument();
    expect(screen.getByTitle('설정')).toBeInTheDocument();
    expect(screen.getByTitle('나가기')).toBeInTheDocument();
  });

  it('통화 시간을 표시해야 함', () => {
    render(<ControlBar {...defaultProps} />);

    expect(screen.getByText(/00:15:32/)).toBeInTheDocument();
  });

  it('음소거 버튼 클릭 시 핸들러를 호출해야 함', () => {
    render(<ControlBar {...defaultProps} />);

    const muteButton = screen.getByTitle('음소거');
    fireEvent.click(muteButton);

    expect(defaultProps.onToggleMute).toHaveBeenCalledTimes(1);
  });

  it('비디오 버튼 클릭 시 핸들러를 호출해야 함', () => {
    render(<ControlBar {...defaultProps} />);

    const videoButton = screen.getByTitle('비디오 끄기');
    fireEvent.click(videoButton);

    expect(defaultProps.onToggleVideo).toHaveBeenCalledTimes(1);
  });

  it('화면 공유 버튼 클릭 시 핸들러를 호출해야 함', () => {
    render(<ControlBar {...defaultProps} />);

    const shareButton = screen.getByTitle('화면 공유');
    fireEvent.click(shareButton);

    expect(defaultProps.onShareScreen).toHaveBeenCalledTimes(1);
  });

  it('음소거 상태에 따라 아이콘을 변경해야 함', () => {
    const { rerender } = render(<ControlBar {...defaultProps} />);
    expect(screen.getByText('🎤')).toBeInTheDocument();

    rerender(<ControlBar {...defaultProps} isMuted={true} />);
    expect(screen.getByText('🔇')).toBeInTheDocument();
  });

  it('비디오 상태에 따라 아이콘을 변경해야 함', () => {
    const { rerender } = render(<ControlBar {...defaultProps} />);
    expect(screen.getByText('📹')).toBeInTheDocument();

    rerender(<ControlBar {...defaultProps} isVideoOff={true} />);
    expect(screen.getByText('📹❌')).toBeInTheDocument();
  });
});
```

---

## 3. 통합 테스트

### 3.1 Socket.io 이벤트 테스트

#### 파일: `/coup/src/lib/socket/__tests__/video-events.test.js`

```javascript
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { handleVideoCallEvents } from '../server';

describe('Video Call Socket Events', () => {
  let io, serverSocket, clientSocket1, clientSocket2;

  beforeAll((done) => {
    // 테스트 서버 시작
    const httpServer = require('http').createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      
      clientSocket1 = Client(`http://localhost:${port}`, {
        auth: { userId: 'user-1' }
      });
      
      clientSocket2 = Client(`http://localhost:${port}`, {
        auth: { userId: 'user-2' }
      });

      io.on('connection', (socket) => {
        socket.userId = socket.handshake.auth.userId;
        socket.user = { id: socket.userId, name: `User ${socket.userId}` };
        handleVideoCallEvents(socket);
        
        if (!serverSocket) {
          serverSocket = socket;
        }
      });

      clientSocket1.on('connect', () => {
        clientSocket2.on('connect', done);
      });
    });
  });

  afterAll(() => {
    io.close();
    clientSocket1.close();
    clientSocket2.close();
  });

  test('방 입장 시 기존 참여자 목록을 받아야 함', (done) => {
    // User 1이 먼저 입장
    clientSocket1.emit('video:join-room', {
      studyId: 'study-123',
      roomId: 'room-main'
    });

    // User 2가 입장
    clientSocket2.on('video:room-state', ({ participants }) => {
      expect(participants).toHaveLength(1);
      expect(participants[0].userId).toBe('user-1');
      done();
    });

    setTimeout(() => {
      clientSocket2.emit('video:join-room', {
        studyId: 'study-123',
        roomId: 'room-main'
      });
    }, 100);
  });

  test('새 참여자 입장 시 기존 참여자에게 알림이 가야 함', (done) => {
    clientSocket1.on('video:user-joined', ({ userId }) => {
      expect(userId).toBe('user-2');
      done();
    });

    clientSocket2.emit('video:join-room', {
      studyId: 'study-123',
      roomId: 'room-main'
    });
  });

  test('Offer를 올바르게 전달해야 함', (done) => {
    const offer = { type: 'offer', sdp: 'mock-sdp' };

    clientSocket2.on('video:offer', ({ from, offer: receivedOffer }) => {
      expect(from).toBe(clientSocket1.id);
      expect(receivedOffer).toEqual(offer);
      done();
    });

    clientSocket1.emit('video:offer', {
      to: clientSocket2.id,
      offer
    });
  });

  test('Answer를 올바르게 전달해야 함', (done) => {
    const answer = { type: 'answer', sdp: 'mock-sdp' };

    clientSocket1.on('video:answer', ({ from, answer: receivedAnswer }) => {
      expect(from).toBe(clientSocket2.id);
      expect(receivedAnswer).toEqual(answer);
      done();
    });

    clientSocket2.emit('video:answer', {
      to: clientSocket1.id,
      answer
    });
  });

  test('ICE Candidate를 올바르게 전달해야 함', (done) => {
    const candidate = { candidate: 'mock-candidate', sdpMid: '0' };

    clientSocket2.on('video:ice-candidate', ({ from, candidate: receivedCandidate }) => {
      expect(from).toBe(clientSocket1.id);
      expect(receivedCandidate).toEqual(candidate);
      done();
    });

    clientSocket1.emit('video:ice-candidate', {
      to: clientSocket2.id,
      candidate
    });
  });

  test('방 퇴장 시 다른 참여자에게 알림이 가야 함', (done) => {
    clientSocket2.on('video:user-left', ({ userId }) => {
      expect(userId).toBe('user-1');
      done();
    });

    clientSocket1.emit('video:leave-room', {
      roomId: 'room-main'
    });
  });
});
```

### 3.2 REST API 테스트

#### 파일: `/coup/src/app/api/my-studies/[studyId]/video-call/__tests__/api.test.js`

```javascript
import { POST as startVideoCall } from '../start/route';
import { GET as getStatus } from '../status/route';
import { POST as joinCall } from '../join/route';
import { POST as leaveCall } from '../leave/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma');
jest.mock('next-auth');

describe('Video Call API', () => {
  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /start', () => {
    it('새 세션을 생성해야 함', async () => {
      prisma.studyMember.findUnique.mockResolvedValue({
        id: 'member-1',
        status: 'ACTIVE'
      });

      prisma.videoCallSession.findFirst.mockResolvedValue(null);
      
      const mockNewSession = {
        id: 'session-1',
        studyId: 'study-123',
        roomId: 'study-study-123-main',
        startedBy: 'user-123'
      };
      
      prisma.videoCallSession.create.mockResolvedValue(mockNewSession);

      const request = new Request('http://localhost/api/my-studies/study-123/video-call/start', {
        method: 'POST'
      });

      const response = await startVideoCall(request, { params: { studyId: 'study-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session).toEqual(mockNewSession);
    });

    it('멤버가 아니면 403 에러를 반환해야 함', async () => {
      prisma.studyMember.findUnique.mockResolvedValue(null);

      const request = new Request('http://localhost/api/my-studies/study-123/video-call/start', {
        method: 'POST'
      });

      const response = await startVideoCall(request, { params: { studyId: 'study-123' } });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /status', () => {
    it('활성 세션 정보를 반환해야 함', async () => {
      const mockSession = {
        id: 'session-1',
        studyId: 'study-123',
        roomId: 'study-study-123-main',
        startedBy: 'user-123',
        startedAt: new Date(),
        endedAt: null,
        starter: {
          id: 'user-123',
          name: '김철수'
        },
        participants: []
      };

      prisma.videoCallSession.findFirst.mockResolvedValue(mockSession);

      const request = new Request('http://localhost/api/my-studies/study-123/video-call/status');
      const response = await getStatus(request, { params: { studyId: 'study-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session).toEqual(mockSession);
    });

    it('세션이 없으면 null을 반환해야 함', async () => {
      prisma.videoCallSession.findFirst.mockResolvedValue(null);

      const request = new Request('http://localhost/api/my-studies/study-123/video-call/status');
      const response = await getStatus(request, { params: { studyId: 'study-123' } });
      const data = await response.json();

      expect(data.session).toBeNull();
    });
  });
});
```

---

## 4. E2E 테스트

### 4.1 Playwright 설정

#### 파일: `/coup/playwright.config.js`

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // 화상회의는 순차 실행
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // 화상회의는 병렬 불가
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

### 4.2 E2E 테스트 시나리오

#### 파일: `/coup/e2e/video-call.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('화상회의', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('대기실에서 참여하기까지', async ({ page }) => {
    // 스터디 입장
    await page.goto('/my-studies/test-study-id');
    
    // 화상 탭 클릭
    await page.click('text=화상');
    await page.waitForURL('**/video-call');

    // 대기실 확인
    await expect(page.locator('text=화상 스터디')).toBeVisible();
    await expect(page.locator('text=참여하시겠습니까?')).toBeVisible();

    // 카메라 미리보기 확인
    await expect(page.locator('video')).toBeVisible();

    // 참여하기 버튼 클릭
    await page.click('button:has-text("참여하기")');

    // 전체 화면 모드 확인
    await expect(page.locator('.fullscreenContainer')).toBeVisible();
    await expect(page.locator('.videoGrid')).toBeVisible();
    await expect(page.locator('.controlBar')).toBeVisible();
  });

  test('음소거 토글', async ({ page, context }) => {
    // 화상회의 입장
    await page.goto('/my-studies/test-study-id/video-call');
    await page.click('button:has-text("참여하기")');

    // 음소거 버튼 클릭
    const muteButton = page.locator('button[title*="음소거"]');
    await muteButton.click();

    // 음소거 아이콘 확인
    await expect(muteButton).toContainText('🔇');

    // 다시 클릭하여 음소거 해제
    await muteButton.click();
    await expect(muteButton).toContainText('🎤');
  });

  test('비디오 토글', async ({ page }) => {
    await page.goto('/my-studies/test-study-id/video-call');
    await page.click('button:has-text("참여하기")');

    // 비디오 버튼 클릭
    const videoButton = page.locator('button[title*="비디오"]');
    await videoButton.click();

    // 프로필 이미지 표시 확인
    await expect(page.locator('.avatarContainer')).toBeVisible();
  });

  test('나가기', async ({ page }) => {
    await page.goto('/my-studies/test-study-id/video-call');
    await page.click('button:has-text("참여하기")');

    // 나가기 버튼 클릭
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("나가기")');

    // 스터디 페이지로 이동 확인
    await page.waitForURL('**/my-studies/test-study-id');
  });
});

test.describe('2명 화상회의', () => {
  test('두 사용자 간 연결', async ({ browser }) => {
    // 첫 번째 사용자 컨텍스트
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    
    await page1.goto('/login');
    await page1.fill('input[name="email"]', 'user1@example.com');
    await page1.fill('input[name="password"]', 'password123');
    await page1.click('button[type="submit"]');

    // 두 번째 사용자 컨텍스트
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    await page2.goto('/login');
    await page2.fill('input[name="email"]', 'user2@example.com');
    await page2.fill('input[name="password"]', 'password123');
    await page2.click('button[type="submit"]');

    // 두 사용자 모두 화상회의 입장
    await page1.goto('/my-studies/test-study-id/video-call');
    await page1.click('button:has-text("참여하기")');

    await page2.goto('/my-studies/test-study-id/video-call');
    await page2.click('button:has-text("참여하기")');

    // 각자 상대방 비디오 보임 확인
    await expect(page1.locator('.videoTile').nth(1)).toBeVisible({ timeout: 10000 });
    await expect(page2.locator('.videoTile').nth(1)).toBeVisible({ timeout: 10000 });

    // 참여자 수 확인
    await expect(page1.locator('text=/👥.*2명/')).toBeVisible();
    await expect(page2.locator('text=/👥.*2명/')).toBeVisible();

    // Cleanup
    await context1.close();
    await context2.close();
  });
});
```

---

## 5. 성능 테스트

### 5.1 연결 시간 측정

```javascript
test('WebRTC 연결이 5초 이내에 완료되어야 함', async ({ page }) => {
  await page.goto('/my-studies/test-study-id/video-call');
  
  const startTime = Date.now();
  await page.click('button:has-text("참여하기")');
  
  // 비디오 표시 대기
  await page.waitForSelector('video', { state: 'visible' });
  
  const endTime = Date.now();
  const connectionTime = endTime - startTime;
  
  expect(connectionTime).toBeLessThan(5000);
  console.log(`Connection time: ${connectionTime}ms`);
});
```

### 5.2 메모리 누수 테스트

```javascript
test('참여/퇴장 반복 시 메모리 누수가 없어야 함', async ({ page }) => {
  await page.goto('/my-studies/test-study-id/video-call');

  for (let i = 0; i < 5; i++) {
    // 참여
    await page.click('button:has-text("참여하기")');
    await page.waitForSelector('.videoGrid');
    
    // 메모리 측정
    const metrics = await page.metrics();
    console.log(`Iteration ${i + 1} - JS Heap: ${metrics.JSHeapUsedSize / 1024 / 1024} MB`);
    
    // 나가기
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("나가기")');
    await page.waitForURL('**/my-studies/**', { waitUntil: 'networkidle' });
    
    // 대기
    await page.waitForTimeout(2000);
  }
  
  // 최종 메모리 확인
  const finalMetrics = await page.metrics();
  const heapMB = finalMetrics.JSHeapUsedSize / 1024 / 1024;
  
  expect(heapMB).toBeLessThan(100); // 100MB 이하
});
```

### 5.3 다중 참여자 성능 테스트

```javascript
test('6명 참여 시 성능이 정상이어야 함', async ({ browser }) => {
  const contexts = [];
  const pages = [];

  // 6명의 사용자 생성
  for (let i = 0; i < 6; i++) {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('/login');
    await page.fill('input[name="email"]', `user${i}@example.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    contexts.push(context);
    pages.push(page);
  }

  // 모두 화상회의 입장
  for (const page of pages) {
    await page.goto('/my-studies/test-study-id/video-call');
    await page.click('button:has-text("참여하기")');
  }

  // 각 페이지에서 5개의 원격 비디오 확인 (자신 제외)
  for (const page of pages) {
    const videoCount = await page.locator('.videoTile').count();
    expect(videoCount).toBe(6); // 자신 포함 6개
  }

  // 성능 측정
  for (let i = 0; i < pages.length; i++) {
    const metrics = await pages[i].metrics();
    console.log(`User ${i + 1} - FPS: ${metrics.LayoutDuration}, Heap: ${metrics.JSHeapUsedSize / 1024 / 1024} MB`);
  }

  // Cleanup
  for (const context of contexts) {
    await context.close();
  }
});
```

---

## 6. 호환성 테스트

### 6.1 브라우저 호환성

| 브라우저 | 버전 | 상태 | 테스트 필요 기능 |
|---------|------|------|-----------------|
| Chrome | 90+ | ✅ | 전체 |
| Firefox | 85+ | ✅ | 전체 |
| Safari | 14+ | ⚠️ | getDisplayMedia 제한 |
| Edge | 90+ | ✅ | 전체 |
| Mobile Chrome | Latest | ✅ | 터치 UI |
| Mobile Safari | Latest | ⚠️ | 제약 사항 확인 |

### 6.2 디바이스 호환성

```javascript
test.describe('디바이스 테스트', () => {
  const devices = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Laptop', width: 1366, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];

  devices.forEach(device => {
    test(`${device.name} 레이아웃 테스트`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto('/my-studies/test-study-id/video-call');
      
      // 레이아웃 확인
      const videoGrid = page.locator('.videoGrid');
      await expect(videoGrid).toBeVisible();
      
      // 스크린샷
      await page.screenshot({ path: `screenshots/video-call-${device.name}.png` });
    });
  });
});
```

---

## 7. 보안 테스트

### 7.1 권한 테스트

```javascript
test('비멤버는 화상회의에 접근할 수 없어야 함', async ({ page }) => {
  // 멤버가 아닌 사용자로 로그인
  await page.goto('/login');
  await page.fill('input[name="email"]', 'non-member@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // 화상회의 URL 직접 접근
  await page.goto('/my-studies/other-study/video-call');

  // 403 에러 또는 리다이렉트 확인
  await expect(page.locator('text=/접근.*권한/')).toBeVisible();
});

test('PENDING 멤버는 화상회의에 접근할 수 없어야 함', async ({ page }) => {
  // PENDING 멤버로 로그인
  await page.goto('/login');
  await page.fill('input[name="email"]', 'pending@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.goto('/my-studies/test-study-id/video-call');
  await expect(page.locator('text=/승인.*대기/')).toBeVisible();
});
```

### 7.2 Rate Limiting 테스트

```javascript
test('과도한 연결 시도는 차단되어야 함', async ({ page }) => {
  await page.goto('/my-studies/test-study-id/video-call');

  // 10번 연속 참여 시도
  for (let i = 0; i < 10; i++) {
    await page.click('button:has-text("참여하기")');
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("나가기")').catch(() => {});
  }

  // Rate limit 에러 확인
  await expect(page.locator('text=/너무.*많은.*요청/')).toBeVisible({ timeout: 5000 });
});
```

---

## 8. 테스트 자동화

### 8.1 CI/CD 통합

#### 파일: `.github/workflows/test.yml`

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage

  integration-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### 8.2 테스트 스크립트

#### 파일: `package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=__tests__",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

---

## 📊 테스트 결과 리포트

### 커버리지 목표

```
Statement Coverage   : 80%
Branch Coverage      : 75%
Function Coverage    : 80%
Line Coverage        : 80%
```

### 리포트 생성

```bash
# 커버리지 리포트
npm run test:coverage

# E2E 리포트
npx playwright show-report

# HTML 리포트
open coverage/index.html
```

---

**작업 완료**: 화상회의 테스트 계획 문서화 완료 ✅

