# 스터디 생성 (Study Create)

> **화면 ID**: `STUDY-EXPLORE-02`  
> **라우트**: `/studies/create`  
> **목적**: 새로운 스터디 그룹 생성  
> **권한**: 로그인 필요  
> **렌더링**: CSR

---

## ? 화면 목적

**"나만의 스터디 만들기"**
- 간단한 폼으로 빠른 스터디 생성
- 명확한 가이드로 실패 최소화
- 생성 즉시 그룹장으로 활동 시작

---

## ? 레이아웃 구조 (FHD 최적화)

```
┌─────┬─────────────────────────────────────────────────────┬──────────────────┐
│     │ ← 뒤로가기                                           │                  │
│ Nav ├─────────────────────────────────────────────────────┤  생성 가이드     │
│ 12% │ 새 스터디 만들기                                     │  (280px)         │
│     │ 함께 성장할 멤버를 모집하세요                         │                  │
│     ├─────────────────────────────────────────────────────┤  ? 체크리스트   │
│     │                                                     │  □ 명확한 목표   │
│     │  ┌───────────────────────────────────────────────┐  │  □ 적절한 인원   │
│     │  │ 1. 기본 정보 (필수)                            │  │  □ 상세한 설명   │
│     │  │                                               │  │  □ 정기 일정     │
│     │  │  스터디 이름 *                                │  │                  │
│     │  │  [_________________________________]           │  │  ? 성공 팁      │
│     │  │                                               │  │  ? 구체적인      │
│     │  │  카테고리 *                                   │  │    목표 설정     │
│     │  │  [프로그래밍 ▼]  [알고리즘/코테 ▼]           │  │  ? 5-10명        │
│     │  │                                               │  │    추천          │
│     │  │  스터디 소개 *                                │  │  ? 주 2-3회      │
│     │  │  [_________________________________]           │  │    모임          │
│     │  │  [_________________________________]           │  │                  │
│     │  │  [_________________________________]           │  │  ? 예상 시간    │
│     │  │  0/500자                                     │  │  작성: 3분       │
│ ?  │  │                                               │  │  생성: 즉시      │
│ ?  │  │  태그 (선택)                                  │  │                  │
│ ?  │  │  #알고리즘 × #코테 × [+ 추가]                │  │  ?? 주의사항     │
│ ?  │  └───────────────────────────────────────────────┘  │  그룹장으로      │
│ ?  │                                                     │  자동 지정되며    │
│ ?  │  ┌───────────────────────────────────────────────┐  │  삭제 권한이     │
│     │  │ 2. 모집 설정 (필수)                            │  │  부여됩니다      │
│     │  │                                               │  │                  │
│     │  │  모집 인원 *                                  │  │  ? 가이드       │
│     │  │  [-] [10] [+]  명                            │  │  [스터디 운영    │
│     │  │                                               │  │   가이드 보기]   │
│     │  │  공개 설정 *                                  │  │                  │
│     │  │  (?) 전체 공개  ( ) 비공개                    │  │                  │
│     │  │                                               │  │                  │
│     │  │  [?] 가입 자동 승인                           │  │                  │
│     │  └───────────────────────────────────────────────┘  │                  │
│     │                                                     │                  │
│     │                        [취소]  [스터디 만들기]       │                  │
│     │                                                     │                  │
└─────┴─────────────────────────────────────────────────────┴──────────────────┘
```

**레이아웃 비율**:
- 좌측 네비게이션: 12% (240px)
- 폼 영역: 58% (최대 800px, 중앙 정렬)
- 우측 가이드: 30% (280px)

---

## ? 섹션별 상세 설계

### 1. 페이지 헤더

```
┌──────────────────────────────────────────────────────────┐
│ ← 뒤로가기                                                │
│                                                          │
│ 새 스터디 만들기                                          │
│ 함께 성장할 멤버를 모집하세요                              │
└──────────────────────────────────────────────────────────┘
```

