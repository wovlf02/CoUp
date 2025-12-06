// 알림 메인 페이지
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDateTimeKST } from '@/utils/time';
import api from '@/lib/api';
import styles from './page.module.css';

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [allNotifications, setAllNotifications] = useState([]); // 전체 알림 데이터
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [isLoading, setIsLoading] = useState(true);

  // 필터링된 알림 목록 계산 (로컬에서 필터링)
  const notifications = allNotifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true; // 'all'
  });

  // 세션 변경 시에만 데이터 로드 (필터 변경 시에는 로컬 필터링)
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // 전체 알림을 한 번에 가져옴 (필터 없이)
      const data = await api.get('/api/notifications', { limit: 100 });

      if (data.success) {
        setAllNotifications(data.data);
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
      setAllNotifications(allNotifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/api/notifications/mark-all-read');
      setAllNotifications(allNotifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('이 알림을 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/api/notifications/${id}`);
      setAllNotifications(allNotifications.filter(n => n.id !== id));
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

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

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
              className={`${styles.notificationCard} ${notification.isRead ? styles.read : styles.unread}`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
            >
              <div className={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
              </div>

              <div className={styles.notificationContent}>
                <div className={styles.notificationHeader}>
                  <h3 className={styles.notificationTitle}>
                    {notification.title}
                  </h3>
                  {!notification.isRead && (
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

