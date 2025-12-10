# 대시보드 컴포넌트 가이드

## 개요

대시보드 UI 컴포넌트에 대한 상세 문서입니다.

---

## 화면 레이아웃

### 대시보드 페이지 전체 레이아웃

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [사이드바]  │                        [헤더]                                │
│             │───────────────────────────────────────────────────────────────│
│  📊 대시보드 │                                                               │
│  📚 내스터디 │   📊 대시보드                                                 │
│  ✅ 할일    │   나의 활동을 한눈에 확인하세요                               │
│  🔔 알림    │                                                               │
│  👤 마이페이지│  ┌─────────────────────────────────┬───────────────────────┐ │
│             │  │                                   │                       │ │
│             │  │       Main Content (80%)          │   Sidebar (20%)       │ │
│             │  │                                   │                       │ │
│             │  │  ┌─────────────────────────────┐  │  ┌─────────────────┐ │ │
│             │  │  │     환영 메시지              │  │  │  스터디 현황    │ │ │
│             │  │  └─────────────────────────────┘  │  └─────────────────┘ │ │
│             │  │                                   │                       │ │
│             │  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐        │  ┌─────────────────┐ │ │
│             │  │  │   │ │   │ │   │ │   │        │  │  온라인 멤버    │ │ │
│             │  │  │통계│ │카드│ │ 4 │ │ 개 │        │  └─────────────────┘ │ │
│             │  │  └───┘ └───┘ └───┘ └───┘        │                       │ │
│             │  │                                   │  ┌─────────────────┐ │ │
│             │  │  ┌─────────────────────────────┐  │  │  빠른 액션      │ │ │
│             │  │  │     내 스터디 섹션          │  │  └─────────────────┘ │ │
│             │  │  └─────────────────────────────┘  │                       │ │
│             │  │                                   │  ┌─────────────────┐ │ │
│             │  │  ┌─────────────────────────────┐  │  │  급한 할일      │ │ │
│             │  │  │     알림 섹션               │  │  └─────────────────┘ │ │
│             │  │  └─────────────────────────────┘  │                       │ │
│             │  │                                   │                       │ │
│             │  │  ┌─────────────────────────────┐  │                       │ │
│             │  │  │     다가오는 일정           │  │                       │ │
│             │  │  └─────────────────────────────┘  │                       │ │
│             │  │                                   │                       │ │
│             │  └───────────────────────────────────┴───────────────────────┘ │
│             │                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 통계 카드 레이아웃

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  │     📚       │  │     ✅       │  │     🔔       │  │     🎯       │
│  │              │  │              │  │              │  │              │
│  │ 활성 스터디  │  │ 진행 중인    │  │ 읽지 않은    │  │ 이번 달      │
│  │              │  │ 할일         │  │ 알림         │  │ 완료         │
│  │      3       │  │      5       │  │      2       │  │     12       │
│  │              │  │              │  │              │  │              │
│  │  (blue)      │  │  (green)     │  │  (yellow)    │  │  (purple)    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 내 스터디 카드 레이아웃

```
┌──────────────────┐
│       📚        │
│                  │
│   React 스터디   │
│                  │
│     프론트엔드   │
│                  │
│  ┌────────────┐  │
│  │ 👑 스터디장 │  │
│  │    8명     │  │
│  └────────────┘  │
│                  │
└──────────────────┘
```

---

## 페이지 컴포넌트

### DashboardPage (Server Component)

**경로:** `/dashboard`

**파일 위치:** `src/app/dashboard/page.jsx`

```jsx
import { getSession } from '@/lib/auth-helpers'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/sign-in')
  }

  return (
    <DashboardClient 
      user={session.user}
    />
  )
}
```

- **역할**: 서버에서 세션 확인 후 클라이언트 컴포넌트에 초기 사용자 데이터 전달
- **인증**: 미인증 시 `/sign-in`으로 리다이렉트

---

### DashboardClient (Client Component)

**파일 위치:** `src/components/dashboard/DashboardClient.jsx`

#### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `user` | `object` | 초기 사용자 정보 (서버에서 전달) |

#### 상태 관리

```javascript
// React Query Hooks
const { data: dashboardData, isLoading } = useDashboard()
const { data: userData, isLoading: userLoading } = useMe()

// 최신 사용자 정보 (API 우선, 없으면 초기값)
const user = userData?.user || initialUser
```

#### 메모이제이션

```javascript
// 통계 카드 데이터 최적화
const statsCards = useMemo(() => [
  { icon: '📚', label: '활성 스터디', value: stats.activeStudies, color: 'blue' },
  { icon: '✅', label: '진행 중인 할일', value: stats.pendingTasks, color: 'green' },
  { icon: '🔔', label: '읽지 않은 알림', value: stats.unreadNotifications, color: 'yellow' },
  { icon: '🎯', label: '이번 달 완료', value: stats.completedThisMonth, color: 'purple' }
], [stats.activeStudies, stats.pendingTasks, stats.unreadNotifications, stats.completedThisMonth])

// 위젯 통계 최적화
const widgetStats = useMemo(() => widgetData?.stats || {
  attendanceRate: 0,
  taskCompletionRate: 0,
  streakDays: 0
}, [widgetData?.stats])
```

