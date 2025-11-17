# CoUp Backend API 명세서

## 📚 개요

**프로젝트**: CoUp - 스터디 플랫폼  
**백엔드**: Next.js 14 App Router + Prisma + PostgreSQL  
**인증**: NextAuth.js v4 (JWT)  
**총 API**: 127개 엔드포인트

---

## 📖 문서 목차

### 1. [인증 API](./01-auth.md)
- 회원가입
- 로그인 (NextAuth)
- 로그아웃
- 세션 관리

**총 3개 엔드포인트**

---

### 2. [사용자 API](./02-users.md)
- 내 정보 조회
- 프로필 수정
- 비밀번호 변경

**총 3개 엔드포인트**

---

### 3. [대시보드 & 내 스터디](./03-dashboard.md)
- 대시보드 종합 데이터 (통계, 스터디, 활동, 일정)
- 내 스터디 목록 (필터, 페이지네이션)

**총 2개 엔드포인트**

---

### 4. [스터디 CRUD](./04-study-crud.md)
- 스터디 목록/검색/필터
- 스터디 생성
- 스터디 상세 조회
- 스터디 수정/삭제

**총 5개 엔드포인트**

---

### 5. [스터디 멤버 관리](./05-study-members.md)
- 가입 신청
- 가입 승인/거절
- 멤버 목록
- 역할 변경
- 강퇴/탈퇴

**총 8개 엔드포인트**

---

### 6. [스터디 콘텐츠](./06-study-content.md)
- 공지사항 CRUD (6개)
- 캘린더 일정 CRUD (4개)
- 할일 CRUD (8개)

**총 18개 엔드포인트**

---

### 7. [채팅 & 파일](./07-chat-files.md)
- 채팅 메시지 (무한 스크롤, 읽음 처리)
- 파일 업로드/다운로드

**총 8개 엔드포인트**

---

### 8. [알림 & 관리자](./08-notifications-admin.md)
- 알림 목록/읽음 처리 (3개)
- 관리자 통계 (1개)
- 사용자 관리 (4개)
- 스터디 관리 (3개)
- 신고 관리 (4개)

**총 15개 엔드포인트**

---

## 🔐 인증 방식

### JWT (NextAuth.js)
```javascript
// 세션 확인
import { useSession } from 'next-auth/react'
const { data: session } = useSession()

// 서버 컴포넌트
import { getServerSession } from 'next-auth/next'
const session = await getServerSession(authOptions)
```

### API 요청 헤더
```
Cookie: next-auth.session-token={token}
```

---

## 🎯 권한 시스템

### 사용자 역할
```
USER           일반 사용자
ADMIN          관리자
SYSTEM_ADMIN   최고 관리자
```

### 스터디 역할
```
OWNER          스터디장 (모든 권한)
ADMIN          관리자 (멤버 관리, 콘텐츠 작성)
MEMBER         일반 멤버 (콘텐츠 읽기)
```

---

## 📊 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "message": "성공 메시지",
  "data": { /* 데이터 */ }
}
```

### 에러 응답
```json
{
  "error": "에러 메시지",
  "code": "ERROR_CODE"
}
```

### 페이지네이션
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

## 🚀 Quick Start

### 1. 환경 변수 설정
```bash
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### 2. 데이터베이스 설정
```bash
# Prisma 마이그레이션
npx prisma migrate dev

# Seed 데이터 삽입
npm run db:seed
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 테스트 계정
```
Email: kim@example.com
Password: password123
```

---

## 📦 API 클라이언트 사용

### React Query Hooks
```javascript
// src/lib/hooks/useApi.js
import { 
  useDashboard,
  useStudies,
  useMyStudies,
  useNotifications 
} from '@/lib/hooks/useApi'

function MyComponent() {
  const { data, isLoading } = useDashboard()
  
  return <div>{/* UI */}</div>
}
```

### API 클라이언트
```javascript
// src/lib/utils/apiClient.js
import api from '@/lib/utils/apiClient'

// GET
const data = await api.get('/studies', { category: '프로그래밍' })

// POST
const result = await api.post('/studies', formData)

// 파일 업로드
const formData = new FormData()
formData.append('file', file)
await api.upload('/studies/123/files', formData)
```

---

## 🔄 자동 기능

### 알림 자동 생성
- 가입 승인 → `JOIN_APPROVED`
- 공지 작성 → `NOTICE`
- 일정 생성 → `EVENT`
- 파일 업로드 → `FILE`
- 강퇴 → `KICK`
- 채팅 → `CHAT`

### 통계 자동 계산
- 대시보드 통계
- 사용자별 스터디/할일 수
- 스터디별 멤버 수

### 읽음 처리
- 공지사항 조회수
- 채팅 메시지 읽음
- 파일 다운로드 수

---

## 🛠️ 개발 도구

### Prisma Studio
```bash
npx prisma studio
```

### API 테스트
```bash
# REST Client (VSCode)
# 또는 Postman/Insomnia
```

### 로그 확인
```bash
# logs/combined.log
# logs/error.log
```

---

## 📊 성능 최적화

### 캐싱 (React Query)
```javascript
{
  staleTime: 60 * 1000,  // 1분
  cacheTime: 5 * 60 * 1000,  // 5분
  refetchInterval: 5000  // 채팅: 5초 폴링
}
```

### 병렬 쿼리
```javascript
const [stats, studies, activities] = await Promise.all([
  getStats(),
  getStudies(),
  getActivities()
])
```

### 인덱스 최적화
```prisma
// schema.prisma
@@index([userId, status])
@@index([studyId, createdAt])
```

---

## 🐛 에러 핸들링

### 커스텀 에러
```javascript
import { AppError, ValidationError } from '@/lib/utils/errors'

throw new ValidationError('이메일 형식이 올바르지 않습니다')
throw new AppError('권한이 없습니다', 403)
```

### 에러 코드
- `VALIDATION_ERROR`: 400
- `AUTHENTICATION_ERROR`: 401
- `AUTHORIZATION_ERROR`: 403
- `NOT_FOUND`: 404
- `CONFLICT_ERROR`: 409
- `INTERNAL_ERROR`: 500

---

## 📝 체크리스트

### Phase 완료 현황
- [x] Phase 0: 환경 설정 (22/22)
- [x] Phase 1: 인증 시스템 (15/15)
- [x] Phase 2: 사용자 기능 (12/12)
- [x] Phase 3: 스터디 핵심 (17/17)
- [x] Phase 4: 스터디 콘텐츠 (18/18)
- [x] Phase 5: 채팅 시스템 (8/8)
- [x] Phase 6: 파일 관리 (8/8)
- [x] Phase 7: 알림 시스템 (7/7)
- [x] Phase 8: 관리자 기능 (12/12)
- [x] Phase 9: 최적화 (8/8)

**전체 진행률: 100% (120/120)** ✅

---

## 🔗 관련 문서

- [백엔드 구현 체크리스트](../backend-implementation-checklist.md)
- [완료 리포트](../COMPLETION_REPORT_FINAL.md)
- [데이터베이스 스키마](../database-schema.md)
- [검증 가이드](../verification-guide.md)

---

## 📞 문의

문제가 발생하거나 질문이 있으시면:
1. 로그 확인 (`logs/error.log`)
2. 에러 메시지 확인
3. API 응답 상태 코드 확인

---

**최종 업데이트**: 2025-11-18  
**작성자**: GitHub Copilot  
**버전**: 1.0.0

