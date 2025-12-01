# Profile 영역 Phase별 구현 계획

**영역**: profile  
**작성일**: 2025-12-01  
**총 예상 시간**: 30시간  
**난이도**: ⭐⭐⭐ (중간-높음)

---

## 📊 전체 개요

### 목표
profile 영역에 대한 완전한 예외 처리 시스템 구축

### 주요 기능
1. **프로필 정보 관리**: 이름, 자기소개, 이메일 수정
2. **아바타 업로드**: 이미지 업로드, 크롭, 최적화
3. **비밀번호 변경**: 현재 비밀번호 확인, 강도 검증
4. **계정 삭제**: OWNER 스터디 확인, 데이터 정리
5. **프라이버시 설정**: 프로필 공개 범위 관리

### 통계
```
총 Phase:        6개 (분석 1 + 구현 4 + 테스트 1)
총 파일:         21개 (신규 9개 + 수정 12개)
총 코드량:       ~2,550줄
에러 코드:       90개 (PROFILE-001 ~ PROFILE-090)
컴포넌트:        10개 (기존 6 + 신규 4)
API 라우트:      8개 (기존 6 + 신규 2)
```

---

## Phase 1: 분석 및 계획 (6시간) ✅

**상태**: 완료  
**완료일**: 2025-12-01

### 완료 항목
- [x] 폴더 구조 확인 (docs/exception/implement/profile/)
- [x] 현재 코드 분석 (12개 파일)
- [x] API 라우트 분석 (6개)
- [x] 컴포넌트 분석 (6개)
- [x] 에러 처리 현황 파악
- [x] 개선 필요 영역 식별
- [x] 의존성 분석
- [x] Exception 클래스 설계 (90개 메서드)
- [x] 유효성 검증 함수 설계 (7개)
- [x] 에러 로거 설계 (4개 함수)

### 생성된 문서
1. ✅ `CURRENT-STATE-ANALYSIS.md` (현재 상태 분석)
2. ✅ `EXCEPTION-DESIGN-COMPLETE.md` (예외 설계 완전판)
3. ✅ `PROFILE-PHASE-PLAN.md` (이 문서)

---

## Phase 2: 예외 클래스 및 유틸리티 구현 (8시간)

**우선순위**: 🔴 높음  
**예상 시간**: 8시간  
**상태**: 대기 중

### 2.1 ProfileException 클래스 구현 (4시간)

**파일**: `coup/src/lib/exceptions/profile/ProfileException.js`

#### 작업 내용
1. **기본 클래스 구조** (30분)
   - constructor
   - toJSON()
   - toResponse()

2. **A. PROFILE_INFO 메서드** (1시간)
   - 20개 static 메서드
   - PROFILE-001 ~ PROFILE-020

3. **B. AVATAR 메서드** (45분)
   - 15개 static 메서드
   - PROFILE-021 ~ PROFILE-035

4. **C. PASSWORD 메서드** (45분)
   - 15개 static 메서드
   - PROFILE-036 ~ PROFILE-050

5. **D. ACCOUNT_DELETE 메서드** (30분)
   - 10개 static 메서드
   - PROFILE-051 ~ PROFILE-060

6. **E. PRIVACY 메서드** (30분)
   - 10개 static 메서드
   - PROFILE-061 ~ PROFILE-070

7. **F. VERIFICATION 메서드** (30분)
   - 10개 static 메서드
   - PROFILE-071 ~ PROFILE-080

8. **G. SOCIAL 메서드** (30min)
   - 10개 static 메서드
   - PROFILE-081 ~ PROFILE-090

#### 예상 코드량
```
ProfileException.js: ~500줄
```

---

### 2.2 유효성 검증 함수 구현 (2시간)

**파일**: `coup/src/lib/utils/profile/validators.js`

#### 작업 내용
1. **validateProfileName()** (20분)
   - 길이, 형식, 특수문자 검증

2. **validateBio()** (15분)
   - 길이 검증

3. **validatePasswordStrength()** (30min)
   - zxcvbn 연동
   - 점수, 피드백 반환

4. **checkXSS()** (20분)
   - 정규식 기반 XSS 패턴 검사

5. **validateAvatarFile()** (20분)
   - 파일 크기, 타입 검증

6. **validateEmail()** (15분)
   - 이메일 형식 검증

