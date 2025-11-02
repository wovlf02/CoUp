import React from 'react';
import StudyHeader from '@/components/domain/study/StudyHeader';
import StudyTabNavigation from '@/components/domain/study/StudyTabNavigation';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

export default function StudyDetailLayout({ children, params }) {
  const { studyId } = params;
  const pathname = usePathname();

  // Determine active tab based on pathname
  const activeTab = pathname.split('/').pop();

  // Placeholder data for study details
  const studyDetails = {
    studyName: "CoUp 스터디",
    studyDescription: "함께 성장하는 스터디 그룹",
    studyLogoUrl: "/next.svg",
  };

  return (
    <div className={styles.studyDetailLayoutContainer}>
      <StudyHeader
        studyName={studyDetails.studyName}
        studyDescription={studyDetails.studyDescription}
        studyLogoUrl={studyDetails.studyLogoUrl}
      />
      <StudyTabNavigation studyId={studyId} activeTab={activeTab} />
      <div className={styles.contentArea}>
        {children}
      </div>
    </div>
  );
}
