# 09. 백엔드 아키텍처 (Next.js API Routes)

CoUp의 백엔드는 **Next.js API Routes**를 기반으로 구축됩니다. TypeScript의 타입 안전성과 Next.js의 통합된 개발 환경을 활용하여, **핵심 비즈니스 로직** 처리에 집중하고, 유지보수와 확장이 용이한 견고한 서버리스 함수 기반의 API를 구축하는 것을 목표로 합니다.

## 1. 아키텍처 원칙

- **서버리스 함수 (Serverless Functions)**: 각 API Route는 독립적인 서버리스 함수로 동작하여, 필요할 때만 실행되고 사용량에 따라 자동으로 확장됩니다.
- **파일 시스템 기반 라우팅**: `app/api` 디렉토리 구조가 곧 API 엔드포인트가 되어 직관적인 라우팅 관리가 가능합니다.
- **타입 안전성**: TypeScript를 적극 활용하여 API 요청/응답 데이터, 데이터베이스 모델 등 모든 계층에서 타입 안전성을 확보합니다.
- **ORM 기반 데이터 접근**: Prisma를 사용하여 데이터베이스 스키마를 관리하고, 타입 안전한 Prisma Client를 통해 데이터베이스와 상호작용합니다.

## 2. 패키지 구조 (Package Structure)

```
/src
├── app/
│   ├── api/                                # Next.js API Routes
│   │   ├── auth/                           # 인증 관련 API (NextAuth.js 콜백 등)
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── v1/                             # API 버전 관리 (예: /api/v1)
│   │   │   ├── users/                      # 사용자 관련 API
│   │   │   │   ├── route.ts                # GET /api/v1/users (목록 조회), POST /api/v1/users (생성)
│   │   │   │   ├── [userId]/               # 동적 라우팅: 특정 사용자 관련 API
│   │   │   │   │   ├── route.ts            # GET /api/v1/users/[userId] (상세 조회), PATCH /api/v1/users/[userId] (수정), DELETE /api/v1/users/[userId] (삭제)
│   │   │   │   └── me/                     # 현재 로그인 사용자 관련 API
│   │   │   │       └── route.ts            # GET /api/v1/users/me, PATCH /api/v1/users/me
│   │   │   ├── studies/                    # 스터디 그룹 관련 API
│   │   │   │   ├── route.ts                # GET /api/v1/studies, POST /api/v1/studies
│   │   │   │   ├── [studyId]/              # 특정 스터디 그룹 관련 API
│   │   │   │   │   ├── route.ts            # GET /api/v1/studies/[studyId], PATCH /api/v1/studies/[studyId], DELETE /api/v1/studies/[studyId]
│   │   │   │   │   ├── members/            # 스터디 멤버 관련 API
│   │   │   │   │   │   ├── route.ts        # GET /api/v1/studies/[studyId]/members
│   │   │   │   │   │   └── [memberId]/     # 특정 멤버 관련 API
│   │   │   │   │   │       └── route.ts    # PATCH /api/v1/studies/[studyId]/members/[memberId] (역할 변경), DELETE /api/v1/studies/[studyId]/members/[memberId] (강퇴)
│   │   │   │   │   └── join/               # 스터디 가입 신청 API
│   │   │   │   │       └── route.ts        # POST /api/v1/studies/[studyId]/join
│   │   │   │   └── internal/               # 내부 통신용 API (시그널링 서버 등에서 호출)
│   │   │   │       ├── messages/           # 채팅 메시지 저장 API
│   │   │   │       │   └── route.ts        # POST /api/v1/studies/internal/messages
│   │   │   │       └── users/              # 사용자 상태 변경 API
│   │   │   │           └── status/         # POST /api/v1/studies/internal/users/status
│   │   │   │               └── route.ts
│   │   │   └── ...                         # 기타 도메인별 API (notices, files, calendar, tasks, notifications 등)
│   │   └── route.ts                        # (선택 사항) /api/v1/ 루트 API
│
├── lib/                                    # 공통 로직, 유틸리티, 데이터 접근
│   ├── db/                                 # 데이터베이스 관련
│   │   └── prisma.ts                       # Prisma Client 인스턴스
│   ├── services/                           # 비즈니스 로직을 담는 서비스 계층
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── study.ts
│   │   ├── chat.ts
│   │   ├── notice.ts
│   │   ├── file.ts
│   │   ├── calendar.ts
│   │   └── notification.ts
│   ├── utils/                              # 범용 유틸리티 함수
│   │   ├── apiResponse.ts                  # API 응답 형식 헬퍼
│   │   ├── auth.ts                         # 인증 관련 헬퍼 (NextAuth.js 세션 관리 등)
│   │   ├── errors.ts                       # 커스텀 에러 정의
│   │   └── redis.ts                        # Redis 클라이언트 인스턴스 및 Pub/Sub 헬퍼
│   └── types/                              # 공통 타입 정의 (DTO, 인터페이스 등)
│       ├── auth.ts
│       ├── user.ts
│       └── ...
│
└── middleware.ts                           # 전역 미들웨어 (인증, 로깅 등)
```

## 3. 계층별 역할 정의 (Layer Definitions)

- **API Routes (`app/api/**/*.ts`)**: HTTP 요청을 수신하고, 요청 데이터를 파싱하며, 적절한 서비스 계층의 메서드를 호출하는 진입점입니다. 응답 데이터를 클라이언트에 반환합니다.
  - 요청 유효성 검사, 인증/인가 처리, 에러 핸들링 등을 담당합니다.
- **Service (`lib/services/*.ts`)**: 핵심 비즈니스 로직을 처리하는 계층입니다. 여러 Prisma Client 호출을 조합하여 복잡한 로직을 수행하고, 도메인 규칙을 적용합니다.
  - API Routes와 Prisma Client 사이의 중재자 역할을 합니다.
- **Prisma Client (`lib/db/prisma.ts`)**: 데이터베이스와의 상호작용을 담당하는 데이터 접근 계층입니다. Prisma Schema를 기반으로 생성된 타입 안전한 클라이언트를 통해 CRUD 작업을 수행합니다.
- **Middleware (`middleware.ts`)**: 모든 요청에 대해 공통적으로 적용되는 로직(예: 인증 확인, 로깅, CORS 처리)을 처리합니다.

## 4. 인증 및 인가 (Authentication & Authorization)

- **`NextAuth.js`**를 사용하여 사용자 인증을 처리하고, API Routes 내에서 세션 정보를 기반으로 인가를 수행합니다.
- **흐름**: 클라이언트가 로그인하면 NextAuth.js를 통해 세션이 생성되고 JWT가 발급됩니다. 이후 API 요청 시 이 JWT를 검증하여 사용자의 인증 상태를 확인하고, 필요한 경우 역할 기반의 인가 로직을 적용합니다.

## 5. 시그널링 서버와의 연동

- Next.js API Routes는 실시간 통신을 직접 처리하지 않고, **내부 REST API**와 **Redis Pub/Sub**을 통해 시그널링 서버와 상호작용합니다.
- **Inbound (시그널링 -> Next.js API Routes)**: 시그널링 서버가 DB 저장을 요청할 수 있도록 `/api/v1/internal/**` 경로의 내부 API를 제공합니다.
- **Outbound (Next.js API Routes -> 시그널링)**: Next.js API Routes에서 발생한 실시간 알림 필요 이벤트를 `lib/utils/redis.ts`의 Redis 클라이언트를 통해 Redis 채널에 발행(Publish)합니다.