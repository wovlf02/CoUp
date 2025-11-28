'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Table from '@/components/admin/ui/Table'
import Badge from '@/components/admin/ui/Badge'
import Button from '@/components/admin/ui/Button'
import { Card } from '@/components/admin/ui/Card'
import api from '@/lib/api'
import styles from './UserList.module.css'

export default function UserList({ searchParams }) {
  const { status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {}
      if (searchParams?.page) params.page = searchParams.page
      if (searchParams?.search) params.search = searchParams.search
      if (searchParams?.status) params.status = searchParams.status
      if (searchParams?.provider) params.provider = searchParams.provider

      const result = await api.get('/api/admin/users', params)

      if (result.success && result.data) {
        setUsers(result.data.users)
        setPagination(result.data.pagination)
      } else {
        setError('Invalid response format')
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in?callbackUrl=/admin/users')
      return
    }

    if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status, searchParams, router])

  const columns = [
    {
      key: 'user',
      label: '사용자',
      sortable: true,
      width: '300px',
      render: (_, user) => (
        <div className={styles.userCell}>
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || 'User'}
              width={40}
              height={40}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {(user.name || user.email)[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className={styles.userName}>{user.name || '이름 없음'}</div>
            <div className={styles.userEmail}>{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      width: '120px',
      render: (status) => (
        <Badge variant={getStatusVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: '가입일',
      sortable: true,
      width: '140px',
      render: (date) => new Date(date).toLocaleDateString('ko-KR'),
    },
    {
      key: 'stats',
      label: '활동',
      width: '150px',
      render: (stats) => (
        <div className={styles.statsCell}>
          <span>스터디 {stats.studiesOwned + stats.studiesJoined}</span>
          <span>메시지 {stats.messagesCount}</span>
        </div>
      ),
    },
    {
      key: 'warnings',
      label: '경고',
      sortable: true,
      width: '100px',
      render: (_, user) => (
        user.stats.warningsCount > 0 ? (
          <Badge variant="warning">{user.stats.warningsCount}회</Badge>
        ) : (
          <span className={styles.noWarning}>없음</span>
        )
      ),
    },
    {
      key: 'actions',
      label: '액션',
      width: '120px',
      render: (_, user) => (
        <Link href={`/admin/users/${user.id}`}>
          <Button size="sm" variant="outline">상세보기</Button>
        </Link>
      ),
    },
  ]

  if (status === 'loading') {
    return (
      <Card>
        <Table
          columns={columns}
          data={[]}
          loading
        />
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
          <p>⚠️ 사용자 목록을 불러올 수 없습니다.</p>
          <p>{error}</p>
          <Button onClick={fetchUsers} variant="primary">다시 시도</Button>
        </div>
      </Card>
    )
  }

  return (
    <div className={styles.container}>
      {selectedRows.length > 0 && (
        <div className={styles.bulkActions}>
          <span>{selectedRows.length}명 선택됨</span>
          <Button size="sm" variant="outline" onClick={() => setSelectedRows([])}>
            선택 해제
          </Button>
          <Button size="sm" variant="danger">일괄 정지</Button>
        </div>
      )}

      <Card>
        <Table
          columns={columns}
          data={users}
          sortable
          selectable
          selectedRows={selectedRows}
          onSelectRows={setSelectedRows}
          loading={loading}
          stickyHeader
          emptyState={
            <div className={styles.empty}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              <p>사용자가 없습니다</p>
            </div>
          }
        />
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <Button
            size="sm"
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => router.push(`/admin/users?page=${pagination.page - 1}`)}
          >
            이전
          </Button>
          <span className={styles.pageInfo}>
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => router.push(`/admin/users?page=${pagination.page + 1}`)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  )
}

function getStatusVariant(status) {
  const variants = {
    ACTIVE: 'success',
    SUSPENDED: 'warning',
    BANNED: 'danger',
    PENDING: 'default',
  }
  return variants[status] || 'default'
}

function getStatusLabel(status) {
  const labels = {
    ACTIVE: '활성',
    SUSPENDED: '정지',
    BANNED: '차단',
    PENDING: '대기',
  }
  return labels[status] || status
}

