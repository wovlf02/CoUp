# Phase 6: 설정 및 감사 로그 구현 프롬프트

> 다음 세션에서 이 프롬프트를 복사해서 사용하세요.

---

## 📋 프롬프트

```
CoUp 관리자 시스템 구현을 이어서 진행해.

먼저 다음 문서들을 읽어줘:

1. docs/admin/IMPLEMENTATION-PROGRESS-SESSION-2.md
   - 현재까지 완료된 항목
   - 다음 작업
   - 기술 스택 및 컨벤션

2. docs/admin/PHASE-5-COMPLETE-SUMMARY.md
   - Phase 5 완료 내용 (통계 분석)
   - 재사용할 컴포넌트 및 패턴

3. docs/admin/features/settings-management.md (있다면)
   - 시스템 설정 API 명세
   - 설정 카테고리 구조

4. docs/admin/features/audit-log.md (있다면)
   - 감사 로그 API 명세
   - 로그 필터링 및 검색

그 다음 이 순서대로 구현해줘:

### Phase 6: 설정 및 감사 로그

1단계: 시스템 설정 API (4개)
- GET /api/admin/settings (설정 조회)
- PUT /api/admin/settings (설정 업데이트)
- GET /api/admin/settings/history (변경 이력)
- POST /api/admin/settings/cache/clear (캐시 초기화)

2단계: 감사 로그 API (2개)
- GET /api/admin/audit-logs (로그 목록)
- GET /api/admin/audit-logs/export (로그 내보내기)

3단계: 설정 관리 UI
- src/app/admin/settings/page.jsx (설정 페이지)
- src/app/admin/settings/_components/SettingsForm.jsx (설정 폼)
- src/app/admin/settings/_components/SettingsHistory.jsx (변경 이력)

4단계: 감사 로그 UI
- src/app/admin/audit-logs/page.jsx (로그 페이지)
- src/app/admin/audit-logs/_components/LogFilters.jsx (필터)
- src/app/admin/audit-logs/_components/LogTable.jsx (로그 테이블)

사용자 관리, 스터디 관리, 신고 처리와 동일한 패턴으로 구현하고,
기존에 만든 Button, Badge, Modal 컴포넌트를 재사용해.

모든 명령어는 포그라운드에서 실행하고,
파일 생성 후 에러 확인해줘.

구현 완료 후 다음 단계 (최종 테스트 및 배포) 안내해줘.
```

---

## 📚 참고 문서 위치

구현 전 반드시 읽어야 할 문서들:

### 필수 문서
1. **진행 상황**
   - `docs/admin/IMPLEMENTATION-PROGRESS-SESSION-2.md`
   - 현재 상태, 완료 항목, 기술 스택

2. **Phase 5 완료 보고서**
   - `docs/admin/PHASE-5-COMPLETE-SUMMARY.md`
   - 통계 분석 구현 패턴 참고

### 참고 문서
- `docs/admin/features/complete/01-user-management-complete.md`
- `docs/admin/features/complete/02-study-management-complete.md`
- `docs/admin/features/complete/03-report-handling-complete.md`
- `docs/admin/features/complete/04-analytics-dashboard-complete.md`

---

## 🎯 구현 목표

### API (6개 엔드포인트)

#### 시스템 설정 (4개)
```
GET  /api/admin/settings
PUT  /api/admin/settings
GET  /api/admin/settings/history
POST /api/admin/settings/cache/clear
```

#### 감사 로그 (2개)
```
GET  /api/admin/audit-logs
GET  /api/admin/audit-logs/export
```

### UI (12개 파일)

#### 시스템 설정
```
src/app/admin/settings/
├── page.jsx
├── page.module.css
└── _components/
    ├── SettingsForm.jsx
    ├── SettingsForm.module.css
    ├── SettingsHistory.jsx
    └── SettingsHistory.module.css
```

#### 감사 로그
```
src/app/admin/audit-logs/
├── page.jsx
├── page.module.css
└── _components/
    ├── LogFilters.jsx
    ├── LogFilters.module.css
    ├── LogTable.jsx
    └── LogTable.module.css
```

### 데이터베이스 스키마

