# 테마 및 외관 설정 예외 처리

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025-11-29  
**담당 영역**: 테마, 외관, 접근성 설정  
**관련 파일**:
- `src/app/user/settings/components/ThemeSettings.jsx`
- `src/contexts/ThemeContext.jsx`

---

## 📋 목차

1. [테마 설정 개요](#1-테마-설정-개요)
2. [다크/라이트 모드 예외](#2-다크라이트-모드-예외)
3. [폰트 크기 조절 예외](#3-폰트-크기-조절-예외)
4. [컬러 테마 예외](#4-컬러-테마-예외)
5. [시스템 설정 동기화](#5-시스템-설정-동기화)

---

## 1. 테마 설정 개요

### 설정 옵션
```javascript
const themeSettings = {
  theme: 'light',           // 'light' | 'dark' | 'system'
  fontSize: 'medium',       // 'small' | 'medium' | 'large'
  accentColor: 'purple',    // 'purple' | 'blue' | 'green' | 'yellow' | 'red'
}
```

---

## 2. 다크/라이트 모드 예외

### 2.1 시스템 설정 따르기

#### ✅ prefers-color-scheme 감지
```javascript
// ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system')
  const [effectiveTheme, setEffectiveTheme] = useState('light')
  
  // 시스템 테마 감지
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const updateTheme = () => {
        setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light')
      }
      
      // 초기 설정
      updateTheme()
      
      // 변경 감지
      mediaQuery.addEventListener('change', updateTheme)
      
      return () => mediaQuery.removeEventListener('change', updateTheme)
    } else {
      setEffectiveTheme(theme)
    }
  }, [theme])
  
  // DOM에 테마 적용
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme)
    
    // 메타 태그 업데이트 (모바일 상단바 색상)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        effectiveTheme === 'dark' ? '#1a1a1a' : '#ffffff'
      )
    }
  }, [effectiveTheme])
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

---

### 2.2 테마 전환 깜빡임 방지

#### ❌ 문제 상황
```javascript
// 페이지 로드 시 라이트 모드로 렌더링 → 다크 모드로 전환 (깜빡임)
```

#### ✅ SSR 대응
```javascript
// app/layout.jsx
export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 테마 초기화 스크립트 (blocking) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'system';
                let effectiveTheme = theme;
                
                if (theme === 'system') {
                  effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
                }
                
                document.documentElement.setAttribute('data-theme', effectiveTheme);
              })();
            `
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

### 2.3 테마 전환 애니메이션

#### 🎯 부드러운 전환
```javascript
const handleThemeChange = (newTheme) => {
  // CSS transition 추가
  document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease'
  
  setTheme(newTheme)
  
  // localStorage 저장
  localStorage.setItem('theme', newTheme)
  
  // transition 제거 (다른 요소에 영향 방지)
  setTimeout(() => {
    document.documentElement.style.transition = ''
  }, 300)
}
```

---

## 3. 폰트 크기 조절 예외

### 3.1 CSS 변수 기반 크기 조절

#### ✅ 구현
```css
/* globals.css */
:root {
  /* 기본 크기 */
  --font-size-base: 16px;
  --font-size-sm: 14px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
}

[data-font-size="small"] {
  --font-size-base: 14px;
  --font-size-sm: 12px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
}

[data-font-size="large"] {
  --font-size-base: 18px;
  --font-size-sm: 16px;
  --font-size-lg: 20px;
  --font-size-xl: 24px;
}

body {
  font-size: var(--font-size-base);
}
```

```javascript
// 적용
const handleFontSizeChange = (size) => {
  document.documentElement.setAttribute('data-font-size', size)
  setSettings({ ...settings, fontSize: size })
  localStorage.setItem('fontSize', size)
}
```

---

### 3.2 레이아웃 깨짐 방지

#### ⚠️ 문제
```javascript
// 폰트 크기 변경 시 고정 높이 요소가 깨질 수 있음
// 예: 헤더, 사이드바, 카드
```

#### ✅ 해결
```css
/* 고정 크기 대신 상대 크기 사용 */
.header {
  /* ❌ height: 64px; */
  /* ✅ */ height: 4rem;  /* 폰트 크기에 비례 */
  /* ✅ */ padding: 1rem;
}

.card {
  /* ❌ min-height: 200px; */
  /* ✅ */ min-height: 12.5rem;
}

/* 텍스트 잘림 방지 */
.title {
  /* ✅ */ overflow-wrap: break-word;
  /* ✅ */ word-break: break-word;
}
```

---

### 3.3 접근성 고려

#### 🎯 WCAG 준수
```javascript
// 최소/최대 크기 제한
const MIN_FONT_SIZE = 12  // px
const MAX_FONT_SIZE = 24  // px

const fontSizeOptions = [
  { 
    value: 'small', 
    label: '작게', 
    size: 14,
    accessible: MIN_FONT_SIZE <= 14  // true
  },
  { 
    value: 'medium', 
    label: '보통', 
    size: 16,
    accessible: true  // 권장
  },
  { 
    value: 'large', 
    label: '크게', 
    size: 18,
    accessible: true
  },
]

// 사용자 정의 크기 (고급 옵션)
const handleCustomFontSize = (size) => {
  if (size < MIN_FONT_SIZE || size > MAX_FONT_SIZE) {
    alert(`폰트 크기는 ${MIN_FONT_SIZE}px ~ ${MAX_FONT_SIZE}px 사이여야 합니다.`)
    return
  }
  
  document.documentElement.style.setProperty('--font-size-base', `${size}px`)
  localStorage.setItem('customFontSize', size)
}
```

---

## 4. 컬러 테마 예외

### 4.1 강조색 변경

#### ✅ CSS 변수 기반
```css
/* globals.css */
:root {
  --color-primary: #C7B8EA;  /* 기본: 보라색 */
}

[data-accent-color="blue"] {
  --color-primary: #60A5FA;
}

[data-accent-color="green"] {
  --color-primary: #34D399;
}

[data-accent-color="yellow"] {
  --color-primary: #FBBF24;
}

[data-accent-color="red"] {
  --color-primary: #F87171;
}

/* 사용 */
.button-primary {
  background-color: var(--color-primary);
}

.link {
  color: var(--color-primary);
}
```

---

### 4.2 대비율 (Contrast Ratio) 검증

#### ✅ WCAG AA 기준 (4.5:1)
```javascript
// 대비율 계산 함수
function getContrastRatio(foreground, background) {
  const getLuminance = (rgb) => {
    const [r, g, b] = rgb.map(val => {
      val = val / 255
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  const l1 = getLuminance(foreground) + 0.05
  const l2 = getLuminance(background) + 0.05
  
  return l1 > l2 ? l1 / l2 : l2 / l1
}

// 강조색 검증
const validateAccentColor = (color, background) => {
  const ratio = getContrastRatio(
    hexToRgb(color),
    hexToRgb(background)
  )
  
  if (ratio < 4.5) {
    console.warn('Contrast ratio too low:', ratio)
    return false
  }
  
  return true
}

// 적용 시 검증
const handleAccentColorChange = (color) => {
  const backgroundColor = effectiveTheme === 'dark' 
    ? '#1a1a1a' 
    : '#ffffff'
  
  if (!validateAccentColor(colorMap[color], backgroundColor)) {
    alert('이 색상은 현재 테마에서 가독성이 낮습니다.')
    return
  }
  
  setSettings({ ...settings, accentColor: color })
}
```

---

### 4.3 색각 이상 지원

#### 🎯 패턴 및 아이콘 병행 사용
```javascript
// 색상만으로 정보 전달 금지
// ❌
<div style={{ color: 'red' }}>오류</div>
<div style={{ color: 'green' }}>성공</div>

// ✅ 아이콘 병행
<div className={styles.error}>
  ❌ 오류
</div>
<div className={styles.success}>
  ✅ 성공
</div>

// ✅ 텍스트 레이블
<div className={styles.status}>
  <span className={styles.indicator} data-status="error" />
  <span>오류</span>
</div>
```

---

## 5. 시스템 설정 동기화

### 5.1 OS 테마 변경 감지

#### ✅ 실시간 동기화
```javascript
useEffect(() => {
  if (settings.theme !== 'system') return
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = (e) => {
    const newTheme = e.matches ? 'dark' : 'light'
    setEffectiveTheme(newTheme)
    
    // 사용자에게 알림 (옵션)
    showToast(`시스템 테마가 ${newTheme === 'dark' ? '다크' : '라이트'} 모드로 변경되었습니다`)
  }
  
  mediaQuery.addEventListener('change', handleChange)
  
  return () => mediaQuery.removeEventListener('change', handleChange)
}, [settings.theme])
```

---

### 5.2 저장 및 복원

#### ✅ LocalStorage + API
```javascript
// 저장
const saveThemeSettings = async (settings) => {
  // 1. localStorage에 즉시 저장 (빠른 복원)
  localStorage.setItem('themeSettings', JSON.stringify(settings))
  
  // 2. 서버에 저장 (다른 디바이스 동기화)
  try {
    await api.put('/api/user/settings/theme', settings)
  } catch (error) {
    console.error('Theme settings sync failed:', error)
    // 실패해도 localStorage는 사용 가능
  }
}

// 복원
const loadThemeSettings = async () => {
  // 1. localStorage에서 즉시 로드
  const localSettings = localStorage.getItem('themeSettings')
  if (localSettings) {
    const parsed = JSON.parse(localSettings)
    applyThemeSettings(parsed)
  }
  
  // 2. 서버에서 최신 설정 가져오기
  try {
    const data = await api.get('/api/user/settings/theme')
    const serverSettings = data.settings
    
    // localStorage와 다르면 업데이트
    if (JSON.stringify(localSettings) !== JSON.stringify(serverSettings)) {
      applyThemeSettings(serverSettings)
      localStorage.setItem('themeSettings', JSON.stringify(serverSettings))
    }
  } catch (error) {
    console.error('Theme settings load failed:', error)
    // localStorage 설정 유지
  }
}
```

---

### 5.3 초기 로딩 최적화

#### ✅ Critical CSS
```html
<!-- app/layout.jsx -->
<head>
  <style dangerouslySetInnerHTML={{ __html: `
    /* Critical CSS - 깜빡임 방지 */
    [data-theme="dark"] {
      background-color: #1a1a1a;
      color: #ffffff;
    }
    [data-theme="light"] {
      background-color: #ffffff;
      color: #000000;
    }
  `}} />
</head>
```

---

## 📚 테스트 케이스

```javascript
describe('Theme Settings', () => {
  test('시스템 테마 감지', () => {
    // Mock matchMedia
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }))
    
    const { effectiveTheme } = useTheme()
    expect(effectiveTheme).toBe('dark')
  })
  
  test('대비율 검증', () => {
    const ratio = getContrastRatio([255, 255, 255], [0, 0, 0])
    expect(ratio).toBeGreaterThan(4.5)  // WCAG AA
  })
  
  test('폰트 크기 범위 제한', () => {
    expect(validateFontSize(10)).toBe(false)  // 너무 작음
    expect(validateFontSize(16)).toBe(true)   // 적절
    expect(validateFontSize(30)).toBe(false)  // 너무 큼
  })
})
```

---

**문서 끝** - 테마 설정의 모든 예외 상황 커버

