'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '@/styles/studies/notice-detail.module.css'
import { getNoticeById } from '@/mocks/notices'
import MarkdownRenderer from '@/components/studies/MarkdownRenderer'

export default function NoticeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studyId = parseInt(params.studyId)
  const noticeId = parseInt(params.noticeId)

  const notice = getNoticeById(noticeId)
  const [isAdmin] = useState(true) // Mock: 현재 사용자가 관리자인지

  // Mock 스터디 데이터
  const study = {
    id: studyId,
    emoji: '📚',
    name: '코딩테스트 마스터 스터디'
  }

  const tabs = [
    { id: 'overview', name: '개요', path: `/studies/${studyId}` },
    { id: 'chat', name: '채팅', path: `/studies/${studyId}/chat` },
    { id: 'notices', name: '공지', path: `/studies/${studyId}/notices` },
    { id: 'files', name: '파일', path: `/studies/${studyId}/files` },
    { id: 'calendar', name: '캘린더', path: `/studies/${studyId}/calendar` },
    { id: 'tasks', name: '할일', path: `/studies/${studyId}/tasks` }
  ]

  if (!notice) {
    return (
      <div className={styles.notFound}>
        <h2>공지사항을 찾을 수 없습니다</h2>
        <button onClick={() => router.back()}>돌아가기</button>
      </div>
    )
  }

  const handleDelete = () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    // Mock 삭제
    alert('공지사항이 삭제되었습니다!')
    router.push(`/studies/${studyId}/notices`)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={styles.noticeDetailPage}>
      {/* Study Header */}
      <div className={styles.studyHeader}>
        <div className={styles.studyInfo}>
          <span className={styles.emoji}>{study.emoji}</span>
          <h1 className={styles.studyName}>{study.name}</h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <nav className={styles.tabNavigation}>
        {tabs.map(tab => (
          <Link
            key={tab.id}
            href={tab.path}
            className={`${styles.tab} ${tab.id === 'notices' ? styles.tabActive : ''}`}
          >
            {tab.name}
          </Link>
        ))}
      </nav>

      {/* Notice Detail */}
      <div className={styles.content}>
        <div className={styles.detailHeader}>
          <Link
            href={`/studies/${studyId}/notices`}
            className={styles.backToList}
          >
            ← 목록으로
          </Link>

          {isAdmin && (
            <div className={styles.actions}>
              <button
                className={styles.editButton}
                onClick={() => router.push(`/studies/${studyId}/notices/${noticeId}/edit`)}
              >
                수정
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleDelete}
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {notice.isPinned && (
          <div className={styles.pinnedBadge}>
            📌 고정된 공지사항
          </div>
        )}

        <h1 className={styles.title}>{notice.title}</h1>

        <div className={styles.meta}>
          <span className={styles.author}>{notice.authorName}</span>
          <span className={styles.separator}>·</span>
          <span className={styles.date}>{formatDate(notice.createdAt)}</span>
        </div>

        <hr className={styles.divider} />

        <div className={styles.body}>
          <MarkdownRenderer content={notice.content} />
        </div>
      </div>
    </div>
  )
}
