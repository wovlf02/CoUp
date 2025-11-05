'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from '@/styles/studies/notices.module.css'

export default function StudyNoticesPage({ params }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdmin] = useState(false) // TODO: 실제 권한 체크

  // 샘플 공지사항 데이터
  const [notices, setNotices] = useState([
    {
      id: 1,
      title: '이번 주 스터디 일정 안내',
      author: '김철수',
      createdAt: '2시간 전',
      isPinned: true,
      content: '## 이번 주 일정\n\n- **월요일**: 알고리즘 문제 풀이\n- **수요일**: 코드 리뷰'
    },
    {
      id: 2,
      title: '알고리즘 문제 추천 목록',
      author: '이영희',
      createdAt: '1일 전',
      isPinned: false
    },
    {
      id: 3,
      title: '참고 자료 공유',
      author: '박민수',
      createdAt: '3일 전',
      isPinned: false
    }
  ])

  const handleDelete = (noticeId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    setNotices(prev => prev.filter(n => n.id !== noticeId))
    // TODO: API 호출
    console.log('공지 삭제:', noticeId)
  }

  return (
    <div className={styles.noticesContainer}>
      {/* 헤더 */}
      <div className={styles.noticesHeader}>
        <h2>공지사항</h2>
        {isAdmin && (
          <button
            className={styles.createButton}
            onClick={() => setIsModalOpen(true)}
          >
            + 공지 작성
          </button>
        )}
      </div>

      {/* 공지 목록 */}
      <div className={styles.noticesList}>
        {notices.length === 0 ? (
          <div className={styles.emptyState}>
            <p>아직 공지사항이 없습니다</p>
          </div>
        ) : (
          notices.map((notice) => (
            <Link
              key={notice.id}
              href={`/studies/${params.studyId}/notices/${notice.id}`}
              className={`${styles.noticeCard} ${notice.isPinned ? styles.pinned : ''}`}
            >
              <div className={styles.noticeContent}>
                <div className={styles.noticeTitle}>
                  <span className={styles.icon}>{notice.isPinned ? '📌' : '📝'}</span>
                  {notice.isPinned && <span className={styles.pinnedBadge}>고정</span>}
                  <span>{notice.title}</span>
                </div>
                <div className={styles.noticeMeta}>
                  <span>{notice.author}</span>
                  <span>·</span>
                  <span>{notice.createdAt}</span>
                </div>
              </div>
              {isAdmin && (
                <div className={styles.noticeActions} onClick={(e) => e.preventDefault()}>
                  <button
                    className={styles.editButton}
                    onClick={(e) => {
                      e.preventDefault()
                      console.log('수정:', notice.id)
                    }}
                  >
                    수정
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete(notice.id)
                    }}
                  >
                    삭제
                  </button>
                </div>
              )}
            </Link>
          ))
        )}
      </div>

      {/* 공지 작성 모달 (간단한 버전) */}
      {isModalOpen && (
        <NoticeModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => {
            const newNotice = {
              id: Date.now(),
              ...data,
              author: '나',
              createdAt: '방금 전'
            }
            setNotices(prev => data.isPinned ? [newNotice, ...prev] : [...prev, newNotice])
            setIsModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

function NoticeModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [isPreview, setIsPreview] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    onSubmit({ title, content, isPinned })
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>공지사항 작성</h3>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지사항 제목을 입력하세요"
              maxLength={100}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              내용 * (Markdown 지원)
              <button
                type="button"
                className={styles.previewToggle}
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? '편집' : '미리보기'}
              </button>
            </label>
            {isPreview ? (
              <div className={styles.preview}>
                {content || '내용을 입력하세요...'}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="공지사항 내용을 입력하세요 (Markdown 형식 지원)"
                rows={10}
                required
              />
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
              />
              <span>상단 고정</span>
            </label>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={styles.submitButton}>
              작성하기
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

