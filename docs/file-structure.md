CoUp 프로젝트는 Next.js를 사용하여 프론트엔드와 백엔드를 통합하여 개발됩니다. 따라서, 파일 구조는 단일 `src` 디렉토리 내에서 프론트엔드 컴포넌트와 백엔드 API 라우트가 함께 관리됩니다.

## 1. 디렉토리 구조 (Directory Structure)

```
/src
├── app/                                # Next.js App Router (라우팅 및 페이지 및 API Routes)
│   ├── (auth)/                         # 인증 관련 라우트 그룹 (URL에 영향 없음, 레이아웃 분리)
│   │   ├── sign-in/                    # 로그인 페이지
│   │   │   └── page.jsx
│   │   ├── sign-up/                    # 회원가입 페이지
│   │   │   └── page.jsx
│   │   └── layout.jsx                  # 인증 관련 페이지들의 공통 레이아웃
│   ├── (main)/                         # 로그인 후 접근하는 메인 서비스 라우트 그룹
│   │   ├── layout.jsx                  # 메인 서비스의 공통 레이아웃 (사이드바, 헤더 포함)
│   │   ├── page.jsx                    # 로그인 후 랜딩 페이지 (예: 대시보드)
│   │   ├── studies/                    # 스터디 관련 페이지
│   │   │   ├── page.jsx                # 스터디 탐색/목록 페이지
│   │   │   ├── create/                 # 스터디 생성 페이지
│   │   │   │   └── page.jsx
│   │   │   ├── [studyId]/              # 동적 라우팅: 특정 스터디 상세 페이지
│   │   │   │   ├── layout.jsx          # 스터디 상세 페이지의 공통 레이아웃 (탭 네비게이션 등)
│   │   │   │   ├── page.jsx            # 스터디 개요/대시보드 페이지
│   │   │   │   ├── chat/               # 스터디 채팅 페이지
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── notices/            # 스터디 공지사항 페이지
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── files/              # 스터디 파일 공유 페이지
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── calendar/           # 스터디 캘린더 페이지
│   │   │   │   │   └── page.jsx
│   │   │   │   └── settings/           # 스터디 설정/관리 페이지 (그룹원 관리, 정보 수정 등)
│   │   │   │       └── page.jsx
│   │   ├── me/                         # 마이페이지 (프로필 관리)
│   │   │   └── page.jsx
│   │   ├── notifications/              # 알림 목록 페이지
│   │   │   └── page.jsx
│   ├── api/                                # Next.js API Routes (백엔드 로직)
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
│   ├── layout.jsx                      # 최상위 루트 레이아웃 (<html>, <body> 태그 포함)
│   └── page.jsx                        # 랜딩 페이지 (로그인 전 사용자에게 보여지는 초기 페이지)
│
├── components/                         # 재사용 가능한 UI 컴포넌트
│   ├── ui/                             # 원자적(Atomic) 컴포넌트 (shadcn/ui 기반: Button, Input, Card 등)
│   │   ├── button.jsx
│   │   ├── input.jsx
│   │   └── ...
│   ├── common/                         # 애플리케이션 전반에서 사용되는 조합(Composite) 컴포넌트
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   ├── LayoutProvider.jsx          # Context Provider 등을 포함하는 레이아웃 관련 컴포넌트
│   │   ├── ConfirmationModal.jsx       # 범용 확인 모달
│   │   └── ...
│   ├── domain/                         # 특정 도메인에 종속된 컴포넌트 (비즈니스 로직 포함 가능)
│   │   ├── auth/                       # 인증 관련 컴포넌트
│   │   │   ├── SocialLoginButtons.jsx
│   │   │   └── AuthForm.jsx
│   │   ├── study/                      # 스터디 관련 컴포넌트
│   │   │   ├── StudyCard.jsx           # 스터디 목록에서 보여지는 카드
│   │   │   ├── StudyCreationForm.jsx
│   │   │   ├── StudyDetailHeader.jsx   # 스터디 상세 페이지 헤더
│   │   │   ├── StudyMemberList.jsx
│   │   │   └── ...
│   │   ├── chat/                       # 채팅 관련 컴포넌트
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   └── ...
│   │   ├── notice/                     # 공지사항 관련 컴포넌트
│   │   │   ├── NoticeList.jsx
│   │   │   ├── NoticeItem.jsx
│   │   │   └── ...
│   │   ├── file/                       # 파일 공유 관련 컴포넌트
│   │   │   ├── FileUploader.jsx
│   │   │   ├── FileList.jsx
│   │   │   └── FileItem.jsx
│   │   ├── calendar/                   # 캘린더 관련 컴포넌트
│   │   │   ├── StudyCalendar.jsx
│   │   │   ├── EventItem.jsx
│   │   │   └── ...
│   │   └── notification/               # 알림 관련 컴포넌트
│   │       ├── NotificationList.jsx
│   │       ├── NotificationItem.jsx
│   │       └── ...
│   ├── modals/                         # 모달 컴포넌트
│   │   ├── NoticeCreateEditModal.jsx   # 공지사항 작성/수정 모달
│   │   ├── EventAddEditModal.jsx       # 일정 추가/수정 모달
│   │   └── ProfileImageChangeModal.jsx # 프로필 이미지 변경 모달
│   └── providers/                      # 전역 Context Provider (예: ThemeProvider, QueryClientProvider)
│       ├── QueryProvider.jsx
│       └── AuthProvider.jsx
│
├── lib/                                # 공통 로직, 유틸리티, 데이터 접근
│   ├── api/                            # API 요청 관련 함수 및 클라이언트
│   │   ├── index.js                    # API 클라이언트 인스턴스
│   │   ├── queries/                    # React Query 쿼리 키 및 함수
│   │   │   ├── auth.js
│   │   │   ├── studies.js
│   │   │   └── ...
│   │   └── mutations/                  # React Query 뮤테이션 함수
│   │       ├── auth.js
│   │       ├── studies.js
│   │       └── ...
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
│   ├── auth.js                         # NextAuth.js 설정 및 헬퍼
│   ├── constants.js                    # 전역 상수
│   └── types/                              # 공통 타입 정의 (DTO, 인터페이스 등)
│       ├── auth.ts
│       ├── user.ts
│       └── ...
│   └── utils.js                        # 범용 헬퍼 함수 (날짜 포맷팅, 유효성 검사 등)
│
├── hooks/                              # 커스텀 React Hooks
│   ├── useAuth.js                      # 사용자 인증 상태 관련 훅
│   ├── useSocket.js                    # WebSocket 연결 및 이벤트 처리 훅
│   ├── useDebounce.js
│   └── ...
│
├── store/                              # 전역 클라이언트 상태 관리 (Zustand)
│   ├── userStore.js                    # 사용자 정보 스토어
│   ├── uiStore.js                      # UI 상태 스토어 (예: 사이드바 열림/닫힘)
│   └── ...
│
├── styles/                             # 전역 스타일
│   └── globals.css                     # Tailwind CSS 기본 설정 및 전역 스타일
│
├── public/                             # 정적 파일 (이미지, 폰트 등)
│   ├── images/
│   └── icons/
│
└── middleware.ts                           # 전역 미들웨어 (인증, 로깅 등)
```

