'use client'

import styles from './ActivityStats.module.css'

export default function ActivityStats({ stats }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeader}>4. 활동 통계</h2>

      <div className={styles.statsContainer}>
        {/* 이번 주 활동 */}
        <div className={styles.statsGroup}>
          <h3 className={styles.statsGroupTitle}>📊 이번 주 활동</h3>
          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>완료한 할 일</span>
              <span className={styles.statValue}>{stats.thisWeek.completedTasks}개</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>작성한 공지</span>
              <span className={styles.statValue}>{stats.thisWeek.createdNotices}개</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>업로드한 파일</span>
              <span className={styles.statValue}>{stats.thisWeek.uploadedFiles}개</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>참여한 채팅</span>
              <span className={styles.statValue}>{stats.thisWeek.chatMessages}회</span>
            </div>
          </div>
        </div>

        {/* 전체 통계 */}
        <div className={styles.statsGroup}>
          <h3 className={styles.statsGroupTitle}>🏆 전체 통계</h3>
          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>총 참여 스터디</span>
              <span className={styles.statValue}>{stats.total.studyCount}개</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>총 완료 할 일</span>
              <span className={styles.statValue}>{stats.total.completedTasks}개</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>평균 출석률</span>
              <span className={styles.statValue}>{stats.total.averageAttendance}%</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>가입 기간</span>
              <span className={styles.statValue}>{stats.total.joinedDays}일차</span>
            </div>
          </div>
        </div>

        {/* 달성 배지 */}
        {stats.badges && stats.badges.length > 0 && (
          <div className={styles.statsGroup}>
            <h3 className={styles.statsGroupTitle}>💪 달성 배지</h3>
            <div className={styles.badgesList}>
              {stats.badges.map((badge) => (
                <div key={badge.id} className={styles.badge}>
                  <span className={styles.badgeIcon}>{badge.icon}</span>
                  <div className={styles.badgeInfo}>
                    <span className={styles.badgeName}>{badge.name}</span>
                    <span className={styles.badgeDesc}>{badge.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

