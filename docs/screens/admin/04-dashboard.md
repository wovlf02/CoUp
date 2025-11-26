# 관리자 대시보드 화면 설계

> **화면**: 관리자 대시보드  
> **경로**: `/admin`  
> **권한**: ADMIN, SYSTEM_ADMIN

---

## 🎯 화면 목적

플랫폼의 전체 현황을 한눈에 파악하고, 긴급 조치가 필요한 항목을 즉시 확인할 수 있는 메인 화면

---

## 📐 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│  Page Header                                             │
│  [관리자 대시보드] ⟳ 30초 전 업데이트                      │
└─────────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│ 👥 사용자 │ 📚 스터디 │ ⚠️ 신고   │ 💬 활동   │
│ 1,234    │  542     │  23      │ 12,345   │
│ +12 오늘 │  +5 오늘 │ (미처리) │ (메시지) │
└──────────┴──────────┴──────────┴──────────┘

┌───────────────────────────┬───────────────────────────┐
│  사용자 활동 추이           │  신고 처리 현황            │
│  (라인 차트)               │  (도넛 차트)               │
│                           │                           │
│  ─── 신규 가입             │   [도넛 차트 렌더링]       │
│  ─── 활성 사용자           │                           │
│                           │   ■ 대기 ■ 처리중          │
│  [차트 렌더링]             │   ■ 완료 ■ 기각            │
└───────────────────────────┴───────────────────────────┘

┌──────────────┬──────────────┬──────────────┐
│ 최근 가입     │ 최근 스터디   │ 최근 신고     │
│              │              │              │
│ [목록 5개]   │ [목록 5개]   │ [목록 10개]  │
│              │              │              │
│ [더보기 →]   │ [더보기 →]   │ [더보기 →]   │
└──────────────┴──────────────┴──────────────┘

┌───────────────────────────┬───────────────────────────┐
│  빠른 작업                 │  시스템 상태               │
│                           │                           │
│  [➕ 공지 발송]            │  ✅ 웹 서버: 정상          │
│  [👥 사용자 검색]          │  ✅ DB: 정상               │
│  [📚 스터디 검색]          │  ⚠️ 스토리지: 85%         │
│  [📊 리포트 생성]          │                           │
└───────────────────────────┴───────────────────────────┘
```

---

## 🎨 컴포넌트 구조

### 1. Page Header (페이지 헤더)

```jsx
<div className={styles.pageHeader}>
  <div>
    <h1 className={styles.pageTitle}>관리자 대시보드</h1>
    <p className={styles.lastUpdate}>
      ⟳ {timeSince(lastUpdate)} 업데이트
    </p>
  </div>
  <button onClick={handleRefresh} className={styles.refreshButton}>
    🔄 새로고침
  </button>
