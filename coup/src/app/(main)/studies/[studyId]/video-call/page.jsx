'use client';

import VideoCallInterface from "../../../components/domain/study/video-call/VideoCallInterface";
import styles from './video-call.module.css';

export default function StudyVideoCallPage({ params }) {
  const { studyId } = params;

  return (
    <div className={styles.videoCallPageContainer}>
      <h2 className={styles.pageTitle}>화상 스터디</h2>
      <VideoCallInterface studyId={studyId} /> {/* Pass studyId here */}
    </div>
  );
}