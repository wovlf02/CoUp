# ✅ 분리형 아키텍처로 전환 완료

> **작업일**: 2025-11-19  
> **아키텍처**: 분리형 (Next.js Standalone + 독립 시그널링 서버)

---

## 📝 업데이트된 문서 목록

### 1. **08-signaling-server-architecture.md** ⭐ 핵심 변경
- ✅ 최종 권장사항: 통합형 → **분리형**
- ✅ Phase 1 전략: 처음부터 분리형으로 시작
- ✅ 현재 권장 아키텍처: 독립 시그널링 서버
- ✅ 의사결정 가이드: 분리형 선택 이유 명시
- ✅ 결론: 분리형으로 확정

### 2. **video-call.md** (screens/study/my/)
- ✅ 헤더: 분리형 아키텍처 명시
- ✅ 서버 구현 섹션: 독립 시그널링 서버 코드 추가
- ✅ Next.js API: 인증/멤버십 확인 엔드포인트
- ✅ 아키텍처 참고: 분리형 장점 및 구현 방식
- ✅ 로컬 개발: Docker Compose 안내

### 3. **README.md** (video-call/)
- ✅ 기술 스택: 분리형 명시
- ✅ 인프라: Redis, Docker Compose 추가
- ✅ 제약사항: 인프라 요구사항 업데이트

### 4. **03-implementation-plan.md**
- ✅ Phase 0 추가: 인프라 구축 (1-2일)
- ✅ Docker Compose 설정
- ✅ 시그널링 서버 초기 설정
- ✅ Next.js Standalone 전환

### 5. **07-todo-list.md**
- ✅ Phase 0 추가: 인프라 구축 (12개 작업)
- ✅ 총 작업: 86개 → 95개
- ✅ 예상 기간: 3주 → 4주

---

## 🏗️ 새로운 아키텍처 구조

### Before (통합형)
```
┌──────────────────────────────┐
│   Next.js 16 Custom Server   │
│  ┌────────┐   ┌───────────┐  │
│  │  API   │   │ Socket.io │  │
│  └────────┘   └───────────┘  │
└──────────────────────────────┘
         │
         ▼
    PostgreSQL
```

### After (분리형) ✅
```
┌─────────────────────┐    ┌──────────────────────┐
│  Next.js Standalone │    │ Signaling Server     │
│  ┌────────┐         │    │ ┌────────────────┐  │
│  │  API   │         │    │ │   Socket.io    │  │
│  └────────┘         │    │ └────────────────┘  │
└──────┬──────────────┘    └──────────┬───────────┘
       │                              │
       ▼                              ▼
  PostgreSQL ◄────────────────────► Redis
```

---

## 🎯 주요 변경사항

### 1. 프로젝트 구조

**새로 추가된 폴더**:
```
CoUp/
├── coup/                    # Next.js (기존)
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

### 2. Next.js 변경사항

**제거**:
- ❌ `/coup/server.mjs` (Custom Server)
- ❌ `/coup/src/lib/socket/server.js` (Socket.io 핸들러)

**변경**:
```javascript
// next.config.mjs
export default {
  output: 'standalone', // 🔥 Custom Server 제거
};

// package.json
{
  "scripts": {
    "dev": "next dev",      // ✅ 변경
    "start": "next start"   // ✅ 변경
  }
}
```

**추가**:
```
/coup/src/app/api/
  ├── auth/verify/route.js         # 🆕 토큰 검증
  └── studies/[id]/check-member/   # 🆕 멤버십 확인
```

### 3. 시그널링 서버 (신규)

**핵심 기능**:
- Socket.io 서버 (포트 4000)
- Redis Adapter (다중 서버 동기화)
- 인증 (Next.js API 연동)
- Health check & Metrics
- WebRTC 시그널링 (Offer/Answer/ICE)

**주요 코드**:
```javascript
// signaling-server/server.js
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

const io = new Server(httpServer, {
  cors: { origin: process.env.ALLOWED_ORIGINS }
});

// Redis Adapter
io.adapter(createAdapter(redisPub, redisSub));

// 인증
io.use(async (socket, next) => {
  // Next.js API로 토큰 검증
  const response = await fetch(`${NEXTJS_URL}/api/auth/verify`);
  // ...
});
```

### 4. Docker Compose (신규)

**서비스**:
- `nextjs` - Next.js 앱 (포트 3000)
- `signaling` - 시그널링 서버 (포트 4000)
- `postgres` - 데이터베이스 (포트 5432)
- `redis` - Pub/Sub (포트 6379)

**실행**:
```bash
# 전체 환경 구축
docker-compose up

