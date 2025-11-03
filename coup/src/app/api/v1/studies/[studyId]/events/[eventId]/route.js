import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { updateEvent, deleteEvent } from '@/lib/services/eventService';
import { getStudyGroupById } from '@/lib/services/studyService';
import { StudyRole } from '@/lib/db/prisma';

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

    const studyGroup = await getStudyGroupById(studyId);
    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check: Only owner or admin can update events
    const isOwner = studyGroup.creatorId === user.id;
    const isAdmin = studyGroup.studyMembers.some(member => member.userId === user.id && member.role === StudyRole.ADMIN);

    if (!isOwner && !isAdmin) {
      return errorResponse('Forbidden', 403);
    }

    const updatedEvent = await updateEvent(eventId, { title, description, startTime, endTime });

    return successResponse(updatedEvent, 'Event updated successfully');
  } catch (error) {
    console.error('[API/studies/[studyId]/events/[eventId]/PATCH]', error);
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, eventId } = params;

    const studyGroup = await getStudyGroupById(studyId);
    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check: Only owner or admin can delete events
    const isOwner = studyGroup.creatorId === user.id;
    const isAdmin = studyGroup.studyMembers.some(member => member.userId === user.id && member.role === StudyRole.ADMIN);

    if (!isOwner && !isAdmin) {
      return errorResponse('Forbidden', 403);
    }

    await deleteEvent(eventId);

    return successResponse(null, 'Event deleted successfully', 204);
  } catch (error) {
    console.error('[API/studies/[studyId]/events/[eventId]/DELETE]', error);
    return errorResponse(error.message, 500);
  }
}