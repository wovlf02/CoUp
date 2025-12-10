# 대시보드 위젯 가이드

## 개요

대시보드 사이드바에 표시되는 위젯 컴포넌트들에 대한 상세 문서입니다.

**파일 위치:** `src/components/dashboard/widgets/`

---

## 위젯 레이아웃

### 사이드바 위젯 배치

```
┌──────────────────────────────────┐
│ 📊 스터디 현황                    │
│                                  │
│  🎯 다음 일정                     │
│  D-3                             │
│  12/15 (월) React 스터디          │
│                                  │
│  👥 출석률          85.0%        │
│  ████████░░                      │
│  7/8명 (이번 주)                  │
│                                  │
│  ✅ 할일 완료율      60.0%        │
│  ██████░░░░                      │
│  6/10개 완료                      │
│                                  │
│  🔥 연속 일수        7일          │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 👥 온라인 멤버            3명    │
│                                  │
│  🟢 김철수 (React 스터디)         │
│  🟢 이영희 (Node.js 스터디)       │
│  🟢 박지민 (Design 스터디)        │
│                                  │
│  📊 전체 멤버 (25명) →           │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ ⚡ 빠른 액션                      │
│                                  │
│  ┌────────────────────────────┐  │
│  │  💬 채팅 시작              │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  📹 화상 스터디            │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  📨 멤버 초대              │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 📌 고정 공지                      │
│                                  │
│  React 스터디                     │
│  이번 주 스터디 일정 안내         │
│  다음 주부터 시간이 변경됩니다... │
│                                  │
│  2시간 전                         │
│                                  │
│  자세히 보기 →                   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 🚨 급한 할일                 2개  │
│                                  │
│  🔴 D-0  프로젝트 제출            │
│         React 스터디   오늘까지   │
│                                  │
│  🟠 D-1  코드 리뷰                │
│         Node.js 스터디  내일까지  │
│                                  │
│  📋 전체 할일 보기 →             │
└──────────────────────────────────┘
```

---

## 위젯 컴포넌트

### StudyStatus (스터디 현황)

**파일 위치:** `src/components/dashboard/widgets/StudyStatus.jsx`

#### 기능
- 다음 일정 D-day 표시
- 출석률 진행바
- 할일 완료율 진행바
- 연속 참여 일수

#### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `stats` | `object` | `{}` | 통계 데이터 |
| `nextEvent` | `object \| null` | `null` | 다음 일정 정보 |
| `isLoading` | `boolean` | `false` | 로딩 상태 |

#### stats 객체

```typescript
interface WidgetStats {
  attendanceRate?: number
  attendedCount?: number
  totalAttendance?: number
  taskCompletionRate?: number
  completedTasks?: number
  totalTasks?: number
  streakDays?: number
}
```

#### nextEvent 객체

```typescript
interface NextEvent {
  dday: number
  date: string
  title: string
}
```

#### 안전한 퍼센트 계산

```javascript
function safePercentage(numerator, denominator) {
  if (!denominator || denominator === 0) return 0
  const result = (numerator / denominator) * 100
  return Math.min(Math.max(result, 0), 100)
}
```

#### 사용 예시

```jsx
<StudyStatus 
  stats={{
    attendedCount: 7,
    totalAttendance: 8,
    completedTasks: 6,
    totalTasks: 10,
    streakDays: 7
  }}
  nextEvent={{
    dday: 3,
    date: '12/15 (월)',
    title: 'React 스터디'
  }}
/>
```

---

### OnlineMembers (온라인 멤버)

**파일 위치:** `src/components/dashboard/widgets/OnlineMembers.jsx`

#### 기능
- 현재 온라인 멤버 목록
- 아바타 표시 (이미지 로드 실패 처리)
- 역할 배지 (👑 스터디장)
- 현재 활동 표시

#### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `members` | `array` | `[]` | 멤버 목록 |
| `totalMembers` | `number` | `0` | 전체 멤버 수 |
| `isLoading` | `boolean` | `false` | 로딩 상태 |

#### member 객체

```typescript
interface Member {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  currentActivity?: string
}
```

#### MemberAvatar 서브컴포넌트

이미지 로드 실패 시 이름 첫 글자로 대체

