'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from '@/styles/dashboard/dashboard.module.css'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton'
import EmptyState from '@/components/dashboard/EmptyState'

export default function DashboardPage() {
  const [isLoading] = useState(false)
  const [user] = useState({
    name: '김민준',
    avatar: null
  })

  const stats = [
    { icon: '📚', label: '참여 스터디', value: 4, color: 'blue' },
    { icon: '📢', label: '새 공지', value: 3, color: 'green' },
    { icon: '✅', label: '할 일', value: 5, color: 'orange' },
    { icon: '📅', label: '다가올 일정', value: 2, color: 'purple' }
  ]

  const myStudies = [
    {
      id: 1,
      emoji: '📚',
      name: '코딩테스트 스터디',
      members: 12,
      role: 'OWNER',
      lastActivity: '1시간 전'
    },
    {
      id: 2,
      emoji: '💼',
      name: '취업 준비 스터디',
      members: 8,
      role: 'MEMBER',
      lastActivity: '3시간 전'
    },
    {
      id: 3,
      emoji: '📘',
      name: '영어 회화 스터디',
      members: 15,
      role: 'ADMIN',
      lastActivity: '5시간 전'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: '공지',
      badge: 'notice',
      study: '코딩테스트 스터디',
      content: '이번 주 일정 공지',
      time: '2시간 전'
    },
    {
      id: 2,
      type: '할일',
      badge: 'task',
      study: '취업 준비 스터디',
      content: '자소서 1차 작성 완료',
      time: '3시간 전'
    },
    {
      id: 3,
      type: '파일',
      badge: 'file',
      study: '영어 스터디',
      content: '단어장.pdf 업로드됨',
      time: '5시간 전'
    },
    {
      id: 4,
      type: '채팅',
      badge: 'chat',
      study: '코딩테스트 스터디',
      content: '김철수: 오늘 저녁 회의 참석 가능...',
      time: '6시간 전'
    },
    {
      id: 5,
      type: '일정',
      badge: 'calendar',
      study: '취업 준비 스터디',
      content: '모의면접 (내일 오후 2시)',
      time: '1일 전'
    }
  ]

  // 로딩 상태
  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className={styles.container}>
      {/* 환영 메시지 */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>안녕하세요, {user.name}님! 👋</h1>
      </div>

      {/* 통계 카드 */}
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={`${styles.statCard} ${styles[stat.color]}`}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* 내 스터디 섹션 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>내 스터디</h2>
          <Link href="/studies?filter=my" className={styles.viewAllLink}>
            전체 보기 →
          </Link>
        </div>

        {myStudies.length === 0 ? (
          <EmptyState type="studies" />
        ) : (
          <div className={styles.studiesGrid}>
            {myStudies.map((study) => (
              <Link
                key={study.id}
                href={`/studies/${study.id}`}
                className={styles.studyCard}
              >
                <div className={styles.studyEmoji}>{study.emoji}</div>
                <h3 className={styles.studyName}>{study.name}</h3>
                <div className={styles.studyMeta}>
                  <span className={styles.studyMembers}>{study.members}명 참여</span>
                  <span className={styles.studyRole}>{study.role}</span>
                </div>
                <div className={styles.studyActivity}>
                  마지막 활동: {study.lastActivity}
                </div>
                <div className={styles.studyActions}>
                  <button className={styles.actionButton} onClick={(e) => e.preventDefault()}>
                    💬 채팅
                  </button>
                  <button className={styles.actionButton} onClick={(e) => e.preventDefault()}>
                    📢 공지
                  </button>
                  <button className={styles.actionButton} onClick={(e) => e.preventDefault()}>
                    📁 파일
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 최근 활동 섹션 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>최근 활동</h2>
          <Link href="/notifications" className={styles.viewAllLink}>
            전체 보기 →
          </Link>
        </div>

        {recentActivities.length === 0 ? (
          <EmptyState type="activities" />
        ) : (
          <div className={styles.activitiesList}>
            {recentActivities.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <span className={`${styles.activityBadge} ${styles[activity.badge]}`}>
                  [{activity.type}]
                </span>
                <div className={styles.activityContent}>
                  <span className={styles.activityStudy}>{activity.study}</span>
                  <span className={styles.activityText}> - {activity.content}</span>
                </div>
                <span className={styles.activityTime}>{activity.time}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
