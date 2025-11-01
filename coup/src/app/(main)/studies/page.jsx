import React from 'react';
import StudyDiscoveryFilters from '@/components/domain/study/StudyDiscoveryFilters/StudyDiscoveryFilters';
import StudyList from '@/components/domain/study/StudyList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import styles from './studies.module.css';

export default function StudiesPage() {
  return (
    <div className={styles.studiesPageContainer}>
      <h1 className={styles.pageTitle}>스터디 탐색</h1>
      <div className={styles.contentWrapper}>
        <div className={styles.filtersColumn}>
          <StudyDiscoveryFilters />
          <Link href="/studies/create" passHref>
            <Button className={styles.createStudyButton}>새 스터디 만들기</Button>
          </Link>
        </div>
        <div className={styles.listColumn}>
          <StudyList />
        </div>
      </div>
    </div>
  );
}
