// 내 스터디 채팅 페이지
'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { studyChatData } from '@/mocks/studyChat';

export default function MyStudyChatPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const messagesEndRef = useRef(null);
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineMembers, setOnlineMembers] = useState([]);

  // Mock 데이터
  const data = studyChatData[studyId] || studyChatData[1];
  const { study } = data;

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

  // Mock 메시지 데이터
  useEffect(() => {
    setMessages(data.messages);
    setOnlineMembers(data.onlineMembers);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      userId: 'me',
      userName: '나',
      content: content.trim(),
      timestamp: new Date(),
      isMine: true,
      readers: [],
    };

    setMessages([...messages, newMessage]);
    setContent('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

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
            {messages.map((message) => {
              if (message.type === 'system') {
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
                      {message.userName[0]}
                    </div>
                  )}
                  <div className={styles.messageContent}>
                    {!message.isMine && (
                      <div className={styles.messageMeta}>
                        <span className={styles.userName}>{message.userName}</span>
                        <span className={styles.timestamp}>{formatTime(message.timestamp)}</span>
                      </div>
                    )}
                    <div className={styles.messageBubble}>
                      {message.content}
                      {message.hasFile && (
                        <div className={styles.fileAttachment}>
                          <span className={styles.fileIcon}>📄</span>
                          <div className={styles.fileInfo}>
                            <span className={styles.fileName}>{message.fileName}</span>
                            <span className={styles.fileSize}>{message.fileSize}</span>
                          </div>
                          <button className={styles.downloadButton}>다운로드</button>
                        </div>
                      )}
                    </div>
                    {message.isMine && (
                      <div className={styles.messageMeta}>
                        <span className={styles.readReceipt}>
                          {message.readers && message.readers.length > 0 ? '✓✓ 읽음' : '✓'}
                        </span>
                        <span className={styles.timestamp}>{formatTime(message.timestamp)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

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
            />
            <button type="submit" className={styles.sendButton} disabled={!content.trim()}>
              전송
            </button>
          </form>
        </div>

        {/* 우측 위젯 */}
        <aside className={styles.sidebar}>
          {/* 스터디 현황 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 스터디 현황</h3>
            <div className={styles.widgetContent}>
              <p className={styles.widgetText}>다음 일정: D-7</p>
              <p className={styles.widgetText}>2025.11.13 (수) 14:00</p>
              <p className={styles.widgetText}>주간 회의</p>
            </div>
          </div>

          {/* 온라인 멤버 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>👥 온라인 ({onlineMembers.length}명)</h3>
            <div className={styles.widgetContent}>
              {onlineMembers.map((member) => (
                <div key={member.id} className={styles.memberItem}>
                  <span className={styles.onlineIndicator}>🟢</span>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberName}>
                      {member.name}
                      {member.role === 'OWNER' && ' 👑'}
                      {member.role === 'ADMIN' && ' ⭐'}
                    </div>
                    <div className={styles.memberStatus}>
                      {member.status} · {member.lastSeen}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href={`/my-studies/${studyId}/members`} className={styles.widgetLink}>
              전체 멤버 보기 →
            </Link>
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

          {/* 고정 메시지 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📌 고정 메시지</h3>
            <div className={styles.widgetContent}>
              <div className={styles.pinnedMessage}>
                <div className={styles.pinnedTitle}>매일 오전 9시 문제 공유</div>
                <div className={styles.pinnedMeta}>김철수 · 3일 전</div>
              </div>
              <div className={styles.pinnedMessage}>
                <div className={styles.pinnedTitle}>스터디 규칙 안내</div>
                <div className={styles.pinnedMeta}>김철수 · 1주 전</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
