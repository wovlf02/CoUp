# Next.js 15 관리자 페이지 구현 예제 (JavaScript)

> **작성일**: 2025-11-27  
> **목적**: JavaScript 기반 실전 코드 예제

---

## 📁 프로젝트 구조

```
coup/
├── app/
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.js
│   │       ├── page.js
│   │       ├── dashboard/
│   │       │   ├── page.js
│   │       │   └── loading.js
│   │       ├── users/
│   │       │   ├── page.js
│   │       │   ├── @modal/
│   │       │   └── [userId]/
│   │       └── reports/
│   ├── api/
│   │   └── admin/
│   └── providers.js
├── components/
│   ├── admin/
│   └── ui/
├── lib/
│   ├── admin/
│   │   └── actions.js     # Server Actions
│   ├── auth.js
│   └── prisma.js
└── jsconfig.json          # Path aliases
```

---

## 🔧 jsconfig.json 설정

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 1️⃣ Admin 레이아웃

```javascript
// app/(admin)/admin/layout.js
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function AdminLayout({ children, modal }) {
  const session = await getServerSession(authOptions)
  
  if (!session || !['ADMIN', 'SYSTEM_ADMIN'].includes(session.user.role)) {
    redirect('/admin/unauthorized')
  }
  
  return (
    <div className="admin-layout">
      {children}
      {modal}
      <div id="modal-root" />
    </div>
  )
}
```

---

## 2️⃣ 대시보드

```javascript
// app/(admin)/admin/dashboard/page.js
import { Suspense } from 'react'
import { MetricsCards } from '@/components/admin/Dashboard/MetricsCards'

export default function DashboardPage() {
  return (
    <div>
      <h1>관리자 대시보드</h1>
      <Suspense fallback={<div>로딩...</div>}>
        <MetricsCards />
      </Suspense>
    </div>
  )
}
```

```javascript
// components/admin/Dashboard/MetricsCards.jsx
import { prisma } from '@/lib/prisma'

export async function MetricsCards() {
  const totalUsers = await prisma.user.count()
  const activeUsers = await prisma.user.count({ 
    where: { status: 'ACTIVE' } 
  })
  
  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <h3>전체 사용자</h3>
        <p>{totalUsers}</p>
      </div>
      <div className="metric-card">
        <h3>활성 사용자</h3>
        <p>{activeUsers}</p>
      </div>
    </div>
  )
}
```

---

## 3️⃣ 사용자 목록

```javascript
// app/(admin)/admin/users/page.js
import { Suspense } from 'react'
import { UserTable } from '@/components/admin/Users/UserTable'

export default function UsersPage({ searchParams }) {
  const page = Number(searchParams.page) || 1
  
  return (
    <div>
      <h1>사용자 관리</h1>
      <Suspense fallback={<div>로딩...</div>}>
        <UserTable page={page} />
      </Suspense>
    </div>
  )
}
```

```javascript
// components/admin/Users/UserTable.jsx
import { prisma } from '@/lib/prisma'
import { UserRow } from './UserRow'

export async function UserTable({ page }) {
  const limit = 20
  const users = await prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
  
  return (
    <table>
      <thead>
        <tr>
          <th>이름</th>
          <th>이메일</th>
          <th>상태</th>
          <th>액션</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <UserRow key={user.id} user={user} />
        ))}
      </tbody>
    </table>
  )
}
```

```javascript
// components/admin/Users/UserRow.jsx
'use client'

import { useState, useTransition } from 'react'
import { suspendUser } from '@/lib/admin/actions'

export function UserRow({ user }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(user.status)
  
  const handleSuspend = () => {
    setStatus('SUSPENDED')
    
    startTransition(async () => {
      const result = await suspendUser(user.id, {
        duration: '3',
        reason: '관리자 조치'
      })
      
      if (result.error) {
        setStatus(user.status)
        alert(result.error)
      }
    })
  }
  
  return (
    <tr className={isPending ? 'opacity-50' : ''}>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>{status}</td>
      <td>
        <button onClick={handleSuspend} disabled={isPending}>
          정지
        </button>
      </td>
    </tr>
  )
}
```

---

## 4️⃣ Server Actions

```javascript
// lib/admin/actions.js
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

export async function suspendUser(userId, data) {
  const admin = await requireAdmin()
  if (!admin) {
    return { error: '권한이 없습니다' }
  }
  
  if (data.reason.length < 10) {
    return { error: '사유는 최소 10자 이상입니다' }
  }
  
  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          status: 'SUSPENDED',
          suspendReason: data.reason,
        }
      }),
      
      prisma.sanction.create({
        data: {
          userId,
          type: 'SUSPEND',
          reason: data.reason,
          duration: data.duration,
          adminId: admin.id,
        }
      })
    ])
    
    revalidatePath('/admin/users')
    return { success: true }
    
  } catch (error) {
    console.error(error)
    return { error: '처리 중 오류가 발생했습니다' }
  }
}
```

---

## 5️⃣ TanStack Query

```javascript
// app/providers.js
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient())
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

```javascript
// lib/hooks/useUsers.js
import { useQuery } from '@tanstack/react-query'

export function useUsers(page = 1) {
  return useQuery({
    queryKey: ['users', page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?page=${page}`)
      return res.json()
    },
  })
}
```

---

## 6️⃣ 유틸리티

```javascript
// lib/utils.js

export function maskEmail(email) {
  const [local, domain] = email.split('@')
  return `${local[0]}***@${domain}`
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('ko-KR')
}
```

---

**JavaScript 완성!** 🎉

