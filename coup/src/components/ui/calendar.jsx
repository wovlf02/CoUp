'use client';

import React, { useState, useMemo } from 'react';
import styles from './calendar.module.css';

const Calendar = ({ date = new Date(), onDateSelect, className, ...props }) => {
  const [currentDate, setCurrentDate] = useState(date);

  const { year, month, daysInMonth, firstDayOfMonth, weeks } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday, etc.

    const weeks = [];
    let currentWeek = [];

    // Fill leading empty days
    for (let i = 0; i < firstDayOfMonth; i++) {
      currentWeek.push(null);
    }

    // Fill days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Fill trailing empty days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return { year, month, daysInMonth, firstDayOfMonth, weeks };
  }, [currentDate]);

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className={`${styles.calendar} ${className || ''}`} {...props}>
      <div className={styles.header}>
        <button onClick={handlePrevMonth} className={styles.navButton}>&lt;</button>
        <h2 className={styles.monthYear}>{monthName} {year}</h2>
        <button onClick={handleNextMonth} className={styles.navButton}>&gt;</button>
      </div>
      <div className={styles.weekdays}>
        {'Sun Mon Tue Wed Thu Fri Sat'.split(' ').map(day => (
          <div key={day} className={styles.weekday}>{day}</div>
        ))}
      </div>
      <div className={styles.daysGrid}>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className={styles.weekRow}>
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`${styles.day} ${day ? '' : styles.empty}`}
                onClick={() => day && onDateSelect && onDateSelect(new Date(year, month, day))}
              >
                {day}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export { Calendar };