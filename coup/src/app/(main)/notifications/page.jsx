import { useState } from "react";
import NotificationList from "../../../components/domain/notification/NotificationList";
import { Button } from "../../../components/ui/button";
import styles from './notifications.module.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "study_join_approved",
      message: "CoUp 스터디 가입이 승인되었습니다.",
      link: "/studies/1",
      isRead: false,
      createdAt: "5분 전",
    },
    {
      id: "2",
      type: "new_notice",
      message: "새 공지사항 '주간 계획'이 등록되었습니다.",
      link: "/studies/2/notices",
      isRead: false,
      createdAt: "1시간 전",
    },
    {
      id: "3",
      type: "new_message",
      message: "스터디 A에 새 메시지가 도착했습니다.",
      link: "/studies/1/chat",
      isRead: true,
      createdAt: "어제",
    },
  ]);

  const handleMarkAsRead = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const hasUnreadNotifications = notifications.some((notification) => !notification.isRead);

  return (
    <div className={styles.notificationsPageContainer}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>알림</h2>
        <Button
          variant="secondary"
          onClick={handleMarkAllAsRead}
          disabled={!hasUnreadNotifications}
        >
          모두 읽음
        </Button>
      </div>
      <NotificationList notifications={notifications} onMarkAsRead={handleMarkAsRead} />
    </div>
  );
}