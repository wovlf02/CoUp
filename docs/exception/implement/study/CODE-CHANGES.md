# study 영역 - 코드 변경 사항

**영역**: study (스터디 관리)  
**단계**: Step 2-4 - Critical 구현 (1/3 - 유틸리티 파일 생성)  
**작성일**: 2025-11-30  
**상태**: 🟢 진행 중

---

## 📋 작업 개요

### 완료된 작업
- ✅ **Step 2-4.1**: 유틸리티 파일 6개 생성 완료

### 다음 작업
- ⏳ **Step 2-4.2**: Critical 예외 처리 구현 (25개 항목)
- ⏳ **Step 2-4.3**: 테스트 및 검증

---

## 🆕 생성된 파일 (6개)

### 1. study-errors.js ⭐⭐⭐
**경로**: `coup/src/lib/exceptions/study-errors.js`  
**크기**: ~370줄  
**작업 시간**: 4시간 (예상)  

**목적**: 통일된 스터디 에러 처리

**주요 내용**:
- ✅ `STUDY_ERRORS` 상수 (50개 에러 코드 정의)
  - 스터디 CRUD (7개): STUDY_001~007
  - 권한 관련 (4개): STUDY_101~104
  - 가입/탈퇴 (8개): STUDY_201~208
  - 멤버 관리 (7개): STUDY_301~307
  - 가입 요청 (3개): STUDY_401~403
  - 파일 관련 (7개): STUDY_501~507
  - 공지 관련 (3개): STUDY_601~603
  - 할일 관련 (3개): STUDY_701~703
  - 채팅 관련 (3개): STUDY_801~803
  - 일정 관련 (3개): STUDY_901~903
  - 데이터베이스 (3개): STUDY_996~998
  - 일반 에러 (1개): STUDY_999

- ✅ `createStudyErrorResponse()` - 에러 응답 생성 함수
- ✅ `logStudyError()` - 에러 로깅 헬퍼
- ✅ `handlePrismaError()` - Prisma 에러 변환 (P2002, P2025, P2003)
- ✅ `StudyError` 클래스 - 커스텀 에러 클래스

**특징**:
- 일관된 에러 코드 체계 (STUDY_XXX)
- 사용자 친화적인 한글 메시지
- 적절한 HTTP 상태 코드 매핑
- 개발/프로덕션 환경 구분 로깅

---

### 2. study-validation.js ⭐⭐⭐
**경로**: `coup/src/lib/validators/study-validation.js`  
**크기**: ~460줄  
**작업 시간**: 4시간 (예상)  

**목적**: 재사용 가능한 입력 검증 함수

**주요 내용**:
- ✅ 상수 정의
  - `VALID_CATEGORIES` - 6개 카테고리
  - `VALID_ROLES` - 3개 역할 (OWNER, ADMIN, MEMBER)
  - `VALID_MEMBER_STATUS` - 4개 상태 (PENDING, ACTIVE, KICKED, LEFT)

- ✅ 스터디 필드 검증 (5개)
  - `validateStudyName()` - 2~50자
  - `validateDescription()` - 10~500자
  - `validateMaxMembers()` - 2~100명
  - `validateCategory()` - 허용된 카테고리
  - `validateRole()` / `validateMemberStatus()` - 열거형 검증

- ✅ 컨텐츠 검증 (8개)
  - `validateNoticeTitle()` - 1~100자
  - `validateNoticeContent()` - 1~5000자
  - `validateTaskTitle()` - 1~200자
  - `validateTaskDueDate()` - 미래 날짜
  - `validateMessageContent()` - 1~2000자
  - `validateEventTitle()` - 1~100자
  - `validateEventDate()` - 시작일 < 종료일

- ✅ 통합 검증 (2개)
  - `validateStudyCreation()` - 생성 데이터 전체 검증
  - `validateStudyUpdate()` - 수정 데이터 검증

- ✅ 보안
  - `escapeHtml()` - XSS 방어

**특징**:
- 일관된 반환 형식 `{ valid, error }`
- 상세한 에러 메시지
- 한글 메시지 지원
- XSS 방어 유틸리티 포함

---

### 3. study-helpers.js ⭐⭐⭐
**경로**: `coup/src/lib/study-helpers.js`  
**크기**: ~390줄  
**작업 시간**: 6시간 (예상)  

**목적**: 스터디 관련 비즈니스 로직 헬퍼

**주요 내용**:
- ✅ 역할 계층 구조
  - `ROLE_HIERARCHY` - 역할 우선순위 (OWNER: 3, ADMIN: 2, MEMBER: 1)

