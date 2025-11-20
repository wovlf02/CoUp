# 할 일 탭 리스트/달력 뷰 구현

## 📋 수정 일자
2025-01-21

## 🎯 목표
할 일 탭에서 리스트 뷰와 달력 뷰를 전환할 수 있는 기능 구현

## ✅ 구현 내용

### 1. 달력 뷰 컴포넌트 생성

#### 신규 파일:
- **파일**: `coup/src/components/tasks/TaskCalendarView.jsx`
- **스타일**: `coup/src/components/tasks/TaskCalendarView.module.css`

#### 주요 기능:
1. **월 단위 달력 표시**
   - 7x6 그리드 (일요일~토요일)
   - 이전/다음 달 이동
   - 오늘 날짜 하이라이트
   - 다른 달 날짜는 흐리게 표시

2. **할 일 표시**
   - 각 날짜에 해당하는 할 일 표시
   - 최대 3개까지 표시, 그 이상은 "+N개 더보기"
   - 할 일 클릭 시 완료/미완료 토글
   - 완료된 할 일은 취소선과 회색 표시

3. **날짜별 할 일 개수 뱃지**
   - 할 일이 있는 날짜에 개수 표시
   - 주황색 뱃지로 시각적 강조

### 2. 뷰 모드 토글 버튼 추가

#### 수정된 파일:
**파일**: `coup/src/components/tasks/TaskFilters.jsx`

#### 변경사항:
```javascript
// Before: 뷰 모드 없음
export default function TaskFilters({ filter, setFilter, taskCount })

// After: 뷰 모드 토글 추가
export default function TaskFilters({ filter, setFilter, taskCount, viewMode, setViewMode })

// 마감일순 select 바로 옆에 배치
<select value={filter.sortBy}>
  <option value="deadline">마감일순</option>
  ...
</select>

{/* 뷰 모드 토글 버튼 */}
<div className={styles.viewToggle}>
  <button
    className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
    onClick={() => setViewMode('list')}
  >
    📋
  </button>
  <button
    className={`${styles.viewButton} ${viewMode === 'calendar' ? styles.active : ''}`}
    onClick={() => setViewMode('calendar')}
  >
    📅
  </button>
</div>
```

#### 스타일:
```css
.viewToggle {
  display: flex;
  gap: 4px;
  background: var(--gray-100);
  padding: 4px;
  border-radius: 8px;
}

.viewButton {
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.viewButton.active {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### 3. 메인 페이지에 뷰 전환 로직 추가

#### 수정된 파일:
**파일**: `coup/src/app/tasks/page.jsx`

#### 변경사항:
```javascript
// 1. viewMode 상태 추가
const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'

// 2. TaskCalendarView 컴포넌트 import
import TaskCalendarView from '@/components/tasks/TaskCalendarView'

// 3. TaskFilters에 viewMode props 전달
<TaskFilters
  filter={filter}
  setFilter={setFilter}
  taskCount={incompleteCount}
  viewMode={viewMode}
  setViewMode={setViewMode}
/>

// 4. 뷰 모드에 따라 다른 컴포넌트 렌더링
{tasks.length === 0 ? (
  <TaskEmpty onCreateClick={() => setShowCreateModal(true)} />
) : viewMode === 'calendar' ? (
  <TaskCalendarView
    tasks={filteredTasks}
    onToggle={handleToggleComplete}
  />
) : (
  <div className={styles.taskGroups}>
    {/* 리스트 뷰 */}
  </div>
)}
```

## 🎨 UI/UX

### 버튼 배치:
```
[전체 스터디 ▼] [전체 상태 ▼] [마감일순 ▼] [📋📅] ... [📊 미완료 N건]
```

### 리스트 뷰 (기본):
```
🔥 긴급
  ▢ 할 일 1 (D-1)
  ▢ 할 일 2 (D-2)

📅 이번 주
  ▢ 할 일 3 (D-3)
  ▢ 할 일 4 (D-5)

📝 나중에
  ▢ 할 일 5 (D-10)
```

### 달력 뷰:
```
    2025년 1월            [오늘]
일  월  화  수  목  금  토
                1   2   3
4   5   6   7   8   9  10
11 12  13  14  15  16  17
    ▢ 할일1
    ▢ 할일2
    +1개 더보기
