# 백엔드 구현 최종 체크리스트

> **목적**: 체크리스트만 보고 구현 진행 및 완료 추적  
> **사용법**: 새 세션에서 이 파일을 먼저 확인  
> **최종 업데이트**: 2025-11-18

---

## 🎯 전체 진행률

**총 체크 항목**: 120개  
**완료**: 0개 (0%)  
**진행 중**: Phase 0 (환경 설정)

---

## 📦 Phase 0: 환경 설정 (필수)

**목표**: PostgreSQL + Prisma 개발 환경 구축  
**예상 시간**: 1-2시간  
**문서**: [phase-0-setup.md](./phase-0-setup.md)

### 데이터베이스 설정
- [ ] PostgreSQL 15+ 설치 및 실행
- [ ] 데이터베이스 `coup` 생성
- [ ] 연결 테스트 완료

### Prisma 설정
- [ ] `npm install prisma @prisma/client` 실행
- [ ] `npx prisma init` 실행
- [ ] `prisma/schema.prisma` 작성 (11개 모델)
  - [ ] User
  - [ ] Study
  - [ ] StudyMember
  - [ ] Message
  - [ ] Notice
  - [ ] File
  - [ ] Event
  - [ ] Task
  - [ ] Notification
  - [ ] Report
  - [ ] 모든 Enum (Provider, UserRole, UserStatus 등)
- [ ] `npx prisma migrate dev --name init` 실행
- [ ] `npx prisma generate` 실행

### Prisma Client 설정
- [ ] `src/lib/prisma.js` 생성
- [ ] Prisma Client 싱글톤 패턴 적용

### Seed 데이터
- [ ] `npm install bcryptjs` 실행
- [ ] `prisma/seed.js` 작성
- [ ] `package.json`에 seed 스크립트 추가
- [ ] `npm run db:seed` 실행 성공
- [ ] Seed 데이터 확인 (3명 사용자, 2개 스터디)

### 환경 변수
- [ ] `.env.local` 파일 생성
- [ ] `DATABASE_URL` 설정
- [ ] `NEXTAUTH_URL` 설정
- [ ] `NEXTAUTH_SECRET` 생성 및 설정

### 테스트
- [ ] `test-db.js` 스크립트 실행
- [ ] Prisma Studio 실행 (`npx prisma studio`)
- [ ] 데이터 확인 완료

---

## 🔐 Phase 1: 인증 시스템 (필수)

**목표**: NextAuth.js v5 인증/인가  
**예상 시간**: 4-6시간  
**문서**: [phase-1-auth.md](./phase-1-auth.md)

### NextAuth 설치
- [ ] `npm install next-auth@beta @auth/prisma-adapter` 실행
- [ ] `npm install bcryptjs @types/bcryptjs` 실행

### NextAuth 설정
- [ ] `src/lib/auth.js` 생성
- [ ] Credentials Provider 설정
- [ ] JWT callback 설정
- [ ] Session callback 설정
- [ ] 로그인 시 `lastLoginAt` 업데이트

### API Routes
- [ ] `src/app/api/auth/[...nextauth]/route.js` 생성
- [ ] `src/app/api/auth/signup/route.js` 생성
  - [ ] 이메일 중복 확인
  - [ ] 비밀번호 해싱
  - [ ] 사용자 생성
  - [ ] 유효성 검사 (Zod)

### 인증 헬퍼
- [ ] `src/lib/auth-helpers.js` 생성
- [ ] `requireAuth()` 함수
- [ ] `requireAdmin()` 함수
- [ ] `requireStudyMember()` 함수

### 미들웨어
- [ ] `middleware.js` 생성 (프로젝트 루트)
- [ ] 공개/보호/관리자 경로 설정
- [ ] 로그인 리다이렉트
- [ ] 권한 확인

### 프론트엔드 연동
- [ ] 회원가입 페이지 수정
- [ ] 로그인 페이지 수정
- [ ] `SessionProvider` 설정
- [ ] 로그아웃 버튼 추가

