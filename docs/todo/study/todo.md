# 스터디 기능 구현 TODO 리스트

> **목적**: docs/screens/study의 설계 문서 기반으로 스터디 기능을 순차적으로 구현  
> **작성일**: 2025.11.08  
> **구현 방식**: 바이브 코딩 - 문서 기반 단계별 구현

---

## 📋 전체 구현 원칙

### 1. 문서 기반 개발
- **모든 구현은 docs/screens/study 내 문서를 기반으로 진행**
- 각 화면별 markdown 문서를 참고하여 정확히 구현
- 문서에 명시된 레이아웃, 스타일, 기능을 그대로 반영

### 2. 코드 스타일
- **인라인 스타일 절대 금지** - 모든 스타일은 별도 CSS 파일로 분리
- CSS Module 사용 (`*.module.css`)
- BEM 네이밍 규칙 권장

### 3. Mock Data 관리
- 기존 `src/mocks/studies.js` 삭제
- **새로운 `src/mocks/study.js` 생성** - 단수형 사용
- 모든 스터디 관련 mock data는 `study.js`에서 관리
- 구현 시 `study.js`의 데이터를 import하여 사용

### 4. 파일 구조
```
coup/src/
├── app/
│   ├── studies/              # 스터디 탐색 (미가입자)
│   │   ├── page.jsx          # 스터디 목록 (explore)
│   │   ├── page.module.css
│   │   ├── create/           # 스터디 생성
│   │   │   ├── page.jsx
│   │   │   └── page.module.css
│   │   └── [studyId]/        # 스터디 프리뷰 (미가입자)
│   │       ├── page.jsx
│   │       ├── page.module.css
│   │       └── join/         # 가입 플로우
│   │           ├── page.jsx
│   │           └── page.module.css
│   └── my-studies/           # 내 스터디 (가입자)
│       ├── page.jsx          # 내 스터디 목록
│       ├── page.module.css
│       └── [studyId]/        # 스터디 대시보드
│           ├── page.jsx      # 개요
│           ├── page.module.css
│           ├── chat/         # 채팅
│           │   ├── page.jsx
│           │   └── page.module.css
│           ├── notices/      # 공지사항
│           ├── files/        # 파일
│           ├── calendar/     # 캘린더
│           ├── tasks/        # 할일
│           ├── video-call/   # 화상
│           ├── settings/     # 설정 (관리자만)
│           ├── members/      # 멤버 관리
│           └── analytics/    # 통계 (관리자만)
├── components/
│   └── studies/              # 스터디 관련 컴포넌트
│       ├── StudyCard.jsx
│       ├── StudyCard.module.css
│       ├── StudyHeader.jsx
│       ├── StudyHeader.module.css
│       ├── StudySidebar.jsx  # 우측 위젯
│       ├── StudySidebar.module.css
│       ├── ChatMessage.jsx
│       ├── ChatMessage.module.css
│       └── ...
└── mocks/
    └── study.js              # 스터디 관련 모든 mock data
```

---

## 🎯 Phase 0: 사전 준비 (필수)

### [ ] 0-1. 기존 코드 정리
- [ ] `coup/src/mocks/studies.js` 삭제
- [ ] `coup/src/components/studies/` 폴더의 기존 컴포넌트 백업 (필요시)
- [ ] `coup/src/app/my-studies/` 기존 페이지 백업
- [ ] `coup/src/app/studies/` 기존 페이지 백업

**작업 내용**:
```bash
# 백업 폴더 생성 (PowerShell)
New-Item -ItemType Directory -Force -Path "coup\src\_backup\$(Get-Date -Format 'yyyyMMdd')"

# 기존 파일 백업
Copy-Item -Recurse "coup\src\components\studies" "coup\src\_backup\$(Get-Date -Format 'yyyyMMdd')\"
Copy-Item -Recurse "coup\src\app\my-studies" "coup\src\_backup\$(Get-Date -Format 'yyyyMMdd')\"
Copy-Item -Recurse "coup\src\app\studies" "coup\src\_backup\$(Get-Date -Format 'yyyyMMdd')\"

# 기존 파일 삭제
Remove-Item "coup\src\mocks\studies.js" -ErrorAction SilentlyContinue
```

### [ ] 0-2. Mock Data 파일 생성
**파일**: `coup/src/mocks/study.js`

**참고 문서**: 모든 설계 문서의 데이터 예시

