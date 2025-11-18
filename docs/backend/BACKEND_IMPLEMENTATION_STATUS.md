# 백엔드 구현 상태 및 향후 작업 체크리스트

> **작성일**: 2025-11-18  
> **프로젝트**: CoUp (스터디 협업 플랫폼)  
> **기술 스택**: Next.js 16, PostgreSQL, Prisma, NextAuth.js v4, Socket.io  

---

## 📊 전체 구현 현황

### 총괄 통계
- **총 API 엔드포인트**: 46개 / 80개 설계 (57.5%)
- **데이터베이스 스키마**: 100% 완료
- **인증 시스템**: 100% 완료
- **실시간 통신**: 50% 완료 (코드 작성됨, 미연동)
- **프로덕션 준비도**: 약 60%

---

## ✅ 완전히 구현된 기능

### 1. 인증/인가 시스템 (100%)
- ✅ NextAuth.js v4 설정 완료
- ✅ Credentials Provider (이메일/비밀번호)
- ✅ JWT 토큰 기반 세션
- ✅ 비밀번호 bcrypt 해싱
- ✅ 계정 상태 검증 (SUSPENDED, DELETED)
- ✅ 미들웨어 기반 접근 제어
- ✅ 역할 기반 인가 (RBAC)

**API 엔드포인트 (5/5)**
```
✅ POST   /api/auth/login          - 로그인
✅ POST   /api/auth/signup         - 회원가입
✅ POST   /api/auth/logout         - 로그아웃
✅ GET    /api/auth/me             - 세션 확인
✅ *      /api/auth/[...nextauth]  - NextAuth 핸들러
```

### 2. 사용자 관리 (60%)
**API 엔드포인트 (3/8)**
```
✅ GET    /api/users/me           - 내 정보 조회
✅ PATCH  /api/users/me           - 프로필 수정
✅ PATCH  /api/users/me/password  - 비밀번호 변경
❌ GET    /api/users?q=keyword    - 사용자 검색
❌ GET    /api/users/{userId}     - 사용자 상세
❌ DELETE /api/users/me           - 계정 삭제
❌ GET    /api/users/me/stats     - 내 통계
❌ PATCH  /api/users/me/email     - 이메일 변경
```

### 3. 스터디 관리 (93%)
**API 엔드포인트 (14/15)**
```
✅ GET    /api/studies                           - 목록 조회
✅ POST   /api/studies                           - 생성
✅ GET    /api/studies/{id}                      - 상세 조회
✅ PATCH  /api/studies/{id}                      - 수정
✅ DELETE /api/studies/{id}                      - 삭제
✅ POST   /api/studies/{id}/join                 - 가입 신청
✅ POST   /api/studies/{id}/leave                - 탈퇴
✅ GET    /api/studies/{id}/members              - 멤버 목록
✅ GET    /api/studies/{id}/join-requests        - 가입 요청 목록
✅ DELETE /api/studies/{id}/members/{userId}     - 강퇴
✅ POST   /api/studies/{id}/members/{userId}/approve  - 승인
✅ POST   /api/studies/{id}/members/{userId}/reject   - 거절
✅ PATCH  /api/studies/{id}/members/{userId}/role     - 역할 변경
✅ GET    /api/my-studies                        - 내 스터디 목록
❌ POST   /api/studies/{id}/invite               - 초대 코드 생성
```

### 4. 채팅 시스템 (67%)
**API 엔드포인트 (4/6)**
```
✅ GET    /api/studies/{id}/chat                      - 메시지 목록
✅ POST   /api/studies/{id}/chat                      - 메시지 전송
✅ DELETE /api/studies/{id}/chat/{messageId}          - 메시지 삭제
✅ POST   /api/studies/{id}/chat/{messageId}/read     - 읽음 처리
❌ GET    /api/studies/{id}/chat/search               - 메시지 검색
❌ POST   /api/studies/{id}/chat/{messageId}/pin      - 메시지 고정
```

