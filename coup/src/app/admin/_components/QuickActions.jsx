import Link from 'next/link'
import styles from './QuickActions.module.css'

export default function QuickActions() {
  const actions = [
    {
      title: '사용자 관리',
      description: '사용자 목록 보기',
      href: '/admin/users',
      icon: '👥',
      color: 'blue',
    },
    {
      title: '신고 처리',
      description: '대기 중인 신고 확인',
      href: '/admin/reports',
      icon: '🚨',
      color: 'red',
    },
    {
      title: '스터디 관리',
      description: '스터디 목록 보기',
      href: '/admin/studies',
      icon: '📚',
      color: 'purple',
    },
    {
      title: '통계 보기',
      description: '상세 통계 및 분석',
      href: '/admin/analytics',
      icon: '📊',
      color: 'green',
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>빠른 액션</h2>
      </div>

      <div className={styles.actions}>
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`${styles.action} ${styles[action.color]}`}
          >
            <div className={styles.actionIcon}>{action.icon}</div>
            <div className={styles.actionContent}>
              <div className={styles.actionTitle}>{action.title}</div>
              <div className={styles.actionDescription}>{action.description}</div>
            </div>
            <svg
              className={styles.actionArrow}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M7 4L13 10L7 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ))}
      </div>

      <div className={styles.tips}>
        <h3 className={styles.tipsTitle}>💡 관리 팁</h3>
        <ul className={styles.tipsList}>
          <li>긴급 신고는 즉시 처리하세요</li>
          <li>정기적으로 제재 이력을 검토하세요</li>
          <li>사용자 피드백에 주의를 기울이세요</li>
        </ul>
      </div>
    </div>
  )
}

