import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { StudyService } from '@/lib/services/StudyService';
import { StudyRole } from '@/lib/db/prisma';

export async function GET(request, { params }) {
  try {
    const { studyId } = params;

    if (!studyId) {
      return NextResponse.json({ message: 'Study ID is required' }, { status: 400 });
    }

    const studyGroup = await StudyService.getStudyGroupById(studyId);

    if (!studyGroup) {
      return NextResponse.json({ message: 'Study group not found' }, { status: 404 });
    }

    return NextResponse.json(studyGroup, { status: 200 });
  } catch (error) {
    console.error('Error fetching study group:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { studyId } = params;
    const { name, description, goal, category, rules, visibility, maxMembers } = await request.json();

    if (!studyId) {
      return NextResponse.json({ message: 'Study ID is required' }, { status: 400 });
    }

    const existingStudyGroup = await StudyService.getStudyGroupById(studyId);

    if (!existingStudyGroup) {
      return NextResponse.json({ message: 'Study group not found' }, { status: 404 });
    }

    // Authorization check: Only owner or admin can update
    if (existingStudyGroup.creatorId !== session.user.id && session.user.role !== StudyRole.ADMIN) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const updatedStudyGroup = await StudyService.updateStudyGroup(studyId, {
      name: name || existingStudyGroup.name,
      description: description || existingStudyGroup.description,
      goal: goal || existingStudyGroup.goal,
      category: category || existingStudyGroup.category,
      rules: rules || existingStudyGroup.rules,
      visibility: visibility || existingStudyGroup.visibility,
      maxMembers: maxStudyGroup.maxMembers,
    });

    return NextResponse.json(updatedStudyGroup, { status: 200 });
  } catch (error) {
    console.error('Error updating study group:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { studyId } = params;

    if (!studyId) {
      return NextResponse.json({ message: 'Study ID is required' }, { status: 400 });
    }

    const existingStudyGroup = await StudyService.getStudyGroupById(studyId);

    if (!existingStudyGroup) {
      return NextResponse.json({ message: 'Study group not found' }, { status: 404 });
    }

    // Authorization check: Only owner can delete
    if (existingStudyGroup.creatorId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await StudyService.deleteStudyGroup(studyId);

    return NextResponse.json({ message: 'Study group deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting study group:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}


    

        

    