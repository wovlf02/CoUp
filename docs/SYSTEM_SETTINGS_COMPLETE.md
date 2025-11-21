# 시스템 설정 페이지 구현 완료

## 📋 구현 일자
2025-01-21

## 🎯 목적
`/settings` 경로로 접근하는 **전역 시스템 설정 페이지** 구현
- `/user/settings`: 개인 설정 (프로필, 비밀번호 등)
- `/settings`: 시스템 설정 (언어, 테마, 접근성 등) ← **새로 구현**

---

## ✅ 구현된 기능

### 1. 언어 설정 (LanguageSettings.jsx)
```
🌍 표시 언어
- 한국어 (Korean)
- English
- 日本語 (Japanese)

📅 날짜 형식
- YYYY-MM-DD (2025-01-21)
- MM/DD/YYYY (01/21/2025)
- DD.MM.YYYY (21.01.2025)

🕐 시간 형식
- 24시간 (14:30)
- 12시간 (2:30 PM)

🌐 시간대
- Asia/Seoul (GMT+9)
- America/New York (GMT-5)
- Europe/London (GMT+0)
- 기타...
```

### 2. 외관 설정 (AppearanceSettings.jsx)
```
🎨 테마
- ☀️ 라이트 모드
- 🌙 다크 모드
- 💻 시스템 설정 따르기
- 🌗 자동 (시간에 따라)

📏 폰트 크기
- 슬라이더 (80% ~ 150%)
- 실시간 미리보기

🎭 애니메이션
- 페이지 전환 애니메이션
- 호버 효과
- 애니메이션 줄이기

🖼️ 배경
- 단색
- 그라데이션
- 패턴
```

### 3. 접근성 (AccessibilitySettings.jsx)
```
⌨️ 키보드 탐색
- Tab 키 탐색 활성화
- 포커스 표시기 강조
- 단축키 활성화

🔊 화면 낭독기
- 화면 낭독기 지원
- ARIA 레이블 표시

🎯 고대비 모드
- 고대비 모드 활성화
- 색맹 보정 모드

♿ 기타
- 애니메이션 줄이기
- 자동재생 비디오 끄기
- 깜빡임 효과 제거
```

### 4. 데이터 및 저장공간 (DataSettings.jsx)
```
📦 캐시
- 사용량 표시 (MB / 100 MB)
- 캐시 지우기 버튼

🍪 쿠키
- 저장된 쿠키 개수
- 쿠키 관리 버튼

💾 로컬 저장소
- 사용량 표시 (MB / 50 MB)
- 저장소 비우기 버튼

📊 사용 현황
- 시각적 차트 (막대 그래프)
- 캐시, 쿠키, 로컬 저장소 비율

⚠️ 모든 데이터 삭제
- 2단계 확인
- 되돌릴 수 없음 경고
```

### 5. 개인정보 및 보안 (PrivacySettings.jsx)
```
📊 데이터 수집
- 사용 통계 수집 (익명)
- 오류 보고서 자동 전송
- 성능 데이터 수집

🍪 쿠키 정책
- 필수 쿠키만
- 필수 + 기능 쿠키
- 모든 쿠키 허용

🔒 개인정보 설정
- 프로필 공개
- 활동 내역 공개
- 검색 결과에 표시

🛡️ 보안
- 2단계 인증
- 의심스러운 로그인 알림
```

### 6. 고급 설정 (AdvancedSettings.jsx)
```
👨‍💻 개발자 모드
- 개발자 모드 활성화
- 콘솔 로그 표시
- 네트워크 요청 표시

🧪 실험적 기능
- 베타 기능 활성화
- 새로운 UI 미리보기
- 실험적 API 사용
- ⚠️ 불안정할 수 있음 경고

🔧 디버그 정보
- 버전, 빌드, 환경 표시
- 디버그 정보 복사 버튼

🗄️ 백업 및 복원
- 설정 내보내기 (JSON)
- 설정 가져오기 (JSON)
```

