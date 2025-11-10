// 내 스터디 목록 페이지
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function MyStudiesListPage() {
  const [activeTab, setActiveTab] = useState('전체');

  // Mock 데이터
  const myStudies = [
    {
      id: 1,
      emoji: '💻',
      name: '알고리즘 마스터 스터디',
      description: '매일 알고리즘 문제를 풀고 서로의 풀이를 공유하며 성장하는 스터디',
      role: 'OWNER',
      members: { current: 12, max: 20 },
      lastActivity: '1시간 전',
      newMessages: 5,
      newNotices: 2,
    },
    {
      id: 2,
      emoji: '🎨',
      name: 'UI/UX 디자인 스터디',
      description: '실무 프로젝트를 통해 UI/UX 디자인 역량을 키우는 스터디',
      role: 'ADMIN',
      members: { current: 8, max: 15 },
      lastActivity: '3시간 전',
      newMessages: 0,
      newNotices: 0,
    },
    {
      id: 3,
      emoji: '🌐',
      name: '영어 회화 스터디',
      description: '주 3회 화상으로 영어 회화 연습',
      role: 'MEMBER',
      members: { current: 10, max: 15 },
      lastActivity: '1일 전',
      newMessages: 3,
      newNotices: 1,
    },
  ];

  const tabs = [
    { label: '전체', count: 3 },
    { label: '참여중', count: 3 },
    { label: '관리중', count: 1 },
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

  return (
    <div className={styles.container}>
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
        {myStudies.map((study) => {
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
                <button
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: 채팅으로 이동
                  }}
                >
                  💬 채팅
                </button>
                <button
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: 공지로 이동
                  }}
                >
                  📢 공지
                </button>
                <button
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: 파일로 이동
                  }}
                >
                  📁 파일
                </button>
                <button
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: 캘린더로 이동
                  }}
                >
                  📅 캘린더
                </button>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 빈 상태 */}
      {myStudies.length === 0 && (
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
  );
}

