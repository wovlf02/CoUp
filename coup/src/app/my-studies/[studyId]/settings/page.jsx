// 내 스터디 설정 페이지
'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { useStudy, useUpdateStudy, useDeleteStudy, useStudyMembers, useChangeMemberRole, useKickMember, useLeaveStudy } from '@/lib/hooks/useApi';
import { getStudyHeaderStyle } from '@/utils/studyColors';

const STUDY_CATEGORIES = [
  { main: '개발', sub: ['알고리즘/코테', '웹개발', '앱개발', 'AI/ML', '데이터과학'] },
  { main: '언어', sub: ['영어', '중국어', '일본어', '기타'] },
  { main: '취업/자격증', sub: ['공무원', '자격증', '취업준비'] },
  { main: '교양/취미', sub: ['독서', '운동', '음악', '미술'] },
  { main: '학업', sub: ['수능', '편입', '대학공부'] }
];

export default function MyStudySettingsPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const [activeTab, setActiveTab] = useState('basic');

  // 실제 API Hooks
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);
  const { data: membersData, refetch: refetchMembers } = useStudyMembers(studyId);
  const updateStudyMutation = useUpdateStudy();
  const deleteStudyMutation = useDeleteStudy();
  const changeMemberRoleMutation = useChangeMemberRole();
  const kickMemberMutation = useKickMember();
  const leaveStudyMutation = useLeaveStudy();

  const study = studyData?.data;
  const members = membersData?.members || [];

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    description: '',
    tags: [],
    isPublic: true,
    autoApprove: false,
    maxMembers: 50
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (study) {
      setFormData({
        name: study.name || '',
        category: study.category || '',
        subCategory: study.subCategory || '',
        description: study.description || '',
        tags: study.tags || [],
        isPublic: study.isPublic !== undefined ? study.isPublic : true,
        autoApprove: study.autoApprove || false,
        maxMembers: study.maxMembers || 50
      });
    }
  }, [study]);

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

  const handleSave = async () => {
    if (!validateForm()) {
      alert('입력 내용을 확인해주세요.');
      return;
    }

    if (!confirm('변경사항을 저장하시겠습니까?')) return;

    try {
      await updateStudyMutation.mutateAsync({
        id: studyId,
        data: formData
      });
      alert('저장되었습니다!');
      setErrors({});
    } catch (error) {
      alert('저장 실패: ' + error.message);
    }
  };

  const handleDeleteStudy = async () => {
    const confirmation = prompt('스터디를 삭제하려면 "삭제"를 입력하세요:');
    if (confirmation === '삭제') {
      try {
        await deleteStudyMutation.mutateAsync(studyId);
        alert('스터디가 삭제되었습니다.');
        router.push('/my-studies');
      } catch (error) {
        alert('스터디 삭제 실패: ' + error.message);
      }
    }
  };

  const handleRoleChange = async (memberId, userId, newRole) => {
    if (!confirm(`멤버의 역할을 ${newRole}로 변경하시겠습니까?`)) return;

    try {
      await changeMemberRoleMutation.mutateAsync({ studyId, userId, role: newRole });
      alert('역할이 변경되었습니다.');
      await refetchMembers();
    } catch (error) {
      alert('역할 변경 실패: ' + error.message);
    }
  };

  const handleKickMember = async (userId, memberName) => {
    if (!confirm(`${memberName}님을 스터디에서 강퇴하시겠습니까?`)) return;

    try {
      await kickMemberMutation.mutateAsync({ studyId, userId });
      alert('멤버가 강퇴되었습니다.');
      await refetchMembers();
    } catch (error) {
      alert('강퇴 실패: ' + error.message);
    }
  };

  const handleLeaveStudy = async () => {
    if (!confirm('정말 스터디를 탈퇴하시겠습니까?')) return;

    try {
      await leaveStudyMutation.mutateAsync(studyId);
      alert('스터디를 탈퇴했습니다.');
      router.push('/my-studies');
    } catch (error) {
      alert('탈퇴 실패: ' + error.message);
    }
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

  if (studyLoading) {
    return <div className={styles.container}>로딩 중...</div>;
  }

  if (!study) {
    return <div className={styles.container}>스터디를 찾을 수 없습니다.</div>;
  }

  const userRole = study.role || study.myRole || 'MEMBER';
  const isOwner = userRole === 'OWNER';
  const isAdmin = userRole === 'ADMIN' || isOwner;

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button onClick={() => router.push('/my-studies')} className={styles.backButton}>
          ← 내 스터디 목록
        </button>

        <div className={styles.studyHeader} style={getStudyHeaderStyle(studyId)}>
          <div className={styles.studyInfo}>
            <span className={styles.emoji}>{study.emoji}</span>
            <div>
              <h1 className={styles.studyName}>{study.name}</h1>
            </div>
          </div>
          <span className={styles.roleBadge}>{userRole}</span>
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
            {isAdmin && (
              <button
                className={`${styles.settingsTab} ${activeTab === 'privacy' ? styles.active : ''}`}
                onClick={() => setActiveTab('privacy')}
              >
                공개 설정
              </button>
            )}
            {isOwner && (
              <button
                className={`${styles.settingsTab} ${activeTab === 'danger' ? styles.active : ''}`}
                onClick={() => setActiveTab('danger')}
              >
                위험 구역
              </button>
            )}
          </div>

          {/* 기본 정보 */}
          {activeTab === 'basic' && isAdmin && (
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
                      {STUDY_CATEGORIES.map((cat) => (
                        <option key={cat.main} value={cat.main}>
                          {cat.main}
                        </option>
                      ))}
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
                  <button className={styles.cancelButton} onClick={() => router.back()}>
                    취소
                  </button>
                  <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={updateStudyMutation.isPending}
                  >
                    {updateStudyMutation.isPending ? '저장 중...' : '변경사항 저장'}
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
                        <div className={styles.memberAvatar}>{member.user?.name?.[0] || 'U'}</div>
                        <div className={styles.memberDetails}>
                          <div className={styles.memberName}>{member.user?.name || '알 수 없음'}</div>
                          <div className={styles.memberMeta}>
                            가입: {new Date(member.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className={styles.memberActions}>
                        {isAdmin && member.role !== 'OWNER' ? (
                          <>
                            <select
                              value={member.role}
                              className={styles.roleSelect}
                              onChange={(e) => handleRoleChange(member.id, member.userId, e.target.value)}
                            >
                              <option value="MEMBER">MEMBER</option>
                              <option value="ADMIN">ADMIN</option>
                              {isOwner && <option value="OWNER">OWNER</option>}
                            </select>
                            <button
                              className={styles.kickButton}
                              onClick={() => handleKickMember(member.userId, member.user?.name)}
                            >
                              강퇴
                            </button>
                          </>
                        ) : (
                          <span className={styles.roleLabel}>{member.role}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 공개 설정 */}
          {activeTab === 'privacy' && isAdmin && (
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

                <div className={styles.formActions}>
                  <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={updateStudyMutation.isPending}
                  >
                    {updateStudyMutation.isPending ? '저장 중...' : '변경사항 저장'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 위험 구역 */}
          {activeTab === 'danger' && (
            <div className={styles.settingsContent}>
              <div className={`${styles.settingsCard} ${styles.dangerCard}`}>
                <h3 className={styles.cardTitle}>⚠️ 위험 구역</h3>
                <p className={styles.dangerWarning}>
                  아래 작업은 되돌릴 수 없습니다. 신중하게 진행해주세요.
                </p>

                {!isOwner && (
                  <div className={styles.dangerAction}>
                    <div className={styles.dangerInfo}>
                      <h4 className={styles.dangerTitle}>스터디 탈퇴</h4>
                      <p className={styles.dangerDesc}>
                        스터디에서 나가며 모든 데이터 접근 권한을 잃습니다.
                      </p>
                    </div>
                    <button className={styles.deleteButton} onClick={handleLeaveStudy}>
                      스터디 탈퇴
                    </button>
                  </div>
                )}

                {isOwner && (
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
                )}
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