### 5. 공지사항 (57%)
**API 엔드포인트 (4/7)**
```
✅ GET    /api/studies/{id}/notices              - 목록
✅ POST   /api/studies/{id}/notices              - 작성
✅ PATCH  /api/studies/{id}/notices/{noticeId}   - 수정
✅ DELETE /api/studies/{id}/notices/{noticeId}   - 삭제
✅ POST   /api/studies/{id}/notices/{noticeId}/pin  - 고정/해제
❌ GET    /api/studies/{id}/notices/{noticeId}/comments  - 댓글 목록
❌ POST   /api/studies/{id}/notices/{noticeId}/comments  - 댓글 작성
```

### 6. 파일 관리 (50%)
**API 엔드포인트 (4/8)**
```
✅ GET    /api/studies/{id}/files                     - 파일 목록
✅ POST   /api/studies/{id}/files                     - 파일 업로드
✅ DELETE /api/studies/{id}/files/{fileId}            - 파일 삭제
✅ GET    /api/studies/{id}/files/{fileId}/download   - 다운로드
❌ POST   /api/studies/{id}/files/folders             - 폴더 생성
❌ PATCH  /api/studies/{id}/files/{fileId}/move       - 파일 이동
❌ GET    /api/studies/{id}/files/search              - 파일 검색
❌ POST   /api/studies/{id}/files/{fileId}/share      - 공유 링크
```

### 7. 캘린더/일정 (67%)
**API 엔드포인트 (4/6)**
```
✅ GET    /api/studies/{id}/calendar              - 일정 목록
✅ POST   /api/studies/{id}/calendar              - 일정 생성
✅ PATCH  /api/studies/{id}/calendar/{eventId}    - 일정 수정
✅ DELETE /api/studies/{id}/calendar/{eventId}    - 일정 삭제
❌ POST   /api/studies/{id}/calendar/{eventId}/attend   - 참석 표시
❌ GET    /api/studies/{id}/calendar/{eventId}/attendees - 참석자 목록
```

### 8. 할일/작업 (50%)
**API 엔드포인트 (4/8)**
```
✅ GET    /api/tasks                    - 목록
✅ POST   /api/tasks                    - 생성
✅ PATCH  /api/tasks/{id}               - 수정
✅ DELETE /api/tasks/{id}               - 삭제
✅ PATCH  /api/tasks/{id}/toggle        - 완료 토글
❌ GET    /api/tasks/stats              - 통계
❌ POST   /api/tasks/{id}/share         - 할일 공유
❌ POST   /api/tasks/bulk               - 일괄 처리
```

### 9. 알림 (60%)
**API 엔드포인트 (3/5)**
```
✅ GET    /api/notifications                 - 알림 목록
✅ POST   /api/notifications/mark-all-read   - 모두 읽음
✅ POST   /api/notifications/{id}/read       - 개별 읽음
❌ PATCH  /api/notifications/settings        - 알림 설정
❌ DELETE /api/notifications/{id}            - 알림 삭제
```

### 10. 관리자 (67%)
**API 엔드포인트 (8/12)**
```
✅ GET    /api/admin/stats                          - 통계 대시보드
✅ GET    /api/admin/users                          - 사용자 목록
✅ GET    /api/admin/users/{id}                     - 사용자 상세
✅ POST   /api/admin/users/{id}/suspend             - 사용자 정지
✅ POST   /api/admin/users/{id}/restore             - 정지 해제
✅ GET    /api/admin/studies                        - 스터디 목록
✅ DELETE /api/admin/studies/{id}                   - 스터디 삭제
✅ GET    /api/admin/reports                        - 신고 목록
✅ GET    /api/admin/reports/{id}                   - 신고 상세
✅ POST   /api/admin/reports/{id}/process           - 신고 처리
❌ GET    /api/admin/logs                           - 시스템 로그
❌ PATCH  /api/admin/settings                       - 시스템 설정
```

### 11. 대시보드 (100%)
**API 엔드포인트 (2/2)**
```
✅ GET    /api/dashboard     - 대시보드 데이터
✅ GET    /api/my-studies    - 내 스터디 목록
```

---

## ⚠️ 부분 구현/미완성 기능

