# 사용자 관리 - 3-Strike 자동 제재 시스템

> **파일**: 05-sanction-system.md  
> **분량**: ~900줄

---

## 1. 3-Strike 제재 시스템 개요

3-Strike 제재 시스템은 사용자의 반복적인 규정 위반에 대해 점진적으로 가중된 제재를 부과하는 자동화된 정책입니다. 이 시스템의 목표는 사용자에게 개선의 기회를 제공하는 동시에, 커뮤니티를 상습적 위반자로부터 보호하는 것입니다.

CoUp의 3-Strike 정책은 다음과 같은 단계로 구성됩니다.

1.  **Strike 1 (경고)**: 첫 번째 위반 시, 사용자에게 공식적인 경고가 발송됩니다.
2.  **Strike 2 (단기 정지)**: 두 번째 위반 시, 7일간 계정이 정지됩니다.
3.  **Strike 3 (장기 정지)**: 세 번째 위반 시, 30일간 계정이 정지됩니다.
4.  **Strike 4 (영구 정지)**: 네 번째 위반 시, 계정이 영구적으로 정지됩니다.

이 로직은 신고 처리 승인 시 또는 관리자가 수동으로 제재를 가할 때 `determineSanctionLevel` 함수를 통해 자동으로 트리거됩니다.

---

## 2. 시스템 설계

### 2.1 데이터 모델

제재 이력을 관리하기 위해 `Sanction` 모델과 사용자의 제재 횟수를 추적하기 위한 `User` 모델 필드를 사용합니다.

**`prisma/schema.prisma`**
```prisma
model User {
  // ...
  warningCount    Int        @default(0)
  suspensionCount Int        @default(0)
  sanctions       Sanction[]
}

model Sanction {
  id        String       @id @default(cuid())
  userId    String
  user      User         @relation(fields: [userId], references: [id])
  
  type      SanctionType // WARN, SUSPEND, BAN
  reason    String       @db.Text
  duration  String?      // "7d", "30d", "permanent"
  
  adminId   String
  adminName String
  createdAt DateTime     @default(now())

  @@index([userId, createdAt])
}

enum SanctionType {
  WARN
  SUSPEND
  BAN
}
```

### 2.2 상태 전이도

사용자의 제재 상태는 위반 횟수에 따라 다음과 같이 변화합니다.

```
+-----------+     +----------------+     +------------------+     +-----------------+
|   ACTIVE  | --> | STRIKE 1: WARN | --> | STRIKE 2: 7D BAN | --> | STRIKE 3: 30D BAN | --> | STRIKE 4: PERMANENT BAN |
+-----------+     +----------------+     +------------------+     +-----------------+
      |                                                                 ^
      |_________________________________________________________________|
                (After 30-day suspension period ends)
```

### 2.3 핵심 알고리즘: `determineSanctionLevel`

이 함수는 사용자의 현재 위반 횟수를 기반으로 다음에 적용할 제재 수위를 결정합니다.

**`lib/admin/autoSanction.ts`**
```typescript
interface SanctionDecision {
  type: 'WARN' | 'SUSPEND' | 'BAN';
  duration?: '7d' | '30d' | 'permanent';
  reason: string;
}

export async function determineSanctionLevel(
  userId: string,
  violationReason: string
): Promise<SanctionDecision> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { suspensionCount: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const { suspensionCount } = user;
  let decision: SanctionDecision;

  switch (suspensionCount) {
    case 0: // 첫 번째 정지 -> 경고 (또는 7일 정지 정책에 따라)
      decision = { type: 'SUSPEND', duration: '7d', reason: `Strike 1: ${violationReason}` };
      break;
    case 1: // 두 번째 정지 -> 30일 정지
      decision = { type: 'SUSPEND', duration: '30d', reason: `Strike 2: ${violationReason}` };
      break;
    default: // 세 번째 이상 정지 -> 영구 정지
      decision = { type: 'BAN', duration: 'permanent', reason: `Strike 3+: ${violationReason}` };
      break;
  }
  
  // 만약 첫 위반은 경고로 처리하고 싶다면 로직 수정
  // const { warningCount, suspensionCount } = user;
  // if (warningCount === 0) {
  //   decision = { type: 'WARN', reason: `Strike 1: ${violationReason}` };
  // } else if (suspensionCount === 0) {
  // ...
  // }

  return decision;
}
```

---

## 3. 구현 예시

### 3.1 Server-side: 신고 처리 시 자동 제재 적용

신고 처리 API에서 신고가 '승인'되면 `determineSanctionLevel`을 호출하여 제재를 자동으로 실행합니다.

