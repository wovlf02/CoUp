// 스터디 할일 리스트 뷰
'use client';

import styles from './StudyTaskListView.module.css';

const STATUS_LABELS = {
  TODO: '할 일',
  IN_PROGRESS: '진행 중',
  REVIEW: '검토',
  DONE: '완료'
};

const PRIORITY_LABELS = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음'
};

export default function StudyTaskListView({
  tasks,
  onTaskClick,
  onToggle,
  isToggling,
  canManage = false
}) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dateString, status) => {
    if (!dateString || status === 'DONE') return false;
    return new Date(dateString) < new Date();
  };

  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>📭 할일이 없습니다</p>
      </div>
    );
  }

  return (
    <div className={styles.listView}>
      {/* 헤더 */}
      <div className={styles.listHeader}>
        <div className={styles.colCheck}></div>
        <div className={styles.colTitle}>할일</div>
        <div className={styles.colStatus}>상태</div>
        <div className={styles.colPriority}>우선순위</div>
        <div className={styles.colAssignee}>담당자</div>
        <div className={styles.colDueDate}>마감일</div>
      </div>

      {/* 태스크 목록 */}
      <div className={styles.listBody}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`${styles.listRow} ${task.status === 'DONE' ? styles.completed : ''} ${isOverdue(task.dueDate, task.status) ? styles.overdue : ''}`}
          >
            {/* 체크박스 (관리자만) */}
            <div className={styles.colCheck}>
              {canManage ? (
                <button
                  className={`${styles.checkbox} ${task.status === 'DONE' ? styles.checked : ''}`}
                  onClick={() => onToggle(task.id)}
                  disabled={isToggling}
                  title={task.status === 'DONE' ? '미완료로 변경' : '완료 처리'}
                >
                  {task.status === 'DONE' && '✓'}
                </button>
              ) : (
                <div className={`${styles.checkboxDisabled} ${task.status === 'DONE' ? styles.checked : ''}`}>
                  {task.status === 'DONE' && '✓'}
                </div>
              )}
            </div>

            {/* 제목 */}
            <div className={styles.colTitle} onClick={() => onTaskClick(task)}>
              <span className={styles.taskTitle}>{task.title}</span>
              {task.description && (
                <span className={styles.taskDescription}>
                  {task.description.length > 40
                    ? task.description.substring(0, 40) + '...'
                    : task.description}
                </span>
              )}
            </div>

            {/* 상태 */}
            <div className={styles.colStatus}>
              <span className={`${styles.statusBadge} ${styles[task.status.toLowerCase()]}`}>
                {STATUS_LABELS[task.status]}
              </span>
            </div>

            {/* 우선순위 */}
            <div className={styles.colPriority}>
              <span className={`${styles.priorityBadge} ${styles[`priority${task.priority}`]}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>
            </div>

            {/* 담당자 */}
            <div className={styles.colAssignee}>
              {task.assignees && task.assignees.length > 0 ? (
                <div className={styles.assignees}>
                  {task.assignees.slice(0, 3).map((assignee, index) => (
                    assignee.user?.avatar ? (
                      <img
                        key={index}
                        src={assignee.user.avatar}
                        alt={assignee.user?.name}
                        className={styles.assigneeAvatar}
                        title={assignee.user?.name}
                      />
                    ) : (
                      <div
                        key={index}
                        className={styles.assigneeAvatarPlaceholder}
                        title={assignee.user?.name}
                      >
                        {assignee.user?.name?.charAt(0) || '?'}
                      </div>
                    )
                  ))}
                  {task.assignees.length > 3 && (
                    <span className={styles.moreCount}>+{task.assignees.length - 3}</span>
                  )}
                </div>
              ) : (
                <span className={styles.noAssignee}>-</span>
              )}
            </div>

            {/* 마감일 */}
            <div className={styles.colDueDate}>
              <span className={isOverdue(task.dueDate, task.status) ? styles.overdueText : ''}>
                {formatDate(task.dueDate)}
                {isOverdue(task.dueDate, task.status) && <span className={styles.overdueIcon}>⚠️</span>}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
