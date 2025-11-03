import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { getFilesByStudyGroup, createFileRecord, generatePresignedUploadUrl } from '@/lib/services/fileService';
import { getStudyGroupById } from '@/lib/services/studyService';

export async function GET(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId } = params;

    const studyGroup = await getStudyGroupById(studyId);
    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check: Only members of the study group can view files
    const isMember = studyGroup.studyMembers.some(member => member.userId === user.id);
    if (!isMember) {
      return errorResponse('Forbidden', 403);
    }

    const files = await getFilesByStudyGroup(studyId);

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
    const body = await request.json();
    const { fileName, fileType, fileSize } = body;

    if (!fileName || !fileType || !fileSize) {
      return errorResponse('Missing required fields for file upload', 400);
    }

    const studyGroup = await getStudyGroupById(studyId);
    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check: Only members of the study group can upload files
    const isMember = studyGroup.studyMembers.some(member => member.userId === user.id);
    if (!isMember) {
      return errorResponse('Forbidden', 403);
    }

    const { url, key } = await generatePresignedUploadUrl(fileName, fileType, studyId, user.id);

    // Create a file record in the database after successful presigned URL generation
    const newFile = await createFileRecord(studyId, user.id, fileName, key, fileSize, fileType);

    return successResponse({ ...newFile, uploadUrl: url }, 'File upload URL generated successfully', 201);
  } catch (error) {
    console.error('[API/studies/[studyId]/files/POST]', error);
    return errorResponse(error.message, 500);
  }
}
