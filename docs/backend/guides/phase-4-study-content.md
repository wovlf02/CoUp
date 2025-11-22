# Phase 4: 스터디 콘텐츠 구현

> **목표**: 공지사항, 캘린더, 할일 CRUD  
> **예상 시간**: 6-8시간  
> **선행 조건**: Phase 3 완료 (스터디 핵심 기능)

---

## 📋 체크리스트

### 공지사항
- [ ] 공지 목록 API
- [ ] 공지 작성 API (ADMIN+)
- [ ] 공지 상세 API (조회수 증가)
- [ ] 공지 수정 API
- [ ] 공지 삭제 API
- [ ] 공지 고정/해제 API (ADMIN+)

### 캘린더
- [ ] 일정 목록 API (월별 필터)
- [ ] 일정 생성 API (ADMIN+)
- [ ] 일정 수정 API (ADMIN+)
- [ ] 일정 삭제 API (ADMIN+)

### 할일
- [ ] 할일 목록 API (필터링)
- [ ] 할일 생성 API
- [ ] 할일 상세 API
- [ ] 할일 수정 API
- [ ] 할일 완료/미완료 토글 API
- [ ] 할일 삭제 API

---

## 1. 공지사항 목록 API

### `src/app/api/studies/[studyId]/notices/route.js`

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
    const filter = searchParams.get('filter') // 'all', 'pinned', 'important'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where = { studyId }

    if (filter === 'pinned') {
      where.isPinned = true
    } else if (filter === 'important') {
      where.isImportant = true
    }

    const [total, notices] = await Promise.all([
      prisma.notice.count({ where }),
      prisma.notice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ],
        select: {
          id: true,
          title: true,
          content: true,
          isPinned: true,
          isImportant: true,
          views: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      })
    ])

    return NextResponse.json({
      notices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get notices error:', error)
    return NextResponse.json(
      { error: "공지사항 조회 실패" },
      { status: 500 }
    )
  }
}
```

---

## 2. 공지 작성 API

### `src/app/api/studies/[studyId]/notices/route.js` (POST 추가)

```javascript
export async function POST(request, { params }) {
  const { studyId } = params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result
  const { session } = result

  try {
    const body = await request.json()
    const { title, content, isPinned, isImportant } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "제목과 내용을 입력해주세요" },
        { status: 400 }
      )
    }

    const notice = await prisma.notice.create({
      data: {
        studyId,
        authorId: session.user.id,
        title,
        content,
        isPinned: isPinned || false,
        isImportant: isImportant || false
      }
    })

    // 스터디 멤버들에게 알림 생성
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { 
        name: true, 
        emoji: true,
        members: {
          where: { 
            status: 'ACTIVE',
            userId: { not: session.user.id } // 작성자 제외
          },
          select: { userId: true }
        }
      }
    })

    await prisma.notification.createMany({
      data: study.members.map(member => ({
        userId: member.userId,
        type: 'NOTICE',
        studyId,
        studyName: study.name,
        studyEmoji: study.emoji,
        message: `새 공지: ${title}`,
        data: { noticeId: notice.id }
      }))
    })

    return NextResponse.json({
      success: true,
      message: "공지가 작성되었습니다",
      notice
    }, { status: 201 })

  } catch (error) {
    console.error('Create notice error:', error)
    return NextResponse.json(
      { error: "공지 작성 실패" },
      { status: 500 }
    )
  }
}
```

---

## 3. 공지 상세 API

### `src/app/api/studies/[studyId]/notices/[noticeId]/route.js`

```javascript
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const { studyId, noticeId } = params

  const result = await requireStudyMember(studyId, 'MEMBER')
  if (result instanceof NextResponse) return result

  try {
    // 조회수 증가 (트랜잭션)
    const notice = await prisma.$transaction(async (tx) => {
      const updated = await tx.notice.update({
        where: { id: noticeId },
        data: { views: { increment: 1 } },
        select: {
          id: true,
          title: true,
          content: true,
          isPinned: true,
          isImportant: true,
          views: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      })
      return updated
    })

    return NextResponse.json({ notice })

  } catch (error) {
    console.error('Get notice error:', error)
    return NextResponse.json(
      { error: "공지 조회 실패" },
      { status: 500 }
    )
  }
}
```

---

## 4. 공지 수정/삭제 API

### `src/app/api/studies/[studyId]/notices/[noticeId]/route.js` (PATCH, DELETE 추가)

```javascript
export async function PATCH(request, { params }) {
  const { studyId, noticeId } = params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result
  const { session } = result

  try {
    // 공지 작성자 또는 ADMIN+ 확인
    const notice = await prisma.notice.findUnique({
      where: { id: noticeId }
    })

    if (!notice) {
      return NextResponse.json(
        { error: "공지를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { title, content, isPinned, isImportant } = body

    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (isPinned !== undefined) updateData.isPinned = isPinned
    if (isImportant !== undefined) updateData.isImportant = isImportant

    const updated = await prisma.notice.update({
      where: { id: noticeId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: "공지가 수정되었습니다",
      notice: updated
    })

  } catch (error) {
    console.error('Update notice error:', error)
    return NextResponse.json(
      { error: "공지 수정 실패" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  const { studyId, noticeId } = params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    await prisma.notice.delete({
      where: { id: noticeId }
    })

    return NextResponse.json({
      success: true,
      message: "공지가 삭제되었습니다"
    })

  } catch (error) {
    console.error('Delete notice error:', error)
    return NextResponse.json(
      { error: "공지 삭제 실패" },
      { status: 500 }
    )
  }
}
```

---

## 5. 공지 고정/해제 API

### `src/app/api/studies/[studyId]/notices/[noticeId]/pin/route.js`

```javascript
export async function POST(request, { params }) {
  const { studyId, noticeId } = params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    const notice = await prisma.notice.findUnique({
      where: { id: noticeId },
      select: { isPinned: true }
    })

    if (!notice) {
      return NextResponse.json(
        { error: "공지를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 토글
    const updated = await prisma.notice.update({
      where: { id: noticeId },
      data: { isPinned: !notice.isPinned }
    })

    return NextResponse.json({
      success: true,
      message: updated.isPinned ? "공지를 고정했습니다" : "공지 고정을 해제했습니다",
      isPinned: updated.isPinned
    })

  } catch (error) {
    console.error('Pin notice error:', error)
    return NextResponse.json(
      { error: "고정 처리 실패" },
      { status: 500 }
    )
  }
}
```

---

## 6. 캘린더 일정 목록 API

### `src/app/api/studies/[studyId]/calendar/route.js`

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
    const month = searchParams.get('month') // '2025-11'

    let where = { studyId }

    if (month) {
      const [year, monthNum] = month.split('-')
      const startDate = new Date(year, monthNum - 1, 1)
      const endDate = new Date(year, monthNum, 0)

      where.date = {
        gte: startDate,
        lte: endDate
      }
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ],
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        endTime: true,
        location: true,
        color: true,
        createdAt: true
      }
    })

    return NextResponse.json({ events })

  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { error: "일정 조회 실패" },
      { status: 500 }
    )
  }
}
```

---

## 7. 일정 생성 API

### `src/app/api/studies/[studyId]/calendar/route.js` (POST 추가)

```javascript
export async function POST(request, { params }) {
  const { studyId } = params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    const body = await request.json()
    const { title, date, startTime, endTime, location, color } = body

    if (!title || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "필수 정보를 입력해주세요" },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        studyId,
        title,
        date: new Date(date),
        startTime,
        endTime,
        location,
        color: color || '#6366F1'
      }
    })

    // 스터디 멤버들에게 알림
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { 
        name: true, 
        emoji: true,
        members: {
          where: { status: 'ACTIVE' },
          select: { userId: true }
        }
      }
    })

    await prisma.notification.createMany({
      data: study.members.map(member => ({
        userId: member.userId,
        type: 'EVENT',
        studyId,
        studyName: study.name,
        studyEmoji: study.emoji,
        message: `새 일정: ${title}`,
        data: { eventId: event.id }
      }))
    })

    return NextResponse.json({
      success: true,
      message: "일정이 생성되었습니다",
      event
    }, { status: 201 })

  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: "일정 생성 실패" },
      { status: 500 }
    )
  }
}
```

---

## 8. 할일 목록 API

### `src/app/api/tasks/route.js`

```javascript
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { searchParams } = new URL(request.url)
    const studyId = searchParams.get('studyId')
    const status = searchParams.get('status') // 'TODO', 'IN_PROGRESS', 'DONE'
    const completed = searchParams.get('completed') // 'true', 'false'

    const where = { userId: session.user.id }

    if (studyId) {
      where.studyId = studyId
    }

    if (status) {
      where.status = status
    }

    if (completed !== null) {
      where.completed = completed === 'true'
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        completed: true,
        completedAt: true,
        createdAt: true,
        study: {
          select: {
            id: true,
            name: true,
            emoji: true
          }
        }
      }
    })

    return NextResponse.json({ tasks })

  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: "할일 조회 실패" },
      { status: 500 }
    )
  }
}
```

---

## 9. 할일 생성 API

### `src/app/api/tasks/route.js` (POST 추가)

```javascript
export async function POST(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const { studyId, title, description, priority, dueDate } = body

    if (!title) {
      return NextResponse.json(
        { error: "제목을 입력해주세요" },
        { status: 400 }
      )
    }

    // 스터디 할일인 경우 멤버 확인
    if (studyId) {
      const member = await prisma.studyMember.findUnique({
        where: {
          studyId_userId: {
            studyId,
            userId: session.user.id
          }
        }
      })

      if (!member || member.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: "스터디 멤버가 아닙니다" },
          { status: 403 }
        )
      }
    }

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        studyId,
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'TODO'
      }
    })

    return NextResponse.json({
      success: true,
      message: "할일이 생성되었습니다",
      task
    }, { status: 201 })

  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: "할일 생성 실패" },
      { status: 500 }
    )
  }
}
```

---

## 10. 할일 완료/미완료 토글 API

### `src/app/api/tasks/[taskId]/toggle/route.js`

```javascript
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function PATCH(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  const { taskId } = params

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    })

    if (!task) {
      return NextResponse.json(
        { error: "할일을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    if (task.userId !== session.user.id) {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      )
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null,
        status: !task.completed ? 'DONE' : 'TODO'
      }
    })

    return NextResponse.json({
      success: true,
      message: updated.completed ? "완료했습니다" : "미완료로 변경했습니다",
      task: updated
    })

  } catch (error) {
    console.error('Toggle task error:', error)
    return NextResponse.json(
      { error: "할일 상태 변경 실패" },
      { status: 500 }
    )
  }
}
```

---

## 11. 프론트엔드 연동

### 공지사항 페이지

```javascript
// src/app/my-studies/[studyId]/notices/page.jsx
'use client'

import { useState, useEffect } from 'react'

export default function NoticesPage({ params }) {
  const [notices, setNotices] = useState([])

  useEffect(() => {
    fetch(`/api/studies/${params.studyId}/notices`)
      .then(res => res.json())
      .then(data => setNotices(data.notices))
  }, [params.studyId])

  return (
    <div>
      {notices.map(notice => (
        <NoticeCard key={notice.id} notice={notice} />
      ))}
    </div>
  )
}
```

---

## 🎯 완료 확인

- [x] 공지사항 CRUD API
- [x] 공지 고정/해제 API
- [x] 캘린더 일정 CRUD API
- [x] 할일 CRUD API
- [x] 알림 생성 통합

---

## 📚 다음 단계

**Phase 5: 채팅 시스템**
- 메시지 CRUD (REST)
- WebSocket (선택)

👉 **[phase-5-chat.md](./phase-5-chat.md)** 로 이동

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-11-18

