'use client'

import styles from './UserBulkActions.module.css'

/**
 * 사용자 일괄 작업 바 컴포넌트
 */
export default function UserBulkActions({
  selectedCount,
  onEmailSend,
  onSuspend,
  onDelete,
  onExport,
  onDeselectAll
}) {
  if (selectedCount === 0) return null

  return (
    <div className={styles.userBulkActionsBar}>
      <div className={styles.userBulkActionsInfo}>
        <span className={styles.userBulkActionsCount}>{selectedCount}명</span> 선택됨
        <button
          className={styles.userBulkActionsDeselectBtn}
          onClick={onDeselectAll}
          type="button"
          aria-label="선택 해제"
        >
          ✕
        </button>
      </div>

      <div className={styles.userBulkActionsButtons}>
        <button
          className={styles.userBulkActionsBtn}
          onClick={onEmailSend}
          type="button"
          aria-label="이메일 발송"
        >
          📧 이메일 발송
        </button>
        <button
          className={styles.userBulkActionsBtn}
          onClick={onExport}
          type="button"
          aria-label="엑셀 내보내기"
        >
          📥 엑셀 내보내기
        </button>
        <button
          className={`${styles.userBulkActionsBtn} ${styles.userBulkActionsBtnDanger}`}
          onClick={onSuspend}
          type="button"
          aria-label="계정 정지"
        >
          ⚠️ 계정 정지
        </button>
        <button
          className={`${styles.userBulkActionsBtn} ${styles.userBulkActionsBtnDanger}`}
          onClick={onDelete}
          type="button"
          aria-label="계정 삭제"
        >
          🗑️ 계정 삭제
        </button>
      </div>
    </div>
  )
}

