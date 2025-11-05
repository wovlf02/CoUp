'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '@/styles/studies/study-layout.module.css'

export default function StudyLayout({ children, params }) {
  const pathname = usePathname()
  const router = useRouter()
  const studyId = params.studyId

  // TODO: 실제 API에서 스터디 정보 가져오기
  const study = {
    id: studyId,
    emoji: '📚',
    name: '코딩테스트 마스터 스터디',
    owner: '김철수',
    currentMembers: 12,
    maxMembers: 20,
    category: '프로그래밍',
    isMember: false, // TODO: 실제 로그인한 사용자의 멤버십 확인
    isAdmin: false
  }

  const tabs = [
    { name: '개요', path: `/studies/${studyId}` },
    { name: '채팅', path: `/studies/${studyId}/chat` },
    { name: '공지', path: `/studies/${studyId}/notices` },
    { name: '파일', path: `/studies/${studyId}/files` },
    { name: '캘린더', path: `/studies/${studyId}/calendar` },
    { name: '할일', path: `/studies/${studyId}/tasks` },
  ]

  // 관리자만 설정 탭 표시
  if (study.isAdmin) {
    tabs.push({ name: '설정', path: `/studies/${studyId}/settings` })
  }

  const isActiveTab = (path) => {
    if (path === `/studies/${studyId}`) {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  const handleJoinStudy = async () => {
    // TODO: 가입 API 호출
    console.log('스터디 가입')
  }

  return (
    <div className={styles.studyLayout}>
      {/* 뒤로가기 버튼 */}
      <div className={styles.backButton}>
        <button onClick={() => router.push('/studies')}>
          ← 스터디 목록으로
        </button>
      </div>

      {/* 스터디 헤더 카드 */}
      <div className={styles.studyHeader}>
        <div className={styles.studyInfo}>
          <div className={styles.studyTitle}>
            <span className={styles.emoji}>{study.emoji}</span>
            <h1>{study.name}</h1>
          </div>
          <div className={styles.studyMeta}>
            <span>OWNER: {study.owner}</span>
            <span>·</span>
            <span>{study.currentMembers}/{study.maxMembers}명</span>
            <span>·</span>
            <span>{study.category}</span>
          </div>
        </div>
        <div className={styles.studyActions}>
          {!study.isMember ? (
            <button className={styles.joinButton} onClick={handleJoinStudy}>
              가입하기
            </button>
          ) : study.isAdmin ? (
            <Link href={`/studies/${studyId}/settings`} className={styles.settingsButton}>
              설정
            </Link>
          ) : (
            <Link href={`/studies/${studyId}/chat`} className={styles.chatButton}>
              채팅하기
            </Link>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <nav className={styles.tabNavigation}>
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            href={tab.path}
            className={`${styles.tab} ${isActiveTab(tab.path) ? styles.active : ''}`}
          >
            {tab.name}
          </Link>
        ))}
      </nav>

      {/* 탭별 콘텐츠 영역 */}
      <div className={styles.tabContent}>
        {children}
      </div>
    </div>
  )
}

