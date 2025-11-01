import React from 'react';
import styles from './avatar.module.css';

const Avatar = ({ src, alt, fallback, className, ...props }) => {
  return (
    <div className={`${styles.avatar} ${className || ''}`} {...props}>
      {src ? (
        <img src={src} alt={alt} className={styles.avatarImage} />
      ) : (
        <div className={styles.avatarFallback}>{fallback}</div>
      )}
    </div>
  );
};

export { Avatar };