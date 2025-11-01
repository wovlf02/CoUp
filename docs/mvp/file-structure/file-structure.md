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
│   │   │   └── page.jsx                # 로그인 페이지 컴포넌트. SignInForm을 렌더링하고 인증 관련 로직을 처리.
│   │   ├── sign-up/                    # 회원가입 페이지 (SignUpForm 컴포넌트 조합)
│   │   │   └── page.jsx                # 회원가입 페이지 컴포넌트. SignUpForm을 렌더링하고 회원가입 로직을 처리.
│   │   └── layout.jsx                  # 인증 관련 페이지들의 공통 레이아웃. (예: 중앙 정렬, 배경 스타일)
│   ├── (main)/                         # 로그인 후 접근하는 메인 서비스 라우트 그룹
│   │   ├── layout.jsx                  # 메인 서비스의 공통 레이아웃 (Header, Sidebar 포함). AuthProvider, QueryProvider 등을 감쌈.
│   │   ├── page.jsx                    # 로그인 후 랜딩 페이지 (대시보드). DashboardContent 컴포넌트를 렌더링.
│   │   ├── studies/                    # 스터디 관련 페이지
│   │   │   ├── page.jsx                # 스터디 탐색/목록 페이지. StudyDiscoveryFilters, StudyList 컴포넌트를 렌더링.
│   │   │   ├── create/                 # 스터디 생성 페이지
│   │   │   │   └── page.jsx            # 스터디 생성 페이지 컴포넌트. StudyCreationForm을 렌더링.
│   │   │   ├── [studyId]/              # 동적 라우팅: 특정 스터디 상세 페이지
│   │   │   │   ├── layout.jsx          # 스터디 상세 페이지의 공통 레이아웃 (StudyHeader, StudyTabNavigation 포함).
│   │   │   │   ├── page.jsx            # 스터디 개요/대시보드 페이지. StudyOverviewContent 컴포넌트를 렌더링.
│   │   │   │   ├── chat/               # 스터디 채팅 페이지
│   │   │   │   │   └── page.jsx        # 채팅 페이지 컴포넌트. ChatWindow를 렌더링.
│   │   │   │   ├── notices/            # 스터디 공지사항 페이지
│   │   │   │   │   └── page.jsx        # 공지사항 페이지 컴포넌트. NoticeList를 렌더링.
│   │   │   │   ├── files/              # 스터디 파일 공유 페이지
│   │   │   │   │   └── page.jsx        # 파일 공유 페이지 컴포넌트. FileList, FileUploadArea를 렌더링.
│   │   │   │   ├── calendar/           # 스터디 캘린더 페이지
│   │   │   │   │   └── page.jsx        # 캘린더 페이지 컴포넌트. StudyCalendarView를 렌더링.
│   │   │   │   ├── settings/           # 스터디 설정/관리 페이지
│   │   │   │   │   └── page.jsx        # 설정 페이지 컴포넌트. StudySettingsContent를 렌더링.
│   │   │   │   ├── tasks/              # 스터디 할 일 페이지
│   │   │   │   │   └── page.jsx        # 할 일 페이지 컴포넌트. TaskList를 렌더링.
│   │   │   │   └── video-call/         # 스터디 화상 통화 페이지
│   │   │   │       └── page.jsx        # 화상 통화 페이지 컴포넌트. VideoCallInterface를 렌더링.
│   │   ├── me/                         # 마이페이지 (프로필 관리)
│   │   │   └── page.jsx                # 마이페이지 컴포넌트. ProfileManagementForm을 렌더링.
│   │   ├── notifications/              # 알림 목록 페이지
│   │   │   └── page.jsx                # 알림 목록 페이지 컴포넌트. NotificationList를 렌더링.
│   ├── api/                            # Next.js API Routes (백엔드 로직 - lib/services 호출)
│   │   ├── auth/                       # NextAuth.js 콜백 처리
│   │   │   └── [...nextauth]/          
│   │   │       └── route.ts            # NextAuth.js 인증 콜백을 처리하는 API 라우트.
│   │   ├── v1/                         # API 버전 관리 (예: /api/v1)
│   │   │   ├── users/                  # 사용자 관련 API
│   │   │   │   ├── route.ts            # GET /api/v1/users (사용자 목록), POST /api/v1/users (사용자 생성)
│   │   │   │   ├── [userId]/route.ts   # GET, PATCH, DELETE /api/v1/users/[userId] (특정 사용자 관리)
│   │   │   │   └── me/route.ts         # GET, PATCH /api/v1/users/me (현재 로그인 사용자 정보)
│   │   │   ├── studies/                # 스터디 그룹 관련 API
│   │   │   │   ├── route.ts            # GET /api/v1/studies (스터디 목록), POST /api/v1/studies (스터디 생성)
│   │   │   │   ├── [studyId]/          # 특정 스터디 그룹 관련 API
│   │   │   │   │   ├── route.ts        # GET, PATCH, DELETE /api/v1/studies/[studyId] (스터디 정보 관리)
│   │   │   │   │   ├── members/        # 스터디 멤버 관련 API
│   │   │   │   │   │   ├── route.ts    # GET /api/v1/studies/[studyId]/members (멤버 목록)
│   │   │   │   │   │   └── [memberId]/route.ts # PATCH, DELETE /api/v1/studies/[studyId]/members/[memberId] (멤버 역할/탈퇴)
│   │   │   │   │   ├── join/route.ts   # POST /api/v1/studies/[studyId]/join (스터디 가입 요청/처리)
│   │   │   │   │   ├── notices/        # 스터디 공지사항 API
│   │   │   │   │   │   ├── route.ts    # GET /api/v1/studies/[studyId]/notices (공지 목록), POST (공지 생성)
│   │   │   │   │   │   └── [noticeId]/route.ts # PATCH, DELETE /api/v1/studies/[studyId]/notices/[noticeId] (공지 수정/삭제)
│   │   │   │   │   ├── files/          # 스터디 파일 API
│   │   │   │   │   │   ├── route.ts    # GET /api/v1/studies/[studyId]/files (파일 목록), POST (파일 업로드)
│   │   │   │   │   │   └── [fileId]/route.ts # DELETE /api/v1/studies/[studyId]/files/[fileId] (파일 삭제)
│   │   │   │   │   ├── events/         # 스터디 캘린더 이벤트 API
│   │   │   │   │   │   ├── route.ts    # GET /api/v1/studies/[studyId]/events (이벤트 목록), POST (이벤트 생성)
│   │   │   │   │   │   └── [eventId]/route.ts # PATCH, DELETE /api/v1/studies/[studyId]/events/[eventId] (이벤트 수정/삭제)
│   │   │   │   │   └── tasks/          # 스터디 할 일 API
│   │   │   │   │       ├── route.ts    # GET /api/v1/studies/[studyId]/tasks (할 일 목록), POST (할 일 생성)
│   │   │   │   │       └── [taskId]/route.ts # PATCH, DELETE /api/v1/studies/[studyId]/tasks/[taskId] (할 일 수정/삭제)
│   │   │   │   └── internal/           # 내부 통신용 API (시그널링 서버 등에서 호출, 보안 강화)
│   │   │   │       ├── messages/route.ts # POST /api/v1/studies/internal/messages (채팅 메시지 저장)
│   │   │   │       └── users/status/route.ts # POST /api/v1/studies/internal/users/status (사용자 온라인 상태 업데이트)
│   │   │   └── notifications/          # 알림 관련 API
│   │   │       ├── route.ts            # GET /api/v1/notifications (알림 목록)
│   │   │       └── [notificationId]/read/route.ts # PATCH /api/v1/notifications/[notificationId]/read (알림 읽음 처리)
│   │   └── route.ts                    # (선택 사항) /api/v1/ 루트 API (예: API 상태 확인)
│   ├── layout.jsx                      # 최상위 루트 레이아웃 (<html>, <body> 태그 포함). 전역 스타일, 폰트 설정.
│   └── page.jsx                        # 랜딩 페이지 (로그인 전 사용자에게 보여지는 초기 페이지). 마케팅/소개 콘텐츠.
│
├── components/                         # 재사용 가능한 UI 컴포넌트
│   ├── ui/                             # 원자적(Atomic) 컴포넌트 (shadcn/ui 기반 또는 직접 구현)
│   │   ├── button.jsx                  # 버튼 컴포넌트. shadcn/ui 래핑.
│   │   ├── input.jsx                   # 입력 필드 컴포넌트. shadcn/ui 래핑.
│   │   ├── card.jsx                    # 카드 컨테이너 컴포넌트. shadcn/ui 래핑.
│   │   ├── dialog.jsx                  # 모달/다이얼로그 컴포넌트. shadcn/ui 래핑.
│   │   ├── tabs.jsx                    # 탭 네비게이션 컴포넌트. shadcn/ui 래핑.
│   │   ├── avatar.jsx                  # 아바타 (프로필 이미지) 컴포넌트. shadcn/ui 래핑.
│   │   ├── badge.jsx                   # 태그/뱃지 컴포넌트. shadcn/ui 래핑.
│   │   ├── dropdown-menu.jsx           # 드롭다운 메뉴 컴포넌트. shadcn/ui 래핑.
│   │   ├── label.jsx                   # 라벨 컴포넌트. shadcn/ui 래핑.
│   │   ├── textarea.jsx                # 텍스트 에어리어 컴포넌트. shadcn/ui 래핑.
│   │   ├── checkbox.jsx                # 체크박스 컴포넌트. shadcn/ui 래핑.
│   │   ├── switch.jsx                  # 토글 스위치 컴포넌트. shadcn/ui 래핑.
│   │   ├── calendar.jsx                # 캘린더 UI 컴포넌트 (shadcn/ui 또는 커스텀). 날짜 선택 기능.
│   │   └── ...                         # 기타 필요한 UI 프리미티브
│   ├── common/                         # 애플리케이션 전반에서 사용되는 조합(Composite) 컴포넌트
│   │   ├── Header/                     # 전역 헤더 컴포넌트
│   │   │   ├── Header.jsx              # 메인 헤더 레이아웃. HeaderSearch, NotificationBell, UserProfileDropdown 조합.
│   │   │   ├── HeaderSearch.tsx        # 헤더 내 검색 바 컴포넌트.
│   │   │   ├── NotificationBell.jsx    # 알림 아이콘 및 알림 수 표시 컴포넌트.
│   │   │   └── UserProfileDropdown.jsx # 사용자 프로필 이미지와 드롭다운 메뉴 컴포넌트.
│   │   ├── Sidebar/                    # 전역 사이드바 컴포넌트
│   │   │   ├── Sidebar.jsx             # 메인 사이드바 레이아웃. SidebarNav 조합.
│   │   │   └── SidebarNav.jsx          # 사이드바 네비게이션 링크 목록 컴포넌트.
│   │   ├── Footer/                     # 전역 푸터 컴포넌트
│   │   │   └── Footer.jsx              # 푸터 내용 (저작권, 링크 등).
│   │   ├── LayoutProvider.jsx          # Context Provider 등을 포함하는 레이아웃 관련 컴포넌트.
│   │   └── LoadingSpinner.jsx          # 로딩 스피너 컴포넌트.
│   ├── domain/                         # 특정 도메인에 종속된 컴포넌트 (비즈니스 로직 포함 가능)
│   │   ├── auth/                       # 인증 관련 컴포넌트
│   │   │   ├── SignInForm.jsx          # 로그인 폼 컴포넌트. Input, Button 등 UI 컴포넌트 조합.
│   │   │   ├── SignUpForm.jsx          # 회원가입 폼 컴포넌트. Input, Button 등 UI 컴포넌트 조합.
│   │   │   └── SocialLoginButtons.jsx  # 소셜 로그인 버튼 그룹 컴포넌트.
│   │   ├── dashboard/                  # 대시보드 관련 컴포넌트
│   │   │   ├── DashboardContent.jsx    # 대시보드 메인 콘텐츠. MyStudiesSummary, RecommendedStudies 등 조합.
│   │   │   ├── MyStudiesSummary.jsx    # 내 스터디 요약 정보 카드.
│   │   │   ├── RecommendedStudies.jsx  # 추천 스터디 목록 컴포넌트.
│   │   │   └── RecentActivityFeed.jsx  # 최근 활동 피드 컴포넌트.
│   │   ├── study/                      # 스터디 관련 컴포넌트
│   │   │   ├── StudyCard.jsx           # 스터디 목록에서 보여지는 카드 컴포넌트.
│   │   │   ├── StudyCreationForm/      # 스터디 생성 폼 컴포넌트 (세분화)
│   │   │   │   ├── StudyCreationForm.jsx       # 스터디 생성 폼 메인. 하위 입력 컴포넌트 조합.
│   │   │   │   ├── StudyNameInput.jsx          # 스터디 이름 입력 필드.
│   │   │   │   ├── StudyDescriptionInput.jsx   # 스터디 설명 입력 필드.
│   │   │   │   ├── StudyCategorySelect.jsx     # 스터디 카테고리 선택 드롭다운.
│   │   │   │   ├── StudyVisibilityToggle.jsx   # 스터디 공개/비공개 토글.
│   │   │   │   └── StudyMemberCountInput.jsx   # 스터디 최대 인원 입력 필드.
│   │   │   ├── StudyDiscoveryFilters/  # 스터디 탐색 필터 컴포넌트 (세분화)
│   │   │   │   ├── StudyDiscoveryFilters.jsx   # 필터 메인. 하위 필터 컴포넌트 조합.
│   │   │   │   ├── CategoryFilter.jsx          # 카테고리 필터.
│   │   │   │   ├── StatusFilter.jsx            # 상태 필터.
│   │   │   │   └── VisibilityFilter.jsx        # 공개 여부 필터.
│   │   │   ├── StudyList.jsx           # 스터디 목록 렌더링 컴포넌트. StudyCard 조합.
│   │   │   ├── StudyHeader/            # 스터디 상세 헤더 컴포넌트 (세분화)
│   │   │   │   ├── StudyHeader.jsx             # 스터디 상세 헤더 메인. StudyTitleSection, StudyActions 조합.
│   │   │   │   ├── StudyTitleSection.jsx       # 스터디 제목 및 기본 정보 표시.
│   │   │   │   └── StudyActions.jsx            # 스터디 가입/탈퇴/설정 등 액션 버튼 그룹.
│   │   │   ├── StudyTabNavigation.jsx  # 스터디 상세 탭 메뉴 컴포넌트. Tabs UI 컴포넌트 활용.
│   │   │   ├── StudyOverviewContent/   # 스터디 개요 탭 내용 컴포넌트 (세분화)
│   │   │   │   ├── StudyOverviewContent.jsx    # 개요 콘텐츠 메인. StudyGoalCard, StudyRulesCard 등 조합.
│   │   │   │   ├── StudyGoalCard.jsx           # 스터디 목표 표시 카드.
│   │   │   │   ├── StudyRulesCard.jsx          # 스터디 규칙 표시 카드.
│   │   │   │   └── StudyMembersPreview.jsx     # 스터디 멤버 미리보기 컴포넌트.
│   │   │   ├── StudySettingsContent/   # 스터디 설정 탭 내용 컴포넌트 (세분화)
│   │   │   │   ├── StudySettingsContent.jsx    # 설정 콘텐츠 메인. GroupInfoEditForm, MemberManagementList 등 조합.
│   │   │   │   ├── GroupInfoEditForm.jsx       # 그룹 정보 수정 폼.
│   │   │   │   ├── MemberManagementList.jsx    # 멤버 관리 목록.
│   │   │   │   ├── JoinRequestList.jsx         # 가입 요청 목록.
│   │   │   │   └── DeleteGroupSection.jsx      # 그룹 삭제 섹션.
│   │   │   └── StudyMemberItem.jsx     # 스터디 멤버 목록에서 사용되는 개별 멤버 컴포넌트.
│   │   ├── chat/                       # 채팅 관련 컴포넌트
│   │   │   ├── ChatWindow.jsx          # 채팅 창 메인. MessageList, MessageInputForm 조합.
│   │   │   ├── MessageList.jsx         # 메시지 목록 렌더링. MessageBubble 조합.
│   │   │   ├── MessageBubble.jsx       # 개별 메시지 버블 컴포넌트.
│   │   │   └── MessageInputForm.jsx    # 메시지 입력 폼 컴포넌트.
│   │   ├── notice/                     # 공지사항 관련 컴포넌트
│   │   │   ├── NoticeList.jsx          # 공지사항 목록 렌더링. NoticeItem 조합.
│   │   │   ├── NoticeItem.jsx          # 개별 공지사항 항목 컴포넌트.
│   │   │   └── NoticeEditor.jsx        # 공지사항 작성/수정 에디터 컴포넌트.
│   │   ├── file/                       # 파일 공유 관련 컴포넌트
│   │   │   ├── FileList.jsx            # 파일 목록 렌더링. FileItem 조합.
│   │   │   ├── FileItem.jsx            # 개별 파일 항목 컴포넌트.
│   │   │   └── FileUploadArea.jsx      # 파일 업로드 영역 컴포넌트.
│   │   ├── calendar/                   # 캘린더 관련 컴포넌트
│   │   │   ├── StudyCalendarView.jsx   # 스터디 캘린더 메인 뷰. CalendarControls, EventListForDate 조합.
│   │   │   ├── CalendarControls.jsx    # 캘린더 네비게이션 (월/주/일 이동, 오늘).
│   │   │   ├── EventListForDate.jsx    # 특정 날짜의 이벤트 및 할 일 목록 렌더링.
│   │   │   └── CalendarEventItem.jsx   # 캘린더에 표시되는 개별 이벤트/할 일 항목.
│   │   ├── task/                       # 할 일 관련 컴포넌트
│   │   │   ├── TaskList.jsx            # 할 일 목록 렌더링. TaskItem 조합.
│   │   │   ├── TaskItem.jsx            # 개별 할 일 항목 컴포넌트.
│   │   │   ├── TaskInput.jsx           # 새 할 일 입력 필드.
│   │   │   └── TaskFilterSort.jsx      # 할 일 필터링 및 정렬 컴포넌트 (Post-MVP).
│   │   ├── video-call/                 # 화상 스터디 관련 컴포넌트
│   │   │   ├── VideoCallInterface.jsx  # 화상 통화 메인 인터페이스. VideoGrid, ControlBar, ParticipantList 조합.
│   │   │   ├── VideoGrid.jsx           # 참가자들의 비디오 스트림을 표시하는 그리드.
│   │   │   ├── ControlBar.jsx          # 마이크/카메라 제어, 화면 공유 등 컨트롤 바.
│   │   │   └── ParticipantList.jsx     # 화상 통화 참가자 목록.
│   │   ├── my-page/                    # 마이페이지 관련 컴포넌트
│   │   │   ├── ProfileManagementForm.jsx # 프로필 관리 폼 메인. ProfileImageSection, NicknameInput 등 조합.
│   │   │   ├── ProfileImageSection.jsx # 프로필 이미지 표시 및 변경 컴포넌트.
│   │   │   ├── NicknameInput.jsx       # 닉네임 입력 필드.
│   │   │   ├── BioTextarea.jsx         # 자기소개 텍스트 에어리어.
│   │   │   └── AccountActions.jsx      # 계정 관련 액션 (탈퇴 등).
│   │   └── notification/               # 알림 관련 컴포넌트
│   │       ├── NotificationList.jsx    # 알림 목록 렌더링. NotificationItem 조합.
│   │       └── NotificationItem.jsx    # 개별 알림 항목 컴포넌트.
│   ├── modals/                         # 모달 컴포넌트 (Dialog 컴포넌트 기반)
│   │   ├── NoticeCreateEditModal.jsx   # 공지사항 생성/수정 모달. NoticeEditor 포함.
│   │   ├── EventAddEditModal.jsx       # 이벤트 추가/수정 모달. 폼 입력 필드 조합.
│   │   ├── ProfileImageChangeModal.jsx # 프로필 이미지 변경 모달. 파일 업로드 컴포넌트 포함.
│   │   ├── GeneralConfirmationModal.jsx # 일반적인 확인/취소 모달.
│   │   └── TaskDetailModal.jsx         # 할 일 상세 정보 및 수정 모달.
│   └── providers/                      # 전역 Context Provider
│       ├── QueryProvider.jsx           # React Query Provider 설정.
│       ├── AuthProvider.jsx            # NextAuth.js Session Provider 설정.
│       └── SocketProvider.jsx          # Socket.IO 클라이언트 인스턴스 및 컨텍스트 제공.
│
├── lib/                                # 라이브러리, 헬퍼 함수, 유틸리티, 데이터 접근 로직
│   ├── api/                            # API 요청 관련 함수 및 클라이언트 (React Query와 연동)
│   │   ├── index.js                    # API 클라이언트 인스턴스 (axios 또는 fetch 래퍼). 인증 토큰 처리.
│   │   ├── queries/                    # React Query 쿼리 키 및 함수 (도메인별 분리)
│   │   │   ├── auth.js                 # 인증 관련 쿼리 (예: 사용자 세션 정보).
│   │   │   ├── studies.js              # 스터디 목록, 상세 정보 쿼리.
│   │   │   ├── users.js                # 사용자 정보 쿼리.
│   │   │   ├── notifications.js        # 알림 목록 쿼리.
│   │   │   ├── notices.js              # 공지사항 목록, 상세 쿼리.
│   │   │   ├── files.js                # 파일 목록 쿼리.
│   │   │   ├── events.js               # 캘린더 이벤트 목록 쿼리.
│   │   │   └── tasks.js                # 할 일 목록 쿼리.
│   │   └── mutations/                  # React Query 뮤테이션 함수 (도메인별 분리)
│   │       ├── auth.js                 # 로그인, 회원가입 뮤테이션.
│   │       ├── studies.js              # 스터디 생성, 수정, 삭제, 가입 뮤테이션.
│   │       ├── users.js                # 사용자 프로필 수정 뮤테이션.
│   │       ├── notifications.js        # 알림 읽음 처리 뮤테이션.
│   │       ├── notices.js              # 공지사항 생성, 수정, 삭제 뮤테이션.
│   │       ├── files.js                # 파일 업로드, 삭제 뮤테이션.
│   │       ├── events.js               # 캘린더 이벤트 생성, 수정, 삭제 뮤테이션.
│   │       └── tasks.js                # 할 일 생성, 수정, 삭제 뮤테이션.
│   ├── db/                             # 데이터베이스 관련
│   │   └── prisma.js                   # Prisma Client 인스턴스 초기화 및 내보내기.
│   ├── services/                       # 비즈니스 로직을 담는 서비스 계층 (API Routes에서 호출)
│   │   ├── auth.js                     # 인증 관련 비즈니스 로직 (사용자 생성, 세션 관리).
│   │   ├── user.js                     # 사용자 정보 관리 비즈니스 로직.
│   │   ├── study.js                    # 스터디 그룹 관리 비즈니스 로직.
│   │   ├── chat.js                     # 채팅 메시지 저장 및 조회 비즈니스 로직.
│   │   ├── notice.js                   # 공지사항 관리 비즈니스 로직.
│   │   ├── file.js                     # 파일 업로드/다운로드 비즈니스 로직 (AWS S3 연동).
│   │   ├── event.js                    # 캘린더 이벤트 관리 비즈니스 로직.
│   │   ├── notification.js             # 알림 생성 및 관리 비즈니스 로직.
│   │   └── task.js                     # 할 일 관리 비즈니스 로직.
│   ├── utils/                          # 범용 유틸리티 함수
│   │   ├── apiResponse.js              # API 응답 형식 표준화 헬퍼.
│   │   ├── auth.js                     # NextAuth.js 세션 관리 및 권한 확인 헬퍼.
│   │   ├── errors.js                   # 커스텀 에러 클래스 정의.
│   │   ├── redis.js                    # Redis 클라이언트 인스턴스 및 Pub/Sub 헬퍼.
│   │   ├── date.js                     # 날짜/시간 포맷팅 및 처리 유틸리티.
│   │   ├── validation.js               # 폼 데이터 유효성 검사 헬퍼 (Zod 등).
│   │   └── constants.js                # 애플리케이션 전반에서 사용되는 상수.
│   ├── hooks/                          # 커스텀 React Hooks (재사용 가능한 로직)
│   │   ├── useAuth.js                  # 사용자 인증 상태 및 정보 접근 훅.
│   │   ├── useSocket.js                # WebSocket 연결 및 이벤트 처리 훅.
│   │   ├── useDebounce.js              # 디바운스 로직 훅.
│   │   ├── useForm.js                  # 폼 상태 관리 및 유효성 검사 훅.
│   │   └── useMediaQuery.js            # 미디어 쿼리 상태를 감지하는 훅.
│   ├── store/                          # 전역 클라이언트 상태 관리 (Zustand)
│   │   ├── userStore.js                # 사용자 정보 및 상태 관리 스토어.
│   │   └── uiStore.js                  # UI 관련 상태 (예: 사이드바 열림/닫힘, 테마) 스토어.
│   └── mocks/                          # Mock 데이터 (개발 환경 전용)
│       └── data/                       # Mock 데이터 파일 (JSON 또는 JS 객체).
│           ├── users.js
│           ├── studies.js
│           ├── notices.js
│           ├── files.js
│           ├── events.js
│           └── tasks.js
│
├── mocks/                              # Mock Service Worker (MSW) 설정 및 핸들러 (개발 환경 전용)
│   ├── index.js                        # MSW 초기화 로직 (브라우저/서버 환경 분기).
│   ├── handlers.js                     # 모든 MSW 요청 핸들러를 통합하여 내보내는 파일.
│   ├── auth.js                         # 인증 관련 Mock API 핸들러.
│   ├── users.js                        # 사용자 관련 Mock API 핸들러.
│   ├── studies.js                      # 스터디 관련 Mock API 핸들러.
│   ├── notices.js                      # 공지사항 관련 Mock API 핸들러.
│   ├── files.js                        # 파일 관련 Mock API 핸들러.
│   ├── events.js                       # 캘린더 이벤트 관련 Mock API 핸들러.
│   └── tasks.js                        # 할 일 관련 Mock API 핸들러.
│
├── styles/                             # 전역 스타일
│   └── globals.css                     # Tailwind CSS 기본 설정 및 전역 스타일.
│
├── public/                             # 정적 파일 (이미지, 폰트 등)
│   ├── images/                         # 이미지 파일.
│   └── icons/                          # 아이콘 파일.
│
└── middleware.js                       # 전역 미들웨어 (인증, 로깅 등).
```

## 3. 설계 상세 및 코드 라인 제한 준수 전략

CoUp 프로젝트의 파일 구조는 각 파일의 코드 라인 수를 100라인 이내로 유지하는 것을 목표로 설계되었습니다. 이는 코드의 가독성, 유지보수성, 그리고 단일 책임 원칙을 강화하기 위함입니다. 하지만 이 제약은 **유연하게 적용**될 수 있습니다. 즉, 코드의 응집도와 가독성을 해치지 않는 선에서 논리적으로 하나의 파일에 속하는 로직이 100라인을 약간 초과하더라도, 과도한 파일 분할로 인한 복잡성 증가보다는 유지보수 측면에서 더 나은 선택일 수 있습니다. **단, 어떤 경우에도 한 파일의 코드 라인 수는 300라인을 넘지 않도록 합니다.** 핵심은 각 파일이 명확한 하나의 책임에 집중하도록 하는 것입니다.

### 3.1. `app/` (페이지 라우팅)

*   **역할**: 주로 컴포넌트를 조합하고, 서버 컴포넌트의 경우 데이터를 페칭하여 하위 클라이언트 컴포넌트에 props로 전달하는 역할을 합니다.
*   **코드 라인 제한 전략**: 
    *   페이지 파일 (`page.jsx`) 자체는 최소한의 로직만 포함하고, 대부분의 UI 렌더링과 클라이언트 측 상호작용은 `components/domain` 하위의 컴포넌트에 위임합니다.
    *   데이터 페칭 로직은 `lib/api/queries`의 훅을 사용하거나, 서버 컴포넌트에서 직접 `lib/services`를 호출하여 데이터를 가져옵니다. 페이지 파일 내에서 복잡한 데이터 변환 로직은 최소화합니다.

### 3.2. `components/` (UI 컴포넌트)

*   **`ui/`**:
    *   **역할**: shadcn/ui와 같은 UI 라이브러리에서 제공하는 원자적 컴포넌트들을 래핑하거나, 프로젝트 고유의 아주 작은 재사용 가능한 UI 요소를 정의합니다.
    *   **코드 라인 제한 전략**: 각 파일은 단일 UI 요소에 집중하며, 스타일링 및 기본적인 prop 정의만 포함합니다.
*   **`common/`**:
    *   **역할**: `Header`, `Sidebar`, `Footer` 등 애플리케이션 전반에 걸쳐 사용되는 레이아웃 및 공통 컴포넌트입니다.
    *   **코드 라인 제한 전략**: 복잡한 `Header`나 `Sidebar`는 `HeaderSearch`, `NotificationBell`, `UserProfileDropdown` 등 더 작은 컴포넌트로 분리하여 조합합니다.
*   **`domain/`**:
    *   **역할**: 특정 도메인(예: `study`, `chat`)에 특화된 UI 컴포넌트입니다. 비즈니스 로직과 밀접하게 연관될 수 있습니다.
    *   **코드 라인 제한 전략**:
        *   UI/UX 명세에서 정의된 각 섹션(예: `StudyCreationForm`, `StudyOverviewContent`)을 하나의 컴포넌트로 보고, 이 컴포넌트가 다시 여러 개의 작은 컴포넌트(예: `StudyNameInput`, `StudyGoalCard`)를 조합하도록 합니다.
        *   클라이언트 측 상태 관리나 복잡한 이벤트 핸들링 로직은 `lib/hooks`로 추출하여 컴포넌트 파일을 가볍게 유지합니다.
        *   데이터 페칭 및 뮤테이션은 `lib/api/queries` 및 `lib/api/mutations`의 훅을 사용합니다.
*   **`modals/`**:
    *   **역할**: 애플리케이션 전반에서 사용되는 모달 컴포넌트들을 모아둡니다. `ui/dialog.jsx`를 기반으로 구현됩니다.
    *   **코드 라인 제한 전략**: 각 모달은 자체적인 폼 상태 관리 및 API 호출 로직을 포함할 수 있지만, 폼 내부의 개별 입력 필드나 버튼 그룹은 더 작은 컴포넌트로 분리하여 사용합니다.

### 3.3. `lib/` (로직 및 데이터)

*   **`api/`**:
    *   **역할**: React Query의 `useQuery` 및 `useMutation` 훅을 정의하여, 프론트엔드 컴포넌트가 백엔드 API와 통신할 수 있도록 합니다.
    *   **코드 라인 제한 전략**: 각 파일은 특정 도메인(예: `studies.js`)의 쿼리 및 뮤테이션 함수만 정의하며, 실제 API 호출 로직은 `api/index.js`의 클라이언트 인스턴스에 위임합니다.
*   **`db/`**:
    *   **역할**: Prisma Client 인스턴스를 초기화하고 내보냅니다.
    *   **코드 라인 제한 전략**: 단일 파일로 구성되며, Prisma Client 설정만 포함합니다.
*   **`services/`**:
    *   **역할**: 백엔드의 핵심 비즈니스 로직을 구현합니다. API Routes는 이 서비스 계층을 호출하여 실제 작업을 수행합니다.
    *   **코드 라인 제한 전략**: 각 파일은 특정 도메인(예: `study.js`)의 비즈니스 로직만 담당하며, 여러 CRUD 작업을 조합하거나 도메인 규칙을 적용합니다. 복잡한 로직은 내부 헬퍼 함수로 분리합니다.
*   **`utils/`**:
    *   **역할**: 범용적으로 사용되는 헬퍼 함수들을 모아둡니다.
    *   **코드 라인 제한 전략**: 각 파일은 특정 유틸리티 기능(예: `date.js`의 날짜 포맷팅 함수들)에 집중합니다.
*   **`hooks/`**:
    *   **역할**: 클라이언트 측에서 재사용 가능한 상태 관리 로직이나 부수 효과 로직을 캡슐화합니다.
    *   **코드 라인 제한 전략**: 각 훅은 단일 책임 원칙을 따르며, 복잡한 로직은 내부 헬퍼 함수나 다른 훅으로 분리합니다.
*   **`store/`**:
    *   **역할**: Zustand를 사용하여 전역 클라이언트 상태를 관리합니다.
    *   **코드 라인 제한 전략**: 각 파일은 특정 도메인(예: `userStore.js`)의 상태와 액션만 정의합니다.
*   **`mocks/`**:
    *   **역할**: 개발 환경에서 사용될 Mock 데이터를 정의합니다. 실제 API 응답과 동일한 형태를 유지합니다.
    *   **코드 라인 제한 전략**: 각 파일은 특정 도메인(예: `users.js`)의 Mock 데이터만 포함합니다.

### 3.4. `mocks/` (Mock Service Worker)

*   **역할**: Mock Service Worker (MSW)를 설정하고, 프론트엔드에서 발생하는 API 요청을 가로채 Mock 데이터로 응답합니다. 이를 통해 백엔드 개발이 완료되지 않은 상태에서도 프론트엔드 개발 및 테스트를 독립적으로 진행할 수 있습니다.
*   **코드 라인 제한 전략**: 
    *   `index.js`는 MSW 초기화 로직만 담당합니다.
    *   `handlers.js`는 모든 도메인의 핸들러를 통합하여 내보냅니다.
    *   각 도메인별 파일(예: `auth.js`, `studies.js`)은 해당 도메인의 API 요청에 대한 Mock 응답 로직만 정의합니다. 복잡한 Mock 데이터는 `lib/mocks/data/`에서 가져와 사용합니다.