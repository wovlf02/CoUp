   - 환경 변수로 mock/real API 전환
   - 화면별 독립적 전환 가능

---

## 📋 Mock Data 상세 구조

### 1️⃣ **users.js** - 사용자 데이터
```javascript
// mocks/data/users.js
export const mockUsers = [
  {
    id: 1,
    email: 'john@example.com',
    name: '김민준',
    imageUrl: '/images/avatars/user1.jpg',
    bio: '프론트엔드 개발자입니다.',
    role: 'USER',
    createdAt: '2024-01-15T09:00:00Z',
    _count: {
      ownedGroups: 2,
      memberships: 5,
      files: 12
    }
  },
  {
    id: 2,
    email: 'admin@coup.com',
    name: '관리자',
    imageUrl: '/images/avatars/admin.jpg',
    bio: '시스템 관리자',
    role: 'SYSTEM_ADMIN',
    createdAt: '2024-01-01T00:00:00Z',
    _count: {
      ownedGroups: 0,
      memberships: 0,
      files: 0
    }
  },
  // ... 20+ 사용자
]

export const mockCurrentUser = mockUsers[0]
```

### 2️⃣ **studies.js** - 스터디 데이터
```javascript
// mocks/data/studies.js
export const mockStudies = [
  {
    id: 1,
    name: 'React 마스터 클래스',
    description: 'React 18의 새로운 기능을 함께 학습합니다.',
    category: 'PROGRAMMING',
    imageUrl: '/images/studies/react.jpg',
    visibility: 'PUBLIC',
    maxMembers: 10,
    status: 'ACTIVE',
    ownerId: 1,
    owner: {
      id: 1,
      name: '김민준',
      imageUrl: '/images/avatars/user1.jpg'
    },
    createdAt: '2024-02-01T10:00:00Z',
    _count: {
      members: 7,
      notices: 15,
      files: 23,
      events: 8
    },
    members: [
      {
        id: 1,
        userId: 1,
        groupId: 1,
        role: 'OWNER',
        joinedAt: '2024-02-01T10:00:00Z',
        user: {
          id: 1,
          name: '김민준',
          imageUrl: '/images/avatars/user1.jpg'
        }
      },
      // ... 6명 더
    ]
  },
  {
    id: 2,
    name: '알고리즘 스터디',
    description: '매일 알고리즘 문제를 풀고 리뷰합니다.',
    category: 'ALGORITHM',
    imageUrl: '/images/studies/algorithm.jpg',
    visibility: 'PUBLIC',
    maxMembers: 15,
    status: 'ACTIVE',
    ownerId: 3,
    owner: {
      id: 3,
      name: '이서연',
      imageUrl: '/images/avatars/user3.jpg'
    },
    createdAt: '2024-01-20T14:00:00Z',
    _count: {
      members: 12,
      notices: 30,
      files: 45,
      events: 20
    }
  },
  // ... 30+ 스터디
]

export const studyCategories = [
  'PROGRAMMING',
  'ALGORITHM',
  'DESIGN',
  'LANGUAGE',
  'CERTIFICATE',
  'OTHER'
]
```

### 3️⃣ **messages.js** - 채팅 메시지
```javascript
// mocks/data/messages.js
export const mockMessages = {
  1: [ // studyId: 1
    {
      id: 1,
      content: '안녕하세요! React 스터디에 오신 걸 환영합니다 👋',
      userId: 1,
      groupId: 1,
      createdAt: '2024-02-01T10:05:00Z',
      user: {
        id: 1,
        name: '김민준',
        imageUrl: '/images/avatars/user1.jpg'
      }
    },
    {
      id: 2,
      content: '감사합니다! 열심히 하겠습니다 😊',
      userId: 4,
      groupId: 1,
      createdAt: '2024-02-01T10:07:00Z',
      user: {
        id: 4,
        name: '박지민',
        imageUrl: '/images/avatars/user4.jpg'
      }
    },
    // ... 100+ 메시지
  ],
  2: [ // studyId: 2
    // ...
  ]
}
```

