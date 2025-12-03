# 다음 작업: Group 도메인 Step 2 - Exception 클래스 구현

**작성일**: 2025-12-03  
**최종 업데이트**: 2025-12-03 15:00  
**기준 문서**: `exception-implementation.md` (Phase A > A3 > Step 2)  
**현재 진행**: ✅ Group 도메인 Step 1 완료 → 🎯 Step 2 Exception 클래스 구현

---

## 🎉 최근 완료 작업

### Group 도메인 Step 1 완료 (2025-12-03)
- ✅ Group API 구조 설계 (8개 엔드포인트)
- ✅ 예외 케이스 76개 식별
- ✅ GroupException 계층 구조 설계 (5개 서브클래스)
- ✅ `docs/group/GROUP-ANALYSIS.md` 문서 작성 완료
- ✅ exception-implementation.md 진행률 업데이트 (32% 완료)

### 도메인별 완료 현황
- ✅ **Profile 도메인**: 100% 완료 (172 테스트)
- ✅ **Study 도메인**: 100% 완료 (142 테스트)
- ✅ **Admin 도메인**: 100% 완료 (61 테스트)
- 🔄 **Group 도메인**: 14% 완료 (Step 1/7)
- **Phase A 전체: 32% 완료 (3개 완료, 1개 진행 중)** 🎉

---

## 🎯 A3. Group 도메인 - Step 2: Exception 클래스 구현

**예상 시간**: 5-6시간  
**우선순위**: High  
**목표**: GroupException 및 5개 서브클래스 구현 (76개 에러 메서드)

---

## 📋 작업 개요

Step 1에서 설계한 구조를 바탕으로 실제 Exception 클래스를 구현합니다.

### 작업 범위

1. ✅ GroupException.js (Base 클래스) - 76개 에러 메서드
2. ✅ GroupValidationException.js - 20개 에러
3. ✅ GroupPermissionException.js - 10개 에러
4. ✅ GroupMemberException.js - 14개 에러
5. ✅ GroupInviteException.js - 15개 에러
6. ✅ GroupBusinessException.js - 17개 에러
7. ✅ index.js - Export 파일

---

## 🔍 Step 2: Exception 클래스 구현

### 파일 구조

```
coup/src/lib/exceptions/group/
├── GroupException.js              - Base 클래스 (76개 정적 메서드)
├── GroupValidationException.js    - 입력 검증 (20개)
├── GroupPermissionException.js    - 권한 검증 (10개)
├── GroupMemberException.js        - 멤버 관리 (14개)
├── GroupInviteException.js        - 초대 시스템 (15개)
├── GroupBusinessException.js      - 비즈니스 로직 (17개)
└── index.js                       - Export
```

### 1. GroupException.js (Base 클래스) - 1시간

**구조**:
```javascript
import BaseException from '../BaseException.js';

export default class GroupException extends BaseException {
  constructor(message, code, statusCode = 400, securityLevel = 'medium', context = {}) {
    super(message, code, statusCode, context);
    this.securityLevel = securityLevel;
    this.domain = 'GROUP';
  }

  // ========================================
  // A. Validation Exceptions (20개)
  // ========================================
  
  static nameRequired() { ... }
  static nameTooShort() { ... }
  static nameTooLong() { ... }
  // ... (총 76개 정적 메서드)
}
```

**구현 원칙**:
- 각 메서드는 적절한 statusCode 반환 (400, 403, 404, 409, 500)
- securityLevel 설정 (critical, high, medium, low)
- context 객체로 추가 정보 전달
- 명확하고 사용자 친화적인 메시지
- 한글과 영문 메시지 지원

### 2. GroupValidationException.js - 1시간

**20개 에러 메서드**:

```javascript
// 그룹 이름 검증 (5개)
- nameRequired()
- nameTooShort(minLength = 2)
- nameTooLong(maxLength = 50)
- nameDuplicate(name)
- nameInvalidCharacters()

// 설명 검증 (3개)
- descriptionRequired()
- descriptionTooShort(minLength = 10)
- descriptionTooLong(maxLength = 500)

// 카테고리 검증 (3개)
- categoryRequired()
- categoryInvalid(category)
- categoryNotFound(category)

// 정원 검증 (4개)
- capacityRequired()
- capacityTooSmall(minCapacity = 2)
- capacityTooLarge(maxCapacity = 100)
- capacityBelowCurrentMembers(capacity, currentCount)

// 기타 검증 (5개)
- visibilityRequired()
- tooManyTags(maxTags = 10)
- tagTooLong(tag, maxLength = 20)
- invalidImageFormat(format)
- imageTooLarge(size, maxSize = 5)
```