#### 렌더링 조건

```jsx
// 로딩 상태
if (isLoading || userLoading) {
  return <DashboardSkeleton />
}

// 데이터 없음
if (!dashboardData?.data) {
  return <EmptyState icon="⚠️" title="데이터를 불러올 수 없습니다" />
}
```

---

### DashboardSkeleton

**파일 위치:** `src/components/dashboard/DashboardSkeleton.jsx`

로딩 상태에서 표시되는 스켈레톤 UI입니다.

#### 구조

```
DashboardSkeleton
│
├── WelcomeSkeleton (환영 메시지 영역)
│
├── StatsGrid (통계 카드 4개)
│   └── StatCardSkeleton (반복)
│       ├── IconSkeleton
│       ├── LabelSkeleton
│       └── ValueSkeleton
│
├── Section (내 스터디)
│   ├── SectionHeaderSkeleton
│   └── StudiesGrid
│       └── StudyCardSkeleton (3개)
│
└── Section (최근 활동)
    ├── SectionHeaderSkeleton
    └── ActivitiesList
        └── ActivityItemSkeleton (5개)
```

#### 사용 예시

```jsx
if (isLoading) {
  return <DashboardSkeleton />
}
```

---

### EmptyState

**파일 위치:** `src/components/dashboard/EmptyState.jsx`

데이터가 없을 때 표시되는 UI입니다.

#### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `type` | `'studies' \| 'activities' \| 'notifications'` | `'studies'` | 타입별 기본 메시지 |
| `icon` | `string` | - | 커스텀 이모지 |
| `title` | `string` | - | 커스텀 제목 |
| `description` | `string` | - | 커스텀 설명 |
| `actionText` | `string` | - | 버튼 텍스트 |
| `actionHref` | `string` | - | 버튼 링크 |

#### 타입별 기본값

```javascript
const content = {
  studies: {
    emoji: '📚',
    title: '아직 참여 중인 스터디가 없어요',
    description: '지금 바로 스터디를 찾아보세요!',
    buttonText: '스터디 둘러보기',
    link: '/studies/explore'
  },
  activities: {
    emoji: '🔔',
    title: '아직 활동 내역이 없어요',
    description: '스터디에 참여하고 활동을 시작해보세요!',
    buttonText: '스터디 찾기',
    link: '/studies/explore'
  },
  notifications: {
    emoji: '📭',
    title: '알림이 없습니다',
    description: '새로운 알림이 오면 여기에 표시됩니다',
    buttonText: null,
    link: null
  }
}
```

#### 사용 예시

```jsx
// 타입 기반
<EmptyState type="studies" />

// 커스텀
<EmptyState
  icon="⚠️"
  title="데이터를 불러올 수 없습니다"
  description="잠시 후 다시 시도해주세요"
/>
```

---

### DashboardErrorBoundary

**파일 위치:** `src/components/dashboard/ErrorBoundary.jsx`

대시보드 전체를 감싸는 에러 경계입니다.

#### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `userId` | `string` | 에러 로깅용 사용자 ID |
| `children` | `ReactNode` | 자식 컴포넌트 |

#### 상태

```javascript
state = {
  hasError: false,
  error: null,
  errorInfo: null,
  errorCount: 0,
  lastErrorTime: null
}
```

#### 에러 빈도 추적

1분 내 3번 이상 에러 발생 시 경고 로깅

#### 폴백 UI

```
┌───────────────────────────────────────────┐
│                                           │
│               ⚠️                          │
│                                           │
│   대시보드를 불러오는 중 문제가 발생했습니다  │
│                                           │
│   ┌─────────────────────────────────┐     │
│   │          다시 시도              │     │
│   └─────────────────────────────────┘     │
│                                           │
│   ┌─────────────────────────────────┐     │
│   │        홈으로 이동              │     │
│   └─────────────────────────────────┘     │
│                                           │
└───────────────────────────────────────────┘
```

---

## 섹션 컴포넌트

### Section Header

```jsx
<div className={styles.sectionHeader}>
  <h2 className={styles.sectionTitle}>내 스터디</h2>
  <Link href="/my-studies" className={styles.sectionLink}>
    전체 보기 →
  </Link>
</div>
```

### Study Card

```jsx
<Link href={`/my-studies/${study.id}`} className={styles.studyCard}>
  <div className={styles.studyEmoji}>{study.emoji}</div>
  <h3 className={styles.studyName}>{study.name}</h3>
  <p className={styles.studyCategory}>{study.category}</p>
  <div className={styles.studyMeta}>
    <span className={styles.studyRole}>
      {study.role === 'OWNER' ? '👑 스터디장' : '👤 멤버'}
    </span>
    <span className={styles.studyMembers}>
      {study.memberCount}명
    </span>
  </div>
</Link>
```

