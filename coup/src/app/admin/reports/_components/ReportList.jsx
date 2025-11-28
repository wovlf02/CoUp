'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Table from '@/components/admin/ui/Table'
import Badge from '@/components/admin/ui/Badge'
import Button from '@/components/admin/ui/Button'
import { Card } from '@/components/admin/ui/Card'
import api from '@/lib/api'
import styles from './ReportList.module.css'

export default function ReportList() {
  const { status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await api.get('/api/admin/reports')

      if (result.success && result.data) {
        setReports(result.data.reports || [])
      } else {
        setError('Invalid response format')
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in?callbackUrl=/admin/reports')
      return
    }

    if (status === 'authenticated') {
      fetchReports()
    }
  }, [status, router])

  const columns = [
    {
      key: 'type',
      label: '유형',
      sortable: true,
      width: '120px',
      render: (type) => (
        <Badge variant="default" style={{
          backgroundColor: getTypeColor(type).bg,
          color: getTypeColor(type).fg,
        }}>
          {getTypeLabel(type)}
        </Badge>
      ),
    },
    {
      key: 'target',
      label: '대상',
      sortable: true,
      width: '200px',
      render: (_, report) => (
        <div className={styles.targetCell}>
          <div className={styles.targetTitle}>
            {report.targetType === 'USER' ? report.targetUser?.name : report.targetStudy?.title}
          </div>
          <div className={styles.targetType}>{report.targetType === 'USER' ? '사용자' : '스터디'}</div>
        </div>
      ),
    },
    {
      key: 'reporter',
      label: '신고자',
      sortable: true,
      width: '150px',
      render: (_, report) => (
        <div className={styles.reporterName}>
          {report.reporter?.name || '알 수 없음'}
        </div>
      ),
    },
    {
      key: 'reason',
      label: '사유',
      width: '250px',
      render: (reason) => (
        <div className={styles.reason}>{reason}</div>
      ),
    },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      width: '100px',
      render: (status) => (
        <Badge variant={getStatusVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: '신고일',
      sortable: true,
      width: '120px',
      render: (date) => new Date(date).toLocaleDateString('ko-KR'),
    },
    {
      key: 'actions',
      label: '액션',
      width: '120px',
      render: (_, report) => (
        <Link href={`/admin/reports/${report.id}`}>
          <Button size="sm" variant="outline">처리하기</Button>
        </Link>
      ),
    },
  ]

  if (status === 'loading') {
    return (
      <Card>
        <Table columns={columns} data={[]} loading />
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <div className={styles.error}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          <p>⚠️ 신고 목록을 불러올 수 없습니다.</p>
          <p>{error}</p>
          <Button onClick={fetchReports} variant="primary">다시 시도</Button>
        </div>
      </Card>
    )
  }

  return (
    <div className={styles.container}>
      {selectedRows.length > 0 && (
        <div className={styles.bulkActions}>
          <span>{selectedRows.length}개 선택됨</span>
          <Button size="sm" variant="outline" onClick={() => setSelectedRows([])}>
            선택 해제
          </Button>
          <Button size="sm" variant="primary">일괄 승인</Button>
          <Button size="sm" variant="danger">일괄 거부</Button>
        </div>
      )}

      <Card>
        <Table
          columns={columns}
          data={reports}
          sortable
          selectable
          selectedRows={selectedRows}
          onSelectRows={setSelectedRows}
          loading={loading}
          stickyHeader
          emptyState={
            <div className={styles.empty}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>신고가 없습니다</p>
            </div>
          }
        />
      </Card>
    </div>
  )
}

function getStatusVariant(status) {
  const variants = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    IN_REVIEW: 'primary',
  }
  return variants[status] || 'default'
}

function getStatusLabel(status) {
  const labels = {
    PENDING: '대기중',
    APPROVED: '승인됨',
    REJECTED: '거부됨',
    IN_REVIEW: '검토중',
  }
  return labels[status] || status
}

function getTypeLabel(type) {
  const labels = {
    SPAM: '스팸',
    HARASSMENT: '괴롭힘',
    INAPPROPRIATE: '부적절',
    COPYRIGHT: '저작권',
    OTHER: '기타',
  }
  return labels[type] || type
}

function getTypeColor(type) {
  const colors = {
    SPAM: { bg: 'var(--pastel-orange-100)', fg: 'var(--pastel-orange-600)' },
    HARASSMENT: { bg: 'var(--pastel-pink-100)', fg: 'var(--pastel-pink-600)' },
    INAPPROPRIATE: { bg: 'var(--danger-100)', fg: 'var(--danger-600)' },
    COPYRIGHT: { bg: 'var(--pastel-purple-100)', fg: 'var(--pastel-purple-600)' },
    OTHER: { bg: 'var(--pastel-indigo-100)', fg: 'var(--pastel-indigo-600)' },
  }
  return colors[type] || { bg: 'var(--gray-100)', fg: 'var(--gray-600)' }
}

