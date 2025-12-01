// 내 스터디 목록 페이지
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { useMyStudies } from '@/lib/hooks/useApi';
import { handleReactQueryError, getUserFriendlyError } from '@/lib/exceptions/my-studies-errors';
import { useToast } from '@/components/admin/ui/Toast';

// Skeleton 컴포넌트
function StudyCardSkeleton() {
  return (
    <div className={styles.studyCard} style={{ opacity: 0.7 }}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonBadge} />
        <div className={styles.skeletonTitle} />
      </div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} style={{ width: '80%' }} />
      </div>
      <div className={styles.skeletonActions}>
        <div className={styles.skeletonButton} />
        <div className={styles.skeletonButton} />
        <div className={styles.skeletonButton} />
      </div>
    </div>
  );
}

// 빈 상태 메시지 정의
const EMPTY_MESSAGES = {
  전체: {
    icon: '📚',
    title: '아직 참여 중인 스터디가 없어요',
    description: '지금 바로 관심있는 스터디를 찾아보세요!',
    cta: '스터디 둘러보기',
    href: '/studies'
  },
  참여중: {
    icon: '👤',
    title: '참여 중인 스터디가 없습니다',
    description: '새로운 스터디에 참여하여 함께 공부해보세요',
    cta: '스터디 찾기',
    href: '/studies'
  },
  관리중: {
    icon: '⭐',
    title: '관리 중인 스터디가 없습니다',
    description: '스터디를 만들어 리더가 되어보세요!',
    cta: '스터디 만들기',
    href: '/studies/create'
  },
  대기중: {
    icon: '⏳',
    title: '승인 대기 중인 스터디가 없습니다',
    description: '관심있는 스터디에 참여 신청을 해보세요',
    cta: '스터디 둘러보기',
    href: '/studies'
  }
};

export default function MyStudiesListPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false);

  const itemsPerPage = 5;

  // React Query 설정 with 에러 처리
  const { data, isLoading, error, refetch, isError } = useMyStudies({
    limit: 1000,
    onError: (error) => {
      // 네트워크 에러
      if (!window.navigator.onLine || error.message?.includes('Network')) {
        showToast({
          message: '네트워크 연결을 확인해주세요',
          type: 'error'
        });
        return;
      }

      // 타임아웃
      if (error.name === 'AbortError') {
        showToast({
          message: '요청 시간이 초과되었습니다',
          type: 'error'
        });
        return;
      }

      // 인증 에러
      if (error.response?.status === 401 || error.response?.status === 403) {
        showToast({
          message: '로그인이 필요합니다',
          type: 'error'
        });
        setTimeout(() => router.push('/auth/signin'), 1500);
        return;
      }

      // 서버 에러
      if (error.response?.status >= 500) {
        showToast({
          message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
          type: 'error'
        });
        return;
      }

      // 일반 에러
      showToast({
        message: '스터디 목록을 불러오는데 문제가 발생했습니다',
        type: 'error'
      });
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // 무한 로딩 방지 (10초 타임아웃)
  useEffect(() => {
    let timer;

    if (isLoading) {
      timer = setTimeout(() => {
        setIsLoadingTimeout(true);
      }, 10000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      if (!isLoading && isLoadingTimeout) {
        setIsLoadingTimeout(false);
      }
    };
  }, [isLoading, isLoadingTimeout]);

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

  // 로딩 상태 - Skeleton UI
  if (isLoading && !isLoadingTimeout) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>👥 내 스터디</h1>
              <p className={styles.subtitle}>
                참여 중인 스터디를 관리하고 활동하세요
              </p>
            </div>
          </div>

          <div className={styles.tabs}>
            {['전체', '참여중', '관리중', '대기중'].map((label) => (
              <div key={label} className={styles.skeletonTab} />
            ))}
          </div>

          <div className={styles.studiesList}>
            {[1, 2, 3].map((i) => (
              <StudyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 타임아웃 발생 시
  if (isLoadingTimeout) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.timeoutMessage}>
            <div className={styles.timeoutIcon}>⏱️</div>
            <h3>요청 시간이 초과되었습니다</h3>
            <p>네트워크 상태를 확인하고 다시 시도해주세요</p>
            <button onClick={() => refetch()} className={styles.retryButton}>
              🔄 다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 - 개선된 UI
  if (isError) {
    const errorInfo = handleReactQueryError(error);
    const friendlyError = errorInfo?.error || {
      userMessage: '스터디를 불러올 수 없습니다',
      message: '다시 시도해주세요'
    };

    // 에러 카테고리별 아이콘
    const getErrorIcon = () => {
      if (!window.navigator.onLine || error.message?.includes('Network')) return '🌐';
      if (error.response?.status === 401 || error.response?.status === 403) return '🔒';
      if (error.response?.status >= 500) return '🔧';
      return '⚠️';
    };

    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>{getErrorIcon()}</div>
            <h3 className={styles.errorTitle}>
              {friendlyError.userMessage || '스터디를 불러올 수 없습니다'}
            </h3>
            <p className={styles.errorDescription}>
              {friendlyError.message || '다시 시도해주세요'}
            </p>
            <div className={styles.errorActions}>
              <button
                onClick={() => refetch()}
                className={styles.retryButton}
              >
                🔄 다시 시도
              </button>
              <Link href="/studies" className={styles.exploreButton}>
                스터디 둘러보기
              </Link>
            </div>
            {process.env.NODE_ENV === 'development' && errorInfo && (
              <details className={styles.errorDetails}>
                <summary>개발자 정보</summary>
                <pre>{JSON.stringify(errorInfo, null, 2)}</pre>
              </details>
            )}
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
            {(() => {
              const emptyMessage = EMPTY_MESSAGES[activeTab] || EMPTY_MESSAGES['전체'];
              return (
                <>
                  <div className={styles.emptyIcon}>{emptyMessage.icon}</div>
                  <h3 className={styles.emptyTitle}>{emptyMessage.title}</h3>
                  <p className={styles.emptyText}>{emptyMessage.description}</p>
                  <Link href={emptyMessage.href} className={styles.exploreButton}>
                    {emptyMessage.cta} →
                  </Link>
                </>
              );
            })()}
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
