# Group 도메인 예외 처리 분석

**작성일**: 2025-12-03  
**도메인**: Group (그룹 활동 관리)  
**상태**: Step 1 완료 - 도메인 분석 및 설계  

---

## 📊 분석 개요

### 도메인 특성

Group 도메인은 CoUp 플랫폼의 **그룹 활동 관리**를 담당하는 핵심 도메인입니다.

**Study vs Group 차이점**:
- **Study**: 목표 지향적, 기간 제한, 구조화된 학습 활동
- **Group**: 장기적인 커뮤니티, 자유로운 활동, 느슨한 구조

**핵심 기능**:
1. 그룹 생성/수정/삭제
2. 멤버십 관리 (OWNER, ADMIN, MEMBER)
3. 초대 시스템 (코드 기반, 이메일)
4. 가입/탈퇴 관리
5. 권한 기반 액세스 제어

---

## 🏗️ 1. API 엔드포인트 구조

### 1.1 전체 엔드포인트 목록 (8개)

```
src/app/api/groups/
├── route.js                    - GET/POST (그룹 목록 조회, 생성)
├── [id]/
│   ├── route.js                - GET/PATCH/DELETE (그룹 상세, 수정, 삭제)
│   ├── members/
│   │   └── route.js            - GET/POST/DELETE (멤버 조회, 추가, 제거)
│   ├── invites/
│   │   └── route.js            - GET/POST/DELETE (초대 조회, 생성, 취소)
│   ├── join/
│   │   └── route.js            - POST (그룹 가입)
│   └── leave/
│       └── route.js            - POST (그룹 탈퇴)
└── search/
    └── route.js                - GET (그룹 검색)
```

### 1.2 엔드포인트 상세

#### 1) `/api/groups` - 그룹 목록/생성

**GET** - 그룹 목록 조회
- 공개 그룹 목록 (비로그인 가능)
- 내 그룹 목록 (로그인 필요)
- 필터링: category, isPublic, isRecruiting
- 정렬: createdAt, memberCount, rating
- 페이지네이션

**POST** - 그룹 생성
- 필수: name, description, category
- 선택: maxMembers, isPublic, tags, image
- 생성자 자동으로 OWNER 역할 부여
- inviteCode 자동 생성

#### 2) `/api/groups/[id]` - 그룹 상세/수정/삭제

**GET** - 그룹 상세 조회
- 공개 그룹: 누구나 조회 가능
- 비공개 그룹: 멤버만 조회 가능
- 멤버 수, 평점, 태그 등 포함

**PATCH** - 그룹 수정
- 권한: OWNER 또는 ADMIN
- 수정 가능 필드: name, description, category, maxMembers, isPublic, tags, image
- maxMembers는 현재 멤버 수보다 작게 설정 불가

**DELETE** - 그룹 삭제
- 권한: OWNER만
- 활동 멤버가 있으면 삭제 불가
- 진행 중인 프로젝트가 있으면 삭제 불가
- 소프트 삭제 권장

#### 3) `/api/groups/[id]/members` - 멤버 관리

**GET** - 멤버 목록 조회
- 권한: 멤버만 (비공개 그룹) 또는 누구나 (공개 그룹)
- 필터링: role, status
- 정렬: joinedAt, role

**POST** - 멤버 추가
- 권한: OWNER 또는 ADMIN
- 직접 추가 (초대 없이)
- 정원 확인 필요
- 강퇴된 사용자 재추가 불가

**DELETE** - 멤버 제거
- 권한: OWNER 또는 ADMIN
- OWNER는 제거 불가
- 본인은 제거 불가 (탈퇴 API 사용)
- 강퇴 사유 기록

#### 4) `/api/groups/[id]/invites` - 초대 관리

**GET** - 초대 목록 조회
- 권한: OWNER 또는 ADMIN
- 필터링: status (pending, accepted, rejected, expired)

**POST** - 초대 생성
- 권한: OWNER 또는 ADMIN
- 이메일 또는 userId로 초대
- 초대 코드 생성 (7일 유효)
- 이메일 발송 (선택적)
- 이미 멤버인 사용자 초대 불가
- 강퇴된 사용자 초대 불가

**DELETE** - 초대 취소
- 권한: OWNER 또는 ADMIN
- 이미 수락/거절된 초대는 취소 불가

#### 5) `/api/groups/[id]/join` - 그룹 가입

