# CoUp (코업) - 프로젝트 정보

| 제목 | CoUp (코업) - 스터디 협업 플랫폼 |
|------|--------------------------------|
| 작업 기간 | 2025.03.04 ~ 2025.10.11 |
| 인원 구성 | 총 1명 (풀스택 1명) |
| 프로젝트 요약 | 스터디 생성부터 관리, 협업까지 모든 것을 지원하는 올인원 스터디 협업 플랫폼 구축 |

## 주요 기능

### 사용자 기능
- 회원가입/로그인 - 이메일/비밀번호 기본 인증 및 OAuth (Google, GitHub) 소셜 로그인 지원
- 스터디 관리 - 카테고리별 스터디 생성/탐색, 역할 기반 권한(OWNER, ADMIN, MEMBER), 가입 승인 시스템
- 실시간 협업 - Socket.IO 기반 실시간 채팅, WebRTC 기반 화상 통화 (화면 공유 지원), 파일 공유
- 학습 관리 - 캘린더 일정 관리, 개인/그룹 과제 관리, 자동 출석 체크, 공지사항
- 대시보드 - 학습 통계(출석률, 과제 완료율), 개인/그룹 진도 시각화, 활동 기반 랭킹 시스템
- 알림 시스템 - 실시간 푸시 알림, 중요 이벤트 이메일 발송
- 프로필/설정 - 학습 목표, 관심 분야, 아바타 설정, 마이페이지, 테마 설정

### 관리자 기능
- 사용자 관리 - 사용자 조회, 상태 관리(활성/정지/삭제), 권한 설정
- 스터디 관리 - 전체 스터디 모니터링, 숨김/종료/삭제 처리
- 신고 처리 - 사용자/스터디 신고 검토 및 처리, 제재 조치
- 시스템 설정 - 서비스 전역 설정, 제한 설정, 백업 관리
- 통계 대시보드 - 사용자 통계, 스터디 통계, 활동 로그 분석

## 사용 언어 및 개발 환경

### 프론트엔드
- **프레임워크** -> Next.js 16 (App Router, SSR/CSR)
- **UI 라이브러리** -> React 19
- **언어** -> JavaScript (ES6+)
- **스타일링** -> Tailwind CSS 4
- **상태 관리** -> React Hooks, TanStack Query (React Query)
- **실시간 통신** -> Socket.IO Client
- **화상 통화** -> WebRTC (getUserMedia, RTCPeerConnection)
- **차트** -> Recharts
- **마크다운** -> React Markdown, Remark GFM

### 백엔드
- **프레임워크** -> Next.js 16 API Routes
- **데이터베이스** -> PostgreSQL 15
- **ORM** -> Prisma 6
- **인증** -> NextAuth.js 4
- **검증** -> Zod 4
- **로깅** -> Winston
- **보안** -> bcryptjs (비밀번호 해싱), JWT (토큰 기반 인증)

### 시그널링 서버 (분리형 마이크로서비스)
- **런타임** -> Node.js 18+
- **프레임워크** -> Express.js 4
- **웹소켓** -> Socket.IO 4
- **어댑터** -> Redis Adapter (다중 서버 지원)
- **CORS** -> cors 미들웨어

### 인프라 & 데브옵스
- **데이터베이스** -> PostgreSQL 15
- **캐시/메시징** -> Redis 7 (Pub/Sub, 세션 스토어)
- **컨테이너** -> Docker & Docker Compose
- **배포** -> Vercel (Next.js), AWS ECS/Fargate (계획, 시그널링 서버)
- **버전 관리** -> Git & GitHub
- **패키지 매니저** -> npm
- **환경 변수** -> dotenv

### 개발 도구
- **IDE** -> Visual Studio Code
- **린트/포맷** -> ESLint 9 (Next.js 설정)
- **데이터베이스 GUI** -> Prisma Studio

## 성과

### 기술적 성과
- **분리형 아키텍처 구축**: Next.js(HTTP/REST API)와 시그널링 서버(WebSocket)를 분리하여 독립적 확장 가능
- **실시간 통신 구현**: Socket.IO + Redis Adapter를 활용한 다중 서버 환경 지원 실시간 채팅/알림 시스템
- **WebRTC 화상 통화**: Peer-to-Peer 연결 및 화면 공유 기능을 포함한 화상 스터디 기능 구현
- **역할 기반 접근 제어(RBAC)**: 스터디 내 OWNER/ADMIN/MEMBER 권한 체계 및 관리자 시스템 구현
- **데이터베이스 설계**: Prisma를 활용한 정규화된 데이터베이스 스키마 설계 (15개 모델, 다대다 관계 포함)
- **인증/인가 시스템**: NextAuth.js 기반 이메일 인증 + OAuth 소셜 로그인 통합
- **마이크로서비스 패턴**: Docker Compose로 Next.js, Signaling Server, PostgreSQL, Redis 독립 컨테이너 구성
- **성능 최적화**: React 19 컴파일러, Next.js 16 App Router SSR/CSR 혼합 전략
- **타입 안전성**: Zod를 활용한 런타임 데이터 검증 및 타입 추론

