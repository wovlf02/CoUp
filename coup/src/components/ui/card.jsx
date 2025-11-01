import React from 'react';
import styles from './card.module.css';

const Card = ({ children, className, ...props }) => {
  return (
    <div className={`${styles.card} ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, ...props }) => {
  return (
    <div className={`${styles.cardHeader} ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3 className={`${styles.cardTitle} ${className || ''}`} {...props}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className, ...props }) => {
  return (
    <p className={`${styles.cardDescription} ${className || ''}`} {...props}>
      {children}
    </p>
  );
};

const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={`${styles.cardContent} ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className, ...props }) => {
  return (
    <div className={`${styles.cardFooter} ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };