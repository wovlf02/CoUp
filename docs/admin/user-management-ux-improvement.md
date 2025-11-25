# 사용자 관리 페이지 UX 개선 설계

## 개요
관리자 대시보드의 사용자 관리 페이지를 UX 극대화를 목표로 전면 개선합니다.
기존의 단일 파일 구조를 모듈화하여 유지보수성을 향상시키고, 사용자 경험을 개선합니다.

## 현재 상태 분석

### 기존 구조
- **파일**: `src/app/admin/users/page.jsx` (약 400줄)
- **스타일**: `src/app/admin/users/page.module.css`
- **주요 기능**:
  - 사용자 목록 조회 및 테이블 표시
  - 검색 및 필터링 (상태별, 이름/이메일)
  - 사용자 선택 및 일괄 작업
  - 페이지네이션
  - 사용자 상세 모달
  - 계정 정지 모달

### 현재 문제점
1. **파일 크기**: 단일 파일에 모든 로직 집중 (400줄+)
2. **컴포넌트 분리 부족**: 테이블, 필터, 페이지네이션 등 미분리
3. **CSS 클래스 중복 가능성**: 전역 스타일과 모듈 스타일 혼용
4. **UX 개선 여지**: 
   - 사용자 카드 뷰 옵션 없음
   - 고급 필터링 기능 미구현
   - 정렬 기능 제한적
   - 실시간 검색 미적용
   - 로딩 상태 표시 개선 필요

## 개선 목표

### 1. 모듈화 구조
각 기능을 독립적인 컴포넌트로 분리하여 재사용성과 유지보수성 향상

### 2. UX 극대화
- **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
- **직관적인 UI**: 명확한 시각적 피드백
- **빠른 상호작용**: 실시간 검색, 즉각적인 필터링
- **다양한 뷰 옵션**: 테이블 뷰, 카드 뷰
- **향상된 정렬**: 다중 컬럼 정렬
- **접근성**: 키보드 네비게이션, 스크린 리더 지원

### 3. 성능 최적화
- 가상 스크롤링 (대량 데이터 처리)
- 디바운싱 검색
- 메모이제이션 활용

## 새로운 파일 구조

```
src/
├── app/
│   └── admin/
│       └── users/
│           ├── page.jsx (메인 페이지, 100줄 이하)
│           └── page.module.css (최소한의 레이아웃 스타일)
│
├── components/
│   └── admin/
│       └── users/
│           ├── UserListTable/
│           │   ├── UserListTable.jsx (테이블 컴포넌트)
│           │   ├── UserListTable.module.css
│           │   ├── UserTableRow.jsx (테이블 행)
│           │   └── UserTableRow.module.css
│           │
│           ├── UserListCards/
│           │   ├── UserListCards.jsx (카드 뷰 컴포넌트)
│           │   ├── UserListCards.module.css
│           │   ├── UserCard.jsx (개별 카드)
│           │   └── UserCard.module.css
│           │
│           ├── UserFilters/
│           │   ├── UserFilters.jsx (필터 바)
│           │   ├── UserFilters.module.css
│           │   ├── UserSearchBar.jsx (검색 바)
│           │   └── UserSearchBar.module.css
│           │
│           ├── UserPagination/
│           │   ├── UserPagination.jsx
│           │   └── UserPagination.module.css
│           │
│           ├── UserBulkActions/
│           │   ├── UserBulkActions.jsx (일괄 작업 바)
│           │   └── UserBulkActions.module.css
│           │
│           ├── UserStats/
│           │   ├── UserStatsWidget.jsx (통계 위젯)
│           │   └── UserStatsWidget.module.css
│           │
│           └── UserModals/
│               ├── UserDetailModal.jsx (기존 위치에서 이동)
│               ├── UserDetailModal.module.css
│               ├── SuspendUserModal.jsx (기존 위치에서 이동)
│               ├── SuspendUserModal.module.css
│               ├── BulkActionModal.jsx (신규)
│               └── BulkActionModal.module.css
│
└── lib/
    └── hooks/
        └── admin/
            ├── useUserFilters.js (필터링 로직)
            ├── useUserSearch.js (검색 로직)
            └── useUserSelection.js (선택 로직)
```

