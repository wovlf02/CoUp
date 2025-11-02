import CalendarEventItem from "./CalendarEventItem";
import styles from './EventListForDate.module.css';

export default function EventListForDate({ date, events }) {
  return (
    <div className={styles.eventListContainer}>
      <h3 className={styles.dateTitle}>{date}</h3>
      {events.length > 0 ? (
        events.map((event, index) => (
          <CalendarEventItem key={index} {...event} />
        ))
      ) : (
        <p className={styles.emptyMessage}>
          등록된 일정 및 할 일이 없습니다.
        </p>
      )}
    </div>
  );
}