# 프로필 수정 예외 처리

**작성일**: 2025-11-29  
**카테고리**: Profile Management  
**난이도**: ⭐⭐⭐ (중급)

---

## 📋 목차

1. [개요](#개요)
2. [프로필 조회 예외](#프로필-조회-예외)
3. [프로필 수정 예외](#프로필-수정-예외)
4. [유효성 검사 예외](#유효성-검사-예외)
5. [권한 관리 예외](#권한-관리-예외)
6. [캐시 동기화 예외](#캐시-동기화-예외)
7. [모범 사례](#모범-사례)

---

## 개요

프로필 수정은 사용자가 자신의 정보를 업데이트하는 핵심 기능입니다. 이 문서에서는 프로필 조회, 수정, 검증, 권한 관리와 관련된 모든 예외 상황을 다룹니다.

### 주요 시나리오

1. **프로필 조회**: 사용자 정보 및 통계 불러오기
2. **프로필 수정**: 이름, 자기소개, 아바타 변경
3. **데이터 검증**: 입력값 유효성 검사
4. **권한 확인**: 본인 확인 및 권한 검증
5. **캐시 관리**: 실시간 데이터 동기화

---

## 프로필 조회 예외

### 1.1 사용자 없음

#### 증상
- "사용자 정보를 불러올 수 없습니다" 에러
- 404 Not Found 응답
- 빈 프로필 페이지

#### 원인
1. 유효하지 않은 사용자 ID
2. 삭제된 계정
3. 세션 만료
4. DB 데이터 불일치

#### 해결 방법

**클라이언트 (src/app/me/page.jsx)**:
```javascript
'use client'

import { useMe } from '@/lib/hooks/useApi'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function MyPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { data: userData, isLoading, error } = useMe()

  // 세션 확인
  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  // 로딩 상태
  if (status === 'loading' || isLoading) {
    return <ProfileSkeleton />
  }

  // 에러 처리
  if (error) {
    if (error.status === 404) {
      return (
        <div className="error-container">
          <h2>사용자를 찾을 수 없습니다</h2>
          <p>계정이 삭제되었거나 존재하지 않습니다.</p>
          <button onClick={() => router.push('/dashboard')}>
            대시보드로 이동
          </button>
        </div>
      )
    }

    if (error.status === 401) {
      router.push('/auth/signin')
      return null
    }

    return (
      <div className="error-container">
        <h2>프로필을 불러올 수 없습니다</h2>
        <p>{error.message || '잠시 후 다시 시도해주세요.'}</p>
        <button onClick={() => window.location.reload()}>
          다시 시도
        </button>
      </div>
    )
  }

  // 데이터 없음
  if (!userData?.user) {
    return (
      <div className="error-container">
        <h2>사용자 정보가 없습니다</h2>
        <p>로그아웃 후 다시 로그인해주세요.</p>
        <button onClick={() => signOut({ callbackUrl: '/auth/signin' })}>
          로그아웃
        </button>
      </div>
    )
  }

  const user = userData.user

  return (
    <div className="profile-container">
      <ProfileSection user={user} />
      <ProfileEditForm user={user} />
    </div>
  )
}
```

**서버 (src/app/api/users/me/route.js)**:
```javascript
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  // 인증 확인
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            studyMembers: { where: { status: 'ACTIVE' } },
            tasks: true,
            notifications: { where: { isRead: false } }
          }
        }
      }
    })

    // 사용자 없음
    if (!user) {
      console.error('User not found:', session.user.id)
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 삭제된 계정
    if (user.status === 'DELETED') {
      console.warn('Deleted user accessed:', user.id)
      return NextResponse.json(
        { error: "삭제된 계정입니다" },
        { status: 404 }
      )
    }

    // 정상 응답
    return NextResponse.json({
      success: true,
      user: {
        ...user,
        stats: {
          studyCount: user._count.studyMembers,
          taskCount: user._count.tasks,
          unreadNotifications: user._count.notifications
        }
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    
    // Prisma 에러 처리
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "사용자 정보를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

#### 디버깅

```javascript
// 1. 세션 확인
console.log('Session:', session)
console.log('User ID:', session?.user?.id)

// 2. API 응답 확인
console.log('API Response:', {
  status: response.status,
  data: response.data
})

// 3. DB 쿼리 확인
const user = await prisma.user.findUnique({
  where: { id: userId }
})
console.log('DB User:', user)
```

---

### 1.2 세션 만료

#### 증상
- 자동으로 로그인 페이지로 리다이렉트
- 401 Unauthorized 응답
- "인증이 필요합니다" 에러

#### 원인
1. JWT 토큰 만료
2. 쿠키 삭제
3. 서버 재시작
4. 세션 스토어 오류

#### 해결 방법

**세션 갱신 (src/components/SessionRefresh.jsx)**:
```javascript
'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function SessionRefresh() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      // 5분마다 세션 갱신
      const interval = setInterval(() => {
        fetch('/api/auth/session?update')
          .then(res => res.json())
          .then(data => {
            console.log('Session refreshed:', data)
          })
          .catch(err => {
            console.error('Session refresh failed:', err)
          })
      }, 5 * 60 * 1000)

      return () => clearInterval(interval)
    }
  }, [status])

  return null
}
```

**API 인터셉터 (src/lib/api.js)**:
```javascript
import axios from 'axios'
import { signOut } from 'next-auth/react'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 10000
})

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Session expired, logging out...')
      
      // 재로그인 필요
      await signOut({
        callbackUrl: '/auth/signin?error=SessionExpired'
      })
    }
    
    return Promise.reject(error)
  }
)

