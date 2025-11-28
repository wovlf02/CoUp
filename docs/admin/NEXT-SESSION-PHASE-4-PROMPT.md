# Phase 4: 신고 처리 시스템 구현 프롬프트

> 다음 세션에서 이 프롬프트를 복사해서 사용하세요.

---

## 📋 프롬프트

```
CoUp 관리자 시스템 구현을 이어서 진행해.

먼저 다음 문서들을 읽어줘:

1. docs/admin/IMPLEMENTATION-PROGRESS-SESSION-2.md
   - 현재까지 완료된 항목 (사용자 관리 100%, 스터디 관리 100%)
   - 다음 작업 (신고 처리)
   - 기술 스택 및 컨벤션

2. docs/admin/PHASE-3-COMPLETE-SUMMARY.md
   - Phase 3 완료 내용 및 패턴
   - 재사용할 컴포넌트

3. docs/admin/features/complete/03-report-management-complete.md
   - 신고 처리 API 명세
   - Prisma 모델
   - 구현 예시 코드

4. docs/screens/admin/15-reports-list.md
   - 신고 목록/상세 UI 설계
   - 컴포넌트 구조

그 다음 이 순서대로 구현해줘:

### Phase 4: 신고 처리

1단계: 신고 처리 API (4개)
- GET /api/admin/reports (목록 - 검색, 필터, 정렬, 페이지네이션)
- GET /api/admin/reports/[reportId] (상세 - 신고 대상, 증거, 이력)
- POST /api/admin/reports/[reportId]/assign (담당자 배정)
- POST /api/admin/reports/[reportId]/process (처리 - 승인/거부/보류)

2단계: 신고 처리 UI
- src/app/admin/reports/page.jsx (목록 페이지)
- src/app/admin/reports/_components/ReportList.jsx (Server Component)
- src/app/admin/reports/_components/ReportFilters.jsx (Client Component)
- src/app/admin/reports/[reportId]/page.jsx (상세 페이지)
- src/app/admin/reports/[reportId]/_components/ReportActions.jsx (처리 모달)

사용자 관리, 스터디 관리와 동일한 패턴으로 구현하고,
기존에 만든 Button, Modal, Badge 컴포넌트를 재사용해.

신고 처리 시 연계 액션도 구현:
- 승인 → 대상 사용자 정지 또는 콘텐츠 삭제
- 거부 → 신고자에게 알림
- 보류 → 추가 검토 필요 표시

모든 명령어는 포그라운드에서 실행하고,
파일 생성 후 에러 확인해줘.

구현 완료 후 다음 단계 (통계 분석) 안내해줘.
```

---

## 📚 참고 문서 위치

구현 전 반드시 읽어야 할 문서들:

### 필수 문서
1. **진행 상황**
   - `docs/admin/IMPLEMENTATION-PROGRESS-SESSION-2.md`
   - 현재 상태, 완료 항목, 기술 스택

2. **Phase 3 완료 보고서**
   - `docs/admin/PHASE-3-COMPLETE-SUMMARY.md`
   - 스터디 관리 구현 패턴 참고

3. **신고 처리 명세**
   - `docs/admin/features/complete/03-report-management-complete.md`
   - API 명세, 데이터 모델, 예시 코드

4. **UI 설계**
   - `docs/screens/admin/15-reports-list.md`
   - 화면 구조, 컴포넌트 설계

### 참고 문서
- `docs/admin/features/complete/01-user-management-complete.md` (사용자 관리 패턴)
- `docs/admin/features/complete/02-study-management-complete.md` (스터디 관리 패턴)

---

## 🎯 구현 목표

### API (4개 엔드포인트)
```
GET  /api/admin/reports
GET  /api/admin/reports/[reportId]
POST /api/admin/reports/[reportId]/assign
POST /api/admin/reports/[reportId]/process
```

### UI (8개 파일)
```
src/app/admin/reports/
├── page.jsx
├── page.module.css
├── _components/
│   ├── ReportList.jsx
│   ├── ReportList.module.css
│   ├── ReportFilters.jsx
│   └── ReportFilters.module.css
└── [reportId]/
    ├── page.jsx
    ├── page.module.css
    └── _components/
        ├── ReportActions.jsx
        └── ReportActions.module.css
```

### 주요 기능
1. **신고 목록**
   - 검색 (신고 내용, 신고자)
   - 필터 (상태, 유형, 우선순위, 담당자)
   - 정렬 (생성일, 우선순위)
   - 페이지네이션

2. **신고 상세**
   - 신고 정보 (신고자, 대상, 사유)
   - 증거 자료 (스크린샷, 링크)
   - 처리 이력
   - 관련 신고

3. **처리 액션**
   - 담당자 배정
   - 승인 (+ 사용자 정지 or 콘텐츠 삭제)
   - 거부 (+ 사유 입력)
   - 보류 (+ 메모 작성)

---

## 🔧 기술 요구사항

