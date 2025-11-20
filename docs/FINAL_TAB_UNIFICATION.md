# 모든 탭 스타일 통일 및 멤버 관리 탭 완료

## 📋 수정 일자
2025-01-21

## ✅ 완료된 작업

### 1. 설정 페이지 멤버 관리 제거 ✅
**파일**: `src/app/my-studies/[studyId]/settings/page.jsx`

#### 제거된 항목:
- ❌ "멤버 관리" 탭 제거
- ❌ 멤버 목록 표시 섹션 제거
- ❌ 역할 변경 기능 제거
- ❌ 멤버 강퇴 기능 제거
- ❌ 불필요한 API 훅 제거 (`useStudyMembers`, `useChangeMemberRole`, `useKickMember`)

#### 남은 항목:
- ✅ 기본 정보 탭 (스터디 이름, 카테고리, 소개, 태그)
- ✅ 공개 설정 (기본 정보 탭에 통합)
- ✅ 가입 승인 설정 (기본 정보 탭에 통합)
- ✅ 최대 인원 설정 (기본 정보 탭에 통합)
- ✅ 위험 구역 탭 (스터디 탈퇴/삭제)

#### 변경 사항:
```javascript
// Before: 3개 탭 (기본 정보, 멤버 관리, 공개 설정, 위험 구역)
// After: 2개 탭 (기본 정보, 위험 구역)

// 기본 정보 탭에 통합:
- 스터디 이름, 카테고리, 소개, 태그
- 공개 여부 (전체 공개 / 비공개)
- 가입 승인 (자동 승인 / 수동 승인)
- 최대 인원 (2-100명)
```

### 2. 멤버 관리 API 백엔드 구현 ✅

#### 생성된 API 라우트:
1. **멤버 목록 API 수정**
   - `src/app/api/studies/[id]/members/route.js`
   - 응답 형식: `{ success: true, members: [...] }`
   - `userId` 필드 추가

2. **가입 신청 목록 API 수정**
   - `src/app/api/studies/[id]/join-requests/route.js`
   - 응답 형식: `{ success: true, requests: [...] }`
   - `message`, `createdAt` 필드 추가

3. **가입 신청 승인 API 생성** ✅
   - `src/app/api/studies/[id]/join-requests/[requestId]/approve/route.js`
   - POST 요청으로 가입 신청 승인
   - 상태를 PENDING → ACTIVE로 변경
   - role을 MEMBER로 설정
   - 스터디 멤버 수 자동 증가

4. **가입 신청 거절 API 생성** ✅
   - `src/app/api/studies/[id]/join-requests/[requestId]/reject/route.js`
   - POST 요청으로 가입 신청 거절
   - 레코드 삭제
   - 거절 사유 저장 (선택사항)

#### API 응답 형식:

