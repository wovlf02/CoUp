// src/app/api/studies/[id]/files/[fileId]/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { unlink } from "fs/promises"
import { join } from "path"

export async function DELETE(request, { params }) {
  const { id: studyId, fileId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session, member } = result

  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    })

    if (!file || file.studyId !== studyId) {
      return NextResponse.json(
        { error: "파일을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 업로더 또는 ADMIN+ 권한 확인
    if (file.uploaderId !== session.user.id && !['OWNER', 'ADMIN'].includes(member.role)) {
      return NextResponse.json(
        { error: "파일 삭제 권한이 없습니다" },
        { status: 403 }
      )
    }

    // 파일 시스템에서 삭제
    try {
      const filepath = join(process.cwd(), 'public', file.url)
      await unlink(filepath)
    } catch (error) {
      console.error('File system delete error:', error)
      // 파일이 없어도 DB에서는 삭제
    }

    // DB에서 파일 정보 삭제
    await prisma.file.delete({
      where: { id: fileId }
    })

    return NextResponse.json({
      success: true,
      message: "파일이 삭제되었습니다"
    })

  } catch (error) {
    console.error('Delete file error:', error)
    return NextResponse.json(
      { error: "파일 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

