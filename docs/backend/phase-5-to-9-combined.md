# Phase 5-9: 남은 기능 구현 가이드 (통합본)

> **목표**: 채팅, 파일, 알림, 관리자, 최적화  
> **예상 시간**: 14-20시간  
> **선행 조건**: Phase 4 완료

---

## 📦 Phase 5: 채팅 시스템 (4-6시간)

### 체크리스트
- [ ] 메시지 목록 API (무한 스크롤)
- [ ] 메시지 전송 API
- [ ] 메시지 삭제 API
- [ ] 읽음 처리 API
- [ ] WebSocket 연결 (선택)

### 핵심 코드

#### 1. 메시지 목록 API
```javascript
// src/app/api/studies/[studyId]/chat/route.js
export async function GET(request, { params }) {
  const result = await requireStudyMember(params.studyId, 'MEMBER')
  if (result instanceof NextResponse) return result

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor') // messageId
  const limit = parseInt(searchParams.get('limit') || '50')

  const where = { studyId: params.studyId }
  if (cursor) {
    where.id = { lt: cursor } // cursor 이전 메시지
  }

  const messages = await prisma.message.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, avatar: true }
      },
      file: {
        select: { id: true, name: true, type: true, url: true }
      }
    }
  })

  return NextResponse.json({
    messages: messages.reverse(),
    nextCursor: messages.length === limit ? messages[0].id : null
  })
}
```

#### 2. 메시지 전송 API
```javascript
export async function POST(request, { params }) {
  const result = await requireStudyMember(params.studyId, 'MEMBER')
  if (result instanceof NextResponse) return result
  const { session } = result

  const { content, fileId } = await request.json()

  if (!content && !fileId) {
    return NextResponse.json(
      { error: "내용 또는 파일이 필요합니다" },
      { status: 400 }
    )
  }

  const message = await prisma.message.create({
    data: {
      studyId: params.studyId,
      userId: session.user.id,
      content: content || '',
      fileId,
      readers: [session.user.id] // 본인은 자동 읽음
    },
    include: {
      user: {
        select: { id: true, name: true, avatar: true }
      }
    }
  })

  // TODO: WebSocket으로 브로드캐스트

  return NextResponse.json({
    success: true,
    message
  }, { status: 201 })
}
```

---

## 📁 Phase 6: 파일 관리 (4-6시간)

### 체크리스트
- [ ] 파일 업로드 API
- [ ] 파일 목록 API
- [ ] 파일 다운로드 API
- [ ] 파일 삭제 API

### 핵심 코드

#### 1. 파일 업로드 설정
```javascript
// next.config.mjs
export default {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}
```

#### 2. 파일 업로드 API
```javascript
// src/app/api/studies/[studyId]/files/route.js
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request, { params }) {
  const result = await requireStudyMember(params.studyId, 'MEMBER')
  if (result instanceof NextResponse) return result
  const { session } = result

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { error: "파일이 없습니다" },
        { status: 400 }
      )
    }

    // 파일 크기 확인 (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "파일 크기는 50MB를 초과할 수 없습니다" },
        { status: 400 }
      )
    }

    // 파일 저장
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filename = `${Date.now()}-${file.name}`
    const path = join(process.cwd(), 'uploads', params.studyId, filename)

    await writeFile(path, buffer)

    // DB에 저장
    const uploadedFile = await prisma.file.create({
      data: {
        studyId: params.studyId,
        uploaderId: session.user.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: `/uploads/${params.studyId}/${filename}`
      }
    })

    // 알림 생성
    const study = await prisma.study.findUnique({
      where: { id: params.studyId },
      select: { 
        name: true, 
        emoji: true,
        members: {
          where: { 
            status: 'ACTIVE',
            userId: { not: session.user.id }
          },
          select: { userId: true }
        }
      }
    })

    await prisma.notification.createMany({
      data: study.members.map(member => ({
        userId: member.userId,
        type: 'FILE',
        studyId: params.studyId,
        studyName: study.name,
        studyEmoji: study.emoji,
        message: `${session.user.name}님이 ${file.name}을(를) 업로드했습니다`
      }))
    })

    return NextResponse.json({
      success: true,
      file: uploadedFile
    }, { status: 201 })

  } catch (error) {
    console.error('Upload file error:', error)
    return NextResponse.json(
      { error: "파일 업로드 실패" },
      { status: 500 }
    )
  }
}
```

