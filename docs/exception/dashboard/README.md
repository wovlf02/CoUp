# 대시보드 예외 처리 문서

CoUp 프로젝트의 대시보드 시스템에서 발생할 수 있는 모든 예외 상황과 처리 방법을 문서화합니다.

---

## 📋 목차

1. [개요](#개요)
2. [문서 구조](#문서-구조)
3. [예외 처리 원칙](#예외-처리-원칙)
4. [문서 목록](#문서-목록)
5. [빠른 참조](#빠른-참조)

---

## 개요

### 대시보드 시스템 구성

CoUp의 대시보드는 사용자가 로그인 후 가장 먼저 보게 되는 페이지로, 사용자의 활동 현황을 한눈에 보여줍니다:

- **React Query** - 데이터 페칭 및 캐싱
- **Server Components + Client Components** - 하이브리드 렌더링
- **실시간 위젯** - 동적 데이터 업데이트
- **Prisma ORM** - 데이터베이스 쿼리

### 주요 기능

1. **통계 카드** ✅
   - 활성 스터디 수
   - 진행 중인 할일 수
   - 읽지 않은 알림 수
   - 이번 달 완료 수

2. **내 스터디 섹션** ✅
   - 최근 가입한 스터디 목록 (최대 6개)
   - 스터디별 멤버 수 및 역할 표시
   - 빈 상태 처리

3. **최근 활동** ✅
   - 최근 5개 알림
   - 읽음/안 읽음 상태
   - 시간 표시

4. **다가오는 일정** ✅
   - 3일 이내 일정
   - D-day 표시
   - 스터디별 구분

5. **실시간 위젯** 🚧
   - StudyStatus: 출석률, 할일 완료율
   - OnlineMembers: 현재 온라인 멤버
   - QuickActions: 빠른 액션
   - UrgentTasks: 긴급 할일
   - PinnedNotice: 고정 공지

---

## 문서 구조

```
docs/exception/dashboard/
├── README.md                           # 이 문서
├── INDEX.md                            # 증상별/카테고리별 색인
├── 01-data-loading-exceptions.md       # 데이터 로딩 예외
├── 02-widget-exceptions.md             # 위젯 관련 예외
├── 03-real-time-sync-exceptions.md     # 실시간 동기화 예외
├── 04-empty-states.md                  # 빈 상태 처리
├── 05-performance-optimization.md      # 성능 최적화
├── 99-best-practices.md                # 모범 사례
└── COMPLETION-REPORT.md                # 완료 보고서
```

---

## 예외 처리 원칙

### 1. 사용자 친화적 UI

❌ **나쁜 예**:
```jsx
if (error) {
  return <div>Error: {error.message}</div>
}
```

✅ **좋은 예**:
```jsx
if (error) {
  return (
    <ErrorState 
      title="데이터를 불러올 수 없습니다"
      description="잠시 후 다시 시도해주세요"
      onRetry={() => refetch()}
    />
  )
}
```

### 2. 점진적 로딩 (Progressive Loading)

**전체 페이지를 차단하지 않음**:

❌ **나쁜 예**:
```jsx
// 하나라도 실패하면 전체 페이지 에러
const { data: dashboardData } = useDashboard()
if (!dashboardData) return <Error />
```

✅ **좋은 예**:
```jsx
// 각 섹션별 독립적 로딩
const { data: stats } = useStats()
const { data: studies } = useMyStudies()
const { data: activities } = useActivities()

// 일부만 실패해도 나머지는 표시
return (
  <>
    {stats ? <StatsCards data={stats} /> : <StatsSkeleton />}
    {studies ? <StudiesList data={studies} /> : <StudiesSkeleton />}
    {activities ? <ActivitiesList data={activities} /> : <ActivitiesSkeleton />}
  </>
)
```

### 3. 낙관적 UI (Optimistic UI)

**즉각적인 피드백 제공**:

```jsx
const { mutate: markAsRead } = useMutation({
  mutationFn: (id) => api.post(`/api/notifications/${id}/read`),
  // 낙관적 업데이트
  onMutate: async (id) => {
    // 이전 데이터 백업
    await queryClient.cancelQueries(['dashboard'])
    const previousData = queryClient.getQueryData(['dashboard'])
    
    // 즉시 UI 업데이트
    queryClient.setQueryData(['dashboard'], (old) => ({
      ...old,
      recentActivities: old.recentActivities.map(activity =>
        activity.id === id ? { ...activity, isRead: true } : activity
      )
    }))
    
    return { previousData }
  },
  // 실패 시 롤백
  onError: (err, id, context) => {
    queryClient.setQueryData(['dashboard'], context.previousData)
  }
})
```

### 4. 스켈레톤 UI

**빈 화면 대신 로딩 스켈레톤 사용**:

```jsx
if (isLoading) {
  return <DashboardSkeleton />  // ✅ 구조를 유지하며 로딩 표시
}

// ❌ 이렇게 하지 마세요
if (isLoading) {
  return <div>Loading...</div>  // 갑작스러운 레이아웃 변화
}
```

---

## 문서 목록

### 핵심 문서

- **[INDEX.md](./INDEX.md)** - 증상별/카테고리별 빠른 찾기
- **[01-data-loading-exceptions.md](./01-data-loading-exceptions.md)** - API 요청 실패, 타임아웃, 부분 로딩
- **[02-widget-exceptions.md](./02-widget-exceptions.md)** - 위젯별 예외 처리
- **[03-real-time-sync-exceptions.md](./03-real-time-sync-exceptions.md)** - React Query 캐싱, WebSocket
- **[04-empty-states.md](./04-empty-states.md)** - 빈 상태 UI/UX
- **[05-performance-optimization.md](./05-performance-optimization.md)** - 렌더링 최적화, 메모리 관리

### 참고 문서

- **[99-best-practices.md](./99-best-practices.md)** - 대시보드 모범 사례
- **[COMPLETION-REPORT.md](./COMPLETION-REPORT.md)** - Phase 1 완료 보고서

---

## 빠른 참조

### 🔴 긴급 문제 해결

| 증상 | 원인 | 해결 문서 |
|------|------|----------|
| "데이터를 불러올 수 없습니다" | API 요청 실패 | [01-data-loading-exceptions.md](./01-data-loading-exceptions.md#api-요청-실패) |
| 통계 카드가 0으로 표시됨 | 데이터베이스 쿼리 오류 | [01-data-loading-exceptions.md](./01-data-loading-exceptions.md#부분-데이터-로딩) |
| 위젯이 로딩되지 않음 | 위젯 데이터 누락 | [02-widget-exceptions.md](./02-widget-exceptions.md) |
| 페이지가 계속 로딩 중 | 무한 로딩 루프 | [01-data-loading-exceptions.md](./01-data-loading-exceptions.md#무한-로딩) |
| 데이터가 업데이트 안 됨 | 캐시 무효화 실패 | [03-real-time-sync-exceptions.md](./03-real-time-sync-exceptions.md#캐시-동기화) |

### ⚠️ 일반적인 문제

| 증상 | 원인 | 해결 문서 |
|------|------|----------|
| 스터디 목록이 비어있음 | 신규 사용자 | [04-empty-states.md](./04-empty-states.md#스터디-없음) |
| 로딩이 느림 | 불필요한 리렌더링 | [05-performance-optimization.md](./05-performance-optimization.md#렌더링-최적화) |
| 메모리 사용량 증가 | 메모리 누수 | [05-performance-optimization.md](./05-performance-optimization.md#메모리-관리) |
| Stale 데이터 표시 | 캐시 설정 문제 | [03-real-time-sync-exceptions.md](./03-real-time-sync-exceptions.md#stale-데이터) |

### 📚 카테고리별 찾기

- **API 관련**: [01-data-loading-exceptions.md](./01-data-loading-exceptions.md)
- **UI 관련**: [02-widget-exceptions.md](./02-widget-exceptions.md), [04-empty-states.md](./04-empty-states.md)
- **성능 관련**: [05-performance-optimization.md](./05-performance-optimization.md)
- **실시간 관련**: [03-real-time-sync-exceptions.md](./03-real-time-sync-exceptions.md)

---

## 아키텍처

### 데이터 흐름

```
┌─────────────────┐
│  Dashboard Page │ (Server Component)
│  page.jsx       │
└────────┬────────┘
         │ getSession()
         ▼
┌─────────────────────────┐
│  DashboardClient        │ (Client Component)
│  DashboardClient.jsx    │
└────────┬────────────────┘
         │ useDashboard()
         │ useMe()
         ▼
┌─────────────────────────┐
│  React Query            │
│  useApi.js              │
└────────┬────────────────┘
         │ GET /api/dashboard
         ▼
┌─────────────────────────┐
│  API Route              │
│  /api/dashboard/route.js│
└────────┬────────────────┘
         │ Prisma queries
         ▼
┌─────────────────────────┐
│  Database               │
│  PostgreSQL             │
└─────────────────────────┘
```

### 컴포넌트 계층 구조

```
DashboardClient
├── DashboardSkeleton (로딩 상태)
├── EmptyState (빈 상태)
├── StatsCards (통계 카드)
├── MyStudies (내 스터디)
│   └── EmptyState (스터디 없음)
├── RecentActivities (최근 활동)
│   └── EmptyState (활동 없음)
├── UpcomingEvents (다가오는 일정)
└── Widgets (위젯들)
    ├── StudyStatus
    ├── OnlineMembers
    ├── QuickActions
    ├── UrgentTasks
    └── PinnedNotice
```

---

## API 엔드포인트

### GET /api/dashboard

**요청**:
```http
GET /api/dashboard
Authorization: Bearer <session-token>
```

**응답 (성공)**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "activeStudies": 3,
      "pendingTasks": 5,
      "unreadNotifications": 12,
      "completedThisMonth": 8
    },
    "myStudies": [
      {
        "id": 1,
        "name": "알고리즘 스터디",
        "emoji": "💻",
        "category": "코딩",
        "role": "MEMBER",
        "memberCount": 5,
        "joinedAt": "2025-11-01T00:00:00.000Z"
      }
    ],
    "recentActivities": [
      {
        "id": 1,
        "type": "TASK_ASSIGNED",
        "message": "새로운 할일이 배정되었습니다",
        "studyName": "알고리즘 스터디",
        "studyEmoji": "💻",
        "isRead": false,
        "createdAt": "2025-11-29T08:00:00.000Z"
      }
    ],
    "upcomingEvents": [
      {
        "id": 1,
        "title": "주간 미팅",
        "date": "2025-11-30T10:00:00.000Z",
        "studyName": "알고리즘 스터디",
        "studyEmoji": "💻"
      }
    ]
  }
}
```

**응답 (실패)**:
```json
{
  "error": "대시보드 데이터를 가져오는 중 오류가 발생했습니다"
}
```

---

## 주요 파일

### 서버 컴포넌트
- `coup/src/app/dashboard/page.jsx` - 대시보드 메인 페이지

### 클라이언트 컴포넌트
- `coup/src/components/dashboard/DashboardClient.jsx` - 메인 클라이언트
- `coup/src/components/dashboard/DashboardSkeleton.jsx` - 로딩 스켈레톤
- `coup/src/components/dashboard/EmptyState.jsx` - 빈 상태

### 위젯
- `coup/src/components/dashboard/widgets/StudyStatus.jsx`
- `coup/src/components/dashboard/widgets/OnlineMembers.jsx`
- `coup/src/components/dashboard/widgets/QuickActions.jsx`
- `coup/src/components/dashboard/widgets/UrgentTasks.jsx`
- `coup/src/components/dashboard/widgets/PinnedNotice.jsx`

### API
- `coup/src/app/api/dashboard/route.js` - 대시보드 API

### Hooks
- `coup/src/lib/hooks/useApi.js` - React Query 훅

---

## 관련 문서

- [인증 예외 처리](../auth/README.md) - 로그인/세션 관련
- [스터디 관리 예외 처리](../studies/README.md) - 스터디 CRUD
- [할일 관리 예외 처리](../tasks/README.md) - 할일 관리

---

## 문서 작성 기준

- ✅ 실제 코드 기반 예제
- ✅ Before/After 비교
- ✅ 실행 가능한 해결 방법
- ✅ 디버깅 스크립트 제공
- ✅ 테스트 케이스 포함

---

**작성일**: 2025-11-29  
**버전**: 1.0.0  
**작성자**: CoUp 개발팀