**내용**:
```javascript
// Mock data for study features
// Based on docs/screens/study design documents

export const categories = [
  { id: 1, name: '프로그래밍', emoji: '💻', subCategories: ['웹개발', '앱개발', '알고리즘', 'AI/ML'] },
  { id: 2, name: '취업준비', emoji: '📝', subCategories: ['면접', '자소서', '포트폴리오'] },
  { id: 3, name: '어학', emoji: '🌍', subCategories: ['영어', '일본어', '중국어'] },
  { id: 4, name: '자격증', emoji: '📜', subCategories: ['IT', '금융', '공무원'] },
  { id: 5, name: '운동', emoji: '💪', subCategories: ['러닝', '헬스', '요가'] },
  { id: 6, name: '독서', emoji: '📚', subCategories: ['소설', '자기계발', '전문서적'] },
]

export const studyGroups = [
  {
    id: 1,
    name: '알고리즘 마스터 스터디',
    emoji: '💻',
    description: '매일 아침 알고리즘 문제를 풀고 서로의 풀이를 공유하며 성장하는 스터디입니다.',
    category: '프로그래밍',
    subCategory: '알고리즘',
    tags: ['알고리즘', '코딩테스트', '매일', '백준'],
    ownerId: 1,
    ownerName: '김철수',
    currentMembers: 12,
    maxMembers: 20,
    visibility: 'PUBLIC',
    autoApprove: true,
    activityFrequency: '매일',
    rating: 4.8,
    ratingCount: 24,
    createdAt: '2024-10-01',
    lastActivityAt: '2024-11-06T10:35:00',
    isActive: true,
    unreadMessages: 5,
    unreadNotices: 1,
  },
  {
    id: 2,
    name: '취업 준비 스터디',
    emoji: '📝',
    description: '함께 이력서와 면접을 준비하는 스터디입니다.',
    category: '취업준비',
    subCategory: '면접',
    tags: ['취업', '면접', '자소서', '포트폴리오'],
    ownerId: 2,
    ownerName: '이영희',
    currentMembers: 8,
    maxMembers: 15,
    visibility: 'PUBLIC',
    autoApprove: false,
    activityFrequency: '주 3-4회',
    rating: 4.5,
    ratingCount: 16,
    createdAt: '2024-09-15',
    lastActivityAt: '2024-11-06T07:20:00',
    isActive: true,
    unreadMessages: 2,
    unreadNotices: 0,
  },
  {
    id: 3,
    name: '영어 회화 스터디',
    emoji: '🌍',
    description: '주 3회 화상으로 영어 회화 연습을 하는 스터디입니다.',
    category: '어학',
    subCategory: '영어',
    tags: ['영어', '회화', '화상', '원어민'],
    ownerId: 3,
    ownerName: '박민수',
    currentMembers: 10,
    maxMembers: 15,
    visibility: 'PUBLIC',
    autoApprove: true,
    activityFrequency: '주 3-4회',
    rating: 4.7,
    ratingCount: 18,
    createdAt: '2024-08-20',
    lastActivityAt: '2024-11-05T19:00:00',
    isActive: true,
    unreadMessages: 0,
    unreadNotices: 0,
  },
]

export const myStudies = [
  {
    ...studyGroups[0],
    myRole: 'OWNER',
    joinedAt: '2024-10-01',
  },
  {
    ...studyGroups[1],
    myRole: 'MEMBER',
    joinedAt: '2024-10-15',
  },
  {
    ...studyGroups[2],
    myRole: 'ADMIN',
    joinedAt: '2024-09-01',
  },
]

export const studyMembers = {
  1: [ // studyId: 1
    { id: 1, name: '김철수', role: 'OWNER', imageUrl: '/avatars/1.png', isOnline: true, bio: '백엔드 개발자', lastActivityAt: '2024-11-06T10:35:00' },
    { id: 2, name: '이영희', role: 'ADMIN', imageUrl: '/avatars/2.png', isOnline: true, bio: '프론트엔드 개발자', lastActivityAt: '2024-11-06T10:30:00' },
    { id: 3, name: '박민수', role: 'MEMBER', imageUrl: '/avatars/3.png', isOnline: true, bio: '학생', lastActivityAt: '2024-11-06T10:25:00' },
    { id: 4, name: '최지은', role: 'MEMBER', imageUrl: '/avatars/4.png', isOnline: false, bio: '디자이너', lastActivityAt: '2024-11-06T08:00:00' },
    { id: 5, name: '정소현', role: 'MEMBER', imageUrl: '/avatars/5.png', isOnline: false, bio: 'PM', lastActivityAt: '2024-11-05T22:00:00' },
    // ... 총 12명
  ],
  2: [ // studyId: 2
    { id: 2, name: '이영희', role: 'OWNER', imageUrl: '/avatars/2.png', isOnline: true, bio: '프론트엔드 개발자' },
    // ... 총 8명
  ],
}

export const notices = {
  1: [ // studyId: 1
    {
      id: 1,
      title: '이번 주 일정 안내',
      content: '이번 주는 백준 골드 문제로 진행합니다. 월요일 오전 9시까지 풀이를 제출해주세요. 목요일 저녁 8시에 코드 리뷰를 진행하겠습니다.',
      authorId: 1,
      authorName: '김철수',
      createdAt: '2024-11-06T08:30:00',
      isPinned: true,
      attachmentCount: 0,
      viewCount: 12,
    },
    {
      id: 2,
      title: '참고 자료 공유',
      content: '알고리즘 학습에 도움되는 자료를 공유합니다. 첨부파일을 확인해주세요.',
      authorId: 2,
      authorName: '이영희',
      createdAt: '2024-11-05T14:20:00',
      isPinned: false,
      attachmentCount: 2,
      viewCount: 10,
    },
    {
      id: 3,
      title: '스터디 규칙 안내',
      content: '스터디 규칙을 다시 한번 공유드립니다. 모두 숙지 부탁드립니다.',
      authorId: 1,
      authorName: '김철수',
      createdAt: '2024-11-03T10:00:00',
      isPinned: false,
      attachmentCount: 0,
      viewCount: 15,
    },
  ],
}

export const chatMessages = {
  1: [ // studyId: 1
    {
      id: 1,
      type: 'text',
      content: '오늘 문제 풀었어요?',
      authorId: 1,
      authorName: '김철수',
      authorImage: '/avatars/1.png',
      createdAt: '2024-11-06T10:30:00',
      isRead: true,
      readers: [1, 2, 3],
    },
    {
      id: 2,
      type: 'text',
      content: '네, 3문제 완료했습니다',
      authorId: 2,
      authorName: '이영희',
      authorImage: '/avatars/2.png',
      createdAt: '2024-11-06T10:31:00',
      isRead: true,
      readers: [1, 2],
    },
    {
      id: 3,
      type: 'text',
      content: '저도 2문제 풀었어요!',
      authorId: 3,
      authorName: '박민수',
      authorImage: '/avatars/3.png',
      createdAt: '2024-11-06T10:32:00',
      isRead: false,
      readers: [1, 2, 3],
    },
    {
      id: 4,
      type: 'file',
      content: '풀이를 공유합니다',
      authorId: 2,
      authorName: '이영희',
      authorImage: '/avatars/2.png',
      createdAt: '2024-11-06T10:32:30',
      isRead: false,
      readers: [2],
      file: {
        name: '풀이.pdf',
        size: '1.2MB',
        sizeBytes: 1258291,
        url: '/files/solution.pdf',
        type: 'application/pdf',
      },
    },
    {
      id: 5,
      type: 'text',
      content: '좋아요! 파일 확인했습니다 👍',
      authorId: 1,
      authorName: '김철수',
      authorImage: '/avatars/1.png',
      createdAt: '2024-11-06T10:35:00',
      isRead: false,
      readers: [1],
    },
  ],
}

export const files = {
  1: [ // studyId: 1
    {
      id: 1,
      name: '알고리즘_문제집.pdf',
      size: '2.5MB',
      sizeBytes: 2621440,
      uploaderId: 1,
      uploaderName: '김철수',
      uploadedAt: '2024-11-06T08:00:00',
      downloadUrl: '/files/1.pdf',
      type: 'application/pdf',
      downloadCount: 8,
    },
    {
      id: 2,
      name: '면접_준비_자료.xlsx',
      size: '1.2MB',
      sizeBytes: 1258291,
      uploaderId: 2,
      uploaderName: '이영희',
      uploadedAt: '2024-11-06T03:00:00',
      downloadUrl: '/files/2.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      downloadCount: 5,
    },
    {
      id: 3,
      name: '코드_리뷰_자료.zip',
      size: '3.1MB',
      sizeBytes: 3250585,
      uploaderId: 3,
      uploaderName: '박민수',
      uploadedAt: '2024-11-05T20:00:00',
      downloadUrl: '/files/3.zip',
      type: 'application/zip',
      downloadCount: 12,
    },
  ],
}

export const tasks = {
  1: [ // studyId: 1
    {
      id: 1,
      title: '백준 1234번 풀이',
      description: '백준 1234번 문제를 풀고 풀이를 공유해주세요',
      dueDate: '2024-11-07',
      status: 'TODO', // TODO, IN_PROGRESS, DONE
      assigneeId: null, // null이면 모두에게
      createdById: 1,
      createdByName: '김철수',
      createdAt: '2024-11-05T09:00:00',
      completedCount: 5,
      totalCount: 12,
    },
    {
      id: 2,
      title: '코드 리뷰 준비',
      description: '목요일 코드 리뷰를 위해 풀이를 정리해주세요',
      dueDate: '2024-11-08',
      status: 'TODO',
      assigneeId: null,
      createdById: 1,
      createdByName: '김철수',
      createdAt: '2024-11-05T09:00:00',
      completedCount: 3,
      totalCount: 12,
    },
    {
      id: 3,
      title: '자소서 1차 작성',
      description: '자소서 1차 초안을 작성해주세요',
      dueDate: '2024-11-09',
      status: 'IN_PROGRESS',
      assigneeId: null,
      createdById: 2,
      createdByName: '이영희',
      createdAt: '2024-11-04T10:00:00',
      completedCount: 7,
      totalCount: 8,
    },
  ],
}

export const events = {
  1: [ // studyId: 1
    {
      id: 1,
      title: '주간 회의',
      description: '이번 주 진행 상황 공유',
      startDate: '2024-11-07T14:00:00',
      endDate: '2024-11-07T15:00:00',
      location: 'Zoom',
      locationUrl: 'https://zoom.us/j/123456789',
      createdById: 1,
      createdByName: '김철수',
      attendeeCount: 12,
      isOnline: true,
    },
    {
      id: 2,
      title: '과제 제출 마감',
      description: '이번 주 과제 제출 마감일입니다',
      startDate: '2024-11-10T23:59:00',
      endDate: '2024-11-10T23:59:00',
      location: null,
      locationUrl: null,
      createdById: 1,
      createdByName: '김철수',
      attendeeCount: null,
      isOnline: false,
    },
    {
      id: 3,
      title: '모의 코딩테스트',
      description: '실전처럼 모의 코딩테스트를 진행합니다',
      startDate: '2024-11-13T20:00:00',
      endDate: '2024-11-13T22:00:00',
      location: 'Google Meet',
      locationUrl: 'https://meet.google.com/abc-defg-hij',
      createdById: 1,
      createdByName: '김철수',
      attendeeCount: 10,
      isOnline: true,
    },
  ],
}

export const studyRules = {
  1: [
    '매일 오전 9시까지 문제 풀이 제출',
    '주 1회 코드 리뷰 참여 필수',
    '결석 시 사전 공지',
    '서로 존중하는 태도',
    '학습 자료 적극 공유',
  ],
  2: [
    '주 3회 모의 면접 참여',
    '자소서 피드백 적극적으로 주고받기',
    '취업 정보 공유',
    '서로 응원하기',
  ],
}

// 활동 통계 (주간)
export const activityStats = {
  1: {
    attendance: { current: 10, total: 12, percentage: 85 },
    tasks: { completed: 12, total: 20, percentage: 60 },
    messages: 127,
    notices: 3,
    files: 5,
  },
}
```