### 3. GroupPermissionException.js - 1시간

**10개 에러 메서드**:

```javascript
// CRUD 권한 (5개)
- insufficientPermissionToCreate()
- insufficientPermissionToUpdate()
- insufficientPermissionToDelete()
- insufficientPermissionToView()
- ownerCannotLeave()

// 멤버 관리 권한 (3개)
- insufficientPermissionToAddMember()
- insufficientPermissionToRemoveMember()
- insufficientPermissionToChangeRole()

// 초대 권한 (2개)
- insufficientPermissionToInvite()
- insufficientPermissionToCancelInvite()
```

### 4. GroupMemberException.js - 1시간

**14개 에러 메서드**:

```javascript
// 멤버 존재 여부 (7개)
- memberNotFound(userId)
- alreadyMember(userId)
- alreadyLeft(userId)
- kickedUser(userId)
- suspendedUserCannotJoin(userId)
- memberCapacityExceeded(capacity)
- memberDuplicateCheck()

// 역할 관리 (4개)
- invalidRole(role)
- onlyOneOwnerAllowed()
- atLeastOneAdminRequired()
- targetMemberNotFound(userId)

// 멤버 액션 (3개)
- cannotRemoveSelf()
- cannotRemoveOwner()
- memberHasActiveTasks(taskCount)
```

### 5. GroupInviteException.js - 1시간

**15개 에러 메서드**:

```javascript
// 초대 코드 (5개)
- inviteCodeGenerationFailed()
- invalidInviteCode(code)
- inviteCodeExpired(code, expiredAt)
- inviteCodeAlreadyUsed(code)
- inviteUsageLimitExceeded(limit)

// 초대 대상 (5개)
- cannotInviteExistingMember(userId)
- cannotInviteKickedUser(userId)
- inviteTargetUserNotFound(email)
- invalidEmailFormat(email)
- emailSendFailed(email, reason)

// 초대 액션 (5개)
- inviteNotFound(inviteId)
- inviteCreationFailed(reason)
- inviteActionFailed(action, reason)
- inviteAlreadyProcessed(inviteId, status)
- cannotProcessOthersInvite(inviteId)
```

### 6. GroupBusinessException.js - 1시간

**17개 에러 메서드**:

```javascript
// 그룹 존재 확인 (3개)
- groupNotFound(groupId)
- groupDeleted(groupId)
- privateGroupAccessDenied(groupId)

// 그룹 삭제 (4개)
- cannotDeleteWithActiveMembers(memberCount)
- cannotDeleteWithActiveProjects(projectCount)
- groupDeletionFailed(reason)
- (insufficientPermissionToDelete는 Permission에 있음)

// 그룹 수정 (2개)
- groupStatusUpdateFailed(reason)
- groupRecruitingClosed(groupId)

// 가입 관리 (4개)
- groupNotJoinable(reason)
- inviteOnlyGroup()
- duplicateJoinRequest()
- joinRequestPending()

// 탈퇴 관리 (3개)
- cannotLeaveWithActiveTasks(taskCount)
- leaveFailed(reason)
- alreadyLeftGroup()

// 기타 (1개)
- groupSuspended(groupId, reason)
- databaseError(operation, details)
```

### 7. index.js - Export 파일 (10분)

```javascript
export { default as GroupException } from './GroupException.js';
export { default as GroupValidationException } from './GroupValidationException.js';
export { default as GroupPermissionException } from './GroupPermissionException.js';
export { default as GroupMemberException } from './GroupMemberException.js';
export { default as GroupInviteException } from './GroupInviteException.js';
export { default as GroupBusinessException } from './GroupBusinessException.js';
```

---

## 📝 체크리스트

