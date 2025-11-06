'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function StudyPreviewPage({ params }) {
  const { studyId } = use(params);
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  // Mock data - 실제로는 API에서 가져옴
  const study = {
    id: studyId,
    emoji: '📚',
    name: '코딩테스트 마스터 스터디',
    owner: { name: '김철수', avatar: 'K' },
    currentMembers: 12,
    maxMembers: 20,
    category: '프로그래밍',
    subCategory: '알고리즘/코테',
    description: '매일 아침 알고리즘 문제를 풀고 서로의 풀이를 공유하며 성장하는 스터디입니다.\n\n• 매일 오전 9시 문제 공유\n• 저녁 8시 코드 리뷰\n• 주 1회 모의 코딩테스트',
    tags: ['알고리즘', '코딩테스트', '매일', '백준', '프로그래머스'],
    createdAt: '2025.10.01',
    activityFrequency: '매일',
    visibility: 'PUBLIC',
    autoApprove: true,
    rating: { average: 4.8, count: 24 }
  };

  // 최근 공지 2개만
  const recentNotices = [
    {
      id: 1,
      title: '이번 주 스터디 일정 안내',
      author: '김철수',
      time: '2시간 전',
      preview: '이번 주는 백준 골드 문제로 진행합니다. 월요일 오전 9시까지 풀이를...',
      attachments: 1
    },
    {
      id: 2,
      title: '참고 자료 공유',
      author: '이영희',
      time: '1일 전',
      preview: '알고리즘 학습에 도움되는 자료를 공유합니다. 꼭 확인해주세요...',
      attachments: 0
    }
  ];

  // 상위 멤버 5명만
  const topMembers = [
    { id: 1, name: '김철수', role: 'OWNER', avatar: 'K' },
    { id: 2, name: '이영희', role: 'ADMIN', avatar: 'L' },
    { id: 3, name: '박민수', role: 'MEMBER', avatar: 'P' },
    { id: 4, name: '최지은', role: 'MEMBER', avatar: 'C' },
    { id: 5, name: '정소현', role: 'MEMBER', avatar: 'J' }
  ];

  const activityStats = {
    totalNotices: 12,
    totalFiles: 28,
    weeklyActivity: 5,
    daysActive: 36
  };

  // 가입 여부 체크
  useEffect(() => {
    const checkMembership = async () => {
      // 실제로는 API 호출
      // const membership = await api.get(`/api/v1/studies/${studyId}/my-membership`)
      // if (membership) {
      //   router.replace(`/my-studies/${studyId}`)
      // }
    };
    
    checkMembership();
  }, [studyId]);

  const handleJoin = async () => {
    try {
      setIsJoining(true);
      
      // 실제로는 API 호출
      // const response = await api.post(`/api/v1/studies/${studyId}/join`)
      
      // Mock: 자동 승인
      setTimeout(() => {
        alert('가입이 완료되었습니다!');
        router.push(`/my-studies/${studyId}`);
      }, 500);
      
    } catch (error) {
      alert('가입 신청 중 오류가 발생했습니다');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 뒤로가기 */}
      <Link href="/studies" className={styles.backLink}>
        ← 스터디 탐색으로
      </Link>

      {/* 스터디 헤더 카드 */}
      <div className={styles.headerCard}>
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <span className={styles.emoji}>{study.emoji}</span>
            <div>
              <div className={styles.headerTitle}>
                <h1 className={styles.studyName}>{study.name}</h1>
                <span className={styles.previewBadge}>🔍 탐색중</span>
              </div>
              <div className={styles.studyMeta}>
                <span>OWNER: {study.owner.name}</span>
                <span className={styles.separator}>|</span>
                <span>{study.currentMembers}/{study.maxMembers}명</span>
                <span className={styles.separator}>|</span>
                <span>{study.category}</span>
              </div>
            </div>
          </div>
        </div>

        {study.rating && (
          <div className={styles.rating}>
            <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
            <span className={styles.ratingScore}>{study.rating.average}</span>
            <span className={styles.ratingCount}>({study.rating.count}명 평가)</span>
          </div>
        )}

        <button 
          className={styles.joinButton}
          onClick={handleJoin}
          disabled={isJoining}
        >
          {isJoining ? '처리 중...' : `💚 가입하기${study.autoApprove ? ' - 자동 승인' : ''}`}
        </button>

        <div className={styles.warningBox}>
          ⚠️ 가입 후 채팅, 파일, 캘린더 등 모든 기능을 이용할 수 있습니다
        </div>
      </div>

      {/* 메인 콘텐츠 + 우측 위젯 */}
      <div className={styles.contentWithSidebar}>
        {/* 메인 콘텐츠 */}
        <div className={styles.mainContent}>
          {/* 스터디 소개 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📝 스터디 소개</h2>
            <p className={styles.description}>{study.description}</p>
          </section>

          {/* 최근 공지 (2개만) */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📌 최근 공지</h2>
            <div className={styles.noticeList}>
              {recentNotices.map((notice) => (
                <div key={notice.id} className={styles.noticeCard}>
                  <div className={styles.noticeHeader}>
                    <h3 className={styles.noticeTitle}>📢 {notice.title}</h3>
                    <div className={styles.noticeMeta}>
                      {notice.author} • {notice.time}
                      {notice.attachments > 0 && <span> • 📎 {notice.attachments}개</span>}
                    </div>
                  </div>
                  <p className={styles.noticePreview}>{notice.preview}</p>
                  <div className={styles.lockMessage}>
                    🔒 전체 내용 및 첨부파일은 가입 후 확인 가능
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.joinPrompt}>
              ⚠️ 가입하면 모든 공지를 확인할 수 있습니다
            </div>
          </section>

          {/* 태그 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🏷️ 태그</h2>
            <div className={styles.tagList}>
              {study.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>#{tag}</span>
              ))}
            </div>
          </section>

          {/* 참고 사항 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>⚠️ 참고 사항</h2>
            <ul className={styles.noteList}>
              <li>가입 후 모든 기능(채팅, 파일, 캘린더 등)을 이용할 수 있습니다</li>
              <li>이 스터디는 {study.autoApprove ? '자동 승인' : '승인 후 가입'}됩니다</li>
              <li>언제든 탈퇴할 수 있습니다</li>
            </ul>
          </section>
        </div>

        {/* 우측 위젯 */}
        <aside className={styles.sidebar}>
          {/* 멤버 미리보기 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>👥 멤버 미리보기</h3>
            <div className={styles.memberList}>
              {topMembers.map((member) => (
                <div key={member.id} className={styles.memberItem}>
                  <div className={styles.memberAvatar}>{member.avatar}</div>
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>⚪ {member.name}</span>
                    {(member.role === 'OWNER' || member.role === 'ADMIN') && (
                      <span className={styles.memberRole}>({member.role})</span>
                    )}
                  </div>
                </div>
              ))}
              <div className={styles.moreMembers}>
                ... 외 {study.currentMembers - topMembers.length}명
              </div>
              <div className={styles.lockMessage}>
                🔒 전체 멤버 및 상세 정보는 가입 후 확인
              </div>
            </div>
          </div>

          {/* 스터디 정보 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 스터디 정보</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📅</span>
                <span>생성일: {study.createdAt}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🔥</span>
                <span>활동: {study.activityFrequency}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>👁️</span>
                <span>공개: {study.visibility === 'PUBLIC' ? '전체 공개' : '비공개'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>✅</span>
                <span>승인: {study.autoApprove ? '자동 승인' : '수동 승인'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🏷️</span>
                <span>카테고리: {study.category}</span>
              </div>
            </div>
          </div>

          {/* 활동 현황 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 활동 현황 (요약)</h3>
            <div className={styles.statList}>
              <div className={styles.statItem}>
                • 운영 기간: {activityStats.daysActive}일 ({study.createdAt}~)
              </div>
              <div className={styles.statItem}>
                • 공지: 총 {activityStats.totalNotices}개
              </div>
              <div className={styles.statItem}>
                • 공유 파일: 총 {activityStats.totalFiles}개
              </div>
              <div className={styles.statItem}>
                • 이번 주 활동: {activityStats.weeklyActivity}회
              </div>
            </div>
            <div className={styles.lockMessage}>
              🔒 상세 통계는 가입 후 확인
            </div>
          </div>

          {/* 유사한 스터디 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>🎯 유사한 스터디</h3>
            <div className={styles.relatedList}>
              <Link href="/studies/2" className={styles.relatedItem}>
                <span className={styles.relatedEmoji}>📚</span>
                <div className={styles.relatedInfo}>
                  <div className={styles.relatedName}>알고리즘 정복 스터디</div>
                  <div className={styles.relatedMeta}>15/20명 • 프로그래밍</div>
                </div>
              </Link>
              <Link href="/studies/3" className={styles.relatedItem}>
                <span className={styles.relatedEmoji}>💼</span>
                <div className={styles.relatedInfo}>
                  <div className={styles.relatedName}>코딩 면접 대비 스터디</div>
                  <div className={styles.relatedMeta}>8/15명 • 취업준비</div>
                </div>
              </Link>
            </div>
            <Link href="/studies" className={styles.viewMoreLink}>
              더 많은 스터디 보기 →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
