# 스터디 기능 구현 가이드

> **작성일**: 2025.11.07  
> **목적**: 스터디 기능의 체계적인 구현을 위한 가이드  
> **상태**: 구현 준비 완료

---

## 📁 파일 구조

### 현재 구조 (구현 완료)

```
coup/
├── src/
│   ├── app/
│   │   ├── my-studies/                    # 내 스터디 (가입자)
│   │   │   ├── page.jsx                   # ✅ 목록 페이지 (구현 완료)
│   │   │   ├── page.module.css
│   │   │   └── [studyId]/
│   │   │       ├── page.jsx               # ✅ 대시보드 (구현 완료)
│   │   │       ├── page.module.css
│   │   │       ├── layout.jsx
│   │   │       ├── chat/
│   │   │       │   └── page.jsx           # 🔨 채팅 (구현 예정)
│   │   │       ├── notices/
│   │   │       │   └── page.jsx           # 🔨 공지사항 (구현 예정)
│   │   │       ├── files/
│   │   │       │   └── page.jsx           # 🔨 파일 관리 (구현 예정)
│   │   │       ├── calendar/
│   │   │       │   └── page.jsx           # 🔨 캘린더 (구현 예정)
│   │   │       ├── tasks/
│   │   │       │   └── page.jsx           # 🔨 할일 관리 (구현 예정)
│   │   │       ├── video-call/
│   │   │       │   └── page.jsx           # 🔨 화상 (구현 예정)
│   │   │       └── settings/
│   │   │           └── page.jsx           # 🔨 설정 (구현 예정)
│   │   │
│   │   └── studies/                       # 스터디 탐색 (미가입자)
│   │       ├── page.jsx                   # ✅ 탐색 페이지 (구현 완료)
│   │       ├── create/
│   │       │   └── page.jsx               # 🔨 생성 (구현 예정)
│   │       └── [studyId]/
│   │           └── page.jsx               # 🔨 프리뷰 (구현 예정)
│   │
│   ├── components/
│   │   └── studies/
│   │       ├── sidebar/                   # 우측 위젯 컴포넌트
│   │       │   ├── StatsWidget.jsx        # ✅ 스터디 현황
│   │       │   ├── OnlineMembersWidget.jsx # ✅ 온라인 멤버
│   │       │   ├── QuickActionsWidget.jsx  # ✅ 빠른 액션
│   │       │   ├── PinnedNoticeWidget.jsx  # ✅ 고정 공지
│   │       │   ├── UrgentTasksWidget.jsx   # ✅ 급한 할일
│   │       │   ├── UpcomingEventsWidget.jsx # ✅ 다가오는 일정
│   │       │   ├── MyActivityWidget.jsx    # ✅ 나의 활동
│   │       │   └── Widget.module.css
│   │       │
│   │       ├── MarkdownRenderer.jsx       # 마크다운 렌더러
│   │       ├── NoticeCreateEditModal.jsx  # 공지 작성/수정 모달
│   │       ├── StudiesEmptyState.jsx      # 빈 상태
│   │       ├── StudiesSkeleton.jsx        # 로딩 스켈레톤
│   │       ├── StudyHeader.jsx            # 스터디 헤더
│   │       └── StudySidebar.jsx           # 사이드바 (레이아웃)
│   │
│   ├── mocks/
│   │   ├── studies.js                     # ✅ 스터디 mock data (생성 완료)
│   │   └── notices.js                     # 공지사항 mock data
│   │
│   └── styles/
│       └── studies/
│           ├── explore.module.css
│           └── detail.module.css
│
└── docs/
    └── screens/
        └── study/
            ├── README.md                  # 전체 문서 요약
            ├── search/                    # 스터디 탐색 (미가입자)
            │   ├── explore.md             # 탐색 화면
            │   ├── create.md              # 생성 화면
            │   ├── preview.md             # 프리뷰 화면
            │   ├── join-flow.md           # 가입 플로우
            │   └── advanced-search.md     # 고급 검색
            │
            └── my/                        # 내 스터디 (가입자)
                ├── list.md                # 목록 화면
                ├── dashboard.md           # 대시보드
                ├── chat.md                # 채팅
                ├── notices.md             # 공지사항
                ├── files.md               # 파일 관리
                ├── calendar.md            # 캘린더
                ├── tasks.md               # 할일 관리
                ├── video-call.md          # 화상 회의
                └── settings.md            # 설정
```

---

## 🎯 구현 우선순위

