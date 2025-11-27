// src/app/api/admin/settings/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-helpers"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/settings
 * 시스템 설정 조회 (SYSTEM_ADMIN 전용)
 */
export async function GET(request) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  // SYSTEM_ADMIN 권한 체크
  if (auth.user.role !== 'SYSTEM_ADMIN') {
    return NextResponse.json(
      { success: false, error: "SYSTEM_ADMIN 권한이 필요합니다" },
      { status: 403 }
    )
  }

  try {
    // 설정 조회 (모든 설정)
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' }
    })

    // key-value 형태로 변환
    const settingsMap = {}
    settings.forEach(setting => {
      settingsMap[setting.key] = {
        value: setting.value,
        description: setting.description,
        updatedAt: setting.updatedAt
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        settings: settingsMap
      }
    })

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: "설정 조회 실패" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/settings
 * 시스템 설정 업데이트 (SYSTEM_ADMIN 전용)
 */
export async function PATCH(request) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  // SYSTEM_ADMIN 권한 체크
  if (auth.user.role !== 'SYSTEM_ADMIN') {
    return NextResponse.json(
      { success: false, error: "SYSTEM_ADMIN 권한이 필요합니다" },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: "설정 데이터가 올바르지 않습니다" },
        { status: 400 }
      )
    }

    // 각 설정 업데이트
    const updatePromises = Object.entries(settings).map(([key, value]) => {
      return prisma.systemSetting.upsert({
        where: { key },
        update: {
          value: String(value),
          updatedBy: auth.user.id
        },
        create: {
          key,
          value: String(value),
          updatedBy: auth.user.id
        }
      })
    })

    await Promise.all(updatePromises)

    // 로그 기록
    await prisma.adminLog.create({
      data: {
        adminId: auth.user.id,
        action: 'UPDATE_SYSTEM_SETTINGS',
        targetType: 'SYSTEM',
        details: { updatedKeys: Object.keys(settings) },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: "설정이 업데이트되었습니다"
    })

  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { success: false, error: "설정 업데이트 실패" },
      { status: 500 }
    )
  }
}

