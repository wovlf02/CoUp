# 알림 시스템 예외 처리 가이드
**마지막 업데이트**: 2025-11-29

---

| `/api/notifications/mark-all-read` | POST | 전체 읽음 처리 |
| `/api/notifications/[id]/read` | POST | 읽음 처리 |
| `/api/notifications/[id]` | DELETE | 알림 삭제 |
| `/api/notifications` | GET | 알림 목록 조회 |
|------------|--------|------|
| 엔드포인트 | 메서드 | 설명 |

### API 엔드포인트

## 빠른 참조

---

| [99-best-practices.md](./99-best-practices.md) | 모범 사례 | 알림 전략, 성능 최적화 |
| [03-notification-ui.md](./03-notification-ui.md) | UI 예외 | 목록 표시, 필터링, 읽음 처리 |
| [02-notification-delivery.md](./02-notification-delivery.md) | 알림 전송 예외 | 전송 실패, 재시도, 우선순위 |
| [01-notification-creation.md](./01-notification-creation.md) | 알림 생성 예외 | 생성 실패, 대량 알림, 중복 방지 |
| [INDEX.md](./INDEX.md) | 전체 색인 | 증상별/카테고리별 빠른 찾기 |
|------|------|-----------|
| 문서 | 설명 | 주요 내용 |

### 문서 구조

## 예외 처리 영역

---

```
}
  });
    data: updated
    success: true,
  return NextResponse.json({

  });
    data: { read: true }
    where: { id },
  const updated = await prisma.notification.update({

  }
    return NextResponse.json({ error: '알림을 찾을 수 없습니다' }, { status: 404 });
  if (!notification || notification.userId !== session.user.id) {

  });
    where: { id }
  const notification = await prisma.notification.findUnique({

  }
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  if (!session?.user) {
  
  const session = await getServerSession(authOptions);
  const { id } = await params;
export async function POST(request, { params }) {
```javascript

**파일**: `src/app/api/notifications/[id]/read/route.js`

### 2. 읽음 처리

```
}
  });
    data: notifications
    success: true,
  return NextResponse.json({

  });
    take: limit
    orderBy: { createdAt: 'desc' },
    where,
  const notifications = await prisma.notification.findMany({

  else if (read === 'false') where.read = false;
  if (read === 'true') where.read = true;
  const where = { userId: session.user.id };

  const read = searchParams.get('read');
  const limit = parseInt(searchParams.get('limit') || '20');
  const { searchParams } = new URL(request.url);

  }
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  if (!session?.user) {
  const session = await getServerSession(authOptions);
export async function GET(request) {
```javascript

**파일**: `src/app/api/notifications/route.js`

### 1. 알림 조회

## 주요 기능

---

```
}
  user      User     @relation(fields: [userId], references: [id])
  
  createdAt DateTime @default(now())
  read      Boolean  @default(false)
  link      String?
  message   String?
  title     String
  type      NotificationType
  userId    String
  id        String   @id @default(cuid())
model Notification {
```prisma

### 데이터 모델

```
}
  SYSTEM        // 시스템
  MENTION       // 멘션
  COMMENT       // 댓글
  TASK          // 할일
  INVITATION    // 초대
  ANNOUNCEMENT  // 공지사항
enum NotificationType {
```typescript

### 알림 타입

## 알림 시스템 아키텍처

---

- ✅ 실시간 업데이트
- ✅ 알림 설정
- ✅ 대량 읽음 처리
- ✅ 필터링 및 검색
- ✅ 읽음/안 읽음 상태 관리
- ✅ 다양한 알림 타입 지원
### 주요 특징

- **실시간 전송**: Socket.IO (선택사항)
- **데이터베이스**: PostgreSQL (Prisma ORM)
- **백엔드**: Next.js API Routes
- **프론트엔드**: React, Next.js 14
### 기술 스택

CoUp의 알림 시스템은 스터디 활동, 공지사항, 할일, 댓글 등 다양한 이벤트를 사용자에게 실시간으로 전달합니다.

## 개요

---

5. [빠른 참조](#빠른-참조)
4. [예외 처리 영역](#예외-처리-영역)
3. [주요 기능](#주요-기능)
2. [알림 시스템 아키텍처](#알림-시스템-아키텍처)
1. [개요](#개요)

## 📋 목차

---

**버전**: 1.0.0
**작성자**: CoUp 개발팀  
**최종 업데이트**: 2025-11-29  
**작성일**: 2025-11-29  


