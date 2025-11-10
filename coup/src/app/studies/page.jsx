// 스터디 탐색 (Explore) - 공개 스터디 검색 및 필터링
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function StudiesExplorePage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  // Mock 데이터
  const studies = [
    {
      id: 1,
      emoji: '💻',
      name: '알고리즘 마스터 스터디',
      description: '매일 알고리즘 문제를 풀고 서로의 풀이를 공유하며 성장하는 스터디입니다.',
      category: '프로그래밍',
      subCategory: '알고리즘/코테',
      members: '12/20명',
      tags: ['알고리즘', '코딩테스트', '매일'],
      rating: 4.8,
      isRecruiting: true,
    },
    {
      id: 2,
      emoji: '🎨',
      name: 'UI/UX 디자인 스터디',
      description: '실무 프로젝트를 통해 UI/UX 디자인 역량을 키우는 스터디',
      category: '디자인',
      subCategory: 'UI/UX',
      members: '8/15명',
      tags: ['피그마', 'UI', 'UX'],
      rating: 4.6,
      isRecruiting: true,
    },
    {
      id: 3,
      emoji: '📱',
      name: '앱 개발 스터디',
      description: 'React Native로 모바일 앱을 함께 만들어요',
      category: '프로그래밍',
      subCategory: '모바일',
      members: '15/15명',
      tags: ['React Native', '앱개발'],
      rating: 4.9,
      isRecruiting: false,
    },
  ];

  const categories = ['전체', '프로그래밍', '디자인', '어학', '취업', '자격증'];

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>🔍 스터디 탐색</h1>
          <p className={styles.subtitle}>
            관심있는 스터디를 찾아 함께 성장하세요
          </p>
        </div>
        <Link href="/studies/create" className={styles.createButton}>
          + 스터디 만들기
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="스터디 이름, 키워드로 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>🔍 검색</button>
        </div>

        <div className={styles.categoryTabs}>
          {categories.map((category) => (
            <button
              key={category}
              className={`${styles.categoryTab} ${
                selectedCategory === category ? styles.active : ''
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 스터디 카드 그리드 */}
      <div className={styles.studiesGrid}>
        {studies.map((study) => (
          <Link
            key={study.id}
            href={`/studies/${study.id}`}
            className={styles.studyCard}
          >
            <div className={styles.cardHeader}>
              <div className={styles.emoji}>{study.emoji}</div>
              {study.isRecruiting && (
                <span className={styles.recruitingBadge}>모집중</span>
              )}
              {!study.isRecruiting && (
                <span className={styles.closedBadge}>모집완료</span>
              )}
            </div>

            <h3 className={styles.studyName}>{study.name}</h3>
            <p className={styles.studyDescription}>{study.description}</p>

            <div className={styles.studyMeta}>
              <span className={styles.category}>
                {study.category} · {study.subCategory}
              </span>
              <div className={styles.rating}>
                ⭐ {study.rating}
              </div>
            </div>

            <div className={styles.tags}>
              {study.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.members}>👥 {study.members}</span>
              <span className={styles.viewButton}>자세히 보기 →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

