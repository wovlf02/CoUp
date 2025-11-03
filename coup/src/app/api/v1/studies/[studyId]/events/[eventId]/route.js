import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import prisma, { StudyMemberStatus, StudyRole } from '@/lib/db/prisma';

export async function PATCH(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, eventId } = params;
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
      where: { studyGroupId: studyId, userId: user.id, status: StudyMemberStatus.ACTIVE },
      select: { role: true },
    });

    const isAdmin = studyMember && studyMember.role === StudyRole.ADMIN;

    if (!isCreator && !isAdmin) {
      return errorResponse('You are not authorized to update events in this study group', 403);
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId, studyGroupId: studyId },
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return successResponse(updatedEvent, 'Event updated successfully');
  } catch (error) {
    console.error('[API/studies/[studyId]/events/[eventId]/PATCH]', error);
    return errorResponse('Failed to update event', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, eventId } = params;

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
      where: { studyGroupId: studyId, userId: user.id, status: StudyMemberStatus.ACTIVE },
      select: { role: true },
    });

    const isAdmin = studyMember && studyMember.role === StudyRole.ADMIN;

    if (!isCreator && !isAdmin) {
      return errorResponse('You are not authorized to delete events from this study group', 403);
    }

    await prisma.event.delete({
      where: { id: eventId, studyGroupId: studyId },
    });

    return successResponse(null, 'Event deleted successfully', 204);
  } catch (error) {
    console.error('[API/studies/[studyId]/events/[eventId]/DELETE]', error);
    return errorResponse('Failed to delete event', 500);
  }
}