'use client'

import { useState } from 'react'
import DeleteAccountModal from './DeleteAccountModal'
import styles from './AccountActions.module.css'

export default function AccountActions() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleLogout = () => {
    // Mock: 콘솔에만 출력
    console.log('로그아웃 처리')
    alert('로그아웃되었습니다 (Mock)')
  }

  const handleDeleteAccount = () => {
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    console.log('계정 삭제 처리')
    alert('계정이 삭제되었습니다 (Mock)')
    setShowDeleteModal(false)
  }

  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.sectionHeader}>5. 계정 관리</h2>

        <div className={styles.actionsContainer}>
          {/* 로그아웃 */}
          <div className={styles.actionCard}>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>로그아웃</h3>
              <p className={styles.actionDescription}>
                현재 기기에서 로그아웃합니다
              </p>
            </div>
            <button
              onClick={handleLogout}
              className={`${styles.actionButton} ${styles.logoutButton}`}
            >
              로그아웃
            </button>
          </div>

          {/* 계정 삭제 */}
          <div className={`${styles.actionCard} ${styles.dangerCard}`}>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>계정 삭제</h3>
              <p className={styles.actionDescription}>
                ⚠️ 계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className={`${styles.actionButton} ${styles.deleteButton}`}
            >
              계정 삭제
            </button>
          </div>
        </div>
      </section>

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  )
}