### Step 2: Exception 클래스 구현
- [ ] `coup/src/lib/exceptions/group/` 디렉토리 생성
- [ ] `GroupException.js` 구현 (Base 클래스, 76개 메서드)
- [ ] `GroupValidationException.js` 구현 (20개 에러)
- [ ] `GroupPermissionException.js` 구현 (10개 에러)
- [ ] `GroupMemberException.js` 구현 (14개 에러)
- [ ] `GroupInviteException.js` 구현 (15개 에러)
- [ ] `GroupBusinessException.js` 구현 (17개 에러)
- [ ] `index.js` 작성
- [ ] 문법 오류 확인 (get_errors)
- [ ] `docs/group/GROUP-EXCEPTION-COMPLETE.md` 작성

---

## 🚀 시작 프롬프트

```bash
Group 도메인 Step 2 시작!

✅ Step 1 완료:
- GROUP-ANALYSIS.md 작성 완료
- 76개 예외 케이스 식별
- 5개 서브클래스 구조 설계

📋 Step 2 작업:
1. GroupException.js (Base) - 76개 정적 메서드
2. GroupValidationException.js - 20개
3. GroupPermissionException.js - 10개
4. GroupMemberException.js - 14개
5. GroupInviteException.js - 15개
6. GroupBusinessException.js - 17개
7. index.js - Export

참고 자료:
- docs/group/GROUP-ANALYSIS.md
- src/lib/exceptions/study/StudyException.js (유사 구조)
- src/lib/exceptions/profile/ProfileException.js

예상 시간: 5-6시간

작업을 시작해줘!
```

---

## 📂 작업할 파일 목록

```
C:\Project\CoUp\coup\src\lib\exceptions\group\
├── GroupException.js (신규 생성)
├── GroupValidationException.js (신규 생성)
├── GroupPermissionException.js (신규 생성)
├── GroupMemberException.js (신규 생성)
├── GroupInviteException.js (신규 생성)
├── GroupBusinessException.js (신규 생성)
└── index.js (신규 생성)

C:\Project\CoUp\docs\group\
└── GROUP-EXCEPTION-COMPLETE.md (신규 생성)
```

---

## 💡 구현 가이드

### Security Level 기준

| Level | 조건 | 예시 |
|-------|------|------|
| **critical** | 권한 관련, 데이터 접근 제어 | insufficientPermissionToDelete, privateGroupAccessDenied |
| **high** | 중요 비즈니스 로직, 보안 위반 가능성 | kickedUser, memberCapacityExceeded |
| **medium** | 입력 검증, 일반적인 비즈니스 규칙 | nameRequired, capacityTooSmall |
| **low** | 시스템 오류, 부가 기능 | databaseError, tooManyTags |

### Status Code 기준

| Code | 용도 | 예시 |
|------|------|------|
| **400** | 잘못된 요청, 입력 검증 실패 | nameRequired, capacityTooSmall |
| **403** | 권한 없음 | insufficientPermissionToUpdate |
| **404** | 리소스를 찾을 수 없음 | groupNotFound, memberNotFound |
| **409** | 충돌 (중복, 상태 불일치) | alreadyMember, nameDuplicate |
| **500** | 서버 오류 | databaseError, inviteCodeGenerationFailed |

### 메시지 작성 원칙

1. **명확성**: 무엇이 문제인지 명확하게
2. **실행 가능성**: 사용자가 어떻게 해결할 수 있는지
3. **친절함**: 부드럽고 도움이 되는 톤
4. **간결함**: 불필요한 기술 용어 제거

**예시**:
```javascript
static nameTooShort(minLength = 2) {
  return new GroupValidationException(
    `그룹 이름은 최소 ${minLength}자 이상이어야 합니다.`,
    'GROUP-002',
    400,
    'medium',
    { minLength }
  );
}
```

---

## 📊 전체 도메인 진행 상황

