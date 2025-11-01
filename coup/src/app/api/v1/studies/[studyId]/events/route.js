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

    const events = await prisma.event.findMany({
      where: { studyGroupId: studyId },
      include: { creator: { select: { id: true, name: true, imageUrl: true } } },
      orderBy: { startTime: 'asc' },
    });

    return successResponse(events);
  } catch (error) {
    console.error('[API/studies/[studyId]/events/GET]', error);
    return errorResponse('Failed to fetch events', 500);
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
    const { title, description, startTime, endTime } = body;

    if (!title || !startTime || !endTime) {
      return errorResponse('Missing required fields: title, startTime, endTime', 400);
    }

    // Check if the user is the creator or an admin of the study group
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

    if (!isCreator && !isAdmin) {
      return errorResponse('You are not authorized to create events in this study group', 403);
    }

    const newEvent = await prisma.event.create({
      data: {
        studyGroupId: studyId,
        creatorId: user.id,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return successResponse(newEvent, 'Event created successfully', 201);
  } catch (error) {
    console.error('[API/studies/[studyId]/events/POST]', error);
    return errorResponse('Failed to create event', 500);
  }
}
