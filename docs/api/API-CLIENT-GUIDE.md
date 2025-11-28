# API 클라이언트 가이드

**작성일**: 2025-11-29  
**버전**: 2.0.0

---

## 📝 개요

CoUp 프로젝트의 모든 API 호출은 중앙화된 API 클라이언트(`/src/lib/api.js`)를 통해 이루어집니다.

### 주요 특징

- ✅ **자동 인증**: 쿠키 기반 인증 자동 처리 (`credentials: 'include'`)
- ✅ **에러 핸들링**: 통일된 에러 처리 (`ApiError` 클래스)
- ✅ **자동 로깅**: 모든 요청/응답 콘솔 로그
- ✅ **Query Parameters**: 자동 URL 인코딩
- ✅ **JSON**: 자동 직렬화/역직렬화
- ✅ **간단한 인터페이스**: `api.get()`, `api.post()` 등

---

## 🚀 기본 사용법

### Import

```javascript
import api from '@/lib/api'
```

### GET 요청

```javascript
// 단순 GET
const stats = await api.get('/api/admin/stats')

// Query Parameters와 함께
const users = await api.get('/api/admin/users', {
  page: 1,
  limit: 20,
  search: 'john',
  status: 'ACTIVE'
})

console.log(users.data.users)
```

### POST 요청

```javascript
// 데이터 생성
const newStudy = await api.post('/api/studies', {
  title: '리액트 스터디',
  description: '함께 공부해요',
  maxMembers: 5
})

// 액션 실행
await api.post('/api/admin/users/user-id/warn', {
  reason: '부적절한 언어 사용',
  severity: 'MEDIUM'
})
```

### PUT 요청 (전체 업데이트)

```javascript
// 전체 리소스 업데이트
await api.put('/api/user/profile', {
  name: 'New Name',
  bio: 'New Bio',
  avatar: 'https://...'
})
```

### PATCH 요청 (부분 업데이트)

```javascript
// 일부 필드만 업데이트
await api.patch('/api/admin/users/123', {
  status: 'SUSPENDED'
})
```

### DELETE 요청

```javascript
// 리소스 삭제
await api.delete('/api/admin/users/123')
```

---

## 📚 HTTP 메서드 전체 지원

### 지원하는 메서드

| 메서드 | 용도 | 사용 예시 |
|--------|------|-----------|
| **GET** | 데이터 조회 | `api.get('/api/users')` |
| **POST** | 데이터 생성, 액션 | `api.post('/api/users', data)` |
| **PUT** | 전체 업데이트 | `api.put('/api/users/1', data)` |
| **PATCH** | 부분 업데이트 | `api.patch('/api/users/1', data)` |
| **DELETE** | 삭제 | `api.delete('/api/users/1')` |
| **HEAD** | 헤더만 확인 | `api.head('/api/users/1')` |
| **OPTIONS** | 지원 메서드 확인 | `api.options('/api/users')` |

---

## 💡 실전 예시

### 관리자 대시보드

```javascript
import api from '@/lib/api'

// 통계 조회
const stats = await api.get('/api/admin/stats')
console.log(stats.data.summary)

// 사용자 목록 (페이지네이션)
const users = await api.get('/api/admin/users', {
  page: 1,
  limit: 20,
  status: 'ACTIVE',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})
```

### 사용자 관리

```javascript
// 사용자 상세 조회
const user = await api.get('/api/admin/users/user-id')

// 사용자 정보 수정
await api.patch('/api/admin/users/user-id', {
  name: 'New Name'
})

// 사용자 경고
await api.post('/api/admin/users/user-id/warn', {
  reason: '부적절한 언어',
  severity: 'MEDIUM',
  description: '상세 설명'
})

// 사용자 정지
await api.post('/api/admin/users/user-id/suspend', {
  reason: '규정 위반',
  duration: 7,  // 일수
  note: '7일 정지'
})

// 정지 해제
await api.post('/api/admin/users/user-id/unsuspend')

// 사용자 삭제
await api.delete('/api/admin/users/user-id')
```

### 스터디 관리

```javascript
// 스터디 목록
const studies = await api.get('/api/admin/studies', {
  page: 1,
  search: 'React',
  category: 'DEVELOPMENT'
})

// 스터디 상세
const study = await api.get('/api/admin/studies/study-id')

// 스터디 수정
await api.patch('/api/admin/studies/study-id', {
  title: 'New Title',
  description: 'New Description'
})

// 스터디 숨김
await api.post('/api/admin/studies/study-id/hide', {
  reason: '부적절한 콘텐츠'
})

// 스터디 강제 종료
await api.post('/api/admin/studies/study-id/close', {
  reason: '운영 규정 위반'
})

// 스터디 삭제
await api.delete('/api/admin/studies/study-id')
```

