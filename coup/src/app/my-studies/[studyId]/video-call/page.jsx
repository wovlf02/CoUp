// 내 스터디 화상회의 페이지 (3단 레이아웃: 참여자 | 비디오 | 채팅)
'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useStudy } from '@/lib/hooks/useApi';
import { useSocket } from '@/lib/hooks/useSocket';
import { useVideoCall } from '@/lib/hooks/useVideoCall';
import VideoTile from '@/components/video-call/VideoTile';
import ControlBar from '@/components/video-call/ControlBar';
import { getStudyHeaderStyle } from '@/utils/studyColors';
import styles from './page.module.css';

export default function MyStudyVideoCallPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const roomId = `study-${studyId}-main`;

  // 탭 메뉴
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

  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const chatEndRef = useRef(null);

  // Session - 현재 로그인한 사용자 정보
  const { data: session } = useSession();
  const currentUser = session?.user;

  // 사용자 정보 디버깅
  useEffect(() => {
    console.log('[VideoCall] Current user:', currentUser);
  }, [currentUser]);

  // API Hooks
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
  const study = studyData?.data;

  // Socket
  const { socket, isConnected } = useSocket();
  const [socketConnected, setSocketConnected] = useState(false);

  // 실시간 소켓 연결 상태 확인
  useEffect(() => {
    if (!socket) return;

    const checkConnection = () => {
      setSocketConnected(socket.connected);
    };

    // 초기 확인
    checkConnection();

    // 주기적으로 확인 (100ms)
    const interval = setInterval(checkConnection, 100);

    // 소켓 이벤트 리스너
    socket.on('connect', checkConnection);
    socket.on('disconnect', checkConnection);

    return () => {
      clearInterval(interval);
      socket.off('connect', checkConnection);
      socket.off('disconnect', checkConnection);
    };
  }, [socket]);

  // 소켓 상태 디버깅
  useEffect(() => {
    console.log('[VideoCall Page] Socket state changed:', {
      socket: !!socket,
      isConnected,
      socketConnected,
      socketId: socket?.id,
      actuallyConnected: socket?.connected
    });
  }, [socket, isConnected, socketConnected]);

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

  // 채팅 이벤트 리스너
  useEffect(() => {
    if (!socket || !isInCall || !currentUser) return;

    // 화상 통화 중 채팅 메시지 수신
    socket.on('chat:video-message-received', (message) => {
      console.log('[VideoCall] Received chat message:', message);

      // 자신이 보낸 메시지는 이미 화면에 표시했으므로 무시
      if (message.userId === currentUser.id && message.socketId === socket.id) {
        return;
      }

      // 다른 사람이 보낸 메시지만 추가
      setChatMessages((prev) => [...prev, { ...message, isMe: false }]);

      // 자동 스크롤
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => {
      socket.off('chat:video-message-received');
    };
  }, [socket, isInCall, currentUser]);

  // 통화 시간 카운터
  useEffect(() => {
    if (!isInCall) return;

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
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

  // 그리드 레이아웃 계산 (참여자 수에 따라 유동적으로)
  const getGridLayout = () => {
    const totalCount = participants.length + (localStream ? 1 : 0);
    if (totalCount === 1) return styles.grid1;
    if (totalCount === 2) return styles.grid2x2;
    if (totalCount <= 4) return styles.grid3x3; // 3~4명: 2x2
    if (totalCount <= 6) return styles.grid4x3; // 5~6명: 3x2
    if (totalCount <= 9) return styles.grid3x3Large; // 7~9명: 3x3
    return styles.gridLarge; // 10명 이상: 4xN (스크롤)
  };

  const handleJoinCall = async () => {
    // 실제 소켓 연결 상태 확인 (React 상태가 아닌)
    if (!socket || !socket.connected) {
      console.warn('[VideoCall] Socket not ready:', {
        socket: !!socket,
        isConnected,
        actuallyConnected: socket?.connected
      });
      alert('시그널링 서버에 연결 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      console.log('[VideoCall] ✅ Attempting to join room...');
      await joinRoom(true, true);
      setIsInCall(true);
      setCallDuration(0);
      setChatMessages([]); // 채팅 초기화
    } catch (err) {
      console.error('[VideoCall] Join failed:', err);
      alert(err.message || error || '화상회의 입장에 실패했습니다.');
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
      shareScreen().catch(() => {
        alert('화면 공유에 실패했습니다.');
      });
    }
  };

  // 채팅 메시지 전송
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !socket || !currentUser) return;

    const newMessage = {
      id: `msg_${Date.now()}_${socket.id}`,
      roomId,
      userId: currentUser.id,
      user: currentUser,
      message: chatMessage.trim(),
      timestamp: new Date(),
      socketId: socket.id,
      isMe: true // 자신이 보낸 메시지 표시
    };

    // 즉시 화면에 표시
    setChatMessages((prev) => [...prev, newMessage]);

    // 서버로 전송
    socket.emit('chat:video-message', {
      roomId,
      message: chatMessage.trim()
    });

    setChatMessage('');

    // 자동 스크롤
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  if (studyLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (!study) {
    return <div className={styles.error}>스터디를 찾을 수 없습니다.</div>;
  }

  const headerStyle = getStudyHeaderStyle(study.category);

  // 대기실 화면 (참여 전)
  if (!isInCall) {
    return (
      <div className={styles.container}>
        {/* 헤더 */}
        <header className={styles.header} style={{ background: headerStyle.gradient }}>
          <div className={styles.headerTop}>
            <Link href="/my-studies" className={styles.backButton}>
              ← 내 스터디 목록
            </Link>
          </div>
          <div className={styles.headerContent}>
            <span className={styles.emoji}>{study.emoji || '📚'}</span>
            <h1 className={styles.title}>{study.name}</h1>
          </div>
          <nav className={styles.tabs}>
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={tab.label === '화상' ? styles.tabActive : styles.tab}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                {tab.label}
              </Link>
            ))}
          </nav>
        </header>

        {/* 대기실 */}
        <div className={styles.waiting}>
          <div className={styles.waitingContent}>
            <div className={styles.preview}>
              <h2>화상 스터디</h2>
              <p>참여하시겠습니까?</p>

              {/* 소켓 연결 상태 표시 - 실제 연결 상태 기준 */}
              {!socketConnected ? (
                <div className={styles.connectionStatus}>
                  🔄 시그널링 서버 연결 중...
                  <div style={{ fontSize: '0.75rem', marginTop: '8px', opacity: 0.8 }}>
                    Socket: {socket ? '생성됨' : '미생성'} |
                    Connected: {socketConnected ? 'Yes' : 'No'}
                  </div>
                </div>
              ) : (
                <div className={styles.connectionStatus} style={{ background: 'var(--green-50)', color: 'var(--green-700)' }}>
                  ✅ 연결됨 (Socket ID: {socket?.id?.substring(0, 8)}...)
                </div>
              )}

              <button
                onClick={handleJoinCall}
                className={styles.joinButton}
                disabled={!socketConnected}
                style={{ opacity: socketConnected ? 1 : 0.5 }}
              >
                🎥 {socketConnected ? '참여하기' : '연결 대기 중...'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 화상 통화 메인 화면 (3단 레이아웃)
  return (
    <div className={styles.container}>

      {/* 메인 컨텐츠 영역 (3단 레이아웃) */}
      <div className={styles.mainContent}>
        {/* 좌측 사이드바: 참여자 목록 */}
        <aside className={styles.leftSidebar}>
          <div className={styles.sidebarHeader}>
            <h3>👥 참여자 ({participants.length + 1})</h3>
          </div>
          <div className={styles.participantList}>
            {/* 나 */}
            <div className={styles.participant}>
              <div className={styles.participantAvatar}>
                {currentUser?.name?.charAt(0) || '?'}
              </div>
              <div className={styles.participantInfo}>
                <div className={styles.participantName}>
                  👑 {currentUser?.name || '나'} (나)
                </div>
                <div className={styles.participantStatus}>
                  {!isMuted && '🎤'} {!isVideoOff && '📹'}
                </div>
              </div>
            </div>

            {/* 다른 참여자들 */}
            {participants.map((participant) => (
              <div key={participant.socketId} className={styles.participant}>
                <div className={styles.participantAvatar}>
                  {participant.user?.name?.charAt(0) || '?'}
                </div>
                <div className={styles.participantInfo}>
                  <div className={styles.participantName}>
                    {participant.user?.name || 'Unknown'}
                  </div>
                  <div className={styles.participantStatus}>
                    {!participant.isMuted && '🎤'} {!participant.isVideoOff && '📹'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* 중앙: 비디오 그리드 */}
        <main className={styles.videoArea}>
          <div className={`${styles.videoGrid} ${getGridLayout()}`}>
            {/* 로컬 비디오 */}
            {localStream && (
              <VideoTile
                stream={localStream}
                isLocal={true}
                user={currentUser}
                isMuted={isMuted}
                isVideoOff={isVideoOff}
                onToggleMute={toggleMute}
                onToggleVideo={toggleVideo}
              />
            )}

            {/* 원격 비디오 */}
            {participants.map((participant) => {
              const stream = remoteStreams.get(participant.socketId);
              return (
                <VideoTile
                  key={participant.socketId}
                  stream={stream}
                  isLocal={false}
                  user={participant.user}
                  isMuted={participant.isMuted}
                  isVideoOff={participant.isVideoOff}
                  isSharingScreen={participant.isSharingScreen}
                />
              );
            })}
          </div>
        </main>

        {/* 우측 사이드바: 채팅 */}
        <aside className={styles.rightSidebar}>
          <div className={styles.sidebarHeader}>
            <h3>💬 채팅</h3>
          </div>
          <div className={styles.chatMessages}>
            {chatMessages.length === 0 ? (
              <div className={styles.chatEmpty}>채팅을 시작해보세요!</div>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={msg.isMe ? styles.chatMessageMe : styles.chatMessage}
                >
                  {!msg.isMe && (
                    <div className={styles.chatMessageHeader}>
                      <strong>{msg.user?.name || 'Unknown'}</strong>
                      <span className={styles.chatMessageTime}>
                        {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  <div className={styles.chatMessageContent}>
                    {msg.message}
                  </div>
                  {msg.isMe && (
                    <div className={styles.chatMessageTime} style={{ textAlign: 'right', marginTop: '4px' }}>
                      {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
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
        callDuration={formatDuration(callDuration)}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onShareScreen={handleShareScreen}
        onSettings={() => alert('설정 기능은 추후 구현 예정입니다.')}
        onLeave={handleLeaveCall}
      />

      {/* 에러 표시 */}
      {error && (
        <div className={styles.errorBanner}>
          {error}
        </div>
      )}
    </div>
  );
}
