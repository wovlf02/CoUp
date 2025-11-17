# 스터디 콘텐츠 API 명세 (공지/일정/할일)

## 📋 개요
구현된 API: 18개 (공지 6개 + 일정 4개 + 할일 8개)

---

## 📢 공지사항 API (6개)

### 1. GET `/api/studies/[studyId]/notices` - 목록
**권한**: MEMBER+

**Query**: `?page=1&limit=10&pinned=true`

**Response**:
```json
{
  "data": [{
    "id": "notice-1",
    "title": "스터디 규칙 안내",
    "content": "...",
    "isPinned": true,
    "isImportant": true,
    "views": 25,
    "author": { "name": "김민준" },
    "createdAt": "2025-11-18"
  }],
  "pagination": { "total": 20 }
}
```

### 2. POST `/api/studies/[studyId]/notices` - 작성
**권한**: ADMIN+  
**Body**: `{ "title", "content", "isPinned", "isImportant" }`  
**알림**: 멤버 전체에게 NOTICE 알림

### 3. GET `/api/studies/[studyId]/notices/[noticeId]` - 상세
**권한**: MEMBER+  
**자동**: 조회수 +1

### 4. PATCH `/api/studies/[studyId]/notices/[noticeId]` - 수정
**권한**: 작성자 또는 ADMIN+

### 5. DELETE `/api/studies/[studyId]/notices/[noticeId]` - 삭제
**권한**: 작성자 또는 ADMIN+

### 6. POST `/api/studies/[studyId]/notices/[noticeId]/pin` - 고정 토글
**권한**: ADMIN+

---

## 📅 캘린더 API (4개)

### 1. GET `/api/studies/[studyId]/calendar` - 목록
**권한**: MEMBER+  
**Query**: `?month=2025-11`  
**Response**: 해당 월의 모든 일정

### 2. POST `/api/studies/[studyId]/calendar` - 생성
**권한**: ADMIN+  
**Body**:
```json
{
  "title": "주간 스터디",
  "date": "2025-11-19",
  "startTime": "19:00",
  "endTime": "21:00",
  "location": "Zoom",
  "color": "#6366F1"
}
```
**알림**: 멤버 전체에게 EVENT 알림

### 3. PATCH `/api/studies/[studyId]/calendar/[eventId]` - 수정
**권한**: ADMIN+

### 4. DELETE `/api/studies/[studyId]/calendar/[eventId]` - 삭제
**권한**: ADMIN+

---

## ✅ 할일 API (8개)

### 1. GET `/api/tasks` - 내 할일 목록
**Query**: 
- `?studyId=study-1` (특정 스터디)
- `?status=TODO` (TODO/IN_PROGRESS/REVIEW/DONE)
- `?completed=false`

### 2. POST `/api/tasks` - 생성
**Body**:
```json
{
  "studyId": "study-1", // 선택 (개인 할일 가능)
  "title": "백준 1234번 풀이",
  "description": "DP 문제",
  "status": "TODO",
  "priority": "HIGH", // LOW/MEDIUM/HIGH/URGENT
  "dueDate": "2025-11-20"
}
```

### 3. GET `/api/tasks/[id]` - 상세

### 4. PATCH `/api/tasks/[id]` - 수정

### 5. PATCH `/api/tasks/[id]/toggle` - 완료 토글
**자동**: `completed` 토글, `completedAt` 설정

### 6. DELETE `/api/tasks/[id]` - 삭제

---

## 🎨 UI 활용

### 공지사항 표시
```jsx
// 고정 공지 우선, 중요 공지 배지
<Notice
  isPinned={notice.isPinned}
  isImportant={notice.isImportant}
  title={notice.title}
/>
```

### 캘린더 월별 필터
```javascript
const month = '2025-11'
const { data } = useCalendar(studyId, { month })
```

### 할일 우선순위 색상
```javascript
const colors = {
  URGENT: 'red',
  HIGH: 'orange',
  MEDIUM: 'blue',
  LOW: 'gray'
}
```

---

**최종 업데이트**: 2025-11-18