```

## 📊 기능 상세

### 달력 뷰 주요 기능:

#### 1. 날짜 계산
```javascript
// 현재 월의 첫날과 마지막날
const firstDay = new Date(year, month, 1);
const lastDay = new Date(year, month + 1, 0);

// 달력 시작일 (이전 달 일요일부터)
const startDay = new Date(firstDay);
startDay.setDate(startDay.getDate() - startDay.getDay());

// 달력 종료일 (다음 달 토요일까지)
const endDay = new Date(lastDay);
endDay.setDate(endDay.getDate() + (6 - endDay.getDay()));
```

#### 2. 할 일 그룹화
```javascript
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
```

#### 3. 날짜 스타일링
```javascript
const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isCurrentMonth = (date) => {
  return date.getMonth() === currentDate.getMonth();
};
```

## 🎯 사용자 시나리오

### 시나리오 1: 리스트 뷰에서 작업
```
1. 할 일 탭 진입 (기본: 리스트 뷰)
2. 긴급도별로 그룹화된 할 일 확인
3. 체크박스로 완료 처리
4. 빠르게 할 일 파악
```

### 시나리오 2: 달력 뷰로 전환
```
1. 마감일순 옆 📅 버튼 클릭
2. 달력 뷰로 전환
3. 날짜별 할 일 분포 시각적으로 확인
4. 특정 날짜에 할 일이 몰려있는지 파악
5. 이전/다음 달 이동하여 장기 계획 확인
```

### 시나리오 3: 달력에서 할 일 완료
```
1. 달력에서 특정 날짜의 할 일 클릭
2. 즉시 완료/미완료 토글
3. 취소선과 회색으로 변경
4. 다시 클릭하면 미완료로 복원
```

## 🔧 기술적 세부사항

### 반응형 디자인:
```css
/* 데스크톱 */
.calendarDay {
  min-height: 120px;
}

/* 태블릿 */
@media (max-width: 1024px) {
  .calendarDay {
    min-height: 100px;
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .calendarDay {
    min-height: 80px;
  }
}
```

### 성능 최적화:
- `useMemo`로 달력 날짜 계산 캐싱
- `useMemo`로 날짜별 할 일 그룹화 캐싱
- 불필요한 리렌더링 방지

### 접근성:
- 버튼에 `title` 속성으로 툴팁 제공
- 키보드 네비게이션 지원
- 명확한 시각적 피드백

## 📱 반응형 동작

### 데스크톱:
- 달력 셀 크기: 120px
- 할 일 최대 3개 표시
- 완전한 기능 표시

### 태블릿:
- 달력 셀 크기: 100px
- 할 일 최대 3개 표시
- 글자 크기 약간 축소

### 모바일:
- 달력 셀 크기: 80px
- 할 일 최대 2개 표시
- 콤팩트한 UI
- 터치 최적화

## 🎉 결과

이제 할 일 탭에서:
- ✅ **리스트 뷰**: 긴급도별 그룹화된 할 일 확인
- ✅ **달력 뷰**: 날짜별 할 일 분포 시각적으로 확인
- ✅ **뷰 전환 버튼**: 마감일순 옆에 깔끔하게 배치
- ✅ **즉시 토글**: 달력에서 바로 완료 처리 가능
- ✅ **월 이동**: 이전/다음 달 할 일 확인
- ✅ **오늘 버튼**: 현재 날짜로 빠르게 이동
- ✅ **반응형**: 모든 기기에서 최적화된 경험

## 🔄 향후 개선 가능

### 1. 달력 뷰 확장 기능:
```javascript
// 할 일 상세 모달
const handleTaskClick = (task) => {
  setSelectedTask(task);
  setShowDetailModal(true);
};

// 드래그 앤 드롭으로 날짜 변경
const handleDragEnd = (taskId, newDate) => {
  updateTaskDate(taskId, newDate);
};

// 달력에서 직접 할 일 추가
const handleDateClick = (date) => {
  setNewTaskDate(date);
  setShowCreateModal(true);
};
```

### 2. 월간 통계:
```javascript
// 이번 달 완료율
const monthlyCompletionRate = 
  completedThisMonth / totalTasksThisMonth * 100;

// 가장 바쁜 날
const busiestDay = Math.max(...Object.values(tasksByDate).map(t => t.length));
```

### 3. 주간 뷰 추가:
```javascript
const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week'
```

브라우저를 새로고침하면 할 일 탭에서 리스트 뷰와 달력 뷰를 자유롭게 전환할 수 있습니다! 🎉

