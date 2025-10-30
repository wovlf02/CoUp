# MVP 파일 구조 설계

CoUp 프로젝트의 MVP 개발을 위한 파일 구조는 재사용성, 확장성, 그리고 각 파일의 응집도를 높여 유지보수성을 극대화하는 데 중점을 둡니다. 특히, **한 파일당 코드 라인 수를 100라인 이내로 유지**하는 것을 목표로, 컴포넌트와 로직을 세밀하게 분리하여 설계했습니다.

## 1. 기본 원칙

*   **단일 책임 원칙 (Single Responsibility Principle)**: 각 파일, 컴포넌트, 함수는 하나의 명확한 책임만 가집니다.
*   **관심사 분리 (Separation of Concerns)**: UI, 비즈니스 로직, 데이터 접근 로직을 명확히 분리합니다.
*   **재사용성 (Reusability)**: 공통적으로 사용되는 UI 요소나 로직은 독립적인 컴포넌트나 훅, 유틸리티로 추출합니다.
*   **확장성 (Extensibility)**: 새로운 기능 추가 시 기존 코드에 미치는 영향을 최소화하고, 쉽게 확장할 수 있는 구조를 지향합니다.
*   **코드 품질 (Code Quality)**: JavaScript의 모범 사례를 따르고, 린팅 도구를 활용하여 코드 품질을 유지합니다.

## 2. 디렉토리 구조