**뒤로가기**:
- 클릭 → `/studies` (탐색 페이지)
- 작성 중이면 확인 다이얼로그

**제목**:
- "새 스터디 만들기" (text-2xl, Bold)
- 서브타이틀: "함께 성장할 멤버를 모집하세요" (text-sm, gray-600)

---

### 2. 폼 섹션 1: 기본 정보

```
┌─────────────────────────────────────────────────────────┐
│ 1. 기본 정보 (필수)                                      │
│                                                         │
│ 스터디 이름 *                                            │
│ ┌───────────────────────────────────────────────────┐   │
│ │ 알고리즘 마스터 스터디                              │   │
│ └───────────────────────────────────────────────────┘   │
│ 2-50자 (현재: 13자)                                      │
│                                                         │
│ 카테고리 *                                               │
│ ┌──────────────────┐  ┌──────────────────┐            │
│ │ 프로그래밍  ▼     │  │ 알고리즘/코테 ▼  │            │
│ └──────────────────┘  └──────────────────┘            │
│                                                         │
│ 스터디 소개 *                                            │
│ ┌───────────────────────────────────────────────────┐   │
│ │ 매일 아침 알고리즘 문제를 풀고                      │   │
│ │ 서로의 풀이를 공유합니다.                           │   │
│ │ 함께 실력을 키워나가요!                             │   │
│ │                                                    │   │
│ │                                                    │   │
│ └───────────────────────────────────────────────────┘   │
│ 10-500자 (현재: 45자)                                    │
│                                                         │
│ 태그 (선택, 최대 5개)                                    │
│ ┌───────────────────────────────────────────────────┐   │
│ │ #알고리즘 × #코딩테스트 × #매일 ×                  │   │
│ │ [+ 태그 추가]                                      │   │
│ └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**필드 상세**:

1. **스터디 이름** (필수)
   - Type: text
   - 길이: 2-50자
   - 실시간 글자 수 표시
   - 검증: 빈칸, 특수문자 제한
   - 에러 메시지: 필드 하단 빨간색

2. **카테고리** (필수)
   - 메인 카테고리: Dropdown
   - 서브 카테고리: 동적 Dropdown
   - 메인 선택 시 서브 활성화

3. **스터디 소개** (필수)
   - Type: textarea
   - 길이: 10-500자
   - 행: 6줄
   - 실시간 글자 수
   - Placeholder: "스터디 목표, 진행 방식, 대상 등을 자유롭게 작성해주세요"

4. **태그** (선택)
   - 입력 후 엔터 또는 콤마로 추가
   - 최대 5개
   - X 버튼으로 삭제
   - 스타일: Primary-100 배경, Primary-700 텍스트

**검증 규칙**:
```javascript
const validation = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[가-?a-zA-Z0-9\s]+$/
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 500
  },
  category: {
    required: true
  },
  tags: {
    maxCount: 5,
    maxLength: 20
  }
}
```

---

### 3. 폼 섹션 2: 모집 설정

```
┌─────────────────────────────────────────────────────────┐
│ 2. 모집 설정 (필수)                                      │
│                                                         │
│ 모집 인원 *                                              │
│ ┌───┐  ┌────┐  ┌───┐                                   │
│ │ - │  │ 10 │  │ + │  명                               │
│ └───┘  └────┘  └───┘                                   │
│ 최소 2명, 최대 50명                                       │
│                                                         │
│ 공개 설정 *                                              │
│ ┌─────────────────────────────────────────────────┐    │
│ │ (?) 전체 공개                                     │    │
│ │     누구나 검색하고 가입할 수 있습니다             │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ ( ) 비공개                                        │    │
│ │     초대받은 사람만 가입할 수 있습니다             │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ 가입 승인 방식                                           │
│ [?] 가입 신청 시 자동으로 승인                           │
│ (체크 해제 시 그룹장이 수동 승인)                         │
└─────────────────────────────────────────────────────────┘
```

**필드 상세**:

1. **모집 인원** (필수)
   - 범위: 2-50명
   - 기본값: 10명
   - 증감 버튼: +/- 1명씩
   - 직접 입력 가능

2. **공개 설정** (필수)
   - Radio Button
   - 전체 공개 (PUBLIC): 기본값
   - 비공개 (PRIVATE): 초대 링크 필요
   - 설명 텍스트로 차이 명확히 표시

3. **자동 승인** (선택)
   - Checkbox
   - 기본값: true (체크됨)
   - 설명: "체크 해제 시 그룹장이 수동 승인"

---

### 4. 하단 액션 버튼

```
                     [취소]  [스터디 만들기]
