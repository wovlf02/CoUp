'use client'

import styles from './Widget.module.css'
import Link from 'next/link'
import Image from 'next/image'

export default function OnlineMembers({ members, totalMembers }) {
  const onlineMembers = members?.filter(m => m.isOnline) || []
  
  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>👥 온라인 멤버</h3>
        <span className={styles.badge}>{onlineMembers.length}명</span>
      </div>

      {onlineMembers.length === 0 ? (
        <div className={styles.emptyState}>
          <p>현재 온라인인 멤버가 없습니다</p>
        </div>
      ) : (
        <div className={styles.membersList}>
          {onlineMembers.slice(0, 5).map((member) => (
            <div key={member.id} className={styles.memberItem}>
              <div className={styles.memberAvatar}>
                {member.avatar ? (
                  <Image 
                    src={member.avatar} 
                    alt={member.name}
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {member.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <span className={styles.onlineIndicator}>🟢</span>
              </div>
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>
                  {member.name}
                  {member.role === 'OWNER' && <span className={styles.roleBadge}>👑</span>}
                  {member.role === 'ADMIN' && <span className={styles.roleBadge}>⚡</span>}
                </div>
                {member.currentActivity && (
                  <div className={styles.memberActivity}>{member.currentActivity}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalMembers > 0 && (
        <Link href="/members" className={styles.widgetLink}>
          📊 전체 멤버 ({totalMembers}명) →
        </Link>
      )}
    </div>
  )
}

