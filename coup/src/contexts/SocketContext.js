'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: session, status } = useSession()

  // 중복 검증 방지
  const isValidatingRef = useRef(false)
  const hasValidatedRef = useRef(false)

  // 안전하게 user 정보 추출
  const user = session?.user && session.user.id ? session.user : null

  useEffect(() => {
    // 로딩 중이면 아무것도 하지 않음
    if (status === 'loading') {
      console.log('🔄 Socket: Waiting for session...')
      return
    }

    // 로그인하지 않은 경우 또는 user 정보가 없는 경우 소켓 정리
    if (status === 'unauthenticated' || !user || !user.id) {
      console.log('⛔ Socket: Not authenticated - no connection needed')
      
      // 기존 소켓이 있으면 정리
      if (socket) {
        console.log('🧹 Socket: Cleaning up existing socket')
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // 여기까지 왔다면: status === 'authenticated' && user?.id 존재
    console.log('✅ Socket: User authenticated, validating...')
    console.log('   User ID:', user.id)
    console.log('   User Email:', user.email || 'N/A')
    console.log('   User Name:', user.name || 'N/A')

    // 이미 검증했거나 검증 중이면 스킵
    if (hasValidatedRef.current || isValidatingRef.current) {
      console.log('ℹ️ Socket: Already validated, skipping')
      return
    }

    // 세션 유효성 검증 (DB에서 사용자 확인)
    const validateAndConnect = async () => {
      if (isValidatingRef.current) return

      isValidatingRef.current = true

      try {
        const response = await fetch('/api/auth/validate-session', { credentials: 'include' })
        const data = await response.json()

        hasValidatedRef.current = true

        if (!data.valid) {
          console.warn('⚠️ Socket: Invalid session detected:', data.error)

          if (data.shouldLogout) {
            console.warn('🚫 Socket: User not found in DB, session will be cleared')
            // 기존 소켓 정리
            if (socket) {
              socket.disconnect()
              setSocket(null)
              setIsConnected(false)
            }
          }
          return
        }

        // 세션 유효 - 소켓 연결 진행
        console.log('✅ Socket: Session validated, preparing connection...')

        // 이미 같은 사용자로 연결되어 있으면 재연결하지 않음
        if (socket?.auth?.userId === user.id && socket.connected) {
          console.log('ℹ️ Socket: Already connected with same user')
          return
        }

        // 기존 소켓 정리 (다른 사용자이거나 연결이 끊긴 경우)
        if (socket) {
          console.log('🔄 Socket: Disconnecting old socket')
          socket.disconnect()
        }

        // Socket.io 인스턴스 생성
        console.log('🔌 Socket: Creating new socket instance')
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
          auth: {
            userId: user.id
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          autoConnect: false, // ⭐ 중요: 자동 연결 비활성화
        })

        // 이벤트 리스너 등록
        socketInstance.on('connect', () => {
          console.log('✅ Socket connected:', socketInstance.id)
          setIsConnected(true)
        })

        socketInstance.on('disconnect', (reason) => {
          console.log('❌ Socket disconnected:', reason)
          setIsConnected(false)
        })

        socketInstance.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error.message)
          console.error('   Full error:', error)
          setIsConnected(false)

          // 에러 유형에 따른 처리
          if (error.message.includes('User not found')) {
            console.error('🚫 Socket: User not found in database')
            console.error('   Please check if user exists and is properly created')
            socketInstance.disconnect()
          } else if (error.message.includes('User status is')) {
            console.error('🚫 Socket: User account is not active')
            console.error('   User status:', error.message.split('User status is ')[1])
            socketInstance.disconnect()
          } else if (error.message.includes('Authentication') || error.message.includes('Invalid user')) {
            console.error('🚫 Socket: Authentication failed, stopping reconnection')
            socketInstance.disconnect()
          } else {
            console.error('🔄 Socket: Will retry connection...')
          }
        })

        socketInstance.on('error', (error) => {
          console.error('❌ Socket error:', error.message)
        })

        // 소켓 상태 저장
        setSocket(socketInstance)

        // 수동으로 연결 시작
        console.log('🚀 Socket: Initiating connection...')
        socketInstance.connect()

      } catch (error) {
        console.error('❌ Socket: Validation error:', error)
        hasValidatedRef.current = true
      } finally {
        isValidatingRef.current = false
      }
    }

    // 검증 및 연결 실행
    validateAndConnect()

    // Cleanup 함수
    return () => {
      console.log('🧹 Socket: Cleanup - disconnecting')
      // Ref 초기화 (컴포넌트 언마운트 시)
      hasValidatedRef.current = false
      isValidatingRef.current = false

      if (socket?.connected) {
        socket.disconnect()
      }
      setIsConnected(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, status])

  const value = {
    socket,
    isConnected,
    user,
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
