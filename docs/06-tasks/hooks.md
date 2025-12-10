# 할일 React Query Hooks

## 개요

할일 관리 도메인에서 사용하는 React Query 기반 커스텀 Hooks입니다.
개인 할일과 스터디 할일을 구분하여 관리하며, 캐시 무효화와 낙관적 업데이트를 지원합니다.

---

## Hook 구조 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        할일 React Query Hooks                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    개인 할일 (Query)                             │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │    │
│  │  │ useTasks    │ │ useTask     │ │useTaskStats │                │    │
│  │  │             │ │             │ │             │                │    │
│  │  │ 목록 조회   │ │ 상세 조회   │ │ 통계 조회   │                │    │
│  │  │ + 필터/정렬 │ │ enabled     │ │             │                │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    개인 할일 (Mutation)                          │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │    │
│  │  │useCreateTask│ │useUpdateTask│ │useDeleteTask│ │useToggle   │ │    │
│  │  │             │ │             │ │             │ │   Task     │ │    │
│  │  │ 할일 생성   │ │ 할일 수정   │ │ 할일 삭제   │ │ 완료 토글  │ │    │
│  │  │ 캐시 무효화 │ │ 캐시 무효화 │ │ 캐시 무효화 │ │ 캐시 무효화│ │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    스터디 할일 (Query/Mutation)                  │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌───────────────┐ ┌───────────────┐            │    │
│  │  │useStudyTasks│ │useCreateStudy │ │useUpdateStudy │            │    │
│  │  │             │ │    Task       │ │    Task       │            │    │
│  │  │ 스터디별    │ │ 스터디 할일  │ │ 스터디 할일  │            │    │
│  │  │ 목록 조회   │ │ 생성         │ │ 수정         │            │    │
│  │  └─────────────┘ └───────────────┘ └───────────────┘            │    │
│  │                                                                  │    │
│  │  ┌───────────────┐                                              │    │
│  │  │useDeleteStudy │                                              │    │
│  │  │    Task       │                                              │    │
│  │  │ 스터디 할일  │                                              │    │
│  │  │ 삭제         │                                              │    │
│  │  └───────────────┘                                              │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 개인 할일 Hooks

### useTasks

할일 목록을 조회합니다. 필터와 정렬을 지원합니다.

```javascript
export function useTasks(params = {}) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => api.get('/api/tasks', params),
  })
}
```

#### 사용법

```javascript
// 기본 사용
const { data, isLoading } = useTasks()

// 필터 적용
const { data } = useTasks({
  studyId: 'clxxx',
  status: 'incomplete',
  sortBy: 'deadline'
})

// 페이지네이션
const { data } = useTasks({ page: 2, limit: 10 })
```

#### 쿼리 키 구조

```
['tasks', { studyId: 'clxxx', status: 'incomplete', sortBy: 'deadline' }]
```

---

### useTask

단일 할일 상세 정보를 조회합니다.

```javascript
export function useTask(id) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => api.get(`/api/tasks/${id}`),
    enabled: !!id,
  })
}
```

#### 사용법

```javascript
const { data, isLoading } = useTask(taskId)

// data.data: Task
```

---

### useTaskStats

할일 통계를 조회합니다.

```javascript
export function useTaskStats() {
  return useQuery({
    queryKey: ['tasks', 'stats'],
    queryFn: () => api.get('/api/tasks/stats'),
  })
}
```

#### 사용법

```javascript
const { data: statsData } = useTaskStats()

const stats = statsData?.data
// stats.summary: { total, completed, pending, completionRate }
// stats.byPeriod: { today, thisWeek, thisMonth, overdue }
// stats.byPriority: { URGENT, HIGH, MEDIUM, LOW }
// stats.byStatus: { TODO, IN_PROGRESS, REVIEW, DONE }
```

---

### useCreateTask

할일을 생성합니다.

```javascript
export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/api/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    },
  })
}
```

#### 사용법

```javascript
const createTask = useCreateTask()

await createTask.mutateAsync({
  title: '알고리즘 문제 풀기',
  description: 'BFS/DFS 3문제',
  studyId: 'clxxx',
  priority: 'HIGH',
  dueDate: '2025-01-20',
  status: 'TODO',
  assigneeIds: ['clxxx', 'clxxx']
})
```

---

### useUpdateTask

