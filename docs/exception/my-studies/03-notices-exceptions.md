# 공지사항 예외 처리

**작성일**: 2025-11-29  
**최종 업데이트**: 2025-11-29  
**대상 파일**: 
- `src/app/my-studies/[studyId]/notices/page.jsx`
- `src/app/api/studies/[id]/notices/route.js`
- `src/components/studies/NoticeCreateEditModal.jsx`

---

## 📚 목차

1. [개요](#개요)
2. [공지 목록 예외](#공지-목록-예외)
3. [공지 작성 예외](#공지-작성-예외)
4. [공지 수정/삭제 예외](#공지-수정삭제-예외)
5. [고정 공지 처리](#고정-공지-처리)
6. [권한 검증 예외](#권한-검증-예외)
7. [검색/필터링 예외](#검색필터링-예외)
8. [알림 생성 예외](#알림-생성-예외)

---

## 개요

### 기능 설명

**공지사항(Notices)**은 스터디 관리자(ADMIN, OWNER)가 멤버들에게 **중요한 정보를 공유**하는 기능입니다.

### 주요 기능

1. **공지 목록 조회**: 전체, 고정, 중요 공지
2. **공지 작성**: ADMIN+ 권한 (제목, 내용, 고정, 중요 표시)
3. **공지 수정/삭제**: 작성자 또는 OWNER
4. **고정 공지**: 상단 고정 (최대 3개)
5. **검색/필터링**: 제목/내용 검색
6. **알림**: 새 공지 시 멤버들에게 알림

### 권한 구조

| 작업 | MEMBER | ADMIN | OWNER |
|------|--------|-------|-------|
| 목록 조회 | ✅ | ✅ | ✅ |
| 작성 | ❌ | ✅ | ✅ |
| 수정 | ❌ | 본인 글만 | 모두 |
| 삭제 | ❌ | 본인 글만 | 모두 |
| 고정/중요 | ❌ | ✅ | ✅ |

---

## 공지 목록 예외

### 1.1 API 호출 실패

#### 현재 코드

```javascript
const { data: noticesData, isLoading: noticesLoading } = useNotices(studyId)
const notices = noticesData?.data || []

if (noticesLoading) {
  return <div className={styles.loading}>공지사항을 불러오는 중...</div>
}
```

#### 개선 코드

```javascript
// ✅ 좋은 예: 에러 처리 추가
const { 
  data: noticesData, 
  isLoading: noticesLoading, 
  error: noticesError,
  refetch 
} = useNotices(studyId)

if (noticesLoading) {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner}></div>
      <p>공지사항을 불러오는 중...</p>
    </div>
  )
}

if (noticesError) {
  return (
    <div className={styles.error}>
      <div className={styles.errorIcon}>⚠️</div>
      <h3>공지사항을 불러올 수 없습니다</h3>
      <p>{noticesError.message || '다시 시도해주세요'}</p>
      <button onClick={() => refetch()} className={styles.retryButton}>
        🔄 다시 시도
      </button>
    </div>
  )
}

const notices = noticesData?.data || []
```

---

### 1.2 빈 공지 상태

```javascript
// ✅ 좋은 예: 역할별 빈 상태 메시지
{notices.length === 0 ? (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>📢</div>
    <h3>아직 공지사항이 없습니다</h3>
    {canEdit() ? (
      <>
        <p>첫 번째 공지사항을 작성해보세요</p>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className={styles.createButton}
        >
          공지 작성하기
        </button>
      </>
    ) : (
      <p>관리자가 공지를 작성하면 여기에 표시됩니다</p>
    )}
  </div>
) : (
  // 공지 목록
)}
```

---

### 1.3 고정 공지와 일반 공지 분리

```javascript
// ✅ 좋은 예: 고정 공지 우선 표시
const pinnedNotices = notices.filter(n => n.isPinned)
const regularNotices = notices.filter(n => !n.isPinned)

return (
  <>
    {/* 고정 공지 */}
    {pinnedNotices.length > 0 && (
      <div className={styles.pinnedSection}>
        <h3 className={styles.sectionTitle}>📌 고정 공지</h3>
        {pinnedNotices.map(notice => (
          <NoticeCard key={notice.id} notice={notice} isPinned />
        ))}
      </div>
    )}

    {/* 일반 공지 */}
    <div className={styles.noticesSection}>
      {regularNotices.length > 0 ? (
        regularNotices.map(notice => (
          <NoticeCard key={notice.id} notice={notice} />
        ))
      ) : pinnedNotices.length > 0 ? (
        <p className={styles.infoText}>일반 공지가 없습니다</p>
      ) : null}
    </div>
  </>
)
```

---

## 공지 작성 예외

### 2.1 권한 부족

#### API 권한 검증

```javascript
// src/app/api/studies/[id]/notices/route.js
export async function POST(request, { params }) {
  const { id: studyId } = await params

  // ADMIN 이상 권한 필요
  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  const { session, member } = result

  // ...
}
```

#### 클라이언트 권한 체크

```javascript
// ✅ 좋은 예: 작성 버튼 조건부 렌더링
const canEdit = () => {
  return study?.myRole && ['OWNER', 'ADMIN'].includes(study.myRole)
}

{canEdit() ? (
  <button 
    onClick={() => setIsModalOpen(true)} 
    className={styles.createButton}
  >
    + 공지 작성
  </button>
) : null}
```

---

### 2.2 유효성 검사 오류

#### 서버 측 검증

```javascript
// ✅ 좋은 예: 상세한 유효성 검사
export async function POST(request, { params }) {
  const { id: studyId } = await params
  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    const body = await request.json()
    const { title, content, isPinned, isImportant } = body

    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json(
        { error: "제목과 내용을 입력해주세요" },
        { status: 400 }
      )
    }

    // 제목 길이 검증
    if (title.length < 2) {
      return NextResponse.json(
        { error: "제목은 2자 이상이어야 합니다" },
        { status: 400 }
      )
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: "제목은 100자를 초과할 수 없습니다" },
        { status: 400 }
      )
    }

    // 내용 길이 검증
    if (content.length < 5) {
      return NextResponse.json(
        { error: "내용은 5자 이상이어야 합니다" },
        { status: 400 }
      )
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { error: "내용은 10,000자를 초과할 수 없습니다" },
        { status: 400 }
      )
    }

    // 고정 공지 개수 제한 (최대 3개)
    if (isPinned) {
      const pinnedCount = await prisma.notice.count({
        where: {
          studyId,
          isPinned: true
        }
      })

      if (pinnedCount >= 3) {
        return NextResponse.json(
          { error: "고정 공지는 최대 3개까지 설정할 수 있습니다" },
          { status: 400 }
        )
      }
    }

    // 공지 생성
    const notice = await prisma.notice.create({
      data: {
        studyId,
        authorId: session.user.id,
        title,
        content,
        isPinned: isPinned || false,
        isImportant: isImportant || false
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        }
      }
    })

    // 알림 생성 (별도 섹션 참조)
    await createNoticeNotifications(studyId, session.user.id, notice)

    return NextResponse.json({
      success: true,
      message: "공지사항이 작성되었습니다",
      data: notice
    }, { status: 201 })

  } catch (error) {
    console.error('Create notice error:', error)
    return NextResponse.json(
      { error: "공지사항 작성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

### 2.3 클라이언트 측 유효성 검사

```javascript
// ✅ 좋은 예: 즉시 피드백
const [formData, setFormData] = useState({ title: '', content: '' })
const [errors, setErrors] = useState({})

const validateForm = () => {
  const newErrors = {}

  if (!formData.title.trim()) {
    newErrors.title = '제목을 입력해주세요'
  } else if (formData.title.length < 2) {
    newErrors.title = '제목은 2자 이상이어야 합니다'
  } else if (formData.title.length > 100) {
    newErrors.title = '제목은 100자를 초과할 수 없습니다'
  }

  if (!formData.content.trim()) {
    newErrors.content = '내용을 입력해주세요'
  } else if (formData.content.length < 5) {
    newErrors.content = '내용은 5자 이상이어야 합니다'
  } else if (formData.content.length > 10000) {
    newErrors.content = '내용은 10,000자를 초과할 수 없습니다'
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async (e) => {
  e.preventDefault()

  if (!validateForm()) return

  try {
    await createNotice.mutateAsync({ studyId, data: formData })
    alert('공지가 작성되었습니다')
    setIsModalOpen(false)
    setFormData({ title: '', content: '' })
    setErrors({})
  } catch (error) {
    console.error('공지 작성 실패:', error)
    alert(error.response?.data?.error || '공지 작성에 실패했습니다')
  }
}
```

---

## 공지 수정/삭제 예외

### 3.1 권한 검증

#### API 권한 체크

```javascript
// src/app/api/studies/[id]/notices/[noticeId]/route.js
export async function PATCH(request, { params }) {
  const { id: studyId, noticeId } = await params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  const { session, member } = result

  try {
    // 공지 조회
    const notice = await prisma.notice.findUnique({
      where: { id: noticeId, studyId }
    })

    if (!notice) {
      return NextResponse.json(
        { error: "공지사항을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 권한 확인: 작성자이거나 OWNER
    const isOwner = member.role === 'OWNER'
    const isAuthor = notice.authorId === session.user.id

    if (!isOwner && !isAuthor) {
      return NextResponse.json(
        { error: "수정 권한이 없습니다" },
        { status: 403 }
      )
    }

    // 수정 로직
    const body = await request.json()
    const updated = await prisma.notice.update({
      where: { id: noticeId },
      data: {
        title: body.title,
        content: body.content,
        isPinned: body.isPinned,
        isImportant: body.isImportant
      }
    })

    return NextResponse.json({
      success: true,
      message: "공지사항이 수정되었습니다",
      data: updated
    })

  } catch (error) {
    console.error('Update notice error:', error)
    return NextResponse.json(
      { error: "공지사항 수정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

### 3.2 낙관적 업데이트

```javascript
// ✅ 좋은 예: 낙관적 업데이트 with 롤백
const updateNotice = useMutation({
  mutationFn: (data) => api.patch(`/studies/${studyId}/notices/${noticeId}`, data),
  onMutate: async (newData) => {
    // 진행 중인 refetch 취소
    await queryClient.cancelQueries(['notices', studyId])

    // 이전 데이터 백업
    const previousNotices = queryClient.getQueryData(['notices', studyId])

    // 낙관적 업데이트
    queryClient.setQueryData(['notices', studyId], (old) => ({
      ...old,
      data: old.data.map(notice =>
        notice.id === noticeId ? { ...notice, ...newData } : notice
      )
    }))

    return { previousNotices }
  },
  onError: (err, newData, context) => {
    // 에러 시 롤백
    queryClient.setQueryData(['notices', studyId], context.previousNotices)
    alert('공지 수정에 실패했습니다')
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['notices', studyId])
  }
})
```

---

## 고정 공지 처리

### 4.1 고정 공지 개수 제한

#### API 제한

```javascript
// ✅ 좋은 예: 고정 공지 개수 확인
if (isPinned) {
  const pinnedCount = await prisma.notice.count({
    where: {
      studyId,
      isPinned: true,
      id: { not: noticeId } // 수정 시 자기 자신 제외
    }
  })

  if (pinnedCount >= 3) {
    return NextResponse.json(
      { 
        error: "고정 공지는 최대 3개까지 설정할 수 있습니다",
        suggestion: "다른 고정 공지를 해제한 후 다시 시도해주세요"
      },
      { status: 400 }
    )
  }
}
```

---

### 4.2 고정 토글

```javascript
// ✅ 좋은 예: 안전한 토글
const handleTogglePin = async (noticeId) => {
  const notice = notices.find(n => n.id === noticeId)
  const willBePinned = !notice.isPinned

  // 고정하려는데 이미 3개면 경고
  if (willBePinned) {
    const pinnedCount = notices.filter(n => n.isPinned).length
    if (pinnedCount >= 3) {
      alert('고정 공지는 최대 3개까지 설정할 수 있습니다\n다른 고정 공지를 해제한 후 다시 시도해주세요')
      return
    }
  }

  try {
    await togglePin.mutateAsync({ studyId, noticeId })
  } catch (error) {
    console.error('고정 토글 실패:', error)
    alert(error.response?.data?.error || '고정 처리에 실패했습니다')
  }
}
```

---

## 권한 검증 예외

### 5.1 권한별 버튼 표시

```javascript
// ✅ 좋은 예: 권한별 UI
const canEdit = () => {
  return ['OWNER', 'ADMIN'].includes(study.myRole)
}

const canEditNotice = (notice) => {
  return study.myRole === 'OWNER' || notice.authorId === currentUser?.id
}

// 공지 카드 내
<div className={styles.noticeActions}>
  {canEditNotice(notice) && (
    <>
      <button onClick={() => handleEdit(notice)}>
        ✏️ 수정
      </button>
      <button onClick={() => handleDelete(notice.id)}>
        🗑️ 삭제
      </button>
    </>
  )}
  {canEdit() && (
    <button onClick={() => handleTogglePin(notice.id)}>
      {notice.isPinned ? '📌 고정 해제' : '📌 고정'}
    </button>
  )}
</div>
```

---

## 검색/필터링 예외

### 6.1 검색 구현

```javascript
// ✅ 좋은 예: 클라이언트 측 검색
const [searchKeyword, setSearchKeyword] = useState('')

const filteredNotices = useMemo(() => {
  if (!searchKeyword.trim()) return notices

  const keyword = searchKeyword.toLowerCase()
  return notices.filter(notice =>
    notice.title.toLowerCase().includes(keyword) ||
    notice.content.toLowerCase().includes(keyword)
  )
}, [notices, searchKeyword])

// UI
<input
  type="text"
  placeholder="제목이나 내용으로 검색..."
  value={searchKeyword}
  onChange={(e) => setSearchKeyword(e.target.value)}
  className={styles.searchInput}
/>
```

---

## 알림 생성 예외

### 7.1 대량 알림 생성

```javascript
// ✅ 좋은 예: 트랜잭션으로 안전하게
async function createNoticeNotifications(studyId, authorId, notice) {
  try {
    // 활성 멤버 조회 (작성자 제외)
    const members = await prisma.studyMember.findMany({
      where: {
        studyId,
        role: { not: 'PENDING' },
        deletedAt: null,
        userId: { not: authorId }
      },
      select: { userId: true }
    })

    if (members.length === 0) {
      console.log('[createNoticeNotifications] No members to notify')
      return
    }

    // 스터디 정보 조회
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { name: true, emoji: true }
    })

    // 알림 일괄 생성 (트랜잭션)
    await prisma.$transaction(async (tx) => {
      await tx.notification.createMany({
        data: members.map(member => ({
          userId: member.userId,
          type: 'NOTICE',
          studyId,
          studyName: study.name,
          studyEmoji: study.emoji,
          message: `새 공지사항: ${notice.title.substring(0, 50)}${notice.title.length > 50 ? '...' : ''}`,
          relatedId: notice.id
        }))
      })
    })

    console.log(`[createNoticeNotifications] Created ${members.length} notifications`)

  } catch (error) {
    console.error('[createNoticeNotifications] Error:', error)
    // 알림 생성 실패는 공지 작성에 영향 없음
  }
}
```

---

## 관련 문서

- [02-study-detail-exceptions.md](./02-study-detail-exceptions.md) - 스터디 대시보드
- [04-tasks-exceptions.md](./04-tasks-exceptions.md) - 할일 예외
- [../studies/05-permissions-exceptions.md](../studies/05-permissions-exceptions.md) - 권한 예외

---

**다음 문서**: [04-tasks-exceptions.md](./04-tasks-exceptions.md)  
**이전 문서**: [02-study-detail-exceptions.md](./02-study-detail-exceptions.md)

