# 스터디 에러 처리 가이드

## 개요

스터디 도메인에서 발생할 수 있는 에러 유형과 처리 방법을 정리합니다.

---

## 에러 처리 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         에러 처리 플로우                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐      ┌─────────────────────┐      ┌─────────────────┐ │
│  │   API 호출  │      │    Error Handler    │      │   Toast 알림    │ │
│  │             │─────▶│                     │─────▶│                 │ │
│  │ useJoinStudy│      │ handleStudyError()  │      │ showErrorToast()│ │
│  │ mutateAsync │      │                     │      │                 │ │
│  └─────────────┘      └──────────┬──────────┘      └─────────────────┘ │
│                                  │                                      │
│                    ┌─────────────┼─────────────┐                       │
│                    │             │             │                        │
│                    ▼             ▼             ▼                        │
│           ┌───────────┐  ┌───────────┐  ┌───────────────┐              │
│           │ 필드 에러 │  │ 타입 에러 │  │  일반 에러    │              │
│           │           │  │           │  │               │              │
│           │ setErrors │  │ 특수 처리 │  │ showStudy     │              │
│           │ ({ name })│  │ (redirect)│  │ ErrorToast()  │              │
│           └───────────┘  └───────────┘  └───────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 에러 유형

### HTTP 에러 코드

| HTTP 코드 | 설명 | 일반 원인 |
|-----------|------|-----------|
| 400 | Bad Request | 유효성 검증 실패, 중복, 제한 초과 |
| 401 | Unauthorized | 미로그인 |
| 403 | Forbidden | 권한 부족, 강퇴된 멤버 |
| 404 | Not Found | 스터디/멤버 없음 |
| 500 | Internal Error | 서버 오류 |

### 비즈니스 에러 타입

| 타입 | 설명 | 권장 조치 |
|------|------|-----------|
| `UNAUTHORIZED` | 로그인 필요 | 로그인 페이지로 리다이렉트 |
| `NOT_FOUND` | 스터디/멤버 없음 | 404 페이지 또는 목록으로 |
| `ALREADY_MEMBER` | 이미 멤버 | 스터디 페이지로 리다이렉트 |
| `KICKED_MEMBER` | 강퇴된 멤버 | 메시지 표시, 목록으로 |
| `APPLICATION_ALREADY_EXISTS` | 이미 신청함 | 메시지 표시 |
| `STUDY_FULL` | 정원 초과 | 메시지 표시, 프리뷰로 |
| `NOT_RECRUITING` | 모집 마감 | 메시지 표시 |
| `PERMISSION_DENIED` | 권한 부족 | 메시지 표시 |
| `VALIDATION_ERROR` | 유효성 검증 실패 | 필드 에러 표시 |

---

## 에러 핸들러

### handleStudyError

스터디 에러를 파싱하여 사용자 친화적 메시지로 변환합니다.

**파일 위치:** `src/lib/error-handlers/study-error-handler.js`

```javascript
export function handleStudyError(error) {
  // API 응답에서 에러 정보 추출
  const response = error?.response?.data || error
  const type = response?.type || 'UNKNOWN'
  const message = response?.error || response?.message || '알 수 없는 오류가 발생했습니다'
  const field = response?.field || null
  
  return { message, field, type }
}
```

### isUserInputError

사용자 입력 관련 에러인지 확인합니다.

```javascript
export function isUserInputError(type) {
  const inputErrors = [
    'VALIDATION_ERROR',
    'ALREADY_MEMBER',
    'APPLICATION_ALREADY_EXISTS',
    'STUDY_FULL',
    'NOT_RECRUITING'
  ]
  return inputErrors.includes(type)
}
```

---

## Toast 헬퍼

**파일 위치:** `src/lib/error-handlers/toast-helper.js`

### showSuccessToast

성공 메시지 표시

```javascript
showSuccessToast('🎉 스터디가 생성되었습니다!')
```

### showErrorToast

일반 에러 메시지 표시

```javascript
showErrorToast('스터디를 찾을 수 없습니다')
```

### showWarningToast

경고 메시지 표시

```javascript
showWarningToast('현재 모집 중이 아닙니다')
```

### showStudyErrorToast

스터디 에러 전용 토스트

```javascript
showStudyErrorToast(error)  // 에러 객체에서 메시지 자동 추출
```

---

## 에러 처리 패턴

### 스터디 생성 에러

```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  setErrors({})

  try {
    const result = await createStudy.mutateAsync(studyData)
    showSuccessToast('🎉 스터디가 생성되었습니다!')
    router.push(`/my-studies/${result.data.id}`)
  } catch (error) {
    console.error('스터디 생성 실패:', error)

    const { message, field, type } = handleStudyError(error)

    // 필드별 에러인 경우
    if (field) {
      setErrors({ [field]: message })
      showErrorToast(message)
    }
    // 사용자 입력 에러인 경우
    else if (isUserInputError(type)) {
      showErrorToast(message)
    }
    // 기타 에러
    else {
      showStudyErrorToast(error)
    }
  } finally {
    setIsSubmitting(false)
  }
}
```

