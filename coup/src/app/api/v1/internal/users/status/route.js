import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import prisma from '@/lib/db/prisma';

// This API is intended to be called by the signaling server, not directly by clients.
// Therefore, it does not use the standard `authorize` middleware.
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, isOnline } = body;

    if (!userId || typeof isOnline !== 'boolean') {
      return errorResponse('Missing required fields: userId, isOnline', 400);
    }

    // In a real application, you might want to add an internal API key check here
    // to ensure only the signaling server can call this endpoint.
    const internalApiKey = request.headers.get('x-internal-api-key');
    if (internalApiKey !== process.env.INTERNAL_API_KEY) {
      return errorResponse('Unauthorized: Invalid internal API key', 403);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isOnline },
    });

    return successResponse(null, 'User online status updated successfully');
  } catch (error) {
    console.error('[API/internal/users/status/POST]', error);
    return errorResponse('Failed to update user online status', 500);
  }
}
