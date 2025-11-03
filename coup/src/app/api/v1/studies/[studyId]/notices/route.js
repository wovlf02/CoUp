import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { createNotice, getNoticesByStudyGroup } from '@/lib/services/noticeService';
import { getStudyGroupById } from '@/lib/services/studyService';
import { StudyRole } from '@/lib/db/prisma';

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

    // Authorization check: Only members of the study group can view notices
    const isMember = studyGroup.studyMembers.some(member => member.userId === user.id);
    if (!isMember) {
      return errorResponse('Forbidden', 403);
    }

    const notices = await getNoticesByStudyGroup(studyId);

    return successResponse(notices);
  } catch (error) {
    console.error('[API/studies/[studyId]/notices/GET]', error);
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
    const { title, content } = body;

    if (!title || !content) {
      return errorResponse('Missing required fields: title, content', 400);
    }

    const studyGroup = await getStudyGroupById(studyId);
    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check: Only owner or admin can create notices
    const isOwner = studyGroup.creatorId === user.id;
    const isAdmin = studyGroup.studyMembers.some(member => member.userId === user.id && member.role === StudyRole.ADMIN);

    if (!isOwner && !isAdmin) {
      return errorResponse('Forbidden', 403);
    }

    const newNotice = await createNotice(studyId, user.id, title, content);

    return successResponse(newNotice, 'Notice created successfully', 201);
  } catch (error) {
    console.error('[API/studies/[studyId]/notices/POST]', error);
    return errorResponse(error.message, 500);
  }
}
