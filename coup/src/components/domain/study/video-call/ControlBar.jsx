import { Button } from "../../../ui/button";
import styles from './ControlBar.module.css';

export default function ControlBar({
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onLeaveCall,
  isMicOn,
  isCameraOn,
  isScreenSharing,
}) {
  return (
    <div className={styles.controlBarContainer}>
      <Button onClick={onToggleMic} variant={isMicOn ? "default" : "destructive"}>
        {isMicOn ? "마이크 끄기" : "마이크 켜기"}
      </Button>
      <Button onClick={onToggleCamera} variant={isCameraOn ? "default" : "destructive"}>
        {isCameraOn ? "카메라 끄기" : "카메라 켜기"}
      </Button>
      <Button onClick={onToggleScreenShare} variant={isScreenSharing ? "default" : "secondary"}>
        {isScreenSharing ? "화면 공유 중지" : "화면 공유"}
      </Button>
      <Button onClick={onLeaveCall} variant="destructive">
        나가기
      </Button>
    </div>
  );
}