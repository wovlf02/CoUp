// src/app/api/studies/[id]/tasks/[taskId]/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { validateAndSanitize } from "@/lib/utils/input-sanitizer"

export async function PATCH(request, { params }) {
  const { id: studyId, taskId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session, member } = result

  try {
    const body = await request.json()

    // 1. 입력값 검증 및 정제
    const validation = validateAndSanitize(body, 'TASK');
    if (!validation.valid) {
      return NextResponse.json({
        error: "입력값이 유효하지 않습니다",
        details: validation.errors
      }, { status: 400 });
    }

    const sanitizedData = validation.sanitized;

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

    // 2. 제목 길이 검증
    if (sanitizedData.title !== undefined && (sanitizedData.title.length < 1 || sanitizedData.title.length > 200)) {
      return NextResponse.json({
        error: "제목은 1자 이상 200자 이하여야 합니다"
      }, { status: 400 });
    }

    // 3. 설명 길이 검증
    if (sanitizedData.description !== undefined && sanitizedData.description && sanitizedData.description.length > 2000) {
      return NextResponse.json({
        error: "설명은 최대 2000자까지 가능합니다"
      }, { status: 400 });
    }

    // 4. 상태 전환 규칙 검증
    if (sanitizedData.status) {
      const validTransitions = {
        TODO: ['IN_PROGRESS', 'CANCELLED'],
        IN_PROGRESS: ['REVIEW', 'DONE', 'TODO', 'CANCELLED'],
        REVIEW: ['DONE', 'IN_PROGRESS', 'TODO'],
        DONE: ['TODO'], // 재오픈
        CANCELLED: ['TODO'], // 재활성화
      };

      const allowedTransitions = validTransitions[task.status] || [];
      if (!allowedTransitions.includes(sanitizedData.status) && task.status !== sanitizedData.status) {
        return NextResponse.json({
          error: `상태를 ${task.status}에서 ${sanitizedData.status}(으)로 변경할 수 없습니다`,
          details: {
            currentStatus: task.status,
            requestedStatus: sanitizedData.status,
            allowedStatuses: allowedTransitions
          }
        }, { status: 400 });
      }
    }

    // 5. 우선순위 검증
    if (sanitizedData.priority) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
      if (!validPriorities.includes(sanitizedData.priority)) {
        return NextResponse.json({
          error: "유효하지 않은 우선순위입니다. (LOW, MEDIUM, HIGH, URGENT 중 선택)"
        }, { status: 400 });
      }
    }

    // 6. 담당자 멤버 확인
    if (sanitizedData.assigneeIds !== undefined && sanitizedData.assigneeIds.length > 0) {
      const members = await prisma.studyMember.findMany({
        where: {
          studyId,
          userId: { in: sanitizedData.assigneeIds },
          status: 'ACTIVE',
        },
      });

      if (members.length !== sanitizedData.assigneeIds.length) {
        const validUserIds = members.map(m => m.userId);
        const invalidUserIds = sanitizedData.assigneeIds.filter(id => !validUserIds.includes(id));
        return NextResponse.json({
          error: "일부 담당자가 스터디 멤버가 아닙니다",
          details: { invalidUserIds }
        }, { status: 400 });
      }
    }

    // 7. 마감일 검증
    if (sanitizedData.dueDate !== undefined && sanitizedData.dueDate) {
      const dueDateObj = new Date(sanitizedData.dueDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (dueDateObj < now) {
        return NextResponse.json({
          error: "마감일은 현재보다 미래여야 합니다"
        }, { status: 400 });
      }
    }

    // 8. 권한 확인: 작성자, 담당자, ADMIN/OWNER
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

    // 9. 담당자 업데이트가 있는 경우
    if (sanitizedData.assigneeIds !== undefined) {
      await prisma.$transaction(async (tx) => {
        // 기존 담당자 삭제
        await tx.studyTaskAssignee.deleteMany({
          where: { taskId }
        })

        // 새 담당자 추가
        if (sanitizedData.assigneeIds.length > 0) {
          await tx.studyTaskAssignee.createMany({
            data: sanitizedData.assigneeIds.map(userId => ({
              taskId,
              userId
            }))
          })
        }

        // 할일 업데이트
        await tx.studyTask.update({
          where: { id: taskId },
          data: {
            ...(sanitizedData.title !== undefined && { title: sanitizedData.title }),
            ...(sanitizedData.description !== undefined && { description: sanitizedData.description }),
            ...(sanitizedData.status !== undefined && { status: sanitizedData.status }),
            ...(sanitizedData.priority !== undefined && { priority: sanitizedData.priority }),
            ...(sanitizedData.dueDate !== undefined && {
              dueDate: sanitizedData.dueDate ? new Date(sanitizedData.dueDate) : null
            })
          }
        })
      })
    } else {
      // 담당자 업데이트 없이 할일만 업데이트
      await prisma.studyTask.update({
        where: { id: taskId },
        data: {
          ...(sanitizedData.title !== undefined && { title: sanitizedData.title }),
          ...(sanitizedData.description !== undefined && { description: sanitizedData.description }),
          ...(sanitizedData.status !== undefined && { status: sanitizedData.status }),
          ...(sanitizedData.priority !== undefined && { priority: sanitizedData.priority }),
          ...(sanitizedData.dueDate !== undefined && {
            dueDate: sanitizedData.dueDate ? new Date(sanitizedData.dueDate) : null
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

