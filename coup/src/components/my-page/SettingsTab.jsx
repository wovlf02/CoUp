'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import DeleteAccountModal from './DeleteAccountModal'
import styles from './SettingsTab.module.css'

// 설정 아이템 컴포넌트
function SettingLink({ href, icon, name, description }) {
  return (
    <Link href={href} className={styles.settingItem}>
      <span className={styles.settingIcon}>{icon}</span>
      <div className={styles.settingInfo}>
        <span className={styles.settingName}>{name}</span>
        <span className={styles.settingDesc}>{description}</span>
      </div>
      <span className={styles.settingArrow}>→</span>
    </Link>
  )
}

export default function SettingsTab() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // 로그아웃
  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) return
    setIsLoggingOut(true)
    try {
      await signOut({ callbackUrl: '/', redirect: true })
    } catch {
      alert('로그아웃에 실패했습니다')
      setIsLoggingOut(false)
    }
  }

  // 계정 삭제
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!response.ok) throw new Error('계정 삭제 실패')
      alert('계정이 삭제되었습니다')
      setShowDeleteModal(false)
      await signOut({ callbackUrl: '/', redirect: true })
    } catch {
      alert('계정 삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className={styles.container}>
      {/* 앱 설정 */}
      <section className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.titleIcon}>🎨</span>
          앱 설정
        </h3>
        <div className={styles.settingsList}>
          <SettingLink
            href="/settings"
            icon="⚙️"
            name="일반 설정"
            description="테마, 언어 등 앱 환경 설정"
          />
          <SettingLink
            href="/settings#notifications"
            icon="🔔"
            name="알림 설정"
            description="푸시 알림, 이메일 알림 관리"
          />
          <SettingLink
            href="/notifications"
            icon="📬"
            name="알림 확인"
            description="받은 알림 확인 및 관리"
          />
        </div>
      </section>

      {/* 바로가기 */}
      <section className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.titleIcon}>⚡</span>
          바로가기
        </h3>
        <div className={styles.settingsList}>
          <SettingLink
            href="/my-studies"
            icon="📚"
            name="내 스터디"
            description="참여 중인 모든 스터디 보기"
          />
          <SettingLink
            href="/tasks"
            icon="✅"
            name="할 일 목록"
            description="나에게 할당된 할 일 확인"
          />
          <SettingLink
            href="/studies"
            icon="🔍"
            name="스터디 탐색"
            description="새로운 스터디 찾아보기"
          />
        </div>
      </section>

      {/* 계정 관리 */}
      <section className={`${styles.sectionCard} ${styles.dangerSection}`}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.titleIcon}>🔐</span>
          계정 관리
        </h3>
        <div className={styles.accountActions}>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={styles.logoutBtn}
          >
            <span className={styles.btnIcon}>🚪</span>
            <span className={styles.btnText}>
              {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className={styles.deleteBtn}
          >
            <span className={styles.btnIcon}>⚠️</span>
            <div className={styles.btnContent}>
              <span className={styles.btnText}>계정 삭제</span>
              <span className={styles.btnWarning}>모든 데이터가 영구 삭제됩니다</span>
            </div>
          </button>
        </div>
      </section>

      {/* 삭제 모달 */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}

