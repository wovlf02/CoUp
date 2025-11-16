// 스터디 가입 페이지
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { studyJoinData } from '@/mocks/studyDetails';

export default function StudyJoinPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    agreeToRules: false,
    introduction: '',
    purpose: '',
    level: '',
    notifications: {
      notice: true,
      chat: true,
      event: true,
      task: false,
    },
    channels: {
      web: true,
      email: true,
      kakao: false,
    },
  });

  // 임시 스터디 데이터
  const study = studyJoinData[studyId] || studyJoinData[1];

  const handleNext = () => {
    if (currentStep === 1 && !formData.agreeToRules) {
      alert('스터디 규칙에 동의해주세요.');
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      console.log('가입 신청:', formData);

      // API 호출 시뮬레이션
      if (study.autoApprove) {
        alert('🎉 가입이 완료되었습니다!');
        router.push(`/my-studies/${studyId}`);
      } else {
        alert('가입 신청이 완료되었습니다. 승인을 기다려주세요.');
        router.push('/studies');
      }
    } catch (error) {
      alert('가입 신청 중 오류가 발생했습니다.');
    }
  };

  const toggleNotification = (key) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [key]: !formData.notifications[key],
      },
    });
  };

  const toggleChannel = (key) => {
    setFormData({
      ...formData,
      channels: {
        ...formData.channels,
        [key]: !formData.channels[key],
      },
    });
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button
          onClick={() => router.push(`/studies/${studyId}`)}
          className={styles.backButton}
        >
          ← 프리뷰로 돌아가기
        </button>
        <h1 className={styles.title}>
          {study.emoji} {study.name} 가입하기
        </h1>
      </div>

      {/* 진행 표시 */}
      <div className={styles.progress}>
        <div className={styles.progressSteps}>
          <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
            1
          </div>
          <div className={styles.stepDivider}></div>
          <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
            2
          </div>
          <div className={styles.stepDivider}></div>
          <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
            3
          </div>
        </div>
        <span className={styles.progressLabel}>Step {currentStep}/3</span>
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 폼 섹션 */}
        <div className={styles.formSection}>
          {/* Step 1: 규칙 확인 */}
          {currentStep === 1 && (
            <div className={styles.stepCard}>
              <h2 className={styles.stepTitle}>📋 Step 1/3: 스터디 규칙 확인</h2>
              <p className={styles.stepDescription}>
                우리 스터디의 규칙을 확인해주세요
              </p>

              <ul className={styles.rulesList}>
                {study.rules.map((rule, index) => (
                  <li key={index} className={styles.ruleItem}>
                    <span className={styles.ruleIcon}>✓</span>
                    <span className={styles.ruleText}>{rule}</span>
                  </li>
                ))}
              </ul>

              <button className={styles.detailLink}>
                📖 상세 규칙 보기 →
              </button>

              <div className={styles.agreeBox}>
                <label className={styles.agreeLabel}>
                  <input
                    type="checkbox"
                    checked={formData.agreeToRules}
                    onChange={(e) =>
                      setFormData({ ...formData, agreeToRules: e.target.checked })
                    }
                  />
                  <span>위 규칙을 모두 확인했으며 동의합니다</span>
                </label>
              </div>

              <div className={styles.warning}>
                <span>⚠️</span>
                <span>규칙을 지키지 않을 경우 강퇴될 수 있습니다</span>
              </div>

              <div className={styles.buttonGroup}>
                <button
                  onClick={() => router.push(`/studies/${studyId}`)}
                  className={styles.backBtn}
                >
                  취소
                </button>
                <button
                  onClick={handleNext}
                  className={styles.nextBtn}
                  disabled={!formData.agreeToRules}
                >
                  다음 단계 →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 자기소개 */}
          {currentStep === 2 && (
            <div className={styles.stepCard}>
              <h2 className={styles.stepTitle}>
                👋 Step 2/3: 간단한 자기소개
              </h2>
              <p className={styles.stepDescription}>
                스터디원들에게 자신을 소개해주세요 <span className={styles.optional}>(선택)</span>
              </p>

              <div className={styles.formGroup}>
                <label className={styles.label}>자기소개</label>
                <textarea
                  value={formData.introduction}
                  onChange={(e) =>
                    setFormData({ ...formData, introduction: e.target.value })
                  }
                  className={styles.textarea}
                  rows={5}
                  maxLength={300}
                  placeholder="안녕하세요! 백엔드 개발자 준비 중인 김철수입니다. 함께 성장하고 싶습니다!"
                />
                <span className={styles.charCount}>
                  {formData.introduction.length}/300자
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>가입 동기</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="purpose"
                      value="취업 준비"
                      checked={formData.purpose === '취업 준비'}
                      onChange={(e) =>
                        setFormData({ ...formData, purpose: e.target.value })
                      }
                    />
                    <span className={styles.radioText}>취업 준비</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="purpose"
                      value="실력 향상"
                      checked={formData.purpose === '실력 향상'}
                      onChange={(e) =>
                        setFormData({ ...formData, purpose: e.target.value })
                      }
                    />
                    <span className={styles.radioText}>실력 향상</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="purpose"
                      value="네트워킹"
                      checked={formData.purpose === '네트워킹'}
                      onChange={(e) =>
                        setFormData({ ...formData, purpose: e.target.value })
                      }
                    />
                    <span className={styles.radioText}>네트워킹</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="purpose"
                      value="자격증"
                      checked={formData.purpose === '자격증'}
                      onChange={(e) =>
                        setFormData({ ...formData, purpose: e.target.value })
                      }
                    />
                    <span className={styles.radioText}>자격증</span>
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>현재 실력 수준</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="level"
                      value="입문"
                      checked={formData.level === '입문'}
                      onChange={(e) =>
                        setFormData({ ...formData, level: e.target.value })
                      }
                    />
                    <span className={styles.radioText}>입문</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="level"
                      value="초급"
                      checked={formData.level === '초급'}
                      onChange={(e) =>
                        setFormData({ ...formData, level: e.target.value })
                      }
                    />
                    <span className={styles.radioText}>초급</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="level"
                      value="중급"
                      checked={formData.level === '중급'}
                      onChange={(e) =>
                        setFormData({ ...formData, level: e.target.value })
                      }
                    />
                    <span className={styles.radioText}>중급</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="level"
                      value="고급"
                      checked={formData.level === '고급'}
                      onChange={(e) =>
                        setFormData({ ...formData, level: e.target.value })
                      }
                    />
                    <span className={styles.radioText}>고급</span>
                  </label>
                </div>
              </div>

              <div className={styles.hint}>
                <span>💡</span>
                <span>이 정보는 그룹장이 승인 시 참고용으로 사용됩니다</span>
              </div>

              <div className={styles.buttonGroup}>
                <button onClick={handleBack} className={styles.backBtn}>
                  ← 이전
                </button>
                <button onClick={handleNext} className={styles.nextBtn}>
                  다음 단계 →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 알림 설정 */}
          {currentStep === 3 && (
            <div className={styles.stepCard}>
              <h2 className={styles.stepTitle}>🔔 Step 3/3: 알림 설정</h2>
              <p className={styles.stepDescription}>
                어떤 알림을 받고 싶으신가요?
              </p>

              <div className={styles.checkboxGroup}>
                <div className={styles.checkboxItem}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.notifications.notice}
                      onChange={() => toggleNotification('notice')}
                    />
                    <div className={styles.checkboxContent}>
                      <div className={styles.checkboxTitle}>새 공지 알림 받기</div>
                      <div className={styles.checkboxDesc}>
                        새로운 공지가 작성되면 알림을 보내드립니다
                      </div>
                    </div>
                  </label>
                </div>

                <div className={styles.checkboxItem}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.notifications.chat}
                      onChange={() => toggleNotification('chat')}
                    />
                    <div className={styles.checkboxContent}>
                      <div className={styles.checkboxTitle}>채팅 메시지 알림 받기</div>
                      <div className={styles.checkboxDesc}>
                        채팅에 새 메시지가 오면 알림을 보내드립니다
                      </div>
                    </div>
                  </label>
                </div>

                <div className={styles.checkboxItem}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.notifications.event}
                      onChange={() => toggleNotification('event')}
                    />
                    <div className={styles.checkboxContent}>
                      <div className={styles.checkboxTitle}>일정 알림 받기</div>
                      <div className={styles.checkboxDesc}>
                        다가오는 일정을 미리 알려드립니다
                      </div>
                    </div>
                  </label>
                </div>

                <div className={styles.checkboxItem}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.notifications.task}
                      onChange={() => toggleNotification('task')}
                    />
                    <div className={styles.checkboxContent}>
                      <div className={styles.checkboxTitle}>할일 마감 알림 받기</div>
                      <div className={styles.checkboxDesc}>
                        할일 마감일이 다가오면 알림을 보내드립니다
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>알림 채널</label>
                <div className={styles.channelGroup}>
                  <button
                    className={`${styles.channelButton} ${
                      formData.channels.web ? styles.active : ''
                    }`}
                    onClick={() => toggleChannel('web')}
                  >
                    🌐 웹 푸시
                  </button>
                  <button
                    className={`${styles.channelButton} ${
                      formData.channels.email ? styles.active : ''
                    }`}
                    onClick={() => toggleChannel('email')}
                  >
                    📧 이메일
                  </button>
                  <button
                    className={`${styles.channelButton} ${
                      formData.channels.kakao ? styles.active : ''
                    }`}
                    onClick={() => toggleChannel('kakao')}
                  >
                    💬 카카오톡
                  </button>
                </div>
              </div>

              <div className={styles.hint}>
                <span>💡</span>
                <span>알림 설정은 나중에 변경할 수 있습니다</span>
              </div>

              <div className={styles.buttonGroup}>
                <button onClick={handleBack} className={styles.backBtn}>
                  ← 이전
                </button>
                <button onClick={handleSubmit} className={styles.submitBtn}>
                  🎉 가입하기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 우측 사이드바 */}
        <aside className={styles.sidebar}>
          {/* 스터디 요약 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>스터디 요약</h3>
            <div className={styles.studyInfo}>
              <span className={styles.studyEmoji}>{study.emoji}</span>
              <p className={styles.studyName}>{study.name}</p>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>멤버</span>
              <span className={styles.infoValue}>
                {study.memberCount}/{study.maxMembers}명
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>카테고리</span>
              <span className={styles.infoValue}>{study.category}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>승인 방식</span>
              <span className={`${styles.badge} ${styles.auto}`}>
                {study.autoApprove ? '자동 승인' : '수동 승인'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>평점</span>
              <div className={styles.rating}>
                <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
                <span className={styles.infoValue}>
                  {study.rating} ({study.reviewCount}명)
                </span>
              </div>
            </div>
          </div>

          {/* 가입 혜택 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>✨ 가입 혜택</h3>
            <ul className={styles.benefitList}>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>💬</span>
                <span>실시간 채팅</span>
              </li>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>📁</span>
                <span>파일 공유</span>
              </li>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>📅</span>
                <span>일정 관리</span>
              </li>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>✅</span>
                <span>할일 관리</span>
              </li>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>📹</span>
                <span>화상 스터디</span>
              </li>
            </ul>
          </div>

          {/* 참고사항 */}
          <div className={styles.widget}>
            <h3 className={styles.widgetTitle}>💡 참고사항</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', margin: 0 }}>
              {study.autoApprove
                ? '가입 후 바로 모든 기능을 이용할 수 있습니다!'
                : '그룹장 승인 후 이용 가능합니다. (평균 1일 이내)'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
