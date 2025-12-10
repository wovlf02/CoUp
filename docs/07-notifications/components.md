# 알림 컴포넌트 가이드

## 개요

알림 도메인의 UI 컴포넌트에 대한 상세 문서입니다.

---

## 페이지 레이아웃

### 알림 페이지 전체 레이아웃

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    NotificationHeader                                 │ │
│  │                                                                       │ │
│  │  🔔 알림                                                              │ │
│  │  전체 45  |  읽지 않음 7  |  읽음 38                                  │ │
│  │                                                                       │ │
│  │                            [모두 읽음 처리]  [읽은 알림 삭제]         │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    NotificationFilters                                │ │
│  │                                                                       │ │
│  │  [전체] [읽지 않음 (7)] [읽음]          [알림 유형 ▼]                 │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    NotificationList                                   │ │
│  │                                                                       │ │
│  │  📅 오늘                                                              │ │
│  │                                                                       │ │
│  │  ┌───────────────────────────────────────────────────────────────┐   │ │
│  │  │ ●  [가입승인] 💻 알고리즘 스터디                      [삭제]  │   │ │
│  │  │                                                               │   │ │
│  │  │    알고리즘 스터디에 가입이 승인되었습니다!                   │   │ │
│  │  │                                                      5분 전   │   │ │
│  │  └───────────────────────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  │  ┌───────────────────────────────────────────────────────────────┐   │ │
│  │  │ ○  [공지] 📚 독서 모임                         [읽음][삭제]   │   │ │
│  │  │                                                               │   │ │
│  │  │    새로운 공지가 등록되었습니다: 1월 독서 목록                │   │ │
│  │  │                                                     1시간 전   │   │ │
│  │  └───────────────────────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  │  📅 어제                                                              │ │
│  │                                                                       │ │
│  │  ┌───────────────────────────────────────────────────────────────┐   │ │
│  │  │ ○  [파일] 🌍 영어 스터디                       [읽음][삭제]   │   │ │
│  │  │                                                               │   │ │
│  │  │    새 파일이 업로드되었습니다: 영어회화_자료.pdf              │   │ │
│  │  │                                                         어제   │   │ │
│  │  └───────────────────────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  │  📅 이번 주                                                           │ │
│  │                                                                       │ │
│  │  ┌───────────────────────────────────────────────────────────────┐   │ │
│  │  │ ○  [일정] 💰 투자 스터디                       [읽음][삭제]   │   │ │
│  │  │                                                               │   │ │
│  │  │    새 일정이 등록되었습니다: 주간 미팅                        │   │ │
│  │  │                                                      3일 전   │   │ │
│  │  └───────────────────────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    Toast (성공/에러 메시지)                           │ │
│  │                                                                       │ │
│  │                          ✓ 5개 알림을 읽음 처리했습니다               │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 알림 카드 상세 구조

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ● / ○     [타입 배지]    📚 스터디 이름                  [읽음]  [삭제]   │
│  (읽지않음/읽음)                                                            │
│                                                                             │
│  알림 메시지 내용...                                                        │
│                                                                             │
│                                                              5분 전 / 어제  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 페이지 컴포넌트

### NotificationsPage

**경로:** `/notifications`

**파일 위치:** `src/app/notifications/page.jsx`

#### 구조

```javascript
export default function NotificationsPage() {
  const router = useRouter()
  
  const {
    notifications,
    groupedNotifications,
    stats,
    activeTypes,
    isLoading,
    deletingIds,
    toast,
    filter,
    typeFilter,
    setFilter,
    setTypeFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications
  } = useNotifications()

  // 알림 클릭 핸들러
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  return (
    <div className={styles.container}>
      <Toast message={toast.message} isVisible={toast.isVisible} type={toast.type} />
      
      <NotificationHeader
        stats={stats}
        onMarkAllRead={markAllAsRead}
        onDeleteRead={deleteReadNotifications}
      />
      
      <NotificationFilters
        filter={filter}
        typeFilter={typeFilter}
        stats={stats}
        activeTypes={activeTypes}
        onFilterChange={setFilter}
        onTypeFilterChange={setTypeFilter}
      />
      
      <main className={styles.content}>
        {isLoading ? (
          <NotificationSkeleton count={5} />
        ) : notifications.length === 0 ? (
          <EmptyState filter={filter} typeFilter={typeFilter} />
        ) : (
          <NotificationList
            groupedNotifications={groupedNotifications}
            deletingIds={deletingIds}
            onRead={markAsRead}
            onDelete={deleteNotification}
            onClick={handleNotificationClick}
          />
        )}
      </main>
    </div>
  )
}
```

