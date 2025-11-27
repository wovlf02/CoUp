# SYSTEM_ADMIN 전용 기능 구현 상태 보고서

> **생성일**: 2025-11-27
> **목적**: 설계 문서 대비 SYSTEM_ADMIN 전용 기능의 구현 상태 파악

---

## 📊 요약

### 전체 현황
- **전체 SYSTEM_ADMIN 전용 기능**: 38개
- **구현 완료**: 3개 (7.9%)
- **부분 구현**: 2개 (5.3%)
- **미구현**: 33개 (86.8%)

### 우선순위별 분류
- **P0 (필수)**: 12개 → 구현 1개
- **P1 (높음)**: 15개 → 구현 2개
- **P2 (중간)**: 11개 → 구현 0개

---

## 1. 데이터베이스 및 모델

### ✅ 구현 완료 (3개)

#### 1.1 SystemSetting 모델
- **상태**: ✅ 완료
- **테이블**: 생성 완료
- **시드 데이터**: 21개 설정 추가 완료
- **API**: `/api/admin/settings` (GET, PATCH)
- **화면**: `/admin/settings`

#### 1.2 EmailTemplate 모델
- **상태**: ✅ 완료
- **테이블**: 생성 완료
- **시드 데이터**: 6개 기본 템플릿 추가 완료
  - welcome (회원가입 환영)
  - email_verification (이메일 인증)
  - password_reset (비밀번호 재설정)
  - sanction_warning (경고 알림)
  - sanction_suspend (정지 알림)
  - system_notice (시스템 공지)

#### 1.3 AdminLog 모델
- **상태**: ✅ 완료
- **테이블**: 생성 완료
- **사용처**: 관리자 활동 자동 로깅용

### ⚠️ 부분 구현 (2개)

#### 1.4 Report 모델
- **상태**: ⚠️ 부분 구현
- **구현**: 기본 테이블 및 API
- **미구현**:
  - 우선순위 자동 배정 로직
  - 관리자 자동 배정 (라운드 로빈)
  - 유사 신고 자동 검색
  - 신고 통계 대시보드

#### 1.5 Sanction 모델
- **상태**: ⚠️ 부분 구현
- **구현**: 기본 테이블
- **미구현**:
  - 제재 이력 타임라인 UI
  - 제재 효과 자동 적용
  - 자동 정지 규칙 (경고 3회 → 1일 정지)

---

## 2. SYSTEM_ADMIN 전용 API (미구현: 16개)

### 🔴 P0 - 필수 (7개)

#### 2.1 관리자 권한 관리
- **API**: `/api/admin/manage-admins`
- **필요 기능**:
  ```javascript
  GET    /api/admin/manage-admins          // 전체 관리자 목록
  POST   /api/admin/manage-admins          // 관리자 임명 (USER → ADMIN)
  PATCH  /api/admin/manage-admins/[id]     // 권한 변경
  DELETE /api/admin/manage-admins/[id]     // 관리자 해임 (ADMIN → USER)
  ```
- **검증 로직**:
  - 가입 30일 이상
  - 스터디 참여 2개 이상
  - 제재 이력 없음
- **권한**: SYSTEM_ADMIN만

#### 2.2 이메일 템플릿 관리 API
- **API**: `/api/admin/email-templates`
- **필요 기능**:
  ```javascript
  GET    /api/admin/email-templates        // 템플릿 목록
  GET    /api/admin/email-templates/[id]   // 템플릿 상세
  POST   /api/admin/email-templates        // 템플릿 생성
  PATCH  /api/admin/email-templates/[id]   // 템플릿 수정
  DELETE /api/admin/email-templates/[id]   // 템플릿 삭제
  POST   /api/admin/email-templates/[id]/test // 테스트 발송
  POST   /api/admin/email-templates/[id]/preview // 미리보기
  ```

#### 2.3 감사 로그 조회 API
- **API**: `/api/admin/audit-logs`
- **필요 기능**:
  ```javascript
  GET /api/admin/audit-logs
  ```
- **필터**:
  - 관리자별 (adminId)
  - 작업 유형별 (action)
  - 기간별 (startDate, endDate)
  - 대상별 (targetType, targetId)