```
Phase A: 도메인별 예외 처리 시스템 구축
├─ A1. Profile 도메인 ✅ 100% (172 테스트)
├─ A2. Study 도메인 ✅ 100% (142 테스트)
├─ A3. Group 도메인 ⏳ 14% ← 🎯 Step 2 진행 중
│   ├─ Step 1: 분석 및 설계 ✅
│   ├─ Step 2: Exception 구현 ⏳ ← 다음 작업
│   ├─ Step 3: Validators & Logger ⏳
│   ├─ Step 4: API 핵심 강화 ⏳
│   ├─ Step 5: API 추가 강화 ⏳
│   ├─ Step 6: 테스트 작성 ⏳
│   └─ Step 7: 프론트엔드 통합 ⏳
├─ A4. Notification 도메인 ⏳ 0%
├─ A5. Chat 도메인 ⏳ 0%
├─ A6. Dashboard 도메인 ⏳ 0%
├─ A7. Search 도메인 ⏳ 0%
├─ A8. Settings 도메인 ⏳ 0%
├─ A9. Auth 도메인 ⏳ 0%
└─ A10. Admin 도메인 ✅ 100% (61 테스트)

Phase A 전체: 32% 완료 (3/10 도메인 완료, 1개 진행 중)
```

---

## 🔄 참고 자료

### 완료된 도메인 Exception 클래스
- ✅ **Profile**: `src/lib/exceptions/profile/ProfileException.js` (90개 메서드)
- ✅ **Study**: `src/lib/exceptions/study/StudyException.js` (115개 메서드)
- ✅ **Admin**: `src/lib/exceptions/admin/AdminException.js` (100개 메서드)

### 분석 문서
- ✅ **Group 분석**: `docs/group/GROUP-ANALYSIS.md`

### 설계 패턴
- Base Exception 클래스 상속
- 정적 메서드 패턴
- context 객체 활용
- 일관된 에러 코드 체계

---

## 🎯 다음 단계 (Step 3 미리보기)

Step 2 완료 후:
- ✅ GroupException 76개 메서드 구현
- ✅ 5개 서브클래스 완성
- ✅ index.js export

**Step 3 예정**:
- group-validators.js (15개 검증 함수)
- groupLogger.js (20개 로깅 함수)
- group-helpers.js (25개 헬퍼 함수)
- 예상 시간: 3-4시간

---

**현재 상태**: Group 도메인 Step 1 완료! ✅  
**다음 작업**: Step 2 - GroupException 클래스 구현 (5-6시간) 🎯


**작성일**: 2025-12-03  
**최종 업데이트**: 2025-12-03 23:30  
**기준 문서**: `exception-implementation.md` (Phase A > A3 > Step 1)  
**현재 진행**: ✅ Admin 도메인 테스트 수정 완료 → 🎯 Group 도메인 Step 1 시작

---

## 🎉 최근 완료 작업

### Admin 도메인 테스트 수정 완료 (2025-12-03)
- ✅ `admin-simplified.test.js` - 25개 테스트 통과
- ✅ `admin.test.js` - 36개 테스트 통과
- ✅ **총 61개 테스트 모두 통과** 🎉
- ✅ `authenticationFailed()` securityLevel 올바르게 설정 ('critical')
- ✅ exception-implementation.md 진행률 업데이트 (30% 완료)

### 도메인별 완료 현황
- ✅ **Profile 도메인**: 100% 완료 (172 테스트)
- ✅ **Study 도메인**: 100% 완료 (142 테스트)
- ✅ **Admin 도메인**: 100% 완료 (61 테스트)
- **Phase A 전체: 30% 완료 (3/10 도메인)** 🎉

---

## 🎯 A3. Group 도메인 - Step 1: 도메인 분석 및 설계

**예상 시간**: 3-4시간  
**우선순위**: High  
**목표**: Group 도메인의 예외 케이스 식별 및 구조 설계

---

## 📋 작업 개요

Group 도메인은 CoUp 플랫폼의 **그룹 활동 관리**를 담당하는 핵심 도메인입니다.
현재 Group API가 구현되어 있지 않으므로, **신규 구축**이 필요합니다.

### 작업 범위

1. ✅ Group API 구조 설계
2. ✅ 예외 케이스 식별 (60-80개)
3. ✅ GroupException 계층 구조 설계
4. ✅ 분석 문서 작성

---

## 🔍 Step 1: 도메인 분석 및 설계

### 1. Group API 구조 설계 (1시간)

