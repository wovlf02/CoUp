# 화상회의 설계 분석

> **작성일**: 2025-11-19  
> **기반 문서**: video-call.md, video-call-supplement.md  
> **분석 목적**: 기존 설계의 요구사항과 기능 명세 파악

---

## 📋 목차

1. [화면 설계](#1-화면-설계)
2. [기능 요구사항](#2-기능-요구사항)
3. [기술 아키텍처](#3-기술-아키텍처)
4. [사용자 플로우](#4-사용자-플로우)
5. [상태 관리](#5-상태-관리)
6. [UI/UX 요구사항](#6-uiux-요구사항)

---

## 1. 화면 설계

### 1.1 대기실 화면

참여하기 전 카메라/마이크 테스트 및 설정을 수행하는 화면

```
┌─────────────────────────────────────────────────────────┐
│ [← 내 스터디 목록]                                       │
│                                                          │
│ [🎨 스터디명]                                            │
│ [개요] [채팅] [공지] [파일] [캘린더] [할일] [화상] [설정]│
│                                                          │
│ ┌─────────────────┬────────────────┐                    │
│ │ 카메라 미리보기 │ 화상 스터디     │  우측 사이드바:   │
│ │                 │                 │  - 참여자 목록    │
│ │  [비디오]       │ 참여하시겠습니까?│  - 안내 사항      │
│ │                 │ [🎥 참여하기]   │                   │
│ └─────────────────┴────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**주요 요소**:
- 카메라 미리보기 (실시간)
- 현재 참여자 수 표시
- 참여하기 버튼
- 디바이스 설정 옵션

### 1.2 화상회의 전체 화면 모드

```
┌──────────────────────────────────────────────────────────┐
│ [🎨 스터디명]  👥 3명  ⏱️ 00:15:23      [← 나가기]    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│         ┌───────────┐  ┌───────────┐                   │
│         │  비디오 1 │  │  비디오 2 │                   │
│         └───────────┘  └───────────┘                   │
│         ┌───────────┐  ┌───────────┐                   │
│         │  비디오 3 │  │  비디오 4 │                   │
│         └───────────┘  └───────────┘                   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  [🎤] [📹] [📺] [⚙️] [← 나가기]                         │
└──────────────────────────────────────────────────────────┘
```

**주요 특징**:
- 좌측 네비게이션 바 유지 (다른 페이지 이동 가능)
- 화상회의 전용 전체 화면 모드
- 상단 헤더와 하단 컨트롤 바
- 비디오 그리드 레이아웃 (반응형)

### 1.3 비디오 타일 상태

각 참여자의 비디오는 다양한 상태를 표시:

1. **정상 연결**: 비디오 스트림 + 이름 + 상태 아이콘
2. **음소거**: 🔇 아이콘 표시
3. **비디오 꺼짐**: 프로필 이미지/이니셜 표시
4. **말하는 중**: 초록색 테두리 애니메이션
5. **화면 공유 중**: 🖥️ 라벨 표시
6. **네트워크 불안정**: ⚠️ 경고 표시

---

## 2. 기능 요구사항

### 2.1 핵심 기능

#### A. 실시간 화상/음성 통화
- WebRTC P2P 연결
- 최대 12명 참여 지원 (권장 6-8명)
- 자동 품질 조정

#### B. 미디어 제어
- **음소거/해제** (단축키: M)
- **비디오 켜기/끄기** (단축키: V)
- **화면 공유** (단축키: S)
  - 전체 화면
  - 특정 창
  - Chrome 탭

#### C. 참여자 관리
- 실시간 참여자 목록
- 온라인/오프라인 상태
- 호스트 전용 기능:
  - 개별 음소거 (강제)
  - 강퇴

#### D. 통화 품질 모니터링
- 네트워크 품질 표시 (양호/보통/나쁨)
- 평균 지연 시간 (Latency)
- 대역폭 사용량
- 데이터 사용량

### 2.2 부가 기능

#### A. 채팅
- 텍스트 메시지 전송
- 파일 공유
- 읽음 표시

#### B. 레이아웃 모드
- **그리드 뷰**: 모든 참여자 동일 크기
- **발표자 모드**: 화면 공유 시 자동 전환
- **갤러리 뷰**: 최대 16명까지 표시

#### C. 레코딩 (선택 사항)
- 통화 녹화
- 클라우드 저장
- 다운로드

#### D. 가상 배경 (선택 사항)
- 배경 흐리기
- 커스텀 배경 이미지

### 2.3 우측 위젯 (화상통화 탭 특화)

#### 스터디 현황
- 다음 일정
- 출석률
- 할일 진척도

#### 화상 통화 상태
- 현재 참여자 수
- 통화 시간
- 네트워크 품질
- 데이터 사용량

#### 통화 중 참여자
- 실시간 상태 (마이크/카메라)
- 말하는 중 표시
- 호스트 제어 버튼

#### 빠른 액션
- 채팅 열기
- 파일 공유
- 공지 작성
- 초대 링크 복사

#### 화상 통화 팁
- 단축키 안내
- 최적 환경 가이드

#### 세션 기록
- 최근 세션 목록
- 참여 시간/인원
- 요약 보기

---

## 3. 기술 아키텍처

### 3.1 전체 구조

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │
       ├─── HTTP/REST ───┐
       │                 ↓
       │         ┌──────────────┐
       │         │  Next.js API │
       │         │   (Backend)  │
       │         └──────────────┘
       │                 │
       ├── WebSocket ────┤
       │   (Socket.io)   │
       │                 │
       └── WebRTC ───────┤
           (P2P)         │
                         ↓
                  ┌─────────────┐
                  │  PostgreSQL │
                  │  (Database) │
                  └─────────────┘
```

### 3.2 WebRTC 연결 흐름

```
Client A                Socket.io Server              Client B
   │                           │                          │
   ├─── join-room ────────────>│                          │
   │                           ├─── user-joined ─────────>│
   │                           │                          │
   │<──── participants ────────┤                          │
   │                           │                          │
   ├─── offer ────────────────>│                          │
   │                           ├─── offer ───────────────>│
   │                           │                          │
   │                           │<──── answer ─────────────┤
   │<──── answer ──────────────┤                          │
   │                           │                          │
   ├─── ice-candidate ────────>│                          │
   │                           ├─── ice-candidate ───────>│
   │                           │                          │
   │<═══════════ WebRTC P2P Connection ═══════════════════│
```

### 3.3 시그널링 이벤트

#### Client → Server

- `video:join-room` - 방 입장
- `video:leave-room` - 방 퇴장
- `video:offer` - WebRTC Offer 전송
- `video:answer` - WebRTC Answer 전송
- `video:ice-candidate` - ICE Candidate 전송
- `video:toggle-audio` - 오디오 상태 변경
- `video:toggle-video` - 비디오 상태 변경
- `video:screen-share-start` - 화면 공유 시작
- `video:screen-share-stop` - 화면 공유 종료

#### Server → Client

- `video:room-joined` - 입장 완료
- `video:participants` - 현재 참여자 목록
- `video:user-joined` - 새 참여자 입장
- `video:user-left` - 참여자 퇴장
- `video:offer` - Offer 수신
- `video:answer` - Answer 수신
- `video:ice-candidate` - ICE Candidate 수신
- `video:peer-audio-changed` - 상대방 오디오 상태 변경
- `video:peer-video-changed` - 상대방 비디오 상태 변경
- `video:peer-screen-share` - 상대방 화면 공유 시작/종료

### 3.4 기술 스택 상세

#### 프론트엔드
- **Next.js 14**: App Router, Server Components
- **React 18**: Hooks, Context API
- **WebRTC API**: RTCPeerConnection, MediaStream
- **Socket.io-client**: 시그널링 통신
- **CSS Modules**: 컴포넌트 스타일링

#### 백엔드
- **Node.js**: 런타임
- **Socket.io**: WebSocket 서버
- **Next.js API Routes**: RESTful API
- **Prisma**: ORM
- **PostgreSQL**: 데이터 저장

#### 인프라
- **STUN Server**: Google STUN (NAT 통과)
- **TURN Server**: 미구현 (필요 시 추가)

---

## 4. 사용자 플로우

### 4.1 화상 통화 시작 플로우

```
1. 내 스터디 대시보드 접속
   │
2. [화상] 탭 클릭
   │
3. 대기실 화면 진입
   ├─ 카메라/마이크 권한 요청
   ├─ 디바이스 선택
   ├─ 미리보기 확인
   └─ 현재 참여자 확인
   │
4. [참여하기] 버튼 클릭
   ├─ 미디어 스트림 획득
   ├─ Socket.io 방 입장
   └─ WebRTC 연결 시작
   │
5. 화상 통화 메인 화면
   ├─ 로컬 비디오 표시
   ├─ 원격 비디오 연결
   └─ 컨트롤 활성화
   │
6. 통화 진행
   ├─ 미디어 제어
   ├─ 채팅
   └─ 화면 공유 등
   │
7. [나가기] 버튼
   ├─ 확인 다이얼로그
   ├─ 연결 종료
   └─ 스트림 정리
   │
8. 대시보드로 복귀
```

### 4.2 화면 공유 플로우

```
1. 화상 통화 중
   │
2. [🖥️ 화면공유] 클릭
   │
3. 공유 옵션 선택
   ├─ 전체 화면
   ├─ 특정 창
   └─ Chrome 탭
   │
4. 브라우저 권한 승인
   │
5. 화면 공유 시작
   ├─ 레이아웃 자동 전환 (발표자 모드)
   ├─ 공유 화면 큰 영역 표시
   ├─ 참여자 썸네일 축소
   └─ Toast 알림
   │
6. 공유 진행 중
   ├─ 버튼 "공유 중지"로 변경
   └─ 브라우저 상단 공유 표시
   │
7. 공유 중지
   ├─ [공유 중지] 클릭
   └─ 또는 브라우저에서 중지
   │
8. 원래 레이아웃 복귀
   └─ 그리드 뷰로 전환
```

### 4.3 참여자 관리 플로우 (호스트)

```
1. OWNER/ADMIN으로 통화 중
   │
2. [👥 참여자] 버튼 클릭
   │
3. 참여자 목록 패널 열림
   │
4. 특정 참여자 선택
   │
5. 제어 옵션
   ├─ [음소거]: 상대방 마이크 강제 음소거
   ├─ [강퇴]: 통화에서 내보내기
   └─ [권한 변경]: ADMIN 권한 부여 (선택)
   │
6. 액션 수행
   ├─ 확인 다이얼로그
   ├─ Socket 이벤트 전송
   └─ UI 업데이트
```

---

## 5. 상태 관리

### 5.1 로컬 상태 (useState)

```javascript
// useVideoCall 훅 내부
const [localStream, setLocalStream] = useState(null);
const [remoteStreams, setRemoteStreams] = useState(new Map());
const [participants, setParticipants] = useState([]);
const [isMuted, setIsMuted] = useState(false);
const [isVideoOff, setIsVideoOff] = useState(false);
const [isSharingScreen, setIsSharingScreen] = useState(false);
const [error, setError] = useState(null);
```

### 5.2 Ref 상태 (useRef)

```javascript
// WebRTC Peer Connections
const peersRef = useRef(new Map());

// MediaStream 참조
const localStreamRef = useRef(null);
const screenStreamRef = useRef(null);

// ICE 서버 설정
const iceServersRef = useRef({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
});
```

### 5.3 서버 상태 (Socket.io)

```javascript
// 방 참여자 정보
rooms: {
  'study-123-main': {
    participants: [
      { socketId: 'abc123', userId: 'user1', ... }
    ]
  }
}

// 사용자 연결 정보
sockets: {
  'abc123': {
    userId: 'user1',
    user: { name: '김철수', ... },
    rooms: ['study:123', 'video:study-123-main']
  }
}
```

---

## 6. UI/UX 요구사항

### 6.1 반응형 레이아웃

#### 비디오 그리드 크기 조정

```css
/* 1명: 전체 화면 */
.grid1 { grid-template-columns: 1fr; }

/* 2-4명: 2x2 그리드 */
.grid2x2 { grid-template-columns: repeat(2, 1fr); }

/* 5-9명: 3x3 그리드 */
.grid3x3 { grid-template-columns: repeat(3, 1fr); }

/* 10-12명: 4x3 그리드 */
.grid4x3 { grid-template-columns: repeat(4, 1fr); }
```

### 6.2 애니메이션

#### 말하는 중 표시

```css
.video-card.speaking {
  border: 3px solid #10B981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { border-color: #10B981; }
  50% { border-color: #34D399; }
}
```

#### 연결 상태 전환

```css
.video-card {
  transition: all 0.3s ease;
}

.video-card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
```

### 6.3 접근성

- **키보드 단축키**:
  - `M`: 음소거 토글
  - `V`: 비디오 토글
  - `S`: 화면 공유
  - `C`: 채팅 열기
  - `ESC`: 전체화면 나가기

- **스크린 리더 지원**:
  - 모든 버튼에 `aria-label`
  - 상태 변경 시 `aria-live` 알림

- **고대비 모드**: 
  - 아이콘과 텍스트 명확히 구분
  - 색상에만 의존하지 않는 상태 표시

### 6.4 성능 최적화

1. **비디오 품질 자동 조정**
   - 네트워크 상태에 따라 해상도/프레임률 조정

2. **레이지 로딩**
   - 화상회의 컴포넌트는 필요할 때만 로드

3. **메모리 관리**
   - 연결 종료 시 모든 스트림과 Peer 정리
   - `useEffect` cleanup 함수 활용

4. **배치 업데이트**
   - 참여자 목록 변경 시 한 번에 업데이트

---

## 7. 보안 요구사항

### 7.1 인증 및 권한

- **접근 제한**: 스터디 멤버만 입장 가능
- **권한 검증**: OWNER/ADMIN만 특정 기능 사용
- **토큰 검증**: Socket.io 연결 시 인증 토큰 확인

### 7.2 데이터 보호

- **P2P 암호화**: WebRTC DTLS/SRTP 자동 암호화
- **시그널링 암호화**: WSS (WebSocket Secure) 사용
- **개인정보**: 비디오 스트림은 저장하지 않음

### 7.3 남용 방지

- **Rate Limiting**: 과도한 연결 시도 차단
- **강퇴 기능**: 부적절한 사용자 제거
- **모니터링**: 이상 행동 탐지 및 로깅

---

## 8. 에러 처리

### 8.1 미디어 권한 에러

```javascript
try {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // 사용자가 권한 거부
    showError('카메라와 마이크 권한이 필요합니다.');
  } else if (error.name === 'NotFoundError') {
    // 디바이스 없음
    showError('카메라 또는 마이크를 찾을 수 없습니다.');
  }
}
```

### 8.2 연결 실패

```javascript
peer.onconnectionstatechange = () => {
  if (peer.connectionState === 'failed') {
    // 재연결 시도 또는 에러 표시
    handleConnectionFailed(socketId);
  }
};
```

### 8.3 네트워크 품질 저하

```javascript
peer.oniceconnectionstatechange = () => {
  if (peer.iceConnectionState === 'disconnected') {
    showWarning('네트워크 연결이 불안정합니다.');
  }
};
```

---

## 9. 분석 결과 요약

### 9.1 잘 정의된 부분

✅ **UI/UX 설계**: 화면 레이아웃과 사용자 플로우가 명확  
✅ **기능 명세**: 핵심 기능과 부가 기능이 구분됨  
✅ **기술 선택**: WebRTC + Socket.io 조합 적절  
✅ **상태 관리**: 로컬/서버 상태 분리 전략 명확  

### 9.2 추가 설계 필요한 부분

⚠️ **데이터베이스 스키마**: 세션 기록 저장 구조  
⚠️ **API 명세**: RESTful API 엔드포인트 정의  
⚠️ **에러 복구 전략**: 자동 재연결 로직  
⚠️ **테스트 시나리오**: 통합 테스트 케이스  
⚠️ **배포 전략**: 프로덕션 환경 설정  

### 9.3 선택 사항 (Phase 2)

🔮 **레코딩 기능**: 서버 측 구현 필요  
🔮 **가상 배경**: Canvas API 활용  
🔮 **TURN 서버**: 방화벽 우회  
🔮 **SFU 서버**: 대규모 회의 지원  
🔮 **모바일 앱**: React Native 포팅  

---

**다음 문서**: [현재 구현 상태](./02-current-status.md)