### 1. Socket.io 실시간 통신 (50%)
**상태**: 코드 작성됨, 프론트엔드 미연동

**파일 위치**: `coup/src/lib/socket/server.js`

**구현된 기능**:
```javascript
✅ Socket.io 서버 초기화
✅ Redis Adapter 설정 (멀티 서버 대응)
✅ 인증 미들웨어
✅ 온라인/오프라인 상태 관리
✅ 스터디 룸 참여/나가기
⚠️ 채팅 이벤트 (부분 구현)
⚠️ 타이핑 이벤트 (부분 구현)
⚠️ 화상회의 이벤트 (구조만)
```

**필요 작업**:
- [ ] 프론트엔드 Socket.io 클라이언트 연결
- [ ] 실시간 채팅 업데이트 연동
- [ ] 타이핑 인디케이터 UI 연동
- [ ] 온라인 사용자 표시 UI
- [ ] 알림 실시간 푸시
- [ ] 커스텀 서버 활성화 (`server.mjs`)

### 2. OAuth 소셜 로그인 (10%)
**상태**: 설정만 있고 미사용

**설계상 제공자**:
- ❌ Google OAuth
- ❌ GitHub OAuth

**필요 작업**:
- [ ] Google Cloud Console OAuth 앱 등록
- [ ] GitHub OAuth 앱 등록
- [ ] 환경 변수 설정
- [ ] NextAuth Provider 활성화
- [ ] 프론트엔드 소셜 로그인 버튼

### 3. 파일 저장소 (30%)
**상태**: 업로드 로직 있으나 저장소 미연동

**현재 구현**:
- ⚠️ FormData 파싱만 구현
- ⚠️ 로컬 파일 시스템 저장 (임시)

**필요 작업**:
- [ ] AWS S3 버킷 생성
- [ ] `@aws-sdk/client-s3` 설치
- [ ] 파일 업로드 S3 연동
- [ ] 서명된 URL 생성 (다운로드)
- [ ] 파일 용량 제한 (50MB)
- [ ] 이미지 리사이징 (Sharp)
- [ ] CDN 연동 (CloudFront)

### 4. 이메일 알림 (0%)
**상태**: 미구현

**필요 기능**:
- [ ] 가입 인증 메일
- [ ] 비밀번호 재설정
- [ ] 스터디 초대 메일
- [ ] 중요 알림 메일

**추천 라이브러리**:
- Resend (resend.com)
- SendGrid
- Nodemailer + AWS SES

---

## 🔴 미구현 기능

### 1. 고급 검색 (0%)
```
❌ GET /api/studies/search?q=keyword&filters={...}
❌ GET /api/users/search?q=keyword
❌ GET /api/studies/{id}/chat/search?q=keyword
❌ GET /api/studies/{id}/files/search?q=keyword
```

### 2. 화상회의 (0%)
```
❌ WebRTC 시그널링 서버
❌ TURN/STUN 서버 설정
❌ Jitsi/Zoom API 연동
```

### 3. 결제 시스템 (0%)
```
❌ 프리미엄 기능 (설계 외)
❌ Stripe/PG 연동
```

### 4. 푸시 알림 (0%)
```
❌ Firebase Cloud Messaging
❌ 브라우저 Push API
❌ 모바일 푸시 (향후)
```

### 5. 로그 시스템 (30%)
**상태**: Winston 설치됨, 로그 수집 미구현
```
⚠️ Winston Logger 설정됨
❌ 로그 파일 저장
❌ 에러 추적 (Sentry)
❌ 성능 모니터링
```

---

## 📋 우선순위별 작업 체크리스트

## 🔥 Phase 1: 핵심 기능 완성 (1-2주)

### A. Socket.io 실시간 통신 활성화
**중요도**: ⭐⭐⭐⭐⭐ (최우선)

- [ ] **서버 설정**
  - [ ] `server.mjs` 커스텀 서버 활성화
  - [ ] Socket.io 서버 초기화 코드 연결
  - [ ] 환경 변수 `SOCKET_PORT` 추가
  
