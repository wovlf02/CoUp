# 관리자 기능 - 시스템 설정 상세 명세

> **작성일**: 2025-11-27  
> **영역**: System Settings  
> **우선순위**: P2 (선택)  
> **권한**: SYSTEM_ADMIN 전용

---

## 1. 기능 개요

### 핵심 기능
1. **시스템 전역 설정**: 제한 값, 기능 토글
2. **관리자 관리**: 관리자 임명/해임
3. **감사 로그**: 모든 관리자 활동 조회
4. **백업 및 복구**: 데이터베이스 백업

---

## 2. 시스템 전역 설정

### 2.1 설정 카테고리

```typescript
enum SettingCategory {
  USER = "USER",           // 사용자 관련
  STUDY = "STUDY",         // 스터디 관련
  FILE = "FILE",           // 파일 관련
  SECURITY = "SECURITY",   // 보안 관련
  NOTIFICATION = "NOTIFICATION", // 알림 관련
  FEATURE = "FEATURE"      // 기능 토글
}
```

### 2.2 설정 항목

```typescript
interface SystemSettings {
  // 사용자 제한
  MAX_STUDY_PER_USER: number;           // 최대 스터디 참여 수
  MAX_STUDY_CREATION_PER_DAY: number;   // 일일 스터디 생성 제한
  
  // 스터디 제한
  MAX_STUDY_MEMBERS: number;            // 스터디당 최대 멤버 수
  MAX_STUDY_NAME_LENGTH: number;        // 스터디 이름 최대 길이
  
  // 파일 제한
  MAX_FILE_SIZE: number;                // 최대 파일 크기 (bytes)
  ALLOWED_FILE_TYPES: string[];         // 허용 파일 형식
  MAX_FILE_PER_STUDY: number;           // 스터디당 최대 파일 수
  
  // 메시지 제한
  MAX_MESSAGE_LENGTH: number;           // 메시지 최대 길이
  MESSAGE_RATE_LIMIT: number;           // 분당 메시지 제한
  
  // 보안
  PASSWORD_MIN_LENGTH: number;
  PASSWORD_REQUIRE_SPECIAL_CHAR: boolean;
  LOGIN_MAX_ATTEMPTS: number;
  SESSION_TIMEOUT: number;              // 세션 타임아웃 (초)
  
  // 알림
  EMAIL_NOTIFICATION_ENABLED: boolean;
  PUSH_NOTIFICATION_ENABLED: boolean;
  MAX_NOTIFICATION_PER_DAY: number;
  
  // 신고
  AUTO_SUSPEND_THRESHOLD: number;       // 자동 정지 신고 횟수
  REPORT_COOLDOWN: number;              // 신고 쿨다운 (초)
  
  // 기능 토글
  FEATURE_STUDY_CREATION: boolean;
  FEATURE_VIDEO_CALL: boolean;
  FEATURE_FILE_UPLOAD: boolean;
  FEATURE_CHAT: boolean;
  FEATURE_USER_SIGNUP: boolean;
  MAINTENANCE_MODE: boolean;            // 점검 모드
}
```

### 2.3 설정 UI

```tsx
// components/admin/settings/SettingGroup.tsx
export function SettingGroup({ category, settings }) {
  return (
    <div className="setting-group">
      <h3>{getCategoryLabel(category)}</h3>
      
      {settings.map(setting => (
        <SettingItem
          key={setting.key}
          setting={setting}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}

// 설정 항목 타입별 렌더링
export function SettingItem({ setting, onUpdate }) {
  switch (setting.type) {
    case 'NUMBER':
      return (
        <NumberInput
          label={setting.key}
          value={setting.value}
          onChange={onUpdate}
          description={setting.description}
        />
      );
    
    case 'BOOLEAN':
      return (
        <Toggle
          label={setting.key}
          checked={setting.value}
          onChange={onUpdate}
          description={setting.description}
        />
      );
    
    case 'STRING':
      return (
        <TextInput
          label={setting.key}
          value={setting.value}
          onChange={onUpdate}
          description={setting.description}
        />
      );
    
    case 'JSON':
      return (
        <JsonEditor
          label={setting.key}
          value={setting.value}
          onChange={onUpdate}
          description={setting.description}
        />
      );
  }
}
```

