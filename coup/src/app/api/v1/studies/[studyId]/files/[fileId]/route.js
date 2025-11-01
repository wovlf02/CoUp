import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import prisma from '@/lib/db/prisma';

export async function DELETE(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, fileId } = params;

    // Check if the user is the uploader or an owner/admin of the study group
    const fileToDelete = await prisma.file.findUnique({
      where: { id: fileId, studyGroupId: studyId },
      select: { uploaderId: true },
    });

    if (!fileToDelete) {
      return errorResponse('File not found', 404);
    }

    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true },
    });

    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    const isCreator = studyGroup.creatorId === user.id;

    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: user.id, status: 'ACTIVE' },
      select: { role: true },
    });

    const isAdmin = studyMember && studyMember.role === 'ADMIN';

    if (fileToDelete.uploaderId !== user.id && !isCreator && !isAdmin) {
      return errorResponse('You are not authorized to delete this file', 403);
    }

    await prisma.file.delete({
      where: { id: fileId, studyGroupId: studyId },
    });

    return successResponse(null, 'File deleted successfully', 204);
  } catch (error) {
    console.error('[API/studies/[studyId]/files/[fileId]/DELETE]', error);
    return errorResponse('Failed to delete file', 500);
  }
}