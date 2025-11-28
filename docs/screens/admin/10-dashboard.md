# 관리자 대시보드

> 관리자 홈 화면 - 주요 지표 및 최근 활동

## 📁 파일 구조

```
src/app/admin/
└── page.jsx                    # 대시보드 페이지 (~100줄)

src/app/admin/_components/
├── StatsCards.jsx             # 통계 카드 (~100줄)
├── StatsCards.module.css
├── RecentActivity.jsx         # 최근 활동 (~150줄)
├── RecentActivity.module.css
├── QuickActions.jsx           # 빠른 액션 (~80줄)
└── QuickActions.module.css
```

## 1. 대시보드 페이지 (page.jsx)

**위치**: `src/app/admin/page.jsx`  
**코드 길이**: ~100줄

```jsx
import { Suspense } from 'react'
import StatsCards from './_components/StatsCards'
import RecentActivity from './_components/RecentActivity'
import QuickActions from './_components/QuickActions'
import styles from './page.module.css'

export const metadata = {
  title: '대시보드 | CoUp 관리자'
}

export default function AdminDashboardPage() {
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>대시보드</h1>
        <p className={styles.subtitle}>
          플랫폼 현황을 한눈에 확인하세요
        </p>
      </header>

      {/* 통계 카드 */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      <div className={styles.grid}>
        {/* 최근 활동 */}
        <section className={styles.mainSection}>
          <Suspense fallback={<ActivitySkeleton />}>
            <RecentActivity />
          </Suspense>
        </section>

        {/* 빠른 액션 */}
        <aside className={styles.sidebar}>
          <QuickActions />
        </aside>
      </div>
    </div>
  )
}

function StatsCardsSkeleton() {
  return (
    <div className={styles.statsGrid}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={styles.skeletonCard} />
      ))}
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className={styles.skeletonActivity}>
      {[1, 2, 3].map(i => (
        <div key={i} className={styles.skeletonItem} />
      ))}
    </div>
  )
}
```

**CSS**: `src/app/admin/page.module.css`

```css
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.header {
  margin-bottom: var(--space-md);
}

.title {
  font-size: var(--heading-xl);
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 var(--space-xs) 0;
}

.subtitle {
  font-size: var(--body-lg);
  color: var(--gray-600);
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-xl);
}

.mainSection {
  min-width: 0;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-lg);
}

.skeletonCard {
  height: 120px;
  background: linear-gradient(90deg, var(--gray-100) 25%, var(--gray-50) 50%, var(--gray-100) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

## 2. 통계 카드 (StatsCards.jsx)

**위치**: `src/app/admin/_components/StatsCards.jsx`  
**코드 길이**: ~100줄

```jsx
import styles from './StatsCards.module.css'

async function getStats() {
  // Server Component에서 데이터 가져오기
  const res = await fetch('http://localhost:3000/api/admin/stats', {
    next: { revalidate: 60 } // 1분 캐시
  })
  
  if (!res.ok) return null
  return res.json()
}

