# 05-1. 내 스터디 (My Studies)

> **화면 ID**: `MAIN-02-1`  
> **라우트**: `/my-studies`  
> **레이아웃**: 좌측 네비게이션(15%) + 우측 콘텐츠(85%)  
> **렌더링**: CSR (개인화된 데이터)

---

## 📐 화면 구조 (2컬럼 레이아웃 - FHD 최적화)

**개선안**: 좌우 여백을 최소화하고 우측에 고정 위젯을 배치하여 공간 활용 극대화

```
┌────────┬────────────────────────────────────────────────────────────────────┐
│        │  Header                                                            │
│        ├────────────────────────────────────────────────────────────────────┤
│        │  ┌──────────────────────────────────────┬────────────────────────┐ │
│  Nav   │  │ 내 스터디        [+ 스터디 만들기]    │  [우측 위젯]          │ │
│  Bar   │  │                                      │                        │ │
│        │  │ ┌──────────────────────────────────┐ │ ┌────────────────────┐ │ │
│ 🏠     │  │ │[전체 4][참여중 3][관리중 1]      │ │ │ 📊 나의 활동 요약  │ │ │
│ 🔍 탐색│  │ └──────────────────────────────────┘ │ │  • 참여: 4개       │ │ │
│ 👥 스터디│ │                                      │ │  • 관리: 1개       │ │ │
│ 📋     │  │ ┌──────────────────────────────────┐ │ │  • 새 메시지: 7개  │ │ │
│ 🔔     │  │ │ 📚 [OWNER]                       │ │ └────────────────────┘ │ │
│ 👤     │  │ │ 코딩테스트 준비 스터디            │ │                        │ │
│        │  │ │ 12/20명 • 1시간 전 💬 5개        │ │ ┌────────────────────┐ │ │
│        │  │ │ [채팅][공지][파일][캘린더][설정]  │ │ │ 🔥 급한 할일 (3)   │ │ │
│        │  │ └──────────────────────────────────┘ │ │  🔴 백준 1234 (D-1)│ │ │
│        │  │                                      │ │  🟡 코드리뷰 (D-2) │ │ │
│        │  │ ┌──────────────────────────────────┐ │ │  🟡 자소서 (D-3)   │ │ │
│        │  │ │ 💼 [MEMBER]                      │ │ └────────────────────┘ │ │
│        │  │ │ 취업 준비 스터디                  │ │                        │ │
│        │  │ │ 8/15명 • 3시간 전                │ │ ┌────────────────────┐ │ │
│        │  │ │ [채팅][공지][파일][캘린더]        │ │ │ 📅 다가오는 일정   │ │ │
│        │  │ └──────────────────────────────────┘ │ │  11/7 주간회의     │ │ │
│        │  │                                      │ │  11/10 과제마감    │ │ │
│        │  │                                      │ │  [전체보기 →]      │ │ │
│        │  │                                      │ │ └────────────────────┘ │ │
│ 15%    │  │          70%                         │        30%             │ │
└────────┴──┴──────────────────────────────────────┴────────────────────────┴─┘
```

---

## 🎨 레이아웃 구조

### FHD (1920x1080) 기준
```
|<-- Nav 15% -->|<------- 메인 콘텐츠 60% ------->|<-- 위젯 25% -->|
```

### 2컬럼 그리드
```css
.contentWithSidebar {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}
```

---

## 🎨 섹션별 상세 설계

### 1. 페이지 헤더
```
내 스터디                                          [+ 스터디 만들기]
```

**좌측**:
- "내 스터디" (text-2xl, Bold, gray-900)

**우측**:
- "스터디 만들기" 버튼 (Primary, Medium)
  - 아이콘: + (plus)
  - 클릭 → `/studies/create`

---

### 2. 탭 필터
```
┌──────────────────────────────────────────────────────────────┐
│ [전체 4] [참여중 3] [관리중 1] [대기중 0]                     │
└──────────────────────────────────────────────────────────────┘
```

**탭 목록**:
1. **전체** - 모든 스터디 (기본 선택)
2. **참여중** - 승인된 스터디 (MEMBER, ADMIN, OWNER)
3. **관리중** - 내가 관리하는 스터디 (ADMIN, OWNER)
4. **대기중** - 가입 승인 대기 중인 스터디 (PENDING)

**스타일**:
- 배경: white
- 테두리: 1px solid gray-200
- 패딩: 12px 0
- 둥근 모서리: 12px
- 그림자: shadow-sm