```

**취소 버튼** (Secondary):
- 클릭 → 확인 다이얼로그
- "작성 중인 내용이 사라집니다. 계속하시겠습니까?"
- 확인 → `/studies`

**스터디 만들기** (Primary):
- 필수 항목 미입력 시 비활성화
- 클릭 → 로딩 스피너
- 성공 → Toast "스터디가 생성되었습니다!"
- 자동 이동 → `/my-studies/[newStudyId]`

---

## ? 우측 가이드 위젯 (280px)

### 1?? 생성 체크리스트

```
┌─────────────────────────────────────┐
│ ? 생성 체크리스트                   │
│                                     │
│ □ 명확한 목표 설정                   │
│   "3개월 안에 알고리즘 100문제"     │
│                                     │
│ □ 적절한 인원 (5-10명 추천)         │
│   너무 많으면 관리 어려움           │
│                                     │
│ □ 상세한 소개 작성                   │
│   목표, 방식, 대상 포함             │
│                                     │
│ □ 정기 일정 계획                     │
│   주 2-3회 모임 권장               │
└─────────────────────────────────────┘
```

---

### 2?? 성공 팁

```
┌─────────────────────────────────────┐
│ ? 성공하는 스터디의 비결            │
│                                     │
│ 1. 구체적인 목표                     │
│    ? 좋은 예: "3개월 안에 코테 100문제" │
│    ? 나쁜 예: "알고리즘 공부"       │
│                                     │
│ 2. 작은 그룹 유지                    │
│    5-10명이 가장 효과적             │
│                                     │
│ 3. 정기적인 모임                     │
│    주 2-3회 고정 시간               │
│                                     │
│ 4. 명확한 규칙                       │
│    출석, 과제, 참여 기준             │
└─────────────────────────────────────┘
```

---

### 3?? 예상 시간

```
┌─────────────────────────────────────┐
│ ? 예상 소요 시간                    │
│                                     │
│ 폼 작성      약 3분                 │
│ 스터디 생성   즉시                  │
│ 첫 멤버 초대  1분                   │
│                                     │
│ ? 생성 후 바로 활동 시작!           │
└─────────────────────────────────────┘
```

---

### 4?? 주의사항

```
┌─────────────────────────────────────┐
│ ?? 주의사항                          │
│                                     │
│ ? 그룹장으로 자동 지정됩니다         │
│ ? 스터디 삭제 권한이 부여됩니다      │
│ ? 멤버 관리 책임이 있습니다          │
│                                     │
│ ? 자세한 내용은                     │
│ [스터디 운영 가이드]에서 확인        │
└─────────────────────────────────────┘
```

---

### 5?? 가이드 링크

```
┌─────────────────────────────────────┐
│ ? 도움말                            │
│                                     │
│ [스터디 운영 가이드 보기 →]         │
│ [카테고리 선택 도움말 →]            │
│ [자주 묻는 질문 →]                  │
└─────────────────────────────────────┘
```

---

## ? 인터랙션 플로우

### 1. 폼 작성

```javascript
const [formData, setFormData] = useState({
  name: '',
  category: '',
  subCategory: '',
  description: '',
  tags: [],
  maxMembers: 10,
  visibility: 'PUBLIC',
  autoApprove: true
})

