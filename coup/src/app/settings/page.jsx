// 시스템 설정 메인 페이지
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LanguageSettings from './components/LanguageSettings';
import AppearanceSettings from './components/AppearanceSettings';
import AccessibilitySettings from './components/AccessibilitySettings';
import DataSettings from './components/DataSettings';
import PrivacySettings from './components/PrivacySettings';
import AdvancedSettings from './components/AdvancedSettings';
import Toast from './components/Toast';
import styles from './page.module.css';

// 기본 설정
const defaultSettings = {
  language: 'ko',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  timezone: 'Asia/Seoul',
  theme: 'light',
  fontSize: 100,
  animations: true,
  hoverEffects: true,
  reduceAnimations: false,
  background: 'gradient',
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
  advanced: {
    devMode: false,
    consoleLogs: false,
    networkLogs: false,
    betaFeatures: false,
    newUI: false,
    experimentalAPI: false,
  }
};

export default function SystemSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('language');
  const [settings, setSettings] = useState(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState(null);

  // 설정 로드
  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('systemSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        } catch (error) {
          console.error('Failed to parse settings:', error);
        }
      }
    };
    loadSettings();
  }, []);

  // 설정 저장
  const handleSave = () => {
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    setHasChanges(false);

    // 실제 설정 적용
    applySettings(settings);

    // 토스트 표시
    setToast({ message: '설정이 성공적으로 저장되었습니다! 🎉', type: 'success' });
  };

  // 설정 실제 적용
  const applySettings = (settingsToApply) => {
    const root = document.documentElement;

    // 1. 테마 적용
    if (settingsToApply.theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else if (settingsToApply.theme === 'light') {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    } else if (settingsToApply.theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    } else if (settingsToApply.theme === 'auto') {
      const hour = new Date().getHours();
      const isDark = hour < 6 || hour >= 18;
      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    }

    // 2. 폰트 크기 적용
    root.style.fontSize = `${settingsToApply.fontSize}%`;

    // 3. 애니메이션 설정
    if (settingsToApply.reduceAnimations) {
      root.style.setProperty('--animation-duration', '0.01s');
    } else {
      root.style.setProperty('--animation-duration', '0.3s');
    }

    // 4. 접근성 설정
    if (settingsToApply.accessibility) {
      // 고대비 모드
      if (settingsToApply.accessibility.highContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }

      // 애니메이션 줄이기
      if (settingsToApply.accessibility.reduceMotion) {
        root.style.setProperty('--animation-duration', '0.01s');
      }

      // 포커스 표시기
      if (settingsToApply.accessibility.focusIndicator) {
        root.style.setProperty('--focus-ring-width', '4px');
        root.style.setProperty('--focus-ring-color', 'rgba(59, 130, 246, 0.6)');
      } else {
        root.style.setProperty('--focus-ring-width', '2px');
        root.style.setProperty('--focus-ring-color', 'rgba(59, 130, 246, 0.3)');
      }
    }

    // 5. 배경 설정
    if (settingsToApply.background === 'solid') {
      root.style.setProperty('--bg-pattern', 'none');
    } else if (settingsToApply.background === 'gradient') {
      root.style.setProperty('--bg-pattern', 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)');
    } else if (settingsToApply.background === 'pattern') {
      root.style.setProperty('--bg-pattern', 'repeating-linear-gradient(45deg, #f8fafc 0px, #f8fafc 10px, #f1f5f9 10px, #f1f5f9 20px)');
    }
  };

  // 페이지 로드 시 저장된 설정 적용
  useEffect(() => {
    if (settings) {
      applySettings(settings);
    }
  }, [settings]);

  // 설정 업데이트
  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    setHasChanges(true);
  };

  // 설정 초기화
  const handleReset = () => {
    if (confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      setSettings(defaultSettings);
      localStorage.removeItem('systemSettings');
      setHasChanges(false);
      applySettings(defaultSettings);
      setToast({ message: '설정이 초기화되었습니다.', type: 'info' });
    }
  };

  const menuItems = [
    {
      id: 'general',
      label: '🌍 일반',
      children: [
        { id: 'language', label: '언어 설정', icon: '🌍' },
      ]
    },
    {
      id: 'appearance',
      label: '🎨 외관',
      children: [
        { id: 'appearance', label: '외관 설정', icon: '🎨' },
      ]
    },
    {
      id: 'accessibility',
      label: '♿ 접근성',
      children: [
        { id: 'accessibility', label: '접근성', icon: '♿' },
      ]
    },
    {
      id: 'data',
      label: '📊 데이터',
      children: [
        { id: 'data', label: '데이터 및 저장공간', icon: '📊' },
      ]
    },
    {
      id: 'privacy',
      label: '🔒 개인정보',
      children: [
        { id: 'privacy', label: '개인정보 및 보안', icon: '🔒' },
      ]
    },
    {
      id: 'advanced',
      label: '📱 고급',
      children: [
        { id: 'advanced', label: '고급 설정', icon: '📱' },
      ]
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'language':
        return <LanguageSettings settings={settings} onUpdate={updateSettings} />;
      case 'appearance':
        return <AppearanceSettings settings={settings} onUpdate={updateSettings} />;
      case 'accessibility':
        return <AccessibilitySettings settings={settings} onUpdate={updateSettings} />;
      case 'data':
        return <DataSettings />;
      case 'privacy':
        return <PrivacySettings settings={settings} onUpdate={updateSettings} />;
      case 'advanced':
        return <AdvancedSettings settings={settings} onUpdate={updateSettings} />;
      default:
        return <LanguageSettings settings={settings} onUpdate={updateSettings} />;
    }
  };

  return (
    <div className={styles.container}>
      {/* 토스트 알림 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 헤더 */}
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← 뒤로가기
        </button>
        <h1 className={styles.title}>⚙️ 시스템 설정</h1>
        <p className={styles.subtitle}>전역 설정 및 접근성 관리</p>
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 좌측 사이드바 */}
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {menuItems.map((group) => (
              <div key={group.id} className={styles.navGroup}>
                <div className={styles.navGroupLabel}>{group.label}</div>
                {group.children.map((item) => (
                  <button
                    key={item.id}
                    className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <span className={styles.navItemIcon}>{item.icon}</span>
                    <span className={styles.navItemLabel}>{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* 우측 콘텐츠 */}
        <main className={styles.content}>
          {renderContent()}

          {/* 하단 액션 버튼 */}
          <div className={styles.actions}>
            <button onClick={handleReset} className={styles.resetButton}>
              초기화
            </button>
            <div className={styles.actionButtons}>
              <button onClick={() => router.back()} className={styles.cancelButton}>
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={styles.saveButton}
              >
                저장
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

