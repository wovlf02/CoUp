# 알림 UI 예외 처리

**문서 ID**: NOTIF-03  
**작성일**: 2025-11-29  
**카테고리**: UI/UX  
**우선순위**: 🔶 중간

---

## 📋 목차

1. [목록 로딩 실패](#1-목록-로딩-실패)
2. [읽음 처리 문제](#2-읽음-처리-문제)
3. [필터링 오류](#3-필터링-오류)

---

## 1. 목록 로딩 실패

### 1.1 API 오류 처리

**✅ 에러 처리가 포함된 조회**:
```javascript
// src/app/notifications/page.jsx
const [notifications, setNotifications] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

const fetchNotifications = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const data = await api.get('/api/notifications');
    
    if (data.success) {
      setNotifications(data.data);
    }
  } catch (err) {
    console.error('알림 로드 실패:', err);
    setError('알림을 불러올 수 없습니다');
  } finally {
    setIsLoading(false);
  }
};

// UI
if (isLoading) return <div>로딩 중...</div>;
if (error) return <div>{error}</div>;
if (notifications.length === 0) return <div>알림이 없습니다</div>;
```

---

## 2. 읽음 처리 문제

### 2.1 낙관적 업데이트

**✅ 읽음 처리**:
```javascript
const handleMarkAsRead = async (id) => {
  // 낙관적 업데이트
  setNotifications(prev =>
    prev.map(n => n.id === id ? { ...n, read: true } : n)
  );

  try {
    await api.post(`/api/notifications/${id}/read`);
  } catch (error) {
    console.error('읽음 처리 실패:', error);
    
    // 롤백
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: false } : n)
    );
    
    toast.error('읽음 처리에 실패했습니다');
  }
};
```

### 2.2 전체 읽음 처리

**✅ 대량 읽음 처리**:
```javascript
const handleMarkAllRead = async () => {
  const previousNotifications = [...notifications];
  
  // 낙관적 업데이트
  setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  try {
    await api.post('/api/notifications/mark-all-read');
    toast.success('모든 알림을 읽음 처리했습니다');
  } catch (error) {
    console.error('전체 읽음 처리 실패:', error);
    
    // 롤백
    setNotifications(previousNotifications);
    toast.error('읽음 처리에 실패했습니다');
  }
};
```

---

## 3. 필터링 오류

### 3.1 필터 적용

**✅ 클라이언트 필터링**:
```javascript
const [filter, setFilter] = useState('all'); // all, unread, read

const filteredNotifications = useMemo(() => {
  if (filter === 'all') return notifications;
  if (filter === 'unread') return notifications.filter(n => !n.read);
  if (filter === 'read') return notifications.filter(n => n.read);
  return notifications;
}, [notifications, filter]);
```

**✅ 서버 필터링**:
```javascript
const fetchNotifications = async () => {
  try {
    const params = {};
    if (filter === 'unread') params.read = 'false';
    if (filter === 'read') params.read = 'true';

    const data = await api.get('/api/notifications', params);
    setNotifications(data.data);
  } catch (error) {
    console.error('조회 실패:', error);
  }
};

useEffect(() => {
  fetchNotifications();
}, [filter]);
```

---

**마지막 업데이트**: 2025-11-29

