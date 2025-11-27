# 사용자 관리 - 일괄 작업 시스템

> **파일**: 07-bulk-operations.md  
> **분량**: ~700줄

---

## 1. 일괄 작업 개요

일괄 작업(Bulk Operations)은 관리자가 여러 사용자에게 동일한 작업을 한 번에 적용할 수 있게 해주는 기능입니다. 이 기능은 대규모 사용자 관리, 캠페인, 데이터 마이그레이션 등의 시나리오에서 운영 효율성을 크게 향상시킵니다.

CoUp 관리자 시스템에서 제공하는 주요 일괄 작업은 다음과 같습니다.

- **일괄 정지**: 여러 사용자를 동시에 계정 정지 처리합니다.
- **일괄 메시지 발송**: 특정 조건을 만족하는 다수의 사용자에게 단체 메시지나 알림을 보냅니다.
- **사용자 데이터 내보내기/가져오기 (CSV)**: 사용자 목록을 CSV 파일로 내보내거나, CSV 파일로 사용자를 일괄 등록/수정합니다.

이러한 작업들은 서버에 상당한 부하를 줄 수 있으므로, 직접적인 동기 처리 대신 백그라운드 큐 시스템을 통해 비동기적으로 처리하는 것을 권장합니다.

---

## 2. API 명세

### 2.1 일괄 정지

#### **엔드포인트**
```http
POST /api/admin/users/bulk-suspend
```

#### **Request Body**
```json
{
  "userIds": ["cuid1...", "cuid2...", "cuid3..."],
  "duration": "1d",
  "reason": "시스템 점검으로 인한 일시 정지"
}
```

#### **Response (202 Accepted)**
작업이 백그라운드 큐에 등록되었음을 알립니다.
```json
{
  "success": true,
  "jobId": "bulk-suspend-timestamp-random",
  "message": "일괄 정지 작업이 시작되었습니다. 처리에는 시간이 걸릴 수 있습니다."
}
```

### 2.2 일괄 메시지 발송

#### **엔드포인트**
```http
POST /api/admin/users/bulk-message
```

#### **Request Body**
```json
{
  "filters": {
    "role": "USER",
    "status": "ACTIVE",
    "lastLoginBefore": "2025-10-01T00:00:00Z" 
  },
  "message": {
    "title": "서비스 이용약관 개정 안내",
    "content": "2025년 12월 1일부터 새로운 이용약관이 적용됩니다. 자세한 내용은..."
  }
}
```
> `userIds` 배열을 직접 전달하는 방식도 지원할 수 있습니다.

#### **Response (202 Accepted)**
```json
{
  "success": true,
  "jobId": "bulk-message-timestamp-random",
  "message": "일괄 메시지 발송 작업이 시작되었습니다."
}
```

### 2.3 사용자 데이터 내보내기 (CSV)

#### **엔드포인트**
```http
GET /api/admin/users/export?format=csv&status=ACTIVE
```

#### **Response (200 OK)**
`Content-Type: text/csv` 헤더와 함께 CSV 파일 스트림을 반환합니다.
```csv
id,email,name,role,status,createdAt
cuid1,user1@example.com,User One,USER,ACTIVE,2025-01-15T...
cuid2,user2@example.com,User Two,USER,ACTIVE,2025-01-16T...
...
```

---

## 3. 시스템 설계: 백그라운드 큐

대규모 일괄 작업은 HTTP 요청 시간(timeout) 내에 완료되지 않을 수 있습니다. 따라서 다음과 같은 비동기 처리 아키텍처를 사용합니다.

1.  **API 수신**: 클라이언트로부터 일괄 작업 요청을 받으면, 유효성을 검사하고 작업 내용을 `Job`으로 정의합니다.
2.  **큐에 추가**: 정의된 `Job`을 Redis와 같은 메시지 큐에 추가합니다.
3.  **즉시 응답**: 클라이언트에게는 작업이 큐에 추가되었음을 알리는 `202 Accepted` 응답을 즉시 보냅니다.
4.  **워커(Worker) 처리**: 별도의 워커 프로세스가 큐를 계속 감시(polling)하다가 새로운 `Job`이 들어오면 이를 가져와 실제 작업을 수행합니다. (예: 사용자 DB 업데이트, 메시지 발송)
5.  **상태 추적**: 작업의 진행 상태(대기, 진행 중, 완료, 실패)를 DB나 Redis에 기록하여 관리자가 추적할 수 있도록 합니다.

