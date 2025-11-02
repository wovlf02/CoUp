import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import styles from './StudyGoalCard.module.css';

export default function StudyGoalCard({ goal }) {
  return (
    <Card className={styles.studyGoalCard}>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>스터디 목표</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={styles.goalText}>{goal || '아직 설정된 목표가 없습니다.'}</p>
      </CardContent>
    </Card>
  );
}