---

## 🚀 Phase 1: 스터디 탐색 (Search) - 미가입자용

### [ ] 1-1. 스터디 탐색 (Explore)
**라우트**: `/studies`  
**참고 문서**: `docs/screens/study/search/explore.md`  
**우선순위**: 필수

#### 구현 항목
- [ ] **페이지 파일 생성**
  - `coup/src/app/studies/page.jsx`
  - `coup/src/app/studies/page.module.css`

- [ ] **컴포넌트 생성**
  - `coup/src/components/studies/StudyCard.jsx` (스터디 카드)
  - `coup/src/components/studies/StudyCard.module.css`
  - `coup/src/components/studies/SearchFilters.jsx` (검색/필터)
  - `coup/src/components/studies/SearchFilters.module.css`
  - `coup/src/components/studies/ExploreWidgets.jsx` (우측 위젯)
  - `coup/src/components/studies/ExploreWidgets.module.css`

- [ ] **기능 구현**
  - 3컬럼 레이아웃 (Nav 12% + Content 58% + Widget 30%)
  - 카테고리 필터 (메인 + 서브)
  - 정렬 옵션 (최신순, 인기순, 이름순)
  - 검색 기능 (키워드 + 디바운스)
  - 스터디 카드 그리드 (3컬럼)
  - 페이지네이션
  - 우측 위젯 (인기 카테고리, 추천 스터디, 플랫폼 통계)
  - 로딩 스켈레톤
  - 빈 상태 처리

