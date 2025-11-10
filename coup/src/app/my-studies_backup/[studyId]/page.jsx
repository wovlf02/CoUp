'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '@/styles/studies/detail.module.css'

export default function StudyDetailPage({ params }) {
  const router = useRouter()
  const [isMember, setIsMember] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // 샘플 데이터
  const study = {
    id: params.studyId,
    emoji: '📚',
    name: '코딩테스트 마스터 스터디',
    owner: '김철수',
    currentMembers: 12,
    maxMembers: 20,
    category: '프로그래밍',
    subCategory: '알고리즘/코테',
    description: '매일 아침 알고리즘 문제를 풀고\n서로의 풀이를 공유합니다.\n함께 실력을 키워나가요!',
    tags: ['알고리즘', '코딩테스트', '매일'],
    createdAt: '2025년 11월 1일',
    lastActivity: '1시간 전',
    visibility: 'PUBLIC'
  }

  const members = [
    { id: 1, name: '김철수', role: 'OWNER', avatar: null },
    { id: 2, name: '이영희', role: 'ADMIN', avatar: null },
    { id: 3, name: '박민수', role: 'MEMBER', avatar: null },
    { id: 4, name: '최지훈', role: 'MEMBER', avatar: null },
    { id: 5, name: '정수아', role: 'MEMBER', avatar: null },
    { id: 6, name: '강민호', role: 'MEMBER', avatar: null }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'notice',
      typeName: '공지',
      user: '김철수',
      action: '님이 "이번 주 일정" 공지를 작성했습니다',
      time: '2시간 전'
    },
    {
      id: 2,
      type: 'file',
      typeName: '파일',
      user: '이영희',
      action: '님이 "알고리즘 풀이.pdf"를 업로드했습니다',
      time: '5시간 전'
    },
    {
      id: 3,
      type: 'task',
      typeName: '할일',
      user: '박민수',
      action: '님이 "백준 1234번" 할 일을 완료했습니다',
      time: '1일 전'
    },
    {
      id: 4,
      type: 'chat',
      typeName: '채팅',
      user: '최지훈',
      action: '님이 채팅방에 메시지를 보냈습니다',
      time: '1일 전'
    },
    {
      id: 5,
      type: 'member',
      typeName: '멤버',
      user: '정수아',
      action: '님이 스터디에 가입했습니다',
      time: '2일 전'
    }
  ]

  const tabs = [
    { id: 'overview', name: '개요', path: `/studies/${params.studyId}` },
    { id: 'chat', name: '채팅', path: `/studies/${params.studyId}/chat` },
    { id: 'notices', name: '공지', path: `/studies/${params.studyId}/notices` },
    { id: 'files', name: '파일', path: `/studies/${params.studyId}/files` },
    { id: 'calendar', name: '캘린더', path: `/studies/${params.studyId}/calendar` },
    { id: 'tasks', name: '할일', path: `/studies/${params.studyId}/tasks` },
    { id: 'video', name: '화상', path: `/studies/${params.studyId}/video` }
  ]

  if (isAdmin) {
    tabs.push({ id: 'settings', name: '설정', path: `/studies/${params.studyId}/settings` })
  }

  const handleJoin = () => {
    if (confirm(`${study.name}에 가입하시겠습니까?`)) {
      alert('가입 신청이 완료되었습니다!')
      setIsMember(true)
    }
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'OWNER': return styles.roleOwner
      case 'ADMIN': return styles.roleAdmin
      default: return styles.roleMember
    }
  }

  const getActivityBadgeClass = (type) => {
    switch (type) {
      case 'notice': return styles.badgeNotice
      case 'file': return styles.badgeFile
      case 'task': return styles.badgeTask
      case 'chat': return styles.badgeChat
      default: return styles.badgeMember
    }
  }

  return (
    <div className={styles.container}>
      {/* 뒤로가기 */}
      <button onClick={() => router.push('/studies')} className={styles.backButton}>
        ← 스터디 목록으로
      </button>

      {/* 스터디 헤더 */}
      <div className={styles.studyHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.studyEmoji}>{study.emoji}</div>
          <div className={styles.headerInfo}>
            <h1 className={styles.studyName}>{study.name}</h1>
            <div className={styles.studyMeta}>
              <span>OWNER: {study.owner}</span>
              <span className={styles.separator}>|</span>
              <span>{study.currentMembers}/{study.maxMembers}명</span>
              <span className={styles.separator}>|</span>
              <span>{study.category}</span>
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          {!isMember && (
            <button onClick={handleJoin} className={styles.joinButton}>
              가입하기
            </button>
          )}
          {isMember && (
            <Link href={`/studies/${params.studyId}/chat`} className={styles.chatButton}>
              채팅하기
            </Link>
          )}
          {isAdmin && (
            <Link href={`/studies/${params.studyId}/settings`} className={styles.settingsButton}>
              설정
            </Link>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className={styles.tabNavigation}>
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.path}
            className={`${styles.tab} ${tab.id === 'overview' ? styles.tabActive : ''}`}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.content}>
        {/* 좌측: 스터디 소개 */}
        <div className={styles.contentLeft}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>스터디 소개</h2>
            <p className={styles.description}>
              {study.description.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
            <div className={styles.tags}>
              {study.tags.map((tag, index) => (
                <Link
                  key={index}
                  href={`/studies?tag=${tag}`}
                  className={styles.tag}
                >
                  #{tag}
                </Link>
              ))}
            </div>
            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>생성일:</span>
                <span className={styles.metaValue}>{study.createdAt}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>마지막 활동:</span>
                <span className={styles.metaValue}>{study.lastActivity}</span>
              </div>
            </div>
          </section>
        </div>

        {/* 우측: 스터디원 */}
        <div className={styles.contentRight}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                스터디원 ({study.currentMembers}명)
              </h2>
              <button className={styles.viewAllButton}>전체 보기</button>
            </div>
            <div className={styles.membersList}>
              {members.slice(0, 4).map((member) => (
                <div key={member.id} className={styles.memberItem}>
                  <div className={styles.memberAvatar}>
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberName}>{member.name}</div>
                    <div className={`${styles.memberRole} ${getRoleBadgeClass(member.role)}`}>
                      {member.role}
                    </div>
                  </div>
                </div>
              ))}
              {members.length > 4 && (
                <button className={styles.moreButton}>
                  + {members.length - 4}명 더보기
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* 최근 활동 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>최근 활동</h2>
        <div className={styles.activityList}>
          {recentActivities.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <span className={`${styles.activityBadge} ${getActivityBadgeClass(activity.type)}`}>
                [{activity.typeName}]
              </span>
              <div className={styles.activityContent}>
                <span className={styles.activityUser}>{activity.user}</span>
                <span className={styles.activityAction}>{activity.action}</span>
              </div>
              <span className={styles.activityTime}>{activity.time}</span>
            </div>
          ))}
        </div>
        <button className={styles.moreActivitiesButton}>더 보기</button>
      </section>
    </div>
  )
}
