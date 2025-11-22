// 내 스터디 할일 관리 페이지
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import { useStudy, useStudyTasks, useCreateStudyTask, useUpdateStudyTask, useDeleteStudyTask } from '@/lib/hooks/useApi';
import { getStudyHeaderStyle } from '@/utils/studyColors';
import StudyTabs from '@/components/study/StudyTabs';

export default function MyStudyTasksPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const [viewType, setViewType] = useState('kanban'); // 'kanban' or 'list'
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: ''
  });

  // 현재 사용자
  const { data: session } = useSession();
  const currentUser = session?.user;

  // API Hooks
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
  const { data: tasksData, isLoading: tasksLoading } = useStudyTasks(studyId);
  const createTaskMutation = useCreateStudyTask();
  const updateTaskMutation = useUpdateStudyTask();
  const deleteTaskMutation = useDeleteStudyTask();

  const study = studyData?.data;
  const tasks = tasksData?.data || [];

  // 상태별로 할일 분류
  const tasksByStatus = {
    TODO: tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    REVIEW: tasks.filter(t => t.status === 'REVIEW'),
    DONE: tasks.filter(t => t.status === 'DONE')
  };

  const columns = [
    { id: 'TODO', title: '할 일', color: '#94a3b8', count: tasksByStatus.TODO.length },
    { id: 'IN_PROGRESS', title: '진행 중', color: '#3b82f6', count: tasksByStatus.IN_PROGRESS.length },
    { id: 'REVIEW', title: '검토', color: '#f59e0b', count: tasksByStatus.REVIEW.length },
    { id: 'DONE', title: '완료', color: '#10b981', count: tasksByStatus.DONE.length }
  ];

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleOpenDetailModal = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTask(null);
  };

  const handleEditFromDetail = () => {
    if (selectedTask) {
      handleOpenModal(selectedTask);
      setShowDetailModal(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('할일 제목을 입력해주세요.');
      return;
    }

    try {
      if (editingTask) {
        await updateTaskMutation.mutateAsync({
          studyId,
          taskId: editingTask.id,
          data: formData
        });
        alert('할일이 수정되었습니다.');
      } else {
        await createTaskMutation.mutateAsync({
          studyId,
          data: formData
        });
        alert('할일이 추가되었습니다.');
      }
      setShowModal(false);
      setEditingTask(null);
    } catch (error) {
      alert(`할일 ${editingTask ? '수정' : '추가'} 실패: ` + error.message);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTaskMutation.mutateAsync({
        studyId,
        taskId: task.id,
        data: { ...task, status: newStatus }
      });
    } catch (error) {
      alert('할일 상태 변경 실패: ' + error.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('할일을 삭제하시겠습니까?')) return;

    try {
      await deleteTaskMutation.mutateAsync({ studyId, taskId });
    } catch (error) {
      alert('할일 삭제 실패: ' + error.message);
    }
  };

  // 권한 확인
  const canEditTask = (task) => {
    if (!currentUser || !study) return false;
    const isAssignee = task.assignees?.some(a => a.id === currentUser.id);
    return task.createdById === currentUser.id || isAssignee || ['OWNER', 'ADMIN'].includes(study.myRole);
  };

  const canDeleteTask = (task) => {
    if (!currentUser || !study) return false;
    return task.createdById === currentUser.id || ['OWNER', 'ADMIN'].includes(study.myRole);
  };

  const getPriorityIcon = (priority) => {
    const icons = { HIGH: '🔴', MEDIUM: '🟡', LOW: '⚪' };
    return icons[priority] || '⚪';
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
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

        <div className={styles.studyHeader} style={getStudyHeaderStyle(studyId)}>
          <div className={styles.studyInfo}>
            <span className={styles.emoji}>{study.emoji}</span>
            <div>
              <h1 className={styles.studyName}>{study.name}</h1>
              <p className={styles.studyMeta}>
                👥 {study.currentMembers}/{study.maxMembers}명
              </p>
            </div>
          </div>
          <span className={`${styles.roleBadge} ${styles[study.myRole?.toLowerCase() || 'member']}`}>
            {study.myRole === 'OWNER' ? '👑' : study.myRole === 'ADMIN' ? '⭐' : '👤'} {study.myRole || 'MEMBER'}
          </span>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <StudyTabs studyId={studyId} activeTab="할일" userRole={study.myRole} />

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 할일 섹션 */}
        <div className={styles.taskSection}>
          {/* 헤더 */}
          <div className={styles.taskHeader}>
            <h2 className={styles.taskTitle}>✅ 할일</h2>
            <div className={styles.headerActions}>
              <div className={styles.viewTypeToggle}>
                <button
                  className={`${styles.viewTypeBtn} ${viewType === 'kanban' ? styles.active : ''}`}
                  onClick={() => setViewType('kanban')}
                >
                  📊 칸반보드
                </button>
                <button
                  className={`${styles.viewTypeBtn} ${viewType === 'list' ? styles.active : ''}`}
                  onClick={() => setViewType('list')}
                >
                  📋 리스트
                </button>
              </div>
              <button className={styles.addButton} onClick={() => handleOpenModal()}>
                + 할일 추가
              </button>
            </div>
          </div>

          {/* 칸반보드 뷰 */}
          {viewType === 'kanban' && (
            <div className={styles.kanbanView}>
              {tasksLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>할일 로딩 중...</div>
              ) : (
                <div className={styles.kanbanBoard}>
                  {columns.map((column) => (
                    <div key={column.id} className={styles.kanbanColumn}>
                      <div className={styles.columnHeader} style={{ borderTopColor: column.color }}>
                        <h3 className={styles.columnTitle}>
                          {column.title} ({column.count})
                        </h3>
                      </div>
                      <div className={styles.columnContent}>
                        {tasksByStatus[column.id].length === 0 ? (
                          <div className={styles.emptyColumn}>할일 없음</div>
                        ) : (
                          tasksByStatus[column.id].map((task) => (
                            <div
                              key={task.id}
                              className={styles.taskCard}
                              onClick={() => handleOpenDetailModal(task)}
                            >
                              <div className={styles.taskCardHeader}>
                                <span className={styles.priorityIcon}>{getPriorityIcon(task.priority)}</span>
                                <h4 className={styles.taskCardTitle}>{task.title}</h4>
                              </div>
                              {task.description && (
                                <p className={styles.taskCardDesc}>{task.description}</p>
                              )}
                              {task.dueDate && (
                                <div className={styles.taskCardDue}>
                                  📅 {formatDate(task.dueDate)}
                                </div>
                              )}
                              <div className={styles.taskCardFooter}>
                                <div className={styles.taskActions}>
                                  {canEditTask(task) && (
                                    <button
                                      className={styles.taskActionBtn}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenModal(task);
                                      }}
                                      title="수정"
                                    >
                                      ✏️
                                    </button>
                                  )}
                                  {canDeleteTask(task) && (
                                    <button
                                      className={styles.taskActionBtn}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id);
                                      }}
                                      title="삭제"
                                    >
                                      🗑️
                                    </button>
                                  )}
                                </div>
                              </div>
                              {column.id !== 'DONE' && canEditTask(task) && (
                                <div className={styles.statusActions}>
                                  {column.id === 'TODO' && (
                                    <button
                                      className={styles.statusBtn}
                                      onClick={() => handleStatusChange(task, 'IN_PROGRESS')}
                                    >
                                      → 진행 중
                                    </button>
                                  )}
                                  {column.id === 'IN_PROGRESS' && (
                                    <button
                                      className={styles.statusBtn}
                                      onClick={() => handleStatusChange(task, 'REVIEW')}
                                    >
                                      → 검토
                                    </button>
                                  )}
                                  {column.id === 'REVIEW' && (
                                    <button
                                      className={styles.statusBtn}
                                      onClick={() => handleStatusChange(task, 'DONE')}
                                    >
                                      → 완료
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 리스트 뷰 */}
          {viewType === 'list' && (
            <div className={styles.listView}>
              {tasksLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>할일 로딩 중...</div>
              ) : tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  등록된 할일이 없습니다. 할일을 추가해보세요! ✅
                </div>
              ) : (
                <div className={styles.tasksList}>
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={styles.taskListItem}
                      onClick={() => handleOpenDetailModal(task)}
                    >
                      <div className={styles.taskListItemHeader}>
                        <div className={styles.taskListItemInfo}>
                          <span className={styles.priorityIcon}>{getPriorityIcon(task.priority)}</span>
                          <h4 className={styles.taskListItemTitle}>{task.title}</h4>
                          <span className={`${styles.statusBadge} ${styles[task.status.toLowerCase()]}`}>
                            {columns.find(c => c.id === task.status)?.title}
                          </span>
                        </div>
                        <div className={styles.taskListItemActions}>
                          {canEditTask(task) && (
                            <button
                              className={styles.editButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(task);
                              }}
                            >
                              수정
                            </button>
                          )}
                          {canDeleteTask(task) && (
                            <button
                              className={styles.deleteButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </div>
                      {task.description && (
                        <p className={styles.taskListItemDesc}>{task.description}</p>
                      )}
                      <div className={styles.taskListItemFooter}>
                        {task.dueDate && (
                          <div className={styles.taskListItemDue}>
                            📅 마감: {formatDate(task.dueDate)}
                          </div>
                        )}
                        <div className={styles.taskCreator}>
                          작성자: {task.createdBy?.name || '알 수 없음'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 우측 위젯 */}
        <aside className={styles.sidebar}>
          {/* 진행 현황 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 진행 현황</h3>
            <div className={styles.widgetContent}>
              {columns.map((column) => (
                <div key={column.id} className={styles.statRow}>
                  <span>{column.title}:</span>
                  <span className={styles.statValue}>{column.count}개</span>
                </div>
              ))}
            </div>
          </div>

          {/* 마감 임박 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>⚠️ 마감 임박</h3>
            <div className={styles.widgetContent}>
              {tasks
                .filter(t => t.dueDate && t.status !== 'DONE')
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 5)
                .map((task) => (
                  <div key={task.id} className={styles.urgentTask}>
                    <div className={styles.urgentTaskTitle}>{task.title}</div>
                    <div className={styles.urgentTaskDue}>📅 {formatDate(task.dueDate)}</div>
                  </div>
                ))}
              {tasks.filter(t => t.dueDate && t.status !== 'DONE').length === 0 && (
                <p className={styles.widgetText}>마감 임박한 할일이 없습니다.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* 할일 추가/수정 모달 */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingTask ? '✏️ 할일 수정' : '➕ 할일 추가'}
              </h2>
              <button className={styles.modalClose} onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  할일 제목 <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="예: 프로젝트 기획서 작성"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>설명</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  placeholder="할일에 대한 자세한 설명을 입력하세요"
                  rows={4}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>상태</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    {columns.map((column) => (
                      <option key={column.id} value={column.id}>
                        {column.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>우선순위</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    <option value="LOW">낮음</option>
                    <option value="MEDIUM">보통</option>
                    <option value="HIGH">높음</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>마감일</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCloseModal}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                >
                  {createTaskMutation.isPending || updateTaskMutation.isPending
                    ? '처리 중...'
                    : editingTask
                    ? '수정하기'
                    : '추가하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 할일 상세보기 모달 */}
      {showDetailModal && selectedTask && (
        <div className={styles.modalOverlay} onClick={handleCloseDetailModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>✅ 할일 상세</h2>
              <button className={styles.modalClose} onClick={handleCloseDetailModal}>
                ✕
              </button>
            </div>

            <div className={styles.detailContent}>
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>제목</div>
                <div className={styles.detailValue}>{selectedTask.title}</div>
              </div>

              {selectedTask.description && (
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>설명</div>
                  <div className={styles.detailValue} style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedTask.description}
                  </div>
                </div>
              )}

              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>상태</div>
                <div className={styles.detailValue}>
                  <span className={`${styles.statusBadge} ${styles[selectedTask.status.toLowerCase()]}`}>
                    {columns.find(c => c.id === selectedTask.status)?.title}
                  </span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>우선순위</div>
                <div className={styles.detailValue}>
                  {getPriorityIcon(selectedTask.priority)} {' '}
                  {selectedTask.priority === 'HIGH' ? '높음' :
                   selectedTask.priority === 'MEDIUM' ? '보통' : '낮음'}
                </div>
              </div>

              {selectedTask.dueDate && (
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>마감일</div>
                  <div className={styles.detailValue}>
                    📅 {new Date(selectedTask.dueDate).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              )}

              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>작성자</div>
                <div className={styles.detailValue}>
                  {selectedTask.createdBy?.name || '알 수 없음'}
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>생성일</div>
                <div className={styles.detailValue}>
                  {new Date(selectedTask.createdAt).toLocaleString('ko-KR')}
                </div>
              </div>

              {selectedTask.updatedAt && selectedTask.updatedAt !== selectedTask.createdAt && (
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>수정일</div>
                  <div className={styles.detailValue}>
                    {new Date(selectedTask.updatedAt).toLocaleString('ko-KR')}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.detailActions}>
              {canEditTask(selectedTask) && (
                <button
                  className={styles.detailEditButton}
                  onClick={handleEditFromDetail}
                >
                  ✏️ 수정
                </button>
              )}
              {canDeleteTask(selectedTask) && (
                <button
                  className={styles.detailDeleteButton}
                  onClick={() => {
                    handleCloseDetailModal();
                    handleDeleteTask(selectedTask.id);
                  }}
                >
                  🗑️ 삭제
                </button>
              )}
              <button
                className={styles.detailCloseButton}
                onClick={handleCloseDetailModal}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

