# 가입/탈퇴 예외 처리

**작성일**: 2025-11-29  
**카테고리**: 스터디 관리  
**우선순위**: 🔥 최고

---

## 📋 목차

- [개요](#개요)
- [가입 요청 실패](#가입-요청-실패)
- [정원 초과](#정원-초과)
- [중복 가입 방지](#중복-가입-방지)
- [가입 승인 대기](#가입-승인-대기)
- [가입 승인/거절](#가입-승인거절)
- [모집 중단 상태](#모집-중단-상태)
- [탈퇴 실패](#탈퇴-실패)
- [OWNER 탈퇴 방지](#owner-탈퇴-방지)
- [디버깅 가이드](#디버깅-가이드)

---

## 개요

스터디 가입 및 탈퇴 프로세스에서 발생할 수 있는 모든 예외 상황을 다룹니다.

### 가입 프로세스 흐름

```
사용자 가입 요청
    ↓
1. 정원 확인
2. 중복 가입 확인
3. 모집 상태 확인
    ↓
autoApprove?
    ├─ Yes → ACTIVE (즉시 가입)
    └─ No  → PENDING (승인 대기)
        ↓
    ADMIN/OWNER 승인
        ↓
    ACTIVE (가입 완료)
```

### 관련 파일

- **API**: `src/app/api/studies/[id]/join/route.js`
- **API**: `src/app/api/studies/[id]/leave/route.js`
- **API**: `src/app/api/studies/[id]/join-requests/route.js`
- **API**: `src/app/api/studies/[id]/join-requests/[requestId]/approve/route.js`
- **API**: `src/app/api/studies/[id]/join-requests/[requestId]/reject/route.js`

---

## 가입 요청 실패

### 문제 1: 유효성 검사 누락

#### ❌ 나쁜 예

```javascript
// src/app/api/studies/[id]/join/route.js
export async function POST(request, { params }) {
  const session = await requireAuth()
  const { id: studyId } = await params
  
  // 검증 없이 바로 생성
  await prisma.studyMember.create({
    data: {
      studyId,
      userId: session.user.id,
      role: 'MEMBER',
      status: 'ACTIVE'
    }
  })
}
```

**문제점**:
- 정원 확인 없음
- 중복 가입 확인 없음
- 모집 상태 확인 없음

#### ✅ 좋은 예

```javascript
// src/app/api/studies/[id]/join/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { id: studyId } = await params
    const body = await request.json()
    const { introduction, motivation, level } = body

    const userId = session.user.id

    // 1. 스터디 확인
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        _count: {
          select: {
            members: {
              where: { status: { in: ['ACTIVE', 'PENDING'] } }
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

    // 2. 모집 중인지 확인
    if (!study.isRecruiting) {
      return NextResponse.json(
        { error: "현재 모집 중이 아닙니다" },
        { status: 400 }
      )
    }

    // 3. 정원 확인
    if (study._count.members >= study.maxMembers) {
      return NextResponse.json(
        { error: "정원이 마감되었습니다" },
        { status: 400 }
      )
    }

    // 4. 중복 가입 확인
    const existingMember = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      }
    })

    if (existingMember) {
      if (existingMember.status === 'ACTIVE') {
        return NextResponse.json(
          { error: "이미 가입된 스터디입니다" },
          { status: 400 }
        )
      } else if (existingMember.status === 'PENDING') {
        return NextResponse.json(
          { error: "가입 승인 대기 중입니다" },
          { status: 400 }
        )
      } else if (existingMember.status === 'KICKED') {
        return NextResponse.json(
          { error: "강퇴된 스터디입니다. 스터디장에게 문의하세요" },
          { status: 403 }
        )
      }
    }

    // 5. 자동 승인 여부
    const status = study.autoApprove ? 'ACTIVE' : 'PENDING'
    const approvedAt = study.autoApprove ? new Date() : null

    // 6. 멤버 생성
    const member = await prisma.studyMember.create({
      data: {
        studyId,
        userId,
        role: 'MEMBER',
        status,
        introduction,
        motivation,
        level,
        approvedAt
      }
    })

    // 7. 자동 승인 시 알림
    if (study.autoApprove) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'JOIN_APPROVED',
          studyId,
          studyName: study.name,
          studyEmoji: study.emoji,
          message: `${study.name}에 가입되었습니다`
        }
      })
    } else {
      // 승인 대기 알림 (OWNER/ADMIN에게)
      const admins = await prisma.studyMember.findMany({
        where: {
          studyId,
          role: { in: ['OWNER', 'ADMIN'] },
          status: 'ACTIVE'
        },
        select: { userId: true }
      })

      await Promise.all(
        admins.map(admin =>
          prisma.notification.create({
            data: {
              userId: admin.userId,
              type: 'JOIN_REQUEST',
              studyId,
              studyName: study.name,
              message: `${session.user.name}님이 가입을 신청했습니다`
            }
          })
        )
      )
    }

    return NextResponse.json({
      success: true,
      message: study.autoApprove 
        ? "가입이 완료되었습니다" 
        : "가입 신청이 완료되었습니다. 승인을 기다려주세요",
      data: {
        ...member,
        autoApproved: study.autoApprove
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Join study error:', error)
    return NextResponse.json(
      { error: "가입 신청 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

**개선 사항**:
- ✅ 단계별 검증
- ✅ 중복 가입 방지
- ✅ 강퇴 이력 확인
- ✅ 자동/수동 승인 분기
- ✅ 알림 발송

---

## 정원 초과

### 문제: 동시 가입 요청으로 정원 초과

#### 시나리오

```
시간 T:
- 정원: 10명
- 현재: 9명
- 요청 A, B 동시 도착

시간 T+1:
- 두 요청 모두 정원 확인 통과 (9 < 10)
- 두 요청 모두 가입
- 결과: 11명 (정원 초과!)
```

#### ✅ 해결 방법: 트랜잭션과 잠금

```javascript
export async function POST(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { id: studyId } = await params
    const userId = session.user.id

    // 트랜잭션으로 원자성 보장
    const result = await prisma.$transaction(async (tx) => {
      // 1. 스터디 조회 (FOR UPDATE 잠금)
      const study = await tx.study.findUnique({
        where: { id: studyId },
        include: {
          _count: {
            select: {
              members: {
                where: { status: { in: ['ACTIVE', 'PENDING'] } }
              }
            }
          }
        }
      })

      if (!study) {
        throw new Error('스터디를 찾을 수 없습니다')
      }

      if (!study.isRecruiting) {
        throw new Error('현재 모집 중이 아닙니다')
      }

      // 2. 정원 확인 (트랜잭션 내에서 최신 데이터로 확인)
      if (study._count.members >= study.maxMembers) {
        throw new Error('정원이 마감되었습니다')
      }

      // 3. 중복 확인
      const existing = await tx.studyMember.findUnique({
        where: {
          studyId_userId: { studyId, userId }
        }
      })

      if (existing) {
        if (existing.status === 'ACTIVE') {
          throw new Error('이미 가입된 스터디입니다')
        } else if (existing.status === 'PENDING') {
          throw new Error('가입 승인 대기 중입니다')
        }
      }

      // 4. 멤버 생성
      const status = study.autoApprove ? 'ACTIVE' : 'PENDING'
      const member = await tx.studyMember.create({
        data: {
          studyId,
          userId,
          role: 'MEMBER',
          status,
          approvedAt: study.autoApprove ? new Date() : null
        }
      })

      return { member, study }
    }, {
      isolationLevel: 'Serializable' // 직렬화 격리 수준
    })

    return NextResponse.json({
      success: true,
      message: result.study.autoApprove 
        ? "가입이 완료되었습니다" 
        : "가입 신청이 완료되었습니다",
      data: result.member
    })

  } catch (error) {
    console.error('Join study error:', error)
    
    if (error.message.includes('정원')) {
      return NextResponse.json(
        { error: "정원이 마감되었습니다" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || "가입 신청 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

**개선 사항**:
- ✅ 트랜잭션 사용
- ✅ 직렬화 격리 수준
- ✅ 정원 확인을 트랜잭션 내에서 수행
- ✅ 동시성 제어

---

## 중복 가입 방지

### 다양한 케이스 처리

```javascript
// 중복 가입 확인 로직
const existingMember = await prisma.studyMember.findUnique({
  where: {
    studyId_userId: { studyId, userId }
  }
})

if (existingMember) {
  switch (existingMember.status) {
    case 'ACTIVE':
      return NextResponse.json(
        { error: "이미 가입된 스터디입니다" },
        { status: 400 }
      )
    
    case 'PENDING':
      return NextResponse.json(
        { error: "가입 승인 대기 중입니다" },
        { status: 400 }
      )
    
    case 'KICKED':
      return NextResponse.json(
        { 
          error: "강퇴된 스터디입니다", 
          details: "스터디장에게 문의하세요",
          kickedAt: existingMember.kickedAt
        },
        { status: 403 }
      )
    
    case 'LEFT':
      // 재가입 허용 (새로운 레코드 생성 또는 업데이트)
      await prisma.studyMember.update({
        where: { id: existingMember.id },
        data: {
          status: study.autoApprove ? 'ACTIVE' : 'PENDING',
          approvedAt: study.autoApprove ? new Date() : null,
          joinedAt: new Date()
        }
      })
      break
  }
}
```

---

## 가입 승인 대기

### 문제: 승인 대기 상태 UI 처리

#### ✅ 클라이언트 처리

```javascript
// src/components/studies/JoinButton.jsx
'use client'

import { useState } from 'react'
import { useJoinStudy, useStudy } from '@/lib/hooks/useApi'
import { toast } from 'react-hot-toast'

function JoinButton({ studyId, currentUser }) {
  const [showModal, setShowModal] = useState(false)
  const { data: study } = useStudy(studyId)
  const joinMutation = useJoinStudy(studyId)

  const [formData, setFormData] = useState({
    introduction: '',
    motivation: '',
    level: ''
  })

  // 이미 멤버인 경우
  if (study?.isMember) {
    return (
      <div className="badge-success">
        ✓ 가입됨
      </div>
    )
  }

  // 승인 대기 중인 경우
  if (study?.myMembership?.status === 'PENDING') {
    return (
      <div className="badge-warning">
        ⏳ 승인 대기 중
      </div>
    )
  }

  // 강퇴된 경우
  if (study?.myMembership?.status === 'KICKED') {
    return (
      <div className="badge-danger">
        ⚠️ 가입 불가
      </div>
    )
  }

  // 정원 마감
  if (study?.currentMembers >= study?.maxMembers) {
    return (
      <button disabled className="btn-disabled">
        정원 마감 ({study.currentMembers}/{study.maxMembers})
      </button>
    )
  }

  // 모집 중단
  if (!study?.isRecruiting) {
    return (
      <button disabled className="btn-disabled">
        모집 중단
      </button>
    )
  }

  const handleJoin = async () => {
    try {
      const result = await joinMutation.mutateAsync(formData)
      
      if (result.autoApproved) {
        toast.success('가입이 완료되었습니다! 🎉')
      } else {
        toast.success('가입 신청이 완료되었습니다. 승인을 기다려주세요 ⏳')
      }
      
      setShowModal(false)
    } catch (error) {
      console.error('Join error:', error)
      
      if (error.message.includes('정원')) {
        toast.error('정원이 마감되었습니다')
      } else if (error.message.includes('이미')) {
        toast.error('이미 가입된 스터디입니다')
      } else if (error.message.includes('승인')) {
        toast.error('이미 가입 신청을 하였습니다')
      } else if (error.message.includes('강퇴')) {
        toast.error('가입할 수 없는 스터디입니다')
      } else {
        toast.error('가입 신청에 실패했습니다')
      }
    }
  }

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="btn-primary"
      >
        가입하기
      </button>

      {showModal && (
        <JoinModal
          study={study}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleJoin}
          onClose={() => setShowModal(false)}
          isLoading={joinMutation.isLoading}
        />
      )}
    </>
  )
}

function JoinModal({ study, formData, setFormData, onSubmit, onClose, isLoading }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{study.name} 가입하기</h3>
        
        <div className="form-group">
          <label>자기소개 *</label>
          <textarea
            value={formData.introduction}
            onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
            placeholder="간단한 자기소개를 해주세요"
            maxLength={200}
            required
          />
          <small>{formData.introduction.length}/200</small>
        </div>

        <div className="form-group">
          <label>가입 동기</label>
          <textarea
            value={formData.motivation}
            onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
            placeholder="가입 동기를 알려주세요"
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label>실력 수준</label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
          >
            <option value="">선택하세요</option>
            <option value="beginner">초급</option>
            <option value="intermediate">중급</option>
            <option value="advanced">고급</option>
          </select>
        </div>

        {study.autoApprove ? (
          <p className="info">
            ✓ 이 스터디는 자동 승인됩니다
          </p>
        ) : (
          <p className="warning">
            ⏳ 가입 신청 후 스터디장의 승인이 필요합니다
          </p>
        )}

        <div className="modal-actions">
          <button onClick={onClose} disabled={isLoading}>
            취소
          </button>
          <button 
            onClick={onSubmit} 
            disabled={isLoading || !formData.introduction}
            className="btn-primary"
          >
            {isLoading ? '처리 중...' : '가입 신청'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default JoinButton
```

---

## 가입 승인/거절

### 승인 API

```javascript
// src/app/api/studies/[id]/join-requests/[requestId]/approve/route.js
export async function POST(request, { params }) {
  const { id: studyId, requestId } = await params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    // 1. 가입 신청 확인
    const joinRequest = await prisma.studyMember.findFirst({
      where: {
        id: requestId,
        studyId,
        status: 'PENDING'
      },
      include: {
        user: true,
        study: true
      }
    })

    if (!joinRequest) {
      return NextResponse.json(
        { error: "가입 신청을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 2. 정원 재확인 (승인 시점에 정원 초과 방지)
    const currentMembersCount = await prisma.studyMember.count({
      where: {
        studyId,
        status: { in: ['ACTIVE', 'PENDING'] }
      }
    })

    if (currentMembersCount >= joinRequest.study.maxMembers) {
      return NextResponse.json(
        { error: "정원이 마감되어 승인할 수 없습니다" },
        { status: 400 }
      )
    }

    // 3. 트랜잭션으로 승인 처리
    await prisma.$transaction(async (tx) => {
      // 3-1. 상태 변경
      await tx.studyMember.update({
        where: { id: requestId },
        data: {
          status: 'ACTIVE',
          role: 'MEMBER',
          approvedAt: new Date(),
          approvedBy: session.user.id
        }
      })

      // 3-2. 알림 생성
      await tx.notification.create({
        data: {
          userId: joinRequest.userId,
          type: 'JOIN_APPROVED',
          studyId,
          studyName: joinRequest.study.name,
          studyEmoji: joinRequest.study.emoji,
          message: `${joinRequest.study.name} 가입이 승인되었습니다`
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: `${joinRequest.user.name}님의 가입을 승인했습니다`
    })

  } catch (error) {
    console.error('Approve join request error:', error)
    return NextResponse.json(
      { error: "가입 승인 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

### 거절 API

```javascript
// src/app/api/studies/[id]/join-requests/[requestId]/reject/route.js
export async function POST(request, { params }) {
  const { id: studyId, requestId } = await params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    const body = await request.json()
    const { reason } = body

    // 1. 가입 신청 확인
    const joinRequest = await prisma.studyMember.findFirst({
      where: {
        id: requestId,
        studyId,
        status: 'PENDING'
      },
      include: {
        user: true,
        study: true
      }
    })

    if (!joinRequest) {
      return NextResponse.json(
        { error: "가입 신청을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 2. 거절 처리 (레코드 삭제 또는 상태 변경)
    await prisma.$transaction(async (tx) => {
      // 옵션 1: 레코드 삭제
      await tx.studyMember.delete({
        where: { id: requestId }
      })

      // 옵션 2: 상태를 REJECTED로 변경 (이력 남김)
      // await tx.studyMember.update({
      //   where: { id: requestId },
      //   data: {
      //     status: 'REJECTED',
      //     rejectedAt: new Date(),
      //     rejectedBy: session.user.id,
      //     rejectionReason: reason
      //   }
      // })

      // 알림 생성
      await tx.notification.create({
        data: {
          userId: joinRequest.userId,
          type: 'JOIN_REJECTED',
          studyId,
          studyName: joinRequest.study.name,
          message: reason || `${joinRequest.study.name} 가입 신청이 거절되었습니다`
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: `${joinRequest.user.name}님의 가입 신청을 거절했습니다`
    })

  } catch (error) {
    console.error('Reject join request error:', error)
    return NextResponse.json(
      { error: "가입 거절 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

## 모집 중단 상태

### 모집 상태 토글

```javascript
// src/app/api/studies/[id]/recruiting/route.js
export async function PATCH(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId, 'OWNER')
  if (result instanceof NextResponse) return result

  try {
    const body = await request.json()
    const { isRecruiting } = body

    if (typeof isRecruiting !== 'boolean') {
      return NextResponse.json(
        { error: "유효하지 않은 값입니다" },
        { status: 400 }
      )
    }

    // 모집 상태 변경
    const study = await prisma.study.update({
      where: { id: studyId },
      data: { isRecruiting }
    })

    return NextResponse.json({
      success: true,
      message: isRecruiting ? "모집을 시작했습니다" : "모집을 중단했습니다",
      data: study
    })

  } catch (error) {
    console.error('Toggle recruiting error:', error)
    return NextResponse.json(
      { error: "모집 상태 변경 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

## 탈퇴 실패

### 기본 탈퇴 처리

```javascript
// src/app/api/studies/[id]/leave/route.js
export async function DELETE(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { id: studyId } = await params
    const userId = session.user.id

    // 1. 멤버 확인
    const member = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      },
      include: {
        study: true
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: "스터디 멤버가 아닙니다" },
        { status: 404 }
      )
    }

    // 2. OWNER는 탈퇴 불가
    if (member.role === 'OWNER') {
      return NextResponse.json(
        { 
          error: "스터디장은 탈퇴할 수 없습니다", 
          details: "스터디를 삭제하거나 소유권을 이전하세요"
        },
        { status: 400 }
      )
    }

    // 3. 트랜잭션으로 탈퇴 처리
    await prisma.$transaction(async (tx) => {
      // 3-1. 상태를 LEFT로 변경
      await tx.studyMember.update({
        where: {
          studyId_userId: {
            studyId,
            userId
          }
        },
        data: {
          status: 'LEFT',
          leftAt: new Date()
        }
      })

      // 3-2. 할당된 할일 해제
      await tx.task.updateMany({
        where: {
          studyId,
          assigneeId: userId
        },
        data: {
          assigneeId: null
        }
      })

      // 3-3. ADMIN이었다면 알림
      if (member.role === 'ADMIN') {
        const owner = await tx.studyMember.findFirst({
          where: {
            studyId,
            role: 'OWNER'
          }
        })

        if (owner) {
          await tx.notification.create({
            data: {
              userId: owner.userId,
              type: 'ADMIN_LEFT',
              studyId,
              message: `관리자 ${session.user.name}님이 스터디를 탈퇴했습니다`
            }
          })
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "스터디를 탈퇴했습니다"
    })

  } catch (error) {
    console.error('Leave study error:', error)
    return NextResponse.json(
      { error: "스터디 탈퇴 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

## OWNER 탈퇴 방지

### 클라이언트에서 처리

```javascript
// src/components/studies/LeaveButton.jsx
function LeaveButton({ studyId, myRole }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const leaveMutation = useLeaveStudy(studyId)
  const router = useRouter()

  // OWNER는 탈퇴 불가
  if (myRole === 'OWNER') {
    return (
      <button disabled className="btn-disabled" title="스터디장은 탈퇴할 수 없습니다">
        탈퇴 불가
      </button>
    )
  }

  const handleLeave = async () => {
    try {
      await leaveMutation.mutateAsync()
      toast.success('스터디를 탈퇴했습니다')
      router.push('/studies')
    } catch (error) {
      if (error.message.includes('스터디장')) {
        toast.error('스터디장은 탈퇴할 수 없습니다')
      } else {
        toast.error('탈퇴에 실패했습니다')
      }
    }
  }

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        className="btn-danger"
      >
        스터디 탈퇴
      </button>

      {showConfirm && (
        <ConfirmModal
          title="스터디 탈퇴"
          message="정말 이 스터디를 탈퇴하시겠습니까?"
          warning="탈퇴 후 다시 가입하려면 승인이 필요할 수 있습니다"
          confirmText="탈퇴"
          confirmStyle="danger"
          onConfirm={handleLeave}
          onCancel={() => setShowConfirm(false)}
          isLoading={leaveMutation.isLoading}
        />
      )}
    </>
  )
}
```

---

## 디버깅 가이드

### 디버깅 스크립트

```javascript
// scripts/check-join-status.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkJoinStatus(studyId, userId) {
  console.log('=== 가입 상태 확인 ===')
  
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    include: {
      _count: {
        select: {
          members: {
            where: { status: { in: ['ACTIVE', 'PENDING'] } }
          }
        }
      }
    }
  })
  
  if (!study) {
    console.log('❌ 스터디를 찾을 수 없습니다')
    return
  }
  
  console.log('스터디:', study.name)
  console.log('모집 중:', study.isRecruiting ? 'Y' : 'N')
  console.log('정원:', `${study._count.members}/${study.maxMembers}`)
  console.log('자동 승인:', study.autoApprove ? 'Y' : 'N')
  
  const member = await prisma.studyMember.findUnique({
    where: {
      studyId_userId: { studyId, userId }
    }
  })
  
  if (member) {
    console.log('\n사용자 상태:', member.status)
    console.log('역할:', member.role)
    console.log('가입일:', member.joinedAt)
    if (member.approvedAt) {
      console.log('승인일:', member.approvedAt)
    }
  } else {
    console.log('\n사용자는 이 스터디의 멤버가 아닙니다')
  }
}

const [,, studyId, userId] = process.argv
if (!studyId || !userId) {
  console.log('Usage: node scripts/check-join-status.js <studyId> <userId>')
  process.exit(1)
}

checkJoinStatus(studyId, userId).then(() => prisma.$disconnect())
```

---

## 관련 문서

- [INDEX](./INDEX.md) - 증상별 찾기
- [01-study-crud-exceptions.md](./01-study-crud-exceptions.md) - 스터디 CRUD
- [02-member-management-exceptions.md](./02-member-management-exceptions.md) - 멤버 관리

---

**다음 문서**: [설정 관리 예외 처리](./04-settings-exceptions.md)