- [ ] **Mock Data 사용**
  ```javascript
  import { studyGroups, categories } from '@/mocks/study'
  ```

- [ ] **스타일 가이드**
  - 문서의 CSS 예시 코드 정확히 적용
  - 호버 애니메이션 (transform, shadow)
  - 카드 높이 고정 (320px)
  - 반응형 그리드 (3→2→1 컬럼)

---

### [ ] 1-2. 스터디 생성 (Create)
**라우트**: `/studies/create`  
**참고 문서**: `docs/screens/study/search/create.md`  
**우선순위**: 필수

#### 구현 항목
- [ ] **페이지 파일 생성**
  - `coup/src/app/studies/create/page.jsx`
  - `coup/src/app/studies/create/page.module.css`

- [ ] **컴포넌트 생성**
  - `coup/src/components/studies/CreateForm.jsx`
  - `coup/src/components/studies/CreateForm.module.css`
  - `coup/src/components/studies/CreateGuide.jsx` (우측 가이드)
  - `coup/src/components/studies/CreateGuide.module.css`

- [ ] **기능 구현**
  - 2단계 폼 (기본 정보 + 모집 설정)
  - 실시간 검증 (이름, 설명 글자 수)
  - 카테고리 선택 (메인 → 서브 동적)
  - 태그 추가/삭제 (최대 5개)
  - 모집 인원 증감 버튼
  - 공개 설정 Radio
  - 자동 승인 Checkbox
  - 제출 처리 (로딩, 성공 Toast)
  - 작성 중 이탈 방지 (confirm)
  - 우측 가이드 위젯

