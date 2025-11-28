'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/admin/ui/Button'
import Modal from '@/components/admin/ui/Modal'
import styles from './UserActions.module.css'

export default function UserActions({ user }) {
  const router = useRouter()
  const [showWarnModal, setShowWarnModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const canWarn = user.status === 'ACTIVE'
  const canSuspend = user.status === 'ACTIVE'
  const canUnsuspend = user.status === 'SUSPENDED'

  const handleWarn = async (data) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/warn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        alert('경고가 부여되었습니다.')
        router.refresh()
        setShowWarnModal(false)
      } else {
        const error = await res.json()
        alert(error.error || '경고 부여 실패')
      }
    } catch (error) {
      alert('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async (data) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        alert('사용자가 정지되었습니다.')
        router.refresh()
        setShowSuspendModal(false)
      } else {
        const error = await res.json()
        alert(error.error || '정지 실패')
      }
    } catch (error) {
      alert('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleUnsuspend = async () => {
    if (!confirm('정말 정지를 해제하시겠습니까?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/unsuspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: '관리자에 의한 수동 해제' }),
      })

      if (res.ok) {
        alert('정지가 해제되었습니다.')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || '정지 해제 실패')
      }
    } catch (error) {
      alert('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={styles.actions}>
        {canWarn && (
          <Button
            variant="outline"
            onClick={() => setShowWarnModal(true)}
            disabled={loading}
          >
            경고 부여
          </Button>
        )}
        {canSuspend && (
          <Button
            variant="danger"
            onClick={() => setShowSuspendModal(true)}
            disabled={loading}
          >
            정지
          </Button>
        )}
        {canUnsuspend && (
          <Button
            variant="success"
            onClick={handleUnsuspend}
            loading={loading}
          >
            정지 해제
          </Button>
        )}
      </div>

      {/* 경고 모달 */}
      <WarnModal
        isOpen={showWarnModal}
        onClose={() => setShowWarnModal(false)}
        onSubmit={handleWarn}
        loading={loading}
      />

      {/* 정지 모달 */}
      <SuspendModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onSubmit={handleSuspend}
        loading={loading}
      />
    </>
  )
}

function WarnModal({ isOpen, onClose, onSubmit, loading }) {
  const [reason, setReason] = useState('')
  const [severity, setSeverity] = useState('NORMAL')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!reason.trim()) {
      alert('사유를 입력해주세요.')
      return
    }
    onSubmit({ reason, severity })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="경고 부여"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            취소
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            경고 부여
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>심각도</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className={styles.select}
          >
            <option value="MINOR">경미</option>
            <option value="NORMAL">보통</option>
            <option value="SERIOUS">심각</option>
            <option value="CRITICAL">치명적</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>사유 *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="경고 사유를 입력하세요..."
            className={styles.textarea}
            rows={4}
            required
          />
        </div>

        <div className={styles.warning}>
          ⚠️ 경고 3회 누적 시 자동으로 정지됩니다.
        </div>
      </form>
    </Modal>
  )
}

function SuspendModal({ isOpen, onClose, onSubmit, loading }) {
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState('7d')
  const [type, setType] = useState('SUSPENSION')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!reason.trim()) {
      alert('사유를 입력해주세요.')
      return
    }
    onSubmit({ reason, duration, type })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="사용자 정지"
      size="medium"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            취소
          </Button>
          <Button variant="danger" onClick={handleSubmit} loading={loading}>
            정지
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>제재 유형</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={styles.select}
          >
            <option value="SUSPENSION">계정 정지</option>
            <option value="CHAT_BAN">채팅 금지</option>
            <option value="STUDY_CREATE_BAN">스터디 생성 금지</option>
            <option value="FILE_UPLOAD_BAN">파일 업로드 금지</option>
            <option value="PERMANENT_BAN">영구 정지</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>기간</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={styles.select}
            disabled={type === 'PERMANENT_BAN'}
          >
            <option value="1d">1일</option>
            <option value="3d">3일</option>
            <option value="7d">7일</option>
            <option value="14d">14일</option>
            <option value="30d">30일</option>
            <option value="permanent">영구</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>사유 *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="정지 사유를 입력하세요..."
            className={styles.textarea}
            rows={4}
            required
          />
        </div>

        <div className={styles.danger}>
          ⚠️ 정지된 사용자는 플랫폼 사용이 제한됩니다.
        </div>
      </form>
    </Modal>
  )
}

