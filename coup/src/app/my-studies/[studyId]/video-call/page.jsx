// 내 스터디 화상회의 페이지
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function MyStudyVideoCallPage({ params }) {
  const router = useRouter();
  const { studyId } = params;
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const study = {
    id: studyId,
    emoji: '💻',
    name: '알고리즘 마스터 스터디',
    role: 'OWNER',
  };

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

  const participants = [
    { id: 1, name: '김철수 (나)', role: 'OWNER', isMuted: false, isVideoOn: true, isSpeaking: true },
    { id: 2, name: '이영희', role: 'ADMIN', isMuted: false, isVideoOn: true, isSpeaking: false },
    { id: 3, name: '박민수', role: 'MEMBER', isMuted: true, isVideoOn: true, isSpeaking: false },
    { id: 4, name: '최지은', role: 'MEMBER', isMuted: false, isVideoOn: false, isSpeaking: false },
  ];

  const handleStartCall = () => {
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    if (confirm('정말 통화를 종료하시겠습니까?')) {
      setIsCallActive(false);
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
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`${styles.tab} ${tab.label === '화상' ? styles.active : ''}`}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </Link>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      {!isCallActive ? (
        // 통화 시작 전
        <div className={styles.mainContent}>
          <div className={styles.videoSection}>
            <div className={styles.videoHeader}>
              <h2 className={styles.videoTitle}>📹 화상 스터디</h2>
            </div>

            <div className={styles.preCallScreen}>
              <div className={styles.preCallCard}>
                <div className={styles.preCallIcon}>🎥</div>
                <h3 className={styles.preCallTitle}>화상 스터디 시작하기</h3>
                <p className={styles.preCallDesc}>
                  스터디원들과 실시간으로 얼굴을 보며 함께 공부할 수 있습니다.
                </p>

                <div className={styles.preCallFeatures}>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>👥</span>
                    <span>최대 12명 동시 참여</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>🖥️</span>
                    <span>화면 공유 가능</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>💬</span>
                    <span>실시간 채팅</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>🎤</span>
                    <span>음성/영상 조절</span>
                  </div>
                </div>

                <button className={styles.startCallButton} onClick={handleStartCall}>
                  🚀 화상 스터디 시작하기
                </button>

                <div className={styles.deviceCheck}>
                  <p className={styles.deviceCheckTitle}>사용 전 확인사항:</p>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" defaultChecked />
                    <span>카메라 권한 허용</span>
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" defaultChecked />
                    <span>마이크 권한 허용</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 우측 위젯 */}
          <aside className={styles.sidebar}>
            <div className={styles.widget}>
              <h3 className={styles.widgetTitle}>📊 통화 기록</h3>
              <div className={styles.widgetContent}>
                <div className={styles.callHistory}>
                  <div className={styles.callHistoryItem}>
                    <div className={styles.callDate}>2025.11.05</div>
                    <div className={styles.callDuration}>⏱️ 1시간 23분</div>
                    <div className={styles.callParticipants}>👥 8명 참여</div>
                  </div>
                  <div className={styles.callHistoryItem}>
                    <div className={styles.callDate}>2025.11.02</div>
                    <div className={styles.callDuration}>⏱️ 2시간 15분</div>
                    <div className={styles.callParticipants}>👥 12명 참여</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.widget}>
              <h3 className={styles.widgetTitle}>⚙️ 설정</h3>
              <div className={styles.widgetContent}>
                <div className={styles.settingItem}>
                  <span>화질:</span>
                  <select className={styles.settingSelect}>
                    <option>자동</option>
                    <option>고화질</option>
                    <option>저화질</option>
                  </select>
                </div>
                <div className={styles.settingItem}>
                  <span>배경 효과:</span>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" />
                    <span>배경 흐리기</span>
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.widget}>
              <h3 className={styles.widgetTitle}>💡 사용 팁</h3>
              <div className={styles.widgetContent}>
                <p className={styles.tipText}>• 조용한 장소에서 사용하세요</p>
                <p className={styles.tipText}>• 헤드셋 사용을 권장합니다</p>
                <p className={styles.tipText}>• 안정적인 인터넷 연결 필요</p>
                <p className={styles.tipText}>• 화면 공유로 자료 공유 가능</p>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        // 통화 중
        <div className={styles.callScreen}>
          <div className={styles.callHeader}>
            <h3 className={styles.callTitle}>
              {study.emoji} {study.name}
            </h3>
            <div className={styles.callTime}>⏱️ 00:15:32</div>
            <button className={styles.endCallButton} onClick={handleEndCall}>
              ❌ 나가기
            </button>
          </div>

          <div className={styles.videoGrid}>
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={`${styles.videoCard} ${
                  participant.isSpeaking ? styles.speaking : ''
                }`}
              >
                <div className={styles.videoPlaceholder}>
                  {participant.isVideoOn ? (
                    <div className={styles.videoStream}>📹 Video Stream</div>
                  ) : (
                    <div className={styles.videoOff}>
                      <div className={styles.avatarPlaceholder}>
                        {participant.name[0]}
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.participantInfo}>
                  <span className={styles.participantName}>{participant.name}</span>
                  <div className={styles.participantControls}>
                    <span className={styles.controlIcon}>
                      {participant.isMuted ? '🔇' : '🎤'}
                    </span>
                    <span className={styles.controlIcon}>
                      {participant.isVideoOn ? '📹' : '📹'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.controlBar}>
            <button
              className={`${styles.controlButton} ${isMuted ? styles.active : ''}`}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? '🔇' : '🎤'}
              <span>{isMuted ? '음소거 해제' : '음소거'}</span>
            </button>

            <button
              className={`${styles.controlButton} ${isVideoOff ? styles.active : ''}`}
              onClick={() => setIsVideoOff(!isVideoOff)}
            >
              📹
              <span>{isVideoOff ? '비디오 켜기' : '비디오 끄기'}</span>
            </button>

            <button
              className={`${styles.controlButton} ${isScreenSharing ? styles.active : ''}`}
              onClick={() => setIsScreenSharing(!isScreenSharing)}
            >
              🖥️
              <span>{isScreenSharing ? '공유 중지' : '화면 공유'}</span>
            </button>

            <button className={styles.controlButton}>
              💬
              <span>채팅</span>
            </button>

            <button className={styles.controlButton}>
              👥
              <span>참여자 ({participants.length})</span>
            </button>

            <button className={styles.controlButton}>
              ⚙️
              <span>설정</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

