'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '@/styles/studies/notices.module.css'
import { getNoticesByStudyId } from '@/mocks/notices'
import NoticeCreateEditModal from '@/components/studies/NoticeCreateEditModal'

export default function StudyNoticesPage() {
  const params = useParams()
  const router = useRouter()
  const studyId = parseInt(params.studyId)

  const [notices, setNotices] = useState(getNoticesByStudyId(studyId))
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdmin] = useState(true) // Mock: 현재 사용자가 관리자인지 (OWNER 또는 ADMIN)

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

  const handleNoticeCreated = (newNotice) => {
    setNotices(prev => [newNotice, ...prev].sort((a, b) => {
      // 고정 공지 먼저
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      // 그 다음 최신순
      return new Date(b.createdAt) - new Date(a.createdAt)
    }))
  }

  const handleDelete = (noticeId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    setNotices(prev => prev.filter(n => n.id !== noticeId))
    alert('공지사항이 삭제되었습니다!')
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diff = now - date

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return `${days}일 전`
  }

  return (
    <div className={styles.noticesPage}>
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

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>공지사항</h2>
        {isAdmin && (
          <button
            className={styles.createButton}
            onClick={() => setIsModalOpen(true)}
          >
            <span className={styles.plusIcon}>+</span>
            공지 작성
          </button>
        )}
      </div>

      {/* Notice List */}
      <div className={styles.noticeList}>
        {notices.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📢</div>
            <h3 className={styles.emptyTitle}>등록된 공지사항이 없습니다</h3>
            <p className={styles.emptyDescription}>
              첫 공지사항을 작성해보세요
            </p>
          </div>
        ) : (
          notices.map(notice => (
            <Link
              key={notice.id}
              href={`/studies/${studyId}/notices/${notice.id}`}
              className={`${styles.noticeCard} ${notice.isPinned ? styles.pinned : ''}`}
            >
              <div className={styles.noticeHeader}>
                <div className={styles.noticeTitleRow}>
                  <span className={styles.noticeIcon}>
                    {notice.isPinned ? '📌' : '📝'}
                  </span>
                  {notice.isPinned && (
                    <span className={styles.pinnedBadge}>고정</span>
                  )}
                  <h3 className={styles.noticeTitle}>{notice.title}</h3>
                </div>

                {isAdmin && (
                  <div className={styles.noticeActions}>
                    <button
                      className={styles.actionButton}
                      onClick={(e) => {
                        e.preventDefault()
                        router.push(`/studies/${studyId}/notices/${notice.id}/edit`)
                      }}
                    >
                      수정
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={(e) => {
                        e.preventDefault()
                        handleDelete(notice.id)
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.noticeMeta}>
                <span className={styles.author}>{notice.authorName}</span>
                <span className={styles.separator}>·</span>
                <span className={styles.time}>{formatTimeAgo(notice.createdAt)}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Notice Create Modal */}
      {isModalOpen && (
        <NoticeCreateEditModal
          studyId={studyId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleNoticeCreated}
        />
      )}
    </div>
  )
}