## 2. 컴포넌트 설계 철학 (Component Design Philosophy)

**Atomic Design** 원칙을 기반으로 컴포넌트를 설계하고 관리합니다.

- **`components/ui` (Atoms & Molecules)**: **shadcn/ui**를 통해 생성된 버튼, 인풋, 카드 등 가장 작은 단위의 재사용 가능한 컴포넌트. 이 컴포넌트들은 자체적으로 상태를 가지지 않으며, props를 통해 제어됩니다.

- **`components/common` (Organisms)**: `ui` 컴포넌트들을 조합하여 만들어진 더 큰 단위의 컴포넌트. 예: `Header`, `Sidebar`, `PageTitle`. 애플리케이션 전반에서 재사용됩니다.

- **`components/domain` (Organisms/Templates)**: 특정 도메인(스터디, 사용자 등)에 특화된 컴포넌트. 비즈니스 로직을 포함할 수 있습니다. 예: `StudyCard`, `StudyMemberList`, `UserProfileForm`.

- **`components/modals`**: 애플리케이션 전반에서 사용될 수 있는 모달 컴포넌트들을 모아둡니다.

- **`app/**/page.jsx` (Pages)**: 각 라우팅 경로에 해당하는 페이지 컴포넌트. 여러 컴포넌트들을 조합하여 실제 페이지를 구성하고, 서버 컴포넌트를 통해 데이터를 페칭하여 하위 클라이언트 컴포넌트로 전달하는 역할을 주로 수행합니다.

- **Props 검증**: TypeScript 인터페이스 또는 타입을 사용하여 컴포넌트의 props를 검증합니다. (`prop-types` 대신 TypeScript 사용)

## 3. 상태 관리 (State Management)

상태는 **서버 상태(Server State)**와 **클라이언트 상태(Client State)**로 명확히 구분하여 관리합니다.

