import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import prisma from '@/lib/db/prisma';

// This API is intended to be called by the signaling server, not directly by clients.
// Therefore, it does not use the standard `authorize` middleware.
export async function POST(request) {
  try {
    const body = await request.json();
    const { studyGroupId, senderId, content } = body;

    if (!studyGroupId || !senderId || !content) {
      return errorResponse('Missing required fields: studyGroupId, senderId, content', 400);
    }

    // In a real application, you might want to add an internal API key check here
    // to ensure only the signaling server can call this endpoint.

    const newMessage = await prisma.chatMessage.create({
      data: {
        studyGroupId,
        senderId,
        content,
      },
    });

    return successResponse(newMessage, 'Chat message saved successfully', 201);
  } catch (error) {
    console.error('[API/internal/messages/POST]', error);
    return errorResponse('Failed to save chat message', 500);
  }
}
