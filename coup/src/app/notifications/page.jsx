'use client'

import { useState, useMemo } from 'react'
import NotificationCard from '@/components/notifications/NotificationCard'
import NotificationFilters from '@/components/notifications/NotificationFilters'
import NotificationStats from '@/components/notifications/NotificationStats'
import NotificationTypeFilter from '@/components/notifications/NotificationTypeFilter'
import NotificationEmpty from '@/components/notifications/NotificationEmpty'
import { useNotifications, useMarkAllNotificationsAsRead, useMarkNotificationAsRead } from '@/lib/hooks/useApi'
import styles from './page.module.css'

export default function NotificationsPage() {
  const [filter, setFilter] = useState('unread') // 'all', 'unread'

  // 실제 API 호출
  const { data, isLoading } = useNotifications({ filter })
  const markAllAsRead = useMarkAllNotificationsAsRead()
  const markAsRead = useMarkNotificationAsRead()

  const notifications = data?.data || []
  const stats = data?.stats || { total: 0, unread: 0 }

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.isRead)
    }
    return notifications
  }, [notifications, filter])

  // 알림 타입별 통계 (클라이언트에서 계산)
  const notificationTypeStats = useMemo(() => {
    const byType = {}
    notifications.forEach(n => {
      byType[n.type] = (byType[n.type] || 0) + 1
    })
    return {
      total: stats.total,
      unread: stats.unread,
      byType
    }
  }, [notifications, stats])

  const handleMarkAllAsRead = async () => {
    if (!confirm('모든 알림을 읽음 처리하시겠습니까?')) return

    try {
      await markAllAsRead.mutateAsync()
      alert('모든 알림을 읽음 처리했습니다!')
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error)
      alert('알림 읽음 처리에 실패했습니다.')
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead.mutateAsync(notification.id)
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error)
      }
    }

    // 알림 데이터에 따라 링크로 이동
    if (notification.studyId) {
      window.location.href = `/my-studies/${notification.studyId}`
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>알림을 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>🔔 알림</h1>
            <p className={styles.subtitle}>
              모든 스터디의 새로운 소식을 확인하세요
            </p>
          </div>
        </header>

        <NotificationFilters
          filter={filter}
          onFilterChange={setFilter}
          onMarkAllAsRead={handleMarkAllAsRead}
          unreadCount={stats.unread}
        />

        {filteredNotifications.length === 0 ? (
          <NotificationEmpty filter={filter} />
        ) : (
          <div className={styles.notificationList}>
            {filteredNotifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </div>
        )}
      </div>

      <aside className={styles.sidebar}>
        <NotificationStats notifications={notifications} />
        <NotificationTypeFilter stats={notificationTypeStats} />
      </aside>
    </div>
  )
}
