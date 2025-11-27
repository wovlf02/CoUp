# 대시보드 API

> **Base URL**: `/api/admin/dashboard`  
> **권한**: ADMIN, SYSTEM_ADMIN

---

## 📋 목차

1. [대시보드 데이터 조회](#1-대시보드-데이터-조회)
2. [최근 활동 조회](#2-최근-활동-조회)
3. [긴급 알림 조회](#3-긴급-알림-조회)

---

## 1. 대시보드 데이터 조회

### `GET /api/admin/dashboard`

대시보드에 필요한 모든 데이터를 한 번에 조회합니다.

#### 요청
```
GET /api/admin/dashboard
```

#### 쿼리 파라미터
없음 (항상 최신 데이터 반환)

#### 응답 (200 OK)
```json
{
  "success": true,
  "data": {
    "stats": {
      "newUsers": {
        "today": 45,
        "changeRate": 12.5
      },
      "activeUsers": {
        "today": 1234,
        "changeRate": -3.2
      },
      "pendingReports": {
        "total": 8,
        "urgent": 3
      },
      "suspendedUsers": {
        "total": 3,
        "todaySuspended": 1
      }
    },
    "charts": {
      "userTrend": [
        { "date": "2025-11-20", "count": 38 },
        { "date": "2025-11-21", "count": 42 },
        { "date": "2025-11-22", "count": 40 },
        { "date": "2025-11-23", "count": 45 },
        { "date": "2025-11-24", "count": 48 },
        { "date": "2025-11-25", "count": 43 },
        { "date": "2025-11-26", "count": 45 }
      ],
      "reportDistribution": [
        { "type": "USER", "count": 28, "percentage": 46.7 },
        { "type": "STUDY", "count": 18, "percentage": 30.0 },
        { "type": "CONTENT", "count": 14, "percentage": 23.3 }
      ],
      "studyTrend": [
        { "date": "2025-11-20", "count": 2 },
        { "date": "2025-11-21", "count": 3 },
        { "date": "2025-11-22", "count": 1 },
        { "date": "2025-11-23", "count": 2 },
        { "date": "2025-11-24", "count": 4 },
        { "date": "2025-11-25", "count": 2 },
        { "date": "2025-11-26", "count": 1 }
      ]
    },
    "alerts": [
      {
        "id": "alert_1",
        "type": "PENDING_REPORTS",
        "severity": "CRITICAL",
        "message": "미처리 신고 15건 대기 중",
        "count": 15,
        "link": "/admin/reports?status=pending"
      },
      {
        "id": "alert_2",
        "type": "PROFANITY_REPORTS",
        "severity": "CRITICAL",
        "message": "욕설 신고 5건 대기",
        "count": 5,
        "link": "/admin/reports?type=profanity&status=pending"
      }
    ],
    "recentActivities": [
      {
        "id": "log_123",
        "adminId": "admin_1",
        "adminName": "관리자1",
        "action": "USER_SUSPEND",
        "target": "user_123",
        "description": "사용자 user123 1일 정지 (사유: 욕설)",
        "createdAt": "2025-11-26T10:30:00Z"
      },
      {
        "id": "log_124",
        "adminId": "admin_2",
        "adminName": "관리자2",
        "action": "REPORT_RESOLVED",
        "target": "report_456",
        "description": "신고 #456 처리 완료 (승인)",
        "createdAt": "2025-11-26T09:15:00Z"
      }
    ]
  }
}
```

#### 에러 응답
```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

#### 구현 예시
```javascript
// app/api/admin/dashboard/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req) {
  try {
    // 1. 권한 체크
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'SYSTEM_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // 2. 통계 계산
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const [
      newUsersToday,
      newUsersYesterday,
      activeUsersToday,
      activeUsersYesterday,
      pendingReports,
      urgentReports,
      suspendedUsers,
      todaySuspended
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: today } }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: yesterday, lt: today }
        }
      }),
      prisma.userActivity.groupBy({
        by: ['userId'],
        where: { activityAt: { gte: today } }
      }).then(r => r.length),
      prisma.userActivity.groupBy({
        by: ['userId'],
        where: { activityAt: { gte: yesterday, lt: today } }
      }).then(r => r.length),
      prisma.report.count({
        where: { status: 'PENDING' }
      }),
      prisma.report.count({
        where: { status: 'PENDING', priority: 'URGENT' }
      }),
      prisma.user.count({
        where: {
          status: 'SUSPENDED',
          OR: [
            { suspendedUntil: null },
            { suspendedUntil: { gt: new Date() } }
          ]
        }
      }),
      prisma.sanction.count({
        where: {
          type: 'SUSPEND',
          createdAt: { gte: today }
        }
      })
    ])

    // 3. 증감률 계산
    const newUsersChange = newUsersYesterday > 0
      ? ((newUsersToday - newUsersYesterday) / newUsersYesterday) * 100
      : 0
    const activeUsersChange = activeUsersYesterday > 0
      ? ((activeUsersToday - activeUsersYesterday) / activeUsersYesterday) * 100
      : 0

    // 4. 차트 데이터 (최근 7일)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const userTrend = await prisma.$queryRaw`
      SELECT DATE(createdAt) as date, COUNT(*) as count
      FROM User
      WHERE createdAt >= ${sevenDaysAgo}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `

    const reportDistribution = await prisma.report.groupBy({
      by: ['reportType'],
      _count: true,
      where: { createdAt: { gte: sevenDaysAgo } }
    })

    const totalReports = reportDistribution.reduce((sum, r) => sum + r._count, 0)

    // 5. 긴급 알림
    const alerts = []
    if (pendingReports >= 10) {
      alerts.push({
        id: 'alert_pending',
        type: 'PENDING_REPORTS',
        severity: 'CRITICAL',
        message: `미처리 신고 ${pendingReports}건 대기 중`,
        count: pendingReports,
        link: '/admin/reports?status=pending'
      })
    }
    if (urgentReports >= 3) {
      alerts.push({
        id: 'alert_urgent',
        type: 'URGENT_REPORTS',
        severity: 'CRITICAL',
        message: `긴급 신고 ${urgentReports}건 대기`,
        count: urgentReports,
        link: '/admin/reports?priority=urgent&status=pending'
      })
    }

    // 6. 최근 활동
    const recentActivities = await prisma.adminLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          newUsers: {
            today: newUsersToday,
            changeRate: parseFloat(newUsersChange.toFixed(1))
          },
          activeUsers: {
            today: activeUsersToday,
            changeRate: parseFloat(activeUsersChange.toFixed(1))
          },
          pendingReports: {
            total: pendingReports,
            urgent: urgentReports
          },
          suspendedUsers: {
            total: suspendedUsers,
            todaySuspended: todaySuspended
          }
        },
        charts: {
          userTrend,
          reportDistribution: reportDistribution.map(r => ({
            type: r.reportType,
            count: r._count,
            percentage: (r._count / totalReports) * 100
          })),
          studyTrend: [] // 생략
        },
        alerts,
        recentActivities: recentActivities.map(log => ({
          id: log.id,
          adminId: log.adminId,
          adminName: log.admin.name,
          action: log.action,
          target: log.targetId,
          description: log.description,
          createdAt: log.createdAt
        }))
      }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
```

