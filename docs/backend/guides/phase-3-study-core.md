# Phase 3: 스터디 핵심 기능 구현

> **목표**: 스터디 CRUD, 멤버 관리, 가입/승인 시스템  
> **예상 시간**: 8-10시간  
> **선행 조건**: Phase 2 완료 (사용자 기능)

---

## 📋 체크리스트

### 스터디 CRUD
- [ ] 스터디 목록/검색 API
- [ ] 스터디 생성 API
- [ ] 스터디 상세 조회 API
- [ ] 스터디 수정 API (OWNER)
- [ ] 스터디 삭제 API (OWNER)

### 스터디 가입
- [ ] 가입 신청 API
- [ ] 가입 신청 목록 API (ADMIN+)
- [ ] 가입 승인 API (ADMIN+)
- [ ] 가입 거절 API (ADMIN+)

### 멤버 관리
- [ ] 멤버 목록 API
- [ ] 멤버 역할 변경 API (OWNER)
- [ ] 멤버 강퇴 API (ADMIN+)
- [ ] 스터디 탈퇴 API

### 테스트
- [ ] 전체 플로우 테스트
- [ ] 권한 확인 테스트

---

## 1. 스터디 목록/검색 API

### `src/app/api/studies/route.js`

```javascript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const isRecruiting = searchParams.get('isRecruiting')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // 필터 조건 구성
    const where = {
      isPublic: true,
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ]
    }

    if (isRecruiting === 'true') {
      where.isRecruiting = true
    }

    // 총 개수
    const total = await prisma.study.count({ where })

    // 스터디 목록
    const studies = await prisma.study.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        emoji: true,
        description: true,
        category: true,
        subCategory: true,
        maxMembers: true,
        isRecruiting: true,
        tags: true,
        createdAt: true,
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })

    return NextResponse.json({
      studies: studies.map(study => ({
        ...study,
        members: {
          current: study._count.members,
          max: study.maxMembers
        }
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get studies error:', error)
    return NextResponse.json(
      { error: "스터디 목록 조회 실패" },
      { status: 500 }
    )
  }
}
```

---

## 2. 스터디 생성 API

### `src/app/api/studies/route.js` (POST 추가)

```javascript
export async function POST(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const {
      name,
      emoji,
      description,
      category,
      subCategory,
      maxMembers,
      isPublic,
      autoApprove,
      tags
    } = body

    // 유효성 검사
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "스터디 이름은 2자 이상이어야 합니다" },
        { status: 400 }
      )
    }

    if (!description || description.length < 10) {
      return NextResponse.json(
        { error: "설명은 10자 이상이어야 합니다" },
        { status: 400 }
      )
    }

    // 트랜잭션으로 스터디 생성 + 생성자를 OWNER로 추가
    const study = await prisma.$transaction(async (tx) => {
      // 스터디 생성
      const newStudy = await tx.study.create({
        data: {
          name,
          emoji: emoji || '📚',
          description,
          category,
          subCategory,
          maxMembers: maxMembers || 20,
          isPublic: isPublic !== false,
          autoApprove: autoApprove !== false,
          isRecruiting: true,
          tags: tags || [],
        }
      })

      // 생성자를 OWNER로 추가
      await tx.studyMember.create({
        data: {
          studyId: newStudy.id,
          userId: session.user.id,
          role: 'OWNER',
          status: 'ACTIVE',
          approvedAt: new Date()
        }
      })

      return newStudy
    })

    return NextResponse.json({
      success: true,
      message: "스터디가 생성되었습니다",
      study
    }, { status: 201 })

  } catch (error) {
    console.error('Create study error:', error)
    return NextResponse.json(
      { error: "스터디 생성 실패" },
      { status: 500 }
    )
  }
}
```

---

## 3. 스터디 상세 조회 API

### `src/app/api/studies/[studyId]/route.js`

