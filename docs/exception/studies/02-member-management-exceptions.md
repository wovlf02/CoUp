# 멤버 관리 예외 처리

**작성일**: 2025-11-29  
**카테고리**: 스터디 관리  
**우선순위**: 🔥 높음

---

## 📋 목차

- [개요](#개요)
- [멤버 목록 조회 실패](#멤버-목록-조회-실패)
- [멤버 제거 실패](#멤버-제거-실패)
- [역할 변경 실패](#역할-변경-실패)
- [멤버 초대 실패](#멤버-초대-실패)
- [권한 검증 오류](#권한-검증-오류)
- [디버깅 가이드](#디버깅-가이드)

---

## 개요

스터디 멤버 관리 시 발생할 수 있는 모든 예외 상황과 해결 방법을 다룹니다.

### 관련 파일

- **API**: `src/app/api/studies/[id]/members/route.js`
- **API**: `src/app/api/studies/[id]/members/[userId]/route.js`
- **API**: `src/app/api/studies/[id]/members/[userId]/role/route.js`
- **API**: `src/app/api/studies/[id]/invite/route.js`

### 역할 권한 정리

| 역할 | 멤버 조회 | 멤버 추가 | 멤버 제거 | 역할 변경 | OWNER 변경 |
|------|-----------|-----------|-----------|-----------|------------|
| **OWNER** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **ADMIN** | ✅ | ✅ | ✅ (MEMBER만) | ❌ | ❌ |
| **MEMBER** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 멤버 목록 조회 실패

### 문제 1: 권한 없이 멤버 목록 조회

#### ❌ 나쁜 예

```javascript
// src/app/api/studies/[id]/members/route.js
export async function GET(request, { params }) {
  const { id: studyId } = await params
  
  // 권한 확인 없음
  const members = await prisma.studyMember.findMany({
    where: { studyId }
  })
  
  return NextResponse.json(members)
}
```

**문제점**:
- 비회원도 멤버 목록 조회 가능
- 개인정보 노출 위험

#### ✅ 좋은 예

```javascript
// src/app/api/studies/[id]/members/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const { id: studyId } = await params

  // 1. 멤버십 확인 (MEMBER 이상 필요)
  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // OWNER | ADMIN | MEMBER
    const status = searchParams.get('status') || 'ACTIVE'

    // 2. where 조건
    const whereClause = {
      studyId,
      status
    }

    if (role && ['OWNER', 'ADMIN', 'MEMBER'].includes(role)) {
      whereClause.role = role
    }

    // 3. 멤버 목록 조회
    const members = await prisma.studyMember.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true
          }
        }
      },
      orderBy: [
        { role: 'desc' }, // OWNER > ADMIN > MEMBER
        { joinedAt: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: members.map(m => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        status: m.status,
        user: m.user,
        joinedAt: m.joinedAt,
        approvedAt: m.approvedAt
      }))
    })

  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      { error: "멤버 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

**개선 사항**:
- ✅ 멤버십 필수 확인
- ✅ 역할/상태별 필터링
- ✅ 정렬 (역할 우선)
- ✅ 개인정보 선택적 노출

---

### 문제 2: 클라이언트에서 로딩/에러 처리 누락

#### ❌ 나쁜 예

```javascript
// 컴포넌트
function MemberList({ studyId }) {
  const { data } = useStudyMembers(studyId)
  
  return (
    <ul>
      {data.map(member => (
        <li key={member.id}>{member.user.name}</li>
      ))}
    </ul>
  )
}
```

**문제점**:
- 로딩 상태 없음
- 에러 처리 없음
- 빈 상태 처리 없음

#### ✅ 좋은 예

```javascript
// src/components/studies/MemberList.jsx
'use client'

import { useStudyMembers } from '@/lib/hooks/useApi'
import { toast } from 'react-hot-toast'
import styles from './MemberList.module.css'

function MemberList({ studyId, currentUserRole }) {
  const { data, isLoading, error, refetch } = useStudyMembers(studyId)

  // 1. 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.skeleton}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.skeletonItem} />
          ))}
        </div>
      </div>
    )
  }

  // 2. 에러 상태
  if (error) {
    return (
      <div className={styles.error}>
        <p>멤버 목록을 불러올 수 없습니다</p>
        <button onClick={() => refetch()}>다시 시도</button>
      </div>
    )
  }

  // 3. 빈 상태
  if (!data || data.length === 0) {
    return (
      <div className={styles.empty}>
        <p>아직 멤버가 없습니다</p>
      </div>
    )
  }

  // 4. 역할별 그룹화
  const owner = data.find(m => m.role === 'OWNER')
  const admins = data.filter(m => m.role === 'ADMIN')
  const members = data.filter(m => m.role === 'MEMBER')

  return (
    <div className={styles.container}>
      <h3>멤버 ({data.length}명)</h3>

      {/* OWNER */}
      {owner && (
        <div className={styles.section}>
          <h4>👑 스터디장</h4>
          <MemberCard member={owner} currentUserRole={currentUserRole} />
        </div>
      )}

      {/* ADMIN */}
      {admins.length > 0 && (
        <div className={styles.section}>
          <h4>🔧 관리자 ({admins.length})</h4>
          {admins.map(admin => (
            <MemberCard 
              key={admin.id} 
              member={admin} 
              currentUserRole={currentUserRole}
            />
          ))}
        </div>
      )}

      {/* MEMBER */}
      {members.length > 0 && (
        <div className={styles.section}>
          <h4>👥 멤버 ({members.length})</h4>
          {members.map(member => (
            <MemberCard 
              key={member.id} 
              member={member} 
              currentUserRole={currentUserRole}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MemberCard({ member, currentUserRole }) {
  const canManage = ['OWNER', 'ADMIN'].includes(currentUserRole)

  return (
    <div className={styles.card}>
      <img src={member.user.avatar || '/default-avatar.png'} alt="" />
      <div className={styles.info}>
        <h5>{member.user.name}</h5>
        <p>{member.user.bio || '소개가 없습니다'}</p>
        <small>가입일: {new Date(member.joinedAt).toLocaleDateString()}</small>
      </div>
      {canManage && member.role !== 'OWNER' && (
        <MemberActions member={member} currentUserRole={currentUserRole} />
      )}
    </div>
  )
}

export default MemberList
```

**개선 사항**:
- ✅ 로딩 스켈레톤
- ✅ 에러 처리 및 재시도
- ✅ 빈 상태 처리
- ✅ 역할별 그룹화
- ✅ 권한에 따른 액션 표시

---

## 멤버 제거 실패

### 문제 1: 권한 검증 누락

#### ❌ 나쁜 예

```javascript
// src/app/api/studies/[id]/members/[userId]/route.js
export async function DELETE(request, { params }) {
  const { studyId, userId } = await params
  
  // 권한 확인 없음
  await prisma.studyMember.delete({
    where: { studyId_userId: { studyId, userId } }
  })
  
  return NextResponse.json({ success: true })
}
```

**문제점**:
- 누구나 멤버 제거 가능
- OWNER도 제거 가능
- 본인 제거 가능

#### ✅ 좋은 예

```javascript
// src/app/api/studies/[id]/members/[userId]/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function DELETE(request, { params }) {
  const { id: studyId, userId } = await params

  // 1. ADMIN 이상 권한 필요
  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  const { session, member: currentMember } = result

  try {
    // 2. 자기 자신 강퇴 불가
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "자기 자신을 강퇴할 수 없습니다" },
        { status: 400 }
      )
    }

    // 3. 대상 멤버 조회
    const targetMember = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        study: {
          select: {
            name: true,
            emoji: true
          }
        }
      }
    })

    if (!targetMember) {
      return NextResponse.json(
        { error: "멤버를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 4. OWNER는 강퇴 불가
    if (targetMember.role === 'OWNER') {
      return NextResponse.json(
        { error: "스터디장을 강퇴할 수 없습니다" },
        { status: 400 }
      )
    }

    // 5. ADMIN은 다른 ADMIN을 강퇴할 수 없음 (OWNER만 가능)
    if (currentMember.role === 'ADMIN' && targetMember.role === 'ADMIN') {
      return NextResponse.json(
        { error: "다른 관리자를 강퇴할 수 없습니다. 스터디장에게 문의하세요" },
        { status: 403 }
      )
    }

    // 6. 트랜잭션으로 처리
    await prisma.$transaction(async (tx) => {
      // 6-1. 상태를 KICKED로 변경
      await tx.studyMember.update({
        where: {
          studyId_userId: {
            studyId,
            userId
          }
        },
        data: {
          status: 'KICKED',
          kickedAt: new Date(),
          kickedBy: session.user.id
        }
      })

      // 6-2. 강퇴 알림 생성
      await tx.notification.create({
        data: {
          userId,
          type: 'KICK',
          studyId,
          studyName: targetMember.study.name,
          studyEmoji: targetMember.study.emoji,
          message: `${targetMember.study.name}에서 강퇴되었습니다`
        }
      })

      // 6-3. 관련 할일 삭제 또는 재할당 (선택)
      await tx.task.updateMany({
        where: {
          studyId,
          assigneeId: userId
        },
        data: {
          assigneeId: null
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: `${targetMember.user.name}님을 강퇴했습니다`
    })

  } catch (error) {
    console.error('Kick member error:', error)
    return NextResponse.json(
      { error: "멤버 강퇴 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

**개선 사항**:
- ✅ ADMIN 권한 확인
- ✅ 자기 자신 강퇴 방지
- ✅ OWNER 강퇴 방지
- ✅ ADMIN끼리 강퇴 방지
- ✅ 알림 발송
- ✅ 관련 데이터 정리

---

### 문제 2: 클라이언트에서 확인 없이 삭제

#### ❌ 나쁜 예

```javascript
function KickButton({ studyId, userId }) {
  const kickMutation = useKickMember(studyId)

  const handleKick = () => {
    // 확인 없이 바로 실행
    kickMutation.mutate(userId)
  }

  return <button onClick={handleKick}>강퇴</button>
}
```

#### ✅ 좋은 예

```javascript
'use client'

import { useState } from 'react'
import { useKickMember } from '@/lib/hooks/useApi'
import { toast } from 'react-hot-toast'

function KickButton({ studyId, member, currentUserRole }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const kickMutation = useKickMember(studyId)

  // 권한 확인
  const canKick = 
    currentUserRole === 'OWNER' || 
    (currentUserRole === 'ADMIN' && member.role === 'MEMBER')

  if (!canKick) return null

  const handleKick = async () => {
    try {
      await kickMutation.mutateAsync(member.userId)
      toast.success(`${member.user.name}님을 강퇴했습니다`)
      setShowConfirm(false)
    } catch (error) {
      console.error('Kick error:', error)
      
      if (error.message.includes('자기 자신')) {
        toast.error('자기 자신을 강퇴할 수 없습니다')
      } else if (error.message.includes('스터디장')) {
        toast.error('스터디장을 강퇴할 수 없습니다')
      } else if (error.message.includes('관리자')) {
        toast.error('다른 관리자를 강퇴할 수 없습니다')
      } else {
        toast.error('멤버 강퇴에 실패했습니다')
      }
    }
  }

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        className="btn-danger"
      >
        강퇴
      </button>

      {showConfirm && (
        <ConfirmModal
          title="멤버 강퇴"
          message={`${member.user.name}님을 강퇴하시겠습니까?`}
          confirmText="강퇴"
          confirmStyle="danger"
          onConfirm={handleKick}
          onCancel={() => setShowConfirm(false)}
          isLoading={kickMutation.isLoading}
        />
      )}
    </>
  )
}

function ConfirmModal({ 
  title, 
  message, 
  confirmText, 
  confirmStyle, 
  onConfirm, 
  onCancel, 
  isLoading 
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onCancel} disabled={isLoading}>
            취소
          </button>
          <button 
            onClick={onConfirm} 
            className={`btn-${confirmStyle}`}
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default KickButton
```

**개선 사항**:
- ✅ 확인 모달
- ✅ 권한 확인
- ✅ 로딩 상태
- ✅ 에러별 메시지
- ✅ 성공 토스트

---

## 역할 변경 실패

### 문제 1: OWNER 역할 변경 허용

#### ❌ 나쁜 예

```javascript
// src/app/api/studies/[id]/members/[userId]/role/route.js
export async function PATCH(request, { params }) {
  const { studyId, userId } = await params
  const { role } = await request.json()
  
  // 검증 없이 변경
  await prisma.studyMember.update({
    where: { studyId_userId: { studyId, userId } },
    data: { role }
  })
}
```

**문제점**:
- OWNER 역할 변경 가능
- 유효하지 않은 역할 허용
- 권한 확인 없음

#### ✅ 좋은 예

```javascript
// src/app/api/studies/[id]/members/[userId]/role/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function PATCH(request, { params }) {
  const { id: studyId, userId } = await params

  // 1. OWNER 권한 필요
  const result = await requireStudyMember(studyId, 'OWNER')
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    const body = await request.json()
    const { role } = body

    // 2. 유효한 역할인지 확인
    if (!['MEMBER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: "유효하지 않은 역할입니다. MEMBER 또는 ADMIN만 가능합니다" },
        { status: 400 }
      )
    }

    // 3. 자기 자신의 역할 변경 불가
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "자기 자신의 역할을 변경할 수 없습니다" },
        { status: 400 }
      )
    }

    // 4. 대상 멤버 조회
    const member = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: "멤버를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 5. OWNER 역할은 변경 불가
    if (member.role === 'OWNER') {
      return NextResponse.json(
        { error: "스터디장의 역할은 변경할 수 없습니다. 소유권 이전을 사용하세요" },
        { status: 400 }
      )
    }

    // 6. 이미 같은 역할이면 리턴
    if (member.role === role) {
      return NextResponse.json({
        success: true,
        message: "이미 해당 역할입니다",
        data: member
      })
    }

    // 7. 역할 변경
    const updated = await prisma.studyMember.update({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      },
      data: { 
        role,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    // 8. 알림 생성
    await prisma.notification.create({
      data: {
        userId,
        type: 'ROLE_CHANGED',
        studyId,
        message: `역할이 ${role === 'ADMIN' ? '관리자' : '멤버'}로 변경되었습니다`
      }
    })

    return NextResponse.json({
      success: true,
      message: `${member.user.name}님의 역할이 ${role === 'ADMIN' ? '관리자' : '멤버'}로 변경되었습니다`,
      data: updated
    })

  } catch (error) {
    console.error('Change role error:', error)
    return NextResponse.json(
      { error: "역할 변경 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

**개선 사항**:
- ✅ OWNER 권한 확인
- ✅ 유효한 역할만 허용
- ✅ OWNER 역할 변경 방지
- ✅ 자기 자신 변경 방지
- ✅ 중복 변경 체크
- ✅ 알림 발송

---

### 문제 2: 소유권 이전 구현

#### ✅ OWNER 이전 API

```javascript
// src/app/api/studies/[id]/owner/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function PATCH(request, { params }) {
  const { id: studyId } = await params

  // 1. 현재 OWNER만 가능
  const result = await requireStudyMember(studyId, 'OWNER')
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    const body = await request.json()
    const { newOwnerId } = body

    if (!newOwnerId) {
      return NextResponse.json(
        { error: "새 스터디장을 선택해주세요" },
        { status: 400 }
      )
    }

    // 2. 자기 자신에게 이전 불가
    if (newOwnerId === session.user.id) {
      return NextResponse.json(
        { error: "자기 자신에게 소유권을 이전할 수 없습니다" },
        { status: 400 }
      )
    }

    // 3. 대상이 ACTIVE 멤버인지 확인
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
            name: true
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

    // 4. 트랜잭션으로 소유권 이전
    await prisma.$transaction(async (tx) => {
      // 4-1. 현재 OWNER를 ADMIN으로 변경
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

      // 4-2. 새 OWNER로 변경
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

      // 4-3. Study의 ownerId 변경
      await tx.study.update({
        where: { id: studyId },
        data: {
          ownerId: newOwnerId
        }
      })

      // 4-4. 알림 생성
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

**개선 사항**:
- ✅ 트랜잭션으로 원자성 보장
- ✅ 현재 OWNER → ADMIN
- ✅ 새 멤버 → OWNER
- ✅ Study.ownerId 업데이트
- ✅ 알림 발송

---

## 멤버 초대 실패

### 문제: 초대 링크 생성

#### ✅ 초대 API 구현

```javascript
// src/app/api/studies/[id]/invite/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  const { id: studyId } = await params

  // 1. ADMIN 이상 권한 필요
  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    const body = await request.json()
    const { email, message } = body

    // 2. 이메일 검증
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: "유효한 이메일을 입력해주세요" },
        { status: 400 }
      )
    }

    // 3. 스터디 정보 조회
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })

    if (!study) {
      return NextResponse.json(
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 4. 정원 확인
    if (study._count.members >= study.maxMembers) {
      return NextResponse.json(
        { error: "정원이 마감되었습니다" },
        { status: 400 }
      )
    }

    // 5. 이미 멤버인지 확인
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (user) {
      const existingMember = await prisma.studyMember.findUnique({
        where: {
          studyId_userId: {
            studyId,
            userId: user.id
          }
        }
      })

      if (existingMember && existingMember.status === 'ACTIVE') {
        return NextResponse.json(
          { error: "이미 스터디 멤버입니다" },
          { status: 400 }
        )
      }
    }

    // 6. 초대 링크 생성
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/studies/${studyId}/join?code=${study.inviteCode}`

    // 7. 이메일 발송 (구현 필요)
    // await sendInviteEmail({ 
    //   to: email, 
    //   studyName: study.name, 
    //   inviteLink, 
    //   message 
    // })

    // 8. 초대 기록 저장 (선택)
    await prisma.invitation.create({
      data: {
        studyId,
        email,
        inviteLink,
        message,
        invitedBy: result.session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: "초대 링크를 전송했습니다",
      inviteLink
    })

  } catch (error) {
    console.error('Invite member error:', error)
    return NextResponse.json(
      { error: "초대 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

**개선 사항**:
- ✅ ADMIN 권한 확인
- ✅ 이메일 검증
- ✅ 정원 확인
- ✅ 중복 멤버 확인
- ✅ 초대 링크 생성
- ✅ 초대 기록 저장

---

## 권한 검증 오류

### requireStudyMember 헬퍼 구현

```javascript
// src/lib/auth-helpers.js

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

/**
 * 스터디 멤버십 확인
 * @param {string} studyId - 스터디 ID
 * @param {string} requiredRole - 필요한 최소 역할 ('MEMBER' | 'ADMIN' | 'OWNER')
 */
export async function requireStudyMember(studyId, requiredRole = 'MEMBER') {
  // 1. 세션 확인
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다" },
      { status: 401 }
    )
  }

  // 2. 멤버십 확인
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

  // 3. 역할 확인
  const roleHierarchy = {
    'MEMBER': 1,
    'ADMIN': 2,
    'OWNER': 3
  }

  const userLevel = roleHierarchy[member.role] || 0
  const requiredLevel = roleHierarchy[requiredRole] || 0

  if (userLevel < requiredLevel) {
    return NextResponse.json(
      { error: `${requiredRole === 'OWNER' ? '스터디장' : '관리자'} 권한이 필요합니다` },
      { status: 403 }
    )
  }

  // 4. 성공: 세션과 멤버 정보 반환
  return {
    session,
    member
  }
}
```

**사용 예제**:

```javascript
// MEMBER 이상 필요
export async function GET(request, { params }) {
  const result = await requireStudyMember(params.id)
  if (result instanceof NextResponse) return result
  
  const { session, member } = result
  // 로직...
}

// ADMIN 이상 필요
export async function POST(request, { params }) {
  const result = await requireStudyMember(params.id, 'ADMIN')
  if (result instanceof NextResponse) return result
  
  // 로직...
}

// OWNER만 가능
export async function DELETE(request, { params }) {
  const result = await requireStudyMember(params.id, 'OWNER')
  if (result instanceof NextResponse) return result
  
  // 로직...
}
```

---

## 디버깅 가이드

### 디버깅 스크립트

```javascript
// scripts/check-member.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkMember(studyId, userId) {
  console.log('=== 멤버 정보 ===')
  
  const member = await prisma.studyMember.findUnique({
    where: {
      studyId_userId: { studyId, userId }
    },
    include: {
      user: true,
      study: true
    }
  })
  
  if (!member) {
    console.log('❌ 멤버를 찾을 수 없습니다')
    return
  }
  
  console.log('스터디:', member.study.name)
  console.log('사용자:', member.user.name)
  console.log('역할:', member.role)
  console.log('상태:', member.status)
  console.log('가입일:', member.joinedAt)
  console.log('승인일:', member.approvedAt)
}

// 사용: node scripts/check-member.js <studyId> <userId>
const [,, studyId, userId] = process.argv

if (!studyId || !userId) {
  console.log('Usage: node scripts/check-member.js <studyId> <userId>')
  process.exit(1)
}

checkMember(studyId, userId).then(() => prisma.$disconnect())
```

### 체크리스트

```bash
# 1. 멤버 확인
node scripts/check-member.js <studyId> <userId>

# 2. 스터디 전체 멤버 확인
node scripts/check-study.js <studyId>

# 3. Prisma Studio
npx prisma studio
```

---

## 관련 문서

- [INDEX](./INDEX.md) - 증상별 찾기
- [01-study-crud-exceptions.md](./01-study-crud-exceptions.md) - 스터디 CRUD
- [05-permissions-exceptions.md](./05-permissions-exceptions.md) - 권한 관리

---

**다음 문서**: [가입/탈퇴 예외 처리](./03-join-leave-exceptions.md)