- [ ] **프론트엔드 연결**
  - [ ] `socket.io-client` 설정
  - [ ] Context Provider 생성 (`SocketProvider`)
  - [ ] 채팅 페이지에 실시간 연동
  - [ ] 온라인 상태 표시 UI
  - [ ] 타이핑 인디케이터 UI

- [ ] **테스트**
  - [ ] 실시간 메시지 송수신
  - [ ] 여러 브라우저 동시 테스트
  - [ ] 재연결 로직 검증

**예상 작업 시간**: 3-4일

### B. 파일 저장소 연동 (S3)
**중요도**: ⭐⭐⭐⭐

- [ ] **AWS S3 설정**
  - [ ] S3 버킷 생성 (예: `coup-files-prod`)
  - [ ] IAM 사용자 생성 및 권한 설정
  - [ ] CORS 설정
  
- [ ] **백엔드 구현**
  - [ ] `@aws-sdk/client-s3` 설치
  - [ ] 파일 업로드 함수 작성
  - [ ] 서명된 URL 생성 함수
  - [ ] `/api/studies/{id}/files` 수정
  - [ ] 파일 삭제 시 S3에서도 삭제
  
- [ ] **이미지 처리 (선택)**
  - [ ] Sharp 설치
  - [ ] 썸네일 생성
  - [ ] 이미지 리사이징

**예상 작업 시간**: 2-3일

### C. 미완성 API 엔드포인트 구현
**중요도**: ⭐⭐⭐⭐

- [ ] **사용자 API**
  - [ ] `GET /api/users?q=keyword` - 사용자 검색
  - [ ] `GET /api/users/{userId}` - 사용자 프로필
  - [ ] `DELETE /api/users/me` - 계정 삭제
  
- [ ] **스터디 API**
  - [ ] `POST /api/studies/{id}/invite` - 초대 코드 생성
  
- [ ] **채팅 API**
  - [ ] `GET /api/studies/{id}/chat/search` - 메시지 검색
  
- [ ] **파일 API**
  - [ ] `POST /api/studies/{id}/files/folders` - 폴더 생성
  - [ ] `PATCH /api/studies/{id}/files/{fileId}/move` - 파일 이동
  
- [ ] **캘린더 API**
  - [ ] `POST /api/studies/{id}/calendar/{eventId}/attend` - 참석 표시
  
- [ ] **할일 API**
  - [ ] `GET /api/tasks/stats` - 통계

**예상 작업 시간**: 3-4일

### D. 페이지네이션 표준화
**중요도**: ⭐⭐⭐

- [ ] **일관된 페이지네이션 적용**
  - [ ] 모든 목록 API에 `page`, `limit` 파라미터
  - [ ] 응답 형식 표준화
    ```json
    {
      "data": [...],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 100,
        "totalPages": 5
      }
    }
    ```
  
- [ ] **대상 API**
  - [ ] `/api/studies`
  - [ ] `/api/notifications`
  - [ ] `/api/tasks`
  - [ ] `/api/admin/users`
  - [ ] `/api/admin/studies`
  - [ ] `/api/admin/reports`

**예상 작업 시간**: 1일

---

## ⚡ Phase 2: 고급 기능 추가 (2-3주)

### A. OAuth 소셜 로그인
**중요도**: ⭐⭐⭐⭐

- [ ] **Google OAuth**
  - [ ] Google Cloud Console 프로젝트 생성
  - [ ] OAuth 2.0 클라이언트 ID 발급
  - [ ] 승인된 리디렉션 URI 설정
  - [ ] `.env` 변수 추가
  - [ ] NextAuth Provider 활성화
  - [ ] 프론트엔드 버튼 추가
  
- [ ] **GitHub OAuth**
  - [ ] GitHub OAuth App 등록
  - [ ] Client ID/Secret 발급
  - [ ] Provider 활성화
  - [ ] 프론트엔드 버튼 추가

**예상 작업 시간**: 2일

### B. 이메일 알림 시스템
**중요도**: ⭐⭐⭐

