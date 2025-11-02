import { useState } from "react";
import VideoGrid from "./VideoGrid";
import ControlBar from "./ControlBar";
import ParticipantList from "./ParticipantList";
import styles from './VideoCallInterface.module.css';

export default function VideoCallInterface() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([
    { id: "1", name: "사용자 1", imageUrl: "/next.svg" },
    { id: "2", name: "사용자 2", imageUrl: "/next.svg" },
  ]);

  const handleToggleMic = () => setIsMicOn((prev) => !prev);
  const handleToggleCamera = () => setIsCameraOn((prev) => !prev);
  const handleToggleScreenShare = () => setIsScreenSharing((prev) => !prev);
  const handleLeaveCall = () => {
    alert("화상 스터디를 종료합니다.");
    // TODO: Implement actual leave call logic
  };

  return (
    <div className={styles.videoCallInterfaceContainer}>
      <div className={styles.mainContent}>
        <div className={styles.videoGridWrapper}>
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