**POST** - 그룹 가입
- 공개 그룹: 즉시 가입 또는 승인 필요
- 비공개 그룹: 초대 코드 필요
- 정원 확인
- 이미 멤버인 경우 에러
- 강퇴된 사용자 가입 불가
- 가입 신청 중복 방지

#### 6) `/api/groups/[id]/leave` - 그룹 탈퇴

**POST** - 그룹 탈퇴
- OWNER는 탈퇴 불가 (소유권 이전 필요)
- 진행 중인 작업이 있으면 경고
- 탈퇴 사유 기록 (선택적)

#### 7) `/api/groups/search` - 그룹 검색

**GET** - 그룹 검색
- 키워드 검색: name, description, tags
- 필터링: category, isPublic, memberCount
- 정렬: relevance, memberCount, createdAt, rating
- 페이지네이션

---

## 🚨 2. 예외 케이스 전체 목록 (76개)

### 2.1 A. 그룹 생성/수정 검증 (20개)

#### 그룹 이름 검증
- **GROUP-001**: `nameRequired` - 그룹 이름이 제공되지 않음
- **GROUP-002**: `nameTooShort` - 그룹 이름이 너무 짧음 (최소 2자)
- **GROUP-003**: `nameTooLong` - 그룹 이름이 너무 김 (최대 50자)
- **GROUP-004**: `nameDuplicate` - 그룹 이름이 이미 존재함
- **GROUP-005**: `nameInvalidCharacters` - 그룹 이름에 허용되지 않는 특수문자 포함

#### 설명 검증
- **GROUP-006**: `descriptionRequired` - 그룹 설명이 제공되지 않음
- **GROUP-007**: `descriptionTooShort` - 그룹 설명이 너무 짧음 (최소 10자)
- **GROUP-008**: `descriptionTooLong` - 그룹 설명이 너무 김 (최대 500자)

#### 카테고리 검증
- **GROUP-009**: `categoryRequired` - 카테고리가 제공되지 않음
- **GROUP-010**: `categoryInvalid` - 유효하지 않은 카테고리
- **GROUP-011**: `categoryNotFound` - 존재하지 않는 카테고리

#### 정원 검증
- **GROUP-012**: `capacityRequired` - 정원이 제공되지 않음
- **GROUP-013**: `capacityTooSmall` - 정원이 너무 작음 (최소 2명)
- **GROUP-014**: `capacityTooLarge` - 정원이 너무 큼 (최대 100명)
- **GROUP-015**: `capacityBelowCurrentMembers` - 정원을 현재 멤버 수보다 작게 설정 불가

#### 기타 검증
- **GROUP-016**: `visibilityRequired` - 공개 설정이 제공되지 않음
- **GROUP-017**: `tooManyTags` - 태그 개수 초과 (최대 10개)
- **GROUP-018**: `tagTooLong` - 태그 길이 초과 (최대 20자)
- **GROUP-019**: `invalidImageFormat` - 이미지 형식 오류 (jpg, png만 허용)
- **GROUP-020**: `imageTooLarge` - 이미지 크기 초과 (최대 5MB)

### 2.2 B. 멤버십 관리 (20개)

#### 권한 검증
- **GROUP-021**: `insufficientPermissionToAddMember` - 멤버 추가 권한 없음 (ADMIN 이상 필요)
- **GROUP-022**: `insufficientPermissionToRemoveMember` - 멤버 제거 권한 없음 (ADMIN 이상 필요)
- **GROUP-023**: `insufficientPermissionToChangeRole` - 역할 변경 권한 없음 (OWNER만 가능)
- **GROUP-024**: `cannotChangeOwnRole` - 본인의 역할 변경 불가
- **GROUP-025**: `ownerCannotLeave` - OWNER는 탈퇴 불가 (소유권 이전 필요)
- **GROUP-026**: `canOnlyDemote` - 하위 역할로만 변경 가능

#### 멤버 상태
- **GROUP-027**: `memberNotFound` - 멤버를 찾을 수 없음
- **GROUP-028**: `alreadyMember` - 이미 그룹의 멤버임
- **GROUP-029**: `alreadyLeft` - 이미 탈퇴한 멤버
- **GROUP-030**: `kickedUser` - 강퇴된 사용자는 재가입 불가
- **GROUP-031**: `suspendedUserCannotJoin` - 정지된 사용자는 가입 불가
- **GROUP-032**: `memberCapacityExceeded` - 멤버 정원 초과
- **GROUP-033**: `memberDuplicateCheck` - 멤버 중복 확인 실패

