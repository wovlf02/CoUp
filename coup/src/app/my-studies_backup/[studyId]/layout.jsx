'use client'

import { use } from 'react'
import { usePathname } from 'next/navigation'
import StudyHeader from '@/components/studies/StudyHeader'
import StudySidebar from '@/components/studies/StudySidebar'
import styles from '@/styles/studies/study-layout.module.css'

export default function StudyLayout({ children, params }) {
  const pathname = usePathname()
  const { studyId } = use(params) // Promise unwrap

  // 화상 스터디만 위젯 숨김, 나머지 모든 탭에서 표시
  const showSidebar = !pathname.includes('/video-call')
  const showHeader = !pathname.includes('/video-call')

  // Mock study data - 실제로는 API에서 가져옴
  const study = {
    id: studyId,
    emoji: '📚',
    name: '코딩테스트 마스터 스터디',
    owner: { name: '김철수' },
    currentMembers: 12,
    maxMembers: 20,
    category: '프로그래밍',
    role: 'MEMBER' // OWNER, ADMIN, MEMBER
  }

  return (
    <div className={styles.studyContainer}>
      {showHeader && <StudyHeader studyId={studyId} study={study} />}

      <div className={styles.withSidebar}>
        <main className={styles.mainContent}>
          {children}
        </main>
        {showSidebar && (
          <aside className={styles.sidebar}>
            <StudySidebar studyId={studyId} />
          </aside>
        )}
      </div>
    </div>
  )
}