---

## 공통 컴포넌트

### NotificationHeader

**파일 위치:** `src/app/notifications/components/NotificationHeader.jsx`

헤더 영역으로 통계와 액션 버튼을 표시합니다.

#### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `stats` | `Stats` | 알림 통계 객체 |
| `onMarkAllRead` | `function` | 전체 읽음 처리 핸들러 |
| `onDeleteRead` | `function` | 읽은 알림 삭제 핸들러 |

#### 구조

```javascript
function NotificationHeader({ stats, onMarkAllRead, onDeleteRead }) {
  return (
    <header className={styles.header}>
      <div className={styles.titleSection}>
        <h1>🔔 알림</h1>
        <div className={styles.stats}>
          <span>전체 {stats.total}</span>
          <span>읽지 않음 {stats.unreadCount}</span>
          <span>읽음 {stats.readCount}</span>
        </div>
      </div>
      
      <div className={styles.actions}>
        <button onClick={onMarkAllRead} disabled={stats.unreadCount === 0}>
          모두 읽음 처리
        </button>
        <button onClick={onDeleteRead} disabled={stats.readCount === 0}>
          읽은 알림 삭제
        </button>
      </div>
    </header>
  )
}
```

---

### NotificationFilters

**파일 위치:** `src/app/notifications/components/NotificationFilters.jsx`

읽음 상태 필터와 타입 필터를 제공합니다.

#### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `filter` | `string` | 현재 상태 필터 (all/unread/read) |
| `typeFilter` | `string` | 현재 타입 필터 |
| `stats` | `Stats` | 알림 통계 |
| `activeTypes` | `string[]` | 존재하는 알림 타입 목록 |
| `onFilterChange` | `function` | 상태 필터 변경 핸들러 |
| `onTypeFilterChange` | `function` | 타입 필터 변경 핸들러 |

#### 구조

```javascript
function NotificationFilters({ 
  filter, 
  typeFilter, 
  stats, 
  activeTypes,
  onFilterChange, 
  onTypeFilterChange 
}) {
  return (
    <div className={styles.filters}>
      {/* 상태 필터 탭 */}
      <div className={styles.statusTabs}>
        <button 
          className={filter === 'all' ? styles.active : ''} 
          onClick={() => onFilterChange('all')}
        >
          전체
        </button>
        <button 
          className={filter === 'unread' ? styles.active : ''} 
          onClick={() => onFilterChange('unread')}
        >
          읽지 않음 ({stats.unreadCount})
        </button>
        <button 
          className={filter === 'read' ? styles.active : ''} 
          onClick={() => onFilterChange('read')}
        >
          읽음
        </button>
      </div>
      
      {/* 타입 필터 드롭다운 */}
      <select 
        value={typeFilter} 
        onChange={(e) => onTypeFilterChange(e.target.value)}
      >
        <option value="all">알림 유형</option>
        {activeTypes.map(type => (
          <option key={type} value={type}>
            {NOTIFICATION_TYPES[type]?.label || type}
          </option>
        ))}
      </select>
    </div>
  )
}
```

---

### NotificationList

**파일 위치:** `src/app/notifications/components/NotificationList.jsx`

날짜별로 그룹화된 알림 목록을 표시합니다.

#### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `groupedNotifications` | `object` | 날짜별 그룹화된 알림 |
| `deletingIds` | `Set` | 삭제 중인 알림 ID 집합 |
| `onRead` | `function` | 읽음 처리 핸들러 |
| `onDelete` | `function` | 삭제 핸들러 |
| `onClick` | `function` | 알림 클릭 핸들러 |

#### 구조

