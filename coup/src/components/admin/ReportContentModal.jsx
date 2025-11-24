'use client'

import { useRouter } from 'next/navigation'
import Modal from './Modal'
import styles from './Modal.module.css'

export default function ReportContentModal({ report, isOpen, onClose }) {
  const router = useRouter()

  if (!report) return null

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    return `${Math.floor(diffInHours / 24)}일 전`
  }

  const handleNavigateToContext = () => {
    // 신고 대상에 따라 적절한 페이지로 이동
    if (report.targetType === 'STUDY' && report.targetId) {
      router.push(`/admin/studies/${report.targetId}`)
    } else if (report.targetType === 'USER' && report.targetId) {
      router.push(`/admin/users?userId=${report.targetId}`)
    } else if (report.targetType === 'CHAT' && report.studyId) {
      router.push(`/admin/studies/${report.studyId}/chat`)
    }
    onClose()
  }

  // Mock 데이터: 실제로는 API에서 가져와야 합니다
  const getContextData = () => {
    if (report.targetType === 'CHAT') {
      // 채팅 메시지의 경우 전후 10개씩 보여주기
      return {
        type: 'chat',
        messages: [
          { id: 1, sender: '이영희', content: '오늘 스터디 시간 잘 부탁드립니다!', time: '14:23', isReported: false },
          { id: 2, sender: '김철수', content: '네, 저도 잘 부탁드려요', time: '14:25', isReported: false },
          { id: 3, sender: '박민수', content: '다들 준비 잘 하셨나요?', time: '14:27', isReported: false },
          { id: 4, sender: '이영희', content: '네! 자료 준비 완료했습니다', time: '14:29', isReported: false },
          { id: 5, sender: '김철수', content: '저도 준비했어요', time: '14:30', isReported: false },
          { id: 6, sender: report.targetName, content: report.evidence?.messages?.[0]?.content || '이 내용은 부적절한 내용입니다.', time: '14:32', isReported: true },
          { id: 7, sender: '이영희', content: '...', time: '14:33', isReported: false },
          { id: 8, sender: '박민수', content: '그런 말씀은 삼가주세요', time: '14:34', isReported: false },
          { id: 9, sender: '김철수', content: '스터디 분위기 좀 지켜주세요', time: '14:35', isReported: false },
          { id: 10, sender: report.targetName, content: '죄송합니다', time: '14:36', isReported: false },
        ]
      }
    } else if (report.targetType === 'POST') {
      // 게시글의 경우
      return {
        type: 'post',
        title: report.evidence?.title || '게시글 제목',
        content: report.evidence?.content || report.reason,
        author: report.targetName,
        createdAt: report.createdAt
      }
    } else if (report.targetType === 'STUDY') {
      // 스터디의 경우
      return {
        type: 'study',
        name: report.targetName,
        description: report.evidence?.description || '스터디 설명 내용',
        members: report.evidence?.memberCount || 0,
        createdAt: report.createdAt
      }
    }
    return null
  }

  const contextData = getContextData()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', width: '100%' }}>
          <span>신고 내용 상세보기</span>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            style={{ fontSize: '0.875rem', padding: '6px 12px' }}
            onClick={handleNavigateToContext}
          >
            📍 내역 보기
          </button>
        </div>
      }
      size="large"
      footer={
        <button
          className={`${styles.button} ${styles.buttonCancel}`}
          onClick={onClose}
        >
          닫기
        </button>
      }
    >
      {/* Report Info Header */}
      <div className={styles.reportHeader}>
        <div className={styles.reportBadgeContainer}>
          <span className={`${styles.reportBadge} ${styles[report.type?.toLowerCase()]}`}>
            {report.type === 'SPAM' && '⚠️ 스팸'}
            {report.type === 'HARASSMENT' && '🟠 욕설/비방'}
            {report.type === 'INAPPROPRIATE' && '🟡 부적절한 콘텐츠'}
            {report.type === 'COPYRIGHT' && '⚖️ 저작권 침해'}
            {report.type === 'OTHER' && '📋 기타'}
          </span>
          <span className={styles.reportMeta}>
            {formatTimeAgo(report.createdAt)} · 신고자: {report.reporter?.name || '알 수 없음'}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3 className={styles.reportSectionTitle}>신고 사유</h3>
        <div className={styles.reportReasonBox}>
          {report.reason}
        </div>
      </div>

      {/* Context Content */}
      {contextData && (
        <div style={{ marginTop: '24px' }}>
          <h3 className={styles.reportSectionTitle}>
            {contextData.type === 'chat' && '💬 채팅 내역 (전후 10개 메시지)'}
            {contextData.type === 'post' && '📝 게시글 내용'}
            {contextData.type === 'study' && '📚 스터디 정보'}
          </h3>

          {contextData.type === 'chat' && (
            <div className={styles.chatHistory}>
              {contextData.messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.chatMessage} ${message.isReported ? styles.reportedMessage : ''}`}
                >
                  <div className={styles.chatMessageHeader}>
                    <span className={styles.chatSender}>{message.sender}</span>
                    <span className={styles.chatTime}>{message.time}</span>
                  </div>
                  <div className={styles.chatContent}>
                    {message.content}
                  </div>
                  {message.isReported && (
                    <div className={styles.reportedBadge}>🚨 신고된 메시지</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {contextData.type === 'post' && (
            <div className={styles.postContent}>
              <div className={styles.postHeader}>
                <h4>{contextData.title}</h4>
                <div className={styles.postMeta}>
                  작성자: {contextData.author} · {formatTimeAgo(contextData.createdAt)}
                </div>
              </div>
              <div className={styles.postBody}>
                {contextData.content}
              </div>
            </div>
          )}

          {contextData.type === 'study' && (
            <div className={styles.studyContent}>
              <div className={styles.studyHeader}>
                <h4>{contextData.name}</h4>
                <div className={styles.studyMeta}>
                  멤버 수: {contextData.members}명 · 생성일: {formatTimeAgo(contextData.createdAt)}
                </div>
              </div>
              <div className={styles.studyDescription}>
                {contextData.description}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Evidence Section */}
      {report.evidence && (
        <div style={{ marginTop: '24px' }}>
          <h3 className={styles.reportSectionTitle}>증거 자료</h3>
          {report.evidence.screenshots && report.evidence.screenshots.length > 0 && (
            <div className={styles.evidenceItem}>
              <div className={styles.evidenceLabel}>
                🖼️ 스크린샷 {report.evidence.screenshots.length}장
              </div>
              <div className={styles.evidenceList}>
                {report.evidence.screenshots.map((screenshot, index) => (
                  <div key={index} className={styles.evidenceTag}>
                    {screenshot}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

