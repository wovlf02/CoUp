'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './Breadcrumb.module.css'

const pathNames = {
  '/admin': '대시보드',
  '/admin/users': '사용자 관리',
  '/admin/studies': '스터디 관리',
  '/admin/reports': '신고 처리',
  '/admin/analytics': '분석',
  '/admin/settings': '시스템 설정',
}

export default function Breadcrumb() {
  const pathname = usePathname()

  // 경로를 배열로 분할
  const paths = pathname.split('/').filter(Boolean)

  // 빵부스러기 생성
  const breadcrumbs = []
  let currentPath = ''

  for (const path of paths) {
    currentPath += `/${path}`
    const name = pathNames[currentPath] || path
    breadcrumbs.push({
      name,
      path: currentPath,
    })
  }

  // 대시보드만 있는 경우 빵부스러기 숨김
  if (breadcrumbs.length === 1 && breadcrumbs[0].path === '/admin') {
    return null
  }

  return (
    <nav className={styles.breadcrumb}>
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link href="/admin" className={styles.link}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L2 7V14H6V11H10V14H14V7L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            대시보드
          </Link>
        </li>

        {breadcrumbs.slice(1).map((crumb, index) => (
          <li key={crumb.path} className={styles.item}>
            <span className={styles.separator}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            {index === breadcrumbs.length - 2 ? (
              <span className={styles.current}>{crumb.name}</span>
            ) : (
              <Link href={crumb.path} className={styles.link}>
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

