import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import styles from './signup.module.css';

export default function SignUpPage() {
  return (
    <Card className={styles.authCard}>
      <CardHeader className={styles.authCardHeader}>
        <Image src="/next.svg" alt="CoUp Logo" width={100} height={40} /> {/* Replace with actual CoUp Logo */}
        <CardTitle className={styles.authTitle}>회원가입</CardTitle>
      </CardHeader>
      <CardContent className={styles.authCardContent}>
        <p className={styles.message}>현재 소셜 로그인만 지원합니다. 로그인 페이지로 이동해주세요.</p>
        <Link href="/sign-in" passHref>
          <button className={styles.signInButton}>로그인 페이지로 이동</button>
        </Link>
      </CardContent>
    </Card>
  );
}
