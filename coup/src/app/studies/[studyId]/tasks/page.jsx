'use client'

import { useState } from 'react'
import styles from '@/styles/studies/tasks.module.css'

export default function StudyTasksPage({ params }) {
  const [filter, setFilter] = useState('incomplete') // all, incomplete, completed
  const [isAdding, setIsAdding] = useState(false)
  const [newTask, setNewTask] = useState({
    content: '',
    assigneeId: '',
    dueDate: '',
    priority: 'normal'
  })

  // 샘플 할 일 데이터
  const [tasks, setTasks] = useState([
    {
      id: 1,
      content: '백준 1234번 문제 풀이',
      assignee: { id: 1, name: '김철수' },
      dueDate: new Date(2025, 10, 7),
      priority: 'normal',
      isCompleted: false,
      canEdit: true
    },
    {
      id: 2,
      content: '코드 리뷰 준비',
      assignee: { id: 2, name: '이영희' },
      dueDate: new Date(2025, 10, 10),
      priority: 'high',
      isCompleted: false,
      canEdit: false
    },
    {
      id: 3,
      content: '알고리즘 문제 3개 풀기',
      assignee: { id: 1, name: '김철수' },
      completedAt: new Date(2025, 10, 4),
      priority: 'normal',
      isCompleted: true,
      canEdit: true
    }
  ])

  const members = [
    { id: 1, name: '김철수' },
    { id: 2, name: '이영희' },
    { id: 3, name: '박민수' }
  ]

  const getDday = (dueDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))

    if (diff < 0) return { text: `D+${Math.abs(diff)}`, status: 'overdue' }
    if (diff === 0) return { text: 'D-day', status: 'overdue' }
    if (diff <= 3) return { text: `D-${diff}`, status: 'urgent' }
    return { text: `D-${diff}`, status: 'normal' }
  }

  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const handleAddTask = () => {
    if (!newTask.content.trim() || !newTask.assigneeId || !newTask.dueDate) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    const task = {
      id: Date.now(),
      content: newTask.content,
      assignee: members.find(m => m.id === parseInt(newTask.assigneeId)),
      dueDate: new Date(newTask.dueDate),
      priority: newTask.priority,
      isCompleted: false,
      canEdit: true
    }

    setTasks(prev => [task, ...prev])
    setNewTask({ content: '', assigneeId: '', dueDate: '', priority: 'normal' })
    setIsAdding(false)

    // TODO: API 호출
    console.log('할 일 추가:', task)
  }

  const toggleComplete = (taskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          isCompleted: !task.isCompleted,
          completedAt: !task.isCompleted ? new Date() : null
        }
      }
      return task
    }))

    // TODO: API 호출 (Optimistic Update)
    console.log('할 일 완료 토글:', taskId)
  }

  const handleDelete = (taskId) => {
    if (!confirm('할 일을 삭제하시겠습니까?')) return

    setTasks(prev => prev.filter(t => t.id !== taskId))
    // TODO: API 호출
    console.log('할 일 삭제:', taskId)
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'incomplete') return !task.isCompleted
    if (filter === 'completed') return task.isCompleted
    return true
  })

  const incompleteTasks = filteredTasks.filter(t => !t.isCompleted)
  const completedTasks = filteredTasks.filter(t => t.isCompleted)
  const [showAllCompleted, setShowAllCompleted] = useState(false)

  return (
    <div className={styles.tasksContainer}>
      {/* 헤더 */}
      <div className={styles.tasksHeader}>
        <h2>할 일 관리</h2>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            전체
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'incomplete' ? styles.active : ''}`}
            onClick={() => setFilter('incomplete')}
          >
            미완료
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
            onClick={() => setFilter('completed')}
          >
            완료
          </button>
        </div>
      </div>

      {/* 할 일 추가 */}
      {isAdding ? (
        <div className={styles.addTaskForm}>
          <div className={styles.formGroup}>
            <label>할 일 내용</label>
            <input
              type="text"
              value={newTask.content}
              onChange={(e) => setNewTask({ ...newTask, content: e.target.value })}
              placeholder="할 일을 입력하세요"
              autoFocus
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>담당자</label>
              <select
                value={newTask.assigneeId}
                onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
              >
                <option value="">선택하세요</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>마감일</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>우선순위</label>
            <div className={styles.radioGroup}>
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
          <div className={styles.formActions}>
            <button className={styles.cancelButton} onClick={() => setIsAdding(false)}>
              취소
            </button>
            <button className={styles.submitButton} onClick={handleAddTask}>
              추가하기
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.addTaskButton} onClick={() => setIsAdding(true)}>
          + 할 일 추가...
        </div>
      )}

      {/* 미완료 할 일 */}
      {incompleteTasks.length > 0 && (
        <div className={styles.taskSection}>
          <h3>미완료 ({incompleteTasks.length}개)</h3>
          <div className={styles.tasksList}>
            {incompleteTasks.map(task => (
              <div key={task.id} className={styles.taskCard}>
                <input
                  type="checkbox"
                  className={styles.taskCheckbox}
                  checked={task.isCompleted}
                  onChange={() => toggleComplete(task.id)}
                />
                <div className={styles.taskContent}>
                  <div className={styles.taskTitle}>{task.content}</div>
                  <div className={styles.taskMeta}>
                    <span>담당: {task.assignee.name}</span>
                    <span>·</span>
                    <span className={`${styles.dueDate} ${styles[getDday(task.dueDate).status]}`}>
                      마감: {formatDate(task.dueDate)} ({getDday(task.dueDate).text})
                    </span>
                    {task.priority === 'high' && <span className={styles.highPriority}>🔴 높음</span>}
                    {task.priority === 'low' && <span className={styles.lowPriority}>🔵 낮음</span>}
                  </div>
                </div>
                {task.canEdit && (
                  <div className={styles.taskActions}>
                    <button className={styles.completeButton} onClick={() => toggleComplete(task.id)} title="완료">
                      ✓
                    </button>
                    <button className={styles.editButton} title="수정">
                      ✏️
                    </button>
                    <button className={styles.deleteButton} onClick={() => handleDelete(task.id)} title="삭제">
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 완료된 할 일 */}
      {completedTasks.length > 0 && (
        <div className={styles.taskSection}>
          <div className={styles.sectionHeader}>
            <h3>완료 ({completedTasks.length}개)</h3>
            {completedTasks.length > 3 && (
              <button
                className={styles.showAllButton}
                onClick={() => setShowAllCompleted(!showAllCompleted)}
              >
                {showAllCompleted ? '접기' : '모두 보기'}
              </button>
            )}
          </div>
          <div className={styles.tasksList}>
            {(showAllCompleted ? completedTasks : completedTasks.slice(0, 3)).map(task => (
              <div key={task.id} className={`${styles.taskCard} ${styles.completed}`}>
                <input
                  type="checkbox"
                  className={styles.taskCheckbox}
                  checked={task.isCompleted}
                  onChange={() => toggleComplete(task.id)}
                />
                <div className={styles.taskContent}>
                  <div className={styles.taskTitle}>{task.content}</div>
                  <div className={styles.taskMeta}>
                    <span>완료: {task.assignee.name}</span>
                    <span>·</span>
                    <span>완료일: {formatDate(task.completedAt)}</span>
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
          <p>할 일이 없습니다</p>
        </div>
      )}
    </div>
  )
}

