# my-studies 예외 처리 사용 가이드

**버전**: 1.0.0  
**최종 업데이트**: 2025-12-01  
**대상**: CoUp 개발자

---

## 📋 목차

1. [빠른 시작](#빠른-시작)
2. [에러 코드 참조](#에러-코드-참조)
3. [유효성 검사 가이드](#유효성-검사-가이드)
4. [헬퍼 함수 가이드](#헬퍼-함수-가이드)
5. [에러 핸들러 사용법](#에러-핸들러-사용법)
6. [API 라우트 예제](#api-라우트-예제)
7. [페이지 컴포넌트 예제](#페이지-컴포넌트-예제)
8. [React Query 훅 예제](#react-query-훅-예제)
9. [로깅 베스트 프랙티스](#로깅-베스트-프랙티스)
10. [FAQ](#faq)

---

## 🚀 빠른 시작

### 1. 기본 에러 처리 (API 라우트)

```javascript
// src/app/api/my-studies/some-endpoint/route.js
import { NextResponse } from 'next/server'
import { createMyStudiesError, logMyStudiesError } from '@/lib/exceptions/my-studies-errors'

export async function GET(request) {
  try {
    // 비즈니스 로직
    const data = await fetchSomeData()
    
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    // 에러 로깅
    logMyStudiesError('데이터 로드', error, { userId: 'user123' })
    
    // 에러 응답 생성
    const errorResponse = createMyStudiesError('LIST_FETCH_FAILED', {
      userId: 'user123'
    })
    
    return NextResponse.json(errorResponse, { 
      status: errorResponse.statusCode 
    })
  }
}
```

### 2. 기본 유효성 검사

```javascript
import { validateFilter } from '@/lib/validators/my-studies-validation'

const result = validateFilter('active')

if (!result.isValid) {
  // 유효성 검사 실패
  return NextResponse.json(result.error, { status: 400 })
}

// 성공 - result.filter 사용
const filter = result.filter
```

### 3. React 컴포넌트에서 에러 처리

```javascript
'use client'

import { useMyStudies } from '@/hooks/useMyStudies'
import { handleReactQueryError } from '@/lib/handlers/my-studies-error-handler'

export default function MyStudiesPage() {
  const { data, error, isLoading } = useMyStudies({
    onError: (error) => {
      const errorInfo = handleReactQueryError(error)
      // Toast 알림 표시
      showToast({
        message: errorInfo.error.userMessage,
        type: 'error'
      })
    }
  })
  
  if (isLoading) return <SkeletonUI />
  if (error) return <ErrorUI error={error} />
  
  return <StudyList data={data} />
}
```

---

## 📖 에러 코드 참조

### 카테고리별 에러 코드

#### 1. LIST (목록) 에러

| 코드 | 이름 | 설명 | HTTP Status |
|------|------|------|-------------|
| MYS-001 | LIST_FETCH_FAILED | 목록 로드 실패 | 500 |
| MYS-002 | INVALID_FILTER | 잘못된 필터 | 400 |
| MYS-003 | INVALID_PAGINATION | 잘못된 페이지 | 400 |
| MYS-004 | NO_STUDIES_FOUND | 스터디 없음 | 404 |
| MYS-005 | LIST_TIMEOUT | 목록 로드 타임아웃 | 408 |

**사용 예시**:
```javascript
// 필터 검증 실패
if (!isValidFilter(filter)) {
  const error = createMyStudiesError('INVALID_FILTER', { 
    filter,
    allowed: ['all', 'active', 'admin', 'pending']
  })
  return NextResponse.json(error, { status: 400 })
}
```

---

#### 2. DETAIL (상세) 에러

| 코드 | 이름 | 설명 | HTTP Status |
|------|------|------|-------------|
| MYS-010 | STUDY_NOT_FOUND | 스터디를 찾을 수 없음 | 404 |
| MYS-011 | STUDY_DELETED | 삭제된 스터디 | 410 |
| MYS-012 | DETAIL_FETCH_FAILED | 상세 정보 로드 실패 | 500 |
| MYS-013 | DETAIL_TIMEOUT | 상세 정보 타임아웃 | 408 |
| MYS-014 | INVALID_STUDY_ID | 잘못된 스터디 ID | 400 |
| MYS-015 | STUDY_ACCESS_DENIED | 접근 권한 없음 | 403 |

**사용 예시**:
```javascript
// 스터디 존재 여부 확인
const study = await prisma.study.findUnique({ where: { id: studyId } })

if (!study) {
  const error = createMyStudiesError('STUDY_NOT_FOUND', { studyId })
  logMyStudiesError('스터디 조회', null, { studyId })
  return NextResponse.json(error, { status: 404 })
}

// 삭제된 스터디 확인
if (study.deletedAt) {
  const error = createMyStudiesError('STUDY_DELETED', { studyId })
  return NextResponse.json(error, { status: 410 })
}
```

---

#### 3. PERMISSION (권한) 에러

| 코드 | 이름 | 설명 | HTTP Status |
|------|------|------|-------------|
| MYS-020 | PERMISSION_DENIED | 권한 없음 | 403 |
| MYS-021 | NOT_STUDY_MEMBER | 스터디 멤버 아님 | 403 |
| MYS-022 | ADMIN_ONLY | 관리자 전용 | 403 |
| MYS-023 | OWNER_ONLY | 소유자 전용 | 403 |
| MYS-024 | INVALID_ROLE | 잘못된 역할 | 400 |

**사용 예시**:
```javascript
import { hasPermission } from '@/lib/my-studies-helpers'

// 권한 체크
if (!hasPermission(userRole, 'ADMIN')) {
  const error = createMyStudiesError('ADMIN_ONLY', { 
    userId, 
    studyId,
    userRole 
  })
  return NextResponse.json(error, { status: 403 })
}
```

---

#### 4. TAB (탭) 에러

| 코드 | 이름 | 설명 | HTTP Status |
|------|------|------|-------------|
| MYS-030 | INVALID_TAB | 잘못된 탭 | 400 |
| MYS-031 | TAB_ACCESS_DENIED | 탭 접근 불가 | 403 |
| MYS-032 | TAB_DATA_FETCH_FAILED | 탭 데이터 로드 실패 | 500 |
| MYS-033 | TAB_NOT_AVAILABLE | 사용할 수 없는 탭 | 403 |

---

#### 5. WIDGET (위젯) 에러

| 코드 | 이름 | 설명 | HTTP Status |
|------|------|------|-------------|
| MYS-040 | WIDGET_LOAD_FAILED | 위젯 로드 실패 | 500 |
| MYS-041 | WIDGET_DATA_INVALID | 잘못된 위젯 데이터 | 400 |
| MYS-042 | WIDGET_NOT_FOUND | 위젯을 찾을 수 없음 | 404 |
| MYS-043 | WIDGET_CONFIG_ERROR | 위젯 설정 오류 | 500 |
| MYS-044 | WIDGET_TIMEOUT | 위젯 타임아웃 | 408 |

---

#### 6. NOTICE (공지) 에러

| 코드 | 이름 | 설명 | HTTP Status |
|------|------|------|-------------|
| MYS-050 | NOTICE_CREATE_FAILED | 공지 생성 실패 | 500 |
| MYS-051 | NOTICE_UPDATE_FAILED | 공지 수정 실패 | 500 |
| MYS-052 | NOTICE_DELETE_FAILED | 공지 삭제 실패 | 500 |
| MYS-053 | NOTICE_NOT_FOUND | 공지를 찾을 수 없음 | 404 |
| MYS-054 | NOTICE_VALIDATION_FAILED | 공지 유효성 검사 실패 | 400 |

**사용 예시**:
```javascript
import { validateNoticeData } from '@/lib/validators/my-studies-validation'

// 공지사항 유효성 검사
const validation = validateNoticeData({
  title: '공지 제목',
  content: '공지 내용...',
  isPinned: true
})

if (!validation.isValid) {
  const error = createMyStudiesError('NOTICE_VALIDATION_FAILED', {
    errors: validation.errors
  })
  return NextResponse.json(error, { status: 400 })
}
```

---

#### 7. TASK (할일) 에러

| 코드 | 이름 | 설명 | HTTP Status |
|------|------|------|-------------|
| MYS-060 | TASK_CREATE_FAILED | 할일 생성 실패 | 500 |
| MYS-061 | TASK_UPDATE_FAILED | 할일 수정 실패 | 500 |
| MYS-062 | TASK_DELETE_FAILED | 할일 삭제 실패 | 500 |
| MYS-063 | TASK_NOT_FOUND | 할일을 찾을 수 없음 | 404 |
| MYS-064 | TASK_VALIDATION_FAILED | 할일 유효성 검사 실패 | 400 |

---

#### 8. FILE (파일) 에러

| 코드 | 이름 | 설명 | HTTP Status |
|------|------|------|-------------|
| MYS-070 | FILE_UPLOAD_FAILED | 파일 업로드 실패 | 500 |
| MYS-071 | FILE_TOO_LARGE | 파일 크기 초과 | 413 |
| MYS-072 | INVALID_FILE_TYPE | 잘못된 파일 타입 | 400 |
| MYS-073 | FILE_NOT_FOUND | 파일을 찾을 수 없음 | 404 |
| MYS-074 | FILE_DELETE_FAILED | 파일 삭제 실패 | 500 |
| MYS-075 | FILE_DOWNLOAD_FAILED | 파일 다운로드 실패 | 500 |

**사용 예시**:
```javascript
import { validateFileUpload } from '@/lib/validators/my-studies-validation'

// 파일 검증
const validation = validateFileUpload({
  name: 'document.pdf',
  size: 5242880, // 5MB
  type: 'application/pdf'
})

if (!validation.isValid) {
  const error = createMyStudiesError('FILE_UPLOAD_FAILED', {
    errors: validation.errors
  })
  return NextResponse.json(error, { status: 400 })
}
```

---

#### 9. CALENDAR (일정) 에러

| 코드 | 이름 | 설명 | HTTP Status |
|------|------|------|-------------|
| MYS-080 | EVENT_CREATE_FAILED | 일정 생성 실패 | 500 |
| MYS-081 | EVENT_UPDATE_FAILED | 일정 수정 실패 | 500 |
| MYS-082 | EVENT_DELETE_FAILED | 일정 삭제 실패 | 500 |
| MYS-083 | EVENT_NOT_FOUND | 일정을 찾을 수 없음 | 404 |
| MYS-084 | EVENT_VALIDATION_FAILED | 일정 유효성 검사 실패 | 400 |
| MYS-085 | INVALID_DATE_RANGE | 잘못된 날짜 범위 | 400 |

---

#### 10. CHAT (채팅) 에러

| 코드 | 이름 | 설명 | HTTP Status |
|------|------|------|-------------|
| MYS-090 | MESSAGE_SEND_FAILED | 메시지 전송 실패 | 500 |
| MYS-091 | MESSAGE_TOO_LONG | 메시지 길이 초과 | 400 |
| MYS-092 | CHAT_HISTORY_FETCH_FAILED | 채팅 기록 로드 실패 | 500 |
| MYS-093 | CHAT_NOT_AVAILABLE | 채팅 사용 불가 | 403 |
| MYS-094 | MESSAGE_DELETE_FAILED | 메시지 삭제 실패 | 500 |
| MYS-095 | INVALID_MESSAGE_FORMAT | 잘못된 메시지 형식 | 400 |

---

#### 11. GENERAL (일반) 에러

| 코드 | 이름 | 설명 | HTTP Status |
|------|------|------|-------------|
| MYS-100 | UNAUTHORIZED | 인증 필요 | 401 |
| MYS-101 | FORBIDDEN | 접근 금지 | 403 |
| MYS-102 | NETWORK_ERROR | 네트워크 오류 | 0 |
| MYS-103 | REQUEST_TIMEOUT | 요청 타임아웃 | 408 |
| MYS-104 | SERVER_ERROR | 서버 오류 | 500 |
| MYS-105 | DATABASE_ERROR | 데이터베이스 오류 | 500 |
| MYS-106 | VALIDATION_ERROR | 유효성 검사 오류 | 400 |
| MYS-107 | RATE_LIMIT_EXCEEDED | 요청 한도 초과 | 429 |
| MYS-108 | SERVICE_UNAVAILABLE | 서비스 사용 불가 | 503 |
| MYS-109 | UNKNOWN_ERROR | 알 수 없는 오류 | 500 |

---

## 🔍 유효성 검사 가이드

### validateFilter()

**목적**: 스터디 필터 옵션 검증

**파라미터**:
- `filter` (string): 필터 값

**반환 값**:
```typescript
{
  isValid: boolean
  filter?: 'all' | 'active' | 'admin' | 'pending'
  error?: ErrorObject
}
```

**사용 예시**:
```javascript
import { validateFilter } from '@/lib/validators/my-studies-validation'

// ✅ 정상 케이스
const result1 = validateFilter('all')
// { isValid: true, filter: 'all' }

const result2 = validateFilter('active')
// { isValid: true, filter: 'active' }

// ❌ 에러 케이스
const result3 = validateFilter('invalid')
// {
//   isValid: false,
//   error: {
//     code: 'INVALID_FILTER',
//     message: '유효하지 않은 필터입니다',
//     details: {
//       filter: 'invalid',
//       allowed: ['all', 'active', 'admin', 'pending']
//     }
//   }
// }
```

---

### validatePagination()

**목적**: 페이지네이션 파라미터 검증

**파라미터**:
- `page` (number): 페이지 번호 (1부터 시작)
- `limit` (number): 페이지당 항목 수 (1~100)

**반환 값**:
```typescript
{
  isValid: boolean
  page?: number
  limit?: number
  error?: ErrorObject
}
```

**사용 예시**:
```javascript
import { validatePagination } from '@/lib/validators/my-studies-validation'

// ✅ 정상 케이스
const result1 = validatePagination(1, 10)
// { isValid: true, page: 1, limit: 10 }

const result2 = validatePagination(5, 50)
// { isValid: true, page: 5, limit: 50 }

// ❌ 에러 케이스 - 잘못된 page
const result3 = validatePagination(0, 10)
// {
//   isValid: false,
//   error: {
//     code: 'INVALID_PAGINATION',
//     message: 'page는 1 이상이어야 합니다'
//   }
// }

// ❌ 에러 케이스 - 잘못된 limit
const result4 = validatePagination(1, 101)
// {
//   isValid: false,
//   error: {
//     code: 'INVALID_PAGINATION',
//     message: 'limit은 1~100 사이여야 합니다'
//   }
// }
```

---

### validateNoticeData()

**목적**: 공지사항 데이터 검증

**파라미터**:
- `data` (object): 공지사항 데이터
  - `title` (string): 제목 (1~200자)
  - `content` (string): 내용 (1~10,000자)
  - `isPinned` (boolean): 고정 여부 (선택)

**반환 값**:
```typescript
{
  isValid: boolean
  errors?: string[]
}
```

**사용 예시**:
```javascript
import { validateNoticeData } from '@/lib/validators/my-studies-validation'

// ✅ 정상 케이스
const result1 = validateNoticeData({
  title: '중요 공지',
  content: '내일 오프라인 모임이 있습니다.',
  isPinned: true
})
// { isValid: true }

// ❌ 에러 케이스 - 제목 없음
const result2 = validateNoticeData({
  title: '',
  content: '내용'
})
// {
//   isValid: false,
//   errors: ['제목은 필수입니다', '제목은 1~200자 사이여야 합니다']
// }

// ❌ 에러 케이스 - 내용 길이 초과
const result3 = validateNoticeData({
  title: '공지',
  content: 'a'.repeat(10001)
})
// {
//   isValid: false,
//   errors: ['내용은 10,000자를 초과할 수 없습니다']
// }

// ❌ 에러 케이스 - XSS 공격
const result4 = validateNoticeData({
  title: '<script>alert("XSS")</script>',
  content: '내용'
})
// {
//   isValid: false,
//   errors: ['제목에 HTML 태그가 포함되어 있습니다']
// }
```

---

### validateTaskData()

**목적**: 할일 데이터 검증

**파라미터**:
- `data` (object): 할일 데이터
  - `title` (string): 제목 (1~200자)
  - `description` (string): 설명 (선택, 최대 2,000자)
  - `dueDate` (Date | string): 마감일 (선택)
  - `priority` (string): 우선순위 (LOW, MEDIUM, HIGH, 선택)
  - `assigneeId` (string): 담당자 ID (선택)

**사용 예시**:
```javascript
import { validateTaskData } from '@/lib/validators/my-studies-validation'

// ✅ 정상 케이스
const result1 = validateTaskData({
  title: '과제 제출',
  description: '12월 5일까지 제출',
  dueDate: '2025-12-05',
  priority: 'HIGH'
})
// { isValid: true }

// ❌ 에러 케이스 - 잘못된 우선순위
const result2 = validateTaskData({
  title: '과제',
  priority: 'URGENT'
})
// {
//   isValid: false,
//   errors: ['우선순위는 LOW, MEDIUM, HIGH 중 하나여야 합니다']
// }
```

---

### validateFileUpload()

**목적**: 파일 업로드 검증

**파라미터**:
- `file` (object): 파일 정보
  - `name` (string): 파일명
  - `size` (number): 파일 크기 (bytes)
  - `type` (string): MIME 타입

**사용 예시**:
```javascript
import { validateFileUpload } from '@/lib/validators/my-studies-validation'

// ✅ 정상 케이스
const result1 = validateFileUpload({
  name: 'document.pdf',
  size: 5242880, // 5MB
  type: 'application/pdf'
})
// { isValid: true }

// ❌ 에러 케이스 - 파일 크기 초과
const result2 = validateFileUpload({
  name: 'large-file.zip',
  size: 11534336, // 11MB
  type: 'application/zip'
})
// {
//   isValid: false,
//   errors: ['파일 크기는 10MB를 초과할 수 없습니다']
// }

// ❌ 에러 케이스 - 잘못된 파일 타입
const result3 = validateFileUpload({
  name: 'script.exe',
  size: 1024,
  type: 'application/x-msdownload'
})
// {
//   isValid: false,
//   errors: ['허용되지 않는 파일 형식입니다']
// }

// ❌ 에러 케이스 - Path Traversal 공격
const result4 = validateFileUpload({
  name: '../../../etc/passwd',
  size: 1024,
  type: 'text/plain'
})
// {
//   isValid: false,
//   errors: ['잘못된 파일명입니다']
// }
```

---

## 🛠️ 헬퍼 함수 가이드

### hasPermission()

**목적**: 역할별 권한 확인

**파라미터**:
- `userRole` (string): 사용자 역할 (OWNER, ADMIN, MEMBER, PENDING)
- `requiredRole` (string): 필요한 역할

**반환 값**: `boolean`

**사용 예시**:
```javascript
import { hasPermission } from '@/lib/my-studies-helpers'

// ✅ OWNER는 모든 권한 보유
hasPermission('OWNER', 'ADMIN') // true
hasPermission('OWNER', 'MEMBER') // true

// ✅ ADMIN은 MEMBER 권한 보유
hasPermission('ADMIN', 'MEMBER') // true
hasPermission('ADMIN', 'ADMIN') // true

// ❌ ADMIN은 OWNER 권한 없음
hasPermission('ADMIN', 'OWNER') // false

// ❌ MEMBER는 ADMIN 권한 없음
hasPermission('MEMBER', 'ADMIN') // false

// ❌ PENDING은 권한 없음
hasPermission('PENDING', 'MEMBER') // false
```

---

### filterStudiesByRole()

**목적**: 역할별 스터디 필터링

**파라미터**:
- `studies` (Array): 스터디 배열
- `filter` (string): 필터 옵션 (all, active, admin, pending)

**반환 값**: 필터링된 스터디 배열

**사용 예시**:
```javascript
import { filterStudiesByRole } from '@/lib/my-studies-helpers'

const studies = [
  { id: '1', myRole: 'OWNER' },
  { id: '2', myRole: 'ADMIN' },
  { id: '3', myRole: 'MEMBER' },
  { id: '4', myRole: 'PENDING' }
]

// 전체
filterStudiesByRole(studies, 'all')
// [모든 스터디]

// 참여 중 (OWNER, ADMIN, MEMBER)
filterStudiesByRole(studies, 'active')
// [{ id: '1' }, { id: '2' }, { id: '3' }]

// 관리 중 (OWNER, ADMIN)
filterStudiesByRole(studies, 'admin')
// [{ id: '1' }, { id: '2' }]

// 대기 중 (PENDING)
filterStudiesByRole(studies, 'pending')
// [{ id: '4' }]
```

---

### transformStudyForUI()

**목적**: DB 모델을 UI 모델로 변환

**파라미터**:
- `study` (object): Prisma Study 객체

**반환 값**: UI용 Study 객체

**사용 예시**:
```javascript
import { transformStudyForUI } from '@/lib/my-studies-helpers'

// Prisma 모델
const dbStudy = {
  id: '123',
  name: 'JavaScript 스터디',
  createdAt: new Date('2025-01-01'),
  _count: { members: 5 },
  members: [
    { userId: 'user1', role: 'OWNER' }
  ]
}

// UI 모델로 변환
const uiStudy = transformStudyForUI(dbStudy, 'user1')
// {
//   id: '123',
//   name: 'JavaScript 스터디',
//   createdAt: '2025-01-01T00:00:00.000Z',
//   memberCount: 5,
//   myRole: 'OWNER',
//   isOwner: true,
//   isAdmin: true
// }
```

---

### formatStudyRole()

**목적**: 역할을 한글로 변환

**파라미터**:
- `role` (string): 역할 (OWNER, ADMIN, MEMBER, PENDING)

**반환 값**: 한글 역할 이름

**사용 예시**:
```javascript
import { formatStudyRole } from '@/lib/my-studies-helpers'

formatStudyRole('OWNER')   // '소유자'
formatStudyRole('ADMIN')   // '관리자'
formatStudyRole('MEMBER')  // '멤버'
formatStudyRole('PENDING') // '대기 중'
formatStudyRole(null)      // '알 수 없음'
```

---

### getRoleBadgeColor()

**목적**: 역할별 배지 색상 반환

**파라미터**:
- `role` (string): 역할

**반환 값**: CSS 색상 코드

**사용 예시**:
```javascript
import { getRoleBadgeColor } from '@/lib/my-studies-helpers'

getRoleBadgeColor('OWNER')   // '#EF4444' (red)
getRoleBadgeColor('ADMIN')   // '#F59E0B' (amber)
getRoleBadgeColor('MEMBER')  // '#10B981' (green)
getRoleBadgeColor('PENDING') // '#6B7280' (gray)
```

---

## 🔧 에러 핸들러 사용법

### handleReactQueryError()

**목적**: React Query 에러를 사용자 친화적 에러로 변환

**파라미터**:
- `error` (Error): React Query 에러 객체
- `options` (object): 옵션
  - `onRetry` (function): 재시도 콜백
  - `onRedirect` (function): 리다이렉트 콜백

**반환 값**:
```typescript
{
  error: {
    code: string
    userMessage: string
    message: string
  }
  shouldRetry: boolean
  retryDelay?: number
  shouldRedirect?: string
}
```

**사용 예시**:

#### 1. 기본 사용법

```javascript
import { handleReactQueryError } from '@/lib/handlers/my-studies-error-handler'

const { data, error } = useQuery({
  queryKey: ['my-studies'],
  queryFn: fetchMyStudies,
  onError: (error) => {
    const errorInfo = handleReactQueryError(error)
    
    // Toast 알림
    showToast({
      message: errorInfo.error.userMessage,
      type: 'error'
    })
    
    // 재시도 필요 시
    if (errorInfo.shouldRetry) {
      setTimeout(() => {
        refetch()
      }, errorInfo.retryDelay || 2000)
    }
    
    // 리다이렉트 필요 시
    if (errorInfo.shouldRedirect) {
      router.push(errorInfo.shouldRedirect)
    }
  }
})
```

#### 2. 콜백 사용

```javascript
const errorInfo = handleReactQueryError(error, {
  onRetry: () => {
    console.log('재시도합니다...')
    refetch()
  },
  onRedirect: (path) => {
    console.log('리다이렉트:', path)
    router.push(path)
  }
})
```

#### 3. 에러 타입별 처리

```javascript
import { handleReactQueryError } from '@/lib/handlers/my-studies-error-handler'

// 네트워크 에러
const networkError = new Error('Network request failed')
const result1 = handleReactQueryError(networkError)
// {
//   error: {
//     code: 'NETWORK_ERROR',
//     userMessage: '네트워크 연결을 확인해주세요'
//   },
//   shouldRetry: true,
//   retryDelay: 2000
// }

// 타임아웃
const timeoutError = new Error('Timeout')
timeoutError.name = 'AbortError'
const result2 = handleReactQueryError(timeoutError)
// {
//   error: {
//     code: 'REQUEST_TIMEOUT',
//     userMessage: '요청 시간이 초과되었습니다'
//   },
//   shouldRetry: true,
//   retryDelay: 3000
// }

// 인증 에러
const authError = { response: { status: 401 } }
const result3 = handleReactQueryError(authError)
// {
//   error: {
//     code: 'UNAUTHORIZED',
//     userMessage: '로그인이 필요합니다'
//   },
//   shouldRetry: false,
//   shouldRedirect: '/auth/signin'
// }

// 서버 에러
const serverError = { response: { status: 500 } }
const result4 = handleReactQueryError(serverError)
// {
//   error: {
//     code: 'SERVER_ERROR',
//     userMessage: '서버 오류가 발생했습니다'
//   },
//   shouldRetry: true,
//   retryDelay: 5000
// }
```

---

## 📝 API 라우트 예제

### 기본 GET 엔드포인트

```javascript
// src/app/api/my-studies/some-data/route.js
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import {
  createMyStudiesError,
  logMyStudiesError,
  logMyStudiesInfo,
  handlePrismaError
} from '@/lib/exceptions/my-studies-errors'
import { validateFilter } from '@/lib/validators/my-studies-validation'

export async function GET(request) {
  const startTime = Date.now()
  let userId = null

  try {
    // 1. 타임아웃 설정 (10초)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    // 2. 인증 확인
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) {
      clearTimeout(timeoutId)
      return authResult
    }
    userId = authResult.session.user.id

    // 3. 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'

    // 4. 입력값 검증
    const filterValidation = validateFilter(filter)
    if (!filterValidation.isValid) {
      clearTimeout(timeoutId)
      logMyStudiesError('잘못된 필터', null, { userId, filter })
      return NextResponse.json(filterValidation.error, { status: 400 })
    }

    // 5. 데이터 조회
    const data = await prisma.someModel.findMany({
      where: {
        userId,
        deletedAt: null
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    // 6. 성공 로깅
    const duration = Date.now() - startTime
    logMyStudiesInfo('데이터 로드 성공', {
      userId,
      filter,
      count: data.length,
      duration: `${duration}ms`
    })

    // 7. 응답
    return NextResponse.json({
      success: true,
      data,
      meta: {
        count: data.length,
        duration: `${duration}ms`
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime

    // 타임아웃 에러
    if (error.name === 'AbortError') {
      logMyStudiesError('타임아웃', error, { userId, duration: `${duration}ms` })
      const errorResponse = createMyStudiesError('REQUEST_TIMEOUT', { userId })
      return NextResponse.json(errorResponse, { status: 408 })
    }

    // Prisma 에러
    if (error.code?.startsWith('P')) {
      const prismaError = handlePrismaError(error)
      logMyStudiesError('DB 에러', error, { userId, code: error.code })
      return NextResponse.json(prismaError, { status: prismaError.statusCode })
    }

    // 일반 에러
    logMyStudiesError('데이터 로드 실패', error, { userId })
    const errorResponse = createMyStudiesError('SERVER_ERROR', { userId })
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
```

---

### POST 엔드포인트 (생성)

```javascript
// src/app/api/my-studies/notices/route.js
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import {
  createMyStudiesError,
  logMyStudiesError,
  logMyStudiesInfo
} from '@/lib/exceptions/my-studies-errors'
import { validateNoticeData } from '@/lib/validators/my-studies-validation'
import { hasPermission } from '@/lib/my-studies-helpers'

export async function POST(request) {
  let userId = null
  let studyId = null

  try {
    // 1. 인증
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    userId = authResult.session.user.id

    // 2. 요청 본문 파싱
    const body = await request.json()
    studyId = body.studyId
    const { title, content, isPinned } = body

    // 3. 유효성 검사
    const validation = validateNoticeData({ title, content, isPinned })
    if (!validation.isValid) {
      logMyStudiesError('공지 유효성 검사 실패', null, {
        userId,
        studyId,
        errors: validation.errors
      })
      const errorResponse = createMyStudiesError('NOTICE_VALIDATION_FAILED', {
        errors: validation.errors
      })
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // 4. 권한 확인
    const membership = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: { studyId, userId }
      }
    })

    if (!membership || !hasPermission(membership.role, 'ADMIN')) {
      logMyStudiesError('권한 없음', null, { userId, studyId, role: membership?.role })
      const errorResponse = createMyStudiesError('ADMIN_ONLY', { userId, studyId })
      return NextResponse.json(errorResponse, { status: 403 })
    }

    // 5. 공지 생성
    const notice = await prisma.notice.create({
      data: {
        studyId,
        authorId: userId,
        title,
        content,
        isPinned: isPinned || false
      }
    })

    // 6. 성공 로깅
    logMyStudiesInfo('공지 생성 성공', {
      userId,
      studyId,
      noticeId: notice.id
    })

    // 7. 응답
    return NextResponse.json({
      success: true,
      data: notice
    }, { status: 201 })

  } catch (error) {
    logMyStudiesError('공지 생성 실패', error, { userId, studyId })
    const errorResponse = createMyStudiesError('NOTICE_CREATE_FAILED', { userId, studyId })
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
```

---

## 🎨 페이지 컴포넌트 예제

### 완전한 예외 처리가 적용된 페이지

```jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMyStudies } from '@/hooks/useMyStudies'
import { handleReactQueryError } from '@/lib/handlers/my-studies-error-handler'
import { showToast } from '@/utils/toast'
import styles from './page.module.css'

export default function MyStudiesPage() {
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false)

  // React Query
  const { data, isLoading, error, refetch, isError } = useMyStudies({
    filter,
    onError: (error) => {
      const errorInfo = handleReactQueryError(error, {
        onRetry: () => refetch(),
        onRedirect: (path) => router.push(path)
      })

      // Toast 알림
      showToast({
        message: errorInfo.error.userMessage,
        type: 'error'
      })
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })

  // 타임아웃 처리 (10초)
  useEffect(() => {
    let timer
    
    if (isLoading) {
      timer = setTimeout(() => {
        setIsLoadingTimeout(true)
      }, 10000)
    }

    return () => {
      if (timer) clearTimeout(timer)
      if (!isLoading && isLoadingTimeout) {
        setIsLoadingTimeout(false)
      }
    }
  }, [isLoading, isLoadingTimeout])

  // 로딩 중 (Skeleton UI)
  if (isLoading && !isLoadingTimeout) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>내 스터디</h1>
        </div>
        <div className={styles.studiesList}>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  // 타임아웃
  if (isLoadingTimeout) {
    return (
      <div className={styles.container}>
        <div className={styles.timeoutMessage}>
          <div className={styles.timeoutIcon}>⏱️</div>
          <h3>요청 시간이 초과되었습니다</h3>
          <p>네트워크 상태를 확인하고 다시 시도해주세요</p>
          <button onClick={() => refetch()} className={styles.retryButton}>
            🔄 다시 시도
          </button>
        </div>
      </div>
    )
  }

  // 에러
  if (isError) {
    const errorInfo = handleReactQueryError(error)
    
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>
            {getErrorIcon(error)}
          </div>
          <h3>{errorInfo.error.userMessage}</h3>
          <p>{errorInfo.error.message}</p>
          <div className={styles.errorActions}>
            <button onClick={() => refetch()} className={styles.retryButton}>
              🔄 다시 시도
            </button>
            <Link href="/studies" className={styles.exploreButton}>
              스터디 둘러보기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 빈 상태
  if (data?.studies?.length === 0) {
    return (
      <div className={styles.container}>
        <EmptyState filter={filter} />
      </div>
    )
  }

  // 정상 렌더링
  return (
    <div className={styles.container}>
      {/* 탭 */}
      <div className={styles.tabs}>
        {['all', 'active', 'admin', 'pending'].map((tab) => (
          <button
            key={tab}
            className={filter === tab ? styles.tabActive : styles.tab}
            onClick={() => setFilter(tab)}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      {/* 스터디 목록 */}
      <div className={styles.studiesList}>
        {data.studies.map((study) => (
          <StudyCard key={study.id} study={study} />
        ))}
      </div>
    </div>
  )
}

// Skeleton 카드
function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonHeader} />
      <div className={styles.skeletonContent} />
      <div className={styles.skeletonActions} />
    </div>
  )
}

// Empty State
function EmptyState({ filter }) {
  const messages = {
    all: {
      icon: '📚',
      title: '아직 참여 중인 스터디가 없어요',
      description: '지금 바로 관심있는 스터디를 찾아보세요!',
      cta: '스터디 둘러보기',
      href: '/studies'
    },
    // ... 다른 필터
  }

  const message = messages[filter] || messages.all

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{message.icon}</div>
      <h3>{message.title}</h3>
      <p>{message.description}</p>
      <Link href={message.href} className={styles.ctaButton}>
        {message.cta}
      </Link>
    </div>
  )
}

// 에러 아이콘
function getErrorIcon(error) {
  if (!navigator.onLine || error.message?.includes('Network')) return '🌐'
  if (error.response?.status === 401 || error.response?.status === 403) return '🔒'
  if (error.response?.status >= 500) return '🔧'
  return '⚠️'
}

// 탭 레이블
function getTabLabel(tab) {
  const labels = {
    all: '전체',
    active: '참여중',
    admin: '관리중',
    pending: '대기중'
  }
  return labels[tab] || tab
}
```

---

## 🎣 React Query 훅 예제

### useMyStudies 훅

```javascript
// src/hooks/useMyStudies.js
import { useQuery } from '@tanstack/react-query'

export function useMyStudies(options = {}) {
  const { filter = 'all', onError, ...queryOptions } = options

  return useQuery({
    queryKey: ['my-studies', filter],
    queryFn: async () => {
      const response = await fetch(`/api/my-studies?filter=${filter}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw {
          response: {
            status: response.status,
            data: errorData
          }
        }
      }
      
      return response.json()
    },
    onError,
    ...queryOptions
  })
}
```

---

## 📊 로깅 베스트 프랙티스

### 1. 에러 로깅

```javascript
import { logMyStudiesError } from '@/lib/exceptions/my-studies-errors'

// ✅ 좋은 예시 - 구조화된 로깅
logMyStudiesError('스터디 목록 로드 실패', error, {
  userId: 'user123',
  filter: 'active',
  timestamp: new Date().toISOString(),
  context: {
    page: 1,
    limit: 10
  }
})

// ❌ 나쁜 예시 - 단순 로깅
console.error('Error:', error)
```

### 2. 성공 로깅

```javascript
import { logMyStudiesInfo } from '@/lib/exceptions/my-studies-errors'

// ✅ 좋은 예시
logMyStudiesInfo('스터디 목록 로드 성공', {
  userId: 'user123',
  filter: 'active',
  count: 5,
  duration: '45ms'
})

// ❌ 나쁜 예시
console.log('Success')
```

### 3. 경고 로깅

```javascript
import { logMyStudiesWarning } from '@/lib/exceptions/my-studies-errors'

// ✅ 좋은 예시
logMyStudiesWarning('삭제된 스터디 필터링', {
  userId: 'user123',
  deletedCount: 2
})
```

### 4. 민감 정보 제외

```javascript
// ❌ 나쁜 예시 - 비밀번호 로깅
logMyStudiesError('로그인 실패', error, {
  email: 'user@example.com',
  password: 'secret123' // 절대 안됨!
})

// ✅ 좋은 예시
logMyStudiesError('로그인 실패', error, {
  email: 'user@example.com'
  // 비밀번호는 절대 로깅하지 않음
})
```

---

## ❓ FAQ

### Q1: 어떤 에러 코드를 사용해야 하나요?

**A**: 상황에 맞는 카테고리의 에러 코드를 선택하세요.

- 목록 관련 → `MYS-001~005`
- 상세 정보 → `MYS-010~015`
- 권한 문제 → `MYS-020~024`
- CRUD 작업 → 각 카테고리의 5X 번호
- 일반 에러 → `MYS-100~109`

**예시**:
```javascript
// 스터디를 찾을 수 없을 때
createMyStudiesError('STUDY_NOT_FOUND', { studyId })

// 권한이 없을 때
createMyStudiesError('ADMIN_ONLY', { userId, studyId })

// 네트워크 에러
createMyStudiesError('NETWORK_ERROR')
```

---

### Q2: Prisma 에러는 어떻게 처리하나요?

**A**: `handlePrismaError()` 함수를 사용하세요.

```javascript
import { handlePrismaError } from '@/lib/exceptions/my-studies-errors'

try {
  const data = await prisma.study.findUnique({ where: { id } })
} catch (error) {
  if (error.code?.startsWith('P')) {
    const myStudiesError = handlePrismaError(error)
    return NextResponse.json(myStudiesError, { 
      status: myStudiesError.statusCode 
    })
  }
}
```

---

### Q3: React Query 에러는 어떻게 처리하나요?

**A**: `handleReactQueryError()` 함수를 사용하세요.

```javascript
import { handleReactQueryError } from '@/lib/handlers/my-studies-error-handler'

const { data, error } = useQuery({
  queryKey: ['my-studies'],
  queryFn: fetchMyStudies,
  onError: (error) => {
    const errorInfo = handleReactQueryError(error)
    showToast({
      message: errorInfo.error.userMessage,
      type: 'error'
    })
  }
})
```

---

### Q4: 타임아웃은 얼마나 설정해야 하나요?

**A**: **10초**를 권장합니다.

**이유**:
- 사용자가 기다릴 수 있는 한계 (연구 결과: 8~12초)
- 모바일 환경 고려
- UX 균형

```javascript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초
```

---

### Q5: 에러 로그는 어떻게 확인하나요?

**A**: 개발 서버 터미널에서 확인할 수 있습니다.

**출력 형식**:
```
[ERROR] [my-studies] 스터디 목록 로드 실패 {
  "errorCode": "MYS-001",
  "userId": "user123",
  "filter": "active",
  "duration": "102ms",
  "stack": "Error: ...\n  at ..."
}
```

**프로덕션**:
- Sentry, LogRocket 등의 도구 사용 권장
- 에러 집계 및 알림 설정

---

### Q6: 사용자에게 어떤 메시지를 보여줘야 하나요?

**A**: `userMessage` 필드를 사용하세요.

```javascript
const errorResponse = createMyStudiesError('STUDY_NOT_FOUND')
console.log(errorResponse.userMessage)
// "스터디를 찾을 수 없습니다"

// UI에 표시
<p>{errorResponse.userMessage}</p>
```

**원칙**:
1. 무슨 일이 일어났는지
2. 왜 그런지 (추측)
3. 어떻게 해결하는지

---

### Q7: 재시도는 언제 해야 하나요?

**A**: 에러 타입에 따라 다릅니다.

| 에러 타입 | 재시도 | 이유 |
|----------|-------|------|
| 네트워크 에러 | ✅ Yes | 일시적 문제 가능성 |
| 타임아웃 | ✅ Yes | 재시도로 성공 가능 |
| 서버 에러 (5XX) | ✅ Yes | 서버 복구 가능성 |
| 인증 에러 (401/403) | ❌ No | 재로그인 필요 |
| 유효성 에러 (400) | ❌ No | 입력 수정 필요 |

```javascript
const errorInfo = handleReactQueryError(error)

if (errorInfo.shouldRetry) {
  setTimeout(() => {
    refetch()
  }, errorInfo.retryDelay || 2000)
}
```

---

### Q8: 개발 모드와 프로덕션 모드의 차이는?

**A**: 에러 상세 정보 표시 여부가 다릅니다.

**개발 모드**:
```jsx
{process.env.NODE_ENV === 'development' && (
  <details>
    <summary>개발자 정보</summary>
    <pre>{JSON.stringify(errorInfo, null, 2)}</pre>
  </details>
)}
```

**프로덕션 모드**:
- 스택 트레이스 숨김
- 에러 상세 정보 숨김
- 사용자 친화적 메시지만 표시

---

## 🔗 관련 문서

1. **[MY-STUDIES-FINAL-REPORT.md](./MY-STUDIES-FINAL-REPORT.md)** - 최종 완료 보고서
2. **[STEP-8-PROMPT.md](./STEP-8-PROMPT.md)** - Phase 4 작업 지침
3. **[IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)** - 구현 계획

---

**작성일**: 2025-12-01  
**작성자**: GitHub Copilot  
**버전**: 1.0.0

