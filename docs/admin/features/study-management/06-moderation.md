# 스터디 관리 - 06: 모더레이션

> **파일**: 06-moderation.md  
> **분량**: ~900줄

---

## 1. 개요

스터디 모더레이션은 플랫폼의 건전성을 유지하고 사용자들을 보호하기 위해, 문제가 있는 스터디에 대해 관리자가 직접 개입하여 조치를 취하는 기능 모음입니다. 여기에는 스터디를 플랫폼에서 제거하거나, 노출을 제한하거나, 소유권을 이전하는 등의 강력한 권한이 포함됩니다.

이러한 기능들은 서비스에 미치는 영향이 크므로, 주로 `SYSTEM_ADMIN` 등급의 최상위 관리자에게만 권한이 부여됩니다.

- **스터디 삭제**: 가이드라인을 심각하게 위반하거나 법적인 문제가 있는 스터디를 영구적으로 제거합니다.
- **공개/비공개 전환**: 분쟁이 발생했거나 검토가 필요한 스터디를 일시적으로 비공개 처리하여 신규 멤버의 유입을 막습니다.
- **소유자 권한 위임**: 스터디 소유자가 장기간 부재하여 스터디 운영이 마비된 경우, 다른 멤버에게 소유자 권한을 위임합니다.

---

## 2. API 명세

### 2.1 스터디 삭제

#### **권한**: `SYSTEM_ADMIN`
#### **엔드포인트**
```http
DELETE /api/admin/studies/{studyId}
```
#### **로직**
1.  `requireSystemAdmin`으로 최상위 관리자 권한을 확인합니다.
2.  스터디와 관련된 모든 하위 데이터(멤버, 메시지, 파일, 공지 등)를 어떻게 처리할지 정책을 결정해야 합니다.
    - **Hard Delete (물리적 삭제)**: 모든 관련 데이터를 DB에서 영구적으로 삭제합니다. (복구 불가)
    - **Soft Delete (논리적 삭제)**: `Study` 모델에 `status: 'DELETED'` 와 같이 상태 플래그를 추가하여, 실제 데이터는 보존하되 사용자에게는 보이지 않도록 처리합니다. (데이터 복구 및 분석에 유리)
3.  삭제(또는 상태 변경)가 완료되면, 관련된 모든 멤버에게 스터디가 삭제되었음을 알리는 이메일/인앱 알림을 발송합니다.
4.  감사 로그에 "스터디 삭제" 액션을 기록합니다.

#### **Response (200 OK)**
```json
{
  "success": true,
  "message": "스터디가 성공적으로 삭제되었습니다."
}
```

### 2.2 공개/비공개 전환

#### **권한**: `ADMIN`, `SYSTEM_ADMIN`
#### **엔드포인트**
```http
PATCH /api/admin/studies/{studyId}/visibility
```
#### **Request Body**
```json
{
  "isPublic": false
}
```
#### **Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "isPublic": false
  }
}
```

### 2.3 소유자 권한 위임

#### **권한**: `SYSTEM_ADMIN`
#### **엔드포인트**
```http
POST /api/admin/studies/{studyId}/transfer-owner
```
#### **Request Body**
```json
{
  "newOwnerId": "cuid_new_owner_789",
  "reason": "기존 소유자의 3개월 이상 장기 부재"
}
```
#### **로직**
1.  `requireSystemAdmin`으로 권한을 확인합니다.
2.  `newOwnerId`가 해당 스터디의 멤버인지 확인합니다.
3.  `Study` 테이블의 `ownerId`를 `newOwnerId`로 변경합니다.
4.  기존 소유자와 새로운 소유자의 `StudyMember` 테이블의 `role`을 각각 `MEMBER`, `LEADER`로 변경합니다.
5.  기존 소유자와 새로운 소유자에게 권한이 위임되었음을 알리는 알림을 발송합니다.
6.  감사 로그에 기록합니다.

---

## 3. 구현 예시

### 3.1 Server-side: 스터디 삭제 API (Soft Delete 방식)

`Study` 모델에 `status` 필드가 있다고 가정합니다.
`enum StudyStatus { ACTIVE, ARCHIVED, DELETED }`

**`app/api/admin/studies/[studyId]/route.ts`**
```typescript
import { requireSystemAdmin } from '@/lib/adminAuth';
// ... 다른 import

