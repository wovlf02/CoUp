import React from 'react';
import styles from './card.module.css';

const Card = ({ children, className, ...props }) => {
  return (
    <div className={`${styles.card} ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
