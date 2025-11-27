# 사용자 관리 - 기능 제한 시스템

> **파일**: 06-function-restriction.md  
> **분량**: ~800줄

---

## 1. 기능 제한 시스템 개요

기능 제한 시스템은 사용자 계정을 완전히 정지시키지 않으면서 특정 기능의 사용만을 막는 유연한 제재 조치입니다. 예를 들어, 스팸 메시지를 반복적으로 보내는 사용자에게는 '메시지 작성' 기능만 제한하고, 다른 활동(예: 스터디 참여, 게시글 읽기)은 허용할 수 있습니다.

이 시스템은 경고나 단기 정지보다 가벼운 제재가 필요할 때, 또는 특정 기능의 악용을 방지하기 위해 사용됩니다.

- **제한 가능한 기능**: 메시지 작성, 파일 업로드, 스터디 생성 등
- **검증**: 기능 제한 여부는 각 기능에 대한 API 요청을 처리하는 미들웨어나 개별 API 핸들러에서 체크합니다.
- **관리**: 관리자는 사용자 상세 페이지에서 특정 사용자의 기능 제한을 추가하거나 해제할 수 있습니다.

---

## 2. 시스템 설계

### 2.1 데이터 모델

어떤 사용자가 어떤 기능을 제한받고 있는지 기록하기 위해 `FunctionRestriction` 모델을 사용합니다.

**`prisma/schema.prisma`**
```prisma
model User {
  // ...
  restrictedFunctions FunctionRestriction[]
}

// 어떤 기능이 제한되었는지 나타내는 Enum
enum RestrictedFunction {
  CREATE_STUDY
  JOIN_STUDY
  SEND_MESSAGE
  UPLOAD_FILE
  CREATE_POST
}

model FunctionRestriction {
  id         String             @id @default(cuid())
  user       User               @relation(fields: [userId], references: [id])
  userId     String
  
  function   RestrictedFunction // 제한된 기능
  reason     String?            @db.Text
  expiresAt  DateTime?          // 제한 만료 시간 (null이면 영구)
  
  createdAt  DateTime           @default(now())
  adminId    String
  adminName  String

  @@unique([userId, function]) // 한 사용자는 동일 기능을 중복 제한될 수 없음
  @@index([userId])
}
```

### 2.2 핵심 로직: 기능 제한 확인 미들웨어/헬퍼

API 요청이 들어왔을 때 해당 사용자가 요청된 기능을 사용할 권한이 있는지 확인하는 로직이 필요합니다. 이는 미들웨어나 각 API에서 호출하는 헬퍼 함수로 구현할 수 있습니다.

**`lib/permissions.ts` (헬퍼 함수 방식)**
```typescript
import prisma from '@/lib/prisma';
import { RestrictedFunction } from '@prisma/client';

// 캐싱을 적용하여 성능 최적화 가능
export async function hasFunctionPermission(
  userId: string,
  func: RestrictedFunction
): Promise<boolean> {
  const restriction = await prisma.functionRestriction.findUnique({
    where: {
      userId_function: {
        userId,
        function: func,
      },
      // 만료된 제한은 제외
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    },
  });

  return !restriction; // 제한 기록이 없으면, 권한이 있는 것 (true)
}
```

---

## 3. API 명세

### 3.1 기능 제한 추가

#### **엔드포인트**
```http
POST /api/admin/users/{userId}/restrict
```

#### **Request Body**
```json
{
  "function": "SEND_MESSAGE",
  "reason": "스팸성 메시지 전송",
  "duration": "15d" // 15일, null이면 영구
}
```

#### **Response**
```json
{
  "success": true,
  "message": "기능 제한이 추가되었습니다."
}
```

### 3.2 기능 제한 해제

#### **엔드포인트**
```http
DELETE /api/admin/users/{userId}/restrict/{function}
```

#### **Response**
```json
{
  "success": true,
  "message": "기능 제한이 해제되었습니다."
}
```

---

## 4. 구현 예시

### 4.1 Server-side: 기능 제한 추가/해제 API