```
/src
├── app/                                # Next.js App Router (라우팅 및 페이지)
│   ├── (auth)/                         # 인증 관련 라우트 그룹 (URL에 영향 없음, 레이아웃 분리)
│   │   ├── sign-in/                    # 로그인 페이지 (SignInForm 컴포넌트 조합)
│   │   │   └── page.jsx
│   │   ├── sign-up/                    # 회원가입 페이지 (SignUpForm 컴포넌트 조합)
│   │   │   └── page.jsx
│   │   └── layout.jsx                  # 인증 관련 페이지들의 공통 레이아웃
│   ├── (main)/                         # 로그인 후 접근하는 메인 서비스 라우트 그룹
│   │   ├── layout.jsx                  # 메인 서비스의 공통 레이아웃 (Header, Sidebar 포함)
│   │   ├── page.jsx                    # 로그인 후 랜딩 페이지 (대시보드), DashboardContent 컴포넌트 조합
│   │   ├── studies/                    # 스터디 관련 페이지
│   │   │   ├── page.jsx                # 스터디 탐색/목록 페이지, StudyDiscoveryFilters, StudyList 컴포넌트 조합
│   │   │   ├── create/                 # 스터디 생성 페이지, StudyCreationForm 컴포넌트 조합
│   │   │   │   └── page.jsx
│   │   │   ├── [studyId]/              # 동적 라우팅: 특정 스터디 상세 페이지
│   │   │   │   ├── layout.jsx          # 스터디 상세 페이지의 공통 레이아웃 (StudyHeader, StudyTabNavigation 포함)
│   │   │   │   ├── page.jsx            # 스터디 개요/대시보드 페이지, StudyOverviewContent 컴포넌트 조합
│   │   │   │   ├── chat/               # 스터디 채팅 페이지, ChatWindow 컴포넌트 조합
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── notices/            # 스터디 공지사항 페이지, NoticeList 컴포넌트 조합
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── files/              # 스터디 파일 공유 페이지, FileList, FileUploadArea 컴포넌트 조합
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── calendar/           # 스터디 캘린더 페이지, StudyCalendarView 컴포넌트 조합
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── settings/           # 스터디 설정/관리 페이지, StudySettingsContent 컴포넌트 조합
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── tasks/              # 스터디 할 일 페이지, TaskList 컴포넌트 조합
│   │   │   │   │   └── page.jsx
│   │   │   │   └── video-call/         # 스터디 화상 통화 페이지, VideoCallInterface 컴포넌트 조합
│   │   │   │       └── page.jsx
│   │   ├── me/                         # 마이페이지 (프로필 관리), ProfileManagementForm 컴포넌트 조합
│   │   │   └── page.jsx
│   │   ├── notifications/              # 알림 목록 페이지, NotificationList 컴포넌트 조합
│   │   │   └── page.jsx
│   ├── api/                            # Next.js API Routes (백엔드 로직 - lib/services 호출)
│   │   ├── auth/                       # NextAuth.js 콜백 처리
│   │   │   └── [...nextauth]/
│   │   │       └── route.js
│   │   ├── v1/                         # API 버전 관리 (예: /api/v1)
│   │   │   ├── users/                  # 사용자 관련 API
│   │   │   │   ├── route.js            # GET /api/v1/users, POST /api/v1/users
│   │   │   │   ├── [userId]/route.js   # GET, PATCH, DELETE /api/v1/users/[userId]
│   │   │   │   └── me/route.js         # GET, PATCH /api/v1/users/me
│   │   │   ├── studies/                # 스터디 그룹 관련 API
│   │   │   │   ├── route.js            # GET /api/v1/studies, POST /api/v1/studies
│   │   │   │   ├── [studyId]/          # 특정 스터디 그룹 관련 API
│   │   │   │   │   ├── route.js        # GET, PATCH, DELETE /api/v1/studies/[studyId]
│   │   │   │   │   ├── members/        # 스터디 멤버 관련 API
│   │   │   │   │   │   ├── route.js    # GET /api/v1/studies/[studyId]/members
│   │   │   │   │   │   └── [memberId]/route.js # PATCH, DELETE /api/v1/studies/[studyId]/members/[memberId]
│   │   │   │   │   └── join/route.js   # POST /api/v1/studies/[studyId]/join
│   │   │   │   ├── internal/           # 내부 통신용 API (시그널링 서버 등에서 호출, 보안 강화)
│   │   │   │   │   ├── messages/route.js # POST /api/v1/studies/internal/messages
│   │   │   │   │   └── users/status/route.js # POST /api/v1/studies/internal/users/status
│   │   │   │   └── notices/route.js    # GET, POST /api/v1/studies/[studyId]/notices
│   │   │   │   └── notices/[noticeId]/route.js # PATCH, DELETE /api/v1/studies/[studyId]/notices/[noticeId]
│   │   │   │   └── files/route.js      # GET, POST /api/v1/studies/[studyId]/files
│   │   │   │   └── files/[fileId]/route.js # DELETE /api/v1/studies/[studyId]/files/[fileId]
│   │   │   │   └── events/route.js     # GET, POST /api/v1/studies/[studyId]/events
│   │   │   │   └── events/[eventId]/route.js # PATCH, DELETE /api/v1/studies/[studyId]/events/[eventId]
│   │   │   │   └── tasks/route.js      # GET, POST /api/v1/studies/[studyId]/tasks
│   │   │   │   └── tasks/[taskId]/route.js # PATCH, DELETE /api/v1/studies/[studyId]/tasks/[taskId]
│   │   │   └── notifications/route.js  # GET /api/v1/notifications, POST /api/v1/notifications/read
│   │   │   └── notifications/[notificationId]/read/route.js # PATCH /api/v1/notifications/[notificationId]/read
│   │   └── route.js                    # (선택 사항) /api/v1/ 루트 API
│   ├── layout.jsx                      # 최상위 루트 레이아웃 (<html>, <body> 태그 포함)
│   └── page.jsx                        # 랜딩 페이지 (로그인 전 사용자에게 보여지는 초기 페이지)
│
├── components/                         # 재사용 가능한 UI 컴포넌트
│   ├── ui/                             # 원자적(Atomic) 컴포넌트 (shadcn/ui 기반 또는 직접 구현)
│   │   ├── button.jsx                  # 버튼
│   │   ├── input.jsx                   # 입력 필드
│   │   ├── card.jsx                    # 카드 컨테이너
│   │   ├── dialog.jsx                  # 모달/다이얼로그 (shadcn/ui)
│   │   ├── tabs.jsx                    # 탭 네비게이션
│   │   ├── avatar.jsx                  # 아바타 (프로필 이미지)
│   │   ├── badge.jsx                   # 태그/뱃지
│   │   ├── dropdown-menu.jsx           # 드롭다운 메뉴
│   │   ├── label.jsx                   # 라벨
│   │   ├── textarea.jsx                # 텍스트 에어리어
│   │   ├── checkbox.jsx                # 체크박스
│   │   ├── switch.jsx                  # 토글 스위치
│   │   └── ...                         # 기타 필요한 UI 프리미티브
│   ├── common/                         # 애플리케이션 전반에서 사용되는 조합(Composite) 컴포넌트
│   │   ├── Header/                     # 전역 헤더
│   │   │   ├── Header.jsx
│   │   │   ├── HeaderSearch.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   └── UserProfileDropdown.jsx
│   │   ├── Sidebar/                    # 전역 사이드바
│   │   │   ├── Sidebar.jsx
│   │   │   └── SidebarNav.jsx
│   │   ├── Footer/                     # 전역 푸터
│   │   │   ├── Footer.jsx
│   │   ├── LayoutProvider.jsx          # Context Provider 등을 포함하는 레이아웃 관련 컴포넌트
│   │   └── LoadingSpinner.jsx          # 로딩 스피너
│   ├── domain/                         # 특정 도메인에 종속된 컴포넌트 (비즈니스 로직 포함 가능)
│   │   ├── auth/                       # 인증 관련 컴포넌트
│   │   │   ├── SignInForm.jsx
│   │   │   ├── SignUpForm.jsx
│   │   │   └── SocialLoginButtons.jsx
│   │   ├── dashboard/                  # 대시보드 관련 컴포넌트
│   │   │   ├── DashboardContent.jsx
│   │   │   ├── MyStudiesSummary.jsx
│   │   │   ├── RecommendedStudies.jsx
│   │   │   └── RecentActivityFeed.jsx
│   │   ├── study/                      # 스터디 관련 컴포넌트
│   │   │   ├── StudyCard.jsx           # 스터디 목록에서 보여지는 카드
│   │   │   ├── StudyCreationForm/      # 스터디 생성 폼 (세분화)
│   │   │   │   ├── StudyCreationForm.jsx
│   │   │   │   ├── StudyNameInput.jsx
│   │   │   │   ├── StudyDescriptionInput.jsx
│   │   │   │   ├── StudyCategorySelect.jsx
│   │   │   │   ├── StudyVisibilityToggle.jsx
│   │   │   │   └── StudyMemberCountInput.jsx
│   │   │   ├── StudyDiscoveryFilters/  # 스터디 탐색 필터 (세분화)
│   │   │   │   ├── StudyDiscoveryFilters.jsx
│   │   │   │   ├── CategoryFilter.jsx
│   │   │   │   ├── StatusFilter.jsx
│   │   │   │   └── VisibilityFilter.jsx
│   │   │   ├── StudyList.jsx           # 스터디 목록 렌더링
│   │   │   ├── StudyHeader/            # 스터디 상세 헤더 (세분화)
│   │   │   │   ├── StudyHeader.jsx
│   │   │   │   ├── StudyTitleSection.jsx
│   │   │   │   └── StudyActions.jsx    # 가입/탈퇴 버튼 등
│   │   │   ├── StudyTabNavigation.jsx  # 스터디 상세 탭 메뉴
│   │   │   ├── StudyOverviewContent/   # 스터디 개요 탭 내용 (세분화)
│   │   │   │   ├── StudyOverviewContent.jsx
│   │   │   │   ├── StudyGoalCard.jsx
│   │   │   │   ├── StudyRulesCard.jsx
│   │   │   │   └── StudyMembersPreview.jsx
│   │   │   ├── StudySettingsContent/   # 스터디 설정 탭 내용 (세분화)
│   │   │   │   ├── StudySettingsContent.jsx
│   │   │   │   ├── GroupInfoEditForm.jsx
│   │   │   │   ├── MemberManagementList.jsx
│   │   │   │   ├── JoinRequestList.jsx
│   │   │   │   └── DeleteGroupSection.jsx
│   │   │   └── ...
│   │   ├── chat/                       # 채팅 관련 컴포넌트
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   └── MessageInputForm.jsx
│   │   ├── notice/                     # 공지사항 관련 컴포넌트
│   │   │   ├── NoticeList.jsx
│   │   │   └── NoticeItem.jsx
│   │   ├── file/                       # 파일 공유 관련 컴포넌트
│   │   │   ├── FileList.jsx
│   │   │   ├── FileItem.jsx
│   │   │   └── FileUploadArea.jsx
│   │   ├── calendar/                   # 캘린더 관련 컴포넌트
│   │   │   ├── StudyCalendarView.jsx
│   │   │   └── CalendarControls.jsx
│   │   ├── task/                       # 할 일 관련 컴포넌트
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskItem.jsx
│   │   │   └── TaskInput.jsx
│   │   ├── video-call/                 # 화상 스터디 관련 컴포넌트
│   │   │   ├── VideoCallInterface.jsx
│   │   │   ├── VideoGrid.jsx
│   │   │   ├── ControlBar.jsx
│   │   │   └── ParticipantList.jsx
│   │   ├── my-page/                    # 마이페이지 관련 컴포넌트
│   │   │   ├── ProfileManagementForm.jsx
│   │   │   ├── ProfileImageSection.jsx
│   │   │   ├── NicknameInput.jsx
│   │   │   ├── BioTextarea.jsx
│   │   │   └── AccountActions.jsx
│   │   └── notification/               # 알림 관련 컴포넌트
│   │       ├── NotificationList.jsx
│   │       └── NotificationItem.jsx
│   ├── modals/                         # 모달 컴포넌트 (Dialog 컴포넌트 기반)
│   │   ├── NoticeCreateEditModal.jsx
│   │   ├── EventAddEditModal.jsx
│   │   ├── ProfileImageChangeModal.jsx
│   │   └── GeneralConfirmationModal.jsx
│   └── providers/                      # 전역 Context Provider
│       ├── QueryProvider.jsx           # React Query Provider
│       └── AuthProvider.jsx            # NextAuth.js Session Provider
│
├── lib/                                # 라이브러리, 헬퍼 함수, 유틸리티, 데이터 접근 로직
│   ├── api/                            # API 요청 관련 함수 및 클라이언트 (React Query와 연동)
│   │   ├── index.js                    # API 클라이언트 인스턴스 (axios 또는 fetch 래퍼)
│   │   ├── queries/                    # React Query 쿼리 키 및 함수 (도메인별 분리)
│   │   │   ├── auth.js
│   │   │   ├── studies.js
│   │   │   ├── users.js
│   │   │   │   ├── notifications.js
│   │   │   ├── notices.js
│   │   │   ├── files.js
│   │   │   ├── events.js
│   │   │   └── tasks.js
│   │   └── mutations/                  # React Query 뮤테이션 함수 (도메인별 분리)
│   │       ├── auth.js
│   │       ├── studies.js
│   │       ├── users.js
│   │       ├── notifications.js
│   │       ├── notices.js
│   │       ├── files.js
│   │       ├── events.js
│   │       └── tasks.js
│   ├── db/                             # 데이터베이스 관련
│   │   └── prisma.js                   # Prisma Client 인스턴스
│   ├── services/                       # 비즈니스 로직을 담는 서비스 계층 (API Routes에서 호출)
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── study.js
│   │   ├── chat.js
│   │   ├── notice.js
│   │   ├── file.js
│   │   ├── calendar.js                 # events 관련 서비스
│   │   ├── notification.js
│   │   └── task.js
│   ├── utils/                          # 범용 유틸리티 함수
│   │   ├── apiResponse.js              # API 응답 형식 헬퍼
│   │   ├── auth.js                     # NextAuth.js 세션 관리 헬퍼
│   │   ├── errors.js                   # 커스텀 에러 정의
│   │   ├── redis.js                    # Redis 클라이언트 인스턴스 및 Pub/Sub 헬퍼
│   │   ├── date.js                     # 날짜/시간 포맷팅 및 처리 유틸리티
│   │   └── validation.js               # 폼 유효성 검사 헬퍼
│   ├── hooks/                          # 커스텀 React Hooks (재사용 가능한 로직)
│   │   ├── useAuth.js                  # 사용자 인증 상태 관련 훅
│   │   ├── useSocket.js                # WebSocket 연결 및 이벤트 처리 훅
│   │   ├── useDebounce.js              # 디바운스 훅
│   │   └── useForm.js                  # 폼 상태 관리 훅
│   ├── store/                          # 전역 클라이언트 상태 관리 (Zustand)
│   │   ├── userStore.js                # 사용자 정보 스토어
│   │   └── uiStore.js                  # UI 상태 스토어 (예: 사이드바 열림/닫힘)
│   ├── types/                          # 공통 타입 정의 (DTO, 인터페이스 등, 도메인별 분리)
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── study.js
│   │   ├── notification.js
│   │   ├── notice.js
│   │   ├── file.js
│   │   ├── event.js
│   │   └── task.js
│   └── constants.js                    # 전역 상수
│
├── styles/                             # 전역 스타일
│   └── globals.css                     # Tailwind CSS 기본 설정 및 전역 스타일
│
├── public/                             # 정적 파일 (이미지, 폰트 등)
│   ├── images/
│   └── icons/
│
└── middleware.js                       # 전역 미들웨어 (인증, 로깅 등)
```