### 테스트
- [ ] 회원가입 API 테스트
- [ ] 로그인 테스트
- [ ] 세션 확인 테스트
- [ ] 보호된 라우트 테스트
- [ ] 관리자 라우트 테스트

---

## 👤 Phase 2: 사용자 기능 (필수)

**목표**: 프로필, 대시보드, 통계  
**예상 시간**: 4-6시간  
**문서**: [phase-2-user-features.md](./phase-2-user-features.md)

### 사용자 API
- [ ] `GET /api/users/me` - 내 정보 조회
- [ ] `PATCH /api/users/me` - 프로필 수정
- [ ] `PATCH /api/users/me/password` - 비밀번호 변경
- [ ] `GET /api/users/me/stats` - 사용자 통계

### 대시보드 API
- [ ] `GET /api/dashboard` - 대시보드 데이터
  - [ ] 통계 카드 (4개)
  - [ ] 내 스터디 (6개)
  - [ ] 최근 활동 (5개)

### 내 스터디 API
- [ ] `GET /api/my-studies` - 내 스터디 목록
  - [ ] 필터링 (all/owner/admin/pending)
  - [ ] 페이지네이션
  - [ ] 새 메시지/공지 카운트

### 프론트엔드 연동
- [ ] Dashboard 페이지 API 연동
- [ ] 마이페이지 API 연동
- [ ] 내 스터디 목록 API 연동

### 테스트
- [ ] 모든 엔드포인트 테스트
- [ ] Mock 데이터 제거 확인

---

## 📚 Phase 3: 스터디 핵심 기능 (필수)

**목표**: 스터디 CRUD, 멤버 관리  
**예상 시간**: 8-10시간  
**문서**: [phase-3-study-core.md](./phase-3-study-core.md)

### 스터디 CRUD
- [ ] `GET /api/studies` - 스터디 목록/검색
  - [ ] 카테고리 필터
  - [ ] 검색 (제목, 설명)
  - [ ] 모집 중 필터
  - [ ] 페이지네이션
- [ ] `POST /api/studies` - 스터디 생성
  - [ ] 초대 코드 자동 생성
  - [ ] 생성자를 OWNER로 자동 추가
- [ ] `GET /api/studies/[id]` - 스터디 상세
  - [ ] 멤버 여부에 따라 정보 제한
- [ ] `PATCH /api/studies/[id]` - 스터디 수정 (OWNER)
- [ ] `DELETE /api/studies/[id]` - 스터디 삭제 (OWNER)

### 스터디 가입
- [ ] `POST /api/studies/[id]/join` - 가입 신청
  - [ ] 자동 승인/수동 승인 분기
  - [ ] 중복 가입 확인
  - [ ] 정원 확인
- [ ] `GET /api/studies/[id]/join-requests` - 가입 신청 목록 (ADMIN+)
- [ ] `POST /api/studies/[id]/members/[userId]/approve` - 승인 (ADMIN+)
- [ ] `POST /api/studies/[id]/members/[userId]/reject` - 거절 (ADMIN+)

### 멤버 관리
- [ ] `GET /api/studies/[id]/members` - 멤버 목록
  - [ ] 역할별 필터
  - [ ] 상태별 필터 (ACTIVE/PENDING)
- [ ] `PATCH /api/studies/[id]/members/[userId]/role` - 역할 변경 (OWNER)
- [ ] `DELETE /api/studies/[id]/members/[userId]` - 강퇴 (ADMIN+)
- [ ] `DELETE /api/studies/[id]/leave` - 스터디 탈퇴

### 프론트엔드 연동
- [ ] 스터디 탐색 페이지
- [ ] 스터디 생성 페이지
- [ ] 스터디 상세 페이지
- [ ] 가입 신청 플로우
- [ ] 멤버 관리 페이지

### 테스트
- [ ] 전체 플로우 테스트
- [ ] 권한 확인 테스트

---

## 📝 Phase 4: 스터디 콘텐츠 (필수)

