# Group 도메인 Step 4: API 핵심 강화 완료 보고서

**작성일**: 2025-12-03  
**작성자**: CoUp Development Team  
**소요 시간**: 약 6시간

---

## 📋 작업 개요

Group 도메인의 핵심 API 엔드포인트 4개를 구현하고, Exception 처리, Validation, Logging을 통합하여 안정적인 API를 구축했습니다.

---

## ✅ 완료된 작업

### 1. Prisma Schema 업데이트
- ✅ `Group` 모델 추가
- ✅ `GroupMember` 모델 추가  
- ✅ `GroupInvite` 모델 추가
- ✅ `User` 모델에 Group 관계 추가
- ✅ Enum 추가: `GroupMemberRole`, `GroupMemberStatus`, `GroupInviteStatus`

### 2. API 엔드포인트 구현 (4개)

#### 2.1 `/api/groups/route.js`
**GET /api/groups** - 그룹 목록 조회
- 페이지네이션 (page, limit)
- 필터링 (category, isPublic, isRecruiting)
- 검색 (name, description)
- 정렬 (latest, popular)
- 현재 사용자의 멤버십 정보 포함

**POST /api/groups** - 그룹 생성
- 입력 검증 (validateGroupData)
- 그룹 이름 중복 확인
- 트랜잭션으로 그룹 생성 + OWNER 멤버 추가
- 로깅 (그룹 생성, 멤버 추가)

#### 2.2 `/api/groups/[id]/route.js`
**GET /api/groups/[id]** - 그룹 상세 조회
- 그룹 존재 및 접근 권한 확인
- 멤버 목록 포함 (역할 기준 정렬)
- 생성자 정보 포함
- 현재 사용자의 멤버십 정보

**PATCH /api/groups/[id]** - 그룹 수정
- ADMIN 이상 권한 확인
- 부분 업데이트 지원
- 이름 변경 시 중복 확인
- maxMembers 변경 시 현재 멤버 수 확인
- 로깅

**DELETE /api/groups/[id]** - 그룹 삭제
- OWNER 권한 확인
- 활성 멤버 확인 (OWNER 제외)
- Soft delete 방식
- 로깅

#### 2.3 `/api/groups/[id]/members/route.js`
**GET /api/groups/[id]/members** - 멤버 목록 조회
- 상태별 필터링 (ACTIVE, PENDING, LEFT, KICKED)
- 페이지네이션
- 역할 기준 정렬 (OWNER > ADMIN > MEMBER)
- 사용자 정보 포함

**POST /api/groups/[id]/members** - 멤버 추가
- ADMIN 이상 권한 확인
- 사용자 존재 확인
- 중복 가입 방지
- 강퇴 이력 확인
- 정원 확인
- 재가입 지원 (LEFT 상태)
- 로깅

**DELETE /api/groups/[id]/members** - 멤버 제거
- ADMIN 이상 권한 확인
- OWNER 제거 방지
- 자기 자신 제거 방지
- 역할 계층 확인
- 제거/강퇴 모드 지원
- 로깅

#### 2.4 `/api/groups/[id]/invites/route.js`
**GET /api/groups/[id]/invites** - 초대 목록 조회
- 멤버만 조회 가능
- 상태별 필터링 (PENDING, ACCEPTED, EXPIRED, CANCELLED)
- 페이지네이션
- 초대자 및 사용자 정보 포함

**POST /api/groups/[id]/invites** - 초대 생성
- ADMIN 이상 권한 확인
- 이메일 형식 검증 (선택적)
- 이미 멤버인 경우 방지
- 강퇴된 사용자 초대 방지
- 정원 확인
- 12자리 초대 코드 생성
- 만료 시간 설정
- 로깅

**DELETE /api/groups/[id]/invites** - 초대 취소
- 생성자 또는 ADMIN 권한 확인
- 초대 상태 확인 (PENDING만 취소 가능)
- 로깅

### 3. Helper 함수 추가 (3개)
- ✅ `checkGroupAccess()` - 그룹 접근 권한 확인 (alias)
- ✅ `checkGroupPermission()` - 최소 역할 요구 확인
- ✅ `canManageMember()` - 멤버 관리 가능 여부

---

## 📊 구현 통계

### 파일 생성
- `coup/prisma/schema.prisma` (업데이트)
- `coup/src/app/api/groups/route.js` (242줄)
- `coup/src/app/api/groups/[id]/route.js` (347줄)
- `coup/src/app/api/groups/[id]/members/route.js` (379줄)
- `coup/src/app/api/groups/[id]/invites/route.js` (381줄)
- `coup/src/lib/helpers/group-helpers.js` (업데이트)

### API 통계
- **총 엔드포인트**: 10개 (GET 4개, POST 4개, PATCH 1개, DELETE 3개)
- **총 코드 라인**: 약 1,350줄
- **문법 오류**: 0개 (경고만 존재)

### 기능 통계
- **Exception 처리**: 76개 메서드 활용
- **Validation**: 15개 검증 함수 활용
- **Logging**: 20개 로깅 함수 활용
- **Helper 함수**: 28개 활용

---

## 🔧 기술적 특징

### 1. 트랜잭션 활용
```javascript
// 그룹 생성 시 OWNER 자동 추가
const result = await prisma.$transaction(async (tx) => {
  const group = await tx.group.create({ ... });
  const member = await tx.groupMember.create({ ... });
  return { group, member };
});
```

