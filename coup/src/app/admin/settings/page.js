// src/app/admin/settings/page.js
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function AdminSettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [settings, setSettings] = useState({
    // 회원가입 설정
    emailVerificationRequired: true,
    approvalRequired: false,
    emailDomainRestriction: 'BLACKLIST',
    minimumAge: 14,
    allowGoogleLogin: true,
    allowGithubLogin: true,

    // 스터디 생성 제한
    minimumAccountAge: 3,
    maxStudiesPerUser: 5,
    studyApprovalRequired: false,

    // 파일 업로드 제한
    maxFileSize: 50,
    maxImageSize: 5,
    maxProfileImageSize: 2,
    virusScanEnabled: true
  })

  useEffect(() => {
    if (session && session.user.role !== 'SYSTEM_ADMIN') {
      alert('SYSTEM_ADMIN 권한이 필요합니다')
      router.push('/admin/dashboard')
    } else if (session) {
      fetchSettings()
    }
  }, [session, router])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()

      if (data.success) {
        // API에서 가져온 설정을 현재 state와 병합
        const apiSettings = {}
        Object.entries(data.data.settings).forEach(([key, obj]) => {
          apiSettings[key] = obj.value === 'true' ? true :
                              obj.value === 'false' ? false :
                              !isNaN(obj.value) ? Number(obj.value) :
                              obj.value
        })
        setSettings(prev => ({ ...prev, ...apiSettings }))
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })

      const data = await res.json()

      if (data.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        alert(data.error || '설정 저장에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('설정 저장 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('설정을 초기화하시겠습니까?')) {
      fetchSettings()
    }
  }

  if (!session || session.user.role !== 'SYSTEM_ADMIN') {
    return null
  }

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>
  }

  return (
    <div className={styles.container}>
      {/* Success Message */}
      {showSuccess && (
        <div className={styles.successMessage}>
          ✅ 설정이 저장되었습니다
        </div>
      )}

      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>시스템 설정</h1>
          <p className={styles.subtitle}>
            플랫폼 전체 설정을 관리합니다 (SYSTEM_ADMIN 전용)
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={handleReset}
            className={`${styles.headerButton} ${styles.resetButton}`}
            disabled={saving}
          >
            초기화
          </button>
          <button
            onClick={handleSave}
            className={`${styles.headerButton} ${styles.saveButton}`}
            disabled={saving}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* 회원가입 설정 */}
      <div className={styles.settingsCard}>
        <h2 className={styles.sectionTitle}>
          👥 회원가입 설정
        </h2>
        <div className={styles.sectionContent}>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="emailVerification"
              checked={settings.emailVerificationRequired}
              onChange={(e) => setSettings({ ...settings, emailVerificationRequired: e.target.checked })}
              className={styles.checkbox}
            />
            <label htmlFor="emailVerification" className={styles.checkboxLabel}>
              이메일 인증 필수
            </label>
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="approvalRequired"
              checked={settings.approvalRequired}
              onChange={(e) => setSettings({ ...settings, approvalRequired: e.target.checked })}
              className={styles.checkbox}
            />
            <label htmlFor="approvalRequired" className={styles.checkboxLabel}>
              회원가입 승인 제도 활성화
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>이메일 도메인 제한</label>
            <div className={styles.radioGroup}>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="domainNone"
                  name="emailDomain"
                  value="NONE"
                  checked={settings.emailDomainRestriction === 'NONE'}
                  onChange={(e) => setSettings({ ...settings, emailDomainRestriction: e.target.value })}
                  className={styles.radio}
                />
                <label htmlFor="domainNone" className={styles.radioLabel}>
                  제한 없음
                </label>
              </div>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="domainWhitelist"
                  name="emailDomain"
                  value="WHITELIST"
                  checked={settings.emailDomainRestriction === 'WHITELIST'}
                  onChange={(e) => setSettings({ ...settings, emailDomainRestriction: e.target.value })}
                  className={styles.radio}
                />
                <label htmlFor="domainWhitelist" className={styles.radioLabel}>
                  화이트리스트만 허용
                </label>
              </div>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="domainBlacklist"
                  name="emailDomain"
                  value="BLACKLIST"
                  checked={settings.emailDomainRestriction === 'BLACKLIST'}
                  onChange={(e) => setSettings({ ...settings, emailDomainRestriction: e.target.value })}
                  className={styles.radio}
                />
                <label htmlFor="domainBlacklist" className={styles.radioLabel}>
                  블랙리스트 차단
                </label>
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="minimumAge" className={styles.formLabel}>
              최소 연령
            </label>
            <input
              type="number"
              id="minimumAge"
              value={settings.minimumAge}
              onChange={(e) => setSettings({ ...settings, minimumAge: parseInt(e.target.value) || 0 })}
              className={`${styles.formInput} ${styles.small}`}
              min="0"
              max="100"
            />
            <span className={styles.formDescription}>세</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>소셜 로그인 허용</label>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="allowGoogle"
                checked={settings.allowGoogleLogin}
                onChange={(e) => setSettings({ ...settings, allowGoogleLogin: e.target.checked })}
                className={styles.checkbox}
              />
              <label htmlFor="allowGoogle" className={styles.checkboxLabel}>
                Google 로그인
              </label>
            </div>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="allowGithub"
                checked={settings.allowGithubLogin}
                onChange={(e) => setSettings({ ...settings, allowGithubLogin: e.target.checked })}
                className={styles.checkbox}
              />
              <label htmlFor="allowGithub" className={styles.checkboxLabel}>
                GitHub 로그인
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 스터디 생성 제한 */}
      <div className={styles.settingsCard}>
        <h2 className={styles.sectionTitle}>
          📚 스터디 생성 제한
        </h2>
        <div className={styles.sectionContent}>
          <div className={styles.inlineFields}>
            <div className={styles.formGroup}>
              <label htmlFor="minimumAccountAge" className={styles.formLabel}>
                최소 가입 기간
              </label>
              <input
                type="number"
                id="minimumAccountAge"
                value={settings.minimumAccountAge}
                onChange={(e) => setSettings({ ...settings, minimumAccountAge: parseInt(e.target.value) || 0 })}
                className={`${styles.formInput} ${styles.small}`}
                min="0"
              />
              <span className={styles.formDescription}>일</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="maxStudies" className={styles.formLabel}>
                최대 생성 개수
              </label>
              <input
                type="number"
                id="maxStudies"
                value={settings.maxStudiesPerUser}
                onChange={(e) => setSettings({ ...settings, maxStudiesPerUser: parseInt(e.target.value) || 0 })}
                className={`${styles.formInput} ${styles.small}`}
                min="1"
              />
              <span className={styles.formDescription}>개</span>
            </div>
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="studyApproval"
              checked={settings.studyApprovalRequired}
              onChange={(e) => setSettings({ ...settings, studyApprovalRequired: e.target.checked })}
              className={styles.checkbox}
            />
            <label htmlFor="studyApproval" className={styles.checkboxLabel}>
              스터디 생성 승인 제도
            </label>
          </div>
        </div>
      </div>

      {/* 파일 업로드 제한 */}
      <div className={styles.settingsCard}>
        <h2 className={styles.sectionTitle}>
          📎 파일 업로드 제한
        </h2>
        <div className={styles.sectionContent}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>최대 파일 크기</label>
            <div className={styles.inlineFields}>
              <div className={styles.formGroup}>
                <label htmlFor="maxFileSize" className={styles.formLabel}>
                  일반 파일
                </label>
                <input
                  type="number"
                  id="maxFileSize"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) || 0 })}
                  className={`${styles.formInput} ${styles.small}`}
                  min="1"
                />
                <span className={styles.formDescription}>MB</span>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="maxImageSize" className={styles.formLabel}>
                  이미지
                </label>
                <input
                  type="number"
                  id="maxImageSize"
                  value={settings.maxImageSize}
                  onChange={(e) => setSettings({ ...settings, maxImageSize: parseInt(e.target.value) || 0 })}
                  className={`${styles.formInput} ${styles.small}`}
                  min="1"
                />
                <span className={styles.formDescription}>MB</span>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="maxProfileImageSize" className={styles.formLabel}>
                  프로필 이미지
                </label>
                <input
                  type="number"
                  id="maxProfileImageSize"
                  value={settings.maxProfileImageSize}
                  onChange={(e) => setSettings({ ...settings, maxProfileImageSize: parseInt(e.target.value) || 0 })}
                  className={`${styles.formInput} ${styles.small}`}
                  min="1"
                />
                <span className={styles.formDescription}>MB</span>
              </div>
            </div>
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="virusScan"
              checked={settings.virusScanEnabled}
              onChange={(e) => setSettings({ ...settings, virusScanEnabled: e.target.checked })}
              className={styles.checkbox}
            />
            <label htmlFor="virusScan" className={styles.checkboxLabel}>
              바이러스 스캔 활성화
            </label>
          </div>

          <div className={styles.warningBox}>
            <span className={styles.warningIcon}>⚠️</span>
            <div className={styles.warningContent}>
              <p className={styles.warningTitle}>주의사항</p>
              <p className={styles.warningText}>
                파일 크기 제한을 변경하면 기존 업로드된 파일에는 영향을 주지 않습니다.
                새로 업로드되는 파일부터 적용됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

