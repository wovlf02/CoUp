# 설정 관리 모범 사례

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025-11-29  
**담당 영역**: 설정 관리 전반

---

## 📋 목차

1. [설정 구조 설계](#1-설정-구조-설계)
2. [저장 및 동기화 전략](#2-저장-및-동기화-전략)
3. [UI/UX 모범 사례](#3-uiux-모범-사례)
4. [보안 및 검증](#4-보안-및-검증)
5. [성능 최적화](#5-성능-최적화)
6. [테스트 전략](#6-테스트-전략)

---

## 1. 설정 구조 설계

### 1.1 설정 계층화

#### ✅ 권장 구조
```javascript
const settingsStructure = {
  // 계정 설정
  account: {
    email: 'user@example.com',
    emailVerified: true,
    twoFactorEnabled: false,
  },
  
  // 프로필 설정
  profile: {
    name: '홍길동',
    avatar: '/uploads/avatar.jpg',
    bio: '안녕하세요',
    visibility: 'public', // 'public' | 'friends' | 'private'
  },
  
  // 알림 설정
  notifications: {
    push: {
      newMessage: true,
      studyInvite: true,
      announcement: false,
    },
    email: {
      important: true,
      weekly: false,
      marketing: false,
    }
  },
  
  // 화면 설정
  appearance: {
    theme: 'system',      // 'light' | 'dark' | 'system'
    fontSize: 'medium',   // 'small' | 'medium' | 'large'
    accentColor: 'purple',
    language: 'ko',
  },
  
  // 개인정보 설정
  privacy: {
    profileVisibility: 'public',
    showActivity: true,
    allowSearch: true,
  },
  
  // 접근성 설정
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    screenReader: false,
  }
}
```

---

### 1.2 기본값 설정

#### ✅ 안전한 기본값
```javascript
// 보수적인 기본값 (개인정보 보호 우선)
const DEFAULT_SETTINGS = {
  notifications: {
    push: {
      newMessage: true,        // 중요 알림만 기본 활성화
      studyInvite: true,
      announcement: false,     // 선택 알림은 비활성화
    },
    email: {
      important: true,         // 필수 알림
      weekly: false,           // 마케팅은 비활성화
      marketing: false,
    }
  },
  privacy: {
    profileVisibility: 'public',  // 기능 활용도 우선
    showActivity: true,
    allowSearch: true,
  }
}

// 사용
const getUserSettings = (userSettings) => {
  return {
    ...DEFAULT_SETTINGS,
    ...userSettings,
    // 중첩 객체 병합
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...userSettings.notifications,
      push: {
        ...DEFAULT_SETTINGS.notifications.push,
        ...userSettings.notifications?.push,
      },
      email: {
        ...DEFAULT_SETTINGS.notifications.email,
        ...userSettings.notifications?.email,
      }
    }
  }
}
```

---

## 2. 저장 및 동기화 전략

### 2.1 3-Tier 저장 전략

#### ✅ 계층적 저장
```javascript
class SettingsManager {
  // Tier 1: 메모리 (가장 빠름)
  private memoryCache = new Map()
  
  // Tier 2: LocalStorage (빠름, 영구)
  private storage = window.localStorage
  
  // Tier 3: 서버 (느림, 동기화)
  private api = api
  
  async getSetting(key) {
    // 1. 메모리 캐시 확인
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)
    }
    
    // 2. LocalStorage 확인
    const localValue = this.storage.getItem(key)
    if (localValue) {
      const parsed = JSON.parse(localValue)
      this.memoryCache.set(key, parsed)
      return parsed
    }
    
    // 3. 서버에서 가져오기
    try {
      const serverValue = await this.api.get(`/api/settings/${key}`)
      this.storage.setItem(key, JSON.stringify(serverValue))
      this.memoryCache.set(key, serverValue)
      return serverValue
    } catch (error) {
      console.error('Failed to fetch setting:', error)
      return null
    }
  }
  
  async setSetting(key, value) {
    // 1. 메모리에 즉시 반영
    this.memoryCache.set(key, value)
    
    // 2. LocalStorage에 저장 (동기)
    this.storage.setItem(key, JSON.stringify(value))
    
    // 3. 서버에 저장 (비동기, 실패해도 무시)
    try {
      await this.api.put(`/api/settings/${key}`, value)
    } catch (error) {
      console.error('Failed to sync setting:', error)
      // 나중에 재시도 큐에 추가
      this.addToSyncQueue(key, value)
    }
  }
  
  // 재시도 큐
  private syncQueue = []
  
  addToSyncQueue(key, value) {
    this.syncQueue.push({ key, value, attempts: 0 })
    this.processSync Queue()
  }
  
  async processSyncQueue() {
    for (const item of this.syncQueue) {
      if (item.attempts >= 3) continue // 최대 3번 시도
      
      try {
        await this.api.put(`/api/settings/${item.key}`, item.value)
        // 성공 시 큐에서 제거
        this.syncQueue = this.syncQueue.filter(i => i !== item)
      } catch (error) {
        item.attempts++
      }
    }
  }
}
```

---

### 2.2 낙관적 업데이트

#### ✅ 즉각적인 피드백
```javascript
const useOptimisticSettings = () => {
  const [settings, setSettings] = useState({})
  const [syncing, setSyncing] = useState(false)
  
  const updateSetting = async (key, value) => {
    // 1. UI 즉시 업데이트 (낙관적)
    const prevValue = settings[key]
    setSettings({ ...settings, [key]: value })
    
    // 2. 백그라운드 저장
    setSyncing(true)
    try {
      await api.put(`/api/settings/${key}`, value)
      // 성공 - 그대로 유지
    } catch (error) {
      // 실패 - 롤백
      setSettings({ ...settings, [key]: prevValue })
      showToast('설정 저장에 실패했습니다', 'error')
    } finally {
      setSyncing(false)
    }
  }
  
  return { settings, updateSetting, syncing }
}
```

---

### 2.3 멀티 디바이스 동기화

#### ✅ WebSocket 기반 실시간 동기화
```javascript
// 설정 동기화 Hook
const useSettingsSync = () => {
  const { settings, setSettings } = useSettings()
  
  useEffect(() => {
    const ws = new WebSocket(`wss://api.coup.com/settings/sync`)
    
    ws.onopen = () => {
      // 연결 시 현재 설정 전송
      ws.send(JSON.stringify({
        type: 'INIT',
        settings: settings
      }))
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'SETTINGS_UPDATED') {
        // 다른 디바이스에서 변경됨
        setSettings(data.settings)
        
        showToast(
          '다른 기기에서 설정이 변경되었습니다',
          'info'
        )
      }
    }
    
    return () => ws.close()
  }, [])
}
```

---

## 3. UI/UX 모범 사례

### 3.1 변경 감지 및 저장 표시

#### ✅ 명확한 상태 표시
```javascript
function SettingsForm() {
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  
  return (
    <div className={styles.form}>
      {/* 상태 표시 */}
      <div className={styles.statusBar}>
        {isSaving && (
          <span className={styles.saving}>
            💾 저장 중...
          </span>
        )}
        
        {!isSaving && hasChanges && (
          <span className={styles.unsaved}>
            ⚠️ 저장되지 않은 변경사항
          </span>
        )}
        
        {!isSaving && !hasChanges && lastSaved && (
          <span className={styles.saved}>
            ✅ 마지막 저장: {formatRelativeTime(lastSaved)}
          </span>
        )}
      </div>
      
      {/* 설정 옵션들 */}
      {/* ... */}
      
      {/* 액션 버튼 */}
      <div className={styles.actions}>
        <button
          onClick={handleCancel}
          disabled={!hasChanges || isSaving}
        >
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={styles.primaryButton}
        >
          {isSaving ? '저장 중...' : '변경사항 저장'}
        </button>
      </div>
    </div>
  )
}
```

---

### 3.2 설정 검색

#### 🎯 대규모 설정 페이지
```javascript
function SettingsSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  
  const allSettings = [
    { id: 'email', label: '이메일 변경', category: '계정' },
    { id: 'password', label: '비밀번호 변경', category: '계정' },
    { id: 'theme', label: '테마 설정', category: '화면' },
    { id: 'notifications', label: '알림 설정', category: '알림' },
    // ...
  ]
  
  useEffect(() => {
    if (!searchQuery) {
      setResults([])
      return
    }
    
    const filtered = allSettings.filter(setting =>
      setting.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    setResults(filtered)
  }, [searchQuery])
  
  return (
    <div className={styles.searchContainer}>
      <input
        type="search"
        placeholder="설정 검색... (예: 비밀번호, 알림)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchInput}
      />
      
      {results.length > 0 && (
        <div className={styles.searchResults}>
          {results.map(result => (
            <button
              key={result.id}
              className={styles.searchResult}
              onClick={() => navigateToSetting(result.id)}
            >
              <span className={styles.category}>{result.category}</span>
              <span className={styles.label}>{result.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### 3.3 설정 Import/Export

#### 🎯 백업 및 마이그레이션
```javascript
// Export
const exportSettings = () => {
  const settingsToExport = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    settings: {
      notifications: settings.notifications,
      appearance: settings.appearance,
      privacy: settings.privacy,
    }
  }
  
  const blob = new Blob(
    [JSON.stringify(settingsToExport, null, 2)],
    { type: 'application/json' }
  )
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `coup-settings-${Date.now()}.json`
  a.click()
  
  URL.revokeObjectURL(url)
}

// Import
const importSettings = async (file) => {
  try {
    const text = await file.text()
    const imported = JSON.parse(text)
    
    // 버전 확인
    if (imported.version !== '1.0') {
      throw new Error('지원하지 않는 버전입니다')
    }
    
    // 설정 검증
    validateSettings(imported.settings)
    
    // 적용
    await api.put('/api/settings', imported.settings)
    setSettings(imported.settings)
    
    showToast('설정을 가져왔습니다', 'success')
    
  } catch (error) {
    showToast('설정 가져오기에 실패했습니다', 'error')
  }
}
```

---

## 4. 보안 및 검증

### 4.1 설정 값 검증

#### ✅ Zod 스키마
```javascript
import { z } from 'zod'

const NotificationSettingsSchema = z.object({
  push: z.object({
    newMessage: z.boolean(),
    studyInvite: z.boolean(),
    announcement: z.boolean(),
  }),
  email: z.object({
    important: z.boolean(),
    weekly: z.boolean(),
    marketing: z.boolean(),
  })
})

const ThemeSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  fontSize: z.enum(['small', 'medium', 'large']),
  accentColor: z.enum(['purple', 'blue', 'green', 'yellow', 'red']),
})

// API에서 사용
export async function PUT(request) {
  try {
    const body = await request.json()
    
    // 검증
    const validated = NotificationSettingsSchema.parse(body)
    
    // 저장
    await prisma.user.update({
      where: { id: userId },
      data: { notificationSettings: validated }
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 설정 형식입니다', details: error.errors },
        { status: 400 }
      )
    }
    throw error
  }
}
```

---

### 4.2 민감한 설정 보호

#### ✅ 재인증 요구
```javascript
// 민감한 설정 변경 전 비밀번호 확인
const sensitiveSettings = ['email', 'password', 'twoFactor']

const handleSensitiveChange = async (setting, value) => {
  // 1. 재인증 모달 표시
  const password = await showReauthModal()
  
  if (!password) return // 취소됨
  
  // 2. 비밀번호 확인
  try {
    await api.post('/api/auth/verify-password', { password })
  } catch (error) {
    showToast('비밀번호가 일치하지 않습니다', 'error')
    return
  }
  
  // 3. 설정 변경
  try {
    await api.put(`/api/settings/${setting}`, { value })
    showToast('설정이 변경되었습니다', 'success')
  } catch (error) {
    showToast('설정 변경에 실패했습니다', 'error')
  }
}
```

---

## 5. 성능 최적화

### 5.1 설정 그룹화

#### ✅ Batch Update
```javascript
// ❌ 나쁜 예: 각 설정마다 API 호출
const handleToggle1 = async () => {
  await api.put('/api/settings/push.newMessage', true)
}
const handleToggle2 = async () => {
  await api.put('/api/settings/push.studyInvite', true)
}

// ✅ 좋은 예: 설정을 모아서 한 번에 저장
const handleSave = async () => {
  await api.put('/api/settings/notifications', {
    push: {
      newMessage: true,
      studyInvite: true,
      // ...
    },
    email: {
      // ...
    }
  })
}
```

---

### 5.2 Debouncing

#### ✅ 연속 변경 최적화
```javascript
import { useDebouncedCallback } from 'use-debounce'

function ThemeSettings() {
  const [settings, setSettings] = useState({})
  
  // 500ms 디바운스
  const debouncedSave = useDebouncedCallback(
    async (newSettings) => {
      await api.put('/api/settings/theme', newSettings)
    },
    500
  )
  
  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    
    // 1. UI 즉시 업데이트
    setSettings(newSettings)
    
    // 2. 저장은 디바운스
    debouncedSave(newSettings)
  }
  
  return (
    // ...
  )
}
```

---

## 6. 테스트 전략

### 6.1 단위 테스트
```javascript
describe('Settings Manager', () => {
  test('기본값 병합', () => {
    const userSettings = { theme: 'dark' }
    const result = mergeWithDefaults(DEFAULT_SETTINGS, userSettings)
    
    expect(result.theme).toBe('dark')
    expect(result.fontSize).toBe('medium') // 기본값
  })
  
  test('설정 검증', () => {
    expect(() => {
      validateSettings({ theme: 'invalid' })
    }).toThrow()
    
    expect(() => {
      validateSettings({ theme: 'dark' })
    }).not.toThrow()
  })
})
```

### 6.2 E2E 테스트
```javascript
test('설정 변경 플로우', async ({ page }) => {
  await page.goto('/user/settings')
  
  // 테마 변경
  await page.click('[data-theme="dark"]')
  
  // 저장 확인
  await expect(page.locator('.toast')).toContainText('저장되었습니다')
  
  // 새로고침 후 유지 확인
  await page.reload()
  await expect(page.locator('[data-theme="dark"]')).toBeChecked()
})
```

---

**문서 끝** - 설정 관리의 모든 모범 사례

