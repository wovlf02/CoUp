'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '@/styles/studies/notice-detail.module.css'
import { getNoticeById } from '@/mocks/notices'
import NoticeCreateEditModal from '@/components/studies/NoticeCreateEditModal'

export default function NoticeEditPage() {
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
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h2>공지사항을 찾을 수 없습니다</h2>
          <button onClick={() => router.back()}>돌아가기</button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    router.push(`/studies/${studyId}/notices/${noticeId}`)
    return null
  }

  const handleSuccess = () => {
    router.push(`/studies/${studyId}/notices/${noticeId}`)
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => router.back()}
        >
          ← 뒤로가기
        </button>

        <div className={styles.studyName}>
          <span className={styles.emoji}>{study.emoji}</span>
          <span>{study.name}</span>
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

      {/* Edit Modal (Full Screen) */}
      <NoticeCreateEditModal
        studyId={studyId}
        notice={notice}
        onClose={() => router.push(`/studies/${studyId}/notices/${noticeId}`)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