할일을 수정합니다.

```javascript
export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/api/tasks/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['tasks'])
      queryClient.invalidateQueries(['tasks', variables.id])
    },
  })
}
```

#### 사용법

```javascript
const updateTask = useUpdateTask()

await updateTask.mutateAsync({
  id: taskId,
  data: {
    title: '수정된 제목',
    priority: 'URGENT'
  }
})
```

---

### useDeleteTask

할일을 삭제합니다.

```javascript
export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    },
  })
}
```

#### 사용법

```javascript
const deleteTask = useDeleteTask()

await deleteTask.mutateAsync(taskId)
```

---

### useToggleTask

할일 완료 상태를 토글합니다.

```javascript
export function useToggleTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.patch(`/api/tasks/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    },
  })
}
```

#### 사용법

```javascript
const toggleTask = useToggleTask()

// 체크박스 클릭 시
const handleToggle = async (taskId) => {
  try {
    await toggleTask.mutateAsync(taskId)
  } catch (error) {
    alert('상태 변경에 실패했습니다.')
  }
}
```

---

## 스터디 할일 Hooks

### useStudyTasks

스터디 할일 목록을 조회합니다.

```javascript
export function useStudyTasks(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'tasks', params],
    queryFn: () => api.get(`/api/studies/${studyId}/tasks`, params),
    enabled: !!studyId,
  })
}
```

#### 사용법

```javascript
const { data, isLoading } = useStudyTasks(studyId)

// 필터 적용
const { data } = useStudyTasks(studyId, { status: 'TODO' })
```

---

### useCreateStudyTask

스터디 할일을 생성합니다.

```javascript
export function useCreateStudyTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => 
      api.post(`/api/studies/${studyId}/tasks`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'tasks'])
    },
  })
}
```

#### 사용법

```javascript
const createTask = useCreateStudyTask()

await createTask.mutateAsync({
  studyId: studyId,
  data: {
    title: '1주차 과제',
    description: 'BFS 문제 5개',
    priority: 'HIGH',
    dueDate: '2025-01-20',
    assigneeIds: ['clxxx']
  }
})
```

---

### useUpdateStudyTask

스터디 할일을 수정합니다.

```javascript
export function useUpdateStudyTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, taskId, data }) => 
      api.patch(`/api/studies/${studyId}/tasks/${taskId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'tasks'])
    },
  })
}
```

#### 사용법

```javascript
const updateTask = useUpdateStudyTask()

// 상태 변경 (칸반보드)
await updateTask.mutateAsync({
  studyId: studyId,
  taskId: taskId,
  data: { status: 'IN_PROGRESS' }
})
```

---

### useDeleteStudyTask

스터디 할일을 삭제합니다.

```javascript
export function useDeleteStudyTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, taskId }) => 
      api.delete(`/api/studies/${studyId}/tasks/${taskId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'tasks'])
    },
  })
}
```

#### 사용법

```javascript
const deleteTask = useDeleteStudyTask()

await deleteTask.mutateAsync({
  studyId: studyId,
  taskId: taskId
})
```

---

## 쿼리 키 체계

```
tasks
├── tasks                         # 개인 할일 목록
│   └── [params]                  # 필터/정렬 파라미터
├── tasks
│   └── [taskId]                  # 개인 할일 상세
└── tasks
    └── stats                     # 할일 통계

studies
└── studies
    └── [studyId]
        └── tasks                 # 스터디 할일 목록
            └── [params]          # 필터 파라미터
