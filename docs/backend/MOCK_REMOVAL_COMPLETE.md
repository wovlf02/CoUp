# Mock Data 제거 및 실제 API 연결 완료 보고서

> **작성일**: 2025-11-18  
> **작업**: Mock 데이터 제거 및 백엔드 API 연결

---

## ✅ 완료된 작업

### 1. API 클라이언트 구현
- ✅ `src/lib/api/client.js` - Fetch API 래퍼
  - GET, POST, PATCH, DELETE, 파일 업로드 지원
  - 에러 핸들링 (ApiError 클래스)
  - 일관된 요청/응답 처리

### 2. API 함수 구현
- ✅ `src/lib/api/index.js` - 모든 백엔드 API 함수
  - authApi - 인증 (로그인, 회원가입, 로그아웃)
  - userApi - 사용자 관리 (프로필, 검색)
  - dashboardApi - 대시보드 데이터
  - studyApi - 스터디 CRUD, 멤버 관리, 초대
  - chatApi - 채팅 메시지
  - noticeApi - 공지사항
  - fileApi - 파일 업로드/다운로드
  - calendarApi - 캘린더 일정
  - taskApi - 할일 관리
  - notificationApi - 알림
  - adminApi - 관리자 기능

### 3. React Query Hooks 구현
- ✅ `src/lib/hooks/useApi.js` - 커스텀 훅 (48개)
  - 모든 API에 대한 useQuery 훅
  - 모든 mutation에 대한 useMutation 훅
  - 자동 캐시 무효화 (invalidateQueries)
  - 옵티미스틱 업데이트 준비

### 4. Mock 데이터 제거
- ✅ `src/mocks/` 폴더 내 모든 파일 삭제
  - admin.js ❌
  - dashboard.js ❌
  - mockApi.js ❌
  - notices.js ❌
  - notifications.js ❌
  - studies.js ❌
  - studyCalendar.js ❌
  - studyChat.js ❌
  - studyDetails.js ❌
  - studyFiles.js ❌
  - studyJoinData.js ❌
  - studyNotices.js ❌
  - studySettings.js ❌
  - studyTasks.js ❌
  - studyVideoCall.js ❌
  - tasks.js ❌
  - user.js ❌

---

## 📊 생성된 파일 목록

```
src/
├── lib/
│   ├── api/
│   │   ├── client.js          ✅ NEW - API 클라이언트
│   │   └── index.js           ✅ NEW - API 함수들
│   └── hooks/
│       └── useApi.js          ✅ NEW - React Query 훅 (48개)
```

---

## 🔧 사용 방법

### 1. 기본 API 호출 (서버 컴포넌트)
```javascript
import { studyApi } from '@/lib/api'

export default async function StudiesPage() {
  const { data } = await studyApi.getList({ page: 1, limit: 12 })
  
  return (
    <div>
      {data.map(study => (
        <StudyCard key={study.id} study={study} />
      ))}
    </div>
  )
}
```

### 2. React Query 사용 (클라이언트 컴포넌트)
```javascript
'use client'

import { useStudies, useCreateStudy } from '@/lib/hooks/useApi'

export default function StudiesPage() {
  const { data, isLoading } = useStudies({ page: 1, limit: 12 })
  const createStudy = useCreateStudy()

  const handleCreate = async (formData) => {
    await createStudy.mutateAsync(formData)
  }

  if (isLoading) return <div>로딩 중...</div>

  return (
    <div>
      {data?.data.map(study => (
        <StudyCard key={study.id} study={study} />
      ))}
    </div>
  )
}
```

### 3. 에러 처리
```javascript
import { ApiError } from '@/lib/api/client'

try {
  await studyApi.create(data)
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error (${error.status}):`, error.message)
    // error.data에 서버 응답 데이터 포함
  }
}
```

---

## 📋 프론트엔드 수정 필요 사항

### 1. Mock import 제거
기존 페이지에서 mock import를 제거해야 합니다:

```javascript
// ❌ 제거할 코드
import { mockStudies } from '@/mocks/studies'
import { fetchMockData } from '@/mocks/mockApi'

// ✅ 새로운 코드
import { useStudies } from '@/lib/hooks/useApi'
```

### 2. 데이터 구조 확인
Mock 데이터와 실제 API 응답 구조가 다를 수 있으므로 확인 필요:

**Mock 응답**:
```javascript
const studies = mockStudies // 바로 배열
```

**실제 API 응답**:
```javascript
const { data, pagination } = await studyApi.getList()
// data: 배열
// pagination: { page, limit, total, totalPages }
```

### 3. 페이지 변환 우선순위

#### 높은 우선순위 (핵심 기능)
1. `/dashboard` - 대시보드
2. `/studies` - 스터디 탐색
3. `/my-studies` - 내 스터디 목록
4. `/my-studies/[studyId]/*` - 스터디 상세 (모든 탭)
5. `/tasks` - 할일 관리
6. `/notifications` - 알림

#### 중간 우선순위
7. `/me` - 마이페이지
8. `/studies/create` - 스터디 생성

#### 낮은 우선순위 (관리자)
9. `/admin/*` - 관리자 페이지들

---

## 🔄 API 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... } 또는 [ ... ],
  "pagination": {  // 목록 API만
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 에러 응답
```json
{
  "error": "에러 메시지",
  "status": 400
}
```

---

## ✅ 다음 단계

### 1. 페이지별 Mock 제거 및 API 연결
각 페이지를 순차적으로 수정:
```bash
1. src/app/dashboard/page.js
2. src/app/studies/page.js
3. src/app/my-studies/page.js
4. src/app/my-studies/[studyId]/page.js
5. ... (계속)
```

### 2. 컴포넌트 Mock 제거
```bash
1. src/components/dashboard/*
2. src/components/study/*
3. ... (계속)
```

### 3. 테스트 및 디버깅
- API 연결 확인
- 에러 핸들링 테스트
- 로딩 상태 확인
- 빈 데이터 처리

---

## 📝 주의사항

### 1. 인증 필요
모든 API는 NextAuth 세션이 필요합니다:
```javascript
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()

if (status === 'loading') return <div>로딩...</div>
if (status === 'unauthenticated') return <LoginPrompt />
```

### 2. 환경 변수
`.env.local` 파일 확인:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=  # 비어있으면 상대 경로 사용
```

### 3. CORS 설정
개발 환경에서는 Next.js가 자동 처리하지만, 프로덕션에서는 확인 필요

---

## 🎯 예상 작업 시간

- **Mock 제거 및 API 연결**: 2-3일
  - 페이지별 수정: 1-2일
  - 컴포넌트 수정: 1일
  - 테스트 및 버그 수정: 1일

---

_작성: 2025-11-18_  
_Mock 제거 완료 ✅_  
_실제 API 연결 준비 완료 ✅_

