# 대시보드 - 통계 카드 컴포넌트

> **컴포넌트**: StatCard  
> **타입**: Server Component (데이터) + Client Component (애니메이션)

---

## 1. 컴포넌트 구조

```tsx
// components/admin/dashboard/StatCard.tsx
interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;           // 변화율 (%)
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'danger' | 'warning';
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  color = 'primary',
  loading = false
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div className={`stat-icon ${color}`}>{icon}</div>
      </div>
      
      <div className="stat-value">
        {loading ? <Skeleton /> : formatNumber(value)}
      </div>
      
      {change !== undefined && (
        <div className={`stat-change ${trend}`}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {Math.abs(change)}% 전주 대비
        </div>
      )}
    </div>
  );
}
```

---

## 2. 스타일

```css
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-title {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.primary { background: #EEF2FF; color: #6366F1; }
.stat-icon.success { background: #D1FAE5; color: #10B981; }
.stat-icon.danger { background: #FEE2E2; color: #EF4444; }
.stat-icon.warning { background: #FEF3C7; color: #F59E0B; }

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.stat-change {
  font-size: 13px;
  font-weight: 500;
}

.stat-change.up { color: #10B981; }
.stat-change.down { color: #EF4444; }
.stat-change.neutral { color: #6B7280; }
```

---

## 3. 사용 예시

```tsx
// 4개 통계 카드
<div className="grid grid-cols-4 gap-6">
  <StatCard
    title="총 사용자"
    value={1250}
    change={8.2}
    trend="up"
    icon={<UsersIcon />}
    color="primary"
  />
  
  <StatCard
    title="활성 스터디"
    value={85}
    change={-2.4}
    trend="down"
    icon={<StudyIcon />}
    color="success"
  />
  
  <StatCard
    title="미처리 신고"
    value={12}
    change={15.6}
    trend="up"
    icon={<AlertIcon />}
    color="danger"
  />
  
  <StatCard
    title="오늘 DAU"
    value={456}
    change={3.1}
    trend="up"
    icon={<ActivityIcon />}
    color="warning"
  />
</div>
```

---

## 4. 애니메이션 (선택)

```tsx
'use client';
import { motion } from 'framer-motion';

export function AnimatedStatCard(props: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <StatCard {...props} />
    </motion.div>
  );
}
```

---

**작성 완료**: 2025-11-27

