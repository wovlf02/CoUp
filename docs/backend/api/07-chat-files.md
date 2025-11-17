# 채팅 & 파일 API 명세

## 📋 개요
- 채팅: 4개 API
- 파일: 4개 API

---

## 💬 채팅 API (4개)

### 1. GET `/api/studies/[studyId]/chat` - 메시지 목록
**권한**: MEMBER+  
**Query**: `?cursor=msg-123&limit=50`

**무한 스크롤 (Cursor 기반)**:
```json
{
  "data": [
    {
      "id": "msg-1",
      "content": "안녕하세요!",
      "user": {
        "id": "user-1",
        "name": "김민준",
        "avatar": "https://..."
      },
      "file": null,
      "readers": ["user-1", "user-2"],
      "createdAt": "2025-11-18T10:00:00Z"
    }
  ],
  "hasMore": true,
  "nextCursor": "msg-100"
}
```

### 2. POST `/api/studies/[studyId]/chat` - 메시지 전송
**Body**:
```json
{
  "content": "안녕하세요!",
  "fileId": "file-1" // 선택
}
```

**알림**: 멤버들에게 CHAT 알림 (최대 10명)

### 3. POST `/api/studies/[studyId]/chat/[messageId]/read` - 읽음 처리
**자동**: `readers` 배열에 userId 추가

### 4. DELETE `/api/studies/[studyId]/chat/[messageId]` - 삭제
**권한**: 작성자 또는 ADMIN+

---

## 📁 파일 API (4개)

### 1. POST `/api/studies/[studyId]/files` - 업로드
**Content-Type**: `multipart/form-data`

**FormData**:
```javascript
const formData = new FormData()
formData.append('file', file)
formData.append('folderId', 'folder-1') // 선택
```

**제한**:
- 최대 크기: 50MB
- 저장 위치: `/public/uploads/{studyId}/`

**Response**:
```json
{
  "success": true,
  "file": {
    "id": "file-1",
    "name": "document.pdf",
    "size": 1024000,
    "type": "application/pdf",
    "url": "/uploads/study-1/1732000000-document.pdf",
    "uploader": { "name": "김민준" },
    "downloads": 0
  }
}
```

**알림**: 멤버들에게 FILE 알림

### 2. GET `/api/studies/[studyId]/files` - 목록
**Query**: `?folderId=folder-1&page=1&limit=20`

### 3. GET `/api/studies/[studyId]/files/[fileId]/download` - 다운로드
**자동**: `downloads` +1

**Response**: 파일 스트림
```
Content-Type: {fileType}
Content-Disposition: attachment; filename="{fileName}"
```

### 4. DELETE `/api/studies/[studyId]/files/[fileId]` - 삭제
**권한**: 업로더 또는 ADMIN+  
**자동**: 파일 시스템에서도 삭제

---

## 🔄 실시간 업데이트

### 채팅 폴링 (현재)
```javascript
useQuery({
  queryKey: ['chat', studyId],
  queryFn: () => fetchChat(studyId),
  refetchInterval: 5000 // 5초마다
})
```

### WebSocket (향후)
```javascript
// Socket.IO 추가 시
socket.on('new-message', (message) => {
  queryClient.setQueryData(['chat', studyId], old => {
    return [...old, message]
  })
})
```

---

## 📊 파일 타입 아이콘

```javascript
const fileIcons = {
  'application/pdf': '📄',
  'image/*': '🖼️',
  'video/*': '🎥',
  'application/zip': '📦',
  'text/*': '📝'
}
```

---

## 🎨 UI 예시

### 무한 스크롤 채팅
```jsx
function ChatRoom({ studyId }) {
  const [cursor, setCursor] = useState(null)
  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ['chat', studyId],
    queryFn: ({ pageParam }) => fetchMessages(studyId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor
  })

  return (
    <InfiniteScroll
      loadMore={fetchNextPage}
      hasMore={data?.pages[0]?.hasMore}
    >
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
    </InfiniteScroll>
  )
}
```

### 파일 업로드
```jsx
function FileUpload({ studyId }) {
  const upload = useUploadFile(studyId)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      await upload.mutateAsync(formData)
      toast.success('업로드 완료')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return <input type="file" onChange={handleUpload} />
}
```

---

**최종 업데이트**: 2025-11-18

