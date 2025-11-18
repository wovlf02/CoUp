'use client'

import { useState, useMemo } from 'react'
import TaskFilters from '@/components/tasks/TaskFilters'
import TaskGroup from '@/components/tasks/TaskGroup'
import TodayTasksWidget from '@/components/tasks/TodayTasksWidget'
import TaskProgressWidget from '@/components/tasks/TaskProgressWidget'
import TaskByStudyWidget from '@/components/tasks/TaskByStudyWidget'
import TaskEmpty from '@/components/tasks/TaskEmpty'
import TaskCreateModal from '@/components/tasks/TaskCreateModal'
import { useTasks, useToggleTask, useDeleteTask, useTaskStats } from '@/lib/hooks/useApi'
import { getUrgencyLevel } from '@/utils/time'
import styles from './page.module.css'

export default function TasksPage() {
  const [filter, setFilter] = useState({
    studyId: null,
    status: 'all',
    sortBy: 'deadline',
  })
  const [showCreateModal, setShowCreateModal] = useState(false)

  // 실제 API 호출
  const { data: tasksData, isLoading } = useTasks(filter)
  const { data: statsData } = useTaskStats()
  const toggleTask = useToggleTask()
  const deleteTask = useDeleteTask()

  const tasks = tasksData?.data || []
  const taskStats = statsData?.data || null

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
    try {
      await toggleTask.mutateAsync(taskId)
    } catch (error) {
      console.error('할일 토글 실패:', error)
      alert('할 일 상태 변경에 실패했습니다.')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (confirm('정말 이 할 일을 삭제하시겠습니까?')) {
      try {
        await deleteTask.mutateAsync(taskId)
      } catch (error) {
        console.error('할일 삭제 실패:', error)
        alert('할 일 삭제에 실패했습니다.')
      }
    }
  }

  const incompleteCount = tasks.filter(t => !t.completed).length

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>할 일을 불러오는 중...</div>
      </div>
    )
  }

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
          setFilter={setFilter}
          taskCount={incompleteCount}
        />

        {tasks.length === 0 ? (
          <TaskEmpty onCreateClick={() => setShowCreateModal(true)} />
        ) : (
          <div className={styles.taskGroups}>
            {groupedTasks.urgent.length > 0 && (
              <TaskGroup
                title="🔥 긴급"
                tasks={groupedTasks.urgent}
                color="urgent"
                onToggle={handleToggleComplete}
                onDelete={handleDeleteTask}
              />
            )}

            {groupedTasks.thisWeek.length > 0 && (
              <TaskGroup
                title="📅 이번 주"
                tasks={groupedTasks.thisWeek}
                color="thisWeek"
                onToggle={handleToggleComplete}
                onDelete={handleDeleteTask}
              />
            )}

            {groupedTasks.later.length > 0 && (
              <TaskGroup
                title="📝 나중에"
                tasks={groupedTasks.later}
                color="later"
                onToggle={handleToggleComplete}
                onDelete={handleDeleteTask}
              />
            )}
          </div>
        )}
      </div>

      <aside className={styles.sidebar}>
        <TodayTasksWidget tasks={tasks} />
        {taskStats && <TaskProgressWidget stats={taskStats} />}
        <TaskByStudyWidget tasks={tasks} />
      </aside>

      {showCreateModal && (
        <TaskCreateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}
