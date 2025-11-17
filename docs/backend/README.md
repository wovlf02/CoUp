# CoUp 백엔드 설계 및 구현 문서

> **작성일**: 2025-11-18 (업데이트)  
> **목적**: 프론트엔드 → 백엔드 완전 전환 가이드  
> **기술 스택**: Next.js 16, NextAuth.js v5, Prisma 5, PostgreSQL 15+  
> **현재 상태**: Mock 기반 프론트엔드 → API 기반 백엔드 구축 중

---

## 🚀 빠른 시작

### 새로운 세션에서 시작할 때

1. **마스터 플랜** 읽기
   - 👉 **[00-backend-implementation-master-plan.md](./00-backend-implementation-master-plan.md)**
   - 전체 로드맵, 기술 스택, 폴더 구조 파악

2. **체크리스트** 확인
   - 👉 **[backend-implementation-checklist.md](./backend-implementation-checklist.md)**
   - 현재 진행 상황 확인
   - 다음 할 일 파악

3. **현재 Phase 문서** 참고
   - Phase 0: 환경 설정
   - Phase 1: 인증 시스템
   - Phase 2~9: 순차적 구현

---

## 📚 문서 구조

### 🎯 구현 가이드 (NEW!)

**마스터 플랜 및 체크리스트**
- **[00-backend-implementation-master-plan.md](./00-backend-implementation-master-plan.md)** ⭐
  - 전체 개요 및 로드맵
  - 기술 스택 상세
  - 폴더 구조
  - Phase별 우선순위

- **[backend-implementation-checklist.md](./backend-implementation-checklist.md)** ⭐
  - 120개 체크 항목
  - Phase별 완료 추적
  - 진행 상황 시각화

**Phase별 상세 가이드**
1. **[phase-0-setup.md](./phase-0-setup.md)** - 환경 설정
   - PostgreSQL 설치
   - Prisma 설정
   - Seed 데이터
   - 테스트

2. **[phase-1-auth.md](./phase-1-auth.md)** - 인증 시스템
   - NextAuth.js v5 설정
   - 회원가입/로그인 API
   - 미들웨어
   - 세션 관리

3. **[phase-2-user-features.md](./phase-2-user-features.md)** - 사용자 기능
   - 프로필 API
   - 대시보드 API
   - 통계 API

4. **Phase 3~9** (예정)
   - phase-3-study-core.md
   - phase-4-study-content.md
   - phase-5-chat.md
   - phase-6-files.md
   - phase-7-notifications.md
   - phase-8-admin.md
   - phase-9-optimization.md

### 📖 참고 문서 (기존)

**설계 문서**
- **[database-schema.md](./database-schema.md)** - Prisma 스키마 정의
- **[api-specification.md](./api-specification.md)** - 전체 API 엔드포인트 (80개)
- **[auth-system.md](./auth-system.md)** - NextAuth.js 인증/인가

---

## 🎯 프로젝트 현황

### ✅ 완료된 프론트엔드

**총 27개 페이지 구현 완료**

#### 인증 (3개)
- ✅ 랜딩 페이지 (`/`)
- ✅ 로그인 (`/sign-in`)
- ✅ 회원가입 (`/sign-up`)

#### 법적 페이지 (2개)
- ✅ 개인정보처리방침 (`/privacy`)
- ✅ 이용약관 (`/terms`)

#### 메인 서비스 (10개)
- ✅ 대시보드 (`/dashboard`)
- ✅ 스터디 탐색 (`/studies`)
- ✅ 스터디 생성 (`/studies/create`)
- ✅ 스터디 프리뷰 (`/studies/[studyId]`)
- ✅ 내 스터디 목록 (`/my-studies`)
- ✅ 스터디 대시보드 (`/my-studies/[studyId]`) + 8개 탭
- ✅ 할일 페이지 (`/tasks`)
- ✅ 알림 페이지 (`/notifications`)
- ✅ 마이페이지 (`/me`)

#### 관리자 (6개)
- ✅ 관리자 대시보드 (`/admin`)
- ✅ 사용자 관리 (`/admin/users`)
- ✅ 스터디 관리 (`/admin/studies`)
- ✅ 신고 관리 (`/admin/reports`)
- ✅ 통계 분석 (`/admin/analytics`)
- ✅ 시스템 설정 (`/admin/settings`)

### 🏗️ 백엔드 구현 (진행 중)

**현재 단계**: Phase 0 (환경 설정)  
**다음 단계**: Phase 1 (인증 시스템)

**진행률**:
- Phase 0: ⏳ 대기
- Phase 1-9: ⏳ 대기
- 전체: 0% (0/120 체크 항목)

---

## 🎯 기술 스택

### Frontend (기존)
- **Framework**: Next.js 16.0.1
- **React**: 19.2.0
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts 3.4.1
- **Markdown**: react-markdown 10.1.0