---

### [ ] 1-3. 스터디 프리뷰 (Preview - 미가입자용)
**라우트**: `/studies/[studyId]`  
**참고 문서**: `docs/screens/study/search/preview.md`  
**우선순위**: 필수

#### 구현 항목
- [ ] **페이지 파일 생성**
  - `coup/src/app/studies/[studyId]/page.jsx`
  - `coup/src/app/studies/[studyId]/page.module.css`

- [ ] **컴포넌트 생성**
  - `coup/src/components/studies/PreviewHeader.jsx` (헤더 카드)
  - `coup/src/components/studies/PreviewHeader.module.css`
  - `coup/src/components/studies/PreviewNotices.jsx` (제한된 공지)
  - `coup/src/components/studies/PreviewNotices.module.css`
  - `coup/src/components/studies/PreviewWidgets.jsx` (우측 정보)
  - `coup/src/components/studies/PreviewWidgets.module.css`

- [ ] **기능 구현**
  - 스터디 정보 전체 표시
  - 공지 2개만 미리보기 (100자 제한 + 잠금 아이콘)
  - 멤버 5명만 표시 (이름 + 역할)
  - 큰 [가입하기] 버튼 (2곳: 상단 + 하단)
  - 가입 후 자동 리다이렉트 (`/my-studies/[studyId]`)
  - 우측 위젯 (스터디 정보, 그룹장, 유사 스터디, 가입 혜택)

---

### [ ] 1-4. 스터디 가입 플로우 (Join Flow)
**라우트**: `/studies/[studyId]/join`  
**참고 문서**: `docs/screens/study/search/join-flow.md`  
**우선순위**: Phase 2 (UX 향상)

#### 구현 항목
- [ ] **페이지 파일 생성**
  - `coup/src/app/studies/[studyId]/join/page.jsx`
  - `coup/src/app/studies/[studyId]/join/page.module.css`

- [ ] **컴포넌트 생성**
  - `coup/src/components/studies/JoinStep1.jsx` (규칙 확인)
  - `coup/src/components/studies/JoinStep2.jsx` (자기소개)
  - `coup/src/components/studies/JoinStep3.jsx` (알림 설정)
  - `coup/src/components/studies/WelcomeModal.jsx` (환영 모달)
  - `coup/src/components/studies/PendingModal.jsx` (대기 모달)

- [ ] **기능 구현**
  - 멀티 스텝 폼 (3단계)
  - 자동/수동 승인 분기 처리
  - 환영 모달 / 대기 모달

---

### [ ] 1-5. 고급 검색 (Advanced Search)
**라우트**: `/studies/search`  
**참고 문서**: `docs/screens/study/search/advanced-search.md`  
**우선순위**: Phase 2 (UX 향상)

---

## 👥 Phase 2: 내 스터디 (My Studies) - 가입자용

### [ ] 2-1. 내 스터디 목록 (My Studies List)
**라우트**: `/my-studies`  
**참고 문서**: `docs/screens/study/my/list.md`  
**우선순위**: 필수

#### 구현 항목
- [ ] **페이지 파일 생성**
  - `coup/src/app/my-studies/page.jsx`
  - `coup/src/app/my-studies/page.module.css`

- [ ] **컴포넌트 생성**
  - `coup/src/components/studies/MyStudyCard.jsx`
  - `coup/src/components/studies/MyStudyCard.module.css`
  - `coup/src/components/studies/MyStudyTabs.jsx`
  - `coup/src/components/studies/MyActivityWidgets.jsx`

- [ ] **기능 구현**
  - 탭 필터 (전체, 참여중, 관리중, 대기중)
  - 역할 배지 (OWNER/ADMIN/MEMBER/PENDING)
  - 빠른 액션 버튼
  - 우측 위젯 (나의 활동, 급한 할일, 다가오는 일정)

---

