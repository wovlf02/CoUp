// src/app/api/admin/reports/[id]/process/route.js
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  try {
    const { id } = await params
    const body = await request.json()
    const { action, resolution } = body
    // action: 'warn' | 'suspend' | 'delete' | 'reject'

    if (!action || !resolution) {
      return NextResponse.json(
        { error: "처리 내용을 입력해주세요" },
        { status: 400 }
      )
    }

    const report = await prisma.report.findUnique({
      where: { id }
    })

    if (!report) {
      return NextResponse.json(
        { error: "신고를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 신고 처리
    const updated = await prisma.report.update({
      where: { id },
      data: {
        status: action === 'reject' ? 'REJECTED' : 'RESOLVED',
        processedBy: session.user.id,
        processedAt: new Date(),
        resolution
      }
    })

    // 신고 대상에 대한 조치
    if (action !== 'reject') {
      if (report.targetType === 'USER') {
        // 사용자에 대한 조치
        if (action === 'suspend') {
          await prisma.user.update({
            where: { id: report.targetId },
            data: {
              status: 'SUSPENDED',
              suspendReason: `신고 처리: ${report.type}`,
              suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일
            }
          })
        } else if (action === 'delete') {
          await prisma.user.update({
            where: { id: report.targetId },
            data: { status: 'DELETED' }
          })
        }
      } else if (report.targetType === 'STUDY') {
        // 스터디에 대한 조치
        if (action === 'delete') {
          await prisma.study.delete({
            where: { id: report.targetId }
          })
        }
      } else if (report.targetType === 'MESSAGE') {
        // 메시지에 대한 조치
        if (action === 'delete') {
          await prisma.message.delete({
            where: { id: report.targetId }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "신고가 처리되었습니다",
      data: updated
    })

  } catch (error) {
    console.error('Process report error:', error)
    return NextResponse.json(
      { error: "신고 처리 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

