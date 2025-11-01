import React from 'react';
import styles from './badge.module.css';

const Badge = ({ children, variant = 'default', className, ...props }) => {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className || ''}`} {...props}>
      {children}
    </span>
  );
};

export { Badge };