export default api
```

---

### 1.3 통계 조회 실패

#### 증상
- 통계 위젯이 표시되지 않음
- "통계를 불러올 수 없습니다" 에러
- 일부 통계만 표시됨

#### 원인
1. 통계 API 실패
2. 집계 쿼리 오류
3. 데이터 타입 불일치
4. 권한 문제

#### 해결 방법

**클라이언트 (src/components/my-page/ActivityStats.jsx)**:
```javascript
'use client'

import { useUserStats } from '@/lib/hooks/useApi'

export default function ActivityStats() {
  const { data, isLoading, error } = useUserStats()

  if (isLoading) {
    return <StatsSkeleton />
  }

  if (error) {
    console.error('Stats error:', error)
    return (
      <div className="stats-error">
        <p>통계를 불러올 수 없습니다</p>
        <button onClick={() => window.location.reload()}>
          다시 시도
        </button>
      </div>
    )
  }

  if (!data?.stats) {
    return (
      <div className="stats-empty">
        <p>아직 통계가 없습니다</p>
        <p>스터디에 참여하고 활동을 시작하세요!</p>
      </div>
    )
  }

  const stats = data.stats

  return (
    <div className="stats-container">
      <StatCard
        label="참여 스터디"
        value={stats.activeStudies || 0}
        icon="📚"
      />
      <StatCard
        label="완료한 할일"
        value={stats.completedTasks || 0}
        icon="✅"
      />
      <StatCard
        label="출석률"
        value={`${(stats.attendanceRate || 0).toFixed(1)}%`}
        icon="📅"
      />
      <StatCard
        label="완료율"
        value={`${(stats.completionRate || 0).toFixed(1)}%`}
        icon="🎯"
      />
    </div>
  )
}
```

**서버 (src/app/api/users/me/stats/route.js)**:
```javascript
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const userId = session.user.id

    // 병렬로 통계 조회
    const [
      activeStudies,
      totalStudies,
      completedTasks,
      totalTasks,
      attendanceData
    ] = await Promise.all([
      // 활성 스터디 수
      prisma.studyMember.count({
        where: {
          userId,
          status: 'ACTIVE'
        }
      }),

      // 전체 스터디 수
      prisma.studyMember.count({
        where: { userId }
      }),

      // 완료한 할일
      prisma.task.count({
        where: {
          assigneeId: userId,
          status: 'COMPLETED'
        }
      }),

      // 전체 할일
      prisma.task.count({
        where: { assigneeId: userId }
      }),

      // 출석 데이터
      prisma.attendance.aggregate({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 최근 30일
          }
        },
        _count: true
      })
    ])

    // 출석률 계산 (최근 30일)
    const attendanceCount = attendanceData._count || 0
    const expectedAttendance = activeStudies * 30 // 스터디별 30일
    const attendanceRate = expectedAttendance > 0
      ? (attendanceCount / expectedAttendance) * 100
      : 0

    // 완료율 계산
    const completionRate = totalTasks > 0
      ? (completedTasks / totalTasks) * 100
      : 0

    return NextResponse.json({
      success: true,
      stats: {
        totalStudies,
        activeStudies,
        completedTasks,
        totalTasks,
        attendanceRate: Math.min(attendanceRate, 100), // 최대 100%
        completionRate: Math.min(completionRate, 100)
      }
    })

  } catch (error) {
    console.error('Get stats error:', error)
    
    return NextResponse.json(
      { 
        error: "통계를 가져오는 중 오류가 발생했습니다",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
```

---

## 프로필 수정 예외

### 2.1 수정 실패

#### 증상
- "프로필 수정에 실패했습니다" 에러
- 수정 후 변경사항이 반영되지 않음
- 500 Internal Server Error

#### 원인
1. 네트워크 오류
2. DB 트랜잭션 실패
3. 유효성 검사 실패
4. 권한 문제

#### 해결 방법

**클라이언트 (src/components/my-page/ProfileEditForm.jsx)**:
```javascript
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useUpdateProfile } from '@/lib/hooks/useApi'
import toast from 'react-hot-toast'

export default function ProfileEditForm({ user }) {
  const { update: updateSession } = useSession()
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || ''
  })
  const [errors, setErrors] = useState({})
  const updateProfile = useUpdateProfile()

  // 클라이언트 검증
  const validate = () => {
    const newErrors = {}

    if (!formData.name) {
      newErrors.name = '이름은 필수입니다'
    } else if (formData.name.length < 2) {
      newErrors.name = '이름은 2자 이상이어야 합니다'
    } else if (formData.name.length > 50) {
      newErrors.name = '이름은 50자 이하여야 합니다'
    }

    if (formData.bio && formData.bio.length > 200) {
      newErrors.bio = '자기소개는 200자 이하여야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 검증
    if (!validate()) {
      toast.error('입력값을 확인해주세요')
      return
    }

    try {
      // 프로필 업데이트
      const result = await updateProfile.mutateAsync(formData)

      // NextAuth 세션 갱신
      await updateSession({
        name: formData.name
      })

      toast.success('프로필이 수정되었습니다! 🎉')

    } catch (error) {
      console.error('Profile update error:', error)

      // 에러 메시지 표시
      if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else if (error.response?.status === 400) {
        toast.error('입력값이 올바르지 않습니다')
      } else if (error.response?.status === 401) {
        toast.error('로그인이 필요합니다')
        router.push('/auth/signin')
      } else if (error.response?.status === 500) {
        toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      } else {
        toast.error('프로필 수정에 실패했습니다')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="profile-edit-form">
      {/* 이름 */}
      <div className="form-group">
        <label htmlFor="name">
          이름 <span className="required">*</span>
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? 'input-error' : ''}
          maxLength={50}
        />
        {errors.name && <p className="error-message">{errors.name}</p>}
      </div>

      {/* 자기소개 */}
      <div className="form-group">
        <label htmlFor="bio">자기소개 (선택)</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className={errors.bio ? 'input-error' : ''}
          maxLength={200}
          rows={4}
          placeholder="자신을 소개해주세요..."
        />
        <div className="char-count">
          {formData.bio.length}/200자
        </div>
        {errors.bio && <p className="error-message">{errors.bio}</p>}
      </div>

      {/* 버튼 */}
      <div className="button-group">
        <button
          type="button"
          onClick={() => {
            setFormData({ name: user.name, bio: user.bio || '' })
            setErrors({})
          }}
          className="button-secondary"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={updateProfile.isLoading}
          className="button-primary"
        >
          {updateProfile.isLoading ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  )
}
```

**서버 (src/app/api/users/me/route.js - PATCH)**:
```javascript
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// 유효성 검사 스키마
const updateProfileSchema = z.object({
  name: z.string()
    .min(2, "이름은 2자 이상이어야 합니다")
    .max(50, "이름은 50자 이하여야 합니다")
    .optional(),
  bio: z.string()
    .max(200, "자기소개는 200자 이하여야 합니다")
    .optional()
    .nullable(),
  avatar: z.string()
    .url("올바른 URL 형식이 아닙니다")
    .optional()
    .nullable()
})

export async function PATCH(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()

    // 유효성 검사
    const validatedData = updateProfileSchema.parse(body)

    // 프로필 업데이트
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.bio !== undefined && { bio: validatedData.bio }),
        ...(validatedData.avatar !== undefined && { avatar: validatedData.avatar }),
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "프로필이 업데이트되었습니다",
      user
    })

  } catch (error) {
    console.error('Update user error:', error)

    // Zod 검증 에러
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    // Prisma 에러
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "프로필 업데이트 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
```

---

### 2.2 중복 이메일

#### 증상
- "이메일이 이미 사용 중입니다" 에러
- 409 Conflict 응답
- 이메일 변경 실패

#### 원인
1. 다른 사용자가 사용 중인 이메일
2. 대소문자만 다른 이메일
3. 삭제된 계정의 이메일

#### 해결 방법

**서버 검증**:
```javascript
export async function PATCH(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const { email } = body

    // 이메일 변경 시도
    if (email && email !== session.user.email) {
      // 중복 확인
      const existingUser = await prisma.user.findUnique({
        where: { 
          email: email.toLowerCase() // 대소문자 구분 없이
        }
      })

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: "이미 사용 중인 이메일입니다" },
          { status: 409 }
        )
      }
    }

    // 프로필 업데이트
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(email && { email: email.toLowerCase() }),
        // ... 기타 필드
      }
    })

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Update error:', error)
    
    // Prisma unique constraint 에러
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "프로필 업데이트에 실패했습니다" },
      { status: 500 }
    )
  }
}
```

---

## 유효성 검사 예외

### 3.1 이름 검증

#### 검증 규칙
- 필수 입력
- 최소 2자, 최대 50자
- 특수문자 제한 (선택적)
- 공백만으로 구성 불가

#### 구현

```javascript
// 클라이언트 검증
const validateName = (name) => {
  if (!name || !name.trim()) {
    return '이름은 필수입니다'
  }

  if (name.length < 2) {
    return '이름은 2자 이상이어야 합니다'
  }

  if (name.length > 50) {
    return '이름은 50자 이하여야 합니다'
  }

  // 특수문자 제한 (선택적)
  const nameRegex = /^[가-힣a-zA-Z0-9\s]+$/
  if (!nameRegex.test(name)) {
    return '이름에는 한글, 영문, 숫자만 사용할 수 있습니다'
  }

  return null
}

