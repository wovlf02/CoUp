// 내 스터디 할일 관리 페이지
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { studyTasksData } from '@/mocks/studyTasks';

export default function MyStudyTasksPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [selectedTask, setSelectedTask] = useState(null);

  const data = studyTasksData[studyId] || studyTasksData[1];
  const { study, columns, tasks } = data;

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
      urgent: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '⚪',
    };
    return icons[priority] || '⚪';
  };

  const getPriorityClass = (priority) => {
    return styles[`priority${priority.charAt(0).toUpperCase() + priority.slice(1)}`];
  };

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
            <button className={styles.addButton}>+ 할일 추가</button>
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
            <div className={styles.controls}>
              <button className={styles.filterButton}>필터 ▼</button>
              <input
                type="text"
                placeholder="할일 검색..."
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* 칸반 보드 */}
          <div className={styles.kanbanBoard}>
            {columns.map((column) => (
              <div key={column.id} className={styles.kanbanColumn}>
                <div className={styles.columnHeader}>
                  <h3 className={styles.columnTitle}>{column.title}</h3>
                  <span className={styles.columnCount}>({column.count}개)</span>
                </div>

                <div className={styles.taskList}>
                  {tasks[column.id].map((task) => (
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

                      <div className={styles.taskLabels}>
                        {task.labels.map((label) => (
                          <span key={label} className={styles.taskLabel}>
                            #{label}
                          </span>
                        ))}
                      </div>

                      {task.checklist && (
                        <div className={styles.taskProgress}>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{
                                width: `${(task.checklist.completed / task.checklist.total) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className={styles.progressText}>
                            {task.checklist.completed}/{task.checklist.total}
                          </span>
                        </div>
                      )}

                      <div className={styles.taskCardFooter}>
                        <span className={styles.taskDueDate}>📅 {task.dueDate}</span>
                        <span className={styles.taskAssignee}>
                          👤 {task.assignee.name}
                        </span>
                      </div>

                      {task.comments > 0 && (
                        <div className={styles.taskStats}>
                          <span className={styles.taskComments}>💬 {task.comments}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  <button className={styles.addTaskButton}>+ 추가</button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.dragHint}>
            💡 드래그하여 상태 변경 →
          </div>
        </div>

        {/* 우측 위젯 */}
        <aside className={styles.sidebar}>
          {/* 전체 현황 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 전체 현황</h3>
            <div className={styles.widgetContent}>
              <div className={styles.statRow}>
                <span>전체:</span>
                <span className={styles.statValue}>24개</span>
              </div>
              <div className={styles.statRow}>
                <span>완료:</span>
                <span className={styles.statValue}>12개</span>
              </div>
              <div className={styles.statRow}>
                <span>진행률:</span>
                <span className={styles.statValue}>50%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>

          {/* 급한 할일 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>⚠️ 급한 할일 (D-3 이내)</h3>
            <div className={styles.widgetContent}>
              {tasks.todo.slice(0, 2).map((task) => (
                <div key={task.id} className={styles.urgentTask}>
                  <div className={styles.urgentTaskTitle}>📌 {task.title}</div>
                  <div className={styles.urgentTaskMeta}>
                    {task.dueDate} · {task.assignee.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 내 할일 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>👤 내 할일</h3>
            <div className={styles.widgetContent}>
              <div className={styles.statRow}>
                <span>진행 중:</span>
                <span>3개</span>
              </div>
              <div className={styles.statRow}>
                <span>완료:</span>
                <span>5개</span>
              </div>
              <div className={styles.statRow}>
                <span>이번 주:</span>
                <span className={styles.statValue}>8개</span>
              </div>
            </div>
          </div>

          {/* 라벨 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>🏷️ 라벨</h3>
            <div className={styles.widgetContent}>
              <div className={styles.labelItem}>
                <span className={styles.labelDot} style={{ background: '#ef4444' }}></span>
                <span>#긴급</span>
                <span className={styles.labelCount}>(3)</span>
              </div>
              <div className={styles.labelItem}>
                <span className={styles.labelDot} style={{ background: '#3b82f6' }}></span>
                <span>#알고리즘</span>
                <span className={styles.labelCount}>(8)</span>
              </div>
              <div className={styles.labelItem}>
                <span className={styles.labelDot} style={{ background: '#10b981' }}></span>
                <span>#문서</span>
                <span className={styles.labelCount}>(4)</span>
              </div>
              <div className={styles.labelItem}>
                <span className={styles.labelDot} style={{ background: '#f59e0b' }}></span>
                <span>#코드</span>
                <span className={styles.labelCount}>(6)</span>
              </div>
            </div>
          </div>

          {/* 빠른 액션 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>⚡ 빠른 액션</h3>
            <div className={styles.widgetActions}>
              <button className={styles.widgetButton}>+ 할일 추가</button>
              <button className={styles.widgetButton}>🔍 필터</button>
              <button className={styles.widgetButton}>📊 통계</button>
              <button className={styles.widgetButton}>⚙️ 설정</button>
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