```javascript
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const session = await auth()
  const { studyId } = params

  try {
    // 스터디 기본 정보
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: {
        id: true,
        name: true,
        emoji: true,
        description: true,
        category: true,
        subCategory: true,
        maxMembers: true,
        isPublic: true,
        autoApprove: true,
        isRecruiting: true,
        tags: true,
        inviteCode: true,
        createdAt: true,
        _count: {
          select: {
            members: { where: { status: 'ACTIVE' } }
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

    // 멤버 여부 확인
    let member = null
    if (session?.user) {
      member = await prisma.studyMember.findUnique({
        where: {
          studyId_userId: {
            studyId,
            userId: session.user.id
          }
        }
      })
    }

    // 멤버가 아니면 제한된 정보만 반환
    if (!member || member.status !== 'ACTIVE') {
      return NextResponse.json({
        study: {
          ...study,
          members: { current: study._count.members, max: study.maxMembers },
          inviteCode: undefined, // 비멤버에게는 숨김
          isMember: false,
          memberStatus: member?.status || null
        }
      })
    }

    // 멤버면 전체 정보 + 최근 활동
    const [recentNotices, recentFiles, upcomingEvents] = await Promise.all([
      prisma.notice.findMany({
        where: { studyId },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          isPinned: true,
          isImportant: true,
          createdAt: true,
          author: {
            select: { name: true }
          }
        }
      }),
      prisma.file.findMany({
        where: { studyId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          type: true,
          size: true,
          createdAt: true
        }
      }),
      prisma.event.findMany({
        where: {
          studyId,
          date: { gte: new Date() }
        },
        take: 3,
        orderBy: { date: 'asc' },
        select: {
          id: true,
          title: true,
          date: true,
          startTime: true,
          endTime: true
        }
      })
    ])

    return NextResponse.json({
      study: {
        ...study,
        members: { current: study._count.members, max: study.maxMembers },
        isMember: true,
        memberRole: member.role,
        memberStatus: member.status
      },
      recentActivity: {
        notices: recentNotices,
        files: recentFiles,
        events: upcomingEvents
      }
    })

  } catch (error) {
    console.error('Get study error:', error)
    return NextResponse.json(
      { error: "스터디 조회 실패" },
      { status: 500 }
    )
  }
}
```

---

## 4. 스터디 수정 API

### `src/app/api/studies/[studyId]/route.js` (PATCH 추가)

```javascript
export async function PATCH(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  const { studyId } = params

  try {
    // OWNER 확인
    const result = await requireStudyMember(studyId, 'OWNER')
    if (result instanceof NextResponse) return result

    const body = await request.json()
    const {
      name,
      description,
      maxMembers,
      isRecruiting,
      autoApprove,
      tags
    } = body

    // 업데이트 데이터 구성
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (maxMembers !== undefined) updateData.maxMembers = maxMembers
    if (isRecruiting !== undefined) updateData.isRecruiting = isRecruiting
    if (autoApprove !== undefined) updateData.autoApprove = autoApprove
    if (tags !== undefined) updateData.tags = tags

    const study = await prisma.study.update({
      where: { id: studyId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: "스터디가 수정되었습니다",
      study
    })

  } catch (error) {
    console.error('Update study error:', error)
    return NextResponse.json(
      { error: "스터디 수정 실패" },
      { status: 500 }
    )
  }
}
```

---

## 5. 스터디 가입 신청 API

### `src/app/api/studies/[studyId]/join/route.js`

```javascript
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  const { studyId } = params

  try {
    const body = await request.json()
    const { introduction, motivation, level } = body

    // 스터디 정보 조회
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: {
        autoApprove: true,
        maxMembers: true,
        isRecruiting: true,
        _count: {
          select: {
            members: { where: { status: 'ACTIVE' } }
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

    // 모집 중 확인
    if (!study.isRecruiting) {
      return NextResponse.json(
        { error: "현재 모집 중이 아닙니다" },
        { status: 400 }
      )
    }

    // 정원 확인
    if (study._count.members >= study.maxMembers) {
      return NextResponse.json(
        { error: "정원이 초과되었습니다" },
        { status: 400 }
      )
    }

    // 중복 가입 확인
    const existing = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId: session.user.id
        }
      }
    })

    if (existing) {
      if (existing.status === 'ACTIVE') {
        return NextResponse.json(
          { error: "이미 가입된 스터디입니다" },
          { status: 400 }
        )
      }
      if (existing.status === 'PENDING') {
        return NextResponse.json(
          { error: "승인 대기 중입니다" },
          { status: 400 }
        )
      }
    }

    // 자동 승인 여부에 따라 상태 결정
    const status = study.autoApprove ? 'ACTIVE' : 'PENDING'
    const approvedAt = study.autoApprove ? new Date() : null

    // 멤버 생성
    const member = await prisma.studyMember.create({
      data: {
        studyId,
        userId: session.user.id,
        role: 'MEMBER',
        status,
        introduction,
        motivation,
        level,
        approvedAt
      }
    })

    // 자동 승인 시 알림 생성
    if (study.autoApprove) {
      const studyInfo = await prisma.study.findUnique({
        where: { id: studyId },
        select: { name: true, emoji: true }
      })

      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'JOIN_APPROVED',
          studyId,
          studyName: studyInfo.name,
          studyEmoji: studyInfo.emoji,
          message: '가입이 승인되었습니다'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: study.autoApprove 
        ? "가입되었습니다" 
        : "가입 신청이 완료되었습니다. 승인을 기다려주세요.",
      member: {
        status: member.status,
        role: member.role
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Join study error:', error)
    return NextResponse.json(
      { error: "가입 신청 실패" },
      { status: 500 }
    )
  }
}
```

