# 관리자 아키텍처 - 상태 관리

> **분량**: 약 150줄  
> **목적**: React Query + Zustand 패턴

---

## 🎯 2단계 상태 관리

### 1. Server State (React Query)
- **관리 대상**: API 데이터, 비동기 상태
- **라이브러리**: @tanstack/react-query
- **특징**: 캐싱, 재검증, 자동 갱신

### 2. UI State (Zustand)
- **관리 대상**: 필터, 선택, 모달
- **라이브러리**: zustand
- **특징**: 간단한 글로벌 상태

---

## 📦 Server State (React Query)

### 설정
```jsx
// components/admin/layout/AdminLayoutClient.js
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,      // 1분
      refetchOnWindowFocus: false
    }
  }
})

export default function AdminLayoutClient({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### 사용 예시
```jsx
// lib/admin/hooks.js
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

/**
 * 관리자 통계 조회
 */
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => fetch('/api/admin/stats').then(r => r.json()),
    staleTime: 60000,
    refetchInterval: 30000 // 30초 자동 갱신
  })
}

/**
 * 사용자 정지 뮤테이션
 */
export function useSuspendUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, duration, reason }) => {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, reason })
      })
      return res.json()
    },
    onSuccess: () => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    }
  })
}
```

---

## 🗃️ UI State (Zustand)

### Store 생성
```jsx
// lib/admin/store.js
import { create } from 'zustand'

/**
 * @typedef {Object} AdminStore
 */

export const useAdminStore = create((set, get) => ({
  // 필터 상태
  userFilters: { status: 'all', search: '' },
  setUserFilters: (filters) => set({ userFilters: filters }),
  
  // 선택 상태
  selectedUserIds: [],
  toggleUser: (id) => set((state) => ({
    selectedUserIds: state.selectedUserIds.includes(id)
      ? state.selectedUserIds.filter(uid => uid !== id)
      : [...state.selectedUserIds, id]
  })),
  selectAll: (userIds) => set({ selectedUserIds: userIds }),
  clearSelection: () => set({ selectedUserIds: [] }),
  
  // 모달 상태
  isModalOpen: false,
  modalData: null,
  openModal: (data) => set({ isModalOpen: true, modalData: data }),
  closeModal: () => set({ isModalOpen: false, modalData: null })
}))
```

### 사용 예시
```jsx
// components/admin/users/UserTable.js
'use client'

import { useAdminStore } from '@/lib/admin/store'

export default function UserTable({ users }) {
  const {
    selectedUserIds,
    toggleUser,
    openModal
  } = useAdminStore()
  
  const handleRowClick = (user) => {
    openModal(user)
  }
  
  return (
    <table>
      {users.map(user => (
        <tr key={user.id} onClick={() => handleRowClick(user)}>
          <td>
            <input
              type="checkbox"
              checked={selectedUserIds.includes(user.id)}
              onChange={() => toggleUser(user.id)}
              onClick={(e) => e.stopPropagation()}
            />
          </td>
          <td>{user.name}</td>
        </tr>
      ))}
    </table>
  )
}
```

---

## 🔄 실시간 업데이트 (WebSocket)

```jsx
// components/admin/providers/AdminWebSocketProvider.js
'use client'

import { createContext, useContext, useEffect } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'

const WebSocketContext = createContext(null)

export function AdminWebSocketProvider({ children }) {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const socket = io('/admin')
    
    // 통계 업데이트
    socket.on('admin:stats:update', (data) => {
      queryClient.setQueryData(['admin-stats'], data)
    })
    
    // 신고 알림
    socket.on('admin:report:new', () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
    })
    
    return () => socket.disconnect()
  }, [queryClient])
  
  return (
    <WebSocketContext.Provider value={null}>
      {children}
    </WebSocketContext.Provider>
  )
}
```

---

## 📋 상태 관리 가이드

| 상태 유형 | 도구 | 예시 |
|----------|------|------|
| API 데이터 | React Query | 통계, 목록 |
| 필터 | Zustand | 검색어, 상태 필터 |
| 선택 | Zustand | 체크박스 선택 |
| 모달 | Zustand | 열기/닫기, 데이터 |
| 폼 | Local State | input 값 |

---

**다음 파일**: `components/` 폴더 - 컴포넌트 상세 설계

