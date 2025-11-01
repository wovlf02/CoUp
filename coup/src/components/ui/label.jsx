import React from 'react';
import styles from './label.module.css';

const Label = ({ htmlFor, children, className, ...props }) => {
  return (
    <label htmlFor={htmlFor} className={`${styles.label} ${className || ''}`} {...props}>
      {children}
    </label>
  );
};

export default Label;
