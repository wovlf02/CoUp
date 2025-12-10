# React Query Hooks

## 개요

TanStack Query (React Query)를 사용하여 서버 상태를 관리합니다.

**위치:** `src/lib/hooks/useApi.js`

## 기본 설정

```javascript
// 공통 설정
{
  staleTime: 30000,      // 30초
  gcTime: 5 * 60 * 1000, // 5분 (구 cacheTime)
  retry: 3,
  refetchOnWindowFocus: true
}
```

---

## 사용자 Hooks

### useMe

현재 로그인 사용자 정보를 조회합니다.

```javascript
const { data, isLoading, error } = useMe({ enabled: true })
// data.user: 사용자 정보
```

### useUserStats

사용자 통계를 조회합니다.

```javascript
const { data } = useUserStats()
```

### useUpdateProfile

프로필을 수정합니다.

```javascript
const mutation = useUpdateProfile()
mutation.mutate({ name: '새 이름', bio: '자기소개' })
```

### useChangePassword

비밀번호를 변경합니다.

```javascript
const mutation = useChangePassword()
mutation.mutate({ currentPassword, newPassword })
```

### useSearchUsers

사용자를 검색합니다.

```javascript
const { data } = useSearchUsers('검색어')
// enabled: !!query (검색어 있을 때만)
```

---

## 대시보드 Hooks

### useDashboard

대시보드 데이터를 조회합니다.

```javascript
const { data, isLoading } = useDashboard()

// 설정
{
  refetchInterval: 30000,    // 30초마다 갱신
  staleTime: 20000,          // 20초 fresh
  gcTime: 5 * 60 * 1000,     // 5분 캐시
  refetchOnWindowFocus: true
}
```

---

## 스터디 Hooks

### useMyStudies

내 스터디 목록을 조회합니다.

```javascript
const { data } = useMyStudies({ status: 'ACTIVE' })

// 설정
{
  refetchInterval: 60000, // 1분마다 갱신
  staleTime: 30000
}
```

### useStudies

공개 스터디 목록을 조회합니다.

```javascript
const { data } = useStudies({ 
  category: 'programming',
  isRecruiting: true,
  page: 1 
})
```

### useStudy

스터디 상세 정보를 조회합니다.

```javascript
const { data } = useStudy(studyId)
// enabled: !!studyId
```

### useCreateStudy

스터디를 생성합니다.

```javascript
const mutation = useCreateStudy()
mutation.mutate({
  name: '스터디 이름',
  description: '설명',
  category: 'programming'
})

// onSuccess: invalidates ['studies'], ['my-studies']
```

### useUpdateStudy

스터디를 수정합니다.

```javascript
const mutation = useUpdateStudy()
mutation.mutate({ id: studyId, data: { name: '새 이름' } })
```

### useDeleteStudy

스터디를 삭제합니다.

```javascript
const mutation = useDeleteStudy()
mutation.mutate(studyId)
```

### useJoinStudy

스터디에 가입합니다. (Optimistic Update)

```javascript
const mutation = useJoinStudy()
mutation.mutate({ 
  id: studyId, 
  data: { introduction: '자기소개' } 
})

// Optimistic: memberCount 즉시 증가
// onError: 롤백
```

### useLeaveStudy

스터디에서 탈퇴합니다. (Optimistic Update)

```javascript
const mutation = useLeaveStudy()
mutation.mutate(studyId)

// Optimistic: 목록에서 즉시 제거
// onSuccess: 관련 캐시 제거
```

### useTransferOwnership

소유권을 이전합니다.

```javascript
const mutation = useTransferOwnership()
mutation.mutate({ studyId, targetUserId })
```

---

## 멤버 관리 Hooks

### useStudyMembers

스터디 멤버 목록을 조회합니다.

```javascript
const { data } = useStudyMembers(studyId, { role: 'ADMIN' })
```

### useJoinRequests

가입 신청 목록을 조회합니다.

```javascript
const { data } = useJoinRequests(studyId)
// staleTime: 0 (항상 최신)
```

### useApproveMember

멤버를 승인합니다.

```javascript
const mutation = useApproveMember()
mutation.mutate({ studyId, userId })
```

### useRejectMember

멤버를 거절합니다.

```javascript
const mutation = useRejectMember()
mutation.mutate({ studyId, userId })
```

### useChangeMemberRole

멤버 역할을 변경합니다.

```javascript
const mutation = useChangeMemberRole()
mutation.mutate({ studyId, memberId, role: 'ADMIN' })
```

### useKickMember

멤버를 강퇴합니다.

```javascript
const mutation = useKickMember()
mutation.mutate({ studyId, memberId, reason: '사유' })
```

---

## 채팅 Hooks

### useChatMessages

채팅 메시지를 조회합니다.

```javascript
const { data } = useChatMessages(studyId, { cursor, limit: 50 })
```

### useMessages

채팅 메시지를 조회합니다. (폴링)

```javascript
const { data } = useMessages(studyId)
// refetchInterval: 5000 (5초)
```

### useSendMessage

메시지를 전송합니다.

