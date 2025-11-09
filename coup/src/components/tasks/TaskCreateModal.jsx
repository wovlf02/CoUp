import { useState } from 'react'
import styles from './TaskCreateModal.module.css'

export default function TaskCreateModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    studyId: '',
    dueDate: '',
  })

  const handleSubmit = (e) => {
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

    const newTask = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      studyId: parseInt(formData.studyId),
      studyName: formData.studyId === '1' ? '알고리즘 마스터 스터디' : '취업 준비 스터디',
      studyEmoji: formData.studyId === '1' ? '💻' : '📝',
      dueDate: formData.dueDate,
      createdAt: new Date().toISOString(),
      completed: false,
      completedAt: null,
      completedCount: 0,
      totalCount: 1,
      attachments: [],
      comments: [],
    }

    onCreate(newTask)
    alert('할 일이 추가되었습니다!')
    onClose()
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
              <option value="1">💻 알고리즘 마스터 스터디</option>
              <option value="2">📝 취업 준비 스터디</option>
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
            <button type="submit" className={styles.submitButton}>
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