#### 역할 관리
- **GROUP-034**: `invalidRole` - 유효하지 않은 역할
- **GROUP-035**: `onlyOneOwnerAllowed` - OWNER는 1명만 가능
- **GROUP-036**: `atLeastOneAdminRequired` - 최소 1명의 ADMIN 필요
- **GROUP-037**: `targetMemberNotFound` - 역할 변경 대상 멤버를 찾을 수 없음

#### 멤버 제거
- **GROUP-038**: `cannotRemoveSelf` - 본인은 제거 불가 (탈퇴 API 사용)
- **GROUP-039**: `cannotRemoveOwner` - OWNER는 제거 불가
- **GROUP-040**: `memberHasActiveTasks` - 진행 중인 작업이 있어 제거 불가

### 2.3 C. 초대 시스템 (17개)

#### 초대 권한
- **GROUP-041**: `insufficientPermissionToInvite` - 초대 권한 없음 (ADMIN 이상 필요)
- **GROUP-042**: `inviteCreationFailed` - 초대 생성 실패

#### 초대 코드
- **GROUP-043**: `inviteCodeGenerationFailed` - 초대 코드 생성 실패
- **GROUP-044**: `invalidInviteCode` - 유효하지 않은 초대 코드
- **GROUP-045**: `inviteCodeExpired` - 초대 코드 만료 (7일 경과)
- **GROUP-046**: `inviteCodeAlreadyUsed` - 초대 코드 이미 사용됨
- **GROUP-047**: `inviteUsageLimitExceeded` - 초대 사용 횟수 초과

#### 초대 대상
- **GROUP-048**: `cannotInviteExistingMember` - 이미 멤버인 사용자 초대 불가
- **GROUP-049**: `cannotInviteKickedUser` - 강퇴된 사용자 초대 불가
- **GROUP-050**: `inviteTargetUserNotFound` - 초대할 사용자를 찾을 수 없음
- **GROUP-051**: `invalidEmailFormat` - 이메일 형식 오류
- **GROUP-052**: `emailSendFailed` - 이메일 발송 실패

#### 초대 액션
- **GROUP-053**: `inviteNotFound` - 초대를 찾을 수 없음
- **GROUP-054**: `insufficientPermissionToCancelInvite` - 초대 취소 권한 없음
- **GROUP-055**: `inviteActionFailed` - 초대 수락/거절 실패
- **GROUP-056**: `inviteAlreadyProcessed` - 이미 처리된 초대
- **GROUP-057**: `cannotProcessOthersInvite` - 본인이 아닌 초대는 수락/거절 불가

### 2.4 D. 비즈니스 로직 (19개)

#### 그룹 존재 확인
- **GROUP-058**: `groupNotFound` - 그룹을 찾을 수 없음
- **GROUP-059**: `groupDeleted` - 삭제된 그룹
- **GROUP-060**: `privateGroupAccessDenied` - 비공개 그룹 접근 불가

#### 그룹 삭제
- **GROUP-061**: `insufficientPermissionToDelete` - 그룹 삭제 권한 없음 (OWNER만 가능)
- **GROUP-062**: `cannotDeleteWithActiveMembers` - 활동 멤버가 있어 삭제 불가
- **GROUP-063**: `cannotDeleteWithActiveProjects` - 진행 중인 프로젝트가 있어 삭제 불가
- **GROUP-064**: `groupDeletionFailed` - 그룹 삭제 실패

#### 그룹 수정
- **GROUP-065**: `insufficientPermissionToUpdate` - 그룹 수정 권한 없음 (ADMIN 이상 필요)
- **GROUP-066**: `groupStatusUpdateFailed` - 그룹 상태 변경 실패
- **GROUP-067**: `groupRecruitingClosed` - 모집 종료된 그룹

#### 가입 관리
- **GROUP-068**: `groupNotJoinable` - 가입 불가능한 그룹 (비공개)
- **GROUP-069**: `inviteOnlyGroup` - 초대 전용 그룹
- **GROUP-070**: `duplicateJoinRequest` - 가입 신청 중복
- **GROUP-071**: `joinRequestPending` - 가입 승인 대기 중