> **구현 선택지**:
> - **간단한 구현**: `setTimeout(0)`이나 `setImmediate`를 사용하여 현재 요청 흐름에서 분리된 비동기 함수를 실행. (수백 건 이하의 작은 작업에 적합)
> - **전문 솔루션**: BullMQ, Celery, RabbitMQ 같은 전문 메시지 큐 라이브러리/미들웨어 사용. (수천 건 이상의 대규모 작업에 권장)

---

## 4. 구현 예시 (간단한 방식)

`setTimeout`을 이용해 요청-응답 사이클을 차단하지 않고 비동기 작업을 수행하는 예시입니다.

### 4.1 Server-side: 일괄 정지 API

```typescript
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { logAdminAction } from '@/lib/admin/auditLog';

// 백그라운드에서 실행될 실제 작업 함수
async function processBulkSuspend(userIds, duration, reason, adminId, adminName) {
  console.log(`Starting bulk suspend job for ${userIds.length} users.`);
  
  const suspendedUntil = calculateSuspendUntil(duration);

  for (const userId of userIds) {
    try {
      await prisma.user.update({
        where: { id: userId, status: { not: 'SUSPENDED' } },
        data: {
          status: 'SUSPENDED',
          suspendedUntil,
        },
      });
      await prisma.sanction.create({
        data: {
          userId,
          type: 'SUSPEND',
          duration,
          reason,
          adminId,
          adminName,
        },
      });
    } catch (e) {
      console.error(`Failed to suspend user ${userId}:`, e);
    }
  }

  await logAdminAction({
    adminId,
    action: 'USER_BULK_SUSPEND',
    reason: `Suspended ${userIds.length} users. Reason: ${reason}`,
  });

  console.log('Bulk suspend job finished.');
}


export async function POST(request: Request) {
  const session = await requireAdmin();
  const { userIds, duration, reason } = await request.json();

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ error: 'User IDs must be a non-empty array' }, { status: 400 });
  }

  // 작업을 백그라운드로 넘기고 즉시 응답
  setTimeout(() => {
    processBulkSuspend(userIds, duration, reason, session.user.id, session.user.name)
      .catch(console.error);
  }, 0);

  return NextResponse.json(
    { message: `일괄 정지 작업이 ${userIds.length}명의 사용자를 대상으로 시작되었습니다.` },
    { status: 202 }
  );
}
```

### 4.2 Client-side: 일괄 작업 트리거

사용자 목록 페이지에서 여러 사용자를 선택하고 '일괄 정지' 버튼을 클릭했을 때의 동작입니다.

```typescript
function UsersTable({ users }) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  const handleBulkSuspend = async () => {
    if (selectedUserIds.length === 0) {
      alert('사용자를 선택하세요.');
      return;
    }
    
    const reason = prompt('일괄 정지 사유를 입력하세요:');
    if (!reason) return;
    
    try {
      const response = await fetch('/api/admin/users/bulk-suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedUserIds,
          duration: '1d', // 예시 기간
          reason,
        }),
      });

      if (response.status === 202) {
        alert('일괄 정지 작업이 시작되었습니다. 완료까지 시간이 걸릴 수 있습니다.');
        setSelectedUserIds([]);
      } else {
        const error = await response.json();
        alert(`작업 실패: ${error.message}`);
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <button onClick={handleBulkSuspend}>선택 항목 일괄 정지</button>
      {/* ... 테이블 렌더링 로직 ... */}
    </div>
  );
}
```

---

## 5. 고려사항

- **오류 처리 및 재시도**: 워커가 작업을 처리하는 도중 실패했을 경우를 대비해, 재시도 로직이나 실패 로그 기록이 필요합니다.
- **작업 상태 모니터링**: 관리자가 일괄 작업의 진행 상황(예: 5000명 중 1200명 처리 완료)을 볼 수 있는 UI를 제공하면 사용자 경험이 향상됩니다.
- **원자성(Atomicity)**: 여러 DB 작업을 포함하는 경우, 트랜잭션을 사용하여 데이터 정합성을 보장해야 합니다. `processBulkSuspend` 예시에서는 개별 사용자에 대한 처리가 분리되어 있어 전체 작업의 원자성은 보장되지 않습니다.

---

**이전**: [06-function-restriction.md](06-function-restriction.md)  
**다음**: [08-notifications.md](08-notifications.md)

**작성일**: 2025-11-28
