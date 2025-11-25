import { useState, useEffect, useMemo } from 'react'

/**
 * 디바운싱 검색 로직을 관리하는 Custom Hook
 * @param {Array} users - 검색할 사용자 배열
 * @param {Object} options - 옵션 (debounceMs)
 * @returns {Object} 검색 상태 및 결과
 */
export function useUserSearch(users = [], options = {}) {
  const { debounceMs = 300 } = options

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // 디바운싱 처리
  useEffect(() => {
    setIsSearching(true)
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setIsSearching(false)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchQuery, debounceMs])

  // 검색 결과
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return users
    }

    const query = debouncedQuery.toLowerCase().trim()

    return users.filter(user => {
      const matchesName = user.name?.toLowerCase().includes(query)
      const matchesEmail = user.email?.toLowerCase().includes(query)
      const matchesProvider = user.provider?.toLowerCase().includes(query)

      return matchesName || matchesEmail || matchesProvider
    })
  }, [users, debouncedQuery])

  // 검색어 초기화
  const clearSearch = () => {
    setSearchQuery('')
    setDebouncedQuery('')
  }

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    searchResults,
    isSearching,
    clearSearch,
    hasSearchQuery: searchQuery.length > 0
  }
}