const [errors, setErrors] = useState({})

// 실시간 검증
const validateField = (field, value) => {
  const rules = validation[field]
  
  if (rules.required && !value) {
    return `${field}을(를) 입력해주세요`
  }
  
  if (rules.minLength && value.length < rules.minLength) {
    return `최소 ${rules.minLength}자 이상 입력해주세요`
  }
  
  if (rules.maxLength && value.length > rules.maxLength) {
    return `최대 ${rules.maxLength}자까지 입력 가능합니다`
  }
  
  if (rules.pattern && !rules.pattern.test(value)) {
    return '올바른 형식이 아닙니다'
  }
  
  return null
}
```

---

### 2. 제출 처리

```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // 최종 검증
  const newErrors = {}
  Object.keys(validation).forEach(field => {
    const error = validateField(field, formData[field])
    if (error) newErrors[field] = error
  })
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors)
    toast.error('필수 항목을 모두 입력해주세요')
    return
  }
  
  try {
    setIsSubmitting(true)
    
    // API 호출
    const response = await api.post('/api/v1/studies', formData)
    const newStudy = response.data
    
    // 성공 Toast
    toast.success('스터디가 생성되었습니다!')
    
    // 내 스터디로 이동 (그룹장으로)
    router.push(`/my-studies/${newStudy.id}`)
    
  } catch (error) {
    if (error.code === 'DUPLICATE_NAME') {
      toast.error('이미 같은 이름의 스터디가 존재합니다')
      setErrors({ name: '다른 이름을 사용해주세요' })
    } else {
      toast.error('스터디 생성 중 오류가 발생했습니다')
    }
  } finally {
    setIsSubmitting(false)
  }
}
```

---

### 3. 태그 추가/삭제

```javascript
const [tagInput, setTagInput] = useState('')

const handleAddTag = (e) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    
    const tag = tagInput.trim()
    if (!tag) return
    
    if (formData.tags.length >= 5) {
      toast.warning('태그는 최대 5개까지 추가할 수 있습니다')
      return
    }
    
    if (tag.length > 20) {
      toast.warning('태그는 20자 이내로 입력해주세요')
      return
    }
    
    if (formData.tags.includes(tag)) {
      toast.warning('이미 추가된 태그입니다')
      return
    }
    
    setFormData({
      ...formData,
      tags: [...formData.tags, tag]
    })
    setTagInput('')
  }
}

const handleRemoveTag = (tagToRemove) => {
  setFormData({
    ...formData,
    tags: formData.tags.filter(tag => tag !== tagToRemove)
  })
}
```

---

### 4. 취소 확인

```javascript
const handleCancel = () => {
  const hasContent = formData.name || formData.description
  
  if (hasContent) {
    if (confirm('작성 중인 내용이 사라집니다. 계속하시겠습니까?')) {
      router.push('/studies')
    }
  } else {
    router.push('/studies')
  }
}
```

---

## ? 반응형 설계

### Desktop (1920px)
```css
.create-layout {
  display: grid;
  grid-template-columns: 240px 1fr 280px;
  gap: 20px;
  padding: 0 20px;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}
```

### Tablet (1024px)
```css
.create-layout {
  grid-template-columns: 60px 1fr 240px;
  gap: 16px;
}

.form-container {
  max-width: 100%;
}
```

### Mobile (<768px)
```css
.create-layout {
  display: flex;
  flex-direction: column;
  padding: 0 16px;
}

.guide-widgets {
  order: 3;
  margin-top: 24px;
}

/* 입력 필드 전체 너비 */
.form-field {
  width: 100%;
}

/* 버튼 전체 너비 */
.action-buttons {
  flex-direction: column;
  gap: 12px;
}