## 컴포넌트 상세 설계

### 1. UserListTable
**책임**: 사용자 목록을 테이블 형태로 표시
**Props**:
- `users`: 표시할 사용자 목록
- `selectedUsers`: 선택된 사용자 ID 배열
- `onSelectUser`: 사용자 선택 핸들러
- `onSelectAll`: 전체 선택 핸들러
- `onUserClick`: 사용자 클릭 핸들러
- `sortConfig`: 정렬 설정
- `onSort`: 정렬 변경 핸들러

**고유 클래스명**:
- `.userListTable`
- `.userListTableHeader`
- `.userListTableBody`
- `.userListTableSortable`

### 2. UserTableRow
**책임**: 개별 사용자 행 렌더링
**Props**:
- `user`: 사용자 객체
- `isSelected`: 선택 여부
- `onSelect`: 선택 핸들러
- `onClick`: 클릭 핸들러

**고유 클래스명**:
- `.userTableRowContainer`
- `.userTableRowCell`
- `.userTableRowAvatar`
- `.userTableRowName`
- `.userTableRowStatus`

### 3. UserListCards
**책임**: 사용자 목록을 카드 형태로 표시
**Props**: UserListTable과 유사
**고유 클래스명**:
- `.userListCardsGrid`
- `.userListCardsContainer`

### 4. UserCard
**책임**: 개별 사용자 카드 렌더링
**Props**: UserTableRow와 유사
**고유 클래스명**:
- `.userCardContainer`
- `.userCardHeader`
- `.userCardBody`
- `.userCardFooter`
- `.userCardAvatar`
- `.userCardName`
- `.userCardEmail`
- `.userCardStats`

### 5. UserFilters
**책임**: 필터 옵션 제공 (상태, 가입 방법, 날짜 범위)
**Props**:
- `filters`: 현재 필터 상태
- `onChange`: 필터 변경 핸들러
- `onReset`: 필터 초기화 핸들러

**고유 클래스명**:
- `.userFiltersBar`
- `.userFiltersGroup`
- `.userFiltersSelect`
- `.userFiltersDatePicker`
- `.userFiltersResetBtn`

### 6. UserSearchBar
**책임**: 실시간 검색 기능
**Props**:
- `value`: 검색어
- `onChange`: 검색어 변경 핸들러
- `placeholder`: 플레이스홀더

**고유 클래스명**:
- `.userSearchBarContainer`
- `.userSearchBarInput`
- `.userSearchBarIcon`
- `.userSearchBarClearBtn`

### 7. UserPagination
**책임**: 페이지네이션 UI 및 로직
**Props**:
- `currentPage`: 현재 페이지
- `totalPages`: 전체 페이지 수
- `totalItems`: 전체 항목 수
- `itemsPerPage`: 페이지당 항목 수
- `onPageChange`: 페이지 변경 핸들러
- `onItemsPerPageChange`: 페이지당 항목 수 변경 핸들러

**고유 클래스명**:
- `.userPaginationContainer`
- `.userPaginationInfo`
- `.userPaginationButtons`
- `.userPaginationPageBtn`
- `.userPaginationPageBtnActive`
- `.userPaginationPerPageSelect`

### 8. UserBulkActions
**책임**: 선택된 사용자에 대한 일괄 작업 UI
**Props**:
- `selectedCount`: 선택된 사용자 수
- `onEmailSend`: 이메일 발송 핸들러
- `onSuspend`: 일괄 정지 핸들러
- `onDelete`: 일괄 삭제 핸들러
- `onExport`: 내보내기 핸들러