**`app/api/admin/users/[userId]/restrict/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { logAdminAction } from '@/lib/admin/auditLog';
import prisma from '@/lib/prisma';
import { RestrictedFunction } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await requireAdmin();
  const { userId } = params;
  const { function: func, reason, duration } = await request.json();

  if (!Object.values(RestrictedFunction).includes(func)) {
    return NextResponse.json({ error: 'Invalid function' }, { status: 400 });
  }

  let expiresAt: Date | null = null;
  if (duration) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(duration));
  }

  const restriction = await prisma.functionRestriction.create({
    data: {
      userId,
      function: func,
      reason,
      expiresAt,
      adminId: session.user.id,
      adminName: session.user.name,
    },
  });

  await logAdminAction({
    adminId: session.user.id,
    action: 'USER_FUNCTION_RESTRICT',
    targetId: userId,
    reason: `Function ${func} restricted. Reason: ${reason}`,
  });

  return NextResponse.json({ success: true, data: restriction });
}
```

### 4.2 Server-side: 기능 사용 전 권한 확인

메시지 전송 API에서 `hasFunctionPermission` 헬퍼를 사용하여 권한을 확인합니다.

**`app/api/messages/route.ts`**
```typescript
import { hasFunctionPermission } from '@/lib/permissions';
import { RestrictedFunction } from '@prisma/client';

export async function POST(request: Request) {
  const session = await getSession(); // 사용자 세션 가져오기
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 메시지 보내기 기능 권한 확인
  const canSendMessage = await hasFunctionPermission(
    session.user.id,
    RestrictedFunction.SEND_MESSAGE
  );

  if (!canSendMessage) {
    return NextResponse.json({ 
      error: 'Message sending is restricted for your account.' 
    }, { status: 403 });
  }

  // ... (메시지 전송 로직)
  
  return NextResponse.json({ success: true });
}
```

---

## 5. 테스트 시나리오

### 5.1 단위 테스트 (Vitest)

`hasFunctionPermission` 헬퍼 함수가 정확하게 동작하는지 테스트합니다.

```typescript
import { describe, it, expect, vi } from 'vitest';
import { hasFunctionPermission } from '@/lib/permissions';
import { RestrictedFunction } from '@prisma/client';

vi.mock('@/lib/prisma', () => ({
  default: {
    functionRestriction: {
      findUnique: vi.fn(),
    },
  },
}));

describe('hasFunctionPermission', () => {
  it('should return true if no restriction exists', async () => {
    prisma.functionRestriction.findUnique.mockResolvedValue(null);
    const result = await hasFunctionPermission('user1', RestrictedFunction.SEND_MESSAGE);
    expect(result).toBe(true);
  });

  it('should return false if a valid restriction exists', async () => {
    prisma.functionRestriction.findUnique.mockResolvedValue({ id: 'res1' });
    const result = await hasFunctionPermission('user1', RestrictedFunction.SEND_MESSAGE);
    expect(result).toBe(false);
  });

  it('should return true if restriction is expired', async () => {
    // findUnique가 null을 반환하도록 설정 (만료된 경우 쿼리에서 걸러지므로)
    prisma.functionRestriction.findUnique.mockResolvedValue(null);
    const result = await hasFunctionPermission('user1', RestrictedFunction.SEND_MESSAGE);
    expect(result).toBe(true);
  });
});
```

### 5.2 E2E 테스트 (Playwright)

1. **시나리오**: '메시지 보내기'가 제한된 사용자로 로그인
2. **액션**: 스터디 채팅방에서 메시지 전송 시도
3. **기대 결과**: "메시지 전송이 제한되었습니다"와 같은 에러 메시지가 표시되고 메시지가 전송되지 않음.
4. **액션**: 관리자가 해당 사용자의 '메시지 보내기' 제한 해제
5. **액션**: 다시 메시지 전송 시도
6. **기대 결과**: 메시지가 성공적으로 전송됨.

---

**이전**: [05-sanction-system.md](05-sanction-system.md)  
**다음**: [07-bulk-operations.md](07-bulk-operations.md)

**작성일**: 2025-11-28
