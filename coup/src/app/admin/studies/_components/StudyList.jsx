/**
 * 스터디 목록 컴포넌트
 * Server Component - 직접 DB 조회
 */

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import Badge from '@/components/admin/ui/Badge'
import StudyFilters from './StudyFilters'
import styles from './StudyList.module.css'

const prisma = new PrismaClient()

// 스터디 데이터 가져오기 (직접 DB 조회)
async function getStudies(searchParams) {
  // 세션 확인
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/admin/studies')
  }

  // 관리자 권한 확인
  const adminRole = await prisma.adminRole.findUnique({
    where: { userId: session.user.id },
  })

  if (!adminRole) {
    redirect('/dashboard')
  }

  // 페이지네이션
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  // 필터
  const search = searchParams.search
  const category = searchParams.category
  const isPublic = searchParams.isPublic
  const isRecruiting = searchParams.isRecruiting
  const sortBy = searchParams.sortBy || 'createdAt'
  const sortOrder = searchParams.sortOrder || 'desc'

  // Where 조건 구성
  const where = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (category && category !== 'all') {
    where.category = category
  }

  if (isPublic !== null && isPublic !== 'all') {
    where.isPublic = isPublic === 'true'
  }

  if (isRecruiting !== null && isRecruiting !== 'all') {
    where.isRecruiting = isRecruiting === 'true'
  }

  try {
    // 스터디 조회
    const [studies, total] = await Promise.all([
      prisma.study.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              status: true,
            },
          },
          _count: {
            select: {
              members: { where: { status: 'ACTIVE' } },
              messages: true,
              files: true,
              notices: true,
            },
          },
        },
      }),
      prisma.study.count({ where }),
    ])

    // 통계
    const [publicCount, recruitingCount] = await Promise.all([
      prisma.study.count({ where: { ...where, isPublic: true } }),
      prisma.study.count({ where: { ...where, isRecruiting: true } }),
    ])

    return {
      studies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      stats: {
        total,
        public: publicCount,
        recruiting: recruitingCount,
      },
    }
  } catch (error) {
    console.error('❌ [StudyList] Database error:', error)
    throw new Error('스터디 목록을 불러오는데 실패했습니다')
  } finally {
    await prisma.$disconnect()
  }
}

export default async function StudyList({ searchParams = {} }) {
  // Next.js 15+에서 searchParams는 Promise
  const params = await searchParams

  let data
  try {
    data = await getStudies(params)
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

