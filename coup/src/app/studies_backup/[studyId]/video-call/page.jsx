'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function VideoCallPage({ params }) {
  const { studyId } = use(params); // Promise unwrap
  const router = useRouter();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const localVideoRef = useRef(null);

  // Mock data - 참여자
  const participants = [
    { id: 1, name: '김철수(나)', isMuted: !isAudioEnabled, isMe: true },
    { id: 2, name: '이영희', isMuted: false, isMe: false },
    { id: 3, name: '박민수', isMuted: true, isMe: false },
    { id: 4, name: '최지훈', isMuted: false, isMe: false },
    { id: 5, name: '강서연', isMuted: false, isMe: false }
  ];

  // Mock data - 채팅
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: '김철수', message: '화면 보이시나요?', time: '10:30', isMe: true },
    { id: 2, sender: '이영희', message: '네, 잘 보여요!', time: '10:31', isMe: false },
    { id: 3, sender: '박민수', message: '소리가 작게 들려요', time: '10:32', isMe: false }
  ]);

  // 로컬 비디오 스트림 시작
  useEffect(() => {
    const startLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('미디어 스트림 에러:', error);
      }
    };

    startLocalStream();

    return () => {
      // 컴포넌트 언마운트 시 스트림 종료
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        setIsScreenSharing(true);

        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      } catch (error) {
        console.error('화면 공유 에러:', error);
      }
    } else {
      setIsScreenSharing(false);
    }
  };

  const handleLeaveCall = () => {
    if (confirm('통화를 종료하시겠습니까?')) {
      // 스트림 종료
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
      }
      router.push(`/studies/${studyId}`);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        sender: '김철수',
        message: chatMessage,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
    }
  };

  return (
    <div className={styles.container}>
      {/* 상단 헤더 */}
      <div className={styles.header}>
        <div className={styles.studyInfo}>
          <span className={styles.studyEmoji}>📚</span>
          <span className={styles.studyName}>코딩테스트 마스터 스터디</span>
        </div>
        <button className={styles.leaveButton} onClick={handleLeaveCall}>
          나가기
        </button>
      </div>

      {/* 비디오 그리드 */}
      <div className={styles.videoGrid}>
        {/* 내 비디오 */}
        <div className={`${styles.videoTile} ${styles.myVideo}`}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={styles.video}
          />
          <div className={styles.videoOverlay}>
            <span className={styles.participantName}>김철수(나)</span>
            {!isAudioEnabled && <span className={styles.mutedIcon}>🎤</span>}
          </div>
        </div>

        {/* 다른 참여자 비디오 (mock) */}
        {participants.slice(1).map((participant) => (
          <div key={participant.id} className={styles.videoTile}>
            <div className={styles.videoPlaceholder}>
              <div className={styles.avatarLarge}>
                {participant.name.charAt(0)}
              </div>
            </div>
            <div className={styles.videoOverlay}>
              <span className={styles.participantName}>{participant.name}</span>
              {participant.isMuted && <span className={styles.mutedIcon}>🎤</span>}
            </div>
          </div>
        ))}

        {/* 초대 타일 */}
        <div className={`${styles.videoTile} ${styles.inviteTile}`}>
          <div className={styles.inviteContent}>
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
          title={isVideoEnabled ? '비디오 끄기' : '비디오 켜기'}
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
          onClick={() => setIsChatOpen(!isChatOpen)}
          title="채팅"
        >
          💬
          {chatMessages.length > 0 && (
            <span className={styles.chatBadge}>{chatMessages.length}</span>
          )}
        </button>

        <button className={styles.settingsButton} title="설정">
          ⚙️
        </button>

        <button
          className={`${styles.controlButton} ${styles.danger}`}
          onClick={handleLeaveCall}
          title="통화 종료"
        >
          📞
        </button>
      </div>

      {/* 채팅 사이드 패널 */}
      {isChatOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <h3>채팅</h3>
            <button className={styles.closeChatBtn} onClick={() => setIsChatOpen(false)}>
              ×
            </button>
          </div>

          <div className={styles.chatMessages}>
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.chatMessage} ${msg.isMe ? styles.myMessage : ''}`}
              >
                {!msg.isMe && <div className={styles.messageSender}>{msg.sender}</div>}
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>{msg.message}</div>
                  <div className={styles.messageTime}>{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          <form className={styles.chatInput} onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="메시지 입력..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className={styles.chatInputField}
            />
            <button type="submit" className={styles.sendButton}>
              전송
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