**각 탭**:
- 기본: gray-600 텍스트
- Active: primary-600 텍스트, 하단 2px 테두리
- Hover: gray-800 텍스트
- 배지: 숫자 표시 (gray-500)

---

### 3. 스터디 카드 목록

```
┌────────────────────────────────────────────────────────────┐
│ 📚 [OWNER]                                                 │
│ 코딩테스트 준비 스터디                                      │
│                                                            │
│ 매일 알고리즘 문제를 풀고 코드 리뷰하는 스터디입니다.        │
│                                                            │
│ 👥 12/20명  📅 마지막 활동: 1시간 전  💬 새 메시지 5개     │
│                                                            │
│ [채팅] [공지] [파일] [캘린더] [설정]                        │
└────────────────────────────────────────────────────────────┘
```

**카드 레이아웃**:
- 배경: white
- 테두리: 1px solid gray-200
- 둥근 모서리: 12px
- 패딩: 24px
- 그림자: shadow-sm
- 간격: 16px (카드 간)
- Hover: shadow-md, 테두리 primary-200
- 트랜지션: 0.2s ease

**카드 내용**:

1. **헤더 영역** (상단)
   - 카테고리 이모지 (좌측, 32px)
   - 역할 배지 (우측)
     - `[OWNER]` - primary-600 배경, white 텍스트
     - `[ADMIN]` - purple-600 배경, white 텍스트
     - `[MEMBER]` - gray-600 배경, white 텍스트
     - `[PENDING]` - yellow-600 배경, white 텍스트
   - 패딩: 6px 12px
   - 둥근 모서리: 6px
   - text-xs, Bold

2. **스터디명** (text-xl, Bold, gray-900)
   - 마진: 12px 0
   - 클릭 가능 (hover: primary-600)

3. **설명** (text-sm, gray-600)
   - 최대 2줄
   - line-height: 1.6
   - 초과 시 ... (ellipsis)

4. **메타 정보** (하단)
   - 👥 멤버 수: "12/20명"
   - 📅 마지막 활동: "1시간 전", "어제", "2일 전"
   - 💬 새 메시지: "새 메시지 5개" (빨간 배지)
   - text-sm, gray-500
   - 아이콘 + 텍스트
   - 간격: 16px

5. **빠른 액션 버튼** (하단, 마진 16px 위)
   - 공통: [채팅] [공지] [파일] [캘린더]
   - OWNER/ADMIN: + [설정] (우측 끝)
   - 버튼 스타일:
     - 배경: gray-100
     - 텍스트: gray-700
     - Hover: gray-200
     - 패딩: 8px 16px
     - 둥근 모서리: 6px
     - text-sm
     - 간격: 8px

---

### 4. 정렬 옵션 (탭 우측)

```
┌──────────────────────────────────────────────────────────────┐
│ [전체 4] [참여중 3] [관리중 1]            [정렬: 최근 활동▼] │
└──────────────────────────────────────────────────────────────┘
```

**정렬 드롭다운**:
1. 최근 활동순 (기본)
2. 이름순 (가나다순)
3. 참여 인원순
4. 생성일순

---

### 5. 빈 상태

#### 전체 탭 - 참여 스터디 없음
```
┌────────────────────────────────────────┐
│                                        │
│         [일러스트 - 빈 폴더]            │
│                                        │
│    아직 참여 중인 스터디가 없어요        │
│   지금 바로 관심있는 스터디를 찾아보세요!│
│                                        │
│      [스터디 둘러보기 →]                │
│                                        │
└────────────────────────────────────────┘
```

#### 관리중 탭 - 관리 스터디 없음
```
┌────────────────────────────────────────┐
│                                        │
│        [일러스트 - 리더 배지]           │
│                                        │
│    관리 중인 스터디가 없어요            │
│   새로운 스터디를 만들어보세요!         │
│                                        │
│       [스터디 만들기 →]                 │
│                                        │
└────────────────────────────────────────┘
```

#### 대기중 탭 - 대기 스터디 없음
```
┌────────────────────────────────────────┐
│                                        │
│          [일러스트 - 시계]              │
│                                        │
│    승인 대기 중인 스터디가 없어요        │
│                                        │
└────────────────────────────────────────┘
```

---

## 🎬 인터랙션

