// 내 스터디 채팅 페이지
'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { useStudy, useMessages, useSendMessage, useDeleteMessage } from '@/lib/hooks/useApi';

export default function MyStudyChatPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const messagesEndRef = useRef(null);
  const [content, setContent] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);

  // 실제 API Hooks
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
  const { data: messagesData, isLoading: messagesLoading } = useMessages(studyId);
  const sendMessageMutation = useSendMessage();
  const deleteMessageMutation = useDeleteMessage();

  const study = studyData?.data;
  const messages = messagesData?.messages || [];
  const onlineMembers = []; // TODO: Socket.io로 실시간 온라인 멤버 구현

  const tabs = [
    { label: '개요', href: `/my-studies/${studyId}`, icon: '📊' },
    { label: '채팅', href: `/my-studies/${studyId}/chat`, icon: '💬' },
    { label: '공지', href: `/my-studies/${studyId}/notices`, icon: '📢' },
    { label: '파일', href: `/my-studies/${studyId}/files`, icon: '📁' },
    { label: '캘린더', href: `/my-studies/${studyId}/calendar`, icon: '📅' },
    { label: '할일', href: `/my-studies/${studyId}/tasks`, icon: '✅' },
    { label: '화상', href: `/my-studies/${studyId}/video-call`, icon: '📹' },
    { label: '설정', href: `/my-studies/${studyId}/settings`, icon: '⚙️' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        studyId,
        data: { content: content.trim() }
      });
      setContent('');
    } catch (error) {
      alert('메시지 전송 실패: ' + error.message);
    }
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

        <div className={styles.studyHeader}>
          <div className={styles.studyInfo}>
            <span className={styles.emoji}>{study.emoji}</span>
            <div>
              <h1 className={styles.studyName}>{study.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`${styles.tab} ${tab.label === '채팅' ? styles.active : ''}`}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </Link>
        ))}
      </div>

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
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                첫 메시지를 보내보세요! 👋
              </div>
            ) : (
              messages.map((message) => {
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
          <form onSubmit={handleSend} className={styles.inputArea}>
            <button type="button" className={styles.fileButton}>
              📎
            </button>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="메시지를 입력하세요..."
              className={styles.inputTextarea}
              rows={1}
              disabled={sendMessageMutation.isPending}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!content.trim() || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? '전송 중...' : '전송'}
            </button>
          </form>
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