- **응답**:
  ```javascript
  {
    logs: [
      {
        id, adminId, adminName,
        action, targetType, targetId,
        details, ipAddress, createdAt
      }
    ],
    pagination: { page, perPage, total }
  }
  ```

#### 2.4 사용자 완전 삭제 API
- **API**: `/api/admin/users/[userId]/permanent-delete`
- **사용 사례**: GDPR 요청, 법원 명령
- **필요 기능**:
  ```javascript
  DELETE /api/admin/users/[userId]/permanent-delete
  ```
- **삭제 대상**:
  - User 레코드
  - 프로필 데이터 (avatar, bio)
  - 작성한 콘텐츠 (Message, Notice 등)
  - 활동 이력
  - 관련 파일 (S3/로컬 스토리지)
- **백업**: 30일간 백업본 보관
- **로깅**: AdminLog에 기록

#### 2.5 데이터 익스포트 API
- **API**: `/api/admin/export`
- **필요 기능**:
  ```javascript
  POST /api/admin/export/users             // 사용자 데이터
  POST /api/admin/export/studies           // 스터디 데이터
  POST /api/admin/export/reports           // 신고 데이터
  POST /api/admin/export/sanctions         // 제재 데이터
  POST /api/admin/export/logs              // 로그 데이터
  ```
- **제한사항**:
  - 최대 10,000건
  - 개인정보 자동 마스킹
  - 익스포트 로그 기록
- **형식**: CSV, Excel, JSON

#### 2.6 플랫폼 통계 API (고급)
- **API**: `/api/admin/analytics`
- **필요 기능**:
  ```javascript
  GET /api/admin/analytics/overview        // 전체 요약
  GET /api/admin/analytics/users           // 사용자 분석
  GET /api/admin/analytics/studies         // 스터디 분석
  GET /api/admin/analytics/engagement      // 참여도 분석
  GET /api/admin/analytics/revenue         // 수익 분석 (향후)
  ```
- **분석 지표**:
  - DAU, MAU, 리텐션
  - 코호트 분석
  - 퍼널 분석
  - 스터디 성공률

#### 2.7 시스템 공지 발송 API
- **API**: `/api/admin/system-notices`
- **필요 기능**:
  ```javascript
  POST /api/admin/system-notices           // 공지 발송
  POST /api/admin/system-notices/schedule  // 예약 발송
  GET  /api/admin/system-notices/sent      // 발송 내역
  ```
- **발송 대상**:
  - 전체 사용자
  - 활성 사용자만
  - 특정 스터디 멤버
  - 특정 사용자 그룹
- **발송 방법**:
  - 인앱 알림 (필수)
  - 이메일 (선택)
  - 푸시 알림 (선택)

### 🟡 P1 - 높음 (6개)

#### 2.8 콘텐츠 필터링 규칙 API
- **API**: `/api/admin/content-filters`
- **필요 기능**:
  ```javascript
  GET    /api/admin/content-filters         // 규칙 조회
  PATCH  /api/admin/content-filters         // 규칙 수정
  POST   /api/admin/content-filters/words   // 금지어 추가
  DELETE /api/admin/content-filters/words   // 금지어 삭제
  POST   /api/admin/content-filters/test    // 필터 테스트
  ```
- **관리 항목**:
  - 금지어 목록
  - 필터링 강도 (LOW/MEDIUM/HIGH)
  - 자동 제재 규칙

#### 2.9 이용약관 관리 API
- **API**: `/api/admin/legal`
- **필요 기능**:
  ```javascript
  GET    /api/admin/legal/terms             // 이용약관 조회
  PATCH  /api/admin/legal/terms             // 이용약관 수정
  GET    /api/admin/legal/privacy           // 개인정보처리방침 조회
  PATCH  /api/admin/legal/privacy           // 개인정보처리방침 수정
  GET    /api/admin/legal/versions          // 버전 히스토리
  ```
- **버전 관리**: 변경 시마다 새 버전 생성
- **재동의**: 중대 변경 시 사용자에게 재동의 요청

