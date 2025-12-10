# 내 스터디 React Query Hooks

## 개요

내 스터디 도메인에서 사용하는 React Query 기반 커스텀 Hooks입니다.
서버 상태 관리, 캐싱, 실시간 갱신, Optimistic Update를 제공합니다.

---

## Hook 구조 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    내 스터디 React Query Hooks                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    스터디 기본 (Query)                           │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │    │
│  │  │useMyStudies │ │ useStudy    │ │useStudy     │                │    │
│  │  │             │ │             │ │  Members    │                │    │
│  │  │ 내 스터디   │ │ 스터디 상세 │ │ 멤버 목록   │                │    │
│  │  │ 1분 자동갱신│ │ + myRole    │ │             │                │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    채팅 (Query/Mutation)                         │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │    │
│  │  │ useMessages │ │useSendMessage│ │useDeleteMsg │               │    │
│  │  │             │ │             │ │             │                │    │
│  │  │ 채팅 목록   │ │ 메시지 전송 │ │ 메시지 삭제 │                │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    공지사항 (Query/Mutation)                     │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │    │
│  │  │ useNotices  │ │useCreateNote│ │useUpdateNote│ │useDeleteNot│ │    │
│  │  │             │ │             │ │             │ │             │ │    │
│  │  │ 공지 목록   │ │ 공지 작성   │ │ 공지 수정   │ │ 공지 삭제  │ │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │    │
│  │                                                                  │    │
│  │  ┌─────────────────────┐                                        │    │
│  │  │ useTogglePinNotice  │                                        │    │
│  │  │                     │                                        │    │
│  │  │ 고정 토글           │                                        │    │
│  │  └─────────────────────┘                                        │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    파일/일정/할일 (Query/Mutation)               │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │    │
│  │  │ useFiles    │ │ useEvents   │ │useStudyTasks│                │    │
│  │  │ useUploadFile│ │useCreateEvt │ │useCreateTask│               │    │
│  │  │ useDeleteFile│ │useUpdateEvt │ │useUpdateTask│               │    │
│  │  │             │ │useDeleteEvt │ │useDeleteTask│                │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘                │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    멤버 관리 (Query/Mutation)                    │    │
│  │                                                                  │    │
│  │  ┌─────────────┐ ┌─────────────────┐ ┌─────────────────────┐    │    │
│  │  │useJoinReqs  │ │useApproveJoinReq│ │useRejectJoinRequest │    │    │
│  │  │             │ │                 │ │                     │    │    │
│  │  │ 가입 신청   │ │ 승인            │ │ 거절                │    │    │
│  │  └─────────────┘ └─────────────────┘ └─────────────────────┘    │    │
│  │                                                                  │    │
│  │  ┌─────────────────┐ ┌─────────────┐                            │    │
│  │  │useChangeMemberRol│ │useKickMember│                           │    │
│  │  │                 │ │             │                            │    │
│  │  │ 역할 변경       │ │ 멤버 강퇴   │                            │    │
│  │  └─────────────────┘ └─────────────┘                            │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 스터디 기본 Hooks

### useMyStudies

내 스터디 목록을 조회합니다. 1분마다 자동 갱신됩니다.

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
// data.data.stats: { total, asOwner, asAdmin, asMember, pending }
```

---

### useStudy

단일 스터디 상세 정보를 조회합니다. `myRole` 등 현재 사용자 정보가 포함됩니다.

```javascript
export function useStudy(id) {
  return useQuery({
    queryKey: ['studies', id],
    queryFn: () => api.get(`/api/studies/${id}`),
    enabled: !!id,
  })
}
```

#### 응답 데이터

```javascript
const study = studyData?.data
// study.myRole: 'OWNER' | 'ADMIN' | 'MEMBER' | null
// study.myJoinedAt: Date
// study.myMembershipStatus: 'ACTIVE' | 'PENDING' | 'LEFT' | 'KICKED'
// study.currentMembers: number
// study.members: Member[]
```

---

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
// 기본 사용
const { data } = useStudyMembers(studyId)

// ADMIN만 조회
const { data } = useStudyMembers(studyId, { role: 'ADMIN' })

// 조건부 사용 (OWNER일 때만)
const { data } = useStudyMembers(studyId, {}, {
  enabled: !!studyId && isOwner
})
```

---

## 채팅 Hooks

### useMessages

채팅 메시지 목록을 조회합니다.

```javascript
export function useMessages(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'messages', params],
    queryFn: () => api.get(`/api/studies/${studyId}/chat`, params),
    enabled: !!studyId,
  })
}
```

---

### useSendMessage

채팅 메시지를 전송합니다.

```javascript
export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => 
      api.post(`/api/studies/${studyId}/chat`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'messages'])
    },
  })
}
```

#### 사용법