### 1. 로딩 상태
```
┌────────────────────────────────────────┐
│ ▇▇▇▇ ▇▇▇▇▇▇▇▇                         │
│ ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇                   │
│                                        │
│ ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇        │
│                                        │
│ ▇▇▇▇ ▇▇▇▇ ▇▇▇▇ ▇▇▇▇                   │
│                                        │
│ ▇▇▇▇ ▇▇▇▇ ▇▇▇▇ ▇▇▇▇ ▇▇▇▇             │
└────────────────────────────────────────┘

Skeleton UI: 카드 모양 유지 (3-5개)
```

### 2. 탭 전환 애니메이션
- Fade in/out (0.2s)
- 탭 인디케이터 슬라이드 (0.3s ease)

### 3. 카드 클릭
- 카드 전체 클릭 → 스터디 상세 페이지 (`/studies/[studyId]`)
- 빠른 액션 버튼 클릭 → 해당 기능 페이지
  - [채팅] → `/studies/[studyId]/chat`
  - [공지] → `/studies/[studyId]/notices`
  - [파일] → `/studies/[studyId]/files`
  - [캘린더] → `/studies/[studyId]/calendar`
  - [설정] → `/studies/[studyId]/settings` (OWNER/ADMIN만)

### 4. 스터디 나가기 (컨텍스트 메뉴)
- 카드 우측 상단 ⋮ (더보기) 아이콘
- 드롭다운 메뉴:
  - [스터디 상세]
  - [알림 설정]
  - [스터디 나가기] (MEMBER)
  - [스터디 삭제] (OWNER만, 빨간색)

**스터디 나가기 확인 모달**:
```
┌──────────────────────────────────────┐
│ ⚠️ 스터디 나가기                      │
├──────────────────────────────────────┤
│                                      │
│ "코딩테스트 준비 스터디"에서          │
│ 나가시겠습니까?                       │
│                                      │
│ 나간 후에는 다시 가입 신청을 해야     │
│ 참여할 수 있습니다.                   │
│                                      │
│         [취소]      [나가기]          │
│                                      │
└──────────────────────────────────────┘
```

---

## 🎨 우측 고정 위젯 (Sidebar)

### 위젯 구성 (우선순위 순)

#### 1️⃣ 나의 활동 요약 (최상단)
```
┌─────────────────────────────────┐
│ 📊 나의 활동 요약                │
│                                 │
│ 참여 스터디                      │
│ • 전체: 4개                     │
│ • 관리중: 1개 (OWNER/ADMIN)     │
│                                 │
│ 새 소식                         │
│ • 읽지 않은 메시지: 7개          │
│ • 새 공지: 2개                  │
│                                 │
│ 이번 주 활동                     │
│ • 출석: 5/7일                   │
│ • 완료 할일: 12개               │
│                                 │
│ [내 통계 자세히 →]              │
└─────────────────────────────────┘
```

**표시 정보**:
- 참여 스터디 수 (전체/관리중)
- 새 메시지 & 공지 알림
- 이번 주 활동 요약
- 통계 페이지 링크

**사용자 가치**:
- 전체 스터디 현황 한눈에 파악
- 놓친 메시지/공지 확인
- 나의 참여도 체크

---

#### 2️⃣ 급한 할일 (전체 스터디 통합)
```
┌─────────────────────────────────┐
│ 🔥 급한 할일 (3)                 │
│                                 │
│ 🔴 [코딩테스트] 백준 1234번      │
│    D-1 (11/7)                   │
│    [완료하기]                   │
│                                 │
│ 🟡 [취업준비] 자소서 1차 작성    │
│    D-2 (11/8)                   │
│    [완료하기]                   │
│                                 │
│ 🟡 [코딩테스트] 코드 리뷰 준비   │
│    D-3 (11/9)                   │
│    [완료하기]                   │
│                                 │
│ [할일 전체보기 →]               │
└─────────────────────────────────┘
```

**표시 정보**:
- 모든 스터디의 D-3 이내 할일 통합 (최대 5개)
- 스터디명 표시 (어느 스터디 할일인지)
- 마감 긴급도 색상 코딩
  - 🔴 D-0 ~ D-1
  - 🟡 D-2 ~ D-3
- 빠른 완료 버튼

**사용자 가치**:
- 여러 스터디의 긴급 할일을 한곳에서 확인
- 마감 놓치는 일 방지
- 빠른 완료 처리

---

