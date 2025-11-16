// 스터디 생성 페이지
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { studyCategories } from '@/mocks/studySettings';

export default function StudyCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    emoji: '💻',
    category: '',
    subCategory: '',
    description: '',
    tags: [],
    maxMembers: 20,
    isPublic: true,
    approvalType: 'auto', // auto | manual
    activityFrequency: '',
    location: 'online',
  });

  const categories = studyCategories;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: API 호출
    console.log('스터디 생성:', formData);
    router.push('/studies');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← 뒤로가기
        </button>
        <h1 className={styles.title}>✨ 새 스터디 만들기</h1>
        <p className={styles.subtitle}>
          함께 성장할 멤버들을 모집해보세요
        </p>
      </div>

      {/* 진행 단계 표시 */}
      <div className={styles.steps}>
        <div className={`${styles.stepItem} ${step >= 1 ? styles.active : ''}`}>
          <div className={styles.stepNumber}>1</div>
          <span className={styles.stepLabel}>기본 정보</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={`${styles.stepItem} ${step >= 2 ? styles.active : ''}`}>
          <div className={styles.stepNumber}>2</div>
          <span className={styles.stepLabel}>상세 설정</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={`${styles.stepItem} ${step >= 3 ? styles.active : ''}`}>
          <div className={styles.stepNumber}>3</div>
          <span className={styles.stepLabel}>모집 설정</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Step 1: 기본 정보 */}
        {step === 1 && (
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>기본 정보</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                스터디 이모지 <span className={styles.required}>*</span>
              </label>
              <div className={styles.emojiPicker}>
                {['💻', '📚', '🎨', '🌏', '🏃', '💼', '🎯', '🚀'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`${styles.emojiButton} ${
                      formData.emoji === emoji ? styles.selected : ''
                    }`}
                    onClick={() => setFormData({ ...formData, emoji })}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                스터디 이름 <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                placeholder="예: 알고리즘 마스터 스터디"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={styles.input}
                required
              />
              <span className={styles.hint}>2-50자 사이로 입력해주세요</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                카테고리 <span className={styles.required}>*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value, subCategory: '' })
                }
                className={styles.select}
                required
              >
                <option value="">카테고리 선택</option>
                {Object.keys(categories).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {formData.category && (
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  세부 카테고리 <span className={styles.required}>*</span>
                </label>
                <select
                  value={formData.subCategory}
                  onChange={(e) =>
                    setFormData({ ...formData, subCategory: e.target.value })
                  }
                  className={styles.select}
                  required
                >
                  <option value="">세부 카테고리 선택</option>
                  {categories[formData.category].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={styles.nextButton}
                disabled={!formData.name || !formData.category || !formData.subCategory}
              >
                다음 단계 →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 상세 설정 */}
        {step === 2 && (
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>상세 설정</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                스터디 소개 <span className={styles.required}>*</span>
              </label>
              <textarea
                placeholder="스터디에 대해 자세히 설명해주세요"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={styles.textarea}
                rows={5}
                required
              />
              <span className={styles.hint}>
                {formData.description.length}/500자
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>태그 (최대 5개)</label>
              <input
                type="text"
                placeholder="엔터로 태그 추가"
                className={styles.input}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const tag = e.target.value.trim();
                    if (tag && formData.tags.length < 5 && !formData.tags.includes(tag)) {
                      setFormData({ ...formData, tags: [...formData.tags, tag] });
                      e.target.value = '';
                    }
                  }
                }}
              />
              <div className={styles.tags}>
                {formData.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    #{tag}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          tags: formData.tags.filter((t) => t !== tag),
                        })
                      }
                      className={styles.tagRemove}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>활동 빈도</label>
              <select
                value={formData.activityFrequency}
                onChange={(e) =>
                  setFormData({ ...formData, activityFrequency: e.target.value })
                }
                className={styles.select}
              >
                <option value="">선택 안함</option>
                <option value="매일">매일</option>
                <option value="주 3-4회">주 3-4회</option>
                <option value="주 1-2회">주 1-2회</option>
                <option value="자유">자유</option>
              </select>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className={styles.prevButton}
              >
                ← 이전
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className={styles.nextButton}
                disabled={!formData.description}
              >
                다음 단계 →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 모집 설정 */}
        {step === 3 && (
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>모집 설정</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                모집 인원 <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                min="2"
                max="100"
                value={formData.maxMembers}
                onChange={(e) =>
                  setFormData({ ...formData, maxMembers: parseInt(e.target.value) })
                }
                className={styles.input}
                required
              />
              <span className={styles.hint}>2-100명 사이로 설정해주세요</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>공개 설정</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={() => setFormData({ ...formData, isPublic: true })}
                  />
                  <span>전체 공개 - 누구나 검색하고 가입 신청 가능</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="isPublic"
                    checked={!formData.isPublic}
                    onChange={() => setFormData({ ...formData, isPublic: false })}
                  />
                  <span>비공개 - 초대받은 사람만 가입 가능</span>
                </label>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>가입 승인 방식</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="approvalType"
                    checked={formData.approvalType === 'auto'}
                    onChange={() => setFormData({ ...formData, approvalType: 'auto' })}
                  />
                  <span>자동 승인 - 신청 즉시 멤버로 가입</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="approvalType"
                    checked={formData.approvalType === 'manual'}
                    onChange={() => setFormData({ ...formData, approvalType: 'manual' })}
                  />
                  <span>수동 승인 - 관리자가 직접 승인</span>
                </label>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={styles.prevButton}
              >
                ← 이전
              </button>
              <button type="submit" className={styles.submitButton}>
                🎉 스터디 만들기
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
