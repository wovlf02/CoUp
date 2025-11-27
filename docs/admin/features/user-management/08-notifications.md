# 사용자 관리 - 알림 시스템 (이메일 및 인앱)

> **파일**: 08-notifications.md  
> **분량**: ~600줄

---

## 1. 알림 시스템 개요

알림 시스템은 관리자가 수행하는 주요 조치(계정 정지, 경고, 신고 처리 등)에 대해 사용자에게 투명하게 정보를 전달하는 필수적인 구성 요소입니다. CoUp에서는 두 가지 주요 채널을 통해 알림을 발송합니다.

1.  **이메일 알림**: 사용자의 이메일 주소로 상세한 내용을 담은 공식 알림을 보냅니다. 법적 고지나 중요한 정보 전달에 사용됩니다.
2.  **인앱(In-app) 알림**: 플랫폼 내에서 사용자에게 실시간으로 전달되는 짧은 알림입니다. 사용자가 즉시 확인해야 할 정보에 사용됩니다.

이 시스템은 `Resend`와 같은 외부 이메일 서비스를 활용하고, `React Email`을 통해 템플릿을 관리하며, 데이터베이스에 알림 내역을 기록합니다.

---

## 2. 시스템 설계

### 2.1 이메일 발송 아키텍처

```
+----------------+      +-------------------+      +-------------------+      +-----------------+
| Admin Action   |----->| API Endpoint      |----->| sendEmail() Helper|----->| Resend API      |----->| User's Inbox    |
| (e.g., Suspend)|      | (e.g., /suspend)  |      | (React Email)     |      | (Email Service) |      |                 |
+----------------+      +-------------------+      +-------------------+      +-----------------+
```

- **이메일 템플릿**: `emails/` 디렉토리 안에 `React Email` 컴포넌트(*.tsx)로 템플릿을 작성합니다. 이를 통해 동적 데이터를 포함한 세련된 HTML 이메일을 쉽게 생성할 수 있습니다.
- **발송 서비스**: `Resend` SDK를 사용하여 `sendEmail` 헬퍼 함수에서 실제 이메일을 발송합니다. `Resend`는 API 키 기반으로 동작하며, 발송 성공/실패 여부를 추적할 수 있습니다.

### 2.2 인앱 알림 데이터 모델

**`prisma/schema.prisma`**
```prisma
model Notification {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  
  type      NotificationType // WARN, INFO, SUCCESS, ERROR
  content   String   @db.Text
  url       String?  // 클릭 시 이동할 URL
  isRead    Boolean  @default(false)
  
  createdAt DateTime @default(now())

  @@index([userId, isRead])
}

enum NotificationType {
  WARN
  INFO
  SUCCESS
  ERROR
}
```

---

## 3. 이메일 알림 구현

### 3.1 React Email 템플릿 생성

**`emails/SuspensionNotice.tsx`**
```tsx
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Text,
  Heading,
} from '@react-email/components';
import * as React from 'react';

interface SuspensionNoticeEmailProps {
  userName: string;
  reason: string;
  duration: string;
  suspendedUntil: Date | null;
}

export const SuspensionNoticeEmail = ({
  userName,
  reason,
  duration,
  suspendedUntil,
}: SuspensionNoticeEmailProps) => (
  <Html>
    <Head />
    <Preview>CoUp 계정 정지 안내</Preview>
    <Body>
      <Container>
        <Heading>안녕하세요, {userName}님.</Heading>
        <Text>회원님의 CoUp 계정이 아래의 사유로 정지되었음을 알려드립니다.</Text>
        <Text>
          <strong>사유:</strong> {reason}
        </Text>
        <Text>
          <strong>조치:</strong> 계정 이용 정지
        </Text>
        <Text>
          <strong>정지 기간:</strong> {duration === 'permanent' ? '영구' : `${duration}일`}
        </Text>
        {suspendedUntil && (
          <Text>
            <strong>정지 만료일:</strong> {suspendedUntil.toLocaleDateString('ko-KR')}
          </Text>
        )}
        <Text>
          서비스 이용에 불편을 드려 죄송합니다. 관련하여 문의사항이 있으시면 고객센터로
          연락 주시기 바랍니다.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default SuspensionNoticeEmail;
```

