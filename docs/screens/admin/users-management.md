# 18. 관리자 - 사용자 관리 (Admin Users Management)

> **화면 ID**: `ADMIN-02`  
> **라우트**: `/admin/users` ✅ 구현됨
> **파일**: `app/admin/users/page.jsx` ✅
> **레이아웃**: AdminLayout 사용
> **구조**: AdminLayout + adminPageWrapper + adminMainContent + rightWidget (3단 레이아웃)
> **렌더링**: CSR ('use client') ✅
> **권한**: SYSTEM_ADMIN
> **상태관리**: useState (8개 state) ✅
> **페이지네이션**: 완전 구현 (10개씩) ✅

---

## ✅ 실제 구현 상태 (90% 완료)

### 1. 필터 바 (완전 구현) ✅

**상태 필터**:
- ✅ select: 전체/활성/정지/탈퇴
- ✅ onChange로 statusFilter state 관리

**검색 기능**:
- ✅ input: 이름, 이메일 검색
- ✅ onChange로 searchQuery state 관리
- ✅ 실시간 필터링 로직

**고급 검색**:
- ⚠️ 버튼만 존재 (기능 미구현)

**필터링 로직**:
```javascript
const filteredUsers = users.filter(user => {
  if (statusFilter !== 'all' && user.status.toLowerCase() !== statusFilter) {
    return false
  }
  if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
    return false
  }
  return true
})
```

### 2. 사용자 테이블 (완전 구현) ✅

**7개 컬럼**:
1. ✅ 체크박스 (전체 선택/개별 선택)
2. ✅ 사용자 (아바타 + 이름 + 가입방법 아이콘)
3. ✅ 이메일
4. ✅ 가입일 (formatDate)
5. ✅ 활동 (온라인 인디케이터 + 마지막 로그인)
6. ✅ 상태 (활성/정지/탈퇴 뱃지)
7. ✅ 액션 (⋯ 버튼)

**체크박스 기능**:
- ✅ handleSelectAll() - 전체 선택
- ✅ handleSelectUser() - 개별 선택
- ✅ selectedUsers state 배열 관리

**사용자 셀 구조**:
- ✅ 아바타: 이름 첫 글자
- ✅ 이름
- ✅ 가입방법: 🔵 Google / 🐙 GitHub / 📧 Email

**온라인 인디케이터**:
- ✅ 녹색: ACTIVE 상태
- ✅ 회색: 기타 상태

**행 클릭**:
- ✅ handleUserClick() → UserDetailModal 열기

### 3. 일괄 작업 (UI만) ⚠️

**선택 시 표시**:
- ✅ "N명 선택됨" 표시
- ✅ 3개 버튼: 📧 이메일 발송, ⚠️ 계정 정지, 🗑️ 계정 삭제
- ⚠️ 실제 동작 미구현 (버튼만)

### 4. 페이지네이션 (완전 구현) ✅

**구현 완료**:
- ✅ 10개씩 표시 (usersPerPage: 10)
- ✅ currentPage state 관리
- ✅ 이전/다음 버튼 (disabled 처리)
- ✅ 페이지 번호 버튼 (최대 5개)
- ✅ active 스타일
- ✅ 항목 범위 표시 (1-10 / 50)

**계산 로직**:
```javascript
const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
const startIndex = (currentPage - 1) * usersPerPage
const displayedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage)
```

**⚠️ 미구현**:
- 페이지당 항목 수 변경 (select만 존재)

### 5. 모달 (재사용) ✅

**UserDetailModal**:
- ✅ 사용자 상세 정보
- ✅ 이메일 발송 버튼 (alert)
- ✅ 계정 정지/해제 버튼
- ✅ onSuspend → SuspendUserModal 열기

**SuspendUserModal**:
- ✅ 정지 기간/사유 선택
- ✅ onConfirm 핸들러
- ⚠️ 처리 후 users 상태 업데이트 안됨 (TODO 주석)

### 6. 우측 위젯 (100% 완료) ✅

**사용자 통계 위젯**:
- ✅ 전체 사용자 수 (users.length)
- ✅ 활성/정지/탈퇴 수 (filter로 계산)

**빠른 검색 위젯**:
- ✅ 가입 방법별 통계
- ✅ Google/GitHub/Email 수 (filter로 계산)

**빠른 액션 위젯**:
- ✅ 일괄 정지/삭제/엑셀 추출 버튼
- ⚠️ 기능 미구현 (UI만)

### 7. 헬퍼 함수 ✅

- ✅ formatDate() - M/D 형식
- ✅ formatTimeAgo() - 상대 시간
- ✅ handleSelectAll() - 전체 선택
- ✅ handleSelectUser() - 개별 선택

---

## ⚠️ 미구현 항목

- ⚠️ 고급 검색 기능
- ⚠️ 일괄 작업 실제 동작
- ⚠️ 페이지당 항목 수 변경
- ⚠️ API 연동 (mock만)
- ⚠️ 정지 처리 후 상태 업데이트

---

## 💡 특징

**완벽한 필터링**:
- ✅ 상태 + 검색어 동시 필터링
- ✅ 실시간 반영

**페이지네이션 완전 구현**:
- ✅ 실제로 동작하는 페이징
- ✅ 페이지 번호, 이전/다음 모두 구현

**동적 통계**:
- ✅ 모든 위젯 통계가 실시간 계산

**체크박스 관리**:
- ✅ 전체/개별 선택 완벽 구현

---

**다음 화면**: `19_admin-studies.md` (스터디 관리)
