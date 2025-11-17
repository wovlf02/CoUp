# 백엔드 구현 완료 기준 및 검증 가이드

> **목적**: 각 Phase 완료 기준 명확화 및 검증 방법  
> **작성일**: 2025-11-18

---

## ✅ Phase 0: 환경 설정 완료 기준

### 완료 조건
- [ ] PostgreSQL 서비스가 실행 중
- [ ] 데이터베이스 `coup` 생성됨
- [ ] `npx prisma migrate status` 명령 성공
- [ ] Seed 데이터 최소 3명 사용자, 2개 스터디 존재
- [ ] `test-db.js` 스크립트 실행 성공

### 검증 방법
```bash
# PostgreSQL 실행 확인 (Docker)
docker ps | grep coup-postgres

# Prisma 상태 확인
npx prisma migrate status

# 데이터 확인
node test-db.js
```

### 예상 출력
```
✅ Users: 3
✅ Studies: 2
✅ Study Members: 3
```

---

## ✅ Phase 1: 인증 시스템 완료 기준

### 완료 조건
- [ ] 회원가입 API 동작
- [ ] 로그인 성공 및 세션 생성
- [ ] 보호된 라우트 리다이렉트 동작
- [ ] 관리자 권한 확인 동작
- [ ] 로그아웃 동작

### 검증 방법

**1. 회원가입 테스트**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "password123",
    "name": "테스트"
  }'
```
**기대 응답**: `{ "success": true, "user": {...} }`

**2. 로그인 테스트**
- 브라우저에서 `/sign-in` 접속
- 생성한 계정으로 로그인
- `/dashboard`로 리다이렉트 확인

**3. 보호된 라우트 테스트**
- 로그아웃 상태에서 `/dashboard` 접속
- `/sign-in`으로 리다이렉트 확인

**4. 세션 확인**
```bash
curl http://localhost:3000/api/users/me \
  -H "Cookie: next-auth.session-token=..."
```
**기대 응답**: `{ "user": { "id": "...", "email": "...", ... } }`

---

## ✅ Phase 2: 사용자 기능 완료 기준

### 완료 조건
- [ ] `GET /api/users/me` 응답 성공
- [ ] `PATCH /api/users/me` 프로필 수정 성공
- [ ] `GET /api/dashboard` 통계 + 스터디 목록 반환
- [ ] `GET /api/my-studies` 내 스터디 목록 반환
- [ ] 프론트엔드 대시보드 페이지에서 API 데이터 표시

### 검증 방법

**1. API 테스트**
```bash
# 내 정보
curl http://localhost:3000/api/users/me -H "Cookie: ..."

# 프로필 수정
curl -X PATCH http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{"name": "새이름", "bio": "새소개"}'

# 대시보드
curl http://localhost:3000/api/dashboard -H "Cookie: ..."

# 내 스터디
curl http://localhost:3000/api/my-studies -H "Cookie: ..."
```

**2. 프론트엔드 확인**
- `/dashboard` 페이지 열기
- 통계 카드 4개 표시 (참여 스터디, 새 공지, 할일, 일정)
- 내 스터디 카드 표시
- 최근 활동 표시
- Mock 데이터 아닌 실제 DB 데이터 확인

---

## ✅ Phase 3: 스터디 핵심 기능 완료 기준

### 완료 조건
- [ ] 스터디 목록 조회 (검색/필터 포함)
- [ ] 스터디 생성 성공 (초대 코드 자동 생성)
- [ ] 스터디 상세 조회 (멤버 여부에 따라 정보 제한)
- [ ] 스터디 가입 신청 (자동/수동 승인 분기)
- [ ] 가입 승인/거절 동작 (ADMIN+)
- [ ] 멤버 역할 변경 (OWNER)
- [ ] 멤버 강퇴 동작 (ADMIN+)
- [ ] 스터디 탈퇴 동작

### 검증 방법

**1. 스터디 생성**
```bash
curl -X POST http://localhost:3000/api/studies \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{
    "name": "새 스터디",
    "emoji": "📚",
    "description": "테스트 스터디",
    "category": "프로그래밍",
    "maxMembers": 20,
    "isPublic": true,
    "autoApprove": false
  }'
