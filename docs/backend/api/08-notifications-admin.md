# 알림 & 관리자 API 명세

## 📋 개요
- 알림: 3개 API
- 관리자: 12개 API

---

## 🔔 알림 API (3개)

### 1. GET `/api/notifications` - 목록
**Query**:
- `?filter=unread` (all/unread/read)
- `?page=1&limit=20`

**Response**:
```json
{
  "data": [
    {
      "id": "notif-1",
      "type": "JOIN_APPROVED",
      "studyId": "study-1",
      "studyName": "알고리즘 스터디",
      "studyEmoji": "💻",
      "message": "가입이 승인되었습니다",
      "isRead": false,
      "createdAt": "2025-11-18T10:00:00Z"
    }
  ],
  "stats": {
    "total": 20,
    "unread": 10
  }
}
```

### 알림 타입 (8가지)
- `JOIN_APPROVED`: 가입 승인
- `NOTICE`: 새 공지
- `EVENT`: 일정 생성
- `TASK`: 할일 관련
- `FILE`: 파일 업로드
- `CHAT`: 채팅 메시지
- `KICK`: 강퇴
- `MEMBER`: 멤버 변동

### 2. POST `/api/notifications/[id]/read` - 읽음 처리
**Response**: `{ success: true }`

### 3. POST `/api/notifications/mark-all-read` - 모두 읽음
**Response**: `{ success: true, count: 10 }`

---

## 🛡️ 관리자 API (12개)

### 통계 (1개)

#### GET `/api/admin/stats`
**권한**: ADMIN+

**Response**:
```json
{
  "users": {
    "total": 100,
    "active": 95,
    "suspended": 3,
    "newToday": 5,
    "newThisWeek": 20
  },
  "studies": {
    "total": 50,
    "active": 45,
    "newToday": 2,
    "byCategory": [
      { "category": "프로그래밍", "count": 25 }
    ]
  },
  "tasks": {
    "total": 500,
    "completed": 200,
    "pending": 300
  },
  "reports": {
    "pending": 5,
    "urgent": 2
  }
}
```

---

### 사용자 관리 (4개)

#### 1. GET `/api/admin/users` - 목록
**Query**: `?search=kim&status=ACTIVE&role=USER&page=1`

#### 2. GET `/api/admin/users/[id]` - 상세
**Response**: 사용자 정보 + 스터디 목록 + 신고 이력

#### 3. POST `/api/admin/users/[id]/suspend` - 정지
**Body**:
```json
{
  "reason": "부적절한 행동",
  "days": 7 // 7일 정지
}
```

**자동**:
- `status` → `SUSPENDED`
- `suspendedUntil` 설정
- 정지 알림 생성

#### 4. POST `/api/admin/users/[id]/restore` - 정지 해제
**자동**: 복구 알림 생성

---

### 스터디 관리 (3개)

#### 1. GET `/api/admin/studies` - 목록
**Query**: `?search=알고리즘&category=프로그래밍`

#### 2. GET `/api/admin/studies/[id]` - 상세
**Response**: 스터디 정보 + 멤버 + 통계

#### 3. DELETE `/api/admin/studies/[id]` - 삭제
**CASCADE**: 모든 관련 데이터 삭제

---

### 신고 관리 (4개)

#### 1. GET `/api/admin/reports` - 목록
**Query**: `?status=PENDING&priority=URGENT`

**Response**:
```json
{
  "data": [
    {
      "id": "report-1",
      "type": "SPAM",
      "targetType": "USER",
      "targetId": "user-1",
      "content": "스팸 메시지 반복",
      "status": "PENDING",
      "priority": "HIGH",
      "reporter": { "name": "김민준" }
    }
  ]
}
```

#### 2. GET `/api/admin/reports/[id]` - 상세

#### 3. POST `/api/admin/reports/[id]/process` - 처리
**Body**:
```json
{
  "action": "suspend", // warn/suspend/delete/reject
  "resolution": "7일 정지 처리"
}
```

**action별 처리**:
- `warn`: 경고만
- `suspend`: 사용자 정지
- `delete`: 사용자/스터디/메시지 삭제
- `reject`: 신고 기각

---

## 🔒 관리자 권한

### 역할별 접근
```javascript
// ADMIN
- 사용자 정지/복구
- 스터디 삭제
- 신고 처리

// SYSTEM_ADMIN (최고 권리자)
- 모든 ADMIN 권한
- 다른 ADMIN 정지 가능
```

### 자기 보호
- 자기 자신 정지 불가
- SYSTEM_ADMIN은 일반 ADMIN이 정지 불가

---

## 🎨 관리자 대시보드 UI

### 통계 카드
```jsx
<StatCard
  icon="👥"
  label="전체 사용자"
  value={stats.users.total}
  trend="+5 오늘"
/>
```

### 긴급 신고 배지
```jsx
{reports.urgent > 0 && (
  <Badge color="red">긴급 {reports.urgent}</Badge>
)}
```

---

## 📝 Client Usage

### 관리자 통계
```javascript
import { useAdminStats } from '@/lib/hooks/useApi'

function AdminDashboard() {
  const { data } = useAdminStats()

  return (
    <div>
      <StatsCards stats={data} />
      <RecentReports />
      <UserGrowthChart />
    </div>
  )
}
```

### 사용자 정지
```javascript
function UserManagement() {
  const suspend = useSuspendUser()

  const handleSuspend = async (userId) => {
    await suspend.mutateAsync({
      userId,
      reason: '부적절한 행동',
      days: 7
    })
    toast.success('사용자가 정지되었습니다')
  }

  return <UserTable onSuspend={handleSuspend} />
}
```

---

**최종 업데이트**: 2025-11-18

