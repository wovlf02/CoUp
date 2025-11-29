# 권한 관리 예외 처리

**작성일**: 2025-11-29  
**카테고리**: 스터디 관리  
**우선순위**: 🔥 높음

---

## 📋 목차

- [개요](#개요)
- [권한 부족](#권한-부족)
- [OWNER 전용 기능](#owner-전용-기능)
- [ADMIN 전용 기능](#admin-전용-기능)
- [멤버십 검증](#멤버십-검증)
- [소유권 이전](#소유권-이전)

---

## 개요

스터디 내 역할별 권한 관리 및 검증을 다룹니다.

### 역할 계층

```
OWNER (레벨 3)
  ├─ 모든 권한
  ├─ 스터디 삭제
  ├─ 소유권 이전
  └─ ADMIN 임명

ADMIN (레벨 2)
  ├─ 멤버 관리 (MEMBER만)
  ├─ 콘텐츠 관리
  └─ 설정 일부

MEMBER (레벨 1)
  ├─ 콘텐츠 읽기
  ├─ 댓글 작성
  └─ 파일 업로드
```

---

## 권한 부족

### ✅ requireStudyMember 헬퍼

```javascript
// src/lib/auth-helpers.js
export async function requireStudyMember(studyId, requiredRole = 'MEMBER') {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다" },
      { status: 401 }
    )
  }

  const member = await prisma.studyMember.findUnique({
    where: {
      studyId_userId: {
        studyId,
        userId: session.user.id
      }
    }
  })

  if (!member) {
    return NextResponse.json(
      { error: "스터디 멤버가 아닙니다" },
      { status: 403 }
    )
  }

  if (member.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: "활성 멤버가 아닙니다" },
      { status: 403 }
    )
  }

  const roleHierarchy = {
    'MEMBER': 1,
    'ADMIN': 2,
    'OWNER': 3
  }

  if ((roleHierarchy[member.role] || 0) < (roleHierarchy[requiredRole] || 0)) {
    return NextResponse.json(
      { error: `${requiredRole === 'OWNER' ? '스터디장' : '관리자'} 권한이 필요합니다` },
      { status: 403 }
    )
  }

  return { session, member }
}
```

---

## OWNER 전용 기능

### 권한 체크

```javascript
// 스터디 삭제
export async function DELETE(request, { params }) {
  const result = await requireStudyMember(params.id, 'OWNER')
  if (result instanceof NextResponse) return result
  // ...
}

// 스터디 수정
export async function PATCH(request, { params }) {
  const result = await requireStudyMember(params.id, 'OWNER')
  if (result instanceof NextResponse) return result
  // ...
}

// 역할 변경
export async function PATCH(request, { params }) {
  const result = await requireStudyMember(params.studyId, 'OWNER')
  if (result instanceof NextResponse) return result
  // ...
}
```

---

## ADMIN 전용 기능

### 멤버 제거

```javascript
export async function DELETE(request, { params }) {
  const { studyId, userId } = await params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  const { session, member: currentMember } = result

  // ADMIN은 MEMBER만 제거 가능
  const targetMember = await prisma.studyMember.findUnique({
    where: {
      studyId_userId: { studyId, userId }
    }
  })

  if (!targetMember) {
    return NextResponse.json(
      { error: "멤버를 찾을 수 없습니다" },
      { status: 404 }
    )
  }

  // OWNER 제거 불가
  if (targetMember.role === 'OWNER') {
    return NextResponse.json(
      { error: "스터디장을 강퇴할 수 없습니다" },
      { status: 400 }
    )
  }

  // ADMIN은 다른 ADMIN 제거 불가
  if (currentMember.role === 'ADMIN' && targetMember.role === 'ADMIN') {
    return NextResponse.json(
      { error: "다른 관리자를 강퇴할 수 없습니다" },
      { status: 403 }
    )
  }

  // 강퇴 처리...
}
```

---

## 멤버십 검증

### 클라이언트 권한 확인

```javascript
// src/hooks/useStudyPermissions.js
export function useStudyPermissions(studyId) {
  const { data: study } = useStudy(studyId)
  const { data: session } = useSession()

  const isOwner = study?.myRole === 'OWNER'
  const isAdmin = study?.myRole === 'ADMIN'
  const isMember = study?.myRole === 'MEMBER'
  const isStaff = isOwner || isAdmin

  const canDelete = isOwner
  const canEdit = isOwner
  const canManageMembers = isStaff
  const canKickMember = (targetRole) => {
    if (isOwner) return targetRole !== 'OWNER'
    if (isAdmin) return targetRole === 'MEMBER'
    return false
  }
  const canChangeRole = isOwner
  const canManageContent = isStaff
  const canUploadFiles = isMember || isStaff

  return {
    isOwner,
    isAdmin,
    isMember,
    isStaff,
    canDelete,
    canEdit,
    canManageMembers,
    canKickMember,
    canChangeRole,
    canManageContent,
    canUploadFiles
  }
}

// 사용 예
function StudySettings({ studyId }) {
  const permissions = useStudyPermissions(studyId)

  if (!permissions.canEdit) {
    return <div>권한이 없습니다</div>
  }

  return <SettingsForm />
}
```

---

## 소유권 이전

### ✅ 소유권 이전 API

```javascript
// src/app/api/studies/[id]/transfer-ownership/route.js
export async function POST(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId, 'OWNER')
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    const { newOwnerId } = await request.json()

    // 1. 대상 확인
    if (!newOwnerId) {
      return NextResponse.json(
        { error: "새 스터디장을 선택해주세요" },
        { status: 400 }
      )
    }

    if (newOwnerId === session.user.id) {
      return NextResponse.json(
        { error: "자기 자신에게 소유권을 이전할 수 없습니다" },
        { status: 400 }
      )
    }

    // 2. 멤버 확인
    const newOwner = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId: newOwnerId
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!newOwner || newOwner.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: "활성 멤버에게만 소유권을 이전할 수 있습니다" },
        { status: 400 }
      )
    }

    // 3. 트랜잭션으로 소유권 이전
    await prisma.$transaction(async (tx) => {
      // 현재 OWNER → ADMIN
      await tx.studyMember.update({
        where: {
          studyId_userId: {
            studyId,
            userId: session.user.id
          }
        },
        data: {
          role: 'ADMIN'
        }
      })

      // 새 OWNER
      await tx.studyMember.update({
        where: {
          studyId_userId: {
            studyId,
            userId: newOwnerId
          }
        },
        data: {
          role: 'OWNER'
        }
      })

      // Study.ownerId 업데이트
      await tx.study.update({
        where: { id: studyId },
        data: {
          ownerId: newOwnerId
        }
      })

      // 알림
      await tx.notification.create({
        data: {
          userId: newOwnerId,
          type: 'OWNER_TRANSFERRED',
          studyId,
          message: `스터디장이 되었습니다`
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: `${newOwner.user.name}님에게 소유권을 이전했습니다`
    })

  } catch (error) {
    console.error('Transfer ownership error:', error)
    return NextResponse.json(
      { error: "소유권 이전 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

### 클라이언트

```javascript
function TransferOwnershipButton({ studyId }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const { data: members } = useStudyMembers(studyId)
  const transferMutation = useTransferOwnership(studyId)

  const eligibleMembers = members?.filter(m => 
    m.role !== 'OWNER' && m.status === 'ACTIVE'
  ) || []

  const handleTransfer = async () => {
    if (!selectedMember) return

    try {
      await transferMutation.mutateAsync(selectedMember.userId)
      toast.success('소유권이 이전되었습니다')
      setShowModal(false)
    } catch (error) {
      toast.error(error.message || '소유권 이전에 실패했습니다')
    }
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className="btn-warning">
        소유권 이전
      </button>

      {showModal && (
        <Modal title="소유권 이전" onClose={() => setShowModal(false)}>
          <p className="warning">
            ⚠️ 소유권을 이전하면 당신은 관리자로 변경됩니다.
          </p>

          <label>새 스터디장 선택</label>
          <select
            value={selectedMember?.userId || ''}
            onChange={(e) => {
              const member = eligibleMembers.find(m => m.userId === e.target.value)
              setSelectedMember(member)
            }}
          >
            <option value="">선택하세요</option>
            {eligibleMembers.map(member => (
              <option key={member.userId} value={member.userId}>
                {member.user.name} ({member.role === 'ADMIN' ? '관리자' : '멤버'})
              </option>
            ))}
          </select>

          <div className="actions">
            <button onClick={() => setShowModal(false)}>취소</button>
            <button 
              onClick={handleTransfer}
              disabled={!selectedMember || transferMutation.isLoading}
              className="btn-warning"
            >
              {transferMutation.isLoading ? '처리 중...' : '이전하기'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
```

---

## 관련 문서

- [INDEX](./INDEX.md)
- [02-member-management-exceptions.md](./02-member-management-exceptions.md)

---

**다음 문서**: [검색/필터 예외 처리](./06-search-filter-exceptions.md)