#### 탈퇴 관리
- **GROUP-072**: `cannotLeaveWithActiveTasks` - 진행 중인 작업이 있어 탈퇴 불가
- **GROUP-073**: `leaveFailed` - 탈퇴 실패
- **GROUP-074**: `alreadyLeftGroup` - 이미 탈퇴한 그룹

#### 기타
- **GROUP-075**: `groupSuspended` - 그룹 활동 불가 (정지됨)
- **GROUP-076**: `databaseError` - 데이터베이스 오류

---

## 🏛️ 3. GroupException 계층 구조

### 3.1 클래스 다이어그램

```
GroupException (Base)
│
├── GroupValidationException
│   ├── name 검증 (5개)
│   ├── description 검증 (3개)
│   ├── category 검증 (3개)
│   ├── capacity 검증 (4개)
│   └── 기타 검증 (5개)
│   └── 총: 20개 에러
│
├── GroupPermissionException
│   ├── CRUD 권한 (5개)
│   ├── 멤버 관리 권한 (3개)
│   └── 초대 권한 (2개)
│   └── 총: 10개 에러
│
├── GroupMemberException
│   ├── 멤버 존재 여부 (7개)
│   ├── 역할 관리 (4개)
│   └── 멤버 액션 (3개)
│   └── 총: 14개 에러
│
├── GroupInviteException
│   ├── 초대 코드 (5개)
│   ├── 초대 대상 (5개)
│   └── 초대 액션 (5개)
│   └── 총: 15개 에러
│
└── GroupBusinessException
    ├── 그룹 존재 (3개)
    ├── 그룹 삭제 (4개)
    ├── 그룹 수정 (3개)
    ├── 가입 관리 (4개)
    ├── 탈퇴 관리 (3개)
    └── 기타 (2개)
    └── 총: 19개 에러
```

### 3.2 에러 코드 범위

| 범위 | 서브클래스 | 개수 | 설명 |
|------|------------|------|------|
| `GROUP-001 ~ GROUP-020` | GroupValidationException | 20개 | 입력 검증 오류 |
| `GROUP-021 ~ GROUP-040` | GroupPermissionException + GroupMemberException | 20개 | 권한 및 멤버 관리 |
| `GROUP-041 ~ GROUP-057` | GroupInviteException | 17개 | 초대 시스템 |
| `GROUP-058 ~ GROUP-076` | GroupBusinessException | 19개 | 비즈니스 로직 |
| **총합** | **5개 서브클래스** | **76개** | - |

### 3.3 Security Level 분류

| Level | 개수 | 에러 코드 예시 |
|-------|------|---------------|
| **critical** | 15개 | GROUP-022, GROUP-023, GROUP-039, GROUP-060, GROUP-061 |
| **high** | 25개 | GROUP-021, GROUP-027, GROUP-030, GROUP-044, GROUP-062 |
| **medium** | 30개 | GROUP-001~020, GROUP-041, GROUP-053, GROUP-067 |
| **low** | 6개 | GROUP-017, GROUP-018, GROUP-033, GROUP-076 |

---

## 📊 4. 우선순위별 분류

### 4.1 High Priority (핵심 기능)

**그룹 생성/수정** (20개)
- 입력 검증 전체
- GROUP-001 ~ GROUP-020

**멤버 관리** (20개)
- 권한 검증
- 멤버 추가/제거
- 역할 관리
- GROUP-021 ~ GROUP-040

### 4.2 Medium Priority (중요 기능)

**초대 시스템** (17개)
- 초대 코드 관리
- 이메일 초대
- GROUP-041 ~ GROUP-057

**가입/탈퇴** (7개)
- GROUP-068 ~ GROUP-074

### 4.3 Low Priority (부가 기능)

**그룹 검색/통계** (4개)
- GROUP-058 ~ GROUP-060, GROUP-075

**시스템 오류** (1개)
- GROUP-076

---

## 🛠️ 5. 구현 계획

### Step 2: Exception 클래스 구현 (5-6시간)

**파일 생성**:
```
coup/src/lib/exceptions/group/
├── GroupException.js (Base 클래스 + 76개 에러 메서드)
├── GroupValidationException.js
├── GroupPermissionException.js
├── GroupMemberException.js
├── GroupInviteException.js
├── GroupBusinessException.js
└── index.js
```

**구현 순서**:
1. GroupException.js (Base) - 1시간
2. GroupValidationException.js - 1시간
3. GroupPermissionException.js - 1시간
4. GroupMemberException.js - 1시간
5. GroupInviteException.js - 1시간
6. GroupBusinessException.js - 1시간

