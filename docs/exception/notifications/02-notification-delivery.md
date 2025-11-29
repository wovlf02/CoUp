# 알림 전송 예외 처리

**문서 ID**: NOTIF-02  
**작성일**: 2025-11-29  
**카테고리**: 알림 전송  
**우선순위**: 🔥 높음

---

## 📋 목차

1. [전송 실패 처리](#1-전송-실패-처리)
2. [재시도 로직](#2-재시도-로직)
3. [실시간 전송](#3-실시간-전송)

---

## 1. 전송 실패 처리

### 1.1 DB 저장 실패

**✅ 트랜잭션 처리**:
```javascript
export async function sendNotification(data) {
  try {
    const notification = await prisma.notification.create({
      data
    });

    // Socket.IO로 실시간 전송 (선택사항)
    if (global.io) {
      global.io.to(`user:${data.userId}`).emit('notification:new', notification);
    }

    return notification;
  } catch (error) {
    console.error('[Notification] Send failed:', error);
    throw error;
  }
}
```

---

## 2. 재시도 로직

### 2.1 실패 시 재시도

**✅ 재시도 메커니즘**:
```javascript
async function sendWithRetry(data, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await sendNotification(data);
    } catch (error) {
      console.error(`[Notification] Attempt ${attempt}/${maxRetries} failed`);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 대기 후 재시도
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

---

## 3. 실시간 전송

### 3.1 Socket.IO 통합

**✅ 실시간 알림**:
```javascript
// 서버: 알림 생성 후 Socket.IO로 전송
const notification = await prisma.notification.create({ data });

if (global.io) {
  global.io.to(`user:${notification.userId}`).emit('notification:new', notification);
}

// 클라이언트: 실시간 수신
useEffect(() => {
  if (!socket) return;

  socket.on('notification:new', (notification) => {
    setNotifications(prev => [notification, ...prev]);
    toast.info(notification.title);
  });

  return () => {
    socket.off('notification:new');
  };
}, [socket]);
```

---

**마지막 업데이트**: 2025-11-29

