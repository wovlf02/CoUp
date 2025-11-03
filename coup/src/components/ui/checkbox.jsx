'use client';

import React from 'react';
import styles from './checkbox.module.css';

const Checkbox = ({ id, label, className, ...props }) => {
  return (
    <div className={`${styles.checkboxWrapper} ${className || ''}`}>
      <input type="checkbox" id={id} className={styles.checkbox} {...props} />
      {label && <label htmlFor={id} className={styles.checkboxLabel}>{label}</label>}
    </div>
  );
};

export { Checkbox };