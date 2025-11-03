import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { getFileById, deleteFileRecord, deleteFileFromS3 } from '@/lib/services/fileService';
import { getStudyGroupById } from '@/lib/services/studyService';
import { StudyRole } from '@/lib/db/prisma';

export async function DELETE(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, fileId } = params;

    const studyGroup = await getStudyGroupById(studyId);
    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    const fileToDelete = await getFileById(fileId);
    if (!fileToDelete || fileToDelete.studyGroupId !== studyId) {
      return errorResponse('File not found in this study group', 404);
    }

    // Authorization check: Only uploader or owner/admin can delete files
    const isUploader = fileToDelete.uploaderId === user.id;
    const isOwner = studyGroup.creatorId === user.id;
    const isAdmin = studyGroup.studyMembers.some(member => member.userId === user.id && member.role === StudyRole.ADMIN);

    if (!isUploader && !isOwner && !isAdmin) {
      return errorResponse('Forbidden', 403);
    }

    // Delete file from S3
    await deleteFileFromS3(fileToDelete.fileUrl); // fileUrl stores the S3 key

    // Delete file record from DB
    await deleteFileRecord(fileId);

    return successResponse(null, 'File deleted successfully', 204);
  } catch (error) {
    console.error('[API/studies/[studyId]/files/[fileId]/DELETE]', error);
    return errorResponse(error.message, 500);
  }
}