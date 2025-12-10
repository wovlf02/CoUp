# 파일/캘린더/공지사항 상세 가이드

## 개요

내 스터디의 파일 관리, 캘린더(일정), 공지사항 기능에 대한 상세 문서입니다.

---

## 파일 관리

### 데이터 모델

```javascript
{
  id: String,
  studyId: String,
  uploaderId: String,
  name: String,           // 저장된 파일명
  originalName: String,   // 원본 파일명
  mimeType: String,       // MIME 타입
  size: Number,           // 파일 크기 (bytes)
  url: String,            // 파일 URL
  category: String,       // 카테고리 (자동 분류)
  folderId: String,       // 폴더 ID (선택)
  createdAt: Date,
  uploader: {
    id: String,
    name: String,
    avatar: String
  }
}
```

### 파일 카테고리

| 카테고리 | 확장자 |
|----------|--------|
| `IMAGE` | jpg, jpeg, png, gif, svg, webp, bmp, ico, tiff, heic |
| `VIDEO` | mp4, avi, mov, wmv, flv, mkv, webm |
| `AUDIO` | mp3, wav, ogg, flac, aac, m4a |
| `DOCUMENT` | pdf, doc, docx, xls, xlsx, ppt, pptx, txt, hwp, rtf, csv |
| `ARCHIVE` | zip, rar, 7z, tar, gz, bz2, xz |
| `CODE` | js, ts, jsx, tsx, css, html, json, xml, py, java |

### API 엔드포인트

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/studies/[id]/files` | 파일 목록 | MEMBER+ |
| POST | `/api/studies/[id]/files` | 파일 업로드 | MEMBER+ |
| GET | `/api/studies/[id]/files/[fileId]` | 파일 상세 | MEMBER+ |
| DELETE | `/api/studies/[id]/files/[fileId]` | 파일 삭제 | 본인/ADMIN+ |
| GET | `/api/studies/[id]/files/[fileId]/download` | 다운로드 | MEMBER+ |

### 권한 매트릭스

| 기능 | OWNER | ADMIN | MEMBER |
|------|:-----:|:-----:|:------:|
| 파일 조회 | ✅ | ✅ | ✅ |
| 파일 업로드 | ✅ | ✅ | ✅ |
| 파일 다운로드 | ✅ | ✅ | ✅ |
| 내 파일 삭제 | ✅ | ✅ | ✅ |
| 모든 파일 삭제 | ✅ | ✅ | ❌ |

### Hooks

```javascript
// 파일 목록
export function useFiles(studyId, params = {})

// 파일 업로드
export function useUploadFile()

// 파일 삭제
export function useDeleteFile()
```

### 업로드 제한

| 항목 | 제한 |
|------|------|
| 최대 파일 크기 | 50MB |
| 허용 확장자 | 모든 확장자 (보안 검사 후) |
| 스터디당 최대 용량 | 1GB (설정 가능) |

### 파일 분류 로직

```javascript
const getFileCategory = (file) => {
  const ext = file.name.toLowerCase().split('.').pop()
  
  const docExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'hwp', 'hwpx', 'rtf', 'odt', 'ods', 'odp', 'csv']
  if (docExtensions.includes(ext)) return '문서'

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff', 'tif', 'heic', 'heif']
  if (imageExtensions.includes(ext)) return '이미지'

  const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz']
  if (archiveExtensions.includes(ext)) return '압축'

  return '기타'
}
```

---

## 캘린더 (일정)

### 데이터 모델

```javascript
{
  id: String,
  studyId: String,
  createdById: String,
  title: String,          // 일정 제목
  date: Date,             // 날짜
  startTime: String,      // 시작 시간 (HH:mm)
  endTime: String,        // 종료 시간 (HH:mm)
  location: String,       // 장소 (선택)
  color: String,          // 색상 코드 (#RRGGBB)
  description: String,    // 설명 (선택)
  createdAt: Date,
  updatedAt: Date,
  createdBy: {
    id: String,
    name: String,
    avatar: String
  }
}
```

### 색상 프리셋

```javascript
const EVENT_COLORS = [
  '#6366F1', // 인디고 (기본)
  '#EC4899', // 핑크
  '#10B981', // 에메랄드
  '#F59E0B', // 앰버
  '#EF4444', // 레드
  '#8B5CF6', // 바이올렛
  '#3B82F6', // 블루
  '#14B8A6', // 틸
]
```

### API 엔드포인트

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/studies/[id]/calendar` | 일정 목록 | MEMBER+ |
| POST | `/api/studies/[id]/calendar` | 일정 생성 | ADMIN+ |
| GET | `/api/studies/[id]/calendar/[eventId]` | 일정 상세 | MEMBER+ |
| PATCH | `/api/studies/[id]/calendar/[eventId]` | 일정 수정 | 작성자/ADMIN+ |
| DELETE | `/api/studies/[id]/calendar/[eventId]` | 일정 삭제 | 작성자/ADMIN+ |

