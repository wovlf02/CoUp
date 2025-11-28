import Link from 'next/link'
import Badge from '@/components/admin/ui/Badge'
import styles from './ReportList.module.css'

// API 호출 함수
async function getReports(searchParams) {
  const params = new URLSearchParams()

  if (searchParams.search) params.set('search', searchParams.search)
  if (searchParams.status) params.set('status', searchParams.status)
  if (searchParams.type) params.set('type', searchParams.type)
  if (searchParams.priority) params.set('priority', searchParams.priority)
  if (searchParams.targetType) params.set('targetType', searchParams.targetType)
  if (searchParams.assignedTo) params.set('assignedTo', searchParams.assignedTo)
  if (searchParams.page) params.set('page', searchParams.page)

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/admin/reports?${params.toString()}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('신고 목록을 불러오는데 실패했습니다.')
  }

  return res.json()
}

// 우선순위 색상 매핑
const PRIORITY_COLORS = {
  LOW: 'default',
  MEDIUM: 'primary',
  HIGH: 'warning',
  URGENT: 'danger',
}

// 상태 색상 매핑
const STATUS_COLORS = {
  PENDING: 'warning',
  IN_PROGRESS: 'primary',
  RESOLVED: 'success',
  REJECTED: 'default',
}

// 신고 유형 아이콘
const TYPE_ICONS = {
  SPAM: '🚫',
  HARASSMENT: '⚠️',
  INAPPROPRIATE: '🔞',
  COPYRIGHT: '©️',
  OTHER: '❓',
}

// 날짜 포맷
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 신고 유형 한글 변환
function getTypeLabel(type) {
  const labels = {
    SPAM: '스팸',
    HARASSMENT: '괴롭힘',
    INAPPROPRIATE: '부적절한 콘텐츠',
    COPYRIGHT: '저작권 침해',
    OTHER: '기타',
  }
  return labels[type] || type
}

// 상태 한글 변환
function getStatusLabel(status) {
  const labels = {
    PENDING: '대기중',
    IN_PROGRESS: '처리중',
    RESOLVED: '해결됨',
    REJECTED: '거부됨',
  }
  return labels[status] || status
}

// 우선순위 한글 변환
function getPriorityLabel(priority) {
  const labels = {
    LOW: '낮음',
    MEDIUM: '보통',
    HIGH: '높음',
    URGENT: '긴급',
  }
  return labels[priority] || priority
}

// 대상 유형 한글 변환
function getTargetTypeLabel(targetType) {
  const labels = {
    USER: '사용자',
    STUDY: '스터디',
    MESSAGE: '메시지',
  }
  return labels[targetType] || targetType
}

export default async function ReportList({ searchParams }) {
  const data = await getReports(searchParams)
  const { reports, pagination, stats } = data.data

  return (
    <div className={styles.container}>
      {/* 통계 카드 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e0e7ff' }}>📊</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>전체 신고</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fef3c7' }}>⏰</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.pending}</div>
            <div className={styles.statLabel}>대기중</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dbeafe' }}>🔄</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.in_progress}</div>
            <div className={styles.statLabel}>처리중</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dcfce7' }}>✅</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.resolved}</div>
            <div className={styles.statLabel}>해결됨</div>
          </div>
        </div>
      </div>

      {/* 신고 목록 */}
      {reports.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📋</div>
          <div className={styles.emptyText}>신고가 없습니다.</div>
        </div>
      ) : (
        <>
          <div className={styles.reportGrid}>
            {reports.map(report => (
              <Link
                key={report.id}
                href={`/admin/reports/${report.id}`}
                className={styles.reportCard}
              >
                {/* 헤더 */}
                <div className={styles.cardHeader}>
                  <div className={styles.headerLeft}>
                    <span className={styles.typeIcon}>
                      {TYPE_ICONS[report.type]}
                    </span>
                    <span className={styles.typeLabel}>
                      {getTypeLabel(report.type)}
                    </span>
                  </div>
                  <Badge variant={PRIORITY_COLORS[report.priority]}>
                    {getPriorityLabel(report.priority)}
                  </Badge>
                </div>

                {/* 내용 */}
                <div className={styles.cardBody}>
                  <div className={styles.reason}>
                    {report.reason.length > 100
                      ? `${report.reason.substring(0, 100)}...`
                      : report.reason}
                  </div>

                  <div className={styles.details}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>대상:</span>
                      <span className={styles.detailValue}>
                        {getTargetTypeLabel(report.targetType)} - {report.targetName || report.targetId}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>신고자:</span>
                      <span className={styles.detailValue}>
                        {report.reporter.name || report.reporter.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 푸터 */}
                <div className={styles.cardFooter}>
                  <div className={styles.footerLeft}>
                    <Badge variant={STATUS_COLORS[report.status]}>
                      {getStatusLabel(report.status)}
                    </Badge>
                    <span className={styles.timestamp}>
                      {formatDate(report.createdAt)}
                    </span>
                  </div>
                  {report.processedBy && (
                    <span className={styles.assigned}>
                      👤 담당자 배정됨
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <Link
                href={`?${new URLSearchParams({ ...searchParams, page: (pagination.page - 1).toString() }).toString()}`}
                className={`${styles.pageButton} ${pagination.page === 1 ? styles.disabled : ''}`}
              >
                이전
              </Link>

              <div className={styles.pageInfo}>
                {pagination.page} / {pagination.totalPages}
              </div>

              <Link
                href={`?${new URLSearchParams({ ...searchParams, page: (pagination.page + 1).toString() }).toString()}`}
                className={`${styles.pageButton} ${pagination.page === pagination.totalPages ? styles.disabled : ''}`}
              >
                다음
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}