**목표**: 공지사항, 캘린더, 할일  
**예상 시간**: 6-8시간  
**문서**: [phase-4-study-content.md](./phase-4-study-content.md)

### 공지사항
- [ ] `GET /api/studies/[id]/notices` - 공지 목록
- [ ] `POST /api/studies/[id]/notices` - 공지 작성 (ADMIN+)
- [ ] `GET /api/studies/[id]/notices/[noticeId]` - 공지 상세
  - [ ] 조회수 증가
- [ ] `PATCH /api/studies/[id]/notices/[noticeId]` - 공지 수정 (작성자/ADMIN+)
- [ ] `DELETE /api/studies/[id]/notices/[noticeId]` - 공지 삭제 (작성자/ADMIN+)
- [ ] `POST /api/studies/[id]/notices/[noticeId]/pin` - 고정/해제 (ADMIN+)

### 캘린더
- [ ] `GET /api/studies/[id]/calendar` - 일정 목록
  - [ ] 월별 필터 (`?month=2025-11`)
- [ ] `POST /api/studies/[id]/calendar` - 일정 생성 (ADMIN+)
- [ ] `PATCH /api/studies/[id]/calendar/[eventId]` - 일정 수정 (ADMIN+)
- [ ] `DELETE /api/studies/[id]/calendar/[eventId]` - 일정 삭제 (ADMIN+)

### 할일
- [ ] `GET /api/tasks` - 내 할일 목록
  - [ ] 스터디별 필터
  - [ ] 상태별 필터 (TODO/IN_PROGRESS/DONE)
  - [ ] 완료/미완료 필터
- [ ] `POST /api/tasks` - 할일 생성
- [ ] `GET /api/tasks/[id]` - 할일 상세
- [ ] `PATCH /api/tasks/[id]` - 할일 수정
- [ ] `PATCH /api/tasks/[id]/toggle` - 완료/미완료 토글
- [ ] `DELETE /api/tasks/[id]` - 할일 삭제

### 프론트엔드 연동
- [ ] 공지사항 페이지
- [ ] 캘린더 페이지
- [ ] 할일 페이지
- [ ] Mock 데이터 제거

### 테스트
- [ ] CRUD 테스트
- [ ] 권한 확인

---

## 💬 Phase 5: 채팅 시스템 (중요)

**목표**: 실시간 채팅 (REST 기반)  
**예상 시간**: 4-6시간  
**문서**: [phase-5-chat.md](./phase-5-chat.md)

### 채팅 API (REST)
- [ ] `GET /api/studies/[id]/chat` - 메시지 목록
  - [ ] 무한 스크롤 (cursor-based)
  - [ ] 최대 50개씩
- [ ] `POST /api/studies/[id]/chat` - 메시지 전송
  - [ ] 파일 첨부 (옵션)
- [ ] `DELETE /api/studies/[id]/chat/[messageId]` - 메시지 삭제 (작성자/ADMIN+)
- [ ] `POST /api/studies/[id]/chat/[messageId]/read` - 읽음 처리

### 프론트엔드 연동
- [ ] 채팅 페이지 API 연동
- [ ] 무한 스크롤 구현
- [ ] Polling (5초마다)
- [ ] Mock 데이터 제거

### WebSocket (선택)
- [ ] Socket.IO 서버 설정
- [ ] 실시간 메시지 수신
- [ ] 입력 중 표시

### 테스트
- [ ] 메시지 전송/수신
- [ ] 읽음 처리

---

## 📁 Phase 6: 파일 관리 (중요)

**목표**: 파일 업로드/다운로드  
**예상 시간**: 4-6시간  
**문서**: [phase-6-files.md](./phase-6-files.md)

### 파일 업로드 설정
- [ ] 로컬 파일 시스템 설정 (`/uploads`)
- [ ] 또는 AWS S3 설정 (프로덕션)
- [ ] `next.config.mjs`에 파일 크기 제한 설정

