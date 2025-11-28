import { notFound } from 'next/navigation'
import Badge from '@/components/admin/ui/Badge'
import UserActions from './_components/UserActions'
import styles from './page.module.css'

export const metadata = {
  title: '사용자 상세 - CoUp Admin',
}

async function getUser(userId) {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/users/${userId}`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      return null
    }

    return res.json()
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return null
  }
}

export default async function UserDetailPage({ params }) {
  const result = await getUser(params.userId)

  if (!result || !result.success) {
    notFound()
  }

  const { user, stats, warnings, sanctions, reportsAgainst } = result.data

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          {user.avatar ? (
            <div className={styles.avatarLarge}>
              <img src={user.avatar} alt={user.name} />
            </div>
          ) : (
            <div className={styles.avatarPlaceholderLarge}>
              {(user.name || user.email)[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className={styles.title}>{user.name || '이름 없음'}</h1>
            <p className={styles.email}>{user.email}</p>
            <div className={styles.badges}>
              <Badge variant={getStatusVariant(user.status)}>
                {getStatusLabel(user.status)}
              </Badge>
              <Badge variant="default">{user.provider}</Badge>
            </div>
          </div>
        </div>
        <UserActions user={user} />
      </div>

      <div className={styles.grid}>
        {/* 통계 */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>활동 통계</h2>
          <div className={styles.statsGrid}>
            <StatCard label="소유 스터디" value={stats.studiesOwned} />
            <StatCard label="참여 스터디" value={stats.studiesJoined} />
            <StatCard label="메시지" value={stats.messagesCount} />
            <StatCard label="파일 업로드" value={stats.filesCount} />
            <StatCard label="경고" value={stats.warningsCount} variant="warning" />
            <StatCard label="제재" value={stats.sanctionsCount} variant="danger" />
          </div>
        </div>

        {/* 계정 정보 */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>계정 정보</h2>
          <div className={styles.infoList}>
            <InfoItem label="가입일" value={new Date(user.createdAt).toLocaleString('ko-KR')} />
            <InfoItem label="최근 로그인" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('ko-KR') : '없음'} />
            {user.suspendedUntil && (
              <InfoItem
                label="정지 기한"
                value={new Date(user.suspendedUntil).toLocaleString('ko-KR')}
              />
            )}
            {user.suspendReason && (
              <InfoItem label="정지 사유" value={user.suspendReason} />
            )}
          </div>
        </div>

        {/* 경고 이력 */}
        {warnings.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>경고 이력 ({warnings.length})</h2>
            <div className={styles.list}>
              {warnings.map((warning) => (
                <div key={warning.id} className={styles.listItem}>
                  <div className={styles.listItemHeader}>
                    <Badge variant={getSeverityVariant(warning.severity)}>
                      {getSeverityLabel(warning.severity)}
                    </Badge>
                    <span className={styles.date}>
                      {new Date(warning.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className={styles.listItemContent}>{warning.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 제재 이력 */}
        {sanctions.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>제재 이력 ({sanctions.length})</h2>
            <div className={styles.list}>
              {sanctions.map((sanction) => (
                <div key={sanction.id} className={styles.listItem}>
                  <div className={styles.listItemHeader}>
                    <Badge variant={sanction.isActive ? 'danger' : 'default'}>
                      {getSanctionTypeLabel(sanction.type)}
                      {sanction.isActive && ' (활성)'}
                    </Badge>
                    <span className={styles.date}>
                      {new Date(sanction.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className={styles.listItemContent}>{sanction.reason}</p>
                  {sanction.expiresAt && (
                    <p className={styles.listItemMeta}>
                      만료: {new Date(sanction.expiresAt).toLocaleDateString('ko-KR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 신고 받은 이력 */}
        {reportsAgainst.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>신고 받은 이력 ({reportsAgainst.length})</h2>
            <div className={styles.list}>
              {reportsAgainst.map((report) => (
                <div key={report.id} className={styles.listItem}>
                  <div className={styles.listItemHeader}>
                    <Badge variant={getReportStatusVariant(report.status)}>
                      {getReportTypeLabel(report.type)}
                    </Badge>
                    <span className={styles.date}>
                      {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className={styles.listItemContent}>{report.reason}</p>
                  <p className={styles.listItemMeta}>
                    신고자: {report.reporter.name || report.reporter.email}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, variant }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={`${styles.statValue} ${variant ? styles[variant] : ''}`}>
        {value.toLocaleString()}
      </div>
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  )
}

// Helper functions
function getStatusVariant(status) {
  const map = { ACTIVE: 'success', SUSPENDED: 'danger', DELETED: 'default' }
  return map[status] || 'default'
}

function getStatusLabel(status) {
  const map = { ACTIVE: '활성', SUSPENDED: '정지', DELETED: '삭제됨' }
  return map[status] || status
}

function getSeverityVariant(severity) {
  const map = { MINOR: 'info', NORMAL: 'warning', SERIOUS: 'danger', CRITICAL: 'danger' }
  return map[severity] || 'default'
}

function getSeverityLabel(severity) {
  const map = { MINOR: '경미', NORMAL: '보통', SERIOUS: '심각', CRITICAL: '치명적' }
  return map[severity] || severity
}

function getSanctionTypeLabel(type) {
  const map = {
    WARNING: '경고',
    CHAT_BAN: '채팅 금지',
    STUDY_CREATE_BAN: '스터디 생성 금지',
    FILE_UPLOAD_BAN: '파일 업로드 금지',
    SUSPENSION: '계정 정지',
    PERMANENT_BAN: '영구 정지'
  }
  return map[type] || type
}

function getReportStatusVariant(status) {
  const map = { PENDING: 'warning', IN_PROGRESS: 'info', RESOLVED: 'success', REJECTED: 'default' }
  return map[status] || 'default'
}

function getReportTypeLabel(type) {
  const map = {
    SPAM: '스팸',
    HARASSMENT: '괴롭힘',
    INAPPROPRIATE: '부적절한 콘텐츠',
    COPYRIGHT: '저작권',
    OTHER: '기타'
  }
  return map[type] || type
}

