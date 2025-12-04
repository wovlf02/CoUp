// 내 스터디 공지사항 페이지
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useStudy, useNotices, useDeleteNotice, useTogglePinNotice } from '@/lib/hooks/useApi';
import NoticeCreateEditModal from '@/components/studies/NoticeCreateEditModal';
import { getStudyHeaderStyle } from '@/utils/studyColors';
import styles from './page.module.css';

export default function MyStudyNoticesPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const [activeTab, setActiveTab] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [detailNotice, setDetailNotice] = useState(null);

  // 실제 API 호출
  const queryClient = useQueryClient();
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
  const { data: noticesData, isLoading: noticesLoading } = useNotices(studyId);
  const deleteNotice = useDeleteNotice();
  const togglePin = useTogglePinNotice();

  const study = studyData?.data;
  const notices = noticesData?.data || [];

  // 상세 모달 닫기 (조회수 업데이트)
  const closeDetailModal = () => {
    setDetailNotice(null);
    // 캐시 무효화하여 강제 새로고침
    queryClient.invalidateQueries({ queryKey: ['studies', studyId, 'notices'] });
  };

  // 로딩 상태
  if (studyLoading || noticesLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>공지사항을 불러오는 중...</div>
      </div>
    );
  }

  // 스터디 없음
  if (!study) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>스터디를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const tabs = [
    { label: '개요', href: `/my-studies/${studyId}`, icon: '📊' },
    { label: '채팅', href: `/my-studies/${studyId}/chat`, icon: '💬' },
    { label: '공지', href: `/my-studies/${studyId}/notices`, icon: '📢' },
    { label: '파일', href: `/my-studies/${studyId}/files`, icon: '📁' },
    { label: '캘린더', href: `/my-studies/${studyId}/calendar`, icon: '📅' },
    { label: '할일', href: `/my-studies/${studyId}/tasks`, icon: '✅' },
    { label: '화상', href: `/my-studies/${studyId}/video-call`, icon: '📹' },
    { label: '멤버', href: `/my-studies/${studyId}/members`, icon: '👥', adminOnly: true },
    { label: '설정', href: `/my-studies/${studyId}/settings`, icon: '⚙️', adminOnly: true },
  ];

  const pinnedNotices = notices.filter(n => n.isPinned);
  const regularNotices = notices.filter(n => !n.isPinned);

  const noticeStats = {
    total: notices.length,
    pinned: pinnedNotices.length,
    important: notices.filter(n => n.isImportant).length,
    regular: notices.filter(n => !n.isImportant && !n.isPinned).length,
  };

  const canEdit = () => {
    return ['OWNER', 'ADMIN'].includes(study.myRole);
  };

  const handleDelete = async (noticeId) => {
    if (!confirm('정말 이 공지를 삭제하시겠습니까?')) return;

    try {
      await deleteNotice.mutateAsync({ studyId, noticeId });
      alert('공지가 삭제되었습니다');
    } catch (error) {
      console.error('공지 삭제 실패:', error);
      alert('공지 삭제에 실패했습니다');
    }
  };

  const handleTogglePin = async (noticeId) => {
    try {
      await togglePin.mutateAsync({ studyId, noticeId });
    } catch (error) {
      console.error('고정 토글 실패:', error);
      alert('고정 처리에 실패했습니다');
    }
  };

  // 공지 상세보기 (조회수 증가)
  const handleViewNotice = async (notice) => {
    try {
      // API 호출로 조회수 증가 (서버에서 +1 되고 캐시 무효화됨)
      const response = await fetch(`/api/studies/${studyId}/notices/${notice.id}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        // API에서 반환된 데이터로 모달 표시 (이미 증가된 조회수 포함)
        setDetailNotice(result.data);
      } else {
        // 실패 시 기존 데이터로 표시
        setDetailNotice(notice);
      }
    } catch (error) {
      console.error('공지 조회 실패:', error);
      // 에러 시 기존 데이터로 표시
      setDetailNotice(notice);
    }
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button onClick={() => router.push('/my-studies')} className={styles.backButton}>
          ← 내 스터디 목록
        </button>

        <div className={styles.studyHeader} style={getStudyHeaderStyle(studyId)}>
          <div className={styles.studyInfo}>
            <span className={styles.emoji}>{study.emoji}</span>
            <div>
              <h1 className={styles.studyName}>{study.name}</h1>
              <p className={styles.studyMeta}>
                👥 {study.currentMembers}/{study.maxMembers}명
              </p>
            </div>
          </div>
          <span className={`${styles.roleBadge} ${styles[study.myRole?.toLowerCase() || 'member']}`}>
            {study.myRole === 'OWNER' ? '👑' : study.myRole === 'ADMIN' ? '⭐' : '👤'} {study.myRole || 'MEMBER'}
          </span>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className={styles.tabs}>
        {tabs
          .filter(tab => !tab.adminOnly || ['OWNER', 'ADMIN'].includes(study.myRole))
          .map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`${styles.tab} ${tab.label === '공지' ? styles.active : ''}`}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </Link>
          ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 공지 목록 */}
        <div className={styles.noticeSection}>
          {/* 공지 헤더 */}
          <div className={styles.noticeHeader}>
            <h2 className={styles.noticeTitle}>📢 공지사항</h2>
            {canEdit() && (
              <button
                className={styles.createButton}
                onClick={() => {
                  setSelectedNotice(null);
                  setIsModalOpen(true);
                }}
              >
                + 새 공지
              </button>
            )}
          </div>

          {/* 필터 탭 */}
          <div className={styles.filterSection}>
            <div className={styles.filterTabs}>
              <button
                className={`${styles.filterTab} ${activeTab === '전체' ? styles.active : ''}`}
                onClick={() => setActiveTab('전체')}
              >
                전체 {noticeStats.total}
              </button>
              <button
                className={`${styles.filterTab} ${activeTab === '고정' ? styles.active : ''}`}
                onClick={() => setActiveTab('고정')}
              >
                고정 {noticeStats.pinned}
              </button>
              <button
                className={`${styles.filterTab} ${activeTab === '중요' ? styles.active : ''}`}
                onClick={() => setActiveTab('중요')}
              >
                중요 {noticeStats.important}
              </button>
              <button
                className={`${styles.filterTab} ${activeTab === '일반' ? styles.active : ''}`}
                onClick={() => setActiveTab('일반')}
              >
                일반 {noticeStats.regular}
              </button>
            </div>

            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="제목, 내용, 작성자 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className={styles.searchInput}
              />
              <button className={styles.searchButton}>🔍</button>
            </div>
          </div>

          {/* 고정 공지 */}
          {pinnedNotices.length > 0 && (
            <div className={styles.pinnedSection}>
              <h3 className={styles.sectionLabel}>📌 고정 공지 ({pinnedNotices.length})</h3>
              {pinnedNotices.map((notice) => (
                <div 
                  key={notice.id} 
                  className={styles.noticeCard}
                  onClick={() => handleViewNotice(notice)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.noticeCardHeader}>
                    <div className={styles.noticeTitleRow}>
                      <span className={styles.pinnedIcon}>📌</span>
                      <h4 className={styles.noticeCardTitle}>{notice.title}</h4>
                      {notice.isImportant && (
                        <span className={styles.importantBadge}>⭐ 중요</span>
                      )}
                    </div>
                    {canEdit() && (
                      <div className={styles.noticeActions}>
                        <button
                          className={styles.actionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNotice(notice);
                            setIsModalOpen(true);
                          }}
                        >
                          수정
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin(notice.id);
                          }}
                        >
                          고정 해제
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notice.id);
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.noticeAuthor}>
                    {notice.author?.name || '작성자'}({notice.author?.role || 'MEMBER'}) · {new Date(notice.createdAt).toLocaleString()}
                  </div>

                  <p className={styles.noticeContent}>{notice.content}</p>

                  <div className={styles.noticeStats}>
                    <span className={styles.stat}>👁 {notice.views || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 일반 공지 */}
          <div className={styles.regularSection}>
            <h3 className={styles.sectionLabel}>📄 최근 공지 ({regularNotices.length})</h3>
            {regularNotices.length === 0 ? (
              <div className={styles.emptyState}>
                <p>공지사항이 없습니다</p>
                {canEdit() && (
                  <button
                    className={styles.createButton}
                    onClick={() => {
                      setSelectedNotice(null);
                      setIsModalOpen(true);
                    }}
                  >
                    첫 공지 작성하기
                  </button>
                )}
              </div>
            ) : (
              regularNotices.map((notice) => (
                <div 
                  key={notice.id} 
                  className={styles.noticeCard}
                  onClick={() => handleViewNotice(notice)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.noticeCardHeader}>
                    <div className={styles.noticeTitleRow}>
                      <h4 className={styles.noticeCardTitle}>{notice.title}</h4>
                      {notice.isImportant && (
                        <span className={styles.importantBadge}>⭐ 중요</span>
                      )}
                    </div>
                    {canEdit() ? (
                      <div className={styles.noticeActions}>
                        <button
                          className={styles.actionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNotice(notice);
                            setIsModalOpen(true);
                          }}
                        >
                          수정
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin(notice.id);
                          }}
                        >
                          고정
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notice.id);
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    ) : (
                      <button 
                        className={styles.reportBtn}
                        onClick={(e) => e.stopPropagation()}
                      >
                        신고
                      </button>
                    )}
                  </div>

                  <div className={styles.noticeAuthor}>
                    {notice.author?.name || '작성자'}({notice.author?.role || 'MEMBER'}) · {new Date(notice.createdAt).toLocaleString()}
                  </div>

                  <p className={styles.noticeContent}>{notice.content}</p>

                  <div className={styles.noticeStats}>
                    <span className={styles.stat}>👁 {notice.views || 0}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 우측 위젯 */}
        <aside className={styles.sidebar}>
          {/* 고정 공지 요약 */}
          {pinnedNotices.length > 0 && (
            <div className={styles.widget}>
              <h3 className={styles.widgetTitle}>📌 고정 공지</h3>
              <div className={styles.widgetContent}>
                {pinnedNotices.slice(0, 3).map((notice) => (
                  <div key={notice.id} className={styles.pinnedItem}>
                    <div className={styles.pinnedItemTitle}>{notice.title}</div>
                    <div className={styles.pinnedItemTime}>{new Date(notice.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 빠른 작성 */}
          {canEdit() && (
            <div className={styles.widget}>
              <h3 className={styles.widgetTitle}>⚡ 빠른 작성</h3>
              <div className={styles.widgetContent}>
                <button
                  className={styles.newNoticeBtn}
                  onClick={() => {
                    setSelectedNotice(null);
                    setIsModalOpen(true);
                  }}
                >
                  + 새 공지 작성
                </button>
              </div>
            </div>
          )}

          {/* 통계 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 공지 통계</h3>
            <div className={styles.widgetContent}>
              <div className={styles.statRow}>
                <span>전체 공지:</span>
                <span className={styles.statValue}>{noticeStats.total}개</span>
              </div>
              <div className={styles.statRow}>
                <span>• 고정:</span>
                <span>{noticeStats.pinned}개</span>
              </div>
              <div className={styles.statRow}>
                <span>• 중요:</span>
                <span>{noticeStats.important}개</span>
              </div>
              <div className={styles.statRow}>
                <span>• 일반:</span>
                <span>{noticeStats.regular}개</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 공지 작성/수정 모달 */}
      {isModalOpen && (
        <NoticeCreateEditModal
          studyId={studyId}
          notice={selectedNotice}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedNotice(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedNotice(null);
          }}
        />
      )}

      {/* 공지 상세보기 모달 */}
      {detailNotice && (
        <div className={styles.detailModalOverlay} onClick={closeDetailModal}>
          <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.detailHeader}>
              <div className={styles.detailTitleSection}>
                {detailNotice.isPinned && <span className={styles.pinnedBadge}>📌 고정</span>}
                {detailNotice.isImportant && <span className={styles.importantBadgeLarge}>⭐ 중요</span>}
                <h2 className={styles.detailTitle}>{detailNotice.title}</h2>
              </div>
              <button className={styles.closeBtn} onClick={closeDetailModal}>✕</button>
            </div>

            <div className={styles.detailMeta}>
              <div className={styles.authorInfo}>
                <span className={styles.authorAvatar}>
                  {detailNotice.author?.avatar ? (
                    <img src={detailNotice.author.avatar} alt="avatar" />
                  ) : (
                    '👤'
                  )}
                </span>
                <div>
                  <span className={styles.authorName}>{detailNotice.author?.name || '작성자'}</span>
                  <span className={styles.authorRole}>({detailNotice.author?.role || 'MEMBER'})</span>
                </div>
              </div>
              <div className={styles.detailTime}>
                <span>작성: {new Date(detailNotice.createdAt).toLocaleString()}</span>
                {detailNotice.updatedAt && detailNotice.updatedAt !== detailNotice.createdAt && (
                  <span> · 수정: {new Date(detailNotice.updatedAt).toLocaleString()}</span>
                )}
              </div>
            </div>

            <div className={styles.detailContent}>
              {detailNotice.content.split('\n').map((line, idx) => (
                <p key={idx}>{line || <br />}</p>
              ))}
            </div>

            <div className={styles.detailFooter}>
              <div className={styles.detailStats}>
                <span>👁 조회 {detailNotice.views || 0}</span>
              </div>
              {canEdit() && (
                <div className={styles.detailActions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => {
                      closeDetailModal();
                      setSelectedNotice(detailNotice);
                      setIsModalOpen(true);
                    }}
                  >
                    ✏️ 수정
                  </button>
                  <button
                    className={styles.pinBtn}
                    onClick={async () => {
                      await handleTogglePin(detailNotice.id);
                      closeDetailModal();
                    }}
                  >
                    {detailNotice.isPinned ? '📌 고정 해제' : '📌 고정'}
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={async () => {
                      await handleDelete(detailNotice.id);
                      closeDetailModal();
                    }}
                  >
                    🗑 삭제
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
