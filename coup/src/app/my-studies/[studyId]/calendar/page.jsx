// 내 스터디 캘린더 페이지
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { useStudy, useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/lib/hooks/useApi';

export default function MyStudyCalendarPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // 실제 API Hooks
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
  const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const { data: eventsData, isLoading: eventsLoading } = useEvents(studyId, { month });
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  const study = studyData?.data;
  const events = eventsData?.events || [];

  const tabs = [
    { label: '개요', href: `/my-studies/${studyId}`, icon: '📊' },
    { label: '채팅', href: `/my-studies/${studyId}/chat`, icon: '💬' },
    { label: '공지', href: `/my-studies/${studyId}/notices`, icon: '📢' },
    { label: '파일', href: `/my-studies/${studyId}/files`, icon: '📁' },
    { label: '캘린더', href: `/my-studies/${studyId}/calendar`, icon: '📅' },
    { label: '할일', href: `/my-studies/${studyId}/tasks`, icon: '✅' },
    { label: '화상', href: `/my-studies/${studyId}/video-call`, icon: '📹' },
    { label: '설정', href: `/my-studies/${studyId}/settings`, icon: '⚙️' },
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const formatMonth = (date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      return eventDateStr === dateStr;
    });
  };

  const todayEvents = events.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  });

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('일정을 삭제하시겠습니까?')) return;

    try {
      await deleteEventMutation.mutateAsync({ studyId, eventId });
    } catch (error) {
      alert('일정 삭제 실패: ' + error.message);
    }
  };

  if (studyLoading) {
    return <div className={styles.container}>로딩 중...</div>;
  }

  if (!study) {
    return <div className={styles.container}>스터디를 찾을 수 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button onClick={() => router.push('/my-studies')} className={styles.backButton}>
          ← 내 스터디 목록
        </button>

        <div className={styles.studyHeader}>
          <div className={styles.studyInfo}>
            <span className={styles.emoji}>{study.emoji}</span>
            <div>
              <h1 className={styles.studyName}>{study.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`${styles.tab} ${tab.label === '캘린더' ? styles.active : ''}`}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </Link>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 캘린더 섹션 */}
        <div className={styles.calendarSection}>
          {/* 헤더 */}
          <div className={styles.calendarHeader}>
            <h2 className={styles.calendarTitle}>📅 캘린더</h2>
            <button className={styles.addButton}>+ 일정 추가</button>
          </div>

          {/* 뷰 모드 & 네비게이션 */}
          <div className={styles.controlSection}>
            <div className={styles.viewModes}>
              <button
                className={`${styles.viewMode} ${viewMode === 'month' ? styles.active : ''}`}
                onClick={() => setViewMode('month')}
              >
                월
              </button>
              <button
                className={`${styles.viewMode} ${viewMode === 'week' ? styles.active : ''}`}
                onClick={() => setViewMode('week')}
              >
                주
              </button>
              <button
                className={`${styles.viewMode} ${viewMode === 'day' ? styles.active : ''}`}
                onClick={() => setViewMode('day')}
              >
                일
              </button>
            </div>

            <div className={styles.monthNavigation}>
              <button className={styles.navButton} onClick={goToPreviousMonth}>
                ◀
              </button>
              <span className={styles.currentMonth}>{formatMonth(currentDate)}</span>
              <button className={styles.navButton} onClick={goToNextMonth}>
                ▶
              </button>
            </div>

            <button className={styles.filterButton}>필터 ▼</button>
          </div>

          {/* 월 뷰 캘린더 */}
          <div className={styles.monthView}>
            <div className={styles.weekdayHeader}>
              {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                <div key={day} className={styles.weekday}>
                  {day}
                </div>
              ))}
            </div>

            {eventsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>일정 로딩 중...</div>
            ) : (
              <div className={styles.daysGrid}>
                {getDaysInMonth(currentDate).map((day, index) => {
                  const dayEvents = day ? getEventsForDay(day) : [];
                  return (
                    <div
                      key={index}
                      className={`${styles.dayCell} ${!day ? styles.emptyDay : ''} ${
                        isToday(day) ? styles.today : ''
                      }`}
                    >
                      {day && (
                        <>
                          <div className={styles.dayNumber}>{day}</div>
                          <div className={styles.dayEvents}>
                            {dayEvents.slice(0, 3).map((event) => (
                              <div
                                key={event.id}
                                className={styles.eventDot}
                                style={{ backgroundColor: event.color || '#6366F1' }}
                                title={event.title}
                              >
                                📌
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className={styles.eventMore}>+{dayEvents.length - 3}</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 오늘 일정 */}
          {todayEvents.length > 0 && (
            <div className={styles.selectedDayEvents}>
              <h3 className={styles.selectedDayTitle}>
                오늘 일정 ({new Date().toLocaleDateString('ko-KR')})
              </h3>
              {todayEvents.map((event) => (
                <div key={event.id} className={styles.eventCard}>
                  <div className={styles.eventCardHeader}>
                    <div className={styles.eventTime}>
                      {event.startTime}-{event.endTime}
                    </div>
                    <h4 className={styles.eventTitle}>{event.title}</h4>
                  </div>
                  {event.location && (
                    <div className={styles.eventLocation}>📍 {event.location}</div>
                  )}
                  <button
                    className={styles.eventDeleteBtn}
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 우측 위젯 */}
        <aside className={styles.sidebar}>
          {/* 오늘 일정 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📆 오늘 일정</h3>
            <div className={styles.widgetContent}>
              <div className={styles.todayDate}>
                {new Date().toLocaleDateString('ko-KR')}
              </div>
              {todayEvents.length === 0 ? (
                <p className={styles.widgetText}>오늘은 일정이 없습니다.</p>
              ) : (
                todayEvents.map((event) => (
                  <div key={event.id} className={styles.todayEvent}>
                    <div className={styles.todayEventTime}>
                      {event.startTime}-{event.endTime}
                    </div>
                    <div className={styles.todayEventTitle}>{event.title}</div>
                    {event.location && (
                      <div className={styles.todayEventLocation}>📍 {event.location}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 이번 달 통계 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 이번 달 통계</h3>
            <div className={styles.widgetContent}>
              <div className={styles.statRow}>
                <span>총 일정:</span>
                <span className={styles.statValue}>{events.length}개</span>
              </div>
            </div>
          </div>

          {/* 내보내기 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📥 내보내기</h3>
            <div className={styles.widgetActions}>
              <button className={styles.widgetButton}>iCal</button>
              <button className={styles.widgetButton}>CSV</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