### 4️⃣ **notices.js** - 공지사항
```javascript
// mocks/data/notices.js
export const mockNotices = [
  {
    id: 1,
    title: '🎉 스터디 시작 안내',
    content: `# 환영합니다!

React 스터디가 시작되었습니다.

## 📅 일정
- 매주 화, 목 오후 8시
- 온라인 Zoom 회의

## 📚 커리큘럼
1. React 기초 (1-2주)
2. Hooks 심화 (3-4주)
3. 상태 관리 (5-6주)

함께 열심히 해봐요! 💪`,
    groupId: 1,
    authorId: 1,
    author: {
      id: 1,
      name: '김민준',
      imageUrl: '/images/avatars/user1.jpg'
    },
    isPinned: true,
    createdAt: '2024-02-01T11:00:00Z',
    _count: {
      comments: 5
    }
  },
  // ... 50+ 공지
]
```

### 5️⃣ **files.js** - 파일 데이터
```javascript
// mocks/data/files.js
export const mockFiles = [
  {
    id: 1,
    name: 'React_Hooks_정리.pdf',
    originalName: 'React_Hooks_정리.pdf',
    mimeType: 'application/pdf',
    size: 2048576, // 2MB
    url: '/mock-files/react-hooks.pdf',
    groupId: 1,
    uploaderId: 1,
    uploader: {
      id: 1,
      name: '김민준',
      imageUrl: '/images/avatars/user1.jpg'
    },
    createdAt: '2024-02-05T15:30:00Z'
  },
  {
    id: 2,
    name: '알고리즘_문제_모음.zip',
    originalName: '알고리즘_문제_모음.zip',
    mimeType: 'application/zip',
    size: 5242880, // 5MB
    url: '/mock-files/algorithms.zip',
    groupId: 2,
    uploaderId: 3,
    uploader: {
      id: 3,
      name: '이서연',
      imageUrl: '/images/avatars/user3.jpg'
    },
    createdAt: '2024-02-10T10:00:00Z'
  },
  // ... 100+ 파일
]
```

### 6️⃣ **events.js** - 캘린더 이벤트
```javascript
// mocks/data/events.js
export const mockEvents = [
  {
    id: 1,
    title: 'React Hooks 스터디',
    description: 'useState, useEffect 심화 학습',
    startTime: '2024-03-05T20:00:00Z',
    endTime: '2024-03-05T22:00:00Z',
    location: 'Zoom',
    groupId: 1,
    creatorId: 1,
    creator: {
      id: 1,
      name: '김민준',
      imageUrl: '/images/avatars/user1.jpg'
    },
    attendees: [1, 4, 5, 7],
    createdAt: '2024-02-28T10:00:00Z'
  },
  // ... 50+ 이벤트
]
```

### 7️⃣ **tasks.js** - 할 일 데이터
```javascript
// mocks/data/tasks.js
export const mockTasks = [
  {
    id: 1,
    title: 'React 공식 문서 읽기',
    description: 'Hooks 섹션 전체 읽고 정리하기',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2024-03-10T23:59:59Z',
    groupId: 1,
    assigneeId: 1,
    assignee: {
      id: 1,
      name: '김민준',
      imageUrl: '/images/avatars/user1.jpg'
    },
    creatorId: 1,
    createdAt: '2024-03-01T09:00:00Z'
  },
  {
    id: 2,
    title: '백준 10문제 풀기',
    description: 'DP 문제 위주로 풀기',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: '2024-03-08T23:59:59Z',
    groupId: 2,
    assigneeId: 4,
    assignee: {
      id: 4,
      name: '박지민',
      imageUrl: '/images/avatars/user4.jpg'
    },
    creatorId: 3,
    createdAt: '2024-03-02T10:00:00Z'
  },
  // ... 100+ 할 일
]
```