#### 2.10 백업 및 복구 API
- **API**: `/api/admin/backup`
- **필요 기능**:
  ```javascript
  POST /api/admin/backup/create            // 수동 백업
  GET  /api/admin/backup/list              // 백업 목록
  POST /api/admin/backup/restore           // 복구
  GET  /api/admin/backup/download          // 백업 다운로드
  ```
- **백업 대상**: 전체 데이터베이스 또는 특정 테이블

#### 2.11 데이터 정리 API
- **API**: `/api/admin/cleanup`
- **필요 기능**:
  ```javascript
  POST /api/admin/cleanup/deleted-users    // 탈퇴 계정 삭제 (30일 후)
  POST /api/admin/cleanup/old-logs         // 오래된 로그 삭제 (1년 이상)
  POST /api/admin/cleanup/temp-files       // 임시 파일 정리
  POST /api/admin/cleanup/cache            // 캐시 초기화
  ```

#### 2.12 이메일 도메인 관리 API
- **API**: `/api/admin/email-domains`
- **필요 기능**:
  ```javascript
  GET    /api/admin/email-domains          // 도메인 목록
  POST   /api/admin/email-domains/block    // 도메인 차단
  DELETE /api/admin/email-domains/block    // 차단 해제
  POST   /api/admin/email-domains/allow    // 도메인 허용
  POST   /api/admin/email-domains/import   // 일괄 추가 (CSV)
  ```

#### 2.13 파일 확장자 관리 API
- **API**: `/api/admin/file-extensions`
- **필요 기능**:
  ```javascript
  GET    /api/admin/file-extensions        // 확장자 목록
  POST   /api/admin/file-extensions/allow  // 허용 추가
  POST   /api/admin/file-extensions/block  // 차단 추가
  DELETE /api/admin/file-extensions        // 제거
  ```

### 🟢 P2 - 중간 (3개)

#### 2.14 관리자 활동 통계 API
- **API**: `/api/admin/admin-stats`
- **필요 기능**:
  ```javascript
  GET /api/admin/admin-stats/overview      // 전체 관리자 활동
  GET /api/admin/admin-stats/[adminId]     // 특정 관리자 활동
  ```
- **통계 지표**:
  - 신고 처리 건수
  - 제재 실행 건수
  - 평균 처리 시간
  - 승인/기각 비율

#### 2.15 비정상 패턴 감지 API
- **API**: `/api/admin/anomaly-detection`
- **필요 기능**:
  ```javascript
  GET /api/admin/anomaly-detection/admins  // 관리자 비정상 패턴
  GET /api/admin/anomaly-detection/users   // 사용자 비정상 패턴
  ```
- **감지 패턴**:
  - 과도한 제재 (1일 10건 이상)
  - 특정 사용자만 타겟
  - 짧은 시간에 많은 작업

#### 2.16 시스템 건강 체크 API
- **API**: `/api/admin/health`
- **필요 기능**:
  ```javascript
  GET /api/admin/health/database           // DB 상태
  GET /api/admin/health/storage            // 스토리지 상태
  GET /api/admin/health/services           // 외부 서비스 상태
  ```

---

## 3. SYSTEM_ADMIN 전용 화면 (미구현: 15개)

### 🔴 P0 - 필수 (5개)

#### 3.1 이메일 템플릿 관리 페이지
- **경로**: `/admin/settings/email-templates`
- **기능**:
  - 템플릿 목록 (카드 뷰)
  - 템플릿 편집 (HTML 에디터)
  - 변수 삽입 도구
  - 미리보기 (실시간)
  - 테스트 발송
- **권한**: SYSTEM_ADMIN만

#### 3.2 관리자 권한 관리 페이지
- **경로**: `/admin/settings/admins`
- **기능**:
  - 전체 관리자 목록
  - 관리자 임명/해임
  - 권한 변경 (ADMIN ↔ SYSTEM_ADMIN)
  - 활동 통계 조회
- **권한**: SYSTEM_ADMIN만

#### 3.3 감사 로그 페이지
- **경로**: `/admin/logs/audit`
- **기능**:
  - 관리자 활동 로그 조회
  - 고급 필터링
  - 로그 익스포트
  - 비정상 패턴 하이라이트
