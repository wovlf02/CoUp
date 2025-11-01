import React from 'react';
import styles from './textarea.module.css';

const Textarea = ({ placeholder, value, onChange, ...props }) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={styles.textarea}
      {...props}
    />
  );
};

export default Textarea;