### 2. 역할 계층 시스템
```javascript
const ROLE_HIERARCHY = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1
};
```

### 3. Soft Delete
```javascript
await prisma.group.update({
  where: { id: groupId },
  data: { deletedAt: new Date() }
});
```

### 4. 통합 에러 처리
```javascript
if (error.code?.startsWith('GROUP-')) {
  return Response.json(
    { success: false, error: error.toJSON() },
    { status: error.statusCode }
  );
}
```

### 5. 구조화된 로깅
```javascript
GroupLogger.logGroupCreated(groupId, userId, groupData);
GroupLogger.logMemberAdded(groupId, adminId, newUserId, role);
```

---

## 🛡️ 보안 및 검증

### 인증/인가
- ✅ 모든 엔드포인트에서 세션 확인
- ✅ 역할 기반 권한 확인 (OWNER, ADMIN, MEMBER)
- ✅ 역할 계층 검증

### 입력 검증
- ✅ 그룹 데이터 검증 (이름, 설명, 카테고리 등)
- ✅ 이메일 형식 검증
- ✅ 중복 확인 (그룹 이름)

### 비즈니스 규칙
- ✅ 정원 확인
- ✅ 강퇴 이력 확인
- ✅ OWNER 보호 (제거/역할 변경 방지)
- ✅ 활성 멤버 확인 (삭제 시)

---

## 📝 API 사용 예시

### 1. 그룹 생성
```bash
POST /api/groups
{
  "name": "알고리즘 스터디",
  "description": "코딩 테스트 준비",
  "category": "study",
  "isPublic": true,
  "maxMembers": 20
}
```

### 2. 그룹 목록 조회
```bash
GET /api/groups?page=1&limit=20&category=study&search=알고리즘
```

### 3. 멤버 추가
```bash
POST /api/groups/{groupId}/members
{
  "userId": "user-123",
  "role": "MEMBER"
}
```

### 4. 초대 생성
```bash
POST /api/groups/{groupId}/invites
{
  "email": "user@example.com",
  "expiresInDays": 7
}
```

---

## 🧪 테스트 준비

### 수동 테스트 체크리스트
- [ ] 그룹 생성 (정상 케이스)
- [ ] 그룹 생성 (중복 이름)
- [ ] 그룹 목록 조회 (필터링)
- [ ] 그룹 상세 조회 (공개/비공개)
- [ ] 그룹 수정 (ADMIN)
- [ ] 그룹 삭제 (OWNER, 멤버 있을 때)
- [ ] 멤버 추가 (정원 확인)
- [ ] 멤버 제거 (역할 계층)
- [ ] 초대 생성 및 취소

### 자동 테스트 (Step 6 예정)
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] E2E Tests

---

## 🎯 다음 단계: Step 5 - API 추가 강화

### 예정 작업 (3-4시간)
1. **JOIN API** - `/api/groups/[id]/join`
   - 공개 그룹 가입
   - 초대 코드로 가입
   - 승인 대기 시스템

2. **LEAVE API** - `/api/groups/[id]/leave`
   - 자발적 탈퇴
   - OWNER 탈퇴 제한
   - 데이터 정리

3. **SEARCH API** - `/api/groups/search`
   - 고급 검색
   - 다중 조건 필터링
   - 추천 그룹

---

## 📈 진행 상황

### Group 도메인
```
Step 1: 분석 및 설계 ✅
Step 2: Exception 구현 ✅
Step 3: Validators & Logger ✅
Step 4: API 핵심 강화 ✅ ← 현재
Step 5: API 추가 강화 ⏳
Step 6: 테스트 작성 ⏳
Step 7: 프론트엔드 통합 ⏳

진행률: 57% (4/7 단계 완료)
```

### Phase A 전체
```
A1. Profile ✅ 100%
A2. Study ✅ 100%
A3. Group ⏳ 57% ← 현재
A4~A10. 대기 중

Phase A 진행률: 41%
```

---

## 🎉 성과

1. **안정적인 API**: Exception 처리, Validation, Logging 통합
2. **확장 가능한 구조**: 역할 계층, Soft Delete, 트랜잭션 활용
3. **보안 강화**: 인증/인가, 권한 검증, 입력 검증
4. **코드 품질**: 일관된 패턴, 명확한 에러 메시지, 구조화된 로깅

---

## 📌 주요 이슈 및 해결

### 이슈 1: Prisma Schema에 Group 모델 부재
**해결**: Group, GroupMember, GroupInvite 모델 추가 및 User 관계 설정

### 이슈 2: Helper 함수 누락
**해결**: checkGroupAccess, checkGroupPermission, canManageMember 함수 추가

### 이슈 3: 역할 계층 관리
**해결**: ROLE_HIERARCHY 상수 및 getRoleHierarchy 함수 구현

---

## 📚 참고 자료

- `docs/group/GROUP-ANALYSIS.md`
- `docs/group/GROUP-EXCEPTION-COMPLETE.md`
- `docs/group/GROUP-VALIDATORS-COMPLETE.md`
- `src/lib/exceptions/group/`
- `src/lib/validators/group-validators.js`
- `src/lib/logging/groupLogger.js`
- `src/lib/helpers/group-helpers.js`

---

**작업 완료**: 2025-12-03  
**다음 작업**: Group 도메인 Step 5 - API 추가 강화 (join, leave, search)

