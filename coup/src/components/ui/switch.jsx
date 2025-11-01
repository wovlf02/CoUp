import React from 'react';
import styles from './switch.module.css';

const Switch = ({ id, checked, onChange, label, ...props }) => {
  return (
    <div className={styles.switchContainer}>
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
        {label && <span className={styles.switchText}>{label}</span>}
      </label>
    </div>
  );
};

export default Switch;