#### 3. 파일 다운로드 API
```javascript
// src/app/api/studies/[studyId]/files/[fileId]/download/route.js
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request, { params }) {
  const result = await requireStudyMember(params.studyId, 'MEMBER')
  if (result instanceof NextResponse) return result

  try {
    const file = await prisma.file.findUnique({
      where: { id: params.fileId }
    })

    if (!file) {
      return NextResponse.json(
        { error: "파일을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 다운로드 횟수 증가
    await prisma.file.update({
      where: { id: params.fileId },
      data: { downloads: { increment: 1 } }
    })

    // 파일 읽기
    const path = join(process.cwd(), file.url.replace('/', ''))
    const buffer = await readFile(path)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`
      }
    })

  } catch (error) {
    console.error('Download file error:', error)
    return NextResponse.json(
      { error: "파일 다운로드 실패" },
      { status: 500 }
    )
  }
}
```

---

## 🔔 Phase 7: 알림 시스템 (3-4시간)

### 체크리스트
- [ ] 알림 생성 헬퍼 함수
- [ ] 알림 목록 API
- [ ] 알림 읽음 처리 API
- [ ] 모두 읽음 API
- [ ] 기존 API에 알림 통합

### 핵심 코드

#### 알림 서비스
```javascript
// src/lib/services/notificationService.js
import { prisma } from '../prisma'

export const notificationService = {
  async createNotification(data) {
    return await prisma.notification.create({ data })
  },

  async createMany(dataArray) {
    return await prisma.notification.createMany({ data: dataArray })
  },

  async notifyStudyMembers(studyId, type, message, excludeUserId = null, data = null) {
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: {
        name: true,
        emoji: true,
        members: {
          where: {
            status: 'ACTIVE',
            ...(excludeUserId ? { userId: { not: excludeUserId } } : {})
          },
          select: { userId: true }
        }
      }
    })

    await this.createMany(
      study.members.map(member => ({
        userId: member.userId,
        type,
        studyId,
        studyName: study.name,
        studyEmoji: study.emoji,
        message,
        data
      }))
    )
  }
}
```

#### 알림 API
```javascript
// src/app/api/notifications/route.js
export async function GET(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter') // 'all', 'unread'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where = { userId: session.user.id }
  if (filter === 'unread') {
    where.isRead = false
  }

  const [total, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  ])

  return NextResponse.json({
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
}
```

---

## 🛡️ Phase 8: 관리자 기능 (6-8시간)

### 체크리스트
- [ ] 관리자 통계 API
- [ ] 사용자 목록/검색 API
- [ ] 사용자 정지/복구 API
- [ ] 스터디 목록 API
- [ ] 신고 목록/처리 API

### 핵심 코드

#### 관리자 통계 API
```javascript
// src/app/api/admin/stats/route.js
export async function GET() {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  const [
    totalUsers,
    activeStudies,
    newSignupsToday,
    pendingReports
  ] = await Promise.all([
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.study.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.report.count({ where: { status: 'PENDING' } })
  ])

  return NextResponse.json({
    totalUsers,
    activeStudies,
    newSignupsToday,
    pendingReports
  })
}
```

#### 사용자 정지 API
```javascript
// src/app/api/admin/users/[userId]/suspend/route.js
export async function POST(request, { params }) {
  const session = await requireAdmin()
  if (session instanceof NextResponse) return session

  const { suspendedUntil, suspendReason } = await request.json()

  if (!suspendReason) {
    return NextResponse.json(
      { error: "정지 사유를 입력해주세요" },
      { status: 400 }
    )
  }

  await prisma.user.update({
    where: { id: params.userId },
    data: {
      status: 'SUSPENDED',
      suspendedUntil: suspendedUntil ? new Date(suspendedUntil) : null,
      suspendReason
    }
  })

  return NextResponse.json({
    success: true,
    message: "계정이 정지되었습니다"
  })
}
```

---

## 🚀 Phase 9: 최적화 및 테스트 (4-6시간)

### 체크리스트
- [ ] 에러 핸들링 통합
- [ ] API 응답 포맷 통일
- [ ] 로깅 시스템
- [ ] E2E 테스트 작성

### 에러 핸들링
```javascript
// src/lib/utils/errors.js
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
  }
}

