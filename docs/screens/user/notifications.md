# 16. 알림 목록 (Notifications)

> **화면 ID**: `MAIN-10`  
> **라우트**: `/notifications`  
> **레이아웃**: 좌측 네비게이션(15%) + 우측 콘텐츠(85%)  
> **렌더링**: CSR (실시간 WebSocket)

---

## 📐 화면 구조

```
┌────────┬───────────────────────────────────────────────────────┐
│        │  Header                                               │
│        ├───────────────────────────────────────────────────────┤
│        │                                                       │
│  Nav   │  알림                       [전체] [읽지않음]  [모두읽음]│
│  Bar   │                                                       │
│        │  ┌─────────────────────────────────────────────────┐  │
│ 🏠     │  │ 🔵 [가입승인] 코딩테스트 마스터 스터디           │  │
│ 🔍     │  │    가입이 승인되었습니다                         │  │
│ 👥     │  │    2시간 전                                      │  │
│ 📋     │  └─────────────────────────────────────────────────┘  │
│ 🔔     │                                                       │
│ 👤     │  ┌─────────────────────────────────────────────────┐  │
│        │  │ ⚪ [공지] 코딩테스트 마스터 스터디               │  │
│        │  │    "이번 주 일정 안내" 공지가 등록되었습니다     │  │
│        │  │    5시간 전                                      │  │
│        │  └─────────────────────────────────────────────────┘  │
│        │                                                       │
│        │  ┌─────────────────────────────────────────────────┐  │
│        │  │ ⚪ [파일] 취업 준비 스터디                       │  │
│        │  │    이영희님이 "자소서_템플릿.pdf"를 업로드했습니다│ │
│        │  │    1일 전                                        │  │
│        │  └─────────────────────────────────────────────────┘  │
│        │                                                       │
│        │  ┌─────────────────────────────────────────────────┐  │
│        │  │ ⚪ [일정] 영어 회화 스터디                       │  │
│        │  │    "모임" 일정이 내일 오후 2시로 예정되어 있습니다│ │
│        │  │    1일 전                                        │  │
│        │  └─────────────────────────────────────────────────┘  │
│        │                                                       │
│        │                  ← [1] 2 3 4 5 →                     │
│        │                                                       │
└────────┴───────────────────────────────────────────────────────┘
```

**레이아웃 비율** (해상도별 자동 조정):

### 🖥️ FHD (1920px) - 기본 기준
- 좌측 네비게이션: **15%** (min: 200px, max: 240px)
- 메인 콘텐츠: **85%** (min: 1000px, max: 1600px)
- 컨텐츠 최대 너비: 900px (중앙 정렬)

### 🖥️ QHD (2560px) - 고해상도
- 좌측 네비게이션: **12%** (min: 240px, max: 280px)
- 메인 콘텐츠: **87%** (min: 1600px, max: 2200px)
- 컨텐츠 최대 너비: 1100px (중앙 정렬)

### 🖥️ 4K (3840px) - 초고해상도
- 좌측 네비게이션: **10%** (min: 280px, max: 320px)
- 메인 콘텐츠: **89%** (min: 2200px, max: 3400px)
- 컨텐츠 최대 너비: 1300px (중앙 정렬)

### 📱 반응형 브레이크포인트
- **Desktop (1280px+)**: 알림 카드 전체 너비
- **Tablet (768-1279px)**: 알림 카드 전체 너비
- **Mobile (<768px)**: 텍스트 축약, 배지 작게, 시간 짧게 표시

---

## 🎨 섹션별 상세 설계

### 1. 페이지 헤더
```
알림                         [전체] [읽지않음]    [모두 읽음]
```

**좌측**: 제목 "알림"

**중앙 필터**:
- [전체]: 모든 알림
- [읽지않음]: 읽지 않은 알림만 (기본)

**우측**:
- [모두 읽음] 버튼: 모든 알림을 읽음 처리

---

### 2. 알림 목록

#### 읽지 않은 알림
```
┌─────────────────────────────────────────────────────────┐
│ 🔵 [가입승인] 코딩테스트 마스터 스터디                   │
│    가입이 승인되었습니다                                 │
│    2시간 전                                              │
└─────────────────────────────────────────────────────────┘
```

**스타일**:
- 배경: primary-50 (연한 파란색)
- 읽지 않음 표시: 🔵 (파란 점)
- 텍스트: 굵게 (Bold)

#### 읽은 알림
```
┌─────────────────────────────────────────────────────────┐
│ ⚪ [공지] 코딩테스트 마스터 스터디                        │
│    "이번 주 일정 안내" 공지가 등록되었습니다              │
│    5시간 전                                              │
└─────────────────────────────────────────────────────────┘
```

**스타일**:
- 배경: white
- 읽음 표시: ⚪ (흰 점)
- 텍스트: 일반 (Normal)

---

### 3. 알림 카드

**알림 구조**:
```
┌─────────────────────────────────────────────────────────┐
│ 🔵/⚪ [유형] 스터디명                                     │
│    알림 내용 메시지                                      │
│    시간 (상대 시간)                                      │
└─────────────────────────────────────────────────────────┘
```

**알림 유형**:
1. **[가입승인]**: 스터디 가입 승인/거절
   - 배지: success-100 (초록)
   
2. **[공지]**: 새 공지사항
   - 배지: primary-100 (파란)
   
3. **[파일]**: 새 파일 업로드
   - 배지: info-100 (하늘)
   
