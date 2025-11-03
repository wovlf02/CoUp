'use client';

import styles from './auth.module.css';
import AuthProvider from '@/components/providers/AuthProvider';

export default function AuthLayout({ children }) {
  return (
    <AuthProvider>
      <div className={styles.authContainer}>
        {children}
      </div>
    </AuthProvider>
  );
}