import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { createEvent, getEventsByStudyGroup } from '@/lib/services/eventService';
import { getStudyGroupById } from '@/lib/services/studyService';
import { StudyRole } from '@/lib/db/prisma';

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

    // Authorization check: Only members of the study group can view events
    const isMember = studyGroup.studyMembers.some(member => member.userId === user.id);
    if (!isMember) {
      return errorResponse('Forbidden', 403);
    }

    const events = await getEventsByStudyGroup(studyId);

    return successResponse(events);
  } catch (error) {
    console.error('[API/studies/[studyId]/events/GET]', error);
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
    const { title, description, startTime, endTime } = body;

    if (!title || !startTime || !endTime) {
      return errorResponse('Missing required fields: title, startTime, endTime', 400);
    }

    const studyGroup = await getStudyGroupById(studyId);
    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check: Only owner or admin can create events
    const isOwner = studyGroup.creatorId === user.id;
    const isAdmin = studyGroup.studyMembers.some(member => member.userId === user.id && member.role === StudyRole.ADMIN);

    if (!isOwner && !isAdmin) {
      return errorResponse('Forbidden', 403);
    }

    const newEvent = await createEvent(studyId, user.id, title, description, startTime, endTime);

    return successResponse(newEvent, 'Event created successfully', 201);
  } catch (error) {
    console.error('[API/studies/[studyId]/events/POST]', error);
    return errorResponse(error.message, 500);
  }
}