### 신고 처리

```javascript
// 신고 목록
const reports = await api.get('/api/admin/reports', {
  status: 'PENDING',
  priority: 'HIGH',
  page: 1
})

// 신고 상세
const report = await api.get('/api/admin/reports/report-id')

// 담당자 배정
await api.post('/api/admin/reports/report-id/assign', {
  assigneeId: 'admin-user-id'
})

// 신고 처리
await api.post('/api/admin/reports/report-id/process', {
  decision: 'APPROVED',
  action: 'WARN_USER',
  note: '처리 완료'
})
```

### 일반 사용자 API

```javascript
// 내 정보 조회
const me = await api.get('/api/auth/me')

// 프로필 수정
await api.patch('/api/user/profile', {
  name: 'New Name',
  bio: 'New Bio'
})

// 스터디 생성
const newStudy = await api.post('/api/studies', {
  title: '스터디 제목',
  description: '설명',
  category: 'DEVELOPMENT',
  maxMembers: 5
})

// 스터디 참가
await api.post('/api/studies/study-id/join')

// 스터디 탈퇴
await api.post('/api/studies/study-id/leave')
```

---

## 🔧 고급 기능

### Query Parameters

자동으로 URL 인코딩됩니다:

```javascript
const result = await api.get('/api/search', {
  q: '검색어',
  category: 'DEVELOPMENT',
  tags: ['React', 'TypeScript'],
  page: 1,
  limit: 20,
  minMembers: 3,
  maxMembers: 10
})

// 실제 URL: /api/search?q=%EA%B2%80%EC%83%89%EC%96%B4&category=DEVELOPMENT&tags=React&tags=TypeScript&page=1&limit=20&minMembers=3&maxMembers=10
```

**빈 값 자동 제거**:
```javascript
const result = await api.get('/api/users', {
  name: 'John',
  age: null,        // 제거됨
  city: undefined,  // 제거됨
  status: ''        // 제거됨
})
// 실제 URL: /api/users?name=John
```

### 에러 핸들링

```javascript
import { ApiError } from '@/lib/api'

try {
  await api.delete('/api/admin/users/123')
  alert('삭제 완료')
} catch (error) {
  if (error instanceof ApiError) {
    // HTTP 상태 코드로 분기
    if (error.status === 403) {
      alert('권한이 없습니다')
    } else if (error.status === 404) {
      alert('사용자를 찾을 수 없습니다')
    } else if (error.status === 500) {
      alert('서버 오류가 발생했습니다')
    } else {
      alert(`오류: ${error.message}`)
    }
    
    // 추가 데이터 확인
    console.log('Error data:', error.data)
  } else {
    alert('네트워크 오류')
  }
}
```

### 커스텀 헤더

```javascript
const result = await api.post('/api/upload', data, {
  headers: {
    'X-Custom-Header': 'value'
  }
})
```

### 타임아웃 설정

```javascript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 5000)

try {
  const result = await api.get('/api/slow-endpoint', null, {
    signal: controller.signal
  })
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('요청이 타임아웃되었습니다')
  }
} finally {
  clearTimeout(timeoutId)
}
```

---

## 💡 Best Practices

### 1. 컴포넌트에서 사용

```javascript
'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export default function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      const result = await api.get('/api/admin/users', {
        page: 1,
        limit: 20
      })
      setUsers(result.data.users)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>로딩 중...</div>
  if (error) return <div>오류: {error}</div>

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### 2. 에러 처리 일관성

```javascript
async function handleAction() {
  try {
    await api.post('/api/action', data)
    toast.success('성공!')
  } catch (error) {
    // 사용자 친화적인 메시지
    const message = error.status === 403 
      ? '권한이 없습니다' 
      : error.message
    toast.error(message)
  }
}
```

### 3. 로딩 상태 관리

```javascript
const [loading, setLoading] = useState(false)

