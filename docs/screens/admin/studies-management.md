# 19. 관리자 - 스터디 관리 (Admin Studies Management)

> **화면 ID**: `ADMIN-03`  
> **라우트**: `/admin/studies` ✅ 구현됨
> **파일**: `app/admin/studies/page.jsx` ✅
> **레이아웃**: AdminLayout 사용
> **CSS**: users/page.module.css 재사용 ✅
> **렌더링**: CSR ('use client') ✅
> **권한**: SYSTEM_ADMIN
> **상태관리**: useState (5개 state) ✅

---

## ✅ 실제 구현 상태 (85% 완료)

### 1. 필터 바 (완전 구현) ✅

**공개/비공개 필터**:
- ✅ select: 전체/공개/비공개
- ✅ visibilityFilter state

**카테고리 필터**:
- ✅ select: 전체/프로그래밍/취업자격증/어학/운동취미/디자인
- ✅ categoryFilter state

**검색 기능**:
- ✅ input: 스터디명 검색
- ✅ searchQuery state

**다중 필터링 로직**:
```javascript
const filteredStudies = studies.filter(study => {
  if (visibilityFilter !== 'all' && 
      study.visibility.toLowerCase() !== visibilityFilter) {
    return false
  }
  if (categoryFilter !== 'all' && study.category !== categoryFilter) {
    return false
  }
  if (searchQuery && 
      !study.name.toLowerCase().includes(searchQuery.toLowerCase())) {
    return false
  }
  return true
})
```

### 2. 스터디 테이블 ✅

**8개 컬럼**:
1. ✅ 체크박스
2. ✅ 아이콘 (이모지, 2rem)
3. ✅ 스터디명 (이름 + 카테고리)
4. ✅ 그룹장 (이름 + provider)
5. ✅ 멤버 (memberCount/maxMembers)
6. ✅ 공개 (공개/비공개 뱃지 + 신고 건수)
7. ✅ 생성일 (formatDate)
8. ✅ 액션 (⋯ 버튼)

**신고 건수 표시**:
- ✅ reportCount > 0일 때만 표시
- ✅ 빨간 뱃지: ⚠️ 신고 N건

**체크박스 기능**:
- ✅ handleSelectStudy() - 개별 선택
- ✅ selectedStudies state 배열

### 3. 일괄 작업 (UI만) ⚠️

**선택 시 표시**:
- ✅ "N개 선택됨"
- ✅ 👁️‍🗨️ 숨김 처리 버튼
- ✅ 🗑️ 강제 삭제 버튼
- ⚠️ 실제 동작 미구현

### 4. 페이지네이션 (미구현) ⚠️

- ⚠️ UI만 존재 (버튼 disabled)
- ⚠️ 실제 페이징 로직 없음
- ✅ "1-N / N" 표시만

### 5. 우측 위젯 (100% 완료) ✅

**스터디 통계 위젯**:
- ✅ 전체 스터디 수
- ✅ 활성/비공개/신고됨 (filter로 계산)

**카테고리 현황 위젯**:
- ✅ 4개 카테고리별 개수
- ✅ 💻 프로그래밍
- ✅ 💼 취업/자격증
- ✅ 🏃 운동/취미
- ✅ 🎨 디자인

**빠른 액션 위젯**:
- ✅ 일괄 숨김/삭제/엑셀 추출
- ⚠️ 기능 미구현

---

## ⚠️ 미구현 항목

- ⚠️ 스터디 상세 모달 없음
- ⚠️ 페이지네이션 미구현
- ⚠️ 일괄 작업 미구현
- ⚠️ 엑셀 추출 미구현
- ⚠️ API 연동 없음

---

## 💡 특징

**CSS 재사용**:
- ✅ users/page.module.css import
- ✅ 코드 효율성 높음

**신고 건수 표시**:
- ✅ reportCount > 0일 때만 빨간 뱃지
- ✅ 조건부 렌더링 깔끔

**간결함**:
- ✅ 사용자 관리보다 단순
- ⚠️ 모달이 없어서 상세 확인 불가

---

**다음 화면**: `20_admin-reports.md` (신고 관리)
