import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { StudyService } from '@/lib/services/StudyService';
import { StudyVisibility, StudyRole } from '@/lib/db/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const { studies, totalStudies } = await StudyService.getStudyGroups(
      { category, search },
      { skip, take: limit }
    );

    return successResponse({ studies, totalPages: Math.ceil(totalStudies / limit), currentPage: page });
  } catch (error) {
    console.error('[API/studies/GET]', error);
    return errorResponse('Failed to fetch study groups', 500);
  }
}

export async function POST(request) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const body = await request.json();
    const { name, description, goal, category, rules, visibility, maxMembers } = body;

    if (!name || !description || !goal || !category || !visibility || !maxMembers) {
      return errorResponse('Missing required fields', 400);
    }

    const newStudy = await StudyService.createStudyGroup(body, user.id);

    return successResponse(newStudy, 'Study group created successfully', 201);
  } catch (error) {
    console.error('[API/studies/POST]', error);
    return errorResponse('Failed to create study group', 500);
  }
}
