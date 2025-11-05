'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/styles/studies/video-call.module.css'

export default function StudyVideoCallPage({ params }) {
  const router = useRouter()
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState([])

  // 샘플 참여자 데이터
  const [participants, setParticipants] = useState([
    { id: 1, name: '김철수 (나)', isMuted: false, isVideoOff: false, isSpeaking: false, isMe: true },
    { id: 2, name: '이영희', isMuted: false, isVideoOff: false, isSpeaking: false, isMe: false },
    { id: 3, name: '박민수', isMuted: true, isVideoOff: false, isSpeaking: false, isMe: false },
    { id: 4, name: '최지훈', isMuted: false, isVideoOff: false, isSpeaking: false, isMe: false },
    { id: 5, name: '강서연', isMuted: false, isVideoOff: true, isSpeaking: false, isMe: false }
  ])

  const study = {
    id: params.studyId,
    name: '코딩테스트 마스터 스터디'
  }

  useEffect(() => {
    // TODO: WebRTC 초기화
    // 로컬 미디어 스트림 획득
    // navigator.mediaDevices.getUserMedia({ video: true, audio: true })

    return () => {
      // TODO: WebRTC 정리
      // 미디어 스트림 중지
    }
  }, [])

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled)
    // TODO: 오디오 트랙 제어
    // localStream.getAudioTracks()[0].enabled = !isAudioEnabled
  }

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
    // TODO: 비디오 트랙 제어
    // localStream.getVideoTracks()[0].enabled = !isVideoEnabled
  }

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        // TODO: 화면 공유 시작
        // const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        setIsScreenSharing(true)
      } catch (error) {
        console.error('화면 공유 실패:', error)
      }
    } else {
      // TODO: 화면 공유 중지
      setIsScreenSharing(false)
    }
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return

    const newMessage = {
      id: Date.now(),
      userName: '나',
      content: chatMessage,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }

    setChatMessages(prev => [...prev, newMessage])
    setChatMessage('')

    // TODO: WebSocket으로 메시지 전송
  }

  const handleLeave = () => {
    if (confirm('화상 통화를 종료하시겠습니까?')) {
      // TODO: WebRTC 연결 종료
      router.push(`/studies/${params.studyId}`)
    }
  }

  const getGridColumns = (count) => {
    if (count <= 1) return 1
    if (count <= 2) return 2
    if (count <= 4) return 2
    if (count <= 6) return 3
    return 3
  }

  return (
    <div className={styles.videoCallContainer}>
      {/* 상단 헤더 */}
      <div className={styles.videoHeader}>
        <div className={styles.studyName}>
          <span>📚</span>
          <span>{study.name}</span>
        </div>
        <button className={styles.leaveButton} onClick={handleLeave}>
          나가기
        </button>
      </div>

      {/* 비디오 그리드 */}
      <div className={styles.videoGrid} style={{ gridTemplateColumns: `repeat(${getGridColumns(participants.length)}, 1fr)` }}>
        {participants.map((participant) => (
          <div
            key={participant.id}
            className={`${styles.videoTile} ${participant.isSpeaking ? styles.speaking : ''}`}
          >
            {participant.isVideoOff ? (
              <div className={styles.videoOff}>
                <div className={styles.avatar}>👤</div>
                <div className={styles.nameOverlay}>{participant.name}</div>
              </div>
            ) : (
              <>
                {/* TODO: 실제 비디오 element */}
                <div className={styles.videoPlaceholder}>
                  <span>📹 비디오</span>
                </div>
                <div className={styles.nameOverlay}>
                  {participant.name}
                  {participant.isMuted && <span className={styles.mutedIcon}>🔇</span>}
                </div>
              </>
            )}
          </div>
        ))}

        {/* 초대 타일 */}
        <div className={styles.videoTile} style={{ cursor: 'pointer' }}>
          <div className={styles.inviteTile}>
            <div className={styles.inviteIcon}>+</div>
            <div className={styles.inviteText}>멤버 초대</div>
          </div>
        </div>
      </div>

      {/* 하단 컨트롤 바 */}
      <div className={styles.controlBar}>
        <button
          className={`${styles.controlButton} ${!isAudioEnabled ? styles.off : ''}`}
          onClick={toggleAudio}
          title={isAudioEnabled ? '마이크 끄기' : '마이크 켜기'}
        >
          {isAudioEnabled ? '🎤' : '🔇'}
        </button>

        <button
          className={`${styles.controlButton} ${!isVideoEnabled ? styles.off : ''}`}
          onClick={toggleVideo}
          title={isVideoEnabled ? '카메라 끄기' : '카메라 켜기'}
        >
          {isVideoEnabled ? '📹' : '📵'}
        </button>

        <button
          className={`${styles.controlButton} ${isScreenSharing ? styles.active : ''}`}
          onClick={toggleScreenShare}
          title="화면 공유"
        >
          🖥️
        </button>

        <button
          className={`${styles.controlButton} ${isChatOpen ? styles.active : ''}`}
          onClick={toggleChat}
          title="채팅"
        >
          💬
          {chatMessages.length > 0 && <span className={styles.badge}>{chatMessages.length}</span>}
        </button>

        <button className={styles.controlButton} title="설정">
          ⚙️
        </button>

        <button
          className={`${styles.controlButton} ${styles.danger}`}
          onClick={handleLeave}
          title="나가기"
        >
          ❌
        </button>
      </div>

      {/* 채팅 사이드 패널 */}
      {isChatOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <span>채팅</span>
            <button className={styles.closeChatButton} onClick={toggleChat}>
              ✕
            </button>
          </div>

          <div className={styles.chatMessages}>
            {chatMessages.length === 0 ? (
              <div className={styles.emptyChatState}>
                채팅 메시지가 없습니다
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className={styles.chatMessage}>
                  <div className={styles.chatMessageHeader}>
                    <span className={styles.chatUserName}>{msg.userName}</span>
                    <span className={styles.chatTimestamp}>{msg.timestamp}</span>
                  </div>
                  <div className={styles.chatMessageContent}>{msg.content}</div>
                </div>
              ))
            )}
          </div>

          <div className={styles.chatInput}>
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="메시지 입력..."
            />
            <button onClick={handleSendMessage} disabled={!chatMessage.trim()}>
              전송
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