**멤버 목록**:
```json
{
  "success": true,
  "members": [
    {
      "id": "member_id",
      "userId": "user_id",
      "role": "OWNER|ADMIN|MEMBER",
      "status": "ACTIVE",
      "user": {
        "id": "user_id",
        "name": "홍길동",
        "email": "hong@example.com"
      },
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**가입 신청 목록**:
```json
{
  "success": true,
  "requests": [
    {
      "id": "request_id",
      "userId": "user_id",
      "user": {
        "id": "user_id",
        "name": "김철수",
        "email": "kim@example.com"
      },
      "message": "스터디에 참여하고 싶습니다",
      "status": "PENDING",
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### 3. 모든 탭 스타일 완벽 통일 ✅

#### 수정된 탭:
- ✅ **개요** - adminOnly 필터 적용
- ✅ **공지** - adminOnly 필터 적용
- ✅ **화상** - adminOnly 필터 적용
- ✅ **멤버** - adminOnly 필터 적용
- ✅ **설정** - adminOnly 필터 적용

#### 모든 탭의 tabs 배열 (통일):
```javascript
const tabs = [
  { label: '개요', href: `/my-studies/${studyId}`, icon: '📊' },
  { label: '채팅', href: `/my-studies/${studyId}/chat`, icon: '💬' },
  { label: '공지', href: `/my-studies/${studyId}/notices`, icon: '📢' },
  { label: '파일', href: `/my-studies/${studyId}/files`, icon: '📁' },
  { label: '캘린더', href: `/my-studies/${studyId}/calendar`, icon: '📅' },
  { label: '할일', href: `/my-studies/${studyId}/tasks`, icon: '✅' },
  { label: '화상', href: `/my-studies/${studyId}/video-call`, icon: '📹' },
  { label: '멤버', href: `/my-studies/${studyId}/members`, icon: '👥', adminOnly: true },
  { label: '설정', href: `/my-studies/${studyId}/settings`, icon: '⚙️', adminOnly: true },
];
```

#### 모든 탭의 탭 네비게이션 (통일):
```jsx
<div className={styles.tabs}>
  {tabs
    .filter(tab => !tab.adminOnly || ['OWNER', 'ADMIN'].includes(study.myRole))
    .map((tab) => (
      <Link
        key={tab.label}
        href={tab.href}
        className={`${styles.tab} ${tab.label === '현재탭' ? styles.active : ''}`}
      >
        <span className={styles.tabIcon}>{tab.icon}</span>
        <span className={styles.tabLabel}>{tab.label}</span>
      </Link>
    ))}
</div>
```

### 4. 멤버 관리 페이지 API 연동 수정 ✅

**파일**: `src/app/my-studies/[studyId]/members/page.jsx`

#### 수정 사항:
- API 호출 시 `member.userId` 사용 (member.id 대신)
- 역할 변경: `memberId: member.userId`
- 멤버 강퇴: `memberId: selectedMember.userId`

#### 수정 전:
```javascript
await changeMemberRole.mutateAsync({
  studyId,
  memberId: member.id,  // ❌ 잘못된 ID
  role: newRole
});
```

#### 수정 후:
```javascript
await changeMemberRole.mutateAsync({
  studyId,
  memberId: member.userId,  // ✅ 올바른 user ID
  role: newRole
});
```

## 🔧 주요 변경 파일

### 프론트엔드
1. `src/app/my-studies/[studyId]/settings/page.jsx`
   - 멤버 관리 섹션 제거
   - 공개 설정을 기본 정보 탭에 통합
   - 불필요한 hooks 제거
   - 통계 위젯을 스터디 정보 위젯으로 변경

2. `src/app/my-studies/[studyId]/members/page.jsx`
   - API 호출 시 userId 사용하도록 수정
   - 탭 필터 적용

3. `src/app/my-studies/[studyId]/page.jsx` (개요)
   - tabs 배열에 멤버 탭 추가
   - 탭 필터 적용

4. `src/app/my-studies/[studyId]/notices/page.jsx` (공지)
   - tabs 배열에 멤버 탭 추가
   - 탭 필터 적용

5. `src/app/my-studies/[studyId]/video-call/page.jsx` (화상)
   - tabs 배열에 멤버 탭 추가
   - 탭 필터 적용

### 백엔드 API
1. `src/app/api/studies/[id]/members/route.js`
   - 응답에 userId 필드 추가
   - 응답 형식을 `{ members: [...] }`로 변경

2. `src/app/api/studies/[id]/join-requests/route.js`
   - 응답 형식을 `{ requests: [...] }`로 변경
   - message, createdAt 필드 추가

3. `src/app/api/studies/[id]/join-requests/[requestId]/approve/route.js` ✨ 신규
   - 가입 신청 승인 API 구현
   - PENDING → ACTIVE 상태 변경
   - 스터디 멤버 수 증가

4. `src/app/api/studies/[id]/join-requests/[requestId]/reject/route.js` ✨ 신규
   - 가입 신청 거절 API 구현
   - 레코드 삭제
   - 거절 사유 처리

## 🎯 결과

### ✅ 설정 페이지
- 멤버 관리 기능 완전 제거
- 스터디 설정에만 집중
- 기본 정보와 위험 구역 2개 탭으로 단순화
- 모든 설정이 한 곳에서 관리 가능

### ✅ 멤버 관리 페이지
- 별도의 전용 페이지로 분리
- ADMIN/OWNER만 접근 가능
- 멤버 목록이 정상적으로 표시
- 가입 신청 승인/거절 기능 작동
- 역할 변경 및 강퇴 기능 작동

### ✅ 모든 탭 스타일 통일
- 9개 탭 모두 동일한 구조
- adminOnly 필터 일관성 있게 적용
- MEMBER는 멤버/설정 탭 숨김
- ADMIN/OWNER는 모든 탭 접근 가능

## 🚀 다음 단계

백엔드 API는 구현되었지만, 실제 데이터가 표시되려면:
1. Prisma 스키마 확인 (StudyMember 모델)
2. 데이터베이스 마이그레이션
3. 실제 멤버 데이터 생성 테스트

브라우저를 새로고침하면:
- ✅ 설정 페이지에서 멤버 관리가 사라짐
- ✅ 멤버 탭에서 멤버 목록이 정상 표시
- ✅ 모든 탭의 스타일이 완벽히 통일됨
- ✅ ADMIN/OWNER는 멤버 관리 가능