## 3. 설계 상세 및 100라인 제한 준수 전략

### 3.1. `app/` (페이지 라우팅)

*   **역할**: 주로 컴포넌트를 조합하고, 서버 컴포넌트의 경우 데이터를 페칭하여 하위 클라이언트 컴포넌트에 props로 전달하는 역할을 합니다.
*   **100라인 제한 전략**:
    *   페이지 파일 (`page.jsx`) 자체는 최소한의 로직만 포함하고, 대부분의 UI 렌더링과 클라이언트 측 상호작용은 `components/domain` 하위의 컴포넌트에 위임합니다.
    *   데이터 페칭 로직은 `lib/api/queries`의 훅을 사용하거나, 서버 컴포넌트에서 직접 `lib/services`를 호출하여 데이터를 가져옵니다. 페이지 파일 내에서 복잡한 데이터 변환 로직은 최소화합니다.

### 3.2. `components/` (UI 컴포넌트)

*   **`ui/`**:
    *   **역할**: shadcn/ui와 같은 UI 라이브러리에서 제공하는 원자적 컴포넌트들을 래핑하거나, 프로젝트 고유의 아주 작은 재사용 가능한 UI 요소를 정의합니다.
    *   **100라인 제한 전략**: 각 파일은 단일 UI 요소에 집중하며, 스타일링 및 기본적인 prop 정의만 포함합니다.
