# 알림 시스템 모범 사례

**문서 ID**: NOTIF-99  
**작성일**: 2025-11-29  
**카테고리**: 모범 사례  
**우선순위**: ⭐ 필수

---

## 📋 목차

1. [알림 전략](#1-알림-전략)
2. [성능 최적화](#2-성능-최적화)
3. [사용자 경험](#3-사용자-경험)

---

## 1. 알림 전략

### 1.1 알림 타입 분류

**✅ 우선순위 기반 알림**:
```javascript
const NOTIFICATION_PRIORITY = {
  URGENT: ['MENTION', 'INVITATION'],
  NORMAL: ['TASK', 'COMMENT'],
  LOW: ['ANNOUNCEMENT', 'SYSTEM']
};

// 긴급 알림은 즉시 표시
if (NOTIFICATION_PRIORITY.URGENT.includes(notification.type)) {
  toast.warning(notification.title);
}
```

### 1.2 알림 빈도 제어

**✅ Rate Limiting**:
```javascript
// 같은 타입의 알림은 10분에 1번만
const RATE_LIMIT = 10 * 60 * 1000; // 10분

const shouldCreateNotification = async (userId, type) => {
  const recent = await prisma.notification.findFirst({
    where: {
      userId,
      type,
      createdAt: {
        gte: new Date(Date.now() - RATE_LIMIT)
      }
    }
  });

  return !recent;
};
```

---

## 2. 성능 최적화

### 2.1 페이지네이션

**✅ 무한 스크롤**:
```javascript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['notifications'],
  queryFn: ({ pageParam = 0 }) =>
    api.get('/api/notifications', { 
      params: { offset: pageParam, limit: 20 }
    }),
  getNextPageParam: (lastPage, pages) => {
    if (lastPage.data.length < 20) return undefined;
    return pages.length * 20;
  }
});
```

### 2.2 캐싱

**✅ React Query 캐싱**:
```javascript
const { data: notifications } = useQuery({
  queryKey: ['notifications'],
  queryFn: () => api.get('/api/notifications'),
  staleTime: 30000, // 30초
  cacheTime: 300000 // 5분
});
```

---

## 3. 사용자 경험

### 3.1 실시간 카운트

**✅ 안 읽은 알림 수 표시**:
```javascript
const { data: unreadCount } = useQuery({
  queryKey: ['notifications', 'unread-count'],
  queryFn: async () => {
    const data = await api.get('/api/notifications', { 
      params: { read: 'false' }
    });
    return data.data.length;
  },
  refetchInterval: 30000 // 30초마다 갱신
});

// 헤더에 표시
<NotificationIcon count={unreadCount} />
```

### 3.2 토스트 알림

**✅ 적절한 토스트 사용**:
```javascript
// 긴급 알림만 토스트로 표시
socket.on('notification:new', (notification) => {
  setNotifications(prev => [notification, ...prev]);

  if (['MENTION', 'INVITATION'].includes(notification.type)) {
    toast.warning(notification.title, {
      onClick: () => router.push(notification.link)
    });
  }
});
```

---

**마지막 업데이트**: 2025-11-29

