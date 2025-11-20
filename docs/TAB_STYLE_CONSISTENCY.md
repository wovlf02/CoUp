# 모든 탭 스타일 일관성 완료 및 멤버 관리 탭 추가

## 📋 수정 일자
2025-01-21

## 🎯 목표
1. 공지 탭의 UI 스타일을 기준으로 모든 탭의 헤더 및 탭 네비게이션 스타일을 완전히 일관되게 통일
2. ADMIN/OWNER 전용 멤버 관리 탭 추가 및 구현

## ✅ 완료된 작업

### 1. 스타일 통일
모든 탭(개요, 채팅, 공지, 파일, 캘린더, 할일, 화상, 멤버, 설정)의 헤더 및 탭 네비게이션 스타일을 공지 탭 기준으로 완전히 통일

### 2. 멤버 관리 탭 추가
- ✅ 설계 문서 작성: `docs/screens/my-studies/members.md`
- ✅ 페이지 구현: `src/app/my-studies/[studyId]/members/page.jsx`
- ✅ 스타일 작성: `src/app/my-studies/[studyId]/members/page.module.css`
- ✅ API 훅 추가: `useJoinRequests`, `useApproveJoinRequest`, `useRejectJoinRequest` 등
- ✅ API 함수 추가: studyApi에 가입 신청 관련 함수들 추가

## 🎨 통일된 스타일 (모든 탭 공통)

### 헤더 영역
```css
.studyHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border: 1px solid;
  border-radius: 12px;
}
/* hover 효과 없음 - 깔끔한 정적 디자인 */
```

### 탭 네비게이션
```css
.tabs {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow-x: auto;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: var(--gray-600);
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  text-decoration: none;
  white-space: nowrap;
}

.tab:hover {
  background: var(--gray-100);
  color: var(--gray-900);
}

.tab.active {
  background: var(--primary-600);
  color: white;
}
```

## 📊 검증 결과

### 모든 탭 스타일 확인:
- ✅ **개요** (`page.module.css`): 스타일 통일 완료
- ✅ **채팅** (`chat/page.module.css`): 스타일 통일 완료
- ✅ **공지** (`notices/page.module.css`): 기준 스타일
- ✅ **파일** (`files/page.module.css`): 스타일 통일 완료
- ✅ **캘린더** (`calendar/page.module.css`): 스타일 통일 완료
- ✅ **할일** (`tasks/page.module.css`): 스타일 통일 완료
- ✅ **화상** (`video-call/page.module.css`): 스타일 통일 및 CSS 중복 제거 완료
- ✅ **멤버** (`members/page.module.css`): 신규 추가 완료
- ✅ **설정** (`settings/page.module.css`): 스타일 통일 완료

## 👥 멤버 관리 탭 주요 기능

### 1. 멤버 목록 관리
- 현재 스터디 멤버 표시
- 역할별 필터링 (OWNER, ADMIN, MEMBER)
- 멤버 검색 기능
- 멤버 정보 표시 (이름, 이메일, 가입일, 역할)

### 2. 역할 관리 (OWNER만 가능)
- 멤버를 ADMIN으로 승격
- ADMIN을 MEMBER로 강등

### 3. 멤버 강퇴
- OWNER: 모든 멤버 강퇴 가능 (OWNER 제외)
- ADMIN: MEMBER만 강퇴 가능
- 강퇴 사유 입력 (선택사항)

### 4. 가입 신청 관리
- 대기 중인 가입 신청 목록 표시
- 신청자 정보 및 메시지 확인
- 승인/거절 기능
- 거절 시 사유 입력 (선택사항)

### 5. 통계 및 현황
- 총 멤버 수
- 역할별 인원 수 (OWNER, ADMIN, MEMBER)
- 대기 중인 신청 수

## 🔌 추가된 API

### API 훅 (useApi.js)
```javascript
useJoinRequests(studyId)           // 가입 신청 목록 조회
useApproveJoinRequest()            // 가입 신청 승인
useRejectJoinRequest()             // 가입 신청 거절
useChangeMemberRole()              // 멤버 역할 변경
useKickMember()                    // 멤버 강퇴
```

