# 내 스터디 (My Studies) 예외 처리 가이드

**작성일**: 2025-11-29  
**최종 업데이트**: 2025-11-29  
**작성자**: CoUp Development Team  
**버전**: 1.0.0

---

## 📚 목차

1. [개요](#개요)
2. [내 스터디 구조](#내-스터디-구조)
3. [주요 기능](#주요-기능)
4. [탭 시스템](#탭-시스템)
5. [위젯 시스템](#위젯-시스템)
6. [예외 처리 전략](#예외-처리-전략)
7. [빠른 참조](#빠른-참조)
8. [관련 문서](#관련-문서)

---

## 개요

### 내 스터디란?

**내 스터디(My Studies)**는 사용자가 **참여하고 있는 스터디**의 **내부 활동 공간**입니다. 스터디 목록 조회, 스터디 내부 대시보드, 공지사항, 할일, 파일, 캘린더, 채팅 등 **스터디 멤버로서 수행하는 모든 활동**을 포함합니다.

### 스터디 관리(Studies)와의 차이

| 구분 | 스터디 관리 (Studies) | 내 스터디 (My Studies) |
|------|----------------------|------------------------|
| **목적** | 스터디 탐색, 생성, 가입 | 참여 중인 스터디 활동 |
| **권한** | 누구나 (비회원 포함) | 스터디 멤버만 |
| **주요 기능** | 검색, 필터링, 가입 요청 | 공지, 할일, 파일, 채팅 |
| **경로** | `/studies` | `/my-studies` |
| **API** | `/api/studies` | `/api/studies/[id]/*` |

### 핵심 특징

1. **멤버 전용**: 스터디 멤버만 접근 가능
2. **역할 기반**: OWNER, ADMIN, MEMBER별 다른 권한
3. **실시간 협업**: 채팅, 알림, 동기화
4. **탭 시스템**: 개요, 채팅, 공지, 파일, 캘린더, 할일, 화상, 멤버, 설정
5. **위젯 시스템**: 대시보드의 다양한 정보 위젯

---

## 내 스터디 구조

### 디렉토리 구조

```
src/app/my-studies/
├── page.jsx                              # 내 스터디 목록
└── [studyId]/
    ├── page.jsx                          # 스터디 대시보드 (개요)
    ├── chat/
    │   └── page.jsx                      # 채팅
    ├── notices/
    │   └── page.jsx                      # 공지사항
    ├── files/
    │   └── page.jsx                      # 파일 관리
    ├── calendar/
    │   └── page.jsx                      # 캘린더
    ├── tasks/
    │   └── page.jsx                      # 할일 관리
    ├── video-call/
    │   └── page.jsx                      # 화상 통화
    ├── members/
    │   └── page.jsx                      # 멤버 관리 (ADMIN+)
    └── settings/
        └── page.jsx                      # 설정 (ADMIN+)

src/app/api/studies/[id]/
├── check-member/route.js                 # 멤버 확인
├── notices/route.js                      # 공지사항 CRUD
├── tasks/route.js                        # 할일 CRUD
├── files/route.js                        # 파일 업로드/다운로드
├── calendar/route.js                     # 일정 CRUD
├── chat/route.js                         # 채팅 메시지
└── members/route.js                      # 멤버 관리
```

### 컴포넌트 구조

```
src/components/
├── study/
│   ├── StudyTabs.jsx                     # 탭 네비게이션
│   └── RealtimeChat.js                   # 실시간 채팅
├── studies/
│   └── NoticeCreateEditModal.jsx         # 공지 작성/수정 모달
└── tasks/
    └── TaskCard.jsx                      # 할일 카드 (재사용)
```

---

## 주요 기능

### 1. 내 스터디 목록 (`/my-studies`)

#### 기능
- 내가 참여한 모든 스터디 조회
- 탭별 필터링: 전체, 참여중, 관리중, 대기중
- 역할 배지 표시: OWNER, ADMIN, MEMBER, PENDING
- 페이지네이션 (5개씩)

#### 데이터 소스
```javascript
const { data, isLoading, error } = useMyStudies({ limit: 1000 })
```

#### 역할별 필터링
- **전체**: 모든 스터디
- **참여중**: `role === 'MEMBER'`
- **관리중**: `role === 'OWNER' || role === 'ADMIN'`
- **대기중**: `role === 'PENDING'` (가입 승인 대기)

#### 주요 예외 상황
- 스터디 없음 (신규 사용자)
- 로딩 실패
- 네트워크 오류
- 빈 탭 (특정 역할의 스터디 없음)

---

### 2. 스터디 대시보드 (`/my-studies/[studyId]`)

#### 기능
- 이번 주 활동 요약 (출석률, 할일 완료율, 메시지 수)
- 스터디 소개
- 최근 공지사항 (3개)
- 멤버 목록
- 다가오는 일정
- 긴급 할일

#### 데이터 소스
```javascript
const { data: studyData } = useStudy(studyId)
const { data: noticesData } = useNotices(studyId, { limit: 3 })
```

#### 활동 요약 데이터
```javascript
const weeklyActivity = {
  attendance: study.weeklyStats?.attendanceRate || 0,
  attendanceCount: study.weeklyStats?.attendanceCount || '0/0',
  taskCompletion: study.weeklyStats?.taskCompletionRate || 0,
  taskCount: study.weeklyStats?.taskCount || '0/0',
  messages: study.weeklyStats?.messageCount || 0,
  notices: study.weeklyStats?.noticeCount || 0,
  files: study.weeklyStats?.fileCount || 0,
}
```

#### 주요 예외 상황
- 스터디를 찾을 수 없음 (잘못된 ID, 삭제된 스터디)
- 멤버 권한 없음 (탈퇴, 강퇴, 승인 대기)
- 위젯 데이터 로딩 실패
- 통계 계산 오류

---

## 탭 시스템

### 탭 구조

```javascript
const tabs = [
  { label: '개요', href: `/my-studies/${studyId}`, icon: '📊' },
  { label: '채팅', href: `/my-studies/${studyId}/chat`, icon: '💬' },
  { label: '공지', href: `/my-studies/${studyId}/notices`, icon: '📢' },
  { label: '파일', href: `/my-studies/${studyId}/files`, icon: '📁' },
  { label: '캘린더', href: `/my-studies/${studyId}/calendar`, icon: '📅' },
  { label: '할일', href: `/my-studies/${studyId}/tasks`, icon: '✅' },
  { label: '화상', href: `/my-studies/${studyId}/video-call`, icon: '📹' },
  { label: '멤버', href: `/my-studies/${studyId}/members`, icon: '👥', adminOnly: true },
  { label: '설정', href: `/my-studies/${studyId}/settings`, icon: '⚙️', adminOnly: true },
]
```

### 탭별 권한

| 탭 | 모든 멤버 | ADMIN | OWNER |
|----|----------|-------|-------|
| 개요 | ✅ | ✅ | ✅ |
| 채팅 | ✅ | ✅ | ✅ |
| 공지 | 읽기 | 읽기+쓰기 | 읽기+쓰기 |
| 파일 | ✅ | ✅ | ✅ |
| 캘린더 | ✅ | ✅ | ✅ |
| 할일 | ✅ | ✅ | ✅ |
| 화상 | ✅ | ✅ | ✅ |
| 멤버 | ❌ | ✅ | ✅ |
| 설정 | ❌ | ❌ | ✅ |

### 탭 전환 예외

- 권한 없는 탭 접근 (멤버가 설정 접근)
- 탭 데이터 로딩 실패
- 네트워크 오류
- 스터디 권한 변경 (강등, 승급)

---

## 위젯 시스템

### 대시보드 위젯

#### 1. 이번 주 활동 요약
- **데이터**: 출석률, 할일 완료율, 메시지/공지/파일 수
- **갱신**: 실시간 (React Query)
- **예외**: API 실패, 통계 계산 오류

#### 2. 스터디 소개
- **데이터**: 설명, 카테고리, 태그
- **갱신**: 설정 변경 시
- **예외**: 데이터 없음

#### 3. 최근 공지사항
- **데이터**: 최근 3개 공지
- **갱신**: 공지 작성/수정/삭제 시
- **예외**: 공지 없음, 로딩 실패

#### 4. 멤버 목록
- **데이터**: 전체 멤버
- **갱신**: 멤버 추가/제거 시
- **예외**: 멤버 없음 (불가능), 로딩 실패

#### 5. 다가오는 일정
- **데이터**: 향후 7일 일정
- **갱신**: 일정 추가/수정/삭제 시
- **예외**: 일정 없음, 로딩 실패

#### 6. 긴급 할일
- **데이터**: 마감 임박 할일
- **갱신**: 할일 상태 변경 시
- **예외**: 할일 없음, 로딩 실패

---

## 예외 처리 전략

### 1. 멤버 권한 검증

#### 서버 사이드 (API)

```javascript
// src/app/api/studies/[id]/*/route.js
import { requireStudyMember } from "@/lib/auth-helpers"

export async function GET(request, { params }) {
  const { id: studyId } = await params
  
  // 멤버 확인 (자동으로 401/403 반환)
  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result
  
  const { session, member } = result
  
  // ...
}
```

#### 클라이언트 사이드 (페이지)

```javascript
// src/app/my-studies/[studyId]/*/page.jsx
const { data: studyData, isLoading } = useStudy(studyId)
const study = studyData?.data

if (isLoading) {
  return <div className={styles.loading}>스터디 정보를 불러오는 중...</div>
}

if (!study) {
  return <div className={styles.error}>스터디를 찾을 수 없습니다.</div>
}

// 권한 체크
const canEdit = ['OWNER', 'ADMIN'].includes(study.myRole)
```

---

### 2. 데이터 로딩 패턴

#### React Query 훅 사용

```javascript
const { data, isLoading, error, refetch } = useNotices(studyId)

// 로딩 상태
if (isLoading) {
  return <div className={styles.loading}>공지사항을 불러오는 중...</div>
}

// 에러 상태
if (error) {
  return (
    <div className={styles.error}>
      <p>공지사항을 불러오는데 실패했습니다.</p>
      <button onClick={() => refetch()}>다시 시도</button>
    </div>
  )
}

// 빈 상태
if (!data?.data || data.data.length === 0) {
  return (
    <div className={styles.empty}>
      <p>아직 공지사항이 없습니다.</p>
      {canEdit && <button onClick={handleCreate}>첫 공지 작성하기</button>}
    </div>
  )
}
```

---

### 3. Mutation 에러 처리

```javascript
const createNotice = useCreateNotice()

const handleSubmit = async (e) => {
  e.preventDefault()
  
  try {
    await createNotice.mutateAsync({ studyId, data: formData })
    alert('공지가 작성되었습니다')
    setIsModalOpen(false)
  } catch (error) {
    console.error('공지 작성 실패:', error)
    
    // 에러 메시지 처리
    if (error.response?.status === 403) {
      alert('권한이 없습니다')
    } else if (error.response?.status === 400) {
      alert(error.response.data.error || '입력 값을 확인해주세요')
    } else {
      alert('공지 작성에 실패했습니다')
    }
  }
}
```

---

### 4. 실시간 동기화

#### React Query 자동 갱신

```javascript
const { data } = useNotices(studyId, {
  refetchInterval: 30000, // 30초마다 자동 갱신
  refetchOnWindowFocus: true, // 창 포커스 시 갱신
})
```

#### Mutation 후 캐시 무효화

```javascript
const queryClient = useQueryClient()

const createNotice = useMutation({
  mutationFn: (data) => api.post(`/studies/${studyId}/notices`, data),
  onSuccess: () => {
    // 공지 목록 캐시 무효화 -> 자동 재조회
    queryClient.invalidateQueries(['notices', studyId])
    queryClient.invalidateQueries(['study', studyId]) // 대시보드도 갱신
  }
})
```

---

## 빠른 참조

### 자주 발생하는 문제

| 증상 | 원인 | 해결 문서 |
|------|------|----------|
| "스터디를 찾을 수 없습니다" | 잘못된 ID, 삭제된 스터디, 권한 없음 | [01-my-studies-list-exceptions.md](./01-my-studies-list-exceptions.md#스터디-없음) |
| 공지사항이 표시되지 않음 | API 실패, 권한 부족 | [03-notices-exceptions.md](./03-notices-exceptions.md#로딩-실패) |
| 파일 업로드 실패 | 용량 초과, 형식 제한 | [05-files-exceptions.md](./05-files-exceptions.md#업로드-실패) |
| 할일 생성 안됨 | 권한 부족, 유효성 오류 | [04-tasks-exceptions.md](./04-tasks-exceptions.md#생성-실패) |
| 채팅 메시지 안보임 | WebSocket 연결 실패 | [08-chat-exceptions.md](./08-chat-exceptions.md#연결-실패) |
| 멤버 탭 접근 불가 | MEMBER 권한 (ADMIN 필요) | [02-study-detail-exceptions.md](./02-study-detail-exceptions.md#권한-부족) |
| 캘린더 일정 안보임 | API 실패, 날짜 파싱 오류 | [06-calendar-exceptions.md](./06-calendar-exceptions.md#로딩-실패) |

### API 엔드포인트 요약

| 기능 | 메서드 | 경로 | 권한 |
|------|--------|------|------|
| 내 스터디 목록 | GET | `/api/my-studies` | 인증 필요 |
| 스터디 상세 | GET | `/api/studies/[id]` | 멤버 |
| 공지 목록 | GET | `/api/studies/[id]/notices` | 멤버 |
| 공지 작성 | POST | `/api/studies/[id]/notices` | ADMIN+ |
| 할일 목록 | GET | `/api/studies/[id]/tasks` | 멤버 |
| 할일 생성 | POST | `/api/studies/[id]/tasks` | 멤버 |
| 파일 목록 | GET | `/api/studies/[id]/files` | 멤버 |
| 파일 업로드 | POST | `/api/studies/[id]/files` | 멤버 |
| 일정 목록 | GET | `/api/studies/[id]/calendar` | 멤버 |
| 채팅 메시지 | GET | `/api/studies/[id]/chat` | 멤버 |
| 멤버 관리 | GET/POST/DELETE | `/api/studies/[id]/members` | ADMIN+ |

---

## 관련 문서

### 내 스터디 문서
- [INDEX.md](./INDEX.md) - 증상별 색인
- [01-my-studies-list-exceptions.md](./01-my-studies-list-exceptions.md) - 목록 예외
- [02-study-detail-exceptions.md](./02-study-detail-exceptions.md) - 상세 페이지 예외
- [03-notices-exceptions.md](./03-notices-exceptions.md) - 공지사항 예외
- [04-tasks-exceptions.md](./04-tasks-exceptions.md) - 할일 예외
- [05-files-exceptions.md](./05-files-exceptions.md) - 파일 예외
- [06-calendar-exceptions.md](./06-calendar-exceptions.md) - 캘린더 예외
- [07-widgets-exceptions.md](./07-widgets-exceptions.md) - 위젯 예외
- [08-chat-exceptions.md](./08-chat-exceptions.md) - 채팅 예외
- [99-best-practices.md](./99-best-practices.md) - 모범 사례

### 다른 영역 문서
- [../auth/README.md](../auth/README.md) - 인증 예외 처리
- [../dashboard/README.md](../dashboard/README.md) - 대시보드 예외 처리
- [../studies/README.md](../studies/README.md) - 스터디 관리 예외 처리

### 개발 가이드
- [../../guides/error-handling.md](../../guides/error-handling.md) - 에러 핸들링 가이드
- [../../guides/api-design.md](../../guides/api-design.md) - API 설계 가이드

---

## 문서 작성 원칙

### 1. 실용성 우선
- 즉시 적용 가능한 코드 예제
- 실제 발생하는 문제 중심
- 단계별 해결 방법 제시

### 2. 완전성
- 모든 탭의 예외 상황 커버
- 모든 권한 레벨 고려
- 모든 API 엔드포인트 검증

### 3. 일관성
- 다른 영역 문서와 동일한 구조
- 통일된 용어 사용
- 표준 네이밍 컨벤션

### 4. 유지보수성
- 버전 관리
- 업데이트 이력
- 링크 연결

---

## 버전 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0.0 | 2025-11-29 | 초기 작성 | CoUp Team |

---

**다음 문서**: [INDEX.md](./INDEX.md) - 증상별 색인  
**관련 문서**: [../studies/README.md](../studies/README.md) - 스터디 관리 예외 처리

**문의**: 문제가 해결되지 않으면 개발팀에 문의하세요.

