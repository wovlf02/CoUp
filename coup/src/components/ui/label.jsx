import React from 'react';
import styles from './label.module.css';

const Label = ({ children, className, ...props }) => {
  return (
    <label className={`${styles.label} ${className || ''}`} {...props}>
      {children}
    </label>
  );
};

export { Label };