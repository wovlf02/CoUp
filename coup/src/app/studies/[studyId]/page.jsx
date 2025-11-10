// 스터디 프리뷰 페이지 (미가입자용)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function StudyPreviewPage({ params }) {
  const router = useRouter();
  const { studyId } = params;

  // Mock 데이터
  const study = {
    id: studyId,
    emoji: '💻',
    name: '알고리즘 마스터 스터디',
    description: '매일 알고리즘 문제를 풀고 서로의 풀이를 공유하며 성장하는 스터디입니다. 초보자부터 고급자까지 모두 환영합니다!',
    category: '프로그래밍',
    subCategory: '알고리즘/코테',
    tags: ['알고리즘', '코딩테스트', '매일', '백준'],
    owner: {
      name: '김철수',
      imageUrl: null,
    },
    members: {
      current: 12,
      max: 20,
    },
    rating: 4.8,
    isRecruiting: true,
    isPublic: true,
    approvalType: 'manual',
    activityFrequency: '매일',
    createdAt: '2024-10-01',

    // 제한된 정보 (미리보기만)
    recentNotices: [
      { id: 1, title: '이번 주 일정 안내', createdAt: '2시간 전', isPinned: true },
      { id: 2, title: '참고 자료 공유', createdAt: '1일 전', isPinned: false },
    ],
    topMembers: [
      { id: 1, name: '김철수', role: 'OWNER', imageUrl: null },
      { id: 2, name: '이영희', role: 'ADMIN', imageUrl: null },
      { id: 3, name: '박민수', role: 'MEMBER', imageUrl: null },
      { id: 4, name: '최지은', role: 'MEMBER', imageUrl: null },
      { id: 5, name: '정소현', role: 'MEMBER', imageUrl: null },
    ],
    rules: [
      '무단 지각/결석 3회 시 퇴출',
      '과제 미제출 시 사유 공유 필수',
      '서로 존중하는 태도',
    ],
  };

  const handleJoin = () => {
    // TODO: 가입 플로우로 이동
    router.push(`/studies/${studyId}/join`);
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← 스터디 탐색으로
        </button>
      </div>

      {/* 메인 영역 */}
      <div className={styles.mainContent}>
        {/* 좌측: 스터디 정보 */}
        <div className={styles.leftSection}>
          {/* 스터디 카드 */}
          <div className={styles.studyCard}>
            <div className={styles.cardHeader}>
              <div className={styles.emoji}>{study.emoji}</div>
              {study.isRecruiting && (
                <span className={styles.recruitingBadge}>모집중</span>
              )}
            </div>

            <h1 className={styles.studyName}>{study.name}</h1>

            <div className={styles.studyMeta}>
              <span className={styles.category}>
                {study.category} · {study.subCategory}
              </span>
              <div className={styles.rating}>⭐ {study.rating}</div>
            </div>

            <div className={styles.tags}>
              {study.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>

            <p className={styles.description}>{study.description}</p>

            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>멤버</span>
                <span className={styles.statValue}>
                  {study.members.current}/{study.members.max}명
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>활동 빈도</span>
                <span className={styles.statValue}>{study.activityFrequency}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>가입 방식</span>
                <span className={styles.statValue}>
                  {study.approvalType === 'auto' ? '자동 승인' : '수동 승인'}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>개설일</span>
                <span className={styles.statValue}>2024.10.01</span>
              </div>
            </div>

            <button onClick={handleJoin} className={styles.joinButton}>
              🚀 스터디 가입하기
            </button>
          </div>

          {/* 스터디 규칙 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📋 스터디 규칙</h2>
            <ul className={styles.rulesList}>
              {study.rules.map((rule, index) => (
                <li key={index} className={styles.ruleItem}>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* 최근 공지 미리보기 */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>📢 최근 공지</h2>
              <span className={styles.lockBadge}>🔒 가입 후 전체 확인</span>
            </div>
            <div className={styles.previewList}>
              {study.recentNotices.map((notice) => (
                <div key={notice.id} className={styles.previewItem}>
                  {notice.isPinned && <span className={styles.pinIcon}>📌</span>}
                  <span className={styles.previewTitle}>{notice.title}</span>
                  <span className={styles.previewTime}>{notice.createdAt}</span>
                </div>
              ))}
            </div>
            <div className={styles.blurOverlay}>
              <p>가입 후 모든 공지를 확인할 수 있습니다</p>
            </div>
          </div>

          {/* 멤버 미리보기 */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>👥 멤버 ({study.members.current}명)</h2>
              <span className={styles.lockBadge}>🔒 상위 5명만 표시</span>
            </div>
            <div className={styles.membersList}>
              {study.topMembers.map((member) => (
                <div key={member.id} className={styles.memberItem}>
                  <div className={styles.memberAvatar}>
                    {member.imageUrl ? (
                      <img src={member.imageUrl} alt={member.name} />
                    ) : (
                      <span>{member.name[0]}</span>
                    )}
                  </div>
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>{member.name}</span>
                    <span className={styles.memberRole}>
                      {member.role === 'OWNER' ? '👑 그룹장' :
                       member.role === 'ADMIN' ? '⭐ 관리자' : '👤 멤버'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.blurOverlay}>
              <p>가입 후 모든 멤버를 확인할 수 있습니다</p>
            </div>
          </div>
        </div>

        {/* 우측: 사이드바 */}
        <div className={styles.rightSection}>
          {/* 빠른 가입 */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>🚀 빠른 가입</h3>
            <p className={styles.sideCardText}>
              지금 가입하고 함께 성장해보세요!
            </p>
            <button onClick={handleJoin} className={styles.sideJoinButton}>
              가입하기
            </button>
          </div>

          {/* 스터디 정보 */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>ℹ️ 스터디 정보</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>그룹장</span>
                <span className={styles.infoValue}>{study.owner.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>멤버 수</span>
                <span className={styles.infoValue}>
                  {study.members.current}/{study.members.max}명
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>평점</span>
                <span className={styles.infoValue}>⭐ {study.rating}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>공개 여부</span>
                <span className={styles.infoValue}>
                  {study.isPublic ? '전체 공개' : '비공개'}
                </span>
              </div>
            </div>
          </div>

          {/* 가입 후 혜택 */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>✨ 가입 후 혜택</h3>
            <ul className={styles.benefitsList}>
              <li>💬 실시간 채팅</li>
              <li>📢 전체 공지 확인</li>
              <li>📁 학습 자료 공유</li>
              <li>📅 일정 관리</li>
              <li>✅ 할일 관리</li>
              <li>📹 화상 스터디</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