- ✅ 정원 관리 (1개)
  - `checkStudyCapacity()` - 정원 확인 (isFull, currentCount, availableSlots)

- ✅ 권한 검증 (12개)
  - `canModifyMember()` - 멤버 수정 권한
  - `canChangeRole()` - 역할 변경 권한
  - `canJoinStudy()` - 가입 가능 여부 (모집 상태, 정원, 기존 멤버십)
  - `canKickMember()` - 강퇴 가능 여부
  - `canLeaveStudy()` - 탈퇴 가능 여부 (OWNER 제외)
  - `canDeleteStudy()` - 삭제 권한
  - `canModifyContent()` - 컨텐츠 수정 권한
  - `canProcessJoinRequest()` - 가입 요청 처리 권한
  - `canChangeSettings()` - 설정 변경 권한
  - `isValidRole()` / `isValidMemberStatus()` - 유효성 확인
  - `compareRoles()` - 역할 비교
  - `isAdminOrOwner()` - 관리자 이상 확인

- ✅ 검색/정렬 (2개)
  - `buildStudySearchQuery()` - Prisma where 쿼리 빌더
  - `buildStudySortQuery()` - Prisma orderBy 쿼리 빌더

**특징**:
- 역할 기반 권한 체계
- 상세한 권한 확인 로직
- 재가입 쿨다운 (7일) 구현
- 일관된 반환 형식 `{ canXxx, reason, errorKey }`

---

### 4. file-upload-helpers.js ⭐⭐⭐
**경로**: `coup/src/lib/file-upload-helpers.js`  
**크기**: ~380줄  
**작업 시간**: 5시간 (예상)  

**목적**: 파일 업로드 보안 및 검증

**주요 내용**:
- ✅ 파일 타입 관리
  - `ALLOWED_FILE_TYPES` - 허용된 MIME 타입 및 확장자 (30개+)
    - 문서: PDF, Word, Excel, PPT, TXT, CSV
    - 이미지: JPEG, PNG, GIF, WebP, SVG
    - 압축: ZIP, RAR, 7Z
    - 코드: JS, HTML, CSS, JSON, MD, Python, Java
  - `DANGEROUS_EXTENSIONS` - 위험한 확장자 (14개)
    - 실행 파일: .exe, .bat, .cmd, .com, .msi, .scr
    - 스크립트: .vbs, .js, .jar, .sh, .ps1
    - 라이브러리: .dll, .so, .dylib

- ✅ 파일 크기 제한
  - `FILE_SIZE_LIMITS`
    - 기본: 50MB
    - 이미지: 10MB
    - 문서: 25MB
    - 압축 파일: 100MB
  - `STORAGE_LIMIT_PER_STUDY` - 스터디당 1GB

- ✅ 검증 함수 (9개)
  - `validateFileType()` - 파일 타입 검증
  - `validateFileSize()` - 파일 크기 검증
  - `sanitizeFilename()` - 파일명 안전화
  - `generateUniqueFilename()` - 고유 파일명 생성
  - `checkStudyStorage()` - 저장 공간 사용량 확인
  - `hasStorageSpace()` - 저장 여유 확인
  - `checkMaliciousFile()` - 악성 파일 패턴 검사
  - `validateFileUpload()` - 통합 검증
  - `ensureUploadDirectory()` - 디렉토리 생성

- ✅ 보안 기능
  - 매직 넘버 검사 (EXE, ELF, Mach-O)
  - 이미지 내 스크립트 검사
  - 경로 탐색 방지 (../ 제거)

**특징**:
- 다층 보안 검증
- 저장 공간 관리
- 사용자 친화적 에러 메시지
- 파일명 안전화

---

### 5. notification-helpers.js ⭐⭐
**경로**: `coup/src/lib/notification-helpers.js`  
**크기**: ~390줄  
**작업 시간**: 3시간 (예상)  

**목적**: 알림 생성 자동화

**주요 내용**:
- ✅ 알림 타입
  - `NOTIFICATION_TYPES` - 8개 타입
    - JOIN_APPROVED, NOTICE, FILE, EVENT, TASK, MEMBER, KICK, CHAT

- ✅ 알림 템플릿
  - `NOTIFICATION_TEMPLATES` - 15개 템플릿
    - 가입 승인, 공지, 파일, 일정, 할일, 멤버, 강퇴, 채팅 멘션