#### 3️⃣ 다가오는 일정 (전체 스터디 통합)
```
┌─────────────────────────────────┐
│ 📅 다가오는 일정                 │
│                                 │
│ 11/7 (목) 14:00                 │
│ [코딩테스트] 주간 회의 (D-1)    │
│                                 │
│ 11/8 (금) 20:00                 │
│ [취업준비] 모의 면접 (D-2)      │
│                                 │
│ 11/10 (일) 23:59                │
│ [영어회화] 과제 제출 (D-4)      │
│                                 │
│ [캘린더 전체보기 →]             │
└─────────────────────────────────┘
```

**표시 정보**:
- 7일 이내 모든 스터디 일정 (최대 5개)
- 스터디명 + 일정 제목
- D-day 카운트다운

**사용자 가치**:
- 여러 스터디 일정을 한눈에 확인
- 일정 충돌 방지
- 일정 놓치지 않음

---

#### 4️⃣ 빠른 액션
```
┌─────────────────────────────────┐
│ ⚡ 빠른 액션                     │
│                                 │
│ [📊 전체 통계]  [🔍 스터디 찾기] │
│                                 │
│ [➕ 스터디 만들기]               │
└─────────────────────────────────┘
```

**버튼 목록**:
- **전체 통계**: 모든 스터디 활동 대시보드
- **스터디 찾기**: 스터디 탐색 페이지
- **스터디 만들기**: 새 스터디 생성

**사용자 가치**:
- 주요 기능에 빠른 접근
- 페이지 이동 최소화

---

### 위젯 스타일

```css
.sidebar {
  position: sticky;
  top: 80px;
  height: fit-content;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 0;
  scroll-behavior: smooth;
}

.widget {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
}

.widget:hover {
  box-shadow: var(--shadow-sm);
}

.widgetTitle {
  font-size: 14px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
```

---

## 📱 반응형 설계

### Desktop (1920px - FHD)
```css
.contentWithSidebar {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
}
```
- 메인 콘텐츠: 유동적 (1fr)
- 사이드바: 340px 고정
- 사이드바 sticky 적용

### Desktop (1280-1919px)
```css
.contentWithSidebar {
  grid-template-columns: 1fr 300px;
  gap: 20px;
}
```
- 사이드바: 300px로 축소
- 위젯 폰트 약간 축소

### Tablet (768-1279px)
```css
.contentWithSidebar {
  grid-template-columns: 1fr 260px;
  gap: 16px;
}
```
- 사이드바: 260px로 축소
- 일부 위젯 숨김 (빠른 액션 등)

### Mobile (<768px)
```css
.contentWithSidebar {
  grid-template-columns: 1fr;
}
```
- 사이드바를 메인 콘텐츠 아래로 이동
- 위젯을 아코디언으로 접기 가능
- 탭: 스크롤 가능 (수평)
- 빠른 액션 버튼: 아이콘만 표시

---

## 🎨 스타일 코드

```css
/* 스터디 카드 */
.my-study-card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  cursor: pointer;
  margin-bottom: 16px;
}

.my-study-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--primary-200);
}

/* 역할 배지 */
.role-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.role-badge.owner {
  background: var(--primary-600);
  color: white;
}

.role-badge.admin {
  background: #9333EA; /* purple-600 */
  color: white;
}

.role-badge.member {
  background: var(--gray-600);
  color: white;
}

.role-badge.pending {
  background: #F59E0B; /* yellow-600 */
  color: white;
}

/* 스터디명 */
.study-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 12px 0;
  cursor: pointer;
}

.study-name:hover {
  color: var(--primary-600);
}

/* 설명 */
.study-description {
  font-size: 14px;
  color: var(--gray-600);
  line-height: 1.6;
  margin-bottom: 16px;
  
  /* 2줄 제한 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 메타 정보 */
.study-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: var(--gray-500);
  margin-bottom: 16px;
}

.study-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 새 메시지 배지 */
.new-message-badge {
  background: var(--danger-500);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* 빠른 액션 버튼 */
.quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-action-btn {
  background: var(--gray-100);
  color: var(--gray-700);
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.quick-action-btn:hover {
  background: var(--gray-200);
}

/* 탭 */
.tabs {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 12px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
  display: flex;
  gap: 8px;
}

.tab {
  flex: 1;
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: var(--gray-600);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
}

.tab:hover {
  color: var(--gray-800);
}

.tab.active {
  color: var(--primary-600);
  font-weight: 600;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-600);
}

.tab-badge {
  display: inline-block;
  margin-left: 6px;
  color: var(--gray-500);
  font-weight: 400;
}
```

