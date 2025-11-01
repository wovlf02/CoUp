import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import prisma from '@/lib/db/prisma';

export async function POST(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId } = params;
    const body = await request.json();
    const { memberId, action } = body; // action: 'APPROVE' or 'REJECT'

    if (!memberId || !action) {
      return errorResponse('Missing memberId or action field', 400);
    }

    // Check if the requesting user is the owner or an admin of the study group
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true, maxMembers: true },
    });

    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    const requestingMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: user.id },
      select: { role: true },
    });

    const isOwner = studyGroup.creatorId === user.id;
    const isAdmin = requestingMember && requestingMember.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return errorResponse('You are not authorized to manage join requests for this study group', 403);
    }

    const existingMember = await prisma.studyMember.findUnique({
      where: { id: memberId, studyGroupId: studyId },
    });

    if (!existingMember) {
      return errorResponse('Study member not found', 404);
    }

    if (existingMember.status !== 'PENDING') {
      return errorResponse('Member status is not pending', 400);
    }

    let updatedMember;
    if (action === 'APPROVE') {
      const currentMembersCount = await prisma.studyMember.count({
        where: { studyGroupId: studyId, status: 'ACTIVE' },
      });

      if (studyGroup.maxMembers && currentMembersCount >= studyGroup.maxMembers) {
        return errorResponse('Study group is already full', 409);
      }

      updatedMember = await prisma.studyMember.update({
        where: { id: memberId },
        data: { status: 'ACTIVE' },
      });
    } else if (action === 'REJECT') {
      updatedMember = await prisma.studyMember.update({
        where: { id: memberId },
        data: { status: 'REJECTED' },
      });
    } else {
      return errorResponse('Invalid action', 400);
    }

    return successResponse(updatedMember, `Study join request ${action.toLowerCase()}d successfully`);
  } catch (error) {
    console.error('[API/studies/[studyId]/manage/POST]', error);
    return errorResponse('Failed to manage study join request', 500);
  }
}
