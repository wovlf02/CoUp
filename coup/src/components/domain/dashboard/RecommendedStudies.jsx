import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import styles from './RecommendedStudies.module.css';

function RecommendedStudies() {
  // Mock data for now
  const recommendedStudies = [
    { id: '3', name: 'Next.js 스터디', category: '프로그래밍', members: '5/10명', imageUrl: '/next.svg' },
    { id: '4', name: '영어 회화 스터디', category: '어학', members: '8/10명', imageUrl: '/globe.svg' },
  ];

  return (
    <Card className={styles.recommendedStudiesCard}>
      <CardHeader>
        <CardTitle>추천 스터디</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.studyGrid}>
          {recommendedStudies.map(study => (
            <Link href={`/studies/${study.id}`} key={study.id} className={styles.studyCardLink}>
              <div className={styles.studyCard}>
                <img src={study.imageUrl} alt={study.name} className={styles.studyCardImage} />
                <h3 className={styles.studyCardTitle}>{study.name}</h3>
                <p className={styles.studyCardCategory}>{study.category}</p>
                <p className={styles.studyCardMembers}>{study.members}</p>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/studies" className={styles.viewAllStudies}>모든 스터디 탐색 &gt;</Link>
      </CardContent>
    </Card>
  );
}

export default RecommendedStudies;
