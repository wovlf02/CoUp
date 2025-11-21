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
    alert('설정이 저장되었습니다.');

    // 테마 적용
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 폰트 크기 적용
    document.documentElement.style.fontSize = `${settings.fontSize}%`;
  };

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
      alert('설정이 초기화되었습니다.');
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