```javascript
const sendMessage = useSendMessage()

await sendMessage.mutateAsync({
  studyId,
  data: { 
    content: '안녕하세요!',
    fileId: null  // 파일 첨부 시 ID
  }
})
```

---

### useDeleteMessage

채팅 메시지를 삭제합니다.

```javascript
export function useDeleteMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, messageId }) => 
      api.delete(`/api/studies/${studyId}/chat/${messageId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'messages'])
    },
  })
}
```

---

## 공지사항 Hooks

### useNotices

공지사항 목록을 조회합니다.

```javascript
export function useNotices(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'notices', params],
    queryFn: () => api.get(`/api/studies/${studyId}/notices`, params),
    enabled: !!studyId,
  })
}
```

#### 사용법

```javascript
// 기본 사용
const { data } = useNotices(studyId)

// 최근 3개만
const { data } = useNotices(studyId, { limit: 3 })

// 고정 공지만
const { data } = useNotices(studyId, { pinned: 'true' })
```

---

### useCreateNotice

공지사항을 작성합니다.

```javascript
export function useCreateNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => 
      api.post(`/api/studies/${studyId}/notices`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'notices'])
    },
  })
}
```

#### 사용법

```javascript
const createNotice = useCreateNotice()

await createNotice.mutateAsync({
  studyId,
  data: {
    title: '1월 스터디 일정',
    content: '...',
    isPinned: true,
    isImportant: true
  }
})
```

---

### useUpdateNotice

공지사항을 수정합니다.

```javascript
export function useUpdateNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, noticeId, data }) => 
      api.patch(`/api/studies/${studyId}/notices/${noticeId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'notices'])
    },
  })
}
```

---

### useDeleteNotice

공지사항을 삭제합니다.

```javascript
export function useDeleteNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, noticeId }) => 
      api.delete(`/api/studies/${studyId}/notices/${noticeId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'notices'])
    },
  })
}
```

---

### useTogglePinNotice

공지사항 고정을 토글합니다.

```javascript
export function useTogglePinNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, noticeId }) => 
      api.patch(`/api/studies/${studyId}/notices/${noticeId}/pin`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'notices'])
    },
  })
}
```

---

## 파일 Hooks

### useFiles

파일 목록을 조회합니다.

```javascript
export function useFiles(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'files', params],
    queryFn: () => api.get(`/api/studies/${studyId}/files`, params),
    enabled: !!studyId,
  })
}
```

---

### useUploadFile

파일을 업로드합니다.

```javascript
export function useUploadFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ studyId, formData }) => {
      return api.post(`/api/studies/${studyId}/files`, formData, {
        headers: {} // FormData 자동 처리
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'files'])
    },
  })
}
```

#### 사용법

```javascript
const uploadFile = useUploadFile()

const formData = new FormData()
formData.append('file', file)
formData.append('category', 'DOCUMENT')