### 3.2 이메일 발송 헬퍼 함수

**`lib/email/sendEmail.ts`**
```typescript
import { Resend } from 'resend';
import { SuspensionNoticeEmail } from '@/emails/SuspensionNotice';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SuspensionEmailProps {
  userEmail: string;
  userName: string;
  reason: string;
  duration: string;
  suspendedUntil: Date | null;
}

export async function sendSuspensionEmail(props: SuspensionEmailProps) {
  const { userEmail, userName, reason, duration, suspendedUntil } = props;

  try {
    const { data, error } = await resend.emails.send({
      from: 'CoUp 관리팀 <noreply@yourdomain.com>',
      to: [userEmail],
      subject: 'CoUp 계정 정지 안내',
      react: React.createElement(SuspensionNoticeEmail, {
        userName,
        reason,
        duration,
        suspendedUntil,
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send suspension email.');
    }

    return data;
  } catch (error) {
    console.error('Email sending failed:', error);
  }
}
```

### 3.3 계정 정지 API에서 호출

계정 정지 API 로직 마지막에 이메일 발송 함수를 호출합니다.

**`app/api/admin/users/[userId]/suspend/route.ts`**
```typescript
// ... (정지 처리 로직)

if (notifyUser) {
  await sendSuspensionEmail({
    userEmail: userToSuspend.email,
    userName: userToSuspend.name,
    reason,
    duration,
    suspendedUntil,
  });
}

return NextResponse.json({ success: true });
```

---

## 4. 인앱 알림 구현

### 4.1 인앱 알림 생성 헬퍼

**`lib/notifications.ts`**
```typescript
import prisma from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

export async function createNotification(
  userId: string,
  content: string,
  type: NotificationType = 'INFO',
  url?: string
) {
  return prisma.notification.create({
    data: {
      userId,
      content,
      type,
      url,
    },
  });
}
```

### 4.2 인앱 알림 API

사용자가 자신의 알림 목록을 조회하는 API입니다.

**`app/api/notifications/route.ts`**
```typescript
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getSession({ req: request });
  if (!session) return new Response('Unauthorized', { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20, // 최근 20개
  });

  return new Response(JSON.stringify(notifications));
}
```

### 4.3 신고 처리 시 인앱 알림 발송

신고 처리 결과(승인/반려)를 신고자에게 알려줍니다.

**`app/api/admin/reports/[reportId]/process/route.ts`**
```typescript
import { createNotification } from '@/lib/notifications';

// ... (신고 처리 로직)

// 신고자에게 결과 알림
await createNotification(
  report.reporterId,
  `회원님께서 신고하신 내용이 처리되었습니다: ${resolution}`,
  'SUCCESS',
  `/my-reports/${report.id}`
);
```

---

## 5. 테스트 및 고려사항

- **테스트**: 이메일 발송은 실제 API를 호출하므로, 개발 환경에서는 `Resend`의 테스트 키를 사용하거나 이메일 발송 부분을 모의(mocking) 처리해야 합니다.
- **로컬 개발**: `React Email`은 로컬에서 이메일 템플릿을 미리 보고 테스트할 수 있는 개발 서버를 제공합니다.
- **수신 거부**: 사용자가 특정 유형의 알림(예: 마케팅 정보)을 수신 거부할 수 있는 기능을 고려해야 합니다.
- **실시간**: 인앱 알림을 실시간으로 전달하려면 WebSocket이나 Server-Sent Events(SSE)를 사용한 푸시 방식이 필요합니다. 현재 예시는 사용자가 API를 직접 호출(pull)하는 방식입니다.

---

**이전**: [07-bulk-operations.md](07-bulk-operations.md)  

**작성일**: 2025-11-28
