import React from 'react';
import styles from './checkbox.module.css';

const Checkbox = ({ id, label, checked, onChange, ...props }) => {
  return (
    <div className={styles.checkboxContainer}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className={styles.checkboxInput}
        {...props}
      />
      {label && (
        <label htmlFor={id} className={styles.checkboxLabel}>
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
