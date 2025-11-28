'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './UserFilters.module.css'

export default function UserFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [provider, setProvider] = useState(searchParams.get('provider') || 'all')

  const handleSearch = (e) => {
    e.preventDefault()
    updateFilters({ search, status, provider })
  }

  const updateFilters = (filters) => {
    const params = new URLSearchParams()

    if (filters.search) params.set('search', filters.search)
    if (filters.status !== 'all') params.set('status', filters.status)
    if (filters.provider !== 'all') params.set('provider', filters.provider)

    router.push(`/admin/users?${params.toString()}`)
  }

  const handleReset = () => {
    setSearch('')
    setStatus('all')
    setProvider('all')
    router.push('/admin/users')
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchWrapper}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.searchIcon}>
            <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="이메일, 이름으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              updateFilters({ search, status: e.target.value, provider })
            }}
            className={styles.select}
          >
            <option value="all">모든 상태</option>
            <option value="ACTIVE">활성</option>
            <option value="SUSPENDED">정지</option>
            <option value="DELETED">삭제됨</option>
          </select>

          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value)
              updateFilters({ search, status, provider: e.target.value })
            }}
            className={styles.select}
          >
            <option value="all">모든 가입방식</option>
            <option value="CREDENTIALS">이메일</option>
            <option value="GOOGLE">Google</option>
            <option value="GITHUB">GitHub</option>
          </select>

          {(search || status !== 'all' || provider !== 'all') && (
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetButton}
            >
              초기화
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

