# 시스템 설정 완전 명세

> CoUp 플랫폼의 시스템 설정 관리 최종 명세

## 개요

SUPER_ADMIN만 접근 가능한 시스템 전역 설정을 관리하는 기능입니다.

## 설정 카테고리

### 1. 서비스 설정
```typescript
{
  'service.status': 'OPERATIONAL' | 'MAINTENANCE' | 'READONLY',
  'service.signupEnabled': boolean,
  'service.studyCreationEnabled': boolean,
  'service.socialLoginEnabled': boolean
}
```

### 2. 제한 설정
```typescript
{
  'limits.maxStudiesPerUser': number,
  'limits.maxMembersPerStudy': number,
  'limits.maxFileSize': number,  // MB
  'limits.maxStoragePerStudy': number,  // MB
  'limits.messageRateLimit': { count: number, window: number }
}
```

### 3. 보안 설정
```typescript
{
  'security.require2FA': boolean,
  'security.sessionTimeout': number,  // 분
  'security.ipWhitelist': string[],
  'security.passwordMinLength': number
}
```

### 4. 이메일 설정
```typescript
{
  'email.enabled': boolean,
  'email.provider': 'sendgrid' | 'ses' | 'smtp',
  'email.fromAddress': string,
  'email.replyToAddress': string
}
```

## 데이터 모델

```prisma
model SystemSetting {
  id          String      @id @default(cuid())
  key         String      @unique
  value       String      @db.Text
  type        SettingType @default(STRING)
  description String?
  
  updatedAt DateTime @updatedAt
  updatedBy String?
  
  @@index([key])
}

enum SettingType {
  STRING
  NUMBER
  BOOLEAN
  JSON
}
```

## API

```typescript
GET /api/admin/settings
PATCH /api/admin/settings/:key
```

## UI

- 카테고리별 탭
- 설정 검색
- 변경 이력 조회
- 일괄 수정

