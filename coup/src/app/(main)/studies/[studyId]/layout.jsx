import React from 'react';
import StudyHeader from '@/components/domain/study/StudyHeader/StudyHeader';
import StudyTabNavigation from '@/components/domain/study/StudyTabNavigation';
import styles from './studyDetailLayout.module.css';

export default function StudyDetailLayout({ children, params }) {
  const { studyId } = params;

  return (
    <div className={styles.studyDetailLayout}>
      <StudyHeader studyId={studyId} />
      <StudyTabNavigation studyId={studyId} />
      <div className={styles.studyContent}>
        {children}
      </div>
    </div>
  );
}
