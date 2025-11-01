import React, { useState, useEffect } from 'react';
import styles from './calendar.module.css';

const Calendar = ({ selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days = [];

    // Add leading empty days
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1));
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button onClick={goToPreviousMonth}>&lt;</button>
        <h2>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={goToNextMonth}>&gt;</button>
      </div>
      <div className={styles.weekdays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={styles.weekday}>{day}</div>
        ))}
      </div>
      <div className={styles.daysGrid}>
        {days.map((day, index) => (
          <div
            key={index}
            className={`${styles.day} ${day && isSameDay(day, new Date()) ? styles.currentDay : ''} ${day && isSameDay(day, selectedDate) ? styles.selectedDay : ''} ${!day ? styles.empty : ''}`}
            onClick={() => day && onSelectDate(day)}
          >
            {day ? day.getDate() : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
