import React from 'react';
import styles from './textarea.module.css';

const Textarea = ({ className, ...props }) => {
  return (
    <textarea
      className={`${styles.textarea} ${className || ''}`}
      {...props}
    />
  );
};

export { Textarea };