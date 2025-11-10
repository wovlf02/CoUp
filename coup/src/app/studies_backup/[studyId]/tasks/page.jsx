'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function StudyTasksPage({ params }) {
  const { studyId } = params;
  const [filter, setFilter] = useState('incomplete');
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    content: '',
    assignee: '',
    dueDate: '',
    priority: 'normal'
  });

  // Mock data
  const tasks = [
    {
      id: 1,
      content: '백준 1234번 문제 풀이',
      assignee: '김철수',
      dueDate: '2025-11-07',
      priority: 'high',
      isCompleted: false,
      dDay: -1
    },
    {
      id: 2,
      content: '코드 리뷰 준비',
      assignee: '이영희',
      dueDate: '2025-11-10',
      priority: 'high',
      isCompleted: false,
      dDay: 4
    },
    {
      id: 3,
      content: '알고리즘 강의 3강 수강',
      assignee: '박민수',
      dueDate: '2025-11-12',
      priority: 'normal',
      isCompleted: false,
      dDay: 6
    },
    {
      id: 4,
      content: '자료구조 정리 문서 작성',
      assignee: '최지은',
      dueDate: '2025-11-15',
      priority: 'low',
      isCompleted: false,
      dDay: 9
    },
    {
      id: 5,
      content: '알고리즘 문제 3개 풀기',
      assignee: '김철수',
      completedDate: '2025-11-04',
      isCompleted: true
    },
    {
      id: 6,
      content: '주간 회의록 작성',
      assignee: '이영희',
      completedDate: '2025-11-03',
      isCompleted: true
    },
    {
      id: 7,
      content: '스터디 자료 업로드',
      assignee: '박민수',
      completedDate: '2025-11-02',
      isCompleted: true
    }
  ];

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'incomplete') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  const incompleteTasks = filteredTasks.filter(t => !t.isCompleted);
  const completedTasks = filteredTasks.filter(t => t.isCompleted);

  const getDDayClass = (dDay) => {
    if (dDay <= 0) return styles.overdue;
    if (dDay <= 3) return styles.urgent;
    return '';
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'high') return '🔴';
    if (priority === 'low') return '🔵';
    return '';
  };

  const handleAddTask = () => {
    console.log('할일 추가:', newTask);
    setIsAdding(false);
    setNewTask({ content: '', assignee: '', dueDate: '', priority: 'normal' });
  };

  const handleToggleComplete = (taskId) => {
    console.log('완료 토글:', taskId);
  };

  const handleDeleteTask = (taskId) => {
    if (confirm('할 일을 삭제하시겠습니까?')) {
      console.log('할일 삭제:', taskId);
    }
  };

  return (
    <div className={styles.container}>
      {/* 페이지 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>할 일 관리</h1>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            전체
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'incomplete' ? styles.active : ''}`}
            onClick={() => setFilter('incomplete')}
          >
            미완료
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'completed' ? styles.active : ''}`}
            onClick={() => setFilter('completed')}
          >
            완료
          </button>
        </div>
      </div>

      {/* 할일 추가 */}
      {!isAdding ? (
        <div className={styles.addTaskButton} onClick={() => setIsAdding(true)}>
          <span className={styles.plusIcon}>+</span>
          할 일 추가...
        </div>
      ) : (
        <div className={styles.addTaskForm}>
          <input
            type="text"
            placeholder="할 일 내용을 입력하세요"
            value={newTask.content}
            onChange={(e) => setNewTask({ ...newTask, content: e.target.value })}
            className={styles.taskInput}
            autoFocus
          />
          <div className={styles.taskDetails}>
            <div className={styles.detailGroup}>
              <label>담당자</label>
              <select
                value={newTask.assignee}
                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                className={styles.taskSelect}
              >
                <option value="">선택하세요</option>
                <option value="김철수">김철수</option>
                <option value="이영희">이영희</option>
                <option value="박민수">박민수</option>
              </select>
            </div>
            <div className={styles.detailGroup}>
              <label>마감일</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className={styles.taskDate}
              />
            </div>
            <div className={styles.detailGroup}>
              <label>우선순위</label>
              <div className={styles.priorityRadios}>
                <label>
                  <input
                    type="radio"
                    value="high"
                    checked={newTask.priority === 'high'}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  />
                  높음
                </label>
                <label>
                  <input
                    type="radio"
                    value="normal"
                    checked={newTask.priority === 'normal'}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  />
                  보통
                </label>
                <label>
                  <input
                    type="radio"
                    value="low"
                    checked={newTask.priority === 'low'}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  />
                  낮음
                </label>
              </div>
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={() => setIsAdding(false)}>
              취소
            </button>
            <button className={styles.submitBtn} onClick={handleAddTask}>
              추가하기
            </button>
          </div>
        </div>
      )}

      {/* 미완료 할일 */}
      {incompleteTasks.length > 0 && (
        <div className={styles.taskSection}>
          <h2 className={styles.sectionTitle}>미완료 ({incompleteTasks.length}개)</h2>
          <div className={styles.taskList}>
            {incompleteTasks.map((task) => (
              <div key={task.id} className={styles.taskCard}>
                <div className={styles.taskCheckbox} onClick={() => handleToggleComplete(task.id)}>
                  <span className={styles.unchecked}>☐</span>
                </div>
                <div className={styles.taskContent}>
                  <h3 className={styles.taskTitle}>{task.content}</h3>
                  <div className={styles.taskMeta}>
                    <span>담당: {task.assignee}</span>
                    <span className={getDDayClass(task.dDay)}>
                      마감: {task.dueDate} (D{task.dDay > 0 ? '-' : ''}{task.dDay})
                    </span>
                    {task.priority !== 'normal' && (
                      <span className={styles.taskPriority}>
                        {getPriorityIcon(task.priority)} {task.priority === 'high' ? '높음' : '낮음'}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.taskActions}>
                  <button className={styles.completeBtn} onClick={() => handleToggleComplete(task.id)}>
                    ✓
                  </button>
                  <button className={styles.editBtn}>수정</button>
                  <button className={styles.deleteBtn} onClick={() => handleDeleteTask(task.id)}>
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 완료된 할일 */}
      {completedTasks.length > 0 && (
        <div className={styles.taskSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>완료 ({completedTasks.length}개)</h2>
            <button className={styles.viewAllBtn}>모두 보기</button>
          </div>
          <div className={styles.taskList}>
            {completedTasks.slice(0, 3).map((task) => (
              <div key={task.id} className={`${styles.taskCard} ${styles.completed}`}>
                <div className={styles.taskCheckbox} onClick={() => handleToggleComplete(task.id)}>
                  <span className={styles.checked}>☑</span>
                </div>
                <div className={styles.taskContent}>
                  <h3 className={`${styles.taskTitle} ${styles.completedTitle}`}>{task.content}</h3>
                  <div className={styles.taskMeta}>
                    <span>완료: {task.assignee}</span>
                    <span>완료일: {task.completedDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {filteredTasks.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✅</div>
          <h3 className={styles.emptyTitle}>할 일이 없습니다</h3>
          <p className={styles.emptyDescription}>
            {filter === 'completed'
              ? '아직 완료된 할 일이 없습니다.'
              : '새로운 할 일을 추가해보세요!'}
          </p>
        </div>
      )}
    </div>
  );
}

