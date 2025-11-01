import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import styles from './QuickStartButtons.module.css';

function QuickStartButtons() {
  return (
    <div className={styles.quickStartButtons}>
      <Link href="/studies/create" passHref>
        <Button size="large" variant="primary">새 스터디 만들기</Button>
      </Link>
      <Link href="/studies" passHref>
        <Button size="large" variant="secondary">스터디 탐색하기</Button>
      </Link>
    </div>
  );
}

export default QuickStartButtons;
