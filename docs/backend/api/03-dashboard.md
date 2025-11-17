# 대시보드 & 내 스터디 API 명세

## 📋 개요
- **Base URL**: `/api`
- **인증 필요**: ✅ 모든 엔드포인트
- **총 엔드포인트**: 2개

---

## 📊 1. 대시보드 데이터
**GET** `/api/dashboard`

종합 대시보드 데이터 (통계, 스터디, 활동, 일정)

### Response (200)
```json
{
  "success": true,
  "data": {
    "stats": {
      "activeStudies": 6,
      "pendingTasks": 10,
      "unreadNotifications": 10,
      "completedThisMonth": 5
    },
    "myStudies": [
      {
        "id": "study-1",
        "name": "알고리즘 마스터 스터디",
        "emoji": "💻",
        "category": "프로그래밍",
        "role": "OWNER",
        "memberCount": 15,
        "joinedAt": "2025-11-01T10:00:00.000Z"
      }
      // ... 최대 6개
    ],
    "recentActivities": [
      {
        "id": "notif-1",
        "type": "JOIN_APPROVED",
        "message": "React 심화 스터디 가입이 승인되었습니다",
        "studyName": "React 심화 스터디",
        "studyEmoji": "⚛️",
        "isRead": false,
        "createdAt": "2025-11-18T10:30:00.000Z"
      }
      // ... 최대 5개
    ],
    "upcomingEvents": [
      {
        "id": "event-1",
        "title": "주간 알고리즘 스터디",
        "date": "2025-11-19T00:00:00.000Z",
        "startTime": "19:00",
        "endTime": "21:00",
        "studyName": "알고리즘 마스터 스터디",
        "studyEmoji": "💻"
      }
      // ... 3일 이내, 최대 3개
    ]
  }
}
```

### 데이터 범위
- **myStudies**: 최대 6개 (최근 가입순)
- **recentActivities**: 최대 5개 (최신순)
- **upcomingEvents**: 3일 이내, 최대 3개

### 통계 계산
```javascript
stats: {
  activeStudies: count(studyMembers where status = 'ACTIVE'),
  pendingTasks: count(tasks where completed = false),
  unreadNotifications: count(notifications where isRead = false),
  completedThisMonth: count(tasks where completed = true AND completedAt >= startOfMonth)
}
```

---

## 📚 2. 내 스터디 목록
**GET** `/api/my-studies`

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `filter` | string | `all` | `all`, `owner`, `admin`, `pending` |
| `page` | number | `1` | 페이지 번호 |
| `limit` | number | `10` | 페이지당 개수 |

### Example Request
```
GET /api/my-studies?filter=owner&page=1&limit=10
```

### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "membershipId": "member-1",
      "role": "OWNER",
      "status": "ACTIVE",
      "joinedAt": "2025-11-01T10:00:00.000Z",
      "approvedAt": "2025-11-01T10:00:00.000Z",
      "study": {
        "id": "study-1",
        "name": "알고리즘 마스터 스터디",
        "emoji": "💻",
        "description": "매일 알고리즘 문제를 풀고...",
        "category": "프로그래밍",
        "subCategory": "알고리즘/코테",
        "maxMembers": 20,
        "currentMembers": 15,
        "isPublic": true,
        "isRecruiting": true,
        "tags": ["알고리즘", "코딩테스트"],
        "createdAt": "2025-10-01T10:00:00.000Z",
        "newMessages": 5,
        "newNotices": 2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 6,
    "totalPages": 1
  }
}
```

### Filter 옵션
- **all**: 모든 스터디 (ACTIVE + PENDING)
- **owner**: 내가 소유자인 스터디 (role = OWNER)
- **admin**: 내가 관리자인 스터디 (role = OWNER OR ADMIN)
- **pending**: 가입 대기 중 (status = PENDING)

### 새 콘텐츠 카운트
```javascript
newMessages: count(messages where createdAt >= now() - 24시간)
newNotices: count(notices where createdAt >= now() - 7일)
```

---

## 🎨 UI 활용 예시

### 대시보드 통계 카드
```jsx
const statsCards = [
  {
    icon: '📚',
    label: '활성 스터디',
    value: stats.activeStudies,
    color: 'blue'
  },
  {
    icon: '✅',
    label: '진행 중인 할일',
    value: stats.pendingTasks,
    color: 'green'
  },
  {
    icon: '🔔',
    label: '읽지 않은 알림',
    value: stats.unreadNotifications,
    color: 'yellow'
  },
  {
    icon: '🎯',
    label: '이번 달 완료',
    value: stats.completedThisMonth,
    color: 'purple'
  }
]
```

### 내 스터디 필터
```jsx
const filters = [
  { value: 'all', label: '전체' },
  { value: 'owner', label: '내가 만든' },
  { value: 'admin', label: '관리 중' },
  { value: 'pending', label: '가입 대기' }
]
```

---

## 🔄 실시간 업데이트

### Polling (권장)
```javascript
// 30초마다 대시보드 데이터 갱신
useQuery({
  queryKey: ['dashboard'],
  queryFn: fetchDashboard,
  refetchInterval: 30000
})
```

### 수동 갱신
```javascript
// 특정 액션 후 갱신
const queryClient = useQueryClient()

// 스터디 가입 후
queryClient.invalidateQueries(['dashboard'])
queryClient.invalidateQueries(['my-studies'])
```

---

## 📊 성능 최적화

### 대시보드 쿼리 최적화
```javascript
// Promise.all로 병렬 처리
const [stats, myStudies, activities, events] = await Promise.all([
  getStats(),
  getMyStudies(),
  getActivities(),
  getUpcomingEvents()
])
```

### 캐싱 전략
```javascript
// React Query 설정
{
  staleTime: 60 * 1000,  // 1분
  cacheTime: 5 * 60 * 1000  // 5분
}
```

---

## 📝 Client Usage 예시

### Dashboard
```javascript
import { useDashboard } from '@/lib/hooks/useApi'

function DashboardPage() {
  const { data, isLoading } = useDashboard()

  if (isLoading) return <DashboardSkeleton />

  const { stats, myStudies, recentActivities } = data.data

  return (
    <div>
      <StatsCards stats={stats} />
      <MyStudies studies={myStudies} />
      <RecentActivities activities={recentActivities} />
    </div>
  )
}
```

### My Studies
```javascript
import { useMyStudies } from '@/lib/hooks/useApi'

function MyStudiesPage() {
  const [filter, setFilter] = useState('all')
  const { data, isLoading } = useMyStudies({ filter })

  return (
    <div>
      <FilterButtons filter={filter} setFilter={setFilter} />
      <StudyList studies={data.data} />
      <Pagination pagination={data.pagination} />
    </div>
  )
}
```

---

**최종 업데이트**: 2025-11-18

