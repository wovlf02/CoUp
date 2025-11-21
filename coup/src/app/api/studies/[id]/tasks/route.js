// src/app/api/studies/[id]/tasks/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

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
    const { title, description, status, priority, dueDate, assigneeIds } = body

    if (!title) {
      return NextResponse.json(
        { error: "제목을 입력해주세요" },
        { status: 400 }
      )
    }

    // 트랜잭션으로 할일과 담당자 생성
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

    // 담당자들에게 알림
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

