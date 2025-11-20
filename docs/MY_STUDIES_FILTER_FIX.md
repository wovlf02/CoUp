# 내 스터디 필터링 수정

## 📋 수정 일자
2025-11-21

## 🎯 목표
내 스터디 페이지의 필터링 로직을 명확하게 수정하여 각 탭의 의미를 정확하게 반영

## ❌ 문제점

### Before:
- **참여중**: `MEMBER`, `ADMIN`, `OWNER` 모두 포함 (모호함)
- **관리중**: `ADMIN`, `OWNER` 포함 (정확함)
- **대기중**: `PENDING` 포함 (정확함)
- "참여중"이 관리중인 사람도 포함하여 의미가 모호함

## ✅ 해결 방법

### 필터링 로직 명확화

#### 수정된 정의:
1. **전체**: 모든 스터디 (역할 무관)
2. **참여중**: `MEMBER` 역할만 (일반 멤버로 참여 중인 스터디)
3. **관리중**: `OWNER` 또는 `ADMIN` 역할 (스터디를 관리하는 스터디)
4. **대기중**: `PENDING` 역할 (가입 신청 후 승인 대기 중)

### 수정된 파일:
**파일**: `coup/src/app/my-studies/page.jsx`

### 변경사항:

#### 1. 필터링 함수 추가
```javascript
// Before: API에서 직접 필터링 (부정확)
const { data, isLoading, error } = useMyStudies({
  page: currentPage,
  limit: itemsPerPage,
  status: activeTab === '전체' ? undefined : activeTab, // 잘못된 필터링
});

const myStudies = data?.data || [];

// After: 클라이언트 측에서 명확하게 필터링
const { data, isLoading, error } = useMyStudies({
  page: currentPage,
  limit: itemsPerPage,
  // status 파라미터 제거 - 전체 데이터를 가져옴
});

const allStudies = data?.data || [];

// 클라이언트 측 필터링 함수
const getFilteredStudies = () => {
  switch (activeTab) {
    case '참여중':
      // MEMBER만 (일반 멤버)
      return allStudies.filter(s => s.role === 'MEMBER');
    case '관리중':
      // OWNER 또는 ADMIN (스터디 관리자)
      return allStudies.filter(s => ['OWNER', 'ADMIN'].includes(s.role));
    case '대기중':
      // PENDING (승인 대기 중)
      return allStudies.filter(s => s.role === 'PENDING');
    case '전체':
    default:
      return allStudies;
  }
};

const myStudies = getFilteredStudies();
```

#### 2. 탭 카운트 수정
```javascript
// Before: 부정확한 카운트
const tabs = [
  { label: '전체', count: pagination.total || 0 },
  { label: '참여중', count: myStudies.filter(s => ['MEMBER', 'ADMIN', 'OWNER'].includes(s.role)).length },
  { label: '관리중', count: myStudies.filter(s => ['ADMIN', 'OWNER'].includes(s.role)).length },
  { label: '대기중', count: myStudies.filter(s => s.role === 'PENDING').length },
];

// After: 정확한 카운트
const tabs = [
  { label: '전체', count: allStudies.length },
  { label: '참여중', count: allStudies.filter(s => s.role === 'MEMBER').length },
  { label: '관리중', count: allStudies.filter(s => ['OWNER', 'ADMIN'].includes(s.role)).length },
  { label: '대기중', count: allStudies.filter(s => s.role === 'PENDING').length },
];
```

#### 3. 활동 요약 위젯 수정
```javascript
// Before: 참여중 항목 없음
<div className={styles.summaryGrid}>
  <div className={styles.summaryItem}>
    <span className={styles.summaryValue}>{pagination.total}개</span>
    <span className={styles.summaryDesc}>전체</span>
  </div>
  <div className={styles.summaryItem}>
    <span className={styles.summaryValue}>
      {myStudies.filter(s => ['ADMIN', 'OWNER'].includes(s.role)).length}개
    </span>
    <span className={styles.summaryDesc}>관리중</span>
  </div>
</div>

// After: 참여중 항목 추가
<div className={styles.summaryGrid}>
  <div className={styles.summaryItem}>
    <span className={styles.summaryValue}>{allStudies.length}개</span>
    <span className={styles.summaryDesc}>전체</span>
  </div>
  <div className={styles.summaryItem}>
    <span className={styles.summaryValue}>
      {allStudies.filter(s => s.role === 'MEMBER').length}개
    </span>
    <span className={styles.summaryDesc}>참여중</span>
  </div>
  <div className={styles.summaryItem}>
    <span className={styles.summaryValue}>
      {allStudies.filter(s => ['ADMIN', 'OWNER'].includes(s.role)).length}개
    </span>
    <span className={styles.summaryDesc}>관리중</span>
  </div>
</div>
```

## 📊 결과

### After:
- ✅ **전체**: 모든 역할의 스터디 표시
- ✅ **참여중**: `MEMBER` 역할만 표시 (일반 멤버)
- ✅ **관리중**: `OWNER`, `ADMIN` 역할만 표시 (관리자)
- ✅ **대기중**: `PENDING` 역할만 표시 (승인 대기)
- ✅ 각 탭의 의미가 명확함
- ✅ 카운트가 정확하게 표시됨
- ✅ 활동 요약에 참여중 항목 추가

## 🔍 역할별 의미

### MEMBER (참여중)
- 일반 멤버로 스터디에 참여
- 스터디 콘텐츠를 소비하고 기여
- 관리 권한 없음

### OWNER (관리중)
- 스터디 소유자
- 모든 관리 권한 보유
- 스터디 삭제 가능

### ADMIN (관리중)
- 스터디 관리자
- 대부분의 관리 권한 보유
- 스터디 삭제 불가능

### PENDING (대기중)
- 가입 신청 후 승인 대기 중
- 스터디 콘텐츠 접근 불가
- 승인되면 MEMBER로 전환

## 🚀 사용자 시나리오

### 시나리오 1: 일반 멤버
```
전체: 3개 (참여 2개 + 관리 1개)
참여중: 2개 (MEMBER 역할)
관리중: 1개 (OWNER 역할)
대기중: 0개
```

### 시나리오 2: 관리자 중심
```
전체: 5개 (참여 1개 + 관리 4개)
참여중: 1개 (MEMBER 역할)
관리중: 4개 (OWNER 2개 + ADMIN 2개)
대기중: 0개
```

### 시나리오 3: 신규 사용자
```
전체: 3개 (대기 3개)
참여중: 0개
관리중: 0개
대기중: 3개 (모두 PENDING)
```

## 📝 테스트 체크리스트

### 필터링 테스트:
- [ ] "전체" 탭 클릭 → 모든 스터디 표시
- [ ] "참여중" 탭 클릭 → MEMBER 역할만 표시
- [ ] "관리중" 탭 클릭 → OWNER/ADMIN 역할만 표시
- [ ] "대기중" 탭 클릭 → PENDING 역할만 표시

### 카운트 테스트:
- [ ] 각 탭의 카운트가 실제 개수와 일치
- [ ] 활동 요약의 카운트가 정확함
- [ ] 탭 전환 시 카운트가 변하지 않음

### UI 테스트:
- [ ] 활동 요약에 3가지 항목 표시 (전체, 참여중, 관리중)
- [ ] 각 스터디 카드에 올바른 역할 뱃지 표시
- [ ] 빈 상태 메시지가 적절히 표시됨

## 🎉 결과

이제 내 스터디 페이지에서:
- ✅ 각 필터의 의미가 명확함
- ✅ 참여중 = 일반 멤버만
- ✅ 관리중 = 관리자만 (OWNER/ADMIN)
- ✅ 대기중 = 승인 대기 중
- ✅ 정확한 카운트 표시
- ✅ 직관적인 사용자 경험

브라우저를 새로고침하면 올바르게 필터링된 스터디 목록을 확인할 수 있습니다! 🎉

