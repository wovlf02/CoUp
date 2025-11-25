# 관리자 대시보드 - 컴포넌트 상세 구현

> **작성일**: 2025-11-25  
> **언어**: JavaScript + JSDoc  
> **Next.js**: 16 App Router

---

## 📄 1. 메인 페이지 (Server Component)

### 파일: `app/admin/page.js`

```jsx
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import StatCards from '@/components/admin/dashboard/StatCards'
import UserGrowthChart from '@/components/admin/dashboard/UserGrowthChart'
import RecentReports from '@/components/admin/dashboard/RecentReports'
import RealtimeStatus from '@/components/admin/dashboard/RealtimeStatus'
import SystemStatus from '@/components/admin/dashboard/SystemStatus'
import StudyActivityChart from '@/components/admin/dashboard/StudyActivityChart'
import { StatCardsSkeleton, ChartSkeleton, ReportsSkeleton } from '@/components/admin/dashboard/skeletons'

/**
 * 관리자 대시보드 메인 페이지 (Server Component)
 * @returns {Promise<JSX.Element>}
 */
export default async function AdminDashboard() {
  // 권한 확인 (추가 보안)
  const session = await auth()
  if (!session || session.user.role !== 'SYSTEM_ADMIN') {
    redirect('/sign-in')
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 관리자 대시보드</h1>
          <p className="text-sm text-gray-600 mt-1">플랫폼 전체 현황을 한눈에 확인하세요</p>
        </div>
        {/* 새로고침은 클라이언트 컴포넌트로 분리 */}
      </div>
      
      {/* 2컬럼 그리드: 메인 (70%) + 위젯 (30%) */}
      <div className="grid grid-cols-[70%_30%] gap-6">
        {/* 메인 콘텐츠 (좌측) */}
        <div className="space-y-6">
          {/* 1. 통계 카드 (빠른 로딩) */}
          <Suspense fallback={<StatCardsSkeleton />}>
            <StatCards />
          </Suspense>
          
          {/* 2. 사용자 증가 추이 차트 */}
          <Suspense fallback={<ChartSkeleton title="사용자 증가 추이" />}>
            <UserGrowthChart />
          </Suspense>
          
          {/* 3. 하단 2컬럼 */}
          <div className="grid grid-cols-2 gap-6">
            {/* 최근 신고 */}
            <Suspense fallback={<ReportsSkeleton />}>
              <RecentReports />
            </Suspense>
            
            {/* 실시간 현황 */}
            <RealtimeStatus />
          </div>
          
          {/* 4. 스터디 활동 현황 */}
          <Suspense fallback={<ChartSkeleton title="스터디 활동 현황" />}>
            <StudyActivityChart />
          </Suspense>
        </div>
        
        {/* 우측 위젯 */}
        <div className="space-y-6">
          {/* 주요 통계 */}
          <Suspense fallback={<div className="h-40 bg-gray-100 rounded-lg animate-pulse" />}>
            <StatCards />
          </Suspense>
          
          {/* 시스템 상태 */}
          <SystemStatus />
          
          {/* 빠른 이동 */}
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
```

---

## 📊 2. 통계 카드 그룹 (Server Component)

### 파일: `components/admin/dashboard/StatCards.js`

```jsx
import { getStats } from '@/actions/admin/stats'
import StatCard from '@/components/admin/shared/StatCard'
import { UsersIcon, BookOpenIcon, UserPlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

/**
 * 통계 카드 그룹 (Server Component)
 * @returns {Promise<JSX.Element>}
 */
export default async function StatCards() {
  // Server Action으로 데이터 페칭 (60초 캐시)
  const stats = await getStats()
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        icon={<UsersIcon className="w-6 h-6" />}
        label="전체 사용자"
        value={stats.totalUsers}
        change={stats.usersChange}
        changeLabel="이번 주"
        color="blue"
        href="/admin/users"
      />
      
      <StatCard
        icon={<BookOpenIcon className="w-6 h-6" />}
        label="활성 스터디"
        value={stats.activeStudies}
        change={stats.studiesChange}
        changeLabel="이번 주"
        color="green"
        href="/admin/studies"
      />
      
      <StatCard
        icon={<UserPlusIcon className="w-6 h-6" />}
        label="신규 가입"
        value={stats.newToday}
        change={stats.newChange}
        changeLabel="어제 대비"
        color="purple"
        href="/admin/users?filter=newToday"
      />
      
      <StatCard
        icon={<ExclamationTriangleIcon className="w-6 h-6" />}
        label="미처리 신고"
        value={stats.pendingReports}
        urgent={stats.urgentReports}
        color="orange"
        href="/admin/reports?status=pending"
      />
    </div>
  )
}
```

### Server Action: `actions/admin/stats.js`

