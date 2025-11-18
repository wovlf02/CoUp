'use client'

import { useState } from 'react'
import { useMyStudies, useCreateTask } from '@/lib/hooks/useApi'
import styles from './TaskCreateModal.module.css'

export default function TaskCreateModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    studyId: '',
    dueDate: '',
    priority: 'MEDIUM',
  })

  const { data: studiesData } = useMyStudies({ limit: 50 })
  const createTask = useCreateTask()
  const studies = studiesData?.data || []

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요')
      return
    }

    if (!formData.studyId) {
      alert('스터디를 선택해주세요')
      return
    }

    if (!formData.dueDate) {
      alert('마감일을 선택해주세요')
      return
    }

    try {
      await createTask.mutateAsync({
        title: formData.title,
        description: formData.description || null,
        studyId: formData.studyId,
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: 'TODO',
      })

      alert('할 일이 추가되었습니다!')
      onSuccess()
    } catch (error) {
      console.error('할일 생성 실패:', error)
      alert('할 일 추가에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>할 일 추가</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.label}>제목 *</label>
            <input
              type="text"
              className={styles.input}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="할 일 제목을 입력하세요"
              maxLength={100}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>스터디 *</label>
            <select
              className={styles.select}
              value={formData.studyId}
              onChange={(e) => setFormData({ ...formData, studyId: e.target.value })}
            >
              <option value="">스터디 선택</option>
              {studies.map(study => (
                <option key={study.id} value={study.id}>
                  {study.emoji} {study.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>우선순위 *</label>
            <select
              className={styles.select}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="LOW">낮음</option>
              <option value="MEDIUM">보통</option>
              <option value="HIGH">높음</option>
              <option value="URGENT">긴급</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>마감일 *</label>
            <input
              type="datetime-local"
              className={styles.input}
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>설명 (선택)</label>
            <textarea
              className={styles.textarea}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="할 일에 대한 상세 설명을 입력하세요"
              rows={4}
              maxLength={500}
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              취소
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={createTask.isPending}
            >
              {createTask.isPending ? '추가 중...' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
