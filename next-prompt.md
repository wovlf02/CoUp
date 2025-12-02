# 다음 작업: Study 도메인 Step 7 - 프론트엔드 통합

**작성일**: 2025-12-03  
**최종 업데이트**: 2025-12-03 19:00  
**기준 문서**: `exception-implementation.md` (Phase A > A2 > Step 7)  
**현재 진행**: ✅ Step 6 완료 (100%) → ⏳ Step 7 시작

---

## 🎉 Step 6 완료!

### 최종 달성 (2025-12-03)
- ✅ **API 라우트 테스트: 58개** (116%)
- ✅ **Validator 테스트: 44개** (220%)
- ✅ **Helper 테스트: 30개** (100%)
- ✅ **통합 테스트: 10개** (100%)
- **총 142개 테스트 완료!** 🎉

### 완료된 API 강화
```
✅ 핵심 API (6개):
  ├─ /api/studies (GET, POST)
  ├─ /api/studies/[id] (GET, PATCH, DELETE)
  ├─ /api/studies/[id]/members (GET, POST, DELETE)
  ├─ /api/studies/[id]/join-requests (GET, POST, PATCH)
  ├─ /api/studies/[id]/join (POST)
  └─ /api/studies/[id]/leave (POST)

✅ 추가 API (3개):
  ├─ /api/studies/[id]/notices (GET, POST)
  ├─ /api/studies/[id]/tasks (GET, POST)
  └─ /api/studies/[id]/files (GET, POST)
```

---

## 🎯 Step 7: 프론트엔드 통합 (4-5시간)

### 작업 범위

**목표**: 백엔드 예외 처리를 프론트엔드에서 사용자 친화적으로 표시

### 1. StudyForm 컴포넌트 에러 처리 (1.5시간)

**파일**: `src/components/study/StudyForm.jsx`

**구현 항목**:
- [ ] API 에러 응답 핸들링
- [ ] 필드별 에러 메시지 표시
- [ ] 실시간 유효성 검증
- [ ] 사용자 친화적 에러 메시지
- [ ] 에러 토스트 알림

**에러 케이스**:
```javascript
// 스터디 이름 관련
- 이름이 너무 짧음 (< 2자)
- 이름이 너무 김 (> 50자)
- 중복된 이름

// 카테고리 관련
- 유효하지 않은 카테고리
- 카테고리 미선택

// 정원 관련
- 정원이 너무 작음 (< 2명)
- 정원이 너무 큼 (> 100명)

// 날짜 관련
- 시작일이 과거
- 종료일이 시작일보다 이전

// 태그 관련
- 태그 개수 초과 (> 10개)
- 태그 길이 초과 (> 20자)
```

### 2. MemberManagement 컴포넌트 에러 처리 (1.5시간)

**파일**: `src/components/study/MemberManagement.jsx`

**구현 항목**:
- [ ] 권한 부족 에러 처리
- [ ] 멤버 추가/제거 에러 처리
- [ ] 역할 변경 에러 처리
- [ ] 권한별 UI 제어
- [ ] 확인 다이얼로그

**에러 케이스**:
```javascript
// 권한 관련
- ADMIN 권한 필요
- OWNER만 가능한 작업
- 본인 역할 변경 불가

// 멤버 관리
- 멤버를 찾을 수 없음
- 이미 멤버임
- 이미 탈퇴함
- 강퇴된 사용자

// 역할 변경
- 하위 역할로만 변경 가능
- OWNER는 1명만 가능
```

### 3. ApplicationList 컴포넌트 에러 처리 (1시간)

**파일**: `src/components/study/ApplicationList.jsx`

**구현 항목**:
- [ ] 가입 신청 승인/거절 에러 처리
- [ ] 정원 초과 에러 처리
- [ ] 상태 변경 에러 처리
- [ ] 낙관적 업데이트 (Optimistic UI)

**에러 케이스**:
```javascript
// 가입 신청
- 이미 멤버임
- 정원 초과
- 모집 종료됨
- 이미 처리된 신청

// 승인/거절
- 권한 부족
- 신청을 찾을 수 없음
- 이미 처리됨
```

### 4. 공통 에러 처리 유틸리티 (30분)

**파일**: `src/lib/error-handlers/study-error-handler.js`

