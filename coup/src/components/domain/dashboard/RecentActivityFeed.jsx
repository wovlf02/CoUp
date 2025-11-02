import { Card } from "../../ui/card";
import styles from './RecentActivityFeed.module.css';

export default function RecentActivityFeed() {
  return (
    <Card className={styles.activityFeedCard}>
      <h2 className={styles.cardTitle}>최근 활동 피드</h2>
      <p>최근 활동 내역이 여기에 표시됩니다.</p>
      {/* TODO: Fetch and display recent activities */}
    </Card>
  );
}