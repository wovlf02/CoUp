// 내 스터디 목록 페이지
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useMyStudies } from '@/lib/hooks/useApi';

export default function MyStudiesListPage() {
  const [activeTab, setActiveTab] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // 실제 API 호출 - 충분히 많은 데이터를 가져옴
  const { data, isLoading, error } = useMyStudies({
    limit: 1000, // 충분히 큰 값으로 전체 데이터 가져오기
  });

  const allStudies = data?.data || [];

  // 클라이언트 측 필터링
  const getFilteredStudies = () => {
    switch (activeTab) {
      case '참여중':
        // MEMBER만 (OWNER, ADMIN 제외)
        return allStudies.filter(s => s.role === 'MEMBER');
      case '관리중':
        // OWNER 또는 ADMIN
        return allStudies.filter(s => ['OWNER', 'ADMIN'].includes(s.role));
      case '대기중':
        // PENDING (승인 대기 중)
        return allStudies.filter(s => s.role === 'PENDING');
      case '전체':
      default:
        return allStudies;
    }
  };

  const filteredStudies = getFilteredStudies();

  // 클라이언트 측 페이지네이션
  const totalPages = Math.ceil(filteredStudies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const myStudies = filteredStudies.slice(startIndex, endIndex);

  // 탭별 카운트 계산
  const tabs = [
    { label: '전체', count: allStudies.length },
    { label: '참여중', count: allStudies.filter(s => s.role === 'MEMBER').length },
    { label: '관리중', count: allStudies.filter(s => ['OWNER', 'ADMIN'].includes(s.role)).length },
    { label: '대기중', count: allStudies.filter(s => s.role === 'PENDING').length },
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

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.loading}>내 스터디를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.error}>
            스터디를 불러오는데 실패했습니다. 다시 시도해주세요.
          </div>
        </div>
      </div>
    );
  }

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
              onClick={() => {
                setActiveTab(tab.label);
                setCurrentPage(1);
              }}
            >
              {tab.label} {tab.count > 0 && <span className={styles.tabCount}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* 스터디 목록 */}
        {myStudies.length === 0 ? (
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
        ) : (
          <>
            <div className={styles.studiesList}>
              {myStudies.map((study, index) => {
                const badge = getRoleBadge(study.role);

                // 빠른 액션 버튼 데이터
                const quickActions = [
                  { id: 'chat', label: '💬 채팅' },
                  { id: 'notices', label: '📢 공지' },
                  { id: 'files', label: '📁 파일' },
                  { id: 'calendar', label: '📅 캘린더' }
                ];

                // 안전한 고유 key 생성
                const uniqueKey = study.id || study.studyId || `study-${index}`;

                return (
                  <Link
                    key={uniqueKey}
                    href={`/my-studies/${study.study?.id || study.studyId}`}
                    className={`${styles.studyCard} ${study.newMessages > 0 ? styles.hasUnread : ''}`}
                  >
                    {/* 카드 헤더 */}
                    <div className={styles.cardHeader}>
                      <div className={styles.studyInfo}>
                        <div className={styles.emoji}>{study.study?.emoji || '📚'}</div>
                        <div className={styles.studyTitle}>
                          <h3 className={styles.studyName}>{study.study?.name || '스터디'}</h3>
                          <span className={`${styles.roleBadge} ${styles[badge.color]}`}>
                            {badge.icon} {badge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 설명 */}
                    <p className={styles.description}>{study.study?.description || ''}</p>

                    {/* 메타 정보 */}
                    <div className={styles.cardMeta}>
                      <span className={styles.members}>
                        👥 {study.study?.currentMembers || 0}/{study.study?.maxMembers || 0}명
                      </span>
                      <span className={styles.lastActivity}>
                        ⏱️ {new Date(study.joinedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* 빠른 액션 버튼 */}
                    <div className={styles.quickActions}>
                      {quickActions.map((action) => (
                        <button
                          key={`${uniqueKey}-${action.id}`}
                          className={styles.actionButton}
                          onClick={(e) => e.preventDefault()}
                        >
                          {action.label}
                        </button>
                      ))}
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
          </>
        )}
      </div>

      {/* 우측 사이드바 - 활동 요약 위젯 */}
      <aside className={styles.sidebar}>
        {/* 나의 활동 요약 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>📊 나의 활동 요약</h3>
          <div className={styles.widgetContent}>
            <div className={styles.summarySection}>
              <div className={styles.summaryLabel}>참여 스터디</div>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryValue}>{allStudies.length}개</span>
                  <span className={styles.summaryDesc}>전체</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryValue}>
                    {allStudies.filter(s => s.role === 'MEMBER').length}개
                  </span>
                  <span className={styles.summaryDesc}>참여중</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryValue}>
                    {allStudies.filter(s => ['ADMIN', 'OWNER'].includes(s.role)).length}개
                  </span>
                  <span className={styles.summaryDesc}>관리중</span>
                </div>
              </div>
            </div>
          </div>
          <Link href="/me" className={styles.widgetLink}>
            내 프로필 보기 →
          </Link>
        </div>

        {/* 빠른 링크 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>⚡ 빠른 이동</h3>
          <div className={styles.widgetContent}>
            <Link href="/tasks" className={styles.quickLink}>
              ✅ 내 할일 관리
            </Link>
            <Link href="/notifications" className={styles.quickLink}>
              🔔 알림 확인
            </Link>
            <Link href="/studies" className={styles.quickLink}>
              🔍 스터디 탐색
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
