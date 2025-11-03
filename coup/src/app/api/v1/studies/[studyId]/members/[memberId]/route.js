import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { StudyService } from '@/lib/services/StudyService';
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

    const updatedMember = await StudyService.updateStudyMemberRole(studyId, memberId, role, user.id);

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

    await StudyService.removeStudyMember(studyId, memberId, user.id);

    return successResponse(null, 'Study member removed successfully', 204);
  } catch (error) {
    console.error('[API/studies/[studyId]/members/[memberId]/DELETE]', error);
    return errorResponse(error.message, 500);
  }
}