await uploadFile.mutateAsync({ studyId, formData })
```

---

### useDeleteFile

파일을 삭제합니다.

```javascript
export function useDeleteFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, fileId }) => 
      api.delete(`/api/studies/${studyId}/files/${fileId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'files'])
    },
  })
}
```

---

## 일정 Hooks

### useEvents

일정 목록을 조회합니다.

```javascript
export function useEvents(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'events', params],
    queryFn: () => api.get(`/api/studies/${studyId}/calendar`, params),
    enabled: !!studyId,
  })
}
```

#### 사용법

```javascript
// 월별 조회
const month = '2025-01'
const { data } = useEvents(studyId, { month })

// 날짜 범위 조회
const { data } = useEvents(studyId, { 
  startDate: '2025-01-01',
  endDate: '2025-01-31'
})
```

---

### useCreateEvent

일정을 생성합니다.

```javascript
export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, data }) => 
      api.post(`/api/studies/${studyId}/calendar`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'events'])
    },
  })
}
```

---

### useUpdateEvent

일정을 수정합니다.

```javascript
export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, eventId, data }) => 
      api.patch(`/api/studies/${studyId}/calendar/${eventId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'events'])
    },
  })
}
```

---

### useDeleteEvent

일정을 삭제합니다.

```javascript
export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, eventId }) => 
      api.delete(`/api/studies/${studyId}/calendar/${eventId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'events'])
    },
  })
}
```

---

## 할일 Hooks

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

---

### useCreateStudyTask

할일을 생성합니다.

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
  studyId,
  data: {
    title: '알고리즘 문제 풀기',
    description: 'BFS/DFS 5문제',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2025-01-20',
    assigneeIds: ['userId1', 'userId2']
  }
})
```

---

### useUpdateStudyTask

할일을 수정합니다.

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

---

### useDeleteStudyTask

할일을 삭제합니다.

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

---

## 멤버 관리 Hooks

### useJoinRequests

가입 신청 목록을 조회합니다.

```javascript
export function useJoinRequests(studyId) {
  return useQuery({
    queryKey: ['studies', studyId, 'join-requests'],
    queryFn: () => api.get(`/api/studies/${studyId}/join-requests`),
    enabled: !!studyId,
    staleTime: 0, // 항상 최신 데이터
  })
}
```

---

### useApproveJoinRequest

가입 신청을 승인합니다.

```javascript
export function useApproveJoinRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, requestId }) => 
      api.post(`/api/studies/${studyId}/join-requests/${requestId}/approve`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'join-requests'])
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
      queryClient.invalidateQueries(['studies', variables.studyId])
    },
  })
}
```

---

### useRejectJoinRequest

가입 신청을 거절합니다.

```javascript
export function useRejectJoinRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, requestId, reason }) => 
      api.post(`/api/studies/${studyId}/join-requests/${requestId}/reject`, { reason }),
    onSuccess: (_, variables) => {
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

// MEMBER → ADMIN 승격
await changeMemberRole.mutateAsync({
  studyId,
  memberId: member.userId,
  role: 'ADMIN'
})

// ADMIN → MEMBER 강등
await changeMemberRole.mutateAsync({
  studyId,
  memberId: member.userId,
  role: 'MEMBER'
})
```

---

### useKickMember

멤버를 강퇴합니다.

```javascript
export function useKickMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studyId, memberId, reason }) => 
      api.delete(`/api/studies/${studyId}/members/${memberId}`, { 
        data: { reason } 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'members'])
      queryClient.invalidateQueries(['studies', variables.studyId])
    },
  })
}
```

---

## 쿼리 키 체계

```
my-studies
├── my-studies                    # 내 스터디 목록
│   └── [params]
│
studies
└── studies
    └── [studyId]                 # 스터디 상세
        ├── members               # 멤버 목록
        │   └── [params]
        ├── join-requests         # 가입 신청 목록
        ├── messages              # 채팅 메시지
        │   └── [params]
        ├── notices               # 공지사항
        │   └── [params]
        ├── files                 # 파일 목록
        │   └── [params]
        ├── events                # 일정 목록
        │   └── [params]
        └── tasks                 # 할일 목록
            └── [params]
```

---

## 캐시 무효화 패턴

| 작업 | 무효화 대상 |
|------|-------------|
| 메시지 전송/삭제 | `['studies', studyId, 'messages']` |
| 공지 CRUD | `['studies', studyId, 'notices']` |
| 파일 업로드/삭제 | `['studies', studyId, 'files']` |
| 일정 CRUD | `['studies', studyId, 'events']` |
| 할일 CRUD | `['studies', studyId, 'tasks']` |
| 가입 신청 승인/거절 | `['...', 'join-requests']`, `['...', 'members']`, `['studies', studyId]` |
| 역할 변경/강퇴 | `['...', 'members']`, `['studies', studyId]` |
| 스터디 설정 수정 | `['studies', studyId]`, `['my-studies']` |
| 스터디 삭제 | `['studies']`, `['my-studies']` |
| 스터디 탈퇴 | `['studies', studyId]` (제거), `['my-studies']`, `['dashboard']` |

---

## Socket.io 훅

### useSocket

Socket.io 연결을 관리합니다.

**파일 위치:** `src/lib/hooks/useSocket.js`

```javascript
export function useSocket() {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ['websocket'],
      // ...
    })
    
    socketInstance.on('connect', () => setIsConnected(true))
    socketInstance.on('disconnect', () => setIsConnected(false))
    
    setSocket(socketInstance)
    
    return () => socketInstance.disconnect()
  }, [])
  
  return { socket, isConnected }
}
```

---

### useVideoCall

화상통화 기능을 관리합니다.

**파일 위치:** `src/lib/hooks/useVideoCall.js`

```javascript
export function useVideoCall(studyId, roomId) {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState(new Map())
  const [participants, setParticipants] = useState([])
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isSharingScreen, setIsSharingScreen] = useState(false)
  const [speakingUsers, setSpeakingUsers] = useState(new Set())
  const [error, setError] = useState(null)
  
  const joinRoom = async () => { /* ... */ }
  const leaveRoom = () => { /* ... */ }
  const toggleMute = () => { /* ... */ }
  const toggleVideo = () => { /* ... */ }
  const shareScreen = async () => { /* ... */ }
  const stopScreenShare = () => { /* ... */ }
  
  return {
    localStream,
    remoteStreams,
    participants,
    isMuted,
    isVideoOff,
    isSharingScreen,
    someoneSharingScreen: false, // 다른 사람 화면 공유 여부
    speakingUsers,
    error,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleVideo,
    shareScreen,
    stopScreenShare,
  }
}
```