### Prisma 스키마
```prisma
model Report {
  id          String       @id @default(cuid())
  reporterId  String
  targetType  ReportTarget
  targetId    String
  reason      ReportReason
  description String       @db.Text
  evidence    Json?        // 스크린샷 URL, 링크 등
  
  status      ReportStatus @default(PENDING)
  priority    Priority     @default(MEDIUM)
  
  assignedTo  String?
  assignedAt  DateTime?
  
  processedBy String?
  processedAt DateTime?
  decision    String?      @db.Text
  
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  reporter    User         @relation("ReportReporter", fields: [reporterId], references: [id])
  
  @@index([status, priority, createdAt])
  @@index([assignedTo, status])
  @@index([targetType, targetId])
}

enum ReportTarget {
  USER
  STUDY
  MESSAGE
  NOTICE
}

enum ReportReason {
  SPAM
  HARASSMENT
  INAPPROPRIATE_CONTENT
  IMPERSONATION
  FAKE_INFORMATION
  COPYRIGHT
  OTHER
}

enum ReportStatus {
  PENDING      // 대기중
  ASSIGNED     // 배정됨
  IN_REVIEW    // 검토중
  APPROVED     // 승인 (조치 완료)
  REJECTED     // 거부
  PENDING_INFO // 정보 대기중
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### API 응답 형식
```typescript
// 목록
{
  success: true,
  data: {
    reports: Report[],
    pagination: Pagination,
    stats: {
      total: number,
      pending: number,
      assigned: number,
      resolved: number
    }
  }
}

// 상세
{
  success: true,
  data: {
    report: {
      ...reportData,
      reporter: User,
      target: User | Study | Message,
      assignedAdmin: AdminRole,
      processedAdmin: AdminRole,
      relatedReports: Report[]
    }
  }
}
```

---

## ✅ 체크리스트

### API 구현
- [ ] GET /api/admin/reports (목록)
  - [ ] 검색 기능
  - [ ] 필터링 (상태, 유형, 우선순위)
  - [ ] 정렬
  - [ ] 페이지네이션
  - [ ] 통계 정보

- [ ] GET /api/admin/reports/[reportId] (상세)
  - [ ] 신고 정보
  - [ ] 신고자/대상 정보
  - [ ] 증거 자료
  - [ ] 처리 이력
  - [ ] 관련 신고

- [ ] POST /api/admin/reports/[reportId]/assign (배정)
  - [ ] 담당자 배정
  - [ ] 알림 발송
  - [ ] 로그 기록

- [ ] POST /api/admin/reports/[reportId]/process (처리)
  - [ ] 승인/거부/보류 처리
  - [ ] 연계 액션 (정지/삭제)
  - [ ] 알림 발송
  - [ ] 로그 기록

### UI 구현
- [ ] 신고 목록 페이지
  - [ ] 필터 컴포넌트
  - [ ] 목록 테이블
  - [ ] 통계 카드
  - [ ] 페이지네이션

- [ ] 신고 상세 페이지
  - [ ] 신고 정보 표시
  - [ ] 증거 자료 표시
  - [ ] 처리 이력
  - [ ] 액션 버튼

- [ ] 처리 액션 모달
  - [ ] 배정 모달
  - [ ] 승인 모달 (+ 연계 액션)
  - [ ] 거부 모달 (+ 사유)
  - [ ] 보류 모달 (+ 메모)

### 테스트
- [ ] API 테스트
  - [ ] 목록 조회
  - [ ] 필터링
  - [ ] 상세 조회
  - [ ] 담당자 배정
  - [ ] 처리 (승인/거부/보류)

- [ ] UI 테스트
  - [ ] 목록 표시
  - [ ] 검색/필터
  - [ ] 상세 페이지
  - [ ] 모달 동작
  - [ ] 성공/실패 처리

---

## 💡 구현 팁

### 1. 기존 패턴 활용
```javascript
// 사용자/스터디 관리와 동일한 패턴
- Server Component로 데이터 페칭
- Client Component로 인터랙션 처리
- Modal 기반 액션
```

### 2. 재사용 컴포넌트
```javascript
import Button from '@/components/admin/ui/Button'
import Modal from '@/components/admin/ui/Modal'
import Badge from '@/components/admin/ui/Badge'
```

### 3. 연계 액션 구현
```javascript
// 승인 시
if (action === 'APPROVE') {
  if (actionType === 'SUSPEND_USER') {
    await suspendUser(report.targetId, duration)
  } else if (actionType === 'DELETE_CONTENT') {
    await deleteContent(report.targetType, report.targetId)
  }
}
```

### 4. 우선순위 표시
```javascript
// 색상으로 시각화
URGENT: red (빨강)
HIGH: orange (주황)
MEDIUM: yellow (노랑)
LOW: gray (회색)
```

---

## 📊 예상 결과

### 완료 시
- ✅ 4개 API 엔드포인트
- ✅ 8개 UI 파일
- ✅ 약 2,000줄 코드
- ✅ 완전한 신고 처리 시스템
- ✅ 연계 액션 구현

### 전체 진행률
```
Phase 1: 백엔드      90% █████████░
Phase 2: 프론트엔드   85% ████████░░
전체                78% ████████░░
```

---

## 🚀 다음 단계

Phase 4 완료 후:
- Phase 5: 통계 분석 시스템
- Phase 6: 설정 및 마이그레이션
- Phase 7: 최종 테스트 및 배포

---

## 📞 참고사항

- 모든 API는 관리자 권한 필요
- 모든 작업은 AdminLog에 기록
- 알림 시스템은 추후 구현
- 에러 처리 및 유효성 검사 필수

---

**예상 소요 시간**: 4-5시간

**시작 전 확인**:
1. 개발 서버 실행 중인지 확인
2. 관리자 계정으로 로그인
3. 신고 테스트 데이터 있는지 확인

행운을 빕니다! 🚀

