import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { getStudyGroupById, getStudyMembers } from '@/lib/services/studyService';

export async function GET(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId } = params;

    if (!studyId) {
      return errorResponse('Study ID is required', 400);
    }

    const studyGroup = await getStudyGroupById(studyId);

    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check: Only members of the study group can view the member list
    const isMember = studyGroup.studyMembers.some(member => member.userId === user.id);
    if (!isMember) {
      return errorResponse('Forbidden', 403);
    }

    const members = await getStudyMembers(studyId);

    return successResponse(members);
  } catch (error) {
    console.error('[API/studies/[studyId]/members/GET]', error);
    return errorResponse('Failed to fetch study group members', 500);
  }
}