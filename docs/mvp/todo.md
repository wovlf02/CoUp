# CoUp MVP 개발 Todo 리스트

CoUp 프로젝트의 MVP(Minimum Viable Product) 개발을 위한 상세 Todo 리스트입니다. 이 문서는 프로젝트의 비전, 핵심 기능 명세, UI/UX 디자인 가이드라인을 기반으로 작성되었으며, 각 항목은 개발의 효율성과 명확성을 위해 최대한 세분화되었습니다.

## 1. 프로젝트 초기 설정 및 환경 구성

### 1.1. Next.js 프로젝트 기본 설정 확인
- [x] `Coup` 디렉토리 내 Next.js 프로젝트 (`coup`)의 기본 설정 (JavaScript, ESLint, `src` 디렉토리, App Router, `@/*` import alias) 확인
- [x] `package.json` 스크립트 확인 (`dev`, `build`, `start`, `lint`)
- [x] `next.config.mjs` 기본 설정 확인

### 1.2. 환경 변수 설정 (`.env.local`)
- [x] `.env.local` 파일 생성 및 `.gitignore`에 추가 확인
- [x] 데이터베이스 연결 정보 (PostgreSQL) 환경 변수 추가
- [x] NextAuth.js 관련 환경 변수 추가 (NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET 등)
- [x] AWS S3 관련 환경 변수 추가 (파일 업로드용)
- [x] Redis 관련 환경 변수 추가

### 1.3. Prisma ORM 설정 및 PostgreSQL 연동
- [x] `prisma` 디렉토리 생성 및 `schema.prisma` 파일 초기화
- [x] `datasource` 및 `generator` 설정 (PostgreSQL, `prisma-client-js`)
- [x] `lib/db/prisma.js` 파일 생성 및 Prisma Client 인스턴스 초기화 로직 구현
- [x] 초기 데이터베이스 마이그레이션 설정

### 1.4. Redis 설정 및 연동
- [x] `lib/utils/redis.js` 파일 생성 및 Redis 클라이언트 인스턴스 초기화
- [x] Redis Pub/Sub 헬퍼 함수 구현 (채팅, 알림 등)

### 1.5. NextAuth.js 설정 (Google, GitHub Provider)
- [x] `src/app/api/auth/[...nextauth]/route.js` 파일 생성 및 NextAuth.js 핸들러 설정
- [x] Google, GitHub OAuth Provider 설정
- [x] NextAuth.js 콜백 (signIn, session, jwt) 구현 (사용자 정보 저장 및 세션 관리)

### 1.6. ESLint, Prettier 설정 확인 및 적용
- [x] `eslint.config.mjs` 파일 확인 및 프로젝트 코딩 컨벤션에 맞게 규칙 조정
- [x] Prettier 설정 파일 (`.prettierrc.json`) 생성 및 코드 포맷팅 규칙 정의
- [x] `prettier-plugin-tailwindcss` 제거 (Tailwind CSS 미사용 원칙 준수)
- [ ] Git Hooks (husky, lint-staged) 설정 (선택 사항, 코드 품질 자동화)

### 1.7. 전역 스타일 (`globals.css`) 설정
- [x] `src/app/globals.css` 파일 확인 및 기본 스타일 (색상 변수, 폰트, reset CSS) 정의
- [x] Tailwind CSS 미사용 원칙 준수 확인 (인라인 Tailwind 클래스 제거 및 CSS Modules 전환)
- [x] 파스텔 톤 색상 팔레트, 클레이모피즘/글래스모피즘 CSS 변수 정의 및 폰트 업데이트

## 2. 공통 컴포넌트 및 유틸리티 개발