### Activity Item

```jsx
<div className={`${styles.activityItem} ${!activity.isRead ? styles.unread : ''}`}>
  <div className={styles.activityIcon}>
    {activity.studyEmoji || '📢'}
  </div>
  <div className={styles.activityContent}>
    <p className={styles.activityMessage}>{activity.message}</p>
    {activity.studyName && (
      <p className={styles.activityStudy}>{activity.studyName}</p>
    )}
  </div>
  <div className={styles.activityTime}>
    {formatRelativeTime(activity.createdAt)}
  </div>
</div>
```

### Event Item

```jsx
<div className={styles.eventItem}>
  <div className={styles.eventDate}>
    <div className={styles.eventDay}>
      {new Date(event.date).getDate()}
    </div>
    <div className={styles.eventMonth}>
      {new Date(event.date).getMonth() + 1}월
    </div>
  </div>
  <div className={styles.eventContent}>
    <h4 className={styles.eventTitle}>
      {event.studyEmoji} {event.title}
    </h4>
    <p className={styles.eventStudy}>{event.studyName}</p>
    <p className={styles.eventTime}>
      {event.startTime} - {event.endTime}
    </p>
  </div>
</div>
```

---

## 스타일 클래스

### 레이아웃

```css
.container        /* 2-column grid 컨테이너 */
.mainContent      /* 메인 콘텐츠 영역 */
.sidebar          /* 우측 사이드바 (sticky) */
```

### 헤더

```css
.header           /* 페이지 헤더 */
.headerContent    /* 헤더 내용 */
.title            /* 페이지 제목 */
.subtitle         /* 페이지 부제목 */
```

### 환영 메시지

```css
.welcomeSection   /* 환영 섹션 */
.welcomeMessage   /* 환영 메시지 */
```

### 통계 카드

```css
.statsGrid        /* 통계 그리드 (4열) */
.statCard         /* 통계 카드 */
.statCard.blue    /* 파란색 카드 */
.statCard.green   /* 녹색 카드 */
.statCard.yellow  /* 노란색 카드 */
.statCard.purple  /* 보라색 카드 */
.statIcon         /* 통계 아이콘 */
.statLabel        /* 통계 라벨 */
.statValue        /* 통계 값 */
```

### 섹션

```css
.section          /* 섹션 컨테이너 */
.sectionHeader    /* 섹션 헤더 */
.sectionTitle     /* 섹션 제목 */
.sectionLink      /* 전체보기 링크 */
```

### 스터디 카드

```css
.studiesGrid      /* 스터디 그리드 */
.studyCard        /* 스터디 카드 */
.studyEmoji       /* 스터디 이모지 */
.studyName        /* 스터디 이름 */
.studyCategory    /* 스터디 카테고리 */
.studyMeta        /* 스터디 메타 정보 */
.studyRole        /* 역할 배지 */
.studyMembers     /* 멤버 수 */
```

### 활동 목록

```css
.activitiesList   /* 활동 목록 */
.activityItem     /* 활동 아이템 */
.activityItem.unread /* 읽지 않은 상태 */
.activityIcon     /* 활동 아이콘 */
.activityContent  /* 활동 내용 */
.activityMessage  /* 활동 메시지 */
.activityStudy    /* 스터디 이름 */
.activityTime     /* 시간 */
```

### 일정 목록

```css
.eventsList       /* 일정 목록 */
.eventItem        /* 일정 아이템 */
.eventDate        /* 날짜 영역 */
.eventDay         /* 일 */
.eventMonth       /* 월 */
.eventContent     /* 일정 내용 */
.eventTitle       /* 일정 제목 */
.eventStudy       /* 스터디 이름 */
.eventTime        /* 시간 */
```

---

## 유틸리티 함수

### formatRelativeTime

상대 시간 포맷팅

```javascript
function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  
  return date.toLocaleDateString('ko-KR')
}
```

### calculateDday

D-day 계산

```javascript
function calculateDday(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  
  date.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  
  const diff = date - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  
  return days
}
```

---

## 반응형 디자인

### 브레이크포인트

```css
/* 모바일 (< 768px) */
@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;  /* 1열 레이아웃 */
  }
  
  .sidebar {
    order: -1;  /* 사이드바를 위로 */
  }
  
  .statsGrid {
    grid-template-columns: repeat(2, 1fr);  /* 2열 */
  }
}

/* 태블릿 (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .container {
    grid-template-columns: 1fr minmax(280px, 25%);
  }
}

/* 데스크톱 (> 1024px) */
@media (min-width: 1024px) {
  .container {
    grid-template-columns: 1fr minmax(320px, 20%);
  }
}
```

