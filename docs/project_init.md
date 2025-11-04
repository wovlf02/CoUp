# CoUp 프로젝트 종합 가이드

> 새로운 세션에서 프로젝트의 모든 내용을 빠르게 파악하기 위한 종합 문서

**Last Updated**: 2025.11.04

---

## 📌 프로젝트 개요

### 프로젝트명: CoUp (코업)

**의미**: 'Cooperate'(협력하다)와 'Up'(성장하다)의 합성어

**슬로건**: "함께, 더 높이. 당신의 성장을 위한 스터디 허브."

### 비전
> "흩어져 있는 모든 스터디의 가능성을 연결하여, 누구나 원하는 목표를 가장 효과적으로 달성하게 돕는 최고의 학습 성장 플랫폼이 된다."

### 핵심 가치
- 스터디 탐색부터 목표 달성까지 **All-in-One 통합 환경**
- 개인의 학습 목표에 맞는 **최적의 그룹 매칭**
- 데이터 기반의 **지속 가능한 동기 부여**
- 함께 성장하는 **건강한 학습 커뮤니티**

---

## 🎯 MVP 목표 (2주 개발)

### 핵심 목표
- **2주 내 MVP 개발 완료**
- **Vercel 무료 배포** 실현
- **소프트웨어 저작권 등록** 준비
- 빠른 시장 검증 후 사용자 피드백 수집

### MVP 범위
스터디 그룹을 모으고 기본적인 활동을 가능하게 하는 최소 기능에 집중

---

## 🛠 기술 스택

### 프론트엔드 & 백엔드 (통합)
| 항목 | 기술 | 이유 |
|------|------|------|
| **프레임워크** | Next.js 16 (App Router) | SSR/CSR 최적화, API Routes로 풀스택 개발 |
| **언어** | JavaScript (ES6+) | 빠른 MVP 개발 (TypeScript는 Post-MVP) |
| **UI 라이브러리** | React 18 | 컴포넌트 기반, 풍부한 생태계 |
| **상태 관리** | Zustand | 경량, 간결한 API |
| **서버 상태** | React Query (TanStack Query) | 캐싱, 동기화, 비동기 로직 관리 |
| **인증** | NextAuth.js | 소셜 로그인, JWT 세션 관리 |
| **ORM** | Prisma | 타입 안전성, 쉬운 스키마 관리 |
| **스타일링** | Tailwind CSS + shadcn/ui | 빠른 개발, 일관된 디자인 |

### 시그널링 서버 (실시간 통신 전담)
| 항목 | 기술 | 이유 |
|------|------|------|
| **런타임** | Node.js 18+ | 비동기 I/O, WebSocket 최적화 |
| **프레임워크** | Express.js | 경량, 내부 API 통신용 |
| **WebSocket** | Socket.IO | 자동 재연결, 룸 기능 |
| **인증** | jsonwebtoken | JWT 검증 |

### 데이터베이스 & 인프라
| 항목 | 기술 | 선택 이유 |
|------|------|----------|
| **RDBMS** | PostgreSQL 15 | 안정성, 성능, 풍부한 기능 |
| **캐시/메시지** | Redis 7 | 캐싱 + Pub/Sub 메시지 브로커 |
| **파일 저장** | AWS S3 | 확장성, 보안성 |
| **컨테이너** | Docker | 환경 일치, 격리, 이식성 |
| **호스팅** | Vercel (Next.js), AWS ECS/Fargate (시그널링) | Next.js 최적화, 컨테이너 자동 확장 |
| **CI/CD** | GitHub Actions | 테스트, 빌드, 배포 자동화 |

---

## 🏗 시스템 아키텍처

### 전체 구조
```
┌─────────────┐      HTTPS        ┌──────────────────────┐
│   Browser   │ ←─────────────────→│   Next.js (Vercel)   │
│             │                    │  - Frontend (SSR/CSR) │
└─────────────┘                    │  - API Routes        │
       │                           └──────────────────────┘
       │ WebSocket                          │
       │                                    │ Prisma
       ↓                                    ↓
┌─────────────┐                    ┌──────────────┐
│ Signaling   │←─── Internal API ──│  PostgreSQL  │
│ Server      │                    └──────────────┘
│ (AWS ECS)   │                            │
└─────────────┘                            │
       │                                   │
       └────→ Redis Pub/Sub ←─────────────┘
              (ElastiCache)
                    │
                    ↓
              AWS S3 (Files)
```