</div>
```

**스타일**:
```css
.pageHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.pageTitle {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.lastUpdate {
  color: #6B7280;
  font-size: 0.875rem;
}

.refreshButton {
  background: var(--admin-primary-500);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.refreshButton:hover {
  background: var(--admin-primary-600);
  box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.3);
}
```

---

### 2. Stat Cards (지표 카드)

```jsx
<div className={styles.statsGrid}>
  <StatCard
    icon="👥"
    label="사용자"
    value={stats.users.total}
    change={`+${stats.users.todayNew} 오늘`}
    subStats={[
      { label: '활성', value: stats.users.active },
      { label: '정지', value: stats.users.suspended, color: 'danger' }
    ]}
    onClick={() => router.push('/admin/users')}
  />
  {/* 나머지 카드들... */}
</div>
```

**StatCard 컴포넌트**:
```jsx
function StatCard({ icon, label, value, change, subStats, onClick }) {
  return (
    <div className={styles.statCard} onClick={onClick}>
      <div className={styles.statHeader}>
        <span className={styles.statIcon}>{icon}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
      
      <div className={styles.statValue}>{value.toLocaleString()}</div>
      
      {change && (
        <div className={styles.statChange}>{change}</div>
      )}
      
      {subStats && (
        <div className={styles.subStats}>
          {subStats.map((stat, idx) => (
            <span key={idx} className={styles[stat.color]}>
              {stat.label}: {stat.value}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
```

**스타일**:
```css
.statsGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.statCard {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.statCard:hover {
  border-color: var(--admin-primary-500);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.statIcon {
  font-size: 2rem;
}

.statLabel {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: 12px;
}

.statValue {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin: 12px 0;
}

.statChange {
  color: #10B981;
  font-size: 0.875rem;
  font-weight: 600;
}

.subStats {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #F3F4F6;
  font-size: 0.875rem;
}

.subStats .danger {
  color: #EF4444;
}

@media (max-width: 1400px) {
  .statsGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .statsGrid {
    grid-template-columns: 1fr;
  }
}
```

---

### 3. Charts (차트 영역)

```jsx
<div className={styles.chartsGrid}>
  {/* 사용자 추이 차트 */}
  <div className={styles.chartCard}>
    <h3 className={styles.chartTitle}>사용자 활동 추이 (최근 30일)</h3>
    <LineChart
      data={chartData.userTrend}
      lines={[
        { key: 'newUsers', label: '신규 가입', color: '#7C3AED' },
        { key: 'activeUsers', label: '활성 사용자', color: '#10B981' }
      ]}
    />
  </div>

  {/* 신고 현황 차트 */}
  <div className={styles.chartCard}>
    <h3 className={styles.chartTitle}>신고 처리 현황</h3>
    <DonutChart
      data={[
        { label: '대기', value: chartData.reportStatus.pending, color: '#F59E0B' },
        { label: '처리중', value: chartData.reportStatus.inProgress, color: '#3B82F6' },
        { label: '완료', value: chartData.reportStatus.resolved, color: '#10B981' },
        { label: '기각', value: chartData.reportStatus.rejected, color: '#9CA3AF' }
      ]}
    />
  </div>
</div>
```

**스타일**:
```css
.chartsGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.chartCard {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  min-height: 350px;
}

.chartTitle {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 20px;
}

@media (max-width: 1200px) {
  .chartsGrid {
    grid-template-columns: 1fr;
  }
}
```

---

### 4. Recent Activities (실시간 활동)

```jsx
<div className={styles.activitiesGrid}>
  {/* 최근 가입 */}
  <ActivityCard
    title="최근 가입 사용자"
    items={recentUsers}
    renderItem={(user) => (
      <div className={styles.activityItem} onClick={() => router.push(`/admin/users/${user.id}`)}>
        <img src={user.avatar || '/default-avatar.png'} className={styles.avatar} />
        <div>
          <div className={styles.itemName}>{user.name}</div>
          <div className={styles.itemMeta}>
            {user.email} · {timeSince(user.createdAt)}
          </div>
        </div>
      </div>
    )}
    onSeeMore={() => router.push('/admin/users?sort=latest')}
  />

  {/* 최근 스터디 */}
  <ActivityCard
    title="최근 생성 스터디"
    items={recentStudies}
    renderItem={(study) => (
      <div className={styles.activityItem} onClick={() => router.push(`/admin/studies/${study.id}`)}>
        <span className={styles.emoji}>{study.emoji}</span>
        <div>
          <div className={styles.itemName}>{study.name}</div>
          <div className={styles.itemMeta}>
            by {study.owner.name} · {timeSince(study.createdAt)}
          </div>
        </div>
      </div>
    )}
    onSeeMore={() => router.push('/admin/studies?sort=latest')}
  />

  {/* 최근 신고 */}
  <ActivityCard
    title="최근 접수 신고"
    items={recentReports}
    renderItem={(report) => (
      <div 
        className={`${styles.activityItem} ${styles[report.priority.toLowerCase()]}`}
        onClick={() => router.push(`/admin/reports/${report.id}`)}
      >
        <span className={styles.priorityIcon}>
          {report.priority === 'URGENT' ? '🔴' : report.priority === 'HIGH' ? '⚠️' : '📋'}
        </span>
        <div>
          <div className={styles.itemName}>
            {report.type} 신고: {report.reason}
          </div>
          <div className={styles.itemMeta}>
            신고자: {report.reporter.name} · {timeSince(report.createdAt)}
          </div>
        </div>
      </div>
    )}
    onSeeMore={() => router.push('/admin/reports?status=pending')}
  />
</div>
```

**스타일**:
```css
.activitiesGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.activityCard {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
}

.activityHeader {
  padding: 20px;
  border-bottom: 1px solid #F3F4F6;
  font-weight: 600;
  color: #111827;
}

.activityList {
  max-height: 400px;
  overflow-y: auto;
}

.activityItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #F9FAFB;
}

.activityItem:hover {
  background: #F9FAFB;
}

.activityItem.urgent {
  background: #FEF2F2;
  border-left: 3px solid #DC2626;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.emoji {
  font-size: 2rem;
}

.itemName {
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.itemMeta {
  font-size: 0.875rem;
  color: #6B7280;
}

.seeMore {
  padding: 16px 20px;
  text-align: center;
  color: var(--admin-primary-600);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.seeMore:hover {
  background: #F9FAFB;
}

@media (max-width: 1200px) {
  .activitiesGrid {
    grid-template-columns: 1fr;
  }
}
```

---

### 5. Quick Actions & System Status (하단)

```jsx
<div className={styles.bottomGrid}>
  {/* 빠른 작업 */}
  <div className={styles.quickActions}>
    <h3 className={styles.sectionTitle}>빠른 작업</h3>
    <div className={styles.actionButtons}>
      <button className={styles.actionButton} onClick={() => setShowNotificationModal(true)}>
        ➕ 시스템 공지 발송
      </button>
      <button className={styles.actionButton} onClick={() => router.push('/admin/users')}>
        👥 사용자 검색
      </button>
      <button className={styles.actionButton} onClick={() => router.push('/admin/studies')}>
        📚 스터디 검색
      </button>
      <button className={styles.actionButton} onClick={() => setShowReportModal(true)}>
        📊 리포트 생성
      </button>
    </div>
  </div>

  {/* 시스템 상태 */}
  <div className={styles.systemStatus}>
    <h3 className={styles.sectionTitle}>시스템 상태</h3>
    <div className={styles.statusList}>
      <div className={styles.statusItem}>
        <span className={styles.statusIcon}>✅</span>
        <span>웹 서버: 정상</span>
      </div>
      <div className={styles.statusItem}>
        <span className={styles.statusIcon}>✅</span>
        <span>데이터베이스: 정상</span>
      </div>
      <div className={styles.statusItem}>
        <span className={styles.statusIcon}>⚠️</span>
        <span>스토리지: 85% 사용 중</span>
      </div>
      <div className={styles.statusMeta}>
        최종 점검: {timeSince(lastCheck)}
      </div>
    </div>
  </div>
</div>
```

**스타일**:
```css
.bottomGrid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.quickActions, .systemStatus {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
}

.sectionTitle {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.actionButtons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.actionButton {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  font-weight: 500;
  transition: all 0.2s;
}

.actionButton:hover {
  background: var(--admin-primary-50);
  border-color: var(--admin-primary-500);
  color: var(--admin-primary-600);
}

.statusList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.statusItem {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9375rem;
}

.statusMeta {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #F3F4F6;
  color: #6B7280;
  font-size: 0.875rem;
}

@media (max-width: 1200px) {
  .bottomGrid {
    grid-template-columns: 1fr;
  }
  
  .actionButtons {
    grid-template-columns: 1fr;
  }
}
```

---

## 🔄 데이터 페칭

### useDashboardData Hook

```jsx
function useDashboardData() {
  const { data: stats, error: statsError, mutate: refreshStats } = useSWR(
    '/api/admin/dashboard/stats',
    fetcher,
    { refreshInterval: 30000 } // 30초마다 자동 갱신
  )

  const { data: recentUsers } = useSWR('/api/admin/dashboard/recent-users', fetcher, {
    refreshInterval: 10000
  })

  const { data: recentStudies } = useSWR('/api/admin/dashboard/recent-studies', fetcher, {
    refreshInterval: 10000
  })

  const { data: recentReports } = useSWR('/api/admin/dashboard/recent-reports', fetcher, {
    refreshInterval: 10000
  })

  const { data: chartData } = useSWR('/api/admin/dashboard/chart-data', fetcher, {
    refreshInterval: 300000 // 5분
  })

  return {
    stats,
    recentUsers,
    recentStudies,
    recentReports,
    chartData,
    isLoading: !stats || !recentUsers || !recentStudies || !recentReports || !chartData,
    isError: statsError,
    refresh: () => {
      refreshStats()
    }
  }
}
```

---

**다음 문서**: `05-users-list.md` - 사용자 목록 화면 설계

