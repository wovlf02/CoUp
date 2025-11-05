'use client'

import { useState, useEffect } from 'react'
import styles from './NoticeCreateEditModal.module.css'
import { createNotice, updateNotice } from '@/mocks/notices'

export default function NoticeCreateEditModal({ studyId, notice, onClose, onSuccess }) {
  const isEditMode = !!notice

  const [formData, setFormData] = useState({
    title: notice?.title || '',
    content: notice?.content || '',
    isPinned: notice?.isPinned || false
  })
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()

    // 유효성 검사
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요'
    } else if (formData.title.length > 100) {
      newErrors.title = '제목은 100자 이내로 입력해주세요'
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // 공지사항 생성/수정
    if (isEditMode) {
      const updated = updateNotice(notice.id, formData)
      alert('공지사항이 수정되었습니다!')
      onSuccess(updated)
    } else {
      const newNotice = createNotice(studyId, formData)
      alert('공지사항이 작성되었습니다!')
      onSuccess(newNotice)
    }

    onClose()
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEditMode ? '공지사항 수정' : '공지사항 작성'}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 제목 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              제목 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.input} ${errors.title ? styles.error : ''}`}
              placeholder="공지사항 제목을 입력하세요"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              maxLength={100}
            />
            {errors.title && (
              <span className={styles.errorMessage}>{errors.title}</span>
            )}
            <span className={styles.charCount}>
              {formData.title.length} / 100
            </span>
          </div>

          {/* 내용 */}
          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label className={styles.label}>
                내용 <span className={styles.required}>*</span>
                <span className={styles.hint}>(Markdown 지원)</span>
              </label>
              <div className={styles.tabs}>
                <button
                  type="button"
                  className={`${styles.tab} ${!showPreview ? styles.active : ''}`}
                  onClick={() => setShowPreview(false)}
                >
                  작성
                </button>
                <button
                  type="button"
                  className={`${styles.tab} ${showPreview ? styles.active : ''}`}
                  onClick={() => setShowPreview(true)}
                >
                  미리보기
                </button>
              </div>
            </div>

            {!showPreview ? (
              <textarea
                className={`${styles.textarea} ${errors.content ? styles.error : ''}`}
                placeholder="공지사항 내용을 입력하세요&#10;&#10;Markdown 문법을 사용할 수 있습니다:&#10;- # 제목&#10;- **굵게**&#10;- [링크](URL)&#10;- ```코드```"
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={12}
              />
            ) : (
              <div className={styles.preview}>
                {formData.content ? (
                  <div dangerouslySetInnerHTML={{
                    __html: formData.content
                      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                      .replace(/\*(.*)\*/gim, '<em>$1</em>')
                      .replace(/\n/gim, '<br />')
                  }} />
                ) : (
                  <div className={styles.previewEmpty}>
                    내용을 입력하면 미리보기가 표시됩니다
                  </div>
                )}
              </div>
            )}
            {errors.content && (
              <span className={styles.errorMessage}>{errors.content}</span>
            )}
          </div>

          {/* 상단 고정 */}
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => handleChange('isPinned', e.target.checked)}
              />
              <span>상단 고정</span>
            </label>
          </div>

          {/* 버튼 */}
          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              취소
            </button>
            <button type="submit" className={styles.submitButton}>
              {isEditMode ? '수정하기' : '작성하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

