import React, { useEffect, useState } from 'react';
import { useSocket } from '@/lib/hooks/useSocket';
import { useNotifications } from '../../../lib/api/queries/notifications';
import { useQueryClient } from '@tanstack/react-query';
import styles from './NotificationBell.module.css'; // Assuming styles are defined here

function NotificationBell() {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const { data: notificationsData, isLoading, isError } = useNotifications();

  const unreadCount = notificationsData?.filter(n => !n.isRead).length || 0;

  useEffect(() => {
    if (!socket) return;

    socket.on('notification', (notification) => {
      console.log('New real-time notification:', notification);
      // Invalidate the notifications query to refetch and update count
      queryClient.invalidateQueries(['notifications']);
      // TODO: Implement a toast notification here
      alert(`새 알림: ${notification.message}`);
    });

    return () => {
      socket.off('notification');
    };
  }, [socket, queryClient]);

  return (
    <button className={styles.notificationBell}>
      <span className={styles.icon}>🔔</span>
      {unreadCount > 0 && (
        <span className={styles.badge}>{unreadCount}</span>
      )}
    </button>
  );
}

export default NotificationBell;