### 2.1. UI 컴포넌트 (`components/ui/`)
- [x] `button.jsx`: 버튼 컴포넌트 (Primary, Secondary, Outline, Icon 등) - **스타일링 개선 완료**
- [x] `input.jsx`: 입력 필드 컴포넌트 (텍스트, 숫자, 이메일 등) - **스타일링 개선 완료**
- [x] `card.jsx`: 카드 컨테이너 컴포넌트 (그림자, 둥근 모서리 포함) - **스타일링 개선 완료**
- [x] `dialog.jsx`: 모달/다이얼로그 컴포넌트 (오버레이, 닫기 버튼 포함) - **스타일링 개선 완료**
- [x] `tabs.jsx`: 탭 네비게이션 컴포넌트 - **스타일링 개선 완료**
- [x] `avatar.jsx`: 아바타 (프로필 이미지) 컴포넌트 - **스타일링 개선 완료**
- [x] `badge.jsx`: 태그/뱃지 컴포넌트 - **스타일링 개선 완료**
- [x] `dropdown-menu.jsx`: 드롭다운 메뉴 컴포넌트 - **스타일링 개선 완료**
- [x] `label.jsx`: 라벨 컴포넌트 - **스타일링 개선 완료**
- [x] `textarea.jsx`: 텍스트 에어리어 컴포넌트 - **스타일링 개선 완료**
- [x] `checkbox.jsx`: 체크박스 컴포넌트 - **스타일링 개선 완료**
- [x] `switch.jsx`: 토글 스위치 컴포넌트 - **스타일링 개선 완료**
- [x] `calendar.jsx`: 캘린더 UI 컴포넌트 (날짜 선택 기능) - **스타일링 개선 완료**
- [x] `MarkdownEditor.jsx`: Markdown 에디터 컴포넌트 구현
- [x] 기타 필요한 UI 프리미티브 컴포넌트 구현

### 2.2. 공통 레이아웃 컴포넌트 (`components/common/`)
- [x] `Header/Header.jsx`: 전역 헤더 레이아웃 (로고, 검색, 알림, 사용자 프로필 드롭다운) - **스타일링 개선 완료**
- [x] `Header/HeaderSearch.tsx`: 헤더 내 검색 바 컴포넌트 - **스타일링 개선 완료**
- [x] `Header/NotificationBell.jsx`: 알림 아이콘 및 알림 수 표시 컴포넌트 - **스타일링 개선 완료**
- [x] `Header/UserProfileDropdown.jsx`: 사용자 프로필 이미지와 드롭다운 메뉴 컴포넌트 - **스타일링 개선 완료**
- [x] `Sidebar/Sidebar.jsx`: 전역 사이드바 레이아웃 - **스타일링 개선 완료**
- [x] `Sidebar/SidebarNav.jsx`: 사이드바 네비게이션 링크 목록 컴포넌트 - **스타일링 개선 완료**
- [x] `Footer/Footer.jsx`: 전역 푸터 컴포넌트 - **스타일링 개선 완료**
- [x] `LayoutProvider.jsx`: Context Provider 등을 포함하는 레이아웃 관련 컴포넌트
- [x] `LoadingSpinner.jsx`: 로딩 스피너 컴포넌트 - **스타일링 개선 완료**

### 2.3. 전역 Context Provider (`components/providers/`)
- [x] `QueryProvider.jsx`: React Query Provider 설정 및 클라이언트 인스턴스 제공
- [x] `AuthProvider.jsx`: NextAuth.js Session Provider 설정
- [x] `SocketProvider.jsx`: Socket.IO 클라이언트 인스턴스 및 컨텍스트 제공

### 2.4. 유틸리티 함수 (`lib/utils/`)
- [x] `apiResponse.js`: API 응답 형식 표준화 헬퍼
- [x] `auth.js`: NextAuth.js 세션 관리 및 권한 확인 헬퍼
- [x] `errors.js`: 커스텀 에러 클래스 정의
- [x] `redis.js`: Redis 클라이언트 인스턴스 및 Pub/Sub 헬퍼
- [x] `date.js`: 날짜/시간 포맷팅 및 처리 유틸리티
- [x] `validation.js`: 폼 데이터 유효성 검사 헬퍼 (Zod 등)
- [x] `constants.js`: 애플리케이션 전반에서 사용되는 상수 정의

### 2.5. 커스텀 Hooks (`lib/hooks/`)
- [x] `useAuth.js`: 사용자 인증 상태 및 정보 접근 훅
- [x] `useSocket.js`: WebSocket 연결 및 이벤트 처리 훅
- [x] `useDebounce.js`: 디바운스 로직 훅
- [x] `useForm.js`: 폼 상태 관리 및 유효성 검사 훅
- [x] `useMediaQuery.js`: 미디어 쿼리 상태를 감지하는 훅

