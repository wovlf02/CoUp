import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { updateTask, deleteTask } from '@/lib/services/taskService';
import { getStudyGroupById } from '@/lib/services/studyService';
import { StudyRole } from '@/lib/db/prisma';

export async function PATCH(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, taskId } = params;
    const body = await request.json();
    const { title, description, dueDate, assigneeId, isCompleted } = body;

    const studyGroup = await getStudyGroupById(studyId);
    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check: Only creator, assignee, owner, or admin can update the task
    const isOwner = studyGroup.creatorId === user.id;
    const isAdmin = studyGroup.studyMembers.some(member => member.userId === user.id && member.role === StudyRole.ADMIN);

    const updatedTask = await updateTask(taskId, { title, description, dueDate, assigneeId, isCompleted }, user.id, isOwner, isAdmin);

    return successResponse(updatedTask, 'Task updated successfully');
  } catch (error) {
    console.error('[API/studies/[studyId]/tasks/[taskId]/PATCH]', error);
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, taskId } = params;

    const studyGroup = await getStudyGroupById(studyId);
    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check: Only creator, owner, or admin can delete the task
    const isOwner = studyGroup.creatorId === user.id;
    const isAdmin = studyGroup.studyMembers.some(member => member.userId === user.id && member.role === StudyRole.ADMIN);

    await deleteTask(taskId, user.id, isOwner, isAdmin);

    return successResponse(null, 'Task deleted successfully', 204);
  } catch (error) {
    console.error('[API/studies/[studyId]/tasks/[taskId]/DELETE]', error);
    return errorResponse(error.message, 500);
  }
}