### 기능적 성과
- **올인원 플랫폼**: 스터디 탐색 → 가입 → 학습 → 협업 → 분석까지 통합 환경 제공
- **스마트 매칭**: 카테고리, 서브카테고리, 난이도별 스터디 검색 및 추천 시스템
- **학습 동기부여**: 출석률, 과제 완료율, 활동 지수 시각화 및 랭킹 시스템
- **관리자 대시보드**: 사용자/스터디 관리, 신고 처리, 통계 분석 원스톱 관리 도구
- **확장 가능한 구조**: Redis Pub/Sub를 통한 수평 확장 지원 (다중 서버 인스턴스)

### 개발 생산성
- **코드 재사용성**: React 컴포넌트 모듈화, Custom Hooks 활용
- **API 중앙화**: 일관된 에러 처리, 인증 미들웨어, 로깅 시스템
- **자동화**: Prisma 마이그레이션, 시드 데이터 생성 스크립트
- **문서화**: API 명세서, 기능별 가이드, 트러블슈팅 가이드 완비

## 특징

### 아키텍처 특징
- **분리형 마이크로서비스**: HTTP API(Next.js)와 WebSocket(Signaling Server) 서비스 분리로 독립적 확장 및 장애 격리
- **Redis Pub/Sub**: 시그널링 서버 다중 인스턴스 간 메시지 동기화 (수평 확장 지원)
- **컨테이너 기반 배포**: Docker Compose로 로컬 개발 환경과 프로덕션 환경 일치
- **환경 분리**: 개발/스테이징/프로덕션 환경별 독립적인 .env 관리

### 보안 특징
- **비밀번호 암호화**: bcryptjs를 사용한 단방향 해싱 (Salt 포함)
- **JWT 토큰 인증**: NextAuth.js 기반 세션 관리, HttpOnly 쿠키 사용
- **CORS 정책**: 시그널링 서버에 허용된 오리진만 접근 가능
- **입력 검증**: Zod 스키마를 통한 모든 API 입력값 검증
- **권한 체크**: 미들웨어 기반 인증/인가 검증 (세션, 역할 확인)

### 성능 최적화
- **React 19 컴파일러**: 자동 메모이제이션 및 최적화
- **Next.js App Router**: 서버 컴포넌트 활용한 초기 로딩 속도 개선
- **TanStack Query**: 서버 상태 캐싱 및 자동 재검증
- **이미지 최적화**: Next.js Image 컴포넌트, 리모트 패턴 설정
- **Redis 캐싱**: 세션, 실시간 데이터 캐싱으로 DB 부하 감소
- **인덱싱**: Prisma 스키마에 주요 쿼리 필드 인덱스 설정

### 개발자 경험(DX)
- **타입 추론**: Prisma Client의 타입 안전성, Zod의 타입 추론
- **핫 리로드**: Next.js Fast Refresh, Nodemon 활용
- **Prisma Studio**: GUI 기반 데이터베이스 관리 도구
- **로그 시스템**: Winston을 통한 구조화된 로그 (파일 저장, 레벨별 분리)
- **에러 트래킹**: 통합 에러 핸들러, 상세한 에러 메시지 및 스택 트레이스

### 확장성
- **수평 확장**: Redis Adapter를 통한 시그널링 서버 다중 인스턴스 지원
- **모듈화**: 기능별 컴포넌트, API, 핸들러 분리
- **플러그인 구조**: 시그널링 서버 핸들러 모듈별 분리 (video, chat, presence)
- **데이터베이스 스케일**: PostgreSQL 레플리케이션, 읽기 전용 복제본 지원 가능

## 프로젝트 구조

