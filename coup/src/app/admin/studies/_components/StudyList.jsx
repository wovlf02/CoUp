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
import styles from './StudyList.module.css'

export default function StudyList() {
  const { status } = useSession()
  const router = useRouter()
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])

  const fetchStudies = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await api.get('/api/admin/studies')

      if (result.success && result.data) {
        setStudies(result.data.studies || [])
      } else {
        setError('Invalid response format')
      }
    } catch (err) {
      console.error('Failed to fetch studies:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in?callbackUrl=/admin/studies')
      return
    }

    if (status === 'authenticated') {
      fetchStudies()
    }
  }, [status, router])

  const columns = [
    {
      key: 'title',
      label: '스터디명',
      sortable: true,
      width: '300px',
      render: (title, study) => (
        <div className={styles.studyCell}>
          {study.thumbnail ? (
            <Image
              src={study.thumbnail}
              alt={title}
              width={56}
              height={56}
              className={styles.thumbnail}
            />
          ) : (
            <div className={styles.thumbnailPlaceholder}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 016 4.193V3.75zm6.5 0v.325a41.622 41.622 0 00-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25zM10 10a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V11a1 1 0 00-1-1H10z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <div className={styles.studyInfo}>
            <div className={styles.studyTitle}>{title}</div>
            <div className={styles.studyOwner}>{study.owner?.name || '알 수 없음'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: '카테고리',
      sortable: true,
      width: '120px',
      render: (category) => (
        <Badge variant="default" style={{
          backgroundColor: getCategoryColor(category).bg,
          color: getCategoryColor(category).fg,
        }}>
          {category}
        </Badge>
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
      key: 'members',
      label: '인원',
      sortable: true,
      width: '100px',
      render: (_, study) => (
        <span className={styles.memberCount}>
          {study.currentMembers}/{study.maxMembers}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: '생성일',
      sortable: true,
      width: '120px',
      render: (date) => new Date(date).toLocaleDateString('ko-KR'),
    },
    {
      key: 'actions',
      label: '액션',
      width: '120px',
      render: (_, study) => (
        <Link href={`/admin/studies/${study.id}`}>
          <Button size="sm" variant="outline">상세보기</Button>
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
          <p>⚠️ 스터디 목록을 불러올 수 없습니다.</p>
          <p>{error}</p>
          <Button onClick={fetchStudies} variant="primary">다시 시도</Button>
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
          <Button size="sm" variant="danger">일괄 종료</Button>
        </div>
      )}

      <Card>
        <Table
          columns={columns}
          data={studies}
          sortable
          selectable
          selectedRows={selectedRows}
          onSelectRows={setSelectedRows}
          loading={loading}
          stickyHeader
          emptyState={
            <div className={styles.empty}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>스터디가 없습니다</p>
            </div>
          }
        />
      </Card>
    </div>
  )
}

function getStatusVariant(status) {
  const variants = {
    ACTIVE: 'success',
    RECRUITING: 'primary',
    COMPLETED: 'default',
    CLOSED: 'danger',
  }
  return variants[status] || 'default'
}

function getStatusLabel(status) {
  const labels = {
    ACTIVE: '진행중',
    RECRUITING: '모집중',
    COMPLETED: '완료',
    CLOSED: '종료',
  }
  return labels[status] || status
}

function getCategoryColor(category) {
  const colors = {
    '프로그래밍': { bg: 'var(--pastel-blue-100)', fg: 'var(--pastel-blue-600)' },
    '디자인': { bg: 'var(--pastel-pink-100)', fg: 'var(--pastel-pink-600)' },
    '어학': { bg: 'var(--pastel-green-100)', fg: 'var(--pastel-green-600)' },
    '자격증': { bg: 'var(--pastel-orange-100)', fg: 'var(--pastel-orange-600)' },
    '취미': { bg: 'var(--pastel-purple-100)', fg: 'var(--pastel-purple-600)' },
    '기타': { bg: 'var(--pastel-indigo-100)', fg: 'var(--pastel-indigo-600)' },
  }
  return colors[category] || { bg: 'var(--gray-100)', fg: 'var(--gray-600)' }
}

