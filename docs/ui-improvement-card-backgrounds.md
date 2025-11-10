# UI 개선 설계: 카드 배경색 변경을 통한 시각적 위계 강화

## 📋 현재 상황 분석

### 문제점
1. **낮은 시각적 대비**
   - 콘텐츠 영역 배경: 흰색 (`#FFFFFF`)
   - 카드/위젯 배경: 흰색 (`#FFFFFF`)
   - 구분: 옅은 회색 테두리만 (`#e5e7eb`)
   - 결과: 카드와 배경의 구분이 모호하여 직관성 저하

2. **일관성 부족**
   - 대시보드, 내 할 일, 알림, 마이페이지, 내 스터디: 위젯/카드가 흰색 배경
   - 스터디 탐색: 동일한 문제 존재
   - 모든 페이지에서 동일한 시각적 문제 발생

### 영향받는 컴포넌트
- Dashboard 위젯 (`.widget`)
- 내 스터디 카드 (`.studyCard`)
- 스터디 탐색 카드 (`.studyCard`)
- 할 일 카드 (`.taskCard`)
- 알림 카드 (`.card`)
- Stats 카드 (`.statCard`)
- Activity 리스트 (`.activitiesList`)
- 필터 바 (`.filterBar`, `.tabs`)

## 🎨 개선 방안 (카드 배경색 변경)

### 설계 원칙
1. **역전된 시각적 위계**: 흰색 배경 위에 연한 회색 카드로 대비 생성
2. **현대적인 UI/UX**: Notion, Slack 등의 모범 사례 참고
3. **일관성**: 모든 페이지에 동일한 디자인 시스템 적용
4. **가독성**: 충분한 대비로 사용자 경험 향상

### 색상 체계

#### 레이어 구조
```
Layer 1 (배경): #FFFFFF (흰색) - 콘텐츠 영역
  └─ Layer 2 (카드): #F9FAFB (var(--gray-50)) - 연한 회색
```

#### 적용 규칙
1. **콘텐츠 영역 배경**: 흰색 유지 (`#FFFFFF`)
2. **카드/위젯 배경**: `#F9FAFB`로 변경
3. **카드 테두리**: `#E5E7EB` 유지 (선택적으로 더 옅게 조정 가능)
4. **카드 그림자 강화**: 입체감 추가
5. **hover 효과 강화**: 인터랙션 피드백 개선
6. **텍스트 대비**: 카드 내부 텍스트 가독성 유지

### 구체적 변경사항

#### 1. 카드 배경색 변경
- **적용 대상**: 모든 카드/위젯 컴포넌트
- **변경 전**: `background: white;`
- **변경 후**: `background: #F9FAFB;` 또는 `background: var(--gray-50);`

#### 2. 카드 테두리 조정 (선택적)
- **변경 전**: `border: 1px solid var(--gray-200);` (`#E5E7EB`)
- **변경 후**: `border: 1px solid var(--gray-100);` (`#F3F4F6`) - 더 부드러운 느낌

#### 3. 카드 그림자 강화
- **변경 전**: `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);`
- **변경 후**: `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);`

#### 4. Hover 효과 강화
- **변경 전**: `box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);`
- **변경 후**: `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);`
- **배경색 변화**: hover 시 `background: #F3F4F6;` (약간 더 어두운 회색)

#### 5. 필터/탭 배경 조정
- **현재**: 흰색 배경
- **변경**: `#F9FAFB`로 변경하여 카드와 통일

## 📝 구현 단계

### Phase 1: 카드 컴포넌트 배경색 변경

#### 1.1 Dashboard 위젯 (`dashboard/page.module.css`)
```css
.widget {
  background: #F9FAFB; /* 변경 */
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.widget:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background: #F3F4F6; /* hover 시 더 진한 회색 */
}

.statCard {
  background: #F9FAFB; /* 변경 - 그라데이션 제거하고 단색 적용 */
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s;
  text-align: center;
}

.activitiesList {
  background: #F9FAFB; /* 변경 */
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
}
```