- [ ] **이메일 서비스 선택 및 설정**
  - [ ] Resend 계정 생성 (추천)
  - [ ] API 키 발급
  - [ ] 도메인 인증
  - [ ] `resend` 패키지 설치
  
- [ ] **이메일 템플릿 작성**
  - [ ] 회원가입 환영 메일
  - [ ] 비밀번호 재설정
  - [ ] 스터디 초대
  - [ ] 중요 알림
  
- [ ] **API 구현**
  - [ ] `POST /api/auth/forgot-password`
  - [ ] `POST /api/auth/reset-password`
  - [ ] 이메일 전송 헬퍼 함수
  
- [ ] **큐 시스템 (선택)**
  - [ ] Bull Queue + Redis
  - [ ] 이메일 발송 작업 큐잉

**예상 작업 시간**: 3-4일

### C. 고급 검색 기능
**중요도**: ⭐⭐⭐

- [ ] **스터디 검색 고도화**
  - [ ] 전체 텍스트 검색 (Prisma fullTextSearch)
  - [ ] 다중 필터 (카테고리, 태그, 난이도)
  - [ ] 정렬 옵션 (인기순, 최신순, 평점순)
  
- [ ] **사용자 검색**
  - [ ] 이름, 이메일 검색
  - [ ] 역할 필터
  
- [ ] **메시지 검색**
  - [ ] 스터디 내 메시지 검색
  - [ ] 날짜 범위 필터
  
- [ ] **파일 검색**
  - [ ] 파일명 검색
  - [ ] 타입 필터

**예상 작업 시간**: 3-4일

### D. 알림 고도화
**중요도**: ⭐⭐⭐

- [ ] **알림 설정 관리**
  - [ ] `GET /api/notifications/settings`
  - [ ] `PATCH /api/notifications/settings`
  - [ ] 알림 타입별 ON/OFF
  - [ ] 이메일 알림 수신 여부
  
- [ ] **브라우저 푸시 알림**
  - [ ] Web Push API 연동
  - [ ] Service Worker 등록
  - [ ] 구독 관리
  
- [ ] **실시간 알림**
  - [ ] Socket.io로 즉시 푸시
  - [ ] 읽지 않은 알림 배지

**예상 작업 시간**: 3-4일

---

## 🚀 Phase 3: 성능 최적화 및 안정화 (2주)

### A. 데이터베이스 최적화
**중요도**: ⭐⭐⭐⭐

- [ ] **인덱스 최적화**
  - [ ] 자주 쿼리하는 필드 인덱스 추가
  - [ ] 복합 인덱스 검토
  - [ ] `prisma migrate` 실행
  
- [ ] **쿼리 최적화**
  - [ ] N+1 문제 해결 (`include` → `select`)
  - [ ] Prisma Relation 최적화
  - [ ] 불필요한 필드 제외
  
- [ ] **연결 풀링**
  - [ ] PgBouncer 설정 (프로덕션)
  - [ ] Prisma 연결 설정 최적화

**예상 작업 시간**: 2-3일

### B. 캐싱 전략
**중요도**: ⭐⭐⭐⭐

- [ ] **Redis 캐싱**
  - [ ] Redis 서버 설정
  - [ ] 캐싱 레이어 구현
  - [ ] 자주 조회되는 데이터 캐싱
    - 스터디 목록
    - 사용자 프로필
    - 통계 데이터
  
- [ ] **Next.js 캐싱**
  - [ ] `revalidate` 옵션 설정
  - [ ] ISR (Incremental Static Regeneration)
  - [ ] Route Handler 캐싱

**예상 작업 시간**: 2-3일

### C. 에러 처리 및 로깅
**중요도**: ⭐⭐⭐⭐

- [ ] **통합 에러 핸들러**
  - [ ] API 에러 미들웨어
  - [ ] 일관된 에러 응답 형식
  - [ ] 에러 코드 정의
  
- [ ] **로그 시스템**
  - [ ] Winston Logger 활성화
  - [ ] 로그 레벨 설정 (info, warn, error)
  - [ ] 로그 파일 저장 (일별 로테이션)
  