### 2.6. API 클라이언트 및 React Query 설정 (`lib/api/`)
- [x] `index.js`: API 클라이언트 인스턴스 (axios 또는 fetch 래퍼) 및 인증 토큰 처리 로직
- [x] `queries/auth.js`: 인증 관련 쿼리 (예: 사용자 세션 정보)
- [x] `queries/studies.js`: 스터디 목록, 상세 정보 쿼리
- [x] `queries/users.js`: 사용자 정보 쿼리
- [x] `queries/notifications.js`: 알림 목록 쿼리
- [x] `queries/notices.js`: 공지사항 목록, 상세 쿼리
- [x] `queries/files.js`: 파일 목록 쿼리
- [x] `queries/events.js`: 캘린더 이벤트 목록 쿼리
- [x] `queries/tasks.js`: 할 일 목록 쿼리
- [x] `mutations/auth.js`: 로그인, 회원가입 뮤테이션
- [x] `mutations/studies.js`: 스터디 생성, 수정, 삭제, 가입 뮤테이션
- [x] `mutations/users.js`: 사용자 프로필 수정 뮤테이션
- [x] `mutations/notifications.js`: 알림 읽음 처리 뮤테이션
- [x] `mutations/notices.js`: 공지사항 생성, 수정, 삭제 뮤테이션
- [x] `mutations/files.js`: 파일 업로드, 삭제 뮤테이션
- [x] `mutations/events.js`: 캘린더 이벤트 생성, 수정, 삭제 뮤테이션
- [x] `mutations/tasks.js`: 할 일 생성, 수정, 삭제 뮤테이션

## 3. 데이터베이스 스키마 설계 및 Prisma Migration

### 3.1. `User` 테이블 (MVP 기능 명세: 01. 사용자 인증 및 프로필)
- [x] `id`, `email`, `name`, `imageUrl`, `provider`, `providerId`, `role`, `createdAt`, `updatedAt` 필드 정의

### 3.2. `StudyGroup` 테이블 (MVP 기능 명세: 02. 스터디 그룹 관리)
- [x] `id`, `ownerId`, `name`, `description`, `goal`, `category`, `rules`, `visibility`, `maxMembers`, `currentMembersCount`, `status`, `createdAt`, `updatedAt` 필드 정의

### 3.3. `StudyMember` 테이블 (MVP 기능 명세: 02. 스터디 그룹 관리)
- [x] `id`, `userId`, `studyGroupId`, `role`, `status`, `joinedAt`, `leftAt`, `joinMessage` 필드 정의

### 3.4. `Notice` 테이블 (MVP 기능 명세: 03. 스터디 활동)
- [x] `id`, `studyGroupId`, `authorId`, `title`, `content`, `createdAt`, `updatedAt` 필드 정의

### 3.5. `File` 테이블 (MVP 기능 명세: 03. 스터디 활동)
- [x] `id`, `studyGroupId`, `uploaderId`, `fileName`, `fileUrl`, `fileSize`, `fileType`, `createdAt` 필드 정의

### 3.6. `Event` 테이블 (MVP 기능 명세: 03. 스터디 활동)
- [x] `id`, `studyGroupId`, `creatorId`, `title`, `description`, `startTime`, `endTime`, `createdAt`, `updatedAt` 필드 정의

### 3.7. `Task` 테이블 (MVP 기능 명세: 03. 스터디 활동)
- [x] `id`, `studyGroupId`, `creatorId`, `assigneeId`, `title`, `description`, `dueDate`, `isCompleted`, `createdAt`, `updatedAt` 필드 정의

### 3.8. `Notification` 테이블 (MVP 기능 명세: 04. 알림)
- [x] `id`, `recipientId`, `type`, `message`, `link`, `isRead`, `createdAt` 필드 정의

### 3.9. Prisma Schema 정의 및 Migration 실행
- [x] `schema.prisma` 파일에 모든 모델 정의
- [x] `npx prisma migrate dev --name initial_migration` 명령어를 통해 초기 마이그레이션 실행

