# Next Session Prompt - Phase A3 시작

## 🎯 현재 상태

**Phase A2 완료**: ✅ Study 도메인 예외 처리 시스템 (100% 완료)  
**다음 Phase**: A3 - Admin 도메인 예외 처리 시스템  
**업데이트 날짜**: 2025-12-02

---

## 🚀 다음 작업 시작 프롬프트

### 옵션 1: Admin 도메인 예외 처리 시스템 구축 (추천)

```
다음 작업을 진행해:

Admin 도메인 예외 처리 시스템 구축

【목표】
- Study 도메인과 동일한 패턴으로 Admin 도메인에 예외 처리 적용
- 일관된 에러 처리 및 로깅 시스템 구축

【작업 범위】
1. Admin 도메인 API 분석
   - /api/admin/users (사용자 관리)
   - /api/admin/studies (스터디 관리)
   - /api/admin/reports (신고 관리)
   - /api/admin/settings (시스템 설정)
   - /api/admin/analytics (분석)

2. AdminException 클래스 설계
   - AdminValidationException
   - AdminPermissionException
   - AdminBusinessException
   - AdminDatabaseException
   
3. 예외 코드 정의
   - ADMIN-001 ~ ADMIN-100 범위
   - 각 API별 예외 케이스 도출

4. AdminLogger 클래스 구현
   - 도메인 특화 로깅 메서드
   - 보안 로깅 강화 (관리자 작업)

5. Admin API 강화
   - 단계별 API 라우트 강화
   - withAdminErrorHandler 패턴 적용

【참고 패턴】
- Study 도메인 구현 패턴 참조
- StudyException.js 구조 참고
- studyLogger.js 로깅 패턴 참고
- study-utils.js 헬퍼 함수 패턴 참고

【예상 일정】
- 약 2-3일 소요 예상
- 6단계로 나누어 진행

시작해줘!
```

---

### 옵션 2: Study 도메인 통합 테스트 작성

```
다음 작업을 진행해:

Study 도메인 통합 테스트 작성

【목표】
- 모든 Study API에 대한 통합 테스트 작성
- 예외 처리 동작 검증
- 테스트 커버리지 80% 이상 달성

【작업 범위】
1. 테스트 환경 설정
   - Jest 및 Supertest 설정
   - 테스트 데이터베이스 설정
   - Mock 데이터 준비

2. API 테스트 작성
   - Study CRUD 테스트
   - Member 관리 테스트
   - Application 처리 테스트
   - Notice, File, Task, Calendar 테스트

3. 예외 처리 테스트
   - 각 예외 코드별 테스트
   - 에러 응답 포맷 검증
   - 권한 검증 테스트

4. 로깅 테스트
   - 로그 출력 검증
   - 로그 포맷 검증
   - 성능 로깅 테스트

【테스트 파일 구조】
coup/__tests__/
├── api/
│   └── studies/
│       ├── studies.test.js
│       ├── members.test.js
│       ├── applications.test.js
│       ├── notices.test.js
│       ├── files.test.js
│       ├── tasks.test.js
│       └── calendar.test.js
├── exceptions/
│   └── study.test.js
└── logging/
    └── studyLogger.test.js

【예상 일정】
- 약 3-4일 소요 예상

시작해줘!
```

---

### 옵션 3: API 문서 자동 생성 (Swagger/OpenAPI)

```
다음 작업을 진행해:

Study 도메인 API 문서 자동 생성

【목표】
- Swagger/OpenAPI 스펙 생성
- 인터랙티브 API 문서 제공
- 에러 코드 레퍼런스 페이지 작성

【작업 범위】
1. Swagger 설정
   - next-swagger-doc 설치 및 설정
   - API 라우트에 JSDoc 주석 추가

2. OpenAPI 스펙 생성
   - 모든 Study API 엔드포인트 문서화
   - Request/Response 스키마 정의
   - 에러 응답 스키마 정의

3. 에러 코드 레퍼런스
   - 115개 에러 코드 문서화
   - 각 에러별 예제 응답
   - 해결 방법 가이드

4. API 문서 페이지
   - /api-docs 페이지 생성
   - Swagger UI 통합
   - Try-it-out 기능

【예상 일정】
- 약 2일 소요 예상

시작해줘!
```

---

### 옵션 4: 모니터링 시스템 구축 (Sentry 연동)

