'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function MyStudiesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Mock data
  const mockStudies = [
    {
      id: 'study_1',
      name: '코딩테스트 준비 스터디',
      description: '매일 알고리즘 문제를 풀고 코드 리뷰하는 스터디입니다.',
      emoji: '📚',
      category: 'PROGRAMMING',
      currentMembers: 12,
      maxMembers: 20,
      role: 'OWNER',
      lastActivity: '1시간 전',
      unreadMessages: 5,
    },
    {
      id: 'study_2',
      name: '취업 준비 스터디',
      description: '함께 이력서와 면접을 준비하는 스터디',
      emoji: '💼',
      category: 'JOB_PREP',
      currentMembers: 8,
      maxMembers: 15,
      role: 'MEMBER',
      lastActivity: '3시간 전',
      unreadMessages: 0,
    },
    {
      id: 'study_3',
      name: '영어 회화 스터디',
      description: '매일 영어로 대화하며 실력을 키우는 스터디',
      emoji: '📖',
      category: 'LANGUAGE',
      currentMembers: 15,
      maxMembers: 20,
      role: 'ADMIN',
      lastActivity: '5시간 전',
      unreadMessages: 2,
    },
    {
      id: 'study_4',
      name: '운동 루틴 스터디',
      description: '아침 러닝 모임 및 운동 인증',
      emoji: '🏃',
      category: 'EXERCISE',
      currentMembers: 5,
      maxMembers: 10,
      role: 'MEMBER',
      lastActivity: '어제',
      unreadMessages: 0,
    },
  ];

  const counts = {
    all: 4,
    joined: 3,
    managed: 1,
    pending: 0,
  };

  const filteredStudies = mockStudies.filter(study => {
    if (activeTab === 'all') return true;
    if (activeTab === 'joined') return ['MEMBER', 'ADMIN', 'OWNER'].includes(study.role);
    if (activeTab === 'managed') return ['ADMIN', 'OWNER'].includes(study.role);
    if (activeTab === 'pending') return study.role === 'PENDING';
    return true;
  });

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'OWNER':
        return styles.owner;
      case 'ADMIN':
        return styles.admin;
      case 'MEMBER':
        return styles.member;
      case 'PENDING':
        return styles.pending;
      default:
        return '';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'OWNER':
        return '그룹장';
      case 'ADMIN':
        return '관리자';
      case 'MEMBER':
        return '멤버';
      case 'PENDING':
        return '대기중';
      default:
        return '';
    }
  };

  return (
    <div className={styles.container}>
      {/* 페이지 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>📚 내 스터디</h1>
        <Link href="/studies/create" className={styles.createButton}>
          <span className={styles.plusIcon}>+</span>
          스터디 만들기
        </Link>
      </div>

      {/* 2컬럼 레이아웃: 메인 콘텐츠 + 사이드바 */}
      <div className={styles.contentWithSidebar}>
        {/* 메인 콘텐츠 */}
        <div className={styles.mainContent}>
          {/* 탭 필터 */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              전체 <span className={styles.tabBadge}>{counts.all}</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'joined' ? styles.active : ''}`}
              onClick={() => setActiveTab('joined')}
            >
              참여중 <span className={styles.tabBadge}>{counts.joined}</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'managed' ? styles.active : ''}`}
              onClick={() => setActiveTab('managed')}
            >
              관리중 <span className={styles.tabBadge}>{counts.managed}</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'pending' ? styles.active : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              대기중 <span className={styles.tabBadge}>{counts.pending}</span>
            </button>

            {/* 정렬 옵션 */}
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">최근 활동순</option>
              <option value="name">이름순</option>
              <option value="members">참여 인원순</option>
              <option value="created">생성일순</option>
            </select>
          </div>

          {/* 스터디 카드 목록 */}
          <div className={styles.studyList}>
            {filteredStudies.length > 0 ? (
              filteredStudies.map((study) => (
                <div key={study.id} className={styles.studyCard}>
                  {/* 헤더 */}
                  <div className={styles.cardHeader}>
                    <span className={styles.emoji}>{study.emoji}</span>
                    <span className={`${styles.roleBadge} ${getRoleBadgeClass(study.role)}`}>
                      {getRoleText(study.role)}
                    </span>
                  </div>

                  {/* 스터디명 */}
                  <Link href={`/studies/${study.id}`} className={styles.studyName}>
                    {study.name}
                  </Link>

                  {/* 설명 */}
                  <p className={styles.studyDescription}>{study.description}</p>

                  {/* 메타 정보 */}
                  <div className={styles.studyMeta}>
                    <span className={styles.metaItem}>
                      👥 {study.currentMembers}/{study.maxMembers}명
                    </span>
                    <span className={styles.metaItem}>
                      📅 마지막 활동: {study.lastActivity}
                    </span>
                    {study.unreadMessages > 0 && (
                      <span className={styles.newMessageBadge}>
                        💬 새 메시지 {study.unreadMessages}개
                      </span>
                    )}
                  </div>

                  {/* 빠른 액션 버튼 */}
                  <div className={styles.quickActions}>
                    <Link href={`/studies/${study.id}/chat`} className={styles.quickActionBtn}>
                      채팅
                    </Link>
                    <Link href={`/studies/${study.id}/notices`} className={styles.quickActionBtn}>
                      공지
                    </Link>
                    <Link href={`/studies/${study.id}/files`} className={styles.quickActionBtn}>
                      파일
                    </Link>
                    <Link href={`/studies/${study.id}/calendar`} className={styles.quickActionBtn}>
                      캘린더
                    </Link>
                    {(study.role === 'OWNER' || study.role === 'ADMIN') && (
                      <Link href={`/studies/${study.id}/settings`} className={styles.quickActionBtn}>
                        설정
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  {activeTab === 'all' && '📂'}
                  {activeTab === 'managed' && '👑'}
                  {activeTab === 'pending' && '⏰'}
                </div>
                <h3 className={styles.emptyTitle}>
                  {activeTab === 'all' && '아직 참여 중인 스터디가 없어요'}
                  {activeTab === 'joined' && '참여 중인 스터디가 없어요'}
                  {activeTab === 'managed' && '관리 중인 스터디가 없어요'}
                  {activeTab === 'pending' && '승인 대기 중인 스터디가 없어요'}
                </h3>
                <p className={styles.emptyDescription}>
                  {activeTab === 'all' && '지금 바로 관심있는 스터디를 찾아보세요!'}
                  {activeTab === 'managed' && '새로운 스터디를 만들어보세요!'}
                </p>
                {activeTab === 'all' && (
                  <Link href="/studies" className={styles.emptyButton}>
                    스터디 둘러보기 →
                  </Link>
                )}
                {activeTab === 'managed' && (
                  <Link href="/studies/create" className={styles.emptyButton}>
                    스터디 만들기 →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 우측 사이드바 위젯 */}
        <aside className={styles.sidebar}>
          {/* 1. 나의 활동 요약 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 나의 활동 요약</h3>
            <div className={styles.widgetContent}>
              <div className={styles.statSection}>
                <h4 className={styles.statLabel}>참여 스터디</h4>
                <p className={styles.statValue}>• 전체: {counts.all}개</p>
                <p className={styles.statValue}>• 관리중: {counts.managed}개</p>
              </div>
              
              <div className={styles.statSection}>
                <h4 className={styles.statLabel}>새 소식</h4>
                <p className={styles.statValue}>• 읽지 않은 메시지: 7개</p>
                <p className={styles.statValue}>• 새 공지: 2개</p>
              </div>

              <div className={styles.statSection}>
                <h4 className={styles.statLabel}>이번 주 활동</h4>
                <p className={styles.statValue}>• 출석: 5/7일</p>
                <p className={styles.statValue}>• 완료 할일: 12개</p>
              </div>

              <Link href="/dashboard" className={styles.widgetLink}>
                내 통계 자세히 →
              </Link>
            </div>
          </div>

          {/* 2. 급한 할일 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>🔥 급한 할일 (3)</h3>
            <div className={styles.widgetContent}>
              <div className={styles.taskItem}>
                <div className={styles.taskHeader}>
                  <span className={styles.urgentBadge}>🔴</span>
                  <span className={styles.taskStudy}>[코딩테스트]</span>
                </div>
                <p className={styles.taskTitle}>백준 1234번 풀이</p>
                <p className={styles.taskDue}>D-1 (11/7)</p>
                <button className={styles.completeBtn}>완료하기</button>
              </div>

              <div className={styles.taskItem}>
                <div className={styles.taskHeader}>
                  <span className={styles.urgentBadge}>🟡</span>
                  <span className={styles.taskStudy}>[취업준비]</span>
                </div>
                <p className={styles.taskTitle}>자소서 1차 작성</p>
                <p className={styles.taskDue}>D-2 (11/8)</p>
                <button className={styles.completeBtn}>완료하기</button>
              </div>

              <div className={styles.taskItem}>
                <div className={styles.taskHeader}>
                  <span className={styles.urgentBadge}>🟡</span>
                  <span className={styles.taskStudy}>[코딩테스트]</span>
                </div>
                <p className={styles.taskTitle}>코드 리뷰 준비</p>
                <p className={styles.taskDue}>D-3 (11/9)</p>
                <button className={styles.completeBtn}>완료하기</button>
              </div>

              <Link href="/my-studies?tab=tasks" className={styles.widgetLink}>
                할일 전체보기 →
              </Link>
            </div>
          </div>

          {/* 3. 다가오는 일정 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📅 다가오는 일정</h3>
            <div className={styles.widgetContent}>
              <div className={styles.eventItem}>
                <p className={styles.eventDate}>11/7 (목) 14:00</p>
                <p className={styles.eventTitle}>[코딩테스트] 주간 회의 (D-1)</p>
              </div>

              <div className={styles.eventItem}>
                <p className={styles.eventDate}>11/8 (금) 20:00</p>
                <p className={styles.eventTitle}>[취업준비] 모의 면접 (D-2)</p>
              </div>

              <div className={styles.eventItem}>
                <p className={styles.eventDate}>11/10 (일) 23:59</p>
                <p className={styles.eventTitle}>[영어회화] 과제 제출 (D-4)</p>
              </div>

              <Link href="/my-studies?tab=calendar" className={styles.widgetLink}>
                캘린더 전체보기 →
              </Link>
            </div>
          </div>

          {/* 4. 빠른 액션 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>⚡ 빠른 액션</h3>
            <div className={styles.widgetContent}>
              <div className={styles.quickActionGrid}>
                <Link href="/dashboard" className={styles.actionBtn}>
                  📊 전체 통계
                </Link>
                <Link href="/studies" className={styles.actionBtn}>
                  🔍 스터디 찾기
                </Link>
              </div>
              <Link href="/studies/create" className={styles.actionBtnFull}>
                ➕ 스터디 만들기
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
