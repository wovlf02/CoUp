'use client'

import { useState } from 'react'
import Modal from './Modal'
import styles from './Modal.module.css'

export default function ReportDetailModal({ report, isOpen, onClose, onProcess }) {
  const [action, setAction] = useState('WARN')
  const [memo, setMemo] = useState('')

  const handleProcess = () => {
    if (!memo.trim()) {
      alert('처리 메모를 입력해주세요.')
      return
    }

    onProcess({
      reportId: report.id,
      action,
      memo
    })

    setAction('WARN')
    setMemo('')
  }

  if (!report) return null

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    return `${Math.floor(diffInHours / 24)}일 전`
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return '#EF4444'
      case 'HIGH': return '#F59E0B'
      case 'MEDIUM': return '#FCD34D'
      case 'LOW': return '#10B981'
      default: return '#9CA3AF'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="신고 상세 정보"
      size="large"
      footer={
        report.status === 'PENDING' ? (
          <>
            <button
              className={`${styles.button} ${styles.buttonCancel}`}
              onClick={onClose}
            >
              닫기
            </button>
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={handleProcess}
            >
              처리 완료
            </button>
          </>
        ) : (
          <button
            className={`${styles.button} ${styles.buttonCancel}`}
            onClick={onClose}
          >
            닫기
          </button>
        )
      }
    >
      {/* Header */}
      <div className={styles.reportHeader}>
        <div className={styles.reportBadgeContainer}>
          <span className={`${styles.reportBadge} ${styles[report.type.toLowerCase()]}`}>
            {report.type === 'SPAM' && '⚠️ 스팸'}
            {report.type === 'HARASSMENT' && '🟠 욕설'}
            {report.type === 'INAPPROPRIATE' && '🟡 부적절'}
          </span>
          <span className={styles.reportBadge}
            style={{
              background: getPriorityColor(report.priority) + '20',
              color: getPriorityColor(report.priority)
            }}
          >
            {report.priority === 'URGENT' && '🔴 긴급'}
            {report.priority === 'HIGH' && '🟠 높음'}
            {report.priority === 'MEDIUM' && '🟡 중간'}
            {report.priority === 'LOW' && '🟢 낮음'}
          </span>
        </div>
        <div className={styles.reportMeta}>
          신고 ID: #{report.id} · {formatTimeAgo(report.createdAt)}
        </div>
      </div>

      {/* Info Grid */}
      <div className={styles.reportGrid}>
        <div>
          <h3 className={styles.reportSectionTitle}>신고자 정보</h3>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>이름</div>
            <div className={styles.infoValue}>{report.reporter.name}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>이메일</div>
            <div className={styles.infoValue}>{report.reporter.email}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>신뢰도</div>
            <div className={styles.infoValue}>{report.reporter.trustScore}%</div>
          </div>
        </div>

        <div>
          <h3 className={styles.reportSectionTitle}>대상 정보</h3>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>대상</div>
            <div className={styles.infoValue}>
              {report.targetType === 'STUDY' ? '📚 스터디' : '👤 사용자'}
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>이름</div>
            <div className={styles.infoValue}>{report.targetName}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>누적 신고</div>
            <div className={styles.infoValue} style={{ color: '#EF4444' }}>
              {report.targetReportCount}건
            </div>
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className={styles.reportSection}>
        <h3 className={styles.reportSectionTitle}>신고 사유</h3>
        <div className={styles.reportReasonBox}>
          {report.reason}
        </div>
      </div>

      {/* Evidence */}
      {report.evidence && (
        <div className={styles.reportSection}>
          <h3 className={styles.reportSectionTitle}>증거 자료</h3>
          {report.evidence.screenshots && report.evidence.screenshots.length > 0 && (
            <div className={styles.evidenceItem}>
              <div className={styles.evidenceLabel}>
                🖼️ 스크린샷 {report.evidence.screenshots.length}장
              </div>
              <div className={styles.evidenceList}>
                {report.evidence.screenshots.map((screenshot, index) => (
                  <div key={index} className={styles.evidenceTag}>
                    {screenshot}
                  </div>
                ))}
              </div>
            </div>
          )}
          {report.evidence.messages && report.evidence.messages.length > 0 && (
            <div>
              <div className={styles.evidenceLabel}>
                💬 관련 메시지 {report.evidence.messages.length}개
              </div>
              {report.evidence.messages.map((message, index) => (
                <div key={index} className={styles.messageBox}>
                  {message.content}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Process Options (if pending) */}
      {report.status === 'PENDING' && (
        <div className={styles.processSection}>
          <h3 className={styles.processSectionTitle}>처리 옵션</h3>

          <div className={styles.formGroup}>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="action"
                  value="WARN"
                  checked={action === 'WARN'}
                  onChange={(e) => setAction(e.target.value)}
                />
                <span>⚠️ 경고 발송 (1차 경고)</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="action"
                  value="SUSPEND"
                  checked={action === 'SUSPEND'}
                  onChange={(e) => setAction(e.target.value)}
                />
                <span>🚫 계정 정지 (7일/30일/영구)</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="action"
                  value="DELETE"
                  checked={action === 'DELETE'}
                  onChange={(e) => setAction(e.target.value)}
                />
                <span>🗑️ 콘텐츠 삭제 + 경고</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="action"
                  value="REJECT"
                  checked={action === 'REJECT'}
                  onChange={(e) => setAction(e.target.value)}
                />
                <span>✓ 신고 기각 (부당 신고)</span>
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>처리 메모</label>
            <textarea
              className={styles.textarea}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="처리 내용을 입력해주세요..."
            />
          </div>
        </div>
      )}

      {/* Resolved Info */}
      {report.status === 'RESOLVED' && (
        <div className={styles.resolvedBox}>
          <div className={styles.resolvedTitle}>
            ✅ 처리 완료
          </div>
          <div className={styles.resolvedText}>
            처리일: {formatTimeAgo(report.resolvedAt)}
          </div>
        </div>
      )}
    </Modal>
  )
}

