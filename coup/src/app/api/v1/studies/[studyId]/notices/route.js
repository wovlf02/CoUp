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

    const notices = await StudyService.getNotices(studyId, user.id);

    return successResponse(notices);
  } catch (error) {
    console.error('[API/studies/[studyId]/notices/GET]', error);
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
    const { title, content } = body;

    if (!title || !content) {
      return errorResponse('Missing required fields: title, content', 400);
    }

    const { newNotice, studyGroup } = await StudyService.createNotice(studyId, user.id, title, content);

    // Get all active members of the study group
    const activeMembers = await prisma.studyMember.findMany({
      where: { studyGroupId: studyId, status: StudyMemberStatus.ACTIVE },
      select: { userId: true },
    });

    // Publish notification to all active members
    for (const member of activeMembers) {
      if (member.userId !== user.id) { // Don't notify the author
        await publishMessage(`notifications:${member.userId}`, {
          type: 'NEW_NOTICE',
          message: `${studyGroup.name} 스터디에 새 공지 [${title}]가 등록되었습니다.`, 
          link: `/studies/${studyId}/notices/${newNotice.id}`,
          recipientId: member.userId,
        });
      }
    }

    return successResponse(newNotice, 'Notice created successfully', 201);
  } catch (error) {
    console.error('[API/studies/[studyId]/notices/POST]', error);
    return errorResponse(error.message, 500);
  }
}
