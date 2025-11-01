import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import styles from './RecentActivityFeed.module.css';

function RecentActivityFeed() {
  // Mock data for now
  const activities = [
    { id: '1', type: 'chat', studyName: '알고리즘 스터디', content: '새 메시지가 도착했습니다.', time: '1분 전' },
    { id: '2', type: 'notice', studyName: '리액트 프로젝트', content: '새 공지사항 '주간 계획'이 등록되었습니다.', time: '30분 전' },
    { id: '3', type: 'file', studyName: '알고리즘 스터디', content: ''자료_1.pdf'가 업로드되었습니다.', time: '1시간 전' },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'chat': return '🗨️';
      case 'notice': return '📢';
      case 'file': return '📂';
      default: return '';
    }
  };

  return (
    <Card className={styles.activityFeedCard}>
      <CardHeader>
        <CardTitle>최근 활동</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className={styles.activityList}>
          {activities.map(activity => (
            <li key={activity.id} className={styles.activityItem}>
              <Link href={`/studies/${activity.studyName.replace(/\s/g, '')}/${activity.type}`}>
                <span className={styles.activityIcon}>{getActivityIcon(activity.type)}</span>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>{activity.studyName}: {activity.content}</p>
                  <span className={styles.activityTime}>{activity.time}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/notifications" className={styles.viewMore}>더 보기 &gt;</Link>
      </CardContent>
    </Card>
  );
}

export default RecentActivityFeed;
