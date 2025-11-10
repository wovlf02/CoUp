'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
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
      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 페이지 헤더 - 일관된 스타일 */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>📊 대시보드</h1>
            <p className={styles.subtitle}>
              나의 활동을 한눈에 확인하세요
            </p>
          </div>
        </header>

        {/* 환영 메시지 */}
        <div className={styles.welcomeSection}>
          <p className={styles.welcomeMessage}>안녕하세요, {user.name}님! 👋</p>
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
            <Link href="/my-studies" className={styles.viewAllLink}>
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
                  href={`/my-studies/${study.id}`}
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

      {/* 우측 사이드바 위젯 */}
      <aside className={styles.sidebar}>
        {/* 1. 오늘의 할 일 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>🔥 오늘의 할 일</h3>
          <div className={styles.widgetContent}>
            <div className={styles.todoItem}>
              <input type="checkbox" className={styles.todoCheckbox} />
              <div className={styles.todoInfo}>
                <p className={styles.todoText}>백준 1234번 풀이</p>
                <p className={styles.todoMeta}>코딩테스트 • D-day</p>
              </div>
            </div>
            <div className={styles.todoItem}>
              <input type="checkbox" className={styles.todoCheckbox} />
              <div className={styles.todoInfo}>
                <p className={styles.todoText}>자소서 1차 작성</p>
                <p className={styles.todoMeta}>취업준비 • D-1</p>
              </div>
            </div>
            <div className={styles.todoItem}>
              <input type="checkbox" className={styles.todoCheckbox} />
              <div className={styles.todoInfo}>
                <p className={styles.todoText}>영어 단어 100개 암기</p>
                <p className={styles.todoMeta}>영어회화 • D-day</p>
              </div>
            </div>
            <Link href="/tasks" className={styles.widgetLink}>
              할 일 전체보기 →
            </Link>
          </div>
        </div>

        {/* 2. 다가오는 일정 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>📅 다가오는 일정</h3>
          <div className={styles.widgetContent}>
            <div className={styles.eventItem}>
              <div className={styles.eventDate}>
                <span className={styles.eventDay}>오늘</span>
                <span className={styles.eventTime}>14:00</span>
              </div>
              <div className={styles.eventInfo}>
                <p className={styles.eventTitle}>주간 회의</p>
                <p className={styles.eventStudy}>코딩테스트</p>
              </div>
            </div>
            <div className={styles.eventItem}>
              <div className={styles.eventDate}>
                <span className={styles.eventDay}>내일</span>
                <span className={styles.eventTime}>20:00</span>
              </div>
              <div className={styles.eventInfo}>
                <p className={styles.eventTitle}>모의 면접</p>
                <p className={styles.eventStudy}>취업준비</p>
              </div>
            </div>
            <div className={styles.eventItem}>
              <div className={styles.eventDate}>
                <span className={styles.eventDay}>11/11</span>
                <span className={styles.eventTime}>23:59</span>
              </div>
              <div className={styles.eventInfo}>
                <p className={styles.eventTitle}>과제 제출</p>
                <p className={styles.eventStudy}>영어회화</p>
              </div>
            </div>
            <Link href="/my-studies" className={styles.widgetLink}>
              일정 전체보기 →
            </Link>
          </div>
        </div>

        {/* 3. 스터디 현황 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>📊 나의 스터디 현황</h3>
          <div className={styles.widgetContent}>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>총 참여 스터디</span>
              <span className={styles.statItemValue}>4개</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>그룹장</span>
              <span className={styles.statItemValue}>1개</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>이번 주 출석</span>
              <span className={styles.statItemValue}>5/7일</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>완료한 할 일</span>
              <span className={styles.statItemValue}>12개</span>
            </div>
          </div>
        </div>

        {/* 4. 빠른 액션 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>⚡ 빠른 액션</h3>
          <div className={styles.widgetContent}>
            <div className={styles.quickActionGrid}>
              <Link href="/studies" className={styles.quickActionBtn}>
                🔍 스터디 찾기
              </Link>
              <Link href="/studies/create" className={styles.quickActionBtn}>
                ➕ 스터디 만들기
              </Link>
            </div>
            <Link href="/tasks" className={styles.quickActionBtnFull}>
              ✅ 할 일 추가
            </Link>
          </div>
        </div>
      </aside>
    </div>
  )
}
