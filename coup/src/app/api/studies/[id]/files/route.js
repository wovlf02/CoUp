// src/app/api/studies/[id]/files/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import {
  validateFileSecurity,
  generateSafeFilename,
  checkStudyStorageQuota
} from "@/lib/utils/file-security-validator"
import { sanitizeFilename } from "@/lib/utils/xss-sanitizer"

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
    const category = formData.get('category') || 'DOCUMENT' // IMAGE, DOCUMENT, etc.

    if (!file) {
      return NextResponse.json(
        { error: "파일을 선택해주세요" },
        { status: 400 }
      )
    }

    // 1. 파일 이름 정제
    const sanitizedFilename = sanitizeFilename(file.name);

    if (!sanitizedFilename || sanitizedFilename === 'untitled') {
      return NextResponse.json(
        { error: "유효하지 않은 파일명입니다" },
        { status: 400 }
      );
    }

    // 2. 파일 버퍼 읽기
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 3. 파일 보안 검증 (통합)
    const securityValidation = await validateFileSecurity({
      filename: sanitizedFilename,
      mimeType: file.type,
      size: file.size,
      buffer: buffer,
    }, category);

    if (!securityValidation.valid) {
      console.warn('[File Security] Validation failed:', {
        userId: session.user.id,
        studyId,
        filename: sanitizedFilename,
        errors: securityValidation.errors,
      });

      return NextResponse.json(
        {
          error: "파일 보안 검증에 실패했습니다",
          details: securityValidation.errors.map(e => e.message),
        },
        { status: 400 }
      );
    }

    // 경고가 있으면 로깅
    if (securityValidation.warnings.length > 0) {
      console.warn('[File Security] Warnings:', {
        userId: session.user.id,
        studyId,
        filename: sanitizedFilename,
        warnings: securityValidation.warnings,
      });
    }

    // 4. 저장 공간 확인 (스터디당 1GB 제한)
    const studyQuota = 1024 * 1024 * 1024; // 1GB
    const studyUsed = await prisma.file.aggregate({
      where: { studyId },
      _sum: { size: true },
    });

    const currentUsage = studyUsed._sum.size || 0;
    const quotaCheck = checkStudyStorageQuota(studyId, file.size, studyQuota, currentUsage);

    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: "스터디 저장 공간이 부족합니다",
          details: {
            quota: `${quotaCheck.quotaInMB}MB`,
            used: `${quotaCheck.usedInMB}MB`,
            available: `${quotaCheck.availableInMB}MB`,
            requested: `${quotaCheck.requestedInMB}MB`,
          }
        },
        { status: 400 }
      );
    }

    // 5. uploads 폴더 생성
    const uploadsDir = join(process.cwd(), 'public', 'uploads', studyId)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // 6. 안전한 파일명 생성
    const safeFilename = generateSafeFilename(sanitizedFilename, session.user.id);
    const filepath = join(uploadsDir, safeFilename)

    // 7. 파일 저장
    await writeFile(filepath, buffer)

    // 8. DB에 파일 정보 저장
    const fileUrl = `/uploads/${studyId}/${safeFilename}`

    const savedFile = await prisma.file.create({
      data: {
        studyId,
        uploaderId: session.user.id,
        name: sanitizedFilename, // 원본 파일명 (정제된)
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

    // 9. 파일 업로드 알림 (최대 10명)
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
        message: `새 파일: ${sanitizedFilename}`
      }))
    })

    return NextResponse.json({
      success: true,
      message: "파일이 업로드되었습니다",
      data: savedFile,
      storage: {
        usagePercentage: quotaCheck.usagePercentage,
        used: `${(quotaCheck.afterUpload / (1024 * 1024)).toFixed(2)}MB`,
        quota: `${(studyQuota / (1024 * 1024)).toFixed(2)}MB`,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Upload file error:', error)
    return NextResponse.json(
      { error: "파일 업로드 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

