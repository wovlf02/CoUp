# Study 도메인 예외 처리 시스템 분석

**프로젝트**: CoUp - Study 도메인  
**작성일**: 2025-12-01  
**Phase**: A2 - Step 1 (도메인 분석 및 설계)  
**작성자**: AI Assistant

---

## 📋 목차

1. [현재 코드 분석](#1-현재-코드-분석)
2. [API 엔드포인트 목록](#2-api-엔드포인트-목록)
3. [예외 케이스 식별](#3-예외-케이스-식별)
4. [StudyException 계층 구조 설계](#4-studyexception-계층-구조-설계)
5. [구현 우선순위](#5-구현-우선순위)
6. [예상 작업 시간](#6-예상-작업-시간)

---

## 1. 현재 코드 분석

### 1.1 기존 예외 처리 현황

#### ✅ 이미 구현된 파일

**파일**: `src/lib/exceptions/study-errors.js`
- **상태**: 기본적인 에러 처리 구현됨
- **에러 코드**: 약 40개의 에러 코드 정의
- **구조**: 단순 객체 기반 에러 정의
- **문제점**:
  - ProfileException과 같은 클래스 기반 예외가 아님
  - 에러 계층 구조 없음
  - 로깅 및 모니터링 기능 제한적
  - 컨텍스트 정보 부족

**파일**: `src/lib/validators/study-validation.js`
- **상태**: 기본 검증 함수 구현됨
- **검증 함수**: 약 10개
- **포함 내용**:
  - validateStudyCreate
  - validateStudyUpdate
  - validateNotice
  - validateTask
  - validateMessage
  - validateEvent
  - 페이지네이션 검증
- **문제점**:
  - 일부 검증 함수 누락
  - 에러 메시지 일관성 부족
  - 복잡한 비즈니스 로직 검증 미흡

**파일**: `src/lib/study-helpers.js`
- **상태**: 기본 헬퍼 함수 구현됨
- **헬퍼 함수**: 약 20개
- **포함 내용**:
  - 역할 계층 관리
  - 정원 관리
  - 멤버 상태 관리
  - 초대 코드 관리
- **문제점**:
  - 일부 비즈니스 로직 미구현
  - 트랜잭션 처리 부족
  - 에러 처리 불완전

### 1.2 API 라우트 예외 처리 현황

#### 구현 수준별 분류

**🟢 양호 (Good)**: 기본 예외 처리 + 검증
- `src/app/api/studies/route.js` (GET, POST)
- `src/app/api/studies/[id]/route.js` (GET, PATCH, DELETE)
- `src/app/api/studies/[id]/join/route.js` (POST)
- `src/app/api/studies/[id]/leave/route.js` (DELETE)

**🟡 보통 (Medium)**: 기본 예외 처리만
- `src/app/api/studies/[id]/members/route.js` (GET)
- `src/app/api/studies/[id]/join-requests/route.js` (GET)

**🔴 부족 (Poor)**: 예외 처리 미흡
- 28개 API 라우트 중 약 20개는 상세 분석 필요

### 1.3 주요 발견 사항

#### ✅ 강점

1. **기본 구조 존재**: study-errors.js로 기본 에러 정의
2. **일부 검증 구현**: validators와 helpers 존재
3. **트랜잭션 헬퍼**: transaction-helpers.js 활용
4. **Prisma 에러 처리**: handlePrismaError 함수

#### ⚠️ 약점

1. **클래스 기반 예외 부재**: ProfileException과 같은 구조화된 예외 필요
2. **에러 계층 부족**: 카테고리별 에러 분류 미흡
3. **로깅 불완전**: 구조화된 로깅 시스템 부족
4. **검증 누락**: 많은 비즈니스 로직 검증 미구현
5. **에러 코드 중복**: 일부 에러 코드가 중복되거나 불명확

---

## 2. API 엔드포인트 목록

### 2.1 전체 API 라우트 (28개)

#### 스터디 기본 CRUD (4개)
1. `GET /api/studies` - 스터디 목록 조회
2. `POST /api/studies` - 스터디 생성
3. `GET /api/studies/[id]` - 스터디 상세 조회
4. `PATCH /api/studies/[id]` - 스터디 수정
5. `DELETE /api/studies/[id]` - 스터디 삭제

#### 멤버 관리 (6개)
6. `GET /api/studies/[id]/members` - 멤버 목록 조회
7. `GET /api/studies/[id]/members/[userId]` - 멤버 상세 조회
8. `PATCH /api/studies/[id]/members/[userId]` - 멤버 정보 수정
9. `DELETE /api/studies/[id]/members/[userId]` - 멤버 강퇴
10. `POST /api/studies/[id]/members/[userId]/approve` - 가입 승인
11. `POST /api/studies/[id]/members/[userId]/reject` - 가입 거절
12. `PATCH /api/studies/[id]/members/[userId]/role` - 역할 변경

#### 가입 관리 (5개)
13. `POST /api/studies/[id]/join` - 스터디 가입 신청
14. `DELETE /api/studies/[id]/leave` - 스터디 탈퇴
15. `GET /api/studies/[id]/join-requests` - 가입 신청 목록
16. `POST /api/studies/[id]/join-requests/[requestId]/approve` - 신청 승인
17. `POST /api/studies/[id]/join-requests/[requestId]/reject` - 신청 거절
18. `GET /api/studies/[id]/check-member` - 멤버 상태 확인

#### 공지사항 (3개)
19. `GET /api/studies/[id]/notices` - 공지 목록
20. `POST /api/studies/[id]/notices` - 공지 작성
21. `GET /api/studies/[id]/notices/[noticeId]` - 공지 상세
22. `PATCH /api/studies/[id]/notices/[noticeId]` - 공지 수정
23. `DELETE /api/studies/[id]/notices/[noticeId]` - 공지 삭제
24. `POST /api/studies/[id]/notices/[noticeId]/pin` - 공지 고정

#### 파일 관리 (4개)
25. `GET /api/studies/[id]/files` - 파일 목록
26. `POST /api/studies/[id]/files` - 파일 업로드
27. `GET /api/studies/[id]/files/[fileId]` - 파일 정보
28. `DELETE /api/studies/[id]/files/[fileId]` - 파일 삭제
29. `GET /api/studies/[id]/files/[fileId]/download` - 파일 다운로드

#### 할일 관리 (3개)
30. `GET /api/studies/[id]/tasks` - 할일 목록
31. `POST /api/studies/[id]/tasks` - 할일 생성
32. `GET /api/studies/[id]/tasks/[taskId]` - 할일 상세
33. `PATCH /api/studies/[id]/tasks/[taskId]` - 할일 수정
34. `DELETE /api/studies/[id]/tasks/[taskId]` - 할일 삭제

#### 채팅 관리 (4개)
35. `GET /api/studies/[id]/chat` - 채팅 메시지 목록
36. `POST /api/studies/[id]/chat` - 메시지 전송
37. `DELETE /api/studies/[id]/chat/[messageId]` - 메시지 삭제
38. `POST /api/studies/[id]/chat/[messageId]/read` - 메시지 읽음 처리
39. `GET /api/studies/[id]/chat/search` - 메시지 검색

#### 일정 관리 (3개)
40. `GET /api/studies/[id]/calendar` - 일정 목록
41. `POST /api/studies/[id]/calendar` - 일정 생성
42. `GET /api/studies/[id]/calendar/[eventId]` - 일정 상세
43. `PATCH /api/studies/[id]/calendar/[eventId]` - 일정 수정
44. `DELETE /api/studies/[id]/calendar/[eventId]` - 일정 삭제

#### 초대 관리 (1개)
45. `POST /api/studies/[id]/invite` - 초대 코드 생성
46. `POST /api/studies/invite/[inviteCode]` - 초대 코드로 가입

---

## 3. 예외 케이스 식별

### 3.1 카테고리별 예외 목록 (총 105개)

#### A. Creation & Validation Errors (25개)

**A1. 스터디 생성 검증 (10개)**
```
STUDY-001: 스터디 이름 누락
STUDY-002: 스터디 이름 너무 짧음 (최소 2자)
STUDY-003: 스터디 이름 너무 김 (최대 50자)
STUDY-004: 스터디 이름 특수문자 포함
STUDY-005: 스터디 이름 중복
STUDY-006: 스터디 설명 누락
STUDY-007: 스터디 설명 너무 짧음 (최소 10자)
STUDY-008: 스터디 설명 너무 김 (최대 500자)
STUDY-009: 유효하지 않은 카테고리
STUDY-010: 카테고리 누락
```

**A2. 정원 및 모집 설정 (8개)**
```
STUDY-011: 최대 인원 범위 초과 (2-100명)
STUDY-012: 최대 인원이 현재 멤버보다 적음
STUDY-013: 유효하지 않은 모집 상태
STUDY-014: 유효하지 않은 자동승인 설정
STUDY-015: 이미지 URL 형식 오류
STUDY-016: 태그 개수 초과 (최대 10개)
STUDY-017: 태그 길이 초과 (최대 20자)
STUDY-018: 서브 카테고리 불일치
```

**A3. 수정 제약 (7개)**
```
STUDY-019: 수정 권한 없음 (OWNER만 가능)
STUDY-020: 필수 필드 삭제 시도
STUDY-021: 이모지 형식 오류
STUDY-022: 수정할 내용 없음
STUDY-023: 동시 수정 충돌
STUDY-024: 변경 불가 필드 수정 시도
STUDY-025: 스터디 삭제 실패 (활성 멤버 존재)
```

#### B. Member Management Errors (28개)

**B1. 멤버 권한 (10개)**
```
STUDY-026: 스터디 멤버가 아님
STUDY-027: 활성 멤버가 아님
STUDY-028: 권한 불충분 (ADMIN 필요)
STUDY-029: 권한 불충분 (OWNER 필요)
STUDY-030: 역할 계층 위반
STUDY-031: OWNER는 1명만 가능
STUDY-032: OWNER 역할 변경 불가
STUDY-033: 본인 역할 변경 불가
STUDY-034: 유효하지 않은 역할
STUDY-035: 역할 업그레이드 권한 없음
```

**B2. 멤버 강퇴 (9개)**
```
STUDY-036: 멤버를 찾을 수 없음
STUDY-037: 자기 자신 강퇴 불가
STUDY-038: OWNER 강퇴 불가
STUDY-039: ADMIN이 다른 ADMIN 강퇴 불가
STUDY-040: 이미 강퇴된 멤버
STUDY-041: 탈퇴한 멤버 강퇴 불가
STUDY-042: 강퇴 사유 너무 김 (최대 200자)
STUDY-043: 강퇴 후 알림 전송 실패
STUDY-044: 멤버 상태 업데이트 실패
```

**B3. 멤버 조회 및 필터링 (9개)**
```
STUDY-045: 유효하지 않은 역할 필터
STUDY-046: 유효하지 않은 상태 필터
STUDY-047: 페이지 번호 범위 오류
STUDY-048: 페이지 크기 범위 오류 (1-100)
STUDY-049: 정렬 필드 유효하지 않음
STUDY-050: 정렬 방향 유효하지 않음
STUDY-051: 검색어 너무 짧음 (최소 2자)
STUDY-052: 검색어 너무 김 (최대 50자)
STUDY-053: 특수문자 사용 불가
```

#### C. Application & Join Errors (18개)

**C1. 가입 신청 (10개)**
```
STUDY-054: 스터디를 찾을 수 없음
STUDY-055: 모집 중이 아님
STUDY-056: 정원 마감
STUDY-057: 이미 가입된 멤버
STUDY-058: 가입 대기 중
STUDY-059: 강퇴된 멤버 재가입 불가
STUDY-060: 소개글 너무 김 (최대 500자)
STUDY-061: 지원 동기 너무 김 (최대 500자)
STUDY-062: 레벨 선택 누락
STUDY-063: 유효하지 않은 레벨
```

**C2. 가입 승인/거절 (8개)**
```
STUDY-064: 가입 요청을 찾을 수 없음
STUDY-065: 이미 처리된 요청
STUDY-066: 승인 권한 없음 (ADMIN 필요)
STUDY-067: 승인 중 정원 초과
STUDY-068: 거절 사유 너무 김 (최대 200자)
STUDY-069: 중복 승인 시도
STUDY-070: 자동 승인 스터디에서 수동 승인 시도
STUDY-071: 알림 전송 실패
```

#### D. Business Logic Errors (20개)

**D1. 정원 및 상태 관리 (7개)**
```
STUDY-072: 멤버 수 동기화 오류
STUDY-073: 정원 증가 불가 (현재 인원 초과)
STUDY-074: 정원 감소 불가 (현재 인원보다 작음)
STUDY-075: 모집 중지 불가 (대기 중인 신청 존재)
STUDY-076: 스터디 상태 전이 오류
STUDY-077: 동시성 충돌 (정원 마감)
STUDY-078: 스터디 종료 후 가입 시도
```

**D2. 탈퇴 및 재가입 (7개)**
```
STUDY-079: OWNER 탈퇴 불가
STUDY-080: 탈퇴 후 즉시 재가입 제한 (24시간)
STUDY-081: 재가입 횟수 초과 (최대 3회)
STUDY-082: 탈퇴 사유 누락
STUDY-083: 탈퇴 후 데이터 정리 실패
STUDY-084: 탈퇴 알림 실패
STUDY-085: LEFT 상태 멤버 재가입 시 검증 실패
```

**D3. 트랜잭션 및 데이터 무결성 (6개)**
```
STUDY-086: 트랜잭션 실패
STUDY-087: 외래키 제약 위반
STUDY-088: 중복 데이터 생성 시도
STUDY-089: 데이터베이스 연결 오류
STUDY-090: 데이터 동기화 실패
STUDY-091: 롤백 실패
```

#### E. File Management Errors (12개)

**E1. 파일 업로드 (7개)**
```
STUDY-092: 파일 선택 안 함
STUDY-093: 파일 크기 초과 (최대 50MB)
STUDY-094: 허용되지 않은 파일 형식
STUDY-095: 악성 파일 감지
STUDY-096: 저장 공간 부족
STUDY-097: 파일명 너무 김 (최대 255자)
STUDY-098: 파일 업로드 실패
```

**E2. 파일 관리 (5개)**
```
STUDY-099: 파일을 찾을 수 없음
STUDY-100: 파일 삭제 권한 없음
STUDY-101: 파일 다운로드 권한 없음
STUDY-102: 파일 손상됨
STUDY-103: 파일 삭제 실패
```

#### F. Additional Features Errors (12개)

**F1. 공지사항 (4개)**
```
STUDY-104: 공지 제목 누락
STUDY-105: 공지 제목 길이 오류 (2-100자)
STUDY-106: 공지 내용 누락
STUDY-107: 공지 내용 길이 오류 (10-5000자)
```

**F2. 할일 관리 (3개)**
```
STUDY-108: 할일 제목 누락
STUDY-109: 마감일이 과거
STUDY-110: 담당자가 멤버가 아님
```

**F3. 채팅 (3개)**
```
STUDY-111: 메시지 내용 누락
STUDY-112: 메시지 길이 초과 (최대 2000자)
STUDY-113: 타인 메시지 삭제 불가
```

**F4. 일정 (2개)**
```
STUDY-114: 일정 제목 누락
STUDY-115: 종료 시간이 시작 시간보다 이름
```

---

## 4. StudyException 계층 구조 설계

### 4.1 클래스 계층도

```
StudyException (Base Class)
├── StudyValidationException (검증 에러)
│   ├── StudyCreationValidationException
│   ├── StudyUpdateValidationException
│   └── StudyFieldValidationException
│
├── StudyPermissionException (권한 에러)
│   ├── StudyNotMemberException
│   ├── StudyInsufficientPermissionException
│   ├── StudyOwnerOnlyException
│   └── StudyAdminOnlyException
│
├── StudyMemberException (멤버 관리 에러)
│   ├── MemberNotFoundException
│   ├── MemberKickException
│   ├── MemberRoleException
│   └── MemberStatusException
│
├── StudyApplicationException (가입 신청 에러)
│   ├── JoinValidationException
│   ├── JoinRequestNotFoundException
│   ├── ApplicationApprovalException
│   └── ApplicationRejectionException
│
├── StudyBusinessException (비즈니스 로직 에러)
│   ├── StudyCapacityException
│   ├── StudyStatusException
│   ├── StudyLeaveException
│   └── StudyRejoinException
│
├── StudyFileException (파일 관리 에러)
│   ├── FileUploadException
│   ├── FileValidationException
│   ├── FileNotFoundException
│   └── FilePermissionException
│
├── StudyFeatureException (추가 기능 에러)
│   ├── NoticeException
│   ├── TaskException
│   ├── ChatException
│   └── CalendarException
│
└── StudyDatabaseException (데이터베이스 에러)
    ├── TransactionException
    ├── ConstraintViolationException
    └── DataSyncException
```

### 4.2 에러 코드 체계

#### 코드 형식
```
STUDY-XXX-YY
  └─┬─┘ └─┬┘ └┬┘
    │     │   └─ 순번 (01-99)
    │     └───── 카테고리 (100-900)
    └─────────── 도메인
```

#### 카테고리 코드
```
100번대: Creation & Validation (001-025)
200번대: Member Management (026-053)
300번대: Application & Join (054-071)
400번대: Business Logic (072-091)
500번대: File Management (092-103)
600번대: Notice (104-107)
700번대: Task (108-110)
800번대: Chat (111-113)
900번대: Calendar (114-115)
```

### 4.3 에러 심각도 (Severity)

```javascript
const SEVERITY_LEVELS = {
  LOW: 'low',          // 사용자 입력 오류 (400)
  MEDIUM: 'medium',    // 권한 오류 (403)
  HIGH: 'high',        // 서버 오류 (500)
  CRITICAL: 'critical' // 데이터 무결성 오류 (500)
}
```

**심각도별 분류**:
- **LOW**: 검증 에러 (001-025, 054-071)
- **MEDIUM**: 권한 에러 (026-053)
- **HIGH**: 비즈니스 로직 에러 (072-091)
- **CRITICAL**: 데이터베이스 에러 (086-091)

### 4.4 재시도 가능 여부 (Retryable)

```javascript
const RETRYABLE_ERRORS = [
  'STUDY-086', // 트랜잭션 실패
  'STUDY-089', // 데이터베이스 연결 오류
  'STUDY-090', // 데이터 동기화 실패
  'STUDY-098', // 파일 업로드 실패
  'STUDY-096'  // 저장 공간 부족 (일시적)
]
```

---

## 5. 구현 우선순위

### Phase 1: 핵심 예외 (Critical) - 50개
**예상 시간**: 5-6시간

#### 우선순위 1-A: 스터디 CRUD (15개)
- STUDY-001 ~ STUDY-010 (생성 검증)
- STUDY-019 ~ STUDY-025 (수정 제약)

#### 우선순위 1-B: 멤버 권한 (15개)
- STUDY-026 ~ STUDY-035 (권한 에러)
- STUDY-036 ~ STUDY-040 (강퇴 에러)

#### 우선순위 1-C: 가입 신청 (20개)
- STUDY-054 ~ STUDY-063 (가입 검증)
- STUDY-064 ~ STUDY-071 (승인/거절)

### Phase 2: 비즈니스 로직 (Important) - 30개
**예상 시간**: 4-5시간

#### 우선순위 2-A: 정원 및 상태 (7개)
- STUDY-072 ~ STUDY-078

#### 우선순위 2-B: 탈퇴 및 재가입 (7개)
- STUDY-079 ~ STUDY-085

#### 우선순위 2-C: 멤버 관리 고급 (9개)
- STUDY-045 ~ STUDY-053 (필터링)

#### 우선순위 2-D: 트랜잭션 (6개)
- STUDY-086 ~ STUDY-091

### Phase 3: 파일 및 추가 기능 (Nice-to-have) - 25개
**예상 시간**: 3-4시간

#### 우선순위 3-A: 파일 관리 (12개)
- STUDY-092 ~ STUDY-103

#### 우선순위 3-B: 공지사항 (4개)
- STUDY-104 ~ STUDY-107

#### 우선순위 3-C: 할일/채팅/일정 (8개)
- STUDY-108 ~ STUDY-115

---

## 6. 예상 작업 시간

### Step 2: Exception 클래스 구현 (5-6시간)

**파일**: `src/lib/exceptions/study/StudyException.js`

- **Base Class 구현** (1시간)
  - StudyException 기본 클래스
  - toJSON, toResponse 메서드
  - 로깅 통합

- **서브 클래스 구현** (2시간)
  - 8개 서브 클래스
  - 각 클래스별 고유 메서드

- **115개 에러 메서드 구현** (2-3시간)
  - Phase 1: 50개 (핵심)
  - Phase 2: 30개 (중요)
  - Phase 3: 25개 (추가)

### Step 3: Validators 및 Logger 구현 (3-4시간)

**파일**: `src/lib/validators/study-validators.js`

- **기존 validators 통합** (1시간)
  - study-validation.js 리팩토링
  - 추가 검증 함수 구현

**파일**: `src/lib/logging/studyLogger.js`

- **로거 구현** (2시간)
  - 구조화된 로깅
  - 로그 레벨 관리
  - 외부 서비스 통합 준비

### Step 4: API 라우트 강화 (6-8시간)

- **핵심 API 강화** (3-4시간)
  - route.js (GET, POST)
  - [id]/route.js (GET, PATCH, DELETE)
  - join/route.js, leave/route.js

- **멤버 관리 API 강화** (2-3시간)
  - members/route.js
  - members/[userId]/route.js
  - join-requests/ 관련

- **추가 기능 API 강화** (1-2시간)
  - notices, files, tasks, chat, calendar

### Step 5: 프론트엔드 통합 (4-5시간)

- **에러 처리 유틸리티** (2시간)
- **UI 컴포넌트 업데이트** (2-3시간)

### Step 6: 테스트 작성 (5-6시간)

- **Unit Tests** (2시간): 115개 에러 메서드
- **Integration Tests** (2-3시간): API 라우트
- **E2E Tests** (1시간): 주요 플로우

**총 예상 시간**: 25-30시간

---

## 7. 다음 단계

### ✅ Step 1 완료 사항
- [x] 기존 코드 분석
- [x] API 엔드포인트 목록 작성
- [x] 115개 예외 케이스 식별
- [x] StudyException 계층 구조 설계
- [x] 구현 우선순위 설정
- [x] STUDY-ANALYSIS.md 문서 작성

### ⏭️ Step 2: Exception 클래스 구현
**파일 생성**:
1. `src/lib/exceptions/study/StudyException.js` (Base + 115개 메서드)
2. `src/lib/exceptions/study/index.js` (Export)

**작업 내용**:
1. Base Class 구현
2. 8개 서브 클래스 구현
3. 115개 정적 메서드 구현
4. 에러 코드 상수 정의
5. 유틸리티 메서드 추가

**예상 시간**: 5-6시간

---

## 📊 완료 요약

### 분석 결과
- **API 라우트**: 28개 (46개 엔드포인트)
- **식별된 예외**: 115개
- **에러 카테고리**: 9개
- **우선순위 계층**: 3단계

### 기존 코드 활용
- ✅ study-errors.js → 통합 예정
- ✅ study-validation.js → 확장 예정
- ✅ study-helpers.js → 개선 예정

### 설계 완료
- ✅ 클래스 계층 구조 (8개 서브 클래스)
- ✅ 에러 코드 체계 (STUDY-XXX-YY)
- ✅ 심각도 레벨 정의
- ✅ 재시도 가능 에러 목록

---

**작성일**: 2025-12-01  
**다음 작업**: Step 2 - Exception 클래스 구현  
**예상 소요**: 5-6시간