- [ ] **모니터링 (선택)**
  - [ ] Sentry 연동 (에러 추적)
  - [ ] New Relic/DataDog (성능 모니터링)

**예상 작업 시간**: 2-3일

### D. 보안 강화
**중요도**: ⭐⭐⭐⭐⭐

- [ ] **Rate Limiting**
  - [ ] API 요청 제한 (예: 100req/min)
  - [ ] `express-rate-limit` 또는 Upstash Redis
  
- [ ] **입력 검증**
  - [ ] Zod 스키마 모든 API에 적용
  - [ ] SQL Injection 방어 (Prisma 자동)
  - [ ] XSS 방어
  
- [ ] **CORS 설정**
  - [ ] 허용 도메인 명시
  - [ ] Credentials 설정
  
- [ ] **환경 변수 보안**
  - [ ] `.env` 파일 관리
  - [ ] Secrets Manager (프로덕션)
  
- [ ] **HTTPS 강제**
  - [ ] Redirect HTTP → HTTPS
  - [ ] HSTS 헤더

**예상 작업 시간**: 2-3일

### E. 테스트 작성
**중요도**: ⭐⭐⭐

- [ ] **API 테스트**
  - [ ] Jest + Supertest 설정
  - [ ] 주요 API 엔드포인트 테스트
  - [ ] 인증/인가 테스트
  
- [ ] **통합 테스트**
  - [ ] 데이터베이스 테스트 환경
  - [ ] Mock 데이터 생성
  
- [ ] **E2E 테스트 (선택)**
  - [ ] Playwright/Cypress
  - [ ] 주요 사용자 플로우 테스트

**예상 작업 시간**: 5-7일

---

## 🌐 Phase 4: 프로덕션 배포 준비 (1주)

### A. 배포 환경 설정
**중요도**: ⭐⭐⭐⭐⭐

- [ ] **호스팅 선택**
  - [ ] Vercel (Next.js 최적화)
  - [ ] Railway (PostgreSQL + Redis 포함)
  - [ ] AWS EC2 + RDS (직접 관리)
  
- [ ] **데이터베이스**
  - [ ] PostgreSQL 프로덕션 인스턴스
  - [ ] 백업 설정 (일일 자동 백업)
  - [ ] 연결 문자열 환경 변수
  
- [ ] **Redis**
  - [ ] Upstash Redis (서버리스)
  - [ ] Redis Labs
  - [ ] AWS ElastiCache
  
