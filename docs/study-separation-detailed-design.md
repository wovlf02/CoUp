# 스터디 탐색 vs 내 스터디 - 상세 설계 문서

> **작성일**: 2025.11.06  
> **목적**: 스터디 탐색과 내 스터디의 명확한 분리 및 각 영역의 상세 기준 정의

---

## 🎯 핵심 개념

### 스터디 탐색 (Search Study)
**"스터디를 찾아서 가입하는 공간"**
- 경로: `/studies`
- 대상: 모든 공개 스터디
- 사용자 상태: **미가입 상태**
- 목적: 검색, 탐색, 가입

### 내 스터디 (My Study)
**"가입한 스터디에서 활동하는 공간"**
- 경로: `/my-studies`
- 대상: 내가 참여한 스터디
- 사용자 상태: **가입 완료 (PENDING/MEMBER/ADMIN/OWNER)**
- 목적: 활동, 소통, 관리

---

## 📊 영역별 상세 비교표

| 구분 | 스터디 탐색 (Search Study) | 내 스터디 (My Study) |
|------|---------------------------|---------------------|
| **라우트 prefix** | `/studies` | `/my-studies` |
| **파일명 prefix** | `search-study-` | `my-study-` |
| **주요 페이지** | 탐색, 생성, 프리뷰 | 목록, 대시보드, 8개 탭 |
| **데이터 소스** | 공개 스터디 전체 | 내가 참여한 스터디만 |
| **가입 상태** | 미가입 | 가입 완료 |
| **권한 레벨** | 없음 (읽기 전용) | 역할별 (PENDING ~ OWNER) |
| **정보 접근** | 제한적 (미리보기) | 전체 접근 |
| **주요 액션** | 검색, 필터링, 가입하기 | 채팅, 공지, 파일, 일정 |
| **실시간 기능** | ❌ 없음 | ✅ 채팅, 알림, 온라인 상태 |
| **네비게이션** | 탭 없음 | 8개 탭 메뉴 |
| **우측 위젯** | 추천 스터디, 인기 카테고리 | 온라인 멤버, 급한 할일 |
| **검색/필터** | ✅ 고급 검색 | ✅ 내 스터디 필터 |
| **역할 표시** | ❌ 없음 | ✅ 배지 (OWNER/ADMIN/MEMBER) |

---

## 🔀 사용자 여정 (User Journey)

### Journey 1: 신규 사용자 - 스터디 찾기
```
1. [대시보드] 접속
2. 좌측 메뉴 "🔍 스터디 탐색" 클릭
   → /studies (search-study-explore)
   
3. 카테고리/태그로 필터링
   → 관심 스터디 발견
   
4. 스터디 카드 클릭
   → /studies/123 (search-study-preview)
   → 제한된 정보 확인 (기본 정보, 공지 2개, 멤버 일부)
   
5. [가입하기] 버튼 클릭
   → API 호출: POST /api/v1/studies/123/join
   
6. ✅ 가입 완료 (또는 승인 대기)
   → 자동 리다이렉트: /my-studies/123 (my-study-dashboard)
```

### Journey 2: 기존 사용자 - 스터디 활동
```
1. [대시보드] 접속
2. 좌측 메뉴 "👥 내 스터디" 클릭
   → /my-studies (my-study-list)
   
3. 참여 중인 스터디 카드 클릭
   → /my-studies/123 (my-study-dashboard)
   → 전체 기능 접근 가능
   
4. 탭 네비게이션 선택
   - [채팅] → /my-studies/123/chat
   - [공지] → /my-studies/123/notices
   - [파일] → /my-studies/123/files
   - [캘린더] → /my-studies/123/calendar
   - [할일] → /my-studies/123/tasks
   - [화상통화] → /my-studies/123/video-call
   - [설정] → /my-studies/123/settings (권한 필요)
   
5. 활동 수행 (메시지 전송, 공지 작성 등)
```

### Journey 3: 잘못된 접근 - 자동 처리
```
시나리오 A: 가입한 스터디에 /studies로 접근
1. 사용자가 북마크나 링크로 /studies/123 접속
2. 서버/클라이언트에서 가입 여부 확인
3. ✅ 가입된 스터디 → 자동 리다이렉트: /my-studies/123
4. 전체 기능으로 접근

시나리오 B: 미가입 스터디에 /my-studies로 접근
1. 사용자가 잘못된 경로로 /my-studies/999 접속
2. 가입 여부 확인 → ❌ 미가입
3. 리다이렉트: /studies/999 (프리뷰)
4. 또는 404 에러 (비공개 스터디)
```

---

## 🎨 UI/UX 차별화 전략

### 스터디 탐색 (Search Study)

