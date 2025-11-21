// 프로필 편집 컴포넌트
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './ProfileEdit.module.css';

export default function ProfileEdit({ user }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    major: user?.major || '',
    interests: user?.interests || []
  });
  const [avatar, setAvatar] = useState(user?.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    // 파일 타입 체크
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('JPG, PNG, WebP 파일만 업로드 가능합니다.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('업로드 실패');

      const data = await response.json();
      setAvatar(data.url);
      alert('프로필 사진이 변경되었습니다.');
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('프로필 사진 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddInterest = () => {
    const interest = prompt('관심 분야를 입력하세요:');
    if (interest && interest.trim()) {
      if (formData.interests.length >= 5) {
        alert('관심 분야는 최대 5개까지 추가할 수 있습니다.');
        return;
      }
      setFormData({
        ...formData,
        interests: [...formData.interests, interest.trim()]
      });
    }
  };

  const handleRemoveInterest = (index) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/user/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('저장 실패');

      alert('프로필이 저장되었습니다.');
      window.location.reload();
    } catch (error) {
      console.error('Save error:', error);
      alert('프로필 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>👤 프로필 편집</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 프로필 사진 */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            {avatar ? (
              <Image
                src={avatar}
                alt="프로필 사진"
                width={120}
                height={120}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user?.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={styles.avatarButton}
          >
            {isUploading ? '업로드 중...' : '📷 사진 변경'}
          </button>
        </div>

        {/* 이름 */}
        <div className={styles.field}>
          <label className={styles.label}>이름</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={styles.input}
            required
          />
        </div>

        {/* 이메일 (읽기 전용) */}
        <div className={styles.field}>
          <label className={styles.label}>이메일 (변경 불가)</label>
          <input
            type="email"
            value={user?.email || ''}
            className={`${styles.input} ${styles.inputReadonly}`}
            readOnly
            disabled
          />
        </div>

        {/* 소개 */}
        <div className={styles.field}>
          <label className={styles.label}>소개</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className={styles.textarea}
            rows={4}
            placeholder="자신을 소개해주세요..."
          />
        </div>

        {/* 전공/분야 */}
        <div className={styles.field}>
          <label className={styles.label}>전공/분야</label>
          <select
            value={formData.major}
            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
            className={styles.select}
          >
            <option value="">선택하세요</option>
            <option value="컴퓨터공학">컴퓨터공학</option>
            <option value="소프트웨어공학">소프트웨어공학</option>
            <option value="정보통신공학">정보통신공학</option>
            <option value="전자공학">전자공학</option>
            <option value="산업디자인">산업디자인</option>
            <option value="경영학">경영학</option>
            <option value="기타">기타</option>
          </select>
        </div>

        {/* 관심 분야 */}
        <div className={styles.field}>
          <label className={styles.label}>관심 분야 (최대 5개)</label>
          <div className={styles.interests}>
            {formData.interests.map((interest, index) => (
              <div key={index} className={styles.interestTag}>
                # {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(index)}
                  className={styles.interestRemove}
                >
                  ✕
                </button>
              </div>
            ))}
            {formData.interests.length < 5 && (
              <button
                type="button"
                onClick={handleAddInterest}
                className={styles.interestAdd}
              >
                + 추가
              </button>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => window.history.back()}
            className={styles.cancelButton}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={styles.saveButton}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}

