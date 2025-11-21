// 내 스터디 채팅 페이지
'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './page.module.css';
import { useStudy, useMessages, useSendMessage, useDeleteMessage } from '@/lib/hooks/useApi';
import { useSocket } from '@/lib/hooks/useSocket';
import { getStudyHeaderStyle } from '@/utils/studyColors';
import StudyTabs from '@/components/study/StudyTabs';

export default function MyStudyChatPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [content, setContent] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Session - 현재 로그인한 사용자
  const { data: session } = useSession();
  const currentUser = session?.user;

  // Socket 연결
  const { socket, isConnected } = useSocket();

  // 실제 API Hooks
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useMessages(studyId);
  const sendMessageMutation = useSendMessage();
  const deleteMessageMutation = useDeleteMessage();

  const study = studyData?.data;
  const [realtimeMessages, setRealtimeMessages] = useState([]);
  const allMessages = [...(messagesData?.messages || []), ...realtimeMessages];
  const onlineMembers = []; // TODO: Socket.io로 실시간 온라인 멤버 구현


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  // Socket.io 스터디 채팅방 입장
  useEffect(() => {
    if (!socket || !studyId || !currentUser) return;

    console.log('[Chat] Joining study room:', studyId);
    socket.emit('study:join', { studyId });

    return () => {
      console.log('[Chat] Leaving study room:', studyId);
      socket.emit('study:leave', { studyId });
    };
  }, [socket, studyId, currentUser]);

  // Socket.io 실시간 메시지 수신
  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleNewMessage = (message) => {
      console.log('[Chat] New message received:', message);

      // 자신이 보낸 메시지는 무시 (이미 낙관적 업데이트로 표시됨)
      if (message.senderId === currentUser.id) return;

      // 실시간 메시지에 추가
      setRealtimeMessages(prev => [...prev, {
        ...message,
        isMine: false,
        createdAt: message.createdAt || new Date().toISOString()
      }]);
    };

    const handleTyping = ({ userId, userName }) => {
      if (userId === currentUser.id) return;
      setTypingUsers(prev => {
        if (!prev.includes(userName)) {
          return [...prev, userName];
        }
        return prev;
      });

      // 3초 후 타이핑 표시 제거
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(name => name !== userName));
      }, 3000);
    };

    socket.on('study:message', handleNewMessage);
    socket.on('study:typing', handleTyping);

    return () => {
      socket.off('study:message', handleNewMessage);
      socket.off('study:typing', handleTyping);
    };
  }, [socket, currentUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || !socket) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      content: content.trim(),
      senderId: currentUser?.id,
      sender: currentUser,
      isMine: true,
      createdAt: new Date().toISOString(),
      studyId
    };

    // 낙관적 업데이트
    setRealtimeMessages(prev => [...prev, optimisticMessage]);
    setContent('');

    try {
      // API로 메시지 저장
      const result = await sendMessageMutation.mutateAsync({
        studyId,
        data: { content: content.trim() }
      });

      // Socket.io로 실시간 전송
      socket.emit('study:message', {
        studyId,
        message: result.data
      });

      // 임시 메시지 제거
      setRealtimeMessages(prev => prev.filter(m => m.id !== tempId));
    } catch (error) {
      console.error('[Chat] Send error:', error);
      // 실패 시 임시 메시지 제거
      setRealtimeMessages(prev => prev.filter(m => m.id !== tempId));
      alert('메시지 전송 실패: ' + error.message);
    }
  };

  // 타이핑 이벤트 전송
  const handleSendTyping = () => {
    if (socket && currentUser) {
      socket.emit('study:typing', {
        studyId,
        userId: currentUser.id,
        userName: currentUser.name
      });
    }
  };

  // 파일 선택
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 제한 (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('파일 크기는 50MB를 초과할 수 없습니다.');
      return;
    }

    setSelectedFile(file);
  };

  // 파일 전송
  const handleSendFile = async () => {
    if (!selectedFile || !socket) return;

    setIsUploading(true);

    try {
      // FormData로 파일 준비
      const formData = new FormData();
      formData.append('file', selectedFile);

      // 파일 업로드 API 호출
      const response = await fetch(`/api/studies/${studyId}/files`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '파일 업로드 실패');
      }

      const result = await response.json();

      // 파일 메시지 생성
      const fileMessage = {
        studyId,
        content: `파일: ${selectedFile.name}`,
        fileUrl: result.data.url,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type
      };

      // Socket.io로 파일 메시지 전송
      socket.emit('study:message', {
        studyId,
        message: fileMessage
      });

      // 로컬에 추가
      setRealtimeMessages(prev => [...prev, {
        ...fileMessage,
        id: `file-${Date.now()}`,
        senderId: currentUser?.id,
        sender: currentUser,
        isMine: true,
        createdAt: new Date().toISOString()
      }]);

      // 초기화
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('[Chat] File upload error:', error);
      alert(`파일 전송에 실패했습니다: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 선택 취소
  const handleCancelFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('메시지를 삭제하시겠습니까?')) return;

    try {
      await deleteMessageMutation.mutateAsync({ studyId, messageId });
    } catch (error) {
      alert('메시지 삭제 실패: ' + error.message);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  if (studyLoading) {
    return <div className={styles.container}>로딩 중...</div>;
  }

  if (!study) {
    return <div className={styles.container}>스터디를 찾을 수 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button onClick={() => router.push('/my-studies')} className={styles.backButton}>
          ← 내 스터디 목록
        </button>

        <div className={styles.studyHeader} style={getStudyHeaderStyle(studyId)}>
          <div className={styles.studyInfo}>
            <span className={styles.emoji}>{study.emoji}</span>
            <div>
              <h1 className={styles.studyName}>{study.name}</h1>
              <p className={styles.studyMeta}>
                👥 {study.currentMembers}/{study.maxMembers}명
              </p>
            </div>
          </div>
          <span className={`${styles.roleBadge} ${styles[study.myRole?.toLowerCase() || 'member']}`}>
            {study.myRole === 'OWNER' ? '👑' : study.myRole === 'ADMIN' ? '⭐' : '👤'} {study.myRole || 'MEMBER'}
          </span>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <StudyTabs studyId={studyId} activeTab="채팅" userRole={study.myRole} />

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 채팅 영역 */}
        <div className={styles.chatSection}>
          <div className={styles.chatHeader}>
            <h2 className={styles.chatTitle}>💬 채팅</h2>
            <button className={styles.searchButton}>🔍 검색</button>
          </div>

          {/* 메시지 영역 */}
          <div className={styles.messagesArea}>
            {messagesLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>메시지 로딩 중...</div>
            ) : allMessages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                첫 메시지를 보내보세요! 👋
              </div>
            ) : (
              allMessages.map((message) => {
                if (message.type === 'SYSTEM') {
                  return (
                    <div key={message.id} className={styles.dateDivider}>
                      {message.content}
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={`${styles.message} ${message.isMine ? styles.mine : ''}`}
                  >
                    {!message.isMine && (
                      <div className={styles.avatar}>
                        {message.sender?.name?.[0] || 'U'}
                      </div>
                    )}
                    <div className={styles.messageContent}>
                      {!message.isMine && (
                        <div className={styles.messageMeta}>
                          <span className={styles.userName}>{message.sender?.name || '알 수 없음'}</span>
                          <span className={styles.timestamp}>{formatTime(message.createdAt)}</span>
                        </div>
                      )}
                      <div className={styles.messageBubble}>
                        {message.content}
                        {message.fileUrl && (
                          <div className={styles.fileAttachment}>
                            <span className={styles.fileIcon}>📄</span>
                            <div className={styles.fileInfo}>
                              <span className={styles.fileName}>{message.fileName}</span>
                            </div>
                            <a href={message.fileUrl} download className={styles.downloadButton}>다운로드</a>
                          </div>
                        )}
                      </div>
                      {message.isMine && (
                        <div className={styles.messageMeta}>
                          <span className={styles.readReceipt}>✓</span>
                          <span className={styles.timestamp}>{formatTime(message.createdAt)}</span>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className={styles.deleteBtn}
                            style={{ marginLeft: '8px', color: '#ef4444', cursor: 'pointer' }}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* 입력 중 표시 */}
            {typingUsers.length > 0 && (
              <div className={styles.typingIndicator}>
                <div className={styles.typingDots}>
                  <span className={styles.typingDot}></span>
                  <span className={styles.typingDot}></span>
                  <span className={styles.typingDot}></span>
                </div>
                <span>{typingUsers[0]}님이 입력 중...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className={styles.inputWrapper}>
            {/* 파일 선택 미리보기 */}
            {selectedFile && (
              <div className={styles.filePreview}>
                <div className={styles.filePreviewInfo}>
                  <span className={styles.fileIcon}>📎</span>
                  <div>
                    <div className={styles.fileName}>{selectedFile.name}</div>
                    <div className={styles.fileSize}>{formatFileSize(selectedFile.size)}</div>
                  </div>
                </div>
                <div className={styles.fileActions}>
                  <button
                    type="button"
                    onClick={handleSendFile}
                    disabled={isUploading}
                    className={styles.fileSendButton}
                  >
                    {isUploading ? '업로드 중...' : '전송'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelFile}
                    disabled={isUploading}
                    className={styles.fileCancelButton}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSend} className={styles.inputArea}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={styles.fileButton}
                disabled={selectedFile !== null}
              >
                📎
              </button>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  handleSendTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="메시지를 입력하세요..."
                className={styles.inputTextarea}
                rows={1}
                disabled={sendMessageMutation.isPending || selectedFile !== null}
              />
              <button
                type="submit"
                className={styles.sendButton}
                disabled={!content.trim() || sendMessageMutation.isPending || selectedFile !== null}
              >
                {sendMessageMutation.isPending ? '전송 중...' : '전송'}
              </button>
            </form>
          </div>
        </div>

        {/* 우측 위젯 */}
        <aside className={styles.sidebar}>
          {/* 스터디 현황 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 스터디 현황</h3>
            <div className={styles.widgetContent}>
              <p className={styles.widgetText}>멤버: {study.memberCount || 0}명</p>
              <p className={styles.widgetText}>카테고리: {study.category}</p>
            </div>
          </div>

          {/* 온라인 멤버 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>👥 온라인 ({onlineMembers.length}명)</h3>
            <div className={styles.widgetContent}>
              {onlineMembers.length === 0 ? (
                <p className={styles.widgetText}>실시간 연결 대기 중...</p>
              ) : (
                onlineMembers.map((member) => (
                  <div key={member.id} className={styles.memberItem}>
                    <span className={styles.onlineIndicator}>🟢</span>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberName}>
                        {member.name}
                        {member.role === 'OWNER' && ' 👑'}
                        {member.role === 'ADMIN' && ' ⭐'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 빠른 액션 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>⚡ 빠른 액션</h3>
            <div className={styles.widgetActions}>
              <Link href={`/my-studies/${studyId}/video-call`} className={styles.widgetButton}>
                📹 화상 스터디
              </Link>
              <Link href={`/my-studies/${studyId}/files`} className={styles.widgetButton}>
                📁 파일 공유
              </Link>
              <Link href={`/my-studies/${studyId}/notices`} className={styles.widgetButton}>
                📢 공지 작성
              </Link>
              <Link href={`/my-studies/${studyId}/calendar`} className={styles.widgetButton}>
                📅 일정 추가
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