---

## 📊 데이터 구조

### API 엔드포인트
```
GET /api/v1/users/me/studies?tab=all&sort=recent
```

**쿼리 파라미터**:
- `tab`: all | joined | managed | pending
- `sort`: recent | name | members | created

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "studies": [
      {
        "id": "study_123",
        "name": "코딩테스트 준비 스터디",
        "description": "매일 알고리즘 문제를 풀고 코드 리뷰하는 스터디입니다.",
        "emoji": "📚",
        "category": "PROGRAMMING",
        "currentMembers": 12,
        "maxMembers": 20,
        "role": "OWNER",
        "lastActivity": "2025-11-06T10:30:00Z",
        "unreadMessages": 5,
        "createdAt": "2025-10-01T00:00:00Z"
      },
      {
        "id": "study_456",
        "name": "취업 준비 스터디",
        "description": "함께 이력서와 면접을 준비하는 스터디",
        "emoji": "💼",
        "category": "JOB_PREP",
        "currentMembers": 8,
        "maxMembers": 15,
        "role": "MEMBER",
        "lastActivity": "2025-11-06T08:00:00Z",
        "unreadMessages": 0,
        "createdAt": "2025-09-15T00:00:00Z"
      }
    ],
    "counts": {
      "all": 4,
      "joined": 3,
      "managed": 1,
      "pending": 0
    }
  }
}
```

---

## 🔄 상태 관리

### React Query
```javascript
const { data, isLoading, error } = useQuery(
  ['my-studies', tab, sort],
  () => fetchMyStudies({ tab, sort }),
  {
    staleTime: 2 * 60 * 1000, // 2분
    cacheTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: true
  }
)
```

### 탭 상태
```javascript
const [activeTab, setActiveTab] = useState('all')
const [sortBy, setSortBy] = useState('recent')
```

---

## 📐 ASCII 스케치

```
┌──────┬────────────────────────────────────────────────────┐
│      │ Header                         [+ 스터디 만들기]  │
│      ├────────────────────────────────────────────────────┤
│      │                                                    │
│ 🏠   │ 내 스터디                                          │
│ 🔍   │                                                    │
│ 👥   │ ┌────────────────────────────────────────────────┐│
│ 📋   │ │[전체 4] [참여중 3] [관리중 1]  [최근 활동▼]   ││
│ 🔔   │ └────────────────────────────────────────────────┘│
│ 👤   │                                                    │
│      │ ┌────────────────────────────────────────────────┐│
│      │ │ 📚 [OWNER]                                     ││
│      │ │ 코딩테스트 준비 스터디                          ││
│      │ │ 매일 알고리즘...                                ││
│      │ │ 👥 12/20  📅 1시간 전  💬 새 메시지 5개        ││
│      │ │ [채팅] [공지] [파일] [캘린더] [설정]            ││
│      │ └────────────────────────────────────────────────┘│
│      │                                                    │
│      │ ┌────────────────────────────────────────────────┐│
│      │ │ 💼 [MEMBER]                                    ││
│      │ │ 취업 준비 스터디                                ││
│      │ │ 함께 이력서와...                                ││
│      │ │ 👥 8/15  📅 3시간 전                            ││
│      │ │ [채팅] [공지] [파일] [캘린더]                   ││
│      │ └────────────────────────────────────────────────┘│
│      │                                                    │
│ 15%  │                    85%                            │
└──────┴────────────────────────────────────────────────────┘
```

---

## ✅ 완료 체크리스트

- [ ] 페이지 헤더 및 "스터디 만들기" 버튼
- [ ] 탭 필터 (전체/참여중/관리중/대기중)
- [ ] 스터디 카드 목록 렌더링
- [ ] 역할 배지 표시 (OWNER/ADMIN/MEMBER/PENDING)
- [ ] 빠른 액션 버튼 기능
- [ ] 컨텍스트 메뉴 (스터디 나가기)
- [ ] 빈 상태 UI (각 탭별)
- [ ] Skeleton 로딩 UI
- [ ] 반응형 레이아웃
- [ ] API 연동 및 React Query 설정
- [ ] 정렬 기능
- [ ] 새 메시지 배지 표시

---

**관련 화면**:
- `05_study-explore.md` - 스터디 탐색
- `06_study-create.md` - 스터디 생성
- `07_study-detail.md` - 스터디 상세