### 권한 매트릭스

| 기능 | OWNER | ADMIN | MEMBER |
|------|:-----:|:-----:|:------:|
| 일정 조회 | ✅ | ✅ | ✅ |
| 일정 생성 | ✅ | ✅ | ❌ |
| 내 일정 수정 | ✅ | ✅ | - |
| 모든 일정 수정 | ✅ | ✅ | ❌ |
| 내 일정 삭제 | ✅ | ✅ | - |
| 모든 일정 삭제 | ✅ | ✅ | ❌ |

### Hooks

```javascript
// 일정 목록
export function useEvents(studyId, params = {})

// 일정 생성
export function useCreateEvent()

// 일정 수정
export function useUpdateEvent()

// 일정 삭제
export function useDeleteEvent()
```

### 뷰 모드

| 모드 | 설명 |
|------|------|
| `month` | 월간 캘린더 뷰 |
| `week` | 주간 뷰 |
| `day` | 일간 뷰 |
| `list` | 리스트 뷰 |

### 날짜 쿼리 파라미터

```javascript
// 월 기준 조회
GET /api/studies/{id}/calendar?month=2025-01

// 날짜 범위 조회
GET /api/studies/{id}/calendar?startDate=2025-01-01&endDate=2025-01-31
```

### 일정 삭제 권한 체크

```javascript
const canDeleteEvent = (event) => {
  if (!currentUser || !study) return false
  
  // 작성자 본인
  if (event.createdById === currentUser.id) return true
  
  // ADMIN 이상
  return ['OWNER', 'ADMIN'].includes(study.myRole)
}
```

---

## 공지사항

### 데이터 모델

```javascript
{
  id: String,
  studyId: String,
  authorId: String,
  title: String,          // 제목
  content: String,        // 내용 (마크다운 지원)
  isPinned: Boolean,      // 상단 고정
  isImportant: Boolean,   // 중요 표시
  views: Number,          // 조회수
  createdAt: Date,
  updatedAt: Date,
  author: {
    id: String,
    name: String,
    avatar: String
  }
}
```

### API 엔드포인트

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/studies/[id]/notices` | 공지 목록 | MEMBER+ |
| POST | `/api/studies/[id]/notices` | 공지 생성 | ADMIN+ |
| GET | `/api/studies/[id]/notices/[noticeId]` | 공지 상세 (조회수 증가) | MEMBER+ |
| PATCH | `/api/studies/[id]/notices/[noticeId]` | 공지 수정 | ADMIN+ |
| DELETE | `/api/studies/[id]/notices/[noticeId]` | 공지 삭제 | ADMIN+ |
| PATCH | `/api/studies/[id]/notices/[noticeId]/pin` | 고정 토글 | ADMIN+ |

### 권한 매트릭스

| 기능 | OWNER | ADMIN | MEMBER |
|------|:-----:|:-----:|:------:|
| 공지 조회 | ✅ | ✅ | ✅ |
| 공지 작성 | ✅ | ✅ | ❌ |
| 공지 수정 | ✅ | ✅ | ❌ |
| 공지 삭제 | ✅ | ✅ | ❌ |
| 공지 고정 | ✅ | ✅ | ❌ |

### Hooks

```javascript
// 공지 목록
export function useNotices(studyId, params = {})

// 공지 상세
export function useNotice(studyId, noticeId)

// 공지 생성
export function useCreateNotice()

// 공지 수정
export function useUpdateNotice()

// 공지 삭제
export function useDeleteNotice()

