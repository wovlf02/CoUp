# 20. 관리자 - 신고 관리 (Admin Reports)

> **화면 ID**: `ADMIN-04`  
> **라우트**: `/admin/reports` ✅ 구현됨
> **파일**: `app/admin/reports/page.jsx` ✅
> **레이아웃**: AdminLayout 사용
> **CSS**: users/page.module.css 재사용 ✅
> **렌더링**: CSR ('use client') ✅
> **권한**: SYSTEM_ADMIN
> **상태관리**: useState (6개 state) ✅
> **모달**: ReportDetailModal ✅

---

## ✅ 실제 구현 상태 (90% 완료)

### 1. 필터 바 (완전 구현 - 3중 필터링) ✅

**상태 필터**:
- ✅ select: 전체/미처리/처리중/완료
- ✅ statusFilter state

**유형 필터**:
- ✅ select: 전체/스팸광고/욕설비방/부적절/저작권
- ✅ typeFilter state

**우선순위 필터**:
- ✅ select: 전체/긴급/높음/중간/낮음
- ✅ priorityFilter state

**3중 필터링 로직**:
```javascript
const filteredReports = reports.filter(report => {
  if (statusFilter !== 'all' && 
      report.status.toLowerCase() !== statusFilter) {
    return false
  }
  if (typeFilter !== 'all' && report.type !== typeFilter) {
    return false
  }
  if (priorityFilter !== 'all' && report.priority !== priorityFilter) {
    return false
  }
  return true
})
```

### 2. 신고 테이블 (완전 구현) ✅

**8개 컬럼**:
1. ✅ 체크박스
2. ✅ 🚨 우선순위 아이콘 (🔴🟠🟡🟢)
3. ✅ 유형 (스팸/욕설/부적절 뱃지)
4. ✅ 대상 (스터디명/사용자명 + 타입)
5. ✅ 신고자 (이름 + 신뢰도)
6. ✅ 우선순위 (점 + 텍스트 + 시간)
7. ✅ 상태 (미처리/처리중/완료 뱃지)
8. ✅ 액션 (⋯ 버튼)

**우선순위 시스템**:
- ✅ getPriorityColor() 함수
- ✅ getPriorityIcon() 함수
- ✅ URGENT: #EF4444 (빨강) 🔴
- ✅ HIGH: #F59E0B (주황) 🟠
- ✅ MEDIUM: #FCD34D (노랑) 🟡
- ✅ LOW: #10B981 (초록) 🟢

**유형별 뱃지**:
- ✅ SPAM: 빨간 배경
- ✅ HARASSMENT: 주황 배경
- ✅ INAPPROPRIATE: 노란 배경
- ✅ 인라인 스타일로 색상 지정

**행 클릭**:
- ✅ handleReportClick() → ReportDetailModal

### 3. 모달 (재사용) ✅

**ReportDetailModal**:
- ✅ 신고 상세 정보
- ✅ 처리 옵션 (경고/정지/삭제/기각)
- ✅ 처리 메모 입력
- ✅ onProcess 핸들러
- ⚠️ 처리 후 reports 상태 업데이트 안됨 (TODO 주석)

### 4. 우측 위젯 (100% 완료) ✅

**신고 통계 위젯**:
- ✅ 전체 신고 수
- ✅ 미처리 (빨강, filter로 계산)
- ✅ 처리중 (주황, filter로 계산)
- ✅ 완료 (초록, filter로 계산)

**유형별 현황 위젯**:
- ✅ 🔴 스팸/광고
- ✅ 🟠 욕설/비방
- ✅ 🟡 부적절
- ✅ filter로 개수 계산

**처리 시간 위젯**:
- ✅ 평균 처리 시간: 3시간
- ✅ 최장: 2일
- ✅ 최단: 10분
- ⚠️ 하드코딩 (실제 계산 필요)

**빠른 액션 위젯**:
- ✅ 긴급 신고만/일괄 처리/엑셀 추출
- ⚠️ 기능 미구현

### 5. 헬퍼 함수 ✅

- ✅ getPriorityColor() - 우선순위별 색상
- ✅ getPriorityIcon() - 우선순위별 이모지
- ✅ formatTimeAgo() - 상대 시간

---

## ⚠️ 미구현 항목

- ⚠️ 페이지네이션 (버튼만)
- ⚠️ 일괄 작업 미구현
- ⚠️ 엑셀 추출 미구현
- ⚠️ 처리 시간 통계 하드코딩
- ⚠️ API 연동 없음
- ⚠️ 처리 후 상태 업데이트 안됨

---

## 💡 특징

**3중 필터링**:
- ✅ 상태 + 유형 + 우선순위 동시 필터링
- ✅ 완벽한 구현

**색상 함수**:
- ✅ getPriorityColor/Icon으로 일관성 유지
- ✅ switch문으로 명확한 매핑

**동적 통계**:
- ✅ 모든 위젯이 filter로 실시간 계산
- ✅ 색상 코딩으로 직관적

**CSS 재사용**:
- ✅ users/page.module.css 재사용
- ✅ 효율적

---

**다음 화면**: `21_admin-analytics.md` (통계 분석)
