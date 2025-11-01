import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import prisma from '@/lib/db/prisma';

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

    // Check if the user is the creator or an admin of the study group
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

    if (!isCreator && !isAdmin) {
      return errorResponse('You are not authorized to update notices in this study group', 403);
    }

    const updatedNotice = await prisma.notice.update({
      where: { id: noticeId, studyGroupId: studyId },
      data: {
        title,
        content,
      },
    });

    return successResponse(updatedNotice, 'Notice updated successfully');
  } catch (error) {
    console.error('[API/studies/[studyId]/notices/[noticeId]/PATCH]', error);
    return errorResponse('Failed to update notice', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, noticeId } = params;

    // Check if the user is the creator or an admin of the study group
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

    if (!isCreator && !isAdmin) {
      return errorResponse('You are not authorized to delete notices from this study group', 403);
    }

    await prisma.notice.delete({
      where: { id: noticeId, studyGroupId: studyId },
    });

    return successResponse(null, 'Notice deleted successfully', 204);
  } catch (error) {
    console.error('[API/studies/[studyId]/notices/[noticeId]/DELETE]', error);
    return errorResponse('Failed to delete notice', 500);
  }
}