```javascript
function NotificationList({ 
  groupedNotifications, 
  deletingIds, 
  onRead, 
  onDelete, 
  onClick 
}) {
  const groupLabels = {
    today: '📅 오늘',
    yesterday: '📅 어제',
    thisWeek: '📅 이번 주',
    older: '📅 이전'
  }
  
  return (
    <div className={styles.list}>
      {Object.entries(groupedNotifications).map(([group, notifications]) => (
        notifications.length > 0 && (
          <div key={group} className={styles.group}>
            <h3 className={styles.groupLabel}>{groupLabels[group]}</h3>
            
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isDeleting={deletingIds.has(notification.id)}
                onRead={onRead}
                onDelete={onDelete}
                onClick={onClick}
              />
            ))}
          </div>
        )
      ))}
    </div>
  )
}
```

---

### NotificationItem / NotificationCard

**파일 위치:** 
- `src/app/notifications/components/NotificationItem.jsx`
- `src/components/notifications/NotificationCard.jsx`

개별 알림 카드 컴포넌트입니다.

#### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `notification` | `Notification` | 알림 데이터 |
| `isDeleting` | `boolean` | 삭제 애니메이션 중 여부 |
| `onRead` | `function` | 읽음 처리 핸들러 |
| `onDelete` | `function` | 삭제 핸들러 |
| `onClick` | `function` | 클릭 핸들러 |

#### 타입별 배지 스타일

```javascript
const getBadgeClass = (type) => {
  const map = {
    JOIN_APPROVED: styles.badgeJoin,
    NOTICE: styles.badgeNotice,
    FILE: styles.badgeFile,
    EVENT: styles.badgeEvent,
    TASK: styles.badgeTask,
    MEMBER: styles.badgeMember,
    KICK: styles.badgeKick,
  }
  return map[type] || styles.badgeDefault
}

const getBadgeText = (type) => {
  const map = {
    JOIN_APPROVED: '가입승인',
    NOTICE: '공지',
    FILE: '파일',
    EVENT: '일정',
    TASK: '할일',
    MEMBER: '멤버',
    KICK: '강퇴',
  }
  return map[type] || type
}
```

---

### Toast

**파일 위치:** `src/app/notifications/components/Toast.jsx`

성공/에러 메시지를 표시하는 토스트 컴포넌트입니다.

#### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `message` | `string` | 표시할 메시지 |
| `isVisible` | `boolean` | 표시 여부 |
| `type` | `string` | 타입 ('success' / 'error') |

#### 구조

```javascript
function Toast({ message, isVisible, type }) {
  if (!isVisible) return null
  
  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      {type === 'success' ? '✓' : '✕'} {message}
    </div>
  )
}
```

---

### NotificationSkeleton

**파일 위치:** `src/app/notifications/components/NotificationSkeleton.jsx`

로딩 상태의 스켈레톤 UI입니다.

#### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `count` | `number` | 표시할 스켈레톤 개수 |

---

### EmptyState

**파일 위치:** `src/app/notifications/components/EmptyState.jsx`

알림이 없을 때 표시되는 빈 상태 컴포넌트입니다.

#### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `filter` | `string` | 현재 상태 필터 |
| `typeFilter` | `string` | 현재 타입 필터 |

#### 메시지 분기

```javascript
function EmptyState({ filter, typeFilter }) {
  let message = '알림이 없습니다'
  
  if (filter === 'unread') {
    message = '읽지 않은 알림이 없습니다'
  } else if (filter === 'read') {
    message = '읽은 알림이 없습니다'
  } else if (typeFilter !== 'all') {
    message = `${NOTIFICATION_TYPES[typeFilter]?.label || typeFilter} 알림이 없습니다`
  }
  
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon}>🔔</span>
      <p>{message}</p>
    </div>
  )
}
```

---

## 상수 정의

### NOTIFICATION_TYPES

**파일 위치:** `src/app/notifications/constants.js`

