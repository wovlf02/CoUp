import React from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/common/Header/Header';
import Footer from '@/components/common/Footer/Footer';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <Header />
      <main>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>CoUp: 함께 성장하는 스터디 플랫폼</h1>
            <p className={styles.heroSubtitle}>
              효율적인 스터디 관리, 활발한 커뮤니티, 그리고 목표 달성을 위한 모든 것.
            </p>
            <Link href="/sign-in" passHref>
              <Button size="large">시작하기</Button>
            </Link>
            <Link href="#features" passHref>
              <Button size="large" variant="outline">자세히 알아보기</Button>
            </Link>
          </div>
        </section>

              <section className={styles.featuresSection}>
                <h2 className={styles.sectionTitle}>주요 기능</h2>
                <div className={styles.featureGrid}>
                  <Card className={styles.featureCard}>
                    <CardHeader>
                      <CardTitle>스터디 그룹 관리</CardTitle>
                    </CardHeader>
                    <CardContent>
                      스터디 생성부터 멤버 관리, 공지사항, 파일 공유까지 한 곳에서 편리하게 관리하세요.
                    </CardContent>
                  </Card>
                  <Card className={styles.featureCard}>
                    <CardHeader>
                      <CardTitle>실시간 협업 도구</CardTitle>
                    </CardHeader>
                    <CardContent>
                      채팅, 화상 통화, 캘린더, 할 일 관리 등 다양한 도구로 스터디 효율을 높여보세요.
                    </CardContent>
                  </Card>
                  <Card className={styles.featureCard}>
                    <CardHeader>
                      <CardTitle>맞춤형 스터디 추천</CardTitle>
                    </CardHeader>
                    <CardContent>
                      관심사와 목표에 맞는 스터디 그룹을 추천받고 새로운 스터디를 시작해보세요.
                    </CardContent>
                  </Card>
                </div>
              </section>
        
              <section className={styles.testimonialsSection}>
                <h2 className={styles.sectionTitle}>성공 사례</h2>
                <div className={styles.testimonialGrid}>
                  <Card className={styles.testimonialCard}>
                    <CardContent>
                      "CoUp 덕분에 목표했던 자격증을 취득할 수 있었습니다. 체계적인 스터디 관리 기능이 정말 도움이 됐어요!"
                      <p className={styles.testimonialAuthor}>- 김민준 (취업 준비생)</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.testimonialCard}>
                    <CardContent>
                      "혼자서는 엄두도 못 냈을 프로젝트를 CoUp 스터디원들과 함께 성공적으로 마무리했습니다. 실시간 협업 기능이 최고예요!"
                      <p className={styles.testimonialAuthor}>- 이서아 (개발자)</p>
                    </CardContent>
                  </Card>
                </div>
              </section>
        <section className={styles.ctaSection}>
          <h2 className={styles.sectionTitle}>지금 바로 CoUp과 함께하세요!</h2>
          <Link href="/sign-up" passHref>
            <Button size="large" variant="primary">무료로 시작하기</Button>
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
