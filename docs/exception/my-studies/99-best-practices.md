# 내 스터디 모범 사례 (Best Practices)

**작성일**: 2025-11-29  
**최종 업데이트**: 2025-11-29  
**목적**: 내 스터디 영역 개발 시 따라야 할 모범 사례 및 패턴

---

## 📚 목차

1. [에러 핸들링 패턴](#에러-핸들링-패턴)
2. [권한 검증 패턴](#권한-검증-패턴)
3. [데이터 로딩 전략](#데이터-로딩-전략)
4. [실시간 동기화 패턴](#실시간-동기화-패턴)
5. [성능 최적화 전략](#성능-최적화-전략)
6. [UX 개선 패턴](#ux-개선-패턴)
7. [테스트 전략](#테스트-전략)
8. [코드 구조 및 네이밍](#코드-구조-및-네이밍)

---

## 에러 핸들링 패턴

### 1.1 계층적 에러 처리

```javascript
// ✅ 모범 사례: 3단계 에러 처리

// 1. API 레벨 (src/lib/api.js)
const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.response.use(
  response => response,
  error => {
    // 공통 에러 처리
    if (error.response?.status === 401) {
      // 인증 만료 -> 로그인 페이지
      window.location.href = '/login'
    }
    
    if (error.response?.status === 503) {
      // 서비스 점검
      showMaintenanceNotice()
    }

    return Promise.reject(error)
  }
)

// 2. 훅 레벨 (src/lib/hooks/useApi.js)
export function useStudy(studyId, options = {}) {
  return useQuery({
    queryKey: ['study', studyId],
    queryFn: async () => {
      try {
        const response = await api.get(`/studies/${studyId}`)
        return response.data
      } catch (error) {
        // 훅 레벨에서 에러 로깅
        console.error(`[useStudy] Failed to fetch study ${studyId}:`, error)
        
        // 특정 에러 변환
        if (error.response?.status === 404) {
          throw new Error('STUDY_NOT_FOUND')
        } else if (error.response?.status === 403) {
          throw new Error('STUDY_ACCESS_DENIED')
        }
        
        throw error
      }
    },
    ...options
  })
}

// 3. 컴포넌트 레벨
function MyStudyPage() {
  const { data, isLoading, error } = useStudy(studyId)

  if (isLoading) return <Skeleton />

  if (error) {
    // 사용자 친화적 메시지
    return (
      <ErrorDisplay
        error={error}
        messages={{
          STUDY_NOT_FOUND: '스터디를 찾을 수 없습니다',
          STUDY_ACCESS_DENIED: '접근 권한이 없습니다',
          default: '스터디를 불러올 수 없습니다'
        }}
      />
    )
  }

  return <StudyContent study={data.data} />
}
```

---

### 1.2 사용자 친화적 에러 메시지

```javascript
// ✅ 모범 사례: 에러 메시지 변환
const ERROR_MESSAGES = {
  // 네트워크 에러
  'Network Error': '인터넷 연결을 확인해주세요',
  'timeout': '요청 시간이 초과되었습니다. 다시 시도해주세요',
  
  // API 에러
  'STUDY_NOT_FOUND': '스터디를 찾을 수 없습니다',
  'STUDY_ACCESS_DENIED': '스터디 접근 권한이 없습니다',
  'MEMBER_ONLY': '스터디 멤버만 접근할 수 있습니다',
  'ADMIN_REQUIRED': '관리자 권한이 필요합니다',
  
  // 유효성 에러
  'INVALID_INPUT': '입력 값을 확인해주세요',
  'FILE_TOO_LARGE': '파일 크기가 너무 큽니다 (최대 10MB)',
  'INVALID_FILE_TYPE': '지원하지 않는 파일 형식입니다',
  
  // 기본 메시지
  'default': '알 수 없는 오류가 발생했습니다'
}

function getErrorMessage(error) {
  if (error.response?.data?.error) {
    return ERROR_MESSAGES[error.response.data.error] || error.response.data.error
  }
  
  if (error.message) {
    return ERROR_MESSAGES[error.message] || error.message
  }
  
  return ERROR_MESSAGES.default
}
```

---

## 권한 검증 패턴

### 2.1 서버 측 권한 검증

```javascript
// ✅ 모범 사례: requireStudyMember 헬퍼 사용
// src/app/api/studies/[id]/*/route.js

import { requireStudyMember } from "@/lib/auth-helpers"

export async function POST(request, { params }) {
  const { id: studyId } = await params
  
  // 1. 멤버 권한 필요
  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result
  
  // 2. ADMIN 권한 필요
  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result
  
  const { session, member, study } = result
  
  // 3. 커스텀 권한 체크
  if (member.role === 'PENDING') {
    return NextResponse.json(
      { error: "가입 승인 대기 중입니다" },
      { status: 403 }
    )
  }
  
  // ... 비즈니스 로직
}
```

---

### 2.2 클라이언트 측 권한 체크

```javascript
// ✅ 모범 사례: 권한 훅 사용
function useStudyPermissions(study, currentUser) {
  const permissions = useMemo(() => {
    if (!study || !currentUser) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canManageMembers: false,
        canEditSettings: false
      }
    }

    const role = study.myRole

    return {
      canView: ['OWNER', 'ADMIN', 'MEMBER'].includes(role),
      canEdit: ['OWNER', 'ADMIN'].includes(role),
      canDelete: role === 'OWNER',
      canManageMembers: ['OWNER', 'ADMIN'].includes(role),
      canEditSettings: role === 'OWNER'
    }
  }, [study, currentUser])

  return permissions
}

// 사용
function StudyPage() {
  const { data: studyData } = useStudy(studyId)
  const { data: session } = useSession()
  const permissions = useStudyPermissions(studyData?.data, session?.user)

  return (
    <>
      {permissions.canEdit && (
        <button onClick={handleEdit}>수정</button>
      )}
      {permissions.canDelete && (
        <button onClick={handleDelete}>삭제</button>
      )}
    </>
  )
}
```

---

## 데이터 로딩 전략

### 3.1 React Query 설정

```javascript
// ✅ 모범 사례: 적절한 캐시 전략
export function useStudy(studyId, options = {}) {
  return useQuery({
    queryKey: ['study', studyId],
    queryFn: () => api.get(`/studies/${studyId}`).then(res => res.data),
    staleTime: 60000, // 1분 동안 fresh
    cacheTime: 300000, // 5분 동안 캐시 유지
    refetchOnWindowFocus: true, // 창 포커스 시 재조회
    refetchOnReconnect: true, // 재연결 시 재조회
    retry: 3, // 실패 시 3회 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options
  })
}

export function useNotices(studyId, params = {}, options = {}) {
  return useQuery({
    queryKey: ['notices', studyId, params],
    queryFn: () => api.get(`/studies/${studyId}/notices`, { params }).then(res => res.data),
    staleTime: 30000, // 30초 (공지는 자주 변경)
    cacheTime: 180000, // 3분
    refetchInterval: 30000, // 30초마다 자동 갱신
    ...options
  })
}
```

---

### 3.2 낙관적 업데이트

```javascript
// ✅ 모범 사례: 낙관적 업데이트 with 롤백
const updateNotice = useMutation({
  mutationFn: ({ noticeId, data }) =>
    api.patch(`/studies/${studyId}/notices/${noticeId}`, data),
  
  onMutate: async ({ noticeId, data }) => {
    // 진행 중인 refetch 취소
    await queryClient.cancelQueries(['notices', studyId])

    // 이전 데이터 백업
    const previousNotices = queryClient.getQueryData(['notices', studyId])

    // 낙관적 업데이트
    queryClient.setQueryData(['notices', studyId], (old) => ({
      ...old,
      data: old.data.map(notice =>
        notice.id === noticeId ? { ...notice, ...data } : notice
      )
    }))

    return { previousNotices }
  },
  
  onError: (err, variables, context) => {
    // 롤백
    queryClient.setQueryData(['notices', studyId], context.previousNotices)
    console.error('Update failed:', err)
    alert('수정에 실패했습니다')
  },
  
  onSuccess: () => {
    // 성공 시 재조회 (서버 데이터와 동기화)
    queryClient.invalidateQueries(['notices', studyId])
  }
})
```

---

## 실시간 동기화 패턴

### 4.1 Mutation 후 캐시 무효화

```javascript
// ✅ 모범 사례: 관련 쿼리 모두 무효화
const createNotice = useMutation({
  mutationFn: (data) => api.post(`/studies/${studyId}/notices`, data),
  onSuccess: () => {
    // 공지 목록 무효화
    queryClient.invalidateQueries(['notices', studyId])
    
    // 스터디 대시보드도 무효화 (최근 공지 위젯)
    queryClient.invalidateQueries(['study', studyId])
    
    // 알림 무효화
    queryClient.invalidateQueries(['notifications'])
  }
})
```

---

### 4.2 WebSocket 이벤트 처리

```javascript
// ✅ 모범 사례: WebSocket 이벤트로 캐시 업데이트
useEffect(() => {
  if (!studyId) return

  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  })

  const channel = pusher.subscribe(`study-${studyId}`)

  // 새 공지
  channel.bind('new-notice', (data) => {
    queryClient.invalidateQueries(['notices', studyId])
  })

  // 공지 수정
  channel.bind('notice-updated', (data) => {
    queryClient.setQueryData(['notices', studyId], (old) => ({
      ...old,
      data: old.data.map(notice =>
        notice.id === data.id ? data : notice
      )
    }))
  })

  // 공지 삭제
  channel.bind('notice-deleted', (data) => {
    queryClient.setQueryData(['notices', studyId], (old) => ({
      ...old,
      data: old.data.filter(notice => notice.id !== data.id)
    }))
  })

  return () => {
    channel.unbind_all()
    channel.unsubscribe()
    pusher.disconnect()
  }
}, [studyId, queryClient])
```

---

## 성능 최적화 전략

### 5.1 컴포넌트 메모이제이션

```javascript
// ✅ 모범 사례: React.memo + useMemo
const TaskCard = React.memo(({ task, onEdit, onDelete }) => {
  const dueDate = useMemo(() => {
    if (!task.dueDate) return null
    return formatDateTimeKST(task.dueDate)
  }, [task.dueDate])

  const priorityColor = useMemo(() => {
    return {
      HIGH: '#ef4444',
      MEDIUM: '#f59e0b',
      LOW: '#10b981'
    }[task.priority]
  }, [task.priority])

  return (
    <div className={styles.taskCard}>
      <h4>{task.title}</h4>
      <span style={{ color: priorityColor }}>{task.priority}</span>
      {dueDate && <span>{dueDate}</span>}
      <button onClick={() => onEdit(task)}>수정</button>
      <button onClick={() => onDelete(task.id)}>삭제</button>
    </div>
  )
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.priority === nextProps.task.priority
  )
})

TaskCard.displayName = 'TaskCard'
```

---

### 5.2 리스트 최적화

```javascript
// ✅ 모범 사례: 안정적인 키 + 가상 스크롤
// 1. 안정적인 키 사용
{tasks.map(task => (
  <TaskCard
    key={task.id} // ❌ index 사용 금지
    task={task}
  />
))}

// 2. 대량 데이터는 가상 스크롤
import { FixedSizeList as List } from 'react-window'

function TaskList({ tasks }) {
  return (
    <List
      height={600}
      itemCount={tasks.length}
      itemSize={100}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <TaskCard task={tasks[index]} />
        </div>
      )}
    </List>
  )
}
```

---

## UX 개선 패턴

### 6.1 로딩 상태

```javascript
// ✅ 모범 사례: 스켈레톤 UI
function StudyDashboard() {
  const { data, isLoading } = useStudy(studyId)

  if (isLoading) {
    return <StudyDashboardSkeleton />
  }

  return <StudyContent study={data.data} />
}

// 스켈레톤 컴포넌트
function StudyDashboardSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonHeader}></div>
      <div className={styles.skeletonTabs}></div>
      <div className={styles.skeletonContent}>
        {[1, 2, 3].map(i => (
          <div key={i} className={styles.skeletonCard}></div>
        ))}
      </div>
    </div>
  )
}
```

---

### 6.2 빈 상태

```javascript
// ✅ 모범 사례: 액션 유도 빈 상태
function EmptyState({ type, onAction }) {
  const emptyStates = {
    notices: {
      icon: '📢',
      title: '아직 공지사항이 없습니다',
      description: '첫 번째 공지를 작성해보세요',
      actionLabel: '공지 작성하기'
    },
    tasks: {
      icon: '✅',
      title: '등록된 할일이 없습니다',
      description: '새로운 할일을 추가해보세요',
      actionLabel: '할일 추가하기'
    },
    // ...
  }

  const state = emptyStates[type]

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{state.icon}</div>
      <h3>{state.title}</h3>
      <p>{state.description}</p>
      {onAction && (
        <button onClick={onAction} className={styles.actionButton}>
          {state.actionLabel}
        </button>
      )}
    </div>
  )
}
```

---

## 테스트 전략

### 7.1 E2E 테스트

```javascript
// ✅ 모범 사례: 주요 플로우 테스트
// cypress/e2e/my-studies.cy.js
describe('내 스터디', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password')
  })

  it('스터디 목록을 조회하고 상세 페이지로 이동한다', () => {
    cy.visit('/my-studies')
    
    // 목록 확인
    cy.get('[data-testid="study-card"]').should('have.length.greaterThan', 0)
    
    // 첫 번째 스터디 클릭
    cy.get('[data-testid="study-card"]').first().click()
    
    // 상세 페이지 확인
    cy.url().should('include', '/my-studies/')
    cy.get('[data-testid="study-dashboard"]').should('be.visible')
  })

  it('공지사항을 생성하고 수정한다', () => {
    cy.visit('/my-studies/1/notices')
    
    // 공지 작성
    cy.get('[data-testid="create-notice-button"]').click()
    cy.get('#title').type('새 공지')
    cy.get('#content').type('공지 내용')
    cy.get('[data-testid="submit-button"]').click()
    
    // 생성 확인
    cy.contains('새 공지').should('be.visible')
    
    // 수정
    cy.get('[data-testid="notice-item"]').first().within(() => {
      cy.get('[data-testid="edit-button"]').click()
    })
    cy.get('#title').clear().type('수정된 공지')
    cy.get('[data-testid="submit-button"]').click()
    
    // 수정 확인
    cy.contains('수정된 공지').should('be.visible')
  })
})
```

---

## 코드 구조 및 네이밍

### 8.1 파일 구조

```
src/app/my-studies/
├── page.jsx                          # 목록 페이지
├── page.module.css
└── [studyId]/
    ├── page.jsx                      # 대시보드
    ├── page.module.css
    ├── layout.jsx                    # 공통 레이아웃 (선택적)
    ├── notices/
    │   ├── page.jsx
    │   └── page.module.css
    ├── tasks/
    │   ├── page.jsx
    │   └── page.module.css
    └── ...

src/components/my-studies/            # 내 스터디 전용 컴포넌트
├── StudyCard.jsx
├── NoticeCard.jsx
└── ...

src/lib/hooks/
├── useMyStudies.js                   # 내 스터디 목록
├── useStudy.js                       # 스터디 상세
├── useNotices.js                     # 공지 목록
└── ...
```

---

### 8.2 네이밍 컨벤션

```javascript
// ✅ 모범 사례

// 컴포넌트: PascalCase
function StudyDashboard() {}
function NoticeCard() {}

// 훅: use + PascalCase
function useMyStudies() {}
function useStudyPermissions() {}

// 상수: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_FILE_TYPES = ['pdf', 'doc', 'docx']

// 함수: camelCase (동사로 시작)
function handleSubmit() {}
function validateForm() {}
function getErrorMessage() {}

// Boolean: is/has/can + 명사/형용사
const isLoading = true
const hasPermission = false
const canEdit = true

// 이벤트 핸들러: handle + 명사 + 동사
function handleNoticeCreate() {}
function handleTaskDelete() {}
function handleFileUpload() {}
```

---

## 체크리스트

### 새 기능 추가 시

- [ ] 멤버 권한 검증 (API)
- [ ] 클라이언트 권한 체크 (UI)
- [ ] 로딩 상태 처리
- [ ] 에러 상태 처리
- [ ] 빈 상태 처리
- [ ] React Query 캐시 무효화
- [ ] 낙관적 업데이트 (필요 시)
- [ ] 유효성 검사
- [ ] 에러 메시지 한글화
- [ ] E2E 테스트 작성
- [ ] 문서 업데이트

---

## 관련 문서

- [INDEX.md](./INDEX.md) - 색인
- [README.md](./README.md) - 개요
- 모든 예외 처리 문서 (01-08)

---

**다음 문서**: [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)  
**이전 문서**: [08-chat-exceptions.md](./08-chat-exceptions.md)

