import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SocialLoginButtons from '@/components/domain/auth/SocialLoginButtons';
import styles from './signin.module.css';

export default function SignInPage() {
  return (
    <Card className={styles.authCard}>
      <CardHeader className={styles.authCardHeader}>
        <Image src="/next.svg" alt="CoUp Logo" width={100} height={40} /> {/* Replace with actual CoUp Logo */}
        <CardTitle className={styles.authTitle}>로그인</CardTitle>
      </CardHeader>
      <CardContent className={styles.authCardContent}>
        <SocialLoginButtons />
        <div className={styles.divider}>또는</div>
        <p className={styles.toggleLink}>
          계정이 없으신가요? <Link href="/sign-up">회원가입</Link>
        </p>
      </CardContent>
    </Card>
  );
}
