import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { markNotificationAsRead } from '@/lib/services/notificationService';

export async function PATCH(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { notificationId } = params;

    const updatedNotification = await markNotificationAsRead(notificationId);

    return successResponse(updatedNotification, 'Notification marked as read');
  } catch (error) {
    console.error('[API/notifications/[notificationId]/read/PATCH]', error);
    return errorResponse('Failed to mark notification as read', 500);
  }
}
