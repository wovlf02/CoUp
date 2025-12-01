# CoUp 예외 처리 구현 - Phase 5 계속 프롬프트

**프로젝트**: CoUp (스터디 관리 플랫폼)  
**현재 Phase**: Phase 5 - 테스트 및 문서화 (65% 완료)  
**영역**: profile  
**날짜**: 2025-12-01

---

## 📋 현재 상황

### Phase 5 진행 상황
- ✅ Jest 환경 설정 완료
- ✅ API 테스트 37개 작성 (24개 통과, 13개 조정 필요)
- ❌ 프론트엔드 컴포넌트 테스트 미작성
- ❌ 사용자 매뉴얼 미작성
- ❌ 개발자 문서 미작성

### 완료된 Phase
- ✅ Phase 1: 분석 및 계획
- ✅ Phase 2: 예외 클래스 구현 (90개 메서드)
- ✅ Phase 3: API 라우트 강화 (6개 엔드포인트)
- ✅ Phase 4: 프론트엔드 통합 (3개 컴포넌트)

---

## 🎯 다음 작업: Phase 5 완료 (남은 시간: 4.5시간)

### 0단계: API 테스트 완료 ⚠️ (30분) - **최우선**

**문제**:
- 13개 테스트에서 에러 코드 불일치

**수정 필요한 에러 코드**:
```
me.test.js (6개):
- PROFILE-016 → PROFILE-019 (계정 삭제)
- PROFILE-017 → PROFILE-018 (계정 정지)
- PROFILE-012/013 → PROFILE-002 (XSS/SQL은 이름 형식에 포함)
- PROFILE-067 → PROFILE-054 (확인 불일치)
- PROFILE-064 → PROFILE-051 (OWNER 스터디)

avatar.test.js (1개): ✅ 완료

password.test.js (7개):
- PROFILE-055/056 → PROFILE-036/039
- PROFILE-061 → PROFILE-050
- PROFILE-057 → PROFILE-046
- PROFILE-060 → PROFILE-049
- OAuth 처리 조정
```

**작업**:
1. ProfileException.js 에러 코드 확인
2. 테스트 파일 수정
3. npm test 실행 → 100% 통과 확인

### 1단계: 프론트엔드 컴포넌트 테스트 (2시간)

**테스트 파일 작성**:
```
coup/src/__tests__/components/user/settings/
├── ProfileEdit.test.jsx
├── PasswordChange.test.jsx
└── AccountDeletion.test.jsx
```

**각 파일별 테스트**:
- 렌더링 테스트
- 입력/상호작용 테스트
- 에러 처리 테스트
- 토스트 메시지 테스트

### 2단계: 사용자 매뉴얼 (1.5시간)

**파일**: `docs/user/PROFILE-USER-GUIDE.md`

**내용**:
- 프로필 수정 가이드
- 아바타 업로드/삭제 가이드
- 비밀번호 변경 가이드
- 계정 삭제 가이드
- FAQ

### 3단계: 개발자 문서 (1시간)

**파일**:
- `docs/exception/implement/profile/DEVELOPER-GUIDE.md`
- `docs/exception/implement/profile/ERROR-CODES.md` (업데이트)

**내용**:
- 아키텍처 설명
- API 통합 가이드
- 에러 코드 레퍼런스
- 확장 가이드

---

## 📚 참조 문서

**현재 작업 상태**:
- `docs/exception/implement/profile/PHASE-5-PROGRESS.md` - 상세 진행 상황

**완료된 Phase**:
- `docs/exception/implement/profile/PHASE-4-COMPLETE.md`
- `docs/exception/implement/profile/PHASE-3-COMPLETE.md`
- `docs/exception/implement/profile/PHASE-2-COMPLETE.md`

**테스트 파일 위치**:
- `coup/src/__tests__/api/users/` - API 테스트 (37개)
- `coup/jest.config.js` - Jest 설정
- `coup/jest.setup.js` - Mock 설정

---

## ✅ Phase 5 완료 기준

- [ ] API 테스트 100% 통과 (현재 65%)
- [ ] 프론트엔드 테스트 작성 및 통과
- [ ] API 커버리지 80% 이상
- [ ] 프론트엔드 커버리지 70% 이상
- [ ] 사용자 매뉴얼 완성
- [ ] 개발자 가이드 완성
- [ ] 에러 코드 레퍼런스 업데이트

---

## 🚀 즉시 시작

**0단계부터 순서대로 진행하세요!**

1. API 테스트 에러 코드 수정 (30분)
2. 프론트엔드 테스트 작성 (2시간)
3. 사용자 매뉴얼 작성 (1.5시간)
4. 개발자 문서 작성 (1시간)

**총 예상 시간**: 5시간

---

**작성일**: 2025-12-01  
**진행률**: 65%  
**우선순위**: 🔴 최우선

