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
    const { joinMessage } = await request.json();

    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyId },
      select: { visibility: true, maxMembers: true, studyMembers: { select: { id: true, status: true } } },
    });

    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    if (studyGroup.visibility === 'PRIVATE') {
      return errorResponse('Cannot join a private study group directly', 403);
    }

    const activeMembers = studyGroup.studyMembers.filter(member => member.status === 'ACTIVE').length;
    if (studyGroup.maxMembers && activeMembers >= studyGroup.maxMembers) {
      return errorResponse('Study group is full', 409);
    }

    // Check if the user is already a member or has a pending request
    const existingMembership = await prisma.studyMember.findFirst({
      where: {
        userId: user.id,
        studyGroupId: studyId,
        status: { in: ['PENDING', 'ACTIVE'] },
      },
    });

    if (existingMembership) {
      return errorResponse('You are already a member or your request is pending', 409);
    }

    // Create a new study member entry with PENDING status
    const newMember = await prisma.studyMember.create({
      data: {
        userId: user.id,
        studyGroupId: studyId,
        role: 'MEMBER',
        status: 'PENDING',
        joinMessage: joinMessage || null,
      },
    });

    return successResponse(newMember, 'Study join request sent successfully', 201);
  } catch (error) {
    console.error('[API/studies/[studyId]/join/POST]', error);
    return errorResponse('Failed to send study join request', 500);
  }
}
