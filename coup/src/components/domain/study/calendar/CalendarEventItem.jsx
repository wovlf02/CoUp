import styles from './CalendarEventItem.module.css';

export default function CalendarEventItem({ title, time, description, type }) {
  const bgColorClass = type === "event" ? styles.eventBgColor : styles.taskBgColor;
  const textColorClass = type === "event" ? styles.eventTextColor : styles.taskTextColor;

  return (
    <div className={`${styles.eventItem} ${bgColorClass} ${textColorClass}`}>
      <h4 className={styles.title}>{title}</h4>
      {time && <p className={styles.time}>{time}</p>}
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}