### 8️⃣ **notifications.js** - 알림
```javascript
// mocks/data/notifications.js
export const mockNotifications = [
  {
    id: 1,
    type: 'STUDY_INVITE',
    title: '스터디 초대',
    message: '김민준님이 "React 마스터 클래스" 스터디에 초대했습니다.',
    isRead: false,
    userId: 4,
    relatedId: 1, // studyId
    createdAt: '2024-03-04T14:30:00Z'
  },
  {
    id: 2,
    type: 'NEW_MESSAGE',
    title: '새 메시지',
    message: '박지민님이 메시지를 보냈습니다.',
    isRead: false,
    userId: 1,
    relatedId: 1, // messageId
    createdAt: '2024-03-04T15:00:00Z'
  },
  {
    id: 3,
    type: 'TASK_ASSIGNED',
    title: '할 일 배정',
    message: '새로운 할 일이 배정되었습니다: "React 공식 문서 읽기"',
    isRead: true,
    userId: 1,
    relatedId: 1, // taskId
    createdAt: '2024-03-01T09:05:00Z'
  },
  // ... 50+ 알림
]
```

### 9️⃣ **analytics.js** - 관리자 분석 데이터
```javascript
// mocks/data/analytics.js
export const mockAnalytics = {
  overview: {
    totalUsers: 1234,
    activeUsers: 892,
    totalStudies: 156,
    activeStudies: 89,
    totalMessages: 45678,
    totalFiles: 3456
  },
  userGrowth: [
    { date: '2024-01', count: 50 },
    { date: '2024-02', count: 120 },
    { date: '2024-03', count: 280 },
    // ... 12개월
  ],
  studyCategories: [
    { category: 'PROGRAMMING', count: 45 },
    { category: 'ALGORITHM', count: 32 },
    { category: 'DESIGN', count: 18 },
    // ...
  ],
  topStudies: [
    {
      id: 1,
      name: 'React 마스터 클래스',
      members: 15,
      messages: 1234
    },
    // ... 10개
  ]
}
```

---

## 🔌 Mock API 핸들러 구조

### MSW (Mock Service Worker) 설정

```javascript
// mocks/browser.js
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

// 개발 환경에서만 활성화
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
  worker.start({
    onUnhandledRequest: 'bypass', // 실제 API 요청은 통과
  })
}
```

```javascript
// mocks/handlers/index.js
import { authHandlers } from './auth.handlers'
import { studiesHandlers } from './studies.handlers'
import { chatHandlers } from './chat.handlers'
import { noticesHandlers } from './notices.handlers'
import { filesHandlers } from './files.handlers'
import { calendarHandlers } from './calendar.handlers'
import { tasksHandlers } from './tasks.handlers'
import { notificationsHandlers } from './notifications.handlers'
import { adminHandlers } from './admin.handlers'

export const handlers = [
  ...authHandlers,
  ...studiesHandlers,
  ...chatHandlers,
  ...noticesHandlers,
  ...filesHandlers,
  ...calendarHandlers,
  ...tasksHandlers,
  ...notificationsHandlers,
  ...adminHandlers,
]
```

### 핸들러 예시

