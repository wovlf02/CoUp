import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { publishMessage } from '@/lib/utils/redis';
import { StudyService } from '@/lib/services/StudyService';

export async function POST(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId } = params;
    const body = await request.json();
    const { memberId, action } = body; // action: 'APPROVE' or 'REJECT'

    if (!memberId || !action) {
      return errorResponse('Missing memberId or action field', 400);
    }

    const { updatedMember, studyGroup, existingMember } = await StudyService.manageJoinRequest(studyId, memberId, action);

    let notificationMessage;
    let notificationType;

    if (action === 'APPROVE') {
      notificationMessage = `${studyGroup.name} 스터디 가입이 승인되었습니다.`;
      notificationType = 'STUDY_JOIN_APPROVED';
    } else if (action === 'REJECT') {
      notificationMessage = `${studyGroup.name} 스터디 가입이 거절되었습니다.`;
      notificationType = 'STUDY_JOIN_REJECTED';
    } else {
      return errorResponse('Invalid action', 400);
    }

    // Publish notification to the user who made the join request
    await publishMessage(`notifications:${existingMember.userId}`, {
      type: notificationType,
      message: notificationMessage,
      link: `/studies/${studyId}`,
      recipientId: existingMember.userId,
    });

    return successResponse(updatedMember, `Study join request ${action.toLowerCase()}d successfully`);
  } catch (error) {
    console.error('[API/studies/[studyId]/manage/POST]', error);
    return errorResponse(error.message, 500);
  }
}
