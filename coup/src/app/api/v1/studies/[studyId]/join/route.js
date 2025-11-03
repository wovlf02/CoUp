import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { publishMessage } from '@/lib/utils/redis';
import { requestJoinStudyGroup, getStudyGroupById } from '@/lib/services/studyService';
import { StudyRole } from '@/lib/db/prisma';

export async function POST(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId } = params;
    const { joinMessage } = await request.json();

    const { newMember, studyGroup } = await requestJoinStudyGroup(studyId, user.id, joinMessage);

    // Notify owner/admins of the study group about the new join request
    const ownerAndAdmins = studyGroup.studyMembers.filter(member => 
      member.userId === studyGroup.creatorId || member.role === StudyRole.ADMIN
    );

    for (const member of ownerAndAdmins) {
      await publishMessage(`notifications:${member.userId}`, {
        type: 'NEW_JOIN_REQUEST',
        message: `${user.name}님이 ${studyGroup.name} 스터디 가입을 요청했습니다.`,
        link: `/studies/${studyId}/settings?tab=join-requests`,
        recipientId: member.userId,
      });
    }

    return successResponse(newMember, 'Study join request sent successfully', 201);
  } catch (error) {
    console.error('[API/studies/[studyId]/join/POST]', error);
    return errorResponse(error.message, 500);
  }
}
