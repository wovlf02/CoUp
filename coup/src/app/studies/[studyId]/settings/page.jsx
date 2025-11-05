'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/styles/studies/settings.module.css'

export default function StudySettingsPage({ params }) {
  const router = useRouter()
  const [isOwner] = useState(true) // TODO: 실제 권한 체크

  // 샘플 스터디 데이터
  const [studyData, setStudyData] = useState({
    name: '코딩테스트 마스터 스터디',
    description: '매일 아침 알고리즘 문제를 풀고\n서로의 풀이를 공유합니다.',
    category: 'programming',
    subCategory: 'algorithm',
    tags: ['알고리즘', '코딩테스트', '매일'],
    maxMembers: 20,
    currentMembers: 12,
    visibility: 'PUBLIC',
    autoApprove: true
  })

  const [members, setMembers] = useState([
    { id: 1, name: '김철수', role: 'OWNER', joinedAt: '2025.11.01', email: 'kim@example.com' },
    { id: 2, name: '이영희', role: 'ADMIN', joinedAt: '2025.11.02', email: 'lee@example.com' },
    { id: 3, name: '박민수', role: 'MEMBER', joinedAt: '2025.11.03', email: 'park@example.com' },
    { id: 4, name: '최지훈', role: 'MEMBER', joinedAt: '2025.11.03', email: 'choi@example.com' },
    { id: 5, name: '강서연', role: 'MEMBER', joinedAt: '2025.11.04', email: 'kang@example.com' }
  ])

  const [newTag, setNewTag] = useState('')
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handleAddTag = () => {
    if (!newTag.trim()) return
    if (studyData.tags.includes(newTag)) {
      alert('이미 존재하는 태그입니다.')
      return
    }

    setStudyData({
      ...studyData,
      tags: [...studyData.tags, newTag]
    })
    setNewTag('')
  }

  const handleRemoveTag = (tag) => {
    setStudyData({
      ...studyData,
      tags: studyData.tags.filter(t => t !== tag)
    })
  }

  const handleSave = async () => {
    // 검증
    if (!studyData.name.trim()) {
      alert('스터디 이름을 입력해주세요.')
      return
    }

    if (studyData.maxMembers < studyData.currentMembers) {
      alert('모집 인원은 현재 멤버 수보다 작을 수 없습니다.')
      return
    }

    // TODO: API 호출
    console.log('설정 저장:', studyData)
    alert('설정이 저장되었습니다!')
    router.push(`/studies/${params.studyId}`)
  }

  const handleChangeRole = async (memberId, newRole) => {
    if (!confirm('멤버의 권한을 변경하시겠습니까?')) return

    setMembers(prev => prev.map(m =>
      m.id === memberId ? { ...m, role: newRole } : m
    ))

    // TODO: API 호출
    console.log('권한 변경:', memberId, newRole)
  }

  const handleKickMember = async (memberId) => {
    const member = members.find(m => m.id === memberId)
    if (!confirm(`정말 ${member.name}님을 강퇴하시겠습니까?`)) return

    setMembers(prev => prev.filter(m => m.id !== memberId))
    setStudyData({ ...studyData, currentMembers: studyData.currentMembers - 1 })

    // TODO: API 호출
    console.log('멤버 강퇴:', memberId)
  }

  const handleDeleteStudy = async () => {
    if (deleteConfirmText !== studyData.name) {
      alert('스터디 이름이 일치하지 않습니다.')
      return
    }

    // TODO: API 호출
    console.log('스터디 삭제:', params.studyId)
    alert('스터디가 삭제되었습니다.')
    router.push('/studies')
  }

  return (
    <div className={styles.settingsContainer}>
      <h2>스터디 설정</h2>

      {/* 1. 기본 정보 */}
      <div className={styles.settingsSection}>
        <h3>1. 기본 정보</h3>

        <div className={styles.formGroup}>
          <label>스터디 이름 *</label>
          <input
            type="text"
            value={studyData.name}
            onChange={(e) => setStudyData({ ...studyData, name: e.target.value })}
            placeholder="스터디 이름을 입력하세요"
            maxLength={50}
          />
        </div>

        <div className={styles.formGroup}>
          <label>스터디 소개 *</label>
          <textarea
            value={studyData.description}
            onChange={(e) => setStudyData({ ...studyData, description: e.target.value })}
            placeholder="스터디 소개를 입력하세요"
            rows={4}
            maxLength={500}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>카테고리 *</label>
            <select
              value={studyData.category}
              onChange={(e) => setStudyData({ ...studyData, category: e.target.value })}
            >
              <option value="programming">프로그래밍</option>
              <option value="language">외국어</option>
              <option value="certificate">자격증</option>
              <option value="hobby">취미</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>세부 카테고리 *</label>
            <select
              value={studyData.subCategory}
              onChange={(e) => setStudyData({ ...studyData, subCategory: e.target.value })}
            >
              <option value="algorithm">알고리즘/코테</option>
              <option value="web">웹 개발</option>
              <option value="app">앱 개발</option>
              <option value="ai">AI/ML</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>태그 (선택)</label>
          <div className={styles.tagsContainer}>
            {studyData.tags.map((tag, index) => (
              <div key={index} className={styles.tag}>
                #{tag}
                <button onClick={() => handleRemoveTag(tag)}>×</button>
              </div>
            ))}
            <div className={styles.addTagInput}>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="태그 입력"
              />
              <button onClick={handleAddTag}>+ 추가</button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 모집 설정 */}
      <div className={styles.settingsSection}>
        <h3>2. 모집 설정</h3>

        <div className={styles.formGroup}>
          <label>모집 인원 *</label>
          <div className={styles.numberInput}>
            <button onClick={() => setStudyData({ ...studyData, maxMembers: Math.max(studyData.currentMembers, studyData.maxMembers - 1) })}>
              -
            </button>
            <input
              type="number"
              value={studyData.maxMembers}
              onChange={(e) => setStudyData({ ...studyData, maxMembers: Math.max(studyData.currentMembers, parseInt(e.target.value) || 0) })}
              min={studyData.currentMembers}
            />
            <button onClick={() => setStudyData({ ...studyData, maxMembers: studyData.maxMembers + 1 })}>
              +
            </button>
            <span className={styles.memberCount}>명 (현재: {studyData.currentMembers}명)</span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>공개 설정 *</label>
          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                value="PUBLIC"
                checked={studyData.visibility === 'PUBLIC'}
                onChange={(e) => setStudyData({ ...studyData, visibility: e.target.value })}
              />
              전체 공개
            </label>
            <label>
              <input
                type="radio"
                value="PRIVATE"
                checked={studyData.visibility === 'PRIVATE'}
                onChange={(e) => setStudyData({ ...studyData, visibility: e.target.value })}
              />
              비공개 (초대만)
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={studyData.autoApprove}
              onChange={(e) => setStudyData({ ...studyData, autoApprove: e.target.checked })}
            />
            <span>가입 신청 시 자동으로 승인합니다</span>
          </label>
        </div>
      </div>

      {/* 3. 멤버 관리 */}
      <div className={styles.settingsSection}>
        <h3>3. 멤버 관리 ({members.length}명)</h3>

        <div className={styles.membersList}>
          {members.map((member) => (
            <div key={member.id} className={styles.memberCard}>
              <div className={styles.memberInfo}>
                <div className={styles.memberAvatar}>👤</div>
                <div className={styles.memberDetails}>
                  <div className={styles.memberName}>
                    {member.name}
                    <span className={`${styles.roleBadge} ${styles[member.role.toLowerCase()]}`}>
                      {member.role}
                    </span>
                  </div>
                  <div className={styles.memberMeta}>
                    {member.joinedAt} 가입
                  </div>
                </div>
              </div>
              {member.role !== 'OWNER' && isOwner && (
                <div className={styles.memberActions}>
                  <select
                    value={member.role}
                    onChange={(e) => handleChangeRole(member.id, e.target.value)}
                    className={styles.roleSelect}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MEMBER">MEMBER</option>
                  </select>
                  <button
                    className={styles.kickButton}
                    onClick={() => handleKickMember(member.id)}
                  >
                    강퇴
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. 위험 구역 */}
      {isOwner && (
        <div className={styles.settingsSection}>
          <h3>4. 위험 구역</h3>

          <div className={styles.dangerZone}>
            <div className={styles.dangerInfo}>
              <strong>스터디 삭제</strong>
              <p>⚠️ 스터디를 삭제하면 모든 데이터(채팅, 파일 등)가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</p>
            </div>
            <button
              className={styles.deleteButton}
              onClick={() => {
                const modal = document.getElementById('deleteModal')
                modal.style.display = 'flex'
              }}
            >
              스터디 삭제
            </button>
          </div>
        </div>
      )}

      {/* 저장/취소 버튼 */}
      <div className={styles.saveActions}>
        <button
          className={styles.cancelButton}
          onClick={() => router.push(`/studies/${params.studyId}`)}
        >
          취소
        </button>
        <button className={styles.saveButton} onClick={handleSave}>
          저장하기
        </button>
      </div>

      {/* 삭제 확인 모달 */}
      <div id="deleteModal" className={styles.modalOverlay} style={{ display: 'none' }}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h3>스터디 삭제 확인</h3>
          <p>정말로 <strong>"{studyData.name}"</strong>를 삭제하시겠습니까?</p>
          <p className={styles.warningText}>
            이 작업은 되돌릴 수 없으며, 다음 데이터가 영구 삭제됩니다:
          </p>
          <ul className={styles.deleteList}>
            <li>모든 채팅 메시지</li>
            <li>공지사항</li>
            <li>파일</li>
            <li>캘린더 일정</li>
            <li>할 일</li>
          </ul>
          <p>삭제하려면 스터디 이름을 입력하세요:</p>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={studyData.name}
            className={styles.confirmInput}
          />
          <div className={styles.modalActions}>
            <button
              className={styles.modalCancelButton}
              onClick={() => {
                document.getElementById('deleteModal').style.display = 'none'
                setDeleteConfirmText('')
              }}
            >
              취소
            </button>
            <button
              className={styles.modalDeleteButton}
              onClick={handleDeleteStudy}
              disabled={deleteConfirmText !== studyData.name}
            >
              삭제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

