# CoUp 프로젝트 - 분리형 아키텍처

> **화상 통화 시스템**: Next.js 16 + 독립 시그널링 서버

---

## 🏗️ 아키텍처 개요

```
┌─────────────────────┐    ┌──────────────────────┐
│  Next.js 16         │    │ Signaling Server     │
│  (포트 3000)        │◄──►│ (포트 4000)          │
│                     │    │                      │
│  - 웹 페이지        │    │  - WebRTC 시그널링   │
│  - REST API         │    │  - 화상 채팅         │
│  - 인증/멤버십      │    │  - 실시간 이벤트     │
└──────────┬──────────┘    └──────────┬───────────┘
           │                          │
           ▼                          ▼
      PostgreSQL ◄────────────────► Redis
      (포트 5432)                  (포트 6379)
```

---

## 📁 프로젝트 구조

```
CoUp/
├── coup/                        # Next.js 프로젝트
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── auth/verify/          # 🆕 시그널링 인증 API
│   │   │   │   └── studies/[id]/
│   │   │   │       └── check-member/     # 🆕 멤버십 확인 API
│   │   │   └── my-studies/[studyId]/
│   │   │       └── video-call/           # 🔄 3단 레이아웃 (참여자|비디오|채팅)
│   │   └── lib/
│   │       └── hooks/
│   │           ├── useSocket.js          # 🔄 시그널링 서버 연결
│   │           └── useVideoCall.js       # WebRTC 훅
│   ├── .env                              # 🔄 NEXT_PUBLIC_SOCKET_URL 추가
│   └── package.json
│
├── signaling-server/            # 🆕 독립 시그널링 서버
│   ├── server.js                # 메인 서버
│   ├── handlers/
│   │   ├── video.js             # 화상 통화 이벤트
│   │   ├── chat.js              # 채팅 이벤트
│   │   └── presence.js          # 온라인 상태
│   ├── middleware/
│   │   └── auth.js              # 소켓 인증
│   ├── utils/
│   │   └── logger.js            # 로깅
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml           # 🆕 로컬 개발 환경
└── README.md                    # 이 파일
```

---

## 🚀 빠른 시작

### 방법 1: Docker Compose (권장)

```bash
# 1. 환경 변수 설정
cp signaling-server/.env.example signaling-server/.env

# 2. 전체 환경 실행
docker-compose up

# 접속
# Next.js: http://localhost:3000
# Signaling: http://localhost:4000/health
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### 방법 2: 개별 실행

#### Terminal 1: Redis
```bash
# Docker로 실행
docker run -p 6379:6379 redis:7-alpine
```

#### Terminal 2: PostgreSQL
```bash
# Docker로 실행
docker run -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=coup \
  postgres:14-alpine
```

#### Terminal 3: 시그널링 서버
```bash
cd signaling-server
npm install
cp .env.example .env
npm run dev
```

#### Terminal 4: Next.js
```bash
cd coup
npm install
npm run dev
```

---

## 🔧 환경 변수 설정

### coup/.env

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coup"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Socket.io (시그널링 서버)
NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"  # 🔥 추가됨

# Development
NODE_ENV="development"
```

### signaling-server/.env

```env
# Server
PORT=4000
NODE_ENV=development

# Next.js URL (인증용)
NEXTJS_URL=http://localhost:3000

# Redis
REDIS_URL=redis://localhost:6379

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Logging
LOG_LEVEL=info
```

---

## 📡 API 엔드포인트

### Next.js API

#### POST /api/auth/verify
시그널링 서버에서 사용자 인증

**Request**:
```json
{
  "userId": "user-123"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "name": "홍길동",
    "email": "hong@example.com",
    "avatar": "...",
    "status": "ACTIVE"
  }
}
```

#### POST /api/studies/[id]/check-member
스터디 멤버십 확인

**Request**:
```json
{
  "userId": "user-123"
}
```

**Response**:
```json
{
  "success": true,
  "member": {
    "id": "member-456",
    "role": "OWNER",
    "status": "ACTIVE"
  },
  "study": {
    "id": "study-789",
    "name": "알고리즘 마스터",
    "status": "ACTIVE"
  }
}
```

### 시그널링 서버 API

#### GET /health
서버 상태 확인

