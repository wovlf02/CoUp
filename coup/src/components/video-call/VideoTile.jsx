// 비디오 타일 컴포넌트 - 개별 컨트롤 버튼 포함
'use client';

import { useRef, useEffect, useState } from 'react';
import styles from './VideoTile.module.css';

export default function VideoTile({
  stream,
  user,
  isLocal = false,
  isMuted = false,
  isVideoOff = false,
  isSpeaking = false,
  onToggleMute,
  onToggleVideo,
  onDoubleClick
}) {
  const videoRef = useRef(null);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={`${styles.videoTile} ${isSpeaking ? styles.speaking : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onDoubleClick={onDoubleClick}
    >
      {/* 비디오 또는 아바타 */}
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

      {/* 상단 오버레이: 이름 */}
      <div className={styles.topOverlay}>
        <div className={styles.name}>
          {user?.name || 'Unknown'}
          {isLocal && ' (나)'}
        </div>
      </div>

      {/* 하단 오버레이: 컨트롤 버튼 */}
      {isLocal && (
        <div className={`${styles.controls} ${showControls ? styles.controlsVisible : ''}`}>
          <button
            className={`${styles.controlButton} ${isMuted ? styles.controlButtonActive : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute?.();
            }}
            title={isMuted ? '마이크 켜기' : '마이크 끄기'}
          >
            {isMuted ? '🔇' : '🎤'}
          </button>

          <button
            className={`${styles.controlButton} ${isVideoOff ? styles.controlButtonActive : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleVideo?.();
            }}
            title={isVideoOff ? '비디오 켜기' : '비디오 끄기'}
          >
            {isVideoOff ? '📹❌' : '📹'}
          </button>
        </div>
      )}

      {/* 상태 표시 배지 */}
      <div className={styles.statusBadges}>
        {isMuted && <span className={styles.statusBadge}>🔇</span>}
        {isVideoOff && <span className={styles.statusBadge}>📹❌</span>}
      </div>
    </div>
  );
}