### 핵심 설계 원칙
1. **Next.js 풀스택**: 프론트엔드 + 백엔드(API Routes) 통합
2. **실시간 분리**: 모든 WebSocket 통신은 시그널링 서버가 전담
3. **느슨한 결합**: Redis Pub/Sub으로 서버 간 의존성 최소화
4. **서버리스**: Next.js는 Vercel에서 서버리스 함수로 실행

### 서버 간 통신
- **시그널링 → Next.js**: 내부 REST API 호출 (`/api/v1/internal/**`)
- **Next.js → 시그널링**: Redis Pub/Sub 이벤트 발행

---

## 📂 파일 구조

### 프로젝트 루트
```
CoUp/
├── docs/                    # 프로젝트 문서
├── coup/                    # Next.js 애플리케이션
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # React 컴포넌트
│   │   ├── lib/            # 유틸리티, 비즈니스 로직
│   │   ├── styles/         # 전역 스타일
│   │   └── middleware.js   # 인증/권한 미들웨어
│   ├── prisma/             # DB 스키마
│   └── public/             # 정적 파일
└── signaling/              # Node.js 시그널링 서버 (별도)
```

### Next.js 애플리케이션 구조
```
src/
├── app/
│   ├── (auth)/                    # 인증 라우트 그룹
│   │   ├── sign-in/page.jsx       # 로그인
│   │   ├── sign-up/page.jsx       # 회원가입
│   │   ├── layout.jsx             # 인증 레이아웃
│   │   └── loading.jsx            # 로딩 UI
│   │
│   ├── (main)/                    # 메인 서비스 라우트
│   │   ├── layout.jsx             # 메인 레이아웃 (Header, Sidebar)
│   │   ├── page.jsx               # 대시보드
│   │   ├── studies/               # 스터디 관련
│   │   │   ├── page.jsx           # 스터디 탐색
│   │   │   ├── create/page.jsx    # 스터디 생성
│   │   │   └── [studyId]/         # 스터디 상세
│   │   │       ├── layout.jsx     # 탭 네비게이션
│   │   │       ├── page.jsx       # 개요
│   │   │       ├── chat/          # 채팅
│   │   │       ├── notices/       # 공지
│   │   │       ├── files/         # 파일
│   │   │       ├── calendar/      # 캘린더
│   │   │       ├── tasks/         # 할 일
│   │   │       ├── video-call/    # 화상 스터디
│   │   │       └── settings/      # 설정
│   │   ├── me/page.jsx            # 마이페이지
│   │   └── notifications/page.jsx # 알림
│   │
│   ├── api/                       # API Routes
│   │   ├── auth/[...nextauth]/route.js  # NextAuth
│   │   └── v1/                    # API v1
│   │       ├── users/             # 사용자 API
│   │       ├── studies/           # 스터디 API
│   │       ├── notifications/     # 알림 API
│   │       └── internal/          # 내부 통신 API
│   │
│   ├── layout.jsx                 # 루트 레이아웃
│   ├── page.jsx                   # 랜딩 페이지
│   └── not-found.jsx              # 404 페이지
│
├── components/
│   ├── ui/                        # Atomic (shadcn/ui)
│   │   ├── button.jsx
│   │   ├── input.jsx
│   │   ├── card.jsx
│   │   └── skeleton.jsx
│   │
│   ├── common/                    # 공통 컴포넌트
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── LoadingSpinner.jsx
│   │
│   ├── loading/                   # 스켈레톤 컴포넌트
│   │   ├── PageLoadingSkeleton.jsx
│   │   ├── StudyCardSkeleton.jsx
│   │   └── ChatLoadingSkeleton.jsx
│   │
│   ├── error/                     # 에러 컴포넌트
│   │   ├── ErrorMessage.jsx
│   │   └── NotFoundMessage.jsx
│   │
│   ├── domain/                    # 도메인별 컴포넌트
│   │   ├── auth/                  # 인증
│   │   ├── dashboard/             # 대시보드
│   │   ├── study/                 # 스터디
│   │   ├── chat/                  # 채팅
│   │   ├── notice/                # 공지
│   │   ├── file/                  # 파일
│   │   ├── calendar/              # 캘린더
│   │   ├── task/                  # 할 일
│   │   ├── video-call/            # 화상
│   │   ├── my-page/               # 마이페이지
│   │   └── notification/          # 알림
│   │
│   ├── modals/                    # 모달
│   │   ├── NoticeCreateEditModal.jsx
│   │   ├── EventAddEditModal.jsx
│   │   ├── ProfileImageChangeModal.jsx
│   │   └── GeneralConfirmationModal.jsx
│   │
│   └── providers/                 # Context Providers
│       ├── QueryProvider.jsx
│       ├── AuthProvider.jsx
│       └── SocketProvider.jsx
│
├── lib/
│   ├── api/                       # API 클라이언트
│   │   ├── index.js               # API 인스턴스
│   │   ├── queries/               # React Query 쿼리
│   │   │   ├── auth.js
│   │   │   ├── studies.js
│   │   │   └── ...
│   │   └── mutations/             # React Query 뮤테이션
│   │       ├── auth.js
│   │       ├── studies.js
│   │       └── ...
│   │
│   ├── db/
│   │   └── prisma.js              # Prisma Client
│   │
│   ├── services/                  # 비즈니스 로직
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── study.js
│   │   ├── chat.js
│   │   └── ...
│   │
│   ├── utils/                     # 유틸리티
│   │   ├── apiResponse.js
│   │   ├── auth.js
│   │   ├── errors.js
│   │   ├── redis.js
│   │   └── constants.js
│   │
│   ├── hooks/                     # 커스텀 훅
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   └── useDebounce.js
│   │
│   └── store/                     # Zustand 상태
│       ├── userStore.js
│       └── uiStore.js
│
└── middleware.js                  # 인증/권한 미들웨어
```