// 사용
const error = validateName(formData.name)
if (error) {
  toast.error(error)
  return
}
```

---

### 3.2 자기소개 검증

#### 검증 규칙
- 선택 입력
- 최대 200자
- HTML 태그 제거
- XSS 방지

#### 구현

```javascript
// 클라이언트 검증
const validateBio = (bio) => {
  if (!bio) return null

  if (bio.length > 200) {
    return '자기소개는 200자 이하여야 합니다'
  }

  // HTML 태그 제거
  const cleanBio = bio.replace(/<[^>]*>/g, '')

  // 위험한 문자열 체크
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(bio)) {
      return '허용되지 않는 내용이 포함되어 있습니다'
    }
  }

  return null
}
```

---

## 권한 관리 예외

### 4.1 권한 검증

#### 시나리오
- 본인 프로필만 수정 가능
- 관리자는 모든 프로필 조회 가능
- OWNER만 특정 설정 변경 가능

#### 구현

**서버 권한 검증**:
```javascript
// src/lib/auth-helpers.js
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "인증이 필요합니다" },
      { status: 401 }
    )
  }

  return session
}

export async function requireSelfOrAdmin(userId) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  const isOwner = session.user.id === userId
  const isAdmin = session.user.role === 'ADMIN'

  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { error: "권한이 없습니다" },
      { status: 403 }
    )
  }

  return session
}
```

**사용 예시**:
```javascript
// src/app/api/users/[userId]/route.js
export async function PATCH(request, { params }) {
  const { userId } = params

  // 본인 또는 관리자만 수정 가능
  const session = await requireSelfOrAdmin(userId)
  if (session instanceof NextResponse) return session

  // 프로필 업데이트
  // ...
}
```

---

## 캐시 동기화 예외

### 5.1 React Query 캐시 무효화

#### 증상
- 프로필 수정 후 변경사항이 즉시 반영되지 않음
- 새로고침해야 업데이트됨
- 헤더의 이름이 변경되지 않음

#### 해결 방법

```javascript
// src/lib/hooks/useApi.js
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import api from '@/lib/api'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { update: updateSession } = useSession()

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.patch('/api/users/me', data)
      return response.data
    },

    // 낙관적 업데이트
    onMutate: async (newData) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['users', 'me'] })

      // 이전 데이터 저장
      const previousData = queryClient.getQueryData(['users', 'me'])

      // 낙관적 업데이트
      queryClient.setQueryData(['users', 'me'], (old) => {
        if (!old) return old
        return {
          ...old,
          user: {
            ...old.user,
            ...newData
          }
        }
      })

      return { previousData }
    },

    // 성공 시
    onSuccess: (data, variables) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] })

      // NextAuth 세션 갱신
      if (variables.name) {
        updateSession({ name: variables.name })
      }
    },

    // 에러 시 롤백
    onError: (err, newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['users', 'me'], context.previousData)
      }
    }
  })
}
```

---

## 모범 사례

### 1. 프로필 조회 최적화

```javascript
// React Query 설정
const { data: userData } = useMe({
  staleTime: 5 * 60 * 1000,  // 5분 동안 fresh
  cacheTime: 10 * 60 * 1000, // 10분 동안 캐시 유지
  refetchOnWindowFocus: false,
  refetchOnReconnect: true
})
```

### 2. 에러 바운더리

```javascript
// src/components/ErrorBoundary.jsx
class ProfileErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Profile error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>프로필을 불러오는 중 오류가 발생했습니다</h2>
          <button onClick={() => window.location.reload()}>
            다시 시도
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 3. 테스트

```javascript
// __tests__/profile-edit.test.js
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileEditForm from '@/components/my-page/ProfileEditForm'

describe('ProfileEditForm', () => {
  it('should validate name length', async () => {
    const user = { name: 'Test', bio: '' }
    render(<ProfileEditForm user={user} />)

    const nameInput = screen.getByLabelText(/이름/)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'A')

    const submitButton = screen.getByText('저장')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/이름은 2자 이상/)).toBeInTheDocument()
    })
  })
})
```

---

## 관련 문서

- **[프로필 개요](./README.md)**
- **[아바타 예외](./02-avatar-exceptions.md)**
- **[계정 삭제 예외](./03-account-deletion-exceptions.md)**
- **[모범 사례](./99-best-practices.md)**

---

**다음 문서**: [아바타 예외 (02-avatar-exceptions.md)](./02-avatar-exceptions.md)  
**이전 문서**: [프로필 색인 (INDEX.md)](./INDEX.md)