### 파일 API
- [ ] `POST /api/studies/[id]/files` - 파일 업로드
  - [ ] multipart/form-data 처리
  - [ ] 파일 크기 제한 (50MB)
  - [ ] 파일 타입 확인
- [ ] `GET /api/studies/[id]/files` - 파일 목록
  - [ ] 폴더별 필터 (옵션)
- [ ] `GET /api/studies/[id]/files/[fileId]/download` - 다운로드
  - [ ] 다운로드 횟수 증가
- [ ] `DELETE /api/studies/[id]/files/[fileId]` - 파일 삭제 (업로더/ADMIN+)

### 프론트엔드 연동
- [ ] 파일 페이지 API 연동
- [ ] 파일 업로드 UI
- [ ] 다운로드 기능
- [ ] Mock 데이터 제거

### 테스트
- [ ] 파일 업로드
- [ ] 파일 다운로드
- [ ] 권한 확인

---

## 🔔 Phase 7: 알림 시스템 (중요)

**목표**: 알림 생성 및 관리  
**예상 시간**: 3-4시간  
**문서**: [phase-7-notifications.md](./phase-7-notifications.md)

### 알림 헬퍼
- [ ] `src/lib/services/notificationService.js` 생성
- [ ] `createNotification()` 함수
- [ ] 타입별 알림 생성 헬퍼

### 알림 트리거 통합
- [ ] 가입 승인 → JOIN_APPROVED 알림
- [ ] 새 공지 → NOTICE 알림
- [ ] 파일 업로드 → FILE 알림
- [ ] 일정 생성 → EVENT 알림
- [ ] 할일 생성 → TASK 알림
- [ ] 강퇴 → KICK 알림

### 알림 API
- [ ] `GET /api/notifications` - 알림 목록
  - [ ] 읽음/안 읽음 필터
  - [ ] 페이지네이션
- [ ] `POST /api/notifications/[id]/read` - 읽음 처리
- [ ] `POST /api/notifications/mark-all-read` - 모두 읽음
- [ ] `DELETE /api/notifications/[id]` - 알림 삭제

### 프론트엔드 연동
- [ ] 알림 페이지 API 연동
- [ ] 헤더 알림 배지
- [ ] Mock 데이터 제거

### 테스트
- [ ] 알림 생성 확인
- [ ] 읽음 처리

---

## 🛡️ Phase 8: 관리자 기능 (선택)

**목표**: 관리자 대시보드, 사용자/스터디/신고 관리  
**예상 시간**: 6-8시간  
**문서**: [phase-8-admin.md](./phase-8-admin.md)

### 관리자 대시보드
- [ ] `GET /api/admin/stats` - 통계 데이터
  - [ ] 전체 사용자 수
  - [ ] 활성 스터디 수
  - [ ] 신규 가입 (오늘)
  - [ ] 미처리 신고

### 사용자 관리
- [ ] `GET /api/admin/users` - 사용자 목록
  - [ ] 검색 (이메일, 이름)
  - [ ] 상태별 필터
  - [ ] 페이지네이션
- [ ] `GET /api/admin/users/[id]` - 사용자 상세
- [ ] `POST /api/admin/users/[id]/suspend` - 계정 정지
- [ ] `POST /api/admin/users/[id]/restore` - 정지 해제

### 스터디 관리
- [ ] `GET /api/admin/studies` - 스터디 목록
  - [ ] 검색
  - [ ] 카테고리 필터
  - [ ] 페이지네이션
- [ ] `GET /api/admin/studies/[id]` - 스터디 상세
- [ ] `DELETE /api/admin/studies/[id]` - 스터디 삭제

### 신고 관리
- [ ] `GET /api/admin/reports` - 신고 목록
  - [ ] 상태별 필터 (PENDING/RESOLVED)
  - [ ] 우선순위별 필터
  - [ ] 페이지네이션
- [ ] `GET /api/admin/reports/[id]` - 신고 상세
- [ ] `POST /api/admin/reports/[id]/process` - 신고 처리
  - [ ] 경고/정지/삭제/기각

