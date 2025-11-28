# 신고 처리 시스템 설계

## 📊 현재 신고 기능 분석

### 1. 신고 시스템

#### 1.1 신고 가능 대상
**현재 데이터 모델:**
```prisma
model Report {
  id         String     @id @default(cuid())
  reporterId String
  targetType TargetType
  targetId   String
  targetName String?
  type       ReportType
  reason     String     @db.Text
  evidence   Json?
  
  status   ReportStatus @default(PENDING)
  priority Priority     @default(MEDIUM)
  
  processedBy String?
  processedAt DateTime?
  resolution  String?   @db.Text
  
  createdAt DateTime @default(now())
}

enum TargetType {
  USER     // 사용자
  STUDY    // 스터디
  MESSAGE  // 메시지
}

enum ReportType {
  SPAM           // 스팸
  HARASSMENT     // 괴롭힘
  INAPPROPRIATE  // 부적절한 콘텐츠
  COPYRIGHT      // 저작권 침해
  OTHER          // 기타
}

enum ReportStatus {
  PENDING      // 대기중
  IN_PROGRESS  // 처리중
  RESOLVED     // 해결됨
  REJECTED     // 기각됨
}
```

**신고 API:**
```javascript
// 신고 생성 (일반 사용자)
POST /api/reports
Body: {
  targetType: "USER" | "STUDY" | "MESSAGE",
  targetId: string,
  type: ReportType,
  reason: string,
  evidence?: { screenshots: string[], urls: string[] }
}

// 내 신고 목록 조회
GET /api/reports/my
```

**관리자 요구사항:**
- 모든 신고 조회 및 관리
- 신고 우선순위 자동/수동 설정
- 처리 담당자 배정
- 처리 결과 통지
- 신고자 및 피신고자 히스토리

## 🎯 관리자 신고 처리 시스템

### 1. 신고 대시보드

#### 1.1 개요 지표
**표시 항목:**
- 전체 신고 수
- 미처리 신고 수 (PENDING)
- 처리 중 신고 수 (IN_PROGRESS)
- 긴급 신고 수 (URGENT 우선순위)
- 평균 처리 시간
- 오늘/이번 주 신규 신고 수

#### 1.2 신고 유형 분포
- 파이 차트: 신고 유형별 비율
- 추세 그래프: 시간별 신고 증감

#### 1.3 처리 통계
- 처리 상태별 분포
- 관리자별 처리 건수
- 평균 처리 시간 추이

### 2. 신고 목록 및 검색

#### 2.1 신고 목록
**필터 옵션:**
- 상태: PENDING / IN_PROGRESS / RESOLVED / REJECTED
- 우선순위: LOW / MEDIUM / HIGH / URGENT
- 신고 유형: SPAM / HARASSMENT / INAPPROPRIATE / COPYRIGHT / OTHER
- 대상 유형: USER / STUDY / MESSAGE
- 담당자: 나 / 미배정 / 특정 관리자
- 날짜 범위: 생성일, 처리일

**정렬 옵션:**
- 우선순위 높은 순
- 최신 신고 순
- 오래된 순
- 처리 예정 시간 순

**일괄 작업:**
- 선택한 신고에 담당자 배정
- 선택한 신고 우선순위 변경
- 선택한 신고 상태 변경

#### 2.2 신고 검색
**검색 기준:**
- 신고 ID
- 신고자 이메일/이름
- 피신고자 이메일/이름
- 신고 내용 (키워드)
- 대상 ID (USER_ID, STUDY_ID, MESSAGE_ID)

#### 2.3 빠른 필터
- 내가 담당하는 신고
- 긴급 신고
- 오늘 접수된 신고
- 24시간 이내 처리 필요
- 반복 신고자
- 반복 피신고자

### 3. 신고 상세 페이지

#### 3.1 신고 정보
**기본 정보:**
- 신고 ID, 생성일시, 상태, 우선순위
- 신고 유형, 대상 유형
- 신고자 정보 (클릭 시 상세 페이지 이동)
- 피신고 대상 정보

**신고 내용:**
- 신고 사유 (전체 텍스트)
- 첨부된 증거 (스크린샷, URL 등)
- 관련 신고 링크 (동일 대상에 대한 다른 신고)

