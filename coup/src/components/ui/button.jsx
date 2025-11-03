'use client';

import React from 'react';
import styles from './button.module.css';

const Button = ({ children, variant = 'primary', size = 'medium', ...props }) => {
  const className = `${styles.button} ${styles[variant]} ${styles[size]}`;
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
};

export { Button };