#### 시각적 특징
```
- 색상: 중립적 (회색/블루)
- 강조: "가입하기" 버튼 (Primary, 크게)
- 아이콘: 🔍 돋보기
- 톤: 탐색, 발견, 선택
```

#### 정보 표시 수준
```
✅ 표시:
- 스터디명, 설명
- 카테고리, 태그
- 멤버 수 (12/20명)
- 그룹장 이름
- 공개 설정
- 최근 공지 2개 (제목만)
- 멤버 프로필 (상위 5명)

❌ 숨김:
- 전체 공지 내용
- 채팅 내용
- 파일 목록
- 캘린더 상세
- 멤버 연락처
```

#### 주요 컴포넌트
```
/components/studies/explore/
├── ExploreHeader.jsx        # 검색바, 필터
├── StudyCardGrid.jsx        # 스터디 카드 그리드
├── StudyCard.jsx            # 개별 카드 (가입 버튼)
├── StudyPreview.jsx         # 프리뷰 페이지
├── CategoryFilter.jsx       # 카테고리 필터
├── SortDropdown.jsx         # 정렬 옵션
└── RecommendedWidget.jsx    # 추천 위젯
```

---

### 내 스터디 (My Study)

#### 시각적 특징
```
- 색상: 활성화 (Primary 컬러)
- 강조: 역할 배지, 알림 배지
- 아이콘: 👥 그룹
- 톤: 활동, 소통, 관리
```

#### 정보 표시 수준
```
✅ 전체 접근:
- 모든 공지 내용
- 실시간 채팅
- 전체 파일 목록
- 캘린더 전체
- 할일 전체
- 멤버 상세 정보
- 화상 통화
- 설정 (권한에 따라)

🔒 역할별 제한:
- PENDING: 읽기만 가능, 채팅 불가
- MEMBER: 전체 읽기/쓰기, 설정 불가
- ADMIN: 멤버 관리, 일부 설정
- OWNER: 모든 권한 (삭제 포함)
```

#### 주요 컴포넌트
```
/components/studies/my-study/
├── MyStudyHeader.jsx        # 스터디 정보, 역할 배지
├── MyStudyCard.jsx          # 내 스터디 카드
├── StudyTabs.jsx            # 8개 탭 네비게이션
├── StudyDashboard.jsx       # 대시보드 (개요)
├── ChatRoom.jsx             # 채팅 컴포넌트
├── NoticeList.jsx           # 공지 목록
├── FileManager.jsx          # 파일 관리
├── Calendar.jsx             # 캘린더
├── TaskManager.jsx          # 할일 관리
├── VideoCall.jsx            # 화상 통화
├── SettingsForm.jsx         # 설정 폼
└── OnlineMembersWidget.jsx  # 온라인 멤버 위젯
```

---

## 🔐 권한 및 접근 제어

### 스터디 탐색 권한
```javascript
// search-study-preview.jsx
const canViewPreview = (study) => {
  // 조건 1: 공개 스터디
  if (study.visibility === 'PUBLIC') return true
  
  // 조건 2: 초대 링크로 접근 (비공개도 프리뷰 가능)
  if (hasInviteToken()) return true
  
  // 그 외: 접근 불가
  return false
}

// 표시 제한
const getPreviewData = (study) => ({
  basicInfo: study.basicInfo,
  recentNotices: study.notices.slice(0, 2), // 최근 2개만
  memberCount: study.memberCount,
  topMembers: study.members.slice(0, 5),   // 상위 5명만
  tags: study.tags,
  // 채팅, 파일, 캘린더는 제외
})
```

### 내 스터디 권한
```javascript
// my-study-dashboard.jsx
const ROLE_PERMISSIONS = {
  PENDING: {
    canView: ['dashboard', 'notices'],
    canCreate: [],
    canEdit: [],
    canDelete: [],
    message: '승인 대기 중입니다. 읽기만 가능합니다.'
  },
  
  MEMBER: {
    canView: ['*'], // 모든 탭
    canCreate: ['chat', 'notices', 'files', 'tasks', 'calendar'],
    canEdit: ['own-content'], // 자신의 콘텐츠만
    canDelete: ['own-content'],
    message: null
  },
  
  ADMIN: {
    canView: ['*'],
    canCreate: ['*'],
    canEdit: ['*', 'members'], // 멤버 관리 가능
    canDelete: ['*', 'members'],
    message: null
  },
  
  OWNER: {
    canView: ['*'],
    canCreate: ['*'],
    canEdit: ['*'],
    canDelete: ['*', 'study'], // 스터디 삭제 가능
    message: null
  }
}

const checkPermission = (userRole, action, resource) => {
  const permissions = ROLE_PERMISSIONS[userRole]
  return permissions[action].includes('*') || 
         permissions[action].includes(resource)
}
```