**컨텍스트 정보:**
- USER 신고: 사용자 프로필, 활동 통계, 제재 이력
- STUDY 신고: 스터디 정보, 멤버 수, 관리 이력
- MESSAGE 신고: 메시지 내용, 전후 맥락 (이전/이후 10개 메시지)

#### 3.2 처리 정보
- 담당자: 선택/변경 가능
- 상태: 드롭다운으로 변경
- 우선순위: 드롭다운으로 변경
- 처리 노트: 관리자 메모 (내부용, 사용자에게 보이지 않음)
- 타임라인: 신고 접수 → 배정 → 조사 시작 → 결정 → 통지

#### 3.3 빠른 액션
**대상별 액션:**

**USER 신고 시:**
- 경고 발송
- 계정 정지 (1일/3일/7일/30일/영구)
- 특정 기능 제한 (채팅/스터디 생성/파일 업로드)
- 계정 삭제

**STUDY 신고 시:**
- 스터디 숨김
- 스터디 종료
- 스터디 삭제
- 특정 콘텐츠 삭제
- 스터디장에게 경고

**MESSAGE 신고 시:**
- 메시지 삭제
- 작성자 경고
- 작성자 채팅 금지 (기간 설정)

#### 3.4 결정 및 통지
**처리 결정:**
- 조치 내용 선택 (위의 액션)
- 결정 사유 작성 (필수)
- 신고자에게 통지 여부
- 피신고자에게 통지 내용

**통지 템플릿:**
- 신고 접수 알림 (신고자)
- 조사 시작 알림 (신고자)
- 조치 완료 알림 (신고자)
- 제재 통지 (피신고자)
- 무혐의 통지 (피신고자)

### 4. 신고 처리 워크플로우

#### 4.1 기본 워크플로우
```
1. 신고 접수 (PENDING)
   ↓
2. 자동 우선순위 설정 (규칙 기반)
   ↓
3. 담당자 배정 (자동 또는 수동)
   ↓
4. 조사 시작 (IN_PROGRESS)
   - 신고 내용 확인
   - 컨텍스트 조사
   - 관련 이력 확인
   ↓
5. 결정
   - 조치 필요 → 제재 시행 (RESOLVED)
   - 무혐의 → 기각 (REJECTED)
   ↓
6. 통지 발송
   ↓
7. 종료
```

#### 4.2 자동화 규칙
**자동 우선순위 설정:**
- URGENT: 
  - 신고 유형이 HARASSMENT
  - 동일 대상에 대한 신고가 3개 이상
  - 피신고자가 이미 정지된 적 있음
- HIGH:
  - 신고 유형이 INAPPROPRIATE
  - 동일 신고자가 3번째 신고
- MEDIUM: 기본값
- LOW: 신고 유형이 OTHER

**자동 담당자 배정:**
- 라운드 로빈 방식
- 현재 처리 중인 신고가 적은 관리자 우선
- 전문 영역별 배정 (콘텐츠 모더레이터, 사용자 관리자 등)

### 5. 반복 신고 관리

#### 5.1 반복 신고자 감지
**기준:**
- 30일 내 10건 이상 신고
- 기각된 신고 비율 50% 이상
- 동일한 대상에 대한 중복 신고

**조치:**
- 신고 제한 (하루 최대 5건)
- 관리자 승인 후 신고 접수
- 신고 기능 일시 정지

#### 5.2 반복 피신고자 모니터링
**기준:**
- 30일 내 5건 이상 신고 받음
- 조치된 신고 3건 이상

**자동 액션:**
- 우선순위 자동 상향
- 특정 관리자에게 에스컬레이션
- 자동 경고 발송

### 6. 신고 통계 및 분석

#### 6.1 대시보드 지표
- 일/주/월별 신고 건수
- 신고 유형별 분포
- 처리 상태별 분포
- 평균 처리 시간
- 관리자별 처리 건수
- 조치율 (기각 vs 제재)

#### 6.2 트렌드 분석
- 신고 증감 추이
- 특정 유형 신고 급증 감지
- 특정 스터디/사용자 관련 신고 패턴
- 시간대별 신고 분포

#### 6.3 품질 메트릭
- 평균 응답 시간 (First Response Time)
- 평균 해결 시간 (Resolution Time)
- 재신고율 (동일 대상, 같은 이유)
- 신고자 만족도 (피드백 기반)

## 🔐 권한 설계

### 신고 처리 권한

