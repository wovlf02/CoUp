# CoUp 백엔드 설계 문서

> **작성일**: 2025-11-17  
> **목적**: 프론트엔드 27개 페이지를 지원하는 백엔드 시스템 설계  
> **기술 스택**: Next.js App Router, NextAuth.js, Prisma ORM, PostgreSQL

---

## 📚 문서 목록

1. **[API 명세서](./api-specification.md)** - 전체 API 엔드포인트
2. **[데이터베이스 스키마](./database-schema.md)** - Prisma 스키마 정의
3. **[인증/인가](./auth-system.md)** - NextAuth.js 설정
4. **[파일 시스템](./file-system.md)** - 파일 업로드/다운로드
5. **[실시간 통신](./realtime.md)** - WebSocket, WebRTC
6. **[백엔드 구조](./structure.md)** - 파일 및 폴더 구조
7. **[보안 정책](./security.md)** - 보안 및 검증

---

## 🎯 개요

### 백엔드 요구사항 (프론트엔드 기반)

**점검 완료된 페이지**: 27개
- Admin: 6개
- Dashboard: 1개  
- Studies: 4개
- My Studies: 9개 (목록 1개 + 세부 8개)
- Tasks: 1개
- My-Page: 1개
- Notifications: 1개
- Auth: 2개
- Legal: 2개
- Landing: 1개

### 기술 스택

**프레임워크**:
- Next.js 14+ (App Router)
- React Server Components

**인증**:
- NextAuth.js v5 (Auth.js)
- JWT + Session

**데이터베이스**:
- PostgreSQL 15+
- Prisma ORM 5+

**파일 저장**:
- AWS S3 / Vercel Blob Storage
- 최대 50MB per file

**실시간**:
- Socket.io (채팅, 알림)
- WebRTC (화상통화)

**배포**:
- Vercel (Frontend + API Routes)
- Railway / Supabase (PostgreSQL)

---

## 🏗️ 아키텍처

### API 구조

```
Next.js App Router (coup/)
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.js   # NextAuth
│   │   ├── users/route.js                # 사용자 관리
│   │   ├── studies/route.js              # 스터디 CRUD
│   │   ├── admin/route.js                # 관리자 API
│   │   ├── notifications/route.js        # 알림
│   │   ├── tasks/route.js                # 할일
│   │   ├── files/route.js                # 파일
│   │   ├── chat/route.js                 # 채팅
│   │   └── ws/route.js                   # WebSocket
│   └── (기존 프론트엔드 파일들)
├── lib/
│   ├── prisma.js                         # Prisma Client
│   ├── auth.js                           # Auth 설정
│   ├── s3.js                             # S3 클라이언트
│   └── utils/                            # 유틸리티
└── prisma/
    └── schema.prisma                     # DB 스키마
```

### 데이터 흐름

```
Client (React) 
  ↓
API Routes (/api/*)
  ↓
Middleware (auth, validation)
  ↓
Business Logic
  ↓
Prisma ORM
  ↓
PostgreSQL Database
```

---

## 📊 API 엔드포인트 개수

| 영역 | 엔드포인트 수 |
|------|--------------|
| 인증 (Auth) | 5개 |
| 사용자 (Users) | 8개 |
| 스터디 (Studies) | 15개 |
| 채팅 (Chat) | 6개 |
| 공지 (Notices) | 7개 |
| 파일 (Files) | 8개 |
| 캘린더 (Calendar) | 6개 |
| 할일 (Tasks) | 8개 |
| 알림 (Notifications) | 5개 |
| 관리자 (Admin) | 12개 |

**총 API 엔드포인트**: **80개**

---

## 🔐 보안 요구사항

1. **인증**: JWT 기반 세션
2. **인가**: 역할 기반 권한 (SYSTEM_ADMIN, OWNER, ADMIN, MEMBER)
3. **데이터 검증**: Zod 스키마
4. **SQL Injection 방어**: Prisma ORM
5. **XSS 방어**: Input sanitization
6. **CSRF 방어**: NextAuth.js 내장
7. **Rate Limiting**: 분당 요청 제한
8. **파일 검증**: MIME type, 크기 제한

---

## 📅 개발 로드맵

### Phase 1: 기본 인프라 (1주)
- [ ] Prisma 스키마 작성
- [ ] NextAuth.js 설정
- [ ] DB 마이그레이션
- [ ] 기본 미들웨어

### Phase 2: 핵심 API (2주)
- [ ] 인증 API (5개)
- [ ] 사용자 API (8개)
- [ ] 스터디 API (15개)

### Phase 3: 기능 API (2주)
- [ ] 채팅 API (6개)
- [ ] 파일 API (8개)
- [ ] 할일 API (8개)
- [ ] 캘린더 API (6개)

### Phase 4: 관리 API (1주)
- [ ] 알림 API (5개)
- [ ] 관리자 API (12개)

### Phase 5: 실시간 기능 (1주)
- [ ] WebSocket (채팅, 알림)
- [ ] WebRTC (화상통화)

### Phase 6: 테스트 및 최적화 (1주)
- [ ] 통합 테스트
- [ ] 성능 최적화
- [ ] 보안 검증

**총 예상 기간**: **8주**

---

## 📖 다음 문서 읽기

각 문서에서 상세한 설계를 확인하세요:

1. [API 명세서](./api-specification.md) - 모든 엔드포인트 상세
2. [데이터베이스 스키마](./database-schema.md) - Prisma 모델
3. [인증/인가 시스템](./auth-system.md) - NextAuth 설정
4. [파일 시스템](./file-system.md) - S3 업로드
5. [실시간 통신](./realtime.md) - WebSocket/WebRTC
6. [백엔드 구조](./structure.md) - 폴더 구조
7. [보안 정책](./security.md) - 보안 가이드

