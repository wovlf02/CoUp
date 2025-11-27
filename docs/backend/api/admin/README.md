# 관리자 API 명세

> **Base URL**: `/api/admin`  
> **인증**: NextAuth JWT (Cookie 기반)  
> **권한**: ADMIN, SYSTEM_ADMIN

---

## 📋 목차

1. [인증 및 권한](#1-인증-및-권한)
2. [API 목록](#2-api-목록)
3. [공통 응답 형식](#3-공통-응답-형식)
4. [에러 코드](#4-에러-코드)

---

## 1. 인증 및 권한

### 1.1 인증 방식
```javascript
// NextAuth 세션 확인
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const session = await getServerSession(authOptions)
if (!session || !['ADMIN', 'SYSTEM_ADMIN'].includes(session.user.role)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 1.2 권한 체크
```javascript
// SYSTEM_ADMIN만 접근 가능
if (session.user.role !== 'SYSTEM_ADMIN') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

## 2. API 목록

### 영역별 API 문서

1. **[대시보드 API](./01-dashboard-api.md)** - `/api/admin/dashboard`
   - 핵심 지표
   - 최근 활동
   - 통계 그래프
   - 긴급 알림

2. **[사용자 관리 API](./02-users-api.md)** - `/api/admin/users`
   - 사용자 목록/상세
   - 경고/정지/해제
   - 제재 이력
   - 데이터 익스포트

3. **[스터디 관리 API](./03-studies-api.md)** - `/api/admin/studies`
   - 스터디 목록/상세
   - 숨김/종료/복구
   - 추천 스터디
   - 콘텐츠 삭제

4. **[신고 관리 API](./04-reports-api.md)** - `/api/admin/reports`
   - 신고 목록/상세
   - 담당자 배정
   - 처리 (승인/기각/보류)
   - 댓글

5. **[콘텐츠 검열 API](./05-moderation-api.md)** - `/api/admin/moderation`
   - 차단 로그
   - 검열 대기
   - 금지어 관리 (SYSTEM_ADMIN)
   - 필터링 설정

6. **[시스템 설정 API](./06-settings-api.md)** - `/api/admin/settings` (SYSTEM_ADMIN)
   - 플랫폼 설정
   - 이메일 템플릿
   - 이용약관
   - 관리자 권한

7. **[분석 API](./07-analytics-api.md)** - `/api/admin/analytics`
   - 사용자/스터디/활동 통계
   - 리포트 생성

---

## 3. 공통 응답 형식

### 3.1 성공 응답
```json
{
  "success": true,
  "message": "성공 메시지",
  "data": { /* 데이터 */ }
}
```

### 3.2 에러 응답
```json
{
  "error": "에러 메시지",
  "code": "ERROR_CODE",
  "details": { /* 추가 정보 */ }
}
```

### 3.3 페이지네이션
```json
{
  "data": [ /* 데이터 배열 */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 4. 에러 코드

### 4.1 인증/권한 에러
- `UNAUTHORIZED` (401): 인증 필요
- `FORBIDDEN` (403): 권한 없음
- `ADMIN_ONLY` (403): ADMIN 권한 필요
- `SYSTEM_ADMIN_ONLY` (403): SYSTEM_ADMIN 권한 필요

### 4.2 입력 검증 에러
- `VALIDATION_ERROR` (400): 입력값 검증 실패
- `MISSING_REQUIRED` (400): 필수 필드 누락
- `INVALID_FORMAT` (400): 형식 오류

### 4.3 비즈니스 로직 에러
- `NOT_FOUND` (404): 리소스 없음
- `ALREADY_EXISTS` (409): 이미 존재
- `CANNOT_PROCESS` (422): 처리 불가 상태

### 4.4 서버 에러
- `INTERNAL_ERROR` (500): 서버 내부 오류
- `DATABASE_ERROR` (500): DB 오류

---

## 5. 미들웨어

### 5.1 관리자 권한 체크
```javascript
// middleware/adminAuth.js
export async function requireAdmin(req) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    throw new Error('UNAUTHORIZED')
  }
  
  if (!['ADMIN', 'SYSTEM_ADMIN'].includes(session.user.role)) {
    throw new Error('FORBIDDEN')
  }
  
  return session
}

export async function requireSystemAdmin(req) {
  const session = await requireAdmin(req)
  
  if (session.user.role !== 'SYSTEM_ADMIN') {
    throw new Error('SYSTEM_ADMIN_ONLY')
  }
  
  return session
}
```

### 5.2 로깅
```javascript
// 모든 관리자 작업 로깅
export async function logAdminAction(adminId, action, target, details) {
  await prisma.adminLog.create({
    data: {
      adminId,
      action,
      targetType: target.type,
      targetId: target.id,
      details: JSON.stringify(details),
      ipAddress: req.headers['x-forwarded-for'] || req.ip,
      userAgent: req.headers['user-agent']
    }
  })
}
```

---

## 6. 레이트 리미팅

### 6.1 일반 API
- 분당 60회
- 시간당 1000회

### 6.2 제재 실행 API
- 분당 10회 (악용 방지)

### 6.3 데이터 익스포트
- 시간당 5회

```javascript
// lib/rateLimit.js
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'),
})

export async function checkRateLimit(identifier) {
  const { success } = await ratelimit.limit(identifier)
  
  if (!success) {
    throw new Error('RATE_LIMIT_EXCEEDED')
  }
}
```

---

## 7. 구현 체크리스트

### API 문서
- [ ] 01-dashboard-api.md
- [ ] 02-users-api.md
- [ ] 03-studies-api.md
- [ ] 04-reports-api.md
- [ ] 05-moderation-api.md
- [ ] 06-settings-api.md
- [ ] 07-analytics-api.md

### 공통 유틸
- [ ] 인증 미들웨어
- [ ] 로깅 시스템
- [ ] 레이트 리미팅
- [ ] 에러 핸들러

---

**다음**: 각 영역별 API 상세 명세 작성