---

## 💾 데이터 저장

### LocalStorage 구조:
```javascript
{
  // 일반 설정
  language: 'ko',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  timezone: 'Asia/Seoul',
  
  // 외관
  theme: 'light',
  fontSize: 100,
  animations: true,
  hoverEffects: true,
  reduceAnimations: false,
  background: 'gradient',
  
  // 접근성
  accessibility: {
    keyboardNav: true,
    focusIndicator: true,
    shortcuts: true,
    screenReader: true,
    ariaLabels: true,
    highContrast: false,
    colorBlind: false,
    reduceMotion: true,
    autoplayVideos: false,
    reduceFlash: true,
  },
  
  // 개인정보
  privacy: {
    analytics: true,
    errorReports: false,
    performanceData: false,
    cookiePolicy: 'essential',
    publicProfile: true,
    publicActivity: false,
    searchable: true,
    twoFactor: false,
    loginAlerts: true,
  },
  
  // 고급
  advanced: {
    devMode: false,
    consoleLogs: false,
    networkLogs: false,
    betaFeatures: false,
    newUI: false,
    experimentalAPI: false,
  }
}
```

### 저장 위치:
- **키**: `systemSettings`
- **형식**: JSON string
- **저장소**: LocalStorage

---

## 🎨 UI/UX 특징

### 레이아웃
```
┌──────────────────────────────────────────────┐
│  ← 뒤로가기                                  │
│  ⚙️ 시스템 설정                              │
│  전역 설정 및 접근성 관리                    │
├──────────────────────────────────────────────┤
│  ┌──────────┬─────────────────────────────┐ │
│  │🌍 일반   │ 언어 설정                   │ │
│  │ 🌍 언어  │ - 한국어 (Korean)           │ │
│  │          │ - English                   │ │
│  │🎨 외관   │ - 日本語                    │ │
│  │ 🎨 외관  │                             │ │
│  │          │ 날짜 형식                   │ │
│  │♿ 접근성 │ - YYYY-MM-DD                │ │
│  │ ♿ 접근성│                             │ │
│  │          │ [취소] [저장]               │ │
│  │📊 데이터 │                             │ │
│  │ 📊 데이터│                             │ │
│  │          │                             │ │
│  │🔒 개인정보│                            │ │
│  │ 🔒 개인  │                             │ │
│  │          │                             │ │
│  │📱 고급   │                             │ │
│  │ 📱 고급  │                             │ │
│  └──────────┴─────────────────────────────┘ │
│  [초기화]                   [취소] [저장]    │
└──────────────────────────────────────────────┘
```

### 반응형 디자인
- **데스크톱**: 2단 레이아웃 (사이드바 + 콘텐츠)
- **태블릿**: 사이드바가 상단으로 이동
- **모바일**: 1단 레이아웃, 아이콘만 표시

### 색상 테마
- **주요색**: #3B82F6 (파랑)
- **성공**: #10B981 (초록)
- **경고**: #F59E0B (주황)
- **위험**: #EF4444 (빨강)

---

## 📁 생성된 파일

```
coup/src/app/settings/
├── page.jsx                           # 메인 페이지
├── page.module.css                    # 메인 스타일
└── components/
    ├── LanguageSettings.jsx           # 언어 설정
    ├── LanguageSettings.module.css    # 공통 스타일
    ├── AppearanceSettings.jsx         # 외관 설정
    ├── AccessibilitySettings.jsx      # 접근성
    ├── DataSettings.jsx               # 데이터 관리
    ├── DataSettings.module.css        # 데이터 스타일
    ├── PrivacySettings.jsx            # 개인정보
    ├── AdvancedSettings.jsx           # 고급 설정
    └── AdvancedSettings.module.css    # 고급 스타일

docs/
└── SYSTEM_SETTINGS_DESIGN.md          # 설계 문서
```

**총 13개 파일 생성**

---

## 🔧 주요 기능