export default async function StatsCards() {
  const data = await getStats()
  
  if (!data) {
    return <div>통계를 불러올 수 없습니다</div>
  }

  const stats = [
    {
      label: '전체 사용자',
      value: data.totalUsers.toLocaleString(),
      change: `+${data.newUsersToday}`,
      changeLabel: '오늘',
      color: 'blue',
      icon: '👥'
    },
    {
      label: '활성 스터디',
      value: data.activeStudies.toLocaleString(),
      change: `+${data.newStudiesToday}`,
      changeLabel: '오늘',
      color: 'green',
      icon: '📚'
    },
    {
      label: '미처리 신고',
      value: data.pendingReports.toLocaleString(),
      change: data.urgentReports > 0 ? `긴급 ${data.urgentReports}건` : null,
      changeLabel: '',
      color: 'red',
      icon: '🚨'
    },
    {
      label: '오늘 활동',
      value: data.todayActivity.toLocaleString(),
      change: `${data.activityTrend}%`,
      changeLabel: '어제 대비',
      color: 'purple',
      icon: '📊'
    }
  ]

  return (
    <div className={styles.statsCards}>
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={`${styles.card} ${styles[stat.color]}`}
        >
          <div className={styles.cardHeader}>
            <span className={styles.icon}>{stat.icon}</span>
            <span className={styles.label}>{stat.label}</span>
          </div>
          
          <div className={styles.value}>{stat.value}</div>
          
          {stat.change && (
            <div className={styles.change}>
              <span className={styles.changeValue}>{stat.change}</span>
              {stat.changeLabel && (
                <span className={styles.changeLabel}>{stat.changeLabel}</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

**CSS**: `src/app/admin/_components/StatsCards.module.css`

```css
.statsCards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-lg);
}

.card {
  padding: var(--space-lg);
  background-color: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.cardHeader {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.icon {
  font-size: 24px;
}

.label {
  font-size: var(--body-md);
  color: var(--gray-600);
  font-weight: 500;
}

.value {
  font-size: var(--heading-xl);
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--space-sm);
}

.change {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.changeValue {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: var(--body-sm);
  font-weight: 600;
}

.changeLabel {
  font-size: var(--body-sm);
  color: var(--gray-500);
}

.card.blue .changeValue {
  background-color: #EFF6FF;
  color: #1D4ED8;
}

.card.green .changeValue {
  background-color: #F0FDF4;
  color: #15803D;
}

.card.red .changeValue {
  background-color: #FEF2F2;
  color: #DC2626;
}

.card.purple .changeValue {
  background-color: #FAF5FF;
  color: #7C3AED;
}
```

## 3. 최근 활동 (RecentActivity.jsx)

**위치**: `src/app/admin/_components/RecentActivity.jsx`  
**코드 길이**: ~150줄

```jsx
import Link from 'next/link'
import styles from './RecentActivity.module.css'

async function getRecentActivity() {
  const res = await fetch('http://localhost:3000/api/admin/activity', {
    next: { revalidate: 30 }
  })
  
  if (!res.ok) return []
  const data = await res.json()
  return data.activities || []
}

export default async function RecentActivity() {
  const activities = await getRecentActivity()

  return (
    <div className={styles.recentActivity}>
      <div className={styles.header}>
        <h2 className={styles.title}>최근 활동</h2>
        <Link href="/admin/logs" className={styles.viewAll}>
          전체 보기 →
        </Link>
      </div>

      <div className={styles.timeline}>
        {activities.length === 0 ? (
          <div className={styles.empty}>
            <p>최근 활동이 없습니다</p>
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </div>
  )
}

function ActivityItem({ activity }) {
  const iconMap = {
    USER_WARN: '⚠️',
    USER_SUSPEND: '🚫',
    STUDY_HIDE: '👁️',
    REPORT_RESOLVE: '✅',
    CONTENT_DELETE: '🗑️'
  }

  const colorMap = {
    USER_WARN: 'warning',
    USER_SUSPEND: 'danger',
    STUDY_HIDE: 'info',
    REPORT_RESOLVE: 'success',
    CONTENT_DELETE: 'danger'
  }

  return (
    <div className={styles.activityItem}>
      <div className={`${styles.iconContainer} ${styles[colorMap[activity.action]]}`}>
        <span className={styles.activityIcon}>
          {iconMap[activity.action] || '📝'}
        </span>
      </div>

      <div className={styles.activityContent}>
        <p className={styles.activityText}>
          <strong>{activity.adminName}</strong>님이{' '}
          {activity.description}
        </p>
        <div className={styles.activityMeta}>
          <time className={styles.time}>
            {formatTime(activity.createdAt)}
          </time>
          {activity.targetLink && (
            <>
              <span className={styles.dot}>•</span>
              <Link href={activity.targetLink} className={styles.link}>
                상세 보기
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function formatTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`
  return `${Math.floor(minutes / 1440)}일 전`
}
```

**CSS**: `src/app/admin/_components/RecentActivity.module.css`

```css
.recentActivity {
  background-color: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: var(--space-xl);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.title {
  font-size: var(--heading-md);
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.viewAll {
  color: var(--admin-primary);
  text-decoration: none;
  font-size: var(--body-md);
  font-weight: 500;
}

.viewAll:hover {
  text-decoration: underline;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.activityItem {
  display: flex;
  gap: var(--space-md);
}

.iconContainer {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.iconContainer.success {
  background-color: #F0FDF4;
}

.iconContainer.warning {
  background-color: #FEF3C7;
}

.iconContainer.danger {
  background-color: #FEE2E2;
}

.iconContainer.info {
  background-color: #EFF6FF;
}

.activityIcon {
  font-size: 20px;
}

.activityContent {
  flex: 1;
  min-width: 0;
}

.activityText {
  margin: 0 0 var(--space-xs) 0;
  color: var(--gray-700);
  font-size: var(--body-md);
}

.activityMeta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--body-sm);
}

.time {
  color: var(--gray-500);
}

.dot {
  color: var(--gray-400);
}

.link {
  color: var(--admin-primary);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.empty {
  padding: var(--space-2xl);
  text-align: center;
  color: var(--gray-500);
}
```

## 4. 빠른 액션 (QuickActions.jsx)

**위치**: `src/app/admin/_components/QuickActions.jsx`  
**코드 길이**: ~80줄

```jsx
'use client'

import { useRouter } from 'next/navigation'
import styles from './QuickActions.module.css'

export default function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      icon: '👥',
      label: '사용자 관리',
      description: '사용자 조회 및 관리',
      href: '/admin/users'
    },
    {
      icon: '🚨',
      label: '신고 처리',
      description: '미처리 신고 확인',
      href: '/admin/reports',
      badge: 5
    },
    {
      icon: '📚',
      label: '스터디 관리',
      description: '스터디 모니터링',
      href: '/admin/studies'
    },
    {
      icon: '📊',
      label: '통계 보기',
      description: '상세 통계 및 분석',
      href: '/admin/analytics'
    }
  ]

  return (
    <div className={styles.quickActions}>
      <h3 className={styles.title}>빠른 액션</h3>
      
      <div className={styles.actions}>
        {actions.map((action, index) => (
          <button
            key={index}
            className={styles.actionButton}
            onClick={() => router.push(action.href)}
          >
            <div className={styles.actionIcon}>{action.icon}</div>
            <div className={styles.actionContent}>
              <div className={styles.actionLabel}>
                {action.label}
                {action.badge && (
                  <span className={styles.badge}>{action.badge}</span>
                )}
              </div>
              <div className={styles.actionDesc}>{action.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

**CSS**: `src/app/admin/_components/QuickActions.module.css`

```css
.quickActions {
  background-color: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: var(--space-lg);
}

.title {
  font-size: var(--heading-sm);
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 var(--space-md) 0;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.actionButton {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  width: 100%;
  padding: var(--space-md);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.actionButton:hover {
  background-color: var(--gray-50);
  border-color: var(--admin-primary);
  transform: translateX(4px);
}

.actionIcon {
  font-size: 24px;
}

.actionContent {
  flex: 1;
  min-width: 0;
}

.actionLabel {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--body-md);
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 2px;
}

.badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background-color: var(--status-danger);
  color: white;
  font-size: 11px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actionDesc {
  font-size: var(--body-sm);
  color: var(--gray-600);
}
```

## ✅ 체크리스트

- [x] Server Component로 데이터 fetching
- [x] Suspense로 로딩 처리
- [x] CSS 모듈 분리
- [x] 고유 className
- [x] 100-300줄 준수
- [x] 반응형 디자인
- [x] 실시간 업데이트 가능 구조