*   **`common/`**:
    *   **역할**: `Header`, `Sidebar`, `Footer` 등 애플리케이션 전반에 걸쳐 사용되는 레이아웃 및 공통 컴포넌트입니다.
    *   **100라인 제한 전략**: 복잡한 `Header`나 `Sidebar`는 `HeaderSearch`, `NotificationBell`, `SidebarNav` 등 더 작은 컴포넌트로 분리하여 조합합니다.
*   **`domain/`**:
    *   **역할**: 특정 도메인(예: `study`, `chat`)에 특화된 UI 컴포넌트입니다. 비즈니스 로직과 밀접하게 연관될 수 있습니다.
    *   **100라인 제한 전략**:
        *   UI/UX 명세에서 정의된 각 섹션(예: `StudyCreationForm`, `StudyOverviewContent`)을 하나의 컴포넌트로 보고, 이 컴포넌트가 다시 여러 개의 작은 컴포넌트(예: `StudyNameInput`, `StudyGoalCard`)를 조합하도록 합니다.
        *   클라이언트 측 상태 관리나 복잡한 이벤트 핸들링 로직은 `lib/hooks`로 추출하여 컴포넌트 파일을 가볍게 유지합니다.
        *   데이터 페칭 및 뮤테이션은 `lib/api/queries` 및 `lib/api/mutations`의 훅을 사용합니다.
