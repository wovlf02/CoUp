// 내 스터디 화상회의 페이지
'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudy } from '@/lib/hooks/useApi';
import { useVideoCall } from '@/lib/hooks/useVideoCall';
import VideoTile from '@/components/video-call/VideoTile';
import ControlBar from '@/components/video-call/ControlBar';
import styles from './page.module.css';

export default function MyStudyVideoCallPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const roomId = `study-${studyId}-main`;
  
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  // API Hooks
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
  const study = studyData?.data;

  // 화상통화 훅
  const {
    localStream,
    remoteStreams,
    participants,
    isMuted,
    isVideoOff,
    isSharingScreen,
    error,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleVideo,
    shareScreen,
    stopScreenShare,
  } = useVideoCall(studyId, roomId);

  // 통화 시간 카운터
  useEffect(() => {
    if (!isInCall) return;

    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isInCall]);

  // 통화 시간 포맷팅
  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 그리드 레이아웃 계산
  const getGridLayout = () => {
    const totalCount = participants.length + 1; // +1 for local
    if (totalCount <= 1) return styles.grid1;
    if (totalCount <= 4) return styles.grid2x2;
    if (totalCount <= 9) return styles.grid3x3;
    return styles.grid4x3;
  };

  const handleJoinCall = async () => {
    try {
      await joinRoom(true, true);
      setIsInCall(true);
      setCallDuration(0);
    } catch (err) {
      alert(error || '화상회의 입장에 실패했습니다.');
    }
  };

  const handleLeaveCall = () => {
    if (confirm('정말 통화를 종료하시겠습니까?')) {
      leaveRoom();
      setIsInCall(false);
      setCallDuration(0);
      router.push(`/my-studies/${studyId}`);
    }
  };

  const handleShareScreen = () => {
    if (isSharingScreen) {
      stopScreenShare();
    } else {
      shareScreen().catch(err => {
        alert('화면 공유에 실패했습니다.');
      });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      user: '나',
      message: chatMessage,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatMessage('');
  };

  if (studyLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (!study) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>스터디를 찾을 수 없습니다.</div>
      </div>
    );
  }

  // 통화 중이 아닐 때 - 대기실
  if (!isInCall) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => router.push(`/my-studies/${studyId}`)} className={styles.backButton}>
            ← 돌아가기
          </button>
          <h1 className={styles.title}>📹 화상 스터디</h1>
        </div>

        <div className={styles.waitingRoom}>
          <div className={styles.waitingCard}>
            <div className={styles.previewSection}>
              <h3>카메라 미리보기</h3>
              <div className={styles.preview}>
                {localStream ? (
                  <VideoTile stream={localStream} user={study.currentUser} isLocal={true} />
                ) : (
                  <div className={styles.previewPlaceholder}>
                    <div className={styles.icon}>📹</div>
                    <p>카메라 대기 중...</p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.infoSection}>
              <h2>{study.emoji} {study.name}</h2>
              <p className={styles.description}>화상 스터디에 참여하시겠습니까?</p>
              
              {error && (
                <div className={styles.errorMessage}>
                  ⚠️ {error}
                </div>
              )}

              <div className={styles.participantInfo}>
                <span>현재 참여자:</span>
                <strong>{participants.length}명</strong>
              </div>

              <button 
                onClick={handleJoinCall}
                className={styles.joinButton}
                disabled={!!error}
              >
                🎥 참여하기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 통화 중 - Zoom 스타일 레이아웃
  return (
    <div className={styles.fullscreenContainer}>
      {/* 헤더 */}
      <div className={styles.callHeader}>
        <div className={styles.callInfo}>
          <span className={styles.studyName}>{study.emoji} {study.name}</span>
          <span className={styles.participantCount}>👥 {participants.length + 1}명</span>
          <span className={styles.duration}>⏱️ {formatDuration(callDuration)}</span>
        </div>
      </div>

      {/* 메인 레이아웃 (좌측: 참여자, 중앙: 비디오, 우측: 채팅) */}
      <div className={styles.mainLayout}>
        {/* 좌측 사이드바 - 참여자 목록 */}
        <aside className={styles.participantsSidebar}>
          <div className={styles.sidebarHeader}>
            <h3>👥 참여자</h3>
            <span className={styles.count}>{participants.length + 1}</span>
          </div>
          
          <div className={styles.participantsList}>
            {/* 내 정보 */}
            <div className={styles.participantItem}>
              <div className={styles.participantAvatar}>나</div>
              <div className={styles.participantInfo}>
                <span className={styles.participantName}>나 (호스트)</span>
                <div className={styles.participantStatus}>
                  <span>{isMuted ? '🔇' : '🎤'}</span>
                  <span>{isVideoOff ? '📹❌' : '📹'}</span>
                </div>
              </div>
            </div>

            {/* 다른 참여자들 */}
            {participants.map((participant) => (
              <div key={participant.socketId} className={styles.participantItem}>
                <div className={styles.participantAvatar}>
                  {participant.user?.name?.charAt(0) || 'U'}
                </div>
                <div className={styles.participantInfo}>
                  <span className={styles.participantName}>{participant.user?.name || '참여자'}</span>
                  <div className={styles.participantStatus}>
                    <span>🎤</span>
                    <span>📹</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* 중앙 - 비디오 그리드 */}
        <div className={styles.videoSection}>
          <div className={`${styles.videoGrid} ${getGridLayout()}`}>
            {/* 로컬 비디오 */}
            {localStream && (
              <VideoTile
                stream={localStream}
                user={{ name: '나', ...study.currentUser }}
                isLocal={true}
                isMuted={isMuted}
                isVideoOff={isVideoOff}
              />
            )}

            {/* 원격 비디오들 */}
            {participants.map((participant) => {
              const stream = remoteStreams.get(participant.socketId);
              return (
                <VideoTile
                  key={participant.socketId}
                  stream={stream}
                  user={participant.user}
                  isLocal={false}
                />
              );
            })}
          </div>
        </div>

        {/* 우측 사이드바 - 채팅 */}
        <aside className={styles.chatSidebar}>
          <div className={styles.sidebarHeader}>
            <h3>💬 채팅</h3>
          </div>
          
          <div className={styles.chatMessages}>
            {chatMessages.length === 0 ? (
              <div className={styles.emptyChatMessage}>
                채팅을 시작해보세요! 👋
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className={styles.chatMessage}>
                  <div className={styles.chatMessageHeader}>
                    <span className={styles.chatUser}>{msg.user}</span>
                    <span className={styles.chatTime}>{msg.time}</span>
                  </div>
                  <p className={styles.chatMessageText}>{msg.message}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className={styles.chatInput}>
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className={styles.chatInputField}
            />
            <button type="submit" className={styles.chatSendButton}>
              전송
            </button>
          </form>
        </aside>
      </div>

      {/* 하단 컨트롤 바 */}
      <ControlBar
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isSharingScreen={isSharingScreen}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onShareScreen={handleShareScreen}
        onLeave={handleLeaveCall}
        onSettings={() => alert('설정 기능은 준비 중입니다.')}
        callDuration={formatDuration(callDuration)}
      />
    </div>
  );
}
