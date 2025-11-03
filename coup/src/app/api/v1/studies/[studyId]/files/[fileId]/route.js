import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { StudyService } from '@/lib/services/StudyService';

export async function DELETE(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, fileId } = params;

    await StudyService.deleteFile(studyId, fileId, user.id);

    return successResponse(null, 'File deleted successfully', 204);
  } catch (error) {
    console.error('[API/studies/[studyId]/files/[fileId]/DELETE]', error);
    return errorResponse(error.message, 500);
  }
}


    return successResponse(null, 'File deleted successfully', 204);
  } catch (error) {
    console.error('[API/studies/[studyId]/files/[fileId]/DELETE]', error);
    return errorResponse('Failed to delete file', 500);
  }
}