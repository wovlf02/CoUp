import React from 'react';
import styles from './button.module.css';

const Button = ({ children, onClick, variant = 'primary', ...props }) => {
  const buttonClassName = `${styles.button} ${styles[variant]}`;

  return (
    <button className={buttonClassName} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default Button;
