'use client'

import { useState, useEffect } from 'react'
import styles from './ProfileEditForm.module.css'

export default function ProfileEditForm({ user, onUpdate }) {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || ''
  })
  const [isEdited, setIsEdited] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFormData({
      name: user.name,
      bio: user.bio || ''
    })
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setIsEdited(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 검증
    if (formData.name.length < 2 || formData.name.length > 50) {
      alert('이름은 2-50자여야 합니다')
      return
    }

    if (formData.bio && formData.bio.length > 200) {
      alert('자기소개는 200자 이하여야 합니다')
      return
    }

    setSaving(true)

    // Mock API 호출 (1초 지연)
    setTimeout(() => {
      onUpdate(formData)
      setSaving(false)
      setIsEdited(false)
      alert('정보가 수정되었습니다!')
    }, 1000)
  }

  const bioLength = formData.bio.length

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeader}>2. 내 정보</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            이름 <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            minLength={2}
            maxLength={50}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            자기소개 <span className={styles.optional}>(선택)</span>
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className={styles.textarea}
            maxLength={200}
            rows={4}
            placeholder="자신을 소개해주세요..."
          />
          <div className={styles.charCount}>
            {bioLength}/200자
          </div>
        </div>

        <div className={styles.buttonWrapper}>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={!isEdited || saving}
          >
            {saving ? '저장 중...' : '변경사항 저장'}
          </button>
        </div>
      </form>
    </section>
  )
}

