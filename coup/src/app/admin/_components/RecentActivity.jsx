import Link from 'next/link'
import styles from './RecentActivity.module.css'

export default function RecentActivity({ activity }) {
  if (!activity) {
    return <ActivitySkeleton />
  }

  const { users, reports, warnings } = activity

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>최근 활동</h2>
      </div>

      <div className={styles.sections}>
        {/* 신규 사용자 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>신규 사용자</h3>
            <Link href="/admin/users" className={styles.viewAll}>
              전체 보기 →
            </Link>
          </div>
          <div className={styles.list}>
            {users && users.length > 0 ? (
              users.map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className={styles.item}
                >
                  <div className={styles.itemIcon}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className={styles.avatar} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {(user.name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.itemContent}>
                    <div className={styles.itemTitle}>{user.name || user.email}</div>
                    <div className={styles.itemSubtitle}>{user.email}</div>
                  </div>
                  <div className={styles.itemTime}>
                    {formatTimeAgo(user.createdAt)}
                  </div>
                </Link>
              ))
            ) : (
              <div className={styles.empty}>신규 사용자가 없습니다</div>
            )}
          </div>
        </section>

        {/* 대기 중인 신고 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>대기 중인 신고</h3>
            <Link href="/admin/reports" className={styles.viewAll}>
              전체 보기 →
            </Link>
          </div>
          <div className={styles.list}>
            {reports && reports.length > 0 ? (
              reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/admin/reports/${report.id}`}
                  className={styles.item}
                >
                  <div className={`${styles.itemIcon} ${styles[report.priority.toLowerCase()]}`}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 0L11.5 6.5L18 5L14 10.5L20 13L13 14.5L14.5 20L10 16L5.5 20L7 14.5L0 13L6 10.5L2 5L8.5 6.5L10 0Z"/>
                    </svg>
                  </div>
                  <div className={styles.itemContent}>
                    <div className={styles.itemTitle}>
                      {getReportTypeLabel(report.type)} - {report.targetType}
                    </div>
                    <div className={styles.itemSubtitle}>
                      신고자: {report.reporter.name || report.reporter.email}
                    </div>
                  </div>
                  <div className={styles.itemTime}>
                    {formatTimeAgo(report.createdAt)}
                  </div>
                </Link>
              ))
            ) : (
              <div className={styles.empty}>대기 중인 신고가 없습니다</div>
            )}
          </div>
        </section>

        {/* 최근 경고 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>최근 경고</h3>
          </div>
          <div className={styles.list}>
            {warnings && warnings.length > 0 ? (
              warnings.map((warning) => (
                <div key={warning.id} className={styles.item}>
                  <div className={`${styles.itemIcon} ${styles[warning.severity.toLowerCase()]}`}>
                    ⚠️
                  </div>
                  <div className={styles.itemContent}>
                    <div className={styles.itemTitle}>
                      {warning.user.name || warning.user.email}
                    </div>
                    <div className={styles.itemSubtitle}>
                      {warning.reason.substring(0, 50)}...
                    </div>
                  </div>
                  <div className={styles.itemTime}>
                    {formatTimeAgo(warning.createdAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.empty}>최근 경고가 없습니다</div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.skeletonTitle} />
      </div>
      <div className={styles.sections}>
        {[1, 2, 3].map(i => (
          <section key={i} className={styles.section}>
            <div className={styles.skeletonLine} style={{ width: '40%' }} />
            {[1, 2, 3].map(j => (
              <div key={j} className={styles.skeletonItem}>
                <div className={styles.skeletonCircle} />
                <div style={{ flex: 1 }}>
                  <div className={styles.skeletonLine} style={{ width: '60%' }} />
                  <div className={styles.skeletonLine} style={{ width: '40%' }} />
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}

function getReportTypeLabel(type) {
  const labels = {
    SPAM: '스팸',
    HARASSMENT: '괴롭힘',
    INAPPROPRIATE: '부적절한 콘텐츠',
    COPYRIGHT: '저작권 침해',
    OTHER: '기타',
  }
  return labels[type] || type
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return '방금 전'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`

  return date.toLocaleDateString('ko-KR')
}