### API 함수 (api/index.js)
```javascript
studyApi.getJoinRequests(studyId)
studyApi.approveJoinRequest(studyId, requestId)
studyApi.rejectJoinRequest(studyId, requestId, reason)
studyApi.changeMemberRole(studyId, memberId, role)
studyApi.kickMember(studyId, memberId, reason)
```

## 📱 탭 구조 (전체)

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

## 🔒 권한 관리

### OWNER
- 모든 멤버 관리 권한
- ADMIN 임명/해임
- 모든 멤버 강퇴 (본인 제외)
- 가입 신청 승인/거절

### ADMIN
- MEMBER 강퇴만 가능
- 가입 신청 승인/거절

### MEMBER
- 멤버 관리 탭 접근 불가

## 🚀 결과

이제 **모든 탭**에서:
- ✅ 완전히 동일한 헤더 구조와 스타일
- ✅ 완전히 동일한 탭 네비게이션 디자인
- ✅ hover 효과 없음 (공지 탭 기준)
- ✅ 100% UI 일관성 달성
- ✅ ADMIN/OWNER 전용 멤버 관리 탭 추가
- ✅ 가입 신청 승인/거절 기능 구현

사용자가 **개요, 채팅, 공지, 파일, 캘린더, 할일, 화상, 멤버, 설정** 어느 탭을 이동하더라도 **완전히 동일한 UI 경험**을 제공합니다!

## 📂 생성된 파일

### 문서
- `docs/screens/my-studies/members.md` - 멤버 관리 페이지 설계 문서

### 구현
- `src/app/my-studies/[studyId]/members/page.jsx` - 멤버 관리 페이지
- `src/app/my-studies/[studyId]/members/page.module.css` - 멤버 관리 스타일

### API
- `src/lib/hooks/useApi.js` - 가입 신청 관련 훅 추가
- `src/lib/api/index.js` - 가입 신청 관련 API 함수 추가


## ✅ 수정된 파일

### 1. 개요 탭
**파일**: `src/app/my-studies/[studyId]/page.module.css`

#### 변경사항:
- `.studyHeader:hover` 제거 (transform, transition 제거)
- 공지 탭과 동일하게 hover 효과 없음

```css
/* Before */
.studyHeader {
  transition: all 0.3s ease;
}
.studyHeader:hover {
  transform: translateY(-2px);
}

/* After */
.studyHeader {
  /* transition, hover 없음 */
}
```

### 2. 설정 탭
**파일**: `src/app/my-studies/[studyId]/settings/page.module.css`

#### 변경사항:
- `.studyHeader:hover` 제거 (box-shadow, transform 제거)

```css
/* Before */
.studyHeader:hover {
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
  transform: translateY(-2px);
}

/* After */
/* hover 스타일 완전히 제거 */
```

### 3. 화상 탭
**파일**: 
- `src/app/my-studies/[studyId]/video-call/page.jsx`
- `src/app/my-studies/[studyId]/video-call/page.module.css`

#### JSX 변경사항:
waiting 접두사 제거, 공지 탭과 동일한 클래스명 사용

```jsx
/* Before */
<div className={styles.waitingHeader}>
  <button className={styles.waitingBackButton}>
  <div className={styles.waitingStudyHeader}>
    <div className={styles.waitingStudyInfo}>
      <span className={styles.waitingEmoji}>
      <h1 className={styles.waitingStudyName}>
      <p className={styles.waitingStudyMeta}>
    <span className={styles.waitingRoleBadge}>
<div className={styles.waitingTabs}>
  <Link className={styles.waitingTab}>
    <span className={styles.waitingTabIcon}>
    <span className={styles.waitingTabLabel}>

/* After */
<div className={styles.header}>
  <button className={styles.backButton}>
  <div className={styles.studyHeader}>
    <div className={styles.studyInfo}>
      <span className={styles.emoji}>
      <h1 className={styles.studyName}>
      <p className={styles.studyMeta}>
    <span className={styles.roleBadge}>
<div className={styles.tabs}>
  <Link className={styles.tab}>
    <span className={styles.tabIcon}>
    <span className={styles.tabLabel}>
```

#### CSS 변경사항:
공지 탭과 완전히 동일한 스타일 추가

