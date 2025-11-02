import NotificationItem from "./NotificationItem";
import styles from './NotificationList.module.css';

export default function NotificationList({ notifications, onMarkAsRead }) {
  return (
    <div className={styles.notificationListContainer}>
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            {...notification}
            onMarkAsRead={onMarkAsRead}
          />
        ))
      ) : (
        <p className={styles.emptyMessage}>
          새로운 알림이 없습니다.
        </p>
      )}
    </div>
  );
}