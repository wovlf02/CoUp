# CoUp (코업) - 스터디 협업 플랫폼

<div align="center">

![CoUp Logo](docs/assets/logo.png)

**함께, 더 높이. 당신의 성장을 위한 스터디 허브.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[데모 보기](https://coup-demo.vercel.app) · [문서](./docs/README.md) · [이슈 리포트](https://github.com/your-org/coup/issues)

</div>

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [시작하기](#-시작하기)
- [프로젝트 구조](#-프로젝트-구조)
- [개발 가이드](#-개발-가이드)
- [배포](#-배포)
- [문서](#-문서)
- [기여하기](#-기여하기)
- [라이선스](#-라이선스)

---

## 🎯 프로젝트 소개

**CoUp**은 'Cooperate'(협력하다)와 'Up'(성장하다)의 합성어로, 스터디 그룹의 생성부터 관리, 협업까지 모든 것을 지원하는 **올인원 스터디 협업 플랫폼**입니다.

### 비전
> 흩어져 있는 모든 스터디의 가능성을 연결하여, 누구나 원하는 목표를 가장 효과적으로 달성하게 돕는 최고의 학습 성장 플랫폼

### 핵심 가치
- 🎓 **All-in-One**: 스터디 탐색부터 목표 달성까지 통합 환경
- 🤝 **스마트 매칭**: 개인의 학습 목표에 맞는 최적의 그룹 연결
- 📊 **데이터 기반 동기부여**: 출석, 진도, 활동 분석으로 지속 가능한 성장
- 🌱 **건강한 커뮤니티**: 함께 성장하는 학습 문화 조성

---

## ✨ 주요 기능

### 📚 스터디 관리
- **스터디 생성 & 탐색**: 카테고리별, 난이도별 스터디 검색 및 생성
- **멤버 관리**: 역할 기반 권한 (OWNER, ADMIN, MEMBER)
- **가입 승인 시스템**: 수동/자동 승인 설정

### 💬 실시간 협업
- **채팅**: Socket.IO 기반 실시간 그룹 채팅
- **화상 통화**: WebRTC 기반 화상 스터디 (화면 공유 지원)
- **파일 공유**: 학습 자료 업로드 및 공유 (S3 연동)

### 📅 학습 관리
- **캘린더**: 스터디 일정 관리 및 공유
- **할일**: 개인/그룹 과제 관리
- **출석 체크**: 자동 출석 시스템
- **공지사항**: 중요 공지 알림

### 📊 대시보드 & 분석
- **학습 통계**: 출석률, 과제 완료율, 활동 지수
- **진행 상황**: 개인별/그룹별 학습 진도 시각화
- **랭킹 시스템**: 활동 기반 포인트 및 레벨 시스템

### 🔔 알림 시스템
- **실시간 알림**: 초대, 과제, 공지 등 즉각 알림
- **이메일 알림**: 중요 이벤트 이메일 발송

### 👤 사용자 기능
- **프로필 관리**: 학습 목표, 관심 분야, 아바타 설정
- **마이페이지**: 참여 스터디, 활동 내역, 통계 확인
- **설정**: 알림, 테마, 개인정보 관리

### 🛡️ 관리자 기능
- **사용자 관리**: 사용자 조회, 상태 관리, 권한 설정
- **스터디 관리**: 전체 스터디 모니터링 및 관리
- **신고 처리**: 사용자 신고 검토 및 처리
- **시스템 설정**: 서비스 설정, 제한 설정, 백업

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS 4
- **State Management**: 
  - Local State: React Hooks
  - Server State: TanStack Query (React Query)
- **Real-time**: Socket.IO Client
- **Video**: WebRTC (getUserMedia, RTCPeerConnection)

### Backend
- **Framework**: Next.js 16 API Routes
- **ORM**: Prisma 6
- **Authentication**: NextAuth.js 4
- **Validation**: Zod
- **Logging**: Winston

### Signaling Server (분리형)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **WebSocket**: Socket.IO 4
- **Adapter**: Redis Adapter (스케일링)

### Database & Infrastructure
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **File Storage**: AWS S3 (계획) / Local (개발)
- **Container**: Docker & Docker Compose
- **Deployment**: 
  - Next.js: Vercel
  - Signaling Server: AWS ECS/Fargate (계획)

### DevOps
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Environment**: .env (dotenv)
- **CI/CD**: GitHub Actions (계획)

---

## 🏗 시스템 아키텍처

### 전체 구조

```
┌──────────────┐      HTTPS        ┌────────────────────────┐
│   Browser    │ ←─────────────────→│   Next.js (Vercel)    │
│   (Client)   │                    │  - Frontend (SSR/CSR)  │
└──────────────┘                    │  - API Routes          │
       │                            └────────────────────────┘
       │ WebSocket                           │
       │ (Socket.IO)                         │ Prisma ORM
       ↓                                     ↓
┌──────────────┐      Internal      ┌────────────────┐
│  Signaling   │ ←────── API ───────│  PostgreSQL    │
│   Server     │                    │   Database     │
│ (Express.js) │                    └────────────────┘
└──────────────┘                            
       │                                     
       └────────→ Redis Pub/Sub ←───────────┘
                 (Messaging & Cache)
                        │
                        ↓
                   AWS S3 (Files)
```

### 핵심 설계 원칙
- **분리형 아키텍처**: Next.js(HTTP/REST)와 시그널링 서버(WebSocket) 분리
- **마이크로서비스**: 각 서비스의 독립적 확장 가능
- **실시간 통신**: Socket.IO + Redis Adapter로 다중 서버 지원
- **스케일러블**: Redis Pub/Sub를 통한 수평 확장

---

## 🚀 시작하기

### 필수 요구사항

- **Node.js**: 18.x 이상
- **npm**: 9.x 이상
- **PostgreSQL**: 15.x 이상
- **Redis**: 7.x 이상 (선택사항)
- **Docker** & **Docker Compose**: 최신 버전 (권장)

### 설치 방법

#### 1. 저장소 클론

```bash
git clone https://github.com/your-org/coup.git
cd coup
```

#### 2. 환경 변수 설정

```bash
# Next.js 앱 환경 변수
cp coup/.env.example coup/.env

# 시그널링 서버 환경 변수
cp signaling-server/.env.example signaling-server/.env
```

**주요 환경 변수**:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/coup"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Redis (선택사항)
REDIS_URL="redis://localhost:6379"

# Socket.IO
NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"
```

#### 3-A. Docker로 실행 (권장)

```bash
# 모든 서비스 한번에 시작 (PostgreSQL, Redis, Next.js, Signaling)
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

#### 3-B. 로컬 개발 환경

**PostgreSQL & Redis 시작** (Docker 사용):
```bash
docker-compose up -d postgres redis
```

**데이터베이스 마이그레이션**:
```bash
cd coup
npm install
npx prisma migrate dev
npx prisma db seed  # 테스트 데이터 생성
```

**Next.js 앱 시작**:
```bash
npm run dev
# http://localhost:3000
```

**시그널링 서버 시작** (별도 터미널):
```bash
cd signaling-server
npm install
npm start
# http://localhost:4000
```

### 접속

- **애플리케이션**: http://localhost:3000
- **시그널링 서버**: http://localhost:4000
- **Prisma Studio**: `npx prisma studio` (http://localhost:5555)

### 테스트 계정

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@example.com | password123 |
| 일반 사용자 | user@example.com | password123 |

---

## 📁 프로젝트 구조

```
CoUp/
├── coup/                           # Next.js 메인 애플리케이션
│   ├── src/
│   │   ├── app/                   # App Router (페이지 & API)
│   │   │   ├── (auth)/           # 인증 페이지 (로그인, 회원가입)
│   │   │   ├── admin/            # 관리자 페이지
│   │   │   ├── my-studies/       # 스터디 상세 페이지
│   │   │   ├── studies/          # 스터디 탐색
│   │   │   ├── tasks/            # 할일 페이지
│   │   │   ├── me/               # 마이페이지
│   │   │   └── api/              # API Routes
│   │   ├── components/           # React 컴포넌트
│   │   │   ├── layout/           # 레이아웃 컴포넌트
│   │   │   ├── common/           # 공통 컴포넌트
│   │   │   └── [feature]/        # 기능별 컴포넌트
│   │   ├── lib/                  # 유틸리티 & 설정
│   │   │   ├── auth.js           # NextAuth 설정
│   │   │   ├── prisma.js         # Prisma 클라이언트
│   │   │   ├── api/              # API 클라이언트
│   │   │   └── hooks/            # Custom Hooks
│   │   ├── styles/               # 글로벌 스타일
│   │   └── utils/                # 헬퍼 함수
│   ├── prisma/
│   │   ├── schema.prisma         # 데이터베이스 스키마
│   │   ├── migrations/           # DB 마이그레이션
│   │   └── seed.js               # 시드 데이터
│   ├── public/                   # 정적 파일
│   └── package.json
│
├── signaling-server/              # Socket.IO 시그널링 서버
│   ├── server.js                 # 서버 엔트리포인트
│   ├── handlers/                 # Socket 이벤트 핸들러
│   │   ├── video.js             # 화상 통화
│   │   ├── chat.js              # 채팅
│   │   └── presence.js          # 온라인 상태
│   ├── middleware/               # 인증 미들웨어
│   ├── utils/                    # 유틸리티
│   └── package.json
│
├── docs/                          # 프로젝트 문서
│   ├── project-init/             # 프로젝트 초기 설정
│   ├── guides/                   # 개발 가이드
│   ├── design/                   # UI/UX 설계
│   ├── screens/                  # 화면별 설계
│   ├── backend/                  # 백엔드 문서
│   ├── auth/                     # 인증 시스템
│   └── video-call/               # 화상 통화 시스템
│
├── docker-compose.yml            # Docker Compose 설정
├── .gitignore
└── README.md                     # 이 파일
```

---

## 📖 개발 가이드

### 코드 스타일
- **ESLint**: Next.js 기본 설정 사용
- **파일명**: kebab-case (예: `user-profile.jsx`)
- **컴포넌트명**: PascalCase (예: `UserProfile`)
- **함수/변수명**: camelCase (예: `getUserData`)

### Git 브랜치 전략
- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 브랜치
- `fix/*`: 버그 수정 브랜치
- `docs/*`: 문서 업데이트 브랜치

### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅 (기능 변경 없음)
refactor: 코드 리팩토링
test: 테스트 코드 추가
chore: 빌드, 설정 변경
```

### 주요 개발 명령어

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start

# 코드 린트
npm run lint

# Prisma Studio
npm run db:studio

# 데이터베이스 시드
npm run db:seed
```

---

## 🚢 배포

### Vercel 배포 (Next.js)

1. **Vercel에 프로젝트 Import**
   ```bash
   # Vercel CLI 설치
   npm i -g vercel
   
   # 배포
   cd coup
   vercel
   ```

2. **환경 변수 설정** (Vercel Dashboard)
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_SOCKET_URL`

### 시그널링 서버 배포

#### Docker Hub 푸시
```bash
cd signaling-server
docker build -t your-dockerhub/coup-signaling:latest .
docker push your-dockerhub/coup-signaling:latest
```

#### AWS ECS/Fargate (계획)
- ECS 클러스터 생성
- Task Definition 등록
- Service 생성
- ALB 연결

---

## 📚 문서

### 주요 문서
- **[프로젝트 개요](./docs/project-init/overview.md)**: 프로젝트 전체 이해
- **[개발 가이드](./docs/guides/)**: 기능 구현 가이드
- **[API 명세서](./docs/backend/api/)**: RESTful API 문서
- **[화면 설계](./docs/screens/)**: 페이지별 상세 설계
- **[화상 통화](./docs/video-call/)**: WebRTC 시스템 설계

### 빠른 링크
- [프로젝트 설정](./docs/project-init/overview.md)
- [데이터베이스 스키마](./docs/project-init/database.md)
- [인증 시스템](./docs/auth/README.md)
- [백엔드 가이드](./docs/backend/README.md)
- [문서 전체 보기](./docs/README.md)

---

## 🤝 기여하기

CoUp 프로젝트에 기여해주셔서 감사합니다!

### 기여 방법

1. **Fork** 저장소
2. **Feature 브랜치** 생성 (`git checkout -b feature/amazing-feature`)
3. **변경사항 커밋** (`git commit -m 'feat: Add amazing feature'`)
4. **브랜치에 Push** (`git push origin feature/amazing-feature`)
5. **Pull Request** 생성

### 이슈 리포트
버그나 기능 제안은 [Issues](https://github.com/your-org/coup/issues)에 등록해주세요.

---

## 📄 라이선스

이 프로젝트는 [MIT License](LICENSE) 하에 배포됩니다.

---

## 👥 팀

- **개발팀**: CoUp Development Team
- **문의**: contact@coup.dev

---

## 🙏 감사의 말

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Prisma](https://www.prisma.io/)
- [Socket.IO](https://socket.io/)
- [Vercel](https://vercel.com/)

---

<div align="center">

**Made with ❤️ by CoUp Team**

[⬆ Back to top](#coup-코업---스터디-협업-플랫폼)

</div>