```
**확인**: `inviteCode` 자동 생성, 생성자가 OWNER로 추가

**2. 스터디 가입**
```bash
curl -X POST http://localhost:3000/api/studies/{studyId}/join \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{
    "introduction": "가입 인사",
    "motivation": "학습",
    "level": "중급"
  }'
```
**확인**:
- `autoApprove: true` → status: ACTIVE
- `autoApprove: false` → status: PENDING

**3. 가입 승인**
```bash
curl -X POST http://localhost:3000/api/studies/{studyId}/members/{userId}/approve \
  -H "Cookie: ..." (ADMIN 계정)
```

**4. 프론트엔드 확인**
- `/studies` 페이지: 스터디 목록 표시
- `/studies/create` 페이지: 스터디 생성 폼
- `/studies/{studyId}` 페이지: 상세 정보 표시
- `/my-studies/{studyId}/members` 페이지: 멤버 관리

---

## ✅ Phase 4: 스터디 콘텐츠 완료 기준

### 완료 조건
- [ ] 공지사항 CRUD 모두 동작
- [ ] 공지 고정/해제 동작
- [ ] 캘린더 일정 CRUD 동작
- [ ] 할일 CRUD 동작
- [ ] 할일 완료/미완료 토글 동작
- [ ] 프론트엔드 각 탭에서 API 데이터 표시

### 검증 방법

**1. 공지사항**
```bash
# 생성
curl -X POST http://localhost:3000/api/studies/{studyId}/notices \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{"title": "공지 제목", "content": "내용", "isPinned": true}'

# 목록
curl http://localhost:3000/api/studies/{studyId}/notices -H "Cookie: ..."

# 고정
curl -X POST http://localhost:3000/api/studies/{studyId}/notices/{noticeId}/pin \
  -H "Cookie: ..."
```

**2. 할일**
```bash
# 생성
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{
    "studyId": "{studyId}",
    "title": "할일 제목",
    "dueDate": "2025-12-01T10:00:00Z",
    "priority": "HIGH"
  }'

# 완료 토글
curl -X PATCH http://localhost:3000/api/tasks/{taskId}/toggle \
  -H "Cookie: ..."
```

**3. 프론트엔드 확인**
- `/my-studies/{studyId}/notices` 탭: 공지 목록 표시
- `/my-studies/{studyId}/calendar` 탭: 일정 표시
- `/tasks` 페이지: 할일 목록 표시

---

## ✅ Phase 5: 채팅 완료 기준

### 완료 조건
- [ ] 메시지 목록 조회 (무한 스크롤)
- [ ] 메시지 전송 동작
- [ ] 메시지 삭제 동작
- [ ] 읽음 처리 동작
- [ ] 프론트엔드 채팅 UI에 메시지 표시
- [ ] Polling 또는 WebSocket 연결

### 검증 방법

**1. 메시지 전송**
```bash
curl -X POST http://localhost:3000/api/studies/{studyId}/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{"content": "안녕하세요!"}'
```

**2. 메시지 목록**
```bash
curl "http://localhost:3000/api/studies/{studyId}/chat?limit=50" \
  -H "Cookie: ..."
```

**3. 프론트엔드 확인**
- `/my-studies/{studyId}/chat` 탭 열기
- 메시지 입력 및 전송
- 새 메시지 표시 (Polling)
- 스크롤 시 이전 메시지 로드

---

## ✅ Phase 6: 파일 관리 완료 기준

### 완료 조건
- [ ] 파일 업로드 성공 (최대 50MB)
- [ ] 파일 목록 조회
- [ ] 파일 다운로드 동작
- [ ] 파일 삭제 동작
- [ ] 업로드 파일이 `/uploads` 또는 S3에 저장됨

### 검증 방법

**1. 파일 업로드**
```bash
curl -X POST http://localhost:3000/api/studies/{studyId}/files \
  -H "Cookie: ..." \
  -F "file=@test.pdf"
```

**2. 파일 다운로드**
```bash
curl -O http://localhost:3000/api/studies/{studyId}/files/{fileId}/download \
  -H "Cookie: ..."