7. **isForbiddenNickname()** (20min)
   - 금지된 닉네임 목록 확인

#### 예상 코드량
```
validators.js: ~300줄
```

---

### 2.3 에러 로거 구현 (1시간)

**파일**: `coup/src/lib/loggers/profile/profileLogger.js`

#### 작업 내용
1. **createLog()** (15분)
   - 구조화된 로그 생성

2. **logProfileError()** (15min)
   - 에러 로깅, 외부 서비스 연동 준비

3. **logProfileInfo()** (10min)
   - 정보 로깅

4. **logProfileWarning()** (10min)
   - 경고 로깅

5. **logProfileSecurity()** (10min)
   - 보안 이벤트 로깅

#### 예상 코드량
```
profileLogger.js: ~150줄
```

---

### 2.4 의존성 설치 및 테스트 (1시간)

#### 패키지 설치
```bash
npm install zxcvbn react-easy-crop sharp
```

#### 단위 테스트 작성
- validators.test.js
- ProfileException.test.js
- profileLogger.test.js

---

## Phase 3: API 라우트 강화 (6시간)

**우선순위**: 🔴 높음  
**예상 시간**: 6시간

### 3.1 GET /api/users/me 개선 (1시간)

**파일**: `coup/src/app/api/users/me/route.js`

#### 작업 내용
1. **에러 처리 강화**
   - ProfileException 사용
   - 구조화된 로깅
   - 에러 코드 추가

2. **삭제된 계정 처리**
   - status === 'DELETED' 확인
   - ProfileException.accountDeleted() 사용

3. **성능 개선**
   - 캐시 헤더 추가
   - 불필요한 join 제거

#### 예상 변경량
```
+50줄 (에러 처리, 로깅, 검증)
```

---

### 3.2 PATCH /api/users/me 개선 (1.5시간)

**파일**: `coup/src/app/api/users/me/route.js`

#### 작업 내용
1. **유효성 검증 추가**
   - validateProfileName()
   - validateBio()
   - checkXSS()

2. **에러 처리 강화**
   - ProfileException 사용
   - 10+ 예외 메서드 사용

3. **중복 체크** (선택적)
   - 닉네임 중복 확인

4. **Rate limiting**
   - Redis 연동 (향후)

#### 예상 변경량
```
+80줄 (검증, 에러 처리, 중복 체크)
```

---

### 3.3 DELETE /api/users/me 개선 (1시간)

**파일**: `coup/src/app/api/users/me/route.js`

#### 작업 내용
1. **OWNER 스터디 확인**
   - studyMembers에서 role === 'OWNER' 확인
   - ProfileException.ownerStudyExists()

2. **트랜잭션 처리**
   - prisma.$transaction 사용
   - 롤백 메커니즘

3. **세션 정리**
   - 세션 무효화

#### 예상 변경량
```
+60줄 (OWNER 확인, 트랜잭션, 세션 정리)
```

---

### 3.4 PATCH /api/users/me/password 개선 (1.5시간)

**파일**: `coup/src/app/api/users/me/password/route.js`

#### 작업 내용
1. **비밀번호 강도 검증**
   - validatePasswordStrength()
   - zxcvbn 점수 3 이상 요구

2. **이전 비밀번호 재사용 방지**
   - passwordHistory 테이블 (향후)
   - 최근 3개 비밀번호 확인

3. **변경 빈도 제한**
   - Redis 캐시 (향후)
   - 24시간 1회 제한

4. **계정 잠금** (향후)
   - 5회 실패 시 잠금

#### 예상 변경량
```
+70줄 (강도 검증, 재사용 방지, 빈도 제한)
```

---

### 3.5 POST /api/upload 개선 (1시간)

**파일**: `coup/src/app/api/upload/route.js`

#### 작업 내용
1. **아바타 전용 검증 강화**
   - validateAvatarFile()
   - ProfileException 사용

2. **이미지 처리**
   - sharp 사용 (리사이징, 최적화)
   - 최대 500x500으로 리사이징

3. **에러 처리 강화**
   - 10+ 예외 메서드 사용

#### 예상 변경량
```
+50줄 (검증, 이미지 처리, 에러 처리)
```

---

### 3.6 신규 API: GET /api/users/me/delete-check (30분)

**파일**: `coup/src/app/api/users/me/delete-check/route.js` (신규)

