'use client'

import { useState, useMemo } from 'react'
import NotificationCard from '@/components/notifications/NotificationCard'
import NotificationFilters from '@/components/notifications/NotificationFilters'
import NotificationStats from '@/components/notifications/NotificationStats'
import NotificationTypeFilter from '@/components/notifications/NotificationTypeFilter'
import NotificationSettings from '@/components/notifications/NotificationSettings'
import NotificationEmpty from '@/components/notifications/NotificationEmpty'
import { notifications, notificationStats, notificationSettings } from '@/mocks/notifications'
import styles from './page.module.css'

export default function NotificationsPage() {
  const [filter, setFilter] = useState('unread') // 'all', 'unread'
  const [notificationList, setNotificationList] = useState(notifications)

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notificationList.filter(n => !n.isRead)
    }
    return notificationList
  }, [notificationList, filter])

  const unreadCount = notificationList.filter(n => !n.isRead).length

  const handleMarkAllAsRead = async () => {
    setNotificationList(prev => prev.map(n => ({ ...n, isRead: true })))
    console.log('모든 알림 읽음 처리')
    alert('모든 알림을 읽음 처리했습니다!')
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      setNotificationList(prev => prev.map(n =>
        n.id === notification.id ? { ...n, isRead: true } : n
      ))
      console.log('알림 읽음 처리:', notification.id)
    }

    // Mock: 링크로 이동 (콘솔에만 출력)
    console.log('이동:', notification.data)
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.title}>🔔 알림</h1>
        </header>

        <NotificationFilters
          filter={filter}
          onFilterChange={setFilter}
          onMarkAllAsRead={handleMarkAllAsRead}
          unreadCount={unreadCount}
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
        <NotificationStats stats={notificationStats} />
        <NotificationTypeFilter stats={notificationStats} />
        <NotificationSettings settings={notificationSettings} />
      </aside>
    </div>
  )
}

