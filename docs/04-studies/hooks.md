# 스터디 React Query Hooks

## 개요

스터디 도메인에서 사용하는 React Query 기반 커스텀 Hooks입니다.
서버 상태 관리, 캐싱, Optimistic Update를 제공합니다.

---

## Hook 구조 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        스터디 React Query Hooks                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    스터디 조회 (Query)                           │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │    │
│  │  │ useStudies  │ │ useStudy    │ │useMyStudies │                │    │
│  │  │             │ │             │ │             │                │    │
│  │  │ 목록 조회   │ │ 상세 조회   │ │ 내 스터디   │                │    │
│  │  │ 필터/검색   │ │ enabled     │ │ 자동갱신    │                │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    스터디 변경 (Mutation)                        │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │    │
│  │  │useCreateStudy│ │useUpdateStudy│ │useDeleteStudy│               │    │
│  │  │             │ │             │ │             │                │    │
│  │  │ 스터디 생성 │ │ 스터디 수정 │ │ 스터디 삭제 │                │    │
│  │  │ 캐시 무효화 │ │ 캐시 무효화 │ │ 캐시 무효화 │                │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌───────────────────┐          │    │
│  │  │ useJoinStudy│ │useLeaveStudy│ │useTransferOwnership│         │    │
│  │  │             │ │             │ │                   │          │    │
│  │  │ 스터디 가입 │ │ 스터디 탈퇴 │ │ 권한 위임         │          │    │
│  │  │ Optimistic  │ │ Optimistic  │ │ 캐시 무효화       │          │    │
│  │  └─────────────┘ └─────────────┘ └───────────────────┘          │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    멤버 관리 (Query/Mutation)                    │    │
│  │                                                                  │    │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐          │    │
│  │  │useStudyMembers│ │useJoinRequests│ │useApproveMember│         │    │
│  │  │               │ │               │ │               │          │    │
│  │  │ 멤버 목록     │ │ 가입 신청     │ │ 멤버 승인     │          │    │
│  │  └───────────────┘ └───────────────┘ └───────────────┘          │    │
│  │                                                                  │    │
│  │  ┌───────────────┐ ┌───────────────────┐                        │    │
│  │  │useRejectMember│ │useChangeMemberRole│                        │    │
│  │  │               │ │                   │                        │    │
│  │  │ 멤버 거절     │ │ 역할 변경         │                        │    │
│  │  └───────────────┘ └───────────────────┘                        │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 스터디 조회 Hooks

### useStudies

스터디 목록을 조회합니다.

```javascript
export function useStudies(params = {}) {
  return useQuery({
    queryKey: ['studies', params],
    queryFn: () => api.get('/api/studies', params),
  })
}
```

#### 사용법

```javascript
const { data, isLoading, error } = useStudies({
  page: 1,
  limit: 20,
  category: '프로그래밍',
  recruiting: 'recruiting'
})

// data.data: Study[]
// data.pagination: { page, limit, total, totalPages }
```

#### 쿼리 키 구조

```
['studies', { page: 1, limit: 20, category: '...' }]
```

---

### useStudy

단일 스터디 상세 정보를 조회합니다.

```javascript
export function useStudy(id) {
  return useQuery({
    queryKey: ['studies', id],
    queryFn: () => api.get(`/api/studies/${id}`),
    enabled: !!id,
  })
}
```

#### 사용법

```javascript
const { data, isLoading, error } = useStudy(studyId)

// data.data: Study (상세 정보 + 멤버 + myRole)
```

#### 쿼리 키 구조

```
['studies', 'clxxxxxxxxxx']
```

---

### useMyStudies

현재 사용자가 가입한 스터디 목록을 조회합니다.

```javascript
export function useMyStudies(params = {}, options = {}) {
  return useQuery({
    queryKey: ['my-studies', params],
    queryFn: () => api.get('/api/my-studies', params),

    // 실시간 업데이트
    refetchInterval: 60000, // 1분마다 갱신
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30초
    gcTime: 10 * 60 * 1000, // 10분

    ...options
  })
}
```

#### 사용법

```javascript
const { data, isLoading, refetch } = useMyStudies({ limit: 10 })

// data.data.studies: StudyMember[] (with nested study)
```

#### 설정 옵션

