'use client'

import styles from './Widget.module.css'
import Link from 'next/link'

export default function PinnedNotice({ notice }) {
  if (!notice) {
    return null
  }

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return '방금 전'
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`

    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>📌 고정 공지</h3>
      
      <div className={styles.noticeContent}>
        <h4 className={styles.noticeTitle}>{notice.title}</h4>
        <div className={styles.noticeMeta}>
          <span>{notice.authorName}</span>
          <span>·</span>
          <span>{formatRelativeTime(notice.createdAt)}</span>
        </div>
        {notice.content && (
          <p className={styles.noticePreview}>
            {notice.content.length > 80 
              ? notice.content.substring(0, 80) + '...' 
              : notice.content}
          </p>
        )}
      </div>

      <Link href={`/notices/${notice.id}`} className={styles.widgetLink}>
        자세히 보기 →
      </Link>
    </div>
  )
}

