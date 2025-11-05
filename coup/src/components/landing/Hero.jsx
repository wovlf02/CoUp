'use client'

import styles from '@/styles/landing/hero.module.css'

export default function Hero() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features')
    featuresSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.mainTitle}>함께, 더 높이.</h1>
          <p className={styles.subtitle}>당신의 성장을 위한 스터디 허브</p>
          <p className={styles.description}>
            스터디원을 찾고, 함께 목표를 달성하세요
          </p>

          <div className={styles.ctaButtons}>
            <button className={styles.primaryBtn}>
              지금 시작하기
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className={styles.secondaryBtn}>
              스터디 둘러보기
            </button>
          </div>

          <div className={styles.scrollIndicator} onClick={scrollToFeatures}>
            <span>스크롤하여 더 알아보기</span>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
