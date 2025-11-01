import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import prisma from '@/lib/db/prisma';

export async function GET(request, { params }) {
  try {
    const { studyId } = params;

    if (!studyId) {
      return NextResponse.json({ message: 'Study ID is required' }, { status: 400 });
    }

    const studyGroup = await prisma.studyGroup.findUnique({
      where: {
        id: studyId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
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

    

        const existingStudyGroup = await prisma.studyGroup.findUnique({

          where: {

            id: studyId,

          },

        });

    

        if (!existingStudyGroup) {

          return NextResponse.json({ message: 'Study group not found' }, { status: 404 });

        }

    

        // Authorization check: Only owner or admin can update

        if (existingStudyGroup.ownerId !== session.user.id && session.user.role !== 'ADMIN') {

          return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        }

    

        const updatedStudyGroup = await prisma.studyGroup.update({

          where: {

            id: studyId,

          },

          data: {

            name: name || existingStudyGroup.name,

            description: description || existingStudyGroup.description,

            goal: goal || existingStudyGroup.goal,

            category: category || existingStudyGroup.category,

            rules: rules || existingStudyGroup.rules,

            visibility: visibility || existingStudyGroup.visibility,

            maxMembers: maxMembers || existingStudyGroup.maxMembers,

          },

          include: {

            owner: {

              select: {

                id: true,

                name: true,

                imageUrl: true,

              },

            },

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

    

        

    

            const existingStudyGroup = await prisma.studyGroup.findUnique({

    

              where: {

    

                id: studyId,

    

              },

    

            });

    

        

    

            if (!existingStudyGroup) {

    

              return NextResponse.json({ message: 'Study group not found' }, { status: 404 });

    

            }

    

        

    

            // Authorization check: Only owner can delete

    

            if (existingStudyGroup.ownerId !== session.user.id) {

    

              return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    

            }

    

        

    

            await prisma.studyGroup.delete({

    

              where: {

    

                id: studyId,

    

              },

    

            });

    

        

    

            return NextResponse.json({ message: 'Study group deleted successfully' }, { status: 200 });

    

          } catch (error) {

    

            console.error('Error deleting study group:', error);

    

            return NextResponse.json({ message: 'Internal server error' }, { status: 500 });

    

          }

    

        }

    

        

    