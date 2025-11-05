'use client'

import { use } from 'react'
import { usePathname } from 'next/navigation'
import StudySidebar from '@/components/studies/StudySidebar'
import styles from '@/styles/studies/study-layout.module.css'

export default function StudyLayout({ children, params }) {
  const pathname = usePathname()
  const { studyId } = use(params) // Promise unwrap

  // 화상 스터디만 위젯 숨김, 나머지 모든 탭에서 표시
  const showSidebar = !pathname.includes('/video-call')

  return (
    <div className={styles.studyContainer}>
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
