// src/app/api/studies/[id]/files/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  try {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    let whereClause = { studyId }

    if (folderId) {
      whereClause.folderId = folderId
    } else {
      whereClause.folderId = null // 루트만
    }

    const total = await prisma.file.count({ where: whereClause })

    const files = await prisma.file.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: files,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json(
      { error: "파일 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const folderId = formData.get('folderId')

    if (!file) {
      return NextResponse.json(
        { error: "파일을 선택해주세요" },
        { status: 400 }
      )
    }

    // 파일 크기 제한 (50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "파일 크기는 50MB를 초과할 수 없습니다" },
        { status: 400 }
      )
    }

    // uploads 폴더 생성
    const uploadsDir = join(process.cwd(), 'public', 'uploads', studyId)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // 파일명 생성 (timestamp + 원본 파일명)
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const filepath = join(uploadsDir, filename)

    // 파일 저장
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // DB에 파일 정보 저장
    const fileUrl = `/uploads/${studyId}/${filename}`

    const savedFile = await prisma.file.create({
      data: {
        studyId,
        uploaderId: session.user.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        folderId: folderId || null
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    // 파일 업로드 알림
    const members = await prisma.studyMember.findMany({
      where: {
        studyId,
        status: 'ACTIVE',
        userId: { not: session.user.id }
      },
      take: 10
    })

    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { name: true, emoji: true }
    })

    await prisma.notification.createMany({
      data: members.map(member => ({
        userId: member.userId,
        type: 'FILE',
        studyId,
        studyName: study.name,
        studyEmoji: study.emoji,
        message: `새 파일: ${file.name}`
      }))
    })

    return NextResponse.json({
      success: true,
      message: "파일이 업로드되었습니다",
      data: savedFile
    }, { status: 201 })

  } catch (error) {
    console.error('Upload file error:', error)
    return NextResponse.json(
      { error: "파일 업로드 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

