// src/app/api/studies/[id]/tasks/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { validateAndSanitize } from "@/lib/utils/input-sanitizer"

export async function GET(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // TODO | IN_PROGRESS | REVIEW | DONE | all

    let whereClause = { studyId }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    const tasks = await prisma.studyTask.findMany({
      where: whereClause,
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
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
    const tasksWithAssignees = tasks.map(task => ({
      ...task,
      assignees: task.assignees.map(a => a.user)
    }))

    return NextResponse.json({
      success: true,
      data: tasksWithAssignees
    })

  } catch (error) {
    console.error('Get study tasks error:', error)
    return NextResponse.json(
      { error: "할일 목록을 가져오는 중 오류가 발생했습니다" },
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
    const { title, description, status, priority, dueDate, assigneeIds } = sanitizedData;

    // 2. 제목 길이 검증 (1-200자)
    if (!title || title.length < 1 || title.length > 200) {
      return NextResponse.json({
        error: "제목은 1자 이상 200자 이하여야 합니다"
      }, { status: 400 });
    }

    // 3. 설명 길이 검증 (0-2000자)
    if (description && description.length > 2000) {
      return NextResponse.json({
        error: "설명은 최대 2000자까지 가능합니다"
      }, { status: 400 });
    }

    // 4. 상태 검증
    const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({
        error: "유효하지 않은 상태입니다. (TODO, IN_PROGRESS, REVIEW, DONE, CANCELLED 중 선택)"
      }, { status: 400 });
    }

    // 5. 우선순위 검증
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({
        error: "유효하지 않은 우선순위입니다. (LOW, MEDIUM, HIGH, URGENT 중 선택)"
      }, { status: 400 });
    }

    // 6. 담당자 멤버 확인
    if (assigneeIds && assigneeIds.length > 0) {
      const members = await prisma.studyMember.findMany({
        where: {
          studyId,
          userId: { in: assigneeIds },
          status: 'ACTIVE',
        },
      });

      if (members.length !== assigneeIds.length) {
        const validUserIds = members.map(m => m.userId);
        const invalidUserIds = assigneeIds.filter(id => !validUserIds.includes(id));
        return NextResponse.json({
          error: "일부 담당자가 스터디 멤버가 아닙니다",
          details: { invalidUserIds }
        }, { status: 400 });
      }
    }

    // 7. 마감일 과거 검증 (미래 날짜만 허용)
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0); // 오늘 날짜의 시작

      if (dueDateObj < now) {
        return NextResponse.json({
          error: "마감일은 현재보다 미래여야 합니다"
        }, { status: 400 });
      }
    }

    // 8. 트랜잭션으로 할일과 담당자 생성
    const task = await prisma.$transaction(async (tx) => {
      // 할일 생성
      const newTask = await tx.studyTask.create({
        data: {
          studyId,
          createdById: session.user.id,
          title,
          description: description || null,
          status: status || 'TODO',
          priority: priority || 'MEDIUM',
          dueDate: dueDate ? new Date(dueDate) : null
        }
      })

      // 담당자 추가
      if (assigneeIds && assigneeIds.length > 0) {
        await tx.studyTaskAssignee.createMany({
          data: assigneeIds.map(userId => ({
            taskId: newTask.id,
            userId
          }))
        })
      }

      // 담당자 정보 포함하여 반환
      return await tx.studyTask.findUnique({
        where: { id: newTask.id },
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
    })

    // 9. 담당자들에게 알림
    if (assigneeIds && assigneeIds.length > 0) {
      const study = await prisma.study.findUnique({
        where: { id: studyId },
        select: { name: true, emoji: true }
      })

      await prisma.notification.createMany({
        data: assigneeIds
          .filter(userId => userId !== session.user.id)
          .map(userId => ({
            userId,
            type: 'TASK_ASSIGNED',
            studyId,
            studyName: study.name,
            studyEmoji: study.emoji,
            message: `새 할일: ${title}`
          }))
      })
    }

    // assignees 데이터 정리
    const taskWithAssignees = {
      ...task,
      assignees: task.assignees.map(a => a.user)
    }

    return NextResponse.json({
      success: true,
      message: "할일이 생성되었습니다",
      data: taskWithAssignees
    }, { status: 201 })

  } catch (error) {
    console.error('Create study task error:', error)
    return NextResponse.json(
      { error: "할일 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