```javascript
const mutation = useSendMessage()
mutation.mutate({ studyId, data: { content: '메시지' } })
```

### useDeleteMessage

메시지를 삭제합니다.

```javascript
const mutation = useDeleteMessage()
mutation.mutate({ studyId, messageId })
```

### useSearchChat

채팅을 검색합니다.

```javascript
const { data } = useSearchChat(studyId, { q: '검색어' })
// enabled: !!studyId && !!params.q
```

---

## 공지사항 Hooks

### useNotices

공지 목록을 조회합니다.

```javascript
const { data } = useNotices(studyId, { isPinned: true })
```

### useNotice

공지 상세를 조회합니다.

```javascript
const { data } = useNotice(studyId, noticeId)
```

### useCreateNotice

공지를 생성합니다.

```javascript
const mutation = useCreateNotice()
mutation.mutate({ studyId, data: { title, content } })
```

### useUpdateNotice

공지를 수정합니다.

```javascript
const mutation = useUpdateNotice()
mutation.mutate({ studyId, noticeId, data: { title } })
```

### useDeleteNotice

공지를 삭제합니다.

```javascript
const mutation = useDeleteNotice()
mutation.mutate({ studyId, noticeId })
```

### useTogglePinNotice

공지 고정을 토글합니다.

```javascript
const mutation = useTogglePinNotice()
mutation.mutate({ studyId, noticeId })
```

---

## 파일 Hooks

### useFiles

파일 목록을 조회합니다.

```javascript
const { data } = useFiles(studyId, { folderId })
```

### useUploadFile

파일을 업로드합니다.

```javascript
const mutation = useUploadFile()
mutation.mutate({ studyId, formData })
```

### useDeleteFile

파일을 삭제합니다.

```javascript
const mutation = useDeleteFile()
mutation.mutate({ studyId, fileId })
```

---

## 캘린더 Hooks

### useEvents

일정 목록을 조회합니다.

```javascript
const { data } = useEvents(studyId, { year: 2025, month: 12 })
```

### useCreateEvent

일정을 생성합니다.

```javascript
const mutation = useCreateEvent()
mutation.mutate({ studyId, data: { title, date, startTime, endTime } })
```

### useUpdateEvent

일정을 수정합니다.

```javascript
const mutation = useUpdateEvent()
mutation.mutate({ studyId, eventId, data: { title } })
```

### useDeleteEvent

일정을 삭제합니다.

```javascript
const mutation = useDeleteEvent()
mutation.mutate({ studyId, eventId })
```

---

## 할일 Hooks

### useTasks

개인 할일 목록을 조회합니다.

```javascript
const { data } = useTasks({ status: 'TODO', completed: false })
```

### useTask

할일 상세를 조회합니다.

```javascript
const { data } = useTask(taskId)
```

### useCreateTask

할일을 생성합니다.

```javascript
const mutation = useCreateTask()
mutation.mutate({ title, priority: 'HIGH', dueDate })
```

### useUpdateTask

할일을 수정합니다.

```javascript
const mutation = useUpdateTask()
mutation.mutate({ id: taskId, data: { title } })
```

### useDeleteTask

할일을 삭제합니다.

```javascript
const mutation = useDeleteTask()
mutation.mutate(taskId)
```

### useToggleTask

할일 완료를 토글합니다.

```javascript
const mutation = useToggleTask()
mutation.mutate(taskId)
```

### useTaskStats

할일 통계를 조회합니다.

```javascript
const { data } = useTaskStats()
```

### useStudyTasks

스터디 할일 목록을 조회합니다.

```javascript
const { data } = useStudyTasks(studyId, { status: 'IN_PROGRESS' })
```

---

## 알림 Hooks

### useNotifications

알림 목록을 조회합니다.

```javascript
const { data } = useNotifications({ limit: 20 }, { enabled: true })
```

### useMarkNotificationAsRead

알림을 읽음 처리합니다.

```javascript
const mutation = useMarkNotificationAsRead()
mutation.mutate(notificationId)
```

### useMarkAllNotificationsAsRead

전체 알림을 읽음 처리합니다.

```javascript
const mutation = useMarkAllNotificationsAsRead()
mutation.mutate()
```

---

## Query Key 구조

```javascript
// 사용자
['user', 'me']
['user', 'stats']
['users', 'search', query]
['users', userId]

// 대시보드
['dashboard']

// 스터디
['studies', params]
['studies', studyId]
['my-studies', params]

// 멤버
['studies', studyId, 'members', params]
['studies', studyId, 'join-requests']

// 채팅
['studies', studyId, 'chat', params]
['studies', studyId, 'messages', params]
['studies', studyId, 'chat', 'search', params]

// 공지
['studies', studyId, 'notices', params]
['studies', studyId, 'notices', noticeId]

// 파일
['studies', studyId, 'files', params]

// 캘린더
['studies', studyId, 'calendar', params]

// 할일
['tasks', params]
['tasks', taskId]
['tasks', 'stats']
['studies', studyId, 'tasks', params]

// 알림
['notifications', params]
```

