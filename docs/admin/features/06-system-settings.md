# 관리자 기능 - 06: 시스템 설정 및 감사 로그

> **파일**: 06-system-settings.md
> **권한**: `SYSTEM_ADMIN`
> **상태**: 작성 중

---

## 1. 개요

시스템 설정 및 감사 로그 기능은 CoUp 플랫폼의 운영 정책을 제어하고, 모든 관리 활동의 투명성을 보장하는 최상위 관리 기능입니다. 이 기능들은 서비스에 미치는 영향이 매우 크므로, 오직 **`SYSTEM_ADMIN`** 등급의 관리자만 접근하고 수정할 수 있습니다.

### 주요 기능
- **시스템 설정**: 플랫폼의 전역적인 동작(예: 신규 가입 허용 여부, 파일 업로드 용량)을 관리자 UI를 통해 제어합니다.
- **관리자 관리**: 다른 관리자(`ADMIN`, `SYSTEM_ADMIN`)를 임명하거나 해임합니다.
- **감사 로그**: 모든 관리자가 수행한 주요 액션(예: 사용자 정지, 스터디 삭제)의 기록을 조회하고 검색합니다.
- **점검 모드**: 긴급한 서버 점검이나 배포 시, 일반 사용자의 서비스 접근을 일시적으로 차단합니다.
- **데이터 백업**: 데이터베이스의 전체 백업을 생성하고 다운로드합니다.

---

## 2. 시스템 설정

### 2.1 기능 명세
- **UI**: `app/admin/settings/page.tsx`
- **기능**:
  - **사용자 설정**: 신규 사용자 가입 허용 여부, 기본 역할 등
  - **스터디 설정**: 스터디 최대 생성 개수, 최대 멤버 수 등
  - **파일 설정**: 개인당 총 업로드 용량, 1회 업로드 파일 크기 제한 등
  - **보안 설정**: 관리자 세션 타임아웃 시간, 2FA 강제 여부 등
  - **기능 토글(Feature Toggles)**: 새로 개발 중인 기능을 특정 사용자 그룹에게만 점진적으로 공개할 때 사용합니다.

### 2.2 데이터 모델
설정 항목을 유연하게 추가/삭제할 수 있도록 Key-Value 형태의 `SystemSetting` 모델을 사용합니다.

```prisma
model SystemSetting {
  id          String @id // 예: "signup.allowNewUsers"
  value       Json   // 예: {"enabled": true}
  description String?
  
  updatedAt   DateTime @updatedAt
}
```

### 2.3 API 명세
```http
# 모든 설정 조회
GET /api/admin/settings

# 특정 설정 업데이트
PUT /api/admin/settings/{settingId}
```
- **캐싱**: 시스템 설정은 자주 바뀌지 않으므로, 조회 API 결과는 Redis에 장기간(예: 10분 이상) 캐싱하여 DB 부하를 줄이는 것이 매우 효과적입니다. 설정이 업데이트될 때마다 관련 캐시는 반드시 무효화해야 합니다.

---

## 3. 관리자 관리

### 3.1 기능 명세
- **UI**: `app/admin/settings/admins/page.tsx`
- **기능**:
  - 현재 시스템에 등록된 모든 관리자(ADMIN, SYSTEM_ADMIN) 목록을 조회합니다.
  - 특정 일반 사용자를 검색하여 `ADMIN` 또는 `SYSTEM_ADMIN`으로 임명합니다.
  - 기존 관리자를 일반 사용자로 강등하거나, 역할을 변경합니다.

### 3.2 API 명세
```http
# 관리자 목록 조회
GET /api/admin/settings/admins

# 관리자 임명 (역할 변경)
POST /api/admin/settings/admins
# Request Body: { "userId": "...", "newRole": "ADMIN" }

# 관리자 해임
DELETE /api/admin/settings/admins/{userId}
```

---

## 4. 감사 로그 (Audit Log)

### 4.1 기능 명세
- **UI**: `app/admin/settings/logs/page.tsx`
- **기능**:
  - 모든 관리자가 수행한 주요 액션의 로그를 시간순으로 조회합니다.
  - **필터**: 특정 관리자, 특정 액션 유형(예: `USER_SUSPEND`), 특정 기간 등으로 로그를 필터링합니다.
  - **검색**: 대상 사용자 이름, 처리 사유 등 텍스트 기반으로 로그를 검색합니다.
  - **상세 조회**: 각 로그 항목 클릭 시, 변경 전(`before`)과 변경 후(`after`)의 데이터를 비교하여 보여주는 모달을 표시합니다.

### 4.2 데이터 모델
모든 관리자 활동을 기록하기 위한 `AdminLog` 모델을 사용합니다.

```prisma
model AdminLog {
  id         String      @id @default(cuid())
  adminId    String      // 액션을 수행한 관리자 ID
  adminName  String
  action     AdminAction // 액션 유형 (Enum)
  
  targetType String?     // 대상의 타입 (User, Study 등)
  targetId   String?
  targetName String?
  
  before     Json?       // 변경 전 데이터
  after      Json?       // 변경 후 데이터
  reason     String?     @db.Text
  
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime    @default(now())
  
  @@index([adminId, createdAt])
  @@index([action, createdAt])
  @@index([targetType, targetId])
}

enum AdminAction {
  USER_SUSPEND
  USER_DELETE
  STUDY_DELETE
  STUDY_FEATURED
  // ... 모든 주요 액션
}
```

### 4.3 API 명세
```http
# 감사 로그 조회
GET /api/admin/settings/logs?adminId=...&action=...
```

---

## 5. 점검 모드 및 데이터 백업

### 5.1 점검 모드
- **트리거**: 시스템 설정에서 '점검 모드'를 활성화합니다.
- **동작**:
  - `middleware.js`에서 점검 모드 여부를 확인합니다.
  - 점검 모드가 활성화된 경우, 관리자가 아니면 모든 페이지 요청을 `/maintenance` 페이지로 리디렉션합니다.
  - `/maintenance` 페이지에는 점검 안내 메시지와 예상 종료 시간 등을 표시합니다.

### 5.2 데이터 백업
- **UI**: `app/admin/settings/backup/page.tsx`
- **기능**:
  - '백업 생성' 버튼 클릭 시, 데이터베이스의 전체 덤프(dump) 파일을 생성합니다.
  - 생성된 백업 파일 목록을 보여주고, 다운로드할 수 있도록 합니다.
- **구현**:
  - `POST /api/admin/settings/backup` API는 `child_process`를 사용하여 `pg_dump` 또는 `mysqldump` 명령어를 실행합니다.
  - 생성된 백업 파일은 보안이 확보된 별도의 스토리지(예: Private S3 Bucket)에 저장하는 것이 안전합니다.

---

**이전**: [05-analytics.md](05-analytics.md)

**작성일**: 2025-11-28