.action-buttons button {
  width: 100%;
}
```

---

## ? 스타일 코드

```css
/* 폼 섹션 */
.form-section {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.form-section-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #F3F4F6;
}

/* 필드 그룹 */
.form-field {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-label .required {
  color: #EF4444;
}

/* 입력 필드 */
.form-input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input.error {
  border-color: #EF4444;
}

/* Textarea */
.form-textarea {
  width: 100%;
  min-height: 140px;
  padding: 12px 16px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  font-family: inherit;
}

/* 글자 수 */
.char-count {
  font-size: 12px;
  color: #6B7280;
  margin-top: 4px;
  text-align: right;
}

.char-count.warning {
  color: #F59E0B;
}

.char-count.error {
  color: #EF4444;
}

/* 에러 메시지 */
.error-message {
  color: #EF4444;
  font-size: 13px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 태그 */
.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 48px;
  padding: 8px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #EEF2FF;
  color: #4F46E5;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.tag-remove {
  cursor: pointer;
  font-weight: 700;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.tag-remove:hover {
  opacity: 1;
}

/* 숫자 입력 */
.number-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.number-button {
  width: 40px;
  height: 40px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  transition: all 0.2s ease;
}

.number-button:hover {
  background: #F9FAFB;
  border-color: #6366F1;
}

.number-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.number-display {
  width: 80px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

/* Radio 버튼 */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio-item:hover {
  border-color: #C7D2FE;
  background: #F5F3FF;
}

.radio-item.selected {
  border-color: #6366F1;
  background: #EEF2FF;
}

.radio-input {
  margin-top: 2px;
  cursor: pointer;
}

.radio-content {
  flex: 1;
}

.radio-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.radio-description {
  font-size: 13px;
  color: #6B7280;
}

/* Checkbox */
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

/* 액션 버튼 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
}

.btn-cancel {
  padding: 12px 32px;
  background: white;
  border: 1px solid #D1D5DB;
  color: #374151;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

.btn-submit {
  padding: 12px 32px;
  background: #6366F1;
  border: none;
  color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-submit:hover {
  background: #4F46E5;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit.loading {
  position: relative;
  color: transparent;
}

.btn-submit.loading::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## ? 구현 체크리스트

### Phase 1: UI 레이아웃
- [ ] 3컬럼 레이아웃 (Nav + Form + Guide)
- [ ] 폼 섹션 구조
- [ ] 우측 가이드 위젯

### Phase 2: 입력 필드
- [ ] 스터디 이름 (검증)
- [ ] 카테고리 (메인 + 서브)
- [ ] 스터디 소개 (글자 수)
- [ ] 태그 추가/삭제
- [ ] 모집 인원 (증감)
- [ ] 공개 설정 (Radio)
- [ ] 자동 승인 (Checkbox)

### Phase 3: 검증 로직
- [ ] 실시간 검증
- [ ] 에러 메시지 표시
- [ ] 제출 전 최종 검증
- [ ] 필수 항목 체크

### Phase 4: 제출 처리
- [ ] API 연동
- [ ] 로딩 상태
- [ ] 성공 처리 (Toast + 리다이렉트)
- [ ] 에러 처리

### Phase 5: UX 개선
- [ ] 작성 중 이탈 방지
- [ ] 글자 수 실시간 표시
- [ ] 가이드 툴팁
- [ ] 반응형 테스트

---

## ? UX 최적화 포인트

1. **명확한 가이드**: 우측에 생성 팁 상시 표시
2. **실시간 피드백**: 글자 수, 검증 메시지 즉시 표시
3. **단계 분리**: 기본 정보 → 모집 설정으로 논리적 구분
4. **기본값 제공**: 10명, 전체 공개, 자동 승인
5. **에러 방지**: 입력 중 검증으로 제출 실패 최소화
6. **빠른 생성**: 필수 항목 최소화 (3분 이내 완료)

---

**다음 화면**: `03_study-preview.md` (스터디 프리뷰)