## 4. 백엔드 API 개발 (Next.js API Routes & `lib/services/`)

### 4.1. 인증 API (`api/auth/[...nextauth]/route.js`)
- [x] NextAuth.js 콜백 (signIn, session, jwt) 구현
- [x] 사용자 정보 조회 및 세션 관리 로직

### 4.2. 사용자 API (`api/v1/users/me/route.js`)
- [x] `GET /api/v1/users/me`: 현재 로그인 사용자 정보 조회
- [x] `PATCH /api/v1/users/me`: 현재 로그인 사용자 정보 수정 (닉네임, 프로필 이미지)
- [x] `DELETE /api/v1/users/me`: 회원 탈퇴

### 4.3. 스터디 그룹 API (`api/v1/studies/route.js`, `api/v1/studies/[studyId]/route.js`)
- [x] `GET /api/v1/studies`: 스터디 그룹 목록 조회 (필터링, 검색, 페이지네이션 포함)
- [x] `POST /api/v1/studies`: 스터디 그룹 생성
- [x] `GET /api/v1/studies/{studyId}`: 특정 스터디 그룹 상세 조회
- [x] `PATCH /api/v1/studies/{studyId}`: 특정 스터디 그룹 수정 (그룹장/관리자 권한)
- [x] `DELETE /api/v1/studies/{studyId}`: 특정 스터디 그룹 삭제 (그룹장 권한)

### 4.4. 스터디 멤버 API (`api/v1/studies/[studyId]/members/route.js`, `api/v1/studies/[studyId]/members/[memberId]/route.js`)
- [x] `GET /api/v1/studies/{studyId}/members`: 스터디 멤버 목록 조회
- [x] `PATCH /api/v1/studies/{studyId}/members/{memberId}`: 스터디 멤버 역할 변경 (그룹장/관리자 권한)
- [x] `DELETE /api/v1/studies/{studyId}/members/{memberId}`: 스터디 멤버 강퇴/탈퇴 (그룹장/관리자 권한)

### 4.5. 스터디 가입 API (`api/v1/studies/[studyId]/join/route.js`, `api/v1/studies/[studyId]/manage/route.js`)
- [x] `POST /api/v1/studies/{studyId}/join`: 스터디 가입 신청
- [x] `POST /api/v1/studies/{studyId}/manage`: 스터디 가입 신청 처리 (승인/거절) (그룹장/관리자 권한)

### 4.6. 공지사항 API (`api/v1/studies/[studyId]/notices/route.js`, `api/v1/studies/[studyId]/notices/[noticeId]/route.js`)
- [x] `GET /api/v1/studies/{studyId}/notices`: 공지사항 목록 조회
- [x] `POST /api/v1/studies/{studyId}/notices`: 공지사항 생성 (그룹장/관리자 권한)
- [x] `PATCH /api/v1/studies/{studyId}/notices/{noticeId}`: 공지사항 수정 (그룹장/관리자 권한)
- [x] `DELETE /api/v1/studies/{studyId}/notices/{noticeId}`: 공지사항 삭제 (그룹장/관리자 권한)

### 4.7. 파일 API (`api/v1/studies/[studyId]/files/route.js`, `api/v1/studies/[studyId]/files/[fileId]/route.js`)
- [x] `GET /api/v1/studies/{studyId}/files`: 파일 목록 조회
- [x] `POST /api/v1/studies/{studyId}/files`: 파일 업로드 (AWS S3 Presigned URL 방식 고려)
- [x] `DELETE /api/v1/studies/{studyId}/files/{fileId}`: 파일 삭제 (업로더 또는 그룹장/관리자 권한)

### 4.8. 캘린더 이벤트 API (`api/v1/studies/[studyId]/events/route.js`, `api/v1/studies/[studyId]/events/[eventId]/route.js`)
- [x] `GET /api/v1/studies/{studyId}/events`: 캘린더 이벤트 목록 조회
- [x] `POST /api/v1/studies/{studyId}/events`: 캘린더 이벤트 생성 (그룹장/관리자 권한)
- [x] `PATCH /api/v1/studies/{studyId}/events/{eventId}`: 캘린더 이벤트 수정 (그룹장/관리자 권한)
- [x] `DELETE /api/v1/studies/{studyId}/events/{eventId}`: 캘린더 이벤트 삭제 (그룹장/관리자 권한)

