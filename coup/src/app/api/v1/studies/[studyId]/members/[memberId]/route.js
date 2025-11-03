import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { updateStudyMemberRole, removeStudyMember, getStudyGroupById } from '@/lib/services/studyService';
import { StudyRole } from '@/lib/db/prisma';

export async function PATCH(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, memberId } = params;
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return errorResponse('Missing role field', 400);
    }

    const studyGroup = await getStudyGroupById(studyId);
    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check is now handled within the service function
    const updatedMember = await updateStudyMemberRole(studyId, memberId, role, user.id);

    return successResponse(updatedMember, 'Study member role updated successfully');
  } catch (error) {
    console.error('[API/studies/[studyId]/members/[memberId]/PATCH]', error);
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, memberId } = params;

    const studyGroup = await getStudyGroupById(studyId);
    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check is now handled within the service function
    await removeStudyMember(studyId, memberId, user.id);

    return successResponse(null, 'Study member removed successfully', 204);
  } catch (error) {
    console.error('[API/studies/[studyId]/members/[memberId]/DELETE]', error);
    return errorResponse(error.message, 500);
  }
}
