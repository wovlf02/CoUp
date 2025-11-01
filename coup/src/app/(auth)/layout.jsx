import React from 'react';
import styles from './auth.module.css';

export default function AuthLayout({ children }) {
  return (
    <div className={styles.authContainer}>
      {children}
    </div>
  );
}