---

## 6. 가입 승인/거절 API

### `src/app/api/studies/[studyId]/members/[userId]/approve/route.js`

```javascript
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  const { studyId, userId } = params

  // ADMIN+ 확인
  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    // 멤버 상태 확인
    const member = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: { studyId, userId }
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: "가입 신청을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    if (member.status !== 'PENDING') {
      return NextResponse.json(
        { error: "승인 대기 중이 아닙니다" },
        { status: 400 }
      )
    }

    // 승인 처리
    await prisma.studyMember.update({
      where: {
        studyId_userId: { studyId, userId }
      },
      data: {
        status: 'ACTIVE',
        approvedAt: new Date()
      }
    })

    // 알림 생성
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { name: true, emoji: true }
    })

    await prisma.notification.create({
      data: {
        userId,
        type: 'JOIN_APPROVED',
        studyId,
        studyName: study.name,
        studyEmoji: study.emoji,
        message: '가입이 승인되었습니다'
      }
    })

    return NextResponse.json({
      success: true,
      message: "가입을 승인했습니다"
    })

  } catch (error) {
    console.error('Approve member error:', error)
    return NextResponse.json(
      { error: "승인 처리 실패" },
      { status: 500 }
    )
  }
}
```

### `src/app/api/studies/[studyId]/members/[userId]/reject/route.js`

```javascript
export async function POST(request, { params }) {
  const { studyId, userId } = params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    const { reason } = await request.json()

    await prisma.studyMember.delete({
      where: {
        studyId_userId: { studyId, userId }
      }
    })

    // 거절 알림 (선택)
    if (reason) {
      const study = await prisma.study.findUnique({
        where: { id: studyId },
        select: { name: true, emoji: true }
      })

      await prisma.notification.create({
        data: {
          userId,
          type: 'MEMBER',
          studyId,
          studyName: study.name,
          studyEmoji: study.emoji,
          message: `가입 신청이 거절되었습니다. 사유: ${reason}`
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "가입을 거절했습니다"
    })

  } catch (error) {
    console.error('Reject member error:', error)
    return NextResponse.json(
      { error: "거절 처리 실패" },
      { status: 500 }
    )
  }
}
```

---

## 7. 멤버 목록 API

### `src/app/api/studies/[studyId]/members/route.js`

```javascript
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const { studyId } = params

  const result = await requireStudyMember(studyId, 'MEMBER')
  if (result instanceof NextResponse) return result

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'ACTIVE'

    const members = await prisma.studyMember.findMany({
      where: {
        studyId,
        status: status === 'all' ? undefined : status
      },
      orderBy: [
        { role: 'desc' },
        { joinedAt: 'asc' }
      ],
      select: {
        id: true,
        role: true,
        status: true,
        introduction: true,
        motivation: true,
        level: true,
        joinedAt: true,
        approvedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({ members })

  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      { error: "멤버 목록 조회 실패" },
      { status: 500 }
    )
  }
}
```

---

## 8. 멤버 역할 변경 API

### `src/app/api/studies/[studyId]/members/[userId]/role/route.js`

```javascript
export async function PATCH(request, { params }) {
  const { studyId, userId } = params

  const result = await requireStudyMember(studyId, 'OWNER')
  if (result instanceof NextResponse) return result

  try {
    const { role } = await request.json()

    if (!['MEMBER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: "유효하지 않은 역할입니다" },
        { status: 400 }
      )
    }

    await prisma.studyMember.update({
      where: {
        studyId_userId: { studyId, userId }
      },
      data: { role }
    })

    return NextResponse.json({
      success: true,
      message: "역할이 변경되었습니다"
    })

  } catch (error) {
    console.error('Change role error:', error)
    return NextResponse.json(
      { error: "역할 변경 실패" },
      { status: 500 }
    )
  }
}
```

