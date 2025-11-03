import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { StudyService } from '@/lib/services/StudyService';

export async function GET(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId } = params;

    const files = await StudyService.getFiles(studyId, user.id);

    return successResponse(files);
  } catch (error) {
    console.error('[API/studies/[studyId]/files/GET]', error);
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
    // In a real application, this would involve handling file uploads.
    // For MVP, we'll simulate a file upload or expect a pre-signed URL flow.
    // This example assumes a simple metadata creation after an external upload.
    const body = await request.json();
    const { fileName, fileUrl, fileSize, fileType } = body;

    if (!fileName || !fileUrl || !fileSize || !fileType) {
      return errorResponse('Missing required fields for file upload', 400);
    }

    const newFile = await StudyService.createFile(studyId, user.id, fileName, fileUrl, fileSize, fileType);

    return successResponse(newFile, 'File uploaded successfully', 201);
  } catch (error) {
    console.error('[API/studies/[studyId]/files/POST]', error);
    return errorResponse(error.message, 500);
  }
}
