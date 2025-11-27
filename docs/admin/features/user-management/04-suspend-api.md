# 사용자 관리 - 계정 상태 변경 API

> **파일**: 04-suspend-api.md  
> **분량**: ~900줄

---

## 1. 계정 상태 변경 개요

사용자 계정의 상태를 변경하는 API는 관리자가 사용자의 활동을 제어하는 핵심적인 도구입니다. CoUp 관리자 시스템에서는 계정 정지(Suspend), 정지 해제(Unsuspend), 경고(Warn)의 세 가지 주요 기능을 제공합니다. 이 기능들은 신고 처리, 운영 정책 위반 등의 상황에서 사용되며, 모든 액션은 감사 로그에 기록되어 투명하게 관리됩니다.

- **계정 정지 (`/suspend`)**: 특정 기간 동안 사용자의 서비스 이용을 제한합니다.
- **정지 해제 (`/unsuspend`)**: 정지된 사용자를 즉시 활성 상태로 복구시킵니다.
- **경고 (`/warn`)**: 사용자에게 공식적인 경고를 보내고, 경고 횟수를 기록합니다.

이 API들은 사용자 ID를 파라미터로 받아 처리하며, 모든 요청은 관리자(ADMIN, SYSTEM_ADMIN) 권한을 필요로 합니다.

---

## 2. API 명세

### 2.1 계정 정지

#### **엔드포인트**
```http
POST /api/admin/users/{userId}/suspend
```

#### **Request Body**

| 필드         | 타입     | 필수 | 설명                                     |
|--------------|----------|------|------------------------------------------|
| `duration`   | `String` | 예   | 정지 기간. (예: `1d`, `7d`, `30d`, `permanent`) |
| `reason`     | `String` | 예   | 정지 사유 (최소 10자 이상)               |
| `notifyUser` | `Boolean`| 아니오 | 사용자에게 이메일 알림 발송 여부. (기본값: `true`) |

**TypeScript 타입**
```typescript
interface SuspendRequestBody {
  duration: '1d' | '3d' | '7d' | '30d' | 'permanent';
  reason: string;
  notifyUser?: boolean;
}
```

**JSON 예시**
```json
{
  "duration": "7d",
  "reason": "커뮤니티 가이드라인 위반: 반복적인 스팸성 게시물 작성",
  "notifyUser": true
}
```

#### **Response**

**성공 (200 OK)**
```json
{
  "success": true,
  "message": "사용자가 성공적으로 정지되었습니다."
}
```

**실패**
- **400 Bad Request**: `duration` 또는 `reason`이 누락되거나 유효하지 않은 경우.
- **401 Unauthorized**: 관리자 권한이 없는 경우.
- **404 Not Found**: 대상 사용자를 찾을 수 없는 경우.
- **409 Conflict**: 이미 정지된 사용자인 경우.

```json
// 400 Bad Request 예시
{
  "error": "Invalid request body",
  "details": "Reason must be at least 10 characters long."
}
```

### 2.2 계정 정지 해제

#### **엔드포인트**
```http
POST /api/admin/users/{userId}/unsuspend
```

#### **Request Body**

| 필드     | 타입     | 필수 | 설명                 |
|----------|----------|------|----------------------|
| `reason` | `String` | 예   | 정지 해제 사유       |

**JSON 예시**
```json
{
  "reason": "사용자 소명 자료 확인 후 정지 해제 조치"
}
```

#### **Response**

**성공 (200 OK)**
```json
{
  "success": true,
  "message": "사용자 정지가 성공적으로 해제되었습니다."
}
```

**실패**
- **404 Not Found**: 대상 사용자를 찾을 수 없는 경우.
- **409 Conflict**: 정지 상태가 아닌 사용자인 경우.

### 2.3 사용자 경고

#### **엔드포인트**
```http
POST /api/admin/users/{userId}/warn
```

#### **Request Body**

| 필드     | 타입     | 필수 | 설명             |
|----------|----------|------|------------------|
| `reason` | `String` | 예   | 경고 사유        |

**JSON 예시**
```json
{
  "reason": "스터디 그룹 내에서 부적절한 언어 사용"
}
```

#### **Response**

**성공 (200 OK)**
```json
{
  "success": true,
  "message": "사용자에게 경고가 성공적으로 발송되었습니다."
}
```

---

## 3. 구현 예시

### 3.1 Server-side: 계정 정지 API

`app/api/admin/users/[userId]/suspend/route.ts` 파일은 사용자 정지 로직을 처리합니다.