- **권한**: SYSTEM_ADMIN만

#### 3.4 이용약관 관리 페이지
- **경로**: `/admin/settings/legal`
- **기능**:
  - 이용약관 편집 (마크다운)
  - 개인정보처리방침 편집
  - 버전 관리
  - 변경 이력 조회
- **권한**: SYSTEM_ADMIN만

#### 3.5 데이터 익스포트 페이지
- **경로**: `/admin/tools/export`
- **기능**:
  - 데이터 유형 선택
  - 필터 설정
  - 형식 선택 (CSV/Excel/JSON)
  - 익스포트 실행
  - 다운로드 링크 생성
- **권한**: SYSTEM_ADMIN만

### 🟡 P1 - 높음 (6개)

#### 3.6 콘텐츠 필터링 규칙 페이지
- **경로**: `/admin/settings/filters`
- **기능**:
  - 금지어 목록 관리
  - 필터링 강도 조정
  - 자동 제재 규칙 설정
  - 필터 테스트 도구

#### 3.7 백업 및 복구 페이지
- **경로**: `/admin/tools/backup`
- **기능**:
  - 백업 생성
  - 백업 목록
  - 백업 복구
  - 백업 다운로드

#### 3.8 데이터 정리 페이지
- **경로**: `/admin/tools/cleanup`
- **기능**:
  - 탈퇴 계정 정리
  - 오래된 로그 삭제
  - 임시 파일 정리
  - 캐시 초기화

#### 3.9 이메일 도메인 관리 페이지
- **경로**: `/admin/settings/email-domains`
- **기능**:
  - 화이트리스트/블랙리스트 관리
  - 도메인 추가/삭제
  - 일괄 추가 (CSV 업로드)
  - 차단 통계

#### 3.10 파일 확장자 관리 페이지
- **경로**: `/admin/settings/file-extensions`
- **기능**:
  - 허용/차단 확장자 관리
  - 확장자별 최대 크기 설정
  - 바이러스 스캔 설정

#### 3.11 시스템 공지 발송 페이지
- **경로**: `/admin/tools/notices`
- **기능**:
  - 공지 작성
  - 발송 대상 선택
  - 발송 방법 선택
  - 예약 발송 설정
  - 발송 내역 조회

### 🟢 P2 - 중간 (4개)

#### 3.12 관리자 활동 통계 페이지
- **경로**: `/admin/stats/admins`
- **기능**:
  - 관리자별 활동 요약
  - 처리 건수/시간 통계
  - 비정상 패턴 알림

#### 3.13 플랫폼 분석 대시보드
- **경로**: `/admin/analytics`
- **기능**:
  - DAU/MAU 차트
  - 코호트 분석
  - 리텐션 분석
  - 퍼널 분석

#### 3.14 시스템 건강 대시보드
- **경로**: `/admin/health`
- **기능**:
  - 서버 상태 모니터링
  - DB 연결 상태
  - 스토리지 사용량
  - 외부 서비스 상태

#### 3.15 비정상 패턴 감지 페이지
- **경로**: `/admin/security/anomaly`
- **기능**:
  - 비정상 관리자 활동 알림
  - 비정상 사용자 활동 알림
  - 보안 위협 징후

---

## 4. 자동화 기능 (미구현: 10개)

### 🔴 P0 - 필수 (3개)

#### 4.1 자동 제재 규칙
- **기능**: 특정 조건 충족 시 자동 제재
- **규칙 예시**:
  - 경고 3회 누적 → 1일 정지
  - 욕설 5회 → 3일 정지
  - 스팸 신고 10회 → 영구 정지
- **설정**: SYSTEM_ADMIN이 규칙 정의

#### 4.2 신고 자동 배정
- **기능**: 신고 접수 시 관리자 자동 배정
- **알고리즘**:
  - 라운드 로빈 방식
  - 처리 중인 건수 고려
  - 우선순위별 가중치

#### 4.3 이메일 자동 발송
- **기능**: 이벤트 발생 시 템플릿 기반 이메일 자동 발송
- **트리거**:
  - 회원가입 → welcome 템플릿
  - 이메일 인증 요청 → email_verification 템플릿
  - 비밀번호 재설정 → password_reset 템플릿
  - 제재 → sanction_* 템플릿