### 스터디 가입 에러

```javascript
const handleSubmit = async () => {
  try {
    await joinStudy.mutateAsync({ id: studyId, data: formData })

    if (study.autoApprove) {
      showSuccessToast('🎉 가입이 완료되었습니다!')
      router.push(`/my-studies/${studyId}`)
    } else {
      showSuccessToast('가입 신청이 완료되었습니다. 승인을 기다려주세요.')
      router.push('/studies')
    }
  } catch (error) {
    const { message, type } = handleStudyError(error)

    // 이미 멤버인 경우 → 스터디 페이지로 리다이렉트
    if (type === 'ALREADY_MEMBER') {
      showErrorToast(message)
      setTimeout(() => router.push(`/my-studies/${studyId}`), 2000)
    }
    // 정원 초과 → 프리뷰 페이지로 리다이렉트
    else if (type === 'STUDY_FULL') {
      showErrorToast(message)
      setTimeout(() => router.push(`/studies/${studyId}`), 2000)
    }
    // 이미 신청함 → 목록으로 리다이렉트
    else if (type === 'APPLICATION_ALREADY_EXISTS') {
      showWarningToast(message)
      setTimeout(() => router.push('/studies'), 2000)
    }
    // 기타 에러
    else {
      showStudyErrorToast(error)
    }
  } finally {
    setIsSubmitting(false)
  }
}
```

### 스터디 탈퇴 에러

```javascript
const handleLeave = async () => {
  try {
    await leaveStudy.mutateAsync(studyId)
    showSuccessToast('스터디에서 탈퇴했습니다')
    router.push('/my-studies')
  } catch (error) {
    const { message, type } = handleStudyError(error)

    if (type === 'OWNER_CANNOT_LEAVE') {
      showErrorToast('스터디장은 탈퇴할 수 없습니다. 먼저 권한을 위임해주세요.')
    } else {
      showStudyErrorToast(error)
    }
  }
}
```

### 권한 위임 에러

```javascript
const handleTransfer = async (targetUserId) => {
  try {
    await transferOwnership.mutateAsync({ studyId, targetUserId })
    showSuccessToast('권한이 위임되었습니다')
    router.push(`/my-studies/${studyId}`)
  } catch (error) {
    const { message, type } = handleStudyError(error)

    if (type === 'NOT_ADMIN') {
      showErrorToast('ADMIN 권한을 가진 멤버에게만 위임할 수 있습니다')
    } else if (type === 'SELF_TRANSFER') {
      showErrorToast('자기 자신에게 위임할 수 없습니다')
    } else {
      showStudyErrorToast(error)
    }
  }
}
```

---

## API 에러 응답 형식

### 표준 에러 응답

```json
{
  "success": false,
  "error": "에러 메시지",
  "type": "ERROR_TYPE",
  "field": "fieldName"  // 선택적
}
```

### 예시: 유효성 검증 실패

```json
{
  "success": false,
  "error": "스터디 이름은 최소 2자 이상이어야 합니다",
  "type": "VALIDATION_ERROR",
  "field": "name"
}
```

### 예시: 정원 초과

```json
{
  "success": false,
  "error": "스터디 정원이 가득 찼습니다",
  "type": "STUDY_FULL"
}
```

---

## 클라이언트 유효성 검증

### 필드별 검증 규칙

| 필드 | 규칙 | 에러 메시지 |
|------|------|-------------|
| name | 필수, 2-50자 | "스터디 이름은 2-50자 사이로 입력해주세요" |
| description | 필수, 10-2000자 | "스터디 설명은 10-2000자 사이로 입력해주세요" |
| category | 필수 | "카테고리를 선택해주세요" |
| subCategory | 필수 | "세부 카테고리를 선택해주세요" |
| maxMembers | 2-100 | "최대 인원은 2-100명 사이로 설정해주세요" |
| tags | 최대 10개 | "태그는 최대 10개까지 추가할 수 있습니다" |

### 클라이언트 검증 함수