### 파일 크기 원칙
- **목표**: 한 파일당 100라인 이내 (최대 300라인)
- **전략**: 단일 책임 원칙, 컴포넌트 세분화, 로직 분리

---

## 🎨 디자인 시스템

### 컨셉
**"Professional Productivity Platform"**

직관적이고 깔끔한 인터페이스로 스터디 활동에 집중

### 색상 팔레트
```css
/* Primary (브랜드) */
--primary-500: #6366F1;  /* 메인 */
--primary-600: #4F46E5;  /* Hover */

/* Semantic */
--success-500: #10B981;
--warning-500: #F59E0B;
--danger-500: #EF4444;

/* Neutral */
--gray-50: #F9FAFB;      /* 배경 */
--gray-200: #E5E7EB;     /* 테두리 */
--gray-500: #6B7280;     /* 보조 텍스트 */
--gray-900: #111827;     /* 메인 텍스트 */
```

### 레이아웃
- **사이드바**: 12% (고정 네비게이션)
- **콘텐츠**: 88% (메인 작업 영역)
- **모바일**: 사이드바 햄버거 메뉴로 전환

### 타이포그래피
- **폰트**: Pretendard Variable (한글 최적화)
- **크기**: 12px ~ 36px (8단계)
- **굵기**: 400, 500, 600, 700

### 반응형
```css
--mobile: 0-767px      /* 사이드바 숨김 (햄버거) */
--tablet: 768-1023px   /* 사이드바 아이콘만 */
--desktop: 1024px+     /* 사이드바 전체 */
```

---

## 🎯 MVP 핵심 기능

### 1. 사용자 인증
- ✅ 소셜 로그인 (Google, GitHub)
- ✅ 프로필 관리 (닉네임, 이미지, 자기소개)
- ✅ 계정 탈퇴

**API**:
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `DELETE /api/v1/users/me`

### 2. 스터디 그룹
- ✅ 그룹 생성 (이름, 소개, 카테고리, 정원, 공개여부)
- ✅ 그룹 탐색/검색 (카테고리, 키워드)
- ✅ 그룹 가입/탈퇴
- ✅ 멤버 관리 (초대, 강퇴, 역할 변경)

**API**:
- `GET/POST /api/v1/studies`
- `GET/PATCH/DELETE /api/v1/studies/[studyId]`
- `GET /api/v1/studies/[studyId]/members`
- `POST /api/v1/studies/[studyId]/join`

### 3. 실시간 채팅
- ✅ 그룹 전용 채팅 (WebSocket)
- ✅ 메시지 전송/수신
- ✅ 무한 스크롤 (이전 메시지)
- ✅ 실시간 알림

**WebSocket Events**:
- `send_message` (Client → Server)
- `new_message` (Server → Client)

**API**:
- `GET /api/v1/studies/[studyId]/messages` (이전 내역)
- `POST /api/v1/internal/messages` (내부 저장)

### 4. 화상 스터디 (WebRTC)
- ✅ 다자간 화상 통화
- ✅ 마이크/카메라 제어
- ✅ 화면 공유
- ✅ 다른 참여자 음소거 (그룹장/관리자)

