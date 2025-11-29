# 캘린더 예외 처리

**작성일**: 2025-11-29  
**최종 업데이트**: 2025-11-29  
**대상 파일**:
- `src/app/my-studies/[studyId]/calendar/page.jsx`
- `src/app/api/studies/[id]/calendar/route.js`

---

## 📚 목차

1. [개요](#개요)
2. [일정 목록 예외](#일정-목록-예외)
3. [일정 생성 예외](#일정-생성-예외)
4. [일정 수정/삭제 예외](#일정-수정삭제-예외)
5. [날짜 파싱 예외](#날짜-파싱-예외)
6. [반복 일정 예외](#반복-일정-예외)
7. [알림 설정 예외](#알림-설정-예외)
8. [캘린더 렌더링 예외](#캘린더-렌더링-예외)

---

## 개요

### 기능 설명

**캘린더(Calendar)**는 스터디의 **일정을 관리**하는 기능입니다. 월/주/일 뷰를 제공하며, 반복 일정 및 알림 기능을 지원합니다.

### 주요 기능

1. **일정 CRUD**: 생성, 조회, 수정, 삭제
2. **캘린더 뷰**: 월별, 주별, 일별 보기
3. **반복 일정**: 매일, 매주, 매월 반복
4. **알림**: 일정 시작 전 알림 (15분, 1시간, 1일)
5. **필터링**: 일정 종류별 (스터디, 과제, 시험, 기타)
6. **일정 상세**: 제목, 설명, 시간, 장소, 참석자

### 권한 구조

| 작업 | MEMBER | ADMIN | OWNER |
|------|--------|-------|-------|
| 목록 조회 | ✅ | ✅ | ✅ |
| 생성 | ✅ | ✅ | ✅ |
| 수정 | 본인 생성 일정 | 모두 | 모두 |
| 삭제 | 본인 생성 일정 | 모두 | 모두 |

### 데이터 모델

```prisma
model Event {
  id          String   @id @default(cuid())
  studyId     String
  title       String
  description String?
  startDate   DateTime
  endDate     DateTime?
  allDay      Boolean  @default(false)
  location    String?
  eventType   EventType @default(STUDY)
  recurrence  RecurrenceType?
  creatorId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  study       Study    @relation(fields: [studyId], references: [id])
  creator     User     @relation(fields: [creatorId], references: [id])
  attendees   EventAttendee[]
  reminders   EventReminder[]
}

enum EventType {
  STUDY
  ASSIGNMENT
  EXAM
  OTHER
}

enum RecurrenceType {
  DAILY
  WEEKLY
  MONTHLY
}

model EventReminder {
  id        String   @id @default(cuid())
  eventId   String
  userId    String
  minutes   Int      // 일정 전 몇 분
  sent      Boolean  @default(false)
  
  event     Event    @relation(fields: [eventId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## 일정 목록 예외

### 1.1 API 호출 실패

```javascript
// ✅ 좋은 예: 월별 일정 조회
const [currentDate, setCurrentDate] = useState(new Date())

const { 
  data: eventsData, 
  isLoading, 
  error 
} = useStudyEvents(studyId, {
  year: currentDate.getFullYear(),
  month: currentDate.getMonth() + 1
})

const events = eventsData?.data || []

if (isLoading) {
  return <CalendarSkeleton />
}

if (error) {
  return (
    <div className={styles.error}>
      <h3>일정을 불러올 수 없습니다</h3>
      <p>{error.response?.data?.error || '다시 시도해주세요'}</p>
      <button onClick={() => refetch()}>다시 시도</button>
    </div>
  )
}
```

---

### 1.2 빈 일정 처리

```javascript
// ✅ 좋은 예: 월별 빈 상태
const eventsInMonth = events.filter(event => {
  const eventDate = new Date(event.startDate)
  return eventDate.getMonth() === currentDate.getMonth() &&
         eventDate.getFullYear() === currentDate.getFullYear()
})

{eventsInMonth.length === 0 ? (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>📅</div>
    <h3>이번 달 일정이 없습니다</h3>
    <p>새로운 일정을 추가해보세요</p>
    <button onClick={() => setShowModal(true)}>
      + 일정 추가
    </button>
  </div>
) : (
  <CalendarView events={eventsInMonth} />
)}
```

---

## 일정 생성 예외

### 2.1 날짜/시간 유효성 검사

```javascript
// ✅ 좋은 예: 날짜 검증
const validateEventDates = (formData) => {
  const errors = {}

  // 시작일 필수
  if (!formData.startDate) {
    errors.startDate = '시작일을 선택해주세요'
    return errors
  }

  const start = new Date(formData.startDate)
  
  // 유효한 날짜인지
  if (isNaN(start.getTime())) {
    errors.startDate = '유효하지 않은 날짜입니다'
    return errors
  }

  // 종료일이 있는 경우
  if (formData.endDate) {
    const end = new Date(formData.endDate)

    if (isNaN(end.getTime())) {
      errors.endDate = '유효하지 않은 종료일입니다'
      return errors
    }

    // 종료일이 시작일보다 이전
    if (end < start) {
      errors.endDate = '종료일은 시작일 이후여야 합니다'
      return errors
    }

    // 종료일이 너무 먼 미래 (1년 이상)
    const oneYearLater = new Date(start)
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

    if (end > oneYearLater) {
      errors.endDate = '일정 기간은 1년을 초과할 수 없습니다'
      return errors
    }
  }

  // 과거 날짜 경고 (차단은 안함)
  const now = new Date()
  if (start < now && !formData.allDay) {
    errors.startDate = '과거 시간을 선택하셨습니다. 계속하시겠습니까?'
    errors.isPastWarning = true
  }

  return errors
}
```

---

### 2.2 종일 일정 vs 시간 일정

```javascript
// ✅ 좋은 예: 종일/시간 일정 처리
const [formData, setFormData] = useState({
  title: '',
  description: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  allDay: false,
  location: '',
  eventType: 'STUDY'
})

const handleAllDayToggle = (checked) => {
  setFormData(prev => ({
    ...prev,
    allDay: checked,
    // 종일 일정이면 시간 초기화
    startTime: checked ? '' : prev.startTime,
    endTime: checked ? '' : prev.endTime
  }))
}

// API 요청 데이터 생성
const getEventData = () => {
  if (formData.allDay) {
    // 종일 일정: 00:00:00 ~ 23:59:59
    return {
      ...formData,
      startDate: `${formData.startDate}T00:00:00`,
      endDate: formData.endDate 
        ? `${formData.endDate}T23:59:59` 
        : `${formData.startDate}T23:59:59`,
      allDay: true
    }
  } else {
    // 시간 일정
    return {
      ...formData,
      startDate: `${formData.startDate}T${formData.startTime}:00`,
      endDate: formData.endDate && formData.endTime
        ? `${formData.endDate}T${formData.endTime}:00`
        : null,
      allDay: false
    }
  }
}
```

---

### 2.3 API 일정 생성

```javascript
// src/app/api/studies/[id]/calendar/route.js
export async function POST(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    const body = await request.json()
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      allDay, 
      location, 
      eventType,
      recurrence,
      attendeeIds,
      reminderMinutes
    } = body

    // 제목 검증
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "제목을 입력해주세요" },
        { status: 400 }
      )
    }

    // 시작일 검증
    if (!startDate) {
      return NextResponse.json(
        { error: "시작일을 선택해주세요" },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    if (isNaN(start.getTime())) {
      return NextResponse.json(
        { error: "유효하지 않은 시작일입니다" },
        { status: 400 }
      )
    }

    // 종료일 검증
    if (endDate) {
      const end = new Date(endDate)
      if (isNaN(end.getTime())) {
        return NextResponse.json(
          { error: "유효하지 않은 종료일입니다" },
          { status: 400 }
        )
      }

      if (end < start) {
        return NextResponse.json(
          { error: "종료일은 시작일 이후여야 합니다" },
          { status: 400 }
        )
      }
    }

    // 일정 생성 (트랜잭션)
    const event = await prisma.$transaction(async (tx) => {
      // 일정 생성
      const newEvent = await tx.event.create({
        data: {
          studyId,
          title: title.trim(),
          description: description?.trim(),
          startDate: start,
          endDate: endDate ? new Date(endDate) : null,
          allDay: allDay || false,
          location: location?.trim(),
          eventType: eventType || 'STUDY',
          recurrence: recurrence,
          creatorId: session.user.id
        }
      })

      // 참석자 추가
      if (attendeeIds && attendeeIds.length > 0) {
        await tx.eventAttendee.createMany({
          data: attendeeIds.map(userId => ({
            eventId: newEvent.id,
            userId
          }))
        })
      }

      // 알림 추가
      if (reminderMinutes && Array.isArray(reminderMinutes)) {
        await tx.eventReminder.createMany({
          data: reminderMinutes.map(minutes => ({
            eventId: newEvent.id,
            userId: session.user.id,
            minutes
          }))
        })
      }

      return newEvent
    })

    // 참석자들에게 알림
    if (attendeeIds && attendeeIds.length > 0) {
      await notifyEventCreated(event, attendeeIds.filter(id => id !== session.user.id))
    }

    return NextResponse.json({
      success: true,
      message: "일정이 생성되었습니다",
      data: event
    }, { status: 201 })

  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: "일정 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

## 일정 수정/삭제 예외

### 3.1 권한 검증

```javascript
// ✅ 좋은 예: 일정 수정 권한
const canEditEvent = (event) => {
  return (
    study.myRole === 'OWNER' ||
    study.myRole === 'ADMIN' ||
    event.creatorId === currentUser.id
  )
}

const handleEdit = (event) => {
  if (!canEditEvent(event)) {
    alert('수정 권한이 없습니다')
    return
  }

  // 수정 모달 열기
  setEditingEvent(event)
  setShowModal(true)
}
```

---

### 3.2 반복 일정 수정

```javascript
// ✅ 좋은 예: 반복 일정 수정 옵션
const handleEditRecurringEvent = async (event, updates) => {
  if (event.recurrence) {
    const choice = await showRecurrenceEditDialog()
    
    // choice: 'this' | 'future' | 'all'
    
    if (choice === 'this') {
      // 이 일정만 수정
      await updateSingleInstance(event.id, updates)
    } else if (choice === 'future') {
      // 이후 일정 모두 수정
      await updateFutureInstances(event.id, updates)
    } else if (choice === 'all') {
      // 모든 반복 일정 수정
      await updateAllInstances(event.recurrenceId, updates)
    }
  } else {
    // 단일 일정
    await updateEvent(event.id, updates)
  }
}

// 수정 선택 다이얼로그
function showRecurrenceEditDialog() {
  return new Promise((resolve) => {
    const dialog = document.createElement('div')
    dialog.className = styles.recurrenceDialog
    dialog.innerHTML = `
      <div class="${styles.dialogContent}">
        <h3>반복 일정 수정</h3>
        <p>어떤 일정을 수정하시겠습니까?</p>
        <div class="${styles.dialogButtons}">
          <button data-choice="this">이 일정만</button>
          <button data-choice="future">이후 일정 모두</button>
          <button data-choice="all">모든 반복 일정</button>
          <button data-choice="cancel">취소</button>
        </div>
      </div>
    `

    document.body.appendChild(dialog)

    dialog.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        const choice = e.target.dataset.choice
        document.body.removeChild(dialog)
        resolve(choice === 'cancel' ? null : choice)
      }
    })
  })
}
```

---

## 날짜 파싱 예외

### 4.1 타임존 처리

```javascript
// ✅ 좋은 예: KST 타임존 처리
import { formatInTimeZone, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'

const TIMEZONE = 'Asia/Seoul'

// 사용자 입력 -> UTC 저장
const convertToUTC = (dateString) => {
  try {
    // 사용자가 입력한 날짜/시간을 KST로 해석
    const zonedDate = zonedTimeToUtc(dateString, TIMEZONE)
    return zonedDate
  } catch (error) {
    console.error('Date conversion error:', error)
    throw new Error('날짜 변환 중 오류가 발생했습니다')
  }
}

// UTC -> 사용자 표시 (KST)
const formatToKST = (utcDate, format = 'yyyy-MM-dd HH:mm') => {
  try {
    return formatInTimeZone(utcDate, TIMEZONE, format)
  } catch (error) {
    console.error('Date formatting error:', error)
    return '날짜 오류'
  }
}

// 캘린더 렌더링 시
const eventStartKST = utcToZonedTime(event.startDate, TIMEZONE)
```

---

### 4.2 날짜 파싱 오류 처리

```javascript
// ✅ 좋은 예: 안전한 날짜 파싱
const safeParseDates = (events) => {
  return events.map(event => {
    try {
      const startDate = new Date(event.startDate)
      const endDate = event.endDate ? new Date(event.endDate) : null

      // 유효성 체크
      if (isNaN(startDate.getTime())) {
        console.error(`Invalid start date for event ${event.id}:`, event.startDate)
        return null
      }

      if (endDate && isNaN(endDate.getTime())) {
        console.error(`Invalid end date for event ${event.id}:`, event.endDate)
        // 종료일만 무효화
        return { ...event, startDate, endDate: null }
      }

      return {
        ...event,
        startDate,
        endDate
      }

    } catch (error) {
      console.error(`Error parsing event ${event.id}:`, error)
      return null
    }
  }).filter(Boolean) // null 제거
}

// 사용
const validEvents = safeParseDates(events)
```

---

## 반복 일정 예외

### 5.1 반복 규칙 생성

```javascript
// ✅ 좋은 예: 반복 일정 인스턴스 생성
const generateRecurringInstances = (baseEvent, startDate, endDate, recurrence) => {
  const instances = []
  let current = new Date(startDate)
  const end = new Date(endDate)

  // 최대 100개로 제한
  const MAX_INSTANCES = 100
  let count = 0

  while (current <= end && count < MAX_INSTANCES) {
    instances.push({
      ...baseEvent,
      startDate: new Date(current),
      // 원본 이벤트 ID 저장
      recurrenceId: baseEvent.id
    })

    // 다음 날짜 계산
    switch (recurrence) {
      case 'DAILY':
        current.setDate(current.getDate() + 1)
        break
      case 'WEEKLY':
        current.setDate(current.getDate() + 7)
        break
      case 'MONTHLY':
        current.setMonth(current.getMonth() + 1)
        break
      default:
        return instances
    }

    count++
  }

  if (count >= MAX_INSTANCES) {
    console.warn(`Recurring event instances limited to ${MAX_INSTANCES}`)
  }

  return instances
}
```

---

## 알림 설정 예외

### 6.1 알림 시간 계산

```javascript
// ✅ 좋은 예: 알림 스케줄링
const scheduleEventReminders = async (event) => {
  const reminders = await prisma.eventReminder.findMany({
    where: { eventId: event.id, sent: false }
  })

  for (const reminder of reminders) {
    const reminderTime = new Date(event.startDate)
    reminderTime.setMinutes(reminderTime.getMinutes() - reminder.minutes)

    // 과거 시간이면 스킵
    if (reminderTime < new Date()) {
      console.log(`Skipping past reminder for event ${event.id}`)
      continue
    }

    // 알림 스케줄 (예: Bull Queue)
    await notificationQueue.add('eventReminder', {
      userId: reminder.userId,
      eventId: event.id,
      reminderId: reminder.id,
      message: `"${event.title}" 일정이 ${reminder.minutes}분 후 시작됩니다`
    }, {
      delay: reminderTime.getTime() - Date.now()
    })
  }
}
```

---

## 캘린더 렌더링 예외

### 7.1 월별 캘린더 렌더링

```javascript
// ✅ 좋은 예: 월별 캘린더 그리드
const generateCalendarGrid = (year, month) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // 첫 주의 시작 (일요일)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  // 마지막 주의 끝 (토요일)
  const endDate = new Date(lastDay)
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
  
  // 날짜 배열 생성
  const dates = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  // 주별로 그룹화
  const weeks = []
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7))
  }
  
  return weeks
}

// 렌더링
const calendarWeeks = generateCalendarGrid(
  currentDate.getFullYear(),
  currentDate.getMonth()
)

return (
  <div className={styles.calendar}>
    {/* 요일 헤더 */}
    <div className={styles.weekdayHeaders}>
      {['일', '월', '화', '수', '목', '금', '토'].map(day => (
        <div key={day} className={styles.weekdayHeader}>{day}</div>
      ))}
    </div>
    
    {/* 날짜 그리드 */}
    {calendarWeeks.map((week, weekIdx) => (
      <div key={weekIdx} className={styles.calendarWeek}>
        {week.map((date, dayIdx) => {
          const dayEvents = getEventsForDate(events, date)
          const isCurrentMonth = date.getMonth() === currentDate.getMonth()
          const isToday = isSameDay(date, new Date())
          
          return (
            <div
              key={dayIdx}
              className={`
                ${styles.calendarDay}
                ${isCurrentMonth ? '' : styles.otherMonth}
                ${isToday ? styles.today : ''}
              `}
              onClick={() => handleDateClick(date)}
            >
              <div className={styles.dayNumber}>{date.getDate()}</div>
              <div className={styles.dayEvents}>
                {dayEvents.slice(0, 3).map(event => (
                  <div 
                    key={event.id}
                    className={`${styles.eventDot} ${styles[event.eventType.toLowerCase()]}`}
                    title={event.title}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <div className={styles.moreEvents}>+{dayEvents.length - 3}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    ))}
  </div>
)
```

---

### 7.2 날짜별 일정 필터링

```javascript
// ✅ 좋은 예: 날짜별 일정 추출
const getEventsForDate = (events, date) => {
  return events.filter(event => {
    const eventStart = new Date(event.startDate)
    const eventEnd = event.endDate ? new Date(event.endDate) : eventStart

    // 날짜 범위에 포함되는지 확인
    if (event.allDay) {
      // 종일 일정: 날짜만 비교
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const startOnly = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())
      const endOnly = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate())
      
      return dateOnly >= startOnly && dateOnly <= endOnly
    } else {
      // 시간 일정: 날짜 비교
      return isSameDay(date, eventStart) || 
             (date >= eventStart && date <= eventEnd)
    }
  })
}

const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}
```

---

## 관련 문서

- [05-files-exceptions.md](./05-files-exceptions.md) - 파일 관리 예외
- [07-widgets-exceptions.md](./07-widgets-exceptions.md) - 위젯 예외
- [04-tasks-exceptions.md](./04-tasks-exceptions.md) - 할일 관리 예외

---

**다음 문서**: [07-widgets-exceptions.md](./07-widgets-exceptions.md)  
**이전 문서**: [05-files-exceptions.md](./05-files-exceptions.md)