### Step 3: Validators & Logger 구현 (3-4시간)

**파일 생성**:
```
coup/src/lib/
├── validators/
│   └── group-validators.js (15개 검증 함수)
├── logging/
│   └── groupLogger.js (20개 로깅 함수)
└── helpers/
    └── group-helpers.js (25개 헬퍼 함수)
```

**검증 함수** (15개):
- validateGroupName
- validateDescription
- validateCategory
- validateCapacity
- validateTags
- validateImage
- validateRole
- validateMemberStatus
- validateInviteCode
- validateJoinRequest
- validateLeaveRequest
- checkMemberCapacity
- checkDuplicateMember
- checkKickedUser
- checkGroupPermission

**로거 함수** (20개):
- Group CRUD 로깅 (4개)
- 멤버 관리 로깅 (6개)
- 초대 시스템 로깅 (5개)
- 가입/탈퇴 로깅 (3개)
- 권한 변경 로깅 (2개)

### Step 4: API 라우트 강화 - 핵심 (6-8시간)

**Phase 1 - 핵심 API (4개)**:
1. `/api/groups/route.js` (2시간)
   - GET: 그룹 목록 조회
   - POST: 그룹 생성

2. `/api/groups/[id]/route.js` (2시간)
   - GET: 그룹 상세
   - PATCH: 그룹 수정
   - DELETE: 그룹 삭제

3. `/api/groups/[id]/members/route.js` (2시간)
   - GET: 멤버 목록
   - POST: 멤버 추가
   - DELETE: 멤버 제거

4. `/api/groups/[id]/invites/route.js` (2시간)
   - GET: 초대 목록
   - POST: 초대 생성
   - DELETE: 초대 취소

### Step 5: API 라우트 강화 - 추가 (3-4시간)

**Phase 2 - 추가 API (3개)**:
1. `/api/groups/[id]/join/route.js` (1시간)
2. `/api/groups/[id]/leave/route.js` (1시간)
3. `/api/groups/search/route.js` (1-2시간)

### Step 6: 테스트 작성 (5-6시간)

**테스트 파일**:
```
coup/src/__tests__/api/groups/
├── group.test.js (40개 테스트)
├── group-members.test.js (30개 테스트)
├── group-invites.test.js (25개 테스트)
└── group-helpers.test.js (25개 테스트)
```

**예상 총 테스트**: 120개

### Step 7: 프론트엔드 통합 (3-4시간)

**컴포넌트**:
- GroupCard
- GroupForm
- GroupMemberList
- GroupInviteModal

---

## 📈 6. 예상 일정

| Step | 작업 | 시간 | 누적 |
|------|------|------|------|
| 1 | 도메인 분석 및 설계 ✅ | 3-4h | 3-4h |
| 2 | Exception 클래스 구현 | 5-6h | 8-10h |
| 3 | Validators & Logger 구현 | 3-4h | 11-14h |
| 4 | API 라우트 강화 - 핵심 | 6-8h | 17-22h |
| 5 | API 라우트 강화 - 추가 | 3-4h | 20-26h |
| 6 | 테스트 작성 | 5-6h | 25-32h |
| 7 | 프론트엔드 통합 | 3-4h | 28-36h |
| **총합** | **7단계** | **28-36h** | - |

---

## 🔗 7. 참고 자료

### 완료된 도메인
- ✅ **Profile**: `src/lib/exceptions/profile/ProfileException.js` (90개)
- ✅ **Study**: `src/lib/exceptions/study/StudyException.js` (115개)
- ✅ **Admin**: `src/lib/exceptions/admin/AdminException.js` (100개)

### 설계 패턴
- Study 도메인의 멤버십 관리 패턴
- Profile 도메인의 검증 패턴
- Admin 도메인의 권한 체계

### 데이터베이스 스키마
- Study 모델 참고 (유사하지만 차이점 고려)
- 필요 시 Group 모델 설계

---

## ✅ Step 1 완료 체크리스트

- [x] Group API 구조 설계 (8개 엔드포인트)
- [x] 예외 케이스 76개 식별
- [x] GroupException 계층 구조 설계 (5개 서브클래스)
- [x] GROUP-ANALYSIS.md 문서 작성

---

**다음 작업**: Step 2 - GroupException 클래스 구현 (5-6시간)  
**시작 조건**: 이 분석 문서 검토 완료

