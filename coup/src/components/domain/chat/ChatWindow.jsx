import React from 'react';
import MessageList from './MessageList';
import MessageInputForm from './MessageInputForm';
import styles from './ChatWindow.module.css';

function ChatWindow({ studyId }) {
  // In a real application, you would fetch messages and handle sending here
  const messages = [
    { id: '1', sender: { id: 'user1', name: '김민준' }, content: '안녕하세요!', timestamp: '10:00 AM' },
    { id: '2', sender: { id: 'user2', name: '나' }, content: '반갑습니다!', timestamp: '10:01 AM' },
    { id: '3', sender: { id: 'user1', name: '김민준' }, content: '오늘 스터디 시간은 19시입니다.', timestamp: '10:05 AM' },
  ];

  const handleSendMessage = (messageContent) => {
    console.log(`Sending message to study ${studyId}: ${messageContent}`);
    // Implement actual message sending logic here (e.g., via WebSocket)
  };

  return (
    <div className={styles.chatWindow}>
      <MessageList messages={messages} currentUserId="user2" />
      <MessageInputForm onSendMessage={handleSendMessage} />
    </div>
  );
}

export default ChatWindow;
