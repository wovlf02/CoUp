import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import prisma from '@/lib/db/prisma';

export async function PATCH(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, taskId } = params;
    const body = await request.json();
    const { title, description, dueDate, assigneeId, isCompleted } = body;

    // Check if the user is a member of the study group and has rights to update
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId, studyGroupId: studyId },
      select: { creatorId: true, assigneeId: true },
    });

    if (!existingTask) {
      return errorResponse('Task not found', 404);
    }

    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true },
    });

    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    const isCreator = studyGroup.creatorId === user.id;

    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: user.id, status: 'ACTIVE' },
      select: { role: true },
    });

    const isAdmin = studyMember && studyMember.role === 'ADMIN';

    // Only creator, assignee, owner, or admin can update the task
    if (existingTask.creatorId !== user.id && existingTask.assigneeId !== user.id && !isCreator && !isAdmin) {
      return errorResponse('You are not authorized to update this task', 403);
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId, studyGroupId: studyId },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assigneeId,
        isCompleted,
      },
    });

    return successResponse(updatedTask, 'Task updated successfully');
  } catch (error) {
    console.error('[API/studies/[studyId]/tasks/[taskId]/PATCH]', error);
    return errorResponse('Failed to update task', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, taskId } = params;

    // Check if the user is an owner or admin of the study group, or the creator of the task
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId, studyGroupId: studyId },
      select: { creatorId: true },
    });

    if (!existingTask) {
      return errorResponse('Task not found', 404);
    }

    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true },
    });

    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    const isCreator = studyGroup.creatorId === user.id;

    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: user.id, status: 'ACTIVE' },
      select: { role: true },
    });

    const isAdmin = studyMember && studyMember.role === 'ADMIN';

    if (existingTask.creatorId !== user.id && !isCreator && !isAdmin) {
      return errorResponse('You are not authorized to delete this task', 403);
    }

    await prisma.task.delete({
      where: { id: taskId, studyGroupId: studyId },
    });

    return successResponse(null, 'Task deleted successfully', 204);
  } catch (error) {
    console.error('[API/studies/[studyId]/tasks/[taskId]/DELETE]', error);
    return errorResponse('Failed to delete task', 500);
  }
}