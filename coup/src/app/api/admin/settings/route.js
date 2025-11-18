// src/app/api/admin/settings/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// 값 파싱 함수
function parseValue(value, type) {
  switch (type) {
    case 'BOOLEAN':
      return value === 'true'
    case 'NUMBER':
      return parseFloat(value)
    case 'JSON':
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    default:
      return value
  }
}

// GET /api/admin/settings - 모든 설정 조회
export async function GET(request) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  try {
    const settings = await prisma.setting.findMany({
      orderBy: {
        key: 'asc'
      }
    })

    // 그룹화하여 반환
    const grouped = {}
    settings.forEach(s => {
      const [group, key] = s.key.split('.')
      if (!grouped[group]) grouped[group] = {}
      grouped[group][key] = parseValue(s.value, s.type)
    })

    return NextResponse.json({
      success: true,
      data: grouped
    })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: "설정을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/settings - 설정 수정
export async function PATCH(request) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json(
        { error: "설정 키가 필요합니다" },
        { status: 400 }
      )
    }

    // 설정 존재 확인
    const existingSetting = await prisma.setting.findUnique({
      where: { key }
    })

    if (!existingSetting) {
      return NextResponse.json(
        { error: "존재하지 않는 설정입니다" },
        { status: 404 }
      )
    }

    // 설정 업데이트
    const setting = await prisma.setting.update({
      where: { key },
      data: {
        value: String(value),
        updatedBy: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: "설정이 저장되었습니다",
      data: {
        key: setting.key,
        value: parseValue(setting.value, setting.type)
      }
    })
  } catch (error) {
    console.error('Update setting error:', error)
    return NextResponse.json(
      { error: "설정 업데이트 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