- **서버 상태 관리: `React Query (TanStack Query)`**
  - API를 통해 받아오는 모든 데이터(스터디 목록, 사용자 정보, 채팅 내역 등)는 React Query가 관리합니다.
  - **장점**: 캐싱, 로딩/에러 상태 자동 관리, 데이터 동기화, 비관적/낙관적 업데이트 등 서버 상태와 관련된 복잡한 로직을 매우 효율적으로 처리할 수 있습니다.
  - **사용**: `lib/api.js`에 API 호출 함수를 정의하고, 각 컴포넌트에서 `useQuery`, `useMutation` 훅을 사용하여 데이터를 가져오거나 변경합니다.

- **전역 클라이언트 상태 관리: `Zustand`**
  - 여러 컴포넌트에서 공유해야 하지만, 서버 상태가 아닌 순수 UI 상태(예: 다크 모드, 사이드바 열림/닫힘 여부)나 로그인한 사용자 정보 등은 Zustand를 사용하여 관리합니다.
  - **장점**: 매우 가볍고 API가 간결하여 배우기 쉽습니다. Redux와 같은 보일러플레이트 코드가 거의 없습니다.
  - **사용**: `store` 디렉토리 내에 기능별로 스토어(`create` 함수)를 생성하여 사용합니다.

- **지역 컴포넌트 상태 관리: `useState`, `useReducer`**
  - 특정 컴포넌트 내에서만 사용되는 상태(예: input 값, 토글 상태)는 React의 기본 훅인 `useState`를 사용합니다.
  - 복잡한 상태 로직을 가진 컴포넌트의 경우 `useReducer`를 사용하여 상태 관리 로직을 분리합니다.

## 4. 라우팅 (Routing)

- **Next.js App Router**를 사용하며, 폴더 구조가 곧 URL 구조가 됩니다.
- **라우트 그룹 `(...)`**: `(auth)`, `(main)`과 같이 괄호로 묶인 폴더는 URL 경로에 영향을 주지 않으면서 특정 섹션별로 다른 레이아웃을 적용하기 위해 사용합니다.
- **동적 라우팅 `[...]`**: `[studyId]`와 같이 대괄호로 묶인 폴더는 동적인 경로 파라미터를 처리하기 위해 사용합니다.
- **`loading.jsx`**: 해당 경로의 컨텐츠가 로드되는 동안 보여줄 로딩 UI (React Suspense와 연동).
- **`error.jsx`**: 에러 발생 시 보여줄 에러 UI (Error Boundary).

## 5. 스타일링 (Styling)

- **CSS Modules** 또는 **Styled Components**와 같은 방식을 사용하여 컴포넌트 기반의 스타일링을 적용합니다.
- 전역적으로 필요한 스타일이나 CSS 변수는 `styles/globals.css`에 정의합니다.

## 6. 목업 데이터 관리 (Mock Data Management)

프론트엔드 개발 시 백엔드 API가 준비되지 않았거나, 특정 시나리오 테스트를 위해 목업 데이터가 필요할 경우를 대비하여 목업 데이터 관리 전략을 정의합니다. 이 전략은 기존 `lib/api` 구조를 활용하여 실제 API와 목업 API 간의 전환을 유연하게 지원합니다.

### 6.1. 디렉토리 구조

```
/src
├── lib/
│   ├── api/                            # 실제 API 요청 관련 함수 및 클라이언트
│   │   ├── index.js                    # API 클라이언트 인스턴스 (axios 등)
│   │   ├── queries/                    # React Query 쿼리 키 및 함수 (실제/목업 조건부 사용)
│   │   │   ├── auth.js
│   │   │   ├── studies.js
│   │   │   └── ...
│   │   └── mutations/                  # React Query 뮤테이션 함수 (실제/목업 조건부 사용)
│   │       ├── auth.js
│   │       ├── studies.js
│   │       └── ...
│   ├── mocks/                          # 목업 데이터 및 목업 API 핸들러
│   │   ├── data/                       # 각 도메인별 목업 데이터 정의 (JSON/JS 객체)
│   │   │   ├── users.js                # 사용자 목업 데이터
│   │   │   ├── studies.js              # 스터디 목업 데이터
│   │   │   ├── notifications.js        # 알림 목업 데이터
│   │   │   ├── chat.js                 # 채팅 목업 데이터
│   │   │   └── ...
│   │   ├── apiHandlers.js              # 목업 API 응답을 시뮬레이션하는 함수들
│   │   └── index.js                    # (선택 사항) 목업 API 활성화/비활성화 로직을 중앙에서 관리
│   └── ...
```

### 6.2. 목업 데이터 활용 방안

