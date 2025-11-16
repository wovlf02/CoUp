// 내 스터디 설정 페이지
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { studySettingsData, studyCategories } from '@/mocks/studySettings';

export default function MyStudySettingsPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const [studyName, setStudyName] = useState('알고리즘 마스터 스터디');
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});

  const data = studySettingsData[studyId] || studySettingsData[1];
  const { study, members } = data;
  const [formData, setFormData] = useState(data.formData);

  const tabs = [
    { label: '개요', href: `/my-studies/${studyId}`, icon: '📊' },
    { label: '채팅', href: `/my-studies/${studyId}/chat`, icon: '💬' },
    { label: '공지', href: `/my-studies/${studyId}/notices`, icon: '📢' },
    { label: '파일', href: `/my-studies/${studyId}/files`, icon: '📁' },
    { label: '캘린더', href: `/my-studies/${studyId}/calendar`, icon: '📅' },
    { label: '할일', href: `/my-studies/${studyId}/tasks`, icon: '✅' },
    { label: '화상', href: `/my-studies/${studyId}/video-call`, icon: '📹' },
    { label: '설정', href: `/my-studies/${studyId}/settings`, icon: '⚙️' },
  ];

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '스터디 이름은 필수입니다.';
    } else if (formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = '스터디 이름은 2-50자 사이여야 합니다.';
    }

    if (formData.description.length < 10 || formData.description.length > 500) {
      newErrors.description = '스터디 소개는 10-500자 사이여야 합니다.';
    }

    if (formData.maxMembers < 2 || formData.maxMembers > 100) {
      newErrors.maxMembers = '최대 인원은 2-100명 사이여야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      alert('입력 내용을 확인해주세요.');
      return;
    }

    if (confirm('변경사항을 저장하시겠습니까?')) {
      console.log('저장:', formData);
      alert('저장되었습니다!');
      setErrors({});
    }
  };

  const handleDeleteStudy = () => {
    const confirmation = prompt('스터디를 삭제하려면 "삭제"를 입력하세요:');
    if (confirmation === '삭제') {
      console.log('스터디 삭제');
      alert('스터디가 삭제되었습니다.');
      router.push('/my-studies');
    }
  };

  const handleRoleChange = (memberId, newRole) => {
    if (confirm(`멤버의 역할을 ${newRole}로 변경하시겠습니까?`)) {
      console.log(`멤버 ${memberId} 역할 변경: ${newRole}`);
      alert('역할이 변경되었습니다.');
    }
  };

  const handleKickMember = (memberId, memberName) => {
    if (confirm(`${memberName}님을 스터디에서 강퇴하시겠습니까?`)) {
      console.log(`멤버 ${memberId} 강퇴`);
      alert('멤버가 강퇴되었습니다.');
    }
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/studies/${studyId}/join?invite=abc123`;
    navigator.clipboard.writeText(inviteLink);
    alert('초대 링크가 복사되었습니다!');
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newTag = e.target.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag],
        });
      }
      e.target.value = '';
    }
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button onClick={() => router.push('/my-studies')} className={styles.backButton}>
          ← 내 스터디 목록
        </button>

        <div className={styles.studyHeader}>
          <div className={styles.studyInfo}>
            <span className={styles.emoji}>{study.emoji}</span>
            <div>
              <h1 className={styles.studyName}>{study.name}</h1>
            </div>
          </div>
          <span className={styles.roleBadge}>{study.role}</span>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`${styles.tab} ${tab.label === '설정' ? styles.active : ''}`}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </Link>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 설정 섹션 */}
        <div className={styles.settingsSection}>
          {/* 헤더 */}
          <div className={styles.settingsHeader}>
            <h2 className={styles.settingsTitle}>⚙️ 스터디 설정</h2>
          </div>

          {/* 설정 탭 */}
          <div className={styles.settingsTabs}>
            <button
              className={`${styles.settingsTab} ${activeTab === 'basic' ? styles.active : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              기본 정보
            </button>
            <button
              className={`${styles.settingsTab} ${activeTab === 'members' ? styles.active : ''}`}
              onClick={() => setActiveTab('members')}
            >
              멤버 관리
            </button>
            <button
              className={`${styles.settingsTab} ${activeTab === 'privacy' ? styles.active : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              공개 설정
            </button>
            {study.role === 'OWNER' && (
              <button
                className={`${styles.settingsTab} ${activeTab === 'danger' ? styles.active : ''}`}
                onClick={() => setActiveTab('danger')}
              >
                위험 구역
              </button>
            )}
          </div>

          {/* 기본 정보 */}
          {activeTab === 'basic' && (
            <div className={styles.settingsContent}>
              <div className={styles.settingsCard}>
                <h3 className={styles.cardTitle}>📝 기본 정보</h3>

                <div className={styles.formGroup}>
                  <label className={styles.label}>스터디 이름 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={styles.input}
                    placeholder="스터디 이름을 입력하세요"
                  />
                  <span className={styles.hint}>
                    {errors.name ? (
                      <span style={{ color: 'var(--danger-500)' }}>{errors.name}</span>
                    ) : (
                      '2-50자'
                    )}
                  </span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>카테고리</label>
                  <div className={styles.selectGroup}>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={styles.select}
                    >
                      {studyCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <select
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      className={styles.select}
                    >
                      <option>알고리즘/코테</option>
                      <option>웹개발</option>
                      <option>앱개발</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>스터디 소개</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={styles.textarea}
                    rows={5}
                    placeholder="스터디에 대해 소개해주세요"
                  />
                  <span className={styles.hint}>
                    {errors.description ? (
                      <span style={{ color: 'var(--danger-500)' }}>{errors.description}</span>
                    ) : (
                      `${formData.description.length}/500자`
                    )}
                  </span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>태그</label>
                  <div className={styles.tagContainer}>
                    {formData.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        #{tag}
                        <button
                          className={styles.tagRemove}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              tags: formData.tags.filter((t) => t !== tag),
                            })
                          }
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="+ 추가 (Enter)"
                      className={styles.tagInput}
                      onKeyDown={handleTagAdd}
                    />
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => {
                      if (confirm('변경사항을 취소하시겠습니까?')) {
                        window.location.reload();
                      }
                    }}
                  >
                    취소
                  </button>
                  <button className={styles.saveButton} onClick={handleSave}>
                    변경사항 저장
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 멤버 관리 */}
          {activeTab === 'members' && (
            <div className={styles.settingsContent}>
              <div className={styles.settingsCard}>
                <h3 className={styles.cardTitle}>👥 멤버 관리</h3>

                <div className={styles.membersList}>
                  {members.map((member) => (
                    <div key={member.id} className={styles.memberItem}>
                      <div className={styles.memberInfo}>
                        <div className={styles.memberAvatar}>{member.name[0]}</div>
                        <div className={styles.memberDetails}>
                          <div className={styles.memberName}>{member.name}</div>
                          <div className={styles.memberMeta}>
                            가입: {member.joinedAt}
                          </div>
                        </div>
                      </div>
                      <div className={styles.memberActions}>
                        <select
                          value={member.role}
                          className={styles.roleSelect}
                          disabled={member.role === 'OWNER'}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        >
                          <option value="OWNER">OWNER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="MEMBER">MEMBER</option>
                        </select>
                        {member.role !== 'OWNER' && (
                          <button
                            className={styles.kickButton}
                            onClick={() => handleKickMember(member.id, member.name)}
                          >
                            강퇴
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 공개 설정 */}
          {activeTab === 'privacy' && (
            <div className={styles.settingsContent}>
              <div className={styles.settingsCard}>
                <h3 className={styles.cardTitle}>🔒 공개 설정</h3>

                <div className={styles.formGroup}>
                  <label className={styles.label}>공개 여부</label>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        checked={formData.isPublic}
                        onChange={() => setFormData({ ...formData, isPublic: true })}
                      />
                      <span>전체 공개 - 누구나 검색 가능</span>
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        checked={!formData.isPublic}
                        onChange={() => setFormData({ ...formData, isPublic: false })}
                      />
                      <span>비공개 - 초대 링크만</span>
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>가입 승인</label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.autoApprove}
                      onChange={(e) =>
                        setFormData({ ...formData, autoApprove: e.target.checked })
                      }
                    />
                    <span>자동 승인 (체크 해제 시 수동 승인)</span>
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>최대 인원</label>
                  <input
                    type="number"
                    value={formData.maxMembers}
                    onChange={(e) =>
                      setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 2 })
                    }
                    className={styles.input}
                    min="2"
                    max="100"
                  />
                  <span className={styles.hint}>
                    {errors.maxMembers ? (
                      <span style={{ color: 'var(--danger-500)' }}>{errors.maxMembers}</span>
                    ) : (
                      '2-100명'
                    )}
                  </span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>초대 링크</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/studies/${studyId}/join?invite=abc123`}
                      className={styles.input}
                      readOnly
                      style={{ flex: 1 }}
                    />
                    <button
                      className={styles.saveButton}
                      onClick={handleCopyInviteLink}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      복사
                    </button>
                  </div>
                  <span className={styles.hint}>초대 링크를 공유하여 멤버를 초대하세요</span>
                </div>

                <div className={styles.formActions}>
                  <button className={styles.saveButton} onClick={handleSave}>
                    변경사항 저장
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 위험 구역 */}
          {activeTab === 'danger' && study.role === 'OWNER' && (
            <div className={styles.settingsContent}>
              <div className={`${styles.settingsCard} ${styles.dangerCard}`}>
                <h3 className={styles.cardTitle}>⚠️ 위험 구역</h3>
                <p className={styles.dangerWarning}>
                  아래 작업은 되돌릴 수 없습니다. 신중하게 진행해주세요.
                </p>

                <div className={styles.dangerAction}>
                  <div className={styles.dangerInfo}>
                    <h4 className={styles.dangerTitle}>스터디 삭제</h4>
                    <p className={styles.dangerDesc}>
                      스터디와 모든 데이터가 영구적으로 삭제됩니다.
                    </p>
                  </div>
                  <button className={styles.deleteButton} onClick={handleDeleteStudy}>
                    스터디 삭제
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 우측 위젯 */}
        <aside className={styles.sidebar}>
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>⚠️ 주의사항</h3>
            <div className={styles.widgetContent}>
              <p className={styles.widgetText}>변경사항은 즉시 반영됩니다.</p>
              <p className={styles.widgetText}>중요한 변경 사항은 신중하게 진행하세요.</p>
            </div>
          </div>

          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>💡 권한 안내</h3>
            <div className={styles.widgetContent}>
              <div className={styles.roleInfo}>
                <strong>OWNER:</strong>
                <ul>
                  <li>모든 설정</li>
                  <li>멤버 관리</li>
                  <li>스터디 삭제</li>
                </ul>
              </div>
              <div className={styles.roleInfo}>
                <strong>ADMIN:</strong>
                <ul>
                  <li>기본 정보</li>
                  <li>멤버 관리</li>
                  <li>공개 설정</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>📊 통계</h3>
            <div className={styles.widgetContent}>
              <div className={styles.statRow}>
                <span>총 멤버:</span>
                <span className={styles.statValue}>{members.length}명</span>
              </div>
              <div className={styles.statRow}>
                <span>OWNER:</span>
                <span>{members.filter(m => m.role === 'OWNER').length}명</span>
              </div>
              <div className={styles.statRow}>
                <span>ADMIN:</span>
                <span>{members.filter(m => m.role === 'ADMIN').length}명</span>
              </div>
              <div className={styles.statRow}>
                <span>MEMBER:</span>
                <span>{members.filter(m => m.role === 'MEMBER').length}명</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
