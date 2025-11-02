import Link from "next/link";
import styles from './NotificationItem.module.css';

export default function NotificationItem({
  id,
  type,
  message,
  link,
  isRead,
  createdAt,
  onMarkAsRead,
}) {
  const icon = {
    "study_join_approved": "✅",
    "new_notice": "📢",
    "new_message": "💬",
    // Add more icons for different types
  }[type] || "🔔";

  return (
    <Link href={link || "#"} passHref>
      <div
        className={`${styles.notificationItem} ${isRead ? styles.read : styles.unread}`}
        onClick={() => !isRead && onMarkAsRead(id)}
      >
        <div className={`${styles.iconWrapper} ${!isRead ? styles.iconUnread : styles.iconRead}`}>
          {icon}
        </div>
        <div className={styles.contentWrapper}>
          <p className={`${styles.messageText} ${isRead ? styles.messageTextRead : styles.messageTextUnread}`}>{message}</p>
          <p className={styles.createdAt}>{createdAt}</p>
        </div>
      </div>
    </Link>
  );
}