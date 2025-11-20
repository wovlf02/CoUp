// 할 일 달력 뷰 컴포넌트
'use client';

import { useState, useMemo } from 'react';
import styles from './TaskCalendarView.module.css';

export default function TaskCalendarView({ tasks, onToggle }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 현재 월의 날짜들 계산
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 이번 달 첫날과 마지막날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 달력 시작일 (이전 달 마지막 주 일요일부터)
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - startDay.getDay());
    
    // 달력 종료일 (다음 달 첫 주 토요일까지)
    const endDay = new Date(lastDay);
    endDay.setDate(endDay.getDate() + (6 - endDay.getDay()));
    
    // 날짜 배열 생성
    const days = [];
    const current = new Date(startDay);
    
    while (current <= endDay) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // 날짜별 할 일 그룹화
  const tasksByDate = useMemo(() => {
    const grouped = {};
    
    tasks.forEach(task => {
      const dateKey = new Date(task.dueDate).toLocaleDateString('ko-KR');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });
    
    return grouped;
  }, [tasks]);

  // 이전/다음 달로 이동
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getDayTasks = (date) => {
    const dateKey = date.toLocaleDateString('ko-KR');
    return tasksByDate[dateKey] || [];
  };

  return (
    <div className={styles.calendarContainer}>
      {/* 달력 헤더 */}
      <div className={styles.calendarHeader}>
        <button onClick={goToPrevMonth} className={styles.navButton}>
          ←
        </button>
        <div className={styles.currentMonth}>
          <h2>{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</h2>
          <button onClick={goToToday} className={styles.todayButton}>
            오늘
          </button>
        </div>
        <button onClick={goToNextMonth} className={styles.navButton}>
          →
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className={styles.weekdays}>
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className={styles.calendarGrid}>
        {calendarDays.map((date, index) => {
          const dayTasks = getDayTasks(date);
          const isCurrentDay = isToday(date);
          const isOtherMonth = !isCurrentMonth(date);

          return (
            <div
              key={index}
              className={`${styles.calendarDay} ${
                isCurrentDay ? styles.today : ''
              } ${isOtherMonth ? styles.otherMonth : ''}`}
            >
              <div className={styles.dayNumber}>
                {date.getDate()}
                {dayTasks.length > 0 && (
                  <span className={styles.taskCount}>{dayTasks.length}</span>
                )}
              </div>
              
              <div className={styles.dayTasks}>
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className={`${styles.taskItem} ${
                      task.completed ? styles.completed : ''
                    }`}
                    onClick={() => onToggle(task.id)}
                  >
                    <span className={styles.taskTitle}>
                      {task.completed && '✓ '}
                      {task.title}
                    </span>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className={styles.moreTask}>
                    +{dayTasks.length - 3}개 더보기
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