---

## 3. 관리자 관리

### 3.1 관리자 목록

```
GET /api/admin/settings/admins

Response:
{
  data: [
    {
      id: "user_123",
      email: "admin@coup.com",
      name: "관리자1",
      role: "ADMIN",
      createdAt: "2025-10-01T00:00:00Z",
      lastLoginAt: "2025-11-27T10:00:00Z",
      actionsCount: 234
    }
  ]
}
```

### 3.2 관리자 임명

```
POST /api/admin/settings/admins

Request:
{
  userId: "user_456",
  role: "ADMIN",
  reason: "신뢰할 수 있는 활동 이력"
}

Response:
{
  success: true,
  data: {
    userId: "user_456",
    previousRole: "USER",
    newRole: "ADMIN"
  }
}
```

### 3.3 관리자 해임

```
DELETE /api/admin/settings/admins/:userId

Request:
{
  reason: "업무 종료"
}
```

---

## 4. 감사 로그

### 4.1 로그 조회

```
GET /api/admin/settings/logs?adminId=admin_123&action=USER_SUSPEND&page=1

Response:
{
  data: [
    {
      id: "log_123",
      adminId: "admin_123",
      adminName: "홍길동",
      action: "USER_SUSPEND",
      targetType: "User",
      targetId: "user_456",
      targetName: "피제재자",
      before: { status: "ACTIVE" },
      after: { status: "SUSPENDED" },
      reason: "반복적인 욕설",
      ipAddress: "123.456.789.000",
      createdAt: "2025-11-27T10:30:00Z"
    }
  ],
  pagination: { ... }
}
```

### 4.2 로그 필터

```tsx
// 필터 옵션
interface LogFilters {
  adminId?: string;         // 관리자 ID
  action?: AdminAction;     // 액션 유형
  targetType?: string;      // 대상 유형
  dateFrom?: string;        // 시작 날짜
  dateTo?: string;          // 종료 날짜
  keyword?: string;         // 검색어 (대상 이름, 사유)
}
```

### 4.3 로그 내보내기

```
GET /api/admin/settings/logs/export?format=csv&dateFrom=2025-11-01&dateTo=2025-11-30

Response: CSV 파일
```

---

## 5. 백업 및 복구

### 5.1 백업 생성

```
POST /api/admin/settings/backup

Response:
{
  success: true,
  data: {
    backupId: "backup_123",
    filename: "coup-backup-2025-11-27.sql.gz",
    size: 52428800,  // bytes
    createdAt: "2025-11-27T00:00:00Z"
  }
}
```

### 5.2 백업 목록

```
GET /api/admin/settings/backups

Response:
{
  data: [
    {
      id: "backup_123",
      filename: "coup-backup-2025-11-27.sql.gz",
      size: 52428800,
      createdAt: "2025-11-27T00:00:00Z"
    }
  ]
}
```

### 5.3 백업 복구

```
POST /api/admin/settings/backups/:backupId/restore

⚠️ 주의: 매우 위험한 작업
- 현재 데이터가 완전히 덮어씌워짐
- 복구 전 확인 모달 필수
- 2단계 인증 필요
```

---

## 6. 점검 모드

### 6.1 점검 모드 활성화

```
POST /api/admin/settings/maintenance

Request:
{
  enabled: true,
  message: "시스템 점검 중입니다. 2시간 후 정상화됩니다.",
  startTime: "2025-11-28T02:00:00Z",
  endTime: "2025-11-28T04:00:00Z"
}
```

### 6.2 점검 페이지

```tsx
// 점검 중일 때 표시되는 페이지
export default function MaintenancePage() {
  return (
    <div className="maintenance-page">
      <Icon name="tools" size="large" />
      <h1>시스템 점검 중</h1>
      <p>더 나은 서비스를 위해 시스템 점검을 진행하고 있습니다.</p>
      <p>예상 종료 시간: 2025-11-28 04:00</p>
    </div>
  );
}
```

---

## 7. API 명세