| 옵션 | 값 | 설명 |
|------|------|------|
| refetchInterval | 60000 | 1분마다 자동 갱신 |
| refetchOnWindowFocus | true | 창 포커스 시 갱신 |
| staleTime | 30000 | 30초간 신선함 유지 |
| gcTime | 600000 | 10분간 캐시 유지 |

---

## 스터디 변경 Hooks

### useCreateStudy

새 스터디를 생성합니다.

```javascript
export function useCreateStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/api/studies', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['studies'])
      queryClient.invalidateQueries(['my-studies'])
    },
  })
}
```

#### 사용법

```javascript
const createStudy = useCreateStudy()

const handleCreate = async () => {
  try {
    const result = await createStudy.mutateAsync({
      name: '알고리즘 스터디',
      emoji: '💻',
      category: '개발',
      subCategory: '알고리즘',
      description: '...',
      maxMembers: 20,
      isPublic: true,
      autoApprove: true
    })
    
    // result.data.id로 리다이렉트
    router.push(`/my-studies/${result.data.id}`)
  } catch (error) {
    // 에러 처리
  }
}
```

#### 캐시 무효화

- `['studies']` - 스터디 목록
- `['my-studies']` - 내 스터디 목록

---

### useUpdateStudy

스터디 정보를 수정합니다. (OWNER 전용)

```javascript
export function useUpdateStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/api/studies/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.id])
      queryClient.invalidateQueries(['studies'])
      queryClient.invalidateQueries(['my-studies'])
    },
  })
}
```

#### 사용법

```javascript
const updateStudy = useUpdateStudy()

await updateStudy.mutateAsync({
  id: studyId,
  data: {
    name: '새 이름',
    isRecruiting: false
  }
})
```

---

### useDeleteStudy

스터디를 삭제합니다. (OWNER 전용)

```javascript
export function useDeleteStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/api/studies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['studies'])
      queryClient.invalidateQueries(['my-studies'])
    },
  })
}
```

#### 사용법

```javascript
const deleteStudy = useDeleteStudy()

await deleteStudy.mutateAsync(studyId)
router.push('/my-studies')
```

---

### useJoinStudy

스터디에 가입 신청합니다. **Optimistic Update** 적용.

```javascript
export function useJoinStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.post(`/api/studies/${id}/join`, data),

    // Optimistic Update
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['studies', id] })
      await queryClient.cancelQueries({ queryKey: ['my-studies'] })

      const previousStudy = queryClient.getQueryData(['studies', id])
      const previousMyStudies = queryClient.getQueryData(['my-studies'])

      // 스터디 멤버 수 즉시 증가
      queryClient.setQueryData(['studies', id], (old) => {
        if (!old) return old
        return {
          ...old,
          memberCount: (old.memberCount || 0) + 1
        }
      })

      return { previousStudy, previousMyStudies }
    },

    // 에러 시 롤백
    onError: (err, { id }, context) => {
      if (context?.previousStudy) {
        queryClient.setQueryData(['studies', id], context.previousStudy)
      }
      if (context?.previousMyStudies) {
        queryClient.setQueryData(['my-studies'], context.previousMyStudies)
      }
    },

    // 성공 시 갱신
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studies', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['my-studies'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}
```

#### 사용법

```javascript
const joinStudy = useJoinStudy()

await joinStudy.mutateAsync({
  id: studyId,
  data: {
    introduction: '안녕하세요!',
    purpose: '코딩테스트 준비',
    level: '중급'
  }
})
```

#### Optimistic Update 플로우

```
┌─────────────────┐
│   가입 버튼    │
│   클릭         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│  onMutate       │      │ UI 즉시 업데이트│
│  실행           │─────▶│ (멤버 수 +1)   │
└────────┬────────┘      └─────────────────┘
         │
         ▼
┌─────────────────┐
│  API 호출       │
│  (비동기)       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│ 성공    │ │ 실패    │
│         │ │         │
│onSuccess│ │ onError │
│캐시무효화│ │ 롤백    │
└─────────┘ └─────────┘
```

---

### useLeaveStudy

스터디에서 탈퇴합니다. **Optimistic Update** 적용.

