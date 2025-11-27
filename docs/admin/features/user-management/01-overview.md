# 사용자 관리 - 기능 개요

> **파일**: 01-overview.md  
> **분량**: ~900줄

---

## 1. 기능 개요

### 1.1 목적
관리자가 플랫폼의 모든 사용자를 효과적으로 관리하고, 부적절한 행동에 대해 적절한 제재를 가할 수 있도록 합니다.

### 1.2 핵심 기능
1. **사용자 조회**: 검색, 필터링, 정렬
2. **계정 관리**: 정지, 해제, 삭제
3. **제재 시스템**: 3-Strike 자동 제재
4. **기능 제한**: 특정 기능만 차단
5. **일괄 작업**: 다중 사용자 동시 처리
6. **알림 발송**: 이메일/인앱 알림

---

## 2. 역할 및 권한

### 2.1 역할 정의

```typescript
enum UserRole {
  USER = 'USER',                    // 일반 사용자
  ADMIN = 'ADMIN',                  // 관리자
  SYSTEM_ADMIN = 'SYSTEM_ADMIN'     // 시스템 관리자
}
```

### 2.2 권한 매트릭스

| 기능 | USER | ADMIN | SYSTEM_ADMIN |
|------|------|-------|--------------|
| 사용자 목록 조회 | ❌ | ✅ | ✅ |
| 사용자 상세 조회 | ❌ | ✅ | ✅ |
| 계정 정지 | ❌ | ✅ | ✅ |
| 계정 영구 삭제 | ❌ | ❌ | ✅ |
| 역할 변경 | ❌ | ❌ | ✅ |
| 관리자 임명 | ❌ | ❌ | ✅ |

---

## 3. 데이터 모델

### 3.1 User 모델 (기존)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  avatar    String?
  role      UserRole @default(USER)
  status    UserStatus @default(ACTIVE)
  
  // 제재 관련
  suspendedUntil DateTime?
  suspendReason  String?
  
  // 통계
  lastLoginAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // 관계
  sanctions          Sanction[]
  functionRestrictions FunctionRestriction[]
  studyMembers       StudyMember[]
  sentMessages       Message[]
  
  @@index([email])
  @@index([status, role, createdAt])
  @@index([lastLoginAt])
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

### 3.2 Sanction 모델 (신규)

```prisma
model Sanction {
  id        String   @id @default(cuid())
  
  // 대상 사용자
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  // 제재 정보
  type      SanctionType
  reason    String   @db.Text
  duration  String?  // "3일", "7일", "영구" 등
  
  // 관리자 정보
  adminId   String
  adminName String
  
  // 상태
  isActive  Boolean  @default(true)
  startedAt DateTime @default(now())
  endsAt    DateTime?
  
  // 해제 정보
  unsuspendedAt     DateTime?
  unsuspendReason   String?
  unsuspendedBy     String?
  
  createdAt DateTime @default(now())
  
  @@index([userId, createdAt])
  @@index([type, isActive])
}

enum SanctionType {
  WARNING       // 경고
  SUSPEND       // 정지
  PERMANENT_BAN // 영구 차단
}
```

### 3.3 FunctionRestriction 모델 (신규)

```prisma
model FunctionRestriction {
  id         String   @id @default(cuid())
  
  // 대상 사용자
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  
  // 제한 정보
  function   RestrictedFunction
  reason     String   @db.Text
  
  // 기간
  startedAt  DateTime @default(now())
  endsAt     DateTime?
  
  // 관리자
  adminId    String
  adminName  String
  
  createdAt  DateTime @default(now())
  
  @@index([userId, function])
}

enum RestrictedFunction {
  STUDY_CREATION  // 스터디 생성
  MESSAGE_SEND    // 메시지 발송
  FILE_UPLOAD     // 파일 업로드
  COMMENT_WRITE   // 댓글 작성
}
```

---

## 4. 사용자 상태

### 4.1 상태 전이도

```
ACTIVE (활성)
    ↓ [정지]
SUSPENDED (정지)
    ↓ [해제]
ACTIVE
    ↓ [영구 차단]
DELETED (삭제됨)
```

### 4.2 상태별 설명

