# Profile Exception 시스템

프로필 영역의 완전한 예외 처리 시스템

---

## 📦 구성 요소

### 1. ProfileException
- **위치**: `coup/src/lib/exceptions/profile/ProfileException.js`
- **메서드**: 90개
- **에러 코드**: PROFILE-001 ~ PROFILE-090

### 2. Validators
- **위치**: `coup/src/lib/utils/profile/validators.js`
- **함수**: 13개
- **기능**: 입력 검증, XSS/SQL Injection 검사

### 3. Logger
- **위치**: `coup/src/lib/loggers/profile/profileLogger.js`
- **함수**: 17개
- **기능**: 구조화된 로깅, 보안 이벤트 추적

---

## 🚀 빠른 시작

### 설치
```bash
# 이미 프로젝트에 포함되어 있음
cd coup
```

### Import
```javascript
// Exception
import { ProfileException } from '@/lib/exceptions/profile';

// Validators
import { 
  validateProfileName, 
  validateBio,
  checkXSS 
} from '@/lib/utils/profile';

// Logger
import { 
  logProfileError, 
  logProfileInfo 
} from '@/lib/loggers/profile';
```

---

## 📖 사용법

### 1. API 라우트에서 사용

```javascript
// coup/src/app/api/users/me/route.js
import { ProfileException } from '@/lib/exceptions/profile';
import { validateProfileName, checkXSS } from '@/lib/utils/profile';
import { logProfileError, logProfileInfo } from '@/lib/loggers/profile';

export async function PATCH(request) {
  const session = await requireAuth();
  
  try {
    const body = await request.json();
    const { name, bio } = body;

    // 이름 검증
    if (name) {
      const nameValidation = validateProfileName(name);
      if (!nameValidation.valid) {
        throw ProfileException.invalidNameFormat({
          name,
          error: nameValidation.error,
          userId: session.user.id
        });
      }

      // XSS 검사
      if (checkXSS(name)) {
        logProfileSecurity('XSS_DETECTED', {
          userId: session.user.id,
          field: 'name'
        });
        throw ProfileException.xssDetected({
          field: 'name',
          userId: session.user.id
        });
      }
    }

    // 업데이트 실행
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, bio }
    });

    logProfileInfo('Profile updated', {
      userId: session.user.id,
      fields: ['name', 'bio']
    });

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    logProfileError(error, {
      userId: session.user.id,
      action: 'update_profile'
    });

    if (error instanceof ProfileException) {
      return NextResponse.json(
        error.toResponse(),
        { status: error.statusCode }
      );
    }

    throw error;
  }
}
```

### 2. 클라이언트 컴포넌트에서 사용

```javascript
// ProfileEditForm.jsx
import { validateProfileName, validateBio } from '@/lib/utils/profile';

const [errors, setErrors] = useState({});

const validateForm = () => {
  const newErrors = {};

  // 이름 검증
  const nameValidation = validateProfileName(formData.name);
  if (!nameValidation.valid) {
    newErrors.name = nameValidation.error;
  }

  // 자기소개 검증
  const bioValidation = validateBio(formData.bio);
  if (!bioValidation.valid) {
    newErrors.bio = bioValidation.error;
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  try {
    const response = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!data.success) {
      // 서버 에러 처리
      toast.error(data.error.message);
      return;
    }

    toast.success('프로필이 업데이트되었습니다');
  } catch (error) {
    toast.error('프로필 업데이트에 실패했습니다');
  }
};
```

### 3. 비밀번호 변경

```javascript
import { ProfileException } from '@/lib/exceptions/profile';
import { validatePasswordStrength } from '@/lib/utils/profile';
import { logPasswordChange } from '@/lib/loggers/profile';

export async function POST(request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    // 비밀번호 강도 검증
    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      throw ProfileException.passwordTooWeak({
        score: strength.score,
        feedback: strength.feedback
      });
    }

    // 현재 비밀번호 확인
    const isValid = await bcrypt.compare(
      currentPassword, 
      user.password
    );
    
    if (!isValid) {
      throw ProfileException.currentPasswordIncorrect({
        userId: user.id
      });
    }

    // 새 비밀번호와 현재 비밀번호 동일 체크
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      throw ProfileException.newPasswordSameAsOld({
        userId: user.id
      });
    }

    // 비밀번호 변경
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    logPasswordChange(user.id, true);

    return NextResponse.json({
      success: true,
      message: '비밀번호가 변경되었습니다'
    });

  } catch (error) {
    logPasswordChange(user.id, false, { error: error.message });
    
    if (error instanceof ProfileException) {
      return NextResponse.json(
        error.toResponse(),
        { status: error.statusCode }
      );
    }
    
    throw error;
  }
}
```

### 4. 계정 삭제

```javascript
import { ProfileException } from '@/lib/exceptions/profile';
import { validateDeletionConfirmation } from '@/lib/utils/profile';
import { logAccountDeletion } from '@/lib/loggers/profile';

export async function DELETE(request) {
  try {
    const { confirmation } = await request.json();

    // 확인 문구 검증
    const confirmValidation = validateDeletionConfirmation(confirmation);
    if (!confirmValidation.valid) {
      throw ProfileException.confirmationMismatch({
        userId: user.id
      });
    }

    // OWNER 스터디 확인
    const ownedStudies = await prisma.studyMember.count({
      where: {
        userId: user.id,
        role: 'OWNER'
      }
    });

    if (ownedStudies > 0) {
      throw ProfileException.ownerStudyExists({
        userId: user.id,
        studyCount: ownedStudies
      });
    }

    // 계정 삭제
    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'DELETED' }
    });

    logAccountDeletion(user.id, 'user_request', {
      studyCount: ownedStudies
    });

    return NextResponse.json({
      success: true,
      message: '계정이 삭제되었습니다'
    });

  } catch (error) {
    if (error instanceof ProfileException) {
      return NextResponse.json(
        error.toResponse(),
        { status: error.statusCode }
      );
    }
    
    throw error;
  }
}
```

