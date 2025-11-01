import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import prisma from '@/lib/db/prisma';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { studyId } = params;

    if (!studyId) {
      return NextResponse.json({ message: 'Study ID is required' }, { status: 400 });
    }

    const studyGroup = await prisma.studyGroup.findUnique({
      where: {
        id: studyId,
      },
      select: {
        id: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!studyGroup) {
      return NextResponse.json({ message: 'Study group not found' }, { status: 404 });
    }

    // Authorization check: Only members of the study group can view the member list
    const isMember = studyGroup.members.some(member => member.userId === session.user.id);
    if (!isMember) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(studyGroup.members, { status: 200 });
  } catch (error) {
    console.error('Error fetching study group members:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}