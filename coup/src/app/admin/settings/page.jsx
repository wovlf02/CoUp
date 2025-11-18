'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminSettings, useUpdateSetting } from '@/lib/hooks/useApi'
import styles from './page.module.css'

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('service')

  // 실제 API 호출
  const { data, isLoading, error } = useAdminSettings()
  const updateSetting = useUpdateSetting()

  const settings = data?.data || {}

  const tabs = [
    { id: 'service', label: '서비스 설정' },
    { id: 'limits', label: '제한 설정' },
    { id: 'admins', label: '관리자 계정' },
    { id: 'backup', label: '백업 및 로그' }
  ]

  const handleUpdateSetting = async (key, value) => {
    try {
      await updateSetting.mutateAsync({ key, value })
      alert('설정이 저장되었습니다.')
    } catch (error) {
      console.error('설정 저장 실패:', error)
      alert('설정 저장에 실패했습니다.')
    }
  }

  const handleSaveAll = () => {
    alert('모든 설정이 저장되었습니다.')
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <AdminLayout wide>
        <div className="adminPageWrapper">
          <div className="adminMainContent">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              설정을 불러오는 중...
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <AdminLayout wide>
        <div className="adminPageWrapper">
          <div className="adminMainContent">
            <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>
              설정을 불러오는데 실패했습니다. 다시 시도해주세요.
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout wide>
      <div className="adminPageWrapper">
        <div className="adminMainContent">
          <div className={styles.settingsPage}>
            {/* Header */}
            <div className="contentHeader">
              <h1 className="contentTitle">시스템 설정</h1>
              <button className="refreshButton" onClick={handleSaveAll}>저장</button>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Service Settings Tab */}
            {activeTab === 'service' && (
              <div className={styles.tabContent}>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>1. 서비스 설정</h3>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>서비스 상태</label>
                    <div className={styles.radioGroup}>
                      <label>
                        <input
                          type="radio"
                          name="status"
                          checked={settings.service?.status === 'OPERATIONAL'}
                          onChange={() => handleUpdateSetting('service.status', 'OPERATIONAL')}
                        />
                        <span>정상 운영</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="status"
                          checked={settings.service?.status === 'MAINTENANCE'}
                          onChange={() => handleUpdateSetting('service.status', 'MAINTENANCE')}
                        />
                        <span>점검 모드</span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>기능 활성화</label>
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={settings.service?.signupEnabled || false}
                          onChange={(e) => handleUpdateSetting('service.signupEnabled', e.target.checked)}
                        />
                        <span>회원가입 허용</span>
                      </label>
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={settings.service?.studyCreationEnabled || false}
                          onChange={(e) => handleUpdateSetting('service.studyCreationEnabled', e.target.checked)}
                        />
                        <span>스터디 생성 허용</span>
                      </label>
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={settings.service?.socialLoginEnabled || false}
                          onChange={(e) => handleUpdateSetting('service.socialLoginEnabled', e.target.checked)}
                        />
                        <span>소셜 로그인 허용</span>
                      </label>
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={settings.service?.publicBrowsingEnabled || false}
                          onChange={(e) => handleUpdateSetting('service.publicBrowsingEnabled', e.target.checked)}
                        />
                        <span>공개 스터디 탐색 허용 (미로그인)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Limits Settings Tab */}
            {activeTab === 'limits' && (
              <div className={styles.tabContent}>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>2. 제한 설정</h3>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>스터디 제한</label>
                    <div className={styles.inputRow}>
                      <div>
                        <label className={styles.subLabel}>사용자당 최대 스터디</label>
                        <input
                          type="number"
                          className={styles.input}
                          value={settings.limits?.maxStudiesPerUser || 10}
                          onChange={(e) => handleUpdateSetting('limits.maxStudiesPerUser', e.target.value)}
                        />
                        <span className={styles.unit}>개</span>
                      </div>
                      <div>
                        <label className={styles.subLabel}>스터디당 최대 멤버</label>
                        <input
                          type="number"
                          className={styles.input}
                          value={settings.limits?.maxMembersPerStudy || 50}
                          onChange={(e) => handleUpdateSetting('limits.maxMembersPerStudy', e.target.value)}
                        />
                        <span className={styles.unit}>명</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>파일 제한</label>
                    <div className={styles.inputRow}>
                      <div>
                        <label className={styles.subLabel}>파일 최대 크기</label>
                        <input
                          type="number"
                          className={styles.input}
                          value={settings.limits?.maxFileSize || 50}
                          onChange={(e) => handleUpdateSetting('limits.maxFileSize', e.target.value)}
                        />
                        <span className={styles.unit}>MB</span>
                      </div>
                      <div>
                        <label className={styles.subLabel}>스터디당 저장공간</label>
                        <input
                          type="number"
                          className={styles.input}
                          value={settings.limits?.maxStoragePerStudy ? (settings.limits.maxStoragePerStudy / 1024).toFixed(0) : 1}
                          onChange={(e) => handleUpdateSetting('limits.maxStoragePerStudy', e.target.value * 1024)}
                        />
                        <span className={styles.unit}>GB</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>메시지 제한</label>
                    <div className={styles.inputRow}>
                      <div>
                        <label className={styles.subLabel}>최대 글자 수</label>
                        <input
                          type="number"
                          className={styles.input}
                          value={settings.limits?.maxMessageLength || 2000}
                          onChange={(e) => handleUpdateSetting('limits.maxMessageLength', e.target.value)}
                        />
                        <span className={styles.unit}>자</span>
                      </div>
                      <div>
                        <label className={styles.subLabel}>연속 전송 제한</label>
                        <input
                          type="number"
                          className={styles.input}
                          value={settings.limits?.messageRateLimit?.count || 10}
                          onChange={(e) => {
                            const newValue = { ...settings.limits?.messageRateLimit, count: parseInt(e.target.value) }
                            handleUpdateSetting('limits.messageRateLimit', JSON.stringify(newValue))
                          }}
                        />
                        <span className={styles.unit}>회/분</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admins Tab */}
            {activeTab === 'admins' && (
              <div className={styles.tabContent}>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>3. 관리자 계정</h3>

                  <div className={styles.adminList}>
                    <div className={styles.adminCard}>
                      <div className={styles.adminInfo}>
                        <div className={styles.adminAvatar}>👤</div>
                        <div>
                          <div className={styles.adminEmail}>admin@example.com</div>
                          <div className={styles.adminRole}>슈퍼 관리자</div>
                          <div className={styles.adminMeta}>
                            추가일: {new Date().toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className={styles.adminActions}>
                        <button className={styles.actionBtn}>수정</button>
                      </div>
                    </div>
                  </div>

                  <button className={styles.addButton}>+ 관리자 추가</button>
                </div>

                <div className={styles.section}>
                  <h4 className={styles.subTitle}>관리자 역할 설명</h4>
                  <div className={styles.roleCard}>
                    <div className={styles.roleHeader}>
                      <span className={styles.roleIcon}>🔴</span>
                      <strong>슈퍼 관리자 (SUPER_ADMIN)</strong>
                    </div>
                    <ul className={styles.roleList}>
                      <li>모든 권한 보유</li>
                      <li>시스템 설정 변경 가능</li>
                      <li>다른 관리자 추가/삭제 가능</li>
                      <li>최소 1명 필수</li>
                    </ul>
                  </div>
                  <div className={styles.roleCard}>
                    <div className={styles.roleHeader}>
                      <span className={styles.roleIcon}>🟠</span>
                      <strong>모더레이터 (MODERATOR)</strong>
                    </div>
                    <ul className={styles.roleList}>
                      <li>콘텐츠 관리 권한</li>
                      <li>사용자/스터디 관리 (제한적)</li>
                      <li>신고 처리</li>
                      <li>시스템 설정 불가</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Tab */}
            {activeTab === 'backup' && (
              <div className={styles.tabContent}>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>4. 백업 및 로그</h3>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>자동 백업 설정</label>
                    <label className={styles.checkbox}>
                      <input type="checkbox" defaultChecked />
                      <span>자동 백업 활성화</span>
                    </label>

                    <div className={styles.radioGroupSpaced}>
                      <label>
                        <input type="radio" name="backup" />
                        <span>매일 새벽 2시</span>
                      </label>
                      <label>
                        <input type="radio" name="backup" defaultChecked />
                        <span>매주 일요일 새벽 2시</span>
                      </label>
                      <label>
                        <input type="radio" name="backup" />
                        <span>매월 1일 새벽 2시</span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>백업 보관 기간</label>
                    <input
                      type="number"
                      className={`${styles.input} ${styles.inputLimited}`}
                      defaultValue={30}
                    />
                    <span className={styles.unit}>일</span>
                  </div>

                  <button className={styles.backupButton}>수동 백업 시작</button>
                </div>

                <div className={styles.section}>
                  <h4 className={styles.subTitle}>백업 파일 목록</h4>
                  <div className={styles.backupList}>
                    <div className={styles.backupItem}>
                      <div>
                        <div className={styles.backupName}>📦 backup_2025_11_18.zip</div>
                        <div className={styles.backupMeta}>크기: 1.2GB · 생성: 2025-11-18 02:00</div>
                      </div>
                      <div className={styles.backupActions}>
                        <button className={styles.actionBtn}>다운로드</button>
                        <button className={styles.actionBtn}>복원</button>
                        <button className={`${styles.actionBtn} ${styles.danger}`}>삭제</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Widget */}
        <div className="rightWidget">
          <div className="widget">
            <div className="widgetTitle">💾 최근 변경</div>
            <div className="widgetContent">
              <div className={styles.widgetRecentChange}>
                <div className={styles.widgetRecentDate}>{new Date().toLocaleString()}</div>
                <div className={styles.widgetRecentUser}>admin@coup.com</div>
              </div>
              <div className={styles.widgetRecentItem}>
                • 설정이 로드되었습니다
              </div>
            </div>
          </div>

          <div className="widget">
            <div className="widgetTitle">⚙️ 설정 안내</div>
            <div className={`widgetContent ${styles.widgetGuide}`}>
              <p className={styles.widgetGuideParagraph}>
                ℹ️ 변경사항은 즉시 적용됩니다.
              </p>
              <p className={styles.widgetGuideParagraph}>
                ⚠️ 서비스 상태 변경 시 모든 사용자에게 영향을 줍니다.
              </p>
            </div>
          </div>

          <div className="widget">
            <div className="widgetTitle">🔒 권한 안내</div>
            <div className="widgetContent">
              <div className={styles.widgetRoleSection}>
                <div className={styles.widgetRoleLabel}>현재 역할:</div>
                <div className={styles.widgetRoleValue}>SYSTEM_ADMIN</div>
              </div>
              <div className={styles.widgetPermission}>
                수정 가능: ✅ 모든 설정
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
