import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import styles from './StudyRulesCard.module.css';

export default function StudyRulesCard({ rules }) {
  return (
    <Card className={styles.studyRulesCard}>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>스터디 규칙</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={styles.rulesText}>{rules || '아직 설정된 규칙이 없습니다.'}</p>
      </CardContent>
    </Card>
  );
}