```javascript
export const NOTIFICATION_TYPES = {
  JOIN_APPROVED: { 
    icon: '✅', 
    label: '가입 승인', 
    color: '#10b981', 
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  NOTICE: { 
    icon: '📢', 
    label: '공지', 
    color: '#ef4444', 
    bgColor: 'rgba(239, 68, 68, 0.1)'
  },
  FILE: { 
    icon: '📁', 
    label: '파일', 
    color: '#8b5cf6', 
    bgColor: 'rgba(139, 92, 246, 0.1)'
  },
  EVENT: { 
    icon: '📅', 
    label: '일정', 
    color: '#f59e0b', 
    bgColor: 'rgba(245, 158, 11, 0.1)'
  },
  TASK: { 
    icon: '✏️', 
    label: '할일', 
    color: '#3b82f6', 
    bgColor: 'rgba(59, 130, 246, 0.1)'
  },
  MEMBER: { 
    icon: '👤', 
    label: '멤버', 
    color: '#6366f1', 
    bgColor: 'rgba(99, 102, 241, 0.1)'
  },
  KICK: { 
    icon: '🚫', 
    label: '강퇴', 
    color: '#dc2626', 
    bgColor: 'rgba(220, 38, 38, 0.1)'
  },
  CHAT: { 
    icon: '💬', 
    label: '채팅', 
    color: '#06b6d4', 
    bgColor: 'rgba(6, 182, 212, 0.1)'
  },
  DEFAULT: { 
    icon: '🔔', 
    label: '알림', 
    color: '#6b7280', 
    bgColor: 'rgba(107, 114, 128, 0.1)'
  }
}
```

### FILTER_STATUS

```javascript
export const FILTER_STATUS = {
  ALL: 'all',
  UNREAD: 'unread',
  READ: 'read'
}
```

### GROUP_LABELS

```javascript
export const GROUP_LABELS = {
  today: '📅 오늘',
  yesterday: '📅 어제',
  thisWeek: '📅 이번 주',
  older: '📅 이전'
}
```

---

## 유틸리티 함수

### getRelativeTime

**파일 위치:** `src/app/notifications/utils.js`

상대적 시간을 표시합니다.

```javascript
export const getRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)

  if (diffSec < 60) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`
  if (diffDay === 1) return '어제'
  if (diffDay < 7) return `${diffDay}일 전`
  if (diffWeek < 4) return `${diffWeek}주 전`
  if (diffMonth < 12) return `${diffMonth}개월 전`
  return formatDateTimeKST(dateString)
}
```

### getNotificationGroup

알림을 날짜 그룹으로 분류합니다.

```javascript
export const getNotificationGroup = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  if (date >= today) return 'today'
  if (date >= yesterday) return 'yesterday'
  if (date >= weekAgo) return 'thisWeek'
  return 'older'
}
```

### groupNotifications

알림 목록을 날짜별로 그룹화합니다.

```javascript
export const groupNotifications = (notifications) => {
  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: []
  }
  
  notifications.forEach(notification => {
    const group = getNotificationGroup(notification.createdAt)
    groups[group].push(notification)
  })
  
  return groups
}
```

### calculateStats

알림 통계를 계산합니다.

```javascript
export const calculateStats = (notifications) => {
  const total = notifications.length
  const unreadCount = notifications.filter(n => !n.isRead).length
  const readCount = notifications.filter(n => n.isRead).length
  
  const typeCounts = {}
  notifications.forEach(n => {
    typeCounts[n.type] = (typeCounts[n.type] || 0) + 1
  })
  
  return { total, unreadCount, readCount, typeCounts }
}
```

### getTypeInfo

알림 타입 정보를 조회합니다.

```javascript
export const getTypeInfo = (type) => {
  return NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.DEFAULT
}
```

---

## 스타일 패턴

### 읽음 상태별 스타일

```css
/* 읽지 않은 알림 */
.card.unread {
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
}

/* 읽은 알림 */
.card {
  background-color: #f9fafb;
  border-left: 4px solid transparent;
}

/* 읽음 표시 점 */
.unreadDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #3b82f6;
}

.readDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #d1d5db;
}
```

### 타입별 배지 색상

```css
.badgeJoin { color: #10b981; background: rgba(16, 185, 129, 0.1); }
.badgeNotice { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
.badgeFile { color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }
.badgeEvent { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
.badgeTask { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
.badgeMember { color: #6366f1; background: rgba(99, 102, 241, 0.1); }
.badgeKick { color: #dc2626; background: rgba(220, 38, 38, 0.1); }
.badgeDefault { color: #6b7280; background: rgba(107, 114, 128, 0.1); }
```

### 삭제 애니메이션

```css
.card.deleting {
  animation: slideOut 0.3s ease-out forwards;
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-100%);
  }
}
```

### 토스트 스타일

```css
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
  z-index: 1000;
}

.toast.success {
  background-color: #10b981;
  color: white;
}

.toast.error {
  background-color: #ef4444;
  color: white;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

