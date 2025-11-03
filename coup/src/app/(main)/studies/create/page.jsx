'use client';

import React from 'react';
import StudyCreationForm from '@/components/domain/study/StudyCreationForm/StudyCreationForm';
import styles from './create.module.css';

export default function CreateStudyPage() {
  return (
    <div className={styles.createStudyContainer}>
      <h1 className={styles.pageTitle}>새 스터디 만들기</h1>
      <StudyCreationForm />
    </div>
  );
}