```
CoUp/
├── coup/                           # Next.js 메인 애플리케이션
│   ├── src/
│   │   ├── app/                   # App Router
│   │   │   ├── (auth)/           # 인증 페이지 (로그인, 회원가입)
│   │   │   ├── admin/            # 관리자 페이지
│   │   │   ├── my-studies/       # 스터디 상세 페이지
│   │   │   ├── studies/          # 스터디 탐색
│   │   │   ├── tasks/            # 할일 페이지
│   │   │   ├── me/               # 마이페이지
│   │   │   └── api/              # API Routes
│   │   ├── components/           # React 컴포넌트 (layout, common, feature별)
│   │   ├── lib/                  # 유틸리티 & 설정 (auth, prisma, api client, hooks)
│   │   ├── contexts/             # React Context
│   │   ├── styles/               # 글로벌 스타일
│   │   ├── utils/                # 헬퍼 함수
│   │   └── mocks/                # 테스트 모킹 데이터
│   ├── prisma/
│   │   ├── schema.prisma         # 데이터베이스 스키마 (15개 모델)
│   │   ├── migrations/           # DB 마이그레이션 파일
│   │   └── seed.js               # 시드 데이터 생성
│   ├── scripts/                  # 유틸리티 스크립트 (사용자 생성, 관리자 설정 등)
│   ├── public/                   # 정적 파일 (이미지, 아이콘, 업로드)
│   ├── logs/                     # Winston 로그 파일
│   ├── server.mjs                # 커스텀 Express + Next.js 서버
│   ├── middleware.js             # Next.js 미들웨어 (인증, 리다이렉트)
│   ├── next.config.mjs           # Next.js 설정
│   ├── tailwind.config.js        # Tailwind CSS 설정
│   ├── eslint.config.mjs         # ESLint 설정
│   └── package.json
│
├── signaling-server/              # Socket.IO 시그널링 서버
│   ├── server.js                 # 서버 엔트리포인트 (Express + Socket.IO)
│   ├── handlers/                 # Socket 이벤트 핸들러
│   │   ├── video.js             # WebRTC 시그널링 (offer, answer, ice-candidate)
│   │   ├── chat.js              # 실시간 채팅
│   │   └── presence.js          # 온라인 상태 관리
│   ├── middleware/               # 인증 미들웨어 (JWT 검증)
│   ├── utils/                    # 유틸리티 함수
│   ├── Dockerfile                # Docker 이미지 빌드
│   └── package.json
│
├── docs/                          # 프로젝트 문서
│   ├── project-init/             # 프로젝트 초기 설정 문서
│   ├── guides/                   # 개발 가이드
│   ├── design/                   # UI/UX 설계 문서
│   ├── screens/                  # 화면별 설계
│   ├── backend/                  # 백엔드 문서 (API, 인증, 데이터베이스)
│   ├── auth/                     # NextAuth 설정 가이드
│   ├── video-call/               # WebRTC 구현 가이드
│   ├── admin/                    # 관리자 기능 문서
│   ├── api/                      # API 명세서, 마이그레이션 문서
│   ├── exception/                # 예외 처리 및 개선 사항
│   └── README.md                 # 문서 인덱스
│
├── docker-compose.yml            # 전체 서비스 오케스트레이션 (Next.js, Signaling, PostgreSQL, Redis)
├── .gitignore
├── LICENSE                       # MIT License
├── README.md                     # 프로젝트 전체 소개
├── README_VIDEO_CALL.md          # 화상 통화 기능 상세 설명
└── package.json                  # 루트 패키지 (개발 의존성)
```

## 주요 기술 구현 상세

### 1. 인증/인가 시스템
- **NextAuth.js 4**: Credentials Provider + OAuth Provider (Google, GitHub)
- **세션 관리**: JWT 토큰 기반, 서버 사이드 세션 검증
- **미들웨어**: Next.js middleware.js에서 인증되지 않은 사용자 리다이렉트
- **역할 기반 접근 제어**: User(일반), Admin(관리자), 스터디 내 OWNER/ADMIN/MEMBER 권한

### 2. 실시간 채팅 시스템
- **Socket.IO 4**: 양방향 실시간 통신
- **Redis Adapter**: 다중 시그널링 서버 인스턴스 간 메시지 동기화
- **이벤트 핸들링**: join-room, leave-room, send-message, typing-indicator
- **메시지 저장**: PostgreSQL에 Message 모델로 영구 저장
- **읽음 표시**: 메시지별 읽음 상태 추적

### 3. WebRTC 화상 통화
- **Signaling**: Socket.IO를 통한 offer, answer, ICE candidate 교환
- **Peer-to-Peer**: RTCPeerConnection으로 직접 연결
- **화면 공유**: getDisplayMedia API 활용
- **미디어 스트림**: getUserMedia로 카메라/마이크 접근
- **연결 관리**: ICE 서버 설정, 연결 상태 모니터링

### 4. 데이터베이스 설계
- **15개 주요 모델**: User, Study, StudyMember, Message, Notification, Task, Event, File, Report, Sanction, Warning, AdminRole, AdminLog 등
- **관계 매핑**: 일대다, 다대다 관계 (중간 테이블 활용)
- **인덱싱**: 주요 쿼리 필드에 @@index 설정 (email, status, createdAt 등)
- **마이그레이션**: Prisma Migrate로 스키마 버전 관리
- **시드 데이터**: 개발 환경용 테스트 사용자 및 스터디 자동 생성

