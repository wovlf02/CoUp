import React from 'react';
import ChatWindow from '@/components/domain/chat/ChatWindow';
import styles from './chat.module.css';

export default function StudyChatPage({ params }) {
  const { studyId } = params;

  return (
    <div className={styles.chatPageContainer}>
      <ChatWindow studyId={studyId} />
    </div>
  );
}
