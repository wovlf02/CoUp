'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [user, setUser] = useState(null)

  // 사용자 정보 확인
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // 로그인하지 않은 경우 조용히 처리
          setUser(null)
        }
      } catch (error) {
        // 네트워크 오류 등은 조용히 처리
        console.debug('User check failed:', error.message)
        setUser(null)
      }
    }

    checkUser()
  }, [])

  useEffect(() => {
    // 로그인하지 않은 경우 소켓 연결 안 함
    if (!user?.id) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Socket.io 연결 (로그인 후에만)
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        userId: user.id
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user?.id])

  const value = {
    socket,
    isConnected,
    user,
    setUser // 로그인 후 사용자 정보 업데이트용
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