```prisma
// Prisma Schema에 추가

model SystemSetting {
  id          String   @id @default(cuid())
  category    String   // general, security, notification, feature
  key         String   @unique
  value       String   @db.Text
  type        String   // string, number, boolean, json
  description String?
  updatedAt   DateTime @updatedAt
  updatedBy   String
  updater     AdminRole @relation(fields: [updatedBy], references: [userId])

  @@index([category])
  @@index([key])
}

model AuditLog {
  id          String   @id @default(cuid())
  adminId     String
  admin       AdminRole @relation(fields: [adminId], references: [userId])
  action      String   // user:suspend, study:delete, report:resolve 등
  targetType  String?  // USER, STUDY, REPORT 등
  targetId    String?
  details     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([adminId])
  @@index([action])
  @@index([targetType, targetId])
  @@index([createdAt])
}
```

---

## 🔧 주요 기능

### 1. 시스템 설정 관리

#### 설정 카테고리
- **일반 (general)**
  - 사이트 이름
  - 사이트 설명
  - 메인 로고 URL
  - 연락처 이메일

- **보안 (security)**
  - 최소 비밀번호 길이
  - 로그인 시도 제한
  - 세션 타임아웃 (분)
  - IP 차단 기능 사용

- **알림 (notification)**
  - 이메일 알림 사용
  - 신고 접수 알림
  - 시스템 경고 알림

- **기능 (feature)**
  - 회원 가입 허용
  - 스터디 생성 허용
  - 파일 업로드 허용
  - 최대 파일 크기 (MB)

#### 설정 타입
- `string` - 문자열
- `number` - 숫자
- `boolean` - true/false
- `json` - JSON 객체

#### 변경 이력
- 설정 키
- 이전 값
- 새 값
- 변경 일시
- 변경한 관리자

### 2. 감사 로그

#### 로그 액션
- **사용자 관리**
  - `user:view` - 사용자 조회
  - `user:warn` - 경고 부여
  - `user:suspend` - 정지
  - `user:unsuspend` - 정지 해제
  - `user:delete` - 삭제

- **스터디 관리**
  - `study:view` - 스터디 조회
  - `study:hide` - 숨김
  - `study:close` - 종료
  - `study:delete` - 삭제

- **신고 처리**
  - `report:view` - 신고 조회
  - `report:assign` - 담당자 배정
  - `report:resolve` - 해결
  - `report:reject` - 거부

- **설정 관리**
  - `settings:update` - 설정 변경
  - `settings:cache-clear` - 캐시 초기화

#### 로그 필터
- 날짜 범위 (시작일 ~ 종료일)
- 관리자 (특정 관리자 또는 전체)
- 액션 타입 (user:*, study:*, report:* 등)
- 대상 타입 (USER, STUDY, REPORT)

#### 로그 내보내기
- CSV 형식
- 필터 적용된 로그만 내보내기
- 최대 10,000건

---

## 💡 구현 팁

### 1. 설정 캐싱
```javascript
// 메모리 캐시 사용
let settingsCache = null
let cacheTimestamp = null
const CACHE_TTL = 5 * 60 * 1000 // 5분

async function getSettings(useCache = true) {
  if (useCache && settingsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return settingsCache
  }

  const settings = await prisma.systemSetting.findMany()
  settingsCache = settings
  cacheTimestamp = Date.now()
  
  return settings
}
```

### 2. 설정 값 타입 변환
```javascript
function parseSettingValue(value, type) {
  switch (type) {
    case 'number':
      return Number(value)
    case 'boolean':
      return value === 'true'
    case 'json':
      return JSON.parse(value)
    default:
      return value
  }
}
```

### 3. 로그 기록 헬퍼
```javascript
async function logAdminAction(adminId, action, targetType = null, targetId = null, details = null, request = null) {
  await prisma.auditLog.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      details,
      ipAddress: request?.headers?.get('x-forwarded-for') || 'unknown',
      userAgent: request?.headers?.get('user-agent') || 'unknown'
    }
  })
}
```

### 4. CSV 내보내기
```javascript
function convertToCSV(logs) {
  const headers = ['일시', '관리자', '액션', '대상 타입', '대상 ID', 'IP 주소']
  const rows = logs.map(log => [
    log.createdAt.toISOString(),
    log.admin.user.name,
    log.action,
    log.targetType || '',
    log.targetId || '',
    log.ipAddress || ''
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  return csv
}
```

---

## 📊 API 응답 형식