**설계할 API 엔드포인트**:
```
src/app/api/groups/
├── route.js - GET/POST (그룹 목록 조회, 생성)
├── [id]/
│   ├── route.js - GET/PATCH/DELETE (그룹 상세, 수정, 삭제)
│   ├── members/
│   │   └── route.js - GET/POST/DELETE (멤버 조회, 추가, 제거)
│   ├── invites/
│   │   └── route.js - GET/POST/DELETE (초대 조회, 생성, 취소)
│   ├── join/
│   │   └── route.js - POST (그룹 가입)
│   └── leave/
│       └── route.js - POST (그룹 탈퇴)
└── search/
    └── route.js - GET (그룹 검색)
```

**분석 항목**:
- [ ] 필요한 API 엔드포인트 파악
- [ ] 각 엔드포인트의 기능 정의
- [ ] 권한 체계 설계 (OWNER, ADMIN, MEMBER)
- [ ] 입력 검증 요구사항 파악
- [ ] 비즈니스 로직 복잡도 분석

---

### 2. 예외 케이스 식별 (1.5시간)

**카테고리별 예외 케이스**:

#### A. 그룹 생성/수정 검증 (15-20개)

**필드별 검증**:
```javascript
// 그룹 이름
- GROUP-001: 그룹 이름 필수
- GROUP-002: 그룹 이름 너무 짧음 (< 2자)
- GROUP-003: 그룹 이름 너무 김 (> 50자)
- GROUP-004: 그룹 이름 중복
- GROUP-005: 그룹 이름 특수문자 포함 불가

// 설명
- GROUP-006: 설명 필수
- GROUP-007: 설명 너무 짧음 (< 10자)
- GROUP-008: 설명 너무 김 (> 500자)

// 카테고리
- GROUP-009: 카테고리 필수
- GROUP-010: 유효하지 않은 카테고리
- GROUP-011: 존재하지 않는 카테고리

// 정원
- GROUP-012: 정원 필수
- GROUP-013: 정원이 너무 작음 (< 2명)
- GROUP-014: 정원이 너무 큼 (> 100명)
- GROUP-015: 현재 멤버 수보다 작게 설정 불가

// 기타
- GROUP-016: 공개 설정 필수
- GROUP-017: 태그 개수 초과 (> 10개)
- GROUP-018: 태그 길이 초과 (> 20자)
- GROUP-019: 이미지 형식 오류
- GROUP-020: 이미지 크기 초과 (> 5MB)
```

#### B. 멤버십 관리 (20-25개)

**권한 및 멤버 관리**:
```javascript
// 권한 검증
- GROUP-021: 멤버 추가 권한 없음 (ADMIN 필요)
- GROUP-022: 멤버 제거 권한 없음
- GROUP-023: 역할 변경 권한 없음 (OWNER만)
- GROUP-024: 본인 역할 변경 불가
- GROUP-025: OWNER 탈퇴 불가
- GROUP-026: 하위 역할로만 변경 가능

// 멤버 상태
- GROUP-027: 멤버를 찾을 수 없음
- GROUP-028: 이미 멤버임
- GROUP-029: 이미 탈퇴함
- GROUP-030: 강퇴된 사용자
- GROUP-031: 정지된 사용자 가입 불가
- GROUP-032: 멤버 정원 초과
- GROUP-033: 멤버 중복 확인 실패

// 역할 관리
- GROUP-034: 유효하지 않은 역할
- GROUP-035: OWNER는 1명만 가능
- GROUP-036: 최소 1명의 ADMIN 필요
- GROUP-037: 역할 변경 대상 멤버 없음

// 멤버 제거
- GROUP-038: 본인 제거 불가 (탈퇴 사용)
- GROUP-039: OWNER 제거 불가
- GROUP-040: 진행 중인 작업이 있어 제거 불가
```

#### C. 초대 시스템 (15-20개)

