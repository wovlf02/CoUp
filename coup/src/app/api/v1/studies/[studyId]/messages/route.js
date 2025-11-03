import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import prisma from '@/lib/db/prisma';

export async function GET(request, { params }) {
  try {
    const { studyId } = params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor'); // For infinite scrolling
    const limit = parseInt(searchParams.get('limit')) || 50;

    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    // TODO: Check if the user is a member of the study group

    const findManyArgs = {
      where: { studyGroupId: parseInt(studyId) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    };

    if (cursor) {
      findManyArgs.cursor = { id: parseInt(cursor) };
      findManyArgs.skip = 1; // Skip the cursor itself
    }

    const messages = await prisma.chatMessage.findMany({
      ...findManyArgs,
      include: {
        sender: { select: { id: true, name: true, imageUrl: true } },
      },
    });

    // Reverse messages to be in chronological order for display
    const chronologicalMessages = messages.reverse();

    const nextCursor = messages.length > 0 ? messages[0].id : null; // Oldest message ID as next cursor

    return successResponse({ messages: chronologicalMessages, nextCursor });
  } catch (error) {
    console.error('[API/studies/[studyId]/messages/GET]', error);
    return errorResponse('Failed to fetch chat messages', 500);
  }
}