**기술**:
- WebRTC (P2P 통신)
- 시그널링 서버 (SDP, ICE 교환)
- STUN/TURN 서버

### 5. 공지사항
- ✅ 공지 작성/수정/삭제 (그룹장/관리자)
- ✅ Markdown 지원
- ✅ 실시간 알림

**API**:
- `GET/POST /api/v1/studies/[studyId]/notices`
- `PATCH/DELETE /api/v1/studies/[studyId]/notices/[noticeId]`

### 6. 파일 공유
- ✅ 파일 업로드/다운로드 (AWS S3)
- ✅ 파일 삭제 (업로더/관리자)
- ✅ 파일 크기/종류 제한

**API**:
- `GET/POST /api/v1/studies/[studyId]/files`
- `DELETE /api/v1/studies/[studyId]/files/[fileId]`

### 7. 캘린더
- ✅ 일정 공유 (모임, 마감일)
- ✅ 일정 추가/수정/삭제 (그룹장/관리자)
- ✅ 월/주/일 뷰
- ✅ 할 일 연동

**API**:
- `GET/POST /api/v1/studies/[studyId]/events`
- `PATCH/DELETE /api/v1/studies/[studyId]/events/[eventId]`

### 8. 할 일 관리
- ✅ 할 일 생성/수정/삭제
- ✅ 완료 상태 토글
- ✅ 담당자 지정
- ✅ 마감일 설정 (캘린더 연동)

**API**:
- `GET/POST /api/v1/studies/[studyId]/tasks`
- `PATCH/DELETE /api/v1/studies/[studyId]/tasks/[taskId]`

### 9. 알림
- ✅ 실시간 WebSocket 알림
- ✅ 알림 목록 조회
- ✅ 읽음 처리

**알림 유형**:
- 가입 승인/거절
- 새 공지
- 새 메시지
- 멤버 강퇴

