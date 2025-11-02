import { Card } from "../../ui/card";
import styles from './MyStudiesSummary.module.css';

export default function MyStudiesSummary() {
  return (
    <Card className={styles.myStudiesCard}>
      <h2 className={styles.cardTitle}>내 스터디 요약</h2>
      <p>참여 중인 스터디 목록이 여기에 표시됩니다.</p>
      {/* TODO: Fetch and display user's studies */}
    </Card>
  );
}