# Profile Exception 클래스 설계 (완전판)

**작성일**: 2025-12-01  
**Phase**: 1 - 분석 및 계획  
**목표**: ProfileException 클래스 및 유틸리티 완전 설계

---

## 📋 목차

1. [ProfileException 클래스 전체 구조](#profileexception-클래스-전체-구조)
2. [90개 전체 메서드 목록](#90개-전체-메서드-목록)
3. [유효성 검증 함수](#유효성-검증-함수)
4. [에러 로거](#에러-로거)
5. [사용 예제](#사용-예제)

---

## ProfileException 클래스 전체 구조

### 파일 위치
```
coup/src/lib/exceptions/profile/ProfileException.js
```

### 전체 에러 코드 범위
```
PROFILE-001 ~ PROFILE-020: PROFILE_INFO (프로필 정보)
PROFILE-021 ~ PROFILE-035: AVATAR (아바타)
PROFILE-036 ~ PROFILE-050: PASSWORD (비밀번호)
PROFILE-051 ~ PROFILE-060: ACCOUNT_DELETE (계정 삭제)
PROFILE-061 ~ PROFILE-070: PRIVACY (프라이버시)
PROFILE-071 ~ PROFILE-080: VERIFICATION (인증)
PROFILE-081 ~ PROFILE-090: SOCIAL (소셜 연동)
```

---

## 90개 전체 메서드 목록

### A. PROFILE_INFO (프로필 정보) - 20개

```javascript
// A-1: PROFILE-001 ~ PROFILE-005 (필수 필드 및 형식)
static requiredFieldMissing(context = {})      // PROFILE-001
static invalidNameFormat(context = {})         // PROFILE-002
static nameTooShort(context = {})              // PROFILE-003
static nameTooLong(context = {})               // PROFILE-004
static bioTooLong(context = {})                // PROFILE-005

// A-2: PROFILE-006 ~ PROFILE-010 (중복 및 금지)
static invalidBioContent(context = {})         // PROFILE-006
static duplicateEmail(context = {})            // PROFILE-007
static invalidEmailFormat(context = {})        // PROFILE-008
static duplicateNickname(context = {})         // PROFILE-009
static forbiddenNickname(context = {})         // PROFILE-010

// A-3: PROFILE-011 ~ PROFILE-015 (보안 및 검증)
static specialCharError(context = {})          // PROFILE-011
static xssDetected(context = {})               // PROFILE-012
static sqlInjectionDetected(context = {})      // PROFILE-013
static updateFailed(context = {})              // PROFILE-014
static notFound(context = {})                  // PROFILE-015

// A-4: PROFILE-016 ~ PROFILE-020 (권한 및 제한)
static unauthorizedAccess(context = {})        // PROFILE-016
static rateLimitExceeded(context = {})         // PROFILE-017
static accountSuspended(context = {})          // PROFILE-018
static accountDeleted(context = {})            // PROFILE-019
static fetchFailed(context = {})               // PROFILE-020
```

### B. AVATAR (아바타) - 15개

```javascript
// B-1: PROFILE-021 ~ PROFILE-025 (파일 검증)
static fileNotProvided(context = {})           // PROFILE-021
static fileTooLarge(context = {})              // PROFILE-022
static invalidFileType(context = {})           // PROFILE-023
static invalidImageFormat(context = {})        // PROFILE-024
static corruptedImage(context = {})            // PROFILE-025

// B-2: PROFILE-026 ~ PROFILE-030 (업로드 및 처리)
static uploadFailed(context = {})              // PROFILE-026
static imageProcessingFailed(context = {})     // PROFILE-027
static invalidImageDimensions(context = {})    // PROFILE-028
static avatarUpdateFailed(context = {})        // PROFILE-029
static avatarDeleteFailed(context = {})        // PROFILE-030

// B-3: PROFILE-031 ~ PROFILE-035 (저장 및 표시)
static storageFull(context = {})               // PROFILE-031
static avatarNotFound(context = {})            // PROFILE-032
static avatarLoadFailed(context = {})          // PROFILE-033
static avatarUrlInvalid(context = {})          // PROFILE-034
static cropDataInvalid(context = {})           // PROFILE-035
```

### C. PASSWORD (비밀번호) - 15개

```javascript
// C-1: PROFILE-036 ~ PROFILE-040 (검증)
static passwordRequired(context = {})          // PROFILE-036
static passwordTooShort(context = {})          // PROFILE-037
static passwordTooLong(context = {})           // PROFILE-038
static passwordTooWeak(context = {})           // PROFILE-039
static passwordNoUppercase(context = {})       // PROFILE-040

// C-2: PROFILE-041 ~ PROFILE-045 (보안)
static passwordNoLowercase(context = {})       // PROFILE-041
static passwordNoNumber(context = {})          // PROFILE-042
static passwordNoSpecialChar(context = {})     // PROFILE-043
static passwordReuse(context = {})             // PROFILE-044
static passwordCommonlyUsed(context = {})      // PROFILE-045

// C-3: PROFILE-046 ~ PROFILE-050 (변경 및 확인)
static currentPasswordIncorrect(context = {}) // PROFILE-046
static passwordChangeCooldown(context = {})    // PROFILE-047
static passwordChangeFailed(context = {})      // PROFILE-048
static newPasswordSameAsOld(context = {})      // PROFILE-049
static passwordMismatch(context = {})          // PROFILE-050
```

### D. ACCOUNT_DELETE (계정 삭제) - 10개

```javascript
// D-1: PROFILE-051 ~ PROFILE-055 (사전 확인)
static ownerStudyExists(context = {})          // PROFILE-051
static activeTasksExist(context = {})          // PROFILE-052
static deletionNotAllowed(context = {})        // PROFILE-053
static confirmationMismatch(context = {})      // PROFILE-054
static deletionCooldown(context = {})          // PROFILE-055

// D-2: PROFILE-056 ~ PROFILE-060 (삭제 처리)
static deletionFailed(context = {})            // PROFILE-056
static dataCleanupFailed(context = {})         // PROFILE-057
static sessionClearFailed(context = {})        // PROFILE-058
static alreadyDeleted(context = {})            // PROFILE-059
static deletionRollbackFailed(context = {})    // PROFILE-060
```

### E. PRIVACY (프라이버시) - 10개

```javascript
// E-1: PROFILE-061 ~ PROFILE-065 (설정)
static invalidPrivacySetting(context = {})     // PROFILE-061
static privacyUpdateFailed(context = {})       // PROFILE-062
static privacyFetchFailed(context = {})        // PROFILE-063
static profileVisibilityError(context = {})    // PROFILE-064
static contactVisibilityError(context = {})    // PROFILE-065

// E-2: PROFILE-066 ~ PROFILE-070 (데이터 보호)
static dataExportFailed(context = {})          // PROFILE-066
static dataExportTooLarge(context = {})        // PROFILE-067
static dataExportInProgress(context = {})      // PROFILE-068
static gdprRequestFailed(context = {})         // PROFILE-069
static consentRequired(context = {})           // PROFILE-070
```

### F. VERIFICATION (인증) - 10개

```javascript
// F-1: PROFILE-071 ~ PROFILE-075 (이메일 인증)
static emailNotVerified(context = {})          // PROFILE-071
static verificationExpired(context = {})       // PROFILE-072
static verificationCodeInvalid(context = {})   // PROFILE-073
static verificationSendFailed(context = {})    // PROFILE-074
static verificationTooManyAttempts(context = {}) // PROFILE-075

// F-2: PROFILE-076 ~ PROFILE-080 (추가 인증)
static phoneNotVerified(context = {})          // PROFILE-076
static twoFactorRequired(context = {})         // PROFILE-077
static twoFactorInvalid(context = {})          // PROFILE-078
static backupCodeInvalid(context = {})         // PROFILE-079
static securityQuestionIncorrect(context = {}) // PROFILE-080
```

### G. SOCIAL (소셜 연동) - 10개

```javascript
// G-1: PROFILE-081 ~ PROFILE-085 (연동)
static socialLinkFailed(context = {})          // PROFILE-081
static socialAlreadyLinked(context = {})       // PROFILE-082
static socialUnlinkFailed(context = {})        // PROFILE-083
static socialAccountNotFound(context = {})     // PROFILE-084
static socialProviderError(context = {})       // PROFILE-085

// G-2: PROFILE-086 ~ PROFILE-090 (동기화)
static socialSyncFailed(context = {})          // PROFILE-086
static socialProfileFetchFailed(context = {})  // PROFILE-087
static socialTokenExpired(context = {})        // PROFILE-088
static socialPermissionDenied(context = {})    // PROFILE-089
static lastSocialUnlinkDenied(context = {})    // PROFILE-090
```

---

## 유효성 검증 함수

### 파일 위치
```
coup/src/lib/utils/profile/validators.js
```

### 함수 목록

```javascript
/**
 * 프로필 이름 검증
 * @param {string} name - 검증할 이름
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateProfileName(name) {
  if (!name) {
    return { valid: false, error: '이름은 필수 항목입니다' }
  }

  if (typeof name !== 'string') {
    return { valid: false, error: '이름은 문자열이어야 합니다' }
  }

  const trimmed = name.trim()

  if (trimmed.length < 2) {
    return { valid: false, error: '이름은 2자 이상이어야 합니다' }
  }

  if (trimmed.length > 50) {
    return { valid: false, error: '이름은 50자 이하여야 합니다' }
  }

  // 한글, 영문, 숫자, 일부 특수문자만 허용
  const nameRegex = /^[가-힣a-zA-Z0-9\s\-_.]+$/
  if (!nameRegex.test(trimmed)) {
    return { valid: false, error: '이름에는 한글, 영문, 숫자만 사용할 수 있습니다' }
  }

  return { valid: true }
}

/**
 * 자기소개 검증
 */
export function validateBio(bio) {
  if (!bio) {
    return { valid: true }  // 선택 사항
  }

  if (typeof bio !== 'string') {
    return { valid: false, error: '자기소개는 문자열이어야 합니다' }
  }

  if (bio.length > 200) {
    return { valid: false, error: '자기소개는 200자 이하여야 합니다' }
  }

  return { valid: true }
}

/**
 * 비밀번호 강도 검증 (zxcvbn 사용)
 */
export function validatePasswordStrength(password) {
  const zxcvbn = require('zxcvbn')
  const result = zxcvbn(password)

  return {
    score: result.score,  // 0-4
    feedback: result.feedback.suggestions,
    warning: result.feedback.warning,
    crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second
  }
}

/**
 * XSS 검사
 */
export function checkXSS(text) {
  if (!text) return false

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
  ]

  return xssPatterns.some(pattern => pattern.test(text))
}

/**
 * 아바타 파일 검증
 */
export function validateAvatarFile(file) {
  const maxSize = 5 * 1024 * 1024  // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

  if (!file) {
    return { valid: false, error: '파일이 제공되지 않았습니다' }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `파일 크기는 ${maxSize / (1024 * 1024)}MB 이하여야 합니다`
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'JPG, PNG, GIF, WebP 형식만 지원합니다'
    }
  }

  return { valid: true }
}

/**
 * 이메일 형식 검증
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, error: '이메일은 필수 항목입니다' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: '올바른 이메일 형식이 아닙니다' }
  }

  return { valid: true }
}

/**
 * 금지된 닉네임 확인
 */
export function isForbiddenNickname(name) {
  const forbiddenNames = [
    'admin', 'administrator', 'root', 'system',
    'master', 'owner', 'moderator', 'support',
    'null', 'undefined', 'anonymous', 'guest'
  ]

  return forbiddenNames.includes(name.toLowerCase())
}
```

---

## 에러 로거

### 파일 위치
```
coup/src/lib/loggers/profile/profileLogger.js
```

### 로거 구현

```javascript
/**
 * Profile 영역 전용 로거
 */

const LOG_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
}

/**
 * 구조화된 로그 생성
 */
function createLog(level, message, context = {}) {
  return {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    area: 'profile'
  }
}

/**
 * 프로필 에러 로깅
 */
export function logProfileError(error, context = {}) {
  const log = createLog(LOG_LEVELS.ERROR, error.message, {
    ...context,
    code: error.code || 'UNKNOWN',
    statusCode: error.statusCode || 500,
    stack: error.stack
  })

  console.error('[PROFILE ERROR]', JSON.stringify(log, null, 2))

  // 프로덕션: 외부 로깅 서비스로 전송
  // if (process.env.NODE_ENV === 'production') {
  //   sendToLoggingService(log)
  // }

  return log
}

/**
 * 프로필 정보 로깅
 */
export function logProfileInfo(message, context = {}) {
  const log = createLog(LOG_LEVELS.INFO, message, context)
  console.log('[PROFILE INFO]', JSON.stringify(log, null, 2))
  return log
}

/**
 * 프로필 경고 로깅
 */
export function logProfileWarning(message, context = {}) {
  const log = createLog(LOG_LEVELS.WARNING, message, context)
  console.warn('[PROFILE WARNING]', JSON.stringify(log, null, 2))
  return log
}

/**
 * 보안 이벤트 로깅
 */
export function logProfileSecurity(eventType, context = {}) {
  const log = createLog(LOG_LEVELS.WARNING, `Security event: ${eventType}`, {
    ...context,
    eventType,
    severity: 'high'
  })

  console.warn('[PROFILE SECURITY]', JSON.stringify(log, null, 2))

  // 프로덕션: 보안 모니터링 시스템으로 전송
  // if (process.env.NODE_ENV === 'production') {
  //   sendToSecurityMonitoring(log)
  // }

  return log
}
```

---

## 사용 예제

### API 라우트에서 사용

```javascript
// coup/src/app/api/users/me/route.js
import { ProfileException } from '@/lib/exceptions/profile/ProfileException'
import { validateProfileName, validateBio, checkXSS } from '@/lib/utils/profile/validators'
import { logProfileError, logProfileInfo } from '@/lib/loggers/profile/profileLogger'

export async function PATCH(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const { name, bio, avatar } = body

    // 이름 검증
    if (name) {
      const nameValidation = validateProfileName(name)
      if (!nameValidation.valid) {
        throw ProfileException.invalidNameFormat({
          name,
          error: nameValidation.error,
          userId: session.user.id
        })
      }

      // XSS 검사
      if (checkXSS(name)) {
        logProfileSecurity('XSS_DETECTED', {
          userId: session.user.id,
          field: 'name',
          value: name
        })
        throw ProfileException.xssDetected({
          field: 'name',
          userId: session.user.id
        })
      }
    }

    // 자기소개 검증
    if (bio !== undefined) {
      const bioValidation = validateBio(bio)
      if (!bioValidation.valid) {
        throw ProfileException.bioTooLong({
          length: bio.length,
          max: 200,
          userId: session.user.id
        })
      }

      if (checkXSS(bio)) {
        logProfileSecurity('XSS_DETECTED', {
          userId: session.user.id,
          field: 'bio'
        })
        throw ProfileException.xssDetected({
          field: 'bio',
          userId: session.user.id
        })
      }
    }

    // 업데이트 실행
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
      }
    })

    logProfileInfo('Profile updated', {
      userId: session.user.id,
      fields: Object.keys({ name, bio, avatar }).filter(k => body[k] !== undefined)
    })

    return NextResponse.json({
      success: true,
      message: "프로필이 업데이트되었습니다",
      user
    })

  } catch (error) {
    logProfileError(error, {
      userId: session.user.id,
      action: 'update_profile'
    })

    if (error instanceof ProfileException) {
      return NextResponse.json(
        error.toResponse(),
        { status: error.statusCode }
      )
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'PROFILE-014',
        message: '프로필 업데이트에 실패했습니다'
      }
    }, { status: 500 })
  }
}
```

### 컴포넌트에서 사용

```javascript
// ProfileEditForm.jsx
import { validateProfileName, validateBio } from '@/lib/utils/profile/validators'
import { useToast } from '@/components/ui/Toast'

const [errors, setErrors] = useState({})
const { showToast } = useToast()

const validateForm = () => {
  const newErrors = {}

  // 이름 검증
  const nameValidation = validateProfileName(formData.name)
  if (!nameValidation.valid) {
    newErrors.name = nameValidation.error
  }

  // 자기소개 검증
  const bioValidation = validateBio(formData.bio)
  if (!bioValidation.valid) {
    newErrors.bio = bioValidation.error
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async (e) => {
  e.preventDefault()

  if (!validateForm()) {
    return
  }

  try {
    await updateProfile.mutateAsync(formData)
    showToast('정보가 수정되었습니다', 'success')
  } catch (error) {
    const errorCode = error.response?.data?.error?.code
    const errorMessage = error.response?.data?.error?.message

    showToast(errorMessage || '프로필 수정에 실패했습니다', 'error')

    // 특정 에러 코드에 따른 처리
    if (errorCode === 'PROFILE-012') {  // XSS 감지
      setErrors({
        name: '보안상 허용되지 않는 내용이 포함되어 있습니다',
        bio: '보안상 허용되지 않는 내용이 포함되어 있습니다'
      })
    }
  }
}
```

---

## 요약

### 생성할 파일 (3개)
1. `coup/src/lib/exceptions/profile/ProfileException.js` (~500줄)
2. `coup/src/lib/utils/profile/validators.js` (~300줄)
3. `coup/src/lib/loggers/profile/profileLogger.js` (~150줄)

### 에러 코드 체계
- **총 90개** 메서드
- **7개 카테고리**
- **일관된 네이밍**: `camelCase` static 메서드
- **명확한 코드**: `PROFILE-001` ~ `PROFILE-090`

### 다음 단계
- Phase 2에서 실제 파일 구현
- 각 메서드 완전한 JSDoc 작성
- 단위 테스트 작성

---

**작성 완료일**: 2025-12-01  
**다음 문서**: `PHASE-PLAN.md`