```jsx
const MemberAvatar = memo(function MemberAvatar({ member }) {
  const [imageError, setImageError] = useState(false)

  if (!member.avatar || imageError) {
    return (
      <div className={styles.avatarPlaceholder}>
        {member.name?.[0]?.toUpperCase() || '?'}
      </div>
    )
  }

  return (
    <Image 
      src={member.avatar} 
      alt={member.name}
      width={32}
      height={32}
      onError={() => setImageError(true)}
    />
  )
})
```

#### 사용 예시

```jsx
<OnlineMembers
  members={[
    { id: '1', name: '김철수', isOnline: true, role: 'OWNER' },
    { id: '2', name: '이영희', isOnline: true, role: 'MEMBER' },
  ]}
  totalMembers={25}
/>
```

---

### QuickActions (빠른 액션)

**파일 위치:** `src/components/dashboard/widgets/QuickActions.jsx`

#### 기능
- 채팅 시작 (링크)
- 화상 스터디 (버튼)
- 멤버 초대 (클립보드 복사)

#### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `isAdmin` | `boolean` | `false` | 관리자 여부 |

#### 클립보드 복사 (폴백 포함)

```javascript
const handleInvite = useCallback(async () => {
  const inviteLink = `${window.location.origin}/invite?code=SAMPLE`
  
  try {
    // 최신 Clipboard API
    await navigator.clipboard.writeText(inviteLink)
    alert('초대 링크가 복사되었습니다!')
  } catch (clipboardError) {
    // 폴백: execCommand 사용
    const textarea = document.createElement('textarea')
    textarea.value = inviteLink
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    
    alert('초대 링크가 복사되었습니다!')
  }
}, [])
```

---

### UrgentTasks (급한 할일)

**파일 위치:** `src/components/dashboard/widgets/UrgentTasks.jsx`

#### 기능
- 3일 이내 마감 할일 표시
- D-day 계산 및 색상 표시
- 긴급도에 따른 정렬

#### Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `tasks` | `array` | `[]` | 할일 목록 |
| `isLoading` | `boolean` | `false` | 로딩 상태 |

#### task 객체

```typescript
interface Task {
  id: string
  title: string
  dueDate: string
  completed: boolean
  studyName?: string
  studyEmoji?: string
}
```

#### 긴급도 색상

```javascript
function getUrgencyColor(daysUntilDue) {
  if (daysUntilDue === 0) return '🔴'  // 오늘
  if (daysUntilDue === 1) return '🟠'  // 내일
  if (daysUntilDue <= 3) return '🟡'  // 3일 이내
  return '🟢'                          // 3일 초과
}
```

#### 필터링 로직

```javascript
const urgentTasks = useMemo(() => {
  return (tasks || [])
    .filter(task => {
      if (task.completed) return false
      const daysUntilDue = calculateDaysUntilDue(task.dueDate)
      return daysUntilDue !== null && daysUntilDue <= 3
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)
}, [tasks])
```

---

### PinnedNotice (고정 공지)

**파일 위치:** `src/components/dashboard/widgets/PinnedNotice.jsx`

#### 기능
- 고정된 공지사항 표시
- 상대 시간 표시
- 내용 미리보기 (80자)

#### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `notice` | `object \| null` | 공지 데이터 |
| `isLoading` | `boolean` | 로딩 상태 |

#### notice 객체

```typescript
interface Notice {
  id: string
  title: string
  content: string
  studyId: string
  studyName: string
  createdAt: string
}
```

#### 텍스트 자르기

```javascript
function truncateText(text, maxLength = 80) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
```

---

## WidgetErrorBoundary

**파일 위치:** `src/components/dashboard/widgets/WidgetErrorBoundary.jsx`

개별 위젯의 에러를 격리하는 에러 경계입니다.

#### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `widgetName` | `string` | 위젯 이름 (에러 메시지용) |
| `children` | `ReactNode` | 자식 컴포넌트 |

#### 폴백 UI

```
┌──────────────────────────────────┐
│                                  │
│   ⚠️ {widgetName}을(를) 불러오는 │
│   중 오류가 발생했습니다         │
│                                  │
│   ┌────────────────────────┐     │
│   │      다시 시도         │     │
│   └────────────────────────┘     │
│                                  │
└──────────────────────────────────┘
```

#### 사용 예시