*   **`modals/`**:
    *   **역할**: 애플리케이션 전반에서 사용되는 모달 컴포넌트들을 모아둡니다. `ui/dialog.jsx`를 기반으로 구현됩니다.
    *   **100라인 제한 전략**: 각 모달은 자체적인 폼 상태 관리 및 API 호출 로직을 포함할 수 있지만, 폼 내부의 개별 입력 필드나 버튼 그룹은 더 작은 컴포넌트로 분리하여 사용합니다.

### 3.3. `lib/` (로직 및 데이터)

*   **`api/`**:
    *   **역할**: React Query의 `useQuery` 및 `useMutation` 훅을 정의하여, 프론트엔드 컴포넌트가 백엔드 API와 통신할 수 있도록 합니다.
    *   **100라인 제한 전략**: 각 파일은 특정 도메인(예: `studies.js`)의 쿼리 및 뮤테이션 함수만 정의하며, 실제 API 호출 로직은 `api/index.js`의 클라이언트 인스턴스에 위임합니다.
*   **`db/`**:
    *   **역할**: Prisma Client 인스턴스를 초기화하고 내보냅니다.
    *   **100라인 제한 전략**: 단일 파일로 구성되며, Prisma Client 설정만 포함합니다.
*   **`services/`**:
    *   **역할**: 백엔드의 핵심 비즈니스 로직을 구현합니다. API Routes는 이 서비스 계층을 호출하여 실제 작업을 수행합니다.
    *   **100라인 제한 전략**: 각 파일은 특정 도메인(예: `study.js`)의 비즈니스 로직만 담당하며, 여러 CRUD 작업을 조합하거나 도메인 규칙을 적용합니다. 복잡한 로직은 내부 헬퍼 함수로 분리합니다.