```

**3. 프론트엔드 확인**
- `/my-studies/{studyId}/files` 탭
- 파일 업로드 버튼 클릭
- 파일 선택 후 업로드
- 파일 목록에 표시
- 다운로드 클릭 시 파일 다운로드

---

## ✅ Phase 7: 알림 시스템 완료 기준

### 완료 조건
- [ ] 가입 승인 시 알림 생성
- [ ] 새 공지 시 알림 생성
- [ ] 파일 업로드 시 알림 생성
- [ ] 알림 목록 조회
- [ ] 알림 읽음 처리
- [ ] 프론트엔드 헤더에 알림 배지 표시

### 검증 방법

**1. 알림 생성 확인**
- 스터디 가입 승인
- 데이터베이스에서 알림 확인
```sql
SELECT * FROM "Notification" WHERE "userId" = '...';
```

**2. 알림 API**
```bash
# 목록
curl http://localhost:3000/api/notifications -H "Cookie: ..."

# 읽음 처리
curl -X POST http://localhost:3000/api/notifications/{notificationId}/read \
  -H "Cookie: ..."

# 모두 읽음
curl -X POST http://localhost:3000/api/notifications/mark-all-read \
  -H "Cookie: ..."
```

**3. 프론트엔드 확인**
- 헤더 알림 아이콘에 배지 (빨간 숫자)
- `/notifications` 페이지에 알림 목록 표시
- 알림 클릭 시 읽음 처리

---

## ✅ Phase 8: 관리자 기능 완료 기준

### 완료 조건
- [ ] 관리자 통계 API 동작
- [ ] 사용자 목록/검색 동작
- [ ] 사용자 정지/복구 동작
- [ ] 스터디 목록/검색 동작
- [ ] 신고 목록 조회
- [ ] 신고 처리 (경고/정지/기각)
- [ ] 프론트엔드 관리자 페이지 동작

### 검증 방법

**1. 관리자 통계**
```bash
curl http://localhost:3000/api/admin/stats \
  -H "Cookie: ..." (ADMIN 계정)
```

**2. 사용자 정지**
```bash
curl -X POST http://localhost:3000/api/admin/users/{userId}/suspend \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{
    "suspendedUntil": "2025-12-01T00:00:00Z",
    "suspendReason": "부적절한 행동"
  }'
```

**3. 프론트엔드 확인**
- `/admin` 페이지: 통계 카드 표시
- `/admin/users` 페이지: 사용자 목록
- `/admin/reports` 페이지: 신고 목록
- 각 기능 동작 확인

---

## ✅ 전체 완료 기준

### Mock 데이터 제거
- [ ] `src/mocks/` 폴더 삭제 또는 비활성화
- [ ] 모든 페이지가 API 연동으로 동작
- [ ] 개발자 도구 Network 탭에서 API 요청 확인

### 프론트엔드 연동
- [ ] 27개 페이지 모두 API 데이터 사용
- [ ] 로딩 상태 표시
- [ ] 에러 핸들링
- [ ] 빈 상태 UI

### 데이터 정합성
- [ ] 사용자 생성 → 알림 X
- [ ] 스터디 생성 → 생성자 OWNER로 추가
- [ ] 가입 승인 → JOIN_APPROVED 알림 생성
- [ ] 공지 생성 → NOTICE 알림 생성 (멤버 전체)
- [ ] 파일 업로드 → FILE 알림 생성

### 성능
- [ ] 대부분 API 응답 시간 < 500ms
- [ ] 페이지 로드 시간 < 2초
- [ ] 무한 스크롤 부드럽게 동작

---

## 🐛 일반적인 문제 및 해결

### "Prisma Client not generated"
```bash
npx prisma generate
```

### "Unable to connect to database"
- PostgreSQL 서비스 실행 확인
- `DATABASE_URL` 확인
- 포트 5432 열림 확인

### "Invalid session" 오류
- 브라우저 쿠키 삭제
- `NEXTAUTH_SECRET` 확인
- 재로그인

### API 응답 없음
- 서버 재시작 (`npm run dev`)
- 콘솔 에러 확인
- Prisma 로그 확인

---

## 📊 체크리스트 요약

- [ ] Phase 0: 환경 설정
- [ ] Phase 1: 인증 시스템
- [ ] Phase 2: 사용자 기능
- [ ] Phase 3: 스터디 핵심
- [ ] Phase 4: 스터디 콘텐츠
- [ ] Phase 5: 채팅
- [ ] Phase 6: 파일
- [ ] Phase 7: 알림
- [ ] Phase 8: 관리자
- [ ] Phase 9: 최적화
- [ ] Mock 데이터 제거
- [ ] 전체 테스트

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-11-18

