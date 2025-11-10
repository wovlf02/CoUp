// 스터디 탐색 (Explore) - 공개 스터디 검색 및 필터링
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { mockStudies, categories, popularStudies, studyStats, studyTips } from '@/mocks/studies';

export default function StudiesExplorePage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(mockStudies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudies = mockStudies.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.container}>
      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
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
                key={category.id}
                className={`${styles.categoryTab} ${
                  selectedCategory === category.label ? styles.active : ''
                }`}
                onClick={() => setSelectedCategory(category.label)}
              >
                {category.icon} {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 스터디 카드 그리드 */}
        <div className={styles.studiesGrid}>
          {currentStudies.map((study) => (
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
                <span className={styles.members}>
                  👥 {study.members.current}/{study.members.max}명
                </span>
                <span className={styles.owner}>👤 {study.owner}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationArrow}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.paginationButton} ${
                  currentPage === page ? styles.active : ''
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <button
              className={styles.paginationArrow}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* 우측 사이드바 위젯 */}
      <aside className={styles.sidebar}>
        {/* 1. 인기 카테고리 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>🔥 인기 카테고리</h3>
          <div className={styles.widgetContent}>
            {categories.slice(1, 6).map((category) => (
              <button
                key={category.id}
                className={styles.categoryItem}
                onClick={() => setSelectedCategory(category.label)}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>
                <span className={styles.categoryLabel}>{category.label}</span>
                <span className={styles.categoryCount}>(234개)</span>
              </button>
            ))}
          </div>
          <Link href="/studies/categories" className={styles.widgetLink}>
            전체 카테고리 보기 →
          </Link>
        </div>

        {/* 2. 지금 핫한 스터디 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>⭐ 지금 핫한 스터디</h3>
          <div className={styles.widgetContent}>
            {popularStudies.map((study) => (
              <Link
                key={study.id}
                href={`/studies/${study.id}`}
                className={styles.popularStudyItem}
              >
                <div className={styles.popularStudyName}>{study.name}</div>
                <div className={styles.popularStudyMeta}>
                  {study.members.current}/{study.members.max}명 · {study.category}
                </div>
              </Link>
            ))}
          </div>
          <Link href="/studies/trending" className={styles.widgetLink}>
            더 많은 추천 →
          </Link>
        </div>

        {/* 3. 스터디 생성 팁 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>💡 성공적인 스터디 운영 팁</h3>
          <div className={styles.widgetContent}>
            {studyTips.map((tip, index) => (
              <div key={index} className={styles.tipItem}>
                <div className={styles.tipNumber}>{index + 1}</div>
                <div className={styles.tipContent}>
                  <div className={styles.tipTitle}>{tip.title}</div>
                  <div className={styles.tipDesc}>{tip.description}</div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/guides/study-creation" className={styles.widgetLink}>
            스터디 만들기 가이드 →
          </Link>
        </div>

        {/* 4. 플랫폼 통계 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>📊 CoUp 통계</h3>
          <div className={styles.widgetContent}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>활성 스터디</span>
              <span className={styles.statValue}>{studyStats.activeStudies.toLocaleString()}개</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>전체 멤버</span>
              <span className={styles.statValue}>{studyStats.totalMembers.toLocaleString()}명</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>오늘 생성</span>
              <span className={styles.statValue}>{studyStats.todayCreated}개</span>
            </div>
          </div>
          <div className={styles.widgetFooter}>
            💙 함께 성장하는 커뮤니티
          </div>
        </div>
      </aside>
    </div>
  );
}
