import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { getStudyGroupById, updateStudyGroup, deleteStudyGroup } from '@/lib/services/studyService';
import { StudyRole } from '@/lib/db/prisma';

export async function GET(request, { params }) {
  try {
    const { studyId } = params;

    if (!studyId) {
      return errorResponse('Study ID is required', 400);
    }

    const studyGroup = await getStudyGroupById(studyId);

    if (!studyGroup) {
      return errorResponse('Study group not found', 404);
    }

    return successResponse(studyGroup);
  } catch (error) {
    console.error('[API/studies/[studyId]/GET]', error);
    return errorResponse('Failed to fetch study group', 500);
  }
}

export async function PATCH(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId } = params;
    const body = await request.json();
    const { name, description, goal, category, rules, visibility, maxMembers } = body;

    if (!studyId) {
      return errorResponse('Study ID is required', 400);
    }

    const existingStudyGroup = await getStudyGroupById(studyId);

    if (!existingStudyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check: Only owner or admin can update
    const isOwner = existingStudyGroup.creatorId === user.id;
    const isAdmin = user.role === StudyRole.ADMIN; // Assuming user.role is available in session

    if (!isOwner && !isAdmin) {
      return errorResponse('Forbidden', 403);
    }

    const updatedStudyGroup = await updateStudyGroup(studyId, {
      name: name || existingStudyGroup.name,
      description: description || existingStudyGroup.description,
      goal: goal || existingStudyGroup.goal,
      category: category || existingStudyGroup.category,
      rules: rules || existingStudyGroup.rules,
      visibility: visibility || existingStudyGroup.visibility,
      maxMembers: maxMembers || existingStudyGroup.maxMembers,
    });

    return successResponse(updatedStudyGroup, 'Study group updated successfully');
  } catch (error) {
    console.error('[API/studies/[studyId]/PATCH]', error);
    return errorResponse('Failed to update study group', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId } = params;

    if (!studyId) {
      return errorResponse('Study ID is required', 400);
    }

    const existingStudyGroup = await getStudyGroupById(studyId);

    if (!existingStudyGroup) {
      return errorResponse('Study group not found', 404);
    }

    // Authorization check: Only owner can delete
    if (existingStudyGroup.creatorId !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    await deleteStudyGroup(studyId);

    return successResponse(null, 'Study group deleted successfully', 200);
  } catch (error) {
    console.error('[API/studies/[studyId]/DELETE]', error);
    return errorResponse('Failed to delete study group', 500);
  }
}