#### ACTIVE
- 정상적으로 모든 기능 사용 가능
- 로그인 가능
- 스터디 참여/생성 가능

#### SUSPENDED
- 로그인 불가
- 기존 스터디에서 자동 퇴출
- 정지 기간 종료 시 자동 ACTIVE 전환

#### DELETED
- 완전히 삭제된 상태 (SYSTEM_ADMIN만 실행 가능)
- 복구 불가
- 모든 데이터 익명화

---

## 5. 검색 및 필터

### 5.1 검색 옵션

```typescript
interface UserSearchParams {
  // 검색어
  q?: string;              // 이메일, 이름 검색
  
  // 필터
  role?: UserRole;
  status?: UserStatus;
  
  // 날짜 범위
  createdFrom?: string;    // 가입일 시작
  createdTo?: string;      // 가입일 종료
  lastLoginFrom?: string;  // 마지막 로그인 시작
  lastLoginTo?: string;    // 마지막 로그인 종료
  
  // 정렬
  sortBy?: 'createdAt' | 'lastLoginAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  
  // 페이지네이션
  page?: number;
  limit?: number;
}
```

### 5.2 검색 예시

```
# 이메일로 검색
GET /api/admin/users?q=hong@coup.com

# 정지된 사용자만
GET /api/admin/users?status=SUSPENDED

# 최근 로그인 순
GET /api/admin/users?sortBy=lastLoginAt&sortOrder=desc

# 복합 조건
GET /api/admin/users?role=USER&status=ACTIVE&sortBy=createdAt&page=2
```

---

## 6. 통계 정보

### 6.1 사용자별 통계

```typescript
interface UserStats {
  // 참여 현황
  studyCount: number;           // 참여 중인 스터디 수
  ownedStudyCount: number;      // 소유한 스터디 수
  
  // 활동 통계
  messageCount: number;         // 총 메시지 수
  fileUploadCount: number;      // 업로드한 파일 수
  taskCompleteCount: number;    // 완료한 할일 수
  
  // 제재 이력
  warningCount: number;         // 경고 횟수
  suspensionCount: number;      // 정지 횟수
  
  // 신고 이력
  reportedCount: number;        // 신고당한 횟수
  reportCount: number;          // 신고한 횟수
  
  // 품질 지표
  attendanceRate: number;       // 출석률 (%)
  averageRating: number;        // 평균 평점
}
```

---

## 7. 제재 이력 조회

### 7.1 제재 이력 데이터

```typescript
interface SanctionHistory {
  sanctions: Sanction[];
  summary: {
    totalWarnings: number;
    totalSuspensions: number;
    currentStatus: 'NONE' | 'SUSPENDED' | 'BANNED';
    nextSanctionLevel: string;  // "7일 정지" 등
  };
}
```

### 7.2 제재 타임라인

```
2025-11-27 10:00 | ⚠️ 경고 | 부적절한 언어 사용
2025-11-20 15:30 | 🔴 3일 정지 | 스팸 메시지 발송
2025-11-15 09:00 | ⚠️ 경고 | 욕설 사용
```

---

## 8. 관리자 액션 기록

모든 관리자 액션은 자동으로 `AdminLog`에 기록됩니다.

```typescript
// 자동 로깅
await logAdminAction({
  adminId: session.user.id,
  action: 'USER_SUSPEND',
  targetType: 'User',
  targetId: userId,
  before: { status: 'ACTIVE' },
  after: { status: 'SUSPENDED', suspendedUntil: '2025-12-04' },
  reason: '반복적인 욕설 사용'
});
```

---

## 9. 권한 체크

### 9.1 미들웨어

```typescript
// lib/adminAuth.ts
export async function requireAdmin() {
  const session = await getServerSession();
  
  if (!session || !['ADMIN', 'SYSTEM_ADMIN'].includes(session.user.role)) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

export async function requireSystemAdmin() {
  const session = await getServerSession();
  
  if (!session || session.user.role !== 'SYSTEM_ADMIN') {
    throw new Error('Unauthorized');
  }
  
  return session;
}
```

### 9.2 API에서 사용

