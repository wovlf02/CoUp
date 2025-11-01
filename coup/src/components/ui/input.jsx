import React from 'react';
import styles from './input.module.css';

const Input = ({ className, type = 'text', ...props }) => {
  return (
    <input
      type={type}
      className={`${styles.input} ${className || ''}`}
      {...props}
    />
  );
};

export { Input };