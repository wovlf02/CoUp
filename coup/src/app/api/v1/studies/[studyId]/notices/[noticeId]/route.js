import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { updateNotice, deleteNotice } from '@/lib/services/noticeService';
import { getStudyGroupById } from '@/lib/services/studyService';
import { StudyRole } from '@/lib/db/prisma';

export async function PATCH(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, noticeId } = params;
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return errorResponse('Missing required fields: title, content', 400);
    }

    const studyGroup = await getStudyGroupById(studyId);
    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check: Only owner or admin can update notices
    const isOwner = studyGroup.creatorId === user.id;
    const isAdmin = studyGroup.studyMembers.some(member => member.userId === user.id && member.role === StudyRole.ADMIN);

    if (!isOwner && !isAdmin) {
      return errorResponse('Forbidden', 403);
    }

    const updatedNotice = await updateNotice(noticeId, { title, content });

    return successResponse(updatedNotice, 'Notice updated successfully');
  } catch (error) {
    console.error('[API/studies/[studyId]/notices/[noticeId]/PATCH]', error);
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, noticeId } = params;

    const studyGroup = await getStudyGroupById(studyId);
    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check: Only owner or admin can delete notices
    const isOwner = studyGroup.creatorId === user.id;
    const isAdmin = studyGroup.studyMembers.some(member => member.userId === user.id && member.role === StudyRole.ADMIN);

    if (!isOwner && !isAdmin) {
      return errorResponse('Forbidden', 403);
    }

    await deleteNotice(noticeId);

    return successResponse(null, 'Notice deleted successfully', 204);
  } catch (error) {
    console.error('[API/studies/[studyId]/notices/[noticeId]/DELETE]', error);
    return errorResponse(error.message, 500);
  }
}