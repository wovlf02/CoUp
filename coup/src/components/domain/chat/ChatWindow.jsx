import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageList from './MessageList';
import MessageInputForm from './MessageInputForm';
import styles from './ChatWindow.module.css';
import { useSocket } from '@/lib/hooks/useSocket';
import { useAuth } from '@/lib/hooks/useAuth';
import { useChatMessages } from '@/lib/api/queries/chat'; // Import the new hook

function ChatWindow({ studyId }) {
  const socket = useSocket();
  const { user } = useAuth();
  const [liveMessages, setLiveMessages] = useState([]); // Messages received live
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useChatMessages(studyId);

  const historicalMessages = data?.pages
    .flatMap((page) => page.messages)
    .reverse() || []; // Reverse to show oldest first

  const allMessages = [...historicalMessages, ...liveMessages];

  // Scroll to bottom on initial load and new live messages
  useEffect(() => {
    if (messagesEndRef.current && liveMessages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (messagesEndRef.current && historicalMessages.length > 0 && !isLoading) {
      // Scroll to bottom only once after initial historical messages load
      messagesEndRef.current.scrollIntoView();
    }
  }, [liveMessages, historicalMessages, isLoading]);

  // Handle infinite scrolling
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop } = scrollContainerRef.current;
      if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);


  useEffect(() => {
    if (!socket || !user || !studyId) return;

    socket.emit('join_room', studyId);
    console.log(`Attempting to join room: ${studyId}`);

    socket.on('new_message', (message) => {
      console.log('New message received:', message);
      setLiveMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('message_error', (error) => {
      console.error('Message error:', error);
      alert(`메시지 전송 실패: ${error.message}`);
    });

    return () => {
      socket.emit('leave_room', studyId);
      socket.off('new_message');
      socket.off('message_error');
      console.log(`Left room: ${studyId}`);
    };
  }, [socket, user, studyId]);

  const handleSendMessage = (messageContent) => {
    if (!socket || !user || !studyId || !messageContent.trim()) return;

    socket.emit('send_message', { studyId, content: messageContent });
  };

  if (isLoading) return <div>Loading messages...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className={styles.chatWindow}>
      <div className={styles.messageContainer} ref={scrollContainerRef}>
        {isFetchingNextPage && <div>Loading older messages...</div>}
        <MessageList messages={allMessages} currentUserId={user?.id} />
        <div ref={messagesEndRef} />
      </div>
      <MessageInputForm onSendMessage={handleSendMessage} />
    </div>
  );
}

export default ChatWindow;
