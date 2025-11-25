import { useState, useCallback, useMemo } from 'react'

/**
 * 사용자 선택 상태를 관리하는 Custom Hook
 * @returns {Object} 선택 상태 및 제어 함수
 */
export function useUserSelection() {
  const [selectedUsers, setSelectedUsers] = useState([])

  // 단일 사용자 선택/해제
  const selectUser = useCallback((userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }, [])

  // 전체 선택
  const selectAll = useCallback((userIds) => {
    setSelectedUsers(userIds)
  }, [])

  // 전체 해제
  const deselectAll = useCallback(() => {
    setSelectedUsers([])
  }, [])

  // 전체 선택 토글
  const toggleSelectAll = useCallback((userIds) => {
    setSelectedUsers(prev => {
      if (prev.length === userIds.length && userIds.every(id => prev.includes(id))) {
        return []
      } else {
        return userIds
      }
    })
  }, [])

  // 선택 여부 확인
  const isSelected = useCallback((userId) => {
    return selectedUsers.includes(userId)
  }, [selectedUsers])

  // 전체 선택 여부
  const isAllSelected = useMemo(() => {
    return (userIds) => {
      return userIds.length > 0 && userIds.every(id => selectedUsers.includes(id))
    }
  }, [selectedUsers])

  // 선택된 사용자 수
  const selectedCount = selectedUsers.length

  // 선택 여부
  const hasSelection = selectedCount > 0

  return {
    selectedUsers,
    selectedCount,
    hasSelection,
    selectUser,
    selectAll,
    deselectAll,
    toggleSelectAll,
    isSelected,
    isAllSelected
  }
}