export async function DELETE(
  request: Request,
  { params }: { params: { studyId: string } }
) {
  const session = await requireSystemAdmin();
  const { studyId } = params;

  const study = await prisma.study.findUnique({
    where: { id: studyId },
    include: { members: { select: { userId: true } } }
  });

  if (!study) {
    return NextResponse.json({ error: 'Study not found' }, { status: 404 });
  }

  // 1. 스터디 상태를 'DELETED'로 변경
  await prisma.study.update({
    where: { id: studyId },
    data: { status: 'DELETED', isPublic: false },
  });

  // 2. 멤버들에게 알림 발송 (백그라운드 처리 권장)
  const memberUserIds = study.members.map(m => m.userId);
  // createBulkNotifications(memberUserIds, `스터디 '${study.name}'이(가) 관리자에 의해 삭제되었습니다.`);

  // 3. 감사 로그 기록
  await logAdminAction({
    adminId: session.user.id,
    action: 'STUDY_DELETE',
    targetId: studyId,
    targetName: study.name,
    reason: '관리자에 의한 삭제 처리' // 실제로는 사유를 입력받는 것이 좋음
  });
  
  // 4. 관련 캐시 무효화
  // revalidateTag(`study:${studyId}`);

  return NextResponse.json({ success: true, message: '스터디가 삭제 처리되었습니다.' });
}
```

### 3.2 Server-side: 소유자 위임 API

**`app/api/admin/studies/[studyId]/transfer-owner/route.ts`**
```typescript
// ...
export async function POST(
  request: Request,
  { params }: { params: { studyId: string } }
) {
  const session = await requireSystemAdmin();
  const { studyId } = params;
  const { newOwnerId, reason } = await request.json();

  const [study, newOwnerMembership] = await Promise.all([
    prisma.study.findUnique({ where: { id: studyId } }),
    prisma.studyMember.findUnique({ where: { studyId_userId: { studyId, userId: newOwnerId } } })
  ]);
  
  if (!study || !newOwnerMembership) {
    return NextResponse.json({ error: 'Study or new owner not found in this study' }, { status: 404 });
  }

  const oldOwnerId = study.ownerId;

  // 트랜잭션으로 데이터 정합성 보장
  await prisma.$transaction([
    // 1. 스터디의 ownerId 변경
    prisma.study.update({
      where: { id: studyId },
      data: { ownerId: newOwnerId },
    }),
    // 2. 기존 소유자 역할 변경
    prisma.studyMember.update({
      where: { studyId_userId: { studyId, userId: oldOwnerId } },
      data: { role: 'MEMBER' },
    }),
    // 3. 새로운 소유자 역할 변경
    prisma.studyMember.update({
      where: { studyId_userId: { studyId, userId: newOwnerId } },
      data: { role: 'LEADER' },
    }),
  ]);

  // 알림 발송 및 감사 로그 기록...
  
  return NextResponse.json({ success: true });
}
```

---

## 4. 테스트 시나리오

- **스터디 삭제**:
  - `ADMIN` 권한으로 삭제 API 호출 시 403 Forbidden 에러가 발생하는지 확인.
  - `SYSTEM_ADMIN` 권한으로 삭제 API 호출 시 200 OK 응답과 함께, `Study`의 `status`가 `DELETED`로 변경되는지 확인.
  - 삭제 후, 해당 스터디가 일반 사용자 목록 API 결과에 포함되지 않는지 확인.
- **소유자 위임**:
  - 스터디 멤버가 아닌 사용자를 `newOwnerId`로 지정하여 API 호출 시 404/400 에러가 발생하는지 확인.
  - 정상적인 위임 후, `Study` 테이블의 `ownerId`와 두 멤버의 `StudyMember.role`이 올바르게 변경되었는지 DB에서 확인.
- **가시성 변경**:
  - `PATCH /visibility` API로 `isPublic`을 `false`로 변경 후, 로그아웃 상태에서 해당 스터디 페이지 접근 시 404 또는 비공개 안내 페이지가 표시되는지 확인.

---

**이전**: [05-featured-system.md](05-featured-system.md)  
**다음**: [07-analytics.md](07-analytics.md)

**작성일**: 2025-11-28