# 개별 확인
http://localhost:3000      # Next.js
http://localhost:4000/health # Signaling
```

---

## 🚀 분리형 아키텍처의 장점

### 즉시 얻는 이점

1. **Next.js 최적화 완전 활용** ✅
   - Standalone 빌드
   - Turbopack 사용 가능
   - Edge Runtime 활용
   - Custom Server 없음 = 더 빠른 빌드

2. **깔끔한 코드베이스** ✅
   - 관심사 분리 (API vs WebSocket)
   - 각 서버의 역할 명확
   - 유지보수 용이

3. **독립적인 개발** ✅
   - Next.js 수정 시 시그널링 영향 없음
   - 시그널링 수정 시 Next.js 재시작 불필요
   - 팀 분업 가능

### 장기적 이점

4. **무제한 확장성** 🚀
   - Next.js: 수평 확장 (Serverless 가능)
   - Signaling: 수평 확장 (Redis Adapter로 동기화)
   - 각 서버를 독립적으로 스케일

5. **리소스 최적화** 💰
   - Next.js: Compute Optimized 인스턴스
   - Signaling: Memory Optimized 인스턴스
   - 30-40% 비용 절감 (중규모 이상)

6. **장애 격리** 🛡️
   - WebSocket 장애 → 웹사이트 정상
   - Next.js 장애 → WebSocket 정상
   - 무중단 배포 가능

7. **전문화된 모니터링** 📊
   - 각 서버별 명확한 메트릭
   - 병목 지점 파악 쉬움
   - 알림 세분화 가능

---

## 📋 다음 단계

### Week 1-2: 인프라 구축

```bash
# 1. 시그널링 서버 프로젝트 생성
mkdir signaling-server
cd signaling-server
npm init -y
npm install socket.io @socket.io/redis-adapter redis express

# 2. Docker Compose 작성
# docker-compose.yml 참고

# 3. Next.js 설정 변경
# next.config.mjs 수정
# server.mjs 제거

# 4. 환경 변수 설정
# .env.local, .env 파일들 생성

# 5. 로컬 환경 테스트
docker-compose up
```

### Week 2-3: 기능 구현

- Socket 이벤트 핸들러
- WebRTC 연결 로직
- 인증 API
- 프론트엔드 연동

### Week 3-4: 테스트 및 배포

- 2명 테스트
- 다중 참여자 테스트
- 성능 테스트
- Production 배포

---

## 📚 참고 문서 (업데이트됨)

### 전체 개요
- `/docs/video-call/README.md` ✅ 업데이트

### 아키텍처
- `/docs/video-call/08-signaling-server-architecture.md` ✅ 업데이트 (분리형 확정)

### 설계 및 구현
- `/docs/screens/study/my/video-call.md` ✅ 업데이트 (분리형 서버 코드)
- `/docs/video-call/01-design-analysis.md` (변경 없음)
- `/docs/video-call/02-current-status.md` (변경 없음)
- `/docs/video-call/03-implementation-plan.md` ✅ 업데이트 (Phase 0 추가)
- `/docs/video-call/05-webrtc-guide.md` (변경 없음)
- `/docs/video-call/06-test-plan.md` (변경 없음)
- `/docs/video-call/07-todo-list.md` ✅ 업데이트 (Phase 0 추가)

### API
- `/docs/video-call/04-api-specification.md` (업데이트 예정)

---

## ⚠️ 주의사항

### 1. server.mjs 처리
```bash
# 백업 후 제거 또는 이름 변경
mv coup/server.mjs coup/server.mjs.backup
```

### 2. 환경 변수 확인
```bash
# coup/.env.local
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000  # 🔥 변경됨

# signaling-server/.env
PORT=4000
NEXTJS_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
```

### 3. 로컬 개발
```bash
# Docker Compose 사용 (권장)
docker-compose up

# 또는 개별 실행
# Terminal 1: Redis
docker run -p 6379:6379 redis:7-alpine

# Terminal 2: Next.js
cd coup && npm run dev

# Terminal 3: Signaling
cd signaling-server && npm run dev
```

---

## 🎉 결론

**분리형 아키텍처로 전환 완료!**

### ✅ 완료된 작업
- [x] 아키텍처 결정 문서 업데이트
- [x] 설계 문서 업데이트
- [x] 구현 계획 업데이트
- [x] Todo List 업데이트
- [x] README 업데이트

### 🚀 시작할 작업
- [ ] 시그널링 서버 프로젝트 생성
- [ ] Docker Compose 설정
- [ ] Next.js Standalone 전환
- [ ] 로컬 환경 테스트

**이제 분리형 아키텍처로 개발을 시작하세요!** 💪

---

**작성일**: 2025-11-19  
**아키텍처**: 분리형 (Next.js Standalone + 독립 시그널링 서버)  
**예상 구축 기간**: 4주

