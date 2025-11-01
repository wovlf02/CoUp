import React from 'react';
import styles from './badge.module.css';

const Badge = ({ children, variant = 'default', className, ...props }) => {
  const badgeClassName = `${styles.badge} ${styles[variant]} ${className || ''}`;

  return (
    <span className={badgeClassName} {...props}>
      {children}
    </span>
  );
};

export default Badge;