```
다음 작업을 진행해:

에러 모니터링 시스템 구축

【목표】
- Sentry를 활용한 실시간 에러 모니터링
- 에러 트렌드 분석
- 알림 시스템 구축

【작업 범위】
1. Sentry 설정
   - @sentry/nextjs 설치 및 설정
   - 환경별 DSN 설정
   - Source Maps 업로드 설정

2. StudyLogger와 Sentry 통합
   - ERROR/CRITICAL 레벨 자동 전송
   - 컨텍스트 정보 포함
   - 사용자 정보 연결

3. 대시보드 설정
   - 에러 그룹핑
   - 알림 규칙 설정
   - 성능 모니터링

4. 로컬 로깅 최적화
   - 프로덕션 로그 레벨 조정
   - 로그 로테이션
   - 민감 정보 필터링

【예상 일정】
- 약 1-2일 소요 예상

시작해줘!
```

---

## 📊 Phase A2 완료 현황

### 완료된 작업
- ✅ Study 도메인 예외 처리 시스템 (100%)
- ✅ 115개 예외 코드 구현
- ✅ 28개 API 라우트 강화
- ✅ 36개 로깅 메서드
- ✅ 7개 완료 문서 작성

### 코드 통계
- **총 코드 라인**: ~7,000 라인
- **API 라우트**: 28개
- **예외 클래스**: 8개
- **컴파일 에러**: 0개 ✅

### 문서
1. ✅ STUDY-STEP1-COMPLETE.md
2. ✅ STUDY-STEP2-COMPLETE.md
3. ✅ STUDY-STEP3-COMPLETE.md
4. ✅ STUDY-STEP4-COMPLETE.md
5. ✅ STUDY-STEP5-COMPLETE.md
6. ✅ STUDY-STEP6-COMPLETE.md
7. ✅ STUDY-FINAL-COMPLETE.md

---

## 🎯 추천 순서

### 단계적 접근 (추천)
1. **Admin 도메인 예외 처리** (옵션 1) - 패턴 확장
2. **통합 테스트 작성** (옵션 2) - 품질 보증
3. **API 문서 생성** (옵션 3) - 개발자 경험
4. **모니터링 구축** (옵션 4) - 운영 안정성

### 빠른 ROI
1. **모니터링 구축** (옵션 4) - 즉시 가치 제공
2. **API 문서 생성** (옵션 3) - 팀 생산성 향상
3. **통합 테스트 작성** (옵션 2) - 버그 방지
4. **Admin 도메인 예외 처리** (옵션 1) - 시스템 확장

---

## 📚 참고 자료

### Study 도메인 참조
- `C:\Project\CoUp\coup\src\lib\exceptions\study\StudyException.js`
- `C:\Project\CoUp\coup\src\lib\logging\studyLogger.js`
- `C:\Project\CoUp\coup\src\lib\utils\study-utils.js`

### 문서
- `C:\Project\CoUp\docs\study\STUDY-FINAL-COMPLETE.md` - 전체 요약
- `C:\Project\CoUp\docs\study\STUDY-STEP6-COMPLETE.md` - 최신 완료 문서

### API 경로
- `C:\Project\CoUp\coup\src\app\api\studies\` - 28개 API 라우트

---

## 💡 빠른 시작 팁

### 새로운 도메인 시작 시
1. 기존 Study 패턴 참조
2. Exception 클래스부터 설계
3. 단계별로 진행 (한 번에 하나씩)
4. 각 단계마다 문서 작성

### 테스트 작성 시
1. 테스트 환경 먼저 설정
2. Happy path 테스트부터
3. 예외 케이스 테스트
4. 커버리지 확인

### API 문서 작성 시
1. JSDoc 주석부터 추가
2. 스키마 정의
3. 예제 응답 작성
4. Try-it-out으로 검증

### 모니터링 구축 시
1. 개발 환경에서 먼저 테스트
2. 중요한 에러부터 추적
3. 알림 규칙 신중하게 설정
4. 민감 정보 필터링 필수

---

## 🎊 시작하기

위 옵션 중 하나를 선택하여 프롬프트를 복사하고 "시작해줘!"로 작업을 시작하세요.

**추천**: Admin 도메인 예외 처리 (옵션 1)부터 시작하여 일관된 시스템을 구축하는 것을 권장합니다.

---

**마지막 업데이트**: 2025-12-02  
**현재 Phase**: A2 완료, A3 대기  
**선택 가능한 옵션**: 4가지

**Happy Coding!** 🚀
