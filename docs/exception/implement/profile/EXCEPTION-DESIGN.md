# Profile Exception 클래스 설계

**작성일**: 2025-12-01  
**Phase**: 1 - 분석 및 계획  
**목표**: ProfileException 클래스 및 유틸리티 설계

---

## 📋 목차

1. [ProfileException 클래스 구조](#profileexception-클래스-구조)
2. [카테고리별 메서드 목록](#카테고리별-메서드-목록)
3. [에러 응답 형식](#에러-응답-형식)
4. [유효성 검증 함수](#유효성-검증-함수)
5. [에러 로거](#에러-로거)
6. [사용 예제](#사용-예제)

---

## ProfileException 클래스 구조

### 기본 클래스

```javascript
/**
 * Profile 영역 예외 처리 클래스
 * 
 * @class ProfileException
 * @extends Error
 */
class ProfileException extends Error {
  /**
   * @param {string} code - 에러 코드 (PROFILE-001 ~ PROFILE-090)
   * @param {string} message - 사용자 친화적 에러 메시지
   * @param {number} statusCode - HTTP 상태 코드 (400, 401, 403, 404, 409, 429, 500)
   * @param {Object} context - 추가 컨텍스트 정보
   */
  constructor(code, message, statusCode = 400, context = {}) {
    super(message)
    this.name = 'ProfileException'
    this.code = code
    this.message = message
    this.userMessage = message  // 사용자에게 표시할 메시지
    this.statusCode = statusCode
    this.context = context
    this.timestamp = new Date().toISOString()
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * JSON 형식으로 변환
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp
    }
  }

  /**
   * API 응답 형식으로 변환
   */
  toResponse() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.userMessage,
        ...(Object.keys(this.context).length > 0 && { details: this.context })
      }
    }
  }

  // ==========================================
  // Static Factory Methods (90개)
  // ==========================================

  // A. PROFILE_INFO (프로필 정보) - 20개
  // B. AVATAR (아바타) - 15개
  // C. PASSWORD (비밀번호) - 15개
  // D. ACCOUNT_DELETE (계정 삭제) - 10개
  // E. PRIVACY (프라이버시) - 10개
  // F. VERIFICATION (인증) - 10개
  // G. SOCIAL (소셜 연동) - 10개
}
```

---

## 카테고리별 메서드 목록

### A. PROFILE_INFO (프로필 정보) - 20개

#### 1-5: 필수 필드 및 형식
```javascript
/**
 * PROFILE-001: 필수 필드 누락
 */
static requiredFieldMissing(context = {}) {
  return new ProfileException(
    'PROFILE-001',
    `${context.field || '필수 필드'}는 필수 항목입니다`,
    400,
    context
  )
}

/**
 * PROFILE-002: 이름 형식 오류
 */
static invalidNameFormat(context = {}) {
  return new ProfileException(
    'PROFILE-002',
    '이름에는 한글, 영문, 숫자만 사용할 수 있습니다',
    400,
    context
  )
}

/**
 * PROFILE-003: 이름 너무 짧음
 */
static nameTooShort(context = {}) {
  return new ProfileException(
    'PROFILE-003',
    `이름은 최소 ${context.min || 2}자 이상이어야 합니다 (현재: ${context.length}자)`,
    400,
    context
  )
}

/**
 * PROFILE-004: 이름 너무 김
 */
static nameTooLong(context = {}) {
  return new ProfileException(
    'PROFILE-004',
    `이름은 최대 ${context.max || 50}자 이하여야 합니다 (현재: ${context.length}자)`,
    400,
    context
  )
}

/**
 * PROFILE-005: 자기소개 너무 김
 */
static bioTooLong(context = {}) {
  return new ProfileException(
    'PROFILE-005',
    `자기소개는 최대 ${context.max || 200}자 이하여야 합니다 (현재: ${context.length}자)`,
    400,
    context
  )
}
```

#### 6-10: 중복 및 금지
```javascript
/**
 * PROFILE-006: 부적절한 자기소개 내용
 */
static invalidBioContent(context = {}) {
  return new ProfileException(
    'PROFILE-006',
    '자기소개에 부적절한 내용이 포함되어 있습니다',
    400,
    context
  )
}

/**
 * PROFILE-007: 중복 이메일
 */
static duplicateEmail(context = {}) {
  return new ProfileException(
    'PROFILE-007',
    '이미 사용 중인 이메일입니다',
    409,
    context
  )
}

/**
 * PROFILE-008: 이메일 형식 오류
 */
static invalidEmailFormat(context = {}) {
  return new ProfileException(
    'PROFILE-008',
    '올바른 이메일 형식이 아닙니다',
    400,
    context
  )
}

/**
 * PROFILE-009: 중복 닉네임
 */
static duplicateNickname(context = {}) {
  return new ProfileException(
    'PROFILE-009',
    `"${context.name}"은(는) 이미 사용 중인 닉네임입니다`,
    409,
    context
  )
}

/**
 * PROFILE-010: 금지된 닉네임
 */
static forbiddenNickname(context = {}) {
  return new ProfileException(
    'PROFILE-010',
    `"${context.name}"은(는) 사용할 수 없는 닉네임입니다`,
    400,
    context
  )
}
```

#### 11-15: 보안 및 검증
```javascript
/**
 * PROFILE-011: 허용되지 않은 특수문자
 */
static specialCharError(context = {}) {
  return new ProfileException(
    'PROFILE-011',
    '허용되지 않은 특수문자가 포함되어 있습니다',
    400,
    context
  )
}

/**
 * PROFILE-012: XSS 공격 감지
 */
static xssDetected(context = {}) {
  return new ProfileException(
    'PROFILE-012',
    '보안상 허용되지 않는 내용이 포함되어 있습니다',
    400,
    context
  )
}

/**
 * PROFILE-013: SQL Injection 감지
 */
static sqlInjectionDetected(context = {}) {
  return new ProfileException(
    'PROFILE-013',
    '보안상 허용되지 않는 내용이 포함되어 있습니다',
    400,
    context
  )
}

/**
 * PROFILE-014: 프로필 업데이트 실패
 */
static updateFailed(context = {}) {
  return new ProfileException(
    'PROFILE-014',
    '프로필 업데이트에 실패했습니다',
    500,
    context
  )
}

/**
 * PROFILE-015: 프로필을 찾을 수 없음
 */
static notFound(context = {}) {
  return new ProfileException(
    'PROFILE-015',
    '사용자 프로필을 찾을 수 없습니다',
    404,
    context
  )
}
```

#### 16-20: 권한 및 제한
```javascript
/**
 * PROFILE-016: 권한 없음
 */
static unauthorizedAccess(context = {}) {
  return new ProfileException(
    'PROFILE-016',
    '다른 사용자의 프로필을 수정할 수 없습니다',
    403,
    context
  )
}

/**
 * PROFILE-017: 세션 만료
 */
static sessionExpired(context = {}) {
  return new ProfileException(
    'PROFILE-017',
    '세션이 만료되었습니다. 다시 로그인해주세요',
    401,
    context
  )
}

/**
 * PROFILE-018: 요청 빈도 초과
 */
static rateLimitExceeded(context = {}) {
  const { limit, window, remaining } = context
  return new ProfileException(
    'PROFILE-018',
    `너무 많은 요청을 보냈습니다. ${window || '5분'} 후 다시 시도해주세요`,
    429,
    { limit, window, remaining }
  )
}

/**
 * PROFILE-019: 동시 업데이트 충돌
 */
static concurrentUpdate(context = {}) {
  return new ProfileException(
    'PROFILE-019',
    '다른 곳에서 프로필이 수정되었습니다. 새로고침 후 다시 시도해주세요',
    409,
    context
  )
}

/**
 * PROFILE-020: 종합 유효성 검사 실패
 */
static validationError(context = {}) {
  return new ProfileException(
    'PROFILE-020',
    context.errors?.join(', ') || '입력값이 올바르지 않습니다',
    400,
    context
  )
}
```

---

### B. AVATAR (아바타) - 15개

```javascript
/**
 * PROFILE-021: 지원하지 않는 파일 형식
 */
static unsupportedFileFormat(context = {}) {
  const supported = context.supported || ['jpg', 'png', 'webp']
  return new ProfileException(
    'PROFILE-021',
    `지원하지 않는 파일 형식입니다 (지원: ${supported.join(', ')})`,
    400,
    context
  )
}

/**
 * PROFILE-022: 파일 크기 초과
 */
static fileSizeExceeded(context = {}) {
  const { size, maxSize = 5 } = context
  const sizeMB = (size / (1024 * 1024)).toFixed(2)
  return new ProfileException(
    'PROFILE-022',
    `파일 크기가 너무 큽니다 (${sizeMB}MB / 최대 ${maxSize}MB)`,
    400,
    context
  )
}

/**
 * PROFILE-023: 이미지 차원 초과
 */
static imageDimensionExceeded(context = {}) {
  const { width, height, maxDimension = 4000 } = context
  return new ProfileException(
    'PROFILE-023',
    `이미지 크기가 너무 큽니다 (${width}x${height} / 최대 ${maxDimension}x${maxDimension})`,
    400,
    context
  )
}

/**
 * PROFILE-024: 손상된 이미지 파일
 */
static corruptedImageFile(context = {}) {
  return new ProfileException(
    'PROFILE-024',
    '손상된 이미지 파일입니다',
    400,
    context
  )
}

/**
 * PROFILE-025: 업로드 서버 오류
 */
static uploadServerError(context = {}) {
  return new ProfileException(
    'PROFILE-025',
    '파일 업로드 중 오류가 발생했습니다',
    500,
    context
  )
}

/**
 * PROFILE-026: 업로드 타임아웃
 */
static uploadTimeout(context = {}) {
  return new ProfileException(
    'PROFILE-026',
    '파일 업로드 시간이 초과되었습니다',
    408,
    context
  )
}

/**
 * PROFILE-027: 네트워크 오류
 */
static networkError(context = {}) {
  return new ProfileException(
    'PROFILE-027',
    '네트워크 오류가 발생했습니다',
    503,
    context
  )
}

/**
 * PROFILE-028: 저장 공간 부족
 */
static storageQuotaExceeded(context = {}) {
  return new ProfileException(
    'PROFILE-028',
    '저장 공간이 부족합니다',
    507,
    context
  )
}

/**
 * PROFILE-029: 이미지 처리 실패
 */
static imageProcessingFailed(context = {}) {
  return new ProfileException(
    'PROFILE-029',
    '이미지 처리에 실패했습니다',
    500,
    context
  )
}

/**
 * PROFILE-030: 썸네일 생성 실패
 */
static thumbnailGenerationFailed(context = {}) {
  return new ProfileException(
    'PROFILE-030',
    '썸네일 생성에 실패했습니다',
    500,
    context
  )
}

/**
 * PROFILE-031: 기존 아바타 삭제 실패
 */
static oldAvatarDeleteFailed(context = {}) {
  return new ProfileException(
    'PROFILE-031',
    '기존 아바타 삭제에 실패했습니다',
    500,
    context
  )
}

/**
 * PROFILE-032: CDN 업로드 실패
 */
static cdnUploadFailed(context = {}) {
  return new ProfileException(
    'PROFILE-032',
    'CDN 업로드에 실패했습니다',
    500,
    context
  )
}

/**
 * PROFILE-033: 잘못된 파일 경로
 */
static invalidFilePath(context = {}) {
  return new ProfileException(
    'PROFILE-033',
    '잘못된 파일 경로입니다',
    400,
    context
  )
}

/**
 * PROFILE-034: 업로드 권한 없음
 */
static uploadPermissionDenied(context = {}) {
  return new ProfileException(
    'PROFILE-034',
    '파일 업로드 권한이 없습니다',
    403,
    context
  )
}

/**
 * PROFILE-035: 바이러스 검출
 */
static virusDetected(context = {}) {
  return new ProfileException(
    'PROFILE-035',
    '보안 검사에서 위험 요소가 발견되었습니다',
    400,
    context
  )
}
```

---

### C. PASSWORD (비밀번호) - 15개

```javascript
/**
 * PROFILE-036: 현재 비밀번호 불일치
 */
static currentPasswordMismatch(context = {}) {
  return new ProfileException(
    'PROFILE-036',
    '현재 비밀번호가 일치하지 않습니다',
    400,
    context
  )
}

/**
 * PROFILE-037: 비밀번호 형식 오류
 */
static invalidPasswordFormat(context = {}) {
  return new ProfileException(
    'PROFILE-037',
    '비밀번호는 8자 이상, 영문 대소문자, 숫자, 특수문자를 포함해야 합니다',
    400,
    context
  )
}

/**
 * PROFILE-038: 비밀번호 너무 약함
 */
static passwordTooWeak(context = {}) {
  const { score, feedback } = context
  return new ProfileException(
    'PROFILE-038',
    feedback || '비밀번호가 너무 약합니다. 더 강한 비밀번호를 사용해주세요',
    400,
    { score, feedback }
  )
}

/**
 * PROFILE-039: 이전 비밀번호와 동일
 */
static passwordReuse(context = {}) {
  return new ProfileException(
    'PROFILE-039',
    '최근 사용한 비밀번호는 재사용할 수 없습니다',
    400,
    context
  )
}

/**
 * PROFILE-040: 비밀번호 확인 불일치
 */
static passwordConfirmationMismatch(context = {}) {
  return new ProfileException(
    'PROFILE-040',
    '비밀번호 확인이 일치하지 않습니다',
    400,
    context
  )
}

/**
 * PROFILE-041: 비밀번호 변경 실패
 */
static passwordChangeFailed(context = {}) {
  return new ProfileException(
    'PROFILE-041',
    '비밀번호 변경에 실패했습니다',
    500,
    context
  )
}

/**
 * PROFILE-042: 재설정 토큰 만료
 */
static resetTokenExpired(context = {}) {
  return new ProfileException(
    'PROFILE-042',
    '비밀번호 재설정 링크가 만료되었습니다',
    400,
    context
  )
}

/**
 * PROFILE-043: 유효하지 않은 재설정 토큰
 */
static invalidResetToken(context = {}) {
  return new ProfileException(
    'PROFILE-043',
    '유효하지 않은 비밀번호 재설정 링크입니다',
    400,
    context
  )
}

/**
 * PROFILE-044: 이메일 전송 실패
 */
static emailSendFailed(context = {}) {
  return new ProfileException(
    'PROFILE-044',
    '이메일 전송에 실패했습니다',
    500,
    context
  )
}

/**
 * PROFILE-045: 비밀번호 변경 대기 시간
 */
static passwordChangeCooldown(context = {}) {
  const { hoursRemaining } = context
  return new ProfileException(
    'PROFILE-045',
    `비밀번호는 24시간에 한 번만 변경할 수 있습니다 (${hoursRemaining}시간 남음)`,
    429,
    context
  )
}

/**
 * PROFILE-046: 세션 유효하지 않음
 */
static sessionInvalid(context = {}) {
  return new ProfileException(
    'PROFILE-046',
    '세션이 유효하지 않습니다',
    401,
    context
  )
}

/**
 * PROFILE-047: 2FA 인증 필요
 */
static twoFactorRequired(context = {}) {
  return new ProfileException(
    'PROFILE-047',
    '2단계 인증이 필요합니다',
    403,
    context
  )
}

/**
 * PROFILE-048: 2FA 코드 오류
 */
static twoFactorCodeInvalid(context = {}) {
  return new ProfileException(
    'PROFILE-048',
    '2단계 인증 코드가 올바르지 않습니다',
    400,
    context
  )
}

/**
 * PROFILE-049: 보안 질문 답변 오류
 */
static securityQuestionMismatch(context = {}) {
  return new ProfileException(
    'PROFILE-049',
    '보안 질문 답변이 일치하지 않습니다',
    400,
    context
  )
}

/**
 * PROFILE-050: 계정 잠금
 */
static accountLocked(context = {}) {
  const { lockDuration = 30 } = context
  return new ProfileException(
    'PROFILE-050',
    `비밀번호를 ${context.attempts || 5}회 잘못 입력하여 계정이 잠겼습니다 (${lockDuration}분 후 재시도)`,
    403,
    context
  )
}
```

---

### D. ACCOUNT_DELETE (계정 삭제) - 10개

```javascript
/**
 * PROFILE-051: 확인 코드 불일치
 */
static deleteConfirmationMismatch(context = {}) {
  return new ProfileException(
    'PROFILE-051',
    '확인 코드가 일치하지 않습니다',
    400,
    context
  )
}

/**
 * PROFILE-052: 재확인 필요
 */
static deleteReconfirmationRequired(context = {}) {
  return new ProfileException(
    'PROFILE-052',
    '계정 삭제를 위해 재확인이 필요합니다',
    400,
    context
  )
}

/**
 * PROFILE-053: 소유한 스터디 존재
 */
static ownedStudiesExist(context = {}) {
  const { studyCount } = context
  return new ProfileException(
    'PROFILE-053',
    `소유한 스터디(${studyCount}개)를 먼저 양도하거나 삭제해주세요`,
    400,
    context
  )
}

/**
 * PROFILE-054: 결제 미해결 건 존재
 */
static unpaidBillsExist(context = {}) {
  return new ProfileException(
    'PROFILE-054',
    '미결제 건이 있어 계정을 삭제할 수 없습니다',
    400,
    context
  )
}

/**
 * PROFILE-055: 계정 삭제 실패
 */
static accountDeleteFailed(context = {}) {
  return new ProfileException(
    'PROFILE-055',
    '계정 삭제에 실패했습니다',
    500,
    context
  )
}

/**
 * PROFILE-056: 관련 데이터 정리 실패
 */
static dataCleanupFailed(context = {}) {
  return new ProfileException(
    'PROFILE-056',
    '데이터 정리에 실패했습니다',
    500,
    context
  )
}

/**
 * PROFILE-057: 계정 복구 기간
 */
static accountRecoveryPeriod(context = {}) {
  const { days = 30 } = context
  return new ProfileException(
    'PROFILE-057',
    `계정이 삭제되었습니다. ${days}일 이내에 복구할 수 있습니다`,
    200,
    context
  )
}

/**
 * PROFILE-058: 이미 삭제된 계정
 */
static accountAlreadyDeleted(context = {}) {
  return new ProfileException(
    'PROFILE-058',
    '이미 삭제된 계정입니다',
    400,
    context
  )
}

/**
 * PROFILE-059: 관리자 계정 삭제 불가
 */
static adminAccountDeleteDenied(context = {}) {
  return new ProfileException(
    'PROFILE-059',
    '관리자 계정은 삭제할 수 없습니다',
    403,
    context
  )
}

/**
 * PROFILE-060: 삭제 대기 중
 */
static deletePending(context = {}) {
  return new ProfileException(
    'PROFILE-060',
    '계정 삭제가 진행 중입니다',
    202,
    context
  )
}
```

---

### E. PRIVACY (프라이버시) - 10개

```javascript
/**
 * PROFILE-061: 잘못된 프라이버시 설정
 */
static invalidPrivacySetting(context = {}) {
  return new ProfileException(
    'PROFILE-061',
    '잘못된 프라이버시 설정입니다',
    400,
    context
  )
}

// ... (PROFILE-062 ~ PROFILE-070)
// 간결성을 위해 나머지는 README.md 참조
```

### F. VERIFICATION (인증) - 10개
### G. SOCIAL (소셜 연동) - 10개

_전체 90개 메서드는 구현 시 완성됩니다._

---

## 에러 응답 형식

### 표준 응답 구조

```javascript
{
  "success": false,
  "error": {
    "code": "PROFILE-001",
    "message": "이름은 필수 항목입니다",
    "details": {  // 선택적
      "field": "name",
      "userId": "user-123"
    }
  }
}
```

### HTTP 상태 코드 매핑

| 상태 코드 | 사용 시나리오 | 예외 코드 예시 |
|-----------|---------------|----------------|
| 400 | 잘못된 요청, 검증 실패 | PROFILE-001~020 |
| 401 | 인증 실패, 세션 만료 | PROFILE-017, 046 |
| 403 | 권한 없음 | PROFILE-016, 034, 050 |
| 404 | 리소스 없음 | PROFILE-015 |
| 408 | 타임아웃 | PROFILE-026 |
| 409 | 충돌 (중복, 동시 업데이트) | PROFILE-007, 009, 019 |
| 429 | Rate Limit 초과 | PROFILE-018, 045 |
| 500 | 서버 오류 | PROFILE-014, 025, 041 |
| 503 | 서비스 불가 | PROFILE-027 |
| 507 | 저장 공간 부족 | PROFILE-028 |

---

## 유효성 검증 함수

### 파일: `coup/src/lib/utils/profile/validators.js`

```javascript
import validator from 'validator'
import zxcvbn from 'zxcvbn'

/**
 * 이름 검증
 * @param {string} name - 검증할 이름
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateName(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'REQUIRED_FIELD_MISSING' }
  }
  
  if (name.length < 2) {
    return { valid: false, error: 'NAME_TOO_SHORT' }
  }
  
  if (name.length > 50) {
    return { valid: false, error: 'NAME_TOO_LONG' }
  }
  
  // 한글, 영문, 숫자, 공백만 허용
  const nameRegex = /^[가-힣a-zA-Z0-9\s]+$/
  if (!nameRegex.test(name)) {
    return { valid: false, error: 'INVALID_NAME_FORMAT' }
  }
  
  return { valid: true, error: null }
}

/**
 * 자기소개 검증
 */
export function validateBio(bio) {
  if (!bio) return { valid: true, error: null }  // 선택적
  
  if (bio.length > 200) {
    return { valid: false, error: 'BIO_TOO_LONG' }
  }
  
  // 부적절한 단어 검사 (간단한 예시)
  const forbiddenWords = ['욕설1', '욕설2', '광고']
  for (const word of forbiddenWords) {
    if (bio.includes(word)) {
      return { valid: false, error: 'INVALID_BIO_CONTENT' }
    }
  }
  
  return { valid: true, error: null }
}

/**
 * 비밀번호 검증
 */
export function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, error: 'INVALID_PASSWORD_FORMAT' }
  }
  
  // 영문 대소문자, 숫자, 특수문자 포함 확인
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return { valid: false, error: 'INVALID_PASSWORD_FORMAT' }
  }
  
  return { valid: true, error: null }
}

/**
 * 비밀번호 강도 검사 (zxcvbn 사용)
 */
export function validatePasswordStrength(password) {
  const result = zxcvbn(password)
  
  return {
    score: result.score,  // 0-4
    feedback: result.feedback.warning || result.feedback.suggestions.join(' '),
    crackTimeSeconds: result.crack_times_seconds.offline_slow_hashing_1e4_per_second
  }
}

/**
 * 이메일 검증
 */
export function validateEmail(email) {
  if (!validator.isEmail(email)) {
    return { valid: false, error: 'INVALID_EMAIL_FORMAT' }
  }
  
  return { valid: true, error: null }
}

/**
 * 이미지 파일 검증
 */
export function validateImageFile(file) {
  const allowedFormats = ['image/jpeg', 'image/png', 'image/webp']
  
  if (!allowedFormats.includes(file.mimetype)) {
    return { valid: false, error: 'UNSUPPORTED_FILE_FORMAT' }
  }
  
  const maxSize = 5 * 1024 * 1024  // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'FILE_SIZE_EXCEEDED' }
  }
  
  return { valid: true, error: null }
}

/**
 * XSS 공격 검사
 */
export function checkXSS(input) {
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /onerror=/gi,
    /onload=/gi,
    /<iframe/gi
  ]
  
  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      return true  // XSS 감지
    }
  }
  
  return false
}

/**
 * SQL Injection 검사
 */
export function checkSQLInjection(input) {
  const sqlPatterns = [
    /(\bOR\b|\bAND\b).+?=/i,
    /UNION.+?SELECT/i,
    /INSERT.+?INTO/i,
    /DELETE.+?FROM/i,
    /DROP.+?TABLE/i
  ]
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      return true  // SQL Injection 감지
    }
  }
  
  return false
}

/**
 * 입력값 정제
 */
export function sanitizeInput(input) {
  return validator.escape(input.trim())
}
```

---

## 에러 로거

### 파일: `coup/src/lib/utils/profile/errorLogger.js`

```javascript
/**
 * Profile 에러 로깅
 */
export function logProfileError(error, context = {}) {
  const logData = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    module: 'profile',
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    },
    context
  }
  
  console.error('[Profile Error]', JSON.stringify(logData, null, 2))
  
  // 프로덕션: 외부 로깅 서비스 (Sentry, LogRocket)
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { contexts: { profile: context } })
  }
}

/**
 * Profile 경고 로깅
 */
export function logProfileWarning(message, context = {}) {
  const logData = {
    timestamp: new Date().toISOString(),
    level: 'WARNING',
    module: 'profile',
    message,
    context
  }
  
  console.warn('[Profile Warning]', JSON.stringify(logData, null, 2))
}

/**
 * Profile 정보 로깅
 */
export function logProfileInfo(message, context = {}) {
  const logData = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    module: 'profile',
    message,
    context
  }
  
  console.log('[Profile Info]', JSON.stringify(logData, null, 2))
}
```

---

## 사용 예제

### API 라우트에서 사용

```javascript
// PATCH /api/users/me/route.js
import { ProfileException } from '@/lib/exceptions/profile/ProfileException'
import { validateName, validateBio, checkXSS } from '@/lib/utils/profile/validators'
import { logProfileError, logProfileInfo } from '@/lib/utils/profile/errorLogger'

export async function PATCH(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const { name, bio } = body

    // 이름 검증
    if (!name) {
      throw ProfileException.requiredFieldMissing({
        field: 'name',
        userId: session.user.id
      })
    }

    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      throw ProfileException[nameValidation.error]({
        name,
        length: name.length
      })
    }

    // XSS 검사
    if (checkXSS(name) || checkXSS(bio)) {
      logProfileWarning('XSS attempt detected', {
        userId: session.user.id,
        field: 'name or bio'
      })
      
      throw ProfileException.xssDetected({
        userId: session.user.id
      })
    }

    // 업데이트
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, bio }
    })

    logProfileInfo('Profile updated successfully', {
      userId: session.user.id,
      updatedFields: ['name', 'bio']
    })

    return NextResponse.json({
      success: true,
      message: "프로필이 업데이트되었습니다",
      user
    })

  } catch (error) {
    logProfileError(error, {
      userId: session?.user?.id,
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
import { useUpdateProfile } from '@/lib/hooks/useApi'
import { useToast } from '@/components/ui/Toast'

const { showToast } = useToast()
const updateProfile = useUpdateProfile()

try {
  await updateProfile.mutateAsync(formData)
  showToast('정보가 수정되었습니다', 'success')
} catch (error) {
  const errorCode = error.response?.data?.error?.code
  const errorMessage = error.response?.data?.error?.message
  
  showToast(errorMessage || '프로필 수정에 실패했습니다', 'error')
  
  // 특정 에러 코드에 따른 처리
  if (errorCode === 'PROFILE-007') {  // 중복 이메일
    setErrors({ email: errorMessage })
  }
}
```

---

**다음 문서**: `PHASE-PLAN.md` (Phase별 상세 계획)

