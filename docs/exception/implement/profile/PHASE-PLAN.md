# Profile 영역 Phase별 상세 계획

**작성일**: 2025-12-01  
**Phase**: 1 - 분석 및 계획  
**전체 기간**: 24-30시간 (4개 Phase)

---

## 📋 전체 일정 요약

| Phase | 내용 | 시간 | 난이도 | 상태 |
|-------|------|------|--------|------|
| Phase 1 | 분석 및 계획 | 6h | ⭐⭐ | ✅ 완료 |
| Phase 2 | 예외 클래스/유틸리티 | 6h | ⭐⭐⭐ | ⏳ 대기 |
| Phase 3 | API 라우트 예외 처리 | 8h | ⭐⭐⭐ | ⏳ 대기 |
| Phase 4 | UI 컴포넌트 예외 처리 | 6-10h | ⭐⭐⭐⭐ | ⏳ 대기 |
| **총계** | | **24-30h** | | |

---

## Phase 2: 예외 클래스 및 유틸리티 (6시간)

### 목표
ProfileException 클래스와 모든 검증 함수 구현

### 작업 항목

#### 2.1 ProfileException 클래스 (3시간)
- **파일**: `coup/src/lib/exceptions/profile/ProfileException.js`
- **내용**: 90개 static factory methods 구현
- **예상 줄 수**: ~900줄

**카테고리별 작업**:
1. A. PROFILE_INFO (20개) - 45분
2. B. AVATAR (15개) - 35분
3. C. PASSWORD (15개) - 35분
4. D. ACCOUNT_DELETE (10개) - 20분
5. E. PRIVACY (10개) - 20분
6. F. VERIFICATION (10개) - 20분
7. G. SOCIAL (10개) - 20분
8. 테스트 및 문서화 - 25분

#### 2.2 유효성 검증 함수 (2시간)
- **파일**: `coup/src/lib/utils/profile/validators.js`
- **예상 줄 수**: ~600줄

**함수 목록** (15개):
1. `validateName(name)` - 15분
2. `validateBio(bio)` - 10분
3. `validateEmail(email)` - 10분
4. `validatePassword(password)` - 20분
5. `validatePasswordStrength(password)` - 15분
6. `validateImageFile(file)` - 15분
7. `validateImageSize(width, height)` - 10분
8. `validateImageDimension(image)` - 10분
9. `validateURL(url)` - 10분
10. `checkXSS(input)` - 15분
11. `checkSQLInjection(input)` - 15분
12. `sanitizeInput(input)` - 5분
13. `checkForbiddenWords(text)` - 10분
14. `validatePrivacySettings(settings)` - 10분
15. 테스트 케이스 작성 - 20분

#### 2.3 에러 로거 (1시간)
- **파일**: `coup/src/lib/utils/profile/errorLogger.js`
- **예상 줄 수**: ~200줄

**함수 목록**:
1. `logProfileError(error, context)` - 20분
2. `logProfileWarning(message, context)` - 15분
3. `logProfileInfo(message, context)` - 15분
4. `formatLogData(level, data)` - 10분
5. 테스트 및 문서화 - 10분

### 완료 조건
- [ ] ProfileException 클래스 90개 메서드 완성
- [ ] 15개 검증 함수 구현 및 테스트
- [ ] 에러 로거 3개 함수 구현
- [ ] JSDoc 주석 완성
- [ ] 단위 테스트 (선택적)

---

## Phase 3: API 라우트 예외 처리 (8시간)

### 목표
모든 Profile API에 예외 처리 적용 및 에러 응답 표준화

### 작업 항목

#### 3.1 프로필 정보 API (2시간)
- **파일**: `coup/src/app/api/users/me/route.js`

**GET 엔드포인트** (30분):
- [x] 현재 코드 분석
- [ ] ProfileException.notFound() 적용
- [ ] ProfileException.sessionExpired() 적용
- [ ] 구조화된 로깅 추가
- [ ] 에러 응답 표준화

