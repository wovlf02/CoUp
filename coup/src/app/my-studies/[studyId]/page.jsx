// 내 스터디 대시보드 (개요)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { myStudyDashboard } from '@/mocks/studyDetails';

export default function MyStudyDashboardPage({ params }) {
  const router = useRouter();
  const { studyId } = params;

  // Mock 데이터
  const data = myStudyDashboard[studyId] || myStudyDashboard[1];
  const { study, weeklyActivity, recentNotices, recentFiles, upcomingEvents, urgentTasks } = data;

  const tabs = [
    { label: '개요', href: `/my-studies/${studyId}`, icon: '📊' },
    { label: '채팅', href: `/my-studies/${studyId}/chat`, icon: '💬' },
    { label: '공지', href: `/my-studies/${studyId}/notices`, icon: '📢' },
    { label: '파일', href: `/my-studies/${studyId}/files`, icon: '📁' },
    { label: '캘린더', href: `/my-studies/${studyId}/calendar`, icon: '📅' },
    { label: '할일', href: `/my-studies/${studyId}/tasks`, icon: '✅' },
    { label: '화상', href: `/my-studies/${studyId}/video-call`, icon: '📹' },
    { label: '설정', href: `/my-studies/${studyId}/settings`, icon: '⚙️', adminOnly: true },
  ];

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button onClick={() => router.push('/my-studies')} className={styles.backButton}>
          ← 내 스터디 목록
        </button>

        <div className={styles.studyHeader}>
          <div className={styles.studyInfo}>
            <span className={styles.emoji}>{study.emoji}</span>
            <div>
              <h1 className={styles.studyName}>{study.name}</h1>
              <p className={styles.studyMeta}>
                👥 {study.members.current}/{study.members.max}명
              </p>
            </div>
          </div>
          <span className={`${styles.roleBadge} ${styles[study.role.toLowerCase()]}`}>
            {study.role === 'OWNER' ? '👑' : study.role === 'ADMIN' ? '⭐' : '👤'} {study.role}
          </span>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className={styles.tabs}>
        {tabs
          .filter(tab => !tab.adminOnly || ['OWNER', 'ADMIN'].includes(study.role))
          .map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`${styles.tab} ${tab.label === '개요' ? styles.active : ''}`}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </Link>
          ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        <div className={styles.leftSection}>
          {/* 이번 주 활동 요약 */}
          <div className={styles.activitySummary}>
            <h2 className={styles.sectionTitle}>📊 이번 주 활동 요약</h2>

            <div className={styles.activityItem}>
              <div className={styles.activityLabel}>
                <span>출석률</span>
                <span className={styles.activityValue}>
                  {weeklyActivity.attendance}% ({weeklyActivity.attendanceCount})
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${weeklyActivity.attendance}%` }}
                ></div>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div className={styles.activityLabel}>
                <span>할일</span>
                <span className={styles.activityValue}>
                  {weeklyActivity.taskCompletion}% ({weeklyActivity.taskCount})
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${weeklyActivity.taskCompletion}%` }}
                ></div>
              </div>
            </div>

            <div className={styles.activityStats}>
              <span>💬 메시지 {weeklyActivity.messages}개</span>
              <span>📢 공지 {weeklyActivity.notices}개</span>
              <span>📁 파일 {weeklyActivity.files}개</span>
            </div>
          </div>

          {/* 그리드 섹션 */}
          <div className={styles.grid}>
            {/* 최근 공지 */}
            <div className={styles.gridCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>📢 최근 공지</h3>
                <Link href={`/my-studies/${studyId}/notices`} className={styles.moreLink}>
                  전체보기 →
                </Link>
              </div>
              <div className={styles.listItems}>
                {recentNotices.map((notice) => (
                  <div key={notice.id} className={styles.listItem}>
                    <div className={styles.itemContent}>
                      <span className={styles.itemTitle}>{notice.title}</span>
                      <span className={styles.itemMeta}>
                        {notice.author} · {notice.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 최근 파일 */}
            <div className={styles.gridCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>📁 최근 파일</h3>
                <Link href={`/my-studies/${studyId}/files`} className={styles.moreLink}>
                  전체보기 →
                </Link>
              </div>
              <div className={styles.listItems}>
                {recentFiles.map((file) => (
                  <div key={file.id} className={styles.listItem}>
                    <div className={styles.itemContent}>
                      <span className={styles.itemTitle}>{file.name}</span>
                      <span className={styles.itemMeta}>
                        {file.uploader} · {file.size}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 다가오는 일정 */}
            <div className={styles.gridCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>📅 다가오는 일정</h3>
                <Link href={`/my-studies/${studyId}/calendar`} className={styles.moreLink}>
                  캘린더 →
                </Link>
              </div>
              <div className={styles.listItems}>
                {upcomingEvents.map((event) => (
                  <div key={event.id} className={styles.listItem}>
                    <div className={styles.itemContent}>
                      <span className={styles.itemTitle}>{event.title}</span>
                      <span className={styles.itemMeta}>{event.date}</span>
                    </div>
                    <span className={styles.ddayBadge}>{event.dday}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 급한 할일 */}
            <div className={styles.gridCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>⚠️ 급한 할일</h3>
                <Link href={`/my-studies/${studyId}/tasks`} className={styles.moreLink}>
                  전체보기 →
                </Link>
              </div>
              <div className={styles.listItems}>
                {urgentTasks.map((task) => (
                  <div key={task.id} className={styles.listItem}>
                    <div className={styles.itemContent}>
                      <span className={styles.itemTitle}>{task.title}</span>
                      <span className={styles.itemMeta}>{task.date}</span>
                    </div>
                    <span className={styles.urgentBadge}>{task.dday}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 우측 위젯 */}
        <div className={styles.rightSection}>
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 스터디 현황</h3>
            <div className={styles.widgetContent}>
              <p className={styles.widgetText}>다음 일정: D-7</p>
              <p className={styles.widgetText}>2025.11.13 (수) 14:00</p>
              <p className={styles.widgetText}>주간 회의</p>
            </div>
          </div>

          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>👥 온라인 (3명)</h3>
            <div className={styles.widgetContent}>
              <div className={styles.onlineMember}>🟢 김철수</div>
              <div className={styles.onlineMember}>🟢 이영희</div>
              <div className={styles.onlineMember}>🟢 박민수</div>
            </div>
          </div>

          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>⚡ 빠른 액션</h3>
            <div className={styles.widgetActions}>
              <Link href={`/my-studies/${studyId}/chat`} className={styles.widgetButton}>
                💬 채팅
              </Link>
              <Link href={`/my-studies/${studyId}/video-call`} className={styles.widgetButton}>
                📹 화상
              </Link>
              <Link href="/studies" className={styles.widgetButton}>
                🔍 초대
              </Link>
              <Link href={`/my-studies/${studyId}/settings`} className={styles.widgetButton}>
                📊 통계
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
