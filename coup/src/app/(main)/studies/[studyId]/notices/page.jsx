import React from 'react';
import NoticeList from '@/components/domain/notice/NoticeList';
import { Button } from '@/components/ui/button';
import styles from './notices.module.css';

export default function StudyNoticesPage({ params }) {
  const { studyId } = params;
  // In a real application, you would check user role to conditionally render the button
  const canCreateNotice = true; // Placeholder

  return (
    <div className={styles.noticesPageContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>공지사항</h1>
        {canCreateNotice && (
          <Button variant="primary" size="small" className={styles.createNoticeButton}>
            새 공지 작성
          </Button>
        )}
      </div>
      <NoticeList studyId={studyId} />
    </div>
  );
}