---

## 9. 멤버 강퇴 API

### `src/app/api/studies/[studyId]/members/[userId]/route.js`

```javascript
export async function DELETE(request, { params }) {
  const { studyId, userId } = params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result
  const { session, member: adminMember } = result

  try {
    // 본인 강퇴 방지
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "본인을 강퇴할 수 없습니다" },
        { status: 400 }
      )
    }

    // 대상 멤버 조회
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

    // OWNER 강퇴 방지
    if (targetMember.role === 'OWNER') {
      return NextResponse.json(
        { error: "그룹장은 강퇴할 수 없습니다" },
        { status: 400 }
      )
    }

    // ADMIN이 다른 ADMIN 강퇴 방지
    if (adminMember.role === 'ADMIN' && targetMember.role === 'ADMIN') {
      return NextResponse.json(
        { error: "관리자는 다른 관리자를 강퇴할 수 없습니다" },
        { status: 403 }
      )
    }

    // 강퇴 처리
    await prisma.studyMember.update({
      where: {
        studyId_userId: { studyId, userId }
      },
      data: { status: 'KICKED' }
    })

    // 강퇴 알림
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { name: true, emoji: true }
    })

    await prisma.notification.create({
      data: {
        userId,
        type: 'KICK',
        studyId,
        studyName: study.name,
        studyEmoji: study.emoji,
        message: '스터디에서 강퇴되었습니다'
      }
    })

    return NextResponse.json({
      success: true,
      message: "멤버를 강퇴했습니다"
    })

  } catch (error) {
    console.error('Kick member error:', error)
    return NextResponse.json(
      { error: "강퇴 처리 실패" },
      { status: 500 }
    )
  }
}
```

---

## 10. 스터디 탈퇴 API

### `src/app/api/studies/[studyId]/leave/route.js`

```javascript
export async function POST(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  const { studyId } = params

  try {
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
        { status: 404 }
      )
    }

    // OWNER는 탈퇴 불가
    if (member.role === 'OWNER') {
      return NextResponse.json(
        { error: "그룹장은 탈퇴할 수 없습니다. 스터디를 삭제하거나 그룹장을 위임하세요." },
        { status: 400 }
      )
    }

    await prisma.studyMember.update({
      where: {
        studyId_userId: { studyId, userId: session.user.id }
      },
      data: { status: 'LEFT' }
    })

    return NextResponse.json({
      success: true,
      message: "스터디를 탈퇴했습니다"
    })

  } catch (error) {
    console.error('Leave study error:', error)
    return NextResponse.json(
      { error: "탈퇴 처리 실패" },
      { status: 500 }
    )
  }
}
```

---

## 11. 프론트엔드 연동

### 스터디 탐색 페이지

```javascript
// src/app/studies/page.jsx
'use client'

import { useState, useEffect } from 'react'

export default function StudiesPage() {
  const [studies, setStudies] = useState([])
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    isRecruiting: false
  })

  useEffect(() => {
    fetchStudies()
  }, [filters])

  const fetchStudies = async () => {
    const params = new URLSearchParams({
      category: filters.category,
      search: filters.search,
      isRecruiting: filters.isRecruiting.toString()
    })

    const res = await fetch(`/api/studies?${params}`)
    const data = await res.json()
    setStudies(data.studies)
  }

  return (
    <div>
      {/* 필터 UI */}
      {/* 스터디 카드 그리드 */}
      {studies.map(study => (
        <StudyCard key={study.id} study={study} />
      ))}
    </div>
  )
}
```

---

## 🎯 완료 확인

- [x] 스터디 CRUD API 구현
- [x] 가입 신청/승인/거절 API
- [x] 멤버 관리 API
- [x] 권한 확인 로직
- [x] 알림 생성 통합

---

## 📚 다음 단계

**Phase 4: 스터디 콘텐츠**
- 공지사항 CRUD
- 캘린더 일정 CRUD
- 할일 CRUD

👉 **[phase-4-study-content.md](./phase-4-study-content.md)** 로 이동

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-11-18