```javascript
export function useLeaveStudy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/api/studies/${id}/leave`),

    // Optimistic Update
    onMutate: async (studyId) => {
      await queryClient.cancelQueries({ queryKey: ['studies', studyId] })
      await queryClient.cancelQueries({ queryKey: ['my-studies'] })

      const previousStudies = queryClient.getQueryData(['studies'])
      const previousMyStudies = queryClient.getQueryData(['my-studies'])

      // 내 스터디 목록에서 즉시 제거
      queryClient.setQueryData(['my-studies'], (old) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            studies: old.data?.studies?.filter(study => study.study?.id !== studyId)
          }
        }
      })

      return { previousStudies, previousMyStudies, studyId }
    },

    // 에러 시 복원
    onError: (err, studyId, context) => {
      if (context?.previousStudies) {
        queryClient.setQueryData(['studies'], context.previousStudies)
      }
      if (context?.previousMyStudies) {
        queryClient.setQueryData(['my-studies'], context.previousMyStudies)
      }
    },

    // 성공 시 캐시 제거 및 갱신
    onSuccess: (_, studyId) => {
      queryClient.removeQueries({ queryKey: ['studies', studyId] })
      queryClient.invalidateQueries({ queryKey: ['studies'] })
      queryClient.invalidateQueries({ queryKey: ['my-studies'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}
```

#### 사용법

```javascript
const leaveStudy = useLeaveStudy()

await leaveStudy.mutateAsync(studyId)
router.push('/my-studies')
```

---

### useTransferOwnership

OWNER 권한을 다른 ADMIN에게 위임합니다.

```javascript
export function useTransferOwnership() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, targetUserId }) =>
      api.post(`/api/studies/${studyId}/transfer-ownership`, { targetUserId }),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studies', variables.studyId] })
      queryClient.invalidateQueries({ queryKey: ['studies', variables.studyId, 'members'] })
      queryClient.invalidateQueries({ queryKey: ['my-studies'] })
    }
  })
}
```

#### 사용법

```javascript
const transferOwnership = useTransferOwnership()

await transferOwnership.mutateAsync({
  studyId: studyId,
  targetUserId: adminUserId
})
```

---

## 멤버 관리 Hooks

### useStudyMembers

스터디 멤버 목록을 조회합니다.

```javascript
export function useStudyMembers(studyId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'members', params],
    queryFn: () => api.get(`/api/studies/${studyId}/members`, params),
    enabled: !!studyId,
    ...options,
  })
}
```

#### 사용법

```javascript
const { data, isLoading } = useStudyMembers(studyId, { 
  role: 'ADMIN',
  status: 'ACTIVE' 
})

// data.data: StudyMember[] (with nested user)
```

---

### useJoinRequests

가입 신청 목록을 조회합니다. (ADMIN+ 전용)

```javascript
export function useJoinRequests(studyId) {
  return useQuery({
    queryKey: ['studies', studyId, 'join-requests'],
    queryFn: () => api.get(`/api/studies/${studyId}/join-requests`),
    enabled: !!studyId,
    staleTime: 0, // 항상 최신 데이터 조회
  })
}
```

#### 사용법

```javascript
const { data, isLoading, refetch } = useJoinRequests(studyId)

// data.data: StudyMember[] (status: 'PENDING')
```

---

### useApproveMember

가입 신청을 승인합니다.

```javascript
export function useApproveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, userId }) => 
      api.post(`/api/studies/${studyId}/members/${userId}/approve`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
      queryClient.invalidateQueries(['studies', variables.studyId, 'join-requests'])
    },
  })
}
```

#### 사용법

```javascript
const approveMember = useApproveMember()

await approveMember.mutateAsync({
  studyId: studyId,
  userId: pendingUserId
})
```

---

### useRejectMember

가입 신청을 거절합니다.

```javascript
export function useRejectMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, userId }) => 
      api.post(`/api/studies/${studyId}/members/${userId}/reject`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
      queryClient.invalidateQueries(['studies', variables.studyId, 'join-requests'])
    },
  })
}
```

---

### useChangeMemberRole

멤버 역할을 변경합니다. (OWNER 전용)

```javascript
export function useChangeMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, memberId, role }) => 
      api.patch(`/api/studies/${studyId}/members/${memberId}/role`, { role }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
      queryClient.invalidateQueries(['studies', variables.studyId])
    },
  })
}
```

#### 사용법

```javascript
const changeMemberRole = useChangeMemberRole()