### [ ] 2-2. 스터디 대시보드 (Dashboard)
**라우트**: `/my-studies/[studyId]`  
**참고 문서**: `docs/screens/study/my/dashboard.md`  
**우선순위**: 필수

#### 구현 항목
- [ ] **페이지 파일 생성**
  - `coup/src/app/my-studies/[studyId]/page.jsx`
  - `coup/src/app/my-studies/[studyId]/page.module.css`

- [ ] **컴포넌트 생성**
  - `coup/src/components/studies/StudyHeader.jsx`
  - `coup/src/components/studies/StudyTabs.jsx`
  - `coup/src/components/studies/ActivitySummary.jsx`
  - `coup/src/components/studies/DashboardGrid.jsx`
  - `coup/src/components/studies/StudySidebar.jsx` (우측 위젯 - 전역)

- [ ] **기능 구현**
  - 8개 탭 네비게이션
  - 이번 주 활동 요약
  - 2x2 대시보드 그리드
  - 우측 위젯 (모든 탭에 표시)

---

### [ ] 2-3. 스터디 채팅 (Chat)
**라우트**: `/my-studies/[studyId]/chat`  
**참고 문서**: `docs/screens/study/my/chat.md`  
**우선순위**: 필수

#### 구현 항목
- [ ] **페이지 파일 생성**
  - `coup/src/app/my-studies/[studyId]/chat/page.jsx`
  - `coup/src/app/my-studies/[studyId]/chat/page.module.css`

- [ ] **컴포넌트 생성**
  - `coup/src/components/studies/ChatMessage.jsx`
  - `coup/src/components/studies/ChatMessage.module.css`
  - `coup/src/components/studies/ChatInput.jsx`
  - `coup/src/components/studies/TypingIndicator.jsx`

- [ ] **기능 구현**
  - 메시지 영역 (독립 스크롤)
  - 메시지 타입별 UI
  - 입력 영역 (하단 고정)
  - 파일 첨부
  - 입력 중 표시 (Mock)
  - 무한 스크롤

---

### [ ] 2-4 ~ 2-13. 추가 탭들
- [ ] 공지사항 (Notices)
- [ ] 파일 관리 (Files)
- [ ] 캘린더 (Calendar)
- [ ] 할일 관리 (Tasks)
- [ ] 화상 스터디 (Video Call)
- [ ] 스터디 설정 (Settings)
- [ ] 가입 승인 관리 (Approvals)
- [ ] 멤버 프로필 (Member Profile)
- [ ] 신규 멤버 온보딩 (Onboarding)
- [ ] 스터디 분석 (Analytics)

---

## 📋 Phase 3: 네비게이션 탭 기능 (Tasks, Notifications, My Page)

### [ ] 4-1. 레이아웃 컴포넌트
**라우트**: `/tasks`  
**참고 문서**: `docs/screens/tasks/main.md`  
**우선순위**: 필수
### [ ] 4-2. 공통 컴포넌트
#### 구현 항목
- [ ] **페이지 파일 생성**
  - `coup/src/app/tasks/page.jsx`
  - `coup/src/app/tasks/page.module.css`

- [ ] **컴포넌트 생성**
  - `coup/src/components/tasks/TaskCard.jsx`
- [ ] `ConfirmDialog.jsx`
- [ ] `ImageCropper.jsx`
  - `coup/src/components/tasks/TaskCard.module.css`
### [ ] 4-3. 유틸리티 함수
- [ ] `utils/date.js` (상대 시간 변환)
- [ ] `utils/file.js` (파일 크기, 타입 검증)
- [ ] `utils/string.js` (텍스트 축약, 이니셜)
- [ ] `utils/validation.js` (폼 검증)
  - `coup/src/components/tasks/TaskWidgets.module.css`

- [ ] **기능 구현**
## ⚡ Phase 5: 최적화 & 테스트
  - 할 일 그룹화 (긴급/이번주/나중에)
- [ ] 이미지 최적화 (lazy loading)
- [ ] 코드 스플리팅 (동적 import)
- [ ] 가상 스크롤 (할 일 50개 이상)
- [ ] 메모이제이션 (필터링, 정렬)
  - 할 일 상세 모달 (상세정보, 댓글, 첨부파일)
### [ ] 5-2. SEO 최적화
  - 빈 상태 처리 (3가지)

- [ ] Open Graph
- [ ] **Mock Data**
### [ ] 5-3. 접근성 (a11y)
  - 할 일 목록, 댓글, 첨부파일, 통계