### 5. 관리자 시스템
- **대시보드**: 사용자/스터디 통계, 최근 활동 로그
- **사용자 관리**: 상태 변경(활성/정지/삭제), 권한 설정, 비밀번호 재설정
- **스터디 관리**: 전체 스터디 조회, 숨김/종료/삭제 처리
- **신고 처리**: 신고 내역 조회, 제재 조치(경고/정지/영구 정지)
- **감사 로그**: AdminLog 테이블에 모든 관리자 행위 기록

## 주요 라이브러리 및 버전

### Frontend Dependencies
```json
{
  "next": "16.0.1",
  "react": "19.2.0",
  "react-dom": "19.2.0",
  "@tanstack/react-query": "^5.90.10",
  "next-auth": "^4.24.13",
  "socket.io-client": "^4.8.1",
  "react-markdown": "^10.1.0",
  "recharts": "^3.5.1",
  "tailwindcss": "^4"
}
```

### Backend Dependencies
```json
{
  "@prisma/client": "^6.19.0",
  "prisma": "^6.19.0",
  "@auth/prisma-adapter": "^2.11.1",
  "bcryptjs": "^3.0.3",
  "jsonwebtoken": "^9.0.2",
  "zod": "^4.1.12",
  "winston": "^3.18.3",
  "redis": "^5.9.0",
  "@socket.io/redis-adapter": "^8.3.0",
  "socket.io": "^4.8.1"
}
```

### Signaling Server Dependencies
```json
{
  "socket.io": "^4.6.0",
  "@socket.io/redis-adapter": "^8.3.0",
  "redis": "^4.6.0",
  "express": "^4.18.0",
  "cors": "^2.8.5"
}
```

## 환경 변수 및 설정

### Next.js (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/coup

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Redis
REDIS_URL=redis://localhost:6379

# Socket.IO
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Email (계획)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password

# AWS S3 (계획)
AWS_S3_BUCKET=coup-uploads
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-northeast-2
```

### Signaling Server (.env)
```env
PORT=4000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
NEXTJS_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
```

## 개발 및 배포 가이드

### 로컬 개발 환경 구성

**1. 저장소 클론**
```bash
git clone https://github.com/wovlf02/CoUp.git
cd CoUp
```

**2. 환경 변수 설정**
```bash
# Next.js 앱
copy coup\.env.example coup\.env

# 시그널링 서버
copy signaling-server\.env.example signaling-server\.env
```

**3. Docker Compose로 모든 서비스 시작 (권장)**
```bash
docker-compose up -d
# PostgreSQL, Redis, Next.js, Signaling Server 모두 시작
```

**4. 로컬 개발 (Docker 없이)**
```bash
# PostgreSQL & Redis만 Docker로 시작
docker-compose up -d postgres redis

# Next.js 앱
cd coup
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# 시그널링 서버 (별도 터미널)
cd signaling-server
npm install
npm start
```

**5. 접속**
- Next.js 앱: http://localhost:3000
- 시그널링 서버: http://localhost:4000
- Prisma Studio: `npx prisma studio` (http://localhost:5555)

### 프로덕션 배포

**Vercel (Next.js)**
```bash
npm i -g vercel
cd coup
vercel
```

**Docker Hub (Signaling Server)**
```bash
cd signaling-server
docker build -t your-dockerhub/coup-signaling:latest .
docker push your-dockerhub/coup-signaling:latest
```

## 향후 개선 계획

### 기능 추가
- [ ] AI 기반 스터디 추천 시스템 (Gemini API 연동)
- [ ] 이메일 알림 시스템 (SMTP 연동)
- [ ] 파일 업로드 AWS S3 마이그레이션 (현재 로컬 저장)
- [ ] 모바일 앱 (React Native)
- [ ] 스터디 성과 분석 리포트 자동 생성

### 성능 개선
- [ ] Redis 캐싱 전략 고도화
- [ ] 데이터베이스 쿼리 최적화 (N+1 문제 해결)
- [ ] 이미지 최적화 (WebP, CDN 연동)
- [ ] 서버 사이드 렌더링 전략 조정

### 인프라
- [ ] CI/CD 파이프라인 구축 (GitHub Actions)
- [ ] 모니터링 시스템 (Prometheus + Grafana)
- [ ] 에러 트래킹 (Sentry)
- [ ] 로드 밸런싱 (AWS ALB)

## 참고 자료

- **공식 저장소**: https://github.com/wovlf02/CoUp
- **프로젝트 문서**: [docs/README.md](./docs/README.md)
- **API 명세서**: [docs/backend/api/](./docs/backend/api/)
- **화상 통화 가이드**: [README_VIDEO_CALL.md](./README_VIDEO_CALL.md)
- **관리자 매뉴얼**: [docs/admin/OPERATIONS-MANUAL.md](./docs/admin/OPERATIONS-MANUAL.md)

## 라이선스

이 프로젝트는 [MIT License](LICENSE) 하에 배포됩니다.

---

**Made with ❤️ by CoUp Team**

