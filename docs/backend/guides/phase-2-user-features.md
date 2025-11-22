# Phase 2: 사용자 기능 구현

> **목표**: 사용자 프로필, 대시보드, 내 스터디 목록 API  
> **예상 시간**: 4-6시간  
> **선행 조건**: Phase 1 완료 (인증 시스템)

---

## 📋 체크리스트

- [ ] 내 정보 조회 API
- [ ] 프로필 수정 API
- [ ] 비밀번호 변경 API
- [ ] 대시보드 데이터 API
- [ ] 내 스터디 목록 API
- [ ] 사용자 통계 API
- [ ] 프론트엔드 연동
- [ ] 테스트

---

## 1. 내 정보 조회 API

### `src/app/api/users/me/route.js`

```javascript
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        provider: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            studyMembers: {
              where: { status: 'ACTIVE' }
            },
            tasks: {
              where: { completed: false }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      user: {
        ...user,
        studyCount: user._count.studyMembers,
        taskCount: user._count.tasks,
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: "사용자 정보 조회 실패" },
      { status: 500 }
    )
  }
}
```

---

## 2. 프로필 수정 API

### `src/app/api/users/me/route.js` (PATCH 추가)

```javascript
export async function PATCH(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const { name, bio, avatar } = body

    // 유효성 검사
    if (name && name.length < 2) {
      return NextResponse.json(
        { error: "이름은 2자 이상이어야 합니다" },
        { status: 400 }
      )
    }

    // 업데이트할 데이터 구성
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (avatar !== undefined) updateData.avatar = avatar

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: "프로필이 수정되었습니다",
      user
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: "프로필 수정 실패" },
      { status: 500 }
    )
  }
}
```

---

## 3. 비밀번호 변경 API

### `src/app/api/users/me/password/route.js`

```javascript
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PATCH(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { currentPassword, newPassword } = await request.json()

    // 유효성 검사
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "현재 비밀번호와 새 비밀번호를 입력해주세요" },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "새 비밀번호는 8자 이상이어야 합니다" },
        { status: 400 }
      )
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    // OAuth 사용자는 비밀번호 변경 불가
    if (!user.password) {
      return NextResponse.json(
        { error: "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다" },
        { status: 400 }
      )
    }

    // 현재 비밀번호 확인
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: "현재 비밀번호가 일치하지 않습니다" },
        { status: 400 }
      )
    }

    // 새 비밀번호 해싱 및 저장
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: "비밀번호가 변경되었습니다"
    })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: "비밀번호 변경 실패" },
      { status: 500 }
    )
  }
}
```

---

## 4. 대시보드 데이터 API

### `src/app/api/dashboard/route.js`

```javascript
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const userId = session.user.id

    // 1. 통계 카드 데이터
    const [
      myStudiesCount,
      unreadNotifications,
      incompleteTasks,
      upcomingEvents
    ] = await Promise.all([
      // 참여 스터디 수
      prisma.studyMember.count({
        where: {
          userId,
          status: 'ACTIVE'
        }
      }),
      // 읽지 않은 알림
      prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      }),
      // 미완료 할일
      prisma.task.count({
        where: {
          userId,
          completed: false
        }
      }),
      // 다가오는 일정 (7일 이내)
      prisma.event.count({
        where: {
          study: {
            members: {
              some: {
                userId,
                status: 'ACTIVE'
              }
            }
          },
          date: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // 2. 내 스터디 목록 (최대 6개)
    const myStudies = await prisma.studyMember.findMany({
      where: {
        userId,
        status: 'ACTIVE'
      },
      take: 6,
      orderBy: {
        study: {
          updatedAt: 'desc'
        }
      },
      select: {
        id: true,
        role: true,
        study: {
          select: {
            id: true,
            name: true,
            emoji: true,
            _count: {
              select: {
                members: {
                  where: { status: 'ACTIVE' }
                }
              }
            },
            updatedAt: true,
          }
        }
      }
    })

    // 3. 최근 활동 (알림 기반, 최대 5개)
    const recentActivities = await prisma.notification.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        studyName: true,
        studyEmoji: true,
        message: true,
        createdAt: true,
        isRead: true,
      }
    })

    return NextResponse.json({
      stats: {
        myStudies: myStudiesCount,
        newNotices: unreadNotifications,
        incompleteTasks,
        upcomingEvents,
      },
      myStudies: myStudies.map(member => ({
        id: member.study.id,
        name: member.study.name,
        emoji: member.study.emoji,
        role: member.role,
        members: member.study._count.members,
        lastActivity: member.study.updatedAt,
      })),
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        studyName: activity.studyName,
        studyEmoji: activity.studyEmoji,
        content: activity.message,
        time: activity.createdAt,
        isRead: activity.isRead,
      }))
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: "대시보드 데이터 조회 실패" },
      { status: 500 }
    )
  }
}
```

---

## 5. 내 스터디 목록 API

### `src/app/api/my-studies/route.js`