- [ ] 스크린 리더 지원
---
### [ ] 5-4. 반응형 테스트
### [ ] 3-2. 알림 (Notifications)
**라우트**: `/notifications`  
**참고 문서**: `docs/screens/notifications/main.md`  
**우선순위**: 필수
### 1주차: 기본 구조 및 공통 (Phase 0 + Phase 4)
1. **Phase 0**: 기존 코드 정리 및 백업
2. **Mock Data 생성**: `study.js`, `task.js`, `notification.js`, `user.js`
3. **공통 컴포넌트**: Button, Modal, Toast, Loading 등
4. **레이아웃 컴포넌트**: MainLayout, Header, Sidebar
5. **유틸리티 함수**: date, file, string, validation

### 2주차: 스터디 탐색 (Phase 1 - 미가입자)
1. 스터디 탐색 (Explore)
2. 스터디 생성 (Create)
3. 스터디 프리뷰 (Preview)
4. 가입 플로우 (Join Flow) - 선택
  - `coup/src/app/notifications/page.module.css`
### 3주차: 내 스터디 (Phase 2 - 가입자 기본)
- [ ] **컴포넌트 생성**
  - `coup/src/components/notifications/NotificationCard.jsx`
  - `coup/src/components/notifications/NotificationCard.module.css`
  - `coup/src/components/notifications/NotificationFilters.jsx`
### 4주차: 네비게이션 탭 (Phase 3)
1. 할 일 (Tasks)
2. 알림 (Notifications)
3. 마이페이지 (My Page)

### 5주차 이후: 추가 스터디 기능 (Phase 2 나머지)
1. 공지사항, 파일, 캘린더
2. 스터디 내 할일
3. 화상 스터디
4. 스터디 설정 및 관리

### 6주차 이후: 최적화 및 테스트 (Phase 5)

- [ ] **기능 구현**
  - 2컬럼 레이아웃 (Nav + Content)
  - 알림 유형별 색상 배지 (9가지)
  - 읽음/읽지않음 필터
  - 알림 클릭 → 읽음 처리 + 페이지 이동
  - [모두 읽음] 버튼
  - 페이지네이션 (20개씩)
  - 빈 상태 처리 (2가지)
  - 실시간 알림 수신 (WebSocket - Mock)
## 📊 진행 상황 추적

### 전체 진행률
- [ ] Phase 0: 사전 준비 (0%)
- [ ] Phase 1: 스터디 탐색 (0%)
- [ ] Phase 2: 내 스터디 (0%)
- [ ] Phase 3: 네비게이션 탭 (0%)
- [ ] Phase 4: 공통 컴포넌트 (0%)
- [ ] Phase 5: 최적화 & 테스트 (0%)

### 우선순위별 현황
- **필수 기능**: 0/15 완료
- **선택 기능**: 0/8 완료
- **Phase 2**: 0/12 완료

---

## 📝 구현 가이드

### 시작 전 체크리스트
1. [ ] 설계 문서 정독 (`docs/screens/` 내 해당 markdown)
2. [ ] Mock Data 구조 파악
3. [ ] CSS Module 네이밍 규칙 확인
4. [ ] 공통 컴포넌트 확인

### 구현 중 체크리스트
1. [ ] 인라인 스타일 사용하지 않았는가?
2. [ ] Mock Data를 올바르게 import 했는가?
3. [ ] CSS 클래스명이 명확한가?
4. [ ] 반응형이 적용되었는가?
5. [ ] 접근성을 고려했는가?

### 구현 후 체크리스트
1. [ ] 문서와 일치하는가?
2. [ ] 에러가 없는가?
3. [ ] 모든 브라우저에서 동작하는가?
4. [ ] 성능이 최적화되었는가?
5. [ ] 코드 리뷰를 받았는가?

---

## 🎯 성공 기준

### 기능적 완성도
- [ ] 모든 설계 문서의 기능이 구현됨
- [ ] Mock Data가 정상 작동
- [ ] 모든 인터랙션이 동작
- [ ] 에러 처리가 적절함

### 코드 품질
- [ ] 인라인 스타일 0개
- [ ] CSS Module 100% 사용
- [ ] 컴포넌트 재사용성 높음
- [ ] 주석이 적절함

### 사용자 경험
- [ ] 로딩 상태 처리
- [ ] 빈 상태 처리
- [ ] 에러 메시지 친절함
- [ ] 애니메이션 부드러움

### 성능
- [ ] 초기 로딩 3초 이내
- [ ] 페이지 전환 1초 이내
- [ ] 메모리 누수 없음

---


**작성일**: 2024-11-09  
**최종 업데이트**: 2024-11-09  
**버전**: 2.0  
**다음 작업**: Phase 0 실행 → 기존 코드 백업 및 Mock Data 생성

---

## 📚 관련 문서

### 스터디 기능
- `docs/screens/study/search/` - 스터디 탐색 관련
- `docs/screens/study/my/` - 내 스터디 관련

### 네비게이션 탭
- `docs/screens/tasks/` - 할 일 기능
- `docs/screens/notifications/` - 알림 기능
- `docs/screens/my-page/` - 마이페이지 기능

