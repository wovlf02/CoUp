import React from 'react';
import styles from './input.module.css';

const Input = ({ type = 'text', placeholder, value, onChange, ...props }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={styles.input}
      {...props}
    />
  );
};

export default Input;
