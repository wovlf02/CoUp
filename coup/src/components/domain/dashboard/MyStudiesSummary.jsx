import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import styles from './MyStudiesSummary.module.css';

function MyStudiesSummary() {
  // Mock data for now
  const myStudies = [
    { id: '1', name: '알고리즘 스터디', progress: 'D-10', imageUrl: '/next.svg' },
    { id: '2', name: '리액트 프로젝트', progress: '금일 14:00 미팅', imageUrl: '/next.svg' },
  ];

  return (
    <Card className={styles.myStudiesCard}>
      <CardHeader>
        <CardTitle>내 스터디 요약</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className={styles.studyList}>
          {myStudies.map(study => (
            <li key={study.id} className={styles.studyItem}>
              <Link href={`/studies/${study.id}`}>
                <div className={styles.studyInfo}>
                  <img src={study.imageUrl} alt={study.name} className={styles.studyImage} />
                  <span>{study.name} / {study.progress}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/me/studies" className={styles.viewMore}>더 보기 &gt;</Link>
      </CardContent>
    </Card>
  );
}

export default MyStudiesSummary;
