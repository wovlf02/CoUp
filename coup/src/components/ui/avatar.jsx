import React from 'react';
import styles from './avatar.module.css';

const Avatar = ({ src, alt, fallback, size = 'medium', className, ...props }) => {
  const avatarClassName = `${styles.avatar} ${styles[size]} ${className || ''}`;

  return (
    <div className={avatarClassName} {...props}>
      {src ? (
        <img src={src} alt={alt} className={styles.image} />
      ) : (
        <span className={styles.fallback}>{fallback || alt?.charAt(0) || ''}</span>
      )}
    </div>
  );
};

export default Avatar;