```javascript
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const userId = session.user.id

    // 필터 조건 구성
    const where = {
      userId,
    }

    if (filter === 'owner') {
      where.role = 'OWNER'
    } else if (filter === 'admin') {
      where.role = { in: ['OWNER', 'ADMIN'] }
    } else if (filter === 'pending') {
      where.status = 'PENDING'
    } else {
      where.status = 'ACTIVE'
    }

    // 총 개수 조회
    const total = await prisma.studyMember.count({ where })

    // 스터디 목록 조회
    const studyMembers = await prisma.studyMember.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        study: {
          updatedAt: 'desc'
        }
      },
      select: {
        id: true,
        role: true,
        status: true,
        study: {
          select: {
            id: true,
            name: true,
            emoji: true,
            description: true,
            category: true,
            maxMembers: true,
            updatedAt: true,
            _count: {
              select: {
                members: {
                  where: { status: 'ACTIVE' }
                },
                messages: {
                  where: {
                    createdAt: {
                      gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                  }
                },
                notices: {
                  where: {
                    createdAt: {
                      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      studies: studyMembers.map(member => ({
        id: member.study.id,
        name: member.study.name,
        emoji: member.study.emoji,
        description: member.study.description,
        category: member.study.category,
        role: member.role,
        status: member.status,
        members: {
          current: member.study._count.members,
          max: member.study.maxMembers
        },
        lastActivity: member.study.updatedAt,
        newMessages: member.study._count.messages,
        newNotices: member.study._count.notices,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('My studies error:', error)
    return NextResponse.json(
      { error: "내 스터디 목록 조회 실패" },
      { status: 500 }
    )
  }
}
```

---

## 6. 사용자 통계 API

### `src/app/api/users/me/stats/route.js`

```javascript
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const userId = session.user.id

    // 이번 주 시작일 (월요일)
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1))
    weekStart.setHours(0, 0, 0, 0)

    const [
      totalStudies,
      ownerStudies,
      completedTasksThisWeek,
      completedTasksTotal,
      messagesThisWeek,
    ] = await Promise.all([
      // 참여 스터디 수
      prisma.studyMember.count({
        where: { userId, status: 'ACTIVE' }
      }),
      // 내가 만든 스터디
      prisma.studyMember.count({
        where: { userId, status: 'ACTIVE', role: 'OWNER' }
      }),
      // 이번 주 완료한 할일
      prisma.task.count({
        where: {
          userId,
          completed: true,
          completedAt: { gte: weekStart }
        }
      }),
      // 전체 완료한 할일
      prisma.task.count({
        where: { userId, completed: true }
      }),
      // 이번 주 채팅 메시지
      prisma.message.count({
        where: {
          userId,
          createdAt: { gte: weekStart }
        }
      }),
    ])

    return NextResponse.json({
      stats: {
        thisWeek: {
          completedTasks: completedTasksThisWeek,
          chatMessages: messagesThisWeek,
        },
        total: {
          studyCount: totalStudies,
          ownerCount: ownerStudies,
          completedTasks: completedTasksTotal,
        }
      }
    })

  } catch (error) {
    console.error('User stats error:', error)
    return NextResponse.json(
      { error: "사용자 통계 조회 실패" },
      { status: 500 }
    )
  }
}
```

---

## 7. 프론트엔드 연동

### Dashboard 페이지 수정

```javascript
// src/app/dashboard/page.jsx
'use client'

import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch dashboard:', err)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>대시보드</h1>
      
      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          label="참여 스터디" 
          value={data.stats.myStudies} 
        />
        <StatCard 
          label="새 공지" 
          value={data.stats.newNotices} 
        />
        <StatCard 
          label="할 일" 
          value={data.stats.incompleteTasks} 
        />
        <StatCard 
          label="다가올 일정" 
          value={data.stats.upcomingEvents} 
        />
      </div>

      {/* 내 스터디 */}
      <section>
        <h2>내 스터디</h2>
        <div className="grid grid-cols-3 gap-4">
          {data.myStudies.map(study => (
            <StudyCard key={study.id} study={study} />
          ))}
        </div>
      </section>

      {/* 최근 활동 */}
      <section>
        <h2>최근 활동</h2>
        {data.recentActivities.map(activity => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </section>
    </div>
  )
}
```

---

## 8. 테스트

### 1. 내 정보 조회
```bash
curl http://localhost:3000/api/users/me \
  -H "Cookie: next-auth.session-token=..."
```

### 2. 프로필 수정
```bash
curl -X PATCH http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{
    "name": "홍길동",
    "bio": "안녕하세요!"
  }'
```

### 3. 대시보드 데이터
```bash
curl http://localhost:3000/api/dashboard \
  -H "Cookie: ..."
```

### 4. 내 스터디 목록
```bash
curl http://localhost:3000/api/my-studies?filter=all&page=1 \
  -H "Cookie: ..."
```

---

## 🎯 완료 확인

- [x] 내 정보 조회 API
- [x] 프로필 수정 API
- [x] 비밀번호 변경 API
- [x] 대시보드 데이터 API
- [x] 내 스터디 목록 API
- [x] 사용자 통계 API
- [x] 프론트엔드 연동

---

## 📚 다음 단계

**Phase 3: 스터디 핵심 기능**
- 스터디 CRUD
- 멤버 관리
- 가입/승인 시스템

👉 **[phase-3-study-core.md](./phase-3-study-core.md)** 로 이동

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-11-18

