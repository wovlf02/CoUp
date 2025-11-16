'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton'
import EmptyState from '@/components/dashboard/EmptyState'
import { dashboardData } from '@/mocks/dashboard'

export default function DashboardPage() {
  const [isLoading] = useState(false)
  const { user, stats, myStudies, recentActivities, todayTasks, upcomingEvents, studyStatus } = dashboardData

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
            {todayTasks.map((task, index) => (
              <div key={index} className={styles.todoItem}>
                <input type="checkbox" className={styles.todoCheckbox} />
                <div className={styles.todoInfo}>
                  <p className={styles.todoText}>{task.text}</p>
                  <p className={styles.todoMeta}>{task.meta}</p>
                </div>
              </div>
            ))}
            <Link href="/tasks" className={styles.widgetLink}>
              할 일 전체보기 →
            </Link>
          </div>
        </div>

        {/* 2. 다가오는 일정 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>📅 다가오는 일정</h3>
          <div className={styles.widgetContent}>
            {upcomingEvents.map((event, index) => (
              <div key={index} className={styles.eventItem}>
                <div className={styles.eventDate}>
                  <span className={styles.eventDay}>{event.day}</span>
                  <span className={styles.eventTime}>{event.time}</span>
                </div>
                <div className={styles.eventInfo}>
                  <p className={styles.eventTitle}>{event.title}</p>
                  <p className={styles.eventStudy}>{event.study}</p>
                </div>
              </div>
            ))}
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
              <span className={styles.statItemValue}>{studyStatus.totalStudies}개</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>그룹장</span>
              <span className={styles.statItemValue}>{studyStatus.leader}개</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>이번 주 출석</span>
              <span className={styles.statItemValue}>{studyStatus.attendance}일</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>완료한 할 일</span>
              <span className={styles.statItemValue}>{studyStatus.completedTasks}개</span>
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