// 고정 토글
export function useTogglePinNotice()
```

### 공지 필터

| 필터 | 설명 |
|------|------|
| 전체 | 모든 공지 |
| 고정 | `isPinned === true` |
| 중요 | `isImportant === true` |
| 일반 | `!isPinned && !isImportant` |

### 정렬 순서

```javascript
// 기본 정렬: 고정 우선 + 최신순
orderBy: [
  { isPinned: 'desc' },
  { createdAt: 'desc' }
]
```

### 조회수 증가 로직

공지 상세 조회 시 조회수가 자동으로 증가합니다:

```javascript
const handleViewNotice = async (notice) => {
  try {
    // API 호출로 조회수 증가
    const response = await fetch(`/api/studies/${studyId}/notices/${notice.id}`)
    const result = await response.json()
    
    if (result.success && result.data) {
      // 캐시 업데이트
      queryClient.setQueryData(['studies', studyId, 'notices'], (oldData) => {
        if (!oldData?.data) return oldData
        return {
          ...oldData,
          data: oldData.data.map(n =>
            n.id === notice.id ? { ...n, views: result.data.views } : n
          )
        }
      })
      
      setDetailNotice(result.data)
    }
  } catch (error) {
    setDetailNotice(notice)
  }
}
```

### 마크다운 지원

공지 내용은 마크다운을 지원합니다. `MarkdownRenderer` 컴포넌트로 렌더링됩니다.

지원 문법:
- 제목 (`#`, `##`, `###`)
- 굵게 (`**bold**`)
- 기울임 (`*italic*`)
- 링크 (`[text](url)`)
- 이미지 (`![alt](url)`)
- 코드 블록 (` ``` `)
- 인라인 코드 (`` ` ``)
- 리스트 (`-`, `*`, `1.`)
- 인용 (`>`)
- 수평선 (`---`)

---

## 공통 UI 패턴

### 빈 상태 메시지

```javascript
const EMPTY_MESSAGES = {
  files: {
    icon: '📁',
    title: '업로드된 파일이 없습니다',
    description: '파일을 업로드하여 멤버들과 공유하세요'
  },
  calendar: {
    icon: '📅',
    title: '등록된 일정이 없습니다',
    description: '스터디 일정을 추가해보세요'
  },
  notices: {
    icon: '📢',
    title: '공지사항이 없습니다',
    description: '새로운 공지사항을 작성해보세요'
  }
}
```

### 로딩 상태

각 페이지는 다음과 같은 로딩 패턴을 사용합니다:

```jsx
if (isLoading) {
  return (
    <div className={styles.container}>
      <div className={styles.loading}>데이터를 불러오는 중...</div>
    </div>
  )
}
```

### 에러 상태

```jsx
if (!study) {
  return (
    <div className={styles.container}>
      <div className={styles.error}>스터디를 찾을 수 없습니다.</div>
    </div>
  )
}
```

---

## 보안 고려사항

### 파일 보안

1. **파일명 살균**: 악성 파일명 제거
2. **MIME 타입 검증**: 허용된 타입만 업로드
3. **용량 제한**: 파일/스터디별 용량 제한
4. **경로 조작 방지**: 상대 경로 차단

```javascript
import { sanitizeFilename } from '@/lib/utils/xss-sanitizer'
import { validateFileSecurity, generateSafeFilename } from '@/lib/utils/file-security-validator'
```

### 입력 살균

공지사항 내용은 XSS 공격 방지를 위해 살균됩니다:

```javascript
import { validateAndSanitize } from '@/lib/utils/input-sanitizer'
import { validateSecurityThreats, logSecurityEvent } from '@/lib/utils/xss-sanitizer'
```

### 권한 검증

모든 API는 `requireStudyMember` 헬퍼로 권한을 검증합니다:

```javascript
import { requireStudyMember } from '@/lib/auth-helpers'

// MEMBER 이상 권한 필요
const result = await requireStudyMember(studyId)
if (result instanceof NextResponse) return result

// ADMIN 이상 권한 필요
const result = await requireStudyMember(studyId, 'ADMIN')
if (result instanceof NextResponse) return result

// OWNER 권한 필요
const result = await requireStudyMember(studyId, 'OWNER')
if (result instanceof NextResponse) return result
```

