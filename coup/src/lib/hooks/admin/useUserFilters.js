import { useState, useMemo } from 'react'

/**
 * 사용자 필터링 로직을 관리하는 Custom Hook
 * @param {Array} users - 필터링할 사용자 배열
 * @returns {Object} 필터 상태 및 제어 함수
 */
export function useUserFilters(users = []) {
  const [filters, setFilters] = useState({
    status: 'all',
    provider: 'all',
    dateRange: {
      start: null,
      end: null
    }
  })

  // 필터 적용
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 상태 필터
      if (filters.status !== 'all' && user.status !== filters.status.toUpperCase()) {
        return false
      }

      // 가입 방법 필터
      if (filters.provider !== 'all' && user.provider !== filters.provider.toUpperCase()) {
        return false
      }

      // 날짜 범위 필터
      if (filters.dateRange.start) {
        const userDate = new Date(user.createdAt)
        const startDate = new Date(filters.dateRange.start)
        if (userDate < startDate) return false
      }

      if (filters.dateRange.end) {
        const userDate = new Date(user.createdAt)
        const endDate = new Date(filters.dateRange.end)
        endDate.setHours(23, 59, 59, 999) // 하루 끝까지
        if (userDate > endDate) return false
      }

      return true
    })
  }, [users, filters])

  // 상태 필터 변경
  const setStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status }))
  }

  // 가입 방법 필터 변경
  const setProviderFilter = (provider) => {
    setFilters(prev => ({ ...prev, provider }))
  }

  // 날짜 범위 필터 변경
  const setDateRangeFilter = (dateRange) => {
    setFilters(prev => ({ ...prev, dateRange }))
  }

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      status: 'all',
      provider: 'all',
      dateRange: {
        start: null,
        end: null
      }
    })
  }

  // 활성 필터 개수
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.status !== 'all') count++
    if (filters.provider !== 'all') count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    return count
  }, [filters])

  return {
    filters,
    filteredUsers,
    activeFilterCount,
    setStatusFilter,
    setProviderFilter,
    setDateRangeFilter,
    resetFilters
  }
}