1.  **목업 데이터 정의**: `lib/mocks/data` 내에 각 도메인 엔티티(예: `users.js`, `studies.js`)에 대한 목업 데이터를 실제 백엔드 API 응답 형태와 유사하게 정의합니다.
2.  **목업 API 핸들러 구현**: `lib/mocks/apiHandlers.js` 파일에 실제 API 호출 함수와 동일한 인터페이스를 가지는 함수들을 구현합니다. 이 함수들은 `lib/mocks/data`의 데이터를 반환하며, `Promise`와 `setTimeout`을 사용하여 네트워크 지연을 시뮬레이션할 수 있습니다.
3.  **조건부 API 호출 로직**: `lib/api/queries` 및 `lib/api/mutations` 내의 각 파일에서 환경 변수(예: `process.env.NEXT_PUBLIC_USE_MOCK_API`)의 값에 따라 실제 API 클라이언트 또는 목업 API 핸들러 중 하나를 선택하여 사용하도록 로직을 구현합니다.
    *   **예시 (`lib/api/queries/studies.js`)**:
        ```javascript
        // lib/api/queries/studies.js
        import { useQuery } from '@tanstack/react-query';
        import { getStudies as fetchRealStudies } from '../index'; // 실제 API 클라이언트
        import { getStudies as fetchMockStudies } from '../../mocks/apiHandlers'; // 목업 API 핸들러

        const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

        export const useStudiesQuery = (params) => {
          return useQuery({
            queryKey: ['studies', params],
            queryFn: () => useMockApi ? fetchMockStudies(params) : fetchRealStudies(params), // fetchRealStudies는 Next.js API Routes를 호출합니다.
          });
        };
        ```
4.  **환경 변수 설정**: `.env.local` 파일에 `NEXT_PUBLIC_USE_MOCK_API=true` 또는 `false`를 설정하여 목업 데이터 사용 여부를 제어합니다.

이러한 방식을 통해 프론트엔드 컴포넌트는 `useQuery`나 `useMutation` 훅을 평소와 같이 사용하면서, 개발 환경 설정에 따라 실제 백엔드 데이터 또는 목업 데이터를 유연하게 활용할 수 있습니다.

## 7. 계층별 역할 정의 (Layer Definitions)

- **API Routes (`app/api/**/*.ts`)**: HTTP 요청을 수신하고, 요청 데이터를 파싱하며, 적절한 서비스 계층의 메서드를 호출하는 진입점입니다. 응답 데이터를 클라이언트에 반환합니다.
  - 요청 유효성 검사, 인증/인가 처리, 에러 핸들링 등을 담당합니다.
- **Service (`lib/services/*.ts`)**: 핵심 비즈니스 로직을 처리하는 계층입니다. 여러 Prisma Client 호출을 조합하여 복잡한 로직을 수행하고, 도메인 규칙을 적용합니다.
  - API Routes와 Prisma Client 사이의 중재자 역할을 합니다.
- **Prisma Client (`lib/db/prisma.ts`)**: 데이터베이스와의 상호작용을 담당하는 데이터 접근 계층입니다. Prisma Schema를 기반으로 생성된 타입 안전한 클라이언트를 통해 CRUD 작업을 수행합니다.
- **Middleware (`middleware.ts`)**: 모든 요청에 대해 공통적으로 적용되는 로직(예: 인증 확인, 로깅, CORS 처리)을 처리합니다.

## 8. 인증 및 인가 (Authentication & Authorization)

- **`NextAuth.js`**를 사용하여 사용자 인증을 처리하고, API Routes 내에서 세션 정보를 기반으로 인가를 수행합니다.
- **흐름**: 클라이언트가 로그인하면 NextAuth.js를 통해 세션이 생성되고 JWT가 발급됩니다. 이후 API 요청 시 이 JWT를 검증하여 사용자의 인증 상태를 확인하고, 필요한 경우 역할 기반의 인가 로직을 적용합니다.

## 9. 시그널링 서버와의 연동

- Next.js API Routes는 실시간 통신을 직접 처리하지 않고, **내부 REST API**와 **Redis Pub/Sub**을 통해 시그널링 서버와 상호작용합니다.
- **Inbound (시그널링 -> Next.js API Routes)**: 시그널링 서버가 DB 저장을 요청할 수 있도록 `/api/v1/internal/**` 경로의 내부 API를 제공합니다.
- **Outbound (Next.js API Routes -> 시그널링)**: Next.js API Routes에서 발생한 실시간 알림 필요 이벤트를 `lib/utils/redis.ts`의 Redis 클라이언트를 통해 Redis 채널에 발행(Publish)합니다.
