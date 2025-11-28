'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Badge from '@/components/admin/ui/Badge'
import api from '@/lib/api'
import styles from './UserList.module.css'

export default function UserList({ searchParams }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in?callbackUrl=/admin/users')
      return
    }

    if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status, searchParams, router])

  async function fetchUsers() {
    try {
      setLoading(true)
      setError(null)

      // 간단한 GET 요청 with query parameters
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
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>사용자 목록을 불러오는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>⚠️ 사용자 목록을 불러올 수 없습니다.</p>
          <p>{error}</p>
          <button onClick={fetchUsers} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className={styles.empty}>
        <p>사용자가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>사용자</th>
              <th>상태</th>
              <th>가입일</th>
              <th>활동</th>
              <th>경고</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
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
                </td>
                <td>
                  <Badge variant={getStatusVariant(user.status)}>
                    {getStatusLabel(user.status)}
                  </Badge>
                </td>
                <td className={styles.dateCell}>
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td>
                  <div className={styles.statsCell}>
                    <span>스터디 {user.stats.studiesOwned + user.stats.studiesJoined}</span>
                    <span>메시지 {user.stats.messagesCount}</span>
                  </div>
                </td>
                <td>
                  {user.stats.warningsCount > 0 ? (
                    <Badge variant="warning">{user.stats.warningsCount}회</Badge>
                  ) : (
                    <span className={styles.noWarning}>없음</span>
                  )}
                </td>
                <td>
                  <Link href={`/admin/users/${user.id}`} className={styles.viewButton}>
                    상세보기
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={pagination.page === 1}
            className={styles.pageButton}
          >
            이전
          </button>
          <span className={styles.pageInfo}>
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page === pagination.totalPages}
            className={styles.pageButton}
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}

function getStatusVariant(status) {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'SUSPENDED':
      return 'danger'
    case 'DELETED':
      return 'default'
    default:
      return 'default'
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'ACTIVE':
      return '활성'
    case 'SUSPENDED':
      return '정지'
    case 'DELETED':
      return '삭제됨'
    default:
      return status
  }
}