```css
/* 공지 탭과 동일한 스타일 추가 */
.header {
  margin-bottom: 12px;
}

.backButton {
  padding: 8px 16px;
  background: var(--gray-100);
  border: none;
  border-radius: 8px;
  color: var(--gray-700);
  font-size: 0.875rem;
  cursor: pointer;
  margin-bottom: 12px;
  transition: all 0.2s;
}

.backButton:hover {
  background: var(--gray-200);
}

.studyHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border: 1px solid;
  border-radius: 12px;
}

.studyInfo {
  display: flex;
  align-items: center;
  gap: 16px;
}

.emoji {
  font-size: 3rem;
}

.studyName {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 4px 0;
}

.studyMeta {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin: 0;
}

.roleBadge {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
}

.roleBadge.owner {
  background: #fee2e2;
  color: #dc2626;
}

.roleBadge.admin {
  background: #ede9fe;
  color: #7c3aed;
}

.roleBadge.member {
  background: #f3f4f6;
  color: #6b7280;
}

/* 탭 네비게이션 */
.tabs {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow-x: auto;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: var(--gray-600);
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  text-decoration: none;
  white-space: nowrap;
}

.tab:hover {
  background: var(--gray-100);
  color: var(--gray-900);
}

.tab.active {
  background: var(--primary-600);
  color: white;
}

.tabIcon {
  font-size: 1.125rem;
}

.tabLabel {
  font-size: 0.875rem;
}
```

## 🎨 통일된 스타일 (모든 탭 공통)

### 헤더 영역
```css
.studyHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border: 1px solid;
  border-radius: 12px;
}
/* hover 효과 없음 */
```

### 특징:
- ✅ `padding: 16px 20px`
- ✅ `border: 1px solid` (색상은 `getStudyHeaderStyle(studyId)`에서 설정)
- ✅ `border-radius: 12px`
- ❌ hover 시 transform 없음
- ❌ hover 시 box-shadow 없음
- ❌ transition 없음

### 탭 네비게이션
```css
.tabs {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  margin-bottom: 16px;
  overflow-x: auto;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: var(--gray-600);
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  text-decoration: none;
  white-space: nowrap;
}

.tab:hover {
  background: var(--gray-100);
  color: var(--gray-900);
}

.tab.active {
  background: var(--primary-600);
  color: white;
}
```

### 역할 배지
```css
.roleBadge {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
}

.roleBadge.owner {
  background: #fee2e2;
  color: #dc2626;
}

.roleBadge.admin {
  background: #ede9fe;
  color: #7c3aed;
}

.roleBadge.member {
  background: #f3f4f6;
  color: #6b7280;
}
```

## 📊 검증 결과

### 모든 탭 스타일 확인:
- ✅ **개요** (`page.module.css`): hover 효과 제거 완료
- ✅ **채팅** (`chat/page.module.css`): 이미 공지 탭과 동일
- ✅ **공지** (`notices/page.module.css`): 기준 스타일 (변경 없음)
- ✅ **파일** (`files/page.module.css`): 이미 공지 탭과 동일
- ✅ **캘린더** (`calendar/page.module.css`): 이미 공지 탭과 동일
- ✅ **할일** (`tasks/page.module.css`): 이미 공지 탭과 동일
- ✅ **화상** (`video-call/page.module.css`): 클래스명 및 스타일 통일 완료
- ✅ **설정** (`settings/page.module.css`): hover 효과 제거 완료

## 🚀 결과

이제 **모든 탭**에서:
- ✅ 완전히 동일한 헤더 구조
- ✅ 완전히 동일한 헤더 스타일
- ✅ 완전히 동일한 탭 네비게이션
- ✅ 완전히 동일한 역할 배지
- ✅ hover 효과 없음 (공지 탭 기준)
- ✅ 100% UI 일관성 달성

사용자가 **개요, 채팅, 공지, 파일, 캘린더, 할일, 화상, 설정** 어느 탭을 이동하더라도 **완전히 동일한 UI 경험**을 제공합니다!

## 📝 주의사항

화상 탭의 경우:
- 대기실 화면에서는 공통 스타일 사용
- 통화 중 화면에서는 별도의 3단 레이아웃 사용 (`.container` with `position: fixed`)
- 두 화면 간의 전환이 자연스럽게 이루어짐

