# 실시간 동기화 예외 처리

**작성일**: 2025-11-29  
**카테고리**: 스터디 관리  
**우선순위**: 🟡 중간

---

## 📋 목차

- [개요](#개요)
- [React Query 캐시 관리](#react-query-캐시-관리)
- [낙관적 업데이트](#낙관적-업데이트)
- [데이터 동기화](#데이터-동기화)
- [캐시 무효화](#캐시-무효화)

---

## 개요

React Query를 사용한 실시간 데이터 동기화 및 캐시 관리를 다룹니다.

---

## React Query 캐시 관리

### ✅ Query Keys 정의

```javascript
// src/lib/hooks/queryKeys.js

export const queryKeys = {
  // 스터디 목록
  studies: (params) => ['studies', params],
  
  // 스터디 상세
  study: (id) => ['study', id],
  
  // 내 스터디 목록
  myStudies: (params) => ['myStudies', params],
  
  // 멤버 목록
  studyMembers: (studyId) => ['studyMembers', studyId],
  
  // 가입 요청 목록
  joinRequests: (studyId) => ['joinRequests', studyId],
  
  // 공지사항
  notices: (studyId) => ['notices', studyId],
  
  // 파일 목록
  files: (studyId) => ['files', studyId]
}
```

### ✅ Query Hooks

```javascript
// src/lib/hooks/useApi.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

// 스터디 목록 조회
export function useStudies(params = {}) {
  return useQuery({
    queryKey: queryKeys.studies(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams(params)
      const response = await fetch(`/api/studies?${searchParams}`)
      if (!response.ok) throw new Error('Failed to fetch studies')
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // 5분
    cacheTime: 1000 * 60 * 10 // 10분
  })
}

// 스터디 상세 조회
export function useStudy(id) {
  return useQuery({
    queryKey: queryKeys.study(id),
    queryFn: async () => {
      const response = await fetch(`/api/studies/${id}`)
      if (!response.ok) throw new Error('Failed to fetch study')
      return response.json()
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5
  })
}

// 멤버 목록
export function useStudyMembers(studyId) {
  return useQuery({
    queryKey: queryKeys.studyMembers(studyId),
    queryFn: async () => {
      const response = await fetch(`/api/studies/${studyId}/members`)
      if (!response.ok) throw new Error('Failed to fetch members')
      return response.json()
    },
    enabled: !!studyId,
    staleTime: 1000 * 60 * 2 // 2분
  })
}
```

---

## 낙관적 업데이트

### ✅ 스터디 수정

```javascript
// 스터디 수정 Mutation
export function useUpdateStudy(id) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`/api/studies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to update study')
      return response.json()
    },
    
    // 낙관적 업데이트
    onMutate: async (newData) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: queryKeys.study(id) })

      // 이전 데이터 백업
      const previousStudy = queryClient.getQueryData(queryKeys.study(id))

      // 낙관적으로 업데이트
      queryClient.setQueryData(queryKeys.study(id), (old) => ({
        ...old,
        data: {
          ...old.data,
          ...newData
        }
      }))

      // 롤백용 context 반환
      return { previousStudy }
    },
    
    // 성공 시
    onSuccess: (data) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.study(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.studies() })
    },
    
    // 실패 시 롤백
    onError: (err, newData, context) => {
      if (context?.previousStudy) {
        queryClient.setQueryData(queryKeys.study(id), context.previousStudy)
      }
    },
    
    // 완료 후 (성공/실패 무관)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.study(id) })
    }
  })
}
```

### ✅ 멤버 강퇴

```javascript
export function useKickMember(studyId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId) => {
      const response = await fetch(`/api/studies/${studyId}/members/${userId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to kick member')
      return response.json()
    },
    
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.studyMembers(studyId) })

      const previousMembers = queryClient.getQueryData(queryKeys.studyMembers(studyId))

      // 낙관적으로 멤버 제거
      queryClient.setQueryData(queryKeys.studyMembers(studyId), (old) => ({
        ...old,
        data: old.data.filter(m => m.userId !== userId)
      }))

      return { previousMembers }
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studyMembers(studyId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.study(studyId) })
    },
    
    onError: (err, userId, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(queryKeys.studyMembers(studyId), context.previousMembers)
      }
    }
  })
}
```

---

## 데이터 동기화

### ✅ 자동 갱신

```javascript
// 실시간 업데이트가 필요한 데이터
export function useStudyMembersRealtime(studyId) {
  return useQuery({
    queryKey: queryKeys.studyMembers(studyId),
    queryFn: async () => {
      const response = await fetch(`/api/studies/${studyId}/members`)
      if (!response.ok) throw new Error('Failed to fetch members')
      return response.json()
    },
    enabled: !!studyId,
    refetchInterval: 1000 * 60, // 1분마다 자동 갱신
    refetchOnWindowFocus: true, // 창 포커스 시 갱신
    refetchOnReconnect: true // 재연결 시 갱신
  })
}

// 온라인 멤버 (짧은 간격)
export function useOnlineMembers(studyId) {
  return useQuery({
    queryKey: ['onlineMembers', studyId],
    queryFn: async () => {
      const response = await fetch(`/api/studies/${studyId}/members/online`)
      if (!response.ok) throw new Error('Failed to fetch online members')
      return response.json()
    },
    enabled: !!studyId,
    refetchInterval: 1000 * 30, // 30초
    staleTime: 1000 * 20 // 20초
  })
}
```

---

## 캐시 무효화

### ✅ 무효화 전략

```javascript
// src/lib/hooks/useInvalidateQueries.js

import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'

export function useInvalidateStudies() {
  const queryClient = useQueryClient()

  return {
    // 특정 스터디 무효화
    invalidateStudy: (studyId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.study(studyId) })
    },

    // 스터디 목록 무효화
    invalidateStudies: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studies() })
    },

    // 내 스터디 목록 무효화
    invalidateMyStudies: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myStudies() })
    },

    // 멤버 목록 무효화
    invalidateMembers: (studyId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studyMembers(studyId) })
    },

    // 모든 스터디 관련 데이터 무효화
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['studies'] })
      queryClient.invalidateQueries({ queryKey: ['myStudies'] })
      queryClient.invalidateQueries({ queryKey: ['study'] })
    }
  }
}

// 사용 예
function StudySettings({ studyId }) {
  const updateMutation = useUpdateStudy(studyId)
  const { invalidateStudy, invalidateStudies } = useInvalidateStudies()

  const handleSave = async (data) => {
    await updateMutation.mutateAsync(data)
    
    // 수동 무효화
    invalidateStudy(studyId)
    invalidateStudies()
  }

  return <form onSubmit={handleSave}>...</form>
}
```

### ✅ Prefetching

```javascript
// 미리 데이터 가져오기
export function usePrefetchStudy() {
  const queryClient = useQueryClient()

  return (studyId) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.study(studyId),
      queryFn: async () => {
        const response = await fetch(`/api/studies/${studyId}`)
        if (!response.ok) throw new Error('Failed to prefetch study')
        return response.json()
      },
      staleTime: 1000 * 60 * 5
    })
  }
}

// 사용 예: 목록에서 마우스 오버 시 미리 가져오기
function StudyCard({ study }) {
  const prefetchStudy = usePrefetchStudy()

  return (
    <div
      onMouseEnter={() => prefetchStudy(study.id)}
      onClick={() => router.push(`/studies/${study.id}`)}
    >
      <h3>{study.name}</h3>
      <p>{study.description}</p>
    </div>
  )
}
```

### ✅ 전역 설정

```javascript
// src/app/providers.js
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      cacheTime: 1000 * 60 * 10, // 10분
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    },
    mutations: {
      retry: 0
    }
  }
})

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

## 관련 문서

- [INDEX](./INDEX.md)
- [08-ui-ux-exceptions.md](./08-ui-ux-exceptions.md)

---

**다음 문서**: [UI/UX 예외 처리](./08-ui-ux-exceptions.md)