```js
'use server'

import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

/**
 * 관리자 통계 조회 (60초 캐시)
 * @returns {Promise<{
 *   totalUsers: number,
 *   usersChange: number,
 *   activeStudies: number,
 *   studiesChange: number,
 *   newToday: number,
 *   newChange: number,
 *   pendingReports: number,
 *   urgentReports: number
 * }>}
 */
export const getStats = unstable_cache(
  async () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const fourteenDaysAgo = new Date(today)
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    
    // 병렬 쿼리로 성능 최적화
    const [
      totalUsers,
      usersLastWeek,
      usersTwoWeeksAgo,
      activeStudies,
      activeStudiesLastWeek,
      newToday,
      newYesterday,
      pendingReports,
      urgentReports
    ] = await Promise.all([
      // 전체 사용자
      prisma.user.count(),
      // 지난주 사용자
      prisma.user.count({ where: { createdAt: { lt: sevenDaysAgo } } }),
      // 2주 전 사용자
      prisma.user.count({ where: { createdAt: { lt: fourteenDaysAgo } } }),
      // 활성 스터디 (최근 7일 내 활동)
      prisma.study.count({
        where: {
          OR: [
            { lastActivityAt: { gte: sevenDaysAgo } },
            { updatedAt: { gte: sevenDaysAgo } }
          ]
        }
      }),
      // 지난주 활성 스터디
      prisma.study.count({
        where: {
          OR: [
            { lastActivityAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
            { updatedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } }
          ]
        }
      }),
      // 오늘 신규 가입
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      // 어제 신규 가입
      prisma.user.count({
        where: { createdAt: { gte: yesterday, lt: today } }
      }),
      // 미처리 신고
      prisma.report.count({ where: { status: 'PENDING' } }),
      // 긴급 신고
      prisma.report.count({
        where: { status: 'PENDING', priority: 'URGENT' }
      })
    ])
    
    // 변화량 계산
    const usersChange = usersLastWeek - usersTwoWeeksAgo
    const studiesChange = activeStudies - activeStudiesLastWeek
    const newChange = newToday - newYesterday
    
    return {
      totalUsers,
      usersChange,
      activeStudies,
      studiesChange,
      newToday,
      newChange,
      pendingReports,
      urgentReports
    }
  },
  ['admin-stats'],
  {
    revalidate: 60, // 60초 캐시
    tags: ['admin-stats']
  }
)

/**
 * 사용자 증가 추이 데이터
 * @param {'week'|'month'|'year'} period
 * @returns {Promise<{dates: string[], counts: number[]}>}
 */
export const getUserGrowth = unstable_cache(
  async (period = 'week') => {
    const now = new Date()
    let startDate, groupByFormat
    
    switch (period) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 7)
        groupByFormat = 'day'
        break
      case 'month':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 30)
        groupByFormat = 'day'
        break
      case 'year':
        startDate = new Date(now)
        startDate.setFullYear(startDate.getFullYear() - 1)
        groupByFormat = 'month'
        break
      default:
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 7)
        groupByFormat = 'day'
    }
    
    // Prisma groupBy 사용
    const users = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: true,
      orderBy: { createdAt: 'asc' }
    })
    
    // 데이터 포맷팅
    const dates = []
    const counts = []
    
    if (groupByFormat === 'day') {
      for (let i = 0; i < (period === 'week' ? 7 : 30); i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        dates.push(date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }))
        
        const count = users.filter(u => {
          const createdDate = new Date(u.createdAt)
          return createdDate.toDateString() === date.toDateString()
        }).reduce((sum, u) => sum + u._count, 0)
        
        counts.push(count)
      }
    } else {
      // 월별
      for (let i = 0; i < 12; i++) {
        const date = new Date(startDate)
        date.setMonth(date.getMonth() + i)
        dates.push(date.toLocaleDateString('ko-KR', { month: 'long' }))
        
        const count = users.filter(u => {
          const createdDate = new Date(u.createdAt)
          return createdDate.getMonth() === date.getMonth() &&
                 createdDate.getFullYear() === date.getFullYear()
        }).reduce((sum, u) => sum + u._count, 0)
        
        counts.push(count)
      }
    }
    
    return { dates, counts }
  },
  ['admin-user-growth'],
  { revalidate: 300, tags: ['admin-stats'] }
)
```

---

## 📈 3. 사용자 증가 추이 차트

### Server Component: `components/admin/dashboard/UserGrowthChart.js`

```jsx
import { getUserGrowth } from '@/actions/admin/stats'
import UserGrowthChartClient from './UserGrowthChartClient'

/**
 * 사용자 증가 추이 차트 래퍼 (Server Component)
 * @returns {Promise<JSX.Element>}
 */
export default async function UserGrowthChart() {
  // 기본값으로 주간 데이터 페칭
  const weekData = await getUserGrowth('week')
  const monthData = await getUserGrowth('month')
  const yearData = await getUserGrowth('year')
  
  return (
    <UserGrowthChartClient
      data={{
        week: weekData,
        month: monthData,
        year: yearData
      }}
    />
  )
}
```

### Client Component: `components/admin/dashboard/UserGrowthChartClient.js`

