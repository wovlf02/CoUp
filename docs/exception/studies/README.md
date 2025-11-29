# 스터디 관리 예외 처리 (Studies Exception Handling)

**작성일**: 2025-11-29  
**버전**: 1.0.0  
**상태**: ✅ 완료

---

## 📋 목차

- [개요](#개요)
- [주요 기능](#주요-기능)
- [아키텍처](#아키텍처)
- [API 엔드포인트](#api-엔드포인트)
- [데이터베이스 스키마](#데이터베이스-스키마)
- [주요 컴포넌트](#주요-컴포넌트)
- [예외 처리 개요](#예외-처리-개요)
- [빠른 참조](#빠른-참조)
- [관련 문서](#관련-문서)

---

## 개요

스터디 관리(Studies) 영역은 CoUp 플랫폼의 핵심 기능으로, 사용자가 스터디를 생성, 탐색, 가입, 관리하는 모든 기능을 포함합니다.

### 핵심 개념

- **스터디 탐색 (Explore)**: 공개 스터디 검색 및 필터링
- **스터디 상세 (Detail)**: 스터디 정보 조회 및 관리
- **멤버 관리 (Members)**: 멤버 추가/제거, 역할 변경
- **가입/탈퇴 (Join/Leave)**: 스터디 가입 요청 및 탈퇴
- **권한 관리 (Permissions)**: OWNER, ADMIN, MEMBER 역할별 권한

### 주요 통계

- **API 엔드포인트**: 20개
- **주요 컴포넌트**: 15개 이상
- **데이터베이스 테이블**: Study, StudyMember, JoinRequest
- **권한 레벨**: 3단계 (OWNER, ADMIN, MEMBER)

---

## 주요 기능

### 1. 스터디 CRUD

#### 생성 (Create)
```javascript
POST /api/studies
```
- 스터디 생성
- 필수 필드 검증
- 소유자 자동 설정
- 초대 코드 생성

#### 조회 (Read)
```javascript
GET /api/studies              # 목록 조회
GET /api/studies/:id          # 상세 조회
```
- 공개/비공개 필터링
- 카테고리별 필터링
- 검색 및 정렬
- 페이지네이션

#### 수정 (Update)
```javascript
PATCH /api/studies/:id
```
- 기본 정보 수정
- 설정 변경
- 이미지 업로드
- 권한 검증 (OWNER 전용)

#### 삭제 (Delete)
```javascript
DELETE /api/studies/:id
```
- 스터디 삭제
- 관련 데이터 정리
- 권한 검증 (OWNER 전용)

### 2. 멤버 관리

#### 멤버 목록
```javascript
GET /api/studies/:id/members
```
- 활성 멤버 조회
- 역할별 필터링
- 상태별 필터링

#### 멤버 추가
```javascript
POST /api/studies/:id/invite
```
- 초대 링크 생성
- 이메일 초대
- 권한 검증 (OWNER, ADMIN)

#### 멤버 제거
```javascript
DELETE /api/studies/:id/members/:userId
```
- 멤버 강제 퇴출
- 권한 검증
- 알림 발송

#### 역할 변경
```javascript
PATCH /api/studies/:id/members/:userId/role
```
- MEMBER ↔ ADMIN 변경
- OWNER 권한 이전
- 권한 검증

### 3. 가입/탈퇴

#### 가입 요청
```javascript
POST /api/studies/:id/join
```
- 가입 신청
- 자동 승인/수동 승인
- 정원 확인
- 중복 가입 방지

#### 가입 승인
```javascript
POST /api/studies/:id/join-requests/:requestId/approve
```
- 가입 요청 승인
- 멤버 상태 변경
- 알림 발송

#### 가입 거절
```javascript
POST /api/studies/:id/join-requests/:requestId/reject
```
- 가입 요청 거절
- 거절 사유 기록
- 알림 발송

#### 스터디 탈퇴
```javascript
DELETE /api/studies/:id/leave
```
- 멤버 탈퇴
- OWNER 탈퇴 방지
- 데이터 정리

### 4. 부가 기능

#### 공지사항
```javascript
GET    /api/studies/:id/notices
POST   /api/studies/:id/notices
PATCH  /api/studies/:id/notices/:noticeId
DELETE /api/studies/:id/notices/:noticeId
POST   /api/studies/:id/notices/:noticeId/pin
```

#### 파일 관리
```javascript
GET    /api/studies/:id/files
POST   /api/studies/:id/files
DELETE /api/studies/:id/files/:fileId
```

#### 캘린더
```javascript
GET    /api/studies/:id/calendar
POST   /api/studies/:id/calendar
PATCH  /api/studies/:id/calendar/:eventId
DELETE /api/studies/:id/calendar/:eventId
```

---

## 아키텍처

### 데이터 흐름

```
사용자 요청
    ↓
페이지 컴포넌트 (src/app/studies/)
    ↓
React Query Hooks (useStudies, useStudy)
    ↓
API Routes (src/app/api/studies/)
    ↓
Auth Helpers (requireAuth, requireStudyMember)
    ↓
Prisma ORM
    ↓
PostgreSQL 데이터베이스
```

### 권한 체크 흐름

```
requireAuth (세션 확인)
    ↓
requireStudyMember (멤버십 확인)
    ↓
역할별 권한 검증
    ↓
    - OWNER: 모든 권한
    - ADMIN: 멤버 관리, 콘텐츠 관리
    - MEMBER: 읽기, 참여
```

---

## API 엔드포인트

### 스터디 기본

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/studies` | 스터디 목록 조회 | 공개 |
| POST | `/api/studies` | 스터디 생성 | 인증 |
| GET | `/api/studies/:id` | 스터디 상세 조회 | 조건부* |
| PATCH | `/api/studies/:id` | 스터디 수정 | OWNER |
| DELETE | `/api/studies/:id` | 스터디 삭제 | OWNER |

\*공개 스터디는 누구나, 비공개는 멤버만

### 멤버 관리

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/studies/:id/members` | 멤버 목록 | MEMBER |
| DELETE | `/api/studies/:id/members/:userId` | 멤버 제거 | OWNER/ADMIN |
| PATCH | `/api/studies/:id/members/:userId/role` | 역할 변경 | OWNER |

### 가입/탈퇴

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| POST | `/api/studies/:id/join` | 가입 요청 | 인증 |
| DELETE | `/api/studies/:id/leave` | 스터디 탈퇴 | MEMBER |
| GET | `/api/studies/:id/join-requests` | 가입 요청 목록 | OWNER/ADMIN |
| POST | `/api/studies/:id/join-requests/:id/approve` | 가입 승인 | OWNER/ADMIN |
| POST | `/api/studies/:id/join-requests/:id/reject` | 가입 거절 | OWNER/ADMIN |

### 초대

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| POST | `/api/studies/:id/invite` | 초대 링크 생성 | OWNER/ADMIN |

### 공지사항

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/studies/:id/notices` | 공지 목록 | MEMBER |
| POST | `/api/studies/:id/notices` | 공지 작성 | OWNER/ADMIN |
| PATCH | `/api/studies/:id/notices/:noticeId` | 공지 수정 | OWNER/ADMIN |
| DELETE | `/api/studies/:id/notices/:noticeId` | 공지 삭제 | OWNER/ADMIN |
| POST | `/api/studies/:id/notices/:noticeId/pin` | 공지 고정 | OWNER/ADMIN |

### 파일

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/studies/:id/files` | 파일 목록 | MEMBER |
| POST | `/api/studies/:id/files` | 파일 업로드 | MEMBER |
| DELETE | `/api/studies/:id/files/:fileId` | 파일 삭제 | OWNER/ADMIN/작성자 |

### 캘린더

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/studies/:id/calendar` | 일정 목록 | MEMBER |
| POST | `/api/studies/:id/calendar` | 일정 추가 | OWNER/ADMIN |
| PATCH | `/api/studies/:id/calendar/:eventId` | 일정 수정 | OWNER/ADMIN |
| DELETE | `/api/studies/:id/calendar/:eventId` | 일정 삭제 | OWNER/ADMIN |

---

## 데이터베이스 스키마

### Study 테이블

```prisma
model Study {
  id            String   @id @default(cuid())
  name          String
  emoji         String?
  description   String
  category      String
  subCategory   String?
  tags          String[]
  maxMembers    Int      @default(10)
  isPublic      Boolean  @default(true)
  isRecruiting  Boolean  @default(true)
  autoApprove   Boolean  @default(false)
  inviteCode    String   @unique
  rating        Float    @default(0)
  reviewCount   Int      @default(0)
  ownerId       String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  owner         User     @relation("OwnedStudies", fields: [ownerId], references: [id])
  members       StudyMember[]
  notices       Notice[]
  files         File[]
  calendar      CalendarEvent[]
}
```

### StudyMember 테이블

```prisma
model StudyMember {
  id           String   @id @default(cuid())
  studyId      String
  userId       String
  role         Role     @default(MEMBER)  // OWNER | ADMIN | MEMBER
  status       Status   @default(PENDING) // ACTIVE | PENDING | LEFT | KICKED
  introduction String?
  motivation   String?
  level        String?
  joinedAt     DateTime @default(now())
  approvedAt   DateTime?
  
  // Relations
  study        Study    @relation(fields: [studyId], references: [id])
  user         User     @relation(fields: [userId], references: [id])
  
  @@unique([studyId, userId])
}
```

### 역할 (Role)

- **OWNER**: 스터디 소유자 (1명)
  - 모든 권한
  - 스터디 삭제
  - 소유권 이전
  - 멤버 관리
  
- **ADMIN**: 관리자 (여러 명 가능)
  - 멤버 관리 (추가/제거)
  - 콘텐츠 관리 (공지, 파일, 일정)
  - 설정 변경 (일부)
  
- **MEMBER**: 일반 멤버
  - 콘텐츠 읽기
  - 댓글 작성
  - 파일 업로드
  - 일정 참여

### 상태 (Status)

- **ACTIVE**: 활성 멤버
- **PENDING**: 가입 승인 대기
- **LEFT**: 자진 탈퇴
- **KICKED**: 강제 퇴출

---

## 주요 컴포넌트

### 페이지 컴포넌트

| 파일 | 경로 | 설명 |
|------|------|------|
| `page.jsx` | `src/app/studies/` | 스터디 탐색 페이지 |
| `page.jsx` | `src/app/studies/create/` | 스터디 생성 페이지 |
| `page.jsx` | `src/app/studies/[studyId]/` | 스터디 상세 페이지 |

### UI 컴포넌트

| 파일 | 설명 |
|------|------|
| `StudyHeader.jsx` | 스터디 헤더 (이름, 설명, 액션) |
| `StudySidebar.jsx` | 스터디 사이드바 (위젯들) |
| `StudiesEmptyState.jsx` | 빈 상태 UI |
| `StudiesSkeleton.jsx` | 로딩 스켈레톤 |
| `NoticeCreateEditModal.jsx` | 공지 작성/수정 모달 |
| `MarkdownRenderer.jsx` | 마크다운 렌더러 |

### 사이드바 위젯

| 파일 | 설명 |
|------|------|
| `StatsWidget.jsx` | 통계 위젯 |
| `OnlineMembersWidget.jsx` | 온라인 멤버 |
| `QuickActionsWidget.jsx` | 빠른 액션 |
| `UrgentTasksWidget.jsx` | 긴급 할일 |
| `PinnedNoticeWidget.jsx` | 고정 공지 |
| `MyActivityWidget.jsx` | 내 활동 |
| `UpcomingEventsWidget.jsx` | 다가오는 일정 |

### React Query Hooks

| Hook | 설명 |
|------|------|
| `useStudies(params)` | 스터디 목록 조회 |
| `useStudy(id)` | 스터디 상세 조회 |
| `useCreateStudy()` | 스터디 생성 |
| `useUpdateStudy(id)` | 스터디 수정 |
| `useDeleteStudy(id)` | 스터디 삭제 |
| `useJoinStudy(id)` | 스터디 가입 |
| `useLeaveStudy(id)` | 스터디 탈퇴 |
| `useStudyMembers(id)` | 멤버 목록 조회 |

---

## 예외 처리 개요

### 주요 예외 카테고리

1. **스터디 CRUD 예외** → [01-study-crud-exceptions.md](./01-study-crud-exceptions.md)
   - 생성 실패
   - 조회 실패
   - 수정 실패
   - 삭제 실패
   - 유효성 검사 오류

2. **멤버 관리 예외** → [02-member-management-exceptions.md](./02-member-management-exceptions.md)
   - 멤버 추가/제거 실패
   - 역할 변경 실패
   - 권한 부족

3. **가입/탈퇴 예외** → [03-join-leave-exceptions.md](./03-join-leave-exceptions.md)
   - 가입 요청 실패
   - 정원 초과
   - 중복 가입
   - 탈퇴 실패

4. **설정 관리 예외** → [04-settings-exceptions.md](./04-settings-exceptions.md)
   - 설정 업데이트 실패
   - 공개/비공개 전환
   - 이미지 업로드

5. **권한 관리 예외** → [05-permissions-exceptions.md](./05-permissions-exceptions.md)
   - 권한 부족
   - 역할별 제한
   - 소유권 이전

6. **검색/필터 예외** → [06-search-filter-exceptions.md](./06-search-filter-exceptions.md)
   - 검색 실패
   - 필터링 오류
   - 정렬 문제

7. **실시간 동기화 예외** → [07-real-time-sync-exceptions.md](./07-real-time-sync-exceptions.md)
   - 데이터 동기화
   - 캐시 무효화
   - 낙관적 업데이트

8. **UI/UX 예외** → [08-ui-ux-exceptions.md](./08-ui-ux-exceptions.md)
   - 로딩 상태
   - 에러 상태
   - 빈 상태

9. **성능 최적화** → [09-performance-optimization.md](./09-performance-optimization.md)
   - 쿼리 최적화
   - 렌더링 최적화
   - 메모리 관리

10. **모범 사례** → [99-best-practices.md](./99-best-practices.md)
    - 에러 핸들링 패턴
    - 보안 고려사항
    - 테스트 전략

---

## 빠른 참조

### 자주 발생하는 오류

| 오류 메시지 | 원인 | 해결 방법 |
|------------|------|----------|
| "스터디를 찾을 수 없습니다" | 잘못된 ID | ID 확인 |
| "권한이 없습니다" | 권한 부족 | 역할 확인 |
| "정원이 마감되었습니다" | 최대 인원 초과 | 정원 확인 |
| "이미 가입된 스터디입니다" | 중복 가입 | 멤버십 확인 |
| "스터디장은 탈퇴할 수 없습니다" | OWNER 탈퇴 시도 | 소유권 이전 |

### 디버깅 체크리스트

```javascript
// 1. 세션 확인
console.log('Session:', session)

// 2. 멤버십 확인
console.log('Member:', await prisma.studyMember.findUnique({
  where: { studyId_userId: { studyId, userId } }
}))

// 3. 권한 확인
console.log('Role:', member.role)

// 4. 스터디 상태 확인
console.log('Study:', await prisma.study.findUnique({
  where: { id: studyId }
}))

// 5. 정원 확인
console.log('Members:', study._count.members, '/', study.maxMembers)
```

---

## 관련 문서

### 내부 문서

- [색인 (INDEX)](./INDEX.md) - 증상별/카테고리별 찾기
- [인증 예외 처리](../auth/README.md) - 인증 관련
- [대시보드 예외 처리](../dashboard/README.md) - 대시보드 관련

### 외부 참조

- [Prisma 공식 문서](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Query](https://tanstack.com/query/latest)

---

## 문서 업데이트 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-11-29 | 1.0.0 | 초기 작성 |

---

**다음 문서**: [색인 (INDEX)](./INDEX.md)