```javascript
// mocks/handlers/studies.handlers.js
import { http, HttpResponse } from 'msw'
import { mockStudies } from '../data/studies'
import { delay } from '../utils/delay'

export const studiesHandlers = [
  // GET /api/v1/studies - 스터디 목록
  http.get('/api/v1/studies', async ({ request }) => {
    await delay(500) // 네트워크 지연 시뮬레이션

    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const keyword = url.searchParams.get('keyword')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = 12

    let filtered = mockStudies

    // 카테고리 필터
    if (category) {
      filtered = filtered.filter(s => s.category === category)
    }

    // 키워드 검색
    if (keyword) {
      filtered = filtered.filter(s => 
        s.name.includes(keyword) || s.description.includes(keyword)
      )
    }

    // 페이지네이션
    const start = (page - 1) * limit
    const end = start + limit
    const data = filtered.slice(start, end)

    return HttpResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit)
      }
    })
  }),

  // GET /api/v1/studies/:id - 스터디 상세
  http.get('/api/v1/studies/:id', async ({ params }) => {
    await delay(300)

    const study = mockStudies.find(s => s.id === parseInt(params.id))

    if (!study) {
      return HttpResponse.json(
        { success: false, error: 'Study not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: study
    })
  }),

  // POST /api/v1/studies - 스터디 생성
  http.post('/api/v1/studies', async ({ request }) => {
    await delay(800)

    const body = await request.json()

    const newStudy = {
      id: mockStudies.length + 1,
      ...body,
      ownerId: 1, // 현재 사용자
      owner: {
        id: 1,
        name: '김민준',
        imageUrl: '/images/avatars/user1.jpg'
      },
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      _count: {
        members: 1,
        notices: 0,
        files: 0,
        events: 0
      }
    }

    // LocalStorage에 저장 (상태 유지)
    mockStudies.push(newStudy)

    return HttpResponse.json({
      success: true,
      data: newStudy
    }, { status: 201 })
  }),

  // PUT /api/v1/studies/:id - 스터디 수정
  http.put('/api/v1/studies/:id', async ({ params, request }) => {
    await delay(600)

    const body = await request.json()
    const index = mockStudies.findIndex(s => s.id === parseInt(params.id))

    if (index === -1) {
      return HttpResponse.json(
        { success: false, error: 'Study not found' },
        { status: 404 }
      )
    }

    mockStudies[index] = {
      ...mockStudies[index],
      ...body,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({
      success: true,
      data: mockStudies[index]
    })
  }),

  // DELETE /api/v1/studies/:id - 스터디 삭제
  http.delete('/api/v1/studies/:id', async ({ params }) => {
    await delay(400)

    const index = mockStudies.findIndex(s => s.id === parseInt(params.id))

    if (index === -1) {
      return HttpResponse.json(
        { success: false, error: 'Study not found' },
        { status: 404 }
      )
    }

    mockStudies.splice(index, 1)

    return HttpResponse.json({
      success: true,
      message: 'Study deleted'
    })
  })
]
```

---

## 🚀 Mock API 사용 방법

### 1. 환경 변수 설정

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK=true          # Mock API 사용 여부
NEXT_PUBLIC_API_BASE_URL=/api/v1   # API Base URL
```

### 2. App Provider 설정

```javascript
// app/providers.jsx
'use client'

import { useEffect } from 'react'

export function Providers({ children }) {
  useEffect(() => {
    // Mock API 초기화
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      import('@/mocks/browser').then(({ worker }) => {
        worker.start()
      })
    }
  }, [])

  return <>{children}</>
}
```

### 3. API 클라이언트

```javascript
// lib/api/client.js
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 토큰 추가 (실제 API)
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
```

### 4. React Query 사용

```javascript
// lib/api/queries/useStudies.js
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'

export function useStudies(filters) {
  return useQuery({
    queryKey: ['studies', filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/studies', { params: filters })
      return data.data
    },
    staleTime: 60 * 1000 // 1분
  })
}

export function useStudy(studyId) {
  return useQuery({
    queryKey: ['studies', studyId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/studies/${studyId}`)
      return data.data
    },
    enabled: !!studyId
  })
}
```

---

## 📦 Mock 관련 의존성

```json
{
  "devDependencies": {
    "msw": "^2.0.0",              // Mock Service Worker
    "@faker-js/faker": "^8.0.0"   // 가짜 데이터 생성
  }
}
```

---

## 🎯 개발 단계별 전환 전략

### Phase 1: 완전 Mock (1-2주)
- 모든 API Mock 사용
- 화면 UI/UX 구현에 집중
- `NEXT_PUBLIC_USE_MOCK=true`

### Phase 2: 부분 실제 API (3-4주)
- 인증 API → 실제 API
- 간단한 CRUD → 실제 API
- 복잡한 기능 → Mock 유지

### Phase 3: 완전 실제 API (5주~)
- 모든 API → 실제 API
- Mock은 테스트용으로만 유지
- `NEXT_PUBLIC_USE_MOCK=false`

### 핸들러별 전환

```javascript
// mocks/handlers/index.js
export const handlers = [
  // 실제 API로 전환 완료 (주석 처리)
  // ...authHandlers,

  // Mock API 사용 중
  ...studiesHandlers,
  ...chatHandlers,
  
  // 개발 중 (아직 미구현)
  ...noticesHandlers,
  ...filesHandlers,
]
```

---


