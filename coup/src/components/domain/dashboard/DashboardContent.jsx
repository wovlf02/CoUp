import MyStudiesSummary from "./MyStudiesSummary";
import RecommendedStudies from "./RecommendedStudies";
import RecentActivityFeed from "./RecentActivityFeed";
import styles from './DashboardContent.module.css';

export default function DashboardContent() {
  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.welcomeMessage}>OOO님, 환영합니다!</h1> {/* Placeholder for user's name */}
      <div className={styles.dashboardGrid}>
        <MyStudiesSummary />
        <RecommendedStudies />
        <RecentActivityFeed />
      </div>
      {/* Quick Start Buttons */}
      <div className={styles.quickStartButtons}>
        {/* TODO: Implement actual Button components */}
        <button className={styles.createStudyButton}>새 스터디 만들기</button>
        <button className={styles.exploreStudiesButton}>스터디 탐색하기</button>
      </div>
    </div>
  );
}