### Phase 1: 핵심 기능 (현재 진행 중) ✅

1. ✅ **Mock Data 생성** (`mocks/studies.js`)
   - 공개 스터디 목록
   - 내 스터디 목록
   - 스터디 대시보드 데이터
   - 카테고리 및 통계 데이터

2. ✅ **내 스터디 목록** (`/my-studies`)
   - 탭 필터링 (전체/참여중/관리중/대기중)
   - 정렬 기능
   - 역할 배지 표시
   - 빠른 액션 버튼

3. ✅ **스터디 탐색** (`/studies`)
   - 카테고리/서브카테고리 필터
   - 검색 기능
   - 정렬 옵션
   - 스터디 카드 그리드

4. ✅ **스터디 대시보드** (`/my-studies/[studyId]`)
   - 이번 주 활동 요약
   - 2x2 대시보드 그리드
   - 우측 위젯 영역
   - 탭 네비게이션

5. ✅ **우측 위젯 컴포넌트**
   - StatsWidget (스터디 현황)
   - OnlineMembersWidget (온라인 멤버)
   - QuickActionsWidget (빠른 액션)
   - PinnedNoticeWidget (고정 공지)
   - UrgentTasksWidget (급한 할일)
   - UpcomingEventsWidget (다가오는 일정)
   - MyActivityWidget (나의 활동)

### Phase 2: 상세 기능 (다음 단계) 🔨

6. **스터디 생성** (`/studies/create`)
   - 폼 입력 및 검증
   - 카테고리 선택
   - 태그 추가
   - 모집 설정

7. **스터디 프리뷰** (`/studies/[studyId]`)
   - 미가입자용 제한된 뷰
   - 가입 신청 버튼
   - 멤버 미리보기

8. **채팅** (`/my-studies/[studyId]/chat`)
   - WebSocket 실시간 채팅
   - 파일 첨부
   - 입력 중 표시
   - 읽음 상태

9. **공지사항** (`/my-studies/[studyId]/notices`)
   - 공지 CRUD
   - 고정/중요 표시
   - 댓글 시스템
   - 파일 첨부

10. **파일 관리** (`/my-studies/[studyId]/files`)
    - 드래그 앤 드롭 업로드
    - 폴더 구조
    - 파일 미리보기
    - 공유 링크

### Phase 3: 고급 기능 (추후) 📅

11. **캘린더** (`/my-studies/[studyId]/calendar`)
    - 월/주/일 뷰
    - 일정 CRUD
    - 반복 일정
    - 구글 캘린더 연동

12. **할일 관리** (`/my-studies/[studyId]/tasks`)
    - 칸반 보드
    - 드래그 앤 드롭
    - 체크리스트
    - 마감일 알림

13. **화상 회의** (`/my-studies/[studyId]/video-call`)
    - WebRTC 연동
    - 화면 공유
    - 녹화 기능

14. **설정** (`/my-studies/[studyId]/settings`)
    - 스터디 정보 수정
    - 멤버 관리
    - 권한 설정
    - 알림 설정

---

## 📊 Mock Data 사용법

### 1. 스터디 목록 가져오기

```javascript
import { publicStudies, myStudies } from '@/mocks/studies'

// 공개 스터디 목록 (탐색용)
const studies = publicStudies

// 내 스터디 목록 (가입한 스터디)
const myStudiesList = myStudies
```

### 2. 스터디 대시보드 데이터

```javascript
import { studyDashboard } from '@/mocks/studies'

// 특정 스터디의 대시보드 데이터
const dashboard = studyDashboard['study_1']

// 활동 요약
const weeklyActivity = dashboard.weeklyActivity
// { attendance, tasks, messages, notices, files }

// 최근 공지
const recentNotices = dashboard.recentNotices

// 최근 파일
const recentFiles = dashboard.recentFiles
```

### 3. 카테고리 데이터

```javascript
import { categories, popularCategories } from '@/mocks/studies'

// 메인 카테고리
const mainCategories = categories.main

// 서브 카테고리 (프로그래밍 예시)
const subCategories = categories.sub['PROGRAMMING']

// 인기 카테고리 (통계)
const popular = popularCategories
```

---

## 🎨 스타일 가이드

### 역할 배지 색상

```css
/* OWNER */
.roleOwner {
  background: #FEE2E2;
  color: #DC2626;
}

/* ADMIN */
.roleAdmin {
  background: #EDE9FE;
  color: #7C3AED;
}

/* MEMBER */
.roleMember {
  background: #F3F4F6;
  color: #6B7280;
}

/* PENDING */
.rolePending {
  background: #FEF3C7;
  color: #D97706;
}
```