### 프론트엔드 연동
- [ ] 관리자 대시보드 API 연동
- [ ] 사용자 관리 페이지
- [ ] 스터디 관리 페이지
- [ ] 신고 관리 페이지
- [ ] Mock 데이터 제거

### 테스트
- [ ] 관리자 권한 확인
- [ ] 모든 기능 테스트

---

## 🚀 Phase 9: 최적화 및 테스트 (선택)

**목표**: 성능 최적화, 에러 핸들링, 로깅  
**예상 시간**: 4-6시간  
**문서**: [phase-9-optimization.md](./phase-9-optimization.md)

### 에러 핸들링
- [ ] `src/lib/utils/errors.js` 생성
- [ ] 커스텀 에러 클래스
- [ ] 전역 에러 핸들러

### API 응답 포맷
- [ ] `src/lib/utils/response.js` 생성
- [ ] 성공 응답 헬퍼
- [ ] 에러 응답 헬퍼

### 로깅
- [ ] Winston 또는 Pino 설정
- [ ] 요청/응답 로그
- [ ] 에러 로그

### 캐싱
- [ ] React Query 설정
- [ ] API 응답 캐싱

### 테스트
- [ ] 주요 플로우 E2E 테스트
- [ ] API 단위 테스트

---

## 🎉 최종 확인

### Mock 데이터 제거
- [ ] `src/mocks/` 폴더 완전 제거 또는 비활성화
- [ ] 모든 페이지가 API 연동 확인

### 프로덕션 준비
- [ ] 환경 변수 프로덕션 설정
- [ ] 데이터베이스 마이그레이션
- [ ] Seed 데이터 (프로덕션용)
- [ ] 에러 핸들링 확인
- [ ] 로깅 확인

### 배포
- [ ] Vercel 또는 AWS 배포
- [ ] PostgreSQL 프로덕션 연결
- [ ] 환경 변수 설정
- [ ] 도메인 연결

---

## 📈 진행 상황 추적

### Phase별 완료 상태

| Phase | 이름 | 상태 | 완료일 |
|-------|------|------|--------|
| 0 | 환경 설정 | ⏳ 대기 | - |
| 1 | 인증 시스템 | ⏳ 대기 | - |
| 2 | 사용자 기능 | ⏳ 대기 | - |
| 3 | 스터디 핵심 | ⏳ 대기 | - |
| 4 | 스터디 콘텐츠 | ⏳ 대기 | - |
| 5 | 채팅 시스템 | ⏳ 대기 | - |
| 6 | 파일 관리 | ⏳ 대기 | - |
| 7 | 알림 시스템 | ⏳ 대기 | - |
| 8 | 관리자 기능 | ⏳ 대기 | - |
| 9 | 최적화 | ⏳ 대기 | - |

**상태 표기**:
- ⏳ 대기
- 🏗️ 진행 중
- ✅ 완료
- ❌ 취소

---

## 📝 사용 방법

### 새 세션 시작 시

1. **이 파일 열기** (`backend-implementation-checklist.md`)
2. **현재 Phase 확인**
3. **해당 Phase 문서 열기** (`phase-[N]-*.md`)
4. **체크리스트 따라 구현**
5. **완료 시 체크 표시** (`- [ ]` → `- [x]`)

### 진행 중

- 각 항목 완료 시 체크 표시
- 문제 발생 시 문서의 "문제 해결" 섹션 참고
- 완료 후 테스트 수행

### Phase 완료 시

- 모든 체크 항목 완료 확인
- 테스트 통과 확인
- 다음 Phase로 이동

---

## 🔗 관련 문서

- **[00-backend-implementation-master-plan.md](./00-backend-implementation-master-plan.md)** - 전체 마스터 플랜
- **[database-schema.md](./database-schema.md)** - Prisma 스키마
- **[api-specification.md](./api-specification.md)** - API 명세서
- **[auth-system.md](./auth-system.md)** - NextAuth.js 설정

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-11-18  
**버전**: 1.0