**VIEWER:**
- 신고 목록 조회
- 신고 상세 조회
- 통계 조회

**MODERATOR:**
- VIEWER 권한 포함
- 신고 상태 변경 (PENDING → IN_PROGRESS)
- 담당자 배정 (본인만)
- 콘텐츠 삭제
- 경고 발급
- 단기 제재 (7일 이하)

**ADMIN:**
- MODERATOR 권한 포함
- 모든 담당자 배정
- 장기/영구 제재
- 신고 기각
- 처리 노트 작성

**SUPER_ADMIN:**
- ADMIN 권한 포함
- 자동화 규칙 설정
- 통계 및 리포트 접근
- 신고 시스템 설정

## 📊 데이터 모델 확장

```prisma
// 신고 처리 로그
model ReportLog {
  id        String   @id @default(cuid())
  reportId  String
  adminId   String
  action    ReportAction
  oldValue  String?
  newValue  String?
  note      String?  @db.Text
  createdAt DateTime @default(now())
  
  @@index([reportId, createdAt])
}

enum ReportAction {
  CREATED
  ASSIGNED
  STATUS_CHANGED
  PRIORITY_CHANGED
  NOTE_ADDED
  RESOLVED
  REJECTED
  REOPENED
}

// 신고자 제한
model ReporterRestriction {
  id          String   @id @default(cuid())
  userId      String
  reason      String   @db.Text
  dailyLimit  Int      @default(5)
  requiresApproval Boolean @default(false)
  expiresAt   DateTime?
  adminId     String
  createdAt   DateTime @default(now())
  
  @@index([userId, expiresAt])
}
```

## 🎨 UI/UX 설계

### 1. 신고 대시보드
- 상단: 주요 지표 카드
- 중단: 신고 유형 및 상태 차트
- 하단: 최근 신고 목록

### 2. 신고 목록
- 카드 레이아웃 (우선순위 색상 구분)
- 빠른 필터 버튼 상단 배치
- 각 카드에 빠른 액션 아이콘
- 무한 스크롤 또는 페이지네이션

### 3. 신고 상세
- 3단 레이아웃:
  - 좌: 신고 정보 및 컨텍스트
  - 중앙: 타임라인 및 처리 노트
  - 우: 빠른 액션 패널
- 모달 형식의 빠른 액션 (경고, 정지 등)

## 🚀 구현 우선순위

### Phase 1: 필수 기능
1. 신고 목록 조회 및 검색
2. 신고 상세 페이지
3. 기본 상태 변경 (PENDING → IN_PROGRESS → RESOLVED/REJECTED)
4. 담당자 배정
5. 기본 통계

### Phase 2: 핵심 기능
1. 빠른 액션 (경고, 정지, 삭제 등)
2. 처리 노트 및 타임라인
3. 통지 시스템
4. 컨텍스트 정보 통합

### Phase 3: 고급 기능
1. 자동화 규칙
2. 반복 신고자/피신고자 관리
3. 상세 통계 및 분석
4. 일괄 작업

## 📝 API 명세

```typescript
// 신고 목록
GET /api/admin/reports
Query: {
  page, limit, status, priority, type,
  targetType, assignedTo, search, sortBy
}

// 신고 상세
GET /api/admin/reports/:reportId

// 담당자 배정
POST /api/admin/reports/:reportId/assign
Body: { adminId: string }

// 상태 변경
PATCH /api/admin/reports/:reportId/status
Body: { status: ReportStatus, note?: string }

// 신고 처리 (조치 시행)
POST /api/admin/reports/:reportId/process
Body: {
  action: string,  // "warn", "suspend", "delete", etc.
  reason: string,
  duration?: string,
  notifyReporter: boolean,
  notifyTarget: boolean
}

// 신고 기각
POST /api/admin/reports/:reportId/reject
Body: {
  reason: string,
  notifyReporter: boolean
}

// 처리 노트 추가
POST /api/admin/reports/:reportId/notes
Body: { note: string }
```

## ✅ 체크리스트

- [ ] 신고 시스템 분석 완료
- [ ] 관리자 요구사항 도출 완료
- [ ] 워크플로우 설계 완료
- [ ] 자동화 규칙 정의 완료
- [ ] 데이터 모델 설계 완료
- [ ] API 명세 작성 완료
- [ ] UI/UX 설계 완료
- [ ] 구현 우선순위 결정 완료