- [ ] **도메인 설정**
  - [ ] 도메인 구매 (예: coup.io)
  - [ ] DNS 설정
  - [ ] SSL 인증서 (자동 - Vercel/Let's Encrypt)

**예상 작업 시간**: 2-3일

### B. 환경 변수 관리
**중요도**: ⭐⭐⭐⭐⭐

```env
# 프로덕션 .env
NODE_ENV=production
NEXTAUTH_URL=https://coup.io
NEXTAUTH_SECRET=랜덤_64자_이상_문자열

DATABASE_URL=postgresql://...
REDIS_URL=redis://...

AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=coup-files-prod
AWS_REGION=ap-northeast-2

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

RESEND_API_KEY=...
```

- [ ] **환경 변수 체크리스트**
  - [ ] 모든 Secret 프로덕션 값으로 변경
  - [ ] API 키 발급 및 설정
  - [ ] 호스팅 플랫폼에 환경 변수 등록

**예상 작업 시간**: 1일

### C. CI/CD 파이프라인
**중요도**: ⭐⭐⭐

- [ ] **GitHub Actions**
  - [ ] 자동 테스트 실행
  - [ ] 자동 빌드
  - [ ] 자동 배포 (Vercel/Railway)
  
- [ ] **배포 전략**
  - [ ] Preview 배포 (PR마다)
  - [ ] 프로덕션 배포 (main 브랜치)
  - [ ] 롤백 전략

**예상 작업 시간**: 2일

### D. 성능 측정 및 모니터링
**중요도**: ⭐⭐⭐⭐

- [ ] **Lighthouse 점수 최적화**
  - [ ] Performance > 90
  - [ ] SEO > 90
  - [ ] Accessibility > 90
  
- [ ] **모니터링 도구 설정**
  - [ ] Vercel Analytics
  - [ ] Sentry (에러 추적)
  - [ ] Uptime 모니터링

**예상 작업 시간**: 1-2일

---

## 📊 작업 우선순위 요약

### 🔴 긴급 (1-2주 내)
1. ✅ Socket.io 실시간 통신 활성화
2. ✅ 파일 저장소 S3 연동
3. ✅ 미완성 API 엔드포인트 구현
4. ✅ 페이지네이션 표준화

### 🟠 중요 (2-4주 내)
5. ⚠️ OAuth 소셜 로그인
6. ⚠️ 이메일 알림 시스템
7. ⚠️ 고급 검색 기능
8. ⚠️ 데이터베이스 최적화
9. ⚠️ 보안 강화

### 🟡 일반 (4-6주 내)
10. ⭐ 캐싱 전략
11. ⭐ 에러 처리 및 로깅
12. ⭐ 알림 고도화
13. ⭐ 테스트 작성

### 🟢 추후 (6주 이후)
14. 💡 화상회의 기능
15. 💡 브라우저 푸시 알림
16. 💡 결제 시스템 (프리미엄)
17. 💡 모바일 앱 (React Native)

---

## 🎯 즉시 시작 가능한 작업 (오늘부터)

### Task 1: Socket.io 활성화 (최우선)
```bash
# 1. 커스텀 서버 활성화
# server.mjs 파일 확인 및 수정

# 2. 프론트엔드 Socket Provider 생성
# coup/src/contexts/SocketContext.js

# 3. 채팅 페이지 실시간 연동
# coup/src/app/my-studies/[studyId]/chat/page.js
```

### Task 2: AWS S3 설정
```bash
# 1. AWS 콘솔에서 S3 버킷 생성
# 2. IAM 사용자 권한 설정
# 3. npm install @aws-sdk/client-s3
# 4. /api/studies/[id]/files/route.js 수정
```

### Task 3: 미완성 API 구현
```bash
# 우선순위 순서:
# 1. GET /api/users?q=keyword
# 2. POST /api/studies/{id}/invite
# 3. GET /api/studies/{id}/chat/search
# 4. POST /api/studies/{id}/files/folders
```

---

## 📝 개발 가이드라인

### API 개발 표준
```javascript
// 1. 인증 확인
const session = await requireAuth()
if (session instanceof NextResponse) return session

// 2. 입력 검증 (Zod)
const schema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email()
})
const validated = schema.parse(body)

// 3. 비즈니스 로직
const result = await prisma.model.create({ ... })

// 4. 응답
return NextResponse.json({
  success: true,
  data: result
})

// 5. 에러 처리
catch (error) {
  console.error('Error:', error)
  return NextResponse.json(
    { error: "에러 메시지" },
    { status: 500 }
  )
}
```

### Git Commit 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
style: 코드 포맷팅
docs: 문서 수정
test: 테스트 코드
chore: 빌드, 패키지 등
```

### 브랜치 전략
```
main        - 프로덕션
develop     - 개발
feature/*   - 기능 개발
hotfix/*    - 긴급 수정
```

---

## 📞 기술 지원 및 참고 자료

### 공식 문서
- Next.js 16: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- NextAuth.js: https://next-auth.js.org
- Socket.io: https://socket.io/docs/v4

### 커뮤니티
- Next.js Discord
- Stack Overflow
- GitHub Discussions

---

## ✅ 완료 체크

작업 완료 시 체크:
- [ ] Phase 1 완료 (핵심 기능)
- [ ] Phase 2 완료 (고급 기능)
- [ ] Phase 3 완료 (최적화)
- [ ] Phase 4 완료 (배포)

**최종 목표**: 프로덕션 레디 상태 달성

**예상 총 작업 기간**: 6-8주 (1명 풀타임 기준)

---

_작성: 2025-11-18_  
_다음 업데이트: 작업 진행에 따라 수시 갱신_

