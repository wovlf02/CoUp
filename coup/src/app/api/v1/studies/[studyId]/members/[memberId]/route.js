import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import prisma from '@/lib/db/prisma';

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

    // Check if the requesting user is the owner or an admin of the study group
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true }, // Use creatorId as ownerId
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
      return errorResponse('You are not authorized to change member roles in this study group', 403);
    }

    // Prevent owner from changing their own role or demoting themselves if they are the only owner/admin
    const targetMember = await prisma.studyMember.findUnique({
      where: { id: memberId },
      select: { userId: true, role: true },
    });

    if (!targetMember) {
      return errorResponse('Target member not found', 404);
    }

    // If the target member is the owner, only the owner can change their role (or prevent demotion)
    if (targetMember.userId === studyGroup.creatorId && targetMember.userId !== user.id) {
      return errorResponse('Only the owner can change their own role', 403);
    }

    // If trying to change the owner's role, ensure the requesting user is the owner
    if (targetMember.userId === studyGroup.creatorId && user.id !== studyGroup.creatorId) {
      return errorResponse('Only the owner can change the owner's role', 403);
    }

    // If trying to demote an admin, ensure there's at least one other admin or the owner
    if (targetMember.role === 'ADMIN' && role !== 'ADMIN') {
      const otherAdmins = await prisma.studyMember.count({
        where: {
          studyGroupId: studyId,
          role: 'ADMIN',
          userId: { not: targetMember.userId },
        },
      });
      const hasOtherOwner = studyGroup.creatorId !== targetMember.userId;

      if (otherAdmins === 0 && !hasOtherOwner) {
        return errorResponse('Cannot demote the last admin/owner of the study group', 403);
      }
    }


    const updatedMember = await prisma.studyMember.update({
      where: { id: memberId, studyGroupId: studyId },
      data: { role },
    });

    return successResponse(updatedMember, 'Study member role updated successfully');
  } catch (error) {
    console.error('[API/studies/[studyId]/members/[memberId]/PATCH]', error);
    return errorResponse('Failed to update study member role', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId, memberId } = params;

    // Check if the requesting user is the owner or an admin of the study group
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { creatorId: true }, // Use creatorId as ownerId
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
      return errorResponse('You are not authorized to remove members from this study group', 403);
    }

    const memberToRemove = await prisma.studyMember.findUnique({
      where: { id: memberId },
      select: { userId: true, role: true },
    });

    if (!memberToRemove) {
      return errorResponse('Study member not found', 404);
    }

    // Prevent owner from removing themselves
    if (memberToRemove.userId === user.id && isOwner) {
      return errorResponse('You cannot remove yourself as the owner', 403);
    }

    // Prevent removing the last admin/owner
    if (memberToRemove.role === 'ADMIN' || memberToRemove.userId === studyGroup.creatorId) {
      const totalAdmins = await prisma.studyMember.count({
        where: {
          studyGroupId: studyId,
          role: 'ADMIN',
        },
      });
      const totalOwners = await prisma.studyGroup.count({
        where: {
          id: studyId,
          creatorId: { not: null },
        },
      });

      if (memberToRemove.role === 'ADMIN' && totalAdmins === 1 && !isOwner) {
        return errorResponse('Cannot remove the last admin of the study group', 403);
      }
      if (memberToRemove.userId === studyGroup.creatorId && totalOwners === 1 && totalAdmins === 0) {
        return errorResponse('Cannot remove the last owner of the study group', 403);
      }
    }


    await prisma.studyMember.delete({
      where: { id: memberId, studyGroupId: studyId },
    });

    return successResponse(null, 'Study member removed successfully', 204);
  } catch (error) {
    console.error('[API/studies/[studyId]/members/[memberId]/DELETE]', error);
    return errorResponse('Failed to remove study member', 500);
  }
}