4. **[일정]**: 새 일정 또는 임박한 일정
   - 배지: warning-100 (노란)
   
5. **[할일]**: 할 일 완료/추가
   - 배지: gray-100
   
6. **[멤버]**: 새 멤버 가입/퇴장
   - 배지: purple-100
   
7. **[강퇴]**: 스터디에서 강퇴됨
   - 배지: danger-100 (빨간)

---

### 4. 클릭 동작

**알림 클릭**:
1. 읽지 않은 알림 → 읽음 처리
2. 해당 페이지로 이동
   - 가입승인 → `/studies/[studyId]`
   - 공지 → `/studies/[studyId]/notices/[noticeId]`
   - 파일 → `/studies/[studyId]/files`
   - 일정 → `/studies/[studyId]/calendar`
   - 할일 → `/studies/[studyId]/tasks`

---

### 5. 빈 상태
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                   [일러스트 - 종]                        │
│                                                         │
│              알림이 없습니다                             │
│         새로운 알림이 오면 여기에 표시됩니다              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎬 인터랙션

### 실시간 알림 수신 (WebSocket)
```javascript
const { socket } = useSocket()

useEffect(() => {
  if (!socket) return
  
  // 새 알림 수신
  socket.on('notification', (notification) => {
    // Zustand 상태 업데이트
    addNotification(notification)
    
    // Toast 알림
    toast.info(notification.title, {
      description: notification.message,
      action: {
        label: '확인',
        onClick: () => router.push(notification.link)
      }
    })
    
    // React Query 캐시 무효화
    queryClient.invalidateQueries(['notifications'])
  })
  
  return () => {
    socket.off('notification')
  }
}, [socket])
```

### 알림 읽음 처리
```javascript
const handleClick = async (notification) => {
  // 읽지 않은 알림만 처리
  if (!notification.isRead) {
    await api.patch(`/api/v1/notifications/${notification.id}/read`)
    
    // Optimistic Update
    queryClient.setQueryData(['notifications'], (old) => ({
      ...old,
      data: old.data.map(n =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    }))
  }
  
  // 링크로 이동
  if (notification.link) {
    router.push(notification.link)
  }
}
```

### 모두 읽음 처리
```javascript
const handleMarkAllAsRead = async () => {
  await api.patch('/api/v1/notifications/mark-all-read')
  
  toast.success('모든 알림을 읽음 처리했습니다!')
  refetch()
}
```

---

## 📱 반응형 설계

### Desktop
- 알림 카드: 전체 너비
- 페이지네이션: 하단

### Mobile
- 알림 카드: 전체 너비
- 유형 배지: 아이콘만
- 시간: 짧게 (2시간 전 → 2h)

---

## 🎨 스타일 코드

```css
/* 알림 카드 */
.notification-card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-card:hover {
  box-shadow: var(--shadow-sm);
  background: var(--gray-50);
}

.notification-card.unread {
  background: var(--primary-50);
  border-color: var(--primary-200);
}

/* 읽지 않음 점 */
.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-500);
  display: inline-block;
  margin-right: 8px;
}

/* 유형 배지 */
.notification-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
}

.notification-badge.join {
  background: var(--success-100);
  color: var(--success-700);
}

.notification-badge.notice {
  background: var(--primary-100);
  color: var(--primary-700);
}

.notification-badge.file {
  background: var(--info-100);
  color: var(--info-700);
}

.notification-badge.event {
  background: var(--warning-100);
  color: var(--warning-700);
}

/* 알림 내용 */
.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 4px;
}

.notification-message {
  font-size: 14px;
  color: var(--gray-700);
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: var(--gray-500);
}
```

---

## 📐 ASCII 스케치

```
┌──────┬──────────────────────────────────────────────────┐
│      │                                                  │
│ 🏠   │ 알림         [전체] [읽지않음]      [모두읽음]   │
│ 🔍   │                                                  │
│ 👥   │ ┌──────────────────────────────────────────────┐│
│ 📋   │ │ 🔵 [가입] 코딩테스트 스터디                  ││
│ 🔔   │ │    가입이 승인되었습니다                     ││
│ 👤   │ │    2시간 전                                  ││
│      │ └──────────────────────────────────────────────┘│
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐│
│      │ │ ⚪ [공지] 코딩테스트 스터디                   ││
│      │ │    "이번 주 일정" 공지가 등록되었습니다      ││
│      │ │    5시간 전                                  ││
│      │ └──────────────────────────────────────────────┘│
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐│
│      │ │ ⚪ [파일] 취업 준비 스터디                    ││
│      │ │    이영희님이 파일을 업로드했습니다          ││
│      │ │    1일 전                                    ││
│      │ └──────────────────────────────────────────────┘│
│      │                                                  │
│      │            ← [1] 2 3 4 5 →                      │
└──────┴──────────────────────────────────────────────────┘
```

---

## ✅ 완료 체크리스트

- [ ] 알림 목록 표시
- [ ] 읽음/읽지않음 필터
- [ ] WebSocket 실시간 알림
- [ ] 알림 클릭 → 읽음 처리 + 이동
- [ ] Toast 알림 표시
- [ ] 모두 읽음 처리
- [ ] 페이지네이션
- [ ] 빈 상태 UI
- [ ] 유형별 배지 색상
- [ ] 헤더 알림 배지 업데이트

---

**모든 화면 설계 완료!** 🎉
