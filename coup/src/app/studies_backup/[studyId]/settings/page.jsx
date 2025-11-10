'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function StudySettingsPage({ params }) {
  const { studyId } = params;
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '코딩테스트 마스터 스터디',
    description: '매일 아침 알고리즘 문제를 풀고 서로의 풀이를 공유합니다.',
    category: 'programming',
    subCategory: 'algorithm',
    maxMembers: 20,
    visibility: 'public',
    autoApprove: true,
    tags: ['알고리즘', '코딩테스트', '매일']
  });

  const [newTag, setNewTag] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Mock data - 멤버 목록
  const members = [
    { id: 1, name: '김철수', role: 'OWNER', joinDate: '2025.11.01', avatar: 'K' },
    { id: 2, name: '이영희', role: 'ADMIN', joinDate: '2025.11.02', avatar: 'L' },
    { id: 3, name: '박민수', role: 'MEMBER', joinDate: '2025.11.03', avatar: 'P' },
    { id: 4, name: '최지은', role: 'MEMBER', joinDate: '2025.11.04', avatar: 'C' },
    { id: 5, name: '정소현', role: 'MEMBER', joinDate: '2025.11.05', avatar: 'J' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log('설정 저장:', formData);
    alert('설정이 저장되었습니다!');
    router.push(`/studies/${studyId}`);
  };

  const handleChangeRole = (memberId, newRole) => {
    console.log('권한 변경:', memberId, newRole);
    alert(`권한이 ${newRole}로 변경되었습니다!`);
  };

  const handleKickMember = (memberId, memberName) => {
    if (confirm(`정말 ${memberName}님을 강퇴하시겠습니까?`)) {
      console.log('멤버 강퇴:', memberId);
      alert('멤버가 강퇴되었습니다!');
    }
  };

  const handleDeleteStudy = () => {
    if (deleteConfirm !== formData.name) {
      alert('스터디 이름이 일치하지 않습니다.');
      return;
    }

    if (confirm('정말로 스터디를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      console.log('스터디 삭제:', studyId);
      alert('스터디가 삭제되었습니다.');
      router.push('/studies');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>스터디 설정</h1>

      <form onSubmit={handleSave}>
        {/* 1. 기본 정보 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. 기본 정보</h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              스터디 이름 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              스터디 소개 <span className={styles.required}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={styles.textarea}
              rows={4}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                카테고리 <span className={styles.required}>*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={styles.select}
                required
              >
                <option value="programming">프로그래밍</option>
                <option value="job">취업준비</option>
                <option value="language">어학</option>
                <option value="exercise">운동</option>
                <option value="reading">독서</option>
                <option value="etc">기타</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>서브 카테고리</label>
              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="algorithm">알고리즘/코테</option>
                <option value="web">웹 개발</option>
                <option value="app">앱 개발</option>
                <option value="data">데이터 분석</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>태그 (선택)</label>
            <div className={styles.tagList}>
              {formData.tags.map((tag) => (
                <div key={tag} className={styles.tag}>
                  #{tag}
                  <button
                    type="button"
                    className={styles.removeTag}
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder="태그 추가"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className={styles.tagInput}
              />
              <button
                type="button"
                className={styles.addTagBtn}
                onClick={handleAddTag}
              >
                + 추가
              </button>
            </div>
          </div>
        </section>

        {/* 2. 모집 설정 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. 모집 설정</h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              모집 인원 <span className={styles.required}>*</span>
            </label>
            <div className={styles.memberCounter}>
              <button
                type="button"
                className={styles.counterBtn}
                onClick={() => setFormData({ ...formData, maxMembers: Math.max(5, formData.maxMembers - 1) })}
              >
                -
              </button>
              <input
                type="number"
                name="maxMembers"
                value={formData.maxMembers}
                onChange={handleInputChange}
                className={styles.counterInput}
                min={5}
                max={100}
                required
              />
              <button
                type="button"
                className={styles.counterBtn}
                onClick={() => setFormData({ ...formData, maxMembers: Math.min(100, formData.maxMembers + 1) })}
              >
                +
              </button>
              <span className={styles.counterLabel}>명 (현재: 12명)</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              공개 설정 <span className={styles.required}>*</span>
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={formData.visibility === 'public'}
                  onChange={handleInputChange}
                />
                전체 공개
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={formData.visibility === 'private'}
                  onChange={handleInputChange}
                />
                비공개 (초대만)
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="autoApprove"
                checked={formData.autoApprove}
                onChange={handleInputChange}
              />
              가입 신청 시 자동으로 승인합니다
            </label>
          </div>
        </section>

        {/* 3. 멤버 관리 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. 멤버 관리 ({members.length}명)</h2>

          <div className={styles.memberList}>
            {members.map((member) => (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.memberInfo}>
                  <div className={styles.memberAvatar}>{member.avatar}</div>
                  <div className={styles.memberDetails}>
                    <div className={styles.memberName}>
                      {member.name}
                      <span className={`${styles.roleBadge} ${styles[member.role.toLowerCase()]}`}>
                        {member.role === 'OWNER' ? '그룹장' : member.role === 'ADMIN' ? '관리자' : '멤버'}
                      </span>
                    </div>
                    <div className={styles.memberJoinDate}>{member.joinDate} 가입</div>
                  </div>
                </div>

                {member.role !== 'OWNER' && (
                  <div className={styles.memberActions}>
                    <select
                      className={styles.roleSelect}
                      value={member.role}
                      onChange={(e) => handleChangeRole(member.id, e.target.value)}
                    >
                      <option value="MEMBER">멤버</option>
                      <option value="ADMIN">관리자</option>
                    </select>
                    <button
                      type="button"
                      className={styles.kickBtn}
                      onClick={() => handleKickMember(member.id, member.name)}
                    >
                      강퇴
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 저장 버튼 */}
        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => router.push(`/studies/${studyId}`)}
          >
            취소
          </button>
          <button type="submit" className={styles.saveBtn}>
            저장하기
          </button>
        </div>
      </form>

      {/* 4. 위험 구역 */}
      <section className={`${styles.section} ${styles.dangerZone}`}>
        <h2 className={styles.sectionTitle}>4. 위험 구역</h2>

        <div className={styles.dangerBox}>
          <div className={styles.dangerContent}>
            <h3 className={styles.dangerTitle}>스터디 삭제</h3>
            <p className={styles.dangerDescription}>
              ⚠️ 스터디를 삭제하면 모든 데이터(채팅, 파일, 공지사항 등)가 영구적으로 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </p>
            <p className={styles.dangerDescription}>
              삭제하려면 스터디 이름을 정확히 입력하세요: <strong>{formData.name}</strong>
            </p>
            <input
              type="text"
              placeholder="스터디 이름 입력"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className={styles.dangerInput}
            />
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={handleDeleteStudy}
              disabled={deleteConfirm !== formData.name}
            >
              스터디 삭제
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

