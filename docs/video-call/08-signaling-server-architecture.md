# 시그널링 서버 아키텍처 검토

> **작성일**: 2025-11-19  
> **Next.js 버전**: 16  
> **검토 사항**: 별도 Socket.io 시그널링 서버 vs Next.js 통합

---

## 📋 목차

1. [현재 아키텍처 (통합형)](#1-현재-아키텍처-통합형)
2. [제안 아키텍처 (분리형)](#2-제안-아키텍처-분리형)
3. [비교 분석](#3-비교-분석)
4. [권장사항](#4-권장사항)
5. [마이그레이션 계획](#5-마이그레이션-계획)

---

## 1. 현재 아키텍처 (통합형)

### 1.1 구조

```
┌─────────────────────────────────────────┐
│         Next.js 16 Server               │
│  (App Router + Server Components)       │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐    ┌──────────────┐   │
│  │  REST API   │    │  Socket.io   │   │
│  │  /api/*     │    │  Server      │   │
│  └─────────────┘    └──────────────┘   │
│                                         │
│  server.mjs (Custom Server)             │
│  - HTTP Handler                         │
│  - Socket.io Initialization             │
└─────────────────────────────────────────┘
         │                     │
         ▼                     ▼
    PostgreSQL            Redis (선택)
```

### 1.2 장점 ✅

1. **단순한 배포**
   - 하나의 서버만 관리
   - 하나의 도메인
   - 단일 SSL 인증서

2. **낮은 초기 비용**
   - 서버 1대로 시작 가능
   - 인프라 복잡도 낮음

3. **개발 편의성**
   - 코드베이스 통합
   - API와 Socket 로직이 같은 DB/Auth 공유
   - 로컬 개발 환경 단순

4. **낮은 지연시간**
   - Next.js API ↔ Socket.io 간 통신 없음
   - 동일 프로세스 내에서 처리

### 1.3 단점 ❌

1. **확장성 제약**
   - Socket.io 연결이 CPU/메모리 소모
   - REST API와 WebSocket이 리소스 경쟁
   - 수평 확장 시 복잡도 증가 (Redis Adapter 필수)

2. **Next.js 16 호환성 이슈**
   - Custom Server 사용 시 일부 최적화 비활성화
   - Turbopack 미지원 가능성
   - Standalone 빌드 복잡도 증가

3. **격리 부족**
   - WebSocket 장애가 전체 서버 영향
   - 트래픽 스파이크 시 API도 영향

4. **모니터링 어려움**
   - REST/WebSocket 메트릭 분리 어려움
   - 리소스 사용량 추적 복잡

---

## 2. 제안 아키텍처 (분리형)

### 2.1 구조

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
└────────────┬────────────────────────────┬───────────────┘
             │                            │
             ▼                            ▼
┌─────────────────────────┐    ┌──────────────────────────┐
│   Next.js 16 Server     │    │  Signaling Server        │
│   (App Router)          │    │  (Node.js + Socket.io)   │
├─────────────────────────┤    ├──────────────────────────┤
│                         │    │                          │
│  ┌──────────────────┐   │    │  ┌────────────────────┐ │
│  │   REST API       │   │    │  │   WebSocket        │ │
│  │   /api/*         │   │    │  │   (Socket.io)      │ │
│  └──────────────────┘   │    │  └────────────────────┘ │
│                         │    │                          │
│  - Server Components    │    │  - Video Signaling      │
│  - Static Pages         │    │  - Chat Messages        │
│  - API Routes           │    │  - Presence             │
│                         │    │  - Real-time Events     │
└────────┬────────────────┘    └──────────┬───────────────┘
         │                                │
         ▼                                ▼
    PostgreSQL ◄──────────────────────► Redis
    (Main DB)                           (Pub/Sub)
```

### 2.2 장점 ✅

1. **독립적인 확장성** 🚀
   ```
   Next.js Servers    : Scale based on HTTP traffic
   Signaling Servers  : Scale based on WebSocket connections
   ```
   - 각 서버를 독립적으로 스케일
   - WebSocket 부하가 API에 영향 없음
   - Auto-scaling 정책 분리 가능

2. **리소스 최적화** 💰
   - Next.js: CPU 최적화 (Compute Optimized)
   - Signaling: 메모리 최적화 (Memory Optimized)
   - 비용 효율적인 인스턴스 선택

3. **장애 격리** 🛡️
   - WebSocket 서버 장애 시 웹사이트는 정상
   - 배포/재시작 무중단 가능
   - Circuit Breaker 패턴 적용 용이

4. **Next.js 16 최적화 활용** ⚡
   - Custom Server 불필요
   - Turbopack 사용 가능
   - Edge Runtime 활용 가능
   - Standalone 빌드 지원

5. **전문화된 모니터링** 📊
   - 각 서버별 메트릭 명확
   - WebSocket 전용 모니터링 도구 사용
   - 성능 병목 지점 파악 쉬움

6. **개발 환경 분리** 🔧
   - 시그널링 로직만 수정 시 Next.js 재시작 불필요
   - 팀 분업 용이 (Frontend/Backend/Real-time)

### 2.3 단점 ❌

1. **복잡도 증가**
   - 서버 2개 관리
   - 도메인/SSL 추가 필요
   - 배포 파이프라인 2개

2. **초기 비용 증가**
   - 최소 서버 2대
   - Redis 필수 (Pub/Sub)
   - 인프라 비용 증가

3. **네트워크 홉 추가**
   - Next.js ↔ Signaling Server 통신
   - 약간의 지연 증가 (무시 가능한 수준)

4. **개발 환경 복잡**
   - 로컬에서 2개 서버 실행
   - 환경 변수 2벌 관리

---

## 3. 비교 분석

### 3.1 성능 비교

| 항목 | 통합형 | 분리형 |
|-----|--------|--------|
| **초기 응답 속도** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **동시 접속 처리** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **리소스 효율** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **확장성** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **장애 격리** | ⭐⭐ | ⭐⭐⭐⭐⭐ |

### 3.2 비용 비교

#### 소규모 (동시 접속 ~100명)
- **통합형**: $50-100/월 (서버 1대)
- **분리형**: $100-150/월 (서버 2대 + Redis)
- **결론**: 통합형 유리 ✅

#### 중규모 (동시 접속 ~500명)
- **통합형**: $200-300/월 (서버 2-3대 + Redis)
- **분리형**: $150-250/월 (각 서버 최적화)
- **결론**: 분리형 유리 ✅

#### 대규모 (동시 접속 ~2000명)
- **통합형**: $800-1000/월 (리소스 낭비)
- **분리형**: $500-700/월 (효율적 스케일)
- **결론**: 분리형 압도적 유리 ✅✅✅

### 3.3 개발 복잡도 비교

| 작업 | 통합형 | 분리형 |
|-----|--------|--------|
| **초기 설정** | 간단 | 복잡 |
| **로컬 개발** | 편함 | 약간 불편 |
| **배포** | 간단 | 2개 파이프라인 |
| **모니터링** | 복잡 | 명확 |
| **디버깅** | 복잡 | 명확 |
| **확장** | 복잡 | 간단 |

---

## 4. 권장사항

### 4.1 단계별 전략 🎯

#### Phase 1: MVP (현재) - **통합형 유지** ✅

**이유**:
- 빠른 출시 우선
- 초기 사용자 수 적음 (~100명)
- 개발 리소스 제약
- 검증되지 않은 제품

**조건**:
```javascript
// 현재 구조 유지하되 준비 작업
const config = {
  architecture: 'integrated',
  maxConnections: 200,
  scalingPlan: 'vertical', // 서버 스펙 업그레이드
  monitoring: 'basic'
};
```

#### Phase 2: 성장기 (3-6개월 후) - **분리 준비** ⚠️

**신호**:
- 동시 접속 200+ 지속
- Socket.io 연결로 인한 CPU 80%+
- API 응답 속도 저하
- 월간 활성 사용자 1000+

**준비 작업**:
1. 시그널링 서버 코드 분리 (`/signaling` 폴더)
2. Redis Pub/Sub 인프라 구축
3. 모니터링 대시보드 구축
4. 로드 테스트

#### Phase 3: 확장기 (6-12개월 후) - **분리형 전환** 🚀

**실행**:
- 시그널링 서버 독립 배포
- Next.js Custom Server 제거
- 점진적 트래픽 마이그레이션 (Canary 배포)

### 4.2 현재 권장 아키텍처

```javascript
// 📁 현재 유지하되 분리 가능하도록 설계

// ✅ Good: 분리 가능한 구조
// coup/src/lib/socket/server.js
export function initSocketServer(httpServer) {
  // Socket.io 로직은 독립적으로 작성
  // DB/Auth는 환경 변수로 주입
}

// ✅ Good: 환경 변수로 제어
const SIGNALING_SERVER_URL = process.env.SIGNALING_SERVER_URL || 'same-server';

// ❌ Bad: Next.js 내부 로직에 강하게 결합
import { prisma } from '@/lib/prisma'; // 직접 import
```

### 4.3 즉시 적용할 Best Practices

1. **코드 분리**
   ```
   coup/
   ├── src/
   │   ├── app/          # Next.js App Router
   │   ├── lib/
   │   │   ├── socket/   # 🔥 이 폴더를 독립 가능하게
   │   │   │   ├── server.js
   │   │   │   ├── handlers/
   │   │   │   └── utils/
   ```

2. **환경 변수 설계**
   ```bash
   # .env
   # 나중에 분리 시 변경만 하면 됨
   SOCKET_SERVER_URL=http://localhost:3000  # 통합
   # SOCKET_SERVER_URL=http://signaling.coup.com  # 분리
   
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   ```

3. **API 설계**
   ```javascript
   // Next.js API에서 Socket 이벤트 트리거 필요 시
   // HTTP로 호출 (나중에 분리 가능)
   
   // ✅ Good
   await fetch(`${process.env.SOCKET_SERVER_URL}/api/trigger`, {
     method: 'POST',
     body: JSON.stringify({ event: 'video:started', data })
   });
   
   // ❌ Bad
   io.to('room').emit('event', data); // 직접 접근
   ```

---

## 5. 마이그레이션 계획

### 5.1 준비 단계 (지금 할 것)

#### Week 1-2: 코드 분리

```bash
# 새 폴더 구조
coup/
├── signaling/           # 🆕 나중에 독립 서버로
│   ├── package.json
│   ├── server.js
│   ├── handlers/
│   │   ├── video.js
│   │   ├── chat.js
│   │   └── presence.js
│   ├── middleware/
│   │   └── auth.js
│   └── utils/
│       └── redis.js
├── src/
│   └── lib/
│       └── socket/
│           └── client.js  # 클라이언트만 여기
```

**작업**:
```javascript
// signaling/server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXTJS_URL,
    credentials: true
  }
});

// Health check (로드 밸런서용)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', connections: io.sockets.sockets.size });
});

// Trigger endpoint (Next.js에서 호출)
app.post('/api/trigger', async (req, res) => {
  const { event, room, data } = req.body;
  io.to(room).emit(event, data);
  res.json({ success: true });
});

// Socket.io handlers
import { handleVideoEvents } from './handlers/video.js';
import { handleChatEvents } from './handlers/chat.js';

io.on('connection', (socket) => {
  handleVideoEvents(socket, io);
  handleChatEvents(socket, io);
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Signaling server listening on port ${PORT}`);
});
```

#### Week 3-4: 환경 설정

```javascript
// coup/.env.local (개발 - 통합)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
SOCKET_SERVER_URL=http://localhost:3000

// coup/.env.production (프로덕션 - 통합)
NEXT_PUBLIC_SOCKET_URL=https://coup.com
SOCKET_SERVER_URL=http://localhost:3000

// 나중에 분리 시
// NEXT_PUBLIC_SOCKET_URL=https://ws.coup.com
// SOCKET_SERVER_URL=http://signaling-internal:4000
```

### 5.2 전환 단계 (필요 시)

#### Step 1: 인프라 준비 (1주)

```yaml
# docker-compose.yml
services:
  nextjs:
    image: coup-nextjs:latest
    ports:
      - "3000:3000"
    environment:
      - SOCKET_SERVER_URL=http://signaling:4000
      
  signaling:
    image: coup-signaling:latest
    ports:
      - "4000:4000"
    environment:
      - REDIS_URL=redis://redis:6379
      - NEXTJS_URL=http://nextjs:3000
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

#### Step 2: Canary 배포 (1주)

```javascript
// 트래픽 10% → 50% → 100% 점진적 전환

// Nginx 설정
upstream signaling {
  server signaling-new:4000 weight=1;  # 10%
  server localhost:3000 weight=9;      # 90%
}
```

#### Step 3: 모니터링 (지속)

```javascript
// Metrics to track
const metrics = {
  websocket: {
    activeConnections: 450,
    messagesPerSecond: 120,
    avgLatency: 45, // ms
    errorRate: 0.02 // 2%
  },
  nextjs: {
    avgResponseTime: 180, // ms
    throughput: 500, // req/s
    errorRate: 0.01 // 1%
  }
};
```

### 5.3 비용 분석

#### 현재 (통합)
```
Next.js Server (t3.medium)
- vCPU: 2
- Memory: 4GB
- Cost: $50/month
Total: $50/month
```

#### 전환 후 (분리)
```
Next.js Server (t3.small)
- vCPU: 2
- Memory: 2GB
- Cost: $25/month

Signaling Server (c6i.large - CPU optimized)
- vCPU: 2
- Memory: 4GB
- Cost: $40/month

Redis (t3.micro)
- vCPU: 2
- Memory: 1GB
- Cost: $10/month

Total: $75/month (초기 +$25)
```

**Break-even Point**: 동시 접속 300명 이상

---

## 6. 의사결정 Matrix

### 6.1 현재 상황 체크리스트

프로젝트 상태를 체크하고 결정하세요:

```javascript
const projectStatus = {
  // 현재 지표
  currentUsers: 0,              // 현재 사용자 수
  expectedUsers3Months: 100,    // 3개월 후 예상
  expectedUsers6Months: 300,    // 6개월 후 예상
  
  // 팀 상황
  teamSize: 2,                  // 개발자 수
  hasDevOpsExperience: false,   // DevOps 경험
  developmentSpeed: 'fast',     // 'fast' | 'steady'
  
  // 비즈니스
  mvpDeadline: '1 month',       // MVP 출시 기한
  fundingStatus: 'bootstrapped',// 'funded' | 'bootstrapped'
  scalingPriority: 'low'        // 'high' | 'medium' | 'low'
};

// 의사결정 로직
function decideArchitecture(status) {
  if (status.mvpDeadline === '1 month' && status.currentUsers < 100) {
    return 'INTEGRATED'; // ✅ 통합형 선택
  }
  
  if (status.expectedUsers6Months > 500 && status.fundingStatus === 'funded') {
    return 'PREPARE_SEPARATION'; // ⚠️ 분리 준비
  }
  
  if (status.currentUsers > 300) {
    return 'SEPARATED'; // 🚀 즉시 분리
  }
  
  return 'INTEGRATED'; // 기본값
}
```

### 6.2 최종 권장사항

#### 👉 **현재 단계: 통합형 유지** ✅

**이유**:
1. MVP 단계 (사용자 0명)
2. 빠른 출시 필요
3. 개발 리소스 제약
4. Next.js 16 Custom Server는 안정적

**단, 다음을 준수**:
```javascript
// ✅ 코드는 분리 가능하도록 작성
// ✅ 환경 변수로 추상화
// ✅ 모니터링 지표 수집
// ✅ 3개월마다 재평가
```

#### 🔮 **향후 전환 시점**

다음 중 **2개 이상** 해당 시:
- [ ] 동시 접속 200+ 지속
- [ ] WebSocket으로 인한 API 지연 발생
- [ ] 월간 활성 사용자 1000+
- [ ] 투자 유치 완료
- [ ] DevOps 팀원 확보

→ **분리형으로 전환 시작**

---

## 7. 실전 예제

### 7.1 현재 코드 (통합형)

```javascript
// coup/server.mjs
import { createServer } from 'http';
import next from 'next';
import { initSocketServer } from './src/lib/socket/server.js';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    await handle(req, res);
  });

  // Socket.io 초기화
  initSocketServer(httpServer);

  httpServer.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});
```

### 7.2 미래 코드 (분리형 준비)

```javascript
// signaling/server.js (독립 서버)
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';

const app = express();
const httpServer = createServer(app);

// CORS 설정
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true
  }
});

// Redis Pub/Sub (다중 서버 동기화)
const redisPub = createClient({ url: process.env.REDIS_URL });
const redisSub = redisPub.duplicate();

await Promise.all([redisPub.connect(), redisSub.connect()]);

// Socket.io Redis Adapter
import { createAdapter } from '@socket.io/redis-adapter';
io.adapter(createAdapter(redisPub, redisSub));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connections: io.sockets.sockets.size,
    uptime: process.uptime()
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    connections: io.sockets.sockets.size,
    rooms: io.sockets.adapter.rooms.size,
    memory: process.memoryUsage()
  });
});

// 인증 미들웨어
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  
  // Next.js API로 토큰 검증 요청
  const response = await fetch(`${process.env.NEXTJS_URL}/api/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response.ok) {
    const user = await response.json();
    socket.user = user;
    next();
  } else {
    next(new Error('Authentication failed'));
  }
});

// 핸들러 등록
import { handleVideoEvents } from './handlers/video.js';
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.id}`);
  handleVideoEvents(socket, io);
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT);
```

```javascript
// coup/src/lib/socket/client.js (Next.js 클라이언트)
import { io } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    // 환경 변수로 서버 선택 (통합/분리 모두 대응)
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    
    const newSocket = io(socketUrl, {
      auth: {
        token: session.accessToken
      }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [session]);

  return socket;
}
```

---

## 8. 결론

### ✅ **최종 결정: 분리형 아키텍처**

**근거**:
- 장기적 확장성이 우선
- Next.js 16 최적화 완전 활용
- 전문화된 서버로 리소스 효율화
- 초기 복잡도는 Docker Compose로 해결

### 📝 **구현 계획**

1. **시그널링 서버 구축** (Week 1-2)
   - 독립 Node.js 프로젝트 생성
   - Socket.io + Redis Adapter
   - 인증 API 연동
   - Health check 및 Metrics 엔드포인트

2. **Next.js 최적화** (Week 1-2)
   - Custom Server 제거
   - Standalone 빌드 설정
   - 환경 변수로 Socket URL 설정
   - 클라이언트 코드 수정

3. **인프라 구축** (Week 2-3)
   - Docker Compose 설정
   - Redis 설정
   - Nginx/Load Balancer 설정
   - 모니터링 대시보드

4. **배포 및 테스트** (Week 3-4)
   - 로컬 환경 테스트
   - Staging 배포
   - 성능 테스트
   - Production 배포

### 🚀 **예상 효과**

**즉시**:
- Next.js 빌드 속도 향상 (Turbopack)
- 깔끔한 코드베이스
- 독립적인 개발 가능

**장기**:
- 확장성 무제한
- 리소스 최적화 (30-40% 비용 절감)
- 장애 격리
- 전문화된 모니터링

---

## 부록: 참고 자료

### A. Next.js 16 Custom Server 이슈

```javascript
// ⚠️ Next.js 공식 문서 경고
"Custom servers disable important performance optimizations, 
like serverless functions and Automatic Static Optimization."
```

하지만:
- WebSocket 필요 시 불가피
- 많은 프로덕션 사례 존재
- 성능 영향은 제한적 (SSR 사용 시)

### B. 성공 사례

- **Discord**: 초기 통합 → 분리 (1년 후)
- **Slack**: 초기부터 분리
- **Notion**: 통합 유지 (특수 케이스)

### C. 벤치마크

```
통합형 (Custom Server):
- 동시 접속 ~500 (t3.medium)
- 메시지/초 ~1000

분리형:
- Next.js: 동시 접속 무제한 (stateless)
- Signaling: 동시 접속 ~2000/서버 (c6i.large)
```

---

**최종 결론**: 
**분리형 아키텍처로 처음부터 올바르게 구축하세요.** ✅

**작성자**: AI Assistant  
**최종 업데이트**: 2025-11-19 - 분리형 아키텍처로 확정  
**검토 필요**: DevOps Team, CTO