**`app/api/admin/reports/[reportId]/process/route.ts`**
```typescript
import { determineSanctionLevel } from '@/lib/admin/autoSanction';
import { executeSanction } from '@/lib/admin/executeSanction';

// ... (API 기본 구조)

export async function POST(request: Request, { params }) {
  // ... (권한 체크 및 신고 정보 로드)
  const report = await prisma.report.findUnique({ where: { id: params.reportId } });
  const { action, resolution } = await request.json();

  if (action === 'approve') {
    // 1. 제재 수위 결정
    const sanctionDecision = await determineSanctionLevel(
      report.targetId,
      resolution
    );

    // 2. 제재 실행
    await executeSanction(report.targetId, session.user.id, sanctionDecision);

    // 3. 신고 상태 업데이트
    await prisma.report.update({
      // ...
    });
    
    // 4. 감사 로그
    await logAdminAction({
      action: 'REPORT_PROCESS_APPROVE',
      // ...
    });
  }
  
  // ...
}
```

**`lib/admin/executeSanction.ts`**
```typescript
import prisma from '@/lib/prisma';
import { logAdminAction } from '@/lib/admin/auditLog';

export async function executeSanction(
  userId: string,
  adminId: string,
  decision: SanctionDecision
) {
  const admin = await prisma.user.findUnique({where: {id: adminId}});

  // 1. 제재 이력 저장
  await prisma.sanction.create({
    data: {
      userId,
      type: decision.type,
      reason: decision.reason,
      duration: decision.duration,
      adminId,
      adminName: admin.name,
    },
  });

  // 2. 사용자 정보 업데이트
  let userUpdateData: any = {};
  if (decision.type === 'WARN') {
    userUpdateData.warningCount = { increment: 1 };
  } else if (decision.type === 'SUSPEND' || decision.type === 'BAN') {
    userUpdateData.suspensionCount = { increment: 1 };
    userUpdateData.status = decision.type === 'BAN' ? 'DELETED' : 'SUSPENDED';
    if(decision.duration !== 'permanent') {
        const suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + parseInt(decision.duration));
        userUpdateData.suspendedUntil = suspendedUntil;
    } else {
        userUpdateData.suspendedUntil = null;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: userUpdateData,
  });

  // 3. 감사 로그
  await logAdminAction({
    adminId,
    action: `AUTO_SANCTION_${decision.type}`,
    targetId: userId,
    reason: decision.reason,
  });

  // 4. 이메일 알림 (생략)
}
```

### 3.2 Client-side: 신고 처리 UI

신고 처리 모달에서는 관리자가 '승인' 버튼을 누르면 서버에서 이 모든 로직이 자동으로 처리됩니다. 클라이언트에서는 특별한 로직이 필요 없습니다.

---

## 4. 제재 에스컬레이션 및 관리

- **제재 이력 조회**: 사용자 상세 페이지에서 해당 사용자의 모든 제재 이력(`Sanction` 모델)을 시간순으로 조회할 수 있어야 합니다.
- **수동 개입**: 시스템 관리자는 자동 제재 결과를 수정하거나, 특정 사용자를 3-Strike 정책에서 제외할 수 있는 예외 처리 기능이 필요할 수 있습니다. (별도 구현)
- **정책 투명성**: 사용자가 자신의 현재 위반 횟수(Strike)를 인지할 수 있도록 '내 정보' 페이지 등에 표시하는 것을 고려할 수 있습니다.

---

## 5. 테스트 시나리오

### 5.1 통합 테스트 (Vitest)

`determineSanctionLevel`과 `executeSanction`의 연동을 테스트합니다.

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { determineSanctionLevel } from '@/lib/admin/autoSanction';
import { executeSanction } from '@/lib/admin/executeSanction';

// prisma 모의(mock) 설정
vi.mock('@/lib/prisma', () => {
  // ... prisma 클라이언트 모의 구현
});

describe('3-Strike Sanction System', () => {

  beforeEach(() => {
    // 각 테스트 전 DB 상태 초기화
  });

  it('should apply 7-day suspension for the first sanction', async () => {
    const userId = 'test-user-1';
    // Mock user with 0 suspensions
    prisma.user.findUnique.mockResolvedValue({ id: userId, suspensionCount: 0 });

    const decision = await determineSanctionLevel(userId, 'Spamming');
    expect(decision.type).toBe('SUSPEND');
    expect(decision.duration).toBe('7d');

    await executeSanction(userId, 'admin-1', decision);
    
    // DB에서 사용자가 실제로 7일 정지되었는지 확인
    const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
    expect(updatedUser.status).toBe('SUSPENDED');
    expect(updatedUser.suspensionCount).toBe(1);
  });
  
  it('should apply 30-day suspension for the second sanction', async () => {
    // ...
  });

  it('should apply permanent ban for the third sanction', async () => {
    // ...
  });
});
```

---

**이전**: [04-suspend-api.md](04-suspend-api.md)  
**다음**: [06-function-restriction.md](06-function-restriction.md)

**작성일**: 2025-11-28
