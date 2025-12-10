# 대시보드 API 레퍼런스

## 개요

대시보드 관련 API 엔드포인트에 대한 상세 문서입니다.

---

## API 구조 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        /api/dashboard/* API 구조                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        GET /api/dashboard                          │  │
│  │                                                                    │  │
│  │  메인 대시보드 데이터 (통합)                                       │  │
│  │                                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ Promise.allSettled (병렬 쿼리)                               │  │  │
│  │  │                                                              │  │  │
│  │  │ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐    │  │  │
│  │  │ │ 활성      │ │ 할일      │ │ 알림      │ │ 완료      │    │  │  │
│  │  │ │ 스터디 수 │ │ 수        │ │ 수        │ │ 할일 수   │    │  │  │
│  │  │ └───────────┘ └───────────┘ └───────────┘ └───────────┘    │  │  │
│  │  │                                                              │  │  │
│  │  │ ┌───────────┐ ┌───────────┐ ┌───────────┐                   │  │  │
│  │  │ │ 내 스터디 │ │ 최근 활동 │ │ 다가오는  │                   │  │  │
│  │  │ │ (6개)     │ │ (5개)     │ │ 일정 (3개)│                   │  │  │
│  │  │ └───────────┘ └───────────┘ └───────────┘                   │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                    │  │
│  │  반환: { stats, myStudies, recentActivities, upcomingEvents }     │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                   세부 API 엔드포인트                              │  │
│  │                                                                    │  │
│  │  ┌──────────────────┐                                             │  │
│  │  │ GET /statistics  │ ─────────────────────────────────────────┐  │  │
│  │  │                  │                                           │  │  │
│  │  │ 상세 통계        │  type: STUDY | TASK | NOTIFICATION |     │  │  │
│  │  │                  │        ACTIVITY | OVERVIEW               │  │  │
│  │  │                  │  period: TODAY | THIS_WEEK | THIS_MONTH  │  │  │
│  │  └──────────────────┘                                           │  │  │
│  │                                                                    │  │
│  │  ┌──────────────────┐                                             │  │
│  │  │ GET /summary     │ ─────────────────────────────────────────┘  │  │
│  │  │                  │                                              │  │
│  │  │ 요약 데이터      │  스터디/할일/알림 요약                       │  │
│  │  └──────────────────┘                                              │  │
│  │                                                                    │  │
│  │  ┌──────────────────┐                                             │  │
│  │  │ GET/PATCH        │                                              │  │
│  │  │ /widgets         │  위젯 설정 조회/수정                         │  │
│  │  └──────────────────┘                                              │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 엔드포인트 목록

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| GET | `/api/dashboard` | 메인 대시보드 데이터 | ✅ |
| GET | `/api/dashboard/statistics` | 상세 통계 데이터 | ✅ |
| GET | `/api/dashboard/summary` | 요약 데이터 | ✅ |
| GET | `/api/dashboard/widgets` | 위젯 설정 조회 | ✅ |
| PATCH | `/api/dashboard/widgets` | 위젯 설정 수정 | ✅ |
| GET | `/api/dashboard/recent-activities` | 최근 활동 | ✅ |
| GET | `/api/dashboard/upcoming-schedules` | 다가오는 일정 | ✅ |

---

## GET /api/dashboard

메인 대시보드 데이터를 조회합니다.

### 요청

**Headers:**
```
Cookie: next-auth.session-token=...
```

**Query Parameters:**
| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `period` | `string` | - | 기간 타입 (선택) |
| `startDate` | `string` | - | 시작일 (선택) |
| `endDate` | `string` | - | 종료일 (선택) |

### 응답

