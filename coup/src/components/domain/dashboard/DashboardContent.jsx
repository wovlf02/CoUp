import React from 'react';
import MyStudiesSummary from './MyStudiesSummary';
import RecommendedStudies from './RecommendedStudies';
import RecentActivityFeed from './RecentActivityFeed';
import QuickStartButtons from './QuickStartButtons';
import styles from './DashboardContent.module.css';

function DashboardContent() {
  const userName = "사용자"; // Replace with actual user name from auth context

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.welcomeMessage}>{userName}님, 환영합니다!</h1>
      <div className={styles.dashboardGrid}>
        <MyStudiesSummary />
        <RecommendedStudies />
        <RecentActivityFeed />
      </div>
      <QuickStartButtons />
    </div>
  );
}

export default DashboardContent;
