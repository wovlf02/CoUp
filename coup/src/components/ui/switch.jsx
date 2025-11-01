import React from 'react';
import styles from './switch.module.css';

const Switch = ({ id, checked, onChange, label, className, ...props }) => {
  return (
    <div className={`${styles.switchWrapper} ${className || ''}`}>
      <input
        type="checkbox"
        id={id}
        className={styles.switchInput}
        checked={checked}
        onChange={onChange}
        {...props}
      />
      <label htmlFor={id} className={styles.switchLabel}>
        <span className={styles.switchToggle} />
      </label>
      {label && <span className={styles.switchText}>{label}</span>}
    </div>
  );
};

export { Switch };