**성공 (200 OK):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "activeStudies": 3,
      "pendingTasks": 5,
      "unreadNotifications": 2,
      "completedThisMonth": 12
    },
    "myStudies": [
      {
        "id": "cluxxxxxxxxx",
        "name": "React 스터디",
        "emoji": "📚",
        "category": "프론트엔드",
        "role": "OWNER",
        "memberCount": 8,
        "joinedAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "recentActivities": [
      {
        "id": "clnxxxxxxxxx",
        "type": "NOTICE",
        "message": "새로운 공지가 등록되었습니다",
        "studyName": "React 스터디",
        "studyEmoji": "📚",
        "isRead": false,
        "createdAt": "2025-12-11T10:00:00.000Z"
      }
    ],
    "upcomingEvents": [
      {
        "id": "clexxxxxxxxx",
        "title": "정기 모임",
        "date": "2025-12-15T00:00:00.000Z",
        "startTime": "14:00",
        "endTime": "16:00",
        "studyName": "React 스터디",
        "studyEmoji": "📚"
      }
    ],
    "widgetData": {
      "stats": {
        "attendanceRate": 85.0,
        "attendedCount": 7,
        "totalAttendance": 8,
        "taskCompletionRate": 60.0,
        "completedTasks": 6,
        "totalTasks": 10,
        "streakDays": 7
      },
      "nextEvent": {
        "dday": 3,
        "date": "12/15 (월)",
        "title": "React 스터디"
      },
      "onlineMembers": [],
      "totalMembers": 25,
      "pinnedNotice": null,
      "urgentTasks": []
    }
  }
}
```

### 부분 실패 처리

일부 쿼리가 실패해도 기본값으로 응답합니다.

```javascript
const [activeStudyCount, taskCount, ...] = await Promise.allSettled([...])

const stats = {
  activeStudies: activeStudyCount.status === 'fulfilled'
    ? activeStudyCount.value
    : 0,  // 실패 시 기본값
  // ...
}
```

---

## GET /api/dashboard/statistics

상세 통계 데이터를 조회합니다.

### 요청

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `type` | `string` | ✅ | 통계 타입 |
| `period` | `string` | - | 기간 타입 |
| `startDate` | `string` | - | 시작일 (CUSTOM 시 필수) |
| `endDate` | `string` | - | 종료일 (CUSTOM 시 필수) |
| `studyId` | `string` | - | 특정 스터디 ID |
| `aggregation` | `string` | - | 집계 타입 |

**type 값:**
- `STUDY` - 스터디 통계
- `TASK` - 할일 통계
- `NOTIFICATION` - 알림 통계
- `ACTIVITY` - 활동 통계
- `OVERVIEW` - 전체 개요

**period 값:**
- `TODAY` - 오늘
- `THIS_WEEK` - 이번 주
- `THIS_MONTH` - 이번 달
- `THIS_YEAR` - 올해
- `CUSTOM` - 커스텀 기간

**aggregation 값:**
- `DAY` - 일별
- `WEEK` - 주별
- `MONTH` - 월별
- `YEAR` - 연별

### 응답

```json
{
  "success": true,
  "data": {
    "type": "STUDY",
    "data": [...],
    "summary": {
      "total": 10,
      "active": 3,
      "inactive": 7
    },
    "period": {
      "startDate": "2025-12-01",
      "endDate": "2025-12-11"
    }
  }
}
```

---

## GET /api/dashboard/summary

대시보드 요약 데이터를 조회합니다.

### 응답

```json
{
  "success": true,
  "data": {
    "studies": {
      "active": 3,
      "total": 5
    },
    "tasks": {
      "pending": 5,
      "completed": 12,
      "total": 17,
      "completionRate": 70.6
    },
    "notifications": {
      "unread": 2
    }
  }
}
```

---

## GET /api/dashboard/widgets

위젯 설정을 조회합니다.

### 응답

```json
{
  "success": true,
  "data": {
    "widgets": [
      {
        "id": "statistics",
        "type": "statistics",
        "title": "통계",
        "enabled": true,
        "order": 1
      },
      {
        "id": "my-studies",
        "type": "study-list",
        "title": "내 스터디",
        "enabled": true,
        "order": 2
      }
    ],
    "lastUpdated": "2025-12-11T00:00:00.000Z",
    "defaultWidgets": [...]
  }
}
```

---

## PATCH /api/dashboard/widgets

위젯 설정을 수정합니다.

### 요청

```json
{
  "widgets": [
    {
      "id": "statistics",
      "enabled": true,
      "order": 1
    },
    {
      "id": "my-studies",
      "enabled": false,
      "order": 2
    }
  ]
}
```

### 응답

```json
{
  "success": true,
  "message": "위젯 설정이 저장되었습니다"
}
```

---

## 에러 응답

### 공통 에러 형식

```json
{
  "success": false,
  "error": {
    "code": "DASH-001",
    "message": "로그인이 필요합니다",
    "statusCode": 401
  }
}
```

### 에러 코드

| 코드 | 설명 | HTTP 상태 |
|------|------|-----------|
| DASH-001 | 인증 필요 | 401 |
| DASH-002 | 세션 만료 | 401 |
| DASH-003 | 유효하지 않은 세션 | 401 |
| DASH-010 | 날짜 형식 오류 | 400 |
| DASH-011 | 날짜 범위 오류 | 400 |
| DASH-012 | 유효하지 않은 기간 | 400 |
| DASH-020 | 유효하지 않은 위젯 타입 | 400 |
| DASH-021 | 유효하지 않은 통계 타입 | 400 |
| DASH-030 | 스터디 접근 권한 없음 | 403 |
| DASH-040 | 데이터 조회 실패 | 500 |
| DASH-041 | 데이터베이스 오류 | 500 |

---

## React Query Hook

### useDashboard

```javascript
import { useDashboard } from '@/lib/hooks/useApi'

