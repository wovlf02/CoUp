# 기술 스택
```
└── docs/                  # 문서
├── signaling-server/      # 시그널링 서버
│   └── utils/             # 유틸리티
│   ├── styles/            # 글로벌 스타일
│   │   └── ...
│   │   ├── validators/    # 유효성 검증
│   │   ├── hooks/         # API Hooks
│   │   ├── helpers/       # 헬퍼 함수
│   │   ├── exceptions/    # 예외 처리
│   │   ├── api/           # API 클라이언트
│   │   ├── admin/         # 관리자 헬퍼
│   ├── lib/               # 라이브러리
│   ├── hooks/             # Custom Hooks
│   ├── contexts/          # React Context
│   ├── components/        # React 컴포넌트
│   │   └── me/            # 마이페이지
│   │   ├── notifications/ # 알림
│   │   ├── tasks/         # 할일
│   │   ├── my-studies/    # 내 스터디
│   │   ├── studies/       # 스터디 탐색
│   │   ├── dashboard/     # 대시보드
│   │   ├── admin/         # 관리자
│   │   ├── (legal)/       # 법적 페이지
│   │   ├── (auth)/        # 인증 페이지
│   │   ├── api/           # API Routes
│   ├── app/               # Next.js App Router
├── src/
│   └── uploads/           # 업로드 파일
├── public/
│   └── migrations/        # 마이그레이션
│   ├── seed.js            # 시드 데이터
│   ├── schema.prisma      # 데이터 모델
├── prisma/
coup/
```

## 폴더 구조

---

```
MAX_FILE_SIZE="10485760"
UPLOAD_DIR="./public/uploads"
# File Upload

NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
# Socket.IO

REDIS_URL="redis://..."
# Redis

GITHUB_SECRET="..."
GITHUB_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
# OAuth

NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
# NextAuth

DATABASE_URL="postgresql://..."
# Database
```env

## 환경 변수

---

```
}
  "@testing-library/jest-dom": "^6.0.0"
  "@testing-library/react": "^14.0.0",
  "jest": "^29.0.0",
  "eslint-config-next": "^14.0.0",
  "eslint": "^8.0.0",
  "prisma": "^5.0.0",
{
```json

### devDependencies

```
}
  "lucide-react": "^0.300.0"
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.0.0",
  "socket.io-client": "^4.0.0",
  "@prisma/client": "^5.0.0",
  "next-auth": "^4.0.0",
  "@tanstack/react-query": "^5.0.0",
  "react-dom": "^18.0.0",
  "react": "^18.0.0",
  "next": "^14.0.0",
{
```json

### dependencies

## 주요 패키지

---

```
  signaling:  # 시그널링 서버
  redis:      # Redis
  postgres:   # PostgreSQL
  app:        # Next.js 앱
services:
# docker-compose.yml
```yaml

### 컨테이너

## 인프라

---

| **Turbopack** | Next.js 번들러 |
|------|------|
| 도구 | 용도 |

### 번들링

| **React Testing Library** | 컴포넌트 테스트 |
| **Jest** | 단위 테스트 |
|------|------|
| 도구 | 용도 |

### 테스팅

| **Prettier** | 코드 포맷팅 |
| **ESLint** | 코드 린팅 |
|------|------|
| 도구 | 용도 |

### Linting & Formatting

## 개발 도구

---

| **Socket.IO** | WebRTC 시그널링 |
| **Express** | HTTP 서버 |
|------|------|
| 기술 | 용도 |

```
└── utils/            # 유틸리티
├── middleware/       # 인증 등 미들웨어
├── handlers/         # 이벤트 핸들러
├── server.js         # Express + Socket.IO
signaling-server/
```

## 시그널링 서버

---

| **Socket.IO** | 웹소켓 서버 |
|------|------|
| 기술 | 용도 |

### 실시간

| **Redis** | 세션/캐시 저장소 |
|------|------|
| 기술 | 용도 |

### 캐싱

| **Prisma** | ORM |
| **PostgreSQL** | 관계형 데이터베이스 |
|------|------|
| 기술 | 용도 |

### 데이터베이스

| **JWT** | 토큰 기반 인증 |
| **bcrypt** | 비밀번호 해싱 |
| **NextAuth.js** | 인증/세션 관리 |
|------|------|
| 기술 | 용도 |

### 인증

| **Node.js** | 런타임 |
| **Next.js API Routes** | REST API 엔드포인트 |
|------|------|
| 기술 | 설명 |

### Core

## Backend

---

| **WebRTC** | P2P 화상 통화 |
| **Socket.IO Client** | 실시간 통신 |
|------|------|
| 기술 | 용도 |

### 실시간

| **PostCSS** | CSS 전처리 |
| **CSS Modules** | 컴포넌트 스코프 스타일링 |
|------|------|
| 기술 | 용도 |

### 스타일링

| **React Context** | 클라이언트 상태 (설정, 소켓) |
| **TanStack Query** | 서버 상태 관리 (캐싱, 동기화) |
|------|------|
| 기술 | 용도 |

### 상태 관리

| **JavaScript** | ES2022+ | 언어 |
| **React** | 18.x | UI 라이브러리 |
| **Next.js** | 14.x | React 프레임워크 (App Router) |
|------|------|------|
| 기술 | 버전 | 설명 |

### Core

## Frontend