- ✅ 알림 생성 함수 (15개)
  - `createNotification()` - 단일 알림 생성
  - `createBulkNotifications()` - 일괄 알림 생성
  - `notifyJoinApproved()` - 가입 승인 알림
  - `notifyNewNotice()` - 새 공지 알림
  - `notifyFileUploaded()` - 파일 업로드 알림
  - `notifyEventCreated()` - 일정 생성 알림
  - `notifyEventReminder()` - 일정 리마인더
  - `notifyTaskAssigned()` - 할일 배정 알림
  - `notifyTaskDueSoon()` - 할일 마감 임박 알림
  - `notifyMemberJoined()` - 새 멤버 가입 알림
  - `notifyRoleChanged()` - 역할 변경 알림
  - `notifyKicked()` - 강퇴 알림
  - `notifyChatMention()` - 채팅 멘션 알림
  - `safeNotify()` - 안전한 알림 생성 (실패해도 계속)

**특징**:
- 일관된 알림 형식
- 실패해도 계속 진행 (safeNotify)
- 일괄 처리 지원
- 템플릿 기반 메시지 생성

---

### 6. transaction-helpers.js ⭐⭐⭐
**경로**: `coup/src/lib/transaction-helpers.js`  
**크기**: ~560줄  
**작업 시간**: 4시간 (예상)  

**목적**: 데이터 일관성 보장 트랜잭션

**주요 내용**:
- ✅ 스터디 관리 트랜잭션 (3개)
  - `createStudyWithOwner()` - 스터디 생성 + OWNER 멤버 자동 생성
  - `deleteStudyWithRelations()` - 스터디 삭제 + 관련 데이터 정리
    - 삭제 순서: 메시지 → 파일 → 할일 → 일정 → 공지 → 멤버 → 가입요청 → 스터디
  - `updateStudyWithValidation()` - 스터디 수정 + 정원 검증

- ✅ 멤버 관리 트랜잭션 (5개)
  - `approveJoinRequestWithMember()` - 가입 승인 + 멤버 생성 + 정원 증가
  - `kickMemberWithUpdate()` - 멤버 강퇴 + 정원 감소
  - `leaveMemberWithUpdate()` - 멤버 탈퇴 + 정원 감소
  - `joinStudyWithMember()` - 스터디 가입 + 멤버 생성 (자동/수동 승인)
  - `changeRoleWithValidation()` - 역할 변경 + 검증

- ✅ 고급 기능 (1개)
  - `retryTransaction()` - 동시성 오류 시 자동 재시도
    - P2034 에러 감지
    - 지수 백오프 (100ms, 200ms, 400ms)
    - 최대 3회 재시도

**특징**:
- 원자성 보장 (All or Nothing)
- 데이터 일관성 유지
- 상세한 로깅
- 재시도 메커니즘
- 정원 자동 업데이트

---

## 📊 파일 통계

| 파일 | 줄 수 | 함수 수 | 상수 수 | 우선순위 | 소요 시간 |
|------|-------|---------|---------|----------|-----------|
| study-errors.js | ~370 | 4 | 50 | ⭐⭐⭐ | 4시간 |
| study-validation.js | ~460 | 17 | 3 | ⭐⭐⭐ | 4시간 |
| study-helpers.js | ~390 | 18 | 1 | ⭐⭐⭐ | 6시간 |
| file-upload-helpers.js | ~380 | 15 | 4 | ⭐⭐⭐ | 5시간 |
| notification-helpers.js | ~390 | 15 | 2 | ⭐⭐ | 3시간 |
| transaction-helpers.js | ~560 | 10 | 0 | ⭐⭐⭐ | 4시간 |
| **합계** | **~2,550** | **79** | **60** | - | **26시간** |

---

## 🎯 주요 기능 요약

### 에러 처리
- ✅ 50개 에러 코드 정의
- ✅ 일관된 에러 응답 형식
- ✅ Prisma 에러 변환
- ✅ 컨텍스트 기반 로깅

### 유효성 검증
- ✅ 17개 검증 함수
- ✅ 통합 검증 지원
- ✅ 한글 메시지
- ✅ XSS 방어

### 권한 관리
- ✅ 역할 기반 권한 체계
- ✅ 18개 권한 검증 함수
- ✅ 역할 계층 구조
- ✅ 상세한 권한 확인

### 파일 보안
- ✅ 다층 보안 검증
- ✅ 악성 파일 검사
- ✅ 저장 공간 관리
- ✅ 파일명 안전화

### 알림 시스템
- ✅ 15개 알림 함수
- ✅ 일괄 처리 지원
- ✅ 템플릿 기반 메시지
- ✅ 안전한 알림 생성

