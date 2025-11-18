'use client'

import styles from './Widget.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function QuickActions({ isAdmin }) {
  const router = useRouter()

  const handleVideoCall = () => {
    // TODO: 화상 통화 기능 구현
    alert('화상 스터디 기능은 준비 중입니다')
  }

  const handleInvite = () => {
    // TODO: 초대 링크 복사
    alert('멤버 초대 기능은 준비 중입니다')
  }

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>⚡ 빠른 액션</h3>
      
      <div className={styles.actionButtons}>
        <Link href="/chat" className={styles.actionButton}>
          💬 채팅 시작
        </Link>
        
        <button 
          onClick={handleVideoCall}
          className={styles.actionButton}
        >
          📹 화상 스터디
        </button>
        
        <button 
          onClick={handleInvite}
          className={styles.actionButton}
        >
          📤 멤버 초대
        </button>
        
        <Link href="/my-studies/stats" className={styles.actionButton}>
          📊 통계 보기
        </Link>
        
        {isAdmin && (
          <Link href="/settings" className={styles.actionButton}>
            ⚙️ 설정
          </Link>
        )}
      </div>
    </div>
  )
}

