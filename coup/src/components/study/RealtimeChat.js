'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatSocket, useStudySocket } from '@/lib/hooks/useStudySocket'
import { useSocket } from '@/contexts/SocketContext'

export default function RealtimeChat({ studyId, initialMessages = [] }) {
  const { user } = useSocket()
  const [messages, setMessages] = useState(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const { onlineUsers } = useStudySocket(studyId)
  const {
    newMessage,
    typingUsers,
    sendMessage,
    markAsRead,
    setTyping,
    isConnected
  } = useChatSocket(studyId)

  // 새 메시지 수신
  useEffect(() => {
    if (newMessage) {
      setMessages(prev => [...prev, newMessage])

      // 자동 스크롤
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

      // 자동 읽음 처리 (본인 메시지가 아닌 경우)
      if (newMessage.userId !== user?.id) {
        setTimeout(() => {
          markAsRead(newMessage.id)
        }, 500)
      }
    }
  }, [newMessage, user?.id, markAsRead])

  // 메시지 전송
  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!inputValue.trim() || !isConnected) return

    sendMessage(inputValue.trim())
    setInputValue('')

    // 타이핑 상태 해제
    setTyping(false)
    setIsTyping(false)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  // 타이핑 감지
  const handleInputChange = (e) => {
    setInputValue(e.target.value)

    if (!isConnected) return

    // 타이핑 시작
    if (!isTyping) {
      setIsTyping(true)
      setTyping(true)
    }

    // 3초 후 타이핑 상태 해제
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      setTyping(false)
    }, 3000)
  }

  return (
    <div className="flex flex-col h-full">
      {/* 연결 상태 표시 */}
      <div className="px-4 py-2 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? '실시간 연결됨' : '연결 중...'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            온라인: {onlineUsers.length}명
          </div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isMyMessage = message.userId === user?.id

          return (
            <div
              key={message.id}
              className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isMyMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!isMyMessage && (
                  <div className="flex items-center gap-2">
                    <img
                      src={message.user.avatar}
                      alt={message.user.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {message.user.name}
                    </span>
                  </div>
                )}

                <div className={`px-4 py-2 rounded-lg ${
                  isMyMessage 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>
                    {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {isMyMessage && message.readers && (
                    <span>읽음 {message.readers.length}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* 타이핑 인디케이터 */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>
              {typingUsers.map(u => u.user.name).join(', ')}님이 입력 중...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중..."}
            disabled={!isConnected}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !isConnected}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            전송
          </button>
        </div>
      </form>
    </div>
  )
}
