'use client'

import { useState } from 'react'
import styles from '@/styles/studies/calendar.module.css'

export default function StudyCalendarPage({ params }) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)) // 2025년 11월
  const [view, setView] = useState('month') // month, week, day
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdmin] = useState(false) // TODO: 실제 권한 체크

  // 샘플 일정 데이터
  const [events, setEvents] = useState([
    {
      id: 1,
      title: '주간 회의',
      type: 'meeting',
      startDate: new Date(2025, 10, 5, 14, 0),
      endDate: new Date(2025, 10, 5, 15, 0),
      description: '온라인 Zoom'
    },
    {
      id: 2,
      title: '과제 제출',
      type: 'deadline',
      startDate: new Date(2025, 10, 8, 23, 59),
      endDate: new Date(2025, 10, 8, 23, 59),
      description: '백준 문제 3개'
    },
    {
      id: 3,
      title: '스터디 시간',
      type: 'study',
      startDate: new Date(2025, 10, 12, 18, 0),
      endDate: new Date(2025, 10, 12, 19, 0),
      description: '알고리즘 문제 풀이'
    }
  ])

  const eventTypeColors = {
    meeting: { bg: '#3B82F6', text: 'white', label: '모임' },
    deadline: { bg: '#EF4444', text: 'white', label: '마감' },
    study: { bg: '#10B981', text: 'white', label: '공부' },
    etc: { bg: '#8B5CF6', text: 'white', label: '기타' }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // 이전 달의 날짜들
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const getEventsForDate = (date) => {
    if (!date) return []
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear()
    })
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const formatDate = (date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className={styles.calendarContainer}>
      {/* 헤더 */}
      <div className={styles.calendarHeader}>
        <h2>캘린더</h2>
        <div className={styles.headerActions}>
          <button className={styles.todayButton} onClick={goToToday}>
            오늘
          </button>
          <div className={styles.viewButtons}>
            <button
              className={`${styles.viewButton} ${view === 'month' ? styles.active : ''}`}
              onClick={() => setView('month')}
            >
              월
            </button>
            <button
              className={`${styles.viewButton} ${view === 'week' ? styles.active : ''}`}
              onClick={() => setView('week')}
            >
              주
            </button>
            <button
              className={`${styles.viewButton} ${view === 'day' ? styles.active : ''}`}
              onClick={() => setView('day')}
            >
              일
            </button>
          </div>
          {isAdmin && (
            <button
              className={styles.addEventButton}
              onClick={() => setIsModalOpen(true)}
            >
              + 일정
            </button>
          )}
        </div>
      </div>

      {/* 캘린더 */}
      <div className={styles.calendar}>
        {/* 캘린더 네비게이션 */}
        <div className={styles.calendarNav}>
          <button onClick={previousMonth}>←</button>
          <span>{formatDate(currentDate)}</span>
          <button onClick={nextMonth}>→</button>
        </div>

        {/* 요일 헤더 */}
        <div className={styles.weekDaysHeader}>
          {weekDays.map((day, index) => (
            <div key={index} className={styles.weekDay}>
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className={styles.daysGrid}>
          {days.map((date, index) => {
            const dateEvents = getEventsForDate(date)
            return (
              <div
                key={index}
                className={`${styles.dayCell} ${!date ? styles.empty : ''} ${isToday(date) ? styles.today : ''}`}
              >
                {date && (
                  <>
                    <div className={styles.dayNumber}>{date.getDate()}</div>
                    {dateEvents.length > 0 && (
                      <div className={styles.eventDot}>•</div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* 일정 목록 */}
        <div className={styles.eventsList}>
          <h3>이번 달 일정</h3>
          {events
            .filter(event => {
              const eventDate = new Date(event.startDate)
              return eventDate.getMonth() === currentDate.getMonth() &&
                     eventDate.getFullYear() === currentDate.getFullYear()
            })
            .sort((a, b) => a.startDate - b.startDate)
            .map(event => (
              <div
                key={event.id}
                className={styles.eventItem}
                style={{
                  borderLeftColor: eventTypeColors[event.type].bg
                }}
              >
                <div className={styles.eventDate}>
                  {event.startDate.getDate()}일 ({weekDays[event.startDate.getDay()]})
                </div>
                <div className={styles.eventInfo}>
                  <div className={styles.eventTitle}>
                    <span
                      className={styles.eventType}
                      style={{
                        backgroundColor: eventTypeColors[event.type].bg,
                        color: eventTypeColors[event.type].text
                      }}
                    >
                      {eventTypeColors[event.type].label}
                    </span>
                    {event.title}
                  </div>
                  <div className={styles.eventTime}>
                    {formatTime(event.startDate)}
                    {event.startDate.getTime() !== event.endDate.getTime() &&
                      ` - ${formatTime(event.endDate)}`}
                  </div>
                  {event.description && (
                    <div className={styles.eventDescription}>
                      {event.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 일정 추가 모달 (간단한 버전) */}
      {isModalOpen && (
        <EventModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={(eventData) => {
            const newEvent = {
              id: Date.now(),
              ...eventData
            }
            setEvents(prev => [...prev, newEvent])
            setIsModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

function EventModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('meeting')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)

    onSubmit({
      title,
      type,
      startDate: start,
      endDate: end,
      description
    })
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>새 일정 추가</h3>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>일정 유형 *</label>
            <div className={styles.radioGroup}>
              <label>
                <input type="radio" value="meeting" checked={type === 'meeting'} onChange={(e) => setType(e.target.value)} />
                모임
              </label>
              <label>
                <input type="radio" value="deadline" checked={type === 'deadline'} onChange={(e) => setType(e.target.value)} />
                마감
              </label>
              <label>
                <input type="radio" value="study" checked={type === 'study'} onChange={(e) => setType(e.target.value)} />
                공부
              </label>
              <label>
                <input type="radio" value="etc" checked={type === 'etc'} onChange={(e) => setType(e.target.value)} />
                기타
              </label>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>시작 일시 *</label>
              <div className={styles.dateTimeGroup}>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>종료 일시 *</label>
              <div className={styles.dateTimeGroup}>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>설명 (선택)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={styles.submitButton}>
              추가하기
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

