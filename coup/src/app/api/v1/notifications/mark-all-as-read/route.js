import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import prisma from '@/lib/db/prisma';

export async function POST(request) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    await prisma.notification.updateMany({
      where: { recipientId: user.id, isRead: false },
      data: { isRead: true },
    });

    return successResponse(null, 'All notifications marked as read');
  } catch (error) {
    console.error('[API/notifications/mark-all-as-read/POST]', error);
    return errorResponse('Failed to mark all notifications as read', 500);
  }
}
