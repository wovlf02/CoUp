# 알림 설정 예외 처리

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025-11-29  
**담당 영역**: 알림 설정 관리  
**관련 파일**:
- `src/app/user/settings/components/NotificationSettings.jsx`
- `src/app/api/user/settings/notifications/route.js`

---

## 📋 목차

1. [알림 설정 개요](#1-알림-설정-개요)
2. [알림 타입 예외](#2-알림-타입-예외)
3. [저장 및 동기화 예외](#3-저장-및-동기화-예외)
4. [브라우저 권한 예외](#4-브라우저-권한-예외)
5. [푸시 알림 예외](#5-푸시-알림-예외)

---

## 1. 알림 설정 개요

### 알림 카테고리

#### 1.1 푸시 알림 (Push Notifications)
```javascript
const pushSettings = {
  pushNewMessage: true,          // 새 메시지
  pushStudyInvite: true,          // 스터디 초대
  pushAttendanceReminder: true,   // 출석 리마인더
  pushAnnouncement: false,        // 공지사항
}
```

#### 1.2 이메일 알림
```javascript
const emailSettings = {
  emailImportant: true,      // 중요 공지
  emailWeeklySummary: false, // 주간 요약
  emailMarketing: false,     // 마케팅 정보
}
```

---

## 2. 알림 타입 예외

### 2.1 필수 알림 비활성화 방지

#### ❌ 문제 상황
```javascript
// 보안 관련 알림은 비활성화 불가능해야 함
const criticalNotifications = [
  'passwordChanged',     // 비밀번호 변경
  'loginFromNewDevice',  // 새 기기 로그인
  'accountSuspended',    // 계정 정지
]
```

#### ✅ 해결 방법
```javascript
// UI에서 필수 알림 표시
const notificationOptions = [
  {
    key: 'pushNewMessage',
    label: '새 메시지 알림',
    required: false,
  },
  {
    key: 'pushSecurityAlert',
    label: '보안 알림',
    required: true, // 필수 알림
    tooltip: '보안을 위해 비활성화할 수 없습니다'
  },
]

// 렌더링
{notificationOptions.map(option => (
  <label key={option.key} className={styles.option}>
    <input
      type="checkbox"
      checked={settings[option.key]}
      onChange={() => handleToggle(option.key)}
      disabled={option.required}
      className={styles.checkbox}
    />
    <span>{option.label}</span>
    {option.required && (
      <span className={styles.requiredBadge}>필수</span>
    )}
    {option.tooltip && (
      <span className={styles.tooltip}>{option.tooltip}</span>
    )}
  </label>
))}
```

---

### 2.2 알림 설정 검증

#### ✅ 클라이언트 검증
```javascript
const handleToggle = (key) => {
  // 필수 알림 체크
  const requiredNotifications = ['pushSecurityAlert', 'emailImportant']
  
  if (requiredNotifications.includes(key)) {
    alert('이 알림은 보안을 위해 비활성화할 수 없습니다.')
    return
  }
  
  setSettings({ ...settings, [key]: !settings[key] })
}
```

#### ✅ 서버 검증
```javascript
// API
export async function PUT(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    
    // 필수 알림 강제 활성화
    const validatedSettings = {
      ...body,
      pushSecurityAlert: true,  // 항상 true
      emailImportant: true,      // 항상 true
    }
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notificationSettings: validatedSettings
      }
    })
    
    return NextResponse.json({ 
      success: true,
      settings: validatedSettings 
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: "알림 설정 저장 실패" },
      { status: 500 }
    )
  }
}
```

---

## 3. 저장 및 동기화 예외

### 3.1 자동 저장 vs 명시적 저장

#### 🎯 하이브리드 접근
```javascript
function NotificationSettings() {
  const [settings, setSettings] = useState({...})
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [initialSettings, setInitialSettings] = useState({...})
  
  // 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.get('/api/user/settings/notifications')
        setSettings(data.settings)
        setInitialSettings(data.settings)
      } catch (error) {
        console.error('Load error:', error)
      }
    }
    
    loadSettings()
  }, [])
  
  // 변경 감지
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(initialSettings)
    setHasChanges(changed)
  }, [settings, initialSettings])
  
  // 토글 핸들러
  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] })
  }
  
  // 명시적 저장
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const data = await api.put('/api/user/settings/notifications', settings)
      setInitialSettings(settings)
      setHasChanges(false)
      alert('알림 설정이 저장되었습니다.')
    } catch (error) {
      alert('알림 설정 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }
  
  // 페이지 떠나기 전 경고
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... 알림 옵션들 ... */}
      
      {/* 저장 버튼 */}
      <div className={styles.actions}>
        {hasChanges && (
          <span className={styles.unsavedIndicator}>
            ⚠️ 저장되지 않은 변경사항
          </span>
        )}
        <button
          type="submit"
          disabled={isSaving || !hasChanges}
          className={styles.saveButton}
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  )
}
```

---

### 3.2 낙관적 업데이트 (Optimistic Update)

#### 🎯 즉각적인 UI 반응
```javascript
const handleToggle = async (key) => {
  // 1. 즉시 UI 업데이트
  const newValue = !settings[key]
  setSettings({ ...settings, [key]: newValue })
  
  // 2. 백그라운드 저장
  try {
    await api.put('/api/user/settings/notifications', {
      ...settings,
      [key]: newValue
    })
    
    // 성공 시 작은 토스트 알림
    showToast('설정이 저장되었습니다', 'success')
    
  } catch (error) {
    // 3. 실패 시 원상복구
    setSettings({ ...settings, [key]: !newValue })
    showToast('설정 저장에 실패했습니다', 'error')
  }
}
```

---

### 3.3 여러 디바이스 동기화

#### ✅ 실시간 동기화
```javascript
// WebSocket으로 설정 변경 알림
useEffect(() => {
  const ws = new WebSocket(`ws://api.coup.com/settings?userId=${userId}`)
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    
    if (data.type === 'SETTINGS_UPDATED') {
      // 다른 디바이스에서 설정이 변경됨
      setSettings(data.settings)
      
      showToast('다른 기기에서 설정이 변경되었습니다', 'info')
    }
  }
  
  return () => ws.close()
}, [userId])
```

---

## 4. 브라우저 권한 예외

### 4.1 푸시 알림 권한 요청

#### ✅ 권한 상태 확인
```javascript
const [permissionState, setPermissionState] = useState('default')
// 'default' | 'granted' | 'denied'

useEffect(() => {
  if ('Notification' in window) {
    setPermissionState(Notification.permission)
  }
}, [])

const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    alert('이 브라우저는 알림을 지원하지 않습니다.')
    return
  }
  
  if (Notification.permission === 'denied') {
    alert('알림이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.')
    return
  }
  
  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission()
    setPermissionState(permission)
    
    if (permission === 'granted') {
      // FCM 토큰 등록
      await registerPushToken()
    }
  }
}
```

#### 🎯 UI 표시
```javascript
{permissionState === 'denied' && (
  <div className={styles.permissionAlert}>
    <p>⚠️ 브라우저 알림이 차단되어 있습니다.</p>
    <button onClick={openBrowserSettings}>
      설정에서 허용하기
    </button>
  </div>
)}

