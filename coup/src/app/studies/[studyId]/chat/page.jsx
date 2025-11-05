'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '@/styles/studies/chat.module.css'

export default function StudyChatPage({ params }) {
  const router = useRouter()
  const messagesEndRef = useRef(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [currentUser] = useState({ id: 1, name: '나' })

  // 샘플 스터디 데이터
  const study = {
    id: params.studyId,
    emoji: '📚',
    name: '코딩테스트 마스터 스터디'
  }

  // 샘플 메시지 데이터
  const sampleMessages = [
    {
      id: 1,
      type: 'system',
      content: '김철수님이 입장하셨습니다',
      timestamp: '2025-11-05T09:00:00'
    },
    {
      id: 2,
      type: 'message',
      userId: 2,
      userName: '김철수',
      content: '오늘 문제 풀었어요?',
      timestamp: '2025-11-05T10:30:00'
    },
    {
      id: 3,
      type: 'message',
      userId: 1,
      userName: '나',
      content: '네, 3문제 완료했습니다',
      timestamp: '2025-11-05T10:31:00'
    },
    {
      id: 4,
      type: 'message',
      userId: 3,
      userName: '이영희',
      content: '저도 2문제 풀었어요!',
      timestamp: '2025-11-05T10:32:00'
    },
    {
      id: 5,
      type: 'message',
      userId: 2,
      userName: '김철수',
      content: '다들 열심히 하시네요! 오늘 저녁에 같이 풀이 공유할까요?',
      timestamp: '2025-11-05T10:35:00'
    }
  ]

  useEffect(() => {
    setMessages(sampleMessages)
    scrollToBottom()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      type: 'message',
      userId: currentUser.id,
      userName: currentUser.name,
      content: message.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages([...messages, newMessage])
    setMessage('')
    setTimeout(scrollToBottom, 100)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const shouldShowDateDivider = (currentMsg, prevMsg) => {
    if (!prevMsg) return true
    
    const currentDate = new Date(currentMsg.timestamp).toDateString()
    const prevDate = new Date(prevMsg.timestamp).toDateString()
    
    return currentDate !== prevDate
  }

  const tabs = [
    { id: 'overview', name: '개요', path: `/studies/${params.studyId}` },
    { id: 'chat', name: '채팅', path: `/studies/${params.studyId}/chat` },
    { id: 'notices', name: '공지', path: `/studies/${params.studyId}/notices` },
    { id: 'files', name: '파일', path: `/studies/${params.studyId}/files` },
    { id: 'calendar', name: '캘린더', path: `/studies/${params.studyId}/calendar` },
    { id: 'tasks', name: '할일', path: `/studies/${params.studyId}/tasks` }
  ]

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button onClick={() => router.push(`/studies/${params.studyId}`)} className={styles.backButton}>
          ← 뒤로가기
        </button>
        <h1 className={styles.studyName}>
          <span className={styles.emoji}>{study.emoji}</span>
          {study.name}
        </h1>
      </div>

      {/* 탭 네비게이션 */}
      <div className={styles.tabNavigation}>
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.path}
            className={`${styles.tab} ${tab.id === 'chat' ? styles.tabActive : ''}`}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      {/* 채팅 영역 */}
      <div className={styles.chatContainer}>
        {/* 메시지 목록 */}
        <div className={styles.messagesArea}>
          {messages.map((msg, index) => (
            <div key={msg.id}>
              {/* 날짜 구분선 */}
              {shouldShowDateDivider(msg, messages[index - 1]) && (
                <div className={styles.dateDivider}>
                  <span>{formatDate(msg.timestamp)}</span>
                </div>
              )}

              {/* 시스템 메시지 */}
              {msg.type === 'system' && (
                <div className={styles.systemMessage}>
                  {msg.content}
                </div>
              )}

              {/* 일반 메시지 */}
              {msg.type === 'message' && (
                <div className={`${styles.messageItem} ${msg.userId === currentUser.id ? styles.mine : ''}`}>
                  <div className={styles.messageContent}>
                    {msg.userId !== currentUser.id && (
                      <div className={styles.messageHeader}>
                        <div className={styles.avatar}>👤</div>
                        <div className={styles.userName}>{msg.userName}</div>
                        <div className={styles.messageTime}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    )}
                    <div className={styles.messageRow}>
                      <div className={`${styles.messageBubble} ${msg.userId === currentUser.id ? styles.mine : styles.other}`}>
                        {msg.content}
                      </div>
                      {msg.userId === currentUser.id && (
                        <div className={styles.messageTime}>
                          {formatTime(msg.timestamp)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <form onSubmit={handleSendMessage} className={styles.inputContainer}>
          <button type="button" className={styles.attachButton} title="파일 첨부">
            📎
          </button>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className={styles.input}
            rows={1}
          />
          <button 
            type="submit" 
            className={styles.sendButton}
            disabled={!message.trim()}
          >
            전송
          </button>
        </form>
      </div>
    </div>
  )
}