### 4.9. 할 일 API (`api/v1/studies/[studyId]/tasks/route.js`, `api/v1/studies/[studyId]/tasks/[taskId]/route.js`)
- [x] `GET /api/v1/studies/{studyId}/tasks`: 할 일 목록 조회 (캘린더 연동을 위해 날짜 필터링 옵션 추가 고려)
- [x] `POST /api/v1/studies/{studyId}/tasks`: 할 일 생성
- [x] `PATCH /api/v1/studies/{studyId}/tasks/{taskId}`: 할 일 수정 (완료 여부, 담당자, 마감일 등)
- [x] `DELETE /api/v1/studies/{studyId}/tasks/{taskId}`: 할 일 삭제

### 4.10. 알림 API (`api/v1/notifications/route.js`, `api/v1/notifications/[notificationId]/read/route.js`)
- [x] `GET /api/v1/notifications`: 내 알림 목록 조회
- [x] `POST /api/v1/notifications/read`: 모든 알림을 읽음 상태로 변경
- [x] `PATCH /api/v1/notifications/{notificationId}/read`: 특정 알림을 읽음 상태로 변경

### 4.11. 내부 통신 API (`api/v1/internal/messages/route.js`, `api/v1/internal/users/status/route.js`)
- [x] `POST /api/v1/internal/messages`: 채팅 메시지 저장 (시그널링 서버에서 호출)
- [x] `POST /api/v1/internal/users/status`: 사용자 온라인 상태 업데이트 (시그널링 서버에서 호출)

## 5. 프론트엔드 페이지 및 컴포넌트 개발 (`src/app/`, `src/components/domain/`)

### 5.1. 랜딩 페이지 (`app/page.jsx`)
- [x] UI/UX 명세: 01. 랜딩 페이지 기반으로 구현
- [x] 네비게이션 바, 히어로 섹션, 서비스 소개 섹션, 사용자 후기/사례 섹션, 푸터 컴포넌트 구현

### 5.2. 인증 페이지 (`app/(auth)/sign-in/page.jsx`, `app/(auth)/sign-up/page.jsx`, `app/(auth)/layout.jsx`)
- [x] UI/UX 명세: 02. 로그인/회원가입 페이지 기반으로 구현
- [x] `SignInForm.jsx`, `SignUpForm.jsx` (Post-MVP) 컴포넌트 구현
- [x] `SocialLoginButtons.jsx` 컴포넌트 구현
- [x] `(auth)/layout.jsx` 구현 (중앙 정렬, 배경 스타일) - **스타일링 개선 완료**

### 5.3. 메인 대시보드 (`app/(main)/page.jsx`, `app/(main)/layout.jsx`)
- [x] UI/UX 명세: 03. 메인 대시보드 기반으로 구현
- [x] `(main)/layout.jsx` 구현 (Header, Sidebar 포함, AuthProvider, QueryProvider 래핑)
- [x] `DashboardContent.jsx`, `MyStudiesSummary.jsx`, `RecommendedStudies.jsx`, `RecentActivityFeed.jsx` 컴포넌트 구현 - **스타일링 개선 완료**

### 5.4. 스터디 탐색/목록 페이지 (`app/(main)/studies/page.jsx`)
- [x] UI/UX 명세: 04. 스터디 탐색/목록 페이지 기반으로 구현
- [x] `StudyDiscoveryFilters.jsx`, `StudyList.jsx`, `StudyCard.jsx` 컴포넌트 구현 - **스타일링 개선 완료**

### 5.5. 스터디 생성 페이지 (`app/(main)/studies/create/page.jsx`)
- [x] UI/UX 명세: 05. 스터디 생성 페이지 기반으로 구현
- [x] `StudyCreationForm.jsx` 컴포넌트 구현 (세분화된 입력 컴포넌트 포함: `StudyNameInput.jsx`, `StudyDescriptionInput.jsx`, `StudyCategorySelect.jsx`, `StudyVisibilityToggle.jsx`, `StudyMemberCountInput.jsx`)

