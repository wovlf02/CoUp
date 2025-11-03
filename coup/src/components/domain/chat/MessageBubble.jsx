import React from 'react';
import Image from 'next/image';
import styles from './MessageBubble.module.css';
import { formatRelativeTime } from '@/lib/utils/date'; // Import date utility

function MessageBubble({ message, isOwnMessage }) {
  const senderName = message.sender?.name || message.userName || '알 수 없음';
  const senderImageUrl = message.sender?.imageUrl || '/next.svg'; // Use actual image or placeholder
  const formattedTime = formatRelativeTime(message.sentAt || message.timestamp); // Use sentAt or timestamp

  return (
    <div className={`${styles.messageBubble} ${isOwnMessage ? styles.ownMessage : styles.otherMessage}`}>
      {!isOwnMessage && (
        <div className={styles.senderInfo}>
          <Image src={senderImageUrl} alt={senderName} width={24} height={24} className={styles.senderAvatar} />
          <span className={styles.senderName}>{senderName}</span>
        </div>
      )}
      <div className={styles.messageContent}>
        <p className={styles.messageText}>{message.content}</p>
        <span className={styles.messageTime}>{formattedTime}</span>
      </div>
    </div>
  );
}

export default MessageBubble;
