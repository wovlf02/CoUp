import { Button } from "../../../ui/button";
import styles from './CalendarControls.module.css';

export default function CalendarControls({ currentMonth, onPrev, onNext, onViewChange }) {
  return (
    <div className={styles.calendarControlsContainer}>
      <Button onClick={onPrev}>이전</Button>
      <h2 className={styles.currentMonth}>{currentMonth}</h2>
      <Button onClick={onNext}>다음</Button>
      <div className={styles.viewChangeButtons}>
        <Button onClick={() => onViewChange("month")} variant="outline" className={styles.viewChangeButton}>월</Button>
        <Button onClick={() => onViewChange("week")} variant="outline" className={styles.viewChangeButton}>주</Button>
        <Button onClick={() => onViewChange("day")} variant="outline">일</Button>
      </div>
    </div>
  );
}