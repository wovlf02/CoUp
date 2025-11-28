'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/admin/ui/Button'
import Modal from '@/components/admin/ui/Modal'
import styles from './ReportActions.module.css'

export default function ReportActions({ report }) {
  const router = useRouter()
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // 배정 모달
  const [assignToMe, setAssignToMe] = useState(true)

  // 승인 모달
  const [linkedAction, setLinkedAction] = useState('none')
  const [suspendDuration, setSuspendDuration] = useState('7d')
  const [warningSeverity, setWarningSeverity] = useState('NORMAL')
  const [approveReason, setApproveReason] = useState('')

  // 거부/보류 모달
  const [rejectReason, setRejectReason] = useState('')
  const [holdReason, setHoldReason] = useState('')

  const canProcess = report.status === 'PENDING' || report.status === 'IN_PROGRESS'

  // 담당자 배정
  const handleAssign = async () => {
    if (loading) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reports/${report.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoAssign: !assignToMe,
        }),
      })

      const data = await res.json()

      if (data.success) {
        alert(data.message)
        router.refresh()
        setIsAssignModalOpen(false)
      } else {
        alert(data.message || '배정 실패')
      }
    } catch (error) {
      console.error('배정 실패:', error)
      alert('담당자 배정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 승인 처리
  const handleApprove = async () => {
    if (loading) return
    if (!approveReason.trim()) {
      alert('처리 사유를 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const linkedActionDetails = {}

      if (linkedAction === 'suspend_user') {
        linkedActionDetails.duration = suspendDuration
      } else if (linkedAction === 'warn_user') {
        linkedActionDetails.severity = warningSeverity
      }

      const res = await fetch(`/api/admin/reports/${report.id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          resolution: approveReason,
          linkedAction,
          linkedActionDetails,
        }),
      })

      const data = await res.json()

      if (data.success) {
        alert(data.message)
        router.refresh()
        setIsApproveModalOpen(false)
      } else {
        alert(data.message || '승인 실패')
      }
    } catch (error) {
      console.error('승인 실패:', error)
      alert('신고 승인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 거부 처리
  const handleReject = async () => {
    if (loading) return
    if (!rejectReason.trim()) {
      alert('거부 사유를 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reports/${report.id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          resolution: rejectReason,
          linkedAction: 'none',
        }),
      })

      const data = await res.json()

      if (data.success) {
        alert(data.message)
        router.refresh()
        setIsRejectModalOpen(false)
      } else {
        alert(data.message || '거부 실패')
      }
    } catch (error) {
      console.error('거부 실패:', error)
      alert('신고 거부 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 보류 처리
  const handleHold = async () => {
    if (loading) return
    if (!holdReason.trim()) {
      alert('보류 사유를 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reports/${report.id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'hold',
          resolution: holdReason,
          linkedAction: 'none',
        }),
      })

      const data = await res.json()

      if (data.success) {
        alert(data.message)
        router.refresh()
        setIsHoldModalOpen(false)
      } else {
        alert(data.message || '보류 실패')
      }
    } catch (error) {
      console.error('보류 실패:', error)
      alert('신고 보류 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>신고 처리</h3>

      <div className={styles.actions}>
        {/* 담당자 배정 */}
        {!report.processedBy && (
          <Button
            variant="outline"
            fullWidth
            onClick={() => setIsAssignModalOpen(true)}
          >
            👤 담당자 배정
          </Button>
        )}

        {canProcess && (
          <>
            {/* 승인 */}
            <Button
              variant="success"
              fullWidth
              onClick={() => setIsApproveModalOpen(true)}
            >
              ✅ 승인
            </Button>

            {/* 거부 */}
            <Button
              variant="danger"
              fullWidth
              onClick={() => setIsRejectModalOpen(true)}
            >
              ❌ 거부
            </Button>

            {/* 보류 */}
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setIsHoldModalOpen(true)}
            >
              ⏸️ 보류
            </Button>
          </>
        )}

        {report.status === 'RESOLVED' && (
          <div className={styles.statusMessage}>
            ✅ 이미 처리된 신고입니다.
          </div>
        )}

        {report.status === 'REJECTED' && (
          <div className={styles.statusMessage}>
            ❌ 거부된 신고입니다.
          </div>
        )}
      </div>

      {/* 담당자 배정 모달 */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="담당자 배정"
      >
        <div className={styles.modalContent}>
          <p className={styles.modalDescription}>
            이 신고의 담당자를 배정합니다.
          </p>

          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                checked={assignToMe}
                onChange={() => setAssignToMe(true)}
              />
              <span>나에게 배정</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                checked={!assignToMe}
                onChange={() => setAssignToMe(false)}
              />
              <span>자동 배정 (가장 적게 처리 중인 관리자)</span>
            </label>
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleAssign}
              loading={loading}
            >
              배정
            </Button>
          </div>
        </div>
      </Modal>

      {/* 승인 모달 */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="신고 승인"
        size="large"
      >
        <div className={styles.modalContent}>
          <p className={styles.modalDescription}>
            신고를 승인하고 연계 조치를 실행합니다.
          </p>

          {/* 연계 액션 선택 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>연계 조치</label>
            <select
              className={styles.formSelect}
              value={linkedAction}
              onChange={(e) => setLinkedAction(e.target.value)}
            >
              <option value="none">조치 없음</option>
              {report.targetType === 'USER' && (
                <>
                  <option value="warn_user">경고 부여</option>
                  <option value="suspend_user">사용자 정지</option>
                </>
              )}
              <option value="delete_content">콘텐츠 삭제</option>
            </select>
          </div>

          {/* 정지 기간 선택 (사용자 정지 시) */}
          {linkedAction === 'suspend_user' && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>정지 기간</label>
              <select
                className={styles.formSelect}
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(e.target.value)}
              >
                <option value="1d">1일</option>
                <option value="3d">3일</option>
                <option value="7d">7일</option>
                <option value="30d">30일</option>
                <option value="permanent">영구</option>
              </select>
            </div>
          )}

          {/* 경고 심각도 선택 (경고 부여 시) */}
          {linkedAction === 'warn_user' && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>경고 심각도</label>
              <select
                className={styles.formSelect}
                value={warningSeverity}
                onChange={(e) => setWarningSeverity(e.target.value)}
              >
                <option value="MINOR">경미</option>
                <option value="NORMAL">일반</option>
                <option value="SERIOUS">심각</option>
                <option value="CRITICAL">치명적</option>
              </select>
            </div>
          )}

          {/* 처리 사유 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>처리 사유 *</label>
            <textarea
              className={styles.formTextarea}
              placeholder="승인 사유와 조치 내용을 입력해주세요..."
              value={approveReason}
              onChange={(e) => setApproveReason(e.target.value)}
              rows={4}
            />
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="outline"
              onClick={() => setIsApproveModalOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="success"
              onClick={handleApprove}
              loading={loading}
            >
              승인
            </Button>
          </div>
        </div>
      </Modal>

      {/* 거부 모달 */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="신고 거부"
      >
        <div className={styles.modalContent}>
          <p className={styles.modalDescription}>
            이 신고를 거부합니다. 신고자에게 거부 사유가 전달됩니다.
          </p>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>거부 사유 *</label>
            <textarea
              className={styles.formTextarea}
              placeholder="거부 사유를 입력해주세요..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={loading}
            >
              거부
            </Button>
          </div>
        </div>
      </Modal>

      {/* 보류 모달 */}
      <Modal
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        title="신고 보류"
      >
        <div className={styles.modalContent}>
          <p className={styles.modalDescription}>
            이 신고를 보류 상태로 변경합니다. 추가 검토가 필요한 경우 사용하세요.
          </p>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>보류 사유 *</label>
            <textarea
              className={styles.formTextarea}
              placeholder="보류 사유를 입력해주세요..."
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              rows={4}
            />
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="outline"
              onClick={() => setIsHoldModalOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="secondary"
              onClick={handleHold}
              loading={loading}
            >
              보류
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