```jsx
'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

/**
 * @typedef {Object} ChartData
 * @property {string[]} dates
 * @property {number[]} counts
 */

/**
 * 사용자 증가 추이 차트 (Client Component)
 * @param {Object} props
 * @param {Object} props.data
 * @param {ChartData} props.data.week
 * @param {ChartData} props.data.month
 * @param {ChartData} props.data.year
 * @returns {JSX.Element}
 */
export default function UserGrowthChartClient({ data }) {
  const [period, setPeriod] = useState('week')
  
  // 현재 선택된 기간 데이터
  const currentData = data[period]
  
  // Recharts 형식으로 변환
  const chartData = currentData.dates.map((date, index) => ({
    date,
    count: currentData.counts[index]
  }))
  
  const periodLabels = {
    week: '주간',
    month: '월간',
    year: '연간'
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">📈 사용자 증가 추이</h3>
        
        {/* 기간 선택 버튼 */}
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>
      
      {/* 차트 */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
              labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

---

## ⚠️ 4. 최근 신고 내역

### Server Component: `components/admin/dashboard/RecentReports.js`

```jsx
import { getRecentReports } from '@/actions/admin/reports'
import RecentReportCard from './RecentReportCard'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

/**
 * 최근 신고 내역 (Server Component)
 * @returns {Promise<JSX.Element>}
 */
export default async function RecentReports() {
  const reports = await getRecentReports(3)
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">⚠️ 최근 신고 내역</h3>
        <Link
          href="/admin/reports"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          더보기
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
      
      {/* 신고 목록 */}
      <div className="space-y-3">
        {reports.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">
            신고가 없습니다
          </p>
        ) : (
          reports.map((report) => (
            <RecentReportCard key={report.id} report={report} />
          ))
        )}
      </div>
    </div>
  )
}
```

### Client Component: `components/admin/dashboard/RecentReportCard.js`

```jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Badge from '@/components/admin/shared/Badge'
import { formatTimeAgo } from '@/lib/admin/utils'

/**
 * @typedef {Object} Report
 * @property {string} id
 * @property {string} type
 * @property {string} targetName
 * @property {string} reporterName
 * @property {string} priority
 * @property {string} status
 * @property {Date} createdAt
 */

/**
 * 신고 카드 (Client Component)
 * @param {Object} props
 * @param {Report} props.report
 * @returns {JSX.Element}
 */
export default function RecentReportCard({ report }) {
  const router = useRouter()
  
  const typeColors = {
    SPAM: 'gray',
    ABUSE: 'red',
    HARASSMENT: 'purple',
    SCAM: 'orange',
    COPYRIGHT: 'blue',
    OTHER: 'gray'
  }
  
  const priorityColors = {
    URGENT: 'red',
    HIGH: 'orange',
    NORMAL: 'blue',
    LOW: 'gray'
  }
  
  const handleClick = () => {
    router.push(`/admin/reports/${report.id}`)
  }
  
  return (
    <div
      onClick={handleClick}
      className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
        report.priority === 'URGENT'
          ? 'border-red-300 bg-red-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* 첫 줄: 유형 + 대상 */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge color={typeColors[report.type]}>{report.type}</Badge>
          <span className="font-semibold text-gray-900">{report.targetName}</span>
        </div>
        <Badge color={priorityColors[report.priority]} size="sm">
          {report.priority}
        </Badge>
      </div>
      
      {/* 둘째 줄: 신고자 + 시간 */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>신고자: ****</span>
        <span>{formatTimeAgo(report.createdAt)}</span>
      </div>
    </div>
  )
}
```

---

## 📊 5. 실시간 현황 (Client Component)

### 파일: `components/admin/dashboard/RealtimeStatus.js`

```jsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { useAdminWebSocket } from '@/components/admin/providers/AdminWebSocketProvider'

/**
 * 실시간 현황 (Client Component)
 * @returns {JSX.Element}
 */
export default function RealtimeStatus() {
  const socket = useAdminWebSocket()
  
  // React Query로 30초마다 자동 갱신
  const { data, isLoading } = useQuery({
    queryKey: ['admin-realtime-status'],
    queryFn: () => fetch('/api/admin/stats/realtime').then(r => r.json()),
    refetchInterval: 30000,
    staleTime: 30000
  })
  
  // WebSocket으로 실시간 업데이트
  useEffect(() => {
    if (socket) {
      socket.on('admin:stats:update', (newData) => {
        queryClient.setQueryData(['admin-realtime-status'], newData)
      })
    }
  }, [socket])
  
  if (isLoading || !data) {
    return <RealtimeStatusSkeleton />
  }
  
  const statItems = [
    { label: '활성 사용자', value: data.activeUsers, icon: '🟢' },
    { label: '오늘 신규 가입', value: data.newToday, icon: '👤' },
    { label: '진행 중 스터디', value: data.activeStudies, icon: '📚' },
    { label: '미처리 신고', value: data.pendingReports, icon: '⚠️' }
  ]
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 실시간 현황</h3>
      
      {/* 2x2 그리드 */}
      <div className="grid grid-cols-2 gap-4">
        {statItems.map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {item.value.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

**계속해서 SystemStatus, QuickActions 등 나머지 컴포넌트를 작성할까요?**