### 1. 실시간 저장
```javascript
const handleSave = () => {
  localStorage.setItem('systemSettings', JSON.stringify(settings));
  setHasChanges(false);
  alert('설정이 저장되었습니다.');
  
  // 테마 적용
  if (settings.theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
  
  // 폰트 크기 적용
  document.documentElement.style.fontSize = `${settings.fontSize}%`;
};
```

### 2. 설정 초기화
```javascript
const handleReset = () => {
  if (confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
    setSettings(defaultSettings);
    localStorage.removeItem('systemSettings');
    setHasChanges(false);
    alert('설정이 초기화되었습니다.');
  }
};
```

### 3. 데이터 삭제
```javascript
// 캐시 삭제
const handleClearCache = async () => {
  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(names.map(name => caches.delete(name)));
    alert('캐시가 삭제되었습니다.');
  }
};

// 쿠키 삭제
const handleClearCookies = () => {
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
  alert('쿠키가 삭제되었습니다.');
};

// 로컬 저장소 삭제
const handleClearStorage = () => {
  localStorage.clear();
  alert('로컬 저장소가 삭제되었습니다.');
};
```

### 4. 설정 백업/복원
```javascript
// 내보내기
const handleExportSettings = () => {
  const data = JSON.stringify(settings, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};

// 가져오기
const handleImportSettings = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imported = JSON.parse(event.target.result);
      onUpdate(imported);
      localStorage.setItem('systemSettings', JSON.stringify(imported));
    };
    reader.readAsText(e.target.files[0]);
  };
  input.click();
};
```

---

## 🧪 테스트 방법

### 1. 페이지 접근
```
1. 브라우저에서 http://localhost:3000/settings 접속
2. ✅ 시스템 설정 페이지가 표시됨
```

### 2. 언어 설정
```
1. 좌측 메뉴에서 "🌍 언어 설정" 클릭
2. 언어, 날짜 형식, 시간 형식 변경
3. 하단 "저장" 버튼 클릭
4. ✅ "설정이 저장되었습니다" 메시지 표시
```

### 3. 테마 변경
```
1. "🎨 외관 설정" 클릭
2. "🌙 다크 모드" 선택
3. 저장 버튼 클릭
4. ✅ 페이지가 다크 모드로 전환됨
```

### 4. 폰트 크기 조절
```
1. "🎨 외관 설정"에서 슬라이더 조절
2. 실시간으로 미리보기 텍스트 크기 변경 확인
3. 저장 버튼 클릭
4. ✅ 전체 페이지 폰트 크기 적용
```

### 5. 데이터 관리
```
1. "📊 데이터 및 저장공간" 클릭
2. 사용 현황 차트 확인
3. "캐시 지우기" 버튼 클릭
4. ✅ 확인 다이얼로그 → 캐시 삭제
```

### 6. 설정 백업
```
1. "📱 고급 설정" 클릭
2. "📤 설정 내보내기" 버튼 클릭
3. ✅ JSON 파일 다운로드
4. "📥 설정 가져오기"로 복원 가능
```

---

## 🎉 완료!

이제 사용자는:
1. ✅ `/settings`에서 전역 시스템 설정 관리
2. ✅ 언어, 테마, 접근성 등 다양한 옵션 조정
3. ✅ 데이터 사용량 확인 및 관리
4. ✅ 설정 백업 및 복원
5. ✅ 개발자 모드 및 실험적 기능 활성화

**`/user/settings`**(개인 설정)와 **`/settings`**(시스템 설정)이 명확히 구분되어 작동합니다! 🚀

---

## 📊 비교

### `/user/settings` (개인 설정)
- 프로필 편집
- 비밀번호 변경
- 알림 설정
- 개인 테마

### `/settings` (시스템 설정)
- 언어/시간대
- 전역 테마
- 접근성
- 데이터 관리
- 개인정보 및 보안
- 고급 설정

두 페이지는 **독립적**으로 작동하며, 서로 다른 목적을 가집니다!

