# 08. 프론트엔드 아키텍처

CoUp의 프론트엔드는 **Next.js (App Router)**를 기반으로 구축됩니다. 이는 서버 컴포넌트와 클라이언트 컴포넌트의 장점을 모두 활용하여 최적의 성능과 개발 경험을 제공하기 위함입니다. 본 문서는 프론트엔드 개발의 일관성과 효율성을 위한 구조와 규칙을 정의합니다.

## 1. 디렉토리 구조 (Directory Structure)

```
/src
├── app/                                # Next.js App Router (라우팅 및 페이지)
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
│   ├── api/                            # Next.js API Routes (백엔드 로직 - MVP에서는 NextAuth.js 콜백 등 제한적으로 사용)
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.js
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
├── lib/                                # 라이브러리, 헬퍼 함수, 유틸리티
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
│   ├── auth.js                         # NextAuth.js 설정 및 헬퍼
│   ├── constants.js                    # 전역 상수
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
└── public/                             # 정적 파일 (이미지, 폰트 등)
    ├── images/
    └── icons/
```

## 2. 컴포넌트 설계 철학 (Component Design Philosophy)

**Atomic Design** 원칙을 기반으로 컴포넌트를 설계하고 관리합니다.

- **`components/ui` (Atoms & Molecules)**: **shadcn/ui**를 통해 생성된 버튼, 인풋, 카드 등 가장 작은 단위의 재사용 가능한 컴포넌트. 이 컴포넌트들은 자체적으로 상태를 가지지 않으며, props를 통해 제어됩니다.

- **`components/common` (Organisms)**: `ui` 컴포넌트들을 조합하여 만들어진 더 큰 단위의 컴포넌트. 예: `Header`, `Sidebar`, `PageTitle`. 애플리케이션 전반에서 재사용됩니다.

- **`components/domain` (Organisms/Templates)**: 특정 도메인(스터디, 사용자 등)에 특화된 컴포넌트. 비즈니스 로직을 포함할 수 있습니다. 예: `StudyCard`, `StudyMemberList`, `UserProfileForm`.

- **`components/modals`**: 애플리케이션 전반에서 사용될 수 있는 모달 컴포넌트들을 모아둡니다.

- **`app/**/page.jsx` (Pages)**: 각 라우팅 경로에 해당하는 페이지 컴포넌트. 여러 컴포넌트들을 조합하여 실제 페이지를 구성하고, 서버 컴포넌트를 통해 데이터를 페칭하여 하위 클라이언트 컴포넌트로 전달하는 역할을 주로 수행합니다.

- **Props 검증**: **`prop-types`** 라이브러리를 사용하여 개발 중에 컴포넌트로 전달되는 props의 타입을 검증합니다. 이는 런타임 에러를 줄이고 컴포넌트의 API를 명확히 하는 데 도움을 줍니다.

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

- **`Tailwind CSS`**를 기본 스타일링 방식으로 사용합니다.
- **`clsx`** 또는 **`tailwind-merge`** 라이브러리를 함께 사용하여 조건부 클래스를 쉽게 관리합니다.
- 전역적으로 필요한 스타일이나 CSS 변수는 `styles/globals.css`에 정의합니다.