// WebRTC 화상회의 훅
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';

export function useVideoCall(studyId, roomId) {
  const { socket, isConnected } = useSocket();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [error, setError] = useState(null);

  const peersRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  // ICE 서버 설정 (useRef로 변경)
  const iceServersRef = useRef({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ]
  });

  // 로컬 미디어 스트림 초기화
  const initLocalStream = useCallback(async (videoEnabled = true, audioEnabled = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false,
        audio: audioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsVideoOff(!videoEnabled);
      setIsMuted(!audioEnabled);

      return stream;
    } catch (err) {
      console.error('Failed to get local stream:', err);
      setError('카메라/마이크 권한이 필요합니다.');
      throw err;
    }
  }, []);

  // Peer 정리
  const cleanupPeer = useCallback((socketId) => {
    const peer = peersRef.current.get(socketId);
    if (peer) {
      peer.close();
      peersRef.current.delete(socketId);
    }

    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(socketId);
      return newMap;
    });
  }, []);

  // Offer 생성 및 전송
  const createOffer = useCallback(async (socketId, peer) => {
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      if (socket) {
        socket.emit('video:offer', {
          to: socketId,
          offer
        });
      }
    } catch (err) {
      console.error('Failed to create offer:', err);
    }
  }, [socket]);

  // Peer Connection 생성
  const createPeerConnection = useCallback((socketId, isInitiator = false) => {
    const peer = new RTCPeerConnection(iceServersRef.current);

    // 로컬 스트림 트랙 추가
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current);
      });
    }

    // 원격 스트림 수신
    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(socketId, remoteStream);
        return newMap;
      });
    };

    // ICE Candidate 전송
    peer.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('video:ice-candidate', {
          to: socketId,
          candidate: event.candidate
        });
      }
    };

    // 연결 상태 모니터링
    peer.onconnectionstatechange = () => {
      console.log(`Peer connection state (${socketId}):`, peer.connectionState);

      if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
        // 재연결 시도 또는 정리
        cleanupPeer(socketId);
      }
    };

    peersRef.current.set(socketId, peer);

    // Initiator이면 offer 생성
    if (isInitiator) {
      createOffer(socketId, peer);
    }

    return peer;
  }, [socket, cleanupPeer, createOffer]);

  // 방 입장
  const joinRoom = useCallback(async (videoEnabled = true, audioEnabled = true) => {
    console.log('[useVideoCall] joinRoom called', {
      socket: !!socket,
      isConnected,
      actuallyConnected: socket?.connected
    });

    if (!socket) {
      const errorMsg = '소켓이 초기화되지 않았습니다. 페이지를 새로고침해주세요.';
      console.error('[useVideoCall]', errorMsg);
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    // React 상태 대신 실제 소켓 연결 상태 확인
    if (!socket.connected) {
      const errorMsg = '시그널링 서버에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.';
      console.error('[useVideoCall]', errorMsg, '(socket.connected:', socket.connected, ')');
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      console.log('[useVideoCall] ✅ Socket connected, initializing local stream...');
      // 로컬 스트림 초기화
      await initLocalStream(videoEnabled, audioEnabled);

      console.log('[useVideoCall] Emitting video:join-room', { studyId, roomId });
      // 방 입장 요청
      socket.emit('video:join-room', { studyId, roomId });
    } catch (err) {
      console.error('[useVideoCall] Failed to join room:', err);
      setError(err.message || '방 입장에 실패했습니다.');
      throw err;
    }
  }, [socket, studyId, roomId, initLocalStream]);

  // 방 나가기
  const leaveRoom = useCallback(() => {
    // 로컬 스트림 정리
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // 화면 공유 스트림 정리
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
      setIsSharingScreen(false);
    }

    // 모든 Peer Connection 정리
    const currentPeers = Array.from(peersRef.current.keys());
    currentPeers.forEach((socketId) => {
      cleanupPeer(socketId);
    });

    // 방 나가기 알림
    if (socket) {
      socket.emit('video:leave-room', { roomId });
    }

    setRemoteStreams(new Map());
    setParticipants([]);
  }, [socket, roomId, cleanupPeer]);

  // 음소거 토글
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newMutedState = !audioTrack.enabled;
        setIsMuted(newMutedState);

        if (socket) {
          socket.emit('video:toggle-audio', { roomId, isMuted: newMutedState });
        }

        return newMutedState;
      }
    }
    return isMuted;
  }, [socket, roomId, isMuted]);

  // 비디오 토글
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const newVideoOffState = !videoTrack.enabled;
        setIsVideoOff(newVideoOffState);

        if (socket) {
          socket.emit('video:toggle-video', { roomId, isVideoOff: newVideoOffState });
        }

        return newVideoOffState;
      }
    }
    return isVideoOff;
  }, [socket, roomId, isVideoOff]);

  // 화면 공유 중지
  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
      setIsSharingScreen(false);

      // 원래 비디오 트랙으로 복구
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          peersRef.current.forEach(peer => {
            const sender = peer.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
              sender.replaceTrack(videoTrack);
            }
          });
        }
      }

      // 화면 공유 종료 알림
      if (socket) {
        socket.emit('video:screen-share-stop', { roomId });
      }
    }
  }, [socket, roomId]);

  // 화면 공유
  const shareScreen = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        },
        audio: false
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      screenStreamRef.current = screenStream;
      setIsSharingScreen(true);

      // 모든 Peer의 비디오 트랙을 화면 공유로 교체
      peersRef.current.forEach(peer => {
        const sender = peer.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      // 화면 공유 알림
      if (socket) {
        socket.emit('video:screen-share-start', { roomId });
      }

      // 화면 공유 종료 시 원래 비디오로 복구
      screenTrack.onended = () => {
        stopScreenShare();
      };

      return screenStream;
    } catch (err) {
      console.error('Failed to share screen:', err);
      setError('화면 공유에 실패했습니다.');
      throw err;
    }
  }, [socket, roomId, stopScreenShare]);

  // Socket 이벤트 리스너
  useEffect(() => {
    if (!socket) return;

    // 기존 참여자 목록 수신
    socket.on('video:room-state', ({ participants: existingParticipants }) => {
      setParticipants(existingParticipants);

      // 기존 참여자들과 Peer Connection 생성 (내가 initiator)
      existingParticipants.forEach(participant => {
        createPeerConnection(participant.socketId, true);
      });
    });

    // 새 참여자 입장
    socket.on('video:user-joined', ({ socketId, userId, user }) => {
      setParticipants(prev => [...prev, { socketId, userId, user }]);
      // Peer Connection 생성 (상대방이 initiator, 나는 answer 보낼 준비)
      createPeerConnection(socketId, false);
    });

    // Offer 수신
    socket.on('video:offer', async ({ from, offer }) => {
      let peer = peersRef.current.get(from);
      if (!peer) {
        peer = createPeerConnection(from, false);
      }

      try {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit('video:answer', {
          to: from,
          answer
        });
      } catch (err) {
        console.error('Failed to handle offer:', err);
      }
    });

    // Answer 수신
    socket.on('video:answer', async ({ from, answer }) => {
      const peer = peersRef.current.get(from);
      if (peer) {
        try {
          await peer.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Failed to handle answer:', err);
        }
      }
    });

    // ICE Candidate 수신
    socket.on('video:ice-candidate', async ({ from, candidate }) => {
      const peer = peersRef.current.get(from);
      if (peer) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Failed to add ICE candidate:', err);
        }
      }
    });

    // 참여자 퇴장
    socket.on('video:user-left', ({ socketId }) => {
      cleanupPeer(socketId);
      setParticipants(prev => prev.filter(p => p.socketId !== socketId));
    });

    // 에러 처리
    socket.on('error', (data) => {
      setError(data.message);
    });

    return () => {
      socket.off('video:room-state');
      socket.off('video:user-joined');
      socket.off('video:offer');
      socket.off('video:answer');
      socket.off('video:ice-candidate');
      socket.off('video:user-left');
      socket.off('error');
    };
  }, [socket, createPeerConnection, cleanupPeer]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    const peers = peersRef.current;

    return () => {
      // 로컬 스트림 정리
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      // 화면 공유 스트림 정리
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }

      // 모든 Peer Connection 정리
      peers.forEach((peer) => {
        peer.close();
      });
      peers.clear();

      // 방 나가기 알림
      if (socket) {
        socket.emit('video:leave-room', { roomId });
      }
    };
  }, [socket, roomId]);

  return {
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
  };
}