```typescript
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { logAdminAction } from '@/lib/admin/auditLog';
import { sendSuspensionEmail } from '@/lib/email/sendEmail';
import prisma from '@/lib/prisma';

// 정지 기간 계산 함수
function calculateSuspendUntil(duration: string): Date | null {
  if (duration === 'permanent') return null; // 영구 정지는 null
  const now = new Date();
  const days = parseInt(duration.replace('d', ''));
  now.setDate(now.getDate() + days);
  return now;
}

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await requireAdmin();
    const { userId } = params;
    const body = await request.json();
    const { duration, reason, notifyUser = true } = body;

    if (!['1d', '3d', '7d', '30d', 'permanent'].includes(duration) || !reason || reason.length < 10) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const userToSuspend = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToSuspend) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (userToSuspend.status === 'SUSPENDED') {
        return NextResponse.json({ error: 'User is already suspended' }, { status: 409 });
    }

    const suspendedUntil = calculateSuspendUntil(duration);

    // 1. 트랜잭션으로 사용자 상태 업데이트 및 제재 기록 생성
    const [updatedUser, sanction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          status: 'SUSPENDED',
          suspendedUntil,
        },
      }),
      prisma.sanction.create({
        data: {
          userId: userId,
          type: 'SUSPEND',
          reason,
          duration,
          adminId: session.user.id,
          adminName: session.user.name,
        },
      }),
    ]);

    // 2. 감사 로그 기록
    await logAdminAction({
      adminId: session.user.id,
      action: 'USER_SUSPEND',
      targetId: userId,
      targetName: userToSuspend.name,
      reason,
      after: { status: 'SUSPENDED', suspendedUntil }
    });

    // 3. 사용자에게 이메일 알림 발송
    if (notifyUser) {
      await sendSuspensionEmail({
        userEmail: userToSuspend.email,
        userName: userToSuspend.name,
        reason,
        duration,
        suspendedUntil
      });
    }
    
    // 4. 관련 캐시 무효화 (예: 사용자 정보 캐시)
    // revalidateTag(`user:${userId}`);

    return NextResponse.json({ success: true, message: '사용자가 성공적으로 정지되었습니다.' });

  } catch (error) {
    console.error('Suspend API error:', error);
    // ... (에러 처리)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### 3.2 Client-side: 정지 모달에서 API 호출

`components/admin/users/SuspendModal.tsx` 컴포넌트에서 `fetch`를 사용해 API를 호출합니다.

```typescript
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

// API 호출 함수
const suspendUser = async ({ userId, duration, reason, notifyUser }) => {
  const response = await fetch(`/api/admin/users/${userId}/suspend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ duration, reason, notifyUser }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to suspend user');
  }
  return response.json();
};

export function SuspendModal({ userId, onClose }) {
  const [duration, setDuration] = useState('7d');
  const [reason, setReason] = useState('');

  const mutation = useMutation({
    mutationFn: suspendUser,
    onSuccess: () => {
      alert('사용자가 성공적으로 정지되었습니다.');
      onClose();
      // queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      alert(`정지 처리 실패: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (reason.length < 10) {
      alert('정지 사유를 10자 이상 입력해주세요.');
      return;
    }
    mutation.mutate({ userId, duration, reason, notifyUser: true });
  };

  return (
    // ... (모달 UI)
    <div>
      <select value={duration} onChange={(e) => setDuration(e.target.value)}>
        <option value="1d">1일</option>
        <option value="7d">7일</option>
        <option value="30d">30일</option>
        <option value="permanent">영구</option>
      </select>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="정지 사유를 입력하세요..."
      />
      <button onClick={handleSubmit} disabled={mutation.isLoading}>
        {mutation.isLoading ? '처리 중...' : '정지 확정'}
      </button>
    </div>
    // ...
  );
}
```

---

## 4. 테스트 시나리오

### 4.1 단위 테스트 (Vitest)

`calculateSuspendUntil` 함수의 동작을 검증합니다.

```typescript
import { describe, it, expect, vi } from 'vitest';

// 테스트 대상 함수
function calculateSuspendUntil(duration: string): Date | null {
  if (duration === 'permanent') return null;
  const now = new Date();
  const days = parseInt(duration.replace('d', ''));
  now.setDate(now.getDate() + days);
  return now;
}

describe('calculateSuspendUntil', () => {
  it('should return null for "permanent" duration', () => {
    expect(calculateSuspendUntil('permanent')).toBeNull();
  });

  it('should return a date 7 days from now for "7d" duration', () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    const result = calculateSuspendUntil('7d');
    
    // 1초 이내의 시간차는 허용
    expect(result.getTime()).toBeGreaterThanOrEqual(future.getTime() - 1000);
    expect(result.getTime()).toBeLessThanOrEqual(future.getTime() + 1000);
  });
});
```

### 4.2 통합 테스트

1. **정상 정지**: 유효한 `userId`, `duration`, `reason`으로 API 호출 시 200 OK 응답 및 DB 상태 변경 확인.
2. **권한 없음**: 일반 사용자 토큰으로 API 호출 시 401 Unauthorized 응답 확인.
3. **잘못된 요청**: `reason` 없이 API 호출 시 400 Bad Request 응답 확인.
4. **캐시 무효화**: 정지 처리 후 사용자 상세 정보 API 재요청 시 변경된 `status`가 반영되는지 확인.

---

**이전**: [03-detail-api.md](03-detail-api.md)  
**다음**: [05-sanction-system.md](05-sanction-system.md)

**작성일**: 2025-11-28
