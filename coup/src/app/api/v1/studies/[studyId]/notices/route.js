import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import prisma from '@/lib/db/prisma';

export async function GET(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId } = params;

    // Check if the user is a member of the study group
    const isMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: user.id, status: 'ACTIVE' },
    });

    if (!isMember) {
      return errorResponse('You are not a member of this study group', 403);
    }

    const notices = await prisma.notice.findMany({
      where: { studyGroupId: studyId },
      include: { author: { select: { id: true, name: true, imageUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(notices);
  } catch (error) {
    console.error('[API/studies/[studyId]/notices/GET]', error);
    return errorResponse('Failed to fetch notices', 500);
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
      return errorResponse('You are not authorized to create notices in this study group', 403);
    }

    const newNotice = await prisma.notice.create({
      data: {
        studyGroupId: studyId,
        authorId: user.id,
        title,
        content,
      },
    });

    return successResponse(newNotice, 'Notice created successfully', 201);
  } catch (error) {
    console.error('[API/studies/[studyId]/notices/POST]', error);
    return errorResponse('Failed to create notice', 500);
  }
}