**PATCH 엔드포인트** (1.5시간):
- [ ] 유효성 검증 추가 (name, bio)
- [ ] ProfileException 적용 (6개)
  - requiredFieldMissing
  - nameTooShort/nameTooLong
  - invalidNameFormat
  - xssDetected
  - bioTooLong
- [ ] 중복 체크 (선택적)
- [ ] Rate limiting (Redis)
- [ ] 성공/실패 로깅

#### 3.2 아바타 API (2시간)
- **파일**: `coup/src/app/api/users/me/avatar/route.js` (신규)

**POST 엔드포인트** (1.5시간):
- [ ] multipart/form-data 파싱
- [ ] 파일 검증 (형식, 크기, 차원)
- [ ] Sharp 이미지 처리
  - 리사이징 (500x500)
  - 썸네일 생성 (100x100)
  - webp 변환
- [ ] 파일 저장 (/public/uploads/avatars/)
- [ ] ProfileException 적용 (10개)
- [ ] 기존 아바타 삭제

**DELETE 엔드포인트** (30분):
- [ ] 권한 확인
- [ ] 파일 삭제
- [ ] DB 업데이트 (avatar = null)
- [ ] 에러 처리

#### 3.3 비밀번호 API (2시간)
- **파일**: `coup/src/app/api/users/me/password/route.js`

**현재 코드 개선** (2시간):
- [ ] 비밀번호 강도 검사 추가 (zxcvbn)
- [ ] 이전 비밀번호 재사용 방지
  - PasswordHistory 테이블 생성
  - 최근 3개 비밀번호 비교
- [ ] 변경 빈도 제한 (Redis, 24시간)
- [ ] 계정 잠금 (5회 실패)
- [ ] ProfileException 적용 (10개)
- [ ] 성공 시 이메일 알림 (선택적)

#### 3.4 계정 삭제 API (2시간)
- **파일**: `coup/src/app/api/users/me/route.js` (DELETE 추가)

**DELETE 엔드포인트** (2시간):
- [ ] 소유 스터디 확인
  - StudyMember 조회 (role: OWNER)
  - 존재 시 거부 (ProfileException.ownedStudiesExist)
- [ ] 확인 코드 검증 (email 또는 "DELETE")
- [ ] Soft delete 처리
  - status = 'DELETED'
  - accountDeletedAt = now()
  - accountRecoveryUntil = now() + 30일
- [ ] 관련 데이터 정리 (트랜잭션)
  - 스터디 멤버십 제거
  - 알림 삭제
  - 파일 삭제 (백그라운드)
- [ ] 세션 종료
- [ ] 성공 로깅

### 완료 조건
- [ ] 4-5개 API 엔드포인트 개선 완료
- [ ] 30개 이상 ProfileException 사용
- [ ] 20회 이상 로깅 추가
- [ ] 에러 응답 100% 표준화
- [ ] 수동 테스트 완료

---

## Phase 4: UI 컴포넌트 예외 처리 (6-10시간)

### 목표
사용자 친화적인 에러 UI 및 실시간 피드백 구현

### 작업 항목

#### 4.1 Toast 컴포넌트 (1시간) - 우선
- **파일**: `coup/src/components/ui/Toast.jsx` (신규)
- **기능**:
  - 4가지 타입 (success, error, warning, info)
  - 자동 닫힘 (5초)
  - 수동 닫기 버튼
  - 애니메이션 (slide-in)

#### 4.2 프로필 편집 폼 (2-3시간)
- **파일**: `coup/src/components/my-page/ProfileEditForm.jsx`

**개선 사항**:
- [ ] inline 에러 표시
  ```jsx
  {errors.name && <span className={styles.error}>{errors.name}</span>}
  ```
- [ ] 실시간 검증 (onChange)
- [ ] 로딩 상태 (isSubmitting)
- [ ] Toast 사용 (alert 제거)
- [ ] 성공 피드백 개선
- [ ] 디바운스 적용 (중복 체크)

