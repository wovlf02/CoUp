'use client'

import { useState } from 'react'
import Modal from './Modal'
import styles from './Modal.module.css'

export default function UserDetailModal({ user, isOpen, onClose, onSuspend, onDelete }) {
  if (!user) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    return `${Math.floor(diffInHours / 24)}일 전`
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="사용자 상세 정보"
      size="large"
      footer={
        <>
          <button
            className={`${styles.button} ${styles.buttonCancel}`}
            onClick={onClose}
          >
            닫기
          </button>
          <button
            className={`${styles.button} ${styles.buttonSuccess}`}
            onClick={() => alert('이메일 발송 기능')}
          >
            📧 이메일 발송
          </button>
          {user.status === 'ACTIVE' ? (
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={() => onSuspend(user)}
            >
              ⚠️ 계정 정지
            </button>
          ) : (
            <button
              className={`${styles.button} ${styles.buttonSuccess}`}
              onClick={() => alert('정지 해제')}
            >
              ✅ 정지 해제
            </button>
          )}
        </>
      }
    >
      <div className={styles.userDetailGrid}>
        {/* Left: Profile */}
        <div className={styles.userProfileSection}>
          <div className={styles.userAvatar}>
            {user.name.charAt(0)}
          </div>
          <div>
            <span className={`${styles.userStatusBadge} ${user.status === 'ACTIVE' ? styles.active : styles.suspended}`}>
              {user.status === 'ACTIVE' ? '활성' : '정지'}
            </span>
          </div>
          <div className={styles.userProvider}>
            {user.provider === 'GOOGLE' && '🔵 Google 계정'}
            {user.provider === 'GITHUB' && '🐙 GitHub 계정'}
            {user.provider === 'EMAIL' && '📧 Email 계정'}
          </div>
        </div>

        {/* Right: Info */}
        <div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>ID</div>
            <div className={styles.infoValue}>{user.id}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>이름</div>
            <div className={styles.infoValue}>{user.name}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>이메일</div>
            <div className={styles.infoValue}>{user.email}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>가입 방법</div>
            <div className={styles.infoValue}>{user.provider}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>가입일</div>
            <div className={styles.infoValue}>{formatDate(user.createdAt)}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>마지막 로그인</div>
            <div className={styles.infoValue}>{formatTimeAgo(user.lastLoginAt)}</div>
          </div>
        </div>
      </div>

      <div className={styles.statsSection}>
        <h3 className={styles.statsTitle}>활동 통계</h3>
        <div className={styles.statsGrid}>
          <div>
            <div className={styles.infoLabel}>참여 스터디</div>
            <div className={styles.infoValue}>{user.studyCount}개</div>
          </div>
          <div>
            <div className={styles.infoLabel}>보낸 메시지</div>
            <div className={styles.infoValue}>{user.messageCount}개</div>
          </div>
          <div>
            <div className={styles.infoLabel}>역할</div>
            <div className={styles.infoValue}>{user.role}</div>
          </div>
        </div>
      </div>

      {user.status === 'SUSPENDED' && (
        <div className={styles.dangerZone}>
          <div className={styles.dangerTitle}>⚠️ 계정 정지됨</div>
          <div className={styles.dangerText}>
            이 사용자는 현재 계정이 정지된 상태입니다.
          </div>
        </div>
      )}
    </Modal>
  )
}