---

## 📚 API 레퍼런스

### ProfileException

#### A. PROFILE_INFO (20개)
| 메서드 | 코드 | 설명 |
|--------|------|------|
| requiredFieldMissing | PROFILE-001 | 필수 필드 누락 |
| invalidNameFormat | PROFILE-002 | 이름 형식 오류 |
| nameTooShort | PROFILE-003 | 이름 너무 짧음 |
| nameTooLong | PROFILE-004 | 이름 너무 김 |
| bioTooLong | PROFILE-005 | 자기소개 너무 김 |
| duplicateEmail | PROFILE-007 | 이메일 중복 |
| xssDetected | PROFILE-012 | XSS 공격 감지 |
| unauthorizedAccess | PROFILE-016 | 권한 없음 |
| accountDeleted | PROFILE-019 | 삭제된 계정 |
| ... | ... | ... |

#### B. AVATAR (15개)
| 메서드 | 코드 | 설명 |
|--------|------|------|
| fileNotProvided | PROFILE-021 | 파일 미제공 |
| fileTooLarge | PROFILE-022 | 파일 크기 초과 |
| invalidFileType | PROFILE-023 | 파일 형식 오류 |
| uploadFailed | PROFILE-026 | 업로드 실패 |
| ... | ... | ... |

[전체 목록은 EXCEPTION-DESIGN-COMPLETE.md 참조]

### Validators

| 함수 | 설명 | 반환 |
|------|------|------|
| validateProfileName(name) | 이름 검증 (2-50자) | `{ valid, error? }` |
| validateBio(bio) | 자기소개 검증 (200자) | `{ valid, error? }` |
| validatePasswordStrength(pw) | 비밀번호 강도 | `{ valid, score, feedback }` |
| checkXSS(text) | XSS 패턴 검사 | `boolean` |
| checkSQLInjection(text) | SQL Injection 검사 | `boolean` |
| validateEmail(email) | 이메일 형식 | `{ valid, error? }` |
| isForbiddenNickname(name) | 금지 닉네임 | `boolean` |
| validateAvatarFile(file) | 아바타 파일 (5MB) | `{ valid, error? }` |

### Logger

| 함수 | 설명 |
|------|------|
| logProfileError(error, context) | 에러 로깅 |
| logProfileInfo(message, context) | 정보 로깅 |
| logProfileWarning(message, context) | 경고 로깅 |
| logProfileSecurity(eventType, context) | 보안 이벤트 |
| logProfileUpdate(userId, fields) | 프로필 업데이트 |
| logAvatarUpload(userId, fileInfo) | 아바타 업로드 |
| logPasswordChange(userId, success) | 비밀번호 변경 |
| logAccountDeletion(userId, reason) | 계정 삭제 |

---

## 🧪 테스트

```bash
# ProfileException 테스트
node coup/src/lib/exceptions/profile/test-ProfileException.js

# Validators 테스트
node coup/src/lib/utils/profile/test-validators.js
```

**결과**: 66/66 테스트 통과 (100%)

---

## 📝 에러 코드 범위

| 범위 | 카테고리 | 개수 |
|------|----------|------|
| PROFILE-001 ~ PROFILE-020 | PROFILE_INFO | 20 |
| PROFILE-021 ~ PROFILE-035 | AVATAR | 15 |
| PROFILE-036 ~ PROFILE-050 | PASSWORD | 15 |
| PROFILE-051 ~ PROFILE-060 | ACCOUNT_DELETE | 10 |
| PROFILE-061 ~ PROFILE-070 | PRIVACY | 10 |
| PROFILE-071 ~ PROFILE-080 | VERIFICATION | 10 |
| PROFILE-081 ~ PROFILE-090 | SOCIAL | 10 |

**총 90개 에러 코드**

---

## 🔒 보안 기능

### XSS 방어
- 16개 패턴 검사
- `<script>`, `javascript:`, `onclick=` 등

### SQL Injection 방어
- 6개 패턴 검사
- `SELECT`, `UNION`, `OR 1=1` 등

### 보안 로깅
- 모든 보안 이벤트 자동 로깅
- 프로덕션 환경에서 외부 모니터링 연동 준비

---

## 📄 관련 문서

- [EXCEPTION-DESIGN-COMPLETE.md](./EXCEPTION-DESIGN-COMPLETE.md) - 전체 설계
- [PROFILE-PHASE-PLAN.md](./PROFILE-PHASE-PLAN.md) - Phase 계획
- [PHASE-2-COMPLETE.md](./PHASE-2-COMPLETE.md) - Phase 2 완료 보고서

---

## 🤝 기여

버그 리포트나 개선 제안은 이슈로 등록해주세요.

---

**Created**: 2025-12-01  
**Version**: 1.0.0  
**Status**: Production Ready
