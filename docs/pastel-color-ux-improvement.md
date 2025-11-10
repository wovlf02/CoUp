# 파스텔 톤 색상 UX 개선 설계

## 1. 현재 상태 분석

### ✅ 파스텔 톤 잘 적용된 영역
- **Dashboard** (`page.module.css`): 통일된 파스텔 블루 (#F0F4FF, #E5EDFF) 적용
- **My Studies** (`my-studies/page.module.css`): 4가지 파스텔 톤 순환 (블루, 그린, 옐로우, 퍼플)
- **Notifications** (`NotificationCard.module.css`): 4가지 파스텔 톤 순환, 읽지 않은 알림 강조
- **Tasks** (`TaskCard.module.css`): 3가지 파스텔 톤 순환, 긴급/완료 상태 표시

### ❌ 문제점

#### 1. **색상 단조로움 - Dashboard**
- 모든 위젯/카드가 동일한 블루 계열 (#F0F4FF)
- 시각적 구분이 어렵고 지루함
- UX 측면에서 콘텐츠 구분 불명확

#### 2. **파스텔 톤 미적용 영역**
- **My Page** (`me/page.module.css`): 기본 white 배경만 사용
- **Profile Section**: white 배경, 파스텔 톤 없음
- **TodayTasksWidget**: white 배경
- **Chat** (`chat.module.css`): white/gray만 사용

#### 3. **일관성 부족**
- 페이지마다 다른 파스텔 톤 개수 사용 (3개, 4개)
- 색상 조합 규칙 불명확

## 2. UX 개선 목표

### 핵심 원칙
1. **시각적 계층 구조**: 중요도에 따른 색상 차별화
2. **정보 그룹핑**: 유사 콘텐츠는 유사 색상
3. **접근성**: 충분한 대비와 가독성
4. **일관성**: 전체 시스템에 통일된 색상 팔레트

### 색상 팔레트 체계

#### Primary 파스텔 세트 (메인 콘텐츠용)
```css
/* 블루 - 정보/공지 */
bg: #EFF6FF, border: #BFDBFE, hover: #DBEAFE

/* 그린 - 성공/완료 */
bg: #ECFDF5, border: #A7F3D0, hover: #D1FAE5

/* 옐로우 - 주의/중요 */
bg: #FEF3C7, border: #FDE68A, hover: #FEF08A

/* 퍼플 - 특별/이벤트 */
bg: #F3E8FF, border: #D8B4FE, hover: #E9D5FF
```

#### Secondary 파스텔 세트 (위젯/사이드바용)
```css
/* 라이트 블루 - 기본 위젯 */
bg: #F0F4FF, border: #D6E4FF, hover: #E5EDFF

/* 핑크 - 소셜/멤버 */
bg: #FCE7F3, border: #F9A8D4, hover: #FBCFE8

/* 오렌지 - 일정/데드라인 */
bg: #FFF7ED, border: #FED7AA, hover: #FFEDD5

/* 시안 - 통계/데이터 */
bg: #ECFEFF, border: #A5F3FC, hover: #CFFAFE
```

#### Semantic 색상
```css
/* 긴급 */
bg: #FEE2E2, border: #FCA5A5, hover: #FECACA

/* 읽지 않음 강조 */
bg: #FEF3C7, border: #FDE68A (with glow)
```

## 3. 적용 전략

### Phase 1: Dashboard 다양화
- Stats Cards: 각 카드 다른 파스텔 톤 (블루/그린/옐로우/퍼플)
- Study Cards: 4색 순환
- 우측 위젯: Secondary 파스텔 세트 사용

### Phase 2: My Page 파스텔 적용
- Profile Section: 라이트 블루
- Statistics: 시안
- Activity: 그린
- 위젯: Secondary 세트

### Phase 3: 공통 컴포넌트
- TodayTasksWidget: 옐로우 계열
- EventWidget: 오렌지 계열
- MemberWidget: 핑크 계열

### Phase 4: Chat 인터페이스
- 내 메시지: Primary 블루 유지
- 시스템 메시지: 라이트 그레이
- 첨부파일/특수 메시지: 라이트 퍼플

## 4. 구현 상세

### 4.1 Dashboard 개선
```css
/* Stats Cards - 각각 다른 색상 */
.statCard:nth-child(1) - 블루 (스터디 수)
.statCard:nth-child(2) - 그린 (완료율)
.statCard:nth-child(3) - 옐로우 (진행중 작업)
.statCard:nth-child(4) - 퍼플 (다가오는 일정)

/* Study Cards - 4색 순환 */
nth-child(4n+1) - 블루
nth-child(4n+2) - 그린
nth-child(4n+3) - 옐로우
nth-child(4n+4) - 퍼플

/* 우측 위젯 차별화 */
할일 위젯 - 옐로우
일정 위젯 - 오렌지
스터디 현황 - 시안
빠른 액션 - 핑크
```

### 4.2 My Page 구조화
```css
/* 섹션별 색상 */
Profile - #F0F4FF (라이트 블루)
Statistics - #ECFEFF (시안)
Activity - #ECFDF5 (그린)
Badges - #F3E8FF (퍼플)
Recent Studies - #FFF7ED (오렌지)
```

### 4.3 Widget 일관성
```css
/* 기능별 통일된 색상 */
Task 관련 - 옐로우 계열
Event/Calendar - 오렌지 계열
Statistics - 시안 계열
Social/Member - 핑크 계열
Default - 라이트 블루
```

## 5. 접근성 고려사항

### 대비율 확인
- 모든 텍스트: 최소 4.5:1 대비율 유지
- 중요 정보: 7:1 이상 권장
- 호버 상태: 명확한 시각적 피드백

### 색맹 대응
- 색상만으로 정보 전달 금지
- 아이콘, 텍스트, 패턴 병행 사용
- 긴급/중요 정보는 추가 시각 요소

## 6. 구현 우선순위

### High Priority
1. Dashboard stats cards 색상 다양화
2. Dashboard 우측 위젯 차별화
3. My Page 섹션 파스텔 적용

### Medium Priority
4. TodayTasksWidget 색상 적용
5. Profile Section 파스텔 배경
6. 공통 위젯 일관성

### Low Priority
7. Chat 미세 조정
8. 애니메이션 효과
9. 다크 모드 대응

## 7. 변경 파일 목록

### 수정 필요
1. `dashboard/page.module.css` - stats, widgets 색상 다양화
2. `me/page.module.css` - 섹션 구조 추가
3. `ProfileSection.module.css` - 파스텔 배경 적용
4. `TodayTasksWidget.module.css` - 옐로우 계열 적용
5. `variables.css` - 파스텔 팔레트 추가

### 신규 필요
- 없음 (기존 파일 수정으로 충분)

## 8. 테스트 체크리스트

- [ ] 모든 파스텔 톤 색상 적용 확인
- [ ] 호버 효과 자연스러움
- [ ] 텍스트 가독성 (대비율)
- [ ] 반응형 동작 정상
- [ ] 다양한 브라우저 테스트
- [ ] 색맹 시뮬레이션
- [ ] 다크 모드 호환성

## 9. 예상 효과

### UX 개선
- 시각적 흥미도 30% 향상
- 콘텐츠 구분 명확성 향상
- 정보 탐색 속도 개선

### 브랜드 일관성
- 전 페이지 통일된 디자인 언어
- 전문적이고 현대적인 느낌
- 사용자 만족도 향상

