// src/app/api/studies/[id]/tasks/[taskId]/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function PATCH(request, { params }) {
  const { id: studyId, taskId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session, member } = result

  try {
    const body = await request.json()

    const task = await prisma.studyTask.findUnique({
      where: { id: taskId },
      include: {
        assignees: true
      }
    })

    if (!task || task.studyId !== studyId) {
      return NextResponse.json(
        { error: "할일을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 권한 확인: 작성자, 담당자, ADMIN/OWNER
    const isAssignee = task.assignees.some(a => a.userId === session.user.id)
    const canEdit = task.createdById === session.user.id ||
                    isAssignee ||
                    ['OWNER', 'ADMIN'].includes(member.role)

    if (!canEdit) {
      return NextResponse.json(
        { error: "할일을 수정할 권한이 없습니다" },
        { status: 403 }
      )
    }

    // 담당자 업데이트가 있는 경우
    if (body.assigneeIds !== undefined) {
      await prisma.$transaction(async (tx) => {
        // 기존 담당자 삭제
        await tx.studyTaskAssignee.deleteMany({
          where: { taskId }
        })

        // 새 담당자 추가
        if (body.assigneeIds.length > 0) {
          await tx.studyTaskAssignee.createMany({
            data: body.assigneeIds.map(userId => ({
              taskId,
              userId
            }))
          })
        }

        // 할일 업데이트
        await tx.studyTask.update({
          where: { id: taskId },
          data: {
            ...(body.title && { title: body.title }),
            ...(body.description !== undefined && { description: body.description }),
            ...(body.status && { status: body.status }),
            ...(body.priority && { priority: body.priority }),
            ...(body.dueDate !== undefined && {
              dueDate: body.dueDate ? new Date(body.dueDate) : null
            })
          }
        })
      })
    } else {
      // 담당자 업데이트 없이 할일만 업데이트
      await prisma.studyTask.update({
        where: { id: taskId },
        data: {
          ...(body.title && { title: body.title }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.status && { status: body.status }),
          ...(body.priority && { priority: body.priority }),
          ...(body.dueDate !== undefined && {
            dueDate: body.dueDate ? new Date(body.dueDate) : null
          })
        }
      })
    }

    // 업데이트된 할일 조회
    const updated = await prisma.studyTask.findUnique({
      where: { id: taskId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    // assignees 데이터 정리
    const taskWithAssignees = {
      ...updated,
      assignees: updated.assignees.map(a => a.user)
    }

    return NextResponse.json({
      success: true,
      message: "할일이 수정되었습니다",
      data: taskWithAssignees
    })

  } catch (error) {
    console.error('Update study task error:', error)
    return NextResponse.json(
      { error: "할일 수정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  const { id: studyId, taskId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session, member } = result

  try {
    const task = await prisma.studyTask.findUnique({
      where: { id: taskId }
    })

    if (!task || task.studyId !== studyId) {
      return NextResponse.json(
        { error: "할일을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 권한 확인: 작성자 또는 ADMIN/OWNER만 삭제 가능
    const canDelete = task.createdById === session.user.id ||
                      ['OWNER', 'ADMIN'].includes(member.role)

    if (!canDelete) {
      return NextResponse.json(
        { error: "할일을 삭제할 권한이 없습니다" },
        { status: 403 }
      )
    }

    // 트랜잭션으로 담당자와 할일 삭제
    await prisma.$transaction([
      prisma.studyTaskAssignee.deleteMany({
        where: { taskId }
      }),
      prisma.studyTask.delete({
        where: { id: taskId }
      })
    ])

    return NextResponse.json({
      success: true,
      message: "할일이 삭제되었습니다"
    })

  } catch (error) {
    console.error('Delete study task error:', error)
    return NextResponse.json(
      { error: "할일 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

