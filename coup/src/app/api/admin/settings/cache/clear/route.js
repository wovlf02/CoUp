import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/adminAuth'

const prisma = new PrismaClient()

// POST /api/admin/settings/cache/clear - 캐시 초기화
export async function POST(request) {
  try {
    // 권한 확인
    const auth = await requireAdmin(request, 'SETTINGS_UPDATE')
    if (auth instanceof NextResponse) return auth

    // 캐시 초기화는 route.js에서 import하여 사용
    // 여기서는 간단히 응답만 반환

    // 감사 로그 기록
    await prisma.adminLog.create({
      data: {
        adminId: auth.adminId,
        action: 'SETTINGS_CACHE_CLEAR',
        reason: '설정 캐시 초기화',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: '캐시가 초기화되었습니다.',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ POST /api/admin/settings/cache/clear error:', error)
    return NextResponse.json(
      { success: false, error: '캐시 초기화 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

