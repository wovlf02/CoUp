// 접근성 설정
'use client';

import styles from './LanguageSettings.module.css';

export default function AccessibilitySettings({ settings, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({
      ...settings,
      accessibility: { ...settings.accessibility, [field]: value }
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>♿ 접근성</h2>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>⌨️ 키보드 탐색</h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.accessibility.keyboardNav}
              onChange={(e) => handleChange('keyboardNav', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>Tab 키 탐색 활성화</span>
              <p>Tab 키로 모든 요소를 탐색할 수 있습니다</p>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.accessibility.focusIndicator}
              onChange={(e) => handleChange('focusIndicator', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>포커스 표시기 강조</span>
              <p>현재 선택된 요소를 더 잘 보이게 합니다</p>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.accessibility.shortcuts}
              onChange={(e) => handleChange('shortcuts', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>단축키 활성화</span>
              <p>키보드 단축키로 빠르게 작업할 수 있습니다</p>
            </div>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🔊 화면 낭독기</h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.accessibility.screenReader}
              onChange={(e) => handleChange('screenReader', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>화면 낭독기 지원</span>
              <p>화면 낭독기가 내용을 읽을 수 있도록 합니다</p>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.accessibility.ariaLabels}
              onChange={(e) => handleChange('ariaLabels', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>ARIA 레이블 표시</span>
              <p>접근성을 위한 추가 정보를 제공합니다</p>
            </div>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🎯 고대비 모드</h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.accessibility.highContrast}
              onChange={(e) => handleChange('highContrast', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>고대비 모드 활성화</span>
              <p>텍스트와 배경의 대비를 높입니다</p>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.accessibility.colorBlind}
              onChange={(e) => handleChange('colorBlind', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>색맹 보정 모드</span>
              <p>색약/색맹 사용자를 위한 색상 조정</p>
            </div>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>♿ 기타</h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.accessibility.reduceMotion}
              onChange={(e) => handleChange('reduceMotion', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>애니메이션 줄이기</span>
              <p>움직임에 민감한 사용자를 위해</p>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.accessibility.autoplayVideos}
              onChange={(e) => handleChange('autoplayVideos', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>자동재생 비디오 끄기</span>
              <p>비디오가 자동으로 재생되지 않습니다</p>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.accessibility.reduceFlash}
              onChange={(e) => handleChange('reduceFlash', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>깜빡임 효과 제거</span>
              <p>광과민성 발작을 예방합니다</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

