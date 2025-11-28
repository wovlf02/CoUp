import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/adminAuth'

const prisma = new PrismaClient()

// 메모리 캐시
let settingsCache = null
let cacheTimestamp = null
const CACHE_TTL = 5 * 60 * 1000 // 5분

// 설정 값 파싱 함수
function parseSettingValue(value, type) {
  switch (type) {
    case 'number':
      return Number(value)
    case 'boolean':
      return value === 'true'
    case 'json':
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    default:
      return value
  }
}

// 설정 카테고리별 그룹화
function groupSettingsByCategory(settings) {
  const grouped = {}

  settings.forEach(setting => {
    if (!grouped[setting.category]) {
      grouped[setting.category] = {}
    }

    grouped[setting.category][setting.key] = {
      value: parseSettingValue(setting.value, setting.type),
      type: setting.type,
      description: setting.description,
      updatedAt: setting.updatedAt,
      updatedBy: setting.updatedBy
    }
  })

  return grouped
}

// GET /api/admin/settings - 설정 조회
export async function GET(request) {
  try {
    // 권한 확인
    const auth = await requireAdmin(request, 'SETTINGS_VIEW')
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(request.url)
    const useCache = searchParams.get('cache') !== 'false'

    // 캐시 확인
    if (useCache && settingsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: settingsCache,
        cached: true
      })
    }

    // 데이터베이스에서 설정 조회
    const settings = await prisma.systemSetting.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })

    // 카테고리별 그룹화
    const grouped = groupSettingsByCategory(settings)

    // 캐시 업데이트
    settingsCache = grouped
    cacheTimestamp = Date.now()

    return NextResponse.json({
      success: true,
      data: grouped
    })

  } catch (error) {
    console.error('❌ GET /api/admin/settings error:', error)
    return NextResponse.json(
      { success: false, error: '설정을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/settings - 설정 업데이트
export async function PUT(request) {
  try {
    // 권한 확인
    const auth = await requireAdmin(request, 'SETTINGS_UPDATE')
    if (auth instanceof NextResponse) return auth

    const body = await request.json()
    const { settings } = body

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 설정 데이터입니다.' },
        { status: 400 }
      )
    }

    // 트랜잭션으로 일괄 업데이트
    const updates = await prisma.$transaction(
      settings.map(setting =>
        prisma.systemSetting.update({
          where: { key: setting.key },
          data: {
            value: String(setting.value),
            updatedBy: auth.adminId
          }
        })
      )
    )

    // 캐시 무효화
    settingsCache = null
    cacheTimestamp = null

    // 감사 로그 기록
    await prisma.adminLog.create({
      data: {
        adminId: auth.adminId,
        action: 'SETTINGS_UPDATE',
        after: { settings },
        reason: `${settings.length}개의 설정 업데이트`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: '설정이 업데이트되었습니다.',
      updated: updates.length
    })

  } catch (error) {
    console.error('❌ PUT /api/admin/settings error:', error)
    return NextResponse.json(
      { success: false, error: '설정을 업데이트하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