### 주요 색상

```css
:root {
  --primary: #6366F1;      /* 인디고 */
  --success: #10B981;      /* 그린 */
  --warning: #F59E0B;      /* 오렌지 */
  --danger: #EF4444;       /* 레드 */
  --gray: #6B7280;         /* 중립 */
}
```

---

## 🔧 다음 구현 단계

### 1. 스터디 생성 페이지 (`/studies/create`)

**파일**: `coup/src/app/studies/create/page.jsx`

**참고 문서**: `docs/screens/study/search/create.md`

**주요 기능**:
- 폼 입력 (이름, 카테고리, 설명, 태그)
- 모집 설정 (인원, 공개 여부, 자동 승인)
- 실시간 검증
- 우측 가이드 위젯

### 2. 채팅 페이지 (`/my-studies/[studyId]/chat`)

**파일**: `coup/src/app/my-studies/[studyId]/chat/page.jsx`

**참고 문서**: `docs/screens/study/my/chat.md`

**주요 기능**:
- WebSocket 연결
- 메시지 송수신
- 파일 첨부
- 입력 중 표시
- 무한 스크롤

### 3. 공지사항 페이지 (`/my-studies/[studyId]/notices`)

**파일**: `coup/src/app/my-studies/[studyId]/notices/page.jsx`

**참고 문서**: `docs/screens/study/my/notices.md`

**주요 기능**:
- 공지 목록 (고정/일반 구분)
- 공지 작성/수정/삭제
- 댓글 시스템
- 파일 첨부

---

## 📝 개발 가이드라인

### 1. 컴포넌트 구조

```
Page Component (app/...)
  ├─ Layout (if needed)
  ├─ Header Section
  ├─ Main Content
  │   ├─ Filters/Tabs
  │   ├─ Content Grid/List
  │   └─ Actions
  └─ Sidebar Widgets (우측)
```

### 2. 상태 관리

- **로컬 상태**: `useState` 사용
- **서버 상태**: React Query 사용 (추후)
- **실시간**: WebSocket + Socket.IO (추후)

### 3. 라우팅

- **탐색 모드**: `/studies/*` (미가입자)
- **활동 모드**: `/my-studies/*` (가입자)
- **자동 리다이렉트**: 가입 상태에 따라 자동 전환

### 4. Mock Data 사용

- 현재는 모두 `mocks/studies.js`의 데이터 사용
- API 구현 시 단순히 import만 변경하면 됨

```javascript
// Before (Mock)
import { publicStudies } from '@/mocks/studies'

// After (API)
import { useQuery } from '@tanstack/react-query'
const { data: publicStudies } = useQuery(['studies'], fetchStudies)
```

---

## ✅ 현재 구현 상태

### 완료된 항목 ✅

- [x] Mock Data 생성 (`mocks/studies.js`)
- [x] 공지사항 Mock Data 생성 (`mocks/notices.js`)
- [x] 내 스터디 목록 페이지 (`/my-studies`)
- [x] 스터디 탐색 페이지 (`/studies`)
- [x] 스터디 대시보드 페이지 (`/my-studies/[studyId]`)
- [x] 스터디 생성 페이지 (`/studies/create`)
- [x] 공지사항 페이지 (`/my-studies/[studyId]/notices`)
- [x] 우측 위젯 컴포넌트 7개

### 진행 예정 🔨

- [ ] 스터디 프리뷰 페이지
- [ ] 채팅 페이지
- [ ] 파일 관리 페이지
- [ ] 캘린더 페이지
- [ ] 할일 관리 페이지
- [ ] 화상 회의 페이지
- [ ] 설정 페이지

---

## 🚀 빠른 시작

### 1. 개발 서버 실행

```bash
cd coup
npm run dev
```

### 2. 페이지 확인

- **내 스터디 목록**: http://localhost:3000/my-studies
- **스터디 탐색**: http://localhost:3000/studies
- **스터디 대시보드**: http://localhost:3000/my-studies/study_1

### 3. Mock Data 수정

`coup/src/mocks/studies.js` 파일을 수정하여 데이터 변경 가능

---

## 📚 참고 문서

- **전체 설계**: `docs/screens/study/README.md`
- **탐색 화면**: `docs/screens/study/search/*.md`
- **내 스터디**: `docs/screens/study/my/*.md`

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025.11.07  
**버전**: 1.0
