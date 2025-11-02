import { Card } from "../../ui/card";
import styles from './RecommendedStudies.module.css';

export default function RecommendedStudies() {
  return (
    <Card className={styles.recommendedStudiesCard}>
      <h2 className={styles.cardTitle}>추천 스터디</h2>
      <p>추천 스터디 목록이 여기에 표시됩니다.</p>
      {/* TODO: Fetch and display recommended studies */}
    </Card>
  );
}