---

## 2. 최근 활동 조회

### `GET /api/admin/dashboard/activities`

최근 관리 활동을 더 많이 조회합니다 (무한 스크롤용).

#### 요청
```
GET /api/admin/dashboard/activities?page=1&limit=20
```

#### 쿼리 파라미터
- `page` (number, optional): 페이지 번호 (기본: 1)
- `limit` (number, optional): 페이지 크기 (기본: 20)

#### 응답 (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "log_123",
      "adminId": "admin_1",
      "adminName": "관리자1",
      "action": "USER_SUSPEND",
      "targetType": "User",
      "targetId": "user_123",
      "description": "사용자 user123 1일 정지",
      "createdAt": "2025-11-26T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 245,
    "totalPages": 13,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 3. 긴급 알림 조회

### `GET /api/admin/dashboard/alerts`

긴급 알림만 조회합니다.

#### 요청
```
GET /api/admin/dashboard/alerts
```

#### 응답 (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "alert_1",
      "type": "PENDING_REPORTS",
      "severity": "CRITICAL",
      "message": "미처리 신고 15건 대기 중",
      "count": 15,
      "link": "/admin/reports?status=pending",
      "createdAt": "2025-11-26T10:00:00Z"
    }
  ]
}
```

#### 알림 유형
- `PENDING_REPORTS`: 미처리 신고 급증
- `URGENT_REPORTS`: 긴급 신고 대기
- `SPAM_DETECTED`: 스팸 계정 탐지
- `SYSTEM_ERROR`: 시스템 에러 급증
- `SUSPENDED_SPIKE`: 정지 사용자 급증

---

## 데이터 캐싱

대시보드 데이터는 1분간 캐싱됩니다.

```javascript
// lib/cache.js
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function getCachedDashboard() {
  const cached = await redis.get('admin:dashboard')
  if (cached) return cached
  
  const data = await fetchDashboardData()
  await redis.setex('admin:dashboard', 60, JSON.stringify(data))
  
  return data
}
```

---

**다음 문서**: `02-users-api.md`