**API**:
- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/[notificationId]/read`

---

## 🔄 렌더링 최적화 전략

### SSR (Server-Side Rendering)
**언제**: SEO 필요, 빠른 초기 로딩

**적용 페이지**:
- `/` - 랜딩 페이지
- `/studies` - 스터디 탐색
- `/studies/[id]` - 스터디 상세 개요

### CSR (Client-Side Rendering)
**언제**: 인증 필요, 실시간 업데이트

**적용 페이지**:
- `/dashboard` - 대시보드
- `/studies/[id]/chat` - 채팅
- `/studies/[id]/video-call` - 화상
- `/me` - 마이페이지
- `/notifications` - 알림

### Hybrid (SSR + CSR)
**언제**: 초기 SSR + 이후 CSR

**적용 페이지**:
- `/studies/[id]/*` - 스터디 상세 모든 탭

### Loading States
1. **Suspense Boundaries**: 각 주요 영역
2. **loading.jsx**: 페이지별 로딩 UI
3. **Skeleton Components**: 콘텐츠 로딩
4. **React Query**: 자동 로딩/에러 상태

---

## 📊 데이터베이스 스키마 (Prisma)

### 주요 모델

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  imageUrl  String?
  provider  String   // "google", "github"
  providerId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  StudyMember StudyMember[]
  StudyGroup  StudyGroup[]  @relation("Owner")
}

model StudyGroup {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  category    String
  visibility  String   // "PUBLIC", "PRIVATE"
  maxMembers  Int      @default(10)
  ownerId     Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  owner       User          @relation("Owner", fields: [ownerId], references: [id])
  members     StudyMember[]
  notices     Notice[]
  files       File[]
  events      Event[]
  tasks       Task[]
}

model StudyMember {
  id        Int      @id @default(autoincrement())
  userId    Int
  groupId   Int
  role      String   @default("MEMBER") // "OWNER", "ADMIN", "MEMBER"
  createdAt DateTime @default(now())

  user       User       @relation(fields: [userId], references: [id])
  studyGroup StudyGroup @relation(fields: [groupId], references: [id])

  @@unique([userId, groupId])
}

model Notice {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  authorId  Int
  groupId   Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  group StudyGroup @relation(fields: [groupId], references: [id])
}

model File {
  id        Int      @id @default(autoincrement())
  name      String
  url       String
  size      Int
  uploaderId Int
  groupId   Int
  createdAt DateTime @default(now())

  group StudyGroup @relation(fields: [groupId], references: [id])
}

model Event {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  startDate   DateTime
  endDate     DateTime
  groupId     Int
  createdAt   DateTime @default(now())

  group StudyGroup @relation(fields: [groupId], references: [id])
}

model Task {
  id          Int      @id @default(autoincrement())
  content     String
  isCompleted Boolean  @default(false)
  assigneeId  Int?
  dueDate     DateTime?
  groupId     Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  group StudyGroup @relation(fields: [groupId], references: [id])
}

model Notification {
  id        Int      @id @default(autoincrement())
  type      String   // "STUDY_JOIN_APPROVED", "NEW_NOTICE", etc.
  message   String
  link      String?
  isRead    Boolean  @default(false)
  userId    Int
  createdAt DateTime @default(now())
}
```

---

## 🚀 배포 전략

### Vercel (Next.js 풀스택)
- **자동 배포**: `main` 브랜치 푸시 시
- **환경 변수**: Vercel 대시보드에서 설정
- **도메인**: `coup.vercel.app`

### AWS (시그널링 서버)
- **ECS/Fargate**: Docker 컨테이너 실행
- **ECR**: Docker 이미지 저장
- **GitHub Actions**: CI/CD 자동화

### 공유 인프라
- **PostgreSQL**: Vercel Postgres / Supabase / Neon
- **Redis**: Upstash Redis
- **S3**: AWS S3 (12개월 무료)

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  # Next.js는 Vercel이 자동 배포
  
  # 시그널링 서버만 수동 배포
  deploy-signaling:
    runs-on: ubuntu-latest
    steps:
      - Build Docker image
      - Push to ECR
      - Deploy to ECS
```

---

## 🔐 환경 변수

### Next.js (.env.local)
```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

# OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# AWS S3
AWS_S3_REGION="..."
AWS_S3_ACCESS_KEY_ID="..."
AWS_S3_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET_NAME="..."

# Redis
REDIS_HOST="..."
REDIS_PORT="6379"
REDIS_PASSWORD="..."
REDIS_TOKEN="..."

# Internal API
INTERNAL_API_KEY="..."

# WebSocket
NEXT_PUBLIC_WEBSOCKET_URL="http://localhost:8081"
```

### 시그널링 서버 (.env)
```env
PORT=8081
CORS_ORIGIN="http://localhost:3000"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="..."
INTERNAL_API_URL="http://localhost:3000/api/v1"
```

---

## 🧪 테스트 전략

### 프론트엔드
- **도구**: Jest + React Testing Library
- **범위**: 컴포넌트 단위, UI 상호작용

### API Routes
- **도구**: Jest + Supertest
- **범위**: API 핸들러, 비즈니스 로직

### E2E
- **도구**: Cypress / Playwright
- **범위**: 핵심 사용자 시나리오

### 시그널링 서버
- **도구**: Jest + Socket.IO Client
- **범위**: WebSocket 이벤트 처리

---

## 📝 코딩 컨벤션

### 네이밍
- **camelCase**: 변수, 함수
- **PascalCase**: React 컴포넌트, 클래스
- **UPPER_SNAKE_CASE**: 상수, 환경 변수
- **kebab-case**: 파일명 (컴포넌트 제외)

### 파일명
- 컴포넌트: `PascalCase.jsx`
- API Routes: `route.js`
- 기타: `kebab-case.js`

### 커밋 메시지
```
<type>(<scope>): <subject>

feat(auth): implement github social login
fix(study): correct member count logic
docs(readme): update installation guide
```

### Props 검증
- JavaScript 프로젝트이므로 `prop-types` 사용
- 개발 중 런타임 타입 검증

---

## 🗓 개발 로드맵 (11/4 ~ 11/19, 15일)

> **마감**: 2025년 11월 23일 (프로젝트 제출)
> **목표**: 2025년 11월 19일까지 완성 및 배포 완료
> **개발 기간**: 15일 (화상 스터디, 일정 관리 포함)

### Phase 1: 프로젝트 기반 구축 (11/4~11/5, 1~2일차)
- [x] 프로젝트 초기 설정
- [ ] Next.js 프로젝트 생성 및 기본 구조 세팅
- [ ] Prisma 스키마 정의 (전체 모델 한번에 작성)
- [ ] PostgreSQL 연결 및 초기 마이그레이션
- [ ] 환경 변수 설정 (DB, Redis, S3, OAuth)
- [ ] 기본 레이아웃 컴포넌트 (Header, Sidebar, Footer)
- [ ] Tailwind CSS + shadcn/ui 설정 및 디자인 시스템 구축
- [ ] 반응형 레이아웃 기본 틀

### Phase 2: 사용자 인증 (11/6~11/7, 3~4일차)
- [ ] NextAuth.js 설정 (Google, GitHub OAuth 동시 구현)
- [ ] 로그인/회원가입 페이지 UI
- [ ] 프로필 관리 API (GET, PATCH, DELETE)
- [ ] 마이페이지 UI (프로필 수정, 참여 스터디 목록)
- [ ] 인증 미들웨어 구현 (protected routes)
- [ ] 세션 관리 및 JWT 토큰 처리

### Phase 3: 스터디 그룹 핵심 (11/8~11/10, 5~7일차)
- [ ] 스터디 CRUD API 구현 (생성, 조회, 수정, 삭제)
- [ ] 스터디 생성 페이지 + 폼 검증 (카테고리, 정원, 공개여부)
- [ ] 스터디 탐색/검색 페이지 (SSR, 카테고리 필터, 키워드 검색)
- [ ] 스터디 상세 페이지 레이아웃 + 탭 네비게이션
- [ ] 멤버 가입/탈퇴/강퇴 API 및 UI
- [ ] 권한 시스템 구현 (OWNER/ADMIN/MEMBER)
- [ ] 대시보드 페이지 (참여 중인 스터디 목록)

### Phase 4: 실시간 채팅 (11/11~11/12, 8~9일차)
- [ ] Socket.IO 시그널링 서버 구축 (Node.js + Express)
- [ ] WebSocket 연결 및 JWT 인증
- [ ] Socket.IO Room 기반 그룹 채팅 구현
- [ ] 실시간 메시지 전송/수신
- [ ] 채팅 메시지 DB 저장 (PostgreSQL)
- [ ] 채팅 히스토리 로딩 (무한 스크롤, 페이지네이션)
- [ ] Redis Pub/Sub 연동 (서버 간 메시지 브로커)
- [ ] 채팅 UI (메시지 입력, 전송, 스크롤 자동화)

### Phase 5: 화상 스터디 (WebRTC) (11/13, 10일차)
- [ ] WebRTC P2P 연결 구현 (Mesh 방식, 최대 6명)
- [ ] 시그널링 서버에 SDP/ICE 교환 로직 추가
- [ ] Offer/Answer/ICE Candidate WebSocket 이벤트
- [ ] STUN 서버 설정 (Google STUN 무료 서버)
- [ ] 마이크/카메라 제어 (MediaStream API)
- [ ] 화면 공유 기능 (getDisplayMedia)
- [ ] 화상 스터디 UI (비디오 그리드, 컨트롤 버튼)
- [ ] **단순화**: TURN 서버 제외 (NAT 통과 제한적 허용)

### Phase 6: 공지사항 & 파일 공유 (11/14, 11일차)
- [ ] 공지사항 CRUD API (작성, 수정, 삭제 - 관리자만)
- [ ] 공지사항 UI (Markdown 렌더링: react-markdown)
- [ ] 파일 업로드 API (AWS S3 연동, Pre-signed URL)
- [ ] 파일 다운로드 및 삭제 기능
- [ ] 파일 크기/확장자 검증 (최대 50MB)
- [ ] 파일 목록 UI (업로더, 날짜, 크기 표시)

### Phase 7: 캘린더 & 할 일 관리 (11/15, 12일차)
- [ ] 캘린더 UI 구현 (react-big-calendar 또는 FullCalendar)
- [ ] 일정(Event) CRUD API (제목, 설명, 시작일, 종료일)
- [ ] 일정 추가/수정/삭제 UI (모달 또는 사이드패널)
- [ ] 할 일(Task) CRUD API (내용, 완료여부, 담당자, 마감일)
- [ ] 할 일 목록 UI (체크박스, 담당자 표시)
- [ ] 할 일 완료 토글 기능
- [ ] 캘린더-할 일 연동 (마감일 있는 Task를 캘린더에 표시)
- [ ] 월/주/일 뷰 전환

### Phase 8: 알림 시스템 (11/16, 13일차)
- [ ] 알림 데이터 모델 (type, message, link, isRead)
- [ ] 알림 API (목록 조회, 읽음 처리)
- [ ] WebSocket 기반 실시간 알림 전송
- [ ] 알림 트리거 구현:
  - 가입 승인/거절
  - 새 공지사항
  - 새 메시지 (멘션)
  - 멤버 강퇴
  - 새 일정 추가
- [ ] 알림 UI (헤더 알림 아이콘, 알림 드롭다운)
- [ ] 알림 페이지 (전체 알림 목록)

### Phase 9: 통합 테스트 & 버그 수정 (11/17, 14일차)
- [ ] 전체 기능 통합 테스트 (사용자 시나리오 기반)
- [ ] 주요 사용자 플로우 테스트:
  - 회원가입 → 스터디 생성 → 멤버 초대 → 채팅 → 화상 통화
  - 공지사항 작성 → 파일 업로드 → 일정 추가 → 할 일 생성
- [ ] 버그 수정 및 에러 핸들링 강화
- [ ] 에러 바운더리 추가
- [ ] 로딩 상태 및 Skeleton UI 개선
- [ ] 반응형 UI 점검 (모바일, 태블릿, 데스크톱)

### Phase 10: 최종 배포 (11/18~11/19, 15~16일차)
- [ ] Vercel 프로덕션 배포
  - 환경 변수 설정 (DATABASE_URL, NEXTAUTH_SECRET, OAuth, S3, Redis)
  - 도메인 연결 (coup.vercel.app)
- [ ] 시그널링 서버 배포 선택:
  - **Option A**: Vercel 함께 배포 (서버리스 함수로 제한적)
  - **Option B**: Railway/Render 무료 배포 (권장)
  - **Option C**: AWS ECS/Fargate (복잡하지만 안정적)
- [ ] PostgreSQL 프로덕션 DB 설정 (Vercel Postgres / Supabase / Neon)
- [ ] Redis 프로덕션 설정 (Upstash Redis)
- [ ] AWS S3 버킷 설정 및 CORS 구성
- [ ] 프로덕션 환경 테스트 (실제 배포 URL에서 전체 기능 검증)
- [ ] 기본 문서화 (README, 설치 가이드, API 문서)
- [ ] 🎯 **11/19 23:59까지 최종 배포 완료**

---

### ⚡ 15일 완전판 개발 전략

#### **✅ 모든 핵심 기능 포함 (11/4~11/19)**
1. ✅ 사용자 인증 (소셜 로그인, 프로필 관리)
2. ✅ 스터디 그룹 CRUD (생성, 탐색, 가입, 관리)
3. ✅ 멤버 관리 및 권한 시스템
4. ✅ 실시간 채팅 (WebSocket)
5. ✅ **화상 스터디 (WebRTC)** ← 포함됨!
6. ✅ 공지사항 (작성, 수정, 삭제)
7. ✅ 파일 공유 (업로드, 다운로드)
8. ✅ **캘린더 (일정 관리)** ← 포함됨!
9. ✅ **할 일 관리** ← 포함됨!
10. ✅ 알림 시스템 (실시간 알림)

#### **단순화 전략 (일정 준수를 위해)**
- **WebRTC**: Mesh 방식만 (최대 6명), TURN 서버 제외
- **캘린더**: react-big-calendar 라이브러리 사용 (커스터마이징 최소화)
- **UI**: shadcn/ui 기본 스타일 최대 활용, 복잡한 애니메이션 제거
- **검색**: LIKE 쿼리만 사용 (Full-Text Search는 제외)
- **파일 업로드**: 크기 제한만 검증 (바이러스 스캔 제외)
- **알림**: WebSocket만 지원 (이메일/푸시 알림 제외)
- **테스트**: 수동 테스트 위주 (E2E 자동화 테스트 제외)
- **배포**: 무료 티어 최대 활용 (Vercel, Railway, Upstash)

---

### Post-Submission 고도화 계획 (11/23 제출 이후)

#### Phase 11: 피드백 반영 및 버그 수정
- [ ] 교수/심사위원 피드백 수집
- [ ] 발견된 버그 긴급 수정
- [ ] 사용자 테스트 피드백 반영
- [ ] 성능 병목 지점 개선

#### Phase 12: 고도화 (선택적, 시간 여유 시)
- [ ] TypeScript 마이그레이션 고려
- [ ] WebRTC TURN 서버 추가 (대규모 사용자 대비)
- [ ] 이미지 최적화 (Next.js Image, lazy loading)
- [ ] 번들 크기 최적화 (code splitting)
- [ ] E2E 테스트 자동화 (Playwright/Cypress)
- [ ] 소프트웨어 저작권 등록 준비
- [ ] 실사용자 대상 베타 테스트

---

### 📌 15일 완성 성공 전략

#### **시간 관리 원칙**
1. **일일 8~10시간 집중 개발** (주말 포함)
2. **기능별 타임박싱**: 각 기능에 정해진 시간 초과 금지
3. **매일 저녁 진행 상황 체크**: 지연 발생 시 즉시 계획 조정
4. **3일 단위 마일스톤**: Phase 완료 시 반드시 동작하는 상태 유지

#### **개발 효율화**
1. **라이브러리 최대 활용**: shadcn/ui, React Query, Socket.IO, react-big-calendar
2. **완벽함 포기**: 80% 완성도로 빠르게 구현 → 나중에 개선
3. **복붙 허용**: 유사 기능은 코드 재사용 적극 활용
4. **디버깅 시간 제한**: 1시간 넘으면 다른 방법 시도
5. **문서화 최소화**: 코드 주석 위주, README는 배포 직전

#### **리스크 관리**
1. **WebRTC 막히면**: 일단 채팅만 완성 후 마지막에 재시도
2. **S3 설정 복잡하면**: 임시로 로컬 파일 저장 (public 폴더)
3. **Redis 문제 발생**: 일단 제외하고 PostgreSQL만 사용
4. **배포 실패 시**: Vercel 대신 Netlify/Railway 시도

#### **일정 지연 대응책**
- **11/12까지 Phase 4 미완성 시**: 화상 스터디 제외
- **11/15까지 Phase 7 미완성 시**: 할 일 관리 간소화 (캘린더만)
- **11/17까지 Phase 8 미완성 시**: 알림은 기본 기능만

#### **최종 목표**
🎯 **11월 19일 23:59까지 모든 기능 배포 완료**
📅 **11월 20~22일**: 최종 점검 및 발표 준비
🚀 **11월 23일**: 프로젝트 제출

---

## 👥 사용자 페르소나

### 페르소나 1: 취업 준비생 (김민준, 25세)
**목표**: IT 기업 신입 개발자 취업
**니즈**:
- 비슷한 목표의 스터디원 매칭
- 체계적인 진행 관리
- 동기 부여

**Pain Points**:
- 스터디 팀원 찾기 어려움
- 열정이 흐지부지됨
- 객관적인 실력 파악 어려움

### 페르소나 2: 전문직 수험생 (이서아, 28세)
**목표**: LEET 시험 고득점
**니즈**:
- 성실한 멤버로 구성된 그룹
- 명확한 규칙 및 자동 관리
- 효율적인 자료 공유

**Pain Points**:
- 참여도 차이로 진도 맞추기 힘듦
- 신뢰할 수 있는 캠 스터디 그룹 찾기 어려움
- 방대한 자료 관리 어려움

---

## 🎯 성공 지표

### 정량적
- MAU 10만 명
- 유료 전환 시 월 매출 1억 원
- 리텐션 40% 이상 (첫 달 기준)

### 정성적
- "스터디" 하면 가장 먼저 떠올리는 플랫폼
- 목표 달성 후기가 커뮤니티에 활발히 공유
- 지속 가능한 개발 문화 구축

---

## 🔗 주요 링크

### 개발
- Vercel 대시보드: (배포 후 추가)
- AWS Console: (배포 후 추가)
- GitHub Repository: (추가)

### 디자인
- Figma: (추가)
- 디자인 시스템: `/docs/00_MVP_2Week_Plan.md`

### 문서
- 프로젝트 비전: `/docs/00_Project_Vision.md`
- 기술 아키텍처: `/docs/04_Technical_Architecture.md`
- API 설계: `/docs/07_API_Design.md`
- UI/UX 명세: `/docs/mvp/uiux/`

---

## ⚠️ 중요 참고사항

### MVP 개발 원칙
1. **빠른 출시**: 완벽보다는 동작하는 제품
2. **사용자 피드백**: 데이터 기반 의사결정
3. **반복 개선**: 지속적인 업데이트

### 기술 부채 관리
- JavaScript로 시작 → TypeScript로 전환 고려
- Mock API 없이 실제 API 직접 구현
- 성능 최적화는 사용자 증가 후 대응

### 보안
- 환경 변수 절대 커밋 금지
- `.env.local`은 `.gitignore`에 포함
- API 인증/인가 필수
- XSS, CSRF 방어

### 협업
- 코드 리뷰 필수
- 커밋 메시지 컨벤션 준수
- 이슈/PR 템플릿 활용

---

## 📞 문의 및 지원

프로젝트 관련 문의사항이나 기술 지원이 필요한 경우:
1. GitHub Issues 활용
2. 팀 채널에서 논의
3. 문서 업데이트 제안

---

**마지막 업데이트**: 2025.01.04
**문서 버전**: 1.0.0
**다음 리뷰**: MVP 출시 후

