/**
 * 스터디 목록 컴포넌트
 * Server Component - API 데이터 페칭 및 테이블 렌더링
 */

import Link from 'next/link'
import Badge from '@/components/admin/ui/Badge'
import StudyFilters from './StudyFilters'
import styles from './StudyList.module.css'

// API에서 스터디 데이터 가져오기
async function getStudies(searchParams) {
  const params = new URLSearchParams()

  // 필터 파라미터 추가
  if (searchParams.page) params.set('page', searchParams.page)
  if (searchParams.search) params.set('search', searchParams.search)
  if (searchParams.category) params.set('category', searchParams.category)
  if (searchParams.isPublic) params.set('isPublic', searchParams.isPublic)
  if (searchParams.isRecruiting)
    params.set('isRecruiting', searchParams.isRecruiting)
  if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy)
  if (searchParams.sortOrder) params.set('sortOrder', searchParams.sortOrder)

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/admin/studies?${params.toString()}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('스터디 목록을 불러오는데 실패했습니다')
  }

  return res.json()
}

export default async function StudyList({ searchParams = {} }) {
  let data
  try {
    const response = await getStudies(searchParams)
    data = response.data
  } catch (error) {
    return (
      <div className={styles.error}>
        <p>스터디 목록을 불러오는데 실패했습니다.</p>
        <p className={styles.errorDetail}>{error.message}</p>
      </div>
    )
  }

  const { studies, pagination, stats } = data
  const currentPage = pagination.page

  return (
    <div>
      {/* 필터 */}
      <StudyFilters />

      {/* 통계 */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>전체 스터디</div>
          <div className={styles.statValue}>{stats.total.toLocaleString()}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>공개 스터디</div>
          <div className={styles.statValue}>{stats.public.toLocaleString()}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>모집중</div>
          <div className={styles.statValue}>
            {stats.recruiting.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>스터디 정보</th>
              <th>스터디장</th>
              <th>카테고리</th>
              <th>멤버</th>
              <th>활동</th>
              <th>상태</th>
              <th>생성일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {studies.length === 0 ? (
              <tr>
                <td colSpan="8" className={styles.emptyRow}>
                  스터디가 없습니다
                </td>
              </tr>
            ) : (
              studies.map((study) => (
                <tr key={study.id}>
                  {/* 스터디 정보 */}
                  <td>
                    <div className={styles.studyInfo}>
                      <span className={styles.emoji}>{study.emoji}</span>
                      <div>
                        <Link
                          href={`/admin/studies/${study.id}`}
                          className={styles.studyName}
                        >
                          {study.name}
                        </Link>
                        <div className={styles.studyDescription}>
                          {study.description.length > 50
                            ? `${study.description.slice(0, 50)}...`
                            : study.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 스터디장 */}
                  <td>
                    <div className={styles.ownerInfo}>
                      <div className={styles.ownerName}>
                        {study.owner.name || '익명'}
                      </div>
                      <div className={styles.ownerEmail}>{study.owner.email}</div>
                    </div>
                  </td>

                  {/* 카테고리 */}
                  <td>
                    <div className={styles.category}>{study.category}</div>
                    {study.subCategory && (
                      <div className={styles.subCategory}>
                        {study.subCategory}
                      </div>
                    )}
                  </td>

                  {/* 멤버 수 */}
                  <td>
                    <div className={styles.memberCount}>
                      <strong>{study.stats.memberCount}</strong>
                      <span className={styles.maxMembers}>
                        /{study.settings.maxMembers}
                      </span>
                    </div>
                  </td>

                  {/* 활동 통계 */}
                  <td>
                    <div className={styles.activityStats}>
                      <div>💬 {study.stats.messageCount}</div>
                      <div>📎 {study.stats.fileCount}</div>
                      <div>⭐ {study.stats.rating.toFixed(1)}</div>
                    </div>
                  </td>

                  {/* 상태 */}
                  <td>
                    <div className={styles.statusBadges}>
                      {study.settings.isPublic ? (
                        <Badge variant="success">공개</Badge>
                      ) : (
                        <Badge variant="secondary">비공개</Badge>
                      )}
                      {study.settings.isRecruiting ? (
                        <Badge variant="primary">모집중</Badge>
                      ) : (
                        <Badge variant="secondary">모집마감</Badge>
                      )}
                    </div>
                  </td>

                  {/* 생성일 */}
                  <td>
                    <div className={styles.date}>
                      {new Date(study.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                    <div className={styles.lastActivity}>
                      최근 활동:{' '}
                      {new Date(study.lastActivityAt).toLocaleDateString(
                        'ko-KR'
                      )}
                    </div>
                  </td>

                  {/* 액션 */}
                  <td>
                    <Link
                      href={`/admin/studies/${study.id}`}
                      className={styles.detailButton}
                    >
                      상세보기
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          {pagination.hasPrev && (
            <Link
              href={`/admin/studies?page=${currentPage - 1}${
                searchParams.search ? `&search=${searchParams.search}` : ''
              }${
                searchParams.category ? `&category=${searchParams.category}` : ''
              }`}
              className={styles.pageButton}
            >
              이전
            </Link>
          )}

          <div className={styles.pageInfo}>
            {currentPage} / {pagination.totalPages}
          </div>

          {pagination.hasNext && (
            <Link
              href={`/admin/studies?page=${currentPage + 1}${
                searchParams.search ? `&search=${searchParams.search}` : ''
              }${
                searchParams.category ? `&category=${searchParams.category}` : ''
              }`}
              className={styles.pageButton}
            >
              다음
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

