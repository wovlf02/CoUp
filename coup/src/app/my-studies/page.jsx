// 내 스터디 목록 페이지
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { mockMyStudies, urgentTasks, upcomingEvents, myActivitySummary } from '@/mocks/studies';

export default function MyStudiesListPage() {
  const [activeTab, setActiveTab] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(mockMyStudies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudies = mockMyStudies.slice(startIndex, endIndex);

  const tabs = [
    { label: '전체', count: mockMyStudies.length },
    { label: '참여중', count: mockMyStudies.filter(s => ['MEMBER', 'ADMIN', 'OWNER'].includes(s.role)).length },
    { label: '관리중', count: mockMyStudies.filter(s => ['ADMIN', 'OWNER'].includes(s.role)).length },
    { label: '대기중', count: 0 },
  ];

  const getRoleBadge = (role) => {
    const badges = {
      OWNER: { label: 'OWNER', icon: '👑', color: 'owner' },
      ADMIN: { label: 'ADMIN', icon: '⭐', color: 'admin' },
      MEMBER: { label: 'MEMBER', icon: '👤', color: 'member' },
      PENDING: { label: 'PENDING', icon: '⏳', color: 'pending' },
    };
    return badges[role] || badges.MEMBER;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.container}>
      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>👥 내 스터디</h1>
            <p className={styles.subtitle}>
              참여 중인 스터디를 관리하고 활동하세요
            </p>
          </div>
          <Link href="/studies/create" className={styles.createButton}>
            + 스터디 만들기
          </Link>
        </div>

        {/* 탭 필터 */}
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.label}
              className={`${styles.tab} ${activeTab === tab.label ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.label)}
            >
              {tab.label} {tab.count > 0 && <span className={styles.tabCount}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* 스터디 목록 */}
        <div className={styles.studiesList}>
          {currentStudies.map((study) => {
            const badge = getRoleBadge(study.role);

            return (
              <Link
                key={study.id}
                href={`/my-studies/${study.id}`}
                className={`${styles.studyCard} ${study.newMessages > 0 ? styles.hasUnread : ''}`}
              >
                {/* 카드 헤더 */}
                <div className={styles.cardHeader}>
                  <div className={styles.studyInfo}>
                    <div className={styles.emoji}>{study.emoji}</div>
                    <div className={styles.studyTitle}>
                      <h3 className={styles.studyName}>{study.name}</h3>
                      <span className={`${styles.roleBadge} ${styles[badge.color]}`}>
                        {badge.icon} {badge.label}
                      </span>
                    </div>
                  </div>
                  {(study.newMessages > 0 || study.newNotices > 0) && (
                    <div className={styles.notifications}>
                      {study.newMessages > 0 && (
                        <span className={styles.newBadge}>
                          💬 {study.newMessages}
                        </span>
                      )}
                      {study.newNotices > 0 && (
                        <span className={styles.newBadge}>
                          📢 {study.newNotices}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 설명 */}
                <p className={styles.description}>{study.description}</p>

                {/* 메타 정보 */}
                <div className={styles.cardMeta}>
                  <span className={styles.members}>
                    👥 {study.members.current}/{study.members.max}명
                  </span>
                  <span className={styles.lastActivity}>
                    ⏱️ {study.lastActivity}
                  </span>
                </div>

                {/* 빠른 액션 버튼 */}
                <div className={styles.quickActions}>
                  <button className={styles.actionButton} onClick={(e) => e.preventDefault()}>
                    💬 채팅
                  </button>
                  <button className={styles.actionButton} onClick={(e) => e.preventDefault()}>
                    📢 공지
                  </button>
                  <button className={styles.actionButton} onClick={(e) => e.preventDefault()}>
                    📁 파일
                  </button>
                  <button className={styles.actionButton} onClick={(e) => e.preventDefault()}>
                    📅 캘린더
                  </button>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationArrow}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.paginationButton} ${
                  currentPage === page ? styles.active : ''
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <button
              className={styles.paginationArrow}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              →
            </button>
          </div>
        )}

        {/* 빈 상태 */}
        {mockMyStudies.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>
            <h3 className={styles.emptyTitle}>아직 참여 중인 스터디가 없어요</h3>
            <p className={styles.emptyText}>
              지금 바로 관심있는 스터디를 찾아보세요!
            </p>
            <Link href="/studies" className={styles.exploreButton}>
              스터디 둘러보기 →
            </Link>
          </div>
        )}
      </div>

      {/* 우측 사이드바 - 활동 요약 위젯 */}
      <aside className={styles.sidebar}>
        {/* 1. 나의 활동 요약 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>📊 나의 활동 요약</h3>
          <div className={styles.widgetContent}>
            <div className={styles.summarySection}>
              <div className={styles.summaryLabel}>참여 스터디</div>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryValue}>{myActivitySummary.totalStudies}개</span>
                  <span className={styles.summaryDesc}>전체</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryValue}>{myActivitySummary.managingStudies}개</span>
                  <span className={styles.summaryDesc}>관리중</span>
                </div>
              </div>
            </div>

            <div className={styles.summarySection}>
              <div className={styles.summaryLabel}>새 소식</div>
              <div className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <span>💬 읽지 않은 메시지</span>
                  <span className={styles.highlight}>{myActivitySummary.unreadMessages}개</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>📢 새 공지</span>
                  <span className={styles.highlight}>{myActivitySummary.newNotices}개</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>📁 새 파일</span>
                  <span className={styles.highlight}>{myActivitySummary.newFiles}개</span>
                </div>
              </div>
            </div>

            <div className={styles.summarySection}>
              <div className={styles.summaryLabel}>이번 주 활동</div>
              <div className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <span>출석</span>
                  <span>{myActivitySummary.weeklyAttendance.current}/{myActivitySummary.weeklyAttendance.total}일</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>완료 할일</span>
                  <span>{myActivitySummary.completedTasks}개</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>채팅 메시지</span>
                  <span>{myActivitySummary.chatMessages}개</span>
                </div>
              </div>
            </div>
          </div>
          <Link href="/me/stats" className={styles.widgetLink}>
            내 통계 자세히 →
          </Link>
        </div>

        {/* 2. 급한 할일 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>🔥 급한 할일 ({urgentTasks.length})</h3>
          <div className={styles.widgetContent}>
            {urgentTasks.map((task) => (
              <div key={task.id} className={styles.taskItem}>
                <div className={styles.taskHeader}>
                  <span className={styles.taskStudy}>[{task.studyName}]</span>
                  <span className={`${styles.taskDDay} ${
                    task.dDay === 0 ? styles.today :
                    task.dDay === 1 ? styles.tomorrow : ''
                  }`}>
                    D-{task.dDay}
                  </span>
                </div>
                <div className={styles.taskTitle}>{task.title}</div>
                <div className={styles.taskDate}>{task.date}</div>
              </div>
            ))}
          </div>
          <Link href="/tasks" className={styles.widgetLink}>
            할일 전체보기 →
          </Link>
        </div>

        {/* 3. 다가오는 일정 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>📅 다가오는 일정</h3>
          <div className={styles.widgetContent}>
            {upcomingEvents.map((event) => (
              <div key={event.id} className={styles.eventItem}>
                <div className={styles.eventDate}>
                  <span className={styles.eventDay}>
                    {event.dDay === 0 ? '오늘' : event.dDay === 1 ? '내일' : event.date.slice(5)}
                  </span>
                  <span className={styles.eventTime}>{event.time}</span>
                </div>
                <div className={styles.eventInfo}>
                  <div className={styles.eventStudy}>[{event.studyName}]</div>
                  <div className={styles.eventTitle}>{event.title}</div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/calendar" className={styles.widgetLink}>
            캘린더 전체보기 →
          </Link>
        </div>

        {/* 4. 빠른 액션 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>⚡ 빠른 액션</h3>
          <div className={styles.widgetContent}>
            <Link href="/me/stats" className={styles.quickActionBtn}>
              📊 전체 통계 보기
            </Link>
            <Link href="/studies" className={styles.quickActionBtn}>
              🔍 스터디 더 찾기
            </Link>
            <Link href="/studies/create" className={styles.quickActionBtn}>
              ➕ 스터디 만들기
            </Link>
          </div>
        </div>

        {/* 5. 활동 팁 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>💡 활동 팁</h3>
          <div className={styles.widgetContent}>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>✅</span>
              <div className={styles.tipText}>
                <div className={styles.tipTitle}>매일 확인하기</div>
                <div className={styles.tipDesc}>새 소식을 놓치지 마세요</div>
              </div>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>💬</span>
              <div className={styles.tipText}>
                <div className={styles.tipTitle}>적극적으로 참여하기</div>
                <div className={styles.tipDesc}>댓글, 반응으로 소통</div>
              </div>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>📋</span>
              <div className={styles.tipText}>
                <div className={styles.tipTitle}>규칙 준수하기</div>
                <div className={styles.tipDesc}>스터디 규칙을 지켜주세요</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
