import { useState, useEffect, useRef, useCallback } from "react";
import VideoGrid from "./VideoGrid";
import ControlBar from "./ControlBar";
import ParticipantList from "./ParticipantList";
import styles from './VideoCallInterface.module.css';
import { useSocket } from '@/lib/hooks/useSocket';
import { useAuth } from '@/lib/hooks/useAuth';

// Define a type for participant streams
// This will store the userId and their media stream
const ParticipantStream = {
  userId: String,
  stream: MediaStream,
};

export default function VideoCallInterface({ studyId }) {
  const socket = useSocket();
  const { user } = useAuth();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([]); // Dynamic participants
  const [localStream, setLocalStream] = useState(null); // State to hold local media stream
  const localVideoRef = useRef(null); // Ref for local video stream

  // Store RTCPeerConnection objects for each participant
  const peerConnections = useRef({});
  // Store remote streams
  const remoteStreams = useRef({});

  // Function to create a new RTCPeerConnection
  const createPeerConnection = useCallback((participantId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // Google's public STUN server
        // TODO: Add TURN servers for production
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc_ice_candidate', {
          targetUserId: participantId,
          candidate: event.candidate,
          studyId,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log(`Received remote stream from ${participantId}`, event.streams[0]);
      remoteStreams.current = {
        ...remoteStreams.current,
        [participantId]: event.streams[0],
      };
      // Update participants state to trigger re-render with new stream
      setParticipants((prevParticipants) =>
        prevParticipants.map((p) =>
          p.id === participantId ? { ...p, stream: event.streams[0] } : p
        )
      );
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    return pc;
  }, [socket, localStream, studyId]);

  useEffect(() => {
    if (!socket || !user || !studyId) return;

    // Request local media access
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(error => {
        console.error('Error accessing media devices:', error);
        alert('카메라 또는 마이크 접근 권한이 필요합니다.');
      });

    // Join the video call room
    socket.emit('join_video_call', { studyId, userId: user.id });
    console.log(`User ${user.id} joined video call for study: ${studyId}`);

    // Listen for participant updates
    socket.on('participants_update', (updatedParticipants) => {
      setParticipants((prevParticipants) => {
        const newParticipants = updatedParticipants.filter(
          (p) => p.id !== user.id
        ); // Exclude self

        // Add local stream to self in participants list for VideoGrid
        const selfParticipant = updatedParticipants.find(p => p.id === user.id);
        if (selfParticipant && localStream) {
          newParticipants.unshift({ ...selfParticipant, stream: localStream });
        }

        // Handle new participants
        newParticipants.forEach((newP) => {
          if (!peerConnections.current[newP.id] && newP.id !== user.id) {
            console.log(`New participant ${newP.id} detected. Creating peer connection.`);
            const pc = createPeerConnection(newP.id);
            peerConnections.current[newP.id] = pc;

            // If I am the one joining, I should create an offer to existing participants
            // If an existing participant, I should wait for an offer from the new joiner
            // For simplicity, let's assume the "new" participant always creates the offer
            // This logic needs refinement for robust offer/answer exchange
            // For now, let's make everyone create an offer to everyone else
            pc.createOffer()
              .then((offer) => pc.setLocalDescription(offer))
              .then(() => {
                socket.emit('webrtc_offer', {
                  targetUserId: newP.id,
                  offer: pc.localDescription,
                  studyId,
                });
              })
              .catch(error => console.error('Error creating offer:', error));
          }
        });

        // Handle participants who left
        Object.keys(peerConnections.current).forEach((pId) => {
          if (!newParticipants.some((p) => p.id === pId)) {
            console.log(`Participant ${pId} left. Closing peer connection.`);
            peerConnections.current[pId].close();
            delete peerConnections.current[pId];
            delete remoteStreams.current[pId];
          }
        });

        return newParticipants;
      });
    });

    // Handle WebRTC offers
    socket.on('webrtc_offer', async ({ senderUserId, offer }) => {
      console.log(`Received offer from ${senderUserId}`);
      let pc = peerConnections.current[senderUserId];
      if (!pc) {
        pc = createPeerConnection(senderUserId);
        peerConnections.current[senderUserId] = pc;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('webrtc_answer', {
        targetUserId: senderUserId,
        answer: pc.localDescription,
        studyId,
      });
    });

    // Handle WebRTC answers
    socket.on('webrtc_answer', async ({ senderUserId, answer }) => {
      console.log(`Received answer from ${senderUserId}`);
      const pc = peerConnections.current[senderUserId];
      if (pc && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // Handle ICE candidates
    socket.on('webrtc_ice_candidate', async ({ senderUserId, candidate }) => {
      console.log(`Received ICE candidate from ${senderUserId}`);
      const pc = peerConnections.current[senderUserId];
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.emit('leave_video_call', { studyId, userId: user.id });
      socket.off('participants_update');
      socket.off('webrtc_offer');
      socket.off('webrtc_answer');
      socket.off('webrtc_ice_candidate');

      // Stop local media tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      // Close all peer connections
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
      remoteStreams.current = {};

      console.log(`User ${user.id} left video call for study: ${studyId}`);
    };
  }, [socket, user, studyId, localStream, createPeerConnection]);

  const handleToggleMic = () => {
    setIsMicOn((prev) => {
      if (localStream) {
        localStream.getAudioTracks().forEach(track => (track.enabled = !prev));
      }
      socket.emit('toggle_mic', { studyId, userId: user.id, isMicOn: !prev });
      return !prev;
    });
  };

  const handleToggleCamera = () => {
    setIsCameraOn((prev) => {
      if (localStream) {
        localStream.getVideoTracks().forEach(track => (track.enabled = !prev));
      }
      socket.emit('toggle_camera', { studyId, userId: user.id, isCameraOn: !prev });
      return !prev;
    });
  };

  const handleToggleScreenShare = () => {
    setIsScreenSharing((prev) => !prev);
    // TODO: Implement screen sharing logic
    socket.emit('toggle_screen_share', { studyId, userId: user.id, isScreenSharing: !isScreenSharing });
  };

  const handleLeaveCall = () => {
    alert("화상 스터디를 종료합니다.");
    // The cleanup in useEffect return will handle the actual leave logic
    // For now, just navigate away or trigger a parent component's state change
    // to unmount this component.
    // Example: window.location.href = `/studies/${studyId}`;
  };

  return (
    <div className={styles.videoCallInterfaceContainer}>
      <div className={styles.mainContent}>
        <div className={styles.videoGridWrapper}>
          {/* Local video stream */}
          {localStream && (
            <video ref={localVideoRef} autoPlay muted className={styles.localVideo} />
          )}
          <VideoGrid participants={participants} />
        </div>
        <div className={styles.participantListWrapper}>
          <ParticipantList participants={participants} />
        </div>
      </div>
      <div className={styles.controlBarWrapper}>
        <ControlBar
          onToggleMic={handleToggleMic}
          onToggleCamera={handleToggleCamera}
          onToggleScreenShare={handleToggleScreenShare}
          onLeaveCall={handleLeaveCall}
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          isScreenSharing={isScreenSharing}
        />
      </div>
    </div>
  );
}