**초대 생성 및 관리**:
```javascript
// 초대 권한
- GROUP-041: 초대 권한 없음 (ADMIN 필요)
- GROUP-042: 초대 생성 실패

// 초대 코드
- GROUP-043: 초대 코드 생성 실패
- GROUP-044: 유효하지 않은 초대 코드
- GROUP-045: 초대 코드 만료
- GROUP-046: 초대 코드 이미 사용됨
- GROUP-047: 초대 사용 횟수 초과

// 초대 대상
- GROUP-048: 이미 멤버인 사용자 초대 불가
- GROUP-049: 강퇴된 사용자 초대 불가
- GROUP-050: 초대할 사용자를 찾을 수 없음
- GROUP-051: 이메일 형식 오류
- GROUP-052: 이메일 발송 실패

// 초대 액션
- GROUP-053: 초대를 찾을 수 없음
- GROUP-054: 초대 취소 권한 없음
- GROUP-055: 초대 수락/거절 실패
- GROUP-056: 이미 처리된 초대
- GROUP-057: 본인이 아닌 초대는 수락/거절 불가
```

#### D. 비즈니스 로직 (15-20개)

**그룹 운영 및 상태 관리**:
```javascript
// 그룹 존재 확인
- GROUP-058: 그룹을 찾을 수 없음
- GROUP-059: 삭제된 그룹
- GROUP-060: 비공개 그룹 접근 불가

// 그룹 삭제
- GROUP-061: 그룹 삭제 권한 없음 (OWNER만)
- GROUP-062: 활동 멤버가 있어 삭제 불가
- GROUP-063: 진행 중인 프로젝트가 있어 삭제 불가
- GROUP-064: 그룹 삭제 실패

// 그룹 수정
- GROUP-065: 그룹 수정 권한 없음 (ADMIN 필요)
- GROUP-066: 그룹 상태 변경 실패
- GROUP-067: 모집 종료된 그룹

// 가입 관리
- GROUP-068: 가입 불가능한 그룹 (비공개)
- GROUP-069: 초대 전용 그룹
- GROUP-070: 가입 신청 중복
- GROUP-071: 가입 승인 대기 중

// 탈퇴 관리
- GROUP-072: 탈퇴 불가 (진행 중인 작업)
- GROUP-073: 탈퇴 실패
- GROUP-074: 이미 탈퇴한 그룹

// 기타
- GROUP-075: 그룹 활동 불가 (정지됨)
- GROUP-076: 데이터베이스 오류
```

**예상 총 에러 케이스**: 76개

---

### 3. GroupException 계층 구조 설계 (30분)

**서브 클래스 구조**:
```javascript
GroupException (Base)
│
├── GroupValidationException
│   ├── name, description, category 검증
│   ├── capacity, tags, image 검증
│   └── 입력 형식 오류
│
├── GroupPermissionException
│   ├── OWNER, ADMIN, MEMBER 권한
│   ├── 멤버 추가/제거/변경 권한
│   └── 초대 권한
│
├── GroupMemberException
│   ├── 멤버 존재 여부
│   ├── 멤버 상태 (활성/탈퇴/강퇴)
│   ├── 역할 관리
│   └── 멤버 액션
│
├── GroupInviteException
│   ├── 초대 코드 생성/검증
│   ├── 초대 만료/사용 횟수
│   ├── 초대 수락/거절
│   └── 이메일 초대
│
└── GroupBusinessException
    ├── 그룹 존재 확인
    ├── 그룹 삭제/수정 가능 여부
    ├── 가입/탈퇴 가능 여부
    └── 그룹 상태 관리
```

**에러 코드 범위**:
- `GROUP-001 ~ GROUP-020`: Validation (그룹 필드 검증)
- `GROUP-021 ~ GROUP-040`: Member Management (멤버 관리)
- `GROUP-041 ~ GROUP-057`: Invite System (초대 시스템)
- `GROUP-058 ~ GROUP-076`: Business Logic (비즈니스 로직)

---

### 4. 분석 문서 작성 (30분)

**생성할 문서**: `docs/group/GROUP-ANALYSIS.md`

**문서 구조**:
```markdown
# Group 도메인 예외 처리 분석

## 1. API 엔드포인트 목록
- 8개 엔드포인트 상세 설명

## 2. 예외 케이스 전체 목록
- 76개 에러 케이스 상세 설명
- 카테고리별 분류

## 3. GroupException 계층 구조
- 5개 서브 클래스 설계
- 에러 코드 범위 정의

## 4. 우선순위별 분류
- High: 그룹 생성/수정, 멤버 관리
- Medium: 초대 시스템
- Low: 통계, 검색

## 5. 구현 계획
- Step 2-7 작업 계획
- 예상 소요 시간
```

---

## 📝 체크리스트

### Step 1: 도메인 분석 및 설계
- [ ] Group API 구조 설계 완료
- [ ] 예외 케이스 76개 식별
- [ ] GroupException 계층 구조 설계 (5개 서브클래스)
- [ ] `docs/group/GROUP-ANALYSIS.md` 문서 작성

---

## 🚀 시작 프롬프트

```bash
Group 도메인 Step 1 시작!

✅ 완료된 도메인:
- Profile 도메인: 172 테스트
- Study 도메인: 142 테스트
- Admin 도메인: 61 테스트

📋 Group 도메인 Step 1 작업:
1. Group API 구조 설계 (8개 엔드포인트)
2. 예외 케이스 76개 식별
3. GroupException 계층 구조 설계 (5개 서브클래스)
4. GROUP-ANALYSIS.md 문서 작성

예상 시간: 3-4시간

작업을 시작해줘!
```

---

## 📂 작업할 파일 목록

```
C:\Project\CoUp\
├── docs\group\
│   └── GROUP-ANALYSIS.md (신규 생성)
└── 분석 결과를 바탕으로 다음 세션에서:
    └── coup\src\lib\exceptions\group\
        └── GroupException.js (Step 2에서 생성 예정)
```

---

## 📊 전체 도메인 진행 상황

```
Phase A: 도메인별 예외 처리 시스템 구축
├─ A1. Profile 도메인 ✅ 100% (172 테스트)
├─ A2. Study 도메인 ✅ 100% (142 테스트)
├─ A3. Group 도메인 ⏳ 0% ← 🎯 다음 작업
├─ A4. Notification 도메인 ⏳ 0%
├─ A5. Chat 도메인 ⏳ 0%
├─ A6. Dashboard 도메인 ⏳ 0%
├─ A7. Search 도메인 ⏳ 0%
├─ A8. Settings 도메인 ⏳ 0%
├─ A9. Auth 도메인 ⏳ 0%
└─ A10. Admin 도메인 ✅ 100% (61 테스트)

Phase A 전체: 30% 완료 (3/10 도메인)
```

---

## 🎯 Group 도메인 전체 로드맵

```
⏳ Step 1: 도메인 분석 및 설계 (0%) ← 🎯 현재 작업
⏳ Step 2: Exception 클래스 구현 (0%)
⏳ Step 3: Validators & Logger 구현 (0%)
⏳ Step 4: API 라우트 강화 - 핵심 (0%)
⏳ Step 5: API 라우트 강화 - 추가 (0%)
⏳ Step 6: 테스트 작성 (0%)
⏳ Step 7: 프론트엔드 통합 (0%)

전체: 0% 완료 (0/7 단계)
예상 총 시간: 20-25시간
```

---

## 🔄 참고 자료

### 완료된 도메인 참고
- ✅ Profile: `src/lib/exceptions/profile/ProfileException.js` (90개 에러 메서드)
- ✅ Study: `src/lib/exceptions/study/StudyException.js` (115개 에러 메서드)
- ✅ Admin: `src/lib/exceptions/admin/AdminException.js` (100개 에러 코드)

### 설계 패턴 참고
- Profile/Study 도메인의 계층 구조
- 에러 코드 범위 정의 방식
- 문서화 형식

---

## 💡 중요 참고사항

1. **Group API는 아직 구현되지 않음**
   - 신규 설계가 필요
   - Study 도메인과 유사하지만 차이점 고려

2. **Group vs Study 차이점**
   - Group: 장기적인 커뮤니티, 자유로운 활동
   - Study: 목표 지향적, 기간 제한, 구조화된 학습

3. **핵심 기능**
   - 멤버십 관리 (OWNER, ADMIN, MEMBER)
   - 초대 시스템 (코드 기반, 이메일)
   - 가입/탈퇴 관리

4. **보안 고려사항**
   - 비공개 그룹 접근 제어
   - 강퇴된 사용자 재가입 방지
   - 권한별 액션 제어

---

**현재 상태**: Admin 도메인 테스트 수정 완료! ✅  
**다음 작업**: Group 도메인 Step 1 - 도메인 분석 및 설계 🎯