export function handleError(error) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }

  console.error('Unhandled error:', error)
  return NextResponse.json(
    { error: "서버 오류가 발생했습니다" },
    { status: 500 }
  )
}
```

### API 응답 헬퍼
```javascript
// src/lib/utils/response.js
export function successResponse(data, message = null) {
  return NextResponse.json({
    success: true,
    message,
    ...data
  })
}

export function errorResponse(message, statusCode = 400) {
  return NextResponse.json(
    { error: message },
    { status: statusCode }
  )
}
```

---

## ✅ 전체 완료 기준

### Mock 데이터 제거
```bash
# mocks 폴더 삭제 또는 이름 변경
mv src/mocks src/mocks.backup
```

### 모든 페이지 API 연동 확인
- [ ] 27개 페이지 모두 API 호출 확인
- [ ] Network 탭에서 API 응답 확인
- [ ] Mock 데이터 import 제거

### 최종 테스트
```bash
# 전체 플로우 테스트
1. 회원가입 → 로그인
2. 스터디 생성 → 가입
3. 공지 작성 → 알림 확인
4. 파일 업로드 → 다운로드
5. 할일 생성 → 완료 토글
6. 관리자 기능 (정지/복구)
```

---

## 📊 완료 체크리스트

### Phase 5: 채팅
- [ ] 메시지 목록 (무한 스크롤)
- [ ] 메시지 전송
- [ ] 메시지 삭제
- [ ] 읽음 처리

### Phase 6: 파일
- [ ] 파일 업로드 (50MB 제한)
- [ ] 파일 목록
- [ ] 파일 다운로드
- [ ] 파일 삭제

### Phase 7: 알림
- [ ] 알림 생성 헬퍼
- [ ] 알림 목록
- [ ] 읽음 처리
- [ ] 모두 읽음

### Phase 8: 관리자
- [ ] 통계 API
- [ ] 사용자 관리
- [ ] 사용자 정지/복구
- [ ] 신고 목록
- [ ] 신고 처리

### Phase 9: 최적화
- [ ] 에러 핸들링
- [ ] API 응답 통일
- [ ] 로깅
- [ ] 테스트

---

## 🎉 최종 확인

### 데이터 정합성
- [ ] 사용자 생성 시 정상 동작
- [ ] 스터디 생성 시 OWNER 자동 추가
- [ ] 가입 승인 시 알림 생성
- [ ] 공지 작성 시 멤버 전체 알림
- [ ] 파일 업로드 시 알림 생성

### 성능
- [ ] 대부분 API < 500ms
- [ ] 페이지 로드 < 2초
- [ ] 무한 스크롤 부드럽게 동작

### 보안
- [ ] 모든 API에 인증 확인
- [ ] 권한 확인 (OWNER/ADMIN/MEMBER)
- [ ] SQL Injection 방지 (Prisma 자동)
- [ ] XSS 방지 (React 자동)

---

## 📚 참고 문서

- [verification-guide.md](./verification-guide.md) - 검증 가이드
- [backend-implementation-checklist.md](./backend-implementation-checklist.md) - 전체 체크리스트

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-11-18

