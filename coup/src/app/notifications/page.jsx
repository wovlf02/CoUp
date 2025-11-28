// 알림 메인 페이지
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDateTimeKST } from '@/utils/time';
import api from '@/lib/api';
import styles from './page.module.css';

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session, filter]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filter === 'unread') params.read = 'false';
      if (filter === 'read') params.read = 'true';

      const data = await api.get('/api/notifications', params);

      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('알림 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/api/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('이 알림을 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('알림 삭제 실패:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ANNOUNCEMENT': return '📢';
      case 'INVITATION': return '💌';
      case 'TASK': return '✅';
      case 'COMMENT': return '💬';
      case 'SYSTEM': return 'ℹ️';
      case 'MENTION': return '🔔';
      default: return '📌';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🔔 알림</h1>
          <p className={styles.subtitle}>
            읽지 않은 알림 {unreadCount}개
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className={styles.markAllButton}>
            모두 읽음으로 표시
          </button>
        )}
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          전체
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'unread' ? styles.active : ''}`}
          onClick={() => setFilter('unread')}
        >
          읽지 않음
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'read' ? styles.active : ''}`}
          onClick={() => setFilter('read')}
        >
          읽음
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>알림을 불러오는 중...</div>
      ) : notifications.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔔</div>
          <p className={styles.emptyText}>알림이 없습니다</p>
        </div>
      ) : (
        <div className={styles.notificationList}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`${styles.notificationCard} ${notification.read ? styles.read : styles.unread}`}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <div className={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
              </div>

              <div className={styles.notificationContent}>
                <div className={styles.notificationHeader}>
                  <h3 className={styles.notificationTitle}>
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <span className={styles.unreadBadge}>NEW</span>
                  )}
                </div>

                <p className={styles.notificationMessage}>
                  {notification.message}
                </p>

                <div className={styles.notificationFooter}>
                  <span className={styles.notificationTime}>
                    {formatDateTimeKST(notification.createdAt)}
                  </span>

                  {notification.link && (
                    <a href={notification.link} className={styles.notificationLink}>
                      자세히 보기 →
                    </a>
                  )}
                </div>
              </div>

              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(notification.id);
                }}
                aria-label="삭제"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