```

---

## 캐시 무효화 패턴

| 작업 | 무효화 대상 |
|------|-------------|
| 개인 할일 생성 | `['tasks']` |
| 개인 할일 수정 | `['tasks']`, `['tasks', id]` |
| 개인 할일 삭제 | `['tasks']` |
| 개인 할일 토글 | `['tasks']` |
| 스터디 할일 생성 | `['studies', studyId, 'tasks']` |
| 스터디 할일 수정 | `['studies', studyId, 'tasks']` |
| 스터디 할일 삭제 | `['studies', studyId, 'tasks']` |

---

## 사용 예시

### 할일 페이지 전체 구현

```javascript
function TasksPage() {
  const [filter, setFilter] = useState({
    studyId: null,
    status: 'all',
    sortBy: 'deadline',
  })
  
  // API 파라미터 변환
  const apiParams = useMemo(() => {
    const params = {}
    if (filter.studyId) params.studyId = filter.studyId
    if (filter.status !== 'all') params.status = filter.status
    if (filter.sortBy) params.sortBy = filter.sortBy
    return params
  }, [filter])

  const { data: tasksData, isLoading } = useTasks(apiParams)
  const { data: statsData } = useTaskStats()
  const toggleTask = useToggleTask()
  const deleteTask = useDeleteTask()

  const tasks = tasksData?.data || []
  const stats = statsData?.data || null

  const handleToggle = async (taskId) => {
    try {
      await toggleTask.mutateAsync(taskId)
    } catch (error) {
      alert('상태 변경 실패')
    }
  }

  const handleDelete = async (taskId) => {
    if (!confirm('삭제하시겠습니까?')) return
    try {
      await deleteTask.mutateAsync(taskId)
    } catch (error) {
      alert('삭제 실패')
    }
  }

  // 긴급도 그룹화
  const groupedTasks = useMemo(() => {
    const urgent = [], thisWeek = [], later = []
    tasks.forEach(task => {
      const urgency = getUrgencyLevel(task.dueDate)
      if (urgency === 'urgent') urgent.push(task)
      else if (urgency === 'thisWeek') thisWeek.push(task)
      else later.push(task)
    })
    return { urgent, thisWeek, later }
  }, [tasks])

  if (isLoading) return <Loading />

  return (
    <div>
      <TaskFilters filter={filter} setFilter={setFilter} />
      <TaskGroup title="🔥 긴급" tasks={groupedTasks.urgent} onToggle={handleToggle} />
      <TaskGroup title="📅 이번 주" tasks={groupedTasks.thisWeek} onToggle={handleToggle} />
      <TaskGroup title="📋 나중에" tasks={groupedTasks.later} onToggle={handleToggle} />
      {stats && <TaskProgressWidget stats={stats} />}
    </div>
  )
}
```

### 스터디 칸반보드

```javascript
function StudyTasksPage({ studyId }) {
  const { data: tasksData, isLoading } = useStudyTasks(studyId)
  const updateTask = useUpdateStudyTask()
  
  const tasks = tasksData?.data || []
  
  // 상태별 그룹화
  const columns = {
    TODO: tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    REVIEW: tasks.filter(t => t.status === 'REVIEW'),
    DONE: tasks.filter(t => t.status === 'DONE'),
  }
  
  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask.mutateAsync({
      studyId,
      taskId,
      data: { status: newStatus }
    })
  }
  
  return (
    <div className="kanban">
      <KanbanColumn title="TODO" tasks={columns.TODO} onDrop={(id) => handleStatusChange(id, 'TODO')} />
      <KanbanColumn title="진행중" tasks={columns.IN_PROGRESS} onDrop={(id) => handleStatusChange(id, 'IN_PROGRESS')} />
      <KanbanColumn title="검토중" tasks={columns.REVIEW} onDrop={(id) => handleStatusChange(id, 'REVIEW')} />
      <KanbanColumn title="완료" tasks={columns.DONE} onDrop={(id) => handleStatusChange(id, 'DONE')} />
    </div>
  )
}
```

---

## 에러 처리

### 할일 작업 에러 처리

```javascript
const handleCreateTask = async (formData) => {
  try {
    await createTask.mutateAsync(formData)
    showSuccessToast('할일이 추가되었습니다')
  } catch (error) {
    const message = error?.response?.data?.error || '할일 추가에 실패했습니다'
    
    if (message.includes('스터디 멤버가 아닙니다')) {
      showErrorToast('스터디 멤버만 할일을 추가할 수 있습니다')
    } else if (message.includes('제목')) {
      showErrorToast('제목을 입력해주세요')
    } else {
      showErrorToast(message)
    }
  }
}
```

### 권한 에러 처리

```javascript
const handleStudyTaskAction = async (action) => {
  try {
    await action()
  } catch (error) {
    const status = error?.response?.status
    
    if (status === 403) {
      showErrorToast('할일 관리 권한이 없습니다. 관리자만 수정할 수 있습니다.')
    } else if (status === 404) {
      showErrorToast('할일을 찾을 수 없습니다')
    } else {
      showErrorToast('작업에 실패했습니다')
    }
  }
}
```

