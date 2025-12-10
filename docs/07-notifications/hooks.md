# 알림 Hooks

## 개요

알림 도메인에서 사용하는 커스텀 Hooks입니다.
페이지 전용 훅 (`useNotifications`)과 React Query 기반 훅으로 구분됩니다.

---

## Hook 구조 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        알림 Hooks                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │              useNotifications (페이지 전용 훅)                   │    │
│  │              src/app/notifications/hooks/useNotifications.js     │    │
│  │                                                                  │    │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │    │
│  │  │ 상태 관리       │ │ 필터링          │ │ API 액션        │    │    │
│  │  │                 │ │                 │ │                 │    │    │
│  │  │ allNotifications│ │ filter          │ │ markAsRead      │    │    │
│  │  │ isLoading       │ │ typeFilter      │ │ markAllAsRead   │    │    │
│  │  │ deletingIds     │ │ notifications   │ │ deleteNotif     │    │    │
│  │  │ toast           │ │ groupedNotifs   │ │ deleteReadNotifs│    │    │
│  │  │                 │ │ stats           │ │                 │    │    │
│  │  │                 │ │ activeTypes     │ │                 │    │    │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘    │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │              React Query Hooks (src/lib/hooks/useApi.js)         │    │
│  │                                                                  │    │
│  │  ┌─────────────────┐ ┌───────────────────────────────────────┐  │    │
│  │  │useNotifications │ │useMarkNotificationAsRead              │  │    │
│  │  │   (Query)       │ │   (Mutation)                          │  │    │
│  │  │                 │ │                                       │  │    │
│  │  │ 알림 목록       │ │ 읽음 처리                             │  │    │
│  │  │ 조회            │ │                                       │  │    │
│  │  └─────────────────┘ └───────────────────────────────────────┘  │    │
│  │                                                                  │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │useMarkAllNotificationsAsRead                             │    │    │
│  │  │   (Mutation)                                             │    │    │
│  │  │                                                          │    │    │
│  │  │ 전체 읽음 처리                                           │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## useNotifications (페이지 전용 훅)

**파일 위치:** `src/app/notifications/hooks/useNotifications.js`

알림 페이지에서 사용하는 종합 커스텀 훅입니다.
API 호출, 상태 관리, 필터링, 그룹화를 모두 처리합니다.

### 반환값

```javascript
{
  // 상태
  notifications,          // 필터링된 알림 목록
  groupedNotifications,   // 날짜별 그룹화된 알림
  stats,                  // 통계 정보
  activeTypes,            // 존재하는 알림 타입 목록
  isLoading,              // 로딩 상태
  deletingIds,            // 삭제 중인 알림 ID Set
  toast,                  // 토스트 상태

  // 필터 상태
  filter,                 // 읽음 상태 필터 (all/unread/read)
  typeFilter,             // 타입 필터

  // 상태 변경
  setFilter,              // 읽음 상태 필터 변경
  setTypeFilter,          // 타입 필터 변경

  // 액션
  markAsRead,             // 단일 알림 읽음 처리
  markAllAsRead,          // 전체 읽음 처리
  deleteNotification,     // 단일 알림 삭제
  deleteReadNotifications,// 읽은 알림 일괄 삭제
  refetch                 // 데이터 새로고침
}
```

### 상태 관리

```javascript
export function useNotifications() {
  const { data: session } = useSession()
  
  // 전체 알림 목록 (원본)
  const [allNotifications, setAllNotifications] = useState([])
  
  // 필터 상태
  const [filter, setFilter] = useState(FILTER_STATUS.ALL)
  const [typeFilter, setTypeFilter] = useState('all')
  
  // UI 상태
  const [isLoading, setIsLoading] = useState(true)
  const [deletingIds, setDeletingIds] = useState(new Set())
  const [toast, setToast] = useState({ 
    message: '', 
    isVisible: false, 
    type: 'success' 
  })
  
  // ...
}
```

### 필터링 로직

```javascript
// 필터링된 알림 목록
const notifications = useMemo(() => {
  return allNotifications.filter(n => {
    // 읽음 상태 필터
    const statusMatch = filter === FILTER_STATUS.ALL
      ? true
      : filter === FILTER_STATUS.UNREAD
        ? !n.isRead
        : n.isRead
    
    // 타입 필터
    const typeMatch = typeFilter === 'all' 
      ? true 
      : n.type === typeFilter
    
    return statusMatch && typeMatch
  })
}, [allNotifications, filter, typeFilter])
```

### 그룹화 로직

```javascript
// 그룹화된 알림
const groupedNotifications = useMemo(() => {
  return groupNotifications(notifications)
}, [notifications])
```

### 통계 계산

```javascript
// 통계 정보
const stats = useMemo(() => {
  return calculateStats(allNotifications)
}, [allNotifications])

// 활성 타입 목록
const activeTypes = useMemo(() => {
  return Object.keys(stats.typeCounts)
}, [stats.typeCounts])
```

### API 호출

```javascript
// 알림 목록 조회
const fetchNotifications = useCallback(async () => {
  setIsLoading(true)
  try {
    const data = await api.get('/api/notifications', { limit: 100 })
    if (data.success) {
      setAllNotifications(data.data)
    }
  } catch (error) {
    console.error('알림 로드 실패:', error)
    showToast('알림을 불러오는데 실패했습니다', 'error')
  } finally {
    setIsLoading(false)
  }
}, [showToast])

// 세션 변경 시 데이터 로드
useEffect(() => {
  if (session?.user) {
    fetchNotifications()
  }
}, [session, fetchNotifications])
```

### 액션 함수

#### 단일 알림 읽음 처리