**구현 항목**:
```javascript
/**
 * Study 도메인 에러 핸들러
 * @param {Error} error - API 에러
 * @returns {Object} - { message, field, type }
 */
export function handleStudyError(error) {
  const response = error.response?.data || {}
  
  // 에러 타입별 메시지 매핑
  const errorMessages = {
    // Validation Errors
    'STUDY_NAME_TOO_SHORT': '스터디 이름은 최소 2자 이상이어야 합니다',
    'STUDY_NAME_TOO_LONG': '스터디 이름은 최대 50자까지 가능합니다',
    'INVALID_CATEGORY': '올바른 카테고리를 선택해주세요',
    
    // Permission Errors
    'ADMIN_PERMISSION_REQUIRED': '이 작업은 관리자 권한이 필요합니다',
    'OWNER_PERMISSION_REQUIRED': '이 작업은 스터디장만 수행할 수 있습니다',
    
    // Member Errors
    'ALREADY_MEMBER': '이미 스터디 멤버입니다',
    'STUDY_FULL': '스터디 정원이 가득 찼습니다',
    'MEMBER_NOT_FOUND': '멤버를 찾을 수 없습니다',
    
    // ... 기타 에러들
  }
  
  return {
    message: errorMessages[response.errorCode] || response.message || '오류가 발생했습니다',
    field: response.field,
    type: response.errorCode
  }
}

/**
 * 에러 토스트 표시
 */
export function showStudyErrorToast(error) {
  const { message, type } = handleStudyError(error)
  
  // React Toastify 또는 다른 토스트 라이브러리 사용
  toast.error(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
  })
}
```

### 5. 에러 토스트 알림 통합 (30분)

**라이브러리 설치**:
```bash
npm install react-toastify
```

**구현 항목**:
- [ ] ToastContainer 전역 설정
- [ ] 에러 레벨별 스타일링
- [ ] 자동 닫힘 시간 설정
- [ ] 위치 및 애니메이션 설정

---

## 📝 구현 예시

### StudyForm 에러 처리 예시

```javascript
import { useState } from 'react'
import { handleStudyError, showStudyErrorToast } from '@/lib/error-handlers/study-error-handler'

export function StudyForm({ onSubmit }) {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await fetch('/api/studies', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw error
      }

      const data = await response.json()
      onSubmit(data)
      toast.success('스터디가 생성되었습니다!')
      
    } catch (error) {
      const { message, field } = handleStudyError(error)
      
      if (field) {
        // 필드별 에러 표시
        setErrors({ [field]: message })
      } else {
        // 전역 에러 토스트
        showStudyErrorToast(error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      {errors.name && <span className="error">{errors.name}</span>}
      
      {/* 기타 필드들 */}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '생성 중...' : '스터디 생성'}
      </button>
    </form>
  )
}
```

---

## 🚀 시작 프롬프트

```bash
Study 도메인 Step 7 시작! 

✅ Step 6 완료:
- 142개 테스트 작성 완료
- 모든 API 예외 처리 완료

📋 Step 7 작업:
1. StudyForm 컴포넌트 에러 처리
2. MemberManagement 컴포넌트 에러 처리
3. ApplicationList 컴포넌트 에러 처리
4. 공통 에러 핸들러 구현
5. 에러 토스트 알림 통합

예상 시간: 4-5시간

작업을 시작해줘!
```

---

## 📂 작업할 파일 목록

```
C:\Project\CoUp\coup\src\
├── components\study\
│   ├── StudyForm.jsx (에러 처리 추가)
│   ├── MemberManagement.jsx (에러 처리 추가)
│   └── ApplicationList.jsx (에러 처리 추가)
├── lib\error-handlers\
│   └── study-error-handler.js (신규 생성)
└── app\layout.jsx (ToastContainer 추가)
```

---

## 🎯 완료 기준

- [ ] 모든 API 에러가 사용자 친화적 메시지로 표시됨
- [ ] 필드별 인라인 에러 표시
- [ ] 전역 에러 토스트 알림
- [ ] 권한별 UI 제어
- [ ] 낙관적 UI 업데이트
- [ ] 에러 복구 가이드 제공

---

## 📊 Study 도메인 전체 진행 상황

```
✅ Step 1: 도메인 분석 및 설계 (100%)
✅ Step 2: Exception 클래스 구현 (100%)
✅ Step 3: Validators & Logger 구현 (100%)
✅ Step 4: API 라우트 강화 - 핵심 (100%)
✅ Step 5: API 라우트 강화 - 추가 (100%)
✅ Step 6: 테스트 작성 (100%)
⏳ Step 7: 프론트엔드 통합 (0%) ← 현재 작업

전체: 86% 완료 (6/7 단계)
```

---

**현재 상태**: Step 6 완료! 🎉  
**다음 작업**: Step 7 프론트엔드 통합 시작