async function submit() {
  if (loading) return  // 중복 요청 방지
  
  try {
    setLoading(true)
    await api.post('/api/submit', data)
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}
```

### 4. 재사용 가능한 API 함수

```javascript
// lib/services/userService.js
import api from '@/lib/api'

export const userService = {
  getList: (params) => api.get('/api/admin/users', params),
  getById: (id) => api.get(`/api/admin/users/${id}`),
  update: (id, data) => api.patch(`/api/admin/users/${id}`, data),
  delete: (id) => api.delete(`/api/admin/users/${id}`),
  warn: (id, data) => api.post(`/api/admin/users/${id}/warn`, data),
  suspend: (id, data) => api.post(`/api/admin/users/${id}/suspend`, data),
}

// 컴포넌트에서 사용
import { userService } from '@/lib/services/userService'

const users = await userService.getList({ page: 1 })
await userService.warn('user-id', { reason: '경고' })
```

---

## 🐛 디버깅

### 콘솔 로그

모든 API 요청은 자동으로 로깅됩니다:

```
🌐 [API] GET /api/admin/users?page=1&limit=20
✅ [API] GET /api/admin/users?page=1&limit=20 - Success
```

에러 시:
```
🌐 [API] POST /api/admin/users/123/warn
❌ [API] POST /api/admin/users/123/warn - 404: 사용자를 찾을 수 없습니다
```

### Network 탭 확인

브라우저 개발자 도구 (F12) → Network 탭에서:
- Request Headers
- Response Headers
- Request Payload
- Response 확인

---

## 📋 API 엔드포인트 목록

### 관리자 API

#### 통계
- `GET /api/admin/stats` - 전체 통계

#### 사용자 관리
- `GET /api/admin/users` - 사용자 목록
- `GET /api/admin/users/:id` - 사용자 상세
- `PATCH /api/admin/users/:id` - 사용자 수정
- `DELETE /api/admin/users/:id` - 사용자 삭제
- `POST /api/admin/users/:id/warn` - 경고
- `POST /api/admin/users/:id/suspend` - 정지
- `POST /api/admin/users/:id/unsuspend` - 정지 해제

#### 스터디 관리
- `GET /api/admin/studies` - 스터디 목록
- `GET /api/admin/studies/:id` - 스터디 상세
- `PATCH /api/admin/studies/:id` - 스터디 수정
- `DELETE /api/admin/studies/:id` - 스터디 삭제
- `POST /api/admin/studies/:id/hide` - 스터디 숨김
- `POST /api/admin/studies/:id/close` - 스터디 종료

#### 신고 관리
- `GET /api/admin/reports` - 신고 목록
- `GET /api/admin/reports/:id` - 신고 상세
- `POST /api/admin/reports/:id/assign` - 담당자 배정
- `POST /api/admin/reports/:id/process` - 신고 처리

#### 분석
- `GET /api/admin/analytics/overview` - 전체 개요
- `GET /api/admin/analytics/users` - 사용자 분석
- `GET /api/admin/analytics/studies` - 스터디 분석
- `GET /api/admin/analytics/reports` - 신고 분석

#### 설정
- `GET /api/admin/settings` - 설정 목록
- `POST /api/admin/settings` - 설정 업데이트
- `GET /api/admin/settings/history` - 변경 이력

#### 감사 로그
- `GET /api/admin/audit-logs` - 로그 목록
- `GET /api/admin/audit-logs/export` - CSV 내보내기

### 인증 API
- `GET /api/auth/me` - 현재 사용자
- `GET /api/auth/session` - 세션 정보
- `GET /api/auth/validate-session` - 세션 검증

### 사용자 API
- `GET /api/user/profile` - 프로필 조회
- `PATCH /api/user/profile` - 프로필 수정
- `GET /api/studies` - 스터디 목록
- `POST /api/studies` - 스터디 생성
- `GET /api/studies/:id` - 스터디 상세
- `PATCH /api/studies/:id` - 스터디 수정
- `DELETE /api/studies/:id` - 스터디 삭제
- `POST /api/studies/:id/join` - 스터디 참가
- `POST /api/studies/:id/leave` - 스터디 탈퇴

---

## 🎉 완료!

**이제 모든 HTTP 메서드를 간단하게 사용할 수 있습니다!**

```javascript
import api from '@/lib/api'

// GET
const data = await api.get('/api/endpoint')

// POST
await api.post('/api/endpoint', { data })

// PUT
await api.put('/api/endpoint', { data })

// PATCH
await api.patch('/api/endpoint', { data })

// DELETE
await api.delete('/api/endpoint')
```

**간단하고 강력합니다!** 🚀

---

**마지막 업데이트**: 2025-11-29