### 🟡 P1 - 높음 (4개)

#### 4.4 백업 자동 스케줄
- **기능**: 정기적 자동 백업
- **설정**: 일간/주간/월간
- **보관 기간**: 설정 가능 (기본 30일)

#### 4.5 데이터 자동 정리
- **기능**: 오래된 데이터 자동 삭제
- **대상**:
  - 탈퇴 후 30일 지난 계정
  - 1년 이상 된 로그
  - 임시 파일 (7일 이상)

#### 4.6 비정상 패턴 자동 감지
- **기능**: 이상 징후 자동 탐지 및 알림
- **대상**:
  - 관리자 비정상 활동
  - 사용자 어뷰징
  - 시스템 에러 급증

#### 4.7 통계 리포트 자동 생성
- **기능**: 정기 리포트 자동 생성 및 발송
- **주기**: 일간/주간/월간
- **발송**: SYSTEM_ADMIN 이메일

### 🟢 P2 - 중간 (3개)

#### 4.8 유사 신고 자동 그룹핑
- **기능**: 같은 대상/같은 사유 신고 자동 그룹화
- **효과**: 중복 처리 방지, 효율성 향상

#### 4.9 스터디 품질 자동 평가
- **기능**: 스터디 활동 분석 후 자동 추천/경고
- **지표**: 활성도, 멤버 만족도, 규칙 준수

#### 4.10 사용자 신뢰도 점수 자동 계산
- **기능**: 사용자 활동 기반 신뢰도 산출
- **지표**: 제재 이력, 스터디 참여, 기여도

---

## 5. 보안 및 권한 (미구현: 5개)

### 🔴 P0 - 필수 (2개)

#### 5.1 IP 기반 접근 제한
- **기능**: 특정 IP에서만 관리자 페이지 접근 허용
- **설정**: SYSTEM_ADMIN이 허용 IP 목록 관리

#### 5.2 관리자 작업 2단계 인증
- **기능**: 중요 작업 시 추가 인증 요구
- **대상 작업**:
  - 사용자 완전 삭제
  - 관리자 권한 변경
  - 시스템 설정 변경
  - 백업 복구

### 🟡 P1 - 높음 (2개)

#### 5.3 역할 기반 세부 권한 관리 (RBAC)
- **기능**: ADMIN 내에서도 세부 권한 구분
- **권한 예시**:
  - 신고 처리만 가능한 ADMIN
  - 스터디 관리만 가능한 ADMIN
  - 모든 권한을 가진 SYSTEM_ADMIN

#### 5.4 관리자 세션 타임아웃
- **기능**: 일정 시간 비활성 시 자동 로그아웃
- **설정**: 기본 30분 (조정 가능)

### 🟢 P2 - 중간 (1개)

#### 5.5 관리자 로그인 알림
- **기능**: 관리자 계정 로그인 시 이메일/SMS 알림
- **정보**: IP, 시간, 디바이스

---

## 6. 구현 우선순위 및 일정 제안

### Phase 1: 핵심 기능 (4주)
**목표**: SYSTEM_ADMIN이 플랫폼을 안전하게 관리할 수 있는 최소 기능

1. **Week 1**: 이메일 템플릿 관리
   - API 구현 (CRUD, 테스트 발송, 미리보기)
   - 화면 구현 (목록, 편집기, 변수 도구)
   - 자동 발송 연동

2. **Week 2**: 관리자 권한 관리
   - API 구현 (임명/해임, 권한 변경)
   - 화면 구현 (관리자 목록, 활동 통계)
   - 임명 조건 검증 로직

3. **Week 3**: 감사 로그 및 데이터 익스포트
   - 감사 로그 API 및 화면
   - 데이터 익스포트 API
   - 익스포트 화면 (필터, 다운로드)

4. **Week 4**: 보안 기능
   - 사용자 완전 삭제 API
   - IP 기반 접근 제한
   - 2단계 인증 (중요 작업)

### Phase 2: 콘텐츠 관리 (3주)
**목표**: 콘텐츠 품질 관리 및 자동화

