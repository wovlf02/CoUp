import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { StudyService } from '@/lib/services/StudyService';

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

    const updatedNotice = await StudyService.updateNotice(studyId, noticeId, user.id, title, content);

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

    await StudyService.deleteNotice(studyId, noticeId, user.id);

    return successResponse(null, 'Notice deleted successfully', 204);
  } catch (error) {
    console.error('[API/studies/[studyId]/notices/[noticeId]/DELETE]', error);
    return errorResponse(error.message, 500);
  }
}