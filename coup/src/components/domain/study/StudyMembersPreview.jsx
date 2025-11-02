import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import styles from './StudyMembersPreview.module.css';

export default function StudyMembersPreview({ members }) {
  return (
    <Card className={styles.studyMembersPreviewCard}>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>스터디 멤버</CardTitle>
      </CardHeader>
      <CardContent className={styles.cardContent}>
        {members && members.length > 0 ? (
          <div className={styles.membersGrid}>
            {members.map((member) => (
              <div key={member.id} className={styles.memberItem}>
                <Image
                  src={member.imageUrl || '/next.svg'}
                  alt={member.name}
                  width={40}
                  height={40}
                  className={styles.memberImage}
                />
                <span className={styles.memberName}>{member.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyMessage}>아직 스터디 멤버가 없습니다.</p>
        )}
        <Link href="#" className={styles.viewAllLink}>모든 멤버 보기</Link>
      </CardContent>
    </Card>
  );
}