#### 작업 내용
1. **OWNER 스터디 조회**
   - studyMembers에서 role === 'OWNER' 확인
   - 스터디 목록 반환

2. **활성 작업 확인**
   - 미완료 tasks 확인

3. **응답 형식**
   ```javascript
   {
     canDelete: false,
     ownerStudies: [
       { id, name, memberCount }
     ],
     activeTasks: 5
   }
   ```

#### 예상 코드량
```
delete-check/route.js: ~80줄 (신규)
```

---

### 3.7 신규 API: POST /api/users/me/avatar (30분)

**파일**: `coup/src/app/api/users/me/avatar/route.js` (신규)

#### 작업 내용
1. **아바타 전용 업로드**
   - sharp 사용
   - 리사이징, 크롭

2. **프로필 자동 업데이트**
   - user.avatar 업데이트

3. **이전 아바타 삭제**
   - 파일 시스템 정리

#### 예상 코드량
```
avatar/route.js: ~120줄 (신규)
```

---

## Phase 4: 컴포넌트 개선 (8시간)

**우선순위**: 🟡 중간  
**예상 시간**: 8시간

### 4.1 page.jsx 개선 (1시간)

**파일**: `coup/src/app/me/page.jsx`

#### 작업 내용
1. **에러 UI 개선**
   - ErrorBoundary 추가
   - 에러 타입별 UI

2. **로딩 상태 개선**
   - Skeleton UI

3. **404 처리**
   - 사용자 없음 UI

#### 예상 변경량
```
+50줄
```

---

### 4.2 ProfileSection.jsx 개선 (1.5시간)

**파일**: `coup/src/components/my-page/ProfileSection.jsx`

#### 작업 내용
1. **아바타 업로드 개선**
   - /api/upload 사용 (Base64 제거)
   - 미리보기 추가
   - 진행률 표시

2. **Toast 사용**
   - alert() 제거
   - useToast 훅 사용

3. **출석 기능 개선**
   - 에러 처리 강화
   - SWR 캐시 갱신

#### 예상 변경량
```
+80줄
```

---

### 4.3 ProfileEditForm.jsx 개선 (1.5시간)

**파일**: `coup/src/components/my-page/ProfileEditForm.jsx`

#### 작업 내용
1. **inline 에러 표시**
   - 필드별 에러 상태
   - ProfileFormError 컴포넌트

2. **Toast 사용**
   - alert() 제거

3. **클라이언트 검증**
   - validateProfileName()
   - validateBio()

#### 예상 변경량
```
+80줄
```

---

### 4.4 AccountActions.jsx 개선 (1.5시간)

**파일**: `coup/src/components/my-page/AccountActions.jsx`

#### 작업 내용
1. **OWNER 스터디 확인**
   - /api/users/me/delete-check 호출
   - OwnerStudiesWarning 표시

2. **Toast 사용**
   - alert() 제거

3. **로딩 상태**
   - isDeleting 상태 관리

#### 예상 변경량
```
+70줄
```

---

### 4.5 DeleteAccountModal.jsx 개선 (1시간)

**파일**: `coup/src/components/my-page/DeleteAccountModal.jsx`

#### 작업 내용
1. **3단계 확인**
   - 경고 → 텍스트 확인 → 최종 확인

2. **OWNER 스터디 표시**
   - props로 ownerStudies 받기

3. **로딩 상태**
   - 삭제 중 표시

#### 예상 변경량
```
+50줄
```

---

### 4.6 신규: AvatarCropModal.jsx (1.5시간)

**파일**: `coup/src/components/profile/AvatarCropModal.jsx` (신규)

#### 작업 내용
1. **react-easy-crop 연동**
   - 크롭 UI
   - 줌, 회전

2. **미리보기**
   - 크롭된 이미지 표시

3. **저장 처리**
   - 크롭 데이터 전송

#### 예상 코드량
```
AvatarCropModal.jsx: ~120줄 (신규)
```

---

### 4.7 신규: PasswordStrengthMeter.jsx (1시간)

**파일**: `coup/src/components/profile/PasswordStrengthMeter.jsx` (신규)

#### 작업 내용
1. **강도 표시**
   - 0-4 점수 바
   - 색상: 빨강 → 노랑 → 초록

2. **피드백 표시**
   - zxcvbn 제안 사항

3. **실시간 업데이트**
   - onChange 이벤트

