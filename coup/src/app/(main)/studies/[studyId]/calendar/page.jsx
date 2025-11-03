import StudyCalendarView from "../../../components/domain/study/calendar/StudyCalendarView";
import EventListForDate from "../../../components/domain/study/calendar/EventListForDate";
import { Button } from "../../../components/ui/button";
import styles from './calendar.module.css';

export default function StudyCalendarPage({ params }) {
  const { studyId } = params;

  // Placeholder data for events (will be fetched by StudyCalendarView)
  const events = [
    {
      title: "스터디 미팅",
      time: "19:00 - 20:00",
      description: "주간 진행 상황 공유",
      type: "event",
    },
    {
      title: "발표 자료 준비",
      description: "담당: 닉네임 A",
      type: "task",
    },
  ];

  return (
    <div className={styles.calendarPageContainer}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>캘린더</h2>
        <div className={styles.buttonGroup}>
          <Button variant="primary">새 일정 추가</Button>
          <Button variant="secondary">새 할 일 추가</Button>
        </div>
      </div>
      <div className={`${styles.contentGrid} ${styles.lgGridCols3}`}>
        <div className={styles.calendarViewWrapper}>
          <StudyCalendarView studyId={studyId} /> {/* Pass studyId here */}
        </div>
        <div className={styles.eventListWrapper}>
          <EventListForDate date="2025년 10월 28일 (화)" events={events} />
        </div>
      </div>
    </div>
  );
}