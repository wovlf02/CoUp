import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { createTask, getTasksByStudyGroup } from '@/lib/services/taskService';
import { getStudyGroupById } from '@/lib/services/studyService';
import { StudyMemberStatus } from '@/lib/db/prisma';

export async function GET(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId } = params;

    const studyGroup = await getStudyGroupById(studyId);
    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check: Only members of the study group can view tasks
    const isMember = studyGroup.studyMembers.some(member => member.userId === user.id && member.status === StudyMemberStatus.ACTIVE);
    if (!isMember) {
      return errorResponse('Forbidden', 403);
    }

    const tasks = await getTasksByStudyGroup(studyId);

    return successResponse(tasks);
  } catch (error) {
    console.error('[API/studies/[studyId]/tasks/GET]', error);
    return errorResponse(error.message, 500);
  }
}

export async function POST(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId } = params;
    const body = await request.json();
    const { title, description, dueDate, assigneeId } = body;

    if (!title) {
      return errorResponse('Missing required field: title', 400);
    }

    const studyGroup = await getStudyGroupById(studyId);
    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check: Only members of the study group can create tasks
    const isMember = studyGroup.studyMembers.some(member => member.userId === user.id && member.status === StudyMemberStatus.ACTIVE);
    if (!isMember) {
      return errorResponse('Forbidden', 403);
    }

    const newTask = await createTask(studyId, user.id, title, description, dueDate ? new Date(dueDate) : null, assigneeId);

    return successResponse(newTask, 'Task created successfully', 201);
  } catch (error) {
    console.error('[API/studies/[studyId]/tasks/POST]', error);
    return errorResponse(error.message, 500);
  }
}