```http
# 시스템 설정
GET    /api/admin/settings
GET    /api/admin/settings/:key
PUT    /api/admin/settings/:key

# 관리자 관리
GET    /api/admin/settings/admins
POST   /api/admin/settings/admins
DELETE /api/admin/settings/admins/:userId

# 감사 로그
GET    /api/admin/settings/logs
GET    /api/admin/settings/logs/export

# 백업
GET    /api/admin/settings/backups
POST   /api/admin/settings/backup
POST   /api/admin/settings/backups/:id/restore
DELETE /api/admin/settings/backups/:id

# 점검 모드
POST   /api/admin/settings/maintenance
```

---

**작성 완료**: 2025-11-27
# 관리자 기능 - 콘텐츠 모더레이션 상세 명세

> **작성일**: 2025-11-27  
> **영역**: Content Moderation  
> **우선순위**: P1 (중요)

---

## 1. 기능 개요

### 핵심 기능
1. **메시지 모더레이션**: 부적절한 메시지 탐지 및 삭제
2. **파일 모더레이션**: 저작권 침해, 악성 파일 관리
3. **자동 필터**: 욕설, 스팸 자동 감지
4. **AI 모더레이션**: OpenAI Moderation API 활용

---

## 2. 메시지 모더레이션

### 2.1 신고된 메시지 목록

```
GET /api/admin/moderation/messages?reported=true

Response:
{
  data: [
    {
      id: "msg_123",
      content: "욕설이 포함된 메시지...",
      author: { id: "user_123", name: "홍길동" },
      study: { id: "study_123", name: "자바 스터디" },
      reportCount: 3,
      reports: [...]
    }
  ]
}
```

### 2.2 자동 필터 키워드 관리

```tsx
// 욕설 사전
const profanityList = [
  { word: '욕설1', severity: 'HIGH', action: 'DELETE' },
  { word: '비속어1', severity: 'MEDIUM', action: 'WARN' },
];

// 자동 처리
function autoModerateMessage(message: string) {
  for (const profanity of profanityList) {
    if (message.includes(profanity.word)) {
      if (profanity.action === 'DELETE') {
        deleteMessage();
        warnUser();
      }
    }
  }
}
```

---

## 3. 파일 모더레이션

### 3.1 저작권 침해 파일

```
POST /api/admin/moderation/files/:fileId/copyright-claim

Request:
{
  reason: "DMCA 신고 접수",
  evidence: "저작권자 증빙 자료",
  claimant: "저작권자 정보"
}
```

### 3.2 악성 파일 스캔

```tsx
// VirusTotal API 통합
async function scanFile(fileUrl: string) {
  const response = await fetch('https://www.virustotal.com/api/v3/files', {
    method: 'POST',
    headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY },
    body: fileUrl
  });
  
  const result = await response.json();
  
  if (result.data.attributes.last_analysis_stats.malicious > 0) {
    // 악성 파일 감지
    await deleteFile(fileUrl);
    await notifyUploader();
  }
}
```

---

## 4. AI 모더레이션

### 4.1 OpenAI Moderation API

```tsx
import OpenAI from 'openai';

async function moderateContentWithAI(content: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const moderation = await openai.moderations.create({
    input: content
  });
  
  const result = moderation.results[0];
  
  if (result.flagged) {
    const categories = result.categories;
    
    if (categories.sexual || categories.violence) {
      return { action: 'DELETE', reason: 'AI detected inappropriate content' };
    } else if (categories.hate || categories.harassment) {
      return { action: 'REVIEW', reason: 'AI detected potential violation' };
    }
  }
  
  return { action: 'APPROVE', reason: 'AI approved' };
}
```

---

## 5. API 명세

```http
# 메시지 모더레이션
GET    /api/admin/moderation/messages
DELETE /api/admin/moderation/messages/:id

# 파일 모더레이션
GET    /api/admin/moderation/files
DELETE /api/admin/moderation/files/:id
POST   /api/admin/moderation/files/:id/copyright-claim

# 자동 필터 설정
GET    /api/admin/moderation/filters
POST   /api/admin/moderation/filters
PUT    /api/admin/moderation/filters/:id
DELETE /api/admin/moderation/filters/:id
```

---

**작성 완료**: 2025-11-27

