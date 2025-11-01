import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import styles from './StudyCard.module.css';

function StudyCard({ study }) {
  return (
    <Link href={`/studies/${study.id}`} className={styles.studyCardLink}>
      <Card className={styles.studyCard}>
        <Image src={study.imageUrl} alt={study.name} width={100} height={100} className={styles.studyImage} />
        <CardContent className={styles.cardContent}>
          <h3 className={styles.studyName}>{study.name}</h3>
          <p className={styles.studyDescription}>{study.description}</p>
          <div className={styles.studyMeta}>
            <span className={styles.studyCategory}>{study.category}</span>
            <span className={styles.studyMembers}>{study.members}</span>
            <span className={styles.studyOwner}>그룹장: {study.owner}</span>
            <span className={styles.studyDate}>{study.createdAt}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default StudyCard;
