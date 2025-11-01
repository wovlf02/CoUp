import React, { useEffect, useRef } from 'react';
import styles from './dialog.module.css';

const Dialog = ({ isOpen, onClose, children, title }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when dialog is open
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className={styles.header}>
          {title && <h2 id="dialog-title" className={styles.title}>{title}</h2>}
          <button className={styles.closeButton} onClick={onClose} aria-label="Close dialog">
            &times;
          </button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default Dialog;
