import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import prisma from '@/lib/db/prisma';

export async function GET(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId } = params;

    // Check if the user is an active member of the study group
    const isMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: user.id, status: 'ACTIVE' },
    });

    if (!isMember) {
      return errorResponse('You are not a member of this study group', 403);
    }

    const tasks = await prisma.task.findMany({
      where: { studyGroupId: studyId },
      include: {
        creator: { select: { id: true, name: true, imageUrl: true } },
        assignee: { select: { id: true, name: true, imageUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(tasks);
  } catch (error) {
    console.error('[API/studies/[studyId]/tasks/GET]', error);
    return errorResponse('Failed to fetch tasks', 500);
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

    // Check if the user is a member of the study group
    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: user.id },
    });

    if (!studyMember) {
      return errorResponse('You are not a member of this study group', 403);
    }

    const newTask = await prisma.task.create({
      data: {
        studyGroupId: studyId,
        creatorId: user.id,
        assigneeId: assigneeId || null, // Assignee is optional
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        isCompleted: false,
      },
    });

    return successResponse(newTask, 'Task created successfully', 201);
  } catch (error) {
    console.error('[API/studies/[studyId]/tasks/POST]', error);
    return errorResponse('Failed to create task', 500);
  }
}
