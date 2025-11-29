# 할일 관리 예외 처리

**작성일**: 2025-11-29  
**최종 업데이트**: 2025-11-29  
**대상 파일**: 
- `src/app/my-studies/[studyId]/tasks/page.jsx`
- `src/app/api/studies/[id]/tasks/route.js`

---

## 📚 목차

1. [개요](#개요)
2. [할일 목록 예외](#할일-목록-예외)
3. [할일 생성 예외](#할일-생성-예외)
4. [할일 수정 예외](#할일-수정-예외)
5. [할일 삭제 예외](#할일-삭제-예외)
6. [상태 변경 예외](#상태-변경-예외)
7. [담당자 할당 예외](#담당자-할당-예외)
8. [칸반/리스트 뷰 예외](#칸반리스트-뷰-예외)
9. [필터링/정렬 예외](#필터링정렬-예외)
10. [테스트 시나리오](#테스트-시나리오)

---

## 개요

### 기능 설명

**할일 관리(Tasks)**는 스터디 내에서 **팀 협업**을 위한 작업 관리 시스템입니다. 칸반 보드와 리스트 뷰를 제공하여 시각적으로 작업 진행 상황을 추적할 수 있습니다.

### 주요 기능

1. **할일 CRUD**: 생성, 조회, 수정, 삭제
2. **상태 관리**: TODO, IN_PROGRESS, REVIEW, DONE
3. **우선순위**: HIGH, MEDIUM, LOW
4. **담당자 할당**: 스터디 멤버 중 선택
5. **기한 설정**: 마감일 지정
6. **칸반 보드**: 드래그 앤 드롭으로 상태 변경
7. **리스트 뷰**: 테이블 형식으로 전체 보기
8. **필터링**: 담당자, 상태, 우선순위별
9. **정렬**: 생성일, 마감일, 우선순위

### 권한 구조

| 작업 | MEMBER | ADMIN | OWNER |
|------|--------|-------|-------|
| 목록 조회 | ✅ | ✅ | ✅ |
| 생성 | ✅ | ✅ | ✅ |
| 수정 | 본인 할당 할일 | 모두 | 모두 |
| 삭제 | ❌ | 본인 생성 할일 | 모두 |
| 담당자 변경 | 본인 할당 할일 | 모두 | 모두 |

### 데이터 모델

```prisma
model Task {
  id          String   @id @default(cuid())
  studyId     String
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  assigneeId  String
  creatorId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  study    Study  @relation(fields: [studyId], references: [id])
  assignee User   @relation("TaskAssignee", fields: [assigneeId], references: [id])
  creator  User   @relation("TaskCreator", fields: [creatorId], references: [id])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

---

## 할일 목록 예외

### 1.1 API 호출 실패

#### 증상
- "할일을 불러올 수 없습니다" 메시지
- 빈 화면
- 로딩 상태에서 멈춤

#### 원인
1. **네트워크 오류**: 인터넷 연결 끊김
2. **서버 오류**: 500 Internal Server Error
3. **권한 오류**: 멤버가 아님, PENDING 상태
4. **타임아웃**: 응답 시간 초과

#### 현재 코드

```javascript
// ❌ 문제: 에러 처리 없음
const { data: tasksData, isLoading: tasksLoading } = useStudyTasks(studyId)
const tasks = tasksData?.data || []

if (tasksLoading) {
  return <div className={styles.loading}>할일을 불러오는 중...</div>
}
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 완전한 에러 처리
const { 
  data: tasksData, 
  isLoading, 
  error, 
  refetch 
} = useStudyTasks(studyId)

const tasks = tasksData?.data || []

// 로딩 상태
if (isLoading) {
  return (
    <div className={styles.container}>
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>할일을 불러오는 중...</p>
      </div>
    </div>
  )
}

// 에러 상태
if (error) {
  const status = error.response?.status
  const errorMessage = error.response?.data?.error

  return (
    <div className={styles.container}>
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>
          {status === 403 ? '🔒' : '⚠️'}
        </div>
        <h3 className={styles.errorTitle}>
          {status === 403 
            ? '접근 권한이 없습니다'
            : '할일을 불러올 수 없습니다'}
        </h3>
        <p className={styles.errorDescription}>
          {errorMessage || '잠시 후 다시 시도해주세요'}
        </p>
        <div className={styles.errorActions}>
          <button onClick={() => refetch()} className={styles.retryButton}>
            🔄 다시 시도
          </button>
          <Link href={`/my-studies/${studyId}`} className={styles.backButton}>
            ← 개요로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
```

---

### 1.2 빈 상태 처리

#### 증상
- 할일이 하나도 없음
- 사용자가 다음 행동을 모름

#### 개선 코드

```javascript
// ✅ 좋은 예: 뷰별 빈 상태 메시지
{tasks.length === 0 ? (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>✅</div>
    <h3 className={styles.emptyTitle}>
      {viewType === 'kanban' 
        ? '아직 등록된 할일이 없습니다'
        : '할일 목록이 비어있습니다'}
    </h3>
    <p className={styles.emptyText}>
      새로운 할일을 추가하여 팀 작업을 시작해보세요
    </p>
    
    {/* 빠른 시작 가이드 */}
    <div className={styles.quickGuide}>
      <h4>할일 관리 시작하기</h4>
      <ol>
        <li>할일 추가 버튼을 클릭하세요</li>
        <li>제목과 설명을 입력하세요</li>
        <li>담당자와 마감일을 설정하세요</li>
        <li>칸반 보드에서 드래그로 상태를 변경하세요</li>
      </ol>
    </div>

    <button 
      onClick={() => handleOpenModal()} 
      className={styles.createButton}
    >
      + 첫 번째 할일 추가하기
    </button>
  </div>
) : (
  // 할일 목록/칸반 렌더링
)}
```

---

### 1.3 상태별 할일 분류

#### 현재 코드

```javascript
// ⚠️ 주의: 유효하지 않은 상태 필터링 없음
const tasksByStatus = {
  TODO: tasks.filter(t => t.status === 'TODO'),
  IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
  REVIEW: tasks.filter(t => t.status === 'REVIEW'),
  DONE: tasks.filter(t => t.status === 'DONE')
}
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 안전한 필터링
const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']

// 유효한 할일만 필터링
const validTasks = tasks.filter(task => 
  task && 
  task.status && 
  validStatuses.includes(task.status)
)

// 유효하지 않은 할일 로깅
const invalidTasks = tasks.filter(task => 
  !task || 
  !task.status || 
  !validStatuses.includes(task.status)
)

if (invalidTasks.length > 0) {
  console.error('[Tasks] Invalid tasks found:', invalidTasks)
}

// 상태별 분류
const tasksByStatus = {
  TODO: validTasks.filter(t => t.status === 'TODO'),
  IN_PROGRESS: validTasks.filter(t => t.status === 'IN_PROGRESS'),
  REVIEW: validTasks.filter(t => t.status === 'REVIEW'),
  DONE: validTasks.filter(t => t.status === 'DONE')
}

// 통계 계산
const stats = {
  total: validTasks.length,
  todo: tasksByStatus.TODO.length,
  inProgress: tasksByStatus.IN_PROGRESS.length,
  review: tasksByStatus.REVIEW.length,
  done: tasksByStatus.DONE.length,
  completionRate: validTasks.length > 0 
    ? Math.round((tasksByStatus.DONE.length / validTasks.length) * 100)
    : 0
}
```

---

### 1.4 칸반 컬럼 구성

```javascript
// ✅ 좋은 예: 동적 컬럼 생성
const columns = [
  { 
    id: 'TODO', 
    title: '할 일', 
    color: '#94a3b8', 
    icon: '📝',
    count: tasksByStatus.TODO.length,
    description: '아직 시작하지 않은 작업'
  },
  { 
    id: 'IN_PROGRESS', 
    title: '진행 중', 
    color: '#3b82f6', 
    icon: '🚀',
    count: tasksByStatus.IN_PROGRESS.length,
    description: '현재 진행 중인 작업'
  },
  { 
    id: 'REVIEW', 
    title: '검토', 
    color: '#f59e0b', 
    icon: '👀',
    count: tasksByStatus.REVIEW.length,
    description: '검토가 필요한 작업'
  },
  { 
    id: 'DONE', 
    title: '완료', 
    color: '#10b981', 
    icon: '✅',
    count: tasksByStatus.DONE.length,
    description: '완료된 작업'
  }
]

return (
  <div className={styles.kanbanBoard}>
    {columns.map(column => (
      <div 
        key={column.id} 
        className={styles.kanbanColumn}
        style={{ borderTopColor: column.color }}
      >
        <div className={styles.columnHeader}>
          <div className={styles.columnTitle}>
            <span className={styles.columnIcon}>{column.icon}</span>
            <h3>{column.title}</h3>
            <span className={styles.taskCount}>{column.count}</span>
          </div>
          <p className={styles.columnDescription}>{column.description}</p>
        </div>

        <div className={styles.columnTasks}>
          {tasksByStatus[column.id].length === 0 ? (
            <div className={styles.columnEmpty}>
              <p>할일이 없습니다</p>
            </div>
          ) : (
            tasksByStatus[column.id].map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      </div>
    ))}
  </div>
)
```


---

## 할일 생성 예외

### 2.1 유효성 검사 오류

#### 증상
- "제목을 입력해주세요" 에러
- "유효하지 않은 날짜 형식입니다" 에러
- "유효하지 않은 담당자입니다" 에러

#### API 유효성 검사

```javascript
// src/app/api/studies/[id]/tasks/route.js
export async function POST(request, { params }) {
  const { id: studyId } = await params
  
  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    const body = await request.json()
    const { title, description, status, priority, dueDate, assigneeId } = body

    // 1. 제목 검증
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { 
          error: "제목을 입력해주세요",
          field: "title"
        },
        { status: 400 }
      )
    }

    if (title.length < 2) {
      return NextResponse.json(
        { 
          error: "제목은 2자 이상이어야 합니다",
          field: "title"
        },
        { status: 400 }
      )
    }

    if (title.length > 100) {
      return NextResponse.json(
        { 
          error: "제목은 100자를 초과할 수 없습니다",
          field: "title",
          current: title.length,
          max: 100
        },
        { status: 400 }
      )
    }

    // 2. 설명 검증
    if (description && description.length > 1000) {
      return NextResponse.json(
        { 
          error: "설명은 1,000자를 초과할 수 없습니다",
          field: "description",
          current: description.length,
          max: 1000
        },
        { status: 400 }
      )
    }

    // 3. 상태 검증
    const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          error: "유효하지 않은 상태입니다",
          field: "status",
          value: status,
          allowed: validStatuses
        },
        { status: 400 }
      )
    }

    // 4. 우선순위 검증
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH']
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { 
          error: "유효하지 않은 우선순위입니다",
          field: "priority",
          value: priority,
          allowed: validPriorities
        },
        { status: 400 }
      )
    }

    // 5. 기한 검증
    if (dueDate) {
      const due = new Date(dueDate)
      
      if (isNaN(due.getTime())) {
        return NextResponse.json(
          { 
            error: "유효하지 않은 날짜 형식입니다",
            field: "dueDate",
            value: dueDate,
            format: "YYYY-MM-DD or ISO 8601"
          },
          { status: 400 }
        )
      }

      // 과거 날짜 경고 (차단은 안함)
      const now = new Date()
      if (due < now) {
        console.warn(`[Tasks] Creating task with past due date: ${dueDate}`)
      }

      // 너무 먼 미래 (2년 이상) 경고
      const twoYearsLater = new Date()
      twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2)
      
      if (due > twoYearsLater) {
        return NextResponse.json(
          { 
            error: "기한은 2년 이내로 설정해주세요",
            field: "dueDate"
          },
          { status: 400 }
        )
      }
    }

    // 6. 담당자 검증
    if (assigneeId) {
      const member = await prisma.studyMember.findUnique({
        where: {
          studyId_userId: { studyId, userId: assigneeId }
        }
      })

      if (!member) {
        return NextResponse.json(
          { 
            error: "스터디 멤버가 아닌 사용자입니다",
            field: "assigneeId"
          },
          { status: 400 }
        )
      }

      if (member.role === 'PENDING') {
        return NextResponse.json(
          { 
            error: "승인 대기 중인 사용자에게는 할일을 할당할 수 없습니다",
            field: "assigneeId"
          },
          { status: 400 }
        )
      }

      if (member.deletedAt) {
        return NextResponse.json(
          { 
            error: "탈퇴한 사용자에게는 할일을 할당할 수 없습니다",
            field: "assigneeId"
          },
          { status: 400 }
        )
      }
    }

    // 7. 할일 생성
    const task = await prisma.task.create({
      data: {
        studyId,
        title: title.trim(),
        description: description?.trim() || '',
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || session.user.id,
        creatorId: session.user.id
      },
      include: {
        assignee: {
          select: { 
            id: true, 
            name: true, 
            avatar: true,
            email: true 
          }
        },
        creator: {
          select: { 
            id: true, 
            name: true, 
            avatar: true 
          }
        }
      }
    })

    // 8. 담당자에게 알림 (본인 제외)
    if (task.assigneeId !== session.user.id) {
      try {
        await prisma.notification.create({
          data: {
            userId: task.assigneeId,
            type: 'TASK_ASSIGNED',
            studyId,
            message: `새 할일이 할당되었습니다: ${task.title}`,
            relatedId: task.id
          }
        })
      } catch (notifError) {
        console.error('[Tasks] Failed to create notification:', notifError)
        // 알림 실패는 할일 생성에 영향 없음
      }
    }

    return NextResponse.json({
      success: true,
      message: "할일이 생성되었습니다",
      data: task
    }, { status: 201 })

  } catch (error) {
    console.error('Create task error:', error)
    
    // Prisma 에러 처리
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "이미 동일한 할일이 존재합니다" },
        { status: 409 }
      )
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "유효하지 않은 스터디 또는 사용자입니다" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "할일 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

### 2.2 클라이언트 유효성 검사

```javascript
// ✅ 좋은 예: 실시간 검증
const [formData, setFormData] = useState({
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
  assigneeId: ''
})
const [formErrors, setFormErrors] = useState({})

// 실시간 검증
const validateField = (field, value) => {
  const errors = { ...formErrors }

  switch (field) {
    case 'title':
      if (!value.trim()) {
        errors.title = '제목을 입력해주세요'
      } else if (value.length < 2) {
        errors.title = '제목은 2자 이상이어야 합니다'
      } else if (value.length > 100) {
        errors.title = `제목은 100자를 초과할 수 없습니다 (${value.length}/100)`
      } else {
        delete errors.title
      }
      break

    case 'description':
      if (value && value.length > 1000) {
        errors.description = `설명은 1,000자를 초과할 수 없습니다 (${value.length}/1000)`
      } else {
        delete errors.description
      }
      break

    case 'dueDate':
      if (value) {
        const due = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (isNaN(due.getTime())) {
          errors.dueDate = '유효하지 않은 날짜입니다'
        } else if (due < today) {
          errors.dueDate = '과거 날짜는 설정할 수 없습니다'
        } else {
          delete errors.dueDate
        }
      } else {
        delete errors.dueDate
      }
      break

    default:
      break
  }

  setFormErrors(errors)
  return Object.keys(errors).length === 0
}

// 입력 핸들러
const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }))
  validateField(field, value)
}

// 제출 전 최종 검증
const validateForm = () => {
  const errors = {}

  if (!formData.title.trim()) {
    errors.title = '제목을 입력해주세요'
  } else if (formData.title.length < 2) {
    errors.title = '제목은 2자 이상이어야 합니다'
  } else if (formData.title.length > 100) {
    errors.title = '제목은 100자를 초과할 수 없습니다'
  }

  if (formData.description && formData.description.length > 1000) {
    errors.description = '설명은 1,000자를 초과할 수 없습니다'
  }

  if (formData.dueDate) {
    const due = new Date(formData.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (isNaN(due.getTime())) {
      errors.dueDate = '유효하지 않은 날짜입니다'
    } else if (due < today) {
      errors.dueDate = '과거 날짜는 설정할 수 없습니다'
    }
  }

  setFormErrors(errors)
  return Object.keys(errors).length === 0
}

// 제출 핸들러
const handleSubmit = async (e) => {
  e.preventDefault()

  if (!validateForm()) {
    alert('입력 값을 확인해주세요')
    return
  }

  try {
    await createTaskMutation.mutateAsync({ 
      studyId, 
      data: {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim()
      }
    })
    
    alert('할일이 생성되었습니다')
    setShowModal(false)
    
    // 폼 초기화
    setFormData({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      assigneeId: ''
    })
    setFormErrors({})

  } catch (error) {
    console.error('할일 생성 실패:', error)
    
    const errorData = error.response?.data
    
    if (errorData?.field) {
      // 필드별 에러 표시
      setFormErrors({ [errorData.field]: errorData.error })
    } else {
      alert(errorData?.error || '할일 생성에 실패했습니다')
    }
  }
}
```

---

### 2.3 모달 UI

```javascript
// ✅ 좋은 예: 검증 메시지가 있는 모달
{showModal && (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <h2>{editingTask ? '할일 수정' : '할일 추가'}</h2>
        <button onClick={handleCloseModal} className={styles.closeButton}>
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 제목 */}
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            제목 <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`${styles.input} ${formErrors.title ? styles.error : ''}`}
            placeholder="할일 제목을 입력하세요"
            maxLength={100}
          />
          {formErrors.title && (
            <span className={styles.errorMessage}>{formErrors.title}</span>
          )}
          <span className={styles.charCount}>{formData.title.length}/100</span>
        </div>

        {/* 설명 */}
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            설명
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={`${styles.textarea} ${formErrors.description ? styles.error : ''}`}
            placeholder="할일에 대한 상세 설명을 입력하세요"
            rows={4}
            maxLength={1000}
          />
          {formErrors.description && (
            <span className={styles.errorMessage}>{formErrors.description}</span>
          )}
          <span className={styles.charCount}>{formData.description.length}/1000</span>
        </div>

        {/* 상태 */}
        <div className={styles.formGroup}>
          <label htmlFor="status" className={styles.label}>
            상태
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className={styles.select}
          >
            <option value="TODO">📝 할 일</option>
            <option value="IN_PROGRESS">🚀 진행 중</option>
            <option value="REVIEW">👀 검토</option>
            <option value="DONE">✅ 완료</option>
          </select>
        </div>

        {/* 우선순위 */}
        <div className={styles.formGroup}>
          <label htmlFor="priority" className={styles.label}>
            우선순위
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className={styles.select}
          >
            <option value="LOW">🟢 낮음</option>
            <option value="MEDIUM">🟡 보통</option>
            <option value="HIGH">🔴 높음</option>
          </select>
        </div>

        {/* 마감일 */}
        <div className={styles.formGroup}>
          <label htmlFor="dueDate" className={styles.label}>
            마감일
          </label>
          <input
            type="date"
            id="dueDate"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            className={`${styles.input} ${formErrors.dueDate ? styles.error : ''}`}
            min={new Date().toISOString().split('T')[0]}
          />
          {formErrors.dueDate && (
            <span className={styles.errorMessage}>{formErrors.dueDate}</span>
          )}
        </div>

        {/* 담당자 */}
        <div className={styles.formGroup}>
          <label htmlFor="assigneeId" className={styles.label}>
            담당자
          </label>
          <select
            id="assigneeId"
            value={formData.assigneeId}
            onChange={(e) => handleChange('assigneeId', e.target.value)}
            className={styles.select}
          >
            <option value="">나에게 할당</option>
            {members.map(member => (
              <option key={member.id} value={member.userId}>
                {member.user.name} ({member.role})
              </option>
            ))}
          </select>
        </div>

        {/* 버튼 */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleCloseModal}
            className={styles.cancelButton}
          >
            취소
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={createTaskMutation.isLoading}
          >
            {createTaskMutation.isLoading ? '저장 중...' : editingTask ? '수정' : '추가'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
```

---

## 상태 변경 예외

### 3.1 드래그 앤 드롭 상태 변경

```javascript
// ✅ 좋은 예: 낙관적 업데이트
const handleDragEnd = async (result) => {
  const { destination, source, draggableId } = result

  // 드롭 위치 없음
  if (!destination) return

  // 같은 위치
  if (destination.droppableId === source.droppableId && 
      destination.index === source.index) {
    return
  }

  const taskId = draggableId
  const newStatus = destination.droppableId

  // 낙관적 업데이트
  const previousTasks = queryClient.getQueryData(['studyTasks', studyId])

  queryClient.setQueryData(['studyTasks', studyId], (old) => ({
    ...old,
    data: old.data.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    )
  }))

  try {
    await updateTaskMutation.mutateAsync({
      studyId,
      taskId,
      data: { status: newStatus }
    })
  } catch (error) {
    // 롤백
    queryClient.setQueryData(['studyTasks', studyId], previousTasks)
    alert('상태 변경에 실패했습니다')
  }
}
```

---

### 3.2 상태 전환 규칙

```javascript
// ✅ 좋은 예: 상태 전환 검증
const canTransitionTo = (currentStatus, newStatus) => {
  const transitions = {
    'TODO': ['IN_PROGRESS', 'DONE'],
    'IN_PROGRESS': ['REVIEW', 'TODO', 'DONE'],
    'REVIEW': ['DONE', 'IN_PROGRESS'],
    'DONE': ['TODO'] // 재오픈
  }

  return transitions[currentStatus]?.includes(newStatus) || false
}

// API에서 사용
if (!canTransitionTo(task.status, newStatus)) {
  return NextResponse.json(
    { 
      error: `${task.status}에서 ${newStatus}(으)로 변경할 수 없습니다`,
      allowed: transitions[task.status]
    },
    { status: 400 }
  )
}
```

---

## 할일 수정 예외

### 3.1 권한 검증

#### API 권한 체크

```javascript
// src/app/api/studies/[id]/tasks/[taskId]/route.js
export async function PATCH(request, { params }) {
  const { id: studyId, taskId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session, member } = result

  try {
    // 할일 조회
    const task = await prisma.task.findUnique({
      where: { id: taskId, studyId }
    })

    if (!task) {
      return NextResponse.json(
        { error: "할일을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 권한 확인: OWNER, ADMIN이거나 담당자 본인
    const canEdit = 
      member.role === 'OWNER' ||
      member.role === 'ADMIN' ||
      task.assigneeId === session.user.id

    if (!canEdit) {
      return NextResponse.json(
        { 
          error: "수정 권한이 없습니다",
          message: "할일의 담당자이거나 관리자만 수정할 수 있습니다"
        },
        { status: 403 }
      )
    }

    // 수정 로직
    const body = await request.json()
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: body.title?.trim(),
        description: body.description?.trim(),
        status: body.status,
        priority: body.priority,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        assigneeId: body.assigneeId
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        creator: { select: { id: true, name: true, avatar: true } }
      }
    })

    return NextResponse.json({
      success: true,
      message: "할일이 수정되었습니다",
      data: updated
    })

  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json(
      { error: "할일 수정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

### 3.2 낙관적 업데이트

```javascript
// ✅ 좋은 예: 낙관적 업데이트 with 롤백
const updateTaskMutation = useMutation({
  mutationFn: (data) => api.patch(`/studies/${studyId}/tasks/${taskId}`, data),
  onMutate: async (newData) => {
    // 진행 중인 refetch 취소
    await queryClient.cancelQueries(['studyTasks', studyId])

    // 이전 데이터 백업
    const previousTasks = queryClient.getQueryData(['studyTasks', studyId])

    // 낙관적 업데이트
    queryClient.setQueryData(['studyTasks', studyId], (old) => ({
      ...old,
      data: old.data.map(task =>
        task.id === taskId ? { ...task, ...newData } : task
      )
    }))

    return { previousTasks }
  },
  onError: (err, newData, context) => {
    // 에러 시 롤백
    queryClient.setQueryData(['studyTasks', studyId], context.previousTasks)
    alert('할일 수정에 실패했습니다')
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['studyTasks', studyId])
  }
})

const handleEdit = async (taskId, updates) => {
  try {
    await updateTaskMutation.mutateAsync({ taskId, data: updates })
    alert('할일이 수정되었습니다')
  } catch (error) {
    console.error('수정 실패:', error)
  }
}
```

---

## 할일 삭제 예외

### 4.1 권한 검증 및 확인

```javascript
// ✅ 좋은 예: 삭제 전 확인
const handleDelete = async (taskId) => {
  const task = tasks.find(t => t.id === taskId)
  
  if (!task) {
    alert('할일을 찾을 수 없습니다')
    return
  }

  // 권한 체크 (클라이언트)
  const canDelete = 
    study.myRole === 'OWNER' ||
    (study.myRole === 'ADMIN' && task.creatorId === currentUser.id)

  if (!canDelete) {
    alert('삭제 권한이 없습니다\n관리자가 생성한 할일만 삭제할 수 있습니다')
    return
  }

  // 확인 대화상자
  const confirmed = confirm(
    `"${task.title}" 할일을 삭제하시겠습니까?\n\n` +
    `이 작업은 되돌릴 수 없습니다.`
  )

  if (!confirmed) return

  try {
    await deleteTaskMutation.mutateAsync({ studyId, taskId })
    alert('할일이 삭제되었습니다')
  } catch (error) {
    console.error('삭제 실패:', error)
    const errorMessage = error.response?.data?.error || '할일 삭제에 실패했습니다'
    alert(errorMessage)
  }
}
```

#### API 삭제 로직

```javascript
// src/app/api/studies/[id]/tasks/[taskId]/route.js
export async function DELETE(request, { params }) {
  const { id: studyId, taskId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session, member } = result

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId, studyId }
    })

    if (!task) {
      return NextResponse.json(
        { error: "할일을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 권한 확인: OWNER이거나 작성자 본인 (ADMIN)
    const canDelete = 
      member.role === 'OWNER' ||
      (member.role === 'ADMIN' && task.creatorId === session.user.id)

    if (!canDelete) {
      return NextResponse.json(
        { 
          error: "삭제 권한이 없습니다",
          message: "OWNER이거나 할일을 생성한 관리자만 삭제할 수 있습니다"
        },
        { status: 403 }
      )
    }

    // 소프트 삭제 (deletedAt 설정) 또는 하드 삭제
    await prisma.task.delete({
      where: { id: taskId }
    })

    return NextResponse.json({
      success: true,
      message: "할일이 삭제되었습니다"
    })

  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: "할일 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

## 상태 변경 예외

### 5.1 드래그 앤 드롭 상태 변경

```javascript
// ✅ 좋은 예: 낙관적 업데이트 with 드래그 앤 드롭
const handleDragEnd = async (result) => {
  const { destination, source, draggableId } = result

  // 드롭 위치 없음
  if (!destination) return

  // 같은 위치
  if (
    destination.droppableId === source.droppableId && 
    destination.index === source.index
  ) {
    return
  }

  const taskId = draggableId
  const newStatus = destination.droppableId

  // 낙관적 업데이트
  const previousTasks = queryClient.getQueryData(['studyTasks', studyId])

  queryClient.setQueryData(['studyTasks', studyId], (old) => ({
    ...old,
    data: old.data.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    )
  }))

  try {
    await updateTaskMutation.mutateAsync({
      studyId,
      taskId,
      data: { status: newStatus }
    })
  } catch (error) {
    // 롤백
    queryClient.setQueryData(['studyTasks', studyId], previousTasks)
    
    const errorMessage = error.response?.data?.error || '상태 변경에 실패했습니다'
    alert(errorMessage)
  }
}
```

---

### 5.2 상태 전환 규칙 검증

```javascript
// ✅ 좋은 예: 상태 전환 규칙
const stateTransitions = {
  'TODO': ['IN_PROGRESS', 'DONE'],
  'IN_PROGRESS': ['REVIEW', 'TODO', 'DONE'],
  'REVIEW': ['DONE', 'IN_PROGRESS', 'TODO'],
  'DONE': ['TODO'] // 재오픈
}

const canTransitionTo = (currentStatus, newStatus) => {
  return stateTransitions[currentStatus]?.includes(newStatus) || false
}

// API에서 사용
export async function PATCH(request, { params }) {
  // ...권한 검증

  const { status: newStatus } = await request.json()

  if (newStatus && newStatus !== task.status) {
    if (!canTransitionTo(task.status, newStatus)) {
      return NextResponse.json(
        { 
          error: `${task.status}에서 ${newStatus}(으)로 변경할 수 없습니다`,
          currentStatus: task.status,
          targetStatus: newStatus,
          allowedTransitions: stateTransitions[task.status]
        },
        { status: 400 }
      )
    }
  }

  // 상태 업데이트
  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus }
  })

  return NextResponse.json({ success: true, data: updated })
}
```

---

### 5.3 상태 변경 알림

```javascript
// ✅ 좋은 예: 상태 변경 시 담당자에게 알림
async function notifyStatusChange(task, oldStatus, newStatus, changedBy) {
  // 상태 변경한 사람이 담당자가 아니면 알림
  if (task.assigneeId !== changedBy) {
    try {
      await prisma.notification.create({
        data: {
          userId: task.assigneeId,
          type: 'TASK_STATUS_CHANGED',
          studyId: task.studyId,
          message: `할일 "${task.title}"의 상태가 ${oldStatus}에서 ${newStatus}(으)로 변경되었습니다`,
          relatedId: task.id
        }
      })
    } catch (error) {
      console.error('[notifyStatusChange] Failed:', error)
    }
  }
}
```

---

## 담당자 할당 예외

### 6.1 담당자 변경

```javascript
// ✅ 좋은 예: 담당자 변경 with 알림
const handleAssigneeChange = async (taskId, newAssigneeId) => {
  const task = tasks.find(t => t.id === taskId)
  
  if (!task) {
    alert('할일을 찾을 수 없습니다')
    return
  }

  // 권한 체크
  const canChangeAssignee = 
    study.myRole === 'OWNER' ||
    study.myRole === 'ADMIN' ||
    task.assigneeId === currentUser.id

  if (!canChangeAssignee) {
    alert('담당자를 변경할 권한이 없습니다')
    return
  }

  // 자기 자신에게 할당하는 경우 확인 없이 진행
  if (newAssigneeId === currentUser.id) {
    try {
      await updateTaskMutation.mutateAsync({
        taskId,
        data: { assigneeId: newAssigneeId }
      })
      return
    } catch (error) {
      alert('담당자 변경에 실패했습니다')
      return
    }
  }

  // 다른 사람에게 할당하는 경우 확인
  const newAssignee = members.find(m => m.userId === newAssigneeId)
  const confirmed = confirm(
    `이 할일을 ${newAssignee?.user.name}님에게 할당하시겠습니까?`
  )

  if (!confirmed) return

  try {
    await updateTaskMutation.mutateAsync({
      taskId,
      data: { assigneeId: newAssigneeId }
    })
    alert('담당자가 변경되었습니다')
  } catch (error) {
    alert(error.response?.data?.error || '담당자 변경에 실패했습니다')
  }
}
```

---

### 6.2 담당자 선택 UI

```javascript
// ✅ 좋은 예: 멤버 드롭다운
<select
  value={task.assigneeId}
  onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
  className={styles.assigneeSelect}
  disabled={!canChangeAssignee}
>
  {members
    .filter(m => m.role !== 'PENDING' && !m.deletedAt)
    .map(member => (
      <option key={member.userId} value={member.userId}>
        {member.user.name} 
        {member.role === 'OWNER' && ' 👑'}
        {member.role === 'ADMIN' && ' ⭐'}
      </option>
    ))}
</select>
```

---

## 칸반/리스트 뷰 예외

### 7.1 뷰 전환

```javascript
// ✅ 좋은 예: 뷰 상태 관리 with localStorage
const [viewType, setViewType] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`tasks_view_${studyId}`) || 'kanban'
  }
  return 'kanban'
})

useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`tasks_view_${studyId}`, viewType)
  }
}, [viewType, studyId])

// UI
<div className={styles.viewControls}>
  <div className={styles.viewToggle}>
    <button
      className={`${styles.viewButton} ${viewType === 'kanban' ? styles.active : ''}`}
      onClick={() => setViewType('kanban')}
      aria-label="칸반 보드로 보기"
    >
      <span className={styles.icon}>📊</span>
      <span className={styles.label}>칸반</span>
    </button>
    <button
      className={`${styles.viewButton} ${viewType === 'list' ? styles.active : ''}`}
      onClick={() => setViewType('list')}
      aria-label="리스트로 보기"
    >
      <span className={styles.icon}>📋</span>
      <span className={styles.label}>리스트</span>
    </button>
  </div>

  {/* 통계 */}
  <div className={styles.stats}>
    <span className={styles.statItem}>
      전체 {stats.total}개
    </span>
    <span className={styles.statItem}>
      완료 {stats.completionRate}%
    </span>
  </div>
</div>

{viewType === 'kanban' ? (
  <KanbanView 
    tasks={filteredTasks} 
    onDragEnd={handleDragEnd}
    onEdit={handleEdit}
    onDelete={handleDelete}
  />
) : (
  <ListView 
    tasks={filteredTasks}
    onEdit={handleEdit}
    onDelete={handleDelete}
    onStatusChange={handleStatusChange}
  />
)}
```

---

### 7.2 리스트 뷰 구현

```javascript
// ✅ 좋은 예: 테이블 형식 리스트
function ListView({ tasks, onEdit, onDelete, onStatusChange }) {
  return (
    <div className={styles.listView}>
      <table className={styles.taskTable}>
        <thead>
          <tr>
            <th>상태</th>
            <th>제목</th>
            <th>담당자</th>
            <th>우선순위</th>
            <th>마감일</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles.emptyRow}>
                할일이 없습니다
              </td>
            </tr>
          ) : (
            tasks.map(task => (
              <tr key={task.id} className={styles.taskRow}>
                <td>
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value)}
                    className={styles.statusSelect}
                  >
                    <option value="TODO">📝 할 일</option>
                    <option value="IN_PROGRESS">🚀 진행 중</option>
                    <option value="REVIEW">👀 검토</option>
                    <option value="DONE">✅ 완료</option>
                  </select>
                </td>
                <td>
                  <div className={styles.titleCell}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    {task.description && (
                      <span className={styles.taskDescription}>
                        {task.description.substring(0, 50)}
                        {task.description.length > 50 && '...'}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div className={styles.assigneeCell}>
                    {task.assignee?.avatar && (
                      <img 
                        src={task.assignee.avatar} 
                        alt={task.assignee.name}
                        className={styles.avatar}
                      />
                    )}
                    <span>{task.assignee?.name || '미할당'}</span>
                  </div>
                </td>
                <td>
                  <span className={`${styles.priority} ${styles[task.priority.toLowerCase()]}`}>
                    {task.priority === 'HIGH' && '🔴 높음'}
                    {task.priority === 'MEDIUM' && '🟡 보통'}
                    {task.priority === 'LOW' && '🟢 낮음'}
                  </span>
                </td>
                <td>
                  {task.dueDate ? (
                    <span className={
                      new Date(task.dueDate) < new Date() 
                        ? styles.overdue 
                        : styles.dueDate
                    }>
                      {formatDateTimeKST(task.dueDate, 'date')}
                    </span>
                  ) : (
                    <span className={styles.noDueDate}>없음</span>
                  )}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button 
                      onClick={() => onEdit(task)}
                      className={styles.editButton}
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => onDelete(task.id)}
                      className={styles.deleteButton}
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
```

---

## 필터링/정렬 예외

### 8.1 다중 필터링

```javascript
// ✅ 좋은 예: 다중 필터 조건
const [filters, setFilters] = useState({
  status: 'all',
  priority: 'all',
  assignee: 'all',
  showCompleted: true
})

const filteredTasks = useMemo(() => {
  return tasks.filter(task => {
    // 상태 필터
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false
    }

    // 우선순위 필터
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false
    }

    // 담당자 필터
    if (filters.assignee !== 'all' && task.assigneeId !== filters.assignee) {
      return false
    }

    // 완료된 할일 숨기기
    if (!filters.showCompleted && task.status === 'DONE') {
      return false
    }

    return true
  })
}, [tasks, filters])

// 필터 UI
<div className={styles.filters}>
  <select 
    value={filters.status}
    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
  >
    <option value="all">모든 상태</option>
    <option value="TODO">할 일</option>
    <option value="IN_PROGRESS">진행 중</option>
    <option value="REVIEW">검토</option>
    <option value="DONE">완료</option>
  </select>

  <select 
    value={filters.priority}
    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
  >
    <option value="all">모든 우선순위</option>
    <option value="HIGH">높음</option>
    <option value="MEDIUM">보통</option>
    <option value="LOW">낮음</option>
  </select>

  <select 
    value={filters.assignee}
    onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
  >
    <option value="all">모든 담당자</option>
    <option value={currentUser.id}>내 할일</option>
    {members.map(member => (
      <option key={member.userId} value={member.userId}>
        {member.user.name}
      </option>
    ))}
  </select>

  <label className={styles.checkboxLabel}>
    <input
      type="checkbox"
      checked={filters.showCompleted}
      onChange={(e) => setFilters(prev => ({ ...prev, showCompleted: e.target.checked }))}
    />
    완료된 할일 표시
  </label>
</div>
```

---

### 8.2 정렬

```javascript
// ✅ 좋은 예: 다중 정렬 옵션
const [sortBy, setSortBy] = useState('createdAt')
const [sortOrder, setSortOrder] = useState('desc')

const sortedTasks = useMemo(() => {
  const sorted = [...filteredTasks]

  sorted.sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'createdAt':
        comparison = new Date(a.createdAt) - new Date(b.createdAt)
        break
      case 'dueDate':
        // null은 마지막으로
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        comparison = new Date(a.dueDate) - new Date(b.dueDate)
        break
      case 'priority':
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
        break
      case 'title':
        comparison = a.title.localeCompare(b.title, 'ko')
        break
      case 'status':
        const statusOrder = { TODO: 1, IN_PROGRESS: 2, REVIEW: 3, DONE: 4 }
        comparison = statusOrder[a.status] - statusOrder[b.status]
        break
      default:
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  return sorted
}, [filteredTasks, sortBy, sortOrder])

// 정렬 UI
<div className={styles.sortControls}>
  <label>정렬 기준:</label>
  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
    <option value="createdAt">생성일</option>
    <option value="dueDate">마감일</option>
    <option value="priority">우선순위</option>
    <option value="title">제목</option>
    <option value="status">상태</option>
  </select>

  <button 
    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
    className={styles.sortOrderButton}
  >
    {sortOrder === 'asc' ? '↑ 오름차순' : '↓ 내림차순'}
  </button>
</div>
```

---

## 테스트 시나리오

### E2E 테스트

```javascript
// cypress/e2e/tasks.cy.js
describe('할일 관리', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password')
    cy.visit('/my-studies/1/tasks')
  })

  describe('할일 목록', () => {
    it('할일 목록을 표시한다', () => {
      cy.get('[data-testid="task-card"]').should('have.length.greaterThan', 0)
    })

    it('빈 상태를 표시한다', () => {
      // Mock empty tasks
      cy.intercept('GET', '/api/studies/1/tasks', { data: [] })
      cy.visit('/my-studies/1/tasks')
      cy.contains('아직 등록된 할일이 없습니다').should('be.visible')
    })
  })

  describe('할일 생성', () => {
    it('할일을 생성한다', () => {
      cy.get('[data-testid="create-task-button"]').click()
      cy.get('#title').type('새로운 할일')
      cy.get('#description').type('할일 설명')
      cy.get('#priority').select('HIGH')
      cy.get('button[type="submit"]').click()

      cy.contains('할일이 생성되었습니다').should('be.visible')
      cy.contains('새로운 할일').should('be.visible')
    })

    it('제목 없이 생성 시 에러를 표시한다', () => {
      cy.get('[data-testid="create-task-button"]').click()
      cy.get('button[type="submit"]').click()

      cy.contains('제목을 입력해주세요').should('be.visible')
    })
  })

  describe('상태 변경', () => {
    it('드래그 앤 드롭으로 상태를 변경한다', () => {
      cy.get('[data-taskid="task-1"]')
        .drag('[data-droppable="IN_PROGRESS"]')

      cy.get('[data-droppable="IN_PROGRESS"]')
        .should('contain', 'task-1의 제목')
    })
  })

  describe('뷰 전환', () => {
    it('칸반/리스트 뷰를 전환한다', () => {
      cy.contains('📋 리스트').click()
      cy.get('[data-testid="list-view"]').should('be.visible')

      cy.contains('📊 칸반').click()
      cy.get('[data-testid="kanban-view"]').should('be.visible')
    })
  })

  describe('권한 검증', () => {
    it('MEMBER는 다른 사람의 할일을 수정할 수 없다', () => {
      cy.login('member@example.com', 'password')
      cy.visit('/my-studies/1/tasks')

      // 다른 사람의 할일
      cy.get('[data-testid="task-2"]').within(() => {
        cy.get('[data-testid="edit-button"]').should('not.exist')
      })
    })

    it('ADMIN은 자신의 할일을 삭제할 수 있다', () => {
      cy.login('admin@example.com', 'password')
      cy.visit('/my-studies/1/tasks')

      cy.get('[data-testid="task-3"]').within(() => {
        cy.get('[data-testid="delete-button"]').click()
      })

      cy.contains('삭제하시겠습니까').should('be.visible')
      cy.contains('확인').click()
      cy.contains('할일이 삭제되었습니다').should('be.visible')
    })
  })
})
```

---

## 관련 문서

- [03-notices-exceptions.md](./03-notices-exceptions.md) - 공지사항 예외
- [05-files-exceptions.md](./05-files-exceptions.md) - 파일 관리 예외
- [06-calendar-exceptions.md](./06-calendar-exceptions.md) - 캘린더 예외
- [../studies/05-permissions-exceptions.md](../studies/05-permissions-exceptions.md) - 권한 예외

---

**다음 문서**: [05-files-exceptions.md](./05-files-exceptions.md)  
**이전 문서**: [03-notices-exceptions.md](./03-notices-exceptions.md)


