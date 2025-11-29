# 실시간 동기화 예외 처리

대시보드의 실시간 데이터 동기화와 관련된 예외 상황과 처리 방법을 다룹니다.

---

## 📋 목차

1. [React Query 캐싱](#react-query-캐싱)
2. [자동 갱신 (refetchInterval)](#자동-갱신-refetchinterval)
3. [캐시 무효화](#캐시-무효화)
4. [Stale 데이터](#stale-데이터)
5. [낙관적 업데이트](#낙관적-업데이트)
6. [WebSocket 연결](#websocket-연결)
7. [충돌 해결](#충돌-해결)

---

## React Query 캐싱

### 개요

React Query는 자동으로 데이터를 캐싱하여 불필요한 API 요청을 줄입니다.

**현재 설정** (`coup/src/app/providers.js`):
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
    },
  },
})
```

### 캐시 동작 이해

1. **Fresh**: 데이터가 최신 상태 (staleTime 내)
2. **Stale**: 데이터가 오래됨 (staleTime 초과)
3. **Inactive**: 컴포넌트가 언마운트됨
4. **Deleted**: 캐시에서 삭제됨 (cacheTime 초과)

### 예외 상황 1: 캐시된 오래된 데이터

#### 증상
- 다른 페이지 갔다 와도 데이터가 그대로
- 새로고침해야 업데이트됨

#### 원인
```javascript
// staleTime이 너무 길게 설정됨
staleTime: 10 * 60 * 1000 // 10분
```

#### 해결 방법

**방법 1: staleTime 조정**
```javascript
// coup/src/lib/hooks/useApi.js
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard'),
    staleTime: 1 * 60 * 1000, // 1분으로 단축
  })
}
```

**방법 2: 페이지 포커스 시 자동 갱신**
```javascript
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard'),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true, // 창 포커스 시 갱신
    refetchOnMount: true, // 마운트 시 갱신
  })
}
```

### 예외 상황 2: 캐시 키 충돌

#### 증상
- 다른 페이지의 데이터가 표시됨
- 데이터가 섞임

#### 원인
```javascript
// ❌ 잘못된 캐시 키 (모든 대시보드가 같은 키 사용)
queryKey: ['dashboard']
```

#### 해결 방법
```javascript
// ✅ 사용자별 캐시 키
export function useDashboard(userId) {
  return useQuery({
    queryKey: ['dashboard', userId],
    queryFn: () => api.get('/api/dashboard'),
  })
}

// 사용
const { data } = useDashboard(session.user.id)
```

---

## 자동 갱신 (refetchInterval)

### 개요

주기적으로 데이터를 자동으로 갱신합니다.

### 설정 방법

```javascript
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard'),
    refetchInterval: 30000, // 30초마다 자동 갱신
    refetchIntervalInBackground: false, // 백그라운드에서는 갱신 안 함
  })
}
```

### 예외 상황 1: 자동 갱신 실패

#### 증상
- 데이터가 자동으로 업데이트되지 않음
- 콘솔에 에러 없음

#### 원인
```javascript
// 조건부 refetchInterval이 false로 평가됨
refetchInterval: shouldRefetch ? 30000 : false
```

#### 해결 방법

```javascript
export function useDashboard(options = {}) {
  const { enableAutoRefresh = true } = options

  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard'),
    refetchInterval: enableAutoRefresh ? 30000 : false,
    refetchIntervalInBackground: false,
    // 에러 시에도 재시도
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) return false
      return failureCount < 3
    },
  })
}

// 사용
const { data } = useDashboard({ enableAutoRefresh: true })
```

### 예외 상황 2: 백그라운드에서 불필요한 갱신

#### 증상
- 탭이 백그라운드에 있어도 계속 API 요청
- 서버 부하 증가

#### 해결 방법

```javascript
export function useDashboard() {
  const [isVisible, setIsVisible] = useState(!document.hidden)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard'),
    refetchInterval: isVisible ? 30000 : false, // 보이는 경우만 갱신
  })
}
```

---

## 캐시 무효화

### 개요

데이터가 변경되었을 때 캐시를 무효화하여 최신 데이터를 가져옵니다.

### 수동 무효화

```javascript
import { useQueryClient } from '@tanstack/react-query'

export default function DashboardClient() {
  const queryClient = useQueryClient()
  const { data, refetch } = useDashboard()

  const handleRefresh = () => {
    // 방법 1: 특정 쿼리만 무효화
    queryClient.invalidateQueries(['dashboard'])

    // 방법 2: 강제 refetch
    refetch()

    // 방법 3: 모든 쿼리 무효화
    queryClient.invalidateQueries()
  }

  return (
    <div>
      <button onClick={handleRefresh}>🔄 새로고침</button>
      {/* ... */}
    </div>
  )
}
```

### 자동 무효화 (Mutation 후)

```javascript
// 할일 완료 시 대시보드 무효화
export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId) => api.post(`/api/tasks/${taskId}/complete`),
    onSuccess: () => {
      // 대시보드 캐시 무효화
      queryClient.invalidateQueries(['dashboard'])
      // 할일 목록 캐시 무효화
      queryClient.invalidateQueries(['tasks'])
    },
  })
}