```javascript
const validateField = (fieldName, value) => {
  const newErrors = { ...errors }

  switch (fieldName) {
    case 'name':
      if (!value) {
        newErrors.name = '스터디 이름을 입력해주세요'
      } else if (value.length < 2) {
        newErrors.name = '스터디 이름은 최소 2자 이상이어야 합니다'
      } else if (value.length > 50) {
        newErrors.name = '스터디 이름은 최대 50자까지 가능합니다'
      } else {
        delete newErrors.name
      }
      break

    case 'description':
      if (!value) {
        newErrors.description = '스터디 설명을 입력해주세요'
      } else if (value.length < 10) {
        newErrors.description = '스터디 설명은 최소 10자 이상 입력해주세요'
      } else if (value.length > 2000) {
        newErrors.description = '스터디 설명은 최대 2000자까지 가능합니다'
      } else {
        delete newErrors.description
      }
      break

    case 'maxMembers':
      if (value < 2) {
        newErrors.maxMembers = '최소 2명 이상으로 설정해주세요'
      } else if (value > 100) {
        newErrors.maxMembers = '최대 100명까지 설정할 수 있습니다'
      } else {
        delete newErrors.maxMembers
      }
      break

    case 'tags':
      if (value.length > 10) {
        newErrors.tags = '태그는 최대 10개까지 추가할 수 있습니다'
      } else {
        delete newErrors.tags
      }
      break
  }

  setErrors(newErrors)
}
```

---

## 에러 UI 패턴

### 필드 에러 표시

```jsx
<div className={styles.formGroup}>
  <label className={styles.label}>
    스터디 이름 <span className={styles.required}>*</span>
  </label>
  <input
    type="text"
    value={formData.name}
    onChange={(e) => {
      setFormData({ ...formData, name: e.target.value })
      validateField('name', e.target.value)
    }}
    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
  />
  {errors.name ? (
    <span className={styles.errorText}>{errors.name}</span>
  ) : (
    <span className={styles.hint}>2-50자 사이로 입력해주세요</span>
  )}
</div>
```

### 에러 스타일

```css
.input {
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 8px;
}

.inputError {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.errorText {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}

.hint {
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
}
```

---

## 서버 측 예외 클래스

**파일 위치:** `src/lib/exceptions/study.js`

### StudyMemberException

```javascript
class StudyMemberException extends BaseException {
  static alreadyMember(studyId, userId) {
    return new StudyMemberException(
      'ALREADY_MEMBER',
      '이미 이 스터디의 멤버입니다',
      400,
      { studyId, userId }
    )
  }

  static kickedMember(studyId, userId) {
    return new StudyMemberException(
      'KICKED_MEMBER',
      '강퇴된 스터디에는 다시 가입할 수 없습니다',
      403,
      { studyId, userId }
    )
  }

  static invalidRole(role, validRoles) {
    return new StudyMemberException(
      'INVALID_ROLE',
      `유효하지 않은 역할입니다. 허용: ${validRoles.join(', ')}`,
      400,
      { role, validRoles }
    )
  }
}
```

### StudyApplicationException

```javascript
class StudyApplicationException extends BaseException {
  static studyFull(studyId, currentMembers, maxMembers) {
    return new StudyApplicationException(
      'STUDY_FULL',
      '스터디 정원이 가득 찼습니다',
      400,
      { studyId, currentMembers, maxMembers }
    )
  }

  static notRecruiting(studyId) {
    return new StudyApplicationException(
      'NOT_RECRUITING',
      '현재 멤버를 모집하지 않는 스터디입니다',
      400,
      { studyId }
    )
  }

  static applicationAlreadyExists(studyId, userId) {
    return new StudyApplicationException(
      'APPLICATION_ALREADY_EXISTS',
      '이미 가입 신청 중입니다',
      400,
      { studyId, userId }
    )
  }
}
```

### StudyPermissionException

```javascript
class StudyPermissionException extends BaseException {
  static insufficientRole(requiredRole, currentRole) {
    return new StudyPermissionException(
      'PERMISSION_DENIED',
      `${requiredRole} 권한이 필요합니다`,
      403,
      { requiredRole, currentRole }
    )
  }

  static ownerCannotLeave(studyId) {
    return new StudyPermissionException(
      'OWNER_CANNOT_LEAVE',
      '스터디장은 탈퇴할 수 없습니다. 먼저 권한을 위임해주세요.',
      400,
      { studyId }
    )
  }
}
```

---

## 로깅

### StudyLogger

**파일 위치:** `src/lib/logging/studyLogger.js`

```javascript
class StudyLogger {
  static info(message, data) {
    console.log(`[Study] ${message}`, data)
  }

  static error(message, error, data) {
    console.error(`[Study Error] ${message}`, { error, ...data })
  }

  static logMemberJoin(studyId, userId, autoApproved) {
    this.info('Member joined', { studyId, userId, autoApproved })
  }

  static logMemberLeave(studyId, userId) {
    this.info('Member left', { studyId, userId })
  }

  static logOwnershipTransfer(studyId, fromUserId, toUserId) {
    this.info('Ownership transferred', { studyId, fromUserId, toUserId })
  }
}
```

