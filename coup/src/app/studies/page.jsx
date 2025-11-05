'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from '@/styles/studies/explore.module.css'

export default function StudiesExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [searchKeyword, setSearchKeyword] = useState('')

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'programming', label: '프로그래밍' },
    { value: 'job', label: '취업준비' },
    { value: 'language', label: '어학' },
    { value: 'fitness', label: '운동' },
    { value: 'reading', label: '독서' },
    { value: 'etc', label: '기타' }
  ]

  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'popular', label: '인기순' },
    { value: 'name', label: '이름순' }
  ]

  const studies = [
    {
      id: 1,
      emoji: '📚',
      name: '코딩테스트 스터디',
      description: '매일 알고리즘 문제를 함께 풀어요',
      currentMembers: 12,
      maxMembers: 20,
      owner: '김철수',
      tags: ['알고리즘', '코테', '매일'],
      status: 'open'
    },
    {
      id: 2,
      emoji: '💼',
      name: '취업 준비 스터디',
      description: '함께 취업을 준비해요',
      currentMembers: 8,
      maxMembers: 15,
      owner: '이영희',
      tags: ['자소서', '면접', '포트폴리오'],
      status: 'open'
    },
    {
      id: 3,
      emoji: '🏃',
      name: '운동 루틴 스터디',
      description: '아침 러닝 모임',
      currentMembers: 5,
      maxMembers: 10,
      owner: '박민수',
      tags: ['운동', '아침', '건강'],
      status: 'open'
    },
    {
      id: 4,
      emoji: '📖',
      name: '영어 회화 스터디',
      description: '영어 회화 연습 스터디',
      currentMembers: 15,
      maxMembers: 20,
      owner: '최지은',
      tags: ['영어', '회화', 'TOEIC'],
      status: 'open'
    },
    {
      id: 5,
      emoji: '🎨',
      name: '디자인 스터디',
      description: 'UI/UX 디자인을 함께 공부해요',
      currentMembers: 10,
      maxMembers: 10,
      owner: '정소현',
      tags: ['디자인', 'UI/UX', 'Figma'],
      status: 'full'
    },
    {
      id: 6,
      emoji: '💡',
      name: '창업 스터디',
      description: '예비 창업가들을 위한 스터디',
      currentMembers: 3,
      maxMembers: 8,
      owner: '강민호',
      tags: ['창업', '비즈니스', '아이디어'],
      status: 'open'
    }
  ]

  return (
    <div className={styles.container}>
      {/* 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>스터디 탐색</h1>
        <Link href="/studies/create" className={styles.createButton}>
          <span className={styles.plusIcon}>+</span>
          스터디 만들기
        </Link>
      </div>

      {/* 필터 바 */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.filterSelect}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                정렬: {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="스터디 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      </div>

      {/* 스터디 그리드 */}
      <div className={styles.studiesGrid}>
        {studies.map((study) => (
          <Link 
            key={study.id}
            href={`/studies/${study.id}`}
            className={styles.studyCard}
          >
            <div className={styles.studyEmoji}>{study.emoji}</div>
            <h3 className={styles.studyTitle}>{study.name}</h3>
            <p className={styles.studyDescription}>{study.description}</p>
            
            <div className={styles.studyMeta}>
              <span className={styles.studyMembers}>
                {study.currentMembers}/{study.maxMembers}명 참여
              </span>
              {study.status === 'full' && (
                <span className={styles.fullBadge}>(정원 마감)</span>
              )}
            </div>

            <div className={styles.studyOwner}>
              OWNER: {study.owner}
            </div>

            <div className={styles.studyTags}>
              {study.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>

            <button 
              className={`${styles.joinButton} ${study.status === 'full' ? styles.fullButton : ''}`}
              onClick={(e) => {
                e.preventDefault()
                if (study.status !== 'full') {
                  alert('가입 신청이 완료되었습니다!')
                }
              }}
              disabled={study.status === 'full'}
            >
              {study.status === 'full' ? '대기 중' : '가입하기'}
            </button>
          </Link>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className={styles.pagination}>
        <button className={styles.pageButton} disabled>
          ←
        </button>
        <button className={`${styles.pageButton} ${styles.active}`}>1</button>
        <button className={styles.pageButton}>2</button>
        <button className={styles.pageButton}>3</button>
        <button className={styles.pageButton}>4</button>
        <button className={styles.pageButton}>5</button>
        <button className={styles.pageButton}>
          →
        </button>
      </div>
    </div>
  )
}