### 설정 조회
```typescript
GET /api/admin/settings

Response:
{
  success: true,
  data: {
    general: {
      site_name: { value: 'CoUp', type: 'string', description: '...' },
      site_description: { value: '...', type: 'string', description: '...' }
    },
    security: {
      min_password_length: { value: 8, type: 'number', description: '...' }
    }
  }
}
```

### 설정 업데이트
```typescript
PUT /api/admin/settings

Body:
{
  settings: [
    { key: 'site_name', value: 'CoUp v2' },
    { key: 'min_password_length', value: 10 }
  ]
}

Response:
{
  success: true,
  message: '설정이 업데이트되었습니다.',
  updated: 2
}
```

### 감사 로그 조회
```typescript
GET /api/admin/audit-logs?page=1&limit=20&action=user:*&startDate=2025-11-01

Response:
{
  success: true,
  data: {
    logs: [
      {
        id: 'log_123',
        admin: { name: '홍길동', email: 'admin@coup.com' },
        action: 'user:suspend',
        targetType: 'USER',
        targetId: 'user_456',
        details: { reason: '스팸', duration: 7 },
        ipAddress: '192.168.1.1',
        createdAt: '2025-11-28T10:30:00Z'
      }
    ],
    pagination: {
      total: 250,
      page: 1,
      totalPages: 13,
      hasMore: true
    }
  }
}
```

---

## ✅ 체크리스트

### 데이터베이스
- [ ] SystemSetting 모델 추가
- [ ] AuditLog 모델 추가
- [ ] 마이그레이션 실행
- [ ] 기본 설정 시드 데이터

### API 구현
- [ ] GET /api/admin/settings
  - [ ] 권한 확인 (SETTINGS_VIEW)
  - [ ] 카테고리별 그룹화
  - [ ] 캐싱 적용

- [ ] PUT /api/admin/settings
  - [ ] 권한 확인 (SETTINGS_UPDATE)
  - [ ] 타입 검증
  - [ ] 캐시 무효화
  - [ ] 변경 이력 기록

- [ ] GET /api/admin/settings/history
  - [ ] 권한 확인
  - [ ] 페이지네이션
  - [ ] 필터링

- [ ] POST /api/admin/settings/cache/clear
  - [ ] 권한 확인
  - [ ] 캐시 초기화
  - [ ] 로그 기록

- [ ] GET /api/admin/audit-logs
  - [ ] 권한 확인 (AUDIT_VIEW)
  - [ ] 필터링 (날짜, 관리자, 액션)
  - [ ] 정렬 및 페이지네이션

- [ ] GET /api/admin/audit-logs/export
  - [ ] 권한 확인 (AUDIT_EXPORT)
  - [ ] CSV 변환
  - [ ] 파일 다운로드

### UI 구현
- [ ] 설정 페이지
  - [ ] 카테고리 탭
  - [ ] 설정 폼 (타입별)
  - [ ] 저장 버튼
  - [ ] 캐시 초기화 버튼

- [ ] 변경 이력
  - [ ] 타임라인 뷰
  - [ ] 변경 내역 표시
  - [ ] 관리자 정보

- [ ] 감사 로그 페이지
  - [ ] 필터 UI
  - [ ] 로그 테이블
  - [ ] 상세 정보 모달
  - [ ] CSV 내보내기 버튼

---

## 🚀 예상 결과

### 완료 시
- ✅ 6개 API 엔드포인트
- ✅ 12개 UI 파일
- ✅ 2개 데이터베이스 모델
- ✅ 약 1,500줄 코드
- ✅ 완전한 설정 관리 시스템
- ✅ 완전한 감사 로그 시스템

### 전체 진행률
```
Phase 1-5: 완료      ████████████████░░ 85%
Phase 6: 설정/로그   ████████████████░░ +7%
전체                ██████████████████ 92%
```

---

## 📝 다음 단계

Phase 6 완료 후:
- Phase 7: 최종 테스트 및 배포 준비
  - E2E 테스트
  - 성능 최적화
  - 보안 점검
  - 문서 최종 정리
  - 배포 가이드

---

**예상 소요 시간**: 5-7시간

**시작 전 확인**:
1. 개발 서버 실행 중
2. 관리자 계정으로 로그인
3. 데이터베이스 백업
4. Phase 5까지 모두 완료

행운을 빕니다! 🚀

