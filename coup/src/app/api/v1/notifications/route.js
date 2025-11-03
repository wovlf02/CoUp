import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { getNotificationsByUserId, markAllNotificationsAsRead } from '../../../../../lib/services/notificationService';

export async function GET(request) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const notifications = await getNotificationsByUserId(user.id);

    return successResponse(notifications);
  } catch (error) {
    console.error('[API/notifications/GET]', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
}

export async function PATCH(request) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    // Check if the request is for marking all as read
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'read-all') {
      await markAllNotificationsAsRead(user.id);
      return successResponse(null, 'All notifications marked as read', 200);
    } else {
      return errorResponse('Invalid action', 400);
    }
  } catch (error) {
    console.error('[API/notifications/PATCH]', error);
    return errorResponse('Failed to update notifications', 500);
  }
}
