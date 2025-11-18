// 내 스터디 화상회의 페이지
'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { useStudy } from '@/lib/hooks/useApi';

export default function MyStudyVideoCallPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // 실제 API Hooks
  const { data: studyData, isLoading: studyLoading } = useStudy(studyId);

  const study = studyData?.data;
  const participants = []; // TODO: 화상회의 참여자 실시간 데이터 (WebRTC/Socket.io)
  const callHistory = []; // TODO: 통화 기록 API 구현

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

  const handleStartCall = () => {
    // TODO: WebRTC 화상회의 시작 로직
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    if (confirm('정말 통화를 종료하시겠습니까?')) {
      setIsCallActive(false);
    }
  };

  if (studyLoading) {
    return <div className={styles.container}>로딩 중...</div>;
  }

  if (!study) {
    return <div className={styles.container}>스터디를 찾을 수 없습니다.</div>;
  }

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

                <div style={{ marginTop: '2rem', padding: '1rem', background: '#fef3c7', borderRadius: '8px' }}>
                  <p style={{ color: '#92400e', fontSize: '14px' }}>
                    💡 <strong>참고:</strong> 화상회의 기능은 WebRTC를 사용하여 구현됩니다.
                    현재는 UI만 구현되어 있으며, 실제 화상통화 기능은 별도 구현이 필요합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 우측 위젯 */}
          <aside className={styles.sidebar}>
            <div className={styles.widget}>
              <h3 className={styles.widgetTitle}>📊 스터디 정보</h3>
              <div className={styles.widgetContent}>
                <div className={styles.statRow}>
                  <span>멤버:</span>
                  <span className={styles.statValue}>{study.memberCount || 0}명</span>
                </div>
                <div className={styles.statRow}>
                  <span>카테고리:</span>
                  <span>{study.category}</span>
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
            <div className={styles.callTime}>⏱️ 00:00:00</div>
            <button className={styles.endCallButton} onClick={handleEndCall}>
              ❌ 나가기
            </button>
          </div>

          <div className={styles.videoGrid}>
            <div className={styles.videoCard}>
              <div className={styles.videoPlaceholder}>
                <div className={styles.videoOff}>
                  <div className={styles.avatarPlaceholder}>나</div>
                  <p style={{ marginTop: '1rem', color: '#64748b' }}>
                    화상회의 기능은 WebRTC로 구현 예정입니다.
                  </p>
                </div>
              </div>
              <div className={styles.participantInfo}>
                <span className={styles.participantName}>나</span>
              </div>
            </div>
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
