'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/styles/studies/notice-detail.module.css'

export default function NoticeDetailPage({ params }) {
  const router = useRouter()
  const [isAdmin] = useState(false) // TODO: 실제 권한 체크

  // 샘플 공지사항 상세 데이터
  const notice = {
    id: params.noticeId,
    title: '이번 주 스터디 일정 안내',
    author: '김철수',
    createdAt: '2025년 11월 5일 10:30',
    isPinned: true,
    content: `## 이번 주 일정

- **월요일**: 알고리즘 문제 풀이
- **수요일**: 코드 리뷰
- **금요일**: 모의 코딩테스트

모두 참여 부탁드립니다!

## 참고 사항

- 문제는 백준에서 선정합니다
- 코드 리뷰는 온라인으로 진행합니다`
  }

  const handleDelete = () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    // TODO: API 호출
    console.log('공지 삭제:', notice.id)
    router.push(`/studies/${params.studyId}/notices`)
  }

  const handleEdit = () => {
    // TODO: 수정 모달 열기
    console.log('공지 수정:', notice.id)
  }

  return (
    <div className={styles.noticeDetailContainer}>
      {/* 헤더 */}
      <div className={styles.noticeHeader}>
        <button
          className={styles.backButton}
          onClick={() => router.push(`/studies/${params.studyId}/notices`)}
        >
          ← 목록으로
        </button>
        {isAdmin && (
          <div className={styles.headerActions}>
            <button className={styles.editButton} onClick={handleEdit}>
              수정
            </button>
            <button className={styles.deleteButton} onClick={handleDelete}>
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 제목 */}
      <div className={styles.noticeTitle}>
        {notice.isPinned && <span className={styles.pinnedBadge}>📌 고정</span>}
        <h1>{notice.title}</h1>
      </div>

      {/* 메타 정보 */}
      <div className={styles.noticeMeta}>
        <span>{notice.author}</span>
        <span>·</span>
        <span>{notice.createdAt}</span>
      </div>

      <div className={styles.divider}></div>

      {/* 본문 */}
      <div className={styles.noticeContent}>
        {/* TODO: Markdown 렌더링 (react-markdown) */}
        <div dangerouslySetInnerHTML={{ __html: notice.content.replace(/\n/g, '<br>') }} />
      </div>
    </div>
  )
}