---

## 📡 API 엔드포인트 구분

### 스터디 탐색 API
```
GET  /api/v1/studies                    # 공개 스터디 목록
GET  /api/v1/studies/:id/preview        # 스터디 프리뷰 (제한된 정보)
POST /api/v1/studies                    # 스터디 생성
POST /api/v1/studies/:id/join           # 스터디 가입 신청
GET  /api/v1/studies/categories         # 카테고리 목록
GET  /api/v1/studies/recommended        # 추천 스터디
```

### 내 스터디 API
```
GET  /api/v1/my-studies                 # 내가 참여한 스터디 목록
GET  /api/v1/my-studies/:id             # 스터디 전체 정보
GET  /api/v1/my-studies/:id/chat        # 채팅 내역
POST /api/v1/my-studies/:id/chat        # 메시지 전송
GET  /api/v1/my-studies/:id/notices     # 공지 목록
POST /api/v1/my-studies/:id/notices     # 공지 작성
GET  /api/v1/my-studies/:id/files       # 파일 목록
POST /api/v1/my-studies/:id/files       # 파일 업로드
GET  /api/v1/my-studies/:id/calendar    # 캘린더 일정
POST /api/v1/my-studies/:id/calendar    # 일정 추가
GET  /api/v1/my-studies/:id/tasks       # 할일 목록
POST /api/v1/my-studies/:id/tasks       # 할일 추가
PATCH /api/v1/my-studies/:id/settings   # 설정 수정 (권한 필요)
DELETE /api/v1/my-studies/:id           # 스터디 삭제 (OWNER만)
```

---

## 🎭 상태 관리 전략

### 스터디 탐색 상태
```javascript
// Zustand Store
const useStudyExploreStore = create((set) => ({
  // 탐색 상태
  studies: [],
  filters: {
    category: 'all',
    sort: 'latest',
    keyword: ''
  },
  pagination: {
    page: 1,
    perPage: 12,
    total: 0
  },
  
  // 액션
  setFilters: (filters) => set({ filters }),
  loadStudies: async () => {
    // API 호출
  },
  
  // 미가입 상태 관리
  isJoining: false,
  joinStudy: async (studyId) => {
    set({ isJoining: true })
    // 가입 로직
    // 성공 시 /my-studies/:id로 리다이렉트
  }
}))
```

### 내 스터디 상태
```javascript
// Zustand Store
const useMyStudyStore = create((set) => ({
  // 현재 스터디 정보
  currentStudy: null,
  myRole: null,
  
  // 실시간 데이터
  unreadMessages: 0,
  onlineMembers: [],
  
  // 액션
  setCurrentStudy: (study) => set({ currentStudy: study }),
  updateUnreadCount: (count) => set({ unreadMessages: count }),
  
  // WebSocket 연결
  connectSocket: (studyId) => {
    // Socket.IO 연결
  }
}))
```

---

## 📱 네비게이션 구조

### 전역 네비게이션 (좌측 사이드바)
```
🏠 대시보드           /dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 스터디 탐색        /studies              [search-study]
👥 내 스터디         /my-studies           [my-study]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 할 일            /tasks
🔔 알림             /notifications
👤 마이페이지        /my-page
```

### 스터디 탐색 네비게이션
```
/studies (search-study-explore)
├── 필터바 (카테고리, 정렬, 검색)
└── 우측 위젯
    ├── 추천 스터디
    ├── 인기 카테고리
    └── 내가 만든 스터디

/studies/create (search-study-create)
└── 생성 폼

/studies/:id (search-study-preview)
├── 기본 정보
├── 공지 미리보기 (2개)
├── 멤버 미리보기 (5명)
└── [가입하기] 버튼
```

### 내 스터디 네비게이션
```
/my-studies (my-study-list)
├── 탭 필터 (전체/참여중/관리중/대기중)
└── 우측 위젯
    ├── 나의 활동 요약
    ├── 급한 할일
    └── 다가오는 일정

/my-studies/:id (my-study-dashboard)
├── 상단: 스터디 정보 + 역할 배지
├── 탭 네비게이션
│   ├── [개요] (my-study-dashboard)
│   ├── [채팅] (my-study-chat)
│   ├── [공지] (my-study-notices)
│   ├── [파일] (my-study-files)
│   ├── [캘린더] (my-study-calendar)
│   ├── [할일] (my-study-tasks)
│   ├── [화상통화] (my-study-video-call)
│   └── [설정] (my-study-settings) - 권한 필요
└── 우측 위젯
    ├── 온라인 멤버
    ├── 빠른 액션
    ├── 고정 공지
    ├── 급한 할일
    └── 다가오는 일정
```

