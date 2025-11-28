# 감사 로그 완전 명세

> 모든 관리자 활동을 추적하고 기록하는 감사 로그 시스템 최종 명세

## 개요

관리자의 모든 활동을 기록하여 보안, 규정 준수, 문제 해결을 지원합니다.

## 데이터 모델

```prisma
model AdminLog {
  id         String      @id @default(cuid())
  adminId    String
  action     AdminAction
  targetType String?
  targetId   String?
  
  // 변경 내용
  before     Json?
  after      Json?
  reason     String?
  
  // 메타 정보
  ipAddress  String?
  userAgent  String?
  
  createdAt DateTime @default(now())
  
  admin User @relation(fields: [adminId], references: [id])
  
  @@index([adminId, createdAt])
  @@index([action, createdAt])
  @@index([targetType, targetId])
}
```

## 로깅 대상 액션

### 사용자 관리
- USER_VIEW, USER_SEARCH
- USER_WARN, USER_SUSPEND, USER_UNSUSPEND
- USER_DELETE, USER_RESTORE

### 스터디 관리
- STUDY_HIDE, STUDY_CLOSE, STUDY_DELETE
- STUDY_RECOMMEND, CONTENT_DELETE

### 신고 처리
- REPORT_VIEW, REPORT_ASSIGN
- REPORT_RESOLVE, REPORT_REJECT

### 시스템 설정
- SETTINGS_VIEW, SETTINGS_UPDATE

## API

```typescript
GET /api/admin/logs
Query: {
  adminId?: string,
  action?: AdminAction,
  targetType?: string,
  targetId?: string,
  dateFrom?: string,
  dateTo?: string
}
```

## 로그 보존

- 기본: 2년
- 중요 액션: 5년
- 법적 요구: 무기한

## UI

- 시간순 타임라인
- 관리자별 필터
- 액션별 필터
- 상세 검색
- CSV 내보내기

