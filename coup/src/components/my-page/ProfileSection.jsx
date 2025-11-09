'use client'

import Image from 'next/image'
import { useState } from 'react'
import { formatDate } from '@/utils/time'
import { getInitials } from '@/utils/format'
import styles from './ProfileSection.module.css'

export default function ProfileSection({ user, onUpdate }) {
  const [uploading, setUploading] = useState(false)

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다')
      return
    }

    setUploading(true)

    // Mock: 로컬 URL 생성
    try {
      const imageUrl = URL.createObjectURL(file)
      setTimeout(() => {
        onUpdate({ imageUrl })
        setUploading(false)
        alert('프로필 이미지가 변경되었습니다!')
      }, 1000)
    } catch (error) {
      alert('이미지 업로드에 실패했습니다')
      setUploading(false)
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeader}>1. 프로필</h2>

      <div className={styles.profileContent}>
        <div className={styles.profileImageWrapper}>
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.name}
              width={128}
              height={128}
              className={styles.profileImage}
            />
          ) : (
            <div className={styles.profileImagePlaceholder}>
              {getInitials(user.name)}
            </div>
          )}
        </div>

        <h3 className={styles.profileName}>{user.name}</h3>
        <p className={styles.profileEmail}>{user.email}</p>

        <label className={styles.changeImageButton}>
          {uploading ? '업로드 중...' : '프로필 이미지 변경'}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>

        <p className={styles.profileInfo}>
          {user.provider === 'GOOGLE' ? 'Google 계정으로 가입' : '이메일로 가입'} ·
          가입일: {formatDate(user.createdAt)}
        </p>
      </div>
    </section>
  )
}