### 5.6. 스터디 상세 페이지 - 개요 (`app/(main)/studies/[studyId]/page.jsx`, `app/(main)/studies/[studyId]/layout.jsx`)
- [x] UI/UX 명세: 06. 스터디 상세 페이지 (Overview) 기반으로 구현
- [x] `(main)/studies/[studyId]/layout.jsx` 구현 (StudyHeader, StudyTabNavigation 포함) - **스타일링 개선 완료**
- [x] `StudyHeader.jsx`, `StudyTabNavigation.jsx` 컴포넌트 구현 - **스타일링 개선 완료**
- [x] `StudyOverviewContent.jsx` (내부 컴포넌트: `StudyGoalCard.jsx`, `StudyRulesCard.jsx`, `StudyMembersPreview.jsx`) 구현

### 5.7. 스터디 상세 페이지 - 채팅 (`app/(main)/studies/[studyId]/chat/page.jsx`)
- [x] UI/UX 명세: 07. 스터디 상세 페이지 (Chat) 기반으로 구현
- [x] `ChatWindow.jsx`, `MessageList.jsx`, `MessageBubble.jsx`, `MessageInputForm.jsx` 컴포넌트 구현 - **스타일링 개선 완료**

### 5.8. 스터디 상세 페이지 - 공지사항 (`app/(main)/studies/[studyId]/notices/page.jsx`)
- [x] UI/UX 명세: 10. 스터디 상세 페이지 (Notices) 기반으로 구현
- [x] `NoticeList.jsx`, `NoticeItem.jsx` 컴포넌트 구현

### 5.9. 스터디 상세 페이지 - 파일 공유 (`app/(main)/studies/[studyId]/files/page.jsx`)
- [x] UI/UX 명세: 11. 스터디 상세 페이지 (Files) 기반으로 구현
- [x] `FileList.jsx`, `FileItem.jsx`, `FileUploadArea.jsx` 컴포넌트 구현

### 5.10. 스터디 상세 페이지 - 캘린더 (`app/(main)/studies/[studyId]/calendar/page.jsx`)
- [x] UI/UX 명세: 12. 스터디 상세 페이지 (Calendar) 기반으로 구현
- [x] `StudyCalendarView.jsx`, `CalendarControls.jsx`, `EventListForDate.jsx`, `CalendarEventItem.jsx` 컴포넌트 구현 - **스타일링 개선 완료**

### 5.11. 스터디 상세 페이지 - 할 일 (`app/(main)/studies/[studyId]/tasks/page.jsx`)
- [x] UI/UX 명세: 18. 스터디 상세 페이지 (Tasks) 기반으로 구현
- [x] `TaskList.jsx`, `TaskItem.jsx`, `TaskInput.jsx` 컴포넌트 구현 - **스타일링 개선 완료**

### 5.12. 스터디 상세 페이지 - 화상 스터디 (`app/(main)/studies/[studyId]/video-call/page.jsx`)
- [x] UI/UX 명세: 19. 스터디 상세 페이지 (Video Call) 기반으로 구현
- [x] `VideoCallInterface.jsx`, `VideoGrid.jsx`, `ControlBar.jsx`, `ParticipantList.jsx` 컴포넌트 구현 - **스타일링 개선 완료**

### 5.13. 마이페이지 (`app/(main)/me/page.jsx`)
- [x] UI/UX 명세: 08. 마이페이지 기반으로 구현
- [x] `ProfileManagementForm.jsx` (내부 컴포넌트: `ProfileImageSection.jsx`, `NicknameInput.jsx`, `BioTextarea.jsx`, `AccountActions.jsx`) 구현 - **스타일링 개선 완료**

### 5.14. 알림 목록 페이지 (`app/(main)/notifications/page.jsx`)
- [x] UI/UX 명세: 09. 알림 목록 페이지 기반으로 구현
- [x] `NotificationList.jsx`, `NotificationItem.jsx` 컴포넌트 구현 - **스타일링 개선 완료**