#### 예상 코드량
```
PasswordStrengthMeter.jsx: ~100줄 (신규)
```

---

### 4.8 신규: OwnerStudiesWarning.jsx (30분)

**파일**: `coup/src/components/profile/OwnerStudiesWarning.jsx` (신규)

#### 작업 내용
1. **경고 메시지**
   - OWNER 스터디 목록 표시

2. **이동 버튼**
   - 각 스터디로 이동

#### 예상 코드량
```
OwnerStudiesWarning.jsx: ~80줄 (신규)
```

---

### 4.9 신규: ProfileFormError.jsx (30min)

**파일**: `coup/src/components/profile/ProfileFormError.jsx` (신규)

#### 작업 내용
1. **inline 에러 표시**
   - 필드 아래 에러 메시지

2. **스타일**
   - 빨간 텍스트, 아이콘

#### 예상 코드량
```
ProfileFormError.jsx: ~50줄 (신규)
```

---

## Phase 5: 통합 및 테스트 (6시간)

**우선순위**: 🟡 중간  
**예상 시간**: 6시간

### 5.1 통합 테스트 시나리오 작성 (2시간)

**파일**: `docs/exception/implement/profile/INTEGRATION-TEST-SCENARIOS.md`

#### 작업 내용
1. **API 테스트**
   - 40개 시나리오

2. **컴포넌트 테스트**
   - 30개 시나리오

3. **E2E 테스트**
   - 20개 시나리오

#### 예상 코드량
```
INTEGRATION-TEST-SCENARIOS.md: ~600줄
```

---

### 5.2 실제 테스트 수행 (3시간)

#### 작업 내용
1. **API 테스트**
   - Postman/Thunder Client

2. **UI 테스트**
   - 브라우저 수동 테스트

3. **버그 수정**
   - 발견된 이슈 해결

---

### 5.3 문서화 (1시간)

**파일**: `docs/exception/implement/profile/PROFILE-EXCEPTION-COMPLETE.md`

#### 작업 내용
1. **완료 보고서 작성**
   - 통계, 파일 목록
   - 주요 기능
   - 에러 코드 목록

2. **PROGRESS-TRACKER.md 업데이트**

---

## Phase 6: 최종 검증 및 배포 준비 (2시간)

**우선순위**: 🟢 낮음  
**예상 시간**: 2시간

### 6.1 코드 리뷰 (1시간)

#### 작업 내용
1. **코드 품질 확인**
   - ESLint 오류 해결
   - 타입 체크

2. **성능 확인**
   - 불필요한 리렌더링 제거

---

### 6.2 배포 준비 (1시간)

#### 작업 내용
1. **환경 변수 확인**

2. **프로덕션 빌드 테스트**
   ```bash
   npm run build
   npm run start
   ```

3. **최종 문서 업데이트**

---

## 📊 전체 일정 요약

```
Phase 1: 분석 및 계획          ████████████████████ 100% (6h) ✅
Phase 2: 예외 클래스/유틸       ░░░░░░░░░░░░░░░░░░░░   0% (8h)
Phase 3: API 라우트 강화        ░░░░░░░░░░░░░░░░░░░░   0% (6h)
Phase 4: 컴포넌트 개선          ░░░░░░░░░░░░░░░░░░░░   0% (8h)
Phase 5: 통합 및 테스트         ░░░░░░░░░░░░░░░░░░░░   0% (6h)
Phase 6: 최종 검증 및 배포      ░░░░░░░░░░░░░░░░░░░░   0% (2h)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
전체:                         ████░░░░░░░░░░░░░░░░  20% (6h/30h)
```

---

## 🎯 다음 세션 준비

### Phase 2 시작 전 체크리스트

- [ ] 의존성 설치 확인
  ```bash
  npm install zxcvbn react-easy-crop sharp
  ```

- [ ] 폴더 생성
  ```bash
  mkdir -p coup/src/lib/exceptions/profile
  mkdir -p coup/src/lib/utils/profile
  mkdir -p coup/src/lib/loggers/profile
  mkdir -p coup/src/components/profile
  ```

- [ ] EXCEPTION-DESIGN-COMPLETE.md 검토

- [ ] 개발 환경 준비

---

**작성 완료일**: 2025-12-01  
**다음 Phase**: Phase 2 - 예외 클래스/유틸리티 구현  
**예상 시작일**: 다음 세션

