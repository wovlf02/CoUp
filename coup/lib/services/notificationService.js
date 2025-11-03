import prisma from '@/lib/db/prisma';
import { publishMessage } from '@/lib/utils/redis';

export async function createNotification(recipientId, type, message, link = null) {
  const notification = await prisma.notification.create({
    data: {
      recipientId,
      type,
      message,
      link,
    },
  });

  // Publish notification to Redis for real-time delivery
  await publishMessage('notifications', {
    recipientId: notification.recipientId,
    type: notification.type,
    message: notification.message,
    link: notification.link,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  });

  return notification;
}

export async function getNotificationsByUserId(userId) {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function markNotificationAsRead(notificationId) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead(userId) {
  return prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  });
}