```javascript
const markAsRead = useCallback(async (id, e) => {
  if (e) e.stopPropagation()
  
  try {
    await api.post(`/api/notifications/${id}/read`)
    
    // Optimistic Update
    setAllNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ))
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error)
    showToast('처리 중 오류가 발생했습니다', 'error')
  }
}, [showToast])
```

#### 전체 알림 읽음 처리

```javascript
const markAllAsRead = useCallback(async () => {
  if (stats.unreadCount === 0) return
  
  try {
    await api.post('/api/notifications/mark-all-read')
    
    setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    showToast(`${stats.unreadCount}개 알림을 읽음 처리했습니다`, 'success')
  } catch (error) {
    console.error('전체 읽음 처리 실패:', error)
    showToast('처리 중 오류가 발생했습니다', 'error')
  }
}, [stats.unreadCount, showToast])
```

#### 읽은 알림 일괄 삭제

```javascript
const deleteReadNotifications = useCallback(async () => {
  if (stats.readCount === 0) return
  if (!confirm(`읽은 알림 ${stats.readCount}개를 모두 삭제하시겠습니까?`)) return

  try {
    const readIds = allNotifications.filter(n => n.isRead).map(n => n.id)
    await api.delete('/api/notifications/bulk', { body: { ids: readIds } })
    
    setAllNotifications(prev => prev.filter(n => !n.isRead))
    showToast(`${readIds.length}개 알림을 삭제했습니다`, 'success')
  } catch (error) {
    console.error('읽은 알림 삭제 실패:', error)
    showToast('삭제 중 오류가 발생했습니다', 'error')
  }
}, [allNotifications, stats.readCount, showToast])
```

#### 단일 알림 삭제 (애니메이션 포함)

```javascript
const deleteNotification = useCallback(async (id, e) => {
  if (e) e.stopPropagation()

  // 삭제 애니메이션 시작
  setDeletingIds(prev => new Set([...prev, id]))

  // 애니메이션 후 실제 삭제
  setTimeout(async () => {
    try {
      await api.delete(`/api/notifications/${id}`)
      setAllNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('알림 삭제 실패:', error)
      showToast('삭제 중 오류가 발생했습니다', 'error')
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }, 300) // 애니메이션 시간과 동기화
}, [showToast])
```

### 토스트 표시

```javascript
const showToast = useCallback((message, type = 'success') => {
  setToast({ message, isVisible: true, type })
  
  // 3초 후 자동 숨김
  setTimeout(() => {
    setToast({ message: '', isVisible: false, type: 'success' })
  }, 3000)
}, [])
```

### 사용 예시

```javascript
function NotificationsPage() {
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

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  // 렌더링...
}
```

---

## React Query Hooks

**파일 위치:** `src/lib/hooks/useApi.js`

### useNotifications (Query)

알림 목록을 조회합니다.

```javascript
export function useNotifications(params = {}, options = {}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => api.get('/api/notifications', params),
    enabled: options.enabled !== false,
    ...options,
  })
}
```

#### 사용법

```javascript
// 기본 사용
const { data, isLoading } = useNotifications()

// 읽지 않은 알림만
const { data } = useNotifications({ isRead: 'false' })

// 특정 타입만
const { data } = useNotifications({ type: 'NOTICE' })

// 자동 갱신 비활성화
const { data } = useNotifications({}, { enabled: false })
```

---

### useMarkNotificationAsRead (Mutation)

단일 알림을 읽음 처리합니다.

```javascript
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    },
  })
}
```

#### 사용법

```javascript
const markAsRead = useMarkNotificationAsRead()

// 알림 클릭 시
const handleClick = async (notification) => {
  if (!notification.isRead) {
    await markAsRead.mutateAsync(notification.id)
  }
}
```

---

### useMarkAllNotificationsAsRead (Mutation)

모든 알림을 읽음 처리합니다.

```javascript
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/api/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    },
  })
}
```

#### 사용법

```javascript
const markAllAsRead = useMarkAllNotificationsAsRead()

// 전체 읽음 버튼 클릭 시
const handleMarkAllRead = async () => {
  await markAllAsRead.mutateAsync()
  showToast('모든 알림을 읽음 처리했습니다')
}
```

---

## 쿼리 키 체계

```
notifications
├── notifications              # 알림 목록
│   └── [params]               # 필터 파라미터
└── notifications
    └── count                  # 읽지 않은 개수 (헤더 배지용)
```

---

## 캐시 무효화 패턴

| 작업 | 무효화 대상 |
|------|-------------|
| 읽음 처리 | `['notifications']` |
| 전체 읽음 | `['notifications']` |
| 알림 삭제 | `['notifications']` |
| 대량 삭제 | `['notifications']` |

---

## 헤더 알림 배지 패턴

헤더에서 읽지 않은 알림 개수를 표시하는 패턴입니다.

```javascript
// Header.jsx
function Header() {
  const { data } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: () => api.get('/api/notifications/count'),
    refetchInterval: 30000,  // 30초마다 갱신
    staleTime: 10000,        // 10초간 캐시 사용
  })

  const unreadCount = data?.count || 0

  return (
    <nav>
      <Link href="/notifications">
        🔔
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
    </nav>
  )
}
```

---

## 에러 처리

```javascript
const markAsRead = useCallback(async (id, e) => {
  if (e) e.stopPropagation()
  
  try {
    await api.post(`/api/notifications/${id}/read`)
    // 성공 처리
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error)
    
    const message = error?.response?.data?.error || '처리 중 오류가 발생했습니다'
    showToast(message, 'error')
    
    // 에러 유형별 처리
    if (error?.response?.status === 403) {
      // 권한 없음 - 다른 사용자의 알림
    } else if (error?.response?.status === 404) {
      // 알림 없음 - 이미 삭제됨
      setAllNotifications(prev => prev.filter(n => n.id !== id))
    }
  }
}, [showToast])
```