// 사용
const { mutate: completeTask } = useCompleteTask()

<button onClick={() => completeTask(taskId)}>
  완료
</button>
```

### 예외 상황: 무효화되지 않는 캐시

#### 증상
- `invalidateQueries` 호출해도 데이터가 갱신되지 않음

#### 원인
```javascript
// 캐시 키가 일치하지 않음
queryClient.invalidateQueries(['dashboard']) // ❌ 문자열
queryClient.invalidateQueries([['dashboard']]) // ✅ 배열
```

#### 해결 방법

```javascript
// 정확한 캐시 키 사용
queryClient.invalidateQueries({ queryKey: ['dashboard'] })

// 또는 부분 일치
queryClient.invalidateQueries({ 
  queryKey: ['dashboard'],
  exact: false // 'dashboard'로 시작하는 모든 쿼리
})

// 예: ['dashboard'], ['dashboard', 123] 모두 무효화
```

---

## Stale 데이터

### 개요

Stale 데이터는 오래되었지만 아직 캐시에 남아있는 데이터입니다.

### 예외 상황: 오래된 데이터 표시

#### 증상
- 다른 탭에서 변경했는데 반영 안 됨
- 시간이 지나도 업데이트 안 됨

#### 해결 방법

**방법 1: staleTime 줄이기**
```javascript
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard'),
    staleTime: 0, // 항상 Stale로 취급
  })
}
```

**방법 2: 포커스 시 갱신**
```javascript
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard'),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true, // 창 포커스 시 갱신
  })
}
```

**방법 3: 마운트 시 갱신**
```javascript
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard'),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: 'always', // 마운트 시 항상 갱신
  })
}
```

---

## 낙관적 업데이트

### 개요

서버 응답을 기다리지 않고 즉시 UI를 업데이트합니다.

### 구현 방법

```javascript
// 알림 읽음 처리
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId) => 
      api.post(`/api/notifications/${notificationId}/read`),
    
    // 낙관적 업데이트
    onMutate: async (notificationId) => {
      // 1. 진행 중인 refetch 취소
      await queryClient.cancelQueries(['dashboard'])
      
      // 2. 이전 데이터 백업
      const previousData = queryClient.getQueryData(['dashboard'])
      
      // 3. 낙관적으로 UI 업데이트
      queryClient.setQueryData(['dashboard'], (old) => {
        if (!old?.data) return old
        
        return {
          ...old,
          data: {
            ...old.data,
            stats: {
              ...old.data.stats,
              unreadNotifications: Math.max(0, old.data.stats.unreadNotifications - 1)
            },
            recentActivities: old.data.recentActivities.map(activity =>
              activity.id === notificationId
                ? { ...activity, isRead: true }
                : activity
            )
          }
        }
      })
      
      // 4. 롤백용 데이터 반환
      return { previousData }
    },
    
    // 성공 시: 서버 데이터로 교체
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboard'])
    },
    
    // 실패 시: 롤백
    onError: (err, notificationId, context) => {
      console.error('알림 읽음 처리 실패:', err)
      
      // 이전 데이터로 복원
      if (context?.previousData) {
        queryClient.setQueryData(['dashboard'], context.previousData)
      }
      
      // 에러 토스트 표시
      alert('알림을 읽음 처리하는데 실패했습니다')
    },
    
    // 완료 후: 최종 정리
    onSettled: () => {
      queryClient.invalidateQueries(['dashboard'])
    },
  })
}

// 사용
const { mutate: markAsRead } = useMarkNotificationAsRead()

<button onClick={() => markAsRead(notification.id)}>
  읽음
</button>
```

### 예외 상황: 롤백 실패

#### 증상
- 낙관적 업데이트 후 에러 발생
- UI가 잘못된 상태로 표시됨
- 롤백이 되지 않음

#### 원인
```javascript
// context가 제대로 전달되지 않음
onError: (err, variables, context) => {
  if (context?.previousData) { // context가 undefined
    // 롤백 실패
  }
}
```

#### 해결 방법

```javascript
onMutate: async (variables) => {
  // 반드시 context 객체 반환
  return { 
    previousData: queryClient.getQueryData(['dashboard']),
    timestamp: Date.now()
  }
},

onError: (err, variables, context) => {
  console.error('Error:', err)
  console.log('Context:', context) // 디버깅
  
  if (context?.previousData) {
    queryClient.setQueryData(['dashboard'], context.previousData)
  } else {
    // 폴백: 강제 갱신
    queryClient.invalidateQueries(['dashboard'])
  }
}
```

---

## WebSocket 연결

### 개요

실시간 업데이트를 위한 WebSocket 연결 (현재 미구현)

### 구현 예시

```javascript
// coup/src/lib/hooks/useWebSocket.js
'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tantml/react-query'