```typescript
// app/api/admin/users/[userId]/route.ts
export async function DELETE(request, { params }) {
  // SYSTEM_ADMIN만 사용자 영구 삭제 가능
  await requireSystemAdmin();
  
  await prisma.user.delete({
    where: { id: params.userId }
  });
  
  return NextResponse.json({ success: true });
}
```

---

## 10. 성능 고려사항

### 10.1 인덱스

```prisma
@@index([email])                    // 이메일 검색
@@index([status, role, createdAt])  // 필터링 + 정렬
@@index([lastLoginAt])              // 최근 로그인 정렬
```

### 10.2 캐싱

```typescript
// Redis 캐싱 (5분)
const cacheKey = `user:${userId}:detail`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const user = await fetchUserDetail(userId);
await redis.setex(cacheKey, 300, JSON.stringify(user));

return user;
```

---

**다음 문서**: [02-list-api.md](02-list-api.md) - 사용자 목록 조회 API

**작성일**: 2025-11-27
# 사용자 관리 - 목차 및 개요

> **영역**: User Management  
> **문서 구조**: 9개 하위 문서로 분할

---

## 📚 문서 구조

이 문서는 **사용자 관리 기능**을 다음 9개 파일로 분할했습니다:

```
features/user-management/
├── 00-index.md                  # 👈 현재 문서 (목차)
├── 01-overview.md               # 기능 개요
├── 02-list-api.md               # 사용자 목록 조회 API
├── 03-detail-api.md             # 사용자 상세 조회 API
├── 04-suspend-api.md            # 계정 정지 API
├── 05-sanction-system.md        # 제재 시스템 (3-Strike)
├── 06-function-restriction.md   # 기능 제한 시스템
├── 07-bulk-operations.md        # 일괄 작업
└── 08-notifications.md          # 알림 시스템
```

---

## 🎯 빠른 참조

### 핵심 API 엔드포인트
```
GET    /api/admin/users              # 목록 (02번 문서)
GET    /api/admin/users/:id          # 상세 (03번 문서)
POST   /api/admin/users/:id/suspend  # 정지 (04번 문서)
POST   /api/admin/users/:id/unsuspend
POST   /api/admin/users/:id/warn
POST   /api/admin/users/:id/restrict # 기능 제한 (06번 문서)
POST   /api/admin/users/bulk-suspend # 일괄 정지 (07번 문서)
```

### 제재 단계 (05번 문서)
```
1차 위반: 경고 (WARNING)
2차 위반: 3일 정지
3차 위반: 7일 정지
4차 위반: 30일 정지
5차 위반: 영구 차단
```

### 기능 제한 옵션 (06번 문서)
- STUDY_CREATION: 스터디 생성 제한
- MESSAGE_SEND: 메시지 발송 제한
- FILE_UPLOAD: 파일 업로드 제한
- COMMENT_WRITE: 댓글 작성 제한

---

## 📖 각 문서 요약

### 01-overview.md
- 사용자 관리 기능 전체 개요
- 역할 및 권한 매트릭스
- 데이터 모델

### 02-list-api.md
- 사용자 목록 조회 API
- 검색 및 필터링
- 페이지네이션
- 정렬 옵션

### 03-detail-api.md
- 사용자 상세 정보 조회
- 활동 통계
- 제재 이력
- 신고 이력

### 04-suspend-api.md
- 계정 정지 API
- 정지 해제 API
- 정지 기간 계산
- 이메일 알림

### 05-sanction-system.md
- 3-Strike 제재 시스템
- 제재 단계별 처리
- 자동 제재 로직
- 제재 이력 관리

### 06-function-restriction.md
- 기능별 제한 시스템
- 제한 설정/해제 API
- 제한 검증 미들웨어

### 07-bulk-operations.md
- 일괄 정지
- 일괄 메시지 발송
- CSV 내보내기/가져오기

### 08-notifications.md
- 이메일 알림
- 인앱 알림
- 알림 템플릿

---

## 🚀 시작하기

1. **기능 이해**: `01-overview.md`부터 읽기
2. **API 구현**: `02~04번` 문서 참고
3. **제재 시스템**: `05~06번` 문서 참고
4. **고급 기능**: `07~08번` 문서 참고

---

**작성일**: 2025-11-27  
**최종 업데이트**: 2025-11-27