```jsx
<WidgetErrorBoundary widgetName="스터디 현황">
  <StudyStatus stats={stats} nextEvent={nextEvent} />
</WidgetErrorBoundary>
```

---

## WidgetSkeleton

**파일 위치:** `src/components/dashboard/widgets/WidgetSkeleton.jsx`

위젯별 로딩 스켈레톤입니다.

#### 컴포넌트 목록

```javascript
export { StudyStatusSkeleton }
export { OnlineMembersSkeleton }
export { QuickActionsSkeleton }
export { UrgentTasksSkeleton }
export { PinnedNoticeSkeleton }
```

---

## 위젯 스타일

**파일 위치:** `src/components/dashboard/widgets/Widget.module.css`

### 공통 스타일

```css
.widget                /* 위젯 컨테이너 */
.widgetTitle           /* 위젯 제목 */
.widgetHeader          /* 위젯 헤더 (제목 + 배지) */
.widgetLink            /* 위젯 하단 링크 */
.badge                 /* 숫자 배지 */
.emptyState            /* 빈 상태 */
```

### StudyStatus 스타일

```css
.nextEvent             /* 다음 일정 영역 */
.eventLabel            /* 일정 라벨 */
.eventDday             /* D-day 숫자 */
.eventDate             /* 일정 날짜 */
.eventTitle            /* 일정 제목 */
.emptyEvent            /* 일정 없음 */

.statItem              /* 통계 아이템 */
.statLabel             /* 통계 라벨 */
.statValue             /* 통계 값 */
.statDetail            /* 통계 상세 */
.progressBar           /* 진행바 배경 */
.progressFill          /* 진행바 채우기 */

.streakSection         /* 연속 일수 영역 */
.streakIcon            /* 연속 아이콘 */
.streakValue           /* 연속 값 */
```

### OnlineMembers 스타일

```css
.membersList           /* 멤버 목록 */
.memberItem            /* 멤버 아이템 */
.memberAvatar          /* 아바타 영역 */
.avatarPlaceholder     /* 아바타 플레이스홀더 */
.onlineIndicator       /* 온라인 표시 */
.memberInfo            /* 멤버 정보 */
.memberName            /* 멤버 이름 */
.roleBadge             /* 역할 배지 */
.memberActivity        /* 현재 활동 */
```

### QuickActions 스타일

```css
.actionButtons         /* 액션 버튼 컨테이너 */
.actionButton          /* 액션 버튼 */
```

### UrgentTasks 스타일

```css
.tasksList             /* 할일 목록 */
.taskItem              /* 할일 아이템 */
.taskUrgency           /* 긴급도 아이콘 */
.taskContent           /* 할일 내용 */
.taskTitle             /* 할일 제목 */
.taskMeta              /* 할일 메타 */
.taskDueDate           /* 마감일 */
```

### PinnedNotice 스타일

```css
.noticeHeader          /* 공지 헤더 */
.noticeStudy           /* 스터디 이름 */
.noticeTitle           /* 공지 제목 */
.noticeContent         /* 공지 내용 미리보기 */
.noticeTime            /* 작성 시간 */
```

---

## 메모이제이션

모든 위젯 컴포넌트는 `memo`로 래핑되어 불필요한 리렌더링을 방지합니다.

```javascript
const StudyStatusComponent = memo(function StudyStatusComponent({ stats, nextEvent, isLoading }) {
  // ...
})

export default StudyStatusComponent
```

### useMemo 사용

```javascript
// OnlineMembers - 온라인 필터링
const onlineMembers = useMemo(() => {
  return (members || []).filter(m => m.isOnline)
}, [members])

// UrgentTasks - 급한 할일 필터링
const urgentTasks = useMemo(() => {
  return (tasks || [])
    .filter(task => !task.completed && calculateDaysUntilDue(task.dueDate) <= 3)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)
}, [tasks])
```

---

## 에러 처리

### 안전한 날짜 처리

```javascript
function formatRelativeTime(dateString) {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return '날짜 오류'
    }
    // ... 정상 처리
  } catch (error) {
    return '날짜 오류'
  }
}
```

### 기본값 사용

```javascript
const attendanceRate = safePercentage(
  stats?.attendedCount || 0,
  stats?.totalAttendance || 0
)
```

