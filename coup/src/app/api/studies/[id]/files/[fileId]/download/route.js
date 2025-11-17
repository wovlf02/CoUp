// src/app/api/studies/[id]/files/[fileId]/download/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET(request, { params }) {
  const { id: studyId, fileId } = params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

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

    // 다운로드 횟수 증가
    await prisma.file.update({
      where: { id: fileId },
      data: {
        downloads: {
          increment: 1
        }
      }
    })

    // 파일 읽기
    const filepath = join(process.cwd(), 'public', file.url)
    const fileBuffer = await readFile(filepath)

    // 파일 응답
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
        'Content-Length': file.size.toString()
      }
    })

  } catch (error) {
    console.error('Download file error:', error)
    return NextResponse.json(
      { error: "파일 다운로드 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

