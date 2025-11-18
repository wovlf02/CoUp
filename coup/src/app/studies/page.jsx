// 스터디 탐색 (Explore) - 공개 스터디 검색 및 필터링
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useStudies } from '@/lib/hooks/useApi';

// 카테고리 정의 (정적 데이터는 유지)
const categories = [
  { id: 'all', label: '전체', value: null, icon: '📚' },
  { id: 'programming', label: '프로그래밍', value: '프로그래밍', icon: '💻' },
  { id: 'language', label: '어학', value: '어학', icon: '🌍' },
  { id: 'cert', label: '자격증', value: '자격증', icon: '📝' },
  { id: 'hobby', label: '취미', value: '취미', icon: '🎸' },
  { id: 'book', label: '독서', value: '독서', icon: '📖' },
  { id: 'finance', label: '재테크', value: '재테크', icon: '💰' },
];

// 스터디 생성 팁 (정적 데이터는 유지)
const studyTips = [
  { title: '명확한 목표', description: '구체적인 학습 목표를 설정하세요' },
  { title: '규칙적인 일정', description: '정기적인 모임으로 습관을 만드세요' },
  { title: '적극적인 소통', description: '활발한 소통으로 동기부여하세요' },
];

export default function StudiesExplorePage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  // 실제 API 호출
  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
  };

  // 카테고리가 '전체'가 아닌 경우만 추가
  if (selectedCategory && selectedCategory !== '전체') {
    queryParams.category = selectedCategory;
  }

  // 검색어가 있는 경우만 추가
  if (searchKeyword && searchKeyword.trim()) {
    queryParams.search = searchKeyword.trim();
  }

  const { data, isLoading, error } = useStudies(queryParams);

  const studies = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1 };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    setCurrentPage(1); // 검색 시 첫 페이지로
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.loading}>스터디를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.error}>
            스터디를 불러오는데 실패했습니다. 다시 시도해주세요.
          </div>
        </div>
      </div>
    );
  }

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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={styles.searchInput}
            />
            <button className={styles.searchButton} onClick={handleSearch}>
              🔍 검색
            </button>
          </div>

          <div className={styles.categoryTabs}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryTab} ${
                  selectedCategory === category.label ? styles.active : ''
                }`}
                onClick={() => {
                  setSelectedCategory(category.label);
                  setCurrentPage(1);
                }}
              >
                {category.icon} {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 스터디 카드 그리드 */}
        {studies.length === 0 ? (
          <div className={styles.emptyState}>
            <p>검색 결과가 없습니다.</p>
          </div>
        ) : (
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
                    {study.category} {study.subCategory ? `· ${study.subCategory}` : ''}
                  </span>
                  <div className={styles.rating}>
                    ⭐ {study.rating || 0}
                  </div>
                </div>

                <div className={styles.tags}>
                  {study.tags?.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.members}>
                    👥 {study.currentMembers || 0}/{study.maxMembers}명
                  </span>
                  <span className={styles.owner}>👤 {study.owner?.name || '알 수 없음'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationArrow}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ←
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
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
              disabled={currentPage === pagination.totalPages}
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
                onClick={() => {
                  setSelectedCategory(category.label);
                  setCurrentPage(1);
                }}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>
                <span className={styles.categoryLabel}>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. 스터디 생성 팁 */}
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
        </div>

        {/* 3. 플랫폼 통계 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>📊 CoUp 통계</h3>
          <div className={styles.widgetContent}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>전체 스터디</span>
              <span className={styles.statValue}>{pagination.total}개</span>
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
