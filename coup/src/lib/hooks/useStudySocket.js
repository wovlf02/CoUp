'use client'

import { useEffect, useCallback, useState } from 'react'
import { useSocket } from '@/contexts/SocketContext'

export function useStudySocket(studyId) {
  const { socket, isConnected } = useSocket()
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    if (!socket || !isConnected || !studyId) return

    // 스터디 룸 참여
    socket.emit('study:join', studyId)

    // 온라인 사용자 목록 수신
    socket.on('study:online-users', (data) => {
      if (data.studyId === studyId) {
        setOnlineUsers(data.users)
      }
    })

    // 사용자 온라인
    socket.on('user:online', (data) => {
      setOnlineUsers(prev => {
        if (prev.find(u => u.userId === data.userId)) return prev
        return [...prev, { userId: data.userId, ...data.user }]
      })
    })

    // 사용자 오프라인
    socket.on('user:offline', (data) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId))
    })

    return () => {
      socket.emit('study:leave', studyId)
      socket.off('study:online-users')
      socket.off('user:online')
      socket.off('user:offline')
    }
  }, [socket, isConnected, studyId])

  return {
    onlineUsers,
    isConnected
  }
}

export function useChatSocket(studyId) {
  const { socket, isConnected } = useSocket()
  const [newMessage, setNewMessage] = useState(null)
  const [typingUsers, setTypingUsers] = useState([])

  useEffect(() => {
    if (!socket || !isConnected || !studyId) return

    // 새 메시지 수신
    socket.on('chat:new-message', (message) => {
      setNewMessage(message)
    })

    // 메시지 읽음 상태 업데이트
    socket.on('chat:message-read', (data) => {
      // 부모 컴포넌트에서 처리
    })

    // 타이핑 상태 수신
    socket.on('chat:user-typing', (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => {
          if (prev.find(u => u.userId === data.userId)) return prev
          return [...prev, data]
        })
      } else {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
      }
    })

    return () => {
      socket.off('chat:new-message')
      socket.off('chat:message-read')
      socket.off('chat:user-typing')
    }
  }, [socket, isConnected, studyId])

  // 메시지 전송
  const sendMessage = useCallback((content, fileId = null) => {
    if (!socket || !isConnected) return

    socket.emit('chat:message', {
      studyId,
      content,
      fileId
    })
  }, [socket, isConnected, studyId])

  // 메시지 읽음 처리
  const markAsRead = useCallback((messageId) => {
    if (!socket || !isConnected) return

    socket.emit('chat:read', {
      messageId
    })
  }, [socket, isConnected])

  // 타이핑 상태 전송
  const setTyping = useCallback((isTyping) => {
    if (!socket || !isConnected) return

    socket.emit('chat:typing', {
      studyId,
      isTyping
    })
  }, [socket, isConnected, studyId])

  return {
    newMessage,
    typingUsers,
    sendMessage,
    markAsRead,
    setTyping,
    isConnected
  }
}