*   **`utils/`**:
    *   **역할**: 범용적으로 사용되는 헬퍼 함수들을 모아둡니다.
    *   **100라인 제한 전략**: 각 파일은 특정 유틸리티 기능(예: `date.js`의 날짜 포맷팅 함수들)에 집중합니다.
*   **`hooks/`**:
    *   **역할**: 클라이언트 측에서 재사용 가능한 상태 관리 로직이나 부수 효과 로직을 캡슐화합니다.
    *   **100라인 제한 전략**: 각 훅은 단일 책임 원칙을 따르며, 복잡한 로직은 내부 헬퍼 함수나 다른 훅으로 분리합니다.
*   **`store/`**:
    *   **역할**: Zustand를 사용하여 전역 클라이언트 상태를 관리합니다.
    *   **100라인 제한 전략**: 각 파일은 특정 도메인(예: `userStore.js`)의 상태와 액션만 정의합니다.
*   **`types/`**:
    *   **역할**: 애플리케이션 전반에서 사용되는 데이터 구조를 정의합니다.
    *   **100라인 제한 전략**: 각 파일은 특정 도메인(예: `study.js`)과 관련된 데이터 구조만 포함합니다.

## 4. 백엔드 처리 전략

*   **Next.js API Routes (`app/api/`)**:
    *   HTTP 요청을 받아 `lib/services` 계층의 함수를 호출하고, 그 결과를 클라이언트에 반환하는 얇은 래퍼 역할을 합니다.
    *   인증/인가(`NextAuth.js` 연동), 요청 유효성 검사, 에러 핸들링 등은 API Route 핸들러 내에서 처리하되, 실제 비즈니스 로직은 `lib/services`로 위임하여 파일 크기를 최소화합니다.
*   **`lib/services/`**:
    *   데이터베이스(`Prisma`)와의 상호작용, 복잡한 비즈니스 규칙 적용, 외부 서비스(예: `AWS S3`, `Redis`)와의 연동 로직을 담당합니다.
    *   각 서비스 함수는 트랜잭션 관리, 데이터 유효성 검사(스키마 유효성 검사는 Prisma가 담당), 권한 확인 등을 수행할 수 있습니다.
*   **`lib/db/prisma.js`**: Prisma Client 인스턴스를 싱글톤 패턴으로 관리하여 데이터베이스 연결을 효율적으로 재사용합니다.
*   **`lib/utils/redis.js`**: Redis 클라이언트 인스턴스를 관리하고, Pub/Sub 패턴을 위한 헬퍼 함수를 제공하여 Next.js API Routes와 시그널링 서버 간의 느슨한 결합을 지원합니다.

이러한 정밀한 파일 구조 설계를 통해 MVP의 모든 화면, 모달, 컴포넌트 및 백엔드 로직을 재사용성, 확장성, 그리고 엄격한 코드 라인 제한을 준수하며 완벽하게 구현할 수 있습니다.