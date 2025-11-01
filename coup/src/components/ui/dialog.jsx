import React, { useRef, useEffect, useCallback } from 'react';
import styles from './dialog.module.css';

const Dialog = ({ isOpen, onClose, children, title, description }) => {
  const dialogRef = useRef(null);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (dialogElement) {
      if (isOpen) {
        dialogElement.showModal();
        document.addEventListener('keydown', handleKeyDown);
      } else {
        dialogElement.close();
        document.removeEventListener('keydown', handleKeyDown);
      }
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <dialog ref={dialogRef} className={styles.dialog} onCancel={onClose}>
      <div className={styles.dialogHeader}>
        {title && <h3 className={styles.dialogTitle}>{title}</h3>}
        {description && <p className={styles.dialogDescription}>{description}</p>}
        <button onClick={onClose} className={styles.closeButton}>&times;</button>
      </div>
      <div className={styles.dialogContent}>
        {children}
      </div>
    </dialog>
  );
};

export { Dialog };