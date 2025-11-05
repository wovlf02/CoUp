'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/styles/studies/create.module.css'

export default function StudyCreatePage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    mainCategory: '',
    subCategory: '',
    description: '',
    tags: [],
    maxMembers: 10,
    visibility: 'PUBLIC',
    autoApprove: true
  })

  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mainCategories = [
    { value: '', label: '선택하세요' },
    { value: 'programming', label: '프로그래밍' },
    { value: 'job', label: '취업준비' },
    { value: 'certificate', label: '자격증' },
    { value: 'language', label: '어학' },
    { value: 'fitness', label: '운동' },
    { value: 'reading', label: '독서' },
    { value: 'etc', label: '기타' }
  ]

  const subCategories = {
    programming: [
      { value: '', label: '선택하세요' },
      { value: 'web', label: '웹 개발' },
      { value: 'app', label: '앱 개발' },
      { value: 'algorithm', label: '알고리즘/코테' },
      { value: 'ai', label: 'AI/ML' },
      { value: 'game', label: '게임 개발' }
    ],
    job: [
      { value: '', label: '선택하세요' },
      { value: 'resume', label: '자소서' },
      { value: 'interview', label: '면접' },
      { value: 'portfolio', label: '포트폴리오' }
    ],
    language: [
      { value: '', label: '선택하세요' },
      { value: 'english', label: '영어' },
      { value: 'japanese', label: '일본어' },
      { value: 'chinese', label: '중국어' }
    ]
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 5) {
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }))
        setTagInput('')
      }
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleMemberCountChange = (delta) => {
    setFormData(prev => ({
      ...prev,
      maxMembers: Math.max(2, Math.min(50, prev.maxMembers + delta))
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (formData.name.length < 2) {
      newErrors.name = '2자 이상 입력해주세요'
    } else if (formData.name.length > 50) {
      newErrors.name = '50자를 초과할 수 없습니다'
    }

    if (!formData.mainCategory) {
      newErrors.mainCategory = '카테고리를 선택해주세요'
    }

    if (formData.description.length < 10) {
      newErrors.description = '10자 이상 입력해주세요'
    } else if (formData.description.length > 500) {
      newErrors.description = '500자를 초과할 수 없습니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      alert('스터디가 생성되었습니다!')
      router.push('/studies')
    } catch (error) {
      alert('스터디 생성에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (formData.name || formData.description) {
      if (confirm('작성 중인 내용이 사라집니다. 계속하시겠습니까?')) {
        router.back()
      }
    } else {
      router.back()
    }
  }

  return (
    <div className={styles.container}>
      <button onClick={handleCancel} className={styles.backButton}>
        ← 뒤로가기
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>새 스터디 만들기</h1>
        <p className={styles.subtitle}>함께 성장할 멤버를 모집하세요</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. 기본 정보</h2>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              스터디 이름 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              placeholder="예: 코딩테스트 마스터 스터디"
              maxLength={50}
            />
            <div className={styles.charCount}>
              {formData.name.length}/50자
            </div>
            {errors.name && <p className={styles.errorMessage}>{errors.name}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              카테고리 <span className={styles.required}>*</span>
            </label>
            <div className={styles.categoryRow}>
              <select
                name="mainCategory"
                value={formData.mainCategory}
                onChange={handleInputChange}
                className={`${styles.select} ${errors.mainCategory ? styles.inputError : ''}`}
              >
                {mainCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              {formData.mainCategory && subCategories[formData.mainCategory] && (
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  {subCategories[formData.mainCategory].map(sub => (
                    <option key={sub.value} value={sub.value}>{sub.label}</option>
                  ))}
                </select>
              )}
            </div>
            {errors.mainCategory && <p className={styles.errorMessage}>{errors.mainCategory}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              스터디 소개 <span className={styles.required}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
              placeholder="스터디에 대해 자세히 설명해주세요"
              rows={6}
              maxLength={500}
            />
            <div className={styles.charCount}>
              {formData.description.length}/500자
            </div>
            {errors.description && <p className={styles.errorMessage}>{errors.description}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>태그 (선택)</label>
            <div className={styles.tagContainer}>
              {formData.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className={styles.tagRemove}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {formData.tags.length < 5 && (
              <div className={styles.tagInputGroup}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className={styles.input}
                  placeholder="태그를 입력하고 Enter"
                />
              </div>
            )}
            <p className={styles.helpText}>최대 5개</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. 모집 설정</h2>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              모집 인원 <span className={styles.required}>*</span>
            </label>
            <div className={styles.numberInputGroup}>
              <button
                type="button"
                onClick={() => handleMemberCountChange(-1)}
                className={styles.numberButton}
                disabled={formData.maxMembers <= 2}
              >
                -
              </button>
              <span className={styles.numberDisplay}>{formData.maxMembers}</span>
              <button
                type="button"
                onClick={() => handleMemberCountChange(1)}
                className={styles.numberButton}
                disabled={formData.maxMembers >= 50}
              >
                +
              </button>
              <span className={styles.numberUnit}>명</span>
            </div>
            <p className={styles.helpText}>최소 2명, 최대 50명</p>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              공개 설정 <span className={styles.required}>*</span>
            </label>
            <div className={styles.radioGroup}>
              <label className={`${styles.radioItem} ${formData.visibility === 'PUBLIC' ? styles.radioSelected : ''}`}>
                <input
                  type="radio"
                  name="visibility"
                  value="PUBLIC"
                  checked={formData.visibility === 'PUBLIC'}
                  onChange={handleInputChange}
                  className={styles.radioInput}
                />
                <div>
                  <div className={styles.radioTitle}>전체 공개</div>
                  <div className={styles.radioDesc}>누구나 검색하고 가입할 수 있습니다</div>
                </div>
              </label>

              <label className={`${styles.radioItem} ${formData.visibility === 'PRIVATE' ? styles.radioSelected : ''}`}>
                <input
                  type="radio"
                  name="visibility"
                  value="PRIVATE"
                  checked={formData.visibility === 'PRIVATE'}
                  onChange={handleInputChange}
                  className={styles.radioInput}
                />
                <div>
                  <div className={styles.radioTitle}>비공개</div>
                  <div className={styles.radioDesc}>초대받은 사람만 가입할 수 있습니다</div>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.autoApprove}
                onChange={(e) => setFormData(prev => ({ ...prev, autoApprove: e.target.checked }))}
                className={styles.checkbox}
              />
              <span>가입 신청 시 자동으로 승인</span>
            </label>
            <p className={styles.helpText}>체크 해제 시 그룹장이 수동 승인</p>
          </div>
        </section>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleCancel}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? '생성 중...' : '스터디 만들기'}
          </button>
        </div>
      </form>
    </div>
  )
}
