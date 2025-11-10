'use client'

import { useState, useEffect, useRef } from 'react'
import styles from '@/styles/studies/chat.module.css'

export default function StudyChatPage() {
  const messagesRef = useRef(null)
  const messagesEndRef = useRef(null)
  const [content, setContent] = useState('')
  const [messages, setMessages] = useState([])
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentUser] = useState({ id: 1, name: '나' })

  // 샘플 메시지 데이터
  useEffect(() => {
    const sampleMessages = [
      { id: 1, type: 'date', content: '2025년 11월 4일' },
      { id: 2, type: 'system', content: '김철수님이 입장하셨습니다' },
      { id: 3, type: 'message', userId: 2, userName: '김철수', avatar: '👤', content: '어제 공부한 내용 공유해요', timestamp: '09:15 AM', isMine: false },
      { id: 4, type: 'date', content: '2025년 11월 5일' },
      { id: 5, type: 'message', userId: 2, userName: '김철수', avatar: '👤', content: '오늘 문제 풀었어요?', timestamp: '10:30 AM', isMine: false },
      { id: 6, type: 'message', userId: 1, userName: '나', content: '네, 3문제 완료했습니다', timestamp: '10:31 AM', isMine: true },
      { id: 7, type: 'message', userId: 3, userName: '이영희', avatar: '👤', content: '저도 2문제 풀었어요!', timestamp: '10:32 AM', isMine: false },
    ]
    setMessages(sampleMessages)
    setTimeout(() => scrollToBottom('auto'), 100)
  }, [])

  // 스크롤 이벤트 처리
  useEffect(() => {
    const messagesContainer = messagesRef.current
    if (!messagesContainer) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer

      // 최상단 도달 시 이전 메시지 로드
      if (scrollTop === 0 && hasMore && !isLoadingMore) {
        loadMoreMessages()
      }

      // 사용자가 하단에 있는지 확인
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
      setIsUserScrolling(!isAtBottom)
    }

    messagesContainer.addEventListener('scroll', handleScroll)
    return () => messagesContainer.removeEventListener('scroll', handleScroll)
  }, [hasMore, isLoadingMore])

  // 새 메시지 수신 시 자동 스크롤
  useEffect(() => {
    if (!isUserScrolling && messages.length > 0) {
      scrollToBottom('smooth')
    }
  }, [messages, isUserScrolling])

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' })
  }

  const loadMoreMessages = async () => {
    setIsLoadingMore(true)
    const messagesContainer = messagesRef.current
    const previousScrollHeight = messagesContainer.scrollHeight

    // TODO: 실제 API 호출로 이전 메시지 50개 로드
    setTimeout(() => {
      const olderMessages = [
        { id: Date.now(), type: 'message', userId: 2, userName: '김철수', avatar: '👤', content: '이전 메시지입니다', timestamp: '09:00 AM', isMine: false },
      ]

      setMessages(prev => [...olderMessages, ...prev])
      setIsLoadingMore(false)

      // 스크롤 위치 유지
      setTimeout(() => {
        const newScrollHeight = messagesContainer.scrollHeight
        messagesContainer.scrollTop = newScrollHeight - previousScrollHeight
      }, 0)

      // 더 이상 메시지가 없으면
      // setHasMore(false)
    }, 500)
  }

  const handleSend = () => {
    if (!content.trim()) return

    const newMessage = {
      id: Date.now(),
      type: 'message',
      userId: currentUser.id,
      userName: currentUser.name,
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    }

    setMessages(prev => [...prev, newMessage])
    setContent('')
    scrollToBottom('smooth')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.chatContainer}>
      {/* 메시지 영역 */}
      <div className={styles.chatMessages} ref={messagesRef}>
        {isLoadingMore && (
          <div className={styles.loadingMessages}>
            <span>이전 메시지를 불러오는 중...</span>
          </div>
        )}

        {!hasMore && messages.length > 10 && (
          <div className={styles.noMoreMessages}>
            더 이상 메시지가 없습니다
          </div>
        )}

        {messages.map((message) => {
          if (message.type === 'date') {
            return (
              <div key={message.id} className={styles.dateDivider}>
                <span>{message.content}</span>
              </div>
            )
          }

          if (message.type === 'system') {
            return (
              <div key={message.id} className={styles.systemMessage}>
                {message.content}
              </div>
            )
          }

          return (
            <div
              key={message.id}
              className={`${styles.messageItem} ${message.isMine ? styles.mine : ''}`}
            >
              {!message.isMine && (
                <div className={styles.messageAvatar}>
                  {message.avatar}
                </div>
              )}

              <div className={styles.messageContent}>
                <div className={styles.messageMeta}>
                  {!message.isMine && (
                    <span className={styles.userName}>{message.userName}</span>
                  )}
                  <span className={styles.timestamp}>{message.timestamp}</span>
                </div>
                <div className={`${styles.messageBubble} ${message.isMine ? styles.mine : styles.other}`}>
                  {message.content}
                </div>
              </div>
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className={styles.chatInputContainer}>
        <div className={styles.chatInputWrapper}>
          <button className={styles.attachButton} title="파일 첨부">
            📎
          </button>
          <textarea
            className={styles.chatInput}
            placeholder="메시지를 입력하세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
          />
        </div>
        <button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={!content.trim()}
        >
          전송
        </button>
      </div>
    </div>
  )
}
