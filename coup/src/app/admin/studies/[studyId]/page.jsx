/**
 * 관리자 - 스터디 상세 페이지
 * /admin/studies/[studyId]
 */

import Link from 'next/link'
import Badge from '@/components/admin/ui/Badge'
import StudyActions from './_components/StudyActions'
import styles from './page.module.css'

// 스터디 상세 정보 가져오기
async function getStudyDetail(studyId) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/admin/studies/${studyId}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('스터디 정보를 불러오는데 실패했습니다')
  }

  return res.json()
}

export default async function StudyDetailPage({ params }) {
  const { studyId } = params

  let study
  try {
    const response = await getStudyDetail(studyId)
    study = response.data
  } catch (error) {
    return (
      <div className={styles.error}>
        <h2>오류 발생</h2>
        <p>{error.message}</p>
        <Link href="/admin/studies" className={styles.backButton}>
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <Link href="/admin/studies" className={styles.backLink}>
          ← 스터디 목록
        </Link>
        <div className={styles.titleRow}>
          <div className={styles.titleArea}>
            <span className={styles.emoji}>{study.emoji}</span>
            <h1 className={styles.title}>{study.name}</h1>
          </div>
          <StudyActions studyId={studyId} study={study} />
        </div>
        <p className={styles.description}>{study.description}</p>
      </div>

      {/* 통계 카드 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>멤버</div>
          <div className={styles.statValue}>
            {study.memberStats.active}/{study.settings.maxMembers}
          </div>
          <div className={styles.statDetail}>
            대기: {study.memberStats.pending}, 탈퇴: {study.memberStats.left}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>메시지</div>
          <div className={styles.statValue}>
            {study.activityStats.messages.toLocaleString()}
          </div>
          <div className={styles.statDetail}>
            일평균 {study.activityStats.avgMessagesPerDay.toFixed(1)}개
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>파일</div>
          <div className={styles.statValue}>
            {study.activityStats.files.toLocaleString()}
          </div>
          <div className={styles.statDetail}>
            최근 30일: {study.activityStats.recentFiles}개
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>평점</div>
          <div className={styles.statValue}>
            ⭐ {study.rating.toFixed(1)}
          </div>
          <div className={styles.statDetail}>
            {study.reviewCount}개 리뷰
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* 왼쪽 컬럼 */}
        <div className={styles.leftColumn}>
          {/* 기본 정보 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>기본 정보</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>카테고리</span>
                <span className={styles.infoValue}>
                  {study.category}
                  {study.subCategory && ` > ${study.subCategory}`}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>태그</span>
                <div className={styles.tags}>
                  {study.tags && study.tags.length > 0 ? (
                    study.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className={styles.noData}>태그 없음</span>
                  )}
                </div>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>초대 코드</span>
                <span className={styles.infoValue}>{study.inviteCode}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>생성일</span>
                <span className={styles.infoValue}>
                  {new Date(study.createdAt).toLocaleString('ko-KR')}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>최근 수정</span>
                <span className={styles.infoValue}>
                  {new Date(study.updatedAt).toLocaleString('ko-KR')}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>최근 활동</span>
                <span className={styles.infoValue}>
                  {new Date(study.activityStats.lastActivityAt).toLocaleString(
                    'ko-KR'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* 설정 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>설정</h2>
            <div className={styles.settingGrid}>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>공개 여부</span>
                {study.settings.isPublic ? (
                  <Badge variant="success">공개</Badge>
                ) : (
                  <Badge variant="secondary">비공개</Badge>
                )}
              </div>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>모집 상태</span>
                {study.settings.isRecruiting ? (
                  <Badge variant="primary">모집중</Badge>
                ) : (
                  <Badge variant="secondary">모집마감</Badge>
                )}
              </div>
              <div className={styles.settingItem}>
                <span className={styles.settingLabel}>자동 승인</span>
                {study.settings.autoApprove ? (
                  <Badge variant="success">자동</Badge>
                ) : (
                  <Badge variant="warning">수동</Badge>
                )}
              </div>
            </div>
          </div>

          {/* 스터디장 정보 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>스터디장</h2>
            <div className={styles.ownerCard}>
              <div className={styles.ownerHeader}>
                <div className={styles.ownerName}>{study.owner.name}</div>
                <Badge
                  variant={
                    study.owner.status === 'ACTIVE' ? 'success' : 'danger'
                  }
                >
                  {study.owner.status}
                </Badge>
              </div>
              <div className={styles.ownerEmail}>{study.owner.email}</div>
              <div className={styles.ownerDate}>
                가입일: {new Date(study.owner.createdAt).toLocaleDateString()}
              </div>
              <Link
                href={`/admin/users/${study.owner.id}`}
                className={styles.ownerLink}
              >
                사용자 상세보기 →
              </Link>
            </div>
          </div>
        </div>

        {/* 오른쪽 컬럼 */}
        <div className={styles.rightColumn}>
          {/* 멤버 목록 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              멤버 목록 ({study.memberStats.total}명)
            </h2>
            <div className={styles.memberList}>
              {study.members.slice(0, 10).map((member) => (
                <div key={member.id} className={styles.memberItem}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberName}>
                      {member.user.name || '익명'}
                      {member.role === 'OWNER' && (
                        <Badge variant="primary" size="small">
                          스터디장
                        </Badge>
                      )}
                    </div>
                    <div className={styles.memberEmail}>{member.user.email}</div>
                  </div>
                  <Badge
                    variant={
                      member.status === 'ACTIVE'
                        ? 'success'
                        : member.status === 'PENDING'
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {member.status}
                  </Badge>
                </div>
              ))}
              {study.members.length > 10 && (
                <div className={styles.moreMembers}>
                  외 {study.members.length - 10}명
                </div>
              )}
              {study.members.length === 0 && (
                <div className={styles.noMembers}>멤버가 없습니다</div>
              )}
            </div>
          </div>

          {/* 활동 통계 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>활동 통계</h2>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <span className={styles.activityLabel}>공지사항</span>
                <span className={styles.activityValue}>
                  {study.activityStats.notices}개
                </span>
              </div>
              <div className={styles.activityItem}>
                <span className={styles.activityLabel}>일정</span>
                <span className={styles.activityValue}>
                  {study.activityStats.events}개
                </span>
              </div>
              <div className={styles.activityItem}>
                <span className={styles.activityLabel}>할일</span>
                <span className={styles.activityValue}>
                  {study.activityStats.studyTasks}개
                </span>
              </div>
              <div className={styles.activityItem}>
                <span className={styles.activityLabel}>활성 멤버 (7일)</span>
                <span className={styles.activityValue}>
                  {study.activityStats.activeMembers}명
                </span>
              </div>
              <div className={styles.activityItem}>
                <span className={styles.activityLabel}>주간 메시지</span>
                <span className={styles.activityValue}>
                  {study.activityStats.weeklyMessages}개
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

