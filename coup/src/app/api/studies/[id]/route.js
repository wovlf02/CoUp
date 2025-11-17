// src/app/api/studies/[id]/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  try {
    const { id } = params

    // 스터디 조회
    const study = await prisma.study.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        members: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            },
            notices: true,
            files: true
          }
        }
      }
    })

    if (!study) {
      return NextResponse.json(
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 세션 확인 (선택)
    const session = await requireAuth()
    const isAuthenticated = !(session instanceof NextResponse)

    let isMember = false
    let myMembership = null

    if (isAuthenticated) {
      const membership = await prisma.studyMember.findUnique({
        where: {
          studyId_userId: {
            studyId: id,
            userId: session.user.id
          }
        }
      })

      if (membership) {
        isMember = membership.status === 'ACTIVE'
        myMembership = membership
      }
    }

    // 응답 데이터 (멤버가 아니면 제한된 정보만)
    const responseData = {
      id: study.id,
      name: study.name,
      emoji: study.emoji,
      description: study.description,
      category: study.category,
      subCategory: study.subCategory,
      tags: study.tags,
      maxMembers: study.maxMembers,
      currentMembers: study._count.members,
      isPublic: study.isPublic,
      isRecruiting: study.isRecruiting,
      rating: study.rating,
      reviewCount: study.reviewCount,
      owner: study.owner,
      createdAt: study.createdAt,
      isMember,
      myRole: myMembership?.role || null,
      // 멤버만 볼 수 있는 정보
      ...(isMember && {
        inviteCode: study.inviteCode,
        autoApprove: study.autoApprove,
        members: study.members.map(m => ({
          id: m.id,
          role: m.role,
          user: m.user,
          joinedAt: m.joinedAt
        })),
        counts: {
          notices: study._count.notices,
          files: study._count.files
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('Get study detail error:', error)
    return NextResponse.json(
      { error: "스터디 정보를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { id } = params
    const body = await request.json()

    // 스터디 소유자 확인
    const study = await prisma.study.findUnique({
      where: { id }
    })

    if (!study) {
      return NextResponse.json(
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    if (study.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "스터디 소유자만 수정할 수 있습니다" },
        { status: 403 }
      )
    }

    // 스터디 수정
    const updated = await prisma.study.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.emoji && { emoji: body.emoji }),
        ...(body.description && { description: body.description }),
        ...(body.category && { category: body.category }),
        ...(body.subCategory !== undefined && { subCategory: body.subCategory }),
        ...(body.maxMembers && { maxMembers: body.maxMembers }),
        ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
        ...(body.autoApprove !== undefined && { autoApprove: body.autoApprove }),
        ...(body.isRecruiting !== undefined && { isRecruiting: body.isRecruiting }),
        ...(body.tags && { tags: body.tags })
      }
    })

    return NextResponse.json({
      success: true,
      message: "스터디 정보가 수정되었습니다",
      data: updated
    })

  } catch (error) {
    console.error('Update study error:', error)
    return NextResponse.json(
      { error: "스터디 수정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { id } = params

    // 스터디 소유자 확인
    const study = await prisma.study.findUnique({
      where: { id }
    })

    if (!study) {
      return NextResponse.json(
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    if (study.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "스터디 소유자만 삭제할 수 있습니다" },
        { status: 403 }
      )
    }

    // 스터디 삭제 (CASCADE로 관련 데이터도 삭제됨)
    await prisma.study.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "스터디가 삭제되었습니다"
    })

  } catch (error) {
    console.error('Delete study error:', error)
    return NextResponse.json(
      { error: "스터디 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