## 6. 모달 컴포넌트 개발 (`src/components/modals/`)

### 6.1. 공지사항 작성/수정 모달 (`NoticeCreateEditModal.jsx`)
- [x] UI/UX 명세: 14. 공지사항 작성/수정 모달 기반으로 구현
- [x] Markdown 에디터 통합 (라이브러리 선택 및 적용) - **스타일링 개선 완료**

### 6.2. 일정 추가/수정 모달 (`EventAddEditModal.jsx`)
- [x] UI/UX 명세: 15. 일정 추가/수정 모달 기반으로 구현
- [x] 날짜/시간 선택 컴포넌트 통합 - **스타일링 개선 완료**

### 6.3. 프로필 이미지 변경 모달 (`ProfileImageChangeModal.jsx`)
- [x] UI/UX 명세: 16. 프로필 이미지 변경 모달 기반으로 구현
- [x] 이미지 업로드 기능 구현 (클라이언트 측 미리보기, S3 업로드 연동) - **스타일링 개선 완료**

### 6.4. 범용 확인 모달 (`GeneralConfirmationModal.jsx`)
- [x] UI/UX 명세: 17. 범용 확인 모달 기반으로 구현
- [x] 재사용 가능한 메시지 및 액션 버튼 설정 - **스타일링 개선 완료**

- [x] 할 일 상세 정보 및 수정 모달 (`TaskDetailModal.jsx`)
- [x] 할 일 상세 정보 표시 및 수정 폼 구현 - **스타일링 개선 완료**

## 7. 시그널링 서버 개발 (Node.js/Express.js/Socket.IO)

### 7.1. 기본 서버 설정 및 WebSocket 연결
- [ ] Node.js 프로젝트 초기화 및 Express.js 설정
- [ ] Socket.IO 서버 설정 및 클라이언트 연결 처리

### 7.2. Redis Pub/Sub 연동 (알림, 채팅 메시지)
- [ ] Redis 클라이언트 연결 및 Pub/Sub 패턴 구현
- [ ] Next.js API Routes에서 발행된 메시지 수신

### 7.3. 채팅 메시지 전송/수신 로직
- [ ] 클라이언트로부터 메시지 수신 및 Redis 발행
- [ ] Redis로부터 메시지 수신 및 해당 스터디 그룹 멤버들에게 푸시

### 7.4. 알림 푸시 로직
- [ ] Redis로부터 알림 메시지 수신
- [ ] 해당 사용자에게 실시간 알림 푸시

### 7.5. WebRTC 시그널링 로직 (화상 스터디)
- [ ] WebRTC 연결을 위한 SDP, ICE 후보 교환 로직 구현
- [ ] STUN/TURN 서버 연동 (선택 사항, Post-MVP)

## 8. 테스트

### 8.1. 단위 테스트 (Jest/React Testing Library)
- [ ] 각 컴포넌트 및 유틸리티 함수에 대한 단위 테스트 작성
- [ ] React Query 훅 및 API 클라이언트 테스트

### 8.2. 통합 테스트
- [ ] Next.js API Routes 통합 테스트
- [ ] 프론트엔드 페이지 및 컴포넌트 간 상호작용 테스트

### 8.3. E2E 테스트 (Playwright/Cypress)
- [ ] 주요 사용자 흐름 (회원가입, 로그인, 스터디 생성, 채팅 등)에 대한 E2E 테스트 작성

## 9. 배포

### 9.1. Vercel (Next.js) 배포 설정
- [ ] Vercel 프로젝트 생성 및 Next.js 애플리케이션 배포 설정
- [ ] 환경 변수 설정

### 9.2. AWS (ECS/Fargate) 배포 설정 (Signaling Server, PostgreSQL, Redis)
- [ ] AWS ECS/Fargate를 이용한 시그널링 서버 배포 설정
- [ ] AWS RDS를 이용한 PostgreSQL 데이터베이스 설정
- [ ] AWS ElastiCache를 이용한 Redis 설정
- [ ] CI/CD 파이프라인 구축 (선택 사항)