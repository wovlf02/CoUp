// 내 스터디 할일 관리 페이지
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { useStudy, useTasks, useCreateTask, useUpdateTask, useDeleteTask, useToggleTask } from '@/lib/hooks/useApi';

export default function MyStudyTasksPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const [viewMode, setViewMode] = useState('kanban');
  const [selectedTask, setSelectedTask] = useState(null);

  // 실제 API Hooks
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
  const { data: tasksData, isLoading: tasksLoading } = useTasks({ studyId });
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const toggleTaskMutation = useToggleTask();

  const study = studyData?.study;
  const allTasks = tasksData?.tasks || [];

  // 상태별로 할일 분류
  const tasksByStatus = {
    todo: allTasks.filter(t => t.status === 'TODO'),
    inProgress: allTasks.filter(t => t.status === 'IN_PROGRESS'),
    done: allTasks.filter(t => t.status === 'DONE')
  };

  const columns = [
    { id: 'todo', title: '할 일', count: tasksByStatus.todo.length },
    { id: 'inProgress', title: '진행 중', count: tasksByStatus.inProgress.length },
    { id: 'done', title: '완료', count: tasksByStatus.done.length }
  ];

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

  const getPriorityIcon = (priority) => {
    const icons = {
      HIGH: '🔴',
      MEDIUM: '🟡',
      LOW: '⚪',
    };
    return icons[priority] || '⚪';
  };

  const getPriorityClass = (priority) => {
    return styles[`priority${priority}`] || '';
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const handleToggleTask = async (taskId) => {
    try {
      await toggleTaskMutation.mutateAsync(taskId);
    } catch (error) {
      alert('할일 상태 변경 실패: ' + error.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('할일을 삭제하시겠습니까?')) return;

    try {
      await deleteTaskMutation.mutateAsync(taskId);
    } catch (error) {
      alert('할일 삭제 실패: ' + error.message);
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
            className={`${styles.tab} ${tab.label === '할일' ? styles.active : ''}`}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </Link>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 칸반 보드 */}
        <div className={styles.taskSection}>
          {/* 헤더 */}
          <div className={styles.taskHeader}>
            <h2 className={styles.taskTitle}>✅ 할일 관리</h2>
            <Link href="/tasks" className={styles.addButton}>+ 할일 추가</Link>
          </div>

          {/* 뷰 모드 & 필터 */}
          <div className={styles.controlSection}>
            <div className={styles.viewModes}>
              <button
                className={`${styles.viewMode} ${viewMode === 'kanban' ? styles.active : ''}`}
                onClick={() => setViewMode('kanban')}
              >
                칸반 보드
              </button>
              <button
                className={`${styles.viewMode} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
              >
                목록 뷰
              </button>
            </div>
          </div>

          {tasksLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>할일 로딩 중...</div>
          ) : allTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              할일을 추가해보세요! ✨
            </div>
          ) : (
            <>
              {/* 칸반 보드 */}
              <div className={styles.kanbanBoard}>
                {columns.map((column) => (
                  <div key={column.id} className={styles.kanbanColumn}>
                    <div className={styles.columnHeader}>
                      <h3 className={styles.columnTitle}>{column.title}</h3>
                      <span className={styles.columnCount}>({column.count}개)</span>
                    </div>

                    <div className={styles.taskList}>
                      {tasksByStatus[column.id].map((task) => (
                        <div
                          key={task.id}
                          className={`${styles.taskCard} ${getPriorityClass(task.priority)}`}
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className={styles.taskCardHeader}>
                            <span className={styles.priorityIcon}>
                              {getPriorityIcon(task.priority)}
                            </span>
                            <h4 className={styles.taskCardTitle}>{task.title}</h4>
                            <button className={styles.taskMenu}>⋮</button>
                          </div>

                          {task.description && (
                            <p className={styles.taskDescription}>{task.description}</p>
                          )}

                          <div className={styles.taskCardFooter}>
                            {task.dueDate && (
                              <span className={styles.taskDueDate}>📅 {formatDate(task.dueDate)}</span>
                            )}
                            <button
                              className={styles.taskToggleBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleTask(task.id);
                              }}
                            >
                              {task.completed ? '✅' : '⭕'}
                            </button>
                          </div>

                          <div className={styles.taskActions}>
                            <button
                              className={styles.taskActionBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      ))}

                      <Link href="/tasks" className={styles.addTaskButton}>+ 추가</Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.dragHint}>
                💡 할일 페이지(/tasks)에서 관리할 수 있습니다 →
              </div>
            </>
          )}
        </div>

        {/* 우측 위젯 */}
        <aside className={styles.sidebar}>
          {/* 전체 현황 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 전체 현황</h3>
            <div className={styles.widgetContent}>
              <div className={styles.statRow}>
                <span>전체:</span>
                <span className={styles.statValue}>{allTasks.length}개</span>
              </div>
              <div className={styles.statRow}>
                <span>완료:</span>
                <span className={styles.statValue}>{tasksByStatus.done.length}개</span>
              </div>
              <div className={styles.statRow}>
                <span>진행률:</span>
                <span className={styles.statValue}>
                  {allTasks.length > 0
                    ? Math.round((tasksByStatus.done.length / allTasks.length) * 100)
                    : 0}%
                </span>
              </div>
              {allTasks.length > 0 && (
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${(tasksByStatus.done.length / allTasks.length) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {/* 급한 할일 */}
          {tasksByStatus.todo.length > 0 && (
            <div className={styles.widget}>
              <h3 className={styles.widgetTitle}>⚠️ 할 일</h3>
              <div className={styles.widgetContent}>
                {tasksByStatus.todo.slice(0, 3).map((task) => (
                  <div key={task.id} className={styles.urgentTask}>
                    <div className={styles.urgentTaskTitle}>📌 {task.title}</div>
                    {task.dueDate && (
                      <div className={styles.urgentTaskMeta}>
                        {formatDate(task.dueDate)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 빠른 액션 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>⚡ 빠른 액션</h3>
            <div className={styles.widgetActions}>
              <Link href="/tasks" className={styles.widgetButton}>+ 할일 추가</Link>
              <Link href="/tasks" className={styles.widgetButton}>📊 전체 보기</Link>
            </div>
          </div>

          {/* 생산성 팁 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>💡 생산성 팁</h3>
            <div className={styles.widgetContent}>
              <p className={styles.tipText}>• 우선순위 명확히 설정</p>
              <p className={styles.tipText}>• 할일을 작은 단위로 분리</p>
              <p className={styles.tipText}>• 마감일을 현실적으로 설정</p>
              <p className={styles.tipText}>• 매일 진행 상황 업데이트</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