#### 1.2 Studies 카드 (`my-studies/page.module.css`, `studies/explore.module.css`)
```css
.studyCard {
  background: #F9FAFB; /* 변경 */
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.studyCard:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background: #F3F4F6;
  border-color: var(--primary-200);
}

.tabs {
  background: #F9FAFB; /* 변경 */
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.filterBar {
  background: #F9FAFB; /* 변경 */
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
}
```

#### 1.3 Tasks 카드 (`TaskCard.module.css`)
```css
.taskCard {
  background: #F9FAFB; /* 변경 */
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
  cursor: pointer;
}

.taskCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background: #F3F4F6;
}

.taskCard.urgent {
  background: var(--urgent-bg); /* 특수 상태는 유지 */
  border: 2px solid var(--urgent-border);
}

.taskCard.completed {
  background: #E5E7EB; /* 완료된 할 일은 더 진한 회색 */
  opacity: 0.7;
}
```

#### 1.4 Notifications 카드 (`NotificationCard.module.css`)
```css
.card {
  background: #F9FAFB; /* 변경 */
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
  background: #F3F4F6;
}

.card.unread {
  background: var(--unread-bg); /* 특수 상태는 유지 */
  border-color: var(--unread-border);
}
```

### Phase 2: 그림자 및 hover 효과 개선
1. 모든 카드에 통일된 그림자 적용
2. hover 효과 강화
3. 테두리 색상 조정

### Phase 3: 일관성 검증
1. 모든 페이지 시각적 테스트
2. 반응형 디자인 확인
3. 접근성 대비 확인 (WCAG 기준)
4. 특수 상태 카드 확인 (urgent, unread, completed 등)

## 🎯 예상 효과

1. **직관성 향상**: 카드가 배경에서 명확히 구분됨
2. **차분한 느낌**: 연한 회색이 눈의 피로도 감소
3. **현대적인 디자인**: Notion, Slack 등 인기 앱과 유사한 느낌
4. **브랜드 이미지**: 전문적이고 세련된 인상

## 📊 대비 분석

### 변경 전
- 배경(흰색) vs 카드(흰색): 대비 없음 (테두리만 의존)
- WCAG 기준: 미달

### 변경 후
- 배경(흰색) vs 카드(#F9FAFB): 명확한 구분
- 그림자 효과로 입체감 추가
- WCAG 기준: 충족

## 🔧 기술적 고려사항

1. **CSS 변수 활용**: `var(--gray-50)` 사용으로 유지보수성 향상
2. **성능**: 색상 변경만으로 성능 영향 없음
3. **호환성**: 모든 모던 브라우저 지원
4. **다크모드 대비**: 향후 다크모드 구현 시 변수만 변경하면 됨
5. **특수 상태 유지**: urgent, unread, completed 등의 특수 배경색은 유지

## ⚠️ 주의사항

1. **그라데이션 카드**: `.statCard`의 그라데이션 배경은 제거하고 단색 적용
2. **특수 상태 카드**: 
   - `.urgent`: 기존 배경색 유지
   - `.unread`: 기존 배경색 유지
   - `.completed`: 회색 조정 필요 시 진행
3. **중첩 카드**: 카드 내부의 작은 카드는 흰색 유지 고려

## ✅ 체크리스트

- [ ] Dashboard 위젯 배경색 변경
- [ ] Dashboard Stats 카드 확인 (그라데이션 제거)
- [ ] Dashboard Activity 리스트 배경색 변경
- [ ] Studies 카드 배경색 변경 (탐색, 내 스터디)
- [ ] Studies 필터/탭 배경색 변경
- [ ] Tasks 카드 배경색 변경
- [ ] Notifications 카드 배경색 변경
- [ ] 그림자 효과 강화
- [ ] Hover 효과 개선
- [ ] 특수 상태 카드 확인
- [ ] 반응형 디자인 확인
- [ ] 브라우저 호환성 테스트
- [ ] 접근성 검증

---

**작성일**: 2025-01-10
**버전**: 2.0 (카드 배경색 변경 방식)
**상태**: 설계 완료 → 구현 진행