#### 4.3 아바타 업로드 (2-3시간)
- **파일**: `coup/src/components/my-page/AvatarUpload.jsx` (신규)

**기능**:
- [ ] 드래그 앤 드롭
- [ ] 파일 선택 버튼
- [ ] 미리보기
- [ ] 진행 표시 (0-100%)
- [ ] 크기/형식 검증 (클라이언트)
- [ ] 에러 표시
- [ ] 취소 버튼

#### 4.4 비밀번호 변경 폼 (1-2시간)
- **파일**: `coup/src/components/my-page/PasswordChangeForm.jsx` (신규)

**기능**:
- [ ] 3개 필드 (현재, 새, 확인)
- [ ] 비밀번호 강도 표시
  - 막대 그래프 (0-4)
  - 색상 (빨강 → 초록)
  - 피드백 메시지
- [ ] 실시간 검증
- [ ] 표시/숨김 토글
- [ ] 에러 표시

#### 4.5 계정 삭제 모달 (1-2시간)
- **파일**: `coup/src/components/my-page/DeleteAccountModal.jsx`

**개선 사항**:
- [ ] 3단계 확인 프로세스
  1. 경고 및 소유 스터디 확인
  2. 이메일 입력 확인
  3. "DELETE" 입력 확인
- [ ] 위험 경고 강화
- [ ] 복구 기간 안내 (30일)
- [ ] 로딩 상태
- [ ] 에러 표시

### 완료 조건
- [ ] Toast 컴포넌트 작성
- [ ] 4-5개 컴포넌트 개선/신규
- [ ] alert() 100% 제거
- [ ] inline 에러 표시 100%
- [ ] 로딩 상태 100%
- [ ] 사용자 테스트 완료

---

## 의존성 설치 계획

### Phase 2 시작 전
```bash
npm install zxcvbn validator
```

### Phase 3 시작 전 (아바타 처리)
```bash
npm install sharp
```

### Phase 3 중 (선택적, Rate limiting)
```bash
npm install ioredis
```

---

## 테스트 계획

### 단위 테스트 (선택적)
- ProfileException 메서드 테스트
- 검증 함수 테스트
- 각 케이스별 검증

### 통합 테스트
- API 엔드포인트 테스트
- 에러 응답 형식 검증
- 로깅 확인

### E2E 테스트 (선택적)
- 프로필 편집 플로우
- 아바타 업로드 플로우
- 비밀번호 변경 플로우
- 계정 삭제 플로우

---

## 위험 요소 및 완화 방안

### 1. 이미지 처리 복잡도 🖼️
**위험**: Sharp 라이브러리 사용 어려움, 성능 이슈
**완화**:
- Sharp 공식 문서 참조
- 이미지 크기 제한 (5MB)
- 백그라운드 처리 (큐)

### 2. Redis 의존성 ⏱️
**위험**: Redis 설정 필요, 로컬 개발 환경 문제
**완화**:
- Redis 없이도 동작하도록 fallback
- 메모리 기반 Rate limiting (개발용)
- 프로덕션만 Redis 사용

### 3. DB 스키마 변경 🗄️
**위험**: PasswordHistory 테이블 추가 필요
**완화**:
- Prisma migration 생성
- 기존 사용자에게 영향 없음
- 점진적 적용

---

## 다음 단계

Phase 1 완료 후:
1. ✅ 5개 문서 작성 완료
2. ✅ PROGRESS-TRACKER.md 업데이트
3. ✅ Phase 2 프롬프트 생성
4. ✅ EXCEPTION-IMPLEMENTATION-PROMPT.md 자동 업데이트

Phase 2 시작 시:
- ProfileException 클래스 구현
- 검증 함수 작성
- 에러 로거 작성
- 단위 테스트 (선택적)

---

**예상 총 시간**: 24-30시간  
**현재 진행률**: Phase 1 완료 (25%)  
**다음 Phase**: Phase 2 - 예외 클래스 및 유틸리티

