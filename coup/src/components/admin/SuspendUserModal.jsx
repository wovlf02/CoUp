'use client'

import { useState } from 'react'
import Modal from './Modal'
import styles from './Modal.module.css'

export default function SuspendUserModal({ user, isOpen, onClose, onConfirm }) {
  const [duration, setDuration] = useState('7_DAYS')
  const [reason, setReason] = useState('SPAM')
  const [details, setDetails] = useState('')
  const [notifyUser, setNotifyUser] = useState(true)

  const handleSubmit = () => {
    if (!details.trim()) {
      alert('상세 사유를 입력해주세요.')
      return
    }

    onConfirm({
      userId: user.id,
      duration,
      reason,
      details,
      notifyUser
    })

    // Reset
    setDuration('7_DAYS')
    setReason('SPAM')
    setDetails('')
    setNotifyUser(true)
  }

  if (!user) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚠️ 계정 정지"
      footer={
        <>
          <button
            className={`${styles.button} ${styles.buttonCancel}`}
            onClick={onClose}
          >
            취소
          </button>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={handleSubmit}
          >
            정지하기
          </button>
        </>
      }
    >
      <div className={styles.infoRow}>
        <div className={styles.infoLabel}>사용자</div>
        <div className={styles.infoValue}>
          {user.name} ({user.email})
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>정지 기간</label>
        <div className={styles.radioGroup}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="duration"
              value="7_DAYS"
              checked={duration === '7_DAYS'}
              onChange={(e) => setDuration(e.target.value)}
            />
            <span>7일</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="duration"
              value="30_DAYS"
              checked={duration === '30_DAYS'}
              onChange={(e) => setDuration(e.target.value)}
            />
            <span>30일</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="duration"
              value="PERMANENT"
              checked={duration === 'PERMANENT'}
              onChange={(e) => setDuration(e.target.value)}
            />
            <span>영구</span>
          </label>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>정지 사유 (필수)</label>
        <select
          className={styles.select}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="SPAM">스팸/광고 행위</option>
          <option value="HARASSMENT">욕설/비방</option>
          <option value="INAPPROPRIATE">부적절한 콘텐츠</option>
          <option value="COPYRIGHT">저작권 침해</option>
          <option value="TOS_VIOLATION">이용 약관 위반</option>
          <option value="OTHER">기타</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>상세 사유</label>
        <textarea
          className={styles.textarea}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="정지 사유를 상세히 입력해주세요..."
        />
      </div>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={notifyUser}
          onChange={(e) => setNotifyUser(e.target.checked)}
        />
        <span>사용자에게 이메일로 통보</span>
      </label>

      <div className={styles.dangerZone}>
        <div className={styles.dangerTitle}>⚠️ 주의사항</div>
        <div className={styles.dangerText}>
          정지 시 사용자는 로그인할 수 없으며, 모든 스터디에서 강퇴됩니다.
        </div>
      </div>
    </Modal>
  )
}