### 기타
- `docs/file-structure.md` - 파일 구조
- `docs/navigation-guide.md` - 네비게이션 가이드
  - 알림 목록, 유형별 데이터

---

### [ ] 3-3. 마이페이지 (My Page)
**라우트**: `/me`  
**참고 문서**: `docs/screens/my-page/main.md`  
**우선순위**: 필수

#### 구현 항목
- [ ] **페이지 파일 생성**
  - `coup/src/app/me/page.jsx`
  - `coup/src/app/me/page.module.css`

- [ ] **컴포넌트 생성**
  - `coup/src/components/my-page/ProfileSection.jsx`
  - `coup/src/components/my-page/ProfileSection.module.css`
  - `coup/src/components/my-page/InfoEditForm.jsx`
  - `coup/src/components/my-page/InfoEditForm.module.css`
  - `coup/src/components/my-page/StudyList.jsx`
  - `coup/src/components/my-page/StudyList.module.css`
  - `coup/src/components/my-page/AccountActions.jsx`
  - `coup/src/components/my-page/AccountActions.module.css`
  - `coup/src/components/my-page/DeleteConfirmModal.jsx`
  - `coup/src/components/my-page/DeleteConfirmModal.module.css`

- [ ] **기능 구현**
  - 2컬럼 레이아웃 (Nav + Content)
  - 프로필 섹션 (이미지 + 기본 정보)
  - 프로필 이미지 변경 (업로드 + 크롭)
  - 내 정보 수정 폼 (이름, 자기소개)
  - 참여 스터디 목록 (최대 4개 표시)
  - 로그아웃 버튼
  - 계정 삭제 버튼 + 확인 모달

- [ ] **Mock Data**
  - `coup/src/mocks/user.js` 생성
  - 사용자 프로필, 참여 스터디, 활동 통계

---

## 🔧 Phase 4: 공통 컴포넌트 & 유틸리티

### [ ] 3-1. 레이아웃 컴포넌트
- [ ] `MainLayout.jsx` (전체 레이아웃)
- [ ] `StudyLayout.jsx` (스터디 전용 레이아웃)

### [ ] 3-2. 공통 컴포넌트
- [ ] `Button.jsx`
- [ ] `Modal.jsx`
- [ ] `Toast.jsx`
- [ ] `Loading.jsx`
- [ ] `Skeleton.jsx`
- [ ] `EmptyState.jsx`
- [ ] `Badge.jsx`

### [ ] 3-3. 유틸리티 함수
- [ ] `utils/date.js`
- [ ] `utils/file.js`
- [ ] `utils/string.js`
- [ ] `utils/validation.js`

---

## ⚡ Phase 4: 최적화 & 테스트

### [ ] 4-1. 성능 최적화
- [ ] React.memo 적용
- [ ] 이미지 최적화
- [ ] 코드 스플리팅

### [ ] 4-2. SEO 최적화
- [ ] 메타 태그
- [ ] 구조화된 데이터

### [ ] 4-3. 접근성 (a11y)
- [ ] 키보드 네비게이션
- [ ] ARIA 속성

### [ ] 4-4. 반응형 테스트
- [ ] Desktop (1920px, 1440px)
- [ ] Tablet (1024px)
- [ ] Mobile (768px, 375px)

---

## 📅 구현 순서 추천

### 1주차: 기본 구조 (Phase 0 + Phase 1 일부)
1. Mock Data 생성 (`study.js`)
2. 공통 컴포넌트
3. 레이아웃 컴포넌트
4. 스터디 탐색 (Explore)
5. 스터디 생성 (Create)

### 2주차: 미가입자 플로우 완성
1. 스터디 프리뷰 (Preview)
2. 가입 플로우 (Join Flow)

### 3주차: 가입자 기본 기능
1. 내 스터디 목록
2. 스터디 대시보드
3. 스터디 채팅

### 4주차 이후: 추가 기능 및 최적화

---

## ⚠️ 주의사항

### 1. 문서 우선
- **모든 기능은 docs/screens/study의 markdown 문서를 먼저 읽고 구현**
- 문서에 명시된 레이아웃, 스타일, 인터랙션을 정확히 따를 것

### 2. CSS 분리
- **인라인 스타일 절대 사용 금지**
- 모든 스타일은 `.module.css` 파일로 분리

### 3. Mock Data 일관성
- 모든 컴포넌트는 `study.js`에서 데이터 import
- 데이터 구조 변경 시 `study.js` 한 곳만 수정

### 4. 컴포넌트 재사용
- 중복 코드 최소화
- 공통 컴포넌트 적극 활용

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025.11.08  
**다음 작업**: Phase 0 실행 → Mock Data 생성