**Response**:
```json
{
  "status": "ok",
  "connections": 5,
  "uptime": 123.45,
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

#### GET /metrics
서버 메트릭

**Response**:
```json
{
  "connections": 5,
  "rooms": 3,
  "roomDetails": [
    { "name": "video:study-123-main", "participants": 3 }
  ],
  "memory": { ... },
  "uptime": 123.45
}
```

---

## 🎮 Socket.io 이벤트

### 화상 통화

#### 클라이언트 → 서버
- `video:join-room` - 방 입장
- `video:leave-room` - 방 퇴장
- `video:offer` - WebRTC Offer
- `video:answer` - WebRTC Answer
- `video:ice-candidate` - ICE Candidate
- `video:toggle-audio` - 오디오 상태
- `video:toggle-video` - 비디오 상태
- `video:screen-share-start` - 화면 공유 시작
- `video:screen-share-stop` - 화면 공유 종료

#### 서버 → 클라이언트
- `video:room-state` - 현재 방 상태
- `video:user-joined` - 새 참여자
- `video:user-left` - 참여자 퇴장
- `video:offer` - Offer 수신
- `video:answer` - Answer 수신
- `video:ice-candidate` - ICE Candidate 수신
- `video:peer-audio-changed` - 상대방 오디오 변경
- `video:peer-video-changed` - 상대방 비디오 변경
- `video:peer-screen-share` - 상대방 화면 공유 변경

### 채팅

#### 클라이언트 → 서버
- `chat:video-message` - 화상 통화 중 채팅

#### 서버 → 클라이언트
- `chat:video-message-received` - 채팅 메시지 수신

---

## 🧪 테스트

### 1. 시그널링 서버 Health Check

```bash
curl http://localhost:4000/health
```

### 2. 화상 통화 테스트

1. 브라우저 1: `http://localhost:3000` 로그인
2. 스터디 입장 → 화상 탭 클릭 → 참여하기
3. 브라우저 2 (시크릿 모드): 다른 계정으로 로그인
4. 같은 스터디 입장 → 화상 탭 클릭 → 참여하기
5. 두 브라우저에서 서로의 비디오 확인
6. 좌측: 참여자 목록 확인
7. 우측: 채팅 테스트

### 3. 동작 확인 체크리스트

- [ ] 시그널링 서버 연결 (콘솔 로그 확인)
- [ ] 카메라/마이크 권한 허용
- [ ] 로컬 비디오 표시
- [ ] 원격 비디오 표시
- [ ] 좌측 참여자 목록에 양쪽 사용자 표시
- [ ] 음소거 버튼 동작
- [ ] 비디오 끄기 동작
- [ ] 우측 채팅 메시지 전송/수신

---

## 📊 모니터링

### 시그널링 서버 로그

```bash
cd signaling-server
tail -f logs/combined.log  # 전체 로그
tail -f logs/error.log     # 에러 로그
```

### 브라우저 콘솔

```javascript
// Socket 연결 상태
console.log(socket.connected);

// WebRTC 연결 상태
peer.connectionState  // connecting, connected, failed
```

---

## 🐛 트러블슈팅

### 시그널링 서버 연결 실패

**증상**: "Failed to connect to signaling server"

**해결**:
1. 시그널링 서버가 실행 중인지 확인
   ```bash
   curl http://localhost:4000/health
   ```
2. `.env` 파일의 `NEXT_PUBLIC_SOCKET_URL` 확인
3. CORS 설정 확인 (`ALLOWED_ORIGINS`)

### 비디오가 보이지 않음

**증상**: 로컬 비디오만 보이고 원격 비디오 안 보임

**해결**:
1. 브라우저 콘솔에서 WebRTC 연결 상태 확인
2. `video:offer`, `video:answer` 이벤트가 정상적으로 전달되는지 확인
3. ICE Candidate가 교환되는지 확인

### 채팅이 안 됨

**증상**: 채팅 메시지가 전송되지 않음

**해결**:
1. Socket 연결 상태 확인 (`socket.connected`)
2. `chat:video-message` 이벤트 리스너 등록 확인
3. 시그널링 서버 로그 확인

---

## 📚 참고 문서

- [시그널링 서버 README](/signaling-server/README.md)
- [화상 통화 설계 문서](/docs/video-call/01-design-analysis.md)
- [아키텍처 문서](/docs/video-call/08-signaling-server-architecture.md)
- [구현 계획](/docs/video-call/03-implementation-plan.md)

---

## 🎯 다음 단계

### Phase 1 완료 ✅
- [x] 시그널링 서버 구축
- [x] Next.js와 연동
- [x] 3단 레이아웃 (참여자 | 비디오 | 채팅)
- [x] 기본 WebRTC 연결
- [x] 인증 API
- [x] Docker Compose 설정

### Phase 2 (다음 작업)
- [ ] WebRTC 연결 안정화
- [ ] 참여자 제어 기능 (호스트)
- [ ] 에러 처리 강화
- [ ] 자동 재연결
- [ ] 통화 품질 모니터링
- [ ] 말하는 중 표시
- [ ] 데이터베이스 세션 기록

### Phase 3 (추후)
- [ ] 성능 최적화
- [ ] 테스트 코드
- [ ] 프로덕션 배포

---

## 📄 라이선스

MIT

---

**작성일**: 2025-11-19  
**아키텍처**: 분리형 (Next.js 16 Standalone + 독립 시그널링 서버)  
**버전**: 1.0.0