await changeMemberRole.mutateAsync({
  studyId: studyId,
  memberId: memberId,
  role: 'ADMIN' // 'ADMIN' | 'MEMBER'
})
```

---

## 쿼리 키 체계

### 키 구조

```
studies
├── studies                           # 스터디 목록
│   └── [params]                      # 필터/검색 파라미터
├── studies
│   └── [studyId]                     # 스터디 상세
│       ├── members                   # 멤버 목록
│       │   └── [params]              # 필터 파라미터
│       ├── join-requests             # 가입 신청 목록
│       ├── notices                   # 공지사항
│       ├── files                     # 파일
│       ├── calendar                  # 일정
│       └── tasks                     # 할일
└── my-studies                        # 내 스터디
    └── [params]                      # 필터 파라미터
```

### 무효화 패턴

| 작업 | 무효화 대상 |
|------|-------------|
| 스터디 생성 | `['studies']`, `['my-studies']` |
| 스터디 수정 | `['studies', id]`, `['studies']`, `['my-studies']` |
| 스터디 삭제 | `['studies']`, `['my-studies']` |
| 스터디 가입 | `['studies', id]`, `['my-studies']`, `['dashboard']` |
| 스터디 탈퇴 | `['studies', id]` (제거), `['studies']`, `['my-studies']`, `['dashboard']` |
| 멤버 승인/거절 | `['studies', id, 'members']`, `['studies', id, 'join-requests']` |
| 역할 변경 | `['studies', id, 'members']`, `['studies', id]` |

---

## 에러 처리 패턴

### 타입별 에러 처리

```javascript
try {
  await joinStudy.mutateAsync({ id, data })
} catch (error) {
  const { message, type } = handleStudyError(error)

  switch (type) {
    case 'ALREADY_MEMBER':
      showErrorToast(message)
      router.push(`/my-studies/${id}`)
      break
      
    case 'STUDY_FULL':
      showErrorToast(message)
      router.push(`/studies/${id}`)
      break
      
    case 'KICKED_MEMBER':
      showErrorToast('이 스터디에 재가입할 수 없습니다')
      router.push('/studies')
      break
      
    case 'NOT_RECRUITING':
      showWarningToast('현재 모집 중이 아닙니다')
      break
      
    default:
      showStudyErrorToast(error)
  }
}
```

---

## 사용 예시

### 스터디 탐색 페이지

```javascript
function StudiesExplorePage() {
  const [filters, setFilters] = useState({
    category: '전체',
    recruiting: 'all',
    search: ''
  })
  
  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['studies', filters],
    queryFn: ({ pageParam = 1 }) => 
      api.get('/api/studies', { ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.pagination.page < lastPage.pagination.totalPages 
        ? lastPage.pagination.page + 1 
        : undefined
  })
  
  // 무한 스크롤 구현...
}
```

### 스터디 생성

```javascript
function CreateStudyPage() {
  const router = useRouter()
  const createStudy = useCreateStudy()
  
  const handleSubmit = async (formData) => {
    try {
      const result = await createStudy.mutateAsync(formData)
      showSuccessToast('스터디가 생성되었습니다!')
      router.push(`/my-studies/${result.data.id}`)
    } catch (error) {
      const { message, field } = handleStudyError(error)
      if (field) {
        setErrors({ [field]: message })
      }
      showStudyErrorToast(error)
    }
  }
  
  return <StudyForm onSubmit={handleSubmit} isLoading={createStudy.isPending} />
}
```

### 멤버 관리

```javascript
function MemberManagement({ studyId }) {
  const { data: members } = useStudyMembers(studyId)
  const { data: requests } = useJoinRequests(studyId)
  const approveMember = useApproveMember()
  const rejectMember = useRejectMember()
  const changeMemberRole = useChangeMemberRole()
  
  const handleApprove = async (userId) => {
    await approveMember.mutateAsync({ studyId, userId })
    showSuccessToast('승인되었습니다')
  }
  
  const handleReject = async (userId) => {
    await rejectMember.mutateAsync({ studyId, userId })
    showInfoToast('거절되었습니다')
  }
  
  const handleRoleChange = async (memberId, newRole) => {
    await changeMemberRole.mutateAsync({ studyId, memberId, role: newRole })
    showSuccessToast('역할이 변경되었습니다')
  }
  
  return (
    <div>
      <MemberList members={members?.data} onRoleChange={handleRoleChange} />
      <PendingList requests={requests?.data} onApprove={handleApprove} onReject={handleReject} />
    </div>
  )
}
```