### Backend (구현 예정)
- **Framework**: Next.js 16 (App Router + API Routes)
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5+
- **Validation**: Zod 3+
- **Password**: bcryptjs 2.4+
- **File Upload**: multer / AWS S3 (선택)
- **Real-time**: Socket.IO (선택)

---

## 📅 구현 로드맵

### Phase 0: 환경 설정 (1일)
- PostgreSQL + Prisma 설정
- Seed 데이터 생성

### Phase 1: 인증 시스템 (2일)
- NextAuth.js 설정
- 회원가입/로그인 API
- 미들웨어

### Phase 2: 사용자 기능 (2일)
- 프로필 API
- 대시보드 API
- 통계 API

### Phase 3: 스터디 핵심 기능 (5일)
- 스터디 CRUD
- 멤버 관리
- 가입/승인 시스템

### Phase 4: 스터디 콘텐츠 (4일)
- 공지사항 CRUD
- 캘린더 CRUD
- 할일 CRUD

### Phase 5: 채팅 시스템 (2일)
- REST 기반 채팅
- WebSocket (선택)

### Phase 6: 파일 관리 (2일)
- 파일 업로드/다운로드

### Phase 7: 알림 시스템 (1일)
- 알림 생성/관리

### Phase 8: 관리자 기능 (3일)
- 관리자 대시보드
- 사용자/스터디/신고 관리

### Phase 9: 최적화 (2일)
- 에러 핸들링
- 로깅
- 캐싱

**총 예상 기간**: 24일 (약 4-5주)

---

## 📂 최종 폴더 구조

```
coup/
├── prisma/
│   ├── schema.prisma           # Prisma 스키마
│   ├── migrations/             # 마이그레이션
│   └── seed.js                 # Seed 데이터
├── src/
│   ├── app/
│   │   ├── api/                # API Routes ⭐ NEW
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── studies/
│   │   │   ├── tasks/
│   │   │   ├── notifications/
│   │   │   └── admin/
│   │   └── ...                 # 기존 페이지
│   ├── lib/                    # 백엔드 라이브러리 ⭐ NEW
│   │   ├── auth.js
│   │   ├── prisma.js
│   │   ├── auth-helpers.js
│   │   ├── validators/
│   │   ├── services/
│   │   └── utils/
│   ├── mocks/                  # 단계적 제거
│   └── ...
├── .env.local                  # 환경 변수
├── middleware.js               # Next.js 미들웨어
└── package.json
```

---

## 🔗 관련 문서 링크

### 구현 가이드
- [마스터 플랜](./00-backend-implementation-master-plan.md)
- [체크리스트](./backend-implementation-checklist.md)
- [Phase 0: 환경 설정](./phase-0-setup.md)
- [Phase 1: 인증](./phase-1-auth.md)
- [Phase 2: 사용자 기능](./phase-2-user-features.md)

### 설계 문서
- [데이터베이스 스키마](./database-schema.md)
- [API 명세서](./api-specification.md)
- [인증 시스템](./auth-system.md)

### 프론트엔드 문서
- [화면 설계](../screens/README.md)
- [스터디 구현 가이드](../../docs/screens/study/README.md)
- [관리자 구현 상태](../../docs/ADMIN_FRONTEND_FINAL_COMPLETE.md)

---

## 🎯 다음 단계

### 지금 바로 시작하기

1. **Phase 0 시작**
   ```bash
   # PostgreSQL 설치 (Windows)
   # https://www.postgresql.org/download/windows/
   
   # 또는 Docker
   docker run --name coup-postgres -e POSTGRES_PASSWORD=coup123 -e POSTGRES_DB=coup -p 5432:5432 -d postgres:15
   ```

2. **Prisma 설치**
   ```bash
   cd C:\Project\CoUp\coup
   npm install prisma @prisma/client
   npx prisma init
   ```

3. **체크리스트 따라하기**
   - [backend-implementation-checklist.md](./backend-implementation-checklist.md) 열기
   - Phase 0 체크 항목 완료

---

## 📊 진행 상황

### Phase별 완료 상태

| Phase | 이름 | 예상 시간 | 상태 | 완료일 |
|-------|------|-----------|------|--------|
| 0 | 환경 설정 | 1-2시간 | ⏳ 대기 | - |
| 1 | 인증 시스템 | 4-6시간 | ⏳ 대기 | - |
| 2 | 사용자 기능 | 4-6시간 | ⏳ 대기 | - |
| 3 | 스터디 핵심 | 8-10시간 | ⏳ 대기 | - |
| 4 | 스터디 콘텐츠 | 6-8시간 | ⏳ 대기 | - |
| 5 | 채팅 | 4-6시간 | ⏳ 대기 | - |
| 6 | 파일 | 4-6시간 | ⏳ 대기 | - |
| 7 | 알림 | 3-4시간 | ⏳ 대기 | - |
| 8 | 관리자 | 6-8시간 | ⏳ 대기 | - |
| 9 | 최적화 | 4-6시간 | ⏳ 대기 | - |

---

## 백엔드 요구사항 (프론트엔드 기반)

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

---

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