{permissionState === 'default' && (
  <div className={styles.permissionPrompt}>
    <p>푸시 알림을 받으시겠습니까?</p>
    <button onClick={requestNotificationPermission}>
      알림 허용
    </button>
  </div>
)}

{permissionState === 'granted' && (
  <div className={styles.permissionGranted}>
    ✅ 푸시 알림이 활성화되었습니다.
  </div>
)}
```

---

### 4.2 Safari 푸시 알림 제한

#### ⚠️ Safari 특수 처리
```javascript
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

if (isSafari) {
  // Safari는 Service Worker 푸시 지원 제한적
  console.warn('Safari에서는 푸시 알림 지원이 제한적입니다.')
  
  // 대체 방법: 이메일 알림 권장
  if (settings.pushNewMessage && !settings.emailImportant) {
    showToast(
      'Safari에서는 이메일 알림 사용을 권장합니다',
      'warning'
    )
  }
}
```

---

## 5. 푸시 알림 예외

### 5.1 FCM 토큰 등록 실패

#### ✅ 재시도 로직
```javascript
const registerPushToken = async (retries = 3) => {
  try {
    const messaging = getMessaging()
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    })
    
    // 서버에 토큰 저장
    await api.post('/api/user/push-token', { token })
    
    return token
    
  } catch (error) {
    console.error('FCM token error:', error)
    
    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts left)`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return registerPushToken(retries - 1)
    }
    
    throw new Error('푸시 알림 등록에 실패했습니다.')
  }
}
```

---

### 5.2 Service Worker 등록 실패

#### ✅ Fallback 처리
```javascript
useEffect(() => {
  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported')
      return
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('SW registered:', registration)
      
      // FCM 토큰 등록
      await registerPushToken()
      
    } catch (error) {
      console.error('SW registration failed:', error)
      
      // Fallback: 이메일 알림 활성화 권장
      if (!settings.emailImportant) {
        showNotification({
          title: '푸시 알림 등록 실패',
          message: '이메일 알림을 대신 사용하시겠습니까?',
          actions: [
            {
              label: '예',
              onClick: () => {
                setSettings({
                  ...settings,
                  emailImportant: true
                })
              }
            }
          ]
        })
      }
    }
  }
  
  registerServiceWorker()
}, [])
```

---

### 5.3 알림 전송 실패

#### ✅ 서버 측 재시도
```javascript
// API - 알림 전송
async function sendPushNotification(userId, notification) {
  const maxRetries = 3
  let attempt = 0
  
  while (attempt < maxRetries) {
    try {
      // FCM 토큰 조회
      const tokens = await prisma.pushToken.findMany({
        where: { 
          userId,
          isActive: true
        }
      })
      
      if (tokens.length === 0) {
        console.log('No active push tokens for user:', userId)
        // Fallback: 이메일 전송
        await sendEmailNotification(userId, notification)
        return
      }
      
      // 푸시 알림 전송
      const results = await Promise.allSettled(
        tokens.map(token => 
          admin.messaging().send({
            token: token.token,
            notification: {
              title: notification.title,
              body: notification.body,
            }
          })
        )
      )
      
      // 실패한 토큰 비활성화
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === 'rejected') {
          await prisma.pushToken.update({
            where: { id: tokens[i].id },
            data: { isActive: false }
          })
        }
      }
      
      return
      
    } catch (error) {
      attempt++
      console.error(`Push notification attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) {
        // 최종 실패: 이메일로 대체
        await sendEmailNotification(userId, notification)
      } else {
        // 재시도 전 대기
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }
}
```

---

## 📚 테스트 케이스

```javascript
describe('Notification Settings', () => {
  test('필수 알림은 비활성화 불가', () => {
    const result = validateNotificationSettings({
      pushSecurityAlert: false  // 시도
    })
    
    expect(result.pushSecurityAlert).toBe(true)  // 강제 활성화
  })
  
  test('설정 변경 감지', () => {
    const initial = { pushNewMessage: true }
    const updated = { pushNewMessage: false }
    
    expect(hasSettingsChanged(initial, updated)).toBe(true)
  })
  
  test('브라우저 알림 권한 확인', () => {
    expect(canUsePushNotifications()).toBe(
      'Notification' in window
    )
  })
})
```

---

**문서 끝** - 알림 설정의 모든 예외 상황 커버

