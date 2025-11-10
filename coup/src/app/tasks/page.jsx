'use client'

import { useState, useMemo } from 'react'
import TaskFilters from '@/components/tasks/TaskFilters'
import TaskGroup from '@/components/tasks/TaskGroup'
import TodayTasksWidget from '@/components/tasks/TodayTasksWidget'
import TaskProgressWidget from '@/components/tasks/TaskProgressWidget'
import TaskByStudyWidget from '@/components/tasks/TaskByStudyWidget'
import TaskEmpty from '@/components/tasks/TaskEmpty'
import TaskCreateModal from '@/components/tasks/TaskCreateModal'
import { userTasks, taskStats } from '@/mocks/tasks'
import { getUrgencyLevel } from '@/utils/time'
import styles from './page.module.css'

export default function TasksPage() {
  const [tasks, setTasks] = useState(userTasks)
  const [filter, setFilter] = useState({
    studyId: null,
    status: 'all',
    sortBy: 'deadline',
  })
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredTasks = useMemo(() => {
    let result = tasks

    if (filter.studyId) {
      result = result.filter(t => t.studyId === filter.studyId)
    }

    if (filter.status === 'incomplete') {
      result = result.filter(t => !t.completed)
    } else if (filter.status === 'completed') {
      result = result.filter(t => t.completed)
    }

    result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

    return result
  }, [tasks, filter])

  const groupedTasks = useMemo(() => {
    const urgent = []
    const thisWeek = []
    const later = []

    filteredTasks.forEach(task => {
      const urgency = getUrgencyLevel(task.dueDate)
      if (urgency === 'urgent') {
        urgent.push(task)
      } else if (urgency === 'thisWeek') {
        thisWeek.push(task)
      } else {
        later.push(task)
      }
    })

    return { urgent, thisWeek, later }
  }, [filteredTasks])

  const handleToggleComplete = async (taskId) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed, completedAt: new Date().toISOString() }
        : task
    ))
    console.log('할 일 완료 토글:', taskId)
  }

  const handleCreateTask = (newTask) => {
    setTasks(prev => [...prev, newTask])
  }

  const handleDeleteTask = (taskId) => {
    if (confirm('정말 이 할 일을 삭제하시겠습니까?')) {
      setTasks(prev => prev.filter(task => task.id !== taskId))
      alert('할 일이 삭제되었습니다')
    }
  }

  const incompleteCount = tasks.filter(t => !t.completed).length

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>✅ 내 할 일</h1>
            <p className={styles.subtitle}>
              스터디별 할 일을 관리하고 완료하세요
            </p>
          </div>
          <button
            className={styles.addButton}
            onClick={() => setShowCreateModal(true)}
          >
            + 할 일 추가
          </button>
        </header>

        <TaskFilters
          filter={filter}
          onFilterChange={setFilter}
          incompleteCount={incompleteCount}
        />

        {filteredTasks.length === 0 ? (
          <TaskEmpty type="no-tasks" />
        ) : (
          <>
            {groupedTasks.urgent.length > 0 && (
              <TaskGroup
                title="🔴 긴급 (마감 24시간 이내)"
                tasks={groupedTasks.urgent}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
              />
            )}
            {groupedTasks.thisWeek.length > 0 && (
              <TaskGroup
                title="⏱️ 이번 주 (7일 이내)"
                tasks={groupedTasks.thisWeek}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
              />
            )}
            {groupedTasks.later.length > 0 && (
              <TaskGroup
                title="📋 나중에 (7일 이후)"
                tasks={groupedTasks.later}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
              />
            )}
          </>
        )}
      </div>

      <aside className={styles.sidebar}>
        <TodayTasksWidget tasks={tasks} />
        <TaskProgressWidget stats={taskStats} />
        <TaskByStudyWidget stats={taskStats} />
      </aside>

      {showCreateModal && (
        <TaskCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  )
}
