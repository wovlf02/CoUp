import React from 'react';
import Image from 'next/image';
import styles from './MessageBubble.module.css';

function MessageBubble({ message, isOwnMessage }) {
  return (
    <div className={`${styles.messageBubble} ${isOwnMessage ? styles.ownMessage : styles.otherMessage}`}>
      {!isOwnMessage && (
        <div className={styles.senderInfo}>
          <Image src="/next.svg" alt={message.sender.name} width={24} height={24} className={styles.senderAvatar} /> {/* Replace with actual avatar */}
          <span className={styles.senderName}>{message.sender.name}</span>
        </div>
      )}
      <div className={styles.messageContent}>
        <p className={styles.messageText}>{message.content}</p>
        <span className={styles.messageTime}>{message.timestamp}</span>
      </div>
    </div>
  );
}

export default MessageBubble;
