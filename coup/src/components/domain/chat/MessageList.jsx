import React from 'react';
import MessageBubble from './MessageBubble';
import styles from './MessageList.module.css';

function MessageList({ messages, currentUserId }) {
  return (
    <div className={styles.messageList}>
      {messages.map(message => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwnMessage={message.sender.id === currentUserId}
        />
      ))}
    </div>
  );
}

export default MessageList;