---

## 🔄 데이터 흐름

### 스터디 탐색 → 내 스터디 전환
```
1. 사용자가 /studies에서 스터디 발견
2. /studies/123 프리뷰 확인
3. [가입하기] 클릭
   ↓
4. POST /api/v1/studies/123/join
   {
     message: "가입 인사 (선택)"
   }
   ↓
5. Response:
   - autoApprove: true → status: 'MEMBER'
   - autoApprove: false → status: 'PENDING'
   ↓
6. Redirect: /my-studies/123
   - MEMBER: 전체 접근
   - PENDING: 제한된 접근 (승인 대기 메시지 표시)
```

### 가입 여부에 따른 자동 라우팅
```javascript
// middleware.js 또는 페이지 레벨
const handleStudyAccess = async (studyId, userId) => {
  // 1. 사용자의 가입 상태 확인
  const membership = await checkMembership(studyId, userId)
  
  if (membership) {
    // 가입된 상태 → 내 스터디로
    return {
      redirect: `/my-studies/${studyId}`,
      role: membership.role
    }
  } else {
    // 미가입 상태 → 스터디 탐색 프리뷰로
    const study = await getStudy(studyId)
    
    if (study.visibility === 'PUBLIC') {
      return {
        redirect: `/studies/${studyId}`,
        preview: true
      }
    } else {
      // 비공개 스터디 → 404
      return { notFound: true }
    }
  }
}
```

---

## 📋 파일 구조 및 명명 규칙

### 문서 파일 (docs/screens/)
```
# 스터디 탐색
05_search-study-explore.md      # 공개 스터디 탐색
06_search-study-create.md       # 스터디 생성
07_search-study-preview.md      # 미가입자용 프리뷰

# 내 스터디
08_my-study-list.md             # 내 스터디 목록
09_my-study-dashboard.md        # 스터디 대시보드 (개요)
10_my-study-chat.md             # 채팅
11_my-study-notices.md          # 공지사항
12_my-study-files.md            # 파일
13_my-study-calendar.md         # 캘린더
14_my-study-tasks.md            # 할일
15_my-study-video-call.md       # 화상 통화
16_my-study-settings.md         # 설정
```

### 코드 파일
```
# 라우트
app/
├── studies/                    # 스터디 탐색
│   ├── page.jsx               # search-study-explore
│   ├── create/
│   │   └── page.jsx           # search-study-create
│   └── [studyId]/
│       └── page.jsx           # search-study-preview
│
└── my-studies/                # 내 스터디
    ├── page.jsx               # my-study-list
    └── [studyId]/
        ├── page.jsx           # my-study-dashboard
        ├── chat/
        │   └── page.jsx       # my-study-chat
        ├── notices/
        │   └── page.jsx       # my-study-notices
        ├── files/
        │   └── page.jsx       # my-study-files
        ├── calendar/
        │   └── page.jsx       # my-study-calendar
        ├── tasks/
        │   └── page.jsx       # my-study-tasks
        ├── video-call/
        │   └── page.jsx       # my-study-video-call
        └── settings/
            └── page.jsx       # my-study-settings

# 컴포넌트
components/studies/
├── explore/                   # 스터디 탐색용
│   ├── StudyCard.jsx
│   ├── StudyPreview.jsx
│   ├── CategoryFilter.jsx
│   └── RecommendedWidget.jsx
│
└── my-study/                  # 내 스터디용
    ├── MyStudyCard.jsx
    ├── StudyTabs.jsx
    ├── ChatRoom.jsx
    ├── NoticeList.jsx
    ├── FileManager.jsx
    └── OnlineMembersWidget.jsx
```

---

## ✅ 체크리스트

### Phase 1: 문서 재구조화
- [ ] 기존 문서 파일명 변경 (prefix 추가)
- [ ] 새 문서 작성 (search-study-preview)
- [ ] 각 문서에 명확한 구분 표시 추가

### Phase 2: 코드 구조 준비
- [ ] 컴포넌트 폴더 분리 (explore/ vs my-study/)
- [ ] API 엔드포인트 분리 정의
- [ ] 상태 관리 스토어 분리

### Phase 3: 권한 및 라우팅
- [ ] 가입 여부 체크 로직 구현
- [ ] 자동 리다이렉트 미들웨어
- [ ] 역할별 권한 체크

### Phase 4: UI/UX 차별화
- [ ] 스터디 탐색: 중립적 디자인
- [ ] 내 스터디: 활성화 디자인
- [ ] 역할 배지 시스템
- [ ] 알림 배지 시스템

---

이 설계를 기반으로 문서 파일들을 재구조화하고 상세 내용을 작성하겠습니다.