### 트랜잭션
- ✅ 10개 트랜잭션 함수
- ✅ 데이터 일관성 보장
- ✅ 자동 재시도
- ✅ 상세한 로깅

---

## 🔗 파일 의존성

```
study-errors.js (독립)
    ↓
study-validation.js (study-errors 사용)
    ↓
study-helpers.js (study-errors 사용)
    ↓
file-upload-helpers.js (study-errors 사용)
    ↓
notification-helpers.js (독립, Prisma 사용)
    ↓
transaction-helpers.js (study-errors, Prisma 사용)
```

---

## ✅ 검증 결과

### 컴파일 에러
- ❌ 없음 - 모든 파일 정상 컴파일

### 경고
- ⚠️ "사용하지 않는 함수" 경고 다수
  - **원인**: 유틸리티 함수들이 아직 API 라우트에서 사용되지 않음
  - **해결**: Step 2-4.2에서 API 라우트 수정 시 자동 해결

### 코드 품질
- ✅ 일관된 네이밍 컨벤션
- ✅ JSDoc 주석 완비
- ✅ 에러 처리 완비
- ✅ 로깅 표준화

---

## 📝 다음 단계 (Step 2-4.2)

### Critical 예외 처리 구현 (25개 항목)

#### 우선순위 1: 데이터 무결성 (10개, 20시간)
1. **스터디 생성 트랜잭션** (studies/route.js)
   - createStudyWithOwner() 적용
   - 필드 검증 강화
   - 중복 이름 확인

2. **스터디 삭제 트랜잭션** (studies/[id]/route.js)
   - deleteStudyWithRelations() 적용
   - 관련 데이터 정리
   - 파일 삭제

3. **가입 승인 트랜잭션** (join-requests/[requestId]/approve/route.js)
   - approveJoinRequestWithMember() 적용
   - 정원 재확인
   - 중복 승인 방지

4. **멤버 강퇴 트랜잭션** (members/[userId]/route.js)
   - kickMemberWithUpdate() 적용
   - 역할 계층 검증
   - 알림 생성

5. **멤버 탈퇴 트랜잭션** (leave/route.js)
   - leaveMemberWithUpdate() 적용
   - OWNER 탈퇴 방지

#### 우선순위 2: 보안 강화 (8개, 20시간)
6. **파일 업로드 검증** (files/route.js)
   - validateFileUpload() 적용
   - 악성 파일 검사
   - 저장 공간 확인

7. **XSS 방어** (notices/route.js, chat/route.js)
   - escapeHtml() 적용
   - HTML 태그 필터링

8. **권한 검증 강화** (auth-helpers.js)
   - requireStudyMember 개선
   - 역할 계층 검증

#### 우선순위 3: 유효성 검증 (7개, 20시간)
9. **스터디 생성 검증** (studies/route.js)
   - validateStudyCreation() 적용
   - 모든 필드 검증

10. **스터디 수정 검증** (studies/[id]/route.js)
    - validateStudyUpdate() 적용
    - 정원 변경 검증

11. **공지 검증** (notices/route.js)
    - validateNoticeTitle/Content() 적용
    - 길이 제한

12. **할일 검증** (tasks/route.js)
    - validateTaskTitle/DueDate() 적용
    - 날짜 유효성

13. **일정 검증** (calendar/route.js)
    - validateEventTitle/Date() 적용
    - 날짜 범위 확인

---

## 🎉 마일스톤

### 완료된 것 ✅
- [x] Step 2-1: auth 영역 분석
- [x] Step 2-2: auth 영역 Critical 구현
- [x] Step 2-3: study 영역 분석
- [x] **Step 2-4.1: study 유틸리티 파일 생성 (6개)** ← 현재

### 다음 작업 ⏳
- [ ] Step 2-4.2: study Critical 구현 (25개)
- [ ] Step 2-4.3: study 테스트 및 검증
- [ ] Step 2-5: study Important 구현
- [ ] Step 2-6: study Nice-to-Have 구현

---

## 📈 진행률

```
전체 예외 구현 진행률
■■■■■■■□□□□□□□□□□□□□ 35%

Step 2-4 (study Critical) 진행률
■■■■■□□□□□□□□□□□□□□□ 25%

유틸리티 생성: ■■■■■■■■■■■■■■■■■■■■ 100% ✅
Critical 구현:  □□□□□□□□□□□□□□□□□□□□   0%
테스트/검증:    □□□□□□□□□□□□□□□□□□□□   0%
```

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-11-30  
**다음 세션**: Step 2-4.2 - Critical 예외 처리 구현 시작