export function useWebSocket(url) {
  const [ws, setWs] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    // WebSocket 연결
    const socket = new WebSocket(url)

    socket.onopen = () => {
      console.log('✅ [WS] Connected')
      setIsConnected(true)
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('📨 [WS] Message:', data)

      // 이벤트 타입별 처리
      switch (data.type) {
        case 'NOTIFICATION':
          // 알림 수 증가
          queryClient.invalidateQueries(['dashboard'])
          break
        case 'MEMBER_ONLINE':
          // 온라인 멤버 업데이트
          queryClient.invalidateQueries(['online-members'])
          break
        case 'TASK_UPDATED':
          // 할일 업데이트
          queryClient.invalidateQueries(['tasks'])
          queryClient.invalidateQueries(['dashboard'])
          break
        default:
          console.warn('Unknown event type:', data.type)
      }
    }

    socket.onerror = (error) => {
      console.error('❌ [WS] Error:', error)
    }

    socket.onclose = () => {
      console.log('⚠️ [WS] Disconnected')
      setIsConnected(false)
      
      // 5초 후 재연결 시도
      setTimeout(() => {
        console.log('🔄 [WS] Reconnecting...')
        setWs(new WebSocket(url))
      }, 5000)
    }

    setWs(socket)

    // 클린업
    return () => {
      socket.close()
    }
  }, [url, queryClient])

  return { ws, isConnected }
}

// 사용
export default function DashboardClient() {
  const { isConnected } = useWebSocket('ws://localhost:3001')

  return (
    <div>
      {isConnected ? (
        <span className={styles.online}>🟢 실시간</span>
      ) : (
        <span className={styles.offline}>🔴 오프라인</span>
      )}
      {/* ... */}
    </div>
  )
}
```

### 예외 상황: WebSocket 재연결 실패

#### 증상
- 연결이 끊어진 후 재연결 안 됨
- 실시간 업데이트 중단

#### 해결 방법

**지수 백오프 재연결**:
```javascript
export function useWebSocket(url) {
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 5

  useEffect(() => {
    const socket = new WebSocket(url)

    socket.onclose = () => {
      if (retryCount < maxRetries) {
        // 지수 백오프: 1초, 2초, 4초, 8초, 16초
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)
        
        console.log(`🔄 [WS] Retry in ${delay}ms (${retryCount + 1}/${maxRetries})`)
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
        }, delay)
      } else {
        console.error('❌ [WS] Max retries reached')
        // 폴백: 폴링으로 전환
      }
    }

    // 연결 성공 시 재시도 카운트 리셋
    socket.onopen = () => {
      setRetryCount(0)
    }

    return () => socket.close()
  }, [url, retryCount])
}
```

---

## 충돌 해결

### 개요

여러 사용자가 동시에 같은 데이터를 수정할 때 충돌 처리

### 예제: 버전 기반 충돌 감지

```javascript
export function useUpdateStudy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studyId, data, version }) => 
      api.put(`/api/studies/${studyId}`, { ...data, version }),
    
    onError: (error) => {
      if (error.response?.status === 409) {
        // 충돌 발생
        alert('다른 사용자가 이미 수정했습니다. 페이지를 새로고침합니다.')
        queryClient.invalidateQueries(['studies'])
      }
    },
  })
}

// API 측 처리
export async function PUT(request, { params }) {
  const { id } = params
  const { version, ...data } = await request.json()
  
  const study = await prisma.study.findUnique({
    where: { id: parseInt(id) }
  })
  
  // 버전 충돌 체크
  if (study.version !== version) {
    return NextResponse.json(
      { error: '데이터가 다른 사용자에 의해 수정되었습니다' },
      { status: 409 }
    )
  }
  
  // 버전 증가 후 업데이트
  const updated = await prisma.study.update({
    where: { id: parseInt(id) },
    data: {
      ...data,
      version: { increment: 1 }
    }
  })
  
  return NextResponse.json(updated)
}
```

---

## 디버깅

### React Query DevTools 사용

```jsx
// coup/src/app/providers.js
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**확인 사항**:
- Query Status: `fresh`, `stale`, `fetching`
- Last Updated: 마지막 갱신 시간
- Observers: 몇 개의 컴포넌트가 사용 중인지
- Cache Time: 캐시 만료 시간

### 콘솔 로깅

```javascript
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      console.log('🔍 [DASHBOARD] Fetching...')
      const data = await api.get('/api/dashboard')
      console.log('✅ [DASHBOARD] Fetched:', data)
      return data
    },
    onSuccess: (data) => {
      console.log('✅ [DASHBOARD] Success:', data)
    },
    onError: (error) => {
      console.error('❌ [DASHBOARD] Error:', error)
    },
  })
}
```

---

**다음 문서**: [04-empty-states.md](./04-empty-states.md)