5. **Week 5-6**: 콘텐츠 필터링
   - 필터링 규칙 API 및 화면
   - 금지어 관리
   - 자동 제재 규칙
   - 필터 테스트 도구

6. **Week 7**: 이용약관 관리
   - 약관 관리 API
   - 약관 편집 화면 (마크다운 에디터)
   - 버전 관리
   - 재동의 워크플로우

### Phase 3: 운영 효율화 (3주)
**목표**: 관리자 업무 효율성 향상

7. **Week 8-9**: 통계 및 분석
   - 플랫폼 분석 API
   - 분석 대시보드
   - 관리자 활동 통계
   - 리포트 자동 생성

8. **Week 10**: 백업 및 정리
   - 백업/복구 API 및 화면
   - 자동 백업 스케줄
   - 데이터 정리 API 및 화면
   - 자동 정리 작업

### Phase 4: 고급 기능 (2주)
**목표**: 보안 강화 및 자동화

9. **Week 11**: 비정상 패턴 감지
   - 패턴 감지 알고리즘
   - 자동 알림 시스템
   - 감지 화면

10. **Week 12**: 세부 권한 및 최적화
    - RBAC 구현
    - 시스템 건강 체크
    - 성능 최적화

---

## 7. 기술 스택 제안

### 프론트엔드
- **에디터**: Monaco Editor (코드 에디터) 또는 Tiptap (WYSIWYG)
- **차트**: Recharts 또는 Chart.js
- **테이블**: TanStack Table (고급 필터링, 정렬)
- **파일 업로드**: react-dropzone

### 백엔드
- **이메일 발송**: Nodemailer + SendGrid/AWS SES
- **파일 처리**: Sharp (이미지), Multer (업로드)
- **스케줄링**: node-cron (자동 백업, 정리)
- **보안**: bcrypt, JWT, IP 화이트리스트

### 인프라
- **백업**: pg_dump (PostgreSQL)
- **스토리지**: AWS S3 또는 로컬 스토리지
- **모니터링**: Sentry (에러 추적), Winston (로깅)

---

## 8. 결론

### 현재 상태
- 기본 데이터베이스 모델은 구축 완료
- 시스템 설정 및 이메일 템플릿 기본 데이터 시드 완료
- 전체 기능의 약 8%만 구현됨

### 필수 작업
1. **이메일 템플릿 관리**: 사용자 커뮤니케이션의 핵심
2. **관리자 권한 관리**: 관리자 팀 확장을 위한 필수 기능
3. **감사 로그**: 관리자 활동 투명성 및 보안
4. **데이터 익스포트**: 법적 요구사항 (GDPR 등) 준수

### 권장 사항
- Phase 1 (핵심 기능)부터 순차적으로 구현
- 각 기능 구현 후 테스트 및 문서화
- 보안 관련 기능은 최우선으로 검토
- API 먼저 구현 후 화면 개발 (API-First)

---

## 9. 체크리스트

### 즉시 필요한 작업
- [ ] 이메일 템플릿 CRUD API 구현
- [ ] 이메일 자동 발송 로직 구현
- [ ] 관리자 권한 관리 API 구현
- [ ] 감사 로그 조회 API 구현
- [ ] 사용자 완전 삭제 API 구현
- [ ] IP 기반 접근 제한 구현

### 단기 목표 (1개월)
- [ ] 이메일 템플릿 관리 화면
- [ ] 관리자 권한 관리 화면
- [ ] 감사 로그 화면
- [ ] 데이터 익스포트 화면
- [ ] 보안 설정 화면

### 중기 목표 (2-3개월)
- [ ] 콘텐츠 필터링 규칙 관리
- [ ] 이용약관 관리
- [ ] 통계 및 분석 대시보드
- [ ] 백업 및 복구 시스템
- [ ] 자동화 작업 (백업, 정리, 리포트)

### 장기 목표 (3개월+)
- [ ] 비정상 패턴 감지
- [ ] RBAC (세부 권한 관리)
- [ ] 시스템 건강 모니터링
- [ ] 고급 분석 (코호트, 퍼널)
- [ ] 완전 자동화된 운영 시스템

---

**보고서 종료**

