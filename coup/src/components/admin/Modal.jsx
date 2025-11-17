'use client'

import { useEffect } from 'react'
import styles from './Modal.module.css'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium'
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div
        className={styles.modalContent}
        style={{
          maxWidth: size === 'large' ? '800px' : size === 'small' ? '400px' : '600px'
        }}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
        {footer && (
          <div className={styles.modalFooter}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

