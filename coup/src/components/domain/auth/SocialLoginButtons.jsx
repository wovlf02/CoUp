import React from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import styles from './SocialLoginButtons.module.css';

function SocialLoginButtons() {
  return (
    <div className={styles.socialLoginButtons}>
      <Button
        variant="outline"
        onClick={() => signIn('google')}
        className={styles.googleButton}
      >
        <Image src="/google.svg" alt="Google Logo" width={20} height={20} />
        Google로 로그인
      </Button>
      <Button
        variant="outline"
        onClick={() => signIn('github')}
        className={styles.githubButton}
      >
        <Image src="/github.svg" alt="GitHub Logo" width={20} height={20} />
        GitHub으로 로그인
      </Button>
    </div>
  );
}

export default SocialLoginButtons;
