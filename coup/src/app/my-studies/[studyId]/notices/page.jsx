// 내 스터디 공지사항 페이지
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { studyNoticesData } from '@/mocks/studyNotices';

export default function MyStudyNoticesPage({ params }) {
  const router = useRouter();
  const { studyId } = params;
  const [activeTab, setActiveTab] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Mock 데이터
  const data = studyNoticesData[studyId] || studyNoticesData[1];
  const { study, notices } = data;

  const tabs = [
    { label: '개요', href: `/my-studies/${studyId}`, icon: '📊' },
    { label: '채팅', href: `/my-studies/${studyId}/chat`, icon: '💬' },
    { label: '공지', href: `/my-studies/${studyId}/notices`, icon: '📢' },
    { label: '파일', href: `/my-studies/${studyId}/files`, icon: '📁' },
    { label: '캘린더', href: `/my-studies/${studyId}/calendar`, icon: '📅' },
    { label: '할일', href: `/my-studies/${studyId}/tasks`, icon: '✅' },
    { label: '화상', href: `/my-studies/${studyId}/video-call`, icon: '📹' },
    { label: '설정', href: `/my-studies/${studyId}/settings`, icon: '⚙️' },
  ];

  const pinnedNotices = notices.filter(n => n.isPinned);
  const regularNotices = notices.filter(n => !n.isPinned);

  const noticeStats = {
    total: notices.length,
    pinned: pinnedNotices.length,
    important: notices.filter(n => n.isImportant).length,
    regular: notices.filter(n => !n.isImportant && !n.isPinned).length,
  };

  const canEdit = (notice) => {
    return ['OWNER', 'ADMIN'].includes(study.role);
  };

  const handleNoticeClick = (notice) => {
    setSelectedNotice(notice);
  };

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
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
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
                onClick={() => setIsModalOpen(true)}
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
                  onClick={() => handleNoticeClick(notice)}
                >
                  <div className={styles.noticeCardHeader}>
                    <div className={styles.noticeTitleRow}>
                      <span className={styles.pinnedIcon}>📌</span>
                      <h4 className={styles.noticeCardTitle}>{notice.title}</h4>
                      {notice.isImportant && (
                        <span className={styles.importantBadge}>⭐ 중요</span>
                      )}
                    </div>
                    {canEdit(notice) && (
                      <div className={styles.noticeActions}>
                        <button className={styles.actionBtn}>수정</button>
                        <button className={styles.actionBtn}>삭제</button>
                      </div>
                    )}
                  </div>

                  <div className={styles.noticeAuthor}>
                    {notice.author.name}({notice.author.role}) · {notice.createdAt}
                  </div>

                  <p className={styles.noticeContent}>{notice.content}</p>

                  <div className={styles.noticeStats}>
                    <span className={styles.stat}>💬 {notice.comments}</span>
                    <span className={styles.stat}>👁 {notice.views}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 일반 공지 */}
          <div className={styles.regularSection}>
            <h3 className={styles.sectionLabel}>📄 최근 공지 ({regularNotices.length})</h3>
            {regularNotices.map((notice) => (
              <div
                key={notice.id}
                className={styles.noticeCard}
                onClick={() => handleNoticeClick(notice)}
              >
                <div className={styles.noticeCardHeader}>
                  <div className={styles.noticeTitleRow}>
                    <h4 className={styles.noticeCardTitle}>{notice.title}</h4>
                    {notice.isImportant && (
                      <span className={styles.importantBadge}>⭐ 중요</span>
                    )}
                  </div>
                  {canEdit(notice) ? (
                    <div className={styles.noticeActions}>
                      <button className={styles.actionBtn}>수정</button>
                      <button className={styles.actionBtn}>삭제</button>
                    </div>
                  ) : (
                    <button className={styles.reportBtn}>신고</button>
                  )}
                </div>

                <div className={styles.noticeAuthor}>
                  {notice.author.name}({notice.author.role}) · {notice.createdAt}
                </div>

                <p className={styles.noticeContent}>{notice.content}</p>

                <div className={styles.noticeStats}>
                  <span className={styles.stat}>💬 {notice.comments}</span>
                  <span className={styles.stat}>👁 {notice.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 우측 위젯 */}
        <aside className={styles.sidebar}>
          {/* 고정 공지 요약 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📌 고정 공지</h3>
            <div className={styles.widgetContent}>
              {pinnedNotices.slice(0, 3).map((notice) => (
                <div key={notice.id} className={styles.pinnedItem}>
                  <div className={styles.pinnedItemTitle}>{notice.title}</div>
                  <div className={styles.pinnedItemTime}>{notice.createdAt}</div>
                </div>
              ))}
            </div>
            {pinnedNotices.length > 3 && (
              <Link href="#" className={styles.widgetLink}>
                전체 보기 →
              </Link>
            )}
          </div>

          {/* 빠른 작성 */}
          {canEdit() && (
            <div className={styles.widget}>
              <h3 className={styles.widgetTitle}>⚡ 빠른 작성</h3>
              <div className={styles.widgetContent}>
                <p className={styles.widgetText}>자주 사용하는 템플릿:</p>
                <div className={styles.templateButtons}>
                  <button className={styles.templateBtn}>📅 일정 공지</button>
                  <button className={styles.templateBtn}>📝 과제 안내</button>
                  <button className={styles.templateBtn}>📢 중요 공지</button>
                  <button className={styles.templateBtn}>💡 참고 자료</button>
                </div>
                <button
                  className={styles.newNoticeBtn}
                  onClick={() => setIsModalOpen(true)}
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
              <div className={styles.statRow}>
                <span>이번 주 작성:</span>
                <span className={styles.statValue}>8개</span>
              </div>
              <div className={styles.statRow}>
                <span>평균 조회수:</span>
                <span className={styles.statValue}>42회</span>
              </div>
            </div>
          </div>

          {/* 알림 설정 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>🔔 알림 설정</h3>
            <div className={styles.widgetContent}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked />
                <span>새 공지 알림</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked />
                <span>댓글 알림</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" />
                <span>중요 공지만 알림</span>
              </label>
            </div>
          </div>

          {/* 작성 가이드 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📝 작성 권한</h3>
            <div className={styles.widgetContent}>
              <p className={styles.widgetText}>
                ADMIN+ 만 공지를 작성할 수 있습니다
              </p>
              <div className={styles.tipSection}>
                <h4 className={styles.tipTitle}>🎯 작성 팁</h4>
                <ul className={styles.tipList}>
                  <li>제목을 명확하게</li>
                  <li>중요한 내용은 강조</li>
                  <li>관련 파일 첨부</li>
                  <li>@멘션으로 특정인 알림</li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
