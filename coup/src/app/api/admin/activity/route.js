// src/app/api/admin/activity/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'SYSTEM_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const activities = await prisma.adminLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        createdAt: true,
      }
    })

    // 활동 설명 생성
    const formattedActivities = activities.map(log => ({
      id: log.id,
      description: getActivityDescription(log),
      createdAt: log.createdAt,
    }))

    return NextResponse.json(formattedActivities)
  } catch (error) {
    console.error('Activity fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

function getActivityDescription(log) {
  const actions = {
    USER_WARN: '사용자 경고',
    USER_SUSPEND: '사용자 정지',
    USER_UNSUSPEND: '사용자 정지 해제',
    STUDY_HIDE: '스터디 숨김',
    STUDY_CLOSE: '스터디 종료',
    REPORT_APPROVE: '신고 승인',
    REPORT_REJECT: '신고 기각',
  }

  return `${actions[log.action] || log.action} (${log.targetType} ${log.targetId})`
}