**고유 클래스명**:
- `.userBulkActionsBar`
- `.userBulkActionsInfo`
- `.userBulkActionsButtons`
- `.userBulkActionsBtn`
- `.userBulkActionsBtnDanger`

### 9. UserStatsWidget
**책임**: 사용자 통계 표시 (우측 위젯)
**Props**:
- `stats`: 통계 객체

**고유 클래스명**:
- `.userStatsWidgetContainer`
- `.userStatsWidgetItem`
- `.userStatsWidgetLabel`
- `.userStatsWidgetValue`

## Custom Hooks 설계

### useUserFilters
```javascript
// 필터 상태 관리 및 필터링 로직
const {
  filters,
  setStatusFilter,
  setProviderFilter,
  setDateRangeFilter,
  resetFilters,
  applyFilters
} = useUserFilters(users)
```

### useUserSearch
```javascript
// 디바운싱 검색 로직
const {
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching
} = useUserSearch(users, { debounceMs: 300 })
```

### useUserSelection
```javascript
// 사용자 선택 상태 관리
const {
  selectedUsers,
  selectUser,
  selectAll,
  deselectAll,
  isSelected,
  isAllSelected
} = useUserSelection()
```

## UI/UX 개선 사항

### 1. 뷰 전환
- 테이블 뷰 / 카드 뷰 토글 버튼
- 사용자 선호도 localStorage 저장

### 2. 고급 필터
- 다중 선택 필터
- 날짜 범위 선택 (가입일, 마지막 활동일)
- 가입 방법별 필터
- 활동 상태별 필터

### 3. 정렬 기능
- 컬럼 헤더 클릭으로 정렬
- 오름차순/내림차순 토글
- 정렬 상태 시각적 표시

### 4. 실시간 검색
- 디바운싱 적용 (300ms)
- 검색 중 로딩 표시
- 검색 결과 하이라이팅
- 검색어 자동완성 (옵션)

### 5. 로딩 상태
- 스켈레톤 UI
- 프로그레스 바
- 에러 상태 표시

### 6. 반응형 디자인
- 모바일: 카드 뷰 우선
- 태블릿: 간소화된 테이블
- 데스크톱: 전체 테이블

### 7. 접근성
- 키보드 네비게이션 (Tab, Enter, Space)
- ARIA 레이블
- 포커스 표시
- 스크린 리더 지원

### 8. 애니메이션
- 부드러운 트랜지션
- 호버 효과
- 선택 피드백

## 구현 순서

1. ✅ **백업 생성** (완료)
2. ✅ **문서화** (진행 중)
3. **Custom Hooks 생성**
   - useUserFilters.js
   - useUserSearch.js
   - useUserSelection.js
4. **기본 컴포넌트 생성**
   - UserSearchBar
   - UserFilters
   - UserPagination
5. **테이블 컴포넌트 생성**
   - UserTableRow
   - UserListTable
6. **카드 컴포넌트 생성**
   - UserCard
   - UserListCards
7. **추가 컴포넌트 생성**
   - UserBulkActions
   - UserStatsWidget
8. **메인 페이지 리팩토링**
   - 컴포넌트 통합
   - 상태 관리 단순화
9. **스타일 최적화**
   - CSS 모듈 분리
   - 반응형 스타일 적용
10. **테스트 및 검증**
    - 기능 테스트
    - UX 검증
    - 성능 측정

## 예상 효과

### 코드 품질
- 파일당 평균 코드 라인: 50-150줄
- 컴포넌트 재사용성 향상
- 테스트 용이성 증가

### 사용자 경험
- 직관적인 인터페이스
- 빠른 반응 속도
- 다양한 작업 옵션

### 유지보수성
- 명확한 책임 분리
- 독립적인 컴포넌트 수정
- 확장 가능한 구조

## 버전 정보
- **작성일**: 2025-11-25
- **버전**: 1.0.0
- **작성자**: GitHub Copilot
- **상태**: 설계 완료, 구현 예정

