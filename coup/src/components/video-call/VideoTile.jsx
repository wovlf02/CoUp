// 비디오 타일 컴포넌트
'use client';

import { useRef, useEffect } from 'react';
import styles from './VideoTile.module.css';

export default function VideoTile({
  stream,
  user,
  isLocal = false,
  isMuted = false,
  isVideoOff = false,
  isSpeaking = false,
  onDoubleClick
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={`${styles.videoTile} ${isSpeaking ? styles.speaking : ''}`}
      onDoubleClick={onDoubleClick}
    >
      {isVideoOff || !stream ? (
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={styles.video}
        />
      )}

      <div className={styles.overlay}>
        <div className={styles.name}>
          {user?.name || 'Unknown'}
          {isLocal && ' (나)'}
        </div>

        <div className={styles.indicators}>
          {isMuted && <span className={styles.mutedIcon}>🔇</span>}
          {isVideoOff && <span className={styles.videoOffIcon}>📹❌</span>}
        </div>
      </div>
    </div>
  );
}

