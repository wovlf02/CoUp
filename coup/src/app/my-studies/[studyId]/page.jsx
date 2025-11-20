// 내 스터디 대시보드 (개요)
'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStudy } from '@/lib/hooks/useApi';
import { getStudyHeaderStyle } from '@/utils/studyColors';
import StudyTabs from '@/components/study/StudyTabs';
import styles from './page.module.css';

export default function MyStudyDashboardPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);

  // 실제 API 호출
  const { data: studyData, isLoading } = useStudy(studyId);
  const study = studyData?.data;

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>스터디 정보를 불러오는 중...</div>
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


  // Mock 데이터 (임시 - 추후 실제 API로 교체)
  const weeklyActivity = {
    attendance: 85,
    attendanceCount: '6/7',
    taskCompletion: 70,
    taskCount: '7/10',
    messages: 42,
    notices: 3,
    files: 5,
  };

  const recentNotices = [];
  const recentFiles = [];
  const upcomingEvents = [];
  const urgentTasks = [];

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
      <StudyTabs studyId={studyId} activeTab="개요" userRole={study.myRole} />

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

          {/* 스터디 소개 */}
          <div className={styles.gridCard}>
            <h3 className={styles.cardTitle}>📝 스터디 소개</h3>
            <p className={styles.description}>{study.description}</p>
            <div className={styles.studyDetails}>
              <span className={styles.detailItem}>📂 {study.category}</span>
              {study.subCategory && <span className={styles.detailItem}>• {study.subCategory}</span>}
            </div>
            {study.tags && study.tags.length > 0 && (
              <div className={styles.tags}>
                {study.tags.map(tag => (
                  <span key={tag} className={styles.tag}>#{tag}</span>
                ))}
              </div>
            )}
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
                {recentNotices.length === 0 ? (
                  <p className={styles.emptyText}>최근 공지가 없습니다</p>
                ) : (
                  recentNotices.map((notice) => (
                    <div key={notice.id} className={styles.listItem}>
                      <div className={styles.itemContent}>
                        <span className={styles.itemTitle}>{notice.title}</span>
                        <span className={styles.itemMeta}>
                          {notice.author} · {notice.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
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
                {recentFiles.length === 0 ? (
                  <p className={styles.emptyText}>최근 파일이 없습니다</p>
                ) : (
                  recentFiles.map((file) => (
                    <div key={file.id} className={styles.listItem}>
                      <div className={styles.itemContent}>
                        <span className={styles.itemTitle}>{file.name}</span>
                        <span className={styles.itemMeta}>
                          {file.uploader} · {file.size}
                        </span>
                      </div>
                    </div>
                  ))
                )}
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
                {upcomingEvents.length === 0 ? (
                  <p className={styles.emptyText}>예정된 일정이 없습니다</p>
                ) : (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className={styles.listItem}>
                      <div className={styles.itemContent}>
                        <span className={styles.itemTitle}>{event.title}</span>
                        <span className={styles.itemMeta}>{event.date}</span>
                      </div>
                      <span className={styles.ddayBadge}>{event.dday}</span>
                    </div>
                  ))
                )}
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
                {urgentTasks.length === 0 ? (
                  <p className={styles.emptyText}>급한 할일이 없습니다</p>
                ) : (
                  urgentTasks.map((task) => (
                    <div key={task.id} className={styles.listItem}>
                      <div className={styles.itemContent}>
                        <span className={styles.itemTitle}>{task.title}</span>
                        <span className={styles.itemMeta}>{task.date}</span>
                      </div>
                      <span className={styles.urgentBadge}>{task.dday}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 우측 위젯 */}
        <div className={styles.rightSection}>
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 스터디 현황</h3>
            <div className={styles.widgetContent}>
              <p className={styles.widgetText}>총 멤버: {study.currentMembers}명</p>
              <p className={styles.widgetText}>모집 상태: {study.isRecruiting ? '모집 중' : '모집 마감'}</p>
              <p className={styles.widgetText}>공개 여부: {study.isPublic ? '공개' : '비공개'}</p>
            </div>
          </div>

          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>⚡ 빠른 액션</h3>
            <div className={styles.widgetActions}>
              <Link href={`/my-studies/${studyId}/chat`} className={styles.widgetButton}>
                💬 채팅
              </Link>
              <Link href={`/my-studies/${studyId}/notices`} className={styles.widgetButton}>
                📢 공지
              </Link>
              <Link href={`/my-studies/${studyId}/files`} className={styles.widgetButton}>
                📁 파일
              </Link>
              {['OWNER', 'ADMIN'].includes(study.myRole) && (
                <Link href={`/my-studies/${studyId}/settings`} className={styles.widgetButton}>
                  ⚙️ 설정
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
