import { useState } from "react";
import CalendarControls from "./CalendarControls";
import styles from './StudyCalendarView.module.css';

export default function StudyCalendarView({ events }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // month, week, day

  const getMonthName = (date) => {
    return date.toLocaleString("ko-KR", { year: "numeric", month: "long" });
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);

    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: numDays }, (_, i) => i + 1);

    return (
      <div className={styles.monthViewGrid}>
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div key={day} className={styles.dayOfWeek}>
            {day}
          </div>
        ))}
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className={styles.emptyDayCell}></div>
        ))}
        {days.map((day) => (
          <div key={day} className={styles.dayCell}>
            {day}
            {/* TODO: Display events for this day */}
          </div>
        ))}
      </div>
    );
  };

  const handlePrev = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className={styles.studyCalendarViewContainer}>
      <CalendarControls
        currentMonth={getMonthName(currentDate)}
        onPrev={handlePrev}
        onNext={handleNext}
        onViewChange={setView}
      />
      {view === "month" && renderMonthView()}
      {/* TODO: Implement week and day views */}
    </div>
  );
}