import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { publishMessage } from '@/lib/utils/redis';
import { StudyService } from '@/lib/services/StudyService';
import { StudyMemberStatus } from '@/lib/db/prisma';

export async function GET(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId } = params;

    const events = await StudyService.getEvents(studyId, user.id);

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

    const { newEvent, studyGroup } = await StudyService.createEvent(studyId, user.id, title, description, startTime, endTime);

    // Get all active members of the study group
    const activeMembers = await prisma.studyMember.findMany({
      where: { studyGroupId: studyId, status: StudyMemberStatus.ACTIVE },
      select: { userId: true },
    });

    // Publish notification to all active members
    for (const member of activeMembers) {
      if (member.userId !== user.id) { // Don't notify the author
        await publishMessage(`notifications:${member.userId}`, {
          type: 'NEW_EVENT',
          message: `${studyGroup.name} 스터디에 새 이벤트 [${title}]가 등록되었습니다.`, 
          link: `/studies/${studyId}/events/${newEvent.id}`,
          recipientId: member.userId,
        });
      }
    }

    return successResponse(newEvent, 'Event created successfully', 201);
  } catch (error) {
    console.error('[API/studies/[studyId]/events/POST]', error);
    return errorResponse(error.message, 500);
  }
}
