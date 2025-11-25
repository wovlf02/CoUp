'use client'

import styles from './UserPagination.module.css'

/**
 * 사용자 페이지네이션 컴포넌트
 */
export default function UserPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= Math.min(4, totalPages); i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className={styles.userPaginationContainer}>
      {/* 항목 정보 */}
      <div className={styles.userPaginationInfo}>
        {startItem}-{endItem} / {totalItems}
      </div>

      {/* 페이지 버튼 */}
      <div className={styles.userPaginationButtons}>
        <button
          className={styles.userPaginationPageBtn}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="이전 페이지"
        >
          ←
        </button>

        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className={styles.userPaginationEllipsis}>
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`${styles.userPaginationPageBtn} ${
                currentPage === page ? styles.userPaginationPageBtnActive : ''
              }`}
              onClick={() => onPageChange(page)}
              aria-label={`페이지 ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        ))}

        <button
          className={styles.userPaginationPageBtn}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="다음 페이지"
        >
          →
        </button>
      </div>

      {/* 페이지당 항목 수 선택 */}
      <select
        className={styles.userPaginationPerPageSelect}
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        aria-label="페이지당 항목 수"
      >
        <option value={10}>10개씩</option>
        <option value={20}>20개씩</option>
        <option value={50}>50개씩</option>
        <option value={100}>100개씩</option>
      </select>
    </div>
  )
}