function DashboardClient() {
  const { data, isLoading, error, refetch } = useDashboard()
  
  if (isLoading) return <DashboardSkeleton />
  if (error) return <ErrorState />
  
  const { stats, myStudies, recentActivities, upcomingEvents } = data.data
  
  // ...
}
```

### Hook 설정

```javascript
export function useDashboard(options = {}) {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard'),
    
    refetchInterval: 30000,           // 30초마다 갱신
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    
    staleTime: 20000,                 // 20초 신선도
    gcTime: 5 * 60 * 1000,            // 5분 캐시
    
    retry: 3,
    retryDelay: (attemptIndex) => 
      Math.min(1000 * 2 ** attemptIndex, 30000),
    
    ...options
  })
}
```

---

## 헬퍼 함수

### withDashboardErrorHandler

API 라우트 에러 핸들러 래퍼

```javascript
export const GET = withDashboardErrorHandler(async (request) => {
  const session = await getServerSession(authOptions)
  const user = validateSession(session)
  
  // 비즈니스 로직
  
  return NextResponse.json(
    createSuccessResponse(data, '조회 성공'),
    { status: 200 }
  )
})
```

### createSuccessResponse

성공 응답 생성

```javascript
export function createSuccessResponse(data, message = '성공') {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }
}
```

### validateSession

세션 검증

```javascript
export function validateSession(session) {
  if (!session || !session.user || !session.user.id) {
    throw DashboardException.authenticationRequired()
  }
  return session.user
}
```

---

## 성능 최적화

### 병렬 쿼리

```javascript
const [
  activeStudyCount,
  taskCount,
  unreadNotificationCount,
  completedTaskCount
] = await Promise.allSettled([
  prisma.studyMember.count({ where: { userId, status: 'ACTIVE' } }),
  prisma.task.count({ where: { userId, completed: false } }),
  prisma.notification.count({ where: { userId, isRead: false } }),
  prisma.task.count({ where: { userId, completed: true, ... } })
])
```

### 부분 실패 허용

```javascript
const failedQueries = []

const stats = {
  activeStudies: activeStudyCount.status === 'fulfilled'
    ? activeStudyCount.value
    : (() => { failedQueries.push('activeStudies'); return 0; })(),
  // ...
}

if (failedQueries.length > 0) {
  logDashboardWarning('통계 쿼리 부분 실패', { failedQueries })
}
```

### 데이터 검증

```javascript
const validation = validateDashboardData(responseData)
if (!validation.valid) {
  logDashboardWarning('데이터 검증 실패', { errors